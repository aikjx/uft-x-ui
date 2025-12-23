import * as THREE from 'three';

/**
 * 粒子行为模式
 */
export enum ParticleBehavior {
  NORMAL = 'normal',
  SPIRAL = 'spiral',
  TURBULENCE = 'turbulence',
  ATTRACTOR = 'attractor',
  EXPLOSION = 'explosion',
  WAVE = 'wave',
  ORBIT = 'orbit',
  FOLLOW = 'follow'
}

/**
 * 粒子类
 */
export class Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  startColor: THREE.Color;
  endColor: THREE.Color;
  size: number;
  startSize: number;
  endSize: number;
  lifetime: number;
  age: number;
  mass: number;
  active: boolean;
  behavior: ParticleBehavior;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  startOpacity: number;
  endOpacity: number;
  trail: THREE.Vector3[];
  maxTrailLength: number;
  attractor: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;

  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.color = new THREE.Color();
    this.startColor = new THREE.Color();
    this.endColor = new THREE.Color();
    this.size = 1;
    this.startSize = 1;
    this.endSize = 1;
    this.lifetime = 1;
    this.age = 0;
    this.mass = 1;
    this.active = false;
    this.behavior = ParticleBehavior.NORMAL;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.opacity = 1;
    this.startOpacity = 1;
    this.endOpacity = 0;
    this.trail = [];
    this.maxTrailLength = 10;
    this.attractor = new THREE.Vector3();
    this.orbitRadius = 1;
    this.orbitSpeed = 1;
    this.orbitAngle = 0;
  }

  reset(): void {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.acceleration.set(0, 0, 0);
    this.color.setHex(0xffffff);
    this.startColor.setHex(0xffffff);
    this.endColor.setHex(0xffffff);
    this.size = 1;
    this.startSize = 1;
    this.endSize = 1;
    this.lifetime = 1;
    this.age = 0;
    this.mass = 1;
    this.active = false;
    this.behavior = ParticleBehavior.NORMAL;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.opacity = 1;
    this.startOpacity = 1;
    this.endOpacity = 0;
    this.trail = [];
    this.attractor.set(0, 0, 0);
    this.orbitRadius = 1;
    this.orbitSpeed = 1;
    this.orbitAngle = 0;
  }

  // 用于临时计算的向量，避免每次更新创建新实例
  private tempVec1: THREE.Vector3 = new THREE.Vector3();
  private tempVec2: THREE.Vector3 = new THREE.Vector3();
  private tempVec3: THREE.Vector3 = new THREE.Vector3();

  update(deltaTime: number): void {
    if (!this.active) return;

    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }

    // 计算生命周期进度
    const progress = this.age / this.lifetime;

    // 更新颜色
    this.color.lerpColors(this.startColor, this.endColor, progress);

    // 更新大小
    this.size = this.startSize + (this.endSize - this.startSize) * progress;

    // 更新透明度
    this.opacity = this.startOpacity + (this.endOpacity - this.startOpacity) * progress;

    // 更新旋转
    this.rotation += this.rotationSpeed * deltaTime;

    // 根据行为模式更新粒子
    switch (this.behavior) {
      case ParticleBehavior.SPIRAL:
        this.updateSpiral(progress, deltaTime);
        break;
      case ParticleBehavior.TURBULENCE:
        this.updateTurbulence(deltaTime);
        break;
      case ParticleBehavior.ATTRACTOR:
        this.updateAttractor(deltaTime);
        break;
      case ParticleBehavior.EXPLOSION:
        this.updateExplosion(progress, deltaTime);
        break;
      case ParticleBehavior.WAVE:
        this.updateWave(progress, deltaTime);
        break;
      case ParticleBehavior.ORBIT:
        this.updateOrbit(deltaTime);
        break;
      case ParticleBehavior.FOLLOW:
        this.updateFollow(deltaTime);
        break;
      default:
        this.updateNormal(deltaTime);
    }

    // 更新轨迹
    this.trail.push(this.position.clone());
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  private updateNormal(deltaTime: number): void {
    // 更新速度（使用临时向量避免创建新实例）
    this.tempVec1.copy(this.acceleration).multiplyScalar(deltaTime);
    this.velocity.add(this.tempVec1);

    // 更新位置
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime);
    this.position.add(this.tempVec2);

    // 重置加速度
    this.acceleration.set(0, 0, 0);
  }

  private updateSpiral(progress: number, deltaTime: number): void {
    // 螺旋运动
    const radius = progress * 10;
    const angle = progress * Math.PI * 10;
    this.position.x = Math.cos(angle) * radius;
    this.position.y = Math.sin(angle) * radius;
    this.position.z = progress * 10;
  }

  private updateTurbulence(deltaTime: number): void {
    // 湍流效果
    const turbulence = 0.5;
    this.tempVec1.set(
      (Math.random() - 0.5) * turbulence,
      (Math.random() - 0.5) * turbulence,
      (Math.random() - 0.5) * turbulence
    );
    this.velocity.add(this.tempVec1);
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime);
    this.position.add(this.tempVec2);
  }

  private updateAttractor(deltaTime: number): void {
    // 向吸引子移动
    this.tempVec1.subVectors(this.attractor, this.position);
    this.tempVec1.normalize().multiplyScalar(5);
    this.applyForce(this.tempVec1);
    this.updateNormal(deltaTime);
  }

  private updateExplosion(progress: number, deltaTime: number): void {
    // 爆炸效果
    this.velocity.multiplyScalar(0.99); // 减速
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime);
    this.position.add(this.tempVec2);
  }

  private updateWave(progress: number, deltaTime: number): void {
    // 波浪运动
    this.position.y = Math.sin(progress * Math.PI * 10) * 5;
    this.position.z = Math.cos(progress * Math.PI * 10) * 5;
    this.position.x += deltaTime * 10;
  }

  private updateOrbit(deltaTime: number): void {
    // 轨道运动
    this.orbitAngle += this.orbitSpeed * deltaTime;
    this.position.x = this.attractor.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.position.y = this.attractor.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    this.position.z = this.attractor.z;
  }

  private updateFollow(deltaTime: number): void {
    // 跟随效果
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime);
    this.position.add(this.tempVec2);
  }

  applyForce(force: THREE.Vector3): void {
    // 使用临时向量避免创建新实例
    this.tempVec1.copy(force).divideScalar(this.mass);
    this.acceleration.add(this.tempVec1);
  }
}

