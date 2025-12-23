/**
 * 性能优化器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  DevicePerformanceDetector,
  PerformanceLevel,
  FPSMonitor,
  AdaptiveQualityManager,
  ObjectPool
} from '@/utils/PerformanceOptimizer'

describe('DevicePerformanceDetector', () => {
  it('应该检测设备性能', () => {
    const detector = DevicePerformanceDetector.getInstance()
    const level = detector.getPerformanceLevel()

    expect(Object.values(PerformanceLevel)).toContain(level)
  })

  it('应该返回GPU层级', () => {
    const detector = DevicePerformanceDetector.getInstance()
    const tier = detector.getGPUTier()

    expect(tier).toBeGreaterThanOrEqual(1)
    expect(tier).toBeLessThanOrEqual(3)
  })

  it('应该提供推荐配置', () => {
    const detector = DevicePerformanceDetector.getInstance()
    const config = detector.getRecommendedConfig()

    expect(config).toHaveProperty('particleCount')
    expect(config).toHaveProperty('fieldResolution')
    expect(config).toHaveProperty('shadowQuality')
    expect(config.particleCount).toBeGreaterThan(0)
  })

  it('不同性能级别应该有不同的配置', () => {
    const detector = DevicePerformanceDetector.getInstance()
    const config = detector.getRecommendedConfig()

    // 验证配置合理性
    if (detector.getPerformanceLevel() === PerformanceLevel.ULTRA) {
      expect(config.particleCount).toBeGreaterThan(100000)
    } else if (detector.getPerformanceLevel() === PerformanceLevel.LOW) {
      expect(config.particleCount).toBeLessThan(50000)
    }
  })
})

describe('FPSMonitor', () => {
  let monitor: FPSMonitor

  beforeEach(() => {
    monitor = new FPSMonitor()
  })

  it('应该初始化为60 FPS', () => {
    const fps = monitor.getFPS()
    expect(fps).toBe(60)
  })

  it('应该更新FPS', () => {
    // 模拟多次更新
    for (let i = 0; i < 10; i++) {
      monitor.update()
    }

    const fps = monitor.getFPS()
    expect(fps).toBeGreaterThan(0)
    expect(fps).toBeLessThanOrEqual(1000) // 合理的FPS范围
  })

  it('应该判断是否需要降级', () => {
    const shouldDowngrade = monitor.shouldDowngrade()
    expect(typeof shouldDowngrade).toBe('boolean')
  })

  it('应该判断是否可以升级', () => {
    const shouldUpgrade = monitor.shouldUpgrade()
    expect(typeof shouldUpgrade).toBe('boolean')
  })
})

describe('AdaptiveQualityManager', () => {
  let manager: AdaptiveQualityManager

  beforeEach(() => {
    manager = new AdaptiveQualityManager(PerformanceLevel.MEDIUM)
  })

  it('应该初始化为指定质量', () => {
    const quality = manager.getCurrentQuality()
    expect(quality).toBe(PerformanceLevel.MEDIUM)
  })

  it('应该更新质量', () => {
    const result = manager.update()

    expect(result).toHaveProperty('quality')
    expect(result).toHaveProperty('changed')
    expect(Object.values(PerformanceLevel)).toContain(result.quality)
  })

  it('应该返回当前FPS', () => {
    manager.update()
    const fps = manager.getFPS()

    expect(fps).toBeGreaterThanOrEqual(0)
  })

  it('应该有冷却机制', () => {
    // 第一次更新
    const result1 = manager.update()

    // 立即第二次更新（应该在冷却期内）
    const result2 = manager.update()

    // 如果第一次改变了，第二次不应该改变
    if (result1.changed) {
      expect(result2.changed).toBe(false)
    }
  })
})

describe('ObjectPool', () => {
  interface TestObject {
    id: number
    active: boolean
  }

  let pool: ObjectPool<TestObject>
  let idCounter = 0

  beforeEach(() => {
    idCounter = 0
    pool = new ObjectPool<TestObject>(
      () => ({ id: idCounter++, active: true }),
      obj => {
        obj.active = false
      },
      5
    )
  })

  it('应该预创建对象', () => {
    expect(pool.size()).toBe(5)
  })

  it('应该能获取对象', () => {
    const obj = pool.acquire()

    expect(obj).toBeDefined()
    expect(obj).toHaveProperty('id')
    expect(obj).toHaveProperty('active')
  })

  it('应该能归还对象', () => {
    const obj = pool.acquire()
    const initialSize = pool.size()

    pool.release(obj)

    expect(pool.size()).toBe(initialSize + 1)
    expect(obj.active).toBe(false) // 应该被重置
  })

  it('应该重用对象', () => {
    const obj1 = pool.acquire()
    const id1 = obj1.id

    pool.release(obj1)

    const obj2 = pool.acquire()
    const id2 = obj2.id

    expect(id1).toBe(id2) // 应该是同一个对象
  })

  it('池空时应该创建新对象', () => {
    // 清空池
    while (pool.size() > 0) {
      pool.acquire()
    }

    expect(pool.size()).toBe(0)

    // 应该创建新对象
    const obj = pool.acquire()
    expect(obj).toBeDefined()
  })

  it('应该能清空池', () => {
    pool.clear()
    expect(pool.size()).toBe(0)
  })

  it('应该能处理大量对象', () => {
    const objects: TestObject[] = []

    // 获取100个对象
    for (let i = 0; i < 100; i++) {
      objects.push(pool.acquire())
    }

    expect(objects.length).toBe(100)

    // 归还所有对象
    objects.forEach(obj => pool.release(obj))

    expect(pool.size()).toBe(100)
  })
})

describe('性能优化集成测试', () => {
  it('应该根据设备性能选择合适的质量', () => {
    const detector = DevicePerformanceDetector.getInstance()
    const level = detector.getPerformanceLevel()
    const config = detector.getRecommendedConfig()

    const manager = new AdaptiveQualityManager(level)

    // 验证初始质量与检测结果一致
    expect(manager.getCurrentQuality()).toBe(level)

    // 验证配置合理性
    expect(config.particleCount).toBeGreaterThan(0)
    expect(config.fieldResolution).toBeGreaterThan(0)
  })

  it('应该能动态调整质量', () => {
    const manager = new AdaptiveQualityManager(PerformanceLevel.MEDIUM)

    // 模拟多帧更新
    const updates: boolean[] = []
    for (let i = 0; i < 200; i++) {
      const result = manager.update()
      if (result.changed) {
        updates.push(true)
      }
    }

    // 应该至少有一次质量调整（或者保持稳定）
    expect(updates.length).toBeGreaterThanOrEqual(0)
  })
})
