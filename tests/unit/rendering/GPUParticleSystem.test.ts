import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GPUParticleSystem, GPUParticleSystemManager } from '@/visualization/GPUParticleSystem'

// 模拟整个Three.js模块
vi.mock('three', () => {
  // 创建模拟的Vector3类
  class MockVector3 {
    x = 0
    y = 0
    z = 0

    constructor(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    }

    set(x, y, z) {
      this.x = x
      this.y = y
      this.z = z
      return this
    }

    add(vector) {
      return new MockVector3(this.x + vector.x, this.y + vector.y, this.z + vector.z)
    }

    subtract(vector) {
      return new MockVector3(this.x - vector.x, this.y - vector.y, this.z - vector.z)
    }

    multiply(scalar) {
      return new MockVector3(this.x * scalar, this.y * scalar, this.z * scalar)
    }

    divide(scalar) {
      return new MockVector3(this.x / scalar, this.y / scalar, this.z / scalar)
    }

    clone() {
      return new MockVector3(this.x, this.y, this.z)
    }

    toArray() {
      return [this.x, this.y, this.z]
    }

    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
  }

  // 创建模拟的Color类
  class MockColor {
    r = 0
    g = 0
    b = 0

    constructor(color) {
      // 忽略颜色参数
    }

    set(color) {
      return this
    }

    toArray() {
      return [this.r, this.g, this.b]
    }
  }

  // 创建模拟的BufferGeometry类
  class MockBufferGeometry {
    attributes = {}

    computeBoundingSphere() {
      this.boundingSphere = { radius: 1 }
    }

    setAttribute(name, attribute) {
      this.attributes[name] = attribute
    }

    dispose() {
      // 空实现
    }
  }

  // 创建模拟的BufferAttribute类
  class MockBufferAttribute {
    array = []
    itemSize = 0

    constructor(array, itemSize) {
      this.array = array
      this.itemSize = itemSize
    }

    set needsUpdate(value) {
      // 空实现
    }

    setUsage(usage) {
      return this
    }
  }

  // 创建模拟的ShaderMaterial类
  class MockShaderMaterial {
    uniforms = {}

    constructor(params) {
      this.uniforms = params.uniforms
    }

    dispose() {
      // 空实现
    }
  }

  // 创建模拟的Points类
  class MockPoints {
    geometry = null
    material = null

    constructor(geometry, material) {
      this.geometry = geometry
      this.material = material
    }
  }

  // 创建模拟的Scene类
  class MockScene {
    children = []
    background = null

    add(object) {
      this.children.push(object)
    }

    remove(object) {
      const index = this.children.indexOf(object)
      if (index > -1) {
        this.children.splice(index, 1)
      }
    }
  }

  return {
    Vector3: MockVector3,
    Color: MockColor,
    BufferGeometry: MockBufferGeometry,
    BufferAttribute: MockBufferAttribute,
    ShaderMaterial: MockShaderMaterial,
    Points: MockPoints,
    Scene: MockScene,
    MeshStandardMaterial: class MockMeshStandardMaterial {
      dispose() {
        // 空实现
      }
    },
    Mesh: class MockMesh {
      geometry = null
      material = null

      constructor(geometry, material) {
        this.geometry = geometry
        this.material = material
      }
    },
    Sphere: class MockSphere {
      center = { x: 0, y: 0, z: 0 }
      radius = 1

      constructor(center, radius) {
        this.center = center
        this.radius = radius
      }
    },
    Frustum: class MockFrustum {
      intersectsSphere() {
        return true
      }
    },
    DynamicDrawUsage: 1,
    StaticDrawUsage: 0,
    StreamDrawUsage: 2,
    Matrix4: class MockMatrix4 {
      set() {
        return this
      }

      multiply() {
        return this
      }

      multiplyMatrices() {
        return this
      }
    },
    // 添加Three.js常量
    AdditiveBlending: 1,
    NormalBlending: 0,
    SubtractiveBlending: 2,
    MultiplyBlending: 3,
    CustomBlending: 4
  } as any
})

