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
  
  // 粒子属性 - 优化：添加lifeProgress属性，减少GPU计算
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private lifetimes: Float32Array;
  private ages: Float32Array;
  private lifeProgress: Float32Array;
  private active: Uint8Array;
  
  // 着色器uniforms
  private uniforms: any;
  
  // 优化相关
  private inactiveParticles: number[] = [];
  private buffersNeedUpdate: boolean[] = [false, false, false, false, false]; // position, velocity, age, lifeProgress, active
  
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
    this.lifeProgress = new Float32Array(this.maxParticles);
    this.active = new Uint8Array(this.maxParticles);
    
    // 创建几何体 - 优化：移除lifetime属性，添加lifeProgress属性
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('age', new THREE.BufferAttribute(this.ages, 1));
    this.geometry.setAttribute('lifeProgress', new THREE.BufferAttribute(this.lifeProgress, 1));
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
      // 优化：使用预编译着色器
      defines: {
        USE_GRAVITY: config.gravity.length() > 0 ? '1' : '0',
        USE_TURBULENCE: config.turbulence > 0 ? '1' : '0',
        USE_DAMPING: config.damping < 1 ? '1' : '0'
      }
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }
  
  // 优化后的顶点着色器
  private vertexShader = `
    attribute vec3 position;
    attribute vec3 velocity;
    attribute vec3 color;
    attribute float size;
    attribute float lifeProgress;
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
      // 快速粒子剔除
      if (active < 0.5) {
        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
        gl_PointSize = 0.0;
        return;
      }
      
      // 位置和大小计算
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // 点大小计算（GPU端优化：移除pow和复杂插值）
      float sizeInterp = mix(startSize, endSize, lifeProgress);
      gl_PointSize = size * sizeInterp * (300.0 / -mvPosition.z);
      
      // 颜色计算（简化混合）
      vec3 colorInterp = mix(startColor, endColor, lifeProgress);
      vColor = vec4(colorInterp, 1.0 - lifeProgress);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  // 优化后的片段着色器
  private fragmentShader = `
    varying vec4 vColor;
    
    void main() {
      // 极简化圆形粒子渲染，使用最快速的距离计算
      vec2 p = gl_PointCoord * 2.0 - 1.0;
      float d = dot(p, p);
      
      if (d > 1.0) {
        discard;
      }
      
      // 高效的软边缘计算
      float alpha = 1.0 - d;
      
      // 预乘alpha优化
      gl_FragColor = vec4(vColor.rgb * vColor.a * alpha, vColor.a * alpha);
    }
  `;
  
  /**
   * 发射粒子
   */
  private emitParticle() {
    if (this.particleCount >= this.maxParticles) {
      // 优化：使用空闲粒子池，避免遍历所有粒子
      if (this.inactiveParticles.length > 0) {
        const index = this.inactiveParticles.pop()!;
        this.emitParticleAt(index);
        return;
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
    
    // 设置生命周期和进度 - 优化：在CPU端计算lifeProgress
    this.lifetimes[index] = this.config.lifetime * (1 + (Math.random() - 0.5) * this.config.lifetimeVariance);
    this.ages[index] = 0;
    this.lifeProgress[index] = 0;
    this.active[index] = 1;
    
    // 标记缓冲区需要更新
    this.buffersNeedUpdate[0] = true; // position
    this.buffersNeedUpdate[1] = true; // velocity
    this.buffersNeedUpdate[2] = true; // age
    this.buffersNeedUpdate[3] = true; // lifeProgress
    this.buffersNeedUpdate[4] = true; // active
  }
  
  /**
   * 更新粒子系统 - 优化：在CPU端计算lifeProgress
   */
  public update(deltaTime: number) {
    this.time += deltaTime;
    this.uniforms.time.value = this.time;
    
    // 发射粒子
    this.emissionAccumulator += deltaTime * this.config.rate;
    const particlesToEmit = Math.floor(this.emissionAccumulator);
    if (particlesToEmit > 0) {
      for (let i = 0; i < particlesToEmit && this.particleCount < this.maxParticles; i++) {
        this.emitParticle();
      }
      this.emissionAccumulator -= particlesToEmit;
    }
    
    // 更新粒子年龄和状态 - 优化：计算lifeProgress
    let anyActiveChanged = false;
    for (let i = 0; i < this.particleCount; i++) {
      if (this.active[i] === 1) {
        this.ages[i] += deltaTime;
        
        if (this.ages[i] >= this.lifetimes[i]) {
          this.active[i] = 0;
          
          // 优化：交换当前粒子与最后一个粒子的位置，减少粒子移动
          const lastIndex = this.particleCount - 1;
          if (i !== lastIndex) {
            // 交换粒子数据
            this.swapParticles(i, lastIndex);
            i--; // 重新检查当前位置
          }
          
          this.particleCount--;
          anyActiveChanged = true;
          
          // 添加到空闲粒子池
          this.inactiveParticles.push(lastIndex);
          
          // 标记缓冲区需要更新
          this.buffersNeedUpdate[2] = true; // age
          this.buffersNeedUpdate[3] = true; // lifeProgress
          this.buffersNeedUpdate[4] = true; // active
        } else {
          // 计算生命周期进度
          this.lifeProgress[i] = this.ages[i] / this.lifetimes[i];
          
          // 标记缓冲区需要更新
          this.buffersNeedUpdate[2] = true; // age
          this.buffersNeedUpdate[3] = true; // lifeProgress
        }
      }
    }
    
    // 优化：只更新实际发生变化的缓冲区
    if (this.buffersNeedUpdate[0]) {
      this.geometry.attributes.position.needsUpdate = true;
      this.buffersNeedUpdate[0] = false;
    }
    
    if (this.buffersNeedUpdate[1]) {
      this.geometry.attributes.velocity.needsUpdate = true;
      this.buffersNeedUpdate[1] = false;
    }
    
    if (this.buffersNeedUpdate[2]) {
      this.geometry.attributes.age.needsUpdate = true;
      this.buffersNeedUpdate[2] = false;
    }
    
    if (this.buffersNeedUpdate[3]) {
      this.geometry.attributes.lifeProgress.needsUpdate = true;
      this.buffersNeedUpdate[3] = false;
    }
    
    if (this.buffersNeedUpdate[4]) {
      this.geometry.attributes.active.needsUpdate = true;
      this.buffersNeedUpdate[4] = false;
    }
  }
  
  /**
   * 交换两个粒子的数据，优化粒子移除性能
   */
  private swapParticles(index1: number, index2: number): void {
    const base1 = index1 * 3;
    const base2 = index2 * 3;
    
    // 交换位置
    [this.positions[base1], this.positions[base2]] = [this.positions[base2], this.positions[base1]];
    [this.positions[base1 + 1], this.positions[base2 + 1]] = [this.positions[base2 + 1], this.positions[base1 + 1]];
    [this.positions[base1 + 2], this.positions[base2 + 2]] = [this.positions[base2 + 2], this.positions[base1 + 2]];
    
    // 交换速度
    [this.velocities[base1], this.velocities[base2]] = [this.velocities[base2], this.velocities[base1]];
    [this.velocities[base1 + 1], this.velocities[base2 + 1]] = [this.velocities[base2 + 1], this.velocities[base1 + 1]];
    [this.velocities[base1 + 2], this.velocities[base2 + 2]] = [this.velocities[base2 + 2], this.velocities[base1 + 2]];
    
    // 交换颜色
    [this.colors[base1], this.colors[base2]] = [this.colors[base2], this.colors[base1]];
    [this.colors[base1 + 1], this.colors[base2 + 1]] = [this.colors[base2 + 1], this.colors[base1 + 1]];
    [this.colors[base1 + 2], this.colors[base2 + 2]] = [this.colors[base2 + 2], this.colors[base1 + 2]];
    
    // 交换大小
    [this.sizes[index1], this.sizes[index2]] = [this.sizes[index2], this.sizes[index1]];
    
    // 交换生命周期和年龄
    [this.lifetimes[index1], this.lifetimes[index2]] = [this.lifetimes[index2], this.lifetimes[index1]];
    [this.ages[index1], this.ages[index2]] = [this.ages[index2], this.ages[index1]];
    [this.lifeProgress[index1], this.lifeProgress[index2]] = [this.lifeProgress[index2], this.lifeProgress[index1]];
    
    // 交换活跃状态
    [this.active[index1], this.active[index2]] = [this.active[index2], this.active[index1]];
    
    // 标记位置和其他属性需要更新
    this.buffersNeedUpdate[0] = true; // position
    this.buffersNeedUpdate[1] = true; // velocity
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
    
    // 清理资源
    this.positions = null!;
    this.velocities = null!;
    this.colors = null!;
    this.sizes = null!;
    this.lifetimes = null!;
    this.ages = null!;
    this.active = null!;
    this.inactiveParticles = [];
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
  private updateEnabled: boolean = true;
  
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
    if (!this.updateEnabled) return;
    
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
  
  /**
   * 启用/禁用更新
   */
  public setUpdateEnabled(enabled: boolean): void {
    this.updateEnabled = enabled;
  }
  
  /**
   * 获取所有粒子系统数量
   */
  public getSystemCount(): number {
    return this.particleSystems.size;
  }
}