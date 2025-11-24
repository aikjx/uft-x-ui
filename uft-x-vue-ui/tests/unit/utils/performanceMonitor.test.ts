import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PerformanceMonitor } from '@/utils/performanceMonitor'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    vi.useFakeTimers()
    monitor = new PerformanceMonitor()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    monitor.stopMonitoring()
  })

  it('should initialize with default metrics', () => {
    expect(monitor.getMetrics()).toMatchObject({
      fps: 0,
      memory: {
        used: 0,
        total: 0,
        limit: 0
      },
      cpu: {
        usage: 0,
        threads: 0
      },
      gpu: {
        memory: 0,
        temperature: 0
      },
      network: {
        latency: 0,
        throughput: 0
      },
      rendering: {
        frameTime: 0,
        drawCalls: 0
      }
    })
  })

  it('should start monitoring FPS', () => {
    const spy = vi.spyOn(monitor, 'monitorFPS')
    monitor.startMonitoring()
    
    expect(spy).toHaveBeenCalled()
  })

  it('should calculate FPS correctly', async () => {
    monitor.startMonitoring()
    
    // 模拟帧渲染
    for (let i = 0; i < 60; i++) {
      monitor['monitorFPS']()
      vi.advanceTimersByTime(16) // 60fps 对应 16ms/帧
    }
    
    const metrics = monitor.getMetrics()
    expect(metrics.fps).toBeWithinRange(55, 65) // 允许微小误差
  })

  it('should detect memory usage changes', () => {
    // 模拟内存使用情况
    const mockPerformance = {
      memory: {
        usedJSHeapSize: 100 * 1024 * 1024,
        totalJSHeapSize: 500 * 1024 * 1024,
        jsHeapSizeLimit: 2000 * 1024 * 1024
      }
    }
    
    // @ts-ignore
    global.performance = mockPerformance
    
    monitor.startMonitoring()
    monitor['monitorMemory']()
    
    const metrics = monitor.getMetrics()
    expect(metrics.memory.used).toBeCloseTo(100, 1)
    expect(metrics.memory.total).toBeCloseTo(500, 1)
    expect(metrics.memory.limit).toBeCloseTo(2000, 1)
  })

  it('should trigger alerts when thresholds exceeded', () => {
    const alertHandler = vi.fn()
    monitor.onAlert(alertHandler)
    
    // 设置低阈值触发告警
    monitor.setThresholds({
      fps: { critical: 10, warning: 30 },
      memory: { critical: 50, warning: 200 }
    })
    
    // 模拟低帧率
    monitor['metrics'].fps = 5
    monitor['checkAlerts']()
    
    expect(alertHandler).toHaveBeenCalledWith({
      type: 'CRITICAL',
      metric: 'fps',
      value: 5,
      threshold: 10,
      message: expect.stringContaining('FPS低于临界阈值')
    })
  })

  it('should calculate performance score correctly', () => {
    // 模拟良好性能指标
    monitor['metrics'] = {
      fps: 60,
      memory: { used: 100, total: 500, limit: 2000 },
      cpu: { usage: 30, threads: 4 },
      gpu: { memory: 512, temperature: 60 },
      network: { latency: 50, throughput: 1000 },
      rendering: { frameTime: 16, drawCalls: 100 }
    }
    
    const score = monitor.calculatePerformanceScore()
    expect(score).toBeWithinRange(80, 100) // 良好性能应该得分较高
  })

  it('should provide optimization suggestions', () => {
    // 模拟性能问题
    monitor['metrics'] = {
      fps: 25,
      memory: { used: 800, total: 1000, limit: 2000 },
      cpu: { usage: 85, threads: 4 },
      gpu: { memory: 1500, temperature: 85 },
      network: { latency: 200, throughput: 500 },
      rendering: { frameTime: 40, drawCalls: 500 }
    }
    
    const suggestions = monitor.getOptimizationSuggestions()
    
    expect(suggestions).toContainEqual({
      category: 'rendering',
      priority: 'high',
      suggestion: '优化渲染性能，减少帧时间',
      impact: 'high'
    })
    
    expect(suggestions).toContainEqual({
      category: 'memory',
      priority: 'high',
      suggestion: '优化内存使用，减少内存泄漏',
      impact: 'high'
    })
  })

  it('should export performance data in JSON format', () => {
    monitor['metrics'] = {
      fps: 60,
      memory: { used: 100, total: 500, limit: 2000 },
      cpu: { usage: 30, threads: 4 },
      gpu: { memory: 512, temperature: 60 },
      network: { latency: 50, throughput: 1000 },
      rendering: { frameTime: 16, drawCalls: 100 }
    }
    
    const exportData = monitor.exportData()
    
    expect(exportData).toHaveProperty('timestamp')
    expect(exportData).toHaveProperty('metrics')
    expect(exportData).toHaveProperty('score')
    expect(exportData).toHaveProperty('suggestions')
    
    expect(exportData.metrics.fps).toBe(60)
    expect(exportData.score).toBeGreaterThan(0)
  })
})