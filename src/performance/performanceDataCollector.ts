import { PerformanceMode, PerformanceOptimizationManager } from './performanceOptimizationManager'
import { devicePerformanceAnalyzer, PerformanceTestResult } from './devicePerformanceAnalyzer'
import { VISUALIZATION_CONFIG } from '../constants'

// 渲染阶段性能指标
export interface RenderPhaseMetrics {
  shaderCompileTime: number
  textureUploadTime: number
  geometryBuildTime: number
  renderTime: number
  postProcessTime: number
}

// 资源使用详细信息
export interface ResourceUsageDetails {
  textures: number
  geometries: number
  materials: number
  shaders: number
  meshes: number
  particles: number
  lights: number
  shadowMapSize: number
  textureMemory: number
  geometryMemory: number
}

// 性能事件类型
export type PerformanceEventType =
  | 'scene_load'
  | 'resource_load'
  | 'camera_move'
  | 'particle_system_update'
  | 'field_calculation'
  | 'shader_compile'
  | 'texture_upload'
  | 'geometry_build'
  | 'render_phase'

// 性能事件数据
export interface PerformanceEvent {
  type: PerformanceEventType
  timestamp: number
  duration: number
  details?: Record<string, any>
  resourceId?: string
  resourceType?: string
}

// 性能数据点接口 - 增强版
export interface PerformanceDataPoint {
  timestamp: number
  frameTime: number
  fps: number
  memoryUsage: number
  drawCalls: number
  triangleCount: number
  particleCount: number
  fieldResolution: number
  performanceMode: PerformanceMode
  isAutoMode: boolean
  sceneComplexity: number
  renderPhaseMetrics: RenderPhaseMetrics
  resourceUsage: ResourceUsageDetails
  gpuUsage: number // GPU使用率估算
  cpuUsage: number // CPU使用率估算
  networkLatency: number // 网络延迟估算
  garbageCollectionCount: number // 垃圾回收次数
}

// 性能统计摘要
export interface PerformanceSummary {
  averageFPS: number
  minFPS: number
  maxFPS: number
  fpsDrops: number
  averageFrameTime: number
  averageMemoryUsage: number
  peakMemoryUsage: number
  averageDrawCalls: number
  totalFrames: number
  recordingDuration: number
  performanceScore: number
}

// 性能趋势数据
export interface PerformanceTrend {
  timestamps: number[]
  fpsValues: number[]
  memoryValues: number[]
  drawCallValues: number[]
  frameTimeValues: number[]
}

// 性能警告阈值
export interface PerformanceWarningThresholds {
  lowFPSThreshold: number
  highFrameTimeThreshold: number
  highMemoryThreshold: number
  highDrawCallThreshold: number
}

// 性能警告
export interface PerformanceWarning {
  type: 'lowFPS' | 'highFrameTime' | 'highMemory' | 'highDrawCalls'
  timestamp: number
  severity: 'warning' | 'critical'
  message: string
  currentValue: number
  threshold: number
  recommendedAction: string
}

// 性能配置文件
export interface PerformanceProfile {
  id: string
  name: string
  createdAt: number
  deviceInfo: {
    deviceType: string
    browser: string
    os: string
    hardwareConcurrency: number
    deviceMemory: number
  }
  testResult: PerformanceTestResult | null
  summary: PerformanceSummary
  warnings: PerformanceWarning[]
  optimalSettings: Record<string, any>
}

// 性能数据收集器类 - 增强版
export class PerformanceDataCollector {
  private dataPoints: PerformanceDataPoint[] = []
  private warnings: PerformanceWarning[] = []
  private performanceEvents: PerformanceEvent[] = []
  private isCollecting: boolean = false
  private collectionInterval: number | null = null
  private sampleRate: number = 1000 // 1秒采样一次
  private maxDataPoints: number = 3600 // 最多保存1小时数据（3600个点）
  private maxEvents: number = 1000 // 最多保存1000个性能事件
  private startTime: number = 0
  private lastFrameTime: number = 0
  private fpsHistory: number[] = []
  private fpsWindowSize: number = 60 // 60帧窗口计算平均FPS
  private gcCount: number = 0 // 垃圾回收计数
  private lastGcCheck: number = 0

