import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PerformanceUtils } from '@/utils/performanceUtils'

describe('PerformanceUtils - 性能工具库', () => {
  let performanceUtils: PerformanceUtils

  beforeEach(() => {
    performanceUtils = new PerformanceUtils()
    vi.clearAllMocks()
    
    // 重置性能监控状态
    performanceUtils.reset()
  })

  describe('性能监控', () => {
    it('应该正确测量函数执行时间', async () => {
      const testFunction = vi.fn(() => {
        // 模拟耗时操作
        const start = Date.now()
        while (Date.now() - start < 10) {}
      })
      
      const result = await performanceUtils.measureExecution(testFunction)
      
      expect(result.duration).toBeGreaterThan(0)
      expect(result.duration).toBeLessThan(100)
      expect(testFunction).toHaveBeenCalled()
    })

    it('应该监控内存使用情况', () => {
      const memoryInfo = performanceUtils.getMemoryUsage()
      
      expect(memoryInfo).toHaveProperty('usedJSHeapSize')
      expect(memoryInfo).toHaveProperty('totalJSHeapSize')
      expect(memoryInfo).toHaveProperty('jsHeapSizeLimit')
    })

    it('应该检测性能瓶颈', () => {
      // 模拟长任务
      const longTask = () => {
        const start = Date.now()
        while (Date.now() - start < 100) {}
      }
      
      const isBottleneck = performanceUtils.detectBottleneck(longTask)
      
      expect(isBottleneck).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该实现防抖函数', async () => {
      const mockFunction = vi.fn()
      const debounced = performanceUtils.debounce(mockFunction, 100)
      
      // 快速多次调用
      debounced()
      debounced()
      debounced()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockFunction).toHaveBeenCalledTimes(1)
    })

    it('应该实现节流函数', async () => {
      const mockFunction = vi.fn()
      const throttled = performanceUtils.throttle(mockFunction, 100)
      
      // 快速多次调用
      throttled()
      throttled()
      throttled()
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(mockFunction).toHaveBeenCalledTimes(1)
    })

    it('应该优化递归函数', () => {
      const fibonacci = (n: number): number => {
        if (n <= 1) return n
        return fibonacci(n - 1) + fibonacci(n - 2)
      }
      
      const optimized = performanceUtils.memoize(fibonacci)
      
      const startTime = performance.now()
      const result = optimized(30)
      const endTime = performance.now()
      
      expect(result).toBe(832040)
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('资源管理', () => {
    it('应该跟踪资源分配', () => {
      const resourceId = performanceUtils.trackResource('test-resource')
      
      expect(resourceId).toBeDefined()
      
      const resources = performanceUtils.getResourceUsage()
      expect(resources).toHaveLength(1)
    })

    it('应该清理未使用资源', () => {
      performanceUtils.trackResource('temp-resource')
      
      performanceUtils.cleanupUnusedResources()
      
      const resources = performanceUtils.getResourceUsage()
      expect(resources).toHaveLength(0)
    })

    it('应该检测内存泄漏', async () => {
      // 模拟内存泄漏模式
      const leakingObjects: any[] = []
      
      for (let i = 0; i < 1000; i++) {
        leakingObjects.push(new Array(1000).fill('leak'))
      }
      
      const hasLeak = await performanceUtils.detectMemoryLeak()
      
      expect(hasLeak).toBe(true)
    })
  })

  describe('性能分析', () => {
    it('应该生成性能报告', () => {
      const report = performanceUtils.generateReport()
      
      expect(report).toHaveProperty('metrics')
      expect(report).toHaveProperty('recommendations')
      expect(report).toHaveProperty('timeline')
    })

    it('应该分析性能趋势', () => {
      // 模拟性能数据
      for (let i = 0; i < 10; i++) {
        performanceUtils.recordMetric('render-time', 16 + i * 2)
      }
      
      const trend = performanceUtils.analyzeTrend('render-time')
      
      expect(trend.direction).toBe('increasing')
      expect(trend.slope).toBeGreaterThan(0)
    })

    it('应该提供优化建议', () => {
      // 模拟低性能场景
      performanceUtils.recordMetric('fps', 25)
      performanceUtils.recordMetric('memory-usage', 85)
      
      const suggestions = performanceUtils.getOptimizationSuggestions()
      
      expect(suggestions).toContain('优化渲染性能')
      expect(suggestions).toContain('减少内存使用')
    })
  })

  describe('基准测试', () => {
    it('应该运行性能基准测试', async () => {
      const benchmark = await performanceUtils.runBenchmark({
        iterations: 100,
        warmup: 10,
        function: () => {
          let sum = 0
          for (let i = 0; i < 1000; i++) {
            sum += i
          }
          return sum
        }
      })
      
      expect(benchmark).toHaveProperty('averageTime')
      expect(benchmark).toHaveProperty('standardDeviation')
      expect(benchmark).toHaveProperty('opsPerSecond')
    })

    it('应该比较不同实现的性能', async () => {
      const implementations = {
        'array-filter': (arr: number[]) => arr.filter(x => x % 2 === 0),
        'for-loop': (arr: number[]) => {
          const result = []
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] % 2 === 0) result.push(arr[i])
          }
          return result
        }
      }
      
      const comparison = await performanceUtils.compareImplementations(
        implementations,
        { input: Array(1000).fill(0).map((_, i) => i) }
      )
      
      expect(comparison).toHaveProperty('winner')
      expect(comparison).toHaveProperty('results')
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理性能API不可用', () => {
      // 模拟缺少 performance API
      const originalPerformance = global.performance
      // @ts-ignore
      global.performance = undefined
      
      const memoryInfo = performanceUtils.getMemoryUsage()
      
      expect(memoryInfo.error).toBeDefined()
      
      // 恢复
      global.performance = originalPerformance
    })

    it('应该处理性能测量超时', async () => {
      const infiniteLoop = () => {
        while (true) {}
      }
      
      const result = await performanceUtils.measureExecution(infiniteLoop, 100)
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('超时')
    })
  })

  describe('性能事件', () => {
    it('应该触发性能警告事件', () => {
      const warningHandler = vi.fn()
      performanceUtils.on('performance-warning', warningHandler)
      
      performanceUtils.recordMetric('fps', 10)
      
      expect(warningHandler).toHaveBeenCalledWith({
        metric: 'fps',
        value: 10,
        threshold: 30
      })
    })

    it('应该支持自定义性能阈值', () => {
      performanceUtils.setThreshold('custom-metric', 50)
      
      const thresholds = performanceUtils.getThresholds()
      
      expect(thresholds['custom-metric']).toBe(50)
    })
  })
})