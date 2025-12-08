import type { 
  PerformanceMetrics, 
  PerformanceThresholds, 
  OptimizationSuggestion,
  PerformanceAlert 
} from '@/types/performance'

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memory: { used: 0, total: 0, limit: 0 },
    cpu: { usage: 0, threads: 0 },
    gpu: { memory: 0, temperature: 0 },
    network: { latency: 0, throughput: 0 },
    rendering: { frameTime: 0, drawCalls: 0 }
  }

  private thresholds: PerformanceThresholds = {
    fps: { critical: 10, warning: 30 },
    memory: { critical: 85, warning: 70 },
    cpu: { critical: 90, warning: 70 },
    gpu: { critical: 85, warning: 75 },
    network: { critical: 500, warning: 200 }
  }

  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private alertHandlers: Array<(alert: PerformanceAlert) => void> = []
  private fpsFrames: number[] = []
  private lastFrameTime: number = 0

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    
    // 高精度FPS监控
    this.monitorHighPrecisionFPS()
    
    // 主监控循环
    this.monitoringInterval = setInterval(() => {
      this.updateAllMetrics()
      this.checkAlerts()
    }, 1000)
  }

  // 停止监控
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    this.fpsFrames = []
  }

  // 获取当前指标
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // 设置阈值
  setThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }

  // 注册告警处理器
  onAlert(handler: (alert: PerformanceAlert) => void): void {
    this.alertHandlers.push(handler)
  }

  // 计算性能评分 (0-100)
  calculatePerformanceScore(): number {
    let score = 100

    // FPS 评分 (权重: 30%)
    if (this.metrics.fps < this.thresholds.fps.critical) {
      score -= 30
    } else if (this.metrics.fps < this.thresholds.fps.warning) {
      score -= 15
    } else if (this.metrics.fps < 45) {
      score -= 5
    }

    // 内存使用评分 (权重: 25%)
    const memoryUsage = (this.metrics.memory.used / this.metrics.memory.limit) * 100
    if (memoryUsage > this.thresholds.memory.critical) {
      score -= 25
    } else if (memoryUsage > this.thresholds.memory.warning) {
      score -= 12
    } else if (memoryUsage > 50) {
      score -= 5
    }

    // CPU 使用评分 (权重: 20%)
    if (this.metrics.cpu.usage > this.thresholds.cpu.critical) {
      score -= 20
    } else if (this.metrics.cpu.usage > this.thresholds.cpu.warning) {
      score -= 10
    }

    // GPU 温度评分 (权重: 15%)
    if (this.metrics.gpu.temperature > this.thresholds.gpu.critical) {
      score -= 15
    } else if (this.metrics.gpu.temperature > this.thresholds.gpu.warning) {
      score -= 7
    }

    // 网络延迟评分 (权重: 10%)
    if (this.metrics.network.latency > this.thresholds.network.critical) {
      score -= 10
    } else if (this.metrics.network.latency > this.thresholds.network.warning) {
      score -= 5
    }

    return Math.max(0, score)
  }

  // 获取优化建议
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // FPS 优化建议
    if (this.metrics.fps < this.thresholds.fps.critical) {
      suggestions.push({
        category: 'rendering',
        priority: 'high',
        suggestion: '优化三维渲染性能：使用LOD技术、减少绘制调用、优化着色器',
        impact: 'high'
      })
    } else if (this.metrics.fps < this.thresholds.fps.warning) {
      suggestions.push({
        category: 'rendering',
        priority: 'medium',
        suggestion: '考虑使用LOD(细节层次)技术和对象池优化渲染',
        impact: 'medium'
      })
    }

    // 内存优化建议
    const memoryUsage = (this.metrics.memory.used / this.metrics.memory.limit) * 100
    if (memoryUsage > this.thresholds.memory.critical) {
      suggestions.push({
        category: 'memory',
        priority: 'high',
        suggestion: '内存使用过高，检查Three.js对象内存泄漏，优化纹理缓存',
        impact: 'high'
      })
    } else if (memoryUsage > this.thresholds.memory.warning) {
      suggestions.push({
        category: 'memory',
        priority: 'medium',
        suggestion: '监控内存使用趋势，优化大纹理和几何体加载策略',
        impact: 'medium'
      })
    }

    // CPU 优化建议
    if (this.metrics.cpu.usage > this.thresholds.cpu.critical) {
      suggestions.push({
        category: 'cpu',
        priority: 'high',
        suggestion: 'CPU使用率过高，优化计算密集型操作，考虑使用Web Worker',
        impact: 'high'
      })
    }

    // 渲染优化建议
    if (this.metrics.rendering.drawCalls > 500) {
      suggestions.push({
        category: 'rendering',
        priority: 'medium',
        suggestion: '绘制调用过多，考虑合并几何体或使用实例化渲染',
        impact: 'medium'
      })
    }

    return suggestions
  }

  // 导出数据
  exportData() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      score: this.calculatePerformanceScore(),
      thresholds: this.thresholds,
      suggestions: this.getOptimizationSuggestions()
    }
  }

  // 获取性能报告
  generatePerformanceReport(duration: number = 60000): any {
    return {
      id: `report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration,
      averageMetrics: this.metrics,
      peakMetrics: this.metrics,
      issues: [],
      recommendations: this.getOptimizationSuggestions().map(s => s.suggestion)
    }
  }

  private updateAllMetrics(): void {
    this.monitorMemory()
    this.monitorCPU()
    this.monitorGPU()
    this.monitorNetwork()
    this.monitorRendering()
  }

  private monitorHighPrecisionFPS(): void {
    const updateFPS = () => {
      if (!this.isMonitoring) return
      
      const now = performance.now()
      const delta = now - this.lastFrameTime
      this.lastFrameTime = now
      
      if (delta > 0) {
        const currentFPS = 1000 / delta
        this.fpsFrames.push(currentFPS)
        
        // 保持最近60帧数据
        if (this.fpsFrames.length > 60) {
          this.fpsFrames.shift()
        }
        
        // 计算平均FPS
        if (this.fpsFrames.length > 0) {
          this.metrics.fps = Math.round(this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length)
        }
      }
      
      requestAnimationFrame(updateFPS)
    }
    
    requestAnimationFrame(updateFPS)
  }

  private monitorMemory(): void {
    if ('memory' in performance && performance.memory) {
      const mem = performance.memory
      this.metrics.memory = {
        used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
      }
    } else {
      // 浏览器不支持performance.memory时的备用方案
      this.metrics.memory = {
        used: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 100),
        total: Math.round((performance as any).memory?.totalJSHeapSize / 1024 / 1024 || 500),
        limit: Math.round((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024 || 2000)
      }
    }
  }

  private monitorCPU(): void {
    // 模拟CPU监控 - 实际项目中可以使用更精确的API
    if (navigator.hardwareConcurrency) {
      this.metrics.cpu = {
        usage: Math.min(100, Math.random() * 40 + 20), // 20-60%
        threads: navigator.hardwareConcurrency
      }
    } else {
      this.metrics.cpu = {
        usage: Math.min(100, Math.random() * 40 + 20),
        threads: 4
      }
    }
  }

  private monitorGPU(): void {
    // 模拟GPU监控 - 实际项目中可以使用WebGL扩展
    this.metrics.gpu = {
      memory: Math.round(Math.random() * 800 + 200), // 200-1000 MB
      temperature: Math.round(Math.random() * 20 + 60) // 60-80°C
    }
  }

  private monitorNetwork(): void {
    // 模拟网络监控
    this.metrics.network = {
      latency: Math.round(Math.random() * 50 + 30), // 30-80 ms
      throughput: Math.round(Math.random() * 200 + 300) // 300-500 Mbps
    }
  }

  private monitorRendering(): void {
    // 模拟渲染监控
    this.metrics.rendering = {
      frameTime: Math.round(Math.random() * 8 + 12), // 12-20 ms
      drawCalls: Math.floor(Math.random() * 300 + 100) // 100-400
    }
  }

  private checkAlerts(): void {
    const alerts: PerformanceAlert[] = []

    // FPS告警
    if (this.metrics.fps < this.thresholds.fps.critical) {
      alerts.push({
        type: 'CRITICAL',
        metric: 'fps',
        value: this.metrics.fps,
        threshold: this.thresholds.fps.critical,
        message: `FPS严重过低: ${this.metrics.fps} < ${this.thresholds.fps.critical} (临界阈值)`,
        timestamp: new Date().toISOString()
      })
    } else if (this.metrics.fps < this.thresholds.fps.warning) {
      alerts.push({
        type: 'WARNING',
        metric: 'fps',
        value: this.metrics.fps,
        threshold: this.thresholds.fps.warning,
        message: `FPS偏低: ${this.metrics.fps} < ${this.thresholds.fps.warning} (警告阈值)`,
        timestamp: new Date().toISOString()
      })
    }

    // 内存告警
    const memoryUsage = (this.metrics.memory.used / this.metrics.memory.limit) * 100
    if (memoryUsage > this.thresholds.memory.critical) {
      alerts.push({
        type: 'CRITICAL',
        metric: 'memory',
        value: Math.round(memoryUsage),
        threshold: this.thresholds.memory.critical,
        message: `内存使用严重过高: ${Math.round(memoryUsage)}% > ${this.thresholds.memory.critical}%`,
        timestamp: new Date().toISOString()
      })
    } else if (memoryUsage > this.thresholds.memory.warning) {
      alerts.push({
        type: 'WARNING',
        metric: 'memory',
        value: Math.round(memoryUsage),
        threshold: this.thresholds.memory.warning,
        message: `内存使用偏高: ${Math.round(memoryUsage)}% > ${this.thresholds.memory.warning}%`,
        timestamp: new Date().toISOString()
      })
    }

    // 触发告警处理器
    alerts.forEach(alert => {
      this.alertHandlers.forEach(handler => handler(alert))
    })
  }
}