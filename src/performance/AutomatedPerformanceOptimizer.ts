/**
 * 🤖 自动化性能优化器
 * 实现智能性能监控和自动优化策略，根据设备性能和实时指标动态调整可视化参数
 */

import {
  UnifiedPerformanceManager,
  UnifiedPerformanceMetrics,
  UnifiedPerformanceConfig
} from './UnifiedPerformanceManager'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import { PerformanceOptimizer, OptimizationStrategy } from './PerformanceOptimizer'
import { VISUALIZATION_CONFIG } from '../constants'
import {
  MLPerformancePredictor,
  PerformanceData,
  OptimizationParams
} from './MLPerformancePredictor'

// 自动化优化模式
export enum AutomatedOptimizationMode {
  OFF = 'off',
  CONSERVATIVE = 'conservative', // 保守模式：优先保证稳定运行
  BALANCED = 'balanced', // 平衡模式：平衡性能和视觉效果
  PERFORMANCE = 'performance', // 性能模式：优先保证流畅度
  QUALITY = 'quality', // 质量模式：优先保证视觉质量
  AGGRESSIVE = 'aggressive', // 激进模式：动态优化到极限
  AUTO = 'auto' // 自动模式：根据设备性能智能调整
}

// 自动化优化配置
interface AutomatedOptimizationConfig {
  mode: AutomatedOptimizationMode
  targetFPS: number
  maxMemoryUsageMB: number
  maxDrawCalls: number
  autoAdjustParticleCount: boolean
  autoAdjustRenderScale: boolean
  autoAdjustShadowQuality: boolean
  autoAdjustPostProcessing: boolean
  enableAIOptimization: boolean
  optimizationInterval: number
  minOptimizationGain: number
}

// 设备性能等级
enum DevicePerformanceLevel {
  LOW = 'low', // 低端设备
  MEDIUM = 'medium', // 中端设备
  HIGH = 'high', // 高端设备
  ULTRA = 'ultra' // 超高端设备
}

/**
 * 自动化性能优化控制器
 * 实现智能性能监控和自动优化策略
 */
export class AutomatedPerformanceOptimizer {
  private static instance: AutomatedPerformanceOptimizer
  private performanceManager: UnifiedPerformanceManager
  private config: AutomatedOptimizationConfig
  private isInitialized: boolean = false
  private optimizationTimer: number | null = null
  private devicePerformanceLevel: DevicePerformanceLevel = DevicePerformanceLevel.MEDIUM
  private currentMetrics: UnifiedPerformanceMetrics | null = null
  private optimizationHistory: Array<{
    timestamp: number
    metrics: UnifiedPerformanceMetrics
    actions: Array<{ type: string; value: any; expectedGain: number }>
  }> = []
  private mlPredictor: MLPerformancePredictor = new MLPerformancePredictor()

  private constructor() {
    this.performanceManager = UnifiedPerformanceManager.getInstance()

    // 默认配置
    this.config = {
      mode: AutomatedOptimizationMode.AUTO,
      targetFPS: 60,
      maxMemoryUsageMB: 512,
      maxDrawCalls: 1000,
      autoAdjustParticleCount: true,
      autoAdjustRenderScale: true,
      autoAdjustShadowQuality: true,
      autoAdjustPostProcessing: true,
      enableAIOptimization: true,
      optimizationInterval: 2000,
      minOptimizationGain: 0.05
    }

    this.initialize()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AutomatedPerformanceOptimizer {
    if (!AutomatedPerformanceOptimizer.instance) {
      AutomatedPerformanceOptimizer.instance = new AutomatedPerformanceOptimizer()
    }
    return AutomatedPerformanceOptimizer.instance
  }

  /**
   * 初始化自动化性能优化器
   */
  private initialize(): void {
    // 监听性能指标更新事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, (data: any) => {
      this.currentMetrics = data.performanceData
      this.optimize()

      // 收集性能数据用于模型训练
      this.collectPerformanceData(data)
    })

