import * as THREE from 'three';

/**
 * GPU粒子系统配置
 */
export interface GPUParticleSystemConfig {
  maxParticles: number;
  position: THREE.Vector3;
  rate: number; // 每秒发射粒子数
  lifetime: number;
  lifetimeVariance: number;
  velocity: THREE.Vector3;
  velocityVariance: number;
  size: number;
  sizeVariance: number;
  color: THREE.Color;
  colorVariance: number;
  spread: number; // 发射角度
  gravity: THREE.Vector3;
  turbulence: number;
  damping: number;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
}

/**
 * GPU粒子系统类
 */
export class GPUParticleSystem {
  private config: GPUParticleSystemConfig;
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  private maxParticles: number;
  private particleCount: number = 0;
  private emissionAccumulator: number = 0;
  private time: number = 0;
  
  // 粒子属性
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private lifetimes: Float32Array;
  private ages: Float32Array;
  private active: Uint8Array;
  
  // 着色器uniforms
  private uniforms: any;
  
  constructor(scene: THREE.Scene, config: GPUParticleSystemConfig) {
    this.config = config;
    this.scene = scene;
    this.maxParticles = config.maxParticles;
    
    // 初始化粒子数据
    this.positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.lifetimes = new Float32Array(this.maxParticles);
    this.ages = new Float32Array(this.maxParticles);
    this.active = new Uint8Array(this.maxParticles);
    
    // 创建几何体
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('lifetime', new THREE.BufferAttribute(this.lifetimes, 1));
    this.geometry.setAttribute('age', new THREE.BufferAttribute(this.ages, 1));
    this.geometry.setAttribute('active', new THREE.BufferAttribute(this.active, 1));
    
    // 创建着色器材质
    this.uniforms = {
      time: { value: 0 },
      gravity: { value: config.gravity.toArray() },
      turbulence: { value: config.turbulence },
      damping: { value: config.damping },
      startSize: { value: config.startSize },
      endSize: { value: config.endSize },
      startColor: { value: config.startColor.toArray() },
      endColor: { value: config.endColor.toArray() },
    };
    
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }
  
  // 顶点着色器
  private vertexShader = `
    attribute vec3 velocity;
    attribute vec3 color;
    attribute float size;
    attribute float lifetime;
    attribute float age;
    attribute float active;
    
    uniform float time;
    uniform vec3 gravity;
    uniform float turbulence;
    uniform float damping;
    uniform float startSize;
    uniform float endSize;
    uniform vec3 startColor;
    uniform vec3 endColor;
    
    varying vec4 vColor;
    
    void main() {
      if (active < 0.5) {
        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
        gl_PointSize = 0.0;
        return;
      }
      
      float t = age / lifetime;
      
      // 计算位置
      vec3 pos = position;
      vec3 vel = velocity;
      
      // 应用重力
      pos += gravity * age * age * 0.5;
      
      // 应用速度
      pos += vel * age;
      
      // 应用湍流
      vec3 noise = vec3(
        sin(vel.x * 10.0 + time),
        cos(vel.y * 10.0 + time),
        sin(vel.z * 10.0 + time)
      ) * turbulence;
      pos += noise * age;
      
      // 应用阻尼
      vel *= pow(damping, age);
      
      // 计算点大小
      float sizeInterp = mix(startSize, endSize, t);
      gl_PointSize = size * sizeInterp * (300.0 / -mvPosition.z);
      
      // 计算颜色
      vec3 colorInterp = mix(startColor, endColor, t);
      vColor = vec4(colorInterp, 1.0 - t);
      
      // 标准顶点变换
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  // 片段着色器
  private fragmentShader = `
    varying vec4 vColor;
    
