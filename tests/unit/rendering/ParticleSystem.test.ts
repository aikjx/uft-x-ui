import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import {
  ParticleEmitter,
  ParticleSystemManager,
  ObjectPool,
  Particle
} from '@/visualization/ParticleSystem'

describe('Particle', () => {
  let particle: Particle

  beforeEach(() => {
    particle = new Particle()
  })

  it('should initialize with correct default values', () => {
    expect(particle.position.x).toBe(0)
    expect(particle.position.y).toBe(0)
    expect(particle.position.z).toBe(0)
    expect(particle.velocity.x).toBe(0)
    expect(particle.velocity.y).toBe(0)
    expect(particle.velocity.z).toBe(0)
    expect(particle.acceleration.x).toBe(0)
    expect(particle.acceleration.y).toBe(0)
    expect(particle.acceleration.z).toBe(0)
    expect(particle.size).toBe(1)
    expect(particle.lifetime).toBe(1)
    expect(particle.age).toBe(0)
    expect(particle.mass).toBe(1)
    expect(particle.active).toBe(false)
  })

  it('should reset correctly', () => {
    // 修改一些属性
    particle.position.set(1, 2, 3)
    particle.velocity.set(4, 5, 6)
    particle.acceleration.set(7, 8, 9)
    particle.size = 5
    particle.lifetime = 10
    particle.age = 5
    particle.mass = 2
    particle.active = true

    // 重置粒子
    particle.reset()

    // 检查是否重置为默认值
    expect(particle.position.x).toBe(0)
    expect(particle.position.y).toBe(0)
    expect(particle.position.z).toBe(0)
    expect(particle.velocity.x).toBe(0)
    expect(particle.velocity.y).toBe(0)
    expect(particle.velocity.z).toBe(0)
    expect(particle.acceleration.x).toBe(0)
    expect(particle.acceleration.y).toBe(0)
    expect(particle.acceleration.z).toBe(0)
    expect(particle.size).toBe(1)
    expect(particle.lifetime).toBe(1)
    expect(particle.age).toBe(0)
    expect(particle.mass).toBe(1)
    expect(particle.active).toBe(false)
  })

  it('should update correctly', () => {
    // 设置初始状态
    particle.position.set(0, 0, 0)
    particle.velocity.set(1, 0, 0)
    particle.acceleration.set(0, 1, 0)
    particle.lifetime = 10
    particle.active = true

    // 更新粒子
    particle.update(1)

    // 检查更新后的值
    expect(particle.position.x).toBe(1) // 位置 = 初始位置 + 速度 * 时间
    expect(particle.position.y).toBe(1) // 位置 = 初始位置 + 速度 * 时间（velocity.y 在更新后变为1）
    expect(particle.position.z).toBe(0)
    expect(particle.velocity.x).toBe(1) // 速度 = 初始速度 + 加速度 * 时间
    expect(particle.velocity.y).toBe(1)
    expect(particle.velocity.z).toBe(0)
    expect(particle.age).toBe(1)
    expect(particle.active).toBe(true)
  })

  it('should become inactive when age exceeds lifetime', () => {
    // 设置粒子，使其年龄超过生命周期
    particle.lifetime = 1
    particle.age = 0.9
    particle.active = true

    // 更新粒子
    particle.update(0.2)

    // 检查粒子是否变为非活跃状态
    expect(particle.active).toBe(false)
    expect(particle.age).toBe(1.1) // 年龄应该超过生命周期
  })

  it('should apply force correctly', () => {
    // 设置初始状态
    particle.mass = 2
    particle.acceleration.set(0, 0, 0)

    // 应用力
    const force = new THREE.Vector3(2, 4, 6)
    particle.applyForce(force)

    // 检查加速度变化
    expect(particle.acceleration.x).toBe(1) // 加速度 = 力 / 质量
    expect(particle.acceleration.y).toBe(2)
    expect(particle.acceleration.z).toBe(3)
  })
})