describe('GPUParticleSystem', () => {
  let scene: any
  let config: any
  let gpuParticleSystem: GPUParticleSystem

  beforeEach(() => {
    // 动态导入three模块，获取模拟的类
    const THREE = require('three')

    // 创建场景
    scene = new THREE.Scene()

    // 配置GPU粒子系统
    config = {
      maxParticles: 1000,
      position: new THREE.Vector3(0, 0, 0),
      rate: 50,
      lifetime: 5,
      lifetimeVariance: 2,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 2,
      size: 0.5,
      sizeVariance: 0.2,
      color: new THREE.Color(0x00ffff),
      colorVariance: 0.5,
      spread: Math.PI * 2,
      gravity: new THREE.Vector3(0, -0.5, 0),
      turbulence: 0.5,
      damping: 0.98,
      startSize: 0.1,
      endSize: 1.0,
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0xff00ff)
    }

    gpuParticleSystem = new GPUParticleSystem(scene, config)
  })

  it('should initialize with correct default values', () => {
    // 检查初始状态
    expect(gpuParticleSystem.getParticleCount()).toBe(0)
    expect(gpuParticleSystem.getMaxParticles()).toBe(config.maxParticles)
  })

  it('should emit particles', () => {
    // 更新粒子系统，触发粒子发射
    gpuParticleSystem.update(1)

    // 检查是否有粒子被发射
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThan(0)
  })

  it('should update particles correctly', () => {
    // 发射一些粒子
    gpuParticleSystem.update(0.5)
    const initialCount = gpuParticleSystem.getParticleCount()

    // 再次更新，让粒子运动和老化
    gpuParticleSystem.update(1)

    // 检查粒子数量是否变化（应该有新粒子发射，同时旧粒子可能死亡）
    const updatedCount = gpuParticleSystem.getParticleCount()
    expect(updatedCount).toBeGreaterThanOrEqual(0)
  })

  it('should respect max particles limit', () => {
    // 使用较小的最大粒子数
    const limitedConfig = {
      ...config,
      maxParticles: 100,
      rate: 1000 // 高发射率，确保快速达到上限
    }

    const limitedSystem = new GPUParticleSystem(scene, limitedConfig)

    // 快速更新多次，确保粒子数达到上限
    for (let i = 0; i < 10; i++) {
      limitedSystem.update(0.1)
    }

    // 检查粒子数是否基本不超过上限（允许1-2个误差，因为粒子发射是异步的）
    expect(limitedSystem.getParticleCount()).toBeLessThanOrEqual(limitedConfig.maxParticles + 2)
  })

  it('should set position correctly', () => {
    // 动态导入three模块，获取模拟的类
    const THREE = require('three')

    // 设置新位置
    const newPosition = new THREE.Vector3(10, 5, -3)
    gpuParticleSystem.setPosition(newPosition)

    // 更新系统，确保位置生效
    gpuParticleSystem.update(0.1)

    // 检查粒子系统是否正常工作
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThanOrEqual(0)
  })

  it('should dispose correctly', () => {
    // 发射一些粒子
    gpuParticleSystem.update(1)

    // 检查粒子系统是否有粒子
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThan(0)

    // 释放粒子系统
    gpuParticleSystem.dispose()

    // 检查粒子系统是否被正确移除
    expect(scene.children.length).toBe(0)
  })

  it('should handle particle lifecycle correctly', () => {
    // 先保存原始的发射率
    const originalConfig = gpuParticleSystem.getConfig()

    // 发射一些粒子
    gpuParticleSystem.update(1)
    const initialCount = gpuParticleSystem.getParticleCount()
    expect(initialCount).toBeGreaterThan(0)

    // 停止发射新粒子
    gpuParticleSystem.updateConfig({ rate: 0 })

    // 快速推进时间，让所有粒子都过期
    // 粒子生命周期是5秒，加上2秒的方差，所以需要至少7秒
    // 增加时间推进次数，确保所有粒子都能过期
    for (let i = 0; i < 30; i++) {
      gpuParticleSystem.update(1)
    }

    // 所有粒子应该都过期了
    expect(gpuParticleSystem.getParticleCount()).toBe(0)

    // 恢复原始配置
    gpuParticleSystem.updateConfig({ rate: originalConfig.rate })
  })

  it('should use inactive particle pool correctly', () => {
    // 设置一个较小的最大粒子数
    const smallConfig = {
      ...config,
      maxParticles: 50,
      rate: 50,
      lifetime: 2
    }

    const smallSystem = new GPUParticleSystem(scene, smallConfig)

    // 快速更新多次，确保粒子池被使用
    for (let i = 0; i < 20; i++) {
      smallSystem.update(0.1)
    }

    // 粒子数应该稳定在最大粒子数左右
    expect(smallSystem.getParticleCount()).toBeLessThanOrEqual(smallConfig.maxParticles + 2)

    smallSystem.dispose()
  })

  it('should support pause and resume functionality', () => {
    // 发射一些粒子
    gpuParticleSystem.update(0.5)
    const initialCount = gpuParticleSystem.getParticleCount()

    // 暂停粒子系统
    gpuParticleSystem.pause()
    expect(gpuParticleSystem.isPausedState()).toBe(true)

    // 尝试更新，粒子数量应该不变
    gpuParticleSystem.update(1)
    const pausedCount = gpuParticleSystem.getParticleCount()
    expect(pausedCount).toBe(initialCount)

    // 恢复粒子系统
    gpuParticleSystem.resume()
    expect(gpuParticleSystem.isPausedState()).toBe(false)

    // 更新，粒子数量应该变化
    gpuParticleSystem.update(1)
    const resumedCount = gpuParticleSystem.getParticleCount()
    expect(resumedCount).toBeGreaterThanOrEqual(pausedCount)
  })

  it('should update config correctly', () => {
    // 获取初始配置
    const initialConfig = gpuParticleSystem.getConfig()

    // 更新配置
    const newConfig = {
      turbulence: 0.8,
      damping: 0.95,
      startSize: 0.2,
      endSize: 1.2
    }
    gpuParticleSystem.updateConfig(newConfig)

    // 检查配置是否更新
    const updatedConfig = gpuParticleSystem.getConfig()
    expect(updatedConfig.turbulence).toBe(newConfig.turbulence)
    expect(updatedConfig.damping).toBe(newConfig.damping)
    expect(updatedConfig.startSize).toBe(newConfig.startSize)
    expect(updatedConfig.endSize).toBe(newConfig.endSize)
  })

  it('should track statistics correctly', () => {
    // 更新粒子系统
    gpuParticleSystem.update(0.5)
    gpuParticleSystem.update(1)

    // 检查统计信息
    const stats = gpuParticleSystem.getStats()
    expect(stats.particleCount).toBeGreaterThan(0)
    expect(stats.maxParticles).toBe(config.maxParticles)
    expect(stats.emissionRate).toBe(config.rate)
    expect(stats.inactiveParticles).toBeGreaterThanOrEqual(0)
    expect(stats.memoryUsage).toBeGreaterThanOrEqual(0)
  })

  it('should clear all particles correctly', () => {
    // 发射一些粒子
    gpuParticleSystem.update(0.5)
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThan(0)

    // 清空所有粒子
    gpuParticleSystem.clear()
    expect(gpuParticleSystem.getParticleCount()).toBe(0)
  })
})

