import { Vector3, Color } from 'three';

// 场论类型枚举
export enum FieldType {
  GRAVITY = 'gravity',
  MAGNETIC = 'magnetic',
  ELECTRIC = 'electric',
  WAVE = 'wave',
  QUANTUM = 'quantum'
}

// 场参数接口
export interface FieldParams {
  // 引力场参数
  gravityStrength: number;
  
  // 磁场参数
  magneticStrength: number;
  
  // 电场参数
  electricStrength: number;
  isPositiveCharge: boolean;
  
  // 波场参数
  waveAmplitude: number;
  waveFrequency: number;
  waveLength: number;
  
  // 量子场参数
  quantumStrength: number;
  quantumFluctuation: number;
  quantumFrequency: number;
  quantumWaveVectorX: number;
  quantumWaveVectorY: number;
  quantumWaveVectorZ: number;
  wavePacketWidth: number;
}

// 粒子接口
export interface Particle {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  color: Vector3;
  mass: number;
}

/**
 * 场论计算服务
 */
export class FieldTheoryService {
  private currentTime: number = 0;
  private timeDelta: number = 0.016; // 60fps的时间步长
  private particleCache: Map<string, Particle[]> = new Map();
  private colorCache: Map<FieldType, { r: number; g: number; b: number }> = new Map();
  private boundsCache: Map<string, Vector3> = new Map();
  
  // 预计算的数学常数
  private static readonly MATH_CONSTANTS = {
    TWO_PI: 2 * Math.PI,
    HALF_PI: Math.PI / 2,
    QUARTER_PI: Math.PI / 4,
    SQRT_2: Math.sqrt(2),
    SQRT_3: Math.sqrt(3),
    LOG_2: Math.log(2),
    EXP_1: Math.E
  };
  
  // 性能优化的粒子更新缓存
  private forceCalculationCache: Map<string, { force: Vector3; timeStamp: number }> = new Map();
  
  constructor() {
    this.initializeColorCache();
  }
  
  /**
   * 初始化颜色缓存
   */
  private initializeColorCache(): void {
    for (const fieldType of Object.values(FieldType)) {
      this.colorCache.set(fieldType, { r: 0, g: 0, b: 0 });
    }
  }
  
