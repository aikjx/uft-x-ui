/**
 * 测试性能监控工具
 * 提供实时的测试性能分析和优化建议
 */

import { performance } from 'perf_hooks'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export class TestPerformanceMonitor {
  private static instance: TestPerformanceMonitor
  private metrics: Map<string, TestMetrics>
  private history: TestRunHistory[]
  private currentRun: TestRunMetrics | null = null

  private constructor() {
    this.metrics = new Map()
    this.history = []
    this.loadHistory()
  }

  static getInstance(): TestPerformanceMonitor {
    if (!TestPerformanceMonitor.instance) {
      TestPerformanceMonitor.instance = new TestPerformanceMonitor()
    }
    return TestPerformanceMonitor.instance
  }

  startTestRun(): void {
    this.currentRun = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      slowTests: [] as string[],
      memoryUsage: {
        start: process.memoryUsage().heapUsed,
        end: 0,
        max: 0
      },
      performanceData: {
        cpuUsage: process.cpuUsage(),
        testTimes: new Map()
      }
    }

    this.currentRun.memoryUsage.max = this.currentRun.memoryUsage.start
  }

  startTest(testName: string): void {
    const startTime = performance.now()
    const memoryStart = process.memoryUsage().heapUsed

    this.metrics.set(testName, {
      startTime,
      endTime: 0,
      duration: 0,
      memoryStart,
      memoryEnd: 0,
      memoryUsed: 0,
      status: 'running'
    })

    if (this.currentRun) {
      this.currentRun.totalTests++
    }
  }

  endTest(testName: string, status: 'passed' | 'failed'): void {
    const metric = this.metrics.get(testName)
    if (!metric) return

    const endTime = performance.now()
    const memoryEnd = process.memoryUsage().heapUsed

    metric.endTime = endTime
    metric.duration = endTime - metric.startTime
    metric.memoryEnd = memoryEnd
    metric.memoryUsed = memoryEnd - metric.memoryStart
    metric.status = status

    // 更新运行统计
    if (this.currentRun) {
      if (status === 'passed') {
        this.currentRun.passedTests++
      } else {
        this.currentRun.failedTests++
      }

      // 检测慢测试
      if (metric.duration > 1000) {
        // 超过1秒视为慢测试
        this.currentRun.slowTests.push(testName)
      }

      // 跟踪内存使用峰值
      this.currentRun.memoryUsage.max = Math.max(this.currentRun.memoryUsage.max, memoryEnd)

      // 记录测试时间
      this.currentRun.performanceData.testTimes.set(testName, metric.duration)
    }
  }

  endTestRun(): TestRunReport {
    if (!this.currentRun) {
      throw new Error('Test run not started')
    }

    this.currentRun.endTime = Date.now()
    this.currentRun.duration = this.currentRun.endTime - this.currentRun.startTime
    this.currentRun.memoryUsage.end = process.memoryUsage().heapUsed

    const report: TestRunReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDuration: this.currentRun.duration,
        totalTests: this.currentRun.totalTests,
        passedTests: this.currentRun.passedTests,
        failedTests: this.currentRun.failedTests,
        successRate: (this.currentRun.passedTests / this.currentRun.totalTests) * 100,
        memoryUsage: {
          start: this.currentRun.memoryUsage.start,
          end: this.currentRun.memoryUsage.end,
          max: this.currentRun.memoryUsage.max,
          delta: this.currentRun.memoryUsage.end - this.currentRun.memoryUsage.start
        }
      },
      performance: {
        averageTestTime: this.calculateAverageTestTime(),
        slowTests: this.currentRun.slowTests,
        memoryLeakRisk: this.detectMemoryLeakRisk(),
        recommendations: this.generateRecommendations()
      },
      details: Array.from(this.metrics.entries()).map(([name, metric]) => ({
        name,
        duration: metric.duration,
        memoryUsed: metric.memoryUsed,
        status: metric.status
      }))
    }

    // 保存历史记录
    this.history.push({
      timestamp: report.timestamp,
      summary: report.summary
    })
    this.saveHistory()

    // 清理当前运行
    this.metrics.clear()
    this.currentRun = null

    return report
  }

  private calculateAverageTestTime(): number {
    if (!this.currentRun) return 0

    const times = Array.from(this.currentRun.performanceData.testTimes.values())
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  private detectMemoryLeakRisk(): 'low' | 'medium' | 'high' {
    if (!this.currentRun) return 'low'

    const memoryGrowth = this.currentRun.memoryUsage.delta
    const memoryGrowthRate = memoryGrowth / this.currentRun.duration

    if (memoryGrowthRate > 1000) return 'high' // 每秒增长超过1KB
    if (memoryGrowthRate > 100) return 'medium'
    return 'low'
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (!this.currentRun) return recommendations

    // 慢测试优化建议
    if (this.currentRun.slowTests.length > 0) {
      recommendations.push(`检测到 ${this.currentRun.slowTests.length} 个慢测试，建议优化其性能`)
    }

    // 内存使用建议
    const memoryUsageMB = this.currentRun.memoryUsage.max / 1024 / 1024
    if (memoryUsageMB > 100) {
      recommendations.push('内存使用较高，建议优化内存管理')
    }

    // 测试覆盖率建议
    const successRate = this.currentRun.passedTests / this.currentRun.totalTests
    if (successRate < 0.8) {
      recommendations.push('测试通过率较低，建议检查失败的测试用例')
    }

    // 执行时间建议
    if (this.currentRun.duration > 30000) {
      // 超过30秒
      recommendations.push('测试执行时间较长，建议优化测试套件')
    }

    return recommendations
  }

  private loadHistory(): void {
    const historyFile = join(__dirname, 'test-history.json')
    if (existsSync(historyFile)) {
      try {
        const data = readFileSync(historyFile, 'utf8')
        this.history = JSON.parse(data)
      } catch (error) {
        console.warn('无法加载测试历史记录:', error)
      }
    }
  }

  private saveHistory(): void {
    const historyFile = join(__dirname, 'test-history.json')
    try {
      writeFileSync(historyFile, JSON.stringify(this.history, null, 2), 'utf8')
    } catch (error) {
      console.warn('无法保存测试历史记录:', error)
    }
  }

  getTrendAnalysis(): TrendAnalysis {
    if (this.history.length < 2) {
      return { trend: 'stable', confidence: 'low', metrics: {} }
    }

    const recent = this.history.slice(-5) // 最近5次运行
    const durations = recent.map(r => r.summary.totalDuration)
    const successRates = recent.map(r => r.summary.successRate)

    return {
      trend: this.calculateTrend(durations, successRates),
      confidence: 'medium',
      metrics: {
        durationChange: this.calculateChange(durations),
        successRateChange: this.calculateChange(successRates)
      }
    }
  }

  private calculateTrend(
    durations: number[],
    successRates: number[]
  ): 'improving' | 'declining' | 'stable' {
    const durationTrend = this.linearRegression(durations)
    const successTrend = this.linearRegression(successRates)

    if (durationTrend.slope < -0.1 && successTrend.slope > 0.1) {
      return 'improving'
    } else if (durationTrend.slope > 0.1 && successTrend.slope < -0.1) {
      return 'declining'
    }

    return 'stable'
  }

  private linearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length
    const x = Array.from({ length: n }, (_, i) => i)

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = data.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  private calculateChange(data: number[]): number {
    if (data.length < 2) return 0
    return ((data[data.length - 1] - data[0]) / data[0]) * 100
  }
}

