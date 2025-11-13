import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export interface VisualizationConfig {
  type: '3d' | '2d' | 'interactive'
  theme: 'dark' | 'light'
  animationEnabled: boolean
  animationSpeed: number
  showGrid: boolean
  showAxes: boolean
  backgroundColor: string
}

export interface SimulationParams {
  [key: string]: number | boolean | string
}

export const useVisualizationStore = defineStore('visualization', () => {
  // 状态
  const config = reactive<VisualizationConfig>({
    type: '3d',
    theme: 'dark',
    animationEnabled: true,
    animationSpeed: 1,
    showGrid: true,
    showAxes: true,
    backgroundColor: '#1a1a1a'
  })

  const simulationParams = reactive<SimulationParams>({})
  const isRendering = ref(false)
  const performanceMetrics = ref({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  // 计算属性
  const effectiveBackgroundColor = computed(() => {
    return config.theme === 'dark' ? '#1a1a1a' : '#ffffff'
  })

  const effectiveTextColor = computed(() => {
    return config.theme === 'dark' ? '#ffffff' : '#000000'
  })

  // Actions
  function updateConfig(newConfig: Partial<VisualizationConfig>) {
    Object.assign(config, newConfig)
  }

  function updateSimulationParam(key: string, value: any) {
    simulationParams[key] = value
  }

  function updatePerformanceMetrics(metrics: Partial<typeof performanceMetrics.value>) {
    Object.assign(performanceMetrics.value, metrics)
  }

  function startRendering() {
    isRendering.value = true
  }

  function stopRendering() {
    isRendering.value = false
  }

  function resetConfig() {
    Object.assign(config, {
      type: '3d',
      theme: 'dark',
      animationEnabled: true,
      animationSpeed: 1,
      showGrid: true,
      showAxes: true,
      backgroundColor: '#1a1a1a'
    })
    // 清空模拟参数
    Object.keys(simulationParams).forEach(key => {
      delete simulationParams[key]
    })
  }

  return {
    config,
    simulationParams,
    isRendering,
    performanceMetrics,
    effectiveBackgroundColor,
    effectiveTextColor,
    updateConfig,
    updateSimulationParam,
    updatePerformanceMetrics,
    startRendering,
    stopRendering,
    resetConfig
  }
})