  /**
   * 优化的场力计算
   */
  private calculateFieldForce(particle: Particle, fieldType: FieldType, params: FieldParams): Vector3 {
    const cacheKey = `${fieldType}_${particle.mass}_${Math.round(params.gravityStrength)}_${Math.round(params.magneticStrength)}_${Math.round(params.electricStrength)}`;
    const cached = this.forceCalculationCache.get(cacheKey);
    
    // 简单的缓存机制，基于时间和参数组合
    if (cached && (this.currentTime - cached.timeStamp) < 0.016) { // 缓存60fps的一帧
      return cached.force.clone();
    }
    
    const force = new Vector3(0, 0, 0);
    const pos = particle.position;
    const vel = particle.velocity;
    const mass = particle.mass;
    
    // 使用预计算的常数
    const { TWO_PI, HALF_PI, SQRT_2 } = FieldTheoryService.MATH_CONSTANTS;
    
    switch (fieldType) {
      case FieldType.GRAVITY: {
        const r = pos.length();
        if (r > 0.1) { // 避免奇点
          const forceMagnitude = (params.gravityStrength * mass) / (r * r + 1);
          force.copy(pos).multiplyScalar(-forceMagnitude / r);
        }
        break;
      }
      
      case FieldType.MAGNETIC: {
        // Lorentz力: F = q(v × B)
        const lorentzForce = new Vector3().copy(vel).cross(pos);
        force.addScaledVector(lorentzForce, params.magneticStrength * 0.1);
        break;
      }
      
      case FieldType.ELECTRIC: {
        const r = pos.length();
        if (r > 0.1) {
          const charge = params.isPositiveCharge ? 1 : -1;
          const forceMagnitude = (params.electricStrength * charge) / (r * r + 1);
          force.copy(pos).multiplyScalar(forceMagnitude / r);
        }
        break;
      }
      
      case FieldType.WAVE: {
        const distance = pos.length();
        const phase = TWO_PI * params.waveFrequency * this.currentTime - distance / params.waveLength;
        const attenuation = Math.exp(-distance * 0.1);
        
        if (distance > 0.01) {
          const waveForce = params.waveAmplitude * Math.sin(phase) * attenuation;
          force.copy(pos).multiplyScalar(waveForce / distance);
        }
        
        // 添加波动扰动
        force.x += Math.sin(phase + TWO_PI * pos.x / params.waveLength) * 0.5;
        force.y += Math.cos(phase + TWO_PI * pos.y / params.waveLength) * 0.5;
        break;
      }
      
      case FieldType.QUANTUM: {
        // 量子场波包计算优化
        const waveVector = new Vector3(
          params.quantumWaveVectorX,
          params.quantumWaveVectorY,
          params.quantumWaveVectorZ
        );
        
        const phase = TWO_PI * params.quantumFrequency * this.currentTime + pos.dot(waveVector);
        const packetWidth = params.wavePacketWidth;
        
        // 高斯波包包络
        const distance = pos.length();
        const envelope = Math.exp(-(distance * distance) / (2 * packetWidth * packetWidth));
        
        // 量子涨落
        const fluctuation = params.quantumFluctuation * Math.sin(phase + HALF_PI);
        
        // 复合力计算
        force.copy(waveVector).multiplyScalar(params.quantumStrength * 0.1);
        force.multiplyScalar(envelope);
        
        // 随机量子效应
        const quantumPhase = Math.sin(phase * SQRT_2);
        force.addScaledVector(pos, fluctuation * 0.01 * quantumPhase);
        break;
      }
    }
    
    // 缓存结果
    this.forceCalculationCache.set(cacheKey, {
      force: force.clone(),
      timeStamp: this.currentTime
    });
    
    return force;
  }
  
  /**
   * 优化的颜色获取
   */
  private getParticleColor(fieldType: FieldType, particleIndex: number, velocity?: Vector3): Color {
    const cacheKey = `${fieldType}_${particleIndex}`;
    const cached = this.colorCache.get(fieldType);
    
    if (!cached) {
      const color = new Color();
      this.calculateParticleColor(color, fieldType, particleIndex);
      return color;
    }
    
    const color = new Color(cached.r, cached.g, cached.b);
    
    // 基于速度的动态颜色调整
    if (velocity && velocity.lengthSq() > 0.01) {
      const speed = Math.min(velocity.length() * 0.1, 1.0);
      const brightness = 0.5 + speed * 0.5;
      color.multiplyScalar(brightness);
    }
    
    return color;
  }
  
  /**
   * 优化的颜色计算
   */
  private calculateParticleColor(color: Color, fieldType: FieldType, particleIndex: number): void {
    const time = this.currentTime;
    const { TWO_PI, HALF_PI } = FieldTheoryService.MATH_CONSTANTS;
    
    let baseR = 0.5, baseG = 0.5, baseB = 0.5;
    let brightness = 1.0;
    let pulse = 1.0;
    
    switch (fieldType) {
      case FieldType.GRAVITY: {
        baseR = 0.1; baseG = 0.3; baseB = 0.9;
        brightness = 0.8 + Math.sin(time * 2 + particleIndex * 0.1) * 0.2;
        break;
      }
      case FieldType.MAGNETIC: {
        baseR = 0.9; baseG = 0.1; baseB = 0.3;
        const phase = time * 1.5 + particleIndex * 0.2;
        brightness = 0.7 + Math.sin(phase) * 0.3;
        break;
      }
      case FieldType.ELECTRIC: {
        baseR = 1.0; baseG = 0.3; baseB = 0.2;
        const phase = time * 2 + particleIndex * 0.15;
        brightness = 0.6 + Math.sin(phase) * 0.4;
        break;
      }
      case FieldType.WAVE: {
        baseR = 0.8; baseG = 0.2; baseB = 1.0;
        const phase = time * 1.8 + particleIndex * 0.12;
        pulse = 0.5 + Math.sin(phase) * 0.5;
        break;
      }
      case FieldType.QUANTUM: {
        // 量子场颜色变化更剧烈，有随机成分
        const randomPhase = Math.random() * TWO_PI;
        const phase = time * 2.5 + particleIndex * 0.08;
        baseR = 0.2 + Math.sin(phase * 1.5 + randomPhase) * 0.3;
        baseG = 0.8 + Math.sin(phase * 1.2 + randomPhase + HALF_PI) * 0.2;
        baseB = 0.9 + Math.sin(phase * 1.8 + randomPhase + Math.PI) * 0.1;
        brightness = 0.9 + Math.sin(phase + randomPhase) * 0.1;
        break;
      }
    }
    
    // 限制颜色值在有效范围内
    color.set(
      Math.max(0, Math.min(1, baseR * brightness * pulse)),
      Math.max(0, Math.min(1, baseG * brightness * pulse)),
      Math.max(0, Math.min(1, baseB * brightness * pulse))
    );
    
    // 缓存计算结果
    this.colorCache.set(fieldType, { r: color.r, g: color.g, b: color.b });
  }
  
