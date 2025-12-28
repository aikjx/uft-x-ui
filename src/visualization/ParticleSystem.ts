import * as THREE from 'three'

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
 * 粒子连接配置
 */
export interface ParticleConnectionConfig {
  enabled: boolean
  maxDistance: number
  minDistance: number
  lineWidth: number
  opacity: number
  color: THREE.Color
  fadeOut: boolean
}

/**
 * 粒子类
 */
export class Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  color: THREE.Color
  startColor: THREE.Color
  endColor: THREE.Color
  size: number
  startSize: number
  endSize: number
  lifetime: number
  age: number
  mass: number
  active: boolean
  behavior: ParticleBehavior
  rotation: number
  rotationSpeed: number
  opacity: number
  startOpacity: number
  endOpacity: number
  trail: THREE.Vector3[]
  maxTrailLength: number
  attractor: THREE.Vector3
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number

  // 增强的粒子属性
  birthTime: number
  glowIntensity: number
  startGlowIntensity: number
  endGlowIntensity: number
  spin: number
  spinSpeed: number

  // 粒子连接相关属性
  connectionWeights: Map<number, number> // 与其他粒子的连接权重

  constructor() {
    this.position = new THREE.Vector3()
    this.velocity = new THREE.Vector3()
    this.acceleration = new THREE.Vector3()
    this.color = new THREE.Color()
    this.startColor = new THREE.Color()
    this.endColor = new THREE.Color()
    this.size = 1
    this.startSize = 1
    this.endSize = 1
    this.lifetime = 1
    this.age = 0
    this.mass = 1
    this.active = false
    this.behavior = ParticleBehavior.NORMAL
    this.rotation = 0
    this.rotationSpeed = 0
    this.opacity = 1
    this.startOpacity = 1
    this.endOpacity = 0
    this.trail = []
    this.maxTrailLength = 10
    this.attractor = new THREE.Vector3()
    this.orbitRadius = 1
    this.orbitSpeed = 1
    this.orbitAngle = 0

    // 初始化增强属性
    this.birthTime = 0
    this.glowIntensity = 0
    this.startGlowIntensity = 1
    this.endGlowIntensity = 0
    this.spin = 0
    this.spinSpeed = 0

    // 初始化连接权重
    this.connectionWeights = new Map()
  }

  reset(): void {
    this.position.set(0, 0, 0)
    this.velocity.set(0, 0, 0)
    this.acceleration.set(0, 0, 0)
    this.color.setHex(0xffffff)
    this.startColor.setHex(0xffffff)
    this.endColor.setHex(0xffffff)
    this.size = 1
    this.startSize = 1
    this.endSize = 1
    this.lifetime = 1
    this.age = 0
    this.mass = 1
    this.active = false
    this.behavior = ParticleBehavior.NORMAL
    this.rotation = 0
    this.rotationSpeed = 0
    this.opacity = 1
    this.startOpacity = 1
    this.endOpacity = 0
    this.trail = []
    this.maxTrailLength = 10
    this.attractor.set(0, 0, 0)
    this.orbitRadius = 1
    this.orbitSpeed = 1
    this.orbitAngle = 0

    // 重置增强属性
    this.birthTime = 0
    this.glowIntensity = 0
    this.startGlowIntensity = 1
    this.endGlowIntensity = 0
    this.spin = 0
    this.spinSpeed = 0

    // 清空连接权重
    this.connectionWeights.clear()
  }

  // 用于临时计算的向量，避免每次更新创建新实例
  private tempVec1: THREE.Vector3 = new THREE.Vector3()
  private tempVec2: THREE.Vector3 = new THREE.Vector3()
  private tempVec3: THREE.Vector3 = new THREE.Vector3()

  update(deltaTime: number): void {
    if (!this.active) return

    this.age += deltaTime
    if (this.age >= this.lifetime) {
      this.active = false
      return
    }

    // 计算生命周期进度
    const progress = this.age / this.lifetime

    // 增强的生命周期动画曲线
    const easeInProgress = this.easeInOutCubic(progress)
    const easeOutProgress = this.easeOutCubic(progress)
    const bounceProgress = this.bounceOut(progress)

    // 更新颜色（使用更丰富的颜色过渡）
    if (this.age % 0.05 < deltaTime) {
      this.color.lerpColors(this.startColor, this.endColor, easeInProgress)
    }

    // 更新大小和透明度（使用动画曲线）
    if (this.age % 0.05 < deltaTime) {
      // 出生时的缩放动画
      const birthScale = progress < 0.1 ? bounceProgress * 2 : 1
      this.size = (this.startSize + (this.endSize - this.startSize) * easeOutProgress) * birthScale

      // 透明度变化，加入脉冲效果
      const pulse = 1 + Math.sin(this.age * 10) * 0.1
      this.opacity =
        (this.startOpacity + (this.endOpacity - this.startOpacity) * easeInProgress) * pulse
    }

    // 更新旋转和自旋
    if (this.rotationSpeed !== 0) {
      this.rotation += this.rotationSpeed * deltaTime
    }
    if (this.spinSpeed !== 0) {
      this.spin += this.spinSpeed * deltaTime
    }

    // 更新发光强度
    this.glowIntensity =
      this.startGlowIntensity + (this.endGlowIntensity - this.startGlowIntensity) * easeOutProgress

    // 根据行为模式更新粒子
    switch (this.behavior) {
      case ParticleBehavior.SPIRAL:
        this.updateSpiral(progress)
        break
      case ParticleBehavior.TURBULENCE:
        this.updateTurbulence(deltaTime)
        break
      case ParticleBehavior.ATTRACTOR:
        this.updateAttractor(deltaTime)
        break
      case ParticleBehavior.EXPLOSION:
        this.updateExplosion(progress, deltaTime)
        break
      case ParticleBehavior.WAVE:
        this.updateWave(progress, deltaTime)
        break
      case ParticleBehavior.ORBIT:
        this.updateOrbit(deltaTime)
        break
      case ParticleBehavior.FOLLOW:
        this.updateFollow(deltaTime)
        break
      default:
        this.updateNormal(deltaTime)
    }

    // 更新轨迹，使用更优化的轨迹记录
    if (this.maxTrailLength > 0 && this.age % 0.05 < deltaTime) {
      this.trail.push(this.position.clone())
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift()
      }
    }
  }

  // 动画曲线函数
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  private bounceOut(t: number): number {
    const n1 = 7.5625
    const d1 = 2.75

    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  }

  private updateNormal(deltaTime: number): void {
    // 更新速度（使用临时向量避免创建新实例）
    this.tempVec1.copy(this.acceleration).multiplyScalar(deltaTime)
    this.velocity.add(this.tempVec1)

    // 更新位置
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime)
    this.position.add(this.tempVec2)

    // 重置加速度
    this.acceleration.set(0, 0, 0)
  }

  private updateSpiral(progress: number): void {
    // 螺旋运动 - 增强的螺旋效果
    const radius = progress * 10 + Math.sin(progress * 5) * 2
    const angle = progress * Math.PI * 10 + Math.cos(progress * 3) * 0.5
    this.position.x = Math.cos(angle) * radius
    this.position.y = Math.sin(angle) * radius
    this.position.z = progress * 10 + Math.sin(progress * 2) * 3
  }

  private updateTurbulence(deltaTime: number): void {
    // 增强的湍流效果
    const turbulence = 0.5 + Math.sin(this.age * 5) * 0.2
    this.tempVec1.set(
      (Math.random() - 0.5) * turbulence,
      (Math.random() - 0.5) * turbulence,
      (Math.random() - 0.5) * turbulence
    )
    this.velocity.add(this.tempVec1)
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime)
    this.position.add(this.tempVec2)
  }

  private updateAttractor(deltaTime: number): void {
    // 向吸引子移动，增强的引力效果
    this.tempVec1.subVectors(this.attractor, this.position)
    const distance = this.tempVec1.length()
    const force = Math.min(5, 20 / (distance * distance + 1))
    this.tempVec1.normalize().multiplyScalar(force)
    this.applyForce(this.tempVec1)
    this.updateNormal(deltaTime)
  }

  private updateExplosion(progress: number, deltaTime: number): void {
    // 爆炸效果，加入波纹效果
    const ripple = Math.sin(progress * 20) * 0.1
    this.velocity.multiplyScalar(0.99 + ripple) // 减速并加入波纹
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime)
    this.position.add(this.tempVec2)
  }

  private updateWave(progress: number, deltaTime: number): void {
    // 增强的波浪运动
    this.position.y =
      Math.sin(progress * Math.PI * 10 + this.age * 5) * 5 + Math.cos(progress * Math.PI * 5) * 2
    this.position.z =
      Math.cos(progress * Math.PI * 10 + this.age * 5) * 5 + Math.sin(progress * Math.PI * 5) * 2
    this.position.x += deltaTime * 10
  }

  private updateOrbit(deltaTime: number): void {
    // 轨道运动，加入轨道扰动
    const perturbation = Math.sin(this.orbitAngle * 3) * 0.1
    this.orbitAngle += (this.orbitSpeed + perturbation) * deltaTime
    this.position.x =
      this.attractor.x + Math.cos(this.orbitAngle) * (this.orbitRadius + perturbation)
    this.position.y =
      this.attractor.y + Math.sin(this.orbitAngle) * (this.orbitRadius + perturbation)
    this.position.z = this.attractor.z + Math.sin(this.orbitAngle * 2) * perturbation * 2
  }

  private updateFollow(deltaTime: number): void {
    // 跟随效果
    this.tempVec2.copy(this.velocity).multiplyScalar(deltaTime)
    this.position.add(this.tempVec2)
  }

  applyForce(force: THREE.Vector3): void {
    // 使用临时向量避免创建新实例
    this.tempVec1.copy(force).divideScalar(this.mass)
    this.acceleration.add(this.tempVec1)
  }

  /**
   * 更新与其他粒子的连接权重
   */
  updateConnectionWeight(particleIndex: number, weight: number): void {
    this.connectionWeights.set(particleIndex, weight)
  }

  /**
   * 获取与其他粒子的连接权重
   */
  getConnectionWeight(particleIndex: number): number {
    return this.connectionWeights.get(particleIndex) || 0
  }

  /**
   * 清除所有连接权重
   */
  clearConnectionWeights(): void {
    this.connectionWeights.clear()
  }
}

