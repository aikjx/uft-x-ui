import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { DepthOfFieldEffect } from 'three/examples/jsm/postprocessing/DepthOfFieldEffect.js'
import { SMAAEffect } from 'three/examples/jsm/postprocessing/SMAAEffect.js'
import { VignetteEffect } from 'three/examples/jsm/postprocessing/VignetteEffect.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { VISUALIZATION_CONFIG } from '../constants'
import { SceneManager } from './SceneManager'
import { CameraManager } from './CameraManager'
import { renderOptimizer } from '../performance/performanceUtils'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import {
  resourceManager,
  ResourceType,
  ResourcePriority
} from '../utils/IntelligentResourceManager'
import { BVHSystem, createRay } from '../utils/BVHSystem'
import { PathTracingSystem, PathTracingConfig } from './PathTracingSystem'
import {
  AdvancedInteractionSystem,
  InteractionMode
} from '../interaction/AdvancedInteractionSystem'
import {
  PBRMaterial,
  VolumetricLightMaterial,
  NebulaMaterial,
  GlobalIlluminationMaterial,
  RayTracingMaterial
} from '../shaders/AdvancedShaderSystem'
import {
  AdvancedParticleSystemManager,
  GPUParticleSystem
} from '../visualization/AdvancedParticleSystem'
import { WebGPURenderEngine, isWebGPUSupported } from './WebGPURenderEngine'
import { AdvancedLODSystem } from '../performance/AdvancedLODSystem'
import { mlPerformancePredictor } from '../performance/MLPerformancePredictor'
import { AdvancedPostProcessingSystem } from './AdvancedPostProcessingSystem'

interface RenderEngineConfig {
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

export class RenderEngine {
  private container: HTMLElement
  private sceneManager: SceneManager
  private cameraManager: CameraManager
  private renderer: THREE.WebGLRenderer
  private composer: EffectComposer | null = null
  private renderPass: RenderPass | null = null
  private bloomPass: UnrealBloomPass | null = null
  private outlinePass: OutlinePass | null = null
  private fxaaPass: ShaderPass | null = null
  private smaaPass: SMAAPass | null = null
  private filmPass: FilmPass | null = null
  private glitchPass: GlitchPass | null = null
  private afterimagePass: AfterimagePass | null = null
  private bokehPass: BokehPass | null = null

  // 高级着色器材质
  public volumetricLightMaterial: VolumetricLightMaterial | null = null
  public nebulaMaterial: NebulaMaterial | null = null
  public globalIlluminationMaterial: GlobalIlluminationMaterial | null = null
  public rayTracingMaterial: RayTracingMaterial | null = null

  // 高级粒子系统
  public particleSystemManager: AdvancedParticleSystemManager | null = null
  public gpuParticleSystem: GPUParticleSystem | null = null

  // 高级 LOD 系统
  public lodSystem: AdvancedLODSystem | null = null

  // 实时路径追踪系统
  public pathTracingSystem: PathTracingSystem | null = null

  // 高级交互系统
  public interactionSystem: AdvancedInteractionSystem | null = null

  // BVH 系统用于优化光线追踪和碰撞检测
  public bvhSystem: BVHSystem | null = null

  // 高级后处理系统
  public postProcessingSystem: AdvancedPostProcessingSystem | null = null

  private controls: OrbitControls | null
  private config: RenderEngineConfig
  private animationId: number | null = null
  private isRunning: boolean = false
  private lastTime: number = 0
  private rayTracingEnabled: boolean = false
  private globalIlluminationEnabled: boolean = false
  private pathTracingEnabled: boolean = false

  // 性能统计
  private performanceData = {
    frameCount: 0,
    startTime: performance.now(),
    lastMetricsUpdate: 0,
    renderTimeHistory: [] as number[],
    frameTimeHistory: [] as number[]
  }

  // 资源管理
  private resourceIds: Set<string> = new Set()

  // 存储调整大小的处理器，以便后续清理
  private resizeHandler: ((event: Event) => void) | null = null