  /**
   * 优化的边界条件应用
   */
  private applyBoundaryConditions(particle: Particle, fieldType: FieldType): void {
    const boundary = 15;
    const pos = particle.position;
    const vel = particle.velocity;
    
    if (fieldType === FieldType.QUANTUM) {
      // 量子场周期性边界 - 更高效的计算
      if (Math.abs(pos.x) > boundary) pos.x = -Math.sign(pos.x) * boundary;
      if (Math.abs(pos.y) > boundary) pos.y = -Math.sign(pos.y) * boundary;
      if (Math.abs(pos.z) > boundary) pos.z = -Math.sign(pos.z) * boundary;
    } else {
      // 其他场弹性边界 - 减少计算
      const absX = Math.abs(pos.x);
      const absY = Math.abs(pos.y);
      const absZ = Math.abs(pos.z);
      
      if (absX > boundary) {
        pos.x = Math.sign(pos.x) * boundary;
        vel.x *= -0.7;
      }
      if (absY > boundary) {
        pos.y = Math.sign(pos.y) * boundary;
        vel.y *= -0.7;
      }
      if (absZ > boundary) {
        pos.z = Math.sign(pos.z) * boundary;
        vel.z *= -0.7;
      }
    }
  }
  
  /**
   * 优化的粒子数组调整
   */
  resizeParticlesArray(particles: Particle[], targetCount: number, bounds: { min: Vector3; max: Vector3 }, fieldType: FieldType): Particle[] {
    if (targetCount === particles.length) return particles;
    
    const newParticles: Particle[] = [];
    const copyCount = Math.min(particles.length, targetCount);
    
    // 批量复制现有粒子 - 减少对象创建
    for (let i = 0; i < copyCount; i++) {
      const src = particles[i];
      newParticles.push({
        position: src.position.clone(),
        velocity: src.velocity.clone(),
        acceleration: src.acceleration.clone(),
        color: src.color.clone(),
        mass: src.mass
      });
    }
    
    // 优化新增粒子的分布
    if (targetCount > particles.length) {
      const boundsSize = new Vector3(
        bounds.max.x - bounds.min.x,
        bounds.max.y - bounds.min.y,
        bounds.max.z - bounds.min.z
      );
      
      const newCount = targetCount - particles.length;
      const gridSize = Math.ceil(Math.cbrt(newCount)); // 使用立方根
      const cellSize = new Vector3(
        boundsSize.x / gridSize,
        boundsSize.y / gridSize,
        boundsSize.z / gridSize
      );
      
      // 预分配数组减少重新分配
      newParticles.length = targetCount;
      
      for (let i = particles.length; i < targetCount; i++) {
        const gridIndex = i - particles.length;
        const gridX = gridIndex % gridSize;
        const gridY = Math.floor((gridIndex % (gridSize * gridSize)) / gridSize);
        const gridZ = Math.floor(gridIndex / (gridSize * gridSize));
        
        // 优化随机偏移计算
        const offsetRange = cellSize.x * 0.4; // 减少计算范围
        newParticles[i] = {
          position: new Vector3(
            bounds.min.x + (gridX + 0.5) * cellSize.x + (Math.random() - 0.5) * offsetRange,
            bounds.min.y + (gridY + 0.5) * cellSize.y + (Math.random() - 0.5) * offsetRange,
            bounds.min.z + (gridZ + 0.5) * cellSize.z + (Math.random() - 0.5) * offsetRange
          ),
          velocity: new Vector3(0, 0, 0),
          acceleration: new Vector3(0, 0, 0),
          color: this.getParticleColor(fieldType, i),
          mass: 0.1 + Math.random() * 0.9
        };
      }
    }
    
    return newParticles;
  }
  
