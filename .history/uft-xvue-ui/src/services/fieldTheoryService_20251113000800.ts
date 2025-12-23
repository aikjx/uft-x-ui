import { Vector3 } from 'three';

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
   * 更新粒子状态
   */
  updateParticles(particles: Particle[], fieldType: FieldType, fieldParams: { [key: string]: any }): void {
    // 更新时间
    this.currentTime += this.timeDelta;
    
    // 获取默认参数并合并传入的参数
    const params = this.getDefaultParams(fieldType);
    Object.assign(params, fieldParams);
    
    particles.forEach(particle => {
      // 计算场力
      const force = this.calculateFieldForce(particle.position, fieldType, params);
      
      // 根据牛顿第二定律：F = ma
      particle.acceleration.copy(force).divideScalar(particle.mass);
      
      // 更新速度
      particle.velocity.add(particle.acceleration.clone().multiplyScalar(this.timeDelta));
      
      // 添加阻尼
      particle.velocity.multiplyScalar(0.995);
      
      // 更新位置
      particle.position.add(particle.velocity.clone().multiplyScalar(this.timeDelta));
      
      // 边界检查和约束
      this.applyBoundaryConditions(particle, fieldType);
      
      // 更新颜色
      this.updateParticleColor(particle, fieldType, this.currentTime);
    });
  }
  
  /**
   * 计算场强和力
   */
  calculateFieldForce(position: Vector3, fieldType: FieldType, params: FieldParams): Vector3 {
    const force = new Vector3();
    
    switch (fieldType) {
      case FieldType.GRAVITY:
        // 引力场计算: F = G * m1 * m2 / r^2 (这里简化为场强)
        const gravityField = new Vector3(-position.x, -position.y, -position.z);
        const distanceSquared = position.lengthSq();
        if (distanceSquared > 0.01) {
          const magnitude = params.gravityStrength / Math.max(distanceSquared, 0.01);
          force.copy(gravityField.normalize().multiplyScalar(magnitude));
        }
        break;
        
      case FieldType.MAGNETIC:
        // 磁场计算: 环形磁场，围绕z轴旋转
        const radialDirection = new Vector3(position.x, position.y, 0).normalize();
        const magneticField = new Vector3(-radialDirection.y, radialDirection.x, 0);
        const radius = Math.sqrt(position.x * position.x + position.y * position.y);
        if (radius > 0.1) {
          const magnitude = params.magneticStrength / Math.max(radius, 0.1);
          force.copy(magneticField.multiplyScalar(magnitude));
        }
        break;
        
      case FieldType.ELECTRIC:
        // 电场计算: 点电荷电场
        const electricField = new Vector3(position.x, position.y, position.z);
        const distSquared = position.lengthSq();
        if (distSquared > 0.01) {
          const magnitude = params.electricStrength / Math.max(distSquared, 0.01);
          // 正电荷场是排斥力
          if (params.isPositiveCharge) {
            force.copy(electricField.normalize().multiplyScalar(magnitude));
          } else {
            force.copy(electricField.normalize().multiplyScalar(-magnitude));
          }
        }
        break;
        
      case FieldType.WAVE:
        // 波场计算: 正弦波传播
        const time = this.currentTime;
        const k = 2 * Math.PI / params.waveLength; // 波数
        const omega = 2 * Math.PI * params.waveFrequency; // 角频率
        const phase = k * position.length() - omega * time;
        
        // 创建球面波
        const waveDirection = position.clone().normalize();
        const waveAmplitude = params.waveAmplitude * Math.sin(phase);
        force.copy(waveDirection.multiplyScalar(waveAmplitude));
        break;
        
      case FieldType.QUANTUM:
        // 量子场计算: 薛定谔方程的简化模型，包含概率波和不确定性
        // 计算波函数的振幅和相位
        const wavePacket = this.generateWavePacket(position, this.currentTime, params);
        
        // 根据波函数的振幅决定力的大小
        const quantumAmplitude = wavePacket.length() * params.quantumStrength;
        
        // 加入量子涨落（随机扰动）
        const fluctuation = new Vector3(
          (Math.random() - 0.5) * params.quantumFluctuation,
          (Math.random() - 0.5) * params.quantumFluctuation,
          (Math.random() - 0.5) * params.quantumFluctuation
        );
        
        force.copy(wavePacket.normalize().multiplyScalar(quantumAmplitude).add(fluctuation));
        break;
    }
    
    return force;
  }
  
  /**
   * 生成量子波包
   */
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
   * 获取粒子初始颜色
   */
  private getParticleColor(fieldType: FieldType, index: number): Vector3 {
    const hue = (index * 0.01) % 1.0;
    
    switch (fieldType) {
      case FieldType.GRAVITY:
        // 蓝色调
        return new Vector3(0.2, 0.5 + hue * 0.3, 1.0 - hue * 0.2);
      case FieldType.MAGNETIC:
        // 绿色调
        return new Vector3(0.2 + hue * 0.3, 1.0 - hue * 0.2, 0.3);
      case FieldType.ELECTRIC:
        // 红色调
        return new Vector3(1.0 - hue * 0.2, 0.3 + hue * 0.3, 0.2);
      case FieldType.WAVE:
        // 紫色调
        return new Vector3(0.7 + hue * 0.2, 0.2, 1.0 - hue * 0.3);
      case FieldType.QUANTUM:
        // 青色/紫色渐变
        return new Vector3(0.2, 0.8 + hue * 0.2, 0.9 - hue * 0.4);
      default:
        return new Vector3(1.0, 1.0, 1.0);
    }
  }
  
  /**
   * 更新粒子颜色
   */
  private updateParticleColor(particle: Particle, fieldType: FieldType, time: number): void {
    // 根据速度调整亮度，速度越快越亮
    const speed = particle.velocity.length();
    const brightnessFactor = 1.0 + Math.min(speed * 0.5, 1.5);
    
    // 添加周期性颜色变化
    const phase = time * 2;
    const pulseFactor = 0.5 + Math.sin(phase + particle.position.length()) * 0.5;
    
    // 根据场类型调整颜色变化
    switch (fieldType) {
      case FieldType.GRAVITY:
        particle.color.set(
          0.2 * brightnessFactor * pulseFactor,
          0.7 * brightnessFactor * pulseFactor,
          1.0 * brightnessFactor * pulseFactor
        );
        break;
      case FieldType.MAGNETIC:
        particle.color.set(
          0.2 * brightnessFactor * pulseFactor,
          1.0 * brightnessFactor * pulseFactor,
          0.3 * brightnessFactor * pulseFactor
        );
        break;
      case FieldType.ELECTRIC:
        particle.color.set(
          1.0 * brightnessFactor * pulseFactor,
          0.3 * brightnessFactor * pulseFactor,
          0.2 * brightnessFactor * pulseFactor
        );
        break;
      case FieldType.WAVE:
        particle.color.set(
          0.8 * brightnessFactor * pulseFactor,
          0.2 * brightnessFactor * pulseFactor,
          1.0 * brightnessFactor * pulseFactor
        );
        break;
      case FieldType.QUANTUM:
        // 量子场颜色变化更剧烈，有随机成分
        const randomPhase = Math.random() * Math.PI * 2;
        particle.color.set(
          (0.2 + Math.sin(phase * 1.5 + randomPhase) * 0.3) * brightnessFactor * pulseFactor,
          (0.8 + Math.sin(phase * 1.2 + randomPhase + Math.PI/2) * 0.2) * brightnessFactor * pulseFactor,
          (0.9 + Math.sin(phase * 1.8 + randomPhase + Math.PI) * 0.1) * brightnessFactor * pulseFactor
        );
        break;
    }
    
    // 限制颜色值在有效范围内
    particle.color.clampScalar(0, 1);
  }
  
  /**
   * 应用边界条件
   */
  private applyBoundaryConditions(particle: Particle, fieldType: FieldType): void {
    const boundary = 15;
    
    // 对于量子场，使用周期性边界条件
    if (fieldType === FieldType.QUANTUM) {
      if (Math.abs(particle.position.x) > boundary) {
        particle.position.x = -Math.sign(particle.position.x) * boundary;
      }
      if (Math.abs(particle.position.y) > boundary) {
        particle.position.y = -Math.sign(particle.position.y) * boundary;
      }
      if (Math.abs(particle.position.z) > boundary) {
        particle.position.z = -Math.sign(particle.position.z) * boundary;
      }
    } else {
      // 其他场使用弹性边界
      const bounceFactor = -0.7; // 弹性系数
      
      if (Math.abs(particle.position.x) > boundary) {
        particle.position.x = Math.sign(particle.position.x) * boundary;
        particle.velocity.x *= bounceFactor;
      }
      if (Math.abs(particle.position.y) > boundary) {
        particle.position.y = Math.sign(particle.position.y) * boundary;
        particle.velocity.y *= bounceFactor;
      }
      if (Math.abs(particle.position.z) > boundary) {
        particle.position.z = Math.sign(particle.position.z) * boundary;
        particle.velocity.z *= bounceFactor;
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
   * 清理缓存
   */
  clearCache(): void {
    this.particleCache.clear();
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
}