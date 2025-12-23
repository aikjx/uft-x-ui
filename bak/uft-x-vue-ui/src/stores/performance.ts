import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PerformanceMetrics,
  PerformanceThresholds,
  OptimizationSuggestion
} from '@/types/performance'

export const usePerformanceStore = defineStore('performance', () => {
  // 状态
  const metrics = ref<PerformanceMetrics>({
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

  const thresholds = ref<PerformanceThresholds>({
    fps: { critical: 10, warning: 30 },
    memory: { critical: 500, warning: 300 },
    cpu: { critical: 90, warning: 70 },
    gpu: { critical: 85, warning: 75 },
    network: { critical: 500, warning: 200 }
  })

  const isMonitoring = ref(false)
  const monitoringInterval = ref<NodeJS.Timeout | null>(null)

  // 计算属性
  const score = computed(() => {
    let totalScore = 100

    // FPS 评分 (权重: 30%)
    if (metrics.value.fps < thresholds.value.fps.critical) {
      totalScore -= 30
    } else if (metrics.value.fps < thresholds.value.fps.warning) {
      totalScore -= 15
    } else if (metrics.value.fps < 45) {
      totalScore -= 5
    }

    // 内存使用评分 (权重: 25%)
    const memoryUsage = (metrics.value.memory.used / metrics.value.memory.limit) * 100
    if (memoryUsage > thresholds.value.memory.critical) {
      totalScore -= 25
    } else if (memoryUsage > thresholds.value.memory.warning) {
      totalScore -= 12
    } else if (memoryUsage > 50) {
      totalScore -= 5
    }

    // CPU 使用评分 (权重: 20%)
    if (metrics.value.cpu.usage > thresholds.value.cpu.critical) {
      totalScore -= 20
    } else if (metrics.value.cpu.usage > thresholds.value.cpu.warning) {
      totalScore -= 10
    }

    // GPU 温度评分 (权重: 15%)
    if (metrics.value.gpu.temperature > thresholds.value.gpu.critical) {
      totalScore -= 15
    } else if (metrics.value.gpu.temperature > thresholds.value.gpu.warning) {
      totalScore -= 7
    }

    // 网络延迟评分 (权重: 10%)
    if (metrics.value.network.latency > thresholds.value.network.critical) {
      totalScore -= 10
    } else if (metrics.value.network.latency > thresholds.value.network.warning) {
      totalScore -= 5
    }

    return Math.max(0, totalScore)
  })

  const suggestions = computed<OptimizationSuggestion[]>(() => {
    const suggestions: OptimizationSuggestion[] = []

    // FPS 优化建议
    if (metrics.value.fps < thresholds.value.fps.critical) {
      suggestions.push({
        category: 'rendering',
        priority: 'high',
        suggestion: '优化渲染性能，减少复杂场景的绘制调用',
        impact: 'high'
      })
    } else if (metrics.value.fps < thresholds.value.fps.warning) {
      suggestions.push({
        category: 'rendering',
        priority: 'medium',
        suggestion: '考虑使用LOD(细节层次)技术优化渲染',
        impact: 'medium'
      })
    }

    // 内存优化建议
    const memoryUsage = (metrics.value.memory.used / metrics.value.memory.limit) * 100
    if (memoryUsage > thresholds.value.memory.critical) {
      suggestions.push({
        category: 'memory',
        priority: 'high',
        suggestion: '内存使用过高，检查内存泄漏并优化资源管理',
        impact: 'high'
      })
    }

    // CPU 优化建议
    if (metrics.value.cpu.usage > thresholds.value.cpu.critical) {
      suggestions.push({
        category: 'cpu',
        priority: 'high',
        suggestion: 'CPU使用率过高，优化计算密集型操作',
        impact: 'high'
      })
    }

    return suggestions
  })

  // 方法
  const startMonitoring = () => {
    if (isMonitoring.value) return

    isMonitoring.value = true
    monitoringInterval.value = setInterval(() => {
      // 模拟实时数据更新
      updateMetrics()
    }, 1000)
  }

  const stopMonitoring = () => {
    if (monitoringInterval.value) {
      clearInterval(monitoringInterval.value)
      monitoringInterval.value = null
    }
    isMonitoring.value = false
  }

  const updateMetrics = () => {
    // 模拟实时性能数据更新
    metrics.value = {
      fps: Math.random() * 30 + 30, // 30-60 FPS
      memory: {
        used: Math.random() * 200 + 100, // 100-300 MB
        total: 500,
        limit: 2000
      },
      cpu: {
        usage: Math.random() * 50 + 20, // 20-70%
        threads: 4
      },
      gpu: {
        memory: Math.random() * 1000 + 500, // 500-1500 MB
        temperature: Math.random() * 30 + 50 // 50-80°C
      },
      network: {
        latency: Math.random() * 100 + 50, // 50-150 ms
        throughput: Math.random() * 500 + 500 // 500-1000 Mbps
      },
      rendering: {
        frameTime: Math.random() * 10 + 10, // 10-20 ms
        drawCalls: Math.floor(Math.random() * 200 + 50) // 50-250
      }
    }
  }

  const setThresholds = (newThresholds: Partial<PerformanceThresholds>) => {
    thresholds.value = { ...thresholds.value, ...newThresholds }
  }

  const exportData = () => ({
    timestamp: new Date().toISOString(),
    metrics: metrics.value,
    score: score.value,
    thresholds: thresholds.value,
    suggestions: suggestions.value
  })

  return {
    // 状态
    metrics,
    thresholds,
    isMonitoring,

    // 计算属性
    score,
    suggestions,

    // 方法
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    setThresholds,
    exportData
  }
})