/**
 * 粒子发射器配置
 */
export interface EmitterConfig {
  position: THREE.Vector3
  rate: number // 每秒发射粒子数
  lifetime: number
  lifetimeVariance: number
  velocity: THREE.Vector3
  velocityVariance: number
  size: number
  sizeVariance: number
  startColor: THREE.Color
  endColor: THREE.Color
  colorVariance: number
  spread: number // 发射角度
  gravity: THREE.Vector3
  behavior: ParticleBehavior
  rotationSpeed: number
  startOpacity: number
  endOpacity: number
  maxTrailLength: number
  attractor: THREE.Vector3
  orbitRadius: number
  orbitSpeed: number
  texture?: THREE.Texture
  blending: THREE.Blending
  transparent: boolean
  sizeAttenuation: boolean
  depthTest: boolean
  depthWrite: boolean

  // 增强的粒子属性配置
  startGlowIntensity?: number
  endGlowIntensity?: number
  spinSpeed?: number

  // 粒子连接配置
  connectionConfig?: ParticleConnectionConfig
}

/**
 * 粒子数据接口
 */
export interface ParticleSystemData {
  positions: Float32Array
  velocities: Float32Array
  colors: Float32Array
  sizes: Float32Array
  opacities: Float32Array
  lifetimes: Float32Array
  count: number
}

