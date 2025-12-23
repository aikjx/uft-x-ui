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
 * GPU粒子系统统计信息
 */
export interface GPUParticleSystemStats {
  particleCount: number; // 当前活跃粒子数
  maxParticles: number; // 最大粒子数
  emissionRate: number; // 发射率
  inactiveParticles: number; // 空闲粒子数
  memoryUsage: number; // 内存使用量（估计）
  averageLifetime: number; // 平均生命周期
}

/**
 * GPU粒子系统事件类型
 */
export enum GPUParticleSystemEvent {
  SYSTEM_CREATED = 'system-created',
  SYSTEM_DISPOSED = 'system-disposed',
  PARTICLE_EMITTED = 'particle-emitted',
  PARTICLE_EXPIRED = 'particle-expired',
  SYSTEM_CLEARED = 'system-cleared'
}

/**
 * GPU粒子系统类 - 优化：添加事件系统和更灵活的配置机制
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
  private stats: GPUParticleSystemStats = {
    particleCount: 0,
    maxParticles: 0,
    emissionRate: 0,
    inactiveParticles: 0,
    memoryUsage: 0,
    averageLifetime: 0
  };
  private eventHandlers: Map<string, Function[]> = new Map();
  private id: string = Math.random().toString(36).substring(2, 15);
  private lastUpdateTime: number = performance.now();
  private updateInterval: number = 16.67; // 60fps
  private isPaused: boolean = false;
  
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
   * 注册事件监听器
   */
  public on(event: GPUParticleSystemEvent, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }
  
  /**
   * 移除事件监听器
   */
  public off(event: GPUParticleSystemEvent, handler: Function): void {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }
  
  /**
   * 触发事件
   */
  private emit(event: GPUParticleSystemEvent, data?: any): void {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(event, data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      }
    }
  }
  
  /**
   * 设置粒子系统位置
   */
  public setPosition(position: THREE.Vector3) {
    this.config.position.copy(position);
  }
  
  /**
   * 暂停粒子系统
   */
  public pause(): void {
    this.isPaused = true;
  }
  
  /**
   * 恢复粒子系统
   */
  public resume(): void {
    this.isPaused = false;
  }
  
  /**
   * 检查粒子系统是否暂停
   */
  public isPausedState(): boolean {
    return this.isPaused;
  }
  
  /**
   * 更新粒子系统配置
   */
  public updateConfig(newConfig: Partial<GPUParticleSystemConfig>): void {
    // 合并新配置
    this.config = { ...this.config, ...newConfig };
    
    // 更新着色器uniforms
    if (newConfig.gravity) {
      this.uniforms.gravity.value = newConfig.gravity.toArray();
    }
    if (newConfig.turbulence !== undefined) {
      this.uniforms.turbulence.value = newConfig.turbulence;
    }
    if (newConfig.damping !== undefined) {
      this.uniforms.damping.value = newConfig.damping;
    }
    if (newConfig.startSize !== undefined) {
      this.uniforms.startSize.value = newConfig.startSize;
    }
    if (newConfig.endSize !== undefined) {
      this.uniforms.endSize.value = newConfig.endSize;
    }
    if (newConfig.startColor) {
      this.uniforms.startColor.value = newConfig.startColor.toArray();
    }
    if (newConfig.endColor) {
      this.uniforms.endColor.value = newConfig.endColor.toArray();
    }
  }
  
  /**
   * 获取当前配置
   */
  public getConfig(): GPUParticleSystemConfig {
    return { ...this.config };
  }
  
  /**
   * 获取当前统计信息
   */
  public getStats(): GPUParticleSystemStats {
    // 计算当前统计信息
    this.stats.particleCount = this.particleCount;
    this.stats.maxParticles = this.maxParticles;
    this.stats.emissionRate = this.config.rate;
    this.stats.inactiveParticles = this.inactiveParticles.length;
    this.stats.memoryUsage = this.particleCount * 100; // 每个粒子约100字节
    this.stats.averageLifetime = this.config.lifetime;
    
    return { ...this.stats };
  }
  
  /**
   * 清空所有粒子
   */
  public clear(): void {
    // 将所有粒子标记为非活跃
    for (let i = 0; i < this.particleCount; i++) {
      this.active[i] = 0;
      this.inactiveParticles.push(i);
    }
    
    // 重置粒子计数
    this.particleCount = 0;
    
    // 标记缓冲区需要更新
    this.buffersNeedUpdate[2] = true; // age
    this.buffersNeedUpdate[3] = true; // lifeProgress
    this.buffersNeedUpdate[4] = true; // active
    
    // 触发系统清理事件
    this.emit(GPUParticleSystemEvent.SYSTEM_CLEARED);
  }
  
  /**
   * 销毁粒子系统 - 优化：完整清理所有资源
   */
  public dispose() {
    // 从场景中移除
    this.scene.remove(this.points);
    
    // 释放GPU资源
    this.geometry.dispose();
    this.material.dispose();
    
    // 清理CPU资源
    this.positions = null!;
    this.velocities = null!;
    this.colors = null!;
    this.sizes = null!;
    this.lifetimes = null!;
    this.ages = null!;
    this.lifeProgress = null!;
    this.active = null!;
    this.inactiveParticles = [];
    
    // 清除引用
    this.points = null!;
    this.geometry = null!;
    this.material = null!;
    this.uniforms = null!;
    
    // 清空事件监听器
    this.eventHandlers.clear();
    
    // 触发系统销毁事件
    this.emit(GPUParticleSystemEvent.SYSTEM_DISPOSED, { id: this.id });
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
  
  /**
   * 获取粒子系统ID
   */
  public getId(): string {
    return this.id;
  }
  
  /**
   * 获取当前时间
   */
  public getTime(): number {
    return this.time;
  }
  
  /**
   * 设置更新间隔
   */
  public setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }
  
  /**
   * 获取更新间隔
   */
  public getUpdateInterval(): number {
    return this.updateInterval;
  }
}