    void main() {
      // 圆形粒子
      float dist = length(gl_PointCoord - vec2(0.5, 0.5));
      if (dist > 0.5) {
        discard;
      }
      
      // 软边缘
      float alpha = smoothstep(0.5, 0.0, dist);
      
      gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
    }
  `;
  
  /**
   * 发射粒子
   */
  private emitParticle() {
    if (this.particleCount >= this.maxParticles) {
      // 找到第一个不活跃的粒子
      for (let i = 0; i < this.maxParticles; i++) {
        if (this.active[i] === 0) {
          this.particleCount++;
          this.emitParticleAt(i);
          return;
        }
      }
      return;
    }
    
    this.emitParticleAt(this.particleCount++);
  }
  
  /**
   * 在指定索引发射粒子
   */
  private emitParticleAt(index: number) {
    const baseIndex = index * 3;
    
    // 设置位置
    this.positions[baseIndex] = this.config.position.x;
    this.positions[baseIndex + 1] = this.config.position.y;
    this.positions[baseIndex + 2] = this.config.position.z;
    
    // 设置速度（带随机扩散）
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * this.config.spread;
    const speed = this.config.velocity.length() * (1 + (Math.random() - 0.5) * this.config.velocityVariance);
    
    this.velocities[baseIndex] = Math.sin(phi) * Math.cos(theta) * speed;
    this.velocities[baseIndex + 1] = Math.cos(phi) * speed;
    this.velocities[baseIndex + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    
    // 设置颜色
    this.colors[baseIndex] = this.config.color.r;
    this.colors[baseIndex + 1] = this.config.color.g;
    this.colors[baseIndex + 2] = this.config.color.b;
    
    // 设置大小
    this.sizes[index] = this.config.size * (1 + (Math.random() - 0.5) * this.config.sizeVariance);
    
    // 设置生命周期
    this.lifetimes[index] = this.config.lifetime * (1 + (Math.random() - 0.5) * this.config.lifetimeVariance);
    this.ages[index] = 0;
    this.active[index] = 1;
  }
  
  /**
   * 更新粒子系统
   */
  public update(deltaTime: number) {
    this.time += deltaTime;
    this.uniforms.time.value = this.time;
    
    // 发射粒子
    this.emissionAccumulator += deltaTime * this.config.rate;
    while (this.emissionAccumulator >= 1) {
      this.emitParticle();
      this.emissionAccumulator--;
    }
    
    // 更新粒子年龄
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.active[i] === 1) {
        this.ages[i] += deltaTime;
        if (this.ages[i] >= this.lifetimes[i]) {
          this.active[i] = 0;
          this.particleCount--;
        }
      }
    }
    
    // 更新缓冲区
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.velocity.needsUpdate = true;
    this.geometry.attributes.age.needsUpdate = true;
    this.geometry.attributes.active.needsUpdate = true;
  }
  
  /**
   * 设置粒子系统位置
   */
  public setPosition(position: THREE.Vector3) {
    this.config.position.copy(position);
  }
  
  /**
   * 销毁粒子系统
   */
  public dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
  
  /**
   * 获取粒子数量
   */
  public getParticleCount(): number {
    return this.particleCount;
  }
  
  /**
   * 获取最大粒子数量
   */
  public getMaxParticles(): number {
    return this.maxParticles;
  }
}

/**
 * GPU粒子系统管理器
 */
export class GPUParticleSystemManager {
  private particleSystems: Map<string, GPUParticleSystem> = new Map();
  private scene: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * 创建GPU粒子系统
   */
  public createParticleSystem(name: string, config: GPUParticleSystemConfig): GPUParticleSystem {
    const particleSystem = new GPUParticleSystem(this.scene, config);
    this.particleSystems.set(name, particleSystem);
    return particleSystem;
  }
  
  /**
   * 获取GPU粒子系统
   */
  public getParticleSystem(name: string): GPUParticleSystem | undefined {
    return this.particleSystems.get(name);
  }
  
  /**
   * 移除GPU粒子系统
   */
  public removeParticleSystem(name: string): void {
    const particleSystem = this.particleSystems.get(name);
    if (particleSystem) {
      particleSystem.dispose();
      this.particleSystems.delete(name);
    }
  }
  
  /**
   * 更新所有GPU粒子系统
   */
  public update(deltaTime: number): void {
    this.particleSystems.forEach((system) => {
      system.update(deltaTime);
    });
  }
  
  /**
   * 销毁所有GPU粒子系统
   */
  public dispose(): void {
    this.particleSystems.forEach((system) => {
      system.dispose();
    });
    this.particleSystems.clear();
  }
}