/**
 * 对象池类 - 优化版本
 */
export class ObjectPool<T> {
  private objects: T[] = []
  private maxSize: number
  private createFn: () => T
  private resetFn: (obj: T) => void
  private acquireCount: number = 0
  private releaseCount: number = 0

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize

    // 预分配对象池
    this.preAllocate(Math.min(100, maxSize))
  }

  /**
   * 预分配对象池
   */
  private preAllocate(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.createFn()
      this.resetFn(obj)
      this.objects.push(obj)
    }
  }

  acquire(): T {
    this.acquireCount++
    if (this.objects.length > 0) {
      return this.objects.pop()!
    }
    return this.createFn()
  }

  release(obj: T): void {
    this.releaseCount++
    if (this.objects.length < this.maxSize) {
      // 优化：只在必要时重置对象
      this.resetFn(obj)
      this.objects.push(obj)
    }
  }

  clear(): void {
    this.objects = []
  }

  /**
   * 获取对象池统计信息
   */
  getStats(): { acquireCount: number; releaseCount: number; poolSize: number } {
    return {
      acquireCount: this.acquireCount,
      releaseCount: this.releaseCount,
      poolSize: this.objects.length
    }
  }
}

/**
 * 粒子发射器
 */
export class ParticleEmitter {
  private config: EmitterConfig
  private particles: Particle[]
  private particlePool: ObjectPool<Particle>
  private emissionTimer: number = 0
  private maxParticles: number
  private connectionLines: THREE.LineSegments // 粒子连接线条