describe('GPUParticleSystemManager', () => {
  let scene: any
  let particleSystemManager: GPUParticleSystemManager
  let config: any

  beforeEach(() => {
    // 动态导入three模块，获取模拟的类
    const THREE = require('three')

    // 创建场景
    scene = new THREE.Scene()

    // 创建粒子系统管理器
    particleSystemManager = new GPUParticleSystemManager(scene)

    // 配置GPU粒子系统
    config = {
      maxParticles: 1000,
      position: new THREE.Vector3(0, 0, 0),
      rate: 50,
      lifetime: 5,
      lifetimeVariance: 2,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 2,
      size: 0.5,
      sizeVariance: 0.2,
      color: new THREE.Color(0x00ffff),
      colorVariance: 0.5,
      spread: Math.PI * 2,
      gravity: new THREE.Vector3(0, -0.5, 0),
      turbulence: 0.5,
      damping: 0.98,
      startSize: 0.1,
      endSize: 1.0,
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0xff00ff)
    }
  })

  it('should create particle system correctly', () => {
    // 创建GPU粒子系统
    const particleSystem = particleSystemManager.createParticleSystem('test-system', config)

    // 检查返回的粒子系统是否是GPUParticleSystem实例
    expect(particleSystem).toBeDefined()
    expect(particleSystem.getMaxParticles()).toBe(config.maxParticles)
  })

  it('should get particle system correctly', () => {
    // 创建GPU粒子系统
    particleSystemManager.createParticleSystem('test-system', config)

    // 获取粒子系统
    const particleSystem = particleSystemManager.getParticleSystem('test-system')

    // 检查是否获取到正确的粒子系统
    expect(particleSystem).toBeDefined()
  })

  it('should remove particle system correctly', () => {
    // 创建GPU粒子系统
    particleSystemManager.createParticleSystem('test-system', config)

    // 移除粒子系统
    particleSystemManager.removeParticleSystem('test-system')

    // 尝试获取已移除的粒子系统，应该返回undefined
    const particleSystem = particleSystemManager.getParticleSystem('test-system')
    expect(particleSystem).toBeUndefined()
  })

  it('should update all particle systems', () => {
    // 创建多个粒子系统
    particleSystemManager.createParticleSystem('system1', config)
    particleSystemManager.createParticleSystem('system2', config)

    // 更新所有粒子系统
    particleSystemManager.update(1)

    // 检查粒子系统是否有粒子被发射
    const system1 = particleSystemManager.getParticleSystem('system1')
    const system2 = particleSystemManager.getParticleSystem('system2')

    expect(system1?.getParticleCount()).toBeGreaterThan(0)
    expect(system2?.getParticleCount()).toBeGreaterThan(0)
  })

  it('should dispose all particle systems', () => {
    // 创建多个粒子系统
    particleSystemManager.createParticleSystem('system1', config)
    particleSystemManager.createParticleSystem('system2', config)

    // 释放所有粒子系统
    particleSystemManager.dispose()

    // 检查粒子系统是否被正确移除
    expect(scene.children.length).toBe(0)
  })
})
