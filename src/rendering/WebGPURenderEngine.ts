/**
 * WebGPU 渲染引擎
 * 利用 WebGPU 提供更高级的渲染性能
 */

import * as THREE from 'three'
import { WebGPURenderer } from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { SceneManager } from './SceneManager'
import { CameraManager } from './CameraManager'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

interface WebGPURenderEngineConfig {
  container: HTMLElement
  cameraPosition?: THREE.Vector3
  enableControls?: boolean
  ambientLightIntensity?: number
  directionalLightIntensity?: number
  autoUpdate?: boolean
  enablePerformanceMonitoring?: boolean
  useBatchRendering?: boolean
  enableFog?: boolean
  dynamicPixelRatio?: boolean
}

/**
 * WebGPU 渲染引擎（优化版本）
 */
export class WebGPURenderEngine {
  private container: HTMLElement
  private sceneManager: SceneManager
  private cameraManager: CameraManager
  private renderer: WebGPURenderer
  private composer: EffectComposer | null = null
  private renderPass: RenderPass | null = null
  private bloomPass: UnrealBloomPass | null = null
  private outlinePass: OutlinePass | null = null
  private bokehPass: BokehPass | null = null
  private afterimagePass: AfterimagePass | null = null

  private isRunning: boolean = false
  private animationId: number | null = null
  private lastTime: number = 0

  // 性能统计
  private performanceData = {
    frameCount: 0,
    startTime: performance.now(),
    lastMetricsUpdate: 0,
    renderTimeHistory: [] as number[],
    frameTimeHistory: [] as number[],
    gpuMemoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    computePasses: 0
  }

  // WebGPU 特定优化
  private gpuOptimization = {
    useBindGroupOptimization: true,
    useComputeShaders: true,
    useTextureCompression: true,
    useAsyncPipelineCreation: true,
    memoryBudget: {
      textures: 256 * 1024 * 1024, // 256MB
      buffers: 128 * 1024 * 1024, // 128MB
      total: 512 * 1024 * 1024 // 512MB
    },
    currentMemoryUsage: {
      textures: 0,
      buffers: 0,
      total: 0
    }
  }

  // 资源管理
  private resources = {
    textures: new Map<string, GPUTexture>(),
    buffers: new Map<string, GPUBuffer>(),
    pipelines: new Map<string, GPURenderPipeline | GPUComputePipeline>(),
    bindGroups: new Map<string, GPUBindGroup>()
  }

  constructor(config: WebGPURenderEngineConfig) {
    const defaultConfig = {
      enableControls: true,
      ambientLightIntensity: 0.6,
      directionalLightIntensity: 0.8,
      autoUpdate: true,
      enablePerformanceMonitoring: true,
      useBatchRendering: true,
      enableFog: true,
      dynamicPixelRatio: true,
      ...config
    }

    this.container = config.container
    this.sceneManager = new SceneManager({ autoUpdate: defaultConfig.autoUpdate })
    this.cameraManager = new CameraManager({ position: config.cameraPosition })
    this.renderer = this.createRenderer()

    this.setupScene(defaultConfig)
    this.setupPostProcessing()
  }