/**
 * 粒子发射器配置
 */
export interface EmitterConfig {
  position: THREE.Vector3;
  rate: number; // 每秒发射粒子数
  lifetime: number;
  lifetimeVariance: number;
  velocity: THREE.Vector3;
  velocityVariance: number;
  size: number;
  sizeVariance: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  colorVariance: number;
  spread: number; // 发射角度
  gravity: THREE.Vector3;
  behavior: ParticleBehavior;
  rotationSpeed: number;
  startOpacity: number;
  endOpacity: number;
  maxTrailLength: number;
  attractor: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  texture?: THREE.Texture;
  blending: THREE.Blending;
  transparent: boolean;
  sizeAttenuation: boolean;
  depthTest: boolean;
  depthWrite: boolean;
}

/**
 * 粒子数据接口
 */
export interface ParticleSystemData {
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
  lifetimes: Float32Array;
  count: number;
}

/**
 * 对象池类
 */
export class ObjectPool<T> {
  private objects: T[] = [];
  private maxSize: number;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.objects.length > 0) {
      return this.objects.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.objects.length < this.maxSize) {
      this.resetFn(obj);
      this.objects.push(obj);
    }
  }

  clear(): void {
    this.objects = [];
  }
}

/**
 * 粒子发射器
 */
export class ParticleEmitter {
  private config: EmitterConfig;
  private particles: Particle[];
  private particlePool: ObjectPool<Particle>;
  private emissionTimer: number = 0;
  private maxParticles: number;

  constructor(config: Partial<EmitterConfig>, maxParticles: number = 10000) {
    this.maxParticles = maxParticles;
    this.config = {
      position: new THREE.Vector3(),
      rate: 100,
      lifetime: 2,
      lifetimeVariance: 0.5,
      velocity: new THREE.Vector3(0, 1, 0),
      velocityVariance: 0.5,
      size: 1,
      sizeVariance: 0.2,
      startColor: new THREE.Color(0xffffff),
      endColor: new THREE.Color(0x0000ff),
      colorVariance: 0.1,
      spread: Math.PI / 6,
      gravity: new THREE.Vector3(0, -9.8, 0),
      behavior: ParticleBehavior.NORMAL,
      rotationSpeed: 0,
      startOpacity: 1,
      endOpacity: 0,
      maxTrailLength: 10,
      attractor: new THREE.Vector3(),
      orbitRadius: 1,
      orbitSpeed: 1,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      depthTest: true,
      depthWrite: false,
      ...config
    };

    this.particles = [];
    this.particlePool = new ObjectPool(
      () => new Particle(),
      (p) => p.reset(),
      maxParticles
    );
  }

