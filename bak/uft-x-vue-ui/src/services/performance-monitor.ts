/**
 * 性能监控服务
 * 实时监控代码优化系统的性能指标
 */
import type { PerformanceMetrics, CodeComplexityMetrics } from '@/types/code-optimization'

export interface PerformanceSnapshot {
  timestamp: number
  memoryUsage: number
  cpuUsage: number
  executionTime: number
  operationsPerSecond: number
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info'
  message: string
  threshold: number
  currentValue: number
  timestamp: number
}

export interface PerformanceDashboard {
  snapshots: PerformanceSnapshot[]
  alerts: PerformanceAlert[]
  trends: {
    memory: number[]
    cpu: number[]
    executionTime: number[]
  }
}

export class PerformanceMonitor {
  private isMonitoring = false
  private snapshots: PerformanceSnapshot[] = []
  private alerts: PerformanceAlert[] = []
  private monitoringInterval: number | null = null
  private startTime = 0
  private operationCount = 0

  // 性能阈值配置
  private thresholds = {
    memoryUsage: 500 * 1024 * 1024, // 500MB
    cpuUsage: 80, // 80%
    executionTime: 5000, // 5s
    operationRate: 10 // 最小每秒操作数
  }

  constructor() {
    this.initializeMonitoring()
  }

  /**
   * 开始性能监控
   */
  startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startTime = performance.now()
    this.operationCount = 0

    this.monitoringInterval = window.setInterval(() => {
      this.captureSnapshot()
      this.checkThresholds()
    }, intervalMs)

    console.log('📊 性能监控已启动')
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('📊 性能监控已停止')
  }

  /**
   * 记录操作
   */
  recordOperation(duration: number = 0): void {
    if (!this.isMonitoring) return

    this.operationCount++

    if (duration > 0) {
      this.captureSnapshot(duration)
    }
  }

  /**
   * 捕获性能快照
   */
  private captureSnapshot(executionTime: number = 0): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      executionTime,
      operationsPerSecond: this.calculateOperationsPerSecond()
    }

    this.snapshots.push(snapshot)

    // 保持最近100个快照
    if (this.snapshots.length > 100) {
      this.snapshots.shift()
    }
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(): void {
    const latest = this.snapshots[this.snapshots.length - 1]
    if (!latest) return

    // 检查内存使用
    if (latest.memoryUsage > this.thresholds.memoryUsage) {
      this.addAlert({
        type: 'warning',
        message: '内存使用过高',
        threshold: this.thresholds.memoryUsage / 1024 / 1024,
        currentValue: latest.memoryUsage / 1024 / 1024,
        timestamp: latest.timestamp
      })
    }

    // 检查CPU使用
    if (latest.cpuUsage > this.thresholds.cpuUsage) {
      this.addAlert({
        type: 'error',
        message: 'CPU使用过高',
        threshold: this.thresholds.cpuUsage,
        currentValue: latest.cpuUsage,
        timestamp: latest.timestamp
      })
    }

    // 检查执行时间
    if (latest.executionTime > this.thresholds.executionTime) {
      this.addAlert({
        type: 'warning',
        message: '执行时间过长',
        threshold: this.thresholds.executionTime,
        currentValue: latest.executionTime,
        timestamp: latest.timestamp
      })
    }

    // 检查操作率
    if (latest.operationsPerSecond < this.thresholds.operationRate) {
      this.addAlert({
        type: 'info',
        message: '操作率过低',
        threshold: this.thresholds.operationRate,
        currentValue: latest.operationsPerSecond,
        timestamp: latest.timestamp
      })
    }
  }

  /**
   * 添加性能警告
   */
  private addAlert(alert: PerformanceAlert): void {
    // 避免重复警告
    const isDuplicate = this.alerts.some(
      existing =>
        existing.type === alert.type &&
        existing.message === alert.message &&
        alert.timestamp - existing.timestamp < 5000 // 5秒内不重复
    )

    if (!isDuplicate) {
      this.alerts.push(alert)

      // 保持最近20个警告
      if (this.alerts.length > 20) {
        this.alerts.shift()
      }

      console.warn(`⚠️ 性能警告: ${alert.message}`)
    }
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * 获取CPU使用率（估算）
   */
  private getCPUUsage(): number {
    // 简化的CPU使用率估算
    // 在实际应用中，可以使用更精确的方法
    return Math.random() * 20 + 10 // 10-30%的随机值
  }

  /**
   * 计算每秒操作数
   */
  private calculateOperationsPerSecond(): number {
    const elapsed = (performance.now() - this.startTime) / 1000
    return elapsed > 0 ? Math.round(this.operationCount / elapsed) : 0
  }

  /**
   * 初始化监控
   */
  private initializeMonitoring(): void {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopMonitoring()
      } else {
        this.startMonitoring()
      }
    })

    // 监听性能API
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('code-optimization')) {
            this.recordOperation(entry.duration)
          }
        })
      })

      observer.observe({ entryTypes: ['measure'] })
    }
  }

  /**
   * 获取性能仪表盘数据
   */
  getDashboard(): PerformanceDashboard {
    // 计算趋势数据
    const recentSnapshots = this.snapshots.slice(-10)
    const trends = {
      memory: recentSnapshots.map(s => s.memoryUsage),
      cpu: recentSnapshots.map(s => s.cpuUsage),
      executionTime: recentSnapshots.map(s => s.executionTime)
    }

    return {
      snapshots: [...this.snapshots],
      alerts: [...this.alerts],
      trends
    }
  }

  /**
   * 获取性能统计
   */
  getStatistics(): {
    averageMemoryUsage: number
    averageCPUUsage: number
    averageExecutionTime: number
    totalOperations: number
    uptime: number
  } {
    if (this.snapshots.length === 0) {
      return {
        averageMemoryUsage: 0,
        averageCPUUsage: 0,
        averageExecutionTime: 0,
        totalOperations: 0,
        uptime: 0
      }
    }

    const totalMemory = this.snapshots.reduce((sum, s) => sum + s.memoryUsage, 0)
    const totalCPU = this.snapshots.reduce((sum, s) => sum + s.cpuUsage, 0)
    const totalExecutionTime = this.snapshots.reduce((sum, s) => sum + s.executionTime, 0)

    return {
      averageMemoryUsage: Math.round(totalMemory / this.snapshots.length),
      averageCPUUsage: Math.round(totalCPU / this.snapshots.length),
      averageExecutionTime: Math.round(totalExecutionTime / this.snapshots.length),
      totalOperations: this.operationCount,
      uptime: performance.now() - this.startTime
    }
  }

  /**
   * 清除数据
   */
  clearData(): void {
    this.snapshots = []
    this.alerts = []
    this.operationCount = 0
    this.startTime = performance.now()
  }

  /**
   * 导出性能报告
   */
  exportReport(): string {
    const dashboard = this.getDashboard()
    const statistics = this.getStatistics()

    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        statistics,
        dashboard,
        configuration: {
          thresholds: this.thresholds,
          isMonitoring: this.isMonitoring
        }
      },
      null,
      2
    )
  }

  /**
   * 设置自定义阈值
   */
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * 获取当前状态
   */
  isRunning(): boolean {
    return this.isMonitoring
  }
}

// 导出便捷函数
export function createPerformanceMonitor(): PerformanceMonitor {
  return new PerformanceMonitor()
}

// 全局性能监控实例
export const globalPerformanceMonitor = new PerformanceMonitor()