  constructor(config: Partial<EmitterConfig>, maxParticles: number = 10000) {
    this.maxParticles = maxParticles
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

      // 增强的粒子属性默认值
      startGlowIntensity: 1,
      endGlowIntensity: 0,
      spinSpeed: 0,

      // 粒子连接默认配置
      connectionConfig: {
        enabled: false,
        maxDistance: 20,
        minDistance: 2,
        lineWidth: 0.1,
        opacity: 0.5,
        color: new THREE.Color(0x6366f1),
        fadeOut: true
      },

      ...config
    }

    this.particles = []
    this.particlePool = new ObjectPool(
      () => new Particle(),
      p => p.reset(),
      maxParticles
    )

    // 初始化粒子连接相关属性
    this.connectionLines = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: this.config.connectionConfig?.color || 0x6366f1,
        transparent: true,
        opacity: this.config.connectionConfig?.opacity || 0.5,
        linewidth: this.config.connectionConfig?.lineWidth || 0.1,
        blending: THREE.AdditiveBlending
      })
    )
  }

  /**
   * 发射粒子
   */
  private emit(): void {
    if (this.particles.length >= this.maxParticles) return

    const particle = this.particlePool.acquire()

    // 设置位置
    particle.position.copy(this.config.position)

    // 设置速度（带随机扩散）
    const theta = Math.random() * Math.PI * 2
    const phi = (Math.random() - 0.5) * this.config.spread

    const speed =
      this.config.velocity.length() * (1 + (Math.random() - 0.5) * this.config.velocityVariance)

    particle.velocity.set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.cos(phi) * speed,
      Math.sin(phi) * Math.sin(theta) * speed
    )

    // 设置生命周期
    particle.lifetime =
      this.config.lifetime * (1 + (Math.random() - 0.5) * this.config.lifetimeVariance)
    particle.age = 0

    // 设置大小
    const sizeVariance = this.config.size * this.config.sizeVariance
    const baseSize = this.config.size + (Math.random() - 0.5) * sizeVariance
    particle.size = baseSize
    particle.startSize = baseSize
    particle.endSize = baseSize * 0.1 // 结束时缩小

    // 设置颜色
    const colorVariance = this.config.colorVariance
    particle.startColor.setRGB(
      Math.max(0, Math.min(1, this.config.startColor.r + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.startColor.g + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.startColor.b + (Math.random() - 0.5) * colorVariance))
    )

    particle.endColor.setRGB(
      Math.max(0, Math.min(1, this.config.endColor.r + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.endColor.g + (Math.random() - 0.5) * colorVariance)),
      Math.max(0, Math.min(1, this.config.endColor.b + (Math.random() - 0.5) * colorVariance))
    )

    particle.color.copy(particle.startColor)

    // 设置透明度
    particle.opacity = this.config.startOpacity
    particle.startOpacity = this.config.startOpacity
    particle.endOpacity = this.config.endOpacity

    // 设置行为模式
    particle.behavior = this.config.behavior
    particle.rotationSpeed = this.config.rotationSpeed + (Math.random() - 0.5) * 0.5

    // 设置轨迹
    particle.trail = []
    particle.maxTrailLength = this.config.maxTrailLength

    // 设置吸引子和轨道参数
    particle.attractor.copy(this.config.attractor)
    particle.orbitRadius = this.config.orbitRadius + (Math.random() - 0.5) * 0.5
    particle.orbitSpeed = this.config.orbitSpeed + (Math.random() - 0.5) * 0.5
    particle.orbitAngle = Math.random() * Math.PI * 2

    // 设置增强的粒子属性
    particle.birthTime = Date.now()
    particle.startGlowIntensity = this.config.startGlowIntensity || 1
    particle.endGlowIntensity = this.config.endGlowIntensity || 0
    particle.spinSpeed = (this.config.spinSpeed || 0) + (Math.random() - 0.5) * 0.5
    particle.glowIntensity = particle.startGlowIntensity

    particle.active = true
    this.particles.push(particle)
  }

  /**
   * 更新粒子系统
   */
  update(deltaTime: number): void {
    // 发射新粒子
    this.emissionTimer += deltaTime
    const emissionInterval = 1 / this.config.rate

    while (this.emissionTimer >= emissionInterval) {
      this.emit()
      this.emissionTimer -= emissionInterval
    }

    // 更新现有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]

      // 应用重力
      particle.applyForce(this.config.gravity)

      // 更新粒子
      particle.update(deltaTime)

      // 移除死亡粒子
      if (!particle.active) {
        this.particlePool.release(particle)
        this.particles.splice(i, 1)
      }
    }

    // 更新粒子连接
    if (this.config.connectionConfig?.enabled) {
      this.updateParticleConnections()
    }
  }

  /**
   * 更新粒子连接
   */
  private updateParticleConnections(): void {
    const connectionConfig = this.config.connectionConfig
    if (!connectionConfig) return

    const positions = []
    const colors = []

    // 遍历所有粒子对，计算连接
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i]

      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j]

        // 计算粒子间距离
        const distance = particleA.position.distanceTo(particleB.position)

        // 检查距离是否在连接范围内
        if (distance >= connectionConfig.minDistance && distance <= connectionConfig.maxDistance) {
          // 计算连接权重
          const weight =
            1 -
            (distance - connectionConfig.minDistance) /
              (connectionConfig.maxDistance - connectionConfig.minDistance)

          // 更新粒子的连接权重
          particleA.updateConnectionWeight(j, weight)
          particleB.updateConnectionWeight(i, weight)

          // 计算连接颜色和透明度
          const alpha = connectionConfig.fadeOut
            ? weight * connectionConfig.opacity
            : connectionConfig.opacity

          // 只添加权重超过阈值的连接
          if (weight > 0.1) {
            // 粒子A到粒子B的连接
            positions.push(particleA.position.x, particleA.position.y, particleA.position.z)
            positions.push(particleB.position.x, particleB.position.y, particleB.position.z)

            // 使用粒子颜色的混合色
            const mixedColor = new THREE.Color()
            mixedColor.lerpColors(particleA.color, particleB.color, 0.5)

            // 添加颜色信息（包含透明度）
            colors.push(mixedColor.r, mixedColor.g, mixedColor.b, alpha)
            colors.push(mixedColor.r, mixedColor.g, mixedColor.b, alpha)
          }
        }
      }
    }

    // 更新连接线条的几何体
    const geometry = this.connectionLines.geometry as THREE.BufferGeometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true

    // 更新材质
    const material = this.connectionLines.material as THREE.LineBasicMaterial
    material.opacity = connectionConfig.opacity
    material.color = connectionConfig.color
    material.linewidth = connectionConfig.lineWidth
  }

  /**
   * 获取粒子数据用于渲染
   */
  getParticleData(): ParticleSystemData {
    const count = this.particles.length
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const opacities = new Float32Array(count)
    const lifetimes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const particle = this.particles[i]
      const i3 = i * 3

      positions[i3] = particle.position.x
      positions[i3 + 1] = particle.position.y
      positions[i3 + 2] = particle.position.z

      velocities[i3] = particle.velocity.x
      velocities[i3 + 1] = particle.velocity.y
      velocities[i3 + 2] = particle.velocity.z

      colors[i3] = particle.color.r
      colors[i3 + 1] = particle.color.g
      colors[i3 + 2] = particle.color.b

      sizes[i] = particle.size
      opacities[i] = particle.opacity
      lifetimes[i] = particle.age / particle.lifetime
    }

    return {
      positions,
      velocities,
      colors,
      sizes,
      opacities,
      lifetimes,
      count
    }
  }

  /**
   * 更新发射器配置
   */
  updateConfig(config: Partial<EmitterConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 清除所有粒子
   */
  clear(): void {
    this.particles.forEach(p => this.particlePool.release(p))
    this.particles = []
  }

  /**
   * 获取活跃粒子数
   */
  getActiveCount(): number {
    return this.particles.length
  }
}

