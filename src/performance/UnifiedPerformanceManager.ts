/**
 * 🚀 统一性能管理器
 * 整合所有性能管理功能，包括性能监控、优化策略和AI驱动的自适应优化
 */

import * as THREE from 'three'
import {
  PerformanceOptimizer,
  OptimizationStrategy,
  PerformanceOptimizationConfig
} from './PerformanceOptimizer'
import { PerformanceMonitor, ParticleOptimizer, RenderOptimizer } from './performanceUtils'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 统一性能指标类型
export interface UnifiedPerformanceMetrics {
  // 核心性能指标
  fps: number
  frameTime: number
  memoryUsage: number
  gpuUsage: number
  drawCalls: number
  triangleCount: number
  vertexCount: number
  textureMemory: number
  shaderCount: number
  activeObjects: number
  particleCount: number

  // 设备状态指标
  deviceScore: number
  thermalState: 'cool' | 'warm' | 'hot'
  batteryLevel?: number
  networkLatency?: number

  // 场景复杂度指标
  sceneComplexity: number
  particleDensity: number
  shadowQuality: number
  renderScale: number
}

// 统一性能配置类型
export interface UnifiedPerformanceConfig extends PerformanceOptimizationConfig {
  // 监控配置
  enablePerformanceMonitoring: boolean
  monitorUpdateInterval: number

  // 日志配置
  enablePerformanceLogging: boolean
  loggingLevel: 'info' | 'warn' | 'error' | 'debug'
}

// 性能事件数据类型
export interface PerformanceEventData {
  metrics: UnifiedPerformanceMetrics
  timestamp: number
  action?: string
  confidence?: number
  expectedGain?: number
}

/**
 * 统一性能管理器类
 * 整合所有性能管理功能，提供统一的性能优化接口
 */
export class UnifiedPerformanceManager {
  private static instance: UnifiedPerformanceManager

  // 核心组件
  private performanceOptimizer: PerformanceOptimizer
  private performanceMonitor: PerformanceMonitor
  private particleOptimizer: ParticleOptimizer
  private renderOptimizer: RenderOptimizer

  // 场景和渲染器引用
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private renderer: THREE.WebGLRenderer | null = null

  // 配置和状态
  private config: UnifiedPerformanceConfig
  private metrics: UnifiedPerformanceMetrics
  private isInitialized: boolean = false
  private isPerformanceMode: boolean = false
  private lastMonitorUpdate: number = 0

  // 单例模式构造函数
  private constructor(config: Partial<UnifiedPerformanceConfig> = {}) {
    // 合并默认配置
    this.config = {
      // 基础优化配置
      strategy: OptimizationStrategy.ADAPTIVE,
      targetFPS: 60,
      maxMemoryUsageMB: 512,
      maxDrawCalls: 1000,
      enableAutoOptimization: true,
      enableLOD: true,
      enableCulling: true,
      enableFrameSkipping: true,
      enableDynamicResolution: true,
      enableParticleOptimization: true,
      enableShadowOptimization: true,

      // 监控配置
      enablePerformanceMonitoring: true,
      monitorUpdateInterval: 1000,

      // 日志配置
      enablePerformanceLogging: process.env.NODE_ENV === 'development',
      loggingLevel: 'info',

      ...config
    }

    // 初始化性能指标
    this.metrics = this.createInitialMetrics()

    // 初始化核心组件
    this.performanceMonitor = new PerformanceMonitor()
    this.particleOptimizer = new ParticleOptimizer()
    this.renderOptimizer = new RenderOptimizer()

    // 初始化事件监听
    this.initializeEventListeners()

    // 初始化日志
    this.log('Unified Performance Manager initialized with config:', this.config, 'debug')
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<UnifiedPerformanceConfig>): UnifiedPerformanceManager {
    if (!UnifiedPerformanceManager.instance) {
      UnifiedPerformanceManager.instance = new UnifiedPerformanceManager(config)
    }
    return UnifiedPerformanceManager.instance
  }