  constructor(config: RenderEngineConfig) {
    this.config = {
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
    this.sceneManager = new SceneManager({ autoUpdate: config.autoUpdate })
    this.cameraManager = new CameraManager({ position: config.cameraPosition })
    this.renderer = this.createRenderer()
    this.controls = this.config.enableControls ? this.createControls() : null

    // 初始化 LOD 系统
    this.initializeLODSystem()

    // 初始化资源管理
    this.initializeResourceManagement()

    // 初始化路径追踪系统
    this.initializePathTracingSystem()

    // 初始化交互系统
    this.initializeInteractionSystem()

    // 初始化 BVH 系统
    this.initializeBVHSystem()

    this.setupScene()
    this.setupPostProcessing()

    // 初始化高级后处理系统
    this.initializeAdvancedPostProcessing()
  }

  /**
   * 初始化路径追踪系统
   */
  private initializePathTracingSystem(): void {
    try {
      this.pathTracingSystem = new PathTracingSystem({
        samplesPerPixel: 8,
        maxBounces: 8,
        enableDirectLighting: true,
        enableIndirectLighting: true,
        enableSoftShadows: true,
        enableGlobalIllumination: true,
        enableCaustics: false,
        enableDenoiser: true,
        resolutionScale: 0.5,
        rayDepthLimit: 8,
        russianRouletteThreshold: 0.8
      })

      this.pathTracingSystem.initialize(
        this.sceneManager.getScene(),
        this.cameraManager.getCamera(),
        this.renderer
      )

      console.log('Path tracing system initialized')
    } catch (error) {
      console.warn('Path tracing system initialization failed:', error)
      this.pathTracingSystem = null
    }
  }

  /**
   * 初始化交互系统
   */
  private initializeInteractionSystem(): void {
    try {
      this.interactionSystem = new AdvancedInteractionSystem({
        mode: InteractionMode.ORBIT,
        enableDamping: true,
        dampingFactor: 0.05,
        enableAutoRotate: false,
        autoRotateSpeed: 2.0,
        enableZoom: true,
        zoomSpeed: 1.0,
        enablePan: true,
        panSpeed: 1.0,
        enableRotate: true,
        rotateSpeed: 1.0,
        minDistance: 0.1,
        maxDistance: 1000,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        minAzimuthAngle: -Infinity,
        maxAzimuthAngle: Infinity,
        enableGestures: true,
        enableVoiceControl: false,
        enableGamepad: false,
        enableMixedReality: false,
        performanceMode: 'medium'
      })

      this.interactionSystem.initialize(
        this.renderer,
        this.sceneManager.getScene(),
        this.cameraManager.getCamera()
      )
      this.interactionSystem.enable()

      console.log('Advanced interaction system initialized')
    } catch (error) {
      console.warn('Advanced interaction system initialization failed:', error)
      this.interactionSystem = null
    }
  }

  /**
   * 初始化资源管理
   */
  private initializeResourceManagement(): void {
    // 监听资源事件
    eventSystem.on(APP_EVENTS.RESOURCE_CLEANUP, data => {
      console.log('Resource cleanup performed:', data)
    })

    eventSystem.on(APP_EVENTS.RESOURCE_ERROR, data => {
      console.error('Resource error:', data)
    })

    // 配置资源管理器内存限制
    resourceManager.setMemoryLimits({
      total: 512 * 1024 * 1024, // 512MB
      textures: 256 * 1024 * 1024, // 256MB
      geometries: 128 * 1024 * 1024, // 128MB
      materials: 64 * 1024 * 1024, // 64MB
      other: 64 * 1024 * 1024 // 64MB
    })
  }

  /**
   * 初始化 LOD 系统
   */
  private initializeLODSystem(): void {
    try {
      this.lodSystem = new AdvancedLODSystem()
      this.lodSystem.initialize(this.sceneManager.getScene(), this.cameraManager.getCamera())
      console.log('LOD system initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize LOD system:', error)
      this.lodSystem = null
    }
  }

  /**
   * 初始化 BVH 系统
   */
  private initializeBVHSystem(): void {
    try {
      this.bvhSystem = new BVHSystem()
      this.bvhSystem.buildFromScene(this.sceneManager.getScene())
      console.log('BVH system initialized successfully')

      // 输出 BVH 统计信息
      const stats = this.bvhSystem.getStats()
      console.log('BVH Stats:', stats)
    } catch (error) {
      console.warn('Failed to initialize BVH system:', error)
      this.bvhSystem = null
    }
  }

  /**
   * 初始化高级后处理系统
   */
  private initializeAdvancedPostProcessing(): void {
    try {
      this.postProcessingSystem = new AdvancedPostProcessingSystem(
        this.renderer,
        this.sceneManager.getScene(),
        this.cameraManager.getCamera(),
        {
          enableTAA: true,
          enableBloom: false,
          enableDOF: false,
          enableOutline: false,
          enableAfterimage: false,
          enableFilm: false,
          bloomStrength: 1.2,
          bloomThreshold: 0.8,
          bloomRadius: 0.5,
          dofFocus: 5.0,
          dofAperture: 0.00025,
          dofMaxBlur: 0.01,
          filmGrain: 0.1,
          filmScanlines: 0.02,
          filmNoise: 0.05,
          filmGrayscale: false,
          outlineStrength: 3.0,
          outlineThickness: 1.0,
          outlineGlow: 1.0,
          afterimageDamp: 0.8
        }
      )
      console.log('Advanced post-processing system initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize advanced post-processing system:', error)
      this.postProcessingSystem = null
    }
  }

  /**
   * 创建并配置渲染器
   */
  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: VISUALIZATION_CONFIG.performance.antialiasing || true,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: true,
      depth: true,
      logarithmicDepthBuffer: true
    })

    // 初始设置
    const { width, height } = this.container.getBoundingClientRect()

    // 优化：使用devicePixelRatio的上限，避免过高的渲染分辨率
    const basePixelRatio = window.devicePixelRatio
    const optimalPixelRatio = Math.min(basePixelRatio, 2) // 限制最大像素比为2

    renderer.setSize(width, height)
    renderer.setPixelRatio(optimalPixelRatio)
    renderer.setClearColor(
      VISUALIZATION_CONFIG.clearColor || 0x000000,
      VISUALIZATION_CONFIG.clearAlpha || 0.8
    )

    // 高级渲染设置
    renderer.autoClear = true
    renderer.localClippingEnabled = false
    renderer.info.autoReset = true
    renderer.sortObjects = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = 2.0
    renderer.physicallyCorrectLights = true

    // 阴影优化
    if (VISUALIZATION_CONFIG.performance?.enableShadowMap) {
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.shadowMap.autoUpdate = false
      renderer.shadowMap.needsUpdate = true
      renderer.shadowMap.renderSingleSided = false
    }

    // 添加到容器
    this.container.appendChild(renderer.domElement)