/**
 * 粒子系统管理器
 */
export class ParticleSystemManager {
  private emitters: Map<string, ParticleEmitter> = new Map()
  private scene: THREE.Scene
  private particleMeshes: Map<string, THREE.Points> = new Map()
  private particleCount: number = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * 添加发射器
   */
  addEmitter(id: string, config: Partial<EmitterConfig>, maxParticles?: number): ParticleEmitter {
    const emitter = new ParticleEmitter(config, maxParticles)
    this.emitters.set(id, emitter)

    // 添加粒子连接线条到场景
    if (emitter['connectionLines']) {
      this.scene.add(emitter['connectionLines'])
    }

    return emitter
  }

  /**
   * 移除发射器
   */
  removeEmitter(id: string): void {
    const emitter = this.emitters.get(id)
    if (emitter) {
      emitter.clear()

      // 移除粒子连接线条
      if (emitter['connectionLines']) {
        this.scene.remove(emitter['connectionLines'])
        emitter['connectionLines'].geometry.dispose()
        const material = emitter['connectionLines'].material as THREE.Material
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose())
        } else {
          material.dispose()
        }
      }

      this.emitters.delete(id)
    }

    const mesh = this.particleMeshes.get(id)
    if (mesh) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material.dispose()
      }
      this.particleMeshes.delete(id)
    }
  }

  /**
   * 更新所有发射器 - 优化版本
   */
  update(deltaTime: number): void {
    const totalParticles = this.getTotalParticleCount()

    // 优化：根据总粒子数动态调整更新频率
    const updateFrequency = this.getUpdateFrequency(totalParticles)

    this.emitters.forEach((emitter, id) => {
      // 优化：基于发射器的活跃粒子数调整更新频率
      const emitterParticles = emitter.getActiveCount()
      const emitterUpdateRate = this.getEmitterUpdateRate(emitterParticles)

      if (Math.random() < emitterUpdateRate * updateFrequency) {
        emitter.update(deltaTime)
        this.updateParticleMesh(id, emitter)
      }
    })

    // 优化：减少总粒子数更新频率
    if (Math.random() < 0.1) {
      this.updateTotalParticleCount()
    }
  }

  /**
   * 根据总粒子数获取更新频率
   */
  private getUpdateFrequency(totalParticles: number): number {
    if (totalParticles > 5000) {
      return 0.5 // 高粒子数，降低更新频率
    } else if (totalParticles > 2000) {
      return 0.7 // 中高粒子数，降低更新频率
    } else if (totalParticles > 1000) {
      return 0.9 // 中粒子数，接近正常更新频率
    } else {
      return 1.0 // 低粒子数，正常更新频率
    }
  }

  /**
   * 根据发射器粒子数获取更新频率
   */
  private getEmitterUpdateRate(particleCount: number): number {
    if (particleCount > 1000) {
      return 0.6 // 高粒子数发射器，降低更新频率
    } else if (particleCount > 500) {
      return 0.8 // 中高粒子数发射器，降低更新频率
    } else {
      return 1.0 // 低粒子数发射器，正常更新频率
    }
  }

  /**
   * 更新粒子网格 - 优化版本
   */
  private updateParticleMesh(id: string, emitter: ParticleEmitter): void {
    const data = emitter.getParticleData()
    const emitterConfig = (emitter as any).config

    let mesh = this.particleMeshes.get(id)

    if (!mesh) {
      // 创建新网格
      const geometry = new THREE.BufferGeometry()

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
      })

      mesh = new THREE.Points(geometry, material)
      this.scene.add(mesh)
      this.particleMeshes.set(id, mesh)
    }

    // 优化：只在粒子数量变化时更新几何体
    const geometry = mesh.geometry as THREE.BufferGeometry
    const currentCount = geometry.attributes.position?.count || 0

    if (currentCount !== data.count) {
      // 复用现有属性或创建新属性
      this.updateBufferAttribute(geometry, 'position', data.positions, 3)
      this.updateBufferAttribute(geometry, 'color', data.colors, 3)
      this.updateBufferAttribute(geometry, 'size', data.sizes, 1)
      this.updateBufferAttribute(geometry, 'opacity', data.opacities, 1)
    } else {
      // 优化：只更新必要的属性
      this.updateBufferAttributeOptimized(geometry, 'position', data.positions, 3)

      // 颜色、大小和透明度每0.1秒更新一次
      if (Math.random() < 0.1) {
        this.updateBufferAttributeOptimized(geometry, 'color', data.colors, 3)
        this.updateBufferAttributeOptimized(geometry, 'size', data.sizes, 1)
        this.updateBufferAttributeOptimized(geometry, 'opacity', data.opacities, 1)
      }
    }
  }

  /**
   * 更新BufferAttribute，复用现有属性或创建新属性 - 优化版本
   */
  private updateBufferAttribute(
    geometry: THREE.BufferGeometry,
    name: string,
    data: Float32Array,
    itemSize: number
  ): void {
    let attribute = geometry.attributes[name] as THREE.BufferAttribute

    if (!attribute || attribute.array.length !== data.length) {
      // 创建新属性
      attribute = new THREE.BufferAttribute(data, itemSize)
      geometry.setAttribute(name, attribute)
    } else {
      // 复用现有属性，更新数据
      const array = attribute.array as Float32Array
      if (array.length === data.length) {
        array.set(data)
        attribute.needsUpdate = true
      } else {
        attribute = new THREE.BufferAttribute(data, itemSize)
        geometry.setAttribute(name, attribute)
      }
    }
  }

  /**
   * 优化的BufferAttribute更新方法 - 只更新必要的数据
   */
  private updateBufferAttributeOptimized(
    geometry: THREE.BufferGeometry,
    name: string,
    data: Float32Array,
    itemSize: number
  ): void {
    const attribute = geometry.attributes[name] as THREE.BufferAttribute
    if (!attribute) return

    const array = attribute.array as Float32Array
    if (array.length !== data.length) return

    // 优化：只更新可见区域的粒子数据
    // 简单实现：随机更新部分数据，减少每帧的数据传输量
    const updateRatio = Math.min(1.0, 5000 / array.length)

    if (updateRatio < 1.0) {
      // 只更新部分粒子
      const updateCount = Math.floor(array.length * updateRatio)
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * data.length)
        array[index] = data[index]
      }
    } else {
      // 更新所有粒子
      array.set(data)
    }

    attribute.needsUpdate = true
  }

  /**
   * 更新总粒子数
   */
  private updateTotalParticleCount(): void {
    this.particleCount = 0
    this.emitters.forEach(emitter => {
      this.particleCount += emitter.getActiveCount()
    })
  }

  /**
   * 获取发射器
   */
  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id)
  }

  /**
   * 清除所有发射器
   */
  clear(): void {
    this.emitters.forEach((_, id) => this.removeEmitter(id))
  }

  /**
   * 获取总粒子数
   */
  getTotalParticleCount(): number {
    return this.particleCount
  }
}
