import * as THREE from 'three'
import { GPUParticleSystem, GPUParticleSystemConfig } from './GPUParticleSystem'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

/**
 * 高级粒子系统配置
 */
export interface AdvancedParticleSystemConfig {
  // 基础配置
  name: string
  maxParticles: number
  position: THREE.Vector3
  rate: number
  lifetime: number
  lifetimeVariance: number
  velocity: THREE.Vector3
  velocityVariance: number
  size: number
  sizeVariance: number
  color: THREE.Color
  colorVariance: number
  spread: number
  gravity: THREE.Vector3
  turbulence: number
  damping: number
  startSize: number
  endSize: number
  startColor: THREE.Color
  endColor: THREE.Color

  // 高级效果配置
  glowEffect?: boolean
  glowColor?: THREE.Color
  glowIntensity?: number
  useLightSources?: boolean
  lightColor?: THREE.Color
  lightIntensity?: number
  
  // 高级物理模拟
  fluidSimulation?: boolean
  fluidDensity?: number
  fluidViscosity?: number
  magneticField?: boolean
  magneticStrength?: number
  magneticDirection?: THREE.Vector3
  
  // 高级行为
  useAdvancedBehaviors?: boolean
  behaviorType?: 'spiral' | 'vortex' | 'tornado' | 'swarm' | 'attractor' | 'repulsor' | 'wave' | 'fractal'
  behaviorStrength?: number
  behaviorDirection?: THREE.Vector3
  behaviorTarget?: THREE.Vector3
  
  // 形状控制
  particleShape?: 'sphere' | 'cube' | 'triangle' | 'star' | 'hexagon' | 'custom'
  shapeScale?: number
  
  // 视觉效果
  blendingMode?: THREE.Blending
  depthWrite?: boolean
  transparent?: boolean
  opacity?: number
  
  // 材质配置
  materialType?: 'standard' | 'basic' | 'physical' | 'shader'
  useCustomShader?: boolean
  shader?: THREE.ShaderMaterial
  
  // 性能优化
  levelOfDetail?: number
  maxLODParticles?: number
  useDistanceCulling?: boolean
  cullingDistance?: number
}

/**
 * 高级粒子系统统计信息
 */
export interface AdvancedParticleSystemStats {
  // 基础统计信息
  particleCount: number
  maxParticles: number
  emissionRate: number
  inactiveParticles: number
  memoryUsage: number
  averageLifetime: number
  fps: number
  updateTime: number
  
  // 高级统计信息
  activeEffects: string[]
  currentBehavior: string
  effectIntensity: number
  lodLevel: number
  culledParticles: number
  shaderComplexity: number
  blendingMode: string
  shapeType: string
}

/**
 * 高级粒子系统事件
 */
export enum AdvancedParticleSystemEvent {
  SYSTEM_CREATED = 'system-created',
  SYSTEM_UPDATED = 'system-updated',
  SYSTEM_DISPOSED = 'system-disposed',
  EFFECT_ENABLED = 'effect-enabled',
  EFFECT_DISABLED = 'effect-disabled',
  BEHAVIOR_CHANGED = 'behavior-changed',
  LOD_CHANGED = 'lod-changed'
}

/**
 * 高级粒子系统
 */
export class AdvancedParticleSystem {
  private config: AdvancedParticleSystemConfig
  private scene: THREE.Scene
  private gpuParticleSystem: GPUParticleSystem
  private particleShape: THREE.BufferGeometry
  private particleMaterial: THREE.Material
  private advancedMesh: THREE.Points
  private activeEffects: string[] = []
  private currentBehavior: string = 'normal'
  private lodLevel: number = 0
  private lastUpdateTime: number = 0
  private stats: AdvancedParticleSystemStats = {
    particleCount: 0,
    maxParticles: 0,
    emissionRate: 0,
    inactiveParticles: 0,
    memoryUsage: 0,
    averageLifetime: 0,
    fps: 0,
    updateTime: 0,
    activeEffects: [],
    currentBehavior: 'normal',
    effectIntensity: 1.0,
    lodLevel: 0,
    culledParticles: 0,
    shaderComplexity: 0,
    blendingMode: 'additive',
    shapeType: 'sphere'
  }
  
