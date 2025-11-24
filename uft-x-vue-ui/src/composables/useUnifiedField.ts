/**
 * 统一场论可视化组合式函数
 * Unified Field Theory Visualization Composable
 */

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { FormulaEngine } from '@/core/FormulaEngine'
import { QuantumRenderer } from '@/core/QuantumRenderer'
import {
  FormulaType,
  FormulaParameters,
  VisualizationConfig,
  ParticleSystemData,
  FieldData,
  DEFAULT_VISUALIZATION_CONFIG
} from '@/types/unified-field-theory'

export function useUnifiedField(container: HTMLElement | null) {
  const formulaEngine = new FormulaEngine()
  const renderer = ref<QuantumRenderer | null>(null)
  const isInitialized = ref(false)
  const currentFormula = ref<FormulaType>(FormulaType.SPACETIME_UNITY)
  const parameters = ref<FormulaParameters>({
    c: 299792458,
    t: 0,
    r: 1,
    omega: 1,
    h: 0.1
  })

  const config = ref<VisualizationConfig>({
    formulaType: FormulaType.SPACETIME_UNITY,
    parameters: parameters.value,
    renderMode: 'hybrid',
    quality: 'high',
    ...DEFAULT_VISUALIZATION_CONFIG
  })

  /**
   * 初始化渲染器
   */
  const initialize = () => {
    if (!container || isInitialized.value) return

    try {
      renderer.value = new QuantumRenderer(container)
      isInitialized.value = true
      console.log('✅ 量子渲染器初始化成功')
    } catch (error) {
      console.error('❌ 渲染器初始化失败:', error)
    }
  }

  /**
   * 可视化公式
   */
  const visualizeFormula = (
    formulaType: FormulaType,
    params?: Partial<FormulaParameters>
  ) => {
    if (!renderer.value) return

    currentFormula.value = formulaType

    if (params) {
      parameters.value = { ...parameters.value, ...params }
    }

    config.value.formulaType = formulaType
    config.value.parameters = parameters.value

    // 生成场数据
    const fieldData = formulaEngine.generateFieldData(
      formulaType,
      parameters.value,
      config.value.fieldResolution || 32
    )

    // 可视化场
    renderer.value.visualizeField('main-field', fieldData, config.value)

    // 如果需要粒子系统
    if (config.value.renderMode === 'particle' || config.value.renderMode === 'hybrid') {
      const particleData = generateParticleData(fieldData)
      renderer.value.createParticleSystem('main-particles', particleData, config.value)
    }
  }

  /**
   * 生成粒子数据
   */
  const generateParticleData = (fieldData: FieldData): ParticleSystemData => {
    const count = config.value.particleCount || 10000
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const lifetimes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 随机位置
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      // 随机速度
      velocities[i * 3] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1

      // 颜色（基于场类型）
      const colorScheme = config.value.colorScheme
      const fieldColor = colorScheme?.fieldColors?.[fieldData.type] || '#00d4ff'
      const color = parseInt(fieldColor.replace('#', ''), 16)
      colors[i * 3] = ((color >> 16) & 255) / 255
      colors[i * 3 + 1] = ((color >> 8) & 255) / 255
      colors[i * 3 + 2] = (color & 255) / 255

      // 大小
      sizes[i] = Math.random() * 0.5 + 0.1

      // 生命周期
      lifetimes[i] = Math.random() * 10
    }

    return {
      positions,
      velocities,
      colors,
      sizes,
      lifetimes,
      count
    }
  }

  /**
   * 更新参数
   */
  const updateParameters = (newParams: Partial<FormulaParameters>) => {
    parameters.value = { ...parameters.value, ...newParams }
    visualizeFormula(currentFormula.value, newParams)
  }

  /**
   * 更新配置
   */
  const updateConfig = (newConfig: Partial<VisualizationConfig>) => {
    config.value = { ...config.value, ...newConfig }
    visualizeFormula(currentFormula.value)
  }

  /**
   * 计算公式结果
   */
  const calculate = computed(() => {
    return formulaEngine.calculate(currentFormula.value, parameters.value)
  })

  /**
   * 获取性能统计
   */
  const getPerformanceStats = () => {
    return renderer.value?.getStats()
  }

  /**
   * 调整大小
   */
  const resize = () => {
    renderer.value?.resize()
  }

  /**
   * 清理
   */
  const cleanup = () => {
    if (renderer.value) {
      renderer.value.dispose()
      renderer.value = null
    }
    isInitialized.value = false
  }

  // 监听窗口大小变化
  onMounted(() => {
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    cleanup()
  })

  return {
    // 状态
    isInitialized,
    currentFormula,
    parameters,
    config,
    calculate,

    // 方法
    initialize,
    visualizeFormula,
    updateParameters,
    updateConfig,
    getPerformanceStats,
    resize,
    cleanup,

    // 渲染器访问
    renderer
  }
}