// 类型定义
interface TestMetrics {
  startTime: number
  endTime: number
  duration: number
  memoryStart: number
  memoryEnd: number
  memoryUsed: number
  status: 'running' | 'passed' | 'failed'
}

interface TestRunMetrics {
  startTime: number
  endTime: number
  duration: number
  totalTests: number
  passedTests: number
  failedTests: number
  slowTests: string[]
  memoryUsage: {
    start: number
    end: number
    max: number
  }
  performanceData: {
    cpuUsage: NodeJS.CpuUsage
    testTimes: Map<string, number>
  }
}

interface TestRunSummary {
  totalDuration: number
  totalTests: number
  passedTests: number
  failedTests: number
  successRate: number
  memoryUsage: {
    start: number
    end: number
    max: number
    delta: number
  }
}

interface TestRunPerformance {
  averageTestTime: number
  slowTests: string[]
  memoryLeakRisk: 'low' | 'medium' | 'high'
  recommendations: string[]
}

interface TestRunReport {
  timestamp: string
  summary: TestRunSummary
  performance: TestRunPerformance
  details: Array<{
    name: string
    duration: number
    memoryUsed: number
    status: string
  }>
}

interface TestRunHistory {
  timestamp: string
  summary: TestRunSummary
}

interface TrendAnalysis {
  trend: 'improving' | 'declining' | 'stable'
  confidence: 'low' | 'medium' | 'high'
  metrics: {
    durationChange: number
    successRateChange: number
  }
}

// 导出单例实例
export const testPerformanceMonitor = TestPerformanceMonitor.getInstance()