  /**
   * 初始化场景和渲染器引用
   */
  public initialize(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ): void {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer

    // 初始化性能优化器
    this.performanceOptimizer = new PerformanceOptimizer(scene, camera, renderer, {
      strategy: this.config.strategy,
      targetFPS: this.config.targetFPS,
      maxMemoryUsageMB: this.config.maxMemoryUsageMB,
      maxDrawCalls: this.config.maxDrawCalls,
      enableAutoOptimization: this.config.enableAutoOptimization,
      enableLOD: this.config.enableLOD,
      enableCulling: this.config.enableCulling,
      enableFrameSkipping: this.config.enableFrameSkipping,
      enableDynamicResolution: this.config.enableDynamicResolution,
      enableParticleOptimization: this.config.enableParticleOptimization,
      enableShadowOptimization: this.config.enableShadowOptimization
    })

    this.isInitialized = true
    this.log(
      'Unified Performance Manager initialized with scene, camera, and renderer',
      null,
      'info'
    )

    // 发布初始化完成事件
    eventSystem.emit(APP_EVENTS.PERFORMANCE_MANAGER_INIT, {
      metrics: this.metrics,
      config: this.config
    })
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 监听性能相关事件
    eventSystem.on(APP_EVENTS.FRAME_RATE_CHANGE, data => {
      this.updateMetrics({ fps: data.fps, frameTime: data.frameTime })
    })

    eventSystem.on(APP_EVENTS.MEMORY_WARNING, data => {
      this.updateMetrics({ memoryUsage: data.memoryUsage })
      this.applyMemoryOptimizations(data.memoryUsage)
    })

    eventSystem.on(APP_EVENTS.PARTICLE_SYSTEM_UPDATE, data => {
      this.updateMetrics({ particleCount: data.particleCount })
    })
  }

  /**
   * 创建初始性能指标
   */
  private createInitialMetrics(): UnifiedPerformanceMetrics {
    return {
      // 核心性能指标
      fps: 60,
      frameTime: 16.67, // 60fps
      memoryUsage: 0,
      gpuUsage: 0,
      drawCalls: 0,
      triangleCount: 0,
      vertexCount: 0,
      textureMemory: 0,
      shaderCount: 0,
      activeObjects: 0,
      particleCount: 0,

      // 设备状态指标
      deviceScore: 0.5,
      thermalState: 'cool',

      // 场景复杂度指标
      sceneComplexity: 0,
      particleDensity: 1.0,
      shadowQuality: 1.0,
      renderScale: 1.0
    }
  }

  /**
   * 更新性能指标
   */
  public updateMetrics(metrics: Partial<UnifiedPerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics }

    // 确保指标在合理范围内
    this.metrics.fps = Math.max(0, Math.min(120, this.metrics.fps))
    this.metrics.frameTime = Math.max(0, this.metrics.frameTime)
    this.metrics.memoryUsage = Math.max(0, this.metrics.memoryUsage)
    this.metrics.gpuUsage = Math.max(0, Math.min(100, this.metrics.gpuUsage))
    this.metrics.drawCalls = Math.max(0, this.metrics.drawCalls)
    this.metrics.triangleCount = Math.max(0, this.metrics.triangleCount)
    this.metrics.vertexCount = Math.max(0, this.metrics.vertexCount)

    // 更新性能模式
    this.updatePerformanceMode()