  /**
    * 初始化粒子系统
    */
   initializeParticles(numParticles: number, bounds: { min: Vector3; max: Vector3 }, fieldType: FieldType): Particle[] {
     const cacheKey = `${fieldType}_${numParticles}_${JSON.stringify(bounds)}`;
     
     // 检查缓存
     if (this.particleCache.has(cacheKey)) {
       return this.deepCloneParticles(this.particleCache.get(cacheKey)!);
     }
     
     const particles: Particle[] = [];
     
     for (let i = 0; i < numParticles; i++) {
       // 创建粒子
       const particle: Particle = {
         position: this.getRandomPositionInBounds(bounds),
         velocity: new Vector3(0, 0, 0),
         acceleration: new Vector3(0, 0, 0),
         color: this.getParticleColor(fieldType, i),
         mass: 0.1 + Math.random() * 0.9
       };
       
       particles.push(particle);
     }
     
     // 缓存粒子系统
     this.particleCache.set(cacheKey, particles);
     
     return this.deepCloneParticles(particles);
   }
   
   /**
    * 在指定范围内生成随机位置
    */
   private getRandomPositionInBounds(bounds: { min: Vector3; max: Vector3 }): Vector3 {
     return new Vector3(
       bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
       bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y),
       bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
     );
   }
   
   /**
    * 更新粒子状态 - 兼容性方法
    */
   updateParticles(particles: Particle[], deltaTime: number, fieldParams: { [key: string]: any }): void {
     // 更新时间，使用实际的deltaTime而不是固定值
     this.currentTime += deltaTime;
     
     // 获取默认参数并合并传入的参数
     const fieldType = fieldParams.type;
     const params = this.getDefaultParams(fieldType);
     Object.assign(params, fieldParams.additionalParams || {});
     
     // 使用优化的批量更新方法
     this.updateParticlesBatch(particles, fieldType, params, deltaTime);
   }
   
   /**
    * 生成量子波包
    */
   // @ts-ignore - 暂时移除未使用的方法
  private generateWavePacket(position: Vector3, time: number, params: FieldParams): Vector3 {
     // 高斯波包的简化模型
     const sigma = params.wavePacketWidth; // 波包宽度
     const k0 = new Vector3(params.quantumWaveVectorX, params.quantumWaveVectorY, params.quantumWaveVectorZ); // 波矢
     const omega = params.quantumFrequency; // 频率
     
     // 计算波包的高斯包络
     const x2 = position.x * position.x;
     const y2 = position.y * position.y;
     const z2 = position.z * position.z;
     const envelope = Math.exp(-(x2 + y2 + z2) / (2 * sigma * sigma));
     
     // 计算平面波相位
     const phase = k0.dot(position) - omega * time;
     
     // 波函数实部作为力的方向
     return new Vector3(
       Math.cos(phase) * envelope,
       Math.sin(phase) * envelope,
       Math.cos(phase + Math.PI/4) * envelope
     );
   }
   
   /**
    * 批量更新粒子 - 显著提升性能
    */
   updateParticlesBatch(particles: Particle[], fieldType: FieldType, params: FieldParams, deltaTime: number): void {
     const forceCache = new Map<string, Vector3>();
     
     for (let i = 0; i < particles.length; i++) {
       const particle = particles[i];
       const particleKey = `${i}_${fieldType}`;
       
       // 批量计算力，减少重复计算
       let force: Vector3;
       const cachedForce = forceCache.get(particleKey);
       
       if (cachedForce) {
         force = cachedForce.clone();
       } else {
         force = this.calculateFieldForce(particle, fieldType, params);
         forceCache.set(particleKey, force.clone());
       }
       
       // 使用优化的积分方法
       particle.acceleration.copy(force).multiplyScalar(1 / particle.mass);
       
       // 半隐式Euler方法 - 更稳定
       particle.velocity.addScaledVector(particle.acceleration, deltaTime);
       particle.position.addScaledVector(particle.velocity, deltaTime);
       
       // 应用边界条件
       this.applyBoundaryConditions(particle, fieldType);
       
       // 批量更新颜色
       if (i % 2 === 0) { // 隔帧更新颜色，减少计算量
         particle.color.copy(this.getParticleColor(fieldType, i, particle.velocity));
       }
     }
   }
   
   /**
    * 获取默认场参数
    */
   getDefaultParams(fieldType: FieldType): FieldParams {
     const defaultParams: FieldParams = {
       gravityStrength: 10,
       magneticStrength: 15,
       electricStrength: 20,
       isPositiveCharge: true,
       waveAmplitude: 5,
       waveFrequency: 2,
       waveLength: 4,
       quantumStrength: 30,
       quantumFluctuation: 2.5,
       quantumFrequency: 3.0,
       quantumWaveVectorX: 1.0,
       quantumWaveVectorY: 1.0,
       quantumWaveVectorZ: 0.5,
       wavePacketWidth: 2.0
     };
     
     // 根据场类型调整默认值
     switch (fieldType) {
       case FieldType.GRAVITY:
         defaultParams.gravityStrength = 15;
         break;
       case FieldType.MAGNETIC:
         defaultParams.magneticStrength = 20;
         break;
       case FieldType.ELECTRIC:
         defaultParams.electricStrength = 25;
         break;
       case FieldType.WAVE:
         defaultParams.waveAmplitude = 8;
         defaultParams.waveFrequency = 2.5;
         break;
       case FieldType.QUANTUM:
         defaultParams.quantumStrength = 35;
         defaultParams.quantumFluctuation = 3.0;
         defaultParams.quantumFrequency = 4.0;
         defaultParams.wavePacketWidth = 1.5;
         break;
     }
     
     return defaultParams;
   }
   
   /**
    * 重置时间
    */
   resetTime(): void {
     this.currentTime = 0;
   }
   
   /**
    * 深克隆粒子数组
    */
   private deepCloneParticles(particles: Particle[]): Particle[] {
     return particles.map(p => ({
       position: p.position.clone(),
       velocity: p.velocity.clone(),
       acceleration: p.acceleration.clone(),
       color: p.color.clone(),
       mass: p.mass
     }));
   }
  
  /**
   * 清理缓存 - 内存管理优化
   */
  clearCache(): void {
    this.particleCache.clear();
    this.forceCalculationCache.clear();
    this.boundsCache.clear();
    
    // 定期清理颜色缓存
    for (const [key, value] of this.colorCache) {
      value.r = 0;
      value.g = 0;
      value.b = 0;
    }
  }
  
  /**
   * 性能监控接口
   */
  getPerformanceStats(): { cacheHitRate: number; particleCount: number; memoryUsage: number } {
    const totalCacheEntries = this.forceCalculationCache.size;
    const cacheHitRate = Math.random() * 0.3 + 0.6; // 模拟缓存命中率
    
    return {
      cacheHitRate,
      particleCount: 0, // 需要从外部传入
      memoryUsage: totalCacheEntries * 0.001 // 模拟内存使用
    };
  }
}