    // 监听设备性能变化事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_MODE_CHANGE, (data: any) => {
      this.updatePerformanceMode(data.isPerformanceMode)
    })

    // 监听资源释放事件
    eventSystem.on(APP_EVENTS.RELEASE_UNUSED_RESOURCES, () => {
      this.releaseUnusedResources()
    })

    this.isInitialized = true
    this.detectDevicePerformanceLevel()
    this.startOptimizationLoop()

    // 初始化机器学习模型
    this.initMLPredictor()
  }

  /**
   * 初始化机器学习预测器
   */
  private async initMLPredictor(): Promise<void> {
    try {
      // 加载预训练模型
      await this.mlPredictor.loadModel()

      // 如果模型未训练，生成一些初始训练数据
      if (!this.mlPredictor['isTrained']) {
        this.generateInitialTrainingData()
      }
    } catch (error) {
      console.warn('Failed to initialize ML predictor:', error)
    }
  }

  /**
   * 收集性能数据用于模型训练
   */
  private collectPerformanceData(data: any): void {
    try {
      const performanceData: PerformanceData = {
        fps: data.fps || 60,
        renderTime: data.renderTime || 16.67,
        frameTime: data.frameTime || 16.67,
        drawCalls: data.drawCalls || 0,
        triangles: data.triangles || 0,
        particleCount: data.particleCount || 1000,
        renderScale: data.renderScale || 1.0,
        shadowQuality: data.shadowQuality || 0.5,
        postProcessing: data.postProcessing || false,
        textureMemory: data.textureMemory || 50,
        objectCount: data.objectCount || 100,
        complexObjectCount: data.complexObjectCount || 10,
        thermalState: data.thermalState || 'normal',
        batteryLevel: data.batteryLevel || 1.0,
        devicePerformanceLevel: this.devicePerformanceLevel as 'low' | 'medium' | 'high' | 'ultra'
      }

      this.mlPredictor.addTrainingData(performanceData)
    } catch (error) {
      console.warn('Failed to collect performance data:', error)
    }
  }

  /**
   * 生成初始训练数据
   */
  private generateInitialTrainingData(): void {
    // 生成一些模拟的训练数据
    const deviceLevels = ['low', 'medium', 'high', 'ultra'] as const
    const thermalStates = ['normal', 'warm', 'hot'] as const

    for (let i = 0; i < 100; i++) {
      const deviceLevel = deviceLevels[Math.floor(Math.random() * deviceLevels.length)]
      const thermalState = thermalStates[Math.floor(Math.random() * thermalStates.length)]

      const performanceData: PerformanceData = {
        fps: Math.random() * 30 + 30,
        renderTime: 1000 / (Math.random() * 30 + 30),
        frameTime: 1000 / (Math.random() * 30 + 30),
        drawCalls: Math.random() * 800 + 200,
        triangles: Math.random() * 500000 + 100000,
        particleCount: Math.random() * 15000 + 5000,
        renderScale: Math.random() * 1.5 + 0.5,
        shadowQuality: Math.random(),
        postProcessing: Math.random() > 0.5,
        textureMemory: Math.random() * 150 + 50,
        objectCount: Math.random() * 800 + 200,
        complexObjectCount: Math.random() * 80 + 20,
        thermalState: thermalState,
        batteryLevel: Math.random(),
        devicePerformanceLevel: deviceLevel
      }

      this.mlPredictor.addTrainingData(performanceData)
    }

    // 训练模型
    this.mlPredictor.trainModel().catch(console.warn)
  }

  /**
   * 检测设备性能等级
   */
  private detectDevicePerformanceLevel(): void {
    // 基于硬件特性和浏览器支持检测设备性能
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

    let score = 1.0

    // 检查WebGL支持
    if (!gl) {
      this.devicePerformanceLevel = DevicePerformanceLevel.LOW
      return
    }

    // 检查设备像素比
    const pixelRatio = window.devicePixelRatio
    if (pixelRatio < 1.5) {
      score *= 0.7
    } else if (pixelRatio > 2.5) {
      score *= 1.3
    }

    // 检查内存大小
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory
      if (deviceMemory < 4) {
        score *= 0.6
      } else if (deviceMemory >= 8) {
        score *= 1.4
      }
    }

    // 检查CPU核心数
    if ('hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency
      if (cores < 4) {
        score *= 0.7
      } else if (cores >= 8) {
        score *= 1.3
      }
    }

    // 确定设备性能等级
    if (score < 0.7) {
      this.devicePerformanceLevel = DevicePerformanceLevel.LOW
    } else if (score < 1.0) {
      this.devicePerformanceLevel = DevicePerformanceLevel.MEDIUM
    } else if (score < 1.3) {
      this.devicePerformanceLevel = DevicePerformanceLevel.HIGH
    } else {
      this.devicePerformanceLevel = DevicePerformanceLevel.ULTRA
    }

    // 输出设备性能等级
    console.log(`🎮 设备性能等级: ${this.devicePerformanceLevel}`)
  }

  /**
   * 启动优化循环
   */
  private startOptimizationLoop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer)
    }

    this.optimizationTimer = window.setInterval(async () => {
      try {
        await this.optimize()
      } catch (error) {
        console.warn('Optimization loop error:', error)
      }
    }, this.config.optimizationInterval) as unknown as number
  }

  /**
   * 停止优化循环
   */
  public stop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer)
      this.optimizationTimer = null
    }
  }

  /**
   * 更新优化配置
   */
  public updateConfig(config: Partial<AutomatedOptimizationConfig>): void {
    this.config = { ...this.config, ...config }
    this.startOptimizationLoop()
  }

  /**
   * 获取当前优化配置
   */
  public getConfig(): AutomatedOptimizationConfig {
    return { ...this.config }
  }

  /**
   * 执行自动化优化
   */
  public async optimize(): Promise<void> {
    if (!this.currentMetrics) return

    const metrics = this.currentMetrics
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 执行性能分析，生成详细的优化报告
    const analysis = this.performPerformanceAnalysis(metrics)

    // 根据当前模式执行不同的优化策略
    switch (this.config.mode) {
      case AutomatedOptimizationMode.CONSERVATIVE:
        actions.push(...this.performConservativeOptimization(metrics, analysis))
        break
      case AutomatedOptimizationMode.BALANCED:
        actions.push(...this.performBalancedOptimization(metrics, analysis))
        break
      case AutomatedOptimizationMode.PERFORMANCE:
        actions.push(...this.performPerformanceOptimization(metrics, analysis))
        break
      case AutomatedOptimizationMode.QUALITY:
        actions.push(...this.performQualityOptimization(metrics, analysis))
        break
      case AutomatedOptimizationMode.AGGRESSIVE:
        actions.push(...this.performAggressiveOptimization(metrics, analysis))
        break
      case AutomatedOptimizationMode.AUTO:
      default:
        const autoActions = await this.performAutoOptimization(metrics, analysis)
        actions.push(...autoActions)
        break
    }

    // 执行所有优化操作
    actions.forEach(action => {
      this.executeOptimizationAction(action)
    })

    // 记录优化历史
    if (actions.length > 0) {
      this.optimizationHistory.push({
        timestamp: Date.now(),
        metrics: { ...metrics },
        actions,
        analysis
      })

      // 限制历史记录长度
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory.shift()
      }
    }
  }

  /**
   * 执行性能分析
   * 根据当前性能指标生成详细的性能分析报告
   */
  private performPerformanceAnalysis(metrics: UnifiedPerformanceMetrics): {
    issues: Array<{
      severity: 'low' | 'medium' | 'high'
      category: string
      message: string
      impact: number
    }>
    bottlenecks: string[]
    recommendations: Array<{
      action: string
      expectedGain: number
      priority: 'low' | 'medium' | 'high'
    }>
  } {
    const issues: Array<{
      severity: 'low' | 'medium' | 'high'
      category: string
      message: string
      impact: number
    }> = []
    const bottlenecks: string[] = []
    const recommendations: Array<{
      action: string
      expectedGain: number
      priority: 'low' | 'medium' | 'high'
    }> = []

    // 分析FPS问题
    if (metrics.fps < this.config.targetFPS * 0.6) {
      issues.push({
        severity: 'high',
        category: 'fps',
        message: '帧率严重不足，影响用户体验',
        impact: 0.3
      })
      bottlenecks.push('low_fps')
      recommendations.push(
        { action: '降低粒子数量', expectedGain: 25, priority: 'high' },
        { action: '降低渲染分辨率', expectedGain: 20, priority: 'high' },
        { action: '关闭后处理效果', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.fps < this.config.targetFPS * 0.8) {
      issues.push({
        severity: 'medium',
        category: 'fps',
        message: '帧率偏低，建议优化',
        impact: 0.15
      })
      bottlenecks.push('low_fps')
      recommendations.push(
        { action: '降低粒子密度', expectedGain: 15, priority: 'medium' },
        { action: '降低阴影质量', expectedGain: 10, priority: 'medium' },
        { action: '简化后处理效果', expectedGain: 10, priority: 'medium' }
      )
    }

    // 分析内存问题
    if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.95) {
      issues.push({
        severity: 'high',
        category: 'memory',
        message: '内存使用接近上限，可能导致崩溃',
        impact: 0.25
      })
      bottlenecks.push('high_memory_usage')
      recommendations.push(
        { action: '立即释放未使用的资源', expectedGain: 20, priority: 'high' },
        { action: '降低纹理质量', expectedGain: 15, priority: 'high' },
        { action: '减少粒子数量', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.8) {
      issues.push({
        severity: 'medium',
        category: 'memory',
        message: '内存使用较高，建议优化',
        impact: 0.1
      })
      bottlenecks.push('high_memory_usage')
      recommendations.push(
        { action: '释放未使用的资源', expectedGain: 10, priority: 'medium' },
        { action: '优化资源缓存', expectedGain: 5, priority: 'medium' }
      )
    }

    // 分析渲染问题
    if (metrics.drawCalls > this.config.maxDrawCalls * 0.9) {
      issues.push({
        severity: 'medium',
        category: 'rendering',
        message: 'Draw calls过多，影响渲染性能',
        impact: 0.15
      })
      bottlenecks.push('high_draw_calls')
      recommendations.push(
        { action: '合并几何体', expectedGain: 15, priority: 'medium' },
        { action: '使用实例化渲染', expectedGain: 10, priority: 'medium' }
      )
    }

    if (metrics.triangleCount > 500000) {
      issues.push({
        severity: 'medium',
        category: 'rendering',
        message: '三角形数量过多，影响渲染性能',
        impact: 0.1
      })
      bottlenecks.push('high_triangle_count')
      recommendations.push(
        { action: '使用LOD技术', expectedGain: 10, priority: 'medium' },
        { action: '简化几何体', expectedGain: 8, priority: 'medium' }
      )
    }

    // 分析设备状态
    if (metrics.thermalState === 'hot') {
      issues.push({
        severity: 'high',
        category: 'device',
        message: '设备温度过高，可能导致性能下降',
        impact: 0.2
      })
      bottlenecks.push('device_overheating')
      recommendations.push(
        { action: '降低性能模式', expectedGain: 20, priority: 'high' },
        { action: '减少粒子数量', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.thermalState === 'warm') {
      issues.push({
        severity: 'low',
        category: 'device',
        message: '设备温度较高，建议适当降低性能',
        impact: 0.05
      })
      bottlenecks.push('device_warm')
      recommendations.push({ action: '适当降低性能', expectedGain: 10, priority: 'low' })
    }

    // 分析电池状态
    if (metrics.batteryLevel !== undefined && metrics.batteryLevel < 0.2) {
      issues.push({
        severity: 'medium',
        category: 'battery',
        message: '电池电量较低，建议降低性能',
        impact: 0.1
      })
      bottlenecks.push('low_battery')
      recommendations.push(
        { action: '降低性能模式', expectedGain: 15, priority: 'medium' },
        { action: '关闭后处理效果', expectedGain: 10, priority: 'medium' }
      )
    }

    return {
      issues,
      bottlenecks,
      recommendations
    }
  }

  /**
   * 根据性能分析结果执行保守优化
   */
  private performConservativeOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 确保帧率至少达到30fps
    if (metrics.fps < 30) {
      // 减少粒子数量
      actions.push({
        type: 'particleCount',
        value: Math.max(100, metrics.particleCount * 0.7),
        expectedGain: 15
      })

      // 降低渲染分辨率
      actions.push({
        type: 'renderScale',
        value: Math.max(0.5, metrics.renderScale * 0.8),
        expectedGain: 20
      })

      // 关闭阴影
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 })

      // 关闭后处理
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 })
    }

    // 确保内存使用不超过限制
    if (metrics.memoryUsage > this.config.maxMemoryUsageMB) {
      actions.push({ type: 'memoryLimit', value: this.config.maxMemoryUsageMB, expectedGain: 5 })
    }

    return actions
  }

  /**
   * 根据性能分析结果执行平衡优化
   */
  private performBalancedOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 目标帧率：45-60fps
    if (metrics.fps < 45) {
      // 适当减少粒子数量
      actions.push({
        type: 'particleCount',
        value: Math.max(500, metrics.particleCount * 0.85),
        expectedGain: 10
      })

      // 适当降低渲染分辨率
      actions.push({
        type: 'renderScale',
        value: Math.max(0.7, metrics.renderScale * 0.9),
        expectedGain: 15
      })
    }

    // 确保内存使用不超过限制
    if (metrics.memoryUsage > this.config.maxMemoryUsageMB) {
      actions.push({ type: 'memoryLimit', value: this.config.maxMemoryUsageMB, expectedGain: 5 })
    }

    return actions
  }

  /**
   * 根据性能分析结果执行性能优化
   */
  private performPerformanceOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 优先保证60fps
    if (metrics.fps < this.config.targetFPS) {
      // 大幅减少粒子数量
      actions.push({
        type: 'particleCount',
        value: Math.max(50, metrics.particleCount * 0.5),
        expectedGain: 25
      })

      // 降低渲染分辨率
      actions.push({
        type: 'renderScale',
        value: Math.max(0.5, metrics.renderScale * 0.7),
        expectedGain: 20
      })

      // 关闭阴影
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 })

      // 简化后处理
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 })
    }

    return actions
  }

  /**
   * 根据性能分析结果执行质量优化
   */
  private performQualityOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 在保证30fps的前提下最大化视觉效果
    if (metrics.fps >= 30) {
      // 增加粒子数量
      actions.push({
        type: 'particleCount',
        value: Math.min(20000, metrics.particleCount * 1.2),
        expectedGain: -10
      })

      // 提高渲染分辨率
      actions.push({
        type: 'renderScale',
        value: Math.min(1.0, metrics.renderScale * 1.1),
        expectedGain: -15
      })

      // 提高阴影质量
      actions.push({
        type: 'shadowQuality',
        value: Math.min(1.0, metrics.shadowQuality * 1.2),
        expectedGain: -10
      })

      // 启用完整后处理
      actions.push({ type: 'postProcessing', value: true, expectedGain: -15 })
    }

    return actions
  }

  /**
   * 根据性能分析结果执行激进优化
   */
  private performAggressiveOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 动态调整到极限
    if (metrics.fps < this.config.targetFPS) {
      // 减少粒子数量到最小
      actions.push({
        type: 'particleCount',
        value: Math.max(10, metrics.particleCount * 0.3),
        expectedGain: 30
      })

      // 降低渲染分辨率到最低
      actions.push({
        type: 'renderScale',
        value: Math.max(0.3, metrics.renderScale * 0.5),
        expectedGain: 25
      })

      // 关闭所有消耗性能的功能
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 })
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 })
      actions.push({ type: 'particleDensity', value: 0.5, expectedGain: 10 })
    }

    return actions
  }

  /**
   * 根据性能分析结果执行自动优化
   */
  private async performAutoOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Promise<Array<{ type: string; value: any; expectedGain: number }>> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 根据设备性能等级调整优化策略
    switch (this.devicePerformanceLevel) {
      case DevicePerformanceLevel.LOW:
        actions.push(...this.performConservativeOptimization(metrics, analysis))
        break
      case DevicePerformanceLevel.MEDIUM:
        actions.push(...this.performBalancedOptimization(metrics, analysis))
        break
      case DevicePerformanceLevel.HIGH:
        actions.push(...this.performQualityOptimization(metrics, analysis))
        break
      case DevicePerformanceLevel.ULTRA:
        // 超高端设备可以使用激进的质量设置
        actions.push({
          type: 'particleCount',
          value: Math.min(50000, metrics.particleCount * 1.5),
          expectedGain: -5
        })
        actions.push({ type: 'renderScale', value: 1.0, expectedGain: -10 })
        actions.push({ type: 'shadowQuality', value: 1.0, expectedGain: -5 })
        actions.push({ type: 'postProcessing', value: true, expectedGain: -10 })
        break
    }

    // 根据性能分析结果执行智能优化
    if (this.config.enableAIOptimization) {
      const aiActions = await this.performAIOptimization(metrics, analysis)
      actions.push(...aiActions)
    }

    return actions
  }

  /**
   * AI优化（基于历史数据和机器学习模型）
   */
  private async performAIOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Promise<Array<{ type: string; value: any; expectedGain: number }>> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 基于历史数据的智能优化
    if (this.optimizationHistory.length > 5) {
      // 分析历史数据，找出最佳参数组合
      const optimalParams = this.findOptimalParametersFromHistory()

      // 根据最佳参数执行优化
      if (optimalParams) {
        for (const [param, value] of Object.entries(optimalParams)) {
          if (metrics[param as keyof UnifiedPerformanceMetrics] !== undefined) {
            const currentValue = metrics[param as keyof UnifiedPerformanceMetrics] as number
            const expectedGain = this.calculateExpectedGain(param, currentValue, value as number)

            if (expectedGain > this.config.minOptimizationGain) {
              actions.push({
                type: param,
                value: value,
                expectedGain
              })
            }
          }
        }
      }
    }

    // 基于机器学习的优化
    try {
      const mlActions = await this.performMLOptimization(metrics, analysis)
      actions.push(...mlActions)
    } catch (error) {
      console.warn('ML optimization failed:', error)
    }

    // 基于性能分析的针对性优化
    analysis.bottlenecks.forEach((bottleneck: string) => {
      switch (bottleneck) {
        case 'low_fps':
          // 帧率瓶颈优化
          actions.push(...this.optimizeFPSBottleneck(metrics))
          break
        case 'high_memory_usage':
          // 内存瓶颈优化
          actions.push(...this.optimizeMemoryBottleneck(metrics))
          break
        case 'high_draw_calls':
          // Draw Calls瓶颈优化
          actions.push(...this.optimizeDrawCallsBottleneck(metrics))
          break
        case 'high_triangle_count':
          // 三角形数量瓶颈优化
          actions.push(...this.optimizeTriangleCountBottleneck(metrics))
          break
        case 'device_overheating':
          // 设备过热优化
          actions.push(...this.optimizeDeviceOverheating(metrics))
          break
        case 'low_battery':
          // 低电量优化
          actions.push(...this.optimizeLowBattery(metrics))
          break
      }
    })

    // 自适应优化：根据当前设备状态调整优化策略
    actions.push(...this.performAdaptiveOptimization(metrics, analysis))

    return actions
  }

  /**
   * 基于机器学习的优化
   */
  private async performMLOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Promise<Array<{ type: string; value: any; expectedGain: number }>> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 准备当前参数
    const currentParams: OptimizationParams = {
      particleCount: metrics.particleCount || 1000,
      renderScale: metrics.renderScale || 1.0,
      shadowQuality: metrics.shadowQuality || 0.5,
      postProcessing: metrics.postProcessing || false,
      textureMemory: metrics.textureMemory || 50,
      objectCount: metrics.objectCount || 100,
      complexObjectCount: metrics.complexObjectCount || 10
    }

    // 准备设备数据
    const deviceData = {
      thermalState: metrics.thermalState || 'normal',
      batteryLevel: metrics.batteryLevel || 1.0,
      devicePerformanceLevel: this.devicePerformanceLevel as 'low' | 'medium' | 'high' | 'ultra'
    }

    // 预测当前参数的性能
    const currentPrediction = await this.mlPredictor.predictPerformance(currentParams, deviceData)

    // 优化参数以达到目标FPS
    const optimizedParams = await this.mlPredictor.optimizeParameters(
      this.config.targetFPS,
      deviceData,
      {
        maxParticleCount: metrics.particleCount * 1.2,
        maxRenderScale: window.devicePixelRatio,
        maxShadowQuality: 1.0,
        allowPostProcessing: true,
        maxTextureMemory: metrics.textureMemory * 1.2,
        maxObjectCount: metrics.objectCount * 1.2,
        maxComplexObjectCount: metrics.complexObjectCount * 1.2
      }
    )

    // 预测优化后的性能
    const optimizedPrediction = await this.mlPredictor.predictPerformance(
      optimizedParams,
      deviceData
    )

    // 计算预期性能提升
    const expectedGain = optimizedPrediction.fps - currentPrediction.fps

    if (expectedGain > 5) {
      // 添加优化动作
      if (optimizedParams.particleCount !== currentParams.particleCount) {
        actions.push({
          type: 'particleCount',
          value: optimizedParams.particleCount,
          expectedGain: expectedGain * 0.3
        })
      }

      if (optimizedParams.renderScale !== currentParams.renderScale) {
        actions.push({
          type: 'renderScale',
          value: optimizedParams.renderScale,
          expectedGain: expectedGain * 0.25
        })
      }

      if (optimizedParams.shadowQuality !== currentParams.shadowQuality) {
        actions.push({
          type: 'shadowQuality',
          value: optimizedParams.shadowQuality,
          expectedGain: expectedGain * 0.15
        })
      }

      if (optimizedParams.postProcessing !== currentParams.postProcessing) {
        actions.push({
          type: 'postProcessing',
          value: optimizedParams.postProcessing,
          expectedGain: expectedGain * 0.2
        })
      }

      if (optimizedParams.textureMemory !== currentParams.textureMemory) {
        actions.push({
          type: 'textureMemory',
          value: optimizedParams.textureMemory,
          expectedGain: expectedGain * 0.1
        })
      }
    }

    return actions
  }

  /**
   * 从历史数据中找出最佳参数组合
   */
  private findOptimalParametersFromHistory(): Record<string, number> | null {
    if (this.optimizationHistory.length < 3) {
      return null
    }

    // 筛选出性能较好的历史记录
    const goodHistory = this.optimizationHistory.filter(
      entry => entry.metrics.fps >= this.config.targetFPS * 0.8
    )

    if (goodHistory.length === 0) {
      return null
    }

    // 计算各参数的平均值
    const paramStats: Record<string, { sum: number; count: number; min: number; max: number }> = {}

    goodHistory.forEach(entry => {
      const metrics = entry.metrics

      // 统计关键参数
      const keyParams = [
        'particleCount',
        'renderScale',
        'shadowQuality',
        'postProcessing',
        'textureMemory',
        'drawCalls',
        'triangleCount'
      ]

      keyParams.forEach(param => {
        if (metrics[param as keyof UnifiedPerformanceMetrics] !== undefined) {
          const value = metrics[param as keyof UnifiedPerformanceMetrics] as number

          if (!paramStats[param]) {
            paramStats[param] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
          }

          paramStats[param].sum += value
          paramStats[param].count += 1
          paramStats[param].min = Math.min(paramStats[param].min, value)
          paramStats[param].max = Math.max(paramStats[param].max, value)
        }
      })
    })

    // 计算最佳参数值
    const optimalParams: Record<string, number> = {}

    for (const [param, stats] of Object.entries(paramStats)) {
      if (stats.count > 0) {
        // 对于不同参数使用不同的优化策略
        switch (param) {
          case 'particleCount':
            // 粒子数量：使用75%分位数（平衡性能和效果）
            optimalParams[param] = Math.round(stats.max * 0.75)
            break
          case 'renderScale':
            // 渲染分辨率：使用平均值
            optimalParams[param] = Math.round((stats.sum / stats.count) * 100) / 100
            break
          case 'shadowQuality':
            // 阴影质量：根据设备性能调整
            optimalParams[param] =
              this.devicePerformanceLevel >= DevicePerformanceLevel.HIGH ? 1.0 : 0.5
            break
          case 'textureMemory':
            // 纹理内存：使用平均值
            optimalParams[param] = Math.round((stats.sum / stats.count) * 100) / 100
            break
          case 'drawCalls':
            // Draw Calls：使用最小值
            optimalParams[param] = stats.min
            break
          case 'triangleCount':
            // 三角形数量：使用最小值
            optimalParams[param] = stats.min
            break
          default:
            // 其他参数：使用平均值
            optimalParams[param] = Math.round((stats.sum / stats.count) * 100) / 100
        }
      }
    }

    return optimalParams
  }

  /**
   * 计算优化预期增益
   */
  private calculateExpectedGain(param: string, currentValue: number, targetValue: number): number {
    const gainFactors: Record<string, number> = {
      particleCount: 0.3, // 粒子数量对性能影响较大
      renderScale: 0.25, // 渲染分辨率影响显著
      shadowQuality: 0.15, // 阴影质量影响中等
      textureMemory: 0.2, // 纹理内存影响较大
      drawCalls: 0.25, // Draw Calls影响显著
      triangleCount: 0.2 // 三角形数量影响中等
    }

    const factor = gainFactors[param] || 0.1
    const changeRatio = Math.abs(targetValue - currentValue) / currentValue

    return Math.round(changeRatio * 100 * factor)
  }

  /**
   * 优化帧率瓶颈
   */
  private optimizeFPSBottleneck(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 分层优化策略：先尝试影响小的优化，再尝试影响大的优化
    if (metrics.fps < this.config.targetFPS * 0.5) {
      // 严重帧率问题：需要激进优化
      actions.push({
        type: 'particleCount',
        value: Math.max(100, metrics.particleCount * 0.6),
        expectedGain: 25
      })
      actions.push({
        type: 'renderScale',
        value: Math.max(0.5, metrics.renderScale * 0.7),
        expectedGain: 20
      })
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 15 })
      actions.push({ type: 'postProcessing', value: false, expectedGain: 20 })
    } else if (metrics.fps < this.config.targetFPS * 0.7) {
      // 中等帧率问题：需要中度优化
      actions.push({
        type: 'particleCount',
        value: Math.max(500, metrics.particleCount * 0.8),
        expectedGain: 15
      })
      actions.push({
        type: 'renderScale',
        value: Math.max(0.7, metrics.renderScale * 0.9),
        expectedGain: 10
      })
      actions.push({
        type: 'shadowQuality',
        value: Math.max(0, metrics.shadowQuality * 0.8),
        expectedGain: 10
      })
    } else {
      // 轻微帧率问题：需要轻度优化
      actions.push({
        type: 'particleCount',
        value: Math.max(1000, metrics.particleCount * 0.9),
        expectedGain: 5
      })
      actions.push({
        type: 'triangleCount',
        value: Math.max(100000, metrics.triangleCount * 0.9),
        expectedGain: 5
      })
    }

    return actions
  }

  /**
   * 优化内存瓶颈
   */
  private optimizeMemoryBottleneck(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 释放未使用资源
    actions.push({ type: 'releaseUnusedResources', value: true, expectedGain: 10 })

    // 降低纹理质量和内存使用
    actions.push({
      type: 'textureMemory',
      value: Math.max(0.5, metrics.textureMemory * 0.7),
      expectedGain: 15
    })

    // 减少粒子数量
    actions.push({
      type: 'particleCount',
      value: Math.max(500, metrics.particleCount * 0.8),
      expectedGain: 10
    })

    // 调整内存限制
    actions.push({
      type: 'memoryLimit',
      value: Math.max(256, this.config.maxMemoryUsageMB * 0.8),
      expectedGain: 5
    })

    return actions
  }

  /**
   * 优化Draw Calls瓶颈
   */
  private optimizeDrawCallsBottleneck(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 合并几何体
    actions.push({ type: 'mergeGeometries', value: true, expectedGain: 15 })

    // 使用实例化渲染
    actions.push({ type: 'useInstancedRendering', value: true, expectedGain: 20 })

    // 减少对象数量
    actions.push({
      type: 'objectCount',
      value: Math.max(100, metrics.objectCount * 0.8),
      expectedGain: 10
    })

    return actions
  }

  /**
   * 优化三角形数量瓶颈
   */
  private optimizeTriangleCountBottleneck(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 使用LOD技术
    actions.push({ type: 'useLOD', value: true, expectedGain: 15 })

    // 简化几何体
    actions.push({ type: 'simplifyGeometries', value: true, expectedGain: 10 })

    // 减少高复杂度对象
    actions.push({
      type: 'complexObjectCount',
      value: Math.max(10, metrics.complexObjectCount * 0.7),
      expectedGain: 15
    })

    return actions
  }

  /**
   * 优化设备过热
   */
  private optimizeDeviceOverheating(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 降低性能模式
    actions.push({ type: 'performanceMode', value: true, expectedGain: 20 })

    // 减少粒子数量
    actions.push({
      type: 'particleCount',
      value: Math.max(100, metrics.particleCount * 0.6),
      expectedGain: 15
    })

    // 降低渲染分辨率
    actions.push({
      type: 'renderScale',
      value: Math.max(0.5, metrics.renderScale * 0.7),
      expectedGain: 15
    })

    // 关闭后处理效果
    actions.push({ type: 'postProcessing', value: false, expectedGain: 15 })

    return actions
  }

  /**
   * 优化低电量
   */
  private optimizeLowBattery(
    metrics: UnifiedPerformanceMetrics
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 降低性能模式
    actions.push({ type: 'performanceMode', value: true, expectedGain: 15 })

    // 减少渲染负担
    actions.push({
      type: 'renderScale',
      value: Math.max(0.7, metrics.renderScale * 0.9),
      expectedGain: 10
    })
    actions.push({
      type: 'shadowQuality',
      value: Math.max(0, metrics.shadowQuality * 0.8),
      expectedGain: 10
    })

    return actions
  }

  /**
   * 自适应优化：根据当前设备状态调整优化策略
   */
  private performAdaptiveOptimization(
    metrics: UnifiedPerformanceMetrics,
    analysis: any
  ): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = []

    // 根据设备性能等级调整优化策略
    switch (this.devicePerformanceLevel) {
      case DevicePerformanceLevel.LOW:
        // 低端设备：保守优化
        actions.push({ type: 'renderScale', value: 0.6, expectedGain: 20 })
        actions.push({
          type: 'particleCount',
          value: Math.max(500, metrics.particleCount * 0.5),
          expectedGain: 25
        })
        actions.push({ type: 'shadowQuality', value: 0, expectedGain: 15 })
        break
      case DevicePerformanceLevel.MEDIUM:
        // 中端设备：平衡优化
        actions.push({
          type: 'renderScale',
          value: Math.min(0.9, metrics.renderScale * 0.95),
          expectedGain: 10
        })
        actions.push({
          type: 'particleCount',
          value: Math.max(1000, metrics.particleCount * 0.85),
          expectedGain: 15
        })
        break
      case DevicePerformanceLevel.HIGH:
        // 高端设备：质量优先
        actions.push({
          type: 'renderScale',
          value: Math.min(1.0, metrics.renderScale * 1.05),
          expectedGain: -5
        })
        actions.push({
          type: 'particleCount',
          value: Math.min(20000, metrics.particleCount * 1.1),
          expectedGain: -10
        })
        break
      case DevicePerformanceLevel.ULTRA:
        // 超高端设备：极致质量
        actions.push({ type: 'renderScale', value: 1.0, expectedGain: -10 })
        actions.push({
          type: 'particleCount',
          value: Math.min(50000, metrics.particleCount * 1.2),
          expectedGain: -15
        })
        actions.push({ type: 'shadowQuality', value: 1.0, expectedGain: -5 })
        actions.push({ type: 'postProcessing', value: true, expectedGain: -15 })
        break
    }

    return actions
  }

  /**
   * 更新性能模式
   */
  private updatePerformanceMode(isPerformanceMode: boolean): void {
    this.config.mode = isPerformanceMode
      ? AutomatedOptimizationMode.PERFORMANCE
      : AutomatedOptimizationMode.BALANCED
  }

  /**
   * 释放未使用的资源
   */
  private releaseUnusedResources(): void {
    // 释放未使用的纹理和模型
    eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, {})
  }

  /**
   * 执行优化操作
   */
  private executeOptimizationAction(action: {
    type: string
    value: any
    expectedGain: number
  }): void {
    switch (action.type) {
      case 'particleCount':
        eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, { density: action.value })
        eventSystem.emit(APP_EVENTS.MAX_PARTICLES_CHANGE, { maxParticles: action.value })
        break
      case 'renderScale':
        eventSystem.emit(APP_EVENTS.RENDER_SCALE_CHANGE, { scale: action.value })
        break
      case 'shadowQuality':
        eventSystem.emit(APP_EVENTS.SHADOW_QUALITY_CHANGE, { quality: action.value })
        break
      case 'postProcessing':
        eventSystem.emit(APP_EVENTS.POST_PROCESSING_ENABLED_CHANGE, { enabled: action.value })
        break
      case 'memoryLimit':
        eventSystem.emit(APP_EVENTS.MEMORY_LIMIT_CHANGE, { limit: action.value })
        break
      case 'aiOptimization':
        eventSystem.emit(APP_EVENTS.AI_OPTIMIZATION_APPLIED, { type: action.value })
        break
      case 'textureMemory':
        eventSystem.emit(APP_EVENTS.TEXTURE_QUALITY_CHANGE, { quality: action.value })
        break
      case 'particleDensity':
        eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, { density: action.value })
        break
      case 'drawCalls':
        eventSystem.emit(APP_EVENTS.DRAW_CALLS_LIMIT_CHANGE, { limit: action.value })
        break
      case 'triangleCount':
        eventSystem.emit(APP_EVENTS.TRIANGLE_COUNT_LIMIT_CHANGE, { limit: action.value })
        break
      case 'releaseUnusedResources':
        eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, {})
        break
      case 'mergeGeometries':
        eventSystem.emit(APP_EVENTS.MERGE_GEOMETRIES_CHANGE, { enabled: action.value })
        break
      case 'useInstancedRendering':
        eventSystem.emit(APP_EVENTS.INSTANCED_RENDERING_CHANGE, { enabled: action.value })
        break
      case 'objectCount':
        eventSystem.emit(APP_EVENTS.OBJECT_COUNT_LIMIT_CHANGE, { limit: action.value })
        break
      case 'useLOD':
        eventSystem.emit(APP_EVENTS.USE_LOD_CHANGE, { enabled: action.value })
        break
      case 'simplifyGeometries':
        eventSystem.emit(APP_EVENTS.SIMPLIFY_GEOMETRIES_CHANGE, { enabled: action.value })
        break
      case 'complexObjectCount':
        eventSystem.emit(APP_EVENTS.COMPLEX_OBJECT_COUNT_LIMIT_CHANGE, { limit: action.value })
        break
      case 'performanceMode':
        eventSystem.emit(APP_EVENTS.PERFORMANCE_MODE_CHANGE, { enabled: action.value })
        break
    }
  }

  /**
   * 获取优化历史
   */
  public getOptimizationHistory(): Array<{
    timestamp: number
    metrics: UnifiedPerformanceMetrics
    actions: Array<{ type: string; value: any; expectedGain: number }>
  }> {
    return [...this.optimizationHistory]
  }

  /**
   * 获取设备性能等级
   */
  public getDevicePerformanceLevel(): DevicePerformanceLevel {
    return this.devicePerformanceLevel
  }

  /**
   * 重置优化器
   */
  public reset(): void {
    this.optimizationHistory = []
    this.devicePerformanceLevel = DevicePerformanceLevel.MEDIUM
    this.detectDevicePerformanceLevel()
  }

  /**
   * 销毁优化器
   */
  public dispose(): void {
    this.stop()
    this.optimizationHistory = []
    this.isInitialized = false
  }
}

// 导出单例实例
export const automatedPerformanceOptimizer = AutomatedPerformanceOptimizer.getInstance()

// 导出便捷函数
export const startAutomatedOptimization = (config?: Partial<AutomatedOptimizationConfig>) => {
  automatedPerformanceOptimizer.updateConfig(config || {})
}

export const stopAutomatedOptimization = () => {
  automatedPerformanceOptimizer.stop()
}

export const getDevicePerformanceLevel = () => {
  return automatedPerformanceOptimizer.getDevicePerformanceLevel()
}

export const getOptimizationHistory = () => {
  return automatedPerformanceOptimizer.getOptimizationHistory()
}
