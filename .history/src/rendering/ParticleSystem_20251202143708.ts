import * as THREE from 'three';

/**
 * 粒子类
 */
export class Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  size: number;
  lifetime: number;
  age: number;
  mass: number;
  active: boolean;

  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.color = new THREE.Color();
    this.size = 1;
    this.lifetime = 1;
    this.age = 0;
    this.mass = 1;
    this.active = false;
  }

  reset(): void {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.acceleration.set(0, 0, 0);
    this.color.setHex(0xffffff);
    this.size = 1;
    this.lifetime = 1;
    this.age = 0;
    this.mass = 1;
    this.active = false;
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }

    // 更新速度
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));

    // 更新位置
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // 重置加速度
    this.acceleration.set(0, 0, 0);
  }

  applyForce(force: THREE.Vector3): void {
    this.acceleration.add(force.clone().divideScalar(this.mass));
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
  color: THREE.Color;
  colorVariance: number;
  spread: number; // 发射角度
  gravity: THREE.Vector3;
}

/**
 * 粒子数据接口
 */
export interface ParticleSystemData {
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
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
      color: new THREE.Color(0xffffff),
      colorVariance: 0.1,
      spread: Math.PI / 6,
      gravity: new THREE.Vector3(0, -9.8, 0),
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
    particle.size = this.config.size * (1 + (Math.random() - 0.5) * this.config.sizeVariance);

    // 设置颜色
    const colorVariance = this.config.colorVariance;
    particle.color.setRGB(
      Math.max(0, Math.min(1, this.config.color.r + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.color.g + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.color.b + (Math.random() - 0.5) * colorVariance))
    );

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

      lifetimes[i] = particle.age / particle.lifetime;
    }

    return {
      positions,
      velocities,
      colors,
      sizes,
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

    let mesh = this.particleMeshes.get(id);

    if (!mesh) {
      // 创建新网格
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });

      mesh = new THREE.Points(geometry, material);
      this.scene.add(mesh);
      this.particleMeshes.set(id, mesh);
    }

    // 更新几何体
    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1));

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
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
