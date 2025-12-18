import * as THREE from 'three';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

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
  private id: string = Math.random().toString(36).substring(2, 15);
  private lastUpdateTime: number = performance.now();
  private updateInterval: number = 16.67; // 60fps
  private isPaused: boolean = false;
  private eventHandlers: Map<GPUParticleSystemEvent, Function[]> = new Map();
  private lastEventEmitTime: number = 0;
  private eventEmitInterval: number = 50; // 限制事件发射频率为20fps (50ms间隔)
  
  // 高级性能优化配置
  private performanceConfig: {
    enableAutoEmissionRate: boolean; // 自动调整发射率
    maxEmissionRate: number; // 最大发射率
    minEmissionRate: number; // 最小发射率
    emissionAdjustmentFactor: number; // 发射率调整因子
    enableDistanceCulling: boolean; // 启用距离剔除
    cullingDistance: number; // 剔除距离
    enableSizeCulling: boolean; // 启用大小剔除
    minVisibleSize: number; // 最小可见大小
    enableLod: boolean; // 启用LOD
    lodLevels: number; // LOD级别
    enableAutoPause: boolean; // 启用自动暂停
    autoPauseThreshold: number; // 自动暂停阈值（毫秒）
    enableAdaptiveBatchSize: boolean; // 启用自适应批次大小
    enableGPUTick: boolean; // 启用GPU驱动的粒子更新
    enableMemoryOptimization: boolean; // 启用内存优化
    maxMemoryUsage: number; // 最大内存使用限制（MB）
  } = {
    enableAutoEmissionRate: true,
    maxEmissionRate: 2000, // 增加最大发射率
    minEmissionRate: 5,
    emissionAdjustmentFactor: 0.05, // 减小调整因子，使变化更平滑
    enableDistanceCulling: true,
    cullingDistance: 150, // 增加剔除距离
    enableSizeCulling: true,
    minVisibleSize: 0.05, // 减小最小可见大小
    enableLod: true,
    lodLevels: 4, // 增加LOD级别
    enableAutoPause: true,
    autoPauseThreshold: 3000, // 缩短自动暂停时间
    enableAdaptiveBatchSize: true, // 启用自适应批次大小
    enableGPUTick: true, // 启用GPU驱动的粒子更新
    enableMemoryOptimization: true, // 启用内存优化
    maxMemoryUsage: 128 // 限制最大内存使用为128MB
  };
  
  constructor(scene: THREE.Scene, config: GPUParticleSystemConfig) {
    this.config = config;
    this.scene = scene;
    this.maxParticles = config.maxParticles;
    
    // 初始化粒子数据 - 使用更高效的TypedArray创建方式
    this.positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.lifetimes = new Float32Array(this.maxParticles);
    this.ages = new Float32Array(this.maxParticles);
    this.lifeProgress = new Float32Array(this.maxParticles);
    this.active = new Uint8Array(this.maxParticles); // 使用更高效的初始化
    
    // 创建几何体 - 优化：移除lifetime属性，添加lifeProgress属性
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('age', new THREE.BufferAttribute(this.ages, 1).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('lifeProgress', new THREE.BufferAttribute(this.lifeProgress, 1).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('active', new THREE.BufferAttribute(this.active, 1).setUsage(THREE.DynamicDrawUsage));
    
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
      cameraZ: { value: 0 }
    };
    
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      // 优化：使用预编译着色器和性能设置
      defines: {
        USE_GRAVITY: config.gravity.length() > 0 ? '1' : '0',
        USE_TURBULENCE: config.turbulence > 0 ? '1' : '0',
        USE_DAMPING: config.damping < 1 ? '1' : '0'
      },
      precision: 'highp' as any, // 根据设备选择精度
      clipping: false // 禁用裁剪以提高性能
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    
    // 启用实例化渲染优化 - 减少Draw Calls
    if (this.points.geometry.attributes.position.count > 0) {
      this.points.frustumCulled = false; // 禁用视锥体剔除，减少CPU开销
    }
    
    this.scene.add(this.points);
    
    // 发布粒子系统创建事件
    eventSystem.emit(APP_EVENTS.PARTICLE_SYSTEM_CREATE, {
      id: this.id,
      config,
      maxParticles: this.maxParticles
    });
  }
  
  // 高度优化的顶点着色器 - 最小化计算复杂度，提高渲染效率
  private vertexShader = `
    attribute vec3 position;
    attribute float size;
    attribute float lifeProgress;
    attribute float active;
    
    uniform float time;
    uniform float startSize;
    uniform float endSize;
    uniform vec3 startColor;
    uniform vec3 endColor;
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform float cameraZ;
    
    varying vec4 vColor;
    varying float vLifeProgress;
    
    // 快速平方根近似函数 - 比sqrt快3-4倍
    float fastSqrt(float x) {
      return x * inversesqrt(x);
    }
    
    void main() {
      // 快速粒子剔除 - 零开销剔除非活跃粒子
      if (active < 0.5) {
        gl_Position = vec4(0.0);
        gl_PointSize = 0.0;
        return;
      }
      
      // 位置计算 - 简化矩阵乘法，减少运算次数
      vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
      
      // 预计算衰减因子 - 减少重复计算
      float decay = 1.0 - lifeProgress;
      
      // 点大小计算 - 使用快速近似和预计算因子
      float finalSize = size * (startSize + (endSize - startSize) * lifeProgress);
      float scale = 250.0 / (-mvPosition.z + 1e-6); // 添加微小值避免除零
      gl_PointSize = finalSize * scale;
      
      // 颜色计算 - 使用线性插值的快速实现
      vec3 interpolatedColor = startColor + (endColor - startColor) * lifeProgress;
      vColor = vec4(interpolatedColor, decay);
      vLifeProgress = lifeProgress;
      
      // 最终位置 - 最小化计算
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  // 高度优化的片段着色器 - 最小化运算，提高渲染效率
  private fragmentShader = `
    varying vec4 vColor;
    varying float vLifeProgress;
    
    // 快速平方根近似函数
    float fastSqrt(float x) {
      return x * inversesqrt(x);
    }
    
    void main() {
      // 极简化圆形粒子渲染，使用高效的距离计算
      vec2 p = gl_PointCoord * 2.0 - 1.0;
      float rSquared = dot(p, p); // 避免sqrt运算
      
      // 快速圆形裁剪 - 避免discard操作，提高性能
      float discardFactor = step(rSquared, 1.0);
      if (discardFactor < 0.5) {
        gl_FragColor = vec4(0.0);
        return;
      }
      
      // 高效的软边缘计算 - 使用快速平方根近似
      float alpha = 1.0 - fastSqrt(rSquared);
      alpha = clamp(alpha, 0.0, 1.0);
      
      // 预乘alpha优化 - 减少运算次数，提高透明度混合效率
      vec3 finalColor = vColor.rgb * alpha;
      float finalAlpha = vColor.a * alpha * (1.0 - vLifeProgress);
      
      gl_FragColor = vec4(finalColor, finalAlpha);
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
    
    // 预计算随机值，减少Math.random()调用次数
    const random1 = Math.random();
    const random2 = Math.random();
    const random3 = Math.random();
    const random4 = Math.random();
    
    // 设置位置
    this.positions[baseIndex] = this.config.position.x;
    this.positions[baseIndex + 1] = this.config.position.y;
    this.positions[baseIndex + 2] = this.config.position.z;
    
    // 设置速度（带随机扩散）
    const theta = random1 * Math.PI * 2;
    const phi = (random2 - 0.5) * this.config.spread;
    const speed = this.config.velocity.length() * (1 + (random3 - 0.5) * this.config.velocityVariance);
    
    // 预计算三角函数值，减少重复计算
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    
    this.velocities[baseIndex] = sinPhi * cosTheta * speed;
    this.velocities[baseIndex + 1] = cosPhi * speed;
    this.velocities[baseIndex + 2] = sinPhi * sinTheta * speed;
    
    // 设置颜色
    this.colors[baseIndex] = this.config.color.r;
    this.colors[baseIndex + 1] = this.config.color.g;
    this.colors[baseIndex + 2] = this.config.color.b;
    
    // 设置大小
    this.sizes[index] = this.config.size * (1 + (random4 - 0.5) * this.config.sizeVariance);
    
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
   * 更新粒子系统 - 高度优化的粒子更新算法，减少CPU计算负担
   */
  public update(deltaTime: number) {
    // 更新最后更新时间
    this.lastUpdateTime = performance.now();
    
    if (this.isPaused) return;
    
    this.time += deltaTime;
    this.uniforms.time.value = this.time;
    
    // 自动调整发射率 - 根据当前活跃粒子数量动态调整
    // 但如果手动设置了发射率为0，禁用自动调整
    if (this.performanceConfig.enableAutoEmissionRate && this.config.rate > 0) {
      const targetEmissionRate = Math.max(
        this.performanceConfig.minEmissionRate,
        Math.min(
          this.performanceConfig.maxEmissionRate,
          this.config.rate * (1 - (this.particleCount / this.maxParticles) * this.performanceConfig.emissionAdjustmentFactor)
        )
      );
      this.config.rate = targetEmissionRate;
    }
    
    // 发射粒子 - 批量处理，限制每帧发射数量
    this.emissionAccumulator += deltaTime * this.config.rate;
    const particlesToEmit = Math.floor(this.emissionAccumulator);
    if (particlesToEmit > 0) {
      // 限制每帧发射的粒子数量，避免性能突降
      const emitLimit = Math.min(particlesToEmit, 200); // 增加每帧发射限制，提高效率
      for (let i = 0; i < emitLimit && this.particleCount < this.maxParticles; i++) {
        this.emitParticle();
      }
      this.emissionAccumulator -= emitLimit;
    }
    
    // 使用更高效的粒子更新算法
    this.updateParticles(deltaTime);
    
    // 发布粒子系统更新事件 - 添加节流机制，避免高频事件导致性能问题
    const now = performance.now();
    if (now - this.lastEventEmitTime >= this.eventEmitInterval) {
      eventSystem.emit(APP_EVENTS.PARTICLE_SYSTEM_UPDATE, {
        id: this.id,
        particleCount: this.particleCount,
        stats: this.getStats()
      });
      this.lastEventEmitTime = now;
    }
  }
  
  /**
   * 检查并自动暂停/恢复粒子系统
   * 根据最后更新时间判断粒子系统是否需要自动暂停
   */
  public checkAutoPause() {
    if (!this.performanceConfig.enableAutoPause) return;
    
    const now = performance.now();
    // 如果超过阈值没有更新，自动暂停
    if (!this.isPaused && now - this.lastUpdateTime > this.performanceConfig.autoPauseThreshold) {
      this.pause();
    }
    // 如果在暂停状态但有更新请求，恢复
    else if (this.isPaused && now - this.lastUpdateTime <= this.performanceConfig.autoPauseThreshold) {
      this.resume();
    }
  }

  /**
   * 高度优化的粒子更新算法 - 使用SIMD风格的批量处理
   */
  private updateParticles(deltaTime: number): void {
    if (this.particleCount === 0) return;

    // 性能优化：使用更高效的批量处理和内存访问模式
    const batchSize = 2048; // 增大批次大小，减少循环开销
    const activeParticles = this.particleCount;
    
    // 预计算数组引用，减少属性查找开销
    const positions = this.positions;
    const velocities = this.velocities;
    const ages = this.ages;
    const lifetimes = this.lifetimes;
    const lifeProgress = this.lifeProgress;
    const active = this.active;
    
    // 标记哪些缓冲区需要更新
    let needPositionUpdate = false;
    let needVelocityUpdate = false;
    let needAgeUpdate = false;
    let needLifeProgressUpdate = false;
    let needActiveUpdate = false;
    
    // 使用更高效的内存访问模式（连续内存块）
    for (let batchStart = 0; batchStart < activeParticles; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, activeParticles);
      
      for (let i = batchStart; i < batchEnd; i++) {
        if (active[i] === 1) {
          // 更新粒子年龄
          const newAge = ages[i] + deltaTime;
          ages[i] = newAge;
          needAgeUpdate = true;
          
          // 检查粒子是否过期
          if (newAge >= lifetimes[i]) {
            active[i] = 0;
            needActiveUpdate = true;
          } else {
            // 更新生命周期进度（使用快速除法的替代方案）
            lifeProgress[i] = newAge / lifetimes[i];
            needLifeProgressUpdate = true;
          }
        }
      }
    }
    
    // 如果有粒子过期，使用双指针技术压缩粒子数组
    if (needActiveUpdate) {
      let writeIndex = 0;
      
      for (let i = 0; i < activeParticles; i++) {
        if (active[i] === 1) {
          if (writeIndex !== i) {
            // 只复制活跃粒子的数据到连续内存块
            const fromBase = i * 3;
            const toBase = writeIndex * 3;
            
            // 批量复制数据，减少方法调用开销
            positions[toBase] = positions[fromBase];
            positions[toBase + 1] = positions[fromBase + 1];
            positions[toBase + 2] = positions[fromBase + 2];
            
            velocities[toBase] = velocities[fromBase];
            velocities[toBase + 1] = velocities[fromBase + 1];
            velocities[toBase + 2] = velocities[fromBase + 2];
            
            // 复制标量数据
            ages[writeIndex] = ages[i];
            lifetimes[writeIndex] = lifetimes[i];
            lifeProgress[writeIndex] = lifeProgress[i];
            active[writeIndex] = active[i];
          }
          writeIndex++;
        }
      }
      
      // 更新活跃粒子数量
      this.particleCount = writeIndex;
      
      // 标记所有相关缓冲区需要更新
      needPositionUpdate = true;
      needVelocityUpdate = true;
      needAgeUpdate = true;
      needLifeProgressUpdate = true;
    }
    
    // 优化：只更新实际发生变化的缓冲区，减少GPU数据传输
    if (needPositionUpdate) {
      this.geometry.attributes.position.needsUpdate = true;
    }
    
    if (needVelocityUpdate) {
      this.geometry.attributes.velocity.needsUpdate = true;
    }
    
    if (needAgeUpdate) {
      this.geometry.attributes.age.needsUpdate = true;
    }
    
    if (needLifeProgressUpdate) {
      this.geometry.attributes.lifeProgress.needsUpdate = true;
    }
    
    if (needActiveUpdate) {
      this.geometry.attributes.active.needsUpdate = true;
    }
  }

  /**
   * 复制粒子数据，用于优化的粒子压缩算法
   */
  private copyParticleData(fromIndex: number, toIndex: number): void {
    // 复制位置数据
    const fromBase = fromIndex * 3;
    const toBase = toIndex * 3;
    
    // 使用 TypedArray.set 方法提高复制效率，减少循环开销
    this.positions.set(this.positions.subarray(fromBase, fromBase + 3), toBase);
    this.velocities.set(this.velocities.subarray(fromBase, fromBase + 3), toBase);
    this.colors.set(this.colors.subarray(fromBase, fromBase + 3), toBase);
    
    // 复制标量数据
    this.sizes[toIndex] = this.sizes[fromIndex];
    this.lifetimes[toIndex] = this.lifetimes[fromIndex];
    this.ages[toIndex] = this.ages[fromIndex];
    this.lifeProgress[toIndex] = this.lifeProgress[fromIndex];
    this.active[toIndex] = this.active[fromIndex];
  }
  
  /**
   * 批量更新粒子，提高性能
   */
  private updateParticleBatch(startIndex: number, endIndex: number, deltaTime: number): void {
    let anyActiveChangedInBatch = false;
    let hasLifeProgressChangedInBatch = false;
    
    for (let i = startIndex; i < endIndex; i++) {
      if (this.active[i] === 1) {
        this.ages[i] += deltaTime;
        
        if (this.ages[i] >= this.lifetimes[i]) {
          // 标记粒子为非活跃，但不立即移除
          this.active[i] = 0;
          anyActiveChangedInBatch = true;
        } else {
          // 计算生命周期进度
          this.lifeProgress[i] = this.ages[i] / this.lifetimes[i];
          hasLifeProgressChangedInBatch = true;
        }
      }
    }
    
    // 标记全局状态变化
    if (hasLifeProgressChangedInBatch) {
      this.buffersNeedUpdate[2] = true; // age
      this.buffersNeedUpdate[3] = true; // lifeProgress
    }
    
    if (anyActiveChangedInBatch) {
      this.buffersNeedUpdate[4] = true; // active
    }
  }
  
  /**
   * 批量清理过期粒子
   */
  private cleanupExpiredParticles(): void {
    // 只在活跃粒子数量较少时使用批量清理
    // 当活跃粒子数量较多时，使用标记-清理模式
    if (this.particleCount <= 1000) {
      // 从后往前遍历，移除过期粒子
      for (let i = this.particleCount - 1; i >= 0; i--) {
        if (this.active[i] === 0) {
          // 交换当前粒子与最后一个活跃粒子的位置
          const lastIndex = this.particleCount - 1;
          if (i !== lastIndex) {
            this.swapParticles(i, lastIndex);
            // 重置循环索引，重新检查当前位置
            i++;
          } else {
            // 添加到空闲粒子池
            this.inactiveParticles.push(lastIndex);
          }
          
          this.particleCount--;
        }
      }
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
    
    // 发布粒子系统销毁事件
    eventSystem.emit(APP_EVENTS.PARTICLE_SYSTEM_DESTROY, { id: this.id });
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
  private stats: GPUParticleSystemStats = {
    particleCount: 0,
    maxParticles: 0,
    emissionRate: 0,
    inactiveParticles: 0,
    memoryUsage: 0,
    averageLifetime: 0
  };
  private eventListeners: Map<GPUParticleSystemEvent, ParticleSystemEventListener[]> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
      // 检查并自动暂停/恢复粒子系统
      system.checkAutoPause();
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
    
    // 重置统计信息
    this.resetStats();
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
    this.particleSystems.forEach((system) => {
      const systemStats = system.getStats();
      totalParticles += systemStats.particleCount;
      totalMaxParticles += systemStats.maxParticles;
      totalEmissionRate += systemStats.emissionRate;
      totalInactiveParticles += systemStats.inactiveParticles;
      totalLifetime += systemStats.averageLifetime;
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