  /**
   * 发射粒子
   */
  private emit(): void {
    if (this.particles.length >= this.maxParticles) return;

    const particle = this.particlePool.acquire();

    // 设置位置
    particle.position.copy(this.config.position);

    // 设置速度（带随机扩散）
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * this.config.spread;

    const speed = this.config.velocity.length() * (1 + (Math.random() - 0.5) * this.config.velocityVariance);

    particle.velocity.set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.cos(phi) * speed,
      Math.sin(phi) * Math.sin(theta) * speed
    );

    // 设置生命周期
    particle.lifetime = this.config.lifetime * (1 + (Math.random() - 0.5) * this.config.lifetimeVariance);
    particle.age = 0;

    // 设置大小
    const sizeVariance = this.config.size * this.config.sizeVariance;
    const baseSize = this.config.size + (Math.random() - 0.5) * sizeVariance;
    particle.size = baseSize;
    particle.startSize = baseSize;
    particle.endSize = baseSize * 0.1; // 结束时缩小

    // 设置颜色
    const colorVariance = this.config.colorVariance;
    particle.startColor.setRGB(
      Math.max(0, Math.min(1, this.config.startColor.r + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.startColor.g + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.startColor.b + (Math.random() - 0.5) * colorVariance))
    );
    
    particle.endColor.setRGB(
      Math.max(0, Math.min(1, this.config.endColor.r + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.endColor.g + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.endColor.b + (Math.random() - 0.5) * colorVariance))
    );
    
    particle.color.copy(particle.startColor);

    // 设置透明度
    particle.opacity = this.config.startOpacity;
    particle.startOpacity = this.config.startOpacity;
    particle.endOpacity = this.config.endOpacity;

    // 设置行为模式
    particle.behavior = this.config.behavior;
    particle.rotationSpeed = this.config.rotationSpeed + (Math.random() - 0.5) * 0.5;

    // 设置轨迹
    particle.trail = [];
    particle.maxTrailLength = this.config.maxTrailLength;

    // 设置吸引子和轨道参数
    particle.attractor.copy(this.config.attractor);
    particle.orbitRadius = this.config.orbitRadius + (Math.random() - 0.5) * 0.5;
    particle.orbitSpeed = this.config.orbitSpeed + (Math.random() - 0.5) * 0.5;
    particle.orbitAngle = Math.random() * Math.PI * 2;