    return renderer
  }

  /**
   * 设置后期处理效果 - 添加更多高级后期处理效果，提升视觉质量
   */
  private setupPostProcessing(): void {
    const { width, height } = this.container.getBoundingClientRect()

    // 创建效果合成器
    this.composer = new EffectComposer(this.renderer)

    // 渲染通道
    this.renderPass = new RenderPass(this.sceneManager.getScene(), this.cameraManager.getCamera())
    this.composer.addPass(this.renderPass)

    // 后期处理通道 - 添加更多高级效果

    // 1. 基础抗锯齿 - 根据设备性能选择合适的抗锯齿方案
    const useHighQualityAA = VISUALIZATION_CONFIG.performance?.highQualityAA || false
    if (useHighQualityAA) {
      // SMAAEffect - 高质量抗锯齿，性能消耗较大
      this.smaaPass = new SMAAPass(width, height)
      this.composer.addPass(this.smaaPass)
    } else {
      // FXAA - 快速抗锯齿，性能消耗较小
      this.fxaaPass = new ShaderPass(FXAAShader)
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height
      this.composer.addPass(this.fxaaPass)
    }

    // 2. 景深效果 - 增加视觉层次感
    this.bokehPass = new BokehPass(this.sceneManager.getScene(), this.cameraManager.getCamera(), {
      focus: 5.0,
      aperture: 0.00025,
      maxblur: 0.01,
      width: width,
      height: height
    })
    this.bokehPass.enabled = false // 默认禁用，根据需要启用
    this.composer.addPass(this.bokehPass)

    // 3. 泛光效果 - 可选，根据性能设置强度
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.2, // 增强强度
      0.5, // 半径
      0.85 // 阈值
    )
    this.bloomPass.enabled = false // 默认禁用，根据需要启用
    this.composer.addPass(this.bloomPass)

    // 4. 残影效果 - 增加运动轨迹效果
    this.afterimagePass = new AfterimagePass()
    this.afterimagePass.enabled = false // 默认禁用，根据需要启用
    this.composer.addPass(this.afterimagePass)

    // 5. 边缘轮廓通道 - 可选，默认禁用，需要时启用
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
    this.outlinePass.enabled = false // 默认禁用，减少性能消耗
    this.composer.addPass(this.outlinePass)

    // 6. 其他效果通道 - 默认禁用，需要时启用
    this.filmPass = new FilmPass(
      0.2, // 噪点强度
      0.02, // 扫描线强度
      648, // 扫描线计数
      false // 灰度
    )
    this.filmPass.enabled = false
    this.composer.addPass(this.filmPass)

    this.glitchPass = new GlitchPass()
    this.glitchPass.enabled = false
    this.composer.addPass(this.glitchPass)
  }

  /**
   * 创建并配置控制器
   */
  private createControls(): OrbitControls {
    const controls = new OrbitControls(this.cameraManager.getCamera(), this.renderer.domElement)

    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = VISUALIZATION_CONFIG.maxCameraDistance
    controls.minDistance = VISUALIZATION_CONFIG.minCameraDistance

    return controls
  }

  /**
   * 设置场景，添加灯光和辅助对象
   */
  private setupScene(): void {
    const scene = this.sceneManager.getScene()

    // 设置场景雾效
    if (this.config.enableFog) {
      scene.fog = new THREE.FogExp2(0x000000, 0.03)
    }

    // 添加高级灯光系统
    // 1. 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, this.config.ambientLightIntensity)
    scene.add(ambientLight)

    // 2. 主方向光
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      this.config.directionalLightIntensity
    )
    directionalLight.position.set(5, 10, 7.5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)

    // 3. 补光
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3)
    fillLight.position.set(-5, 5, -7.5)
    scene.add(fillLight)

    // 4. 点光源 - 用于创建发光效果
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100)
    pointLight1.position.set(10, 10, 10)
    pointLight1.castShadow = true
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100)
    pointLight2.position.set(-10, -10, -10)
    pointLight2.castShadow = true
    scene.add(pointLight2)

    // 5. 聚光灯 - 用于强调特定区域
    const spotLight = new THREE.SpotLight(0xffffff, 0.5)
    spotLight.position.set(0, 20, 0)
    spotLight.angle = Math.PI / 4
    spotLight.penumbra = 0.1
    spotLight.decay = 2
    spotLight.distance = 50
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    spotLight.shadow.camera.near = 1
    spotLight.shadow.camera.far = 20
    scene.add(spotLight)

    // 添加网格辅助线
    if (VISUALIZATION_CONFIG.showGrid) {
      const gridHelper = new THREE.GridHelper(
        VISUALIZATION_CONFIG.gridSize,
        VISUALIZATION_CONFIG.gridDivisions,
        0x444444,
        0x222222
      )
      gridHelper.name = 'gridHelper'
      scene.add(gridHelper)
    }

    // 添加坐标轴
    if (VISUALIZATION_CONFIG.showAxes) {
      const axesHelper = new THREE.AxesHelper(VISUALIZATION_CONFIG.axesSize)
      axesHelper.name = 'axesHelper'
      scene.add(axesHelper)
    }

    // 添加增强型星空背景
    this.addEnhancedStarfield(scene)
  }

  /**
   * 添加增强型星空背景 - 包含动态效果和多种粒子类型
   */
  private addEnhancedStarfield(scene: THREE.Scene): void {
    // 优化：根据设备性能动态调整星星数量
    const starsCount = VISUALIZATION_CONFIG.performance?.starCount || 2000
    const hasHighPerformance = this.config.dynamicPixelRatio && starsCount > 3000

    // 创建多层次星空背景
    this.createStarLayer(scene, starsCount * 0.6, 0.1, 0xffffff, 0.8, 0.001) // 主星星层
    this.createStarLayer(scene, starsCount * 0.3, 0.05, 0x60a5fa, 0.6, 0.002) // 蓝色星星层
    this.createStarLayer(scene, starsCount * 0.1, 0.15, 0xc084fc, 0.9, 0.0005) // 紫色亮星星层

    // 添加动态星云背景
    this.addNebulaBackground(scene)

    // 添加粒子流背景效果
    if (hasHighPerformance) {
      this.addParticleStreamBackground(scene)
    }
  }

  /**
   * 创建单个星星层
   */
  private createStarLayer(
    scene: THREE.Scene,
    count: number,
    size: number,
    color: number,
    opacity: number,
    rotationSpeed: number
  ): void {
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const starsVertices = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      starsVertices.push(x, y, z)
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // 为星星层添加动画
    this.sceneManager.addUpdateFunction(deltaTime => {
      stars.rotation.y += deltaTime * rotationSpeed
      stars.rotation.x += deltaTime * rotationSpeed * 0.5
    })
  }

  /**
   * 添加星云背景效果
   */
  private addNebulaBackground(scene: THREE.Scene): void {
    // 创建背景平面
    const geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100)

    // 创建动态材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        color1: { value: new THREE.Color(0x1a1a2e) },
        color2: { value: new THREE.Color(0x16213e) },
        color3: { value: new THREE.Color(0x0f3460) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          float n = noise(uv * 10.0 + time * 0.1);
          vec3 color = mix(color1, color2, uv.y);
          color = mix(color, color3, n * 0.5);
          gl_FragColor = vec4(color, 0.3);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    const nebula = new THREE.Mesh(geometry, material)
    nebula.position.z = -500
    nebula.rotation.x = Math.PI * 0.5
    scene.add(nebula)

    // 添加动画
    this.sceneManager.addUpdateFunction(deltaTime => {
      ;(material.uniforms.time as THREE.IUniform<number>).value += deltaTime
      nebula.rotation.y += deltaTime * 0.01
    })
  }

  /**
   * 添加粒子流背景效果
   */
  private addParticleStreamBackground(scene: THREE.Scene): void {
    const particleCount = 500

    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    // 初始化粒子位置和速度
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // 随机位置
      positions[i3] = (Math.random() - 0.5) * 2000
      positions[i3 + 1] = (Math.random() - 0.5) * 2000
      positions[i3 + 2] = (Math.random() - 0.5) * 2000

      // 随机速度
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.3,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // 添加粒子动画
    this.sceneManager.addUpdateFunction(deltaTime => {
      const positions = particleGeometry.attributes.position.array as Float32Array
      const velocities = particleGeometry.attributes.velocity.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // 更新位置
        positions[i3] += velocities[i3] * deltaTime * 50
        positions[i3 + 1] += velocities[i3 + 1] * deltaTime * 50
        positions[i3 + 2] += velocities[i3 + 2] * deltaTime * 50

        // 重置超出边界的粒子
        if (
          Math.abs(positions[i3]) > 1000 ||
          Math.abs(positions[i3 + 1]) > 1000 ||
          Math.abs(positions[i3 + 2]) > 1000
        ) {
          positions[i3] = (Math.random() - 0.5) * 2000
          positions[i3 + 1] = (Math.random() - 0.5) * 2000
          positions[i3 + 2] = (Math.random() - 0.5) * 2000
        }
      }

      particleGeometry.attributes.position.needsUpdate = true
    })
  }

  /**
   * 启用光线追踪效果
   * @param enabled 是否启用
   */
  public enableRayTracing(enabled: boolean = true): void {
    if (enabled && !this.rayTracingMaterial) {
      this.rayTracingMaterial = new RayTracingMaterial()
      this.rayTracingMaterial.updateCamera(this.cameraManager.getCamera())

      // 添加到场景中
      this.sceneManager.getScene().add(this.rayTracingMaterial)
    }

    this.rayTracingEnabled = enabled

    // 触发性能状态更新事件
    eventSystem.emit(APP_EVENTS.RENDER_QUALITY_UPDATED, {
      qualityLevel: enabled ? 5 : 2,
      feature: 'rayTracing'
    })
  }

  /**
   * 启用全局光照效果
   * @param enabled 是否启用
   */
  public enableGlobalIllumination(enabled: boolean = true): void {
    if (enabled && !this.globalIlluminationMaterial) {
      this.globalIlluminationMaterial = new GlobalIlluminationMaterial()
      this.globalIlluminationMaterial.updateTime(0)

      // 添加到场景中
      this.sceneManager.getScene().add(this.globalIlluminationMaterial)
    }

    this.globalIlluminationEnabled = enabled

    // 触发性能状态更新事件
    eventSystem.emit(APP_EVENTS.RENDER_QUALITY_UPDATED, {
      qualityLevel: enabled ? 4 : 2,
      feature: 'globalIllumination'
    })
  }

  /**
   * 启用路径追踪效果
   * @param enabled 是否启用
   */
  public enablePathTracing(enabled: boolean = true): void {
    if (enabled && this.pathTracingSystem) {
      this.pathTracingSystem.enable()
    } else if (this.pathTracingSystem) {
      this.pathTracingSystem.disable()
    }

    this.pathTracingEnabled = enabled

    // 触发性能状态更新事件
    eventSystem.emit(APP_EVENTS.RENDER_QUALITY_UPDATED, {
      qualityLevel: enabled ? 5 : 2,
      feature: 'pathTracing'
    })
  }

  /**
   * 创建PBR材质
   * @param options 材质选项
   * @returns PBR材质实例
   */
  public createPBRMaterial(
    options: {
      roughness?: number
      metalness?: number
      envMapIntensity?: number
      color?: THREE.Color
      emissive?: THREE.Color
      emissiveIntensity?: number
    } = {}
  ): PBRMaterial {
    const pbrMaterial = new PBRMaterial()
    pbrMaterial.configure(options)
    return pbrMaterial
  }

  /**
   * 创建体积光材质
   * @param options 材质选项
   * @returns 体积光材质实例
   */
  public createVolumetricLightMaterial(
    options: {
      lightIntensity?: number
      absorptionRate?: number
      density?: number
      scattering?: number
      color?: THREE.Color
      absorptionColor?: THREE.Color
    } = {}
  ): VolumetricLightMaterial {
    const volumetricLightMaterial = new VolumetricLightMaterial()
    volumetricLightMaterial.configure(options)
    return volumetricLightMaterial
  }

  /**
   * 创建星云材质
   * @param options 材质选项
   * @returns 星云材质实例
   */
  public createNebulaMaterial(
    options: {
      cloudDensity?: number
      noiseScale?: number
      noiseSpeed?: number
      colorA?: THREE.Color
      colorB?: THREE.Color
      brightness?: number
      opacity?: number
    } = {}
  ): NebulaMaterial {
    const nebulaMaterial = new NebulaMaterial()
    nebulaMaterial.configure(options)
    return nebulaMaterial
  }

  /**
   * 初始化高级粒子系统管理器
   * @param maxParticles 最大粒子数
   * @returns 粒子系统管理器实例
   */
  public initParticleSystemManager(maxParticles: number = 10000): AdvancedParticleSystemManager {
    if (!this.particleSystemManager) {
      this.particleSystemManager = new AdvancedParticleSystemManager({
        maxParticles,
        renderer: this.renderer
      })
    }
    return this.particleSystemManager
  }

  /**
   * 创建GPU粒子系统
   * @param options 粒子系统选项
   * @returns GPU粒子系统实例
   */
  public createGPUParticleSystem(
    options: {
      maxParticles?: number
      position?: THREE.Vector3
      rate?: number
      lifetime?: number
      lifetimeVariance?: number
      velocity?: THREE.Vector3
      velocityVariance?: number
      size?: number
      sizeVariance?: number
      color?: THREE.Color
      colorVariance?: number
      spread?: number
      gravity?: THREE.Vector3
      turbulence?: number
      damping?: number
    } = {}
  ): GPUParticleSystem {
    if (!this.gpuParticleSystem) {
      this.gpuParticleSystem = new GPUParticleSystem({
        maxParticles: options.maxParticles || 5000,
        position: options.position || new THREE.Vector3(),
        rate: options.rate || 500,
        lifetime: options.lifetime || 3.0,
        lifetimeVariance: options.lifetimeVariance || 1.0,
        velocity: options.velocity || new THREE.Vector3(),
        velocityVariance: options.velocityVariance || new THREE.Vector3(),
        size: options.size || 1.0,
        sizeVariance: options.sizeVariance || 0.5,
        color: options.color || new THREE.Color(0.5, 0.5, 1.0),
        colorVariance: options.colorVariance || 0.2,
        spread: options.spread || 0.5,
        gravity: options.gravity || new THREE.Vector3(),
        turbulence: options.turbulence || 0.5,
        damping: options.damping || 0.1
      })
    }
    return this.gpuParticleSystem
  }

  /**
   * 更新高级着色器和材质
   * @param deltaTime 帧时间差
   */
  private updateAdvancedMaterials(deltaTime: number): void {
    // 更新光线追踪材质
    if (this.rayTracingMaterial && this.rayTracingEnabled) {
      this.rayTracingMaterial.updateTime(deltaTime)
      this.rayTracingMaterial.updateCamera(this.cameraManager.getCamera())
    }

    // 更新全局光照材质
    if (this.globalIlluminationMaterial && this.globalIlluminationEnabled) {
      this.globalIlluminationMaterial.updateTime(deltaTime)
    }

    // 更新体积光材质
    if (this.volumetricLightMaterial) {
      this.volumetricLightMaterial.updateTime(deltaTime)
    }

    // 更新星云材质
    if (this.nebulaMaterial) {
      this.nebulaMaterial.updateTime(deltaTime)
    }
  }

  /**
   * 更新后期处理效果
   * @param deltaTime 帧时间差
   */
  private updatePostProcessingEffects(deltaTime: number): void {
    // 更新景深效果参数
    if (this.bokehPass && this.bokehPass.enabled) {
      this.bokehPass.materialBokeh.uniforms['focus'].value = 5.0 + Math.sin(deltaTime * 0.5) * 2.0
    }

    // 更新泛光效果参数
    if (this.bloomPass && this.bloomPass.enabled) {
      this.bloomPass.materialBloom.uniforms['strength'].value =
        1.2 + Math.sin(deltaTime * 0.2) * 0.3
    }
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

    // 存储到实例以便后续清理
    this.resizeHandler = handleResize

    const animate = () => {
      this.animationId = requestAnimationFrame(animate)

      this.render()
    }

    animate()
  }

  /**
   * 渲染函数 - 统一处理所有渲染逻辑
   */
  private render(): void {
    if (!this.isRunning) return

    // 记录帧开始时间
    const frameStartTime = performance.now()
    const now = performance.now()

    // 优化：添加时间差计算，防止卡顿
    const deltaTime = this.lastTime ? (now - this.lastTime) / 1000 : 0.016 // 默认 60fps
    this.lastTime = now

    // 控制器更新
    if (this.controls) {
      this.controls.update()
    }

    // 更新粒子系统
    if (this.gpuParticleSystem) {
      this.gpuParticleSystem.update(deltaTime)
    }

    // 更新场景
    if (this.sceneManager) {
      this.sceneManager.update(deltaTime)
    }

    // 更新 LOD 系统
    if (this.lodSystem) {
      this.lodSystem.updateAllLOD()
    }

    // 智能性能优化
    this.optimizePerformance()

    // 渲染器统计信息重置
    this.renderer.info.reset()

    // 开始渲染计时
    const renderStartTime = performance.now()

    // 渲染场景 - 使用高级后处理系统或路径追踪
    try {
      if (this.pathTracingEnabled && this.pathTracingSystem) {
        this.pathTracingSystem.render()
      } else if (this.postProcessingSystem) {
        this.postProcessingSystem.update(deltaTime)
        this.postProcessingSystem.render()
      } else if (this.composer) {
        this.composer.render()
      } else {
        this.renderer.render(this.sceneManager.getScene(), this.cameraManager.getCamera())
      }
    } catch (renderError) {
      // 如果渲染失败，回退到简单的渲染方式
      console.error('Advanced rendering failed, falling back to simple rendering:', renderError)
      try {
        this.renderer.render(this.sceneManager.getScene(), this.cameraManager.getCamera())
      } catch (simpleRenderError) {
        console.error('Simple rendering also failed:', simpleRenderError)
        // 在这里可以添加更多的错误处理
      }
    }

    // 更新高级材质和效果
    this.updateAdvancedMaterials(deltaTime)

    // 更新后期处理效果
    this.updatePostProcessingEffects(deltaTime)

    // 更新粒子系统
    if (this.particleSystemManager) {
      this.particleSystemManager.update(deltaTime)
    }

    // 记录渲染结束时间
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime
    const frameTime = renderEndTime - frameStartTime

    // 更新性能数据
    this.performanceData.frameCount++

    // 优化：限制性能历史记录长度，减少内存占用
    this.performanceData.renderTimeHistory.push(renderTime)
    if (this.performanceData.renderTimeHistory.length > 50) {
      this.performanceData.renderTimeHistory.shift()
    }

    this.performanceData.frameTimeHistory.push(frameTime)
    if (this.performanceData.frameTimeHistory.length > 50) {
      this.performanceData.frameTimeHistory.shift()
    }

    // 定期收集和发送性能指标（每1000ms，减少频率）
    if (now - this.performanceData.lastMetricsUpdate > 1000) {
      this.collectPerformanceMetrics()
      this.performanceData.lastMetricsUpdate = now
    }
  }

  /**
   * 智能性能优化
   */
  private optimizePerformance(): void {
    const performanceData = this.getPerformanceData()
    const resourceStats = this.getResourceStats()
    const memoryUsage = this.getMemoryUsage()

    // 收集当前性能数据
    const currentData = {
      fps: performanceData.fps,
      renderTime: performanceData.renderTime,
      frameTime: performanceData.frameTime,
      drawCalls: performanceData.drawCalls,
      triangles: performanceData.triangles,
      particleCount: this.gpuParticleSystem ? 10000 : 0, // 估算粒子数量
      renderScale: this.renderer.getPixelRatio(),
      shadowQuality: this.renderer.shadowMap.enabled ? 1 : 0,
      postProcessing: this.composer !== null,
      textureMemory: resourceStats.sizeByType?.texture || 0,
      objectCount: resourceStats.countByType?.mesh || 0,
      complexObjectCount: resourceStats.countByType?.mesh || 0,
      thermalState: 'normal' as const, // 假设正常状态
      batteryLevel: 1.0, // 假设满电
      devicePerformanceLevel: 'high' as const // 假设高性能设备
    }

    // 使用机器学习模型预测最佳性能设置
    this.predictOptimalSettings(currentData)
  }

  /**
   * 预测最佳性能设置
   */
  private async predictOptimalSettings(currentData: any): Promise<void> {
    try {
      // 提取优化参数
      const optimizationParams = {
        particleCount: currentData.particleCount,
        renderScale: currentData.renderScale,
        shadowQuality: currentData.shadowQuality,
        postProcessing: currentData.postProcessing,
        textureMemory: currentData.textureMemory,
        objectCount: currentData.objectCount,
        complexObjectCount: currentData.complexObjectCount
      }

      // 提取设备数据
      const deviceData = {
        thermalState: currentData.thermalState,
        batteryLevel: currentData.batteryLevel,
        devicePerformanceLevel: currentData.devicePerformanceLevel
      }

      // 使用机器学习模型预测性能
      const prediction = await mlPerformancePredictor.predictPerformance(
        optimizationParams,
        deviceData
      )

      // 根据预测结果调整性能设置
      this.adjustPerformanceSettings(prediction)

      // 记录预测数据用于模型训练
      mlPerformancePredictor.addTrainingData(currentData)
    } catch (error) {
      console.error('Error predicting performance:', error)
    }
  }

  /**
   * 调整性能设置
   */
  private adjustPerformanceSettings(prediction: any): void {
    // 根据预测的 FPS 调整性能设置
    const targetFps = 60
    const predictedFps = prediction.fps

    if (predictedFps < targetFps * 0.8) {
      // FPS 低于目标的 80%，需要降低性能设置
      this.reducePerformance()
    } else if (predictedFps > targetFps * 0.95) {
      // FPS 高于目标的 95%，可以提高性能设置
      this.increasePerformance()
    }
  }

  /**
   * 降低性能设置
   */
  private reducePerformance(): void {
    // 降低渲染分辨率
    const currentPixelRatio = this.renderer.getPixelRatio()
    if (currentPixelRatio > 0.5) {
      this.renderer.setPixelRatio(Math.max(0.5, currentPixelRatio - 0.2))
    }

    // 禁用后处理效果
    if (this.composer) {
      this.disableAllPostProcessing()
    }

    // 禁用阴影
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = false
    }

    // 减少粒子数量
    if (this.gpuParticleSystem) {
      // 这里可以添加减少粒子数量的逻辑
    }
  }

  /**
   * 提高性能设置
   */
  private increasePerformance(): void {
    // 提高渲染分辨率
    const currentPixelRatio = this.renderer.getPixelRatio()
    const basePixelRatio = window.devicePixelRatio
    if (currentPixelRatio < basePixelRatio) {
      this.renderer.setPixelRatio(Math.min(basePixelRatio, currentPixelRatio + 0.2))
    }

    // 启用基本后处理效果
    if (this.composer) {
      this.enableBasicPostProcessing()
    }

    // 启用阴影
    if (!this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = true
    }

    // 增加粒子数量
    if (this.gpuParticleSystem) {
      // 这里可以添加增加粒子数量的逻辑
    }
  }

  /**
   * 收集性能指标
   */
  private collectPerformanceMetrics(): void {
    const now = performance.now()
    const renderer = this.renderer

    // 计算FPS
    const elapsed = now - this.performanceData.startTime
    const fps = (this.performanceData.frameCount / elapsed) * 1000

    // 计算平均渲染时间
    const avgRenderTime =
      this.performanceData.renderTimeHistory.length > 0
        ? this.performanceData.renderTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.renderTimeHistory.length
        : 0

    // 计算平均帧时间
    const avgFrameTime =
      this.performanceData.frameTimeHistory.length > 0
        ? this.performanceData.frameTimeHistory.reduce((a, b) => a + b, 0) /
          this.performanceData.frameTimeHistory.length
        : 0

    // 内存使用情况（使用performance API，如果可用）
    let memoryUsageMB = 0
    if (performance.memory) {
      memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024)
    }

    // 发送性能指标事件
    const metrics = {
      fps: Math.round(fps),
      renderTime: avgRenderTime,
      frameTime: avgFrameTime,
      memoryUsageMB: Math.round(memoryUsageMB),
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      optimizationLevel: 2,
      networkLatency: 0,
      particleCount: 0,
      objectCount: 0,
      textureMemory: 0,
      shadowQuality: 1.0,
      postProcessing: true,
      thermalState: 'normal',
      batteryLevel: 1.0
    }

    eventSystem.emit(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, metrics)

    // 限制历史数据长度，避免内存泄漏
    if (this.performanceData.renderTimeHistory.length > 100) {
      this.performanceData.renderTimeHistory.shift()
    }
    if (this.performanceData.frameTimeHistory.length > 100) {
      this.performanceData.frameTimeHistory.shift()
    }
  }

  /**
   * 处理窗口大小变化
   */
  private onWindowResize(): void {
    const { width, height } = this.container.getBoundingClientRect()

    // 更新相机
    this.cameraManager.updateAspectRatio(width / height)

    // 优化：根据窗口大小动态调整像素比
    const isLargeWindow = width > 1920 || height > 1080
    const basePixelRatio = window.devicePixelRatio
    let optimalPixelRatio = basePixelRatio

    if (isLargeWindow) {
      // 大屏幕使用较低的像素比，提高性能
      optimalPixelRatio = Math.min(basePixelRatio, 1.5)
    } else {
      // 小屏幕可以使用较高的像素比，提高质量
      optimalPixelRatio = Math.min(basePixelRatio, 2)
    }

    this.renderer.setPixelRatio(optimalPixelRatio)
    this.renderer.setSize(width, height)

    // 更新后期处理效果
    if (this.composer) {
      this.composer.setSize(width, height)

      // 更新FXAA分辨率
      if (this.fxaaPass) {
        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height
      }

      // 更新边缘轮廓通道
      if (this.outlinePass) {
        this.outlinePass.setSize(width, height)
      }
    }

    // 更新高级后处理系统
    if (this.postProcessingSystem) {
      this.postProcessingSystem.resize(width, height)
    }

    // 优化：更新阴影贴图大小
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.needsUpdate = true
    }
  }

  /**
   * 设置渲染质量
   * @param qualityLevel 质量级别 (1-5)
   */
  public setRenderQuality(qualityLevel: number): void {
    level = Math.max(1, Math.min(5, qualityLevel))

    // 根据质量级别调整参数
    switch (level) {
      case 1: // 最低质量
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.5))
        this.disableAllPostProcessing()
        this.disableAllAdvancedFeatures()
        break
      case 2: // 低质量
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.7))
        this.enableBasicPostProcessing()
        this.disableAdvancedRendering()
        break
      case 3: // 中等质量
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.85))
        this.enableStandardPostProcessing()
        this.enableSomeAdvancedFeatures()
        break
      case 4: // 高质量
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0))
        this.enableAllPostProcessing()
        this.enableMostAdvancedFeatures()
        break
      case 5: // 最高质量
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.enableAllPostProcessing()
        this.enableAllAdvancedFeatures()
        break
    }
  }

  /**
   * 应用性能模式 - 在低性能设备上减少渲染质量
   */
  public applyPerformanceMode(enabled: boolean): void {
    if (enabled) {
      // 降低质量以提高性能
      this.setRenderQuality(2)
    } else {
      // 恢复正常质量
      this.setRenderQuality(4)
    }
  }

  /**
   * 禁用所有后期处理效果
   */
  private disableAllPostProcessing(): void {
    if (this.bloomPass) this.bloomPass.enabled = false
    if (this.outlinePass) this.outlinePass.enabled = false
    if (this.bokehPass) this.bokehPass.enabled = false
    if (this.afterimagePass) this.afterimagePass.enabled = false
    if (this.filmPass) this.filmPass.enabled = false
    if (this.glitchPass) this.glitchPass.enabled = false
  }

  /**
   * 启用基础后期处理效果
   */
  private enableBasicPostProcessing(): void {
    if (this.bloomPass) this.bloomPass.enabled = false
    if (this.outlinePass) this.outlinePass.enabled = false
    if (this.bokehPass) this.bokehPass.enabled = false
    if (this.afterimagePass) this.afterimagePass.enabled = false
  }

  /**
   * 启用标准后期处理效果
   */
  private enableStandardPostProcessing(): void {
    if (this.bloomPass) this.bloomPass.enabled = true
    if (this.outlinePass) this.outlinePass.enabled = false
    if (this.bokehPass) this.bokehPass.enabled = false
    if (this.afterimagePass) this.afterimagePass.enabled = false
  }

  /**
   * 启用所有后期处理效果
   */
  private enableAllPostProcessing(): void {
    if (this.bloomPass) this.bloomPass.enabled = true
    if (this.outlinePass) this.outlinePass.enabled = this.outlinePass.enabled
    if (this.bokehPass) this.bokehPass.enabled = this.bokehPass.enabled
    if (this.afterimagePass) this.afterimagePass.enabled = this.afterimagePass.enabled
    if (this.filmPass) this.filmPass.enabled = this.filmPass.enabled
    if (this.glitchPass) this.glitchPass.enabled = this.glitchPass.enabled
  }

  /**
   * 禁用高级渲染特性
   */
  private disableAdvancedRendering(): void {
    this.rayTracingEnabled = false
    this.globalIlluminationEnabled = false
  }

  /**
   * 启用部分高级特性
   */
  private enableSomeAdvancedFeatures(): void {
    this.rayTracingEnabled = false
    this.globalIlluminationEnabled = false
  }

  /**
   * 启用大多数高级特性
   */
  private enableMostAdvancedFeatures(): void {
    this.rayTracingEnabled = false
    this.globalIlluminationEnabled = false
  }

  /**
   * 启用所有高级特性
   */
  private enableAllAdvancedFeatures(): void {
    this.rayTracingEnabled = true
    this.globalIlluminationEnabled = true
  }

  /**
   * 添加对象到场景
   */
  public addObject(object: THREE.Object3D): void {
    this.sceneManager.addObject(object)

    // 将对象添加到 LOD 系统
    if (this.lodSystem) {
      this.lodSystem.addObject(object)
    }

    // 更新 BVH 系统
    if (this.bvhSystem) {
      this.bvhSystem.buildFromScene(this.sceneManager.getScene())
    }

    // 添加对象到资源管理器
    this.addObjectToResourceManager(object)
  }

  /**
   * 将对象添加到资源管理器
   */
  private addObjectToResourceManager(object: THREE.Object3D): void {
    const objectId = object.uuid || Math.random().toString(36).substr(2, 9)

    if (object instanceof THREE.Mesh) {
      // 添加几何体资源
      if (object.geometry) {
        const geometryId = `geometry_${objectId}`
        resourceManager.addResource(
          geometryId,
          ResourceType.GEOMETRY,
          `Geometry for ${object.name || 'mesh'}`,
          object.geometry,
          this.calculateGeometrySize(object.geometry),
          {
            priority: ResourcePriority.MEDIUM
          }
        )
        this.resourceIds.add(geometryId)
      }

      // 添加材质资源
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material, index) => {
          const materialId = `material_${objectId}_${index}`
          resourceManager.addResource(
            materialId,
            ResourceType.MATERIAL,
            `Material for ${object.name || 'mesh'}`,
            material,
            1024, // 估算材质大小
            {
              priority: ResourcePriority.MEDIUM
            }
          )
          this.resourceIds.add(materialId)
        })
      }

      // 添加网格资源
      const meshId = `mesh_${objectId}`
      resourceManager.addResource(
        meshId,
        ResourceType.MESH,
        object.name || 'mesh',
        object,
        this.calculateMeshSize(object),
        {
          priority: ResourcePriority.HIGH
        }
      )
      this.resourceIds.add(meshId)
    } else if (object instanceof THREE.Light) {
      // 添加光源资源
      const lightId = `light_${objectId}`
      resourceManager.addResource(
        lightId,
        ResourceType.OTHER,
        object.name || 'light',
        object,
        512, // 估算光源大小
        {
          priority: ResourcePriority.HIGH
        }
      )
      this.resourceIds.add(lightId)
    }
  }

  /**
   * 计算几何体大小
   */
  private calculateGeometrySize(geometry: THREE.BufferGeometry): number {
    let size = 0
    if (geometry.attributes) {
      for (const attribute in geometry.attributes) {
        const attr = geometry.attributes[attribute]
        if (attr.array) {
          size += attr.array.byteLength
        }
      }
    }
    return size
  }

  /**
   * 计算网格大小
   */
  private calculateMeshSize(mesh: THREE.Mesh): number {
    let size = 0
    if (mesh.geometry) {
      size += this.calculateGeometrySize(mesh.geometry)
    }
    if (mesh.material) {
      size += 1024 // 估算材质大小
    }
    return size
  }

  /**
   * 从场景移除对象
   */
  public removeObject(object: THREE.Object3D): void {
    this.sceneManager.removeObject(object)

    // 更新 BVH 系统
    if (this.bvhSystem) {
      this.bvhSystem.buildFromScene(this.sceneManager.getScene())
    }

    // 从资源管理器移除对象
    this.removeObjectFromResourceManager(object)
  }

  /**
   * 从资源管理器移除对象
   */
  private removeObjectFromResourceManager(object: THREE.Object3D): void {
    const objectId = object.uuid || Math.random().toString(36).substr(2, 9)

    // 移除相关资源
    const resourcePatterns = [
      `geometry_${objectId}`,
      `material_${objectId}`,
      `mesh_${objectId}`,
      `light_${objectId}`
    ]

    for (const pattern of resourcePatterns) {
      for (const resourceId of this.resourceIds) {
        if (resourceId.includes(pattern)) {
          resourceManager.unloadResource(resourceId)
          this.resourceIds.delete(resourceId)
        }
      }
    }
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
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * 获取控制器实例
   */
  public getControls(): OrbitControls | null {
    return this.controls
  }

  /**
   * 使用 BVH 系统进行光线追踪
   */
  public rayTrace(origin: THREE.Vector3, direction: THREE.Vector3): any {
    if (!this.bvhSystem) {
      return { hit: false, distance: Infinity }
    }

    const ray = createRay(origin, direction)
    return this.bvhSystem.traceRay(ray)
  }

  /**
   * 检查点是否在任何对象内
   */
  public pointInObject(point: THREE.Vector3): THREE.Object3D | null {
    if (!this.bvhSystem) {
      return null
    }
    return this.bvhSystem.pointInObject(point)
  }

  /**
   * 获取边界盒内的对象
   */
  public getObjectsInBox(min: THREE.Vector3, max: THREE.Vector3): THREE.Object3D[] {
    if (!this.bvhSystem) {
      return []
    }
    return this.bvhSystem.getObjectsInBox({ min, max })
  }

  /**
   * 配置后处理效果
   */
  public configurePostProcessing(config: any): void {
    if (this.postProcessingSystem) {
      this.postProcessingSystem.updateConfig(config)
    }
  }

  /**
   * 启用/禁用后处理效果
   */
  public setPostProcessingEffect(effect: string, enabled: boolean): void {
    if (!this.postProcessingSystem) return

    const config: any = {}
    switch (effect) {
      case 'taa':
        config.enableTAA = enabled
        break
      case 'bloom':
        config.enableBloom = enabled
        break
      case 'dof':
        config.enableDOF = enabled
        break
      case 'outline':
        config.enableOutline = enabled
        break
      case 'afterimage':
        config.enableAfterimage = enabled
        break
      case 'film':
        config.enableFilm = enabled
        break
    }

    this.postProcessingSystem.updateConfig(config)
  }

  /**
   * 设置轮廓对象
   */
  public setOutlineObjects(objects: THREE.Object3D[]): void {
    if (this.postProcessingSystem) {
      this.postProcessingSystem.setOutlineObjects(objects)
    }
  }

  /**
   * 重置渲染引擎
   */
  public reset(): void {
    this.stop()
    this.sceneManager.reset()
    this.cameraManager.reset()
    this.setupScene()

    // 重建 BVH 系统
    if (this.bvhSystem) {
      this.bvhSystem.buildFromScene(this.sceneManager.getScene())
    }

    this.start()
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

    // 清理 resize 事件监听器
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
  }

  /**
   * 启动渲染引擎
   */
  public start(): void {
    this.startRenderLoop()
  }

  /**
   * 销毁渲染引擎
   */
  public dispose(): void {
    this.stop()
    this.clearScene()

    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }

    // 释放后期处理资源
    if (this.composer) {
      this.composer.dispose()
      this.composer = null
    }

    // 清理性能监控数据
    this.performanceData = {
      frameCount: 0,
      startTime: performance.now(),
      lastMetricsUpdate: 0,
      renderTimeHistory: [],
      frameTimeHistory: []
    }

    // 释放渲染器资源
    this.renderer.dispose()

    // 移除渲染器DOM元素
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }

    // 清理 LOD 系统
    if (this.lodSystem) {
      this.lodSystem.dispose()
      this.lodSystem = null
    }

    // 清理 BVH 系统
    if (this.bvhSystem) {
      this.bvhSystem.clear()
      this.bvhSystem = null
    }

    // 清理后处理系统
    if (this.postProcessingSystem) {
      this.postProcessingSystem.dispose()
      this.postProcessingSystem = null
    }

    // 清理资源管理器中的资源
    this.cleanupResources()

    // 触发销毁事件
    eventSystem.emit(APP_EVENTS.RENDER_ENGINE_DISPOSED, {
      container: this.container
    })
  }

  /**
   * 清理资源
   */
  private cleanupResources(): void {
    for (const resourceId of this.resourceIds) {
      resourceManager.unloadResource(resourceId)
    }
    this.resourceIds.clear()
  }

  /**
   * 优化资源
   */
  public optimizeResources(): void {
    resourceManager.optimizeResources()
  }

  /**
   * 获取资源统计信息
   */
  public getResourceStats(): any {
    return resourceManager.getStats()
  }

  /**
   * 获取内存使用情况
   */
  public getMemoryUsage(): number {
    return resourceManager.getMemoryUsage()
  }

  /**
   * 预加载资源
   */
  public async preloadResources(
    resources: Array<{
      id: string
      type: ResourceType
      name: string
      url: string
      options: any
    }>
  ): Promise<void> {
    await resourceManager.preloadResources(resources)
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

  /**
   * 静态方法：创建渲染引擎实例
   * 根据设备支持情况自动选择 WebGPU 或 WebGL
   */
  public static create(config: RenderEngineConfig): any {
    if (isWebGPUSupported()) {
      try {
        console.log('Using WebGPU renderer')
        return new WebGPURenderEngine(config)
      } catch (error) {
        console.warn('WebGPU initialization failed, falling back to WebGL:', error)
        return new RenderEngine(config)
      }
    } else {
      console.log('Using WebGL renderer')
      return new RenderEngine(config)
    }
  }
}
