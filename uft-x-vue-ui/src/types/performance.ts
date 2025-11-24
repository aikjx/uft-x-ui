// 性能指标类型定义
export interface PerformanceMetrics {
  fps: number
  memory: MemoryMetrics
  cpu: CPUMetrics
  gpu: GPUMetrics
  network: NetworkMetrics
  rendering: RenderingMetrics
}

export interface MemoryMetrics {
  used: number // MB
  total: number // MB
  limit: number // MB
}

export interface CPUMetrics {
  usage: number // 百分比
  threads: number
}

export interface GPUMetrics {
  memory: number // MB
  temperature: number // 摄氏度
}

export interface NetworkMetrics {
  latency: number // 毫秒
  throughput: number // Mbps
}

export interface RenderingMetrics {
  frameTime: number // 毫秒
  drawCalls: number
}

// 性能阈值定义
export interface PerformanceThresholds {
  fps: Threshold
  memory: Threshold
  cpu: Threshold
  gpu: Threshold
  network: Threshold
}

export interface Threshold {
  critical: number
  warning: number
}

// 优化建议类型
export interface OptimizationSuggestion {
  category: 'rendering' | 'memory' | 'cpu' | 'gpu' | 'network'
  priority: 'low' | 'medium' | 'high'
  suggestion: string
  impact: 'low' | 'medium' | 'high'
}

// 性能数据导出类型
export interface PerformanceExportData {
  timestamp: string
  metrics: PerformanceMetrics
  score: number
  thresholds: PerformanceThresholds
  suggestions: OptimizationSuggestion[]
}

// 性能监控事件类型
export interface PerformanceAlert {
  type: 'WARNING' | 'CRITICAL'
  metric: keyof PerformanceMetrics
  value: number
  threshold: number
  message: string
  timestamp: string
}

// 性能分析报告类型
export interface PerformanceReport {
  id: string
  timestamp: string
  duration: number // 秒
  averageMetrics: PerformanceMetrics
  peakMetrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
}

export interface PerformanceIssue {
  type: 'memory_leak' | 'high_cpu' | 'low_fps' | 'network_latency'
  severity: 'low' | 'medium' | 'high'
  description: string
  startTime: string
  endTime?: string
  duration: number
  affectedComponents: string[]
}

// 性能基准测试类型
export interface BenchmarkResult {
  name: string
  iterations: number
  averageTime: number
  minTime: number
  maxTime: number
  standardDeviation: number
  memoryUsage: number
  fps: number
}

// 实时性能数据流类型
export interface PerformanceDataPoint {
  timestamp: number
  metrics: PerformanceMetrics
  score: number
}

export interface PerformanceTrend {
  period: '1h' | '6h' | '24h' | '7d'
  dataPoints: PerformanceDataPoint[]
  averageScore: number
  trend: 'improving' | 'stable' | 'degrading'
  change: number // 百分比变化
}