    particle.active = true;
    this.particles.push(particle);
  }

  /**
   * 更新粒子系统
   */
  update(deltaTime: number): void {
    // 发射新粒子
    this.emissionTimer += deltaTime;
    const emissionInterval = 1 / this.config.rate;

    while (this.emissionTimer >= emissionInterval) {
      this.emit();
      this.emissionTimer -= emissionInterval;
    }

    // 更新现有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // 应用重力
      particle.applyForce(this.config.gravity);

      // 更新粒子
      particle.update(deltaTime);

      // 移除死亡粒子
      if (!particle.active) {
        this.particlePool.release(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 获取粒子数据用于渲染
   */
  getParticleData(): ParticleSystemData {
    const count = this.particles.length;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const particle = this.particles[i];
      const i3 = i * 3;

      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      velocities[i3] = particle.velocity.x;
      velocities[i3 + 1] = particle.velocity.y;
      velocities[i3 + 2] = particle.velocity.z;

      colors[i3] = particle.color.r;
      colors[i3 + 1] = particle.color.g;
      colors[i3 + 2] = particle.color.b;

      sizes[i] = particle.size;
      opacities[i] = particle.opacity;
      lifetimes[i] = particle.age / particle.lifetime;
    }

    return {
      positions,
      velocities,
      colors,
      sizes,
      opacities,
      lifetimes,
      count
    };
  }

  /**
   * 更新发射器配置
   */
  updateConfig(config: Partial<EmitterConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * 清除所有粒子
   */
  clear(): void {
    this.particles.forEach(p => this.particlePool.release(p));
    this.particles = [];
  }

  /**
   * 获取活跃粒子数
   */
  getActiveCount(): number {
    return this.particles.length;
  }
}

/**
 * 粒子系统管理器
 */
export class ParticleSystemManager {
  private emitters: Map<string, ParticleEmitter> = new Map();
  private scene: THREE.Scene;
  private particleMeshes: Map<string, THREE.Points> = new Map();
  private particleCount: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * 添加发射器
   */
  addEmitter(id: string, config: Partial<EmitterConfig>, maxParticles?: number): ParticleEmitter {
    const emitter = new ParticleEmitter(config, maxParticles);
    this.emitters.set(id, emitter);
    return emitter;
  }

  /**
   * 移除发射器
   */
  removeEmitter(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.clear();
      this.emitters.delete(id);
    }

    const mesh = this.particleMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.particleMeshes.delete(id);
    }
  }

  /**
   * 更新所有发射器
   */
  update(deltaTime: number): void {
    this.emitters.forEach((emitter, id) => {
      emitter.update(deltaTime);
      this.updateParticleMesh(id, emitter);
    });
    
    // 更新总粒子数
    this.updateTotalParticleCount();
  }

  /**
   * 更新粒子网格
   */
  private updateParticleMesh(id: string, emitter: ParticleEmitter): void {
    const data = emitter.getParticleData();
    const emitterConfig = (emitter as any).config;

    let mesh = this.particleMeshes.get(id);

    if (!mesh) {
      // 创建新网格
      const geometry = new THREE.BufferGeometry();
      
      // 创建粒子材质
      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        blending: emitterConfig.blending || THREE.AdditiveBlending,
        transparent: emitterConfig.transparent || true,
        opacity: 1.0,
        sizeAttenuation: emitterConfig.sizeAttenuation || true,
        depthTest: emitterConfig.depthTest || true,
        depthWrite: emitterConfig.depthWrite || false,
        map: emitterConfig.texture,
        alphaTest: 0.5
      });

      mesh = new THREE.Points(geometry, material);
      this.scene.add(mesh);
      this.particleMeshes.set(id, mesh);
    }

    // 更新几何体
    const geometry = mesh.geometry as THREE.BufferGeometry;
    
    // 复用现有属性或创建新属性
    this.updateBufferAttribute(geometry, 'position', data.positions, 3);
    this.updateBufferAttribute(geometry, 'color', data.colors, 3);
    this.updateBufferAttribute(geometry, 'size', data.sizes, 1);
    this.updateBufferAttribute(geometry, 'opacity', data.opacities, 1);
    
    // 更新材质
    const material = mesh.material as THREE.PointsMaterial;
    material.map = emitterConfig.texture;
    material.blending = emitterConfig.blending || THREE.AdditiveBlending;
    material.transparent = emitterConfig.transparent || true;
    material.sizeAttenuation = emitterConfig.sizeAttenuation || true;
    material.depthTest = emitterConfig.depthTest || true;
    material.depthWrite = emitterConfig.depthWrite || false;
    material.needsUpdate = true;
  }
  
  /**
   * 更新BufferAttribute，复用现有属性或创建新属性
   */
  private updateBufferAttribute(geometry: THREE.BufferGeometry, name: string, data: Float32Array, itemSize: number): void {
    let attribute = geometry.attributes[name] as THREE.BufferAttribute;
    
    if (!attribute || attribute.array.length !== data.length) {
      // 创建新属性
      attribute = new THREE.BufferAttribute(data, itemSize);
      geometry.setAttribute(name, attribute);
    } else {
      // 复用现有属性，更新数据
      // 使用.setArray()方法而不是直接赋值，因为array是只读属性
      attribute.setArray(data);
      attribute.needsUpdate = true;
    }
  }

  /**
   * 更新总粒子数
   */
  private updateTotalParticleCount(): void {
    this.particleCount = 0;
    this.emitters.forEach(emitter => {
      this.particleCount += emitter.getActiveCount();
    });
  }

  /**
   * 获取发射器
   */
  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id);
  }

  /**
   * 清除所有发射器
   */
  clear(): void {
    this.emitters.forEach((_, id) => this.removeEmitter(id));
  }

  /**
   * 获取总粒子数
   */
  getTotalParticleCount(): number {
    return this.particleCount;
  }
}