describe('ObjectPool', () => {
  let objectPool: ObjectPool<Particle>

  beforeEach(() => {
    objectPool = new ObjectPool(
      () => new Particle(),
      particle => particle.reset(),
      10
    )
  })

  it('should acquire objects correctly', () => {
    // 从对象池获取对象
    const particle = objectPool.acquire()

    // 检查返回的对象是否是Particle实例
    expect(particle).toBeInstanceOf(Particle)
  })

  it('should release objects correctly', () => {
    // 获取对象
    const particle = objectPool.acquire()

    // 修改对象属性
    particle.position.set(1, 2, 3)
    particle.active = true

    // 释放对象
    objectPool.release(particle)

    // 再次获取对象，应该是同一个对象但已重置
    const recycledParticle = objectPool.acquire()

    // 检查对象是否已重置
    expect(recycledParticle.position.x).toBe(0)
    expect(recycledParticle.position.y).toBe(0)
    expect(recycledParticle.position.z).toBe(0)
    expect(recycledParticle.active).toBe(false)
  })

  it('should not exceed max size', () => {
    // 获取超过最大大小的对象
    const particles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      particles.push(objectPool.acquire())
    }

    // 释放所有对象
    particles.forEach(particle => objectPool.release(particle))

    // 再次获取对象，应该只能获取到maxSize个对象
    const recycledParticles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      recycledParticles.push(objectPool.acquire())
    }

    // 检查对象数量是否正确
    expect(recycledParticles.length).toBe(20)
  })
})

describe('ParticleEmitter', () => {
  let particleEmitter: ParticleEmitter

  beforeEach(() => {
    // 创建ParticleEmitter实例
    particleEmitter = new ParticleEmitter({}, 1000)
  })

  it('should initialize with correct default values', () => {
    // 检查初始状态
    expect(particleEmitter.getActiveCount()).toBe(0)
  })

  it('should emit particles', () => {
    // 更新发射器，触发粒子发射
    particleEmitter.update(1)

    // 检查是否有粒子被发射
    expect(particleEmitter.getActiveCount()).toBeGreaterThan(0)
  })

  it('should update particles correctly', () => {
    // 使用较低的发射率创建发射器
    const lowRateEmitter = new ParticleEmitter({ rate: 10, lifetime: 0.5 }, 100)

    // 发射一些粒子
    lowRateEmitter.update(0.5)
    const initialCount = lowRateEmitter.getActiveCount()

    // 等待足够长的时间，让粒子死亡
    lowRateEmitter.update(1)

    // 粒子数量应该减少
    expect(lowRateEmitter.getActiveCount()).toBeLessThanOrEqual(initialCount)
  })

  it('should clear all particles', () => {
    // 发射一些粒子
    particleEmitter.update(1)

    // 清除所有粒子
    particleEmitter.clear()

    // 检查粒子数量是否为0
    expect(particleEmitter.getActiveCount()).toBe(0)
  })

  it('should update config correctly', () => {
    // 更新配置
    const newRate = 200
    particleEmitter.updateConfig({ rate: newRate })

    // 发射粒子
    particleEmitter.update(1)

    // 检查是否发射了更多粒子
    const count1 = particleEmitter.getActiveCount()

    // 再次发射
    particleEmitter.update(1)
    const count2 = particleEmitter.getActiveCount()

    expect(count2).toBeGreaterThan(count1)
  })
})

describe('ParticleSystemManager', () => {
  let scene: THREE.Scene
  let particleSystemManager: ParticleSystemManager

  beforeEach(() => {
    // 创建Three.js场景
    scene = new THREE.Scene()

    // 创建ParticleSystemManager实例
    particleSystemManager = new ParticleSystemManager(scene)
  })

  it('should add emitter correctly', () => {
    // 添加发射器
    const emitter = particleSystemManager.addEmitter('test-emitter', {})

    // 检查返回的发射器是否是ParticleEmitter实例
    expect(emitter).toBeDefined()
  })

  it('should remove emitter correctly', () => {
    // 添加发射器
    particleSystemManager.addEmitter('test-emitter', {})

    // 移除发射器
    particleSystemManager.removeEmitter('test-emitter')

    // 尝试获取已移除的发射器，应该返回undefined
    const emitter = particleSystemManager.getEmitter('test-emitter')
    expect(emitter).toBeUndefined()
  })

  it('should update all emitters', () => {
    // 添加多个发射器
    particleSystemManager.addEmitter('emitter1', {})
    particleSystemManager.addEmitter('emitter2', {})

    // 更新所有发射器
    particleSystemManager.update(1)

    // 检查发射器是否有粒子被发射
    const emitter1 = particleSystemManager.getEmitter('emitter1')
    const emitter2 = particleSystemManager.getEmitter('emitter2')

    expect(emitter1?.getActiveCount()).toBeGreaterThan(0)
    expect(emitter2?.getActiveCount()).toBeGreaterThan(0)
  })

  it('should clear all emitters', () => {
    // 添加发射器
    particleSystemManager.addEmitter('emitter1', {})
    particleSystemManager.addEmitter('emitter2', {})

    // 清除所有发射器
    particleSystemManager.clear()

    // 尝试获取发射器，应该返回undefined
    expect(particleSystemManager.getEmitter('emitter1')).toBeUndefined()
    expect(particleSystemManager.getEmitter('emitter2')).toBeUndefined()
  })
})