  // 粒子形状生成器
  private createParticleShape(shapeType: string, scale: number): THREE.BufferGeometry {
    let geometry: THREE.BufferGeometry
    
    switch (shapeType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(scale * 0.01, 8, 6)
        break
      case 'cube':
        geometry = new THREE.BoxGeometry(scale * 0.02, scale * 0.02, scale * 0.02)
        break
      case 'triangle':
        geometry = new THREE.BufferGeometry()
        const triangleVertices = new Float32Array([
          0, scale * 0.03, 0,
          -scale * 0.015, -scale * 0.015, 0,
          scale * 0.015, -scale * 0.015, 0
        ])
        geometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3))
        geometry.computeVertexNormals()
        break
      case 'star':
        geometry = new THREE.BufferGeometry()
        const starVertices = []
        const points = 10
        const radius = scale * 0.02
        const innerRadius = radius * 0.4
        
        for (let i = 0; i < points * 2; i++) {
          const angle = (i / (points * 2)) * Math.PI * 2
          const r = (i % 2 === 0) ? radius : innerRadius
          starVertices.push(Math.cos(angle) * r, Math.sin(angle) * r, 0)
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starVertices), 3))
        geometry.setIndex([...Array(points * 2).keys()])
        geometry.computeVertexNormals()
        break
      case 'hexagon':
        geometry = new THREE.BufferGeometry()
        const hexagonVertices = []
        const hexPoints = 6
        const hexRadius = scale * 0.02
        
        for (let i = 0; i < hexPoints; i++) {
          const angle = (i / hexPoints) * Math.PI * 2
          hexagonVertices.push(Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius, 0)
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hexagonVertices), 3))
        geometry.setIndex([...Array(hexPoints).keys()])
        geometry.computeVertexNormals()
        break
      default:
        geometry = new THREE.SphereGeometry(scale * 0.01, 8, 6)
    }
    
    return geometry
  }
  
  // 创建高级材质
  private createAdvancedMaterial(): THREE.Material {
    const config = this.config
    
    if (config.useCustomShader && config.shader) {
      return config.shader
    }
    
    switch (config.materialType) {
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          color: config.color,
          roughness: 0.2,
          metalness: 0.5,
          transmission: 0.8,
          ior: 1.5,
          transparent: true,
          opacity: config.opacity || 0.8,
          depthWrite: config.depthWrite !== false,
          blending: config.blendingMode || THREE.AdditiveBlending
        })
      
      case 'standard':
        return new THREE.MeshStandardMaterial({
          color: config.color,
          roughness: 0.2,
          metalness: 0.3,
          emissive: config.glowColor || new THREE.Color(0x3333ff),
          emissiveIntensity: config.glowIntensity || 0.5,
          transparent: true,
          opacity: config.opacity || 0.8,
          depthWrite: config.depthWrite !== false,
          blending: config.blendingMode || THREE.AdditiveBlending
        })
      
      default:
        return new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: config.opacity || 0.8,
          depthWrite: config.depthWrite !== false,
          blending: config.blendingMode || THREE.AdditiveBlending
        })
    }
  }
  
  // 应用粒子行为
  private applyParticleBehavior(deltaTime: number): void {
    const config = this.config
    const behaviorType = config.behaviorType || 'normal'
    
    if (behaviorType === 'normal' || !config.useAdvancedBehaviors) return
    
    // 获取所有粒子位置
    const positions = this.gpuParticleSystem.getParticlePositions()
    
    if (!positions || positions.length === 0) return
    
    const strength = config.behaviorStrength || 1.0
    const direction = config.behaviorDirection || new THREE.Vector3(0, 1, 0)
    const target = config.behaviorTarget || new THREE.Vector3(0, 0, 0)
    
    switch (behaviorType) {
      case 'spiral':
        this.applySpiralBehavior(positions, strength, direction, deltaTime)
        break
      
      case 'vortex':
        this.applyVortexBehavior(positions, strength, target, deltaTime)
        break
      
      case 'tornado':
        this.applyTornadoBehavior(positions, strength, target, deltaTime)
        break
      
      case 'swarm':
        this.applySwarmBehavior(positions, strength, deltaTime)
        break
      
      case 'attractor':
        this.applyAttractorBehavior(positions, strength, target, deltaTime)
        break
      
      case 'repulsor':
        this.applyRepulsorBehavior(positions, strength, target, deltaTime)
        break
      
      case 'wave':
        this.applyWaveBehavior(positions, strength, direction, deltaTime)
        break
      
      case 'fractal':
        this.applyFractalBehavior(positions, strength, deltaTime)
        break
    }
  }
  
  // 应用螺旋行为
  private applySpiralBehavior(positions: Float32Array, strength: number, direction: THREE.Vector3, deltaTime: number): void {
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算到中心轴的距离
      const centerAxis = direction.clone().normalize()
      const distanceFromAxis = pos.clone().sub(centerAxis.clone().multiplyScalar(pos.dot(centerAxis)))
      
      // 计算螺旋角度
      const angle = Math.atan2(distanceFromAxis.y, distanceFromAxis.x) + deltaTime * strength
      
      // 计算新的位置
      const radius = distanceFromAxis.length()
      const newPos = centerAxis.clone().multiplyScalar(pos.dot(centerAxis))
      newPos.add(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ))
      
      positions[i] = newPos.x
      positions[i+1] = newPos.y
      positions[i+2] = newPos.z
    }
  }
  
  // 应用漩涡行为
  private applyVortexBehavior(positions: Float32Array, strength: number, target: THREE.Vector3, deltaTime: number): void {
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算到目标点的向量
      const toTarget = target.clone().sub(pos)
      const distance = toTarget.length()
      
      if (distance > 0.01) {
        // 计算垂直向量
        const perpendicular = new THREE.Vector3(-toTarget.y, toTarget.x, 0).normalize()
        
        // 应用旋转力
        const rotation = perpendicular.multiplyScalar(strength / (1 + distance * distance))
        pos.add(rotation.multiplyScalar(deltaTime))
        
        positions[i] = pos.x
        positions[i+1] = pos.y
        positions[i+2] = pos.z
      }
    }
  }
  
  // 应用龙卷风行为
  private applyTornadoBehavior(positions: Float32Array, strength: number, target: THREE.Vector3, deltaTime: number): void {
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算到目标点的向量
      const toTarget = target.clone().sub(pos)
      const distance = toTarget.length()
      
      if (distance > 0.01) {
        // 垂直向上的分量
        const upward = new THREE.Vector3(0, 1, 0).multiplyScalar(strength * 0.5)
        
        // 水平旋转分量
        const perpendicular = new THREE.Vector3(-toTarget.y, toTarget.x, 0).normalize()
        const horizontal = perpendicular.multiplyScalar(strength / (1 + distance))
        
        // 向心分量
        const centripetal = toTarget.normalize().multiplyScalar(-strength * 0.2)
        
        // 合成所有力
        const force = upward.add(horizontal).add(centripetal)
        pos.add(force.multiplyScalar(deltaTime))
        
        positions[i] = pos.x
        positions[i+1] = pos.y
        positions[i+2] = pos.z
      }
    }
  }
  
  // 应用群体行为
  private applySwarmBehavior(positions: Float32Array, strength: number, deltaTime: number): void {
    const center = new THREE.Vector3()
    const velocitySum = new THREE.Vector3()
    
    // 计算群体中心和速度总和
    for (let i = 0; i < positions.length; i += 3) {
      center.add(new THREE.Vector3(positions[i], positions[i+1], positions[i+2]))
    }
    
    center.divideScalar(positions.length / 3)
    
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 聚集到群体中心
      const toCenter = center.clone().sub(pos)
      
      // 添加一些随机性
      const randomForce = new THREE.Vector3(
        (Math.random() - 0.5) * strength,
        (Math.random() - 0.5) * strength,
        (Math.random() - 0.5) * strength
      )
      
      const force = toCenter.normalize().multiplyScalar(strength * 0.1).add(randomForce)
      pos.add(force.multiplyScalar(deltaTime))
      
      positions[i] = pos.x
      positions[i+1] = pos.y
      positions[i+2] = pos.z
    }
  }
  
  // 应用吸引力行为
  private applyAttractorBehavior(positions: Float32Array, strength: number, target: THREE.Vector3, deltaTime: number): void {
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算到目标点的向量
      const toTarget = target.clone().sub(pos)
      const distance = toTarget.length()
      
      if (distance > 0.01) {
        // 距离越近，引力越大（平方反比定律）
        const force = toTarget.normalize().multiplyScalar(strength / (1 + distance * distance))
        pos.add(force.multiplyScalar(deltaTime))
        
        positions[i] = pos.x
        positions[i+1] = pos.y
        positions[i+2] = pos.z
      }
    }
  }
  
  // 应用排斥力行为
  private applyRepulsorBehavior(positions: Float32Array, strength: number, target: THREE.Vector3, deltaTime: number): void {
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算到目标点的向量
      const toTarget = target.clone().sub(pos)
      const distance = toTarget.length()
      
      if (distance > 0.01) {
        // 距离越近，排斥力越大（平方反比定律）
        const force = toTarget.normalize().multiplyScalar(-strength / (1 + distance * distance))
        pos.add(force.multiplyScalar(deltaTime))
        
        positions[i] = pos.x
        positions[i+1] = pos.y
        positions[i+2] = pos.z
      }
    }
  }
  
  // 应用波动行为
  private applyWaveBehavior(positions: Float32Array, strength: number, direction: THREE.Vector3, deltaTime: number): void {
    const time = performance.now() * 0.001
    const waveDir = direction.clone().normalize()
    
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 计算波幅
      const distanceFromOrigin = pos.length()
      const wave = Math.sin(distanceFromOrigin * 0.5 - time * 2) * strength * 0.2
      
      // 沿波的方向移动
      pos.add(waveDir.clone().multiplyScalar(wave))
      
      positions[i] = pos.x
      positions[i+1] = pos.y
      positions[i+2] = pos.z
    }
  }
  
  // 应用分形行为
  private applyFractalBehavior(positions: Float32Array, strength: number, deltaTime: number): void {
    const time = performance.now() * 0.001
    
    for (let i = 0; i < positions.length; i += 3) {
      const pos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2])
      
      // 简化的分形运动（使用正弦和余弦的组合）
      const fractalX = Math.sin(pos.x * 0.5 + time) * Math.cos(pos.y * 0.3 - time * 0.5)
      const fractalY = Math.cos(pos.y * 0.5 + time) * Math.sin(pos.z * 0.3 + time * 0.5)
      const fractalZ = Math.sin(pos.z * 0.5 - time) * Math.cos(pos.x * 0.3 + time * 0.5)
      
      const fractalForce = new THREE.Vector3(fractalX, fractalY, fractalZ).multiplyScalar(strength * 0.1)
      pos.add(fractalForce.multiplyScalar(deltaTime))
      
      positions[i] = pos.x
      positions[i+1] = pos.y
      positions[i+2] = pos.z
    }
  }
  
  // 应用LOD系统
  private applyLODSystem(camera: THREE.Camera): void {
    if (!this.config.levelOfDetail) return
    
    const config = this.config
    const distance = camera.position.distanceTo(this.config.position)
    
    // 根据距离计算LOD级别
    let newLODLevel = 0
    if (distance > config.cullingDistance || this.stats.particleCount > config.maxLODParticles) {
      newLODLevel = 3 // 最远或粒子太多，使用最低细节
    } else if (distance > config.cullingDistance * 0.5) {
      newLODLevel = 2 // 中等距离，使用中等细节
    } else if (distance > config.cullingDistance * 0.25) {
      newLODLevel = 1 // 较近距离，使用较高细节
    } else {
      newLODLevel = 0 // 非常近距离，使用最高细节
    }
    
    // 如果LOD级别发生变化，更新粒子系统
    if (newLODLevel !== this.lodLevel) {
      this.lodLevel = newLODLevel
      eventSystem.emit(AdvancedParticleSystemEvent.LOD_CHANGED, {
        id: this.config.name,
        oldLevel: this.lodLevel,
        newLevel: newLODLevel
      })
      
      // 根据LOD级别调整粒子数量和发射率
      const lodFactor = 1 / (this.lodLevel + 1)
      this.gpuParticleSystem.setEmissionRate(this.config.rate * lodFactor)
      this.gpuParticleSystem.setMaxParticles(Math.floor(this.config.maxParticles * lodFactor))
      
      // 调整视觉效果强度
      this.stats.effectIntensity = lodFactor
    }
  }
  
  // 构造函数
  constructor(scene: THREE.Scene, config: AdvancedParticleSystemConfig) {
    this.config = config
    this.scene = scene
    
    // 创建基础GPU粒子系统
    const baseConfig: GPUParticleSystemConfig = {
      maxParticles: config.maxParticles,
      position: config.position,
      rate: config.rate,
      lifetime: config.lifetime,
      lifetimeVariance: config.lifetimeVariance,
      velocity: config.velocity,
      velocityVariance: config.velocityVariance,
      size: config.size,
      sizeVariance: config.sizeVariance,
      color: config.color,
      colorVariance: config.colorVariance,
      spread: config.spread,
      gravity: config.gravity,
      turbulence: config.turbulence,
      damping: config.damping,
      startSize: config.startSize,
      endSize: config.endSize,
      startColor: config.startColor,
      endColor: config.endColor
    }
    
    this.gpuParticleSystem = new GPUParticleSystem(scene, baseConfig)
    
    // 创建粒子形状
    this.particleShape = this.createParticleShape(
      config.particleShape || 'sphere',
      config.shapeScale || 1.0
    )
    
    // 创建粒子材质
    this.particleMaterial = this.createAdvancedMaterial()
    
    // 创建高级粒子网格
    this.advancedMesh = new THREE.Points(this.particleShape, this.particleMaterial)
    
    // 设置粒子行为
    if (config.useAdvancedBehaviors && config.behaviorType) {
      this.currentBehavior = config.behaviorType
    }
    
    // 添加到场景
    this.scene.add(this.advancedMesh)
    
    // 初始化统计信息
    this.stats.maxParticles = config.maxParticles
    this.stats.emissionRate = config.rate
    this.stats.shapeType = config.particleShape || 'sphere'
    this.stats.blendingMode = config.blendingMode ? 
      (config.blendingMode === THREE.AdditiveBlending ? 'additive' : 'normal') : 'additive'
    
    // 发布粒子系统创建事件
    eventSystem.emit(AdvancedParticleSystemEvent.SYSTEM_CREATED, {
      id: config.name,
      config: config
    })
  }
  
  // 更新粒子系统
  public update(deltaTime: number, camera: THREE.Camera): void {
    // 更新最后更新时间
    this.lastUpdateTime = performance.now()
    
    // 更新基础GPU粒子系统
    this.gpuParticleSystem.update(deltaTime)
    
    // 应用LOD系统
    this.applyLODSystem(camera)
    
    // 应用高级粒子行为
    this.applyParticleBehavior(deltaTime)
    
    // 更新统计信息
    const startTime = performance.now()
    const particleStats = this.gpuParticleSystem.getStats()
    
    this.stats.particleCount = particleStats.particleCount
    this.stats.inactiveParticles = particleStats.inactiveParticles
    this.stats.memoryUsage = particleStats.memoryUsage
    this.stats.averageLifetime = particleStats.averageLifetime
    this.stats.currentBehavior = this.currentBehavior
    this.stats.lodLevel = this.lodLevel
    this.stats.updateTime = performance.now() - startTime
    
    // 计算FPS
    const now = performance.now()
    if (this.lastUpdateTime > 0) {
      const delta = now - this.lastUpdateTime
      this.stats.fps = delta > 0 ? 1000 / delta : 60
    }
    
    // 发布粒子系统更新事件
    eventSystem.emit(AdvancedParticleSystemEvent.SYSTEM_UPDATED, {
      id: this.config.name,
      stats: this.stats
    })
  }
  
  // 启用效果
  public enableEffect(effectName: string, options?: any): void {
    if (this.activeEffects.includes(effectName)) return
    
    this.activeEffects.push(effectName)
    
    switch (effectName) {
      case 'glow':
        if (this.particleMaterial instanceof THREE.MeshBasicMaterial) {
          this.particleMaterial.blending = THREE.AdditiveBlending
        }
        break
      
      case 'fluid':
        if (this.particleMaterial instanceof THREE.MeshPhysicalMaterial) {
          this.particleMaterial.transmission = 0.9
          this.particleMaterial.roughness = 0.1
          this.particleMaterial.metalness = 0.1
        }
        break
      
      case 'magnetic':
        // 磁场效果已在applyParticleBehavior中实现
        break
    }
    
    // 发布效果启用事件
    eventSystem.emit(AdvancedParticleSystemEvent.EFFECT_ENABLED, {
      id: this.config.name,
      effectName: effectName,
      options: options
    })
  }
  
  // 禁用效果
  public disableEffect(effectName: string): void {
    const index = this.activeEffects.indexOf(effectName)
    if (index === -1) return
    
    this.activeEffects.splice(index, 1)
    
    switch (effectName) {
      case 'glow':
        if (this.particleMaterial instanceof THREE.MeshBasicMaterial) {
          this.particleMaterial.blending = THREE.NormalBlending
        }
        break
      
      case 'fluid':
        if (this.particleMaterial instanceof THREE.MeshPhysicalMaterial) {
          this.particleMaterial.transmission = 0.0
        }
        break
    }
    
    // 发布效果禁用事件
    eventSystem.emit(AdvancedParticleSystemEvent.EFFECT_DISABLED, {
      id: this.config.name,
      effectName: effectName
    })
  }
  
  // 更改粒子行为
  public changeBehavior(behaviorType: string, options?: any): void {
    if (this.currentBehavior === behaviorType) return
    
    this.currentBehavior = behaviorType
    this.config.behaviorType = behaviorType as any
    
    if (options) {
      if (options.strength !== undefined) this.config.behaviorStrength = options.strength
      if (options.direction) this.config.behaviorDirection = new THREE.Vector3().copy(options.direction)
      if (options.target) this.config.behaviorTarget = new THREE.Vector3().copy(options.target)
    }
    
    // 发布行为更改事件
    eventSystem.emit(AdvancedParticleSystemEvent.BEHAVIOR_CHANGED, {
      id: this.config.name,
      oldBehavior: this.currentBehavior,
      newBehavior: behaviorType,
      options: options
    })
  }
  
  // 设置位置
  public setPosition(position: THREE.Vector3): void {
    this.config.position.copy(position)
    this.gpuParticleSystem.setPosition(position)
  }
  
  // 设置发射率
  public setEmissionRate(rate: number): void {
    this.config.rate = rate
    this.gpuParticleSystem.setEmissionRate(rate)
    this.stats.emissionRate = rate
  }
  
  // 获取统计信息
  public getStats(): AdvancedParticleSystemStats {
    return { ...this.stats }
  }
  
  // 获取粒子系统
  public getParticleSystem(): GPUParticleSystem {
    return this.gpuParticleSystem
  }
  
  // 暂停/恢复
  public pause(): void {
    this.gpuParticleSystem.pause()
  }
  
  public resume(): void {
    this.gpuParticleSystem.resume()
  }
  
  // 释放资源
  public dispose(): void {
    // 释放GPU粒子系统
    this.gpuParticleSystem.dispose()
    
    // 释放几何体和材质
    this.particleShape.dispose()
    
    if (this.particleMaterial instanceof THREE.Material) {
      this.particleMaterial.dispose()
    }
    
    // 从场景中移除
    this.scene.remove(this.advancedMesh)
    
    // 发布粒子系统释放事件
    eventSystem.emit(AdvancedParticleSystemEvent.SYSTEM_DISPOSED, {
      id: this.config.name
    })
  }
}