    // 定期发布性能指标事件
    const now = Date.now()
    if (now - this.lastMonitorUpdate > this.config.monitorUpdateInterval) {
      this.lastMonitorUpdate = now
      eventSystem.emit(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, {
        metrics: this.metrics,
        timestamp: now
      })
    }
  }

  /**
   * 更新性能模式
   */
  private updatePerformanceMode(): void {
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8

    if (isPerformanceMode !== this.isPerformanceMode) {
      this.isPerformanceMode = isPerformanceMode
      eventSystem.emit(APP_EVENTS.PERFORMANCE_MODE_CHANGE, {
        isPerformanceMode,
        metrics: this.metrics
      })

      this.log(
        `Performance mode changed to: ${isPerformanceMode ? 'PERFORMANCE' : 'QUALITY'}`,
        null,
        'info'
      )
    }
  }

  /**
   * 应用内存优化
   */
  private applyMemoryOptimizations(memoryUsage: number): void {
    if (!this.isInitialized) return

    // 释放未使用的资源
    eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, {
      memoryUsage,
      force: memoryUsage > this.config.maxMemoryUsageMB * 0.9
    })

    // 降低纹理质量
    if (memoryUsage > this.config.maxMemoryUsageMB * 0.8) {
      this.metrics.textureMemory = this.metrics.textureMemory * 0.8
      eventSystem.emit(APP_EVENTS.TEXTURE_QUALITY_CHANGE, {
        quality: 0.8
      })
    }

    // 降低粒子密度
    if (memoryUsage > this.config.maxMemoryUsageMB * 0.9) {
      this.metrics.particleDensity = 0.6
      eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, {
        density: 0.6
      })
    }
  }

  /**
   * 优化粒子数量
   */
  public optimizeParticleCount(baseCount: number, distance: number): number {
    return this.performanceOptimizer.optimizeParticleCount(baseCount, distance)
  }

  /**
   * 计算最佳像素比率
   */
  public calculateOptimalPixelRatio(): number {
    return this.performanceOptimizer.calculateOptimalPixelRatio()
  }

  /**
   * 计算是否应该跳过当前帧
   */
  public shouldSkipFrame(): boolean {
    return this.performanceOptimizer.shouldSkipFrame()
  }

  /**
   * 计算渲染分辨率缩放因子
   */
  public calculateRenderScale(): number {
    return this.performanceOptimizer.calculateRenderScale()
  }

  /**
   * 检查对象是否可见
   */
  public isObjectVisible(object: THREE.Object3D): boolean {
    if (!this.camera) return true
    return this.performanceOptimizer.isObjectVisible(object)
  }

  /**
   * 根据优先级对对象进行排序
   */
  public sortObjectsByPriority(objects: THREE.Object3D[]): THREE.Object3D[] {
    if (!this.camera) return objects
    return this.performanceOptimizer.sortObjectsByPriority(objects)
  }

  /**
   * 应用优化策略
   */
  public applyOptimizations(deltaTime: number): void {
    if (!this.isInitialized) return

    // 更新FPS
    const fps = this.performanceMonitor.updateFPS()
    this.metrics.fps = fps
    this.metrics.frameTime = 1000 / fps

    // 应用性能优化器的优化策略
    this.performanceOptimizer.applyOptimizations(deltaTime)

    // 更新性能指标
    this.updateMetrics(this.performanceOptimizer.getMetrics())
  }

  /**
   * 获取优化建议
   */
  public getOptimizationSuggestions(): string[] {
    if (!this.isInitialized) return []

    const suggestions: string[] = []
    const metrics = this.getMetrics()

    // 根据性能指标生成智能优化建议
    if (metrics.fps < this.config.targetFPS * 0.7) {
      suggestions.push('降低粒子数量以提高帧率')
      suggestions.push('降低渲染分辨率')
      suggestions.push('关闭后处理效果')
    } else if (metrics.fps < this.config.targetFPS * 0.9) {
      suggestions.push('适当降低粒子密度')
      suggestions.push('降低阴影质量')
      suggestions.push('简化后处理效果')
    }

    if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.9) {
      suggestions.push('释放未使用的资源')
      suggestions.push('降低纹理质量')
      suggestions.push('减少粒子数量')
    } else if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.7) {
      suggestions.push('优化资源加载')
      suggestions.push('减少缓存大小')
    }

    if (metrics.drawCalls > this.config.maxDrawCalls * 0.9) {
      suggestions.push('合并几何体以减少draw calls')
      suggestions.push('使用实例化渲染')
      suggestions.push('优化场景层次结构')
    }

    // 添加性能优化器的建议
    suggestions.push(...this.performanceOptimizer.getOptimizationSuggestions())

    return suggestions
  }

  /**
   * 执行智能优化分析
   * 根据当前性能指标生成详细的优化报告
   */
  public performSmartOptimizationAnalysis(): {
    metrics: UnifiedPerformanceMetrics
    issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string; impact: number }>
    recommendations: Array<{
      action: string
      expectedGain: number
      priority: 'low' | 'medium' | 'high'
    }>
  } {
    const metrics = this.getMetrics()
    const issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string; impact: number }> =
      []
    const recommendations: Array<{
      action: string
      expectedGain: number
      priority: 'low' | 'medium' | 'high'
    }> = []

    // 分析FPS问题
    if (metrics.fps < this.config.targetFPS * 0.6) {
      issues.push({ severity: 'high', message: '帧率严重不足', impact: 0.3 })
      recommendations.push(
        { action: '大幅降低粒子数量', expectedGain: 25, priority: 'high' },
        { action: '降低渲染分辨率', expectedGain: 20, priority: 'high' },
        { action: '关闭所有后处理效果', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.fps < this.config.targetFPS * 0.8) {
      issues.push({ severity: 'medium', message: '帧率偏低', impact: 0.15 })
      recommendations.push(
        { action: '适当降低粒子数量', expectedGain: 15, priority: 'medium' },
        { action: '降低阴影质量', expectedGain: 10, priority: 'medium' },
        { action: '简化后处理效果', expectedGain: 10, priority: 'medium' }
      )
    }

    // 分析内存问题
    if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.95) {
      issues.push({ severity: 'high', message: '内存使用接近上限', impact: 0.25 })
      recommendations.push(
        { action: '立即释放未使用的资源', expectedGain: 20, priority: 'high' },
        { action: '降低纹理质量', expectedGain: 15, priority: 'high' },
        { action: '大幅减少粒子数量', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.8) {
      issues.push({ severity: 'medium', message: '内存使用较高', impact: 0.1 })
      recommendations.push(
        { action: '释放未使用的资源', expectedGain: 10, priority: 'medium' },
        { action: '优化资源缓存', expectedGain: 5, priority: 'medium' }
      )
    }

    // 分析渲染性能问题
    if (metrics.drawCalls > this.config.maxDrawCalls * 0.9) {
      issues.push({ severity: 'medium', message: 'Draw calls过多', impact: 0.15 })
      recommendations.push(
        { action: '合并几何体', expectedGain: 15, priority: 'medium' },
        { action: '使用实例化渲染', expectedGain: 10, priority: 'medium' }
      )
    }

    if (metrics.triangleCount > 500000) {
      issues.push({ severity: 'medium', message: '三角形数量过多', impact: 0.1 })
      recommendations.push(
        { action: '使用LOD技术', expectedGain: 10, priority: 'medium' },
        { action: '简化几何体', expectedGain: 8, priority: 'medium' }
      )
    }

    // 分析设备状态
    if (metrics.thermalState === 'hot') {
      issues.push({ severity: 'high', message: '设备温度过高', impact: 0.2 })
      recommendations.push(
        { action: '降低性能模式', expectedGain: 20, priority: 'high' },
        { action: '减少粒子数量', expectedGain: 15, priority: 'high' }
      )
    } else if (metrics.thermalState === 'warm') {
      issues.push({ severity: 'low', message: '设备温度较高', impact: 0.05 })
      recommendations.push({ action: '适当降低性能', expectedGain: 10, priority: 'low' })
    }

    return {
      metrics,
      issues,
      recommendations
    }
  }

  /**
   * 执行自动化优化
   * 根据当前性能指标自动应用优化策略
   */
  public autoOptimize(): void {
    if (!this.isInitialized) return

    const analysis = this.performSmartOptimizationAnalysis()

    // 只应用高优先级的优化建议
    const highPriorityRecommendations = analysis.recommendations.filter(
      rec => rec.priority === 'high'
    )

    // 根据预期收益排序
    highPriorityRecommendations.sort((a, b) => b.expectedGain - a.expectedGain)

    // 应用优化建议
    for (const recommendation of highPriorityRecommendations) {
      switch (recommendation.action) {
        case '大幅降低粒子数量':
          eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, { density: 0.5 })
          break
        case '降低渲染分辨率':
          eventSystem.emit(APP_EVENTS.RENDER_SCALE_CHANGE, { scale: 0.8 })
          break
        case '关闭所有后处理效果':
          eventSystem.emit(APP_EVENTS.POST_PROCESSING_ENABLED_CHANGE, { enabled: false })
          break
        case '立即释放未使用的资源':
          eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, { force: true })
          break
        case '降低纹理质量':
          eventSystem.emit(APP_EVENTS.TEXTURE_QUALITY_CHANGE, { quality: 0.7 })
          break
        case '降低阴影质量':
          eventSystem.emit(APP_EVENTS.SHADOW_QUALITY_CHANGE, { quality: 0.5 })
          break
        case '降低性能模式':
          this.performanceOptimizer.setPerformanceMode('low')
          break
      }
    }

    this.log(
      'Auto-optimization completed. Applied ' +
        highPriorityRecommendations.length +
        ' high-priority recommendations.',
      null,
      'info'
    )
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<UnifiedPerformanceConfig>): void {
    this.config = { ...this.config, ...config }

    // 更新性能优化器配置
    if (this.isInitialized) {
      this.performanceOptimizer.updateConfig({
        strategy: this.config.strategy,
        targetFPS: this.config.targetFPS,
        maxMemoryUsageMB: this.config.maxMemoryUsageMB,
        maxDrawCalls: this.config.maxDrawCalls,
        enableAutoOptimization: this.config.enableAutoOptimization,
        enableLOD: this.config.enableLOD,
        enableCulling: this.config.enableCulling,
        enableFrameSkipping: this.config.enableFrameSkipping,
        enableDynamicResolution: this.config.enableDynamicResolution,
        enableParticleOptimization: this.config.enableParticleOptimization,
        enableShadowOptimization: this.config.enableShadowOptimization
      })
    }

    this.log('Performance config updated:', config, 'info')
  }

  /**
   * 获取当前配置
   */
  public getConfig(): UnifiedPerformanceConfig {
    return { ...this.config }
  }

  /**
   * 获取当前性能指标
   */
  public getMetrics(): UnifiedPerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 检查是否处于性能模式
   */
  public isInPerformanceMode(): boolean {
    return this.isPerformanceMode
  }

  /**
   * 日志工具
   */
  private log(
    message: string,
    data?: any,
    level: 'info' | 'warn' | 'error' | 'debug' = 'info'
  ): void {
    if (!this.config.enablePerformanceLogging) return

    const levels = { info: 0, warn: 1, error: 2, debug: 3 }
    const currentLevel = levels[this.config.loggingLevel]
    const messageLevel = levels[level]

    if (messageLevel <= currentLevel) {
      const prefix = `[${new Date().toISOString()}] [UNIFIED_PERFORMANCE]`
      if (level === 'error') {
        console.error(`${prefix} ERROR: ${message}`, data)
      } else if (level === 'warn') {
        console.warn(`${prefix} WARN: ${message}`, data)
      } else if (level === 'debug') {
        console.debug(`${prefix} DEBUG: ${message}`, data)
      } else {
        console.info(`${prefix} INFO: ${message}`, data)
      }
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.isInitialized && this.performanceOptimizer) {
      this.performanceOptimizer.dispose()
    }

    // 移除事件监听器
    eventSystem.offAll()

    // 重置状态
    this.scene = null
    this.camera = null
    this.renderer = null
    this.isInitialized = false

    this.log('Unified Performance Manager disposed', null, 'info')
  }
}

// 导出单例实例
export const unifiedPerformanceManager = UnifiedPerformanceManager.getInstance()