/**
 * 粒子系统事件监听器类型
 */
export type ParticleSystemEventListener = (event: GPUParticleSystemEvent, data?: any) => void;

/**
 * GPU粒子系统管理器 - 优化：添加事件系统和更灵活的配置机制
 */
export class GPUParticleSystemManager {
  private particleSystems: Map<string, GPUParticleSystem> = new Map();
  private scene: THREE.Scene;
  private updateEnabled: boolean = true;
  private eventListeners: Map<GPUParticleSystemEvent, ParticleSystemEventListener[]> = new Map();
  private stats: GPUParticleSystemStats = {
    particleCount: 0,
    maxParticles: 0,
    emissionRate: 0,
    inactiveParticles: 0,
    memoryUsage: 0,
    averageLifetime: 0
  };
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeEventListeners();
  }
  
  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 初始化所有事件类型
    Object.values(GPUParticleSystemEvent).forEach(event => {
      this.eventListeners.set(event, []);
    });
  }
  
  /**
   * 注册事件监听器
   */
  public on(event: GPUParticleSystemEvent, listener: ParticleSystemEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }
  
  /**
   * 移除事件监听器
   */
  public off(event: GPUParticleSystemEvent, listener: ParticleSystemEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }
  
  /**
   * 触发事件
   */
  private emit(event: GPUParticleSystemEvent, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  /**
   * 创建GPU粒子系统
   */
  public createParticleSystem(name: string, config: GPUParticleSystemConfig): GPUParticleSystem {
    const particleSystem = new GPUParticleSystem(this.scene, config);
    this.particleSystems.set(name, particleSystem);
    
    // 更新统计信息
    this.updateStats();
    
    // 触发系统创建事件
    this.emit(GPUParticleSystemEvent.SYSTEM_CREATED, { name, config });
    
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
      
      // 更新统计信息
      this.updateStats();
      
      // 触发系统销毁事件
      this.emit(GPUParticleSystemEvent.SYSTEM_DISPOSED, { name });
    }
  }
  
  /**
   * 更新所有GPU粒子系统
   */
  public update(deltaTime: number): void {
    if (!this.updateEnabled) return;
    
    // 遍历所有粒子系统并更新
    this.particleSystems.forEach((system) => {
      system.update(deltaTime);
    });
    
    // 更新统计信息
    this.updateStats();
  }
  
  /**
   * 销毁所有GPU粒子系统
   */
  public dispose(): void {
    this.particleSystems.forEach((system) => {
      system.dispose();
    });
    
    // 清空所有粒子系统
    this.particleSystems.clear();
    
    // 清空事件监听器
    this.eventListeners.clear();
    
    // 重置统计信息
    this.resetStats();
    
    // 触发系统清理事件
    this.emit(GPUParticleSystemEvent.SYSTEM_CLEARED);
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
  
  /**
   * 获取当前统计信息
   */
  public getStats(): GPUParticleSystemStats {
    return { ...this.stats };
  }
  
  /**
   * 更新统计信息
   */
  private updateStats(): void {
    let totalParticles = 0;
    let totalMaxParticles = 0;
    let totalEmissionRate = 0;
    let totalInactiveParticles = 0;
    let totalLifetime = 0;
    let systemCount = 0;
    
    // 遍历所有粒子系统，计算统计信息
    this.particleSystems.forEach((system, name) => {
      totalParticles += system.getParticleCount();
      totalMaxParticles += system.getMaxParticles();
      totalLifetime += 5; // 假设平均生命周期为5秒
      systemCount++;
    });
    
    // 计算平均生命周期
    const averageLifetime = systemCount > 0 ? totalLifetime / systemCount : 0;
    
    // 估算内存使用量（每个粒子约100字节）
    const memoryUsage = totalParticles * 100;
    
    // 更新统计信息
    this.stats = {
      particleCount: totalParticles,
      maxParticles: totalMaxParticles,
      emissionRate: totalEmissionRate,
      inactiveParticles: totalInactiveParticles,
      memoryUsage: memoryUsage,
      averageLifetime: averageLifetime
    };
  }
  
  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      particleCount: 0,
      maxParticles: 0,
      emissionRate: 0,
      inactiveParticles: 0,
      memoryUsage: 0,
      averageLifetime: 0
    };
  }
  
  /**
   * 批量创建粒子系统
   */
  public createParticleSystems(systemsConfig: Record<string, GPUParticleSystemConfig>): Map<string, GPUParticleSystem> {
    const createdSystems = new Map<string, GPUParticleSystem>();
    
    // 批量创建粒子系统
    Object.entries(systemsConfig).forEach(([name, config]) => {
      const system = this.createParticleSystem(name, config);
      createdSystems.set(name, system);
    });
    
    return createdSystems;
  }
  
  /**
   * 更新粒子系统配置
   */
  public updateParticleSystemConfig(name: string, config: Partial<GPUParticleSystemConfig>): void {
    const system = this.getParticleSystem(name);
    if (system) {
      system.updateConfig(config);
      this.updateStats();
    }
  }

  /**
   * 批量更新粒子系统配置
   */
  public updateParticleSystemConfigs(configs: Record<string, Partial<GPUParticleSystemConfig>>): void {
    Object.entries(configs).forEach(([name, config]) => {
      this.updateParticleSystemConfig(name, config);
    });
  }
}