/**
 * 高级粒子系统管理器
 */
export class AdvancedParticleSystemManager {
  private scene: THREE.Scene
  private systems: Map<string, AdvancedParticleSystem> = new Map()
  private active: boolean = true
  
  constructor(scene: THREE.Scene) {
    this.scene = scene
  }
  
  // 创建高级粒子系统
  public createSystem(config: AdvancedParticleSystemConfig): AdvancedParticleSystem {
    const system = new AdvancedParticleSystem(this.scene, config)
    this.systems.set(config.name, system)
    return system
  }
  
  // 获取粒子系统
  public getSystem(name: string): AdvancedParticleSystem | undefined {
    return this.systems.get(name)
  }
  
  // 移除粒子系统
  public removeSystem(name: string): void {
    const system = this.systems.get(name)
    if (system) {
      system.dispose()
      this.systems.delete(name)
    }
  }
  
  // 更新所有粒子系统
  public update(deltaTime: number, camera: THREE.Camera): void {
    if (!this.active) return
    
    this.systems.forEach(system => {
      system.update(deltaTime, camera)
    })
  }
  
  // 暂停/恢复所有粒子系统
  public pause(): void {
    this.active = false
    this.systems.forEach(system => {
      system.pause()
    })
  }
  
  public resume(): void {
    this.active = true
    this.systems.forEach(system => {
      system.resume()
    })
  }
  
  // 释放所有资源
  public dispose(): void {
    this.systems.forEach(system => {
      system.dispose()
    })
    this.systems.clear()
  }
}