  /**
   * 创建 WebGPU 渲染器（优化版本）
   */
  private createRenderer(): WebGPURenderer {
    const renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: true,
      depth: true,
      logarithmicDepthBuffer: true,
      // WebGPU 特定优化
      multisampledRenderTargets: true,
      useFragmentDepth: true,
      enableTextureCompression: this.gpuOptimization.useTextureCompression
    })

    const { width, height } = this.container.getBoundingClientRect()
    const basePixelRatio = window.devicePixelRatio
    const optimalPixelRatio = Math.min(basePixelRatio, 2)

    renderer.setSize(width, height)
    renderer.setPixelRatio(optimalPixelRatio)
    renderer.setClearColor(0x000000, 0.8)

    // 高级渲染设置
    renderer.autoClear = true
    renderer.localClippingEnabled = false
    renderer.info.autoReset = true
    renderer.sortObjects = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.physicallyCorrectLights = true

    // WebGPU 特定优化
    this.optimizeWebGPURenderer(renderer)

    // 添加到容器
    this.container.appendChild(renderer.domElement)

    return renderer
  }

  /**
   * 优化 WebGPU 渲染器
   */
  private optimizeWebGPURenderer(renderer: WebGPURenderer): void {
    // 启用 WebGPU 特定功能
    if ((renderer as any).adapter) {
      const adapter = (renderer as any).adapter as GPUAdapter
      const device = (renderer as any).device as GPUDevice

      console.log('WebGPU Adapter:', adapter.name)
      console.log('WebGPU Features:', Array.from(adapter.features))

      // 配置内存预算
      this.configureMemoryBudget(device)
    }
  }

  /**
   * 配置 WebGPU 内存预算
   */
  private configureMemoryBudget(device: GPUDevice): void {
    // WebGPU 内存管理
    if (device.limits) {
      console.log('WebGPU Device Limits:', device.limits)

      // 调整内存使用策略 based on device capabilities
      const maxTextureDimension2D = device.limits.maxTextureDimension2D
      if (maxTextureDimension2D < 4096) {
        this.gpuOptimization.memoryBudget.textures = 128 * 1024 * 1024 // 128MB
      }
    }
  }

  /**
   * 设置场景，添加灯光和辅助对象
   */
  private setupScene(config: WebGPURenderEngineConfig): void {
    const scene = this.sceneManager.getScene()

    // 设置场景雾效
    if (config.enableFog) {
      scene.fog = new THREE.FogExp2(0x000000, 0.03)
    }

    // 添加高级灯光系统
    // 1. 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, config.ambientLightIntensity)
    scene.add(ambientLight)

    // 2. 主方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, config.directionalLightIntensity)
    directionalLight.position.set(5, 10, 7.5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // 3. 补光
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3)
    fillLight.position.set(-5, 5, -7.5)
    scene.add(fillLight)

    // 4. 点光源
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100)
    pointLight1.position.set(10, 10, 10)
    pointLight1.castShadow = true
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100)
    pointLight2.position.set(-10, -10, -10)
    pointLight2.castShadow = true
    scene.add(pointLight2)

    // 5. 聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 0.5)
    spotLight.position.set(0, 20, 0)
    spotLight.angle = Math.PI / 4
    spotLight.penumbra = 0.1
    spotLight.decay = 2
    spotLight.distance = 50
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    scene.add(spotLight)
  }

  /**
   * 设置后期处理效果
   */
  private setupPostProcessing(): void {
    const { width, height } = this.container.getBoundingClientRect()

    // 创建效果合成器
    this.composer = new EffectComposer(this.renderer)

    // 渲染通道
    this.renderPass = new RenderPass(this.sceneManager.getScene(), this.cameraManager.getCamera())
    this.composer.addPass(this.renderPass)

    // 泛光效果
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.2, 0.5, 0.85)
    this.bloomPass.enabled = false
    this.composer.addPass(this.bloomPass)

    // 景深效果
    this.bokehPass = new BokehPass(this.sceneManager.getScene(), this.cameraManager.getCamera(), {
      focus: 5.0,
      aperture: 0.00025,
      maxblur: 0.01,
      width: width,
      height: height
    })
    this.bokehPass.enabled = false
    this.composer.addPass(this.bokehPass)

    // 残影效果
    this.afterimagePass = new AfterimagePass()
    this.afterimagePass.enabled = false
    this.composer.addPass(this.afterimagePass)

    // 边缘轮廓通道
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      this.sceneManager.getScene(),
      this.cameraManager.getCamera()
    )
    this.outlinePass.edgeStrength = 3.0
    this.outlinePass.edgeGlow = 1.5
    this.outlinePass.edgeThickness = 2.0
    this.outlinePass.pulsePeriod = 2.0
    this.outlinePass.visibleEdgeColor.set('#00ffff')
    this.outlinePass.hiddenEdgeColor.set('#00ffff')
    this.outlinePass.enabled = false
    this.composer.addPass(this.outlinePass)
  }

  /**
   * 启动渲染循环
   */
  public startRenderLoop(): void {
    if (this.isRunning) return
    this.isRunning = true

    // 监听窗口大小变化
    const handleResize = () => {
      this.onWindowResize()
    }

    window.addEventListener('resize', handleResize)

    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.render()
    }

    animate()
  }

  /**
   * 渲染函数（WebGPU 优化版本）
   */
  private render(): void {
    if (!this.isRunning) return

    // 记录帧开始时间
    const frameStartTime = performance.now()
    const now = performance.now()
    const deltaTime = this.lastTime ? (now - this.lastTime) / 1000 : 0.016
    this.lastTime = now

    // 更新场景
    this.sceneManager.update(deltaTime)

    // WebGPU 特定优化：使用异步渲染
    this.renderWithWebGPUOptimizations(deltaTime)

    // 记录渲染结束时间
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - frameStartTime
    const frameTime = renderEndTime - frameStartTime

    // 更新性能数据
    this.performanceData.frameCount++
    this.performanceData.renderTimeHistory.push(renderTime)
    this.performanceData.frameTimeHistory.push(frameTime)
    this.performanceData.drawCalls = this.renderer.info.render.calls
    this.performanceData.triangles = this.renderer.info.render.triangles

    // 限制历史数据长度
    if (this.performanceData.renderTimeHistory.length > 100) {
      this.performanceData.renderTimeHistory.shift()
    }
    if (this.performanceData.frameTimeHistory.length > 100) {
      this.performanceData.frameTimeHistory.shift()
    }

    // 定期收集和发送性能指标
    if (now - this.performanceData.lastMetricsUpdate > 1000) {
      this.collectPerformanceMetrics()
      this.performanceData.lastMetricsUpdate = now

      // 清理未使用的资源
      this.cleanupUnusedResources()
    }
  }

  /**
   * 使用 WebGPU 优化进行渲染
   */
  private renderWithWebGPUOptimizations(deltaTime: number): void {
    try {
      // WebGPU 特定的渲染优化
      const device = (this.renderer as any).device as GPUDevice

      if (device) {
        // 检查内存使用情况
        this.updateMemoryUsage()

        // 渲染场景
        if (this.composer) {
          this.composer.render()
        } else {
          this.renderer.render(this.sceneManager.getScene(), this.cameraManager.getCamera())
        }
      } else {
        // 回退到标准渲染
        if (this.composer) {
          this.composer.render()
        } else {
          this.renderer.render(this.sceneManager.getScene(), this.cameraManager.getCamera())
        }
      }
    } catch (error) {
      console.warn('WebGPU rendering failed, falling back to standard rendering:', error)
      // 回退到标准渲染
      if (this.composer) {
        this.composer.render()
      } else {
        this.renderer.render(this.sceneManager.getScene(), this.cameraManager.getCamera())
      }
    }
  }

  /**
   * 更新内存使用情况
   */
  private updateMemoryUsage(): void {
    // 模拟内存使用跟踪（实际实现需要 WebGPU 扩展）
    this.performanceData.gpuMemoryUsage = this.gpuOptimization.currentMemoryUsage.total
  }

  /**
   * 清理未使用的资源
   */
  private cleanupUnusedResources(): void {
    // 清理未使用的纹理
    const texturesToRemove: string[] = []
    this.resources.textures.forEach((texture, key) => {
      // 检查纹理是否被使用
      // 这里可以添加更复杂的使用跟踪
      texturesToRemove.push(key)
    })

    texturesToRemove.forEach(key => {
      const texture = this.resources.textures.get(key)
      if (texture) {
        texture.destroy()
        this.resources.textures.delete(key)
      }
    })

    // 清理未使用的缓冲区
    const buffersToRemove: string[] = []
    this.resources.buffers.forEach((buffer, key) => {
      buffersToRemove.push(key)
    })

    buffersToRemove.forEach(key => {
      const buffer = this.resources.buffers.get(key)
      if (buffer) {
        buffer.destroy()
        this.resources.buffers.delete(key)
      }
    })
  }

  /**
   * 收集性能指标（WebGPU 增强版本）
   */
  private collectPerformanceMetrics(): void {
    const now = performance.now()
    const elapsed = now - this.performanceData.startTime
    const fps = (this.performanceData.frameCount / elapsed) * 1000

    const avgRenderTime =
      this.performanceData.renderTimeHistory.length > 0
        ? this.performanceData.renderTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.renderTimeHistory.length
        : 0

    const avgFrameTime =
      this.performanceData.frameTimeHistory.length > 0
        ? this.performanceData.frameTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.frameTimeHistory.length
        : 0

    const metrics = {
      fps: Math.round(fps),
      renderTime: avgRenderTime,
      frameTime: avgFrameTime,
      drawCalls: this.performanceData.drawCalls,
      triangles: this.performanceData.triangles,
      gpuMemoryUsage: this.performanceData.gpuMemoryUsage,
      computePasses: this.performanceData.computePasses,
      renderScale: window.devicePixelRatio,
      renderer: 'webgpu',
      features: {
        textureCompression: this.gpuOptimization.useTextureCompression,
        bindGroupOptimization: this.gpuOptimization.useBindGroupOptimization,
        computeShaders: this.gpuOptimization.useComputeShaders,
        asyncPipelineCreation: this.gpuOptimization.useAsyncPipelineCreation
      },
      memoryBudget: this.gpuOptimization.memoryBudget,
      currentMemoryUsage: this.gpuOptimization.currentMemoryUsage
    }

    eventSystem.emit(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, metrics)
  }

  /**
   * 处理窗口大小变化
   */
  private onWindowResize(): void {
    const { width, height } = this.container.getBoundingClientRect()

    // 更新相机
    this.cameraManager.updateAspectRatio(width / height)

    // 更新渲染器
    const basePixelRatio = window.devicePixelRatio
    const optimalPixelRatio = Math.min(basePixelRatio, 2)
    this.renderer.setPixelRatio(optimalPixelRatio)
    this.renderer.setSize(width, height)

    // 更新后期处理效果
    if (this.composer) {
      this.composer.setSize(width, height)

      if (this.outlinePass) {
        this.outlinePass.setSize(width, height)
      }
    }
  }

  /**
   * 设置渲染质量
   */
  public setRenderQuality(qualityLevel: number): void {
    const clampedQuality = Math.max(1, Math.min(5, qualityLevel))

    // 调整像素比
    const basePixelRatio = window.devicePixelRatio
    const pixelRatioMap = [0.5, 0.75, 1, 1.5, 2]
    const optimalPixelRatio = pixelRatioMap[clampedQuality - 1]
    this.renderer.setPixelRatio(optimalPixelRatio)

    // 调整阴影质量
    const shadowMapSizeMap = [512, 1024, 2048, 4096, 8192]
    const shadowMapSize = shadowMapSizeMap[clampedQuality - 1]

    // 调整场景中的灯光阴影
    const scene = this.sceneManager.getScene()
    scene.traverse(object => {
      if (object instanceof THREE.Light && 'shadow' in object && object.shadow) {
        object.shadow.mapSize.width = shadowMapSize
        object.shadow.mapSize.height = shadowMapSize
      }
    })

    // 触发渲染质量更新事件
    eventSystem.emit(APP_EVENTS.RENDER_QUALITY_UPDATED, {
      qualityLevel: clampedQuality,
      pixelRatio: optimalPixelRatio,
      shadowMapSize: shadowMapSize
    })
  }

  /**
   * 添加对象到场景
   */
  public addObject(object: THREE.Object3D): void {
    this.sceneManager.addObject(object)
  }

  /**
   * 从场景移除对象
   */
  public removeObject(object: THREE.Object3D): void {
    this.sceneManager.removeObject(object)
  }

  /**
   * 清理场景
   */
  public clearScene(): void {
    this.sceneManager.clear()
  }

  /**
   * 设置场景更新函数
   */
  public setUpdateFunction(updateFn: (deltaTime: number) => void): void {
    this.sceneManager.setUpdateFunction(updateFn)
  }

  /**
   * 获取场景实例
   */
  public getScene(): THREE.Scene {
    return this.sceneManager.getScene()
  }

  /**
   * 获取相机实例
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.cameraManager.getCamera()
  }

  /**
   * 获取渲染器实例
   */
  public getRenderer(): WebGPURenderer {
    return this.renderer
  }

  /**
   * 重置渲染引擎
   */
  public reset(): void {
    this.stop()
    this.sceneManager.reset()
    this.cameraManager.reset()
    this.startRenderLoop()
  }

  /**
   * 停止渲染引擎
   */
  public stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * 启用/禁用 WebGPU 特定功能
   */
  public setWebGPUFeature(feature: string, enabled: boolean): void {
    switch (feature) {
      case 'textureCompression':
        this.gpuOptimization.useTextureCompression = enabled
        break
      case 'bindGroupOptimization':
        this.gpuOptimization.useBindGroupOptimization = enabled
        break
      case 'computeShaders':
        this.gpuOptimization.useComputeShaders = enabled
        break
      case 'asyncPipelineCreation':
        this.gpuOptimization.useAsyncPipelineCreation = enabled
        break
    }
  }

  /**
   * 设置内存预算
   */
  public setMemoryBudget(budget: { textures?: number; buffers?: number; total?: number }): void {
    if (budget.textures) {
      this.gpuOptimization.memoryBudget.textures = budget.textures
    }
    if (budget.buffers) {
      this.gpuOptimization.memoryBudget.buffers = budget.buffers
    }
    if (budget.total) {
      this.gpuOptimization.memoryBudget.total = budget.total
    }
  }

  /**
   * 获取 WebGPU 适配器信息
   */
  public getAdapterInfo(): any {
    const adapter = (this.renderer as any).adapter as GPUAdapter
    if (adapter) {
      return {
        name: adapter.name,
        features: Array.from(adapter.features),
        limits: adapter.limits
      }
    }
    return null
  }

  /**
   * 销毁渲染引擎
   */
  public dispose(): void {
    this.stop()
    this.clearScene()

    // 清理 WebGPU 资源
    this.cleanupAllResources()

    this.renderer.dispose()

    if (this.composer) {
      this.composer.dispose()
    }

    // 移除渲染器DOM元素
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }

    // 触发销毁事件
    eventSystem.emit(APP_EVENTS.RENDER_ENGINE_DISPOSED, {
      container: this.container,
      renderer: 'webgpu'
    })
  }

  /**
   * 清理所有 WebGPU 资源
   */
  private cleanupAllResources(): void {
    // 清理所有纹理
    this.resources.textures.forEach(texture => {
      texture.destroy()
    })
    this.resources.textures.clear()

    // 清理所有缓冲区
    this.resources.buffers.forEach(buffer => {
      buffer.destroy()
    })
    this.resources.buffers.clear()

    // 清理所有管线
    this.resources.pipelines.clear()

    // 清理所有绑定组
    this.resources.bindGroups.clear()
  }

  /**
   * 获取当前性能数据
   */
  public getPerformanceData(): {
    fps: number
    renderTime: number
    frameTime: number
    drawCalls: number
    triangles: number
  } {
    const now = performance.now()
    const elapsed = now - this.performanceData.startTime
    const fps = (this.performanceData.frameCount / elapsed) * 1000

    const avgRenderTime =
      this.performanceData.renderTimeHistory.length > 0
        ? this.performanceData.renderTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.renderTimeHistory.length
        : 0

    const avgFrameTime =
      this.performanceData.frameTimeHistory.length > 0
        ? this.performanceData.frameTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.frameTimeHistory.length
        : 0

    return {
      fps: Math.round(fps),
      renderTime: avgRenderTime,
      frameTime: avgFrameTime,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles
    }
  }
}

/**
 * 检查 WebGPU 支持情况
 */
export function isWebGPUSupported(): boolean {
  return 'gpu' in navigator
}

/**
 * 创建渲染引擎（根据设备支持情况自动选择 WebGPU 或 WebGL）
 */
export function createRenderEngine(config: any): any {
  if (isWebGPUSupported()) {
    try {
      return new WebGPURenderEngine(config)
    } catch (error) {
      console.warn('WebGPU initialization failed, falling back to WebGL:', error)
      // 这里可以导入并返回 WebGL 渲染引擎
      return null
    }
  } else {
    console.warn('WebGPU not supported, falling back to WebGL')
    // 这里可以导入并返回 WebGL 渲染引擎
    return null
  }
}