  private thresholds: PerformanceWarningThresholds = {
    lowFPSThreshold: 30,
    highFrameTimeThreshold: 50, // 50ms
    highMemoryThreshold: 500, // 500MB
    highDrawCallThreshold: 1000
  }

  private performanceOptimizer: PerformanceOptimizationManager | null = null
  private storageKey: string = 'utfx_performance_data'
  private eventsStorageKey: string = 'utfx_performance_events'

  // 性能事件计时器映射
  private eventTimers: Map<
    string,
    {
      type: PerformanceEventType
      startTime: number
      details?: Record<string, any>
      resourceId?: string
      resourceType?: string
    }
  > = new Map()

  // 设置性能优化管理器引用
  public setPerformanceOptimizer(optimizer: PerformanceOptimizationManager): void {
    this.performanceOptimizer = optimizer
  }

  // 开始数据收集
  public startCollection(sampleRate: number = 1000): void {
    if (this.isCollecting) {
      console.warn('性能数据收集已在进行中')
      return
    }

    this.sampleRate = sampleRate
    this.isCollecting = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime

    // 立即收集一个数据点
    this.collectDataPoint()

    // 设置定时收集
    this.collectionInterval = window.setInterval(() => {
      this.collectDataPoint()
    }, this.sampleRate)

    console.log('性能数据收集已开始，采样率:', sampleRate, 'ms')
  }

  // 停止数据收集
  public stopCollection(): void {
    if (!this.isCollecting) {
      console.warn('性能数据收集未在进行中')
      return
    }

    this.isCollecting = false

    if (this.collectionInterval !== null) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }

    console.log('性能数据收集已停止，收集了', this.dataPoints.length, '个数据点')
  }

  // 开始性能事件计时
  public startPerformanceEvent(
    type: PerformanceEventType,
    details?: Record<string, any>,
    resourceId?: string,
    resourceType?: string
  ): string {
    const eventId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    this.eventTimers.set(eventId, {
      type,
      startTime: performance.now(),
      details,
      resourceId,
      resourceType
    })
    return eventId
  }

  // 结束性能事件计时
  public endPerformanceEvent(eventId: string): void {
    const timerInfo = this.eventTimers.get(eventId)
    if (!timerInfo) {
      console.warn(`性能事件计时器不存在: ${eventId}`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - timerInfo.startTime

    const event: PerformanceEvent = {
      type: timerInfo.type,
      timestamp: Date.now(),
      duration,
      details: timerInfo.details,
      resourceId: timerInfo.resourceId,
      resourceType: timerInfo.resourceType
    }

    this.performanceEvents.push(event)

    // 限制事件数量
    if (this.performanceEvents.length > this.maxEvents) {
      this.performanceEvents.shift()
    }

    // 检查是否需要生成警告
    this.checkEventWarnings(event)

    this.eventTimers.delete(eventId)
  }

  // 直接记录性能事件
  public recordPerformanceEvent(
    type: PerformanceEventType,
    duration: number,
    details?: Record<string, any>,
    resourceId?: string,
    resourceType?: string
  ): void {
    const event: PerformanceEvent = {
      type,
      timestamp: Date.now(),
      duration,
      details,
      resourceId,
      resourceType
    }

    this.performanceEvents.push(event)

    // 限制事件数量
    if (this.performanceEvents.length > this.maxEvents) {
      this.performanceEvents.shift()
    }

    // 检查是否需要生成警告
    this.checkEventWarnings(event)
  }

  // 获取渲染阶段性能指标
  private getRenderPhaseMetrics(): RenderPhaseMetrics {
    // 从性能优化管理器获取详细的渲染阶段数据
    return {
      shaderCompileTime: this.performanceOptimizer?.getShaderCompileTime() || 0,
      textureUploadTime: this.performanceOptimizer?.getTextureUploadTime() || 0,
      geometryBuildTime: this.performanceOptimizer?.getGeometryBuildTime() || 0,
      renderTime: this.performanceOptimizer?.getRenderTime() || 0,
      postProcessTime: this.performanceOptimizer?.getPostProcessTime() || 0
    }
  }

  // 获取资源使用详细信息
  private getResourceUsageDetails(): ResourceUsageDetails {
    // 从性能优化管理器获取详细的资源使用数据
    return {
      textures: this.performanceOptimizer?.getResourceCount('textures') || 0,
      geometries: this.performanceOptimizer?.getResourceCount('geometries') || 0,
      materials: this.performanceOptimizer?.getResourceCount('materials') || 0,
      shaders: this.performanceOptimizer?.getResourceCount('shaders') || 0,
      meshes: this.performanceOptimizer?.getResourceCount('meshes') || 0,
      particles: this.performanceOptimizer?.getResourceCount('particles') || 0,
      lights: this.performanceOptimizer?.getResourceCount('lights') || 0,
      shadowMapSize: this.performanceOptimizer?.getShadowMapSize() || 0,
      textureMemory: this.performanceOptimizer?.estimateTextureMemory() || 0,
      geometryMemory: this.performanceOptimizer?.estimateGeometryMemory() || 0
    }
  }

  // 检查事件警告
  private checkEventWarnings(event: PerformanceEvent): void {
    // 根据事件类型和持续时间生成警告
    const eventThresholds: Record<PerformanceEventType, number> = {
      scene_load: 3000, // 3秒
      resource_load: 500, // 500ms
      camera_move: 100, // 100ms
      particle_system_update: 50, // 50ms
      field_calculation: 100, // 100ms
      shader_compile: 200, // 200ms
      texture_upload: 100, // 100ms
      geometry_build: 150, // 150ms
      render_phase: 30 // 30ms
    }

    const threshold = eventThresholds[event.type] || 100
    if (event.duration > threshold) {
      const severity: 'warning' | 'critical' =
        event.duration > threshold * 2 ? 'critical' : 'warning'
      const warning: PerformanceWarning = {
        type: 'highFrameTime',
        timestamp: event.timestamp,
        severity,
        message: `${event.type} 操作耗时过长: ${event.duration.toFixed(1)}ms`,
        currentValue: event.duration,
        threshold,
        recommendedAction: `优化${event.type}操作，减少处理时间`
      }
      this.warnings.push(warning)

      // 限制警告数量
      if (this.warnings.length > 100) {
        this.warnings.shift()
      }

      console.warn(`[性能警告] ${warning.message} - ${warning.recommendedAction}`)
    }
  }

  // 估算GPU使用率（简化版）
  private estimateGPUUsage(): number {
    const renderPhase = this.getRenderPhaseMetrics()
    const totalRenderTime = renderPhase.renderTime + renderPhase.postProcessTime
    return Math.min(100, Math.round((totalRenderTime / 16.67) * 100)) // 基于60fps目标
  }

  // 估算CPU使用率（简化版）
  private estimateCPUUsage(): number {
    const frameTime = performance.now() - this.lastFrameTime
    return Math.min(100, Math.round((frameTime / 16.67) * 100)) // 基于60fps目标
  }

  // 估算网络延迟
  private estimateNetworkLatency(): number {
    // 这里使用简化的网络延迟估算，实际项目中可以使用Navigation Timing API
    return 50 // 默认50ms
  }

  // 检测垃圾回收次数
  private detectGarbageCollection(): number {
    // 使用performance.memory检测垃圾回收
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const currentMemory = (performance as any).memory.usedJSHeapSize
      const lastMemory = (performance as any).memory.usedJSHeapSize

      // 如果内存使用量突然下降超过20%，则认为发生了垃圾回收
      if (
        this.lastGcCheck > 0 &&
        lastMemory > currentMemory &&
        (lastMemory - currentMemory) / lastMemory > 0.2
      ) {
        this.gcCount++
      }

      this.lastGcCheck = Date.now()
    }

    return this.gcCount
  }

  // 收集单个数据点 - 增强版
  public collectDataPoint(): void {
    const timestamp = Date.now()
    const currentTime = performance.now()
    const frameTime = currentTime - this.lastFrameTime

    // 计算FPS
    const fps = frameTime > 0 ? 1000 / frameTime : 0

    // 更新FPS历史
    this.fpsHistory.push(fps)
    if (this.fpsHistory.length > this.fpsWindowSize) {
      this.fpsHistory.shift()
    }

    // 计算平均FPS
    const averageFPS =
      this.fpsHistory.reduce((sum, value) => sum + value, 0) / this.fpsHistory.length

    // 获取内存使用情况（估算值）
    const memoryUsage = this.estimateMemoryUsage()

    // 获取渲染统计信息
    const renderStats = this.getRenderStats()

    // 获取性能模式
    const performanceMode = this.performanceOptimizer?.getCurrentMode() || 'medium'
    const isAutoMode = this.performanceOptimizer?.isAutoModeEnabled() || false

    // 获取场景复杂度
    const sceneComplexity = this.calculateSceneComplexity()

    // 获取渲染阶段指标
    const renderPhaseMetrics = this.getRenderPhaseMetrics()

    // 获取资源使用详情
    const resourceUsage = this.getResourceUsageDetails()

    // 估算GPU和CPU使用率
    const gpuUsage = this.estimateGPUUsage()
    const cpuUsage = this.estimateCPUUsage()

    // 估算网络延迟
    const networkLatency = this.estimateNetworkLatency()

    // 检测垃圾回收
    const garbageCollectionCount = this.detectGarbageCollection()

    // 创建增强版数据点
    const dataPoint: PerformanceDataPoint = {
      timestamp,
      frameTime,
      fps: averageFPS,
      memoryUsage,
      drawCalls: renderStats.drawCalls,
      triangleCount: renderStats.triangleCount,
      particleCount: renderStats.particleCount,
      fieldResolution: renderStats.fieldResolution,
      performanceMode,
      isAutoMode,
      sceneComplexity,
      renderPhaseMetrics,
      resourceUsage,
      gpuUsage,
      cpuUsage,
      networkLatency,
      garbageCollectionCount
    }

    // 添加到数据点数组
    this.dataPoints.push(dataPoint)

    // 限制数据点数量
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift()
    }

    // 检查警告
    this.checkForWarnings(dataPoint)

    // 更新最后一帧时间
    this.lastFrameTime = currentTime
  }

  // 估算内存使用情况
  private estimateMemoryUsage(): number {
    // 在支持的浏览器中使用performance.memory
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) // 转换为MB
    }

    // 回退估算：基于粒子数量和场分辨率
    const renderStats = this.getRenderStats()
    const estimatedMemory =
      renderStats.particleCount * 0.01 +
      renderStats.fieldResolution * renderStats.fieldResolution * 0.005
    return Math.max(50, estimatedMemory) // 至少50MB
  }

  // 获取渲染统计信息
  private getRenderStats(): {
    drawCalls: number
    triangleCount: number
    particleCount: number
    fieldResolution: number
  } {
    if (this.performanceOptimizer) {
      const strategy = this.performanceOptimizer.getCurrentStrategy()
      return {
        drawCalls: this.performanceOptimizer.getDrawCalls() || 100,
        triangleCount: this.performanceOptimizer.getTriangleCount() || 10000,
        particleCount: strategy.particleCount || 200,
        fieldResolution: strategy.fieldResolution || 20
      }
    }

    // 默认值
    return {
      drawCalls: 100,
      triangleCount: 10000,
      particleCount: 200,
      fieldResolution: 20
    }
  }

  // 计算场景复杂度
  private calculateSceneComplexity(): number {
    const stats = this.getRenderStats()

    // 基于粒子数量、场分辨率和三角形数量计算复杂度
    const particleComplexity = stats.particleCount / 1000 // 1000个粒子为1复杂度单位
    const fieldComplexity = (stats.fieldResolution * stats.fieldResolution) / 1000 // 1000个场点为1复杂度单位
    const triangleComplexity = stats.triangleCount / 10000 // 10000个三角形为1复杂度单位

    // 加权总和
    const complexity = particleComplexity * 0.5 + fieldComplexity * 0.3 + triangleComplexity * 0.2

    return Math.round(complexity * 100) / 100 // 保留两位小数
  }

  // 检查性能警告
  private checkForWarnings(dataPoint: PerformanceDataPoint): void {
    const warnings: PerformanceWarning[] = []

    // 低FPS警告
    if (dataPoint.fps < this.thresholds.lowFPSThreshold) {
      const severity: 'warning' | 'critical' =
        dataPoint.fps < this.thresholds.lowFPSThreshold / 2 ? 'critical' : 'warning'
      warnings.push({
        type: 'lowFPS',
        timestamp: dataPoint.timestamp,
        severity,
        message: `FPS过低: ${dataPoint.fps.toFixed(1)}`,
        currentValue: dataPoint.fps,
        threshold: this.thresholds.lowFPSThreshold,
        recommendedAction: '建议降低性能模式或减少场景复杂度'
      })
    }

    // 高帧时间警告
    if (dataPoint.frameTime > this.thresholds.highFrameTimeThreshold) {
      const severity: 'warning' | 'critical' =
        dataPoint.frameTime > this.thresholds.highFrameTimeThreshold * 2 ? 'critical' : 'warning'
      warnings.push({
        type: 'highFrameTime',
        timestamp: dataPoint.timestamp,
        severity,
        message: `帧时间过长: ${dataPoint.frameTime.toFixed(1)}ms`,
        currentValue: dataPoint.frameTime,
        threshold: this.thresholds.highFrameTimeThreshold,
        recommendedAction: '建议降低渲染分辨率或减少粒子数量'
      })
    }

    // 高内存使用警告
    if (dataPoint.memoryUsage > this.thresholds.highMemoryThreshold) {
      const severity: 'warning' | 'critical' =
        dataPoint.memoryUsage > this.thresholds.highMemoryThreshold * 1.5 ? 'critical' : 'warning'
      warnings.push({
        type: 'highMemory',
        timestamp: dataPoint.timestamp,
        severity,
        message: `内存使用过高: ${dataPoint.memoryUsage}MB`,
        currentValue: dataPoint.memoryUsage,
        threshold: this.thresholds.highMemoryThreshold,
        recommendedAction: '建议清理资源或刷新页面'
      })
    }

    // 高绘制调用警告
    if (dataPoint.drawCalls > this.thresholds.highDrawCallThreshold) {
      const severity: 'warning' | 'critical' =
        dataPoint.drawCalls > this.thresholds.highDrawCallThreshold * 1.5 ? 'critical' : 'warning'
      warnings.push({
        type: 'highDrawCalls',
        timestamp: dataPoint.timestamp,
        severity,
        message: `绘制调用过多: ${dataPoint.drawCalls}`,
        currentValue: dataPoint.drawCalls,
        threshold: this.thresholds.highDrawCallThreshold,
        recommendedAction: '建议合并几何体或使用实例化渲染'
      })
    }

    // 添加新警告
    warnings.forEach(warning => {
      this.warnings.push(warning)

      // 限制警告数量
      if (this.warnings.length > 100) {
        this.warnings.shift()
      }

      // 输出警告到控制台
      console.warn(`[性能警告] ${warning.message} - ${warning.recommendedAction}`)
    })
  }

  // 获取性能统计摘要
  public getPerformanceSummary(startTime?: number, endTime?: number): PerformanceSummary {
    // 过滤时间范围内的数据点
    let filteredData = this.dataPoints
    if (startTime && endTime) {
      filteredData = this.dataPoints.filter(
        point => point.timestamp >= startTime && point.timestamp <= endTime
      )
    }

    if (filteredData.length === 0) {
      return {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        fpsDrops: 0,
        averageFrameTime: 0,
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        averageDrawCalls: 0,
        totalFrames: 0,
        recordingDuration: 0,
        performanceScore: 0
      }
    }

    // 计算统计数据
    const fpsValues = filteredData.map(point => point.fps)
    const frameTimeValues = filteredData.map(point => point.frameTime)
    const memoryValues = filteredData.map(point => point.memoryUsage)
    const drawCallValues = filteredData.map(point => point.drawCalls)

    const averageFPS = fpsValues.reduce((sum, value) => sum + value, 0) / fpsValues.length
    const minFPS = Math.min(...fpsValues)
    const maxFPS = Math.max(...fpsValues)
    const fpsDrops = fpsValues.filter(fps => fps < this.thresholds.lowFPSThreshold).length

    const averageFrameTime =
      frameTimeValues.reduce((sum, value) => sum + value, 0) / frameTimeValues.length
    const averageMemoryUsage =
      memoryValues.reduce((sum, value) => sum + value, 0) / memoryValues.length
    const peakMemoryUsage = Math.max(...memoryValues)
    const averageDrawCalls =
      drawCallValues.reduce((sum, value) => sum + value, 0) / drawCallValues.length

    const recordingDuration =
      (filteredData[filteredData.length - 1].timestamp - filteredData[0].timestamp) / 1000 // 转换为秒

    // 计算性能分数（0-100）
    const fpsScore = Math.min(100, (averageFPS / 60) * 100)
    const stabilityScore = Math.min(100, 100 - (fpsDrops / fpsValues.length) * 100)
    const memoryScore = Math.min(
      100,
      100 - (averageMemoryUsage / this.thresholds.highMemoryThreshold) * 50
    )

    const performanceScore = fpsScore * 0.5 + stabilityScore * 0.3 + memoryScore * 0.2

    return {
      averageFPS: Math.round(averageFPS * 10) / 10,
      minFPS: Math.round(minFPS * 10) / 10,
      maxFPS: Math.round(maxFPS * 10) / 10,
      fpsDrops,
      averageFrameTime: Math.round(averageFrameTime * 10) / 10,
      averageMemoryUsage: Math.round(averageMemoryUsage),
      peakMemoryUsage: Math.round(peakMemoryUsage),
      averageDrawCalls: Math.round(averageDrawCalls),
      totalFrames: filteredData.length,
      recordingDuration: Math.round(recordingDuration * 10) / 10,
      performanceScore: Math.round(performanceScore)
    }
  }

  // 获取性能趋势数据
  public getPerformanceTrend(startTime?: number, endTime?: number): PerformanceTrend {
    // 过滤时间范围内的数据点
    let filteredData = this.dataPoints
    if (startTime && endTime) {
      filteredData = this.dataPoints.filter(
        point => point.timestamp >= startTime && point.timestamp <= endTime
      )
    }

    // 下采样以减少数据点数量（最多保留1000个点）
    const downsampledData = this.downsampleData(filteredData, 1000)

    return {
      timestamps: downsampledData.map(point => point.timestamp),
      fpsValues: downsampledData.map(point => point.fps),
      memoryValues: downsampledData.map(point => point.memoryUsage),
      drawCallValues: downsampledData.map(point => point.drawCalls),
      frameTimeValues: downsampledData.map(point => point.frameTime)
    }
  }

  // 数据下采样
  private downsampleData(data: PerformanceDataPoint[], maxPoints: number): PerformanceDataPoint[] {
    if (data.length <= maxPoints) {
      return data
    }

    const step = Math.ceil(data.length / maxPoints)
    const downsampled: PerformanceDataPoint[] = []

    for (let i = 0; i < data.length; i += step) {
      downsampled.push(data[i])
    }

    return downsampled
  }

  // 获取所有警告
  public getWarnings(severity?: 'warning' | 'critical'): PerformanceWarning[] {
    if (severity) {
      return this.warnings.filter(warning => warning.severity === severity)
    }
    return [...this.warnings]
  }

  // 清除所有数据
  public clearData(): void {
    this.dataPoints = []
    this.warnings = []
    this.performanceEvents = []
    this.fpsHistory = []
    this.gcCount = 0
    this.lastGcCheck = 0
    this.startTime = 0
    this.lastFrameTime = 0
    this.eventTimers.clear()
    console.log('性能数据已清除')
  }

  // 保存数据到本地存储
  public saveDataToStorage(): boolean {
    try {
      const dataToSave = {
        dataPoints: this.dataPoints,
        warnings: this.warnings,
        performanceEvents: this.performanceEvents,
        summary: this.getPerformanceSummary(),
        savedAt: Date.now()
      }

      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave))
      console.log('性能数据已保存到本地存储')
      return true
    } catch (error) {
      console.error('保存性能数据失败:', error)
      return false
    }
  }

  // 从本地存储加载数据
  public loadDataFromStorage(): boolean {
    try {
      const savedData = localStorage.getItem(this.storageKey)

      if (savedData) {
        const parsedData = JSON.parse(savedData)
        this.dataPoints = parsedData.dataPoints || []
        this.warnings = parsedData.warnings || []
        this.performanceEvents = parsedData.performanceEvents || []
        console.log(
          '已从本地存储加载性能数据，包含',
          this.dataPoints.length,
          '个数据点和',
          this.performanceEvents.length,
          '个性能事件'
        )
        return true
      }

      return false
    } catch (error) {
      console.error('加载性能数据失败:', error)
      return false
    }
  }

  // 导出性能报告 - 增强版
  public exportPerformanceReport(): string {
    const report = {
      deviceInfo: devicePerformanceAnalyzer.getDeviceInfo(),
      testResult: devicePerformanceAnalyzer.getTestResult(),
      summary: this.getPerformanceSummary(),
      trend: this.getPerformanceTrend(),
      warnings: this.getWarnings(),
      performanceEvents: this.performanceEvents,
      renderPhaseMetrics:
        this.dataPoints.length > 0
          ? this.dataPoints[this.dataPoints.length - 1].renderPhaseMetrics
          : null,
      resourceUsage:
        this.dataPoints.length > 0
          ? this.dataPoints[this.dataPoints.length - 1].resourceUsage
          : null,
      exportTime: new Date().toISOString(),
      totalDataPoints: this.dataPoints.length,
      totalPerformanceEvents: this.performanceEvents.length,
      recordingDuration:
        this.dataPoints.length > 0
          ? (this.dataPoints[this.dataPoints.length - 1].timestamp - this.dataPoints[0].timestamp) /
            1000
          : 0
    }

    return JSON.stringify(report, null, 2)
  }

  // 设置警告阈值
  public setThresholds(thresholds: Partial<PerformanceWarningThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds
    }
    console.log('性能警告阈值已更新:', this.thresholds)
  }

  // 获取当前阈值
  public getThresholds(): PerformanceWarningThresholds {
    return { ...this.thresholds }
  }

  // 获取数据点数量
  public getDataPointCount(): number {
    return this.dataPoints.length
  }

  // 创建性能配置文件
  public createPerformanceProfile(name: string): PerformanceProfile {
    const deviceInfo = devicePerformanceAnalyzer.getDeviceInfo()
    const summary = this.getPerformanceSummary()
    const testResult = devicePerformanceAnalyzer.getTestResult()

    // 获取最佳设置建议
    const optimalSettings = this.calculateOptimalSettings()

    const profile: PerformanceProfile = {
      id: `profile_${Date.now()}`,
      name,
      createdAt: Date.now(),
      deviceInfo: {
        deviceType: deviceInfo.deviceType,
        browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
        os: `${deviceInfo.os} ${deviceInfo.osVersion}`,
        hardwareConcurrency: deviceInfo.hardwareConcurrency,
        deviceMemory: deviceInfo.deviceMemory
      },
      testResult,
      summary,
      warnings: this.getWarnings(),
      optimalSettings
    }

    return profile
  }

  // 计算最佳设置
  private calculateOptimalSettings(): Record<string, any> {
    const summary = this.getPerformanceSummary()
    const recommendations: Record<string, any> = {}

    // 基于FPS推荐性能模式
    if (summary.averageFPS < 30) {
      recommendations.performanceMode = 'low'
      recommendations.reason = 'FPS低于30，建议降低性能模式'
    } else if (summary.averageFPS < 45) {
      recommendations.performanceMode = 'medium'
      recommendations.reason = 'FPS低于45，建议使用中等性能模式'
    } else {
      recommendations.performanceMode = 'high'
      recommendations.reason = 'FPS良好，可以使用高性能模式'
    }

    // 基于内存使用推荐
    if (summary.averageMemoryUsage > this.thresholds.highMemoryThreshold * 0.8) {
      recommendations.reduceMemory = true
      recommendations.memoryTips = ['减少粒子数量', '降低场分辨率']
    }

    // 基于绘制调用推荐
    if (
      this.performanceOptimizer &&
      this.performanceOptimizer.getDrawCalls() > this.thresholds.highDrawCallThreshold
    ) {
      recommendations.optimizeDrawCalls = true
    }

    return recommendations
  }

  // 获取实时性能状态
  public getRealtimeStatus(): {
    currentFPS: number
    currentFrameTime: number
    currentMemory: number
    isStable: boolean
    lastWarning: PerformanceWarning | null
  } {
    const latestData = this.dataPoints[this.dataPoints.length - 1]
    const recentWarnings = this.warnings.slice(-5) // 最近5个警告

    return {
      currentFPS: latestData ? latestData.fps : 0,
      currentFrameTime: latestData ? latestData.frameTime : 0,
      currentMemory: latestData ? latestData.memoryUsage : 0,
      isStable:
        this.fpsHistory.length > 10 &&
        this.fpsHistory.slice(-10).every(fps => fps > this.thresholds.lowFPSThreshold),
      lastWarning: recentWarnings.length > 0 ? recentWarnings[recentWarnings.length - 1] : null
    }
  }
}

// 导出单例实例
export const performanceDataCollector = new PerformanceDataCollector()
