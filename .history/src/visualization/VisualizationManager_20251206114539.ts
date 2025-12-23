/**
 * 🎨 统一可视化管理器
 * 协调所有可视化相关的组件和系统，提供统一的可视化接口
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GPUParticleSystemManager } from './GPUParticleSystem';
import { FieldVisualizerManager } from './FieldVisualizer';
import { VisualizationComponent } from './VisualizationComponent';
import { ResourceManager } from '../utils/ResourceManager';
import { PhysicsEngine } from '../core/PhysicsEngine';
import { unifiedPerformanceManager, UnifiedPerformanceConfig } from '../performance/UnifiedPerformanceManager';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';
import { VISUALIZATION_CONFIG } from '../constants';

// 可视化模块依赖注入类型
export interface VisualizationDependencies {
  // 粒子系统管理器 - 可选，将在初始化时创建
  particleSystemManager?: GPUParticleSystemManager;
  
  // 场可视化管理器 - 可选，将在初始化时创建
  fieldVisualizerManager?: FieldVisualizerManager;
  
  // 资源管理器 - 可选，将在初始化时创建
  resourceManager?: ResourceManager;
  
  // 物理引擎 - 可选，用于场可视化
  physicsEngine?: PhysicsEngine;
}

// 可视化配置类型
export interface VisualizationConfig {
  // 场景配置
  scene?: {
    backgroundColor?: number;
    fog?: {
      type: 'linear' | 'exponential';
      near?: number;
      far?: number;
      color?: number;
      density?: number;
    };
    enableGrid?: boolean;
    enableAxes?: boolean;
  };
  
  // 相机配置
  camera?: {
    fov?: number;
    near?: number;
    far?: number;
    position?: THREE.Vector3;
    lookAt?: THREE.Vector3;
  };
  
  // 渲染器配置
  renderer?: {
    antialias?: boolean;
    alpha?: boolean;
    physicallyCorrectLights?: boolean;
    shadowMapEnabled?: boolean;
    outputEncoding?: THREE.TextureEncoding;
  };
  
  // 控制器配置
  controls?: {
    enableDamping?: boolean;
    dampingFactor?: number;
    rotateSpeed?: number;
    zoomSpeed?: number;
    enablePan?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
  };
  
  // 后处理配置
  postProcessing?: {
    enabled?: boolean;
    quality?: 'low' | 'medium' | 'high' | 'auto';
    bloom?: {
      enabled?: boolean;
      intensity?: number;
      radius?: number;
      threshold?: number;
    };
    film?: {
      enabled?: boolean;
      noiseIntensity?: number;
      scanlineIntensity?: number;
      scanlineCount?: number;
    };
    smaa?: boolean;
    gammaCorrection?: boolean;
  };
  
  // 粒子系统配置
  particleSystem?: {
    enabled?: boolean;
    maxParticles?: number;
    emissionRate?: number;
  };
  
  // 性能配置
  performance?: UnifiedPerformanceConfig;
  
  // 依赖配置 - 用于依赖注入
  dependencies?: VisualizationDependencies;
}

// 可视化管理器事件类型
export enum VisualizationEvent {
  INITIALIZED = 'visualization:initialized',
  SCENE_CREATED = 'visualization:scene:created',
  RENDERER_CREATED = 'visualization:renderer:created',
  CAMERA_CREATED = 'visualization:camera:created',
  CONTROLS_CREATED = 'visualization:controls:created',
  POST_PROCESSING_INITIALIZED = 'visualization:post-processing:initialized',
  PARTICLE_SYSTEM_INITIALIZED = 'visualization:particle-system:initialized',
  FIELD_VISUALIZATION_INITIALIZED = 'visualization:field-visualization:initialized',
  SCENE_UPDATED = 'visualization:scene:updated',
  RENDERER_UPDATED = 'visualization:renderer:updated',
  CAMERA_UPDATED = 'visualization:camera:updated',
  CONTROLS_UPDATED = 'visualization:controls:updated',
  PERFORMANCE_MODE_CHANGED = 'visualization:performance:mode:changed',
  COMPONENT_ADDED = 'visualization:component:added',
  COMPONENT_REMOVED = 'visualization:component:removed',
  DISPOSED = 'visualization:disposed',
  TEXTURE_QUALITY_UPDATED = 'visualization:texture-quality:updated'
}

/**
 * 统一可视化管理器类
 * 协调所有可视化相关的组件和系统
 */
export class VisualizationManager {
  private static instance: VisualizationManager;
  
  // 核心组件
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private composer: EffectComposer | null = null;
  private particleSystemManager: GPUParticleSystemManager | null = null;
  private fieldVisualizerManager: FieldVisualizerManager | null = null;
  private resourceManager: ResourceManager | null = null;
  private physicsEngine: PhysicsEngine | null = null;
  
  // 可视化组件管理
  private components: Map<string, VisualizationComponent> = new Map();
  
  // 配置和状态
  private config: VisualizationConfig;
  private isInitialized: boolean = false;
  private isRendering: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  
  // 性能监控
  private fps: number = 60;
  private frameTime: number = 0;
  private lastMetricsUpdateTime: number = 0;
  
  // 单例模式构造函数
  private constructor(config: Partial<VisualizationConfig> = {}) {
    // 提取依赖项
    const dependencies = config.dependencies || {};
    
    // 合并默认配置
    this.config = {
      scene: {
        backgroundColor: VISUALIZATION_CONFIG.backgroundColor || 0x000000,
        fog: VISUALIZATION_CONFIG.fog,
        enableGrid: false,
        enableAxes: false,
        ...config.scene
      },
      camera: {
        fov: VISUALIZATION_CONFIG.camera.fov || 75,
        near: VISUALIZATION_CONFIG.camera.near || 0.1,
        far: VISUALIZATION_CONFIG.camera.far || 1000,
        position: VISUALIZATION_CONFIG.camera.position || new THREE.Vector3(0, 0, 5),
        lookAt: VISUALIZATION_CONFIG.camera.lookAt || new THREE.Vector3(0, 0, 0),
        ...config.camera
      },
      renderer: {
        antialias: VISUALIZATION_CONFIG.renderer.antialias || true,
        alpha: VISUALIZATION_CONFIG.renderer.alpha || true,
        physicallyCorrectLights: VISUALIZATION_CONFIG.renderer.physicallyCorrectLights || true,
        shadowMapEnabled: VISUALIZATION_CONFIG.renderer.shadowMapEnabled || false,
        outputEncoding: THREE.sRGBEncoding,
        ...config.renderer
      },
      controls: {
        enableDamping: VISUALIZATION_CONFIG.controls.enableDamping || true,
        dampingFactor: VISUALIZATION_CONFIG.controls.dampingFactor || 0.05,
        rotateSpeed: VISUALIZATION_CONFIG.controls.rotateSpeed || 0.5,
        zoomSpeed: VISUALIZATION_CONFIG.controls.zoomSpeed || 0.8,
        enablePan: VISUALIZATION_CONFIG.controls.enablePan || true,
        autoRotate: VISUALIZATION_CONFIG.controls.autoRotate || false,
        autoRotateSpeed: VISUALIZATION_CONFIG.controls.autoRotateSpeed || 2.0,
        ...config.controls
      },
      postProcessing: {
        enabled: true,
        quality: 'auto',
        bloom: {
          enabled: true,
          intensity: 1.5,
          radius: 0.5,
          threshold: 0.1
        },
        film: {
          enabled: true,
          noiseIntensity: 0.3,
          scanlineIntensity: 0.025,
          scanlineCount: 256
        },
        smaa: true,
        gammaCorrection: true,
        ...config.postProcessing
      },
      particleSystem: {
        enabled: true,
        maxParticles: VISUALIZATION_CONFIG.particleSystem.maxParticles || 100000,
        emissionRate: VISUALIZATION_CONFIG.particleSystem.emissionRate || 500,
        ...config.particleSystem
      },
      performance: {
        ...config.performance
      },
      dependencies: dependencies
    };
    
    // 初始化依赖项
    this.particleSystemManager = dependencies.particleSystemManager;
    this.fieldVisualizerManager = dependencies.fieldVisualizerManager;
    this.resourceManager = dependencies.resourceManager;
    this.physicsEngine = dependencies.physicsEngine;
    
    // 初始化事件监听
    this.initializeEventListeners();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<VisualizationConfig>): VisualizationManager {
    if (!VisualizationManager.instance) {
      VisualizationManager.instance = new VisualizationManager(config);
    }
    return VisualizationManager.instance;
  }
  
  /**
   * 初始化事件监听
   */
  private initializeEventListeners(): void {
    // 监听性能模式变化
    eventSystem.on(APP_EVENTS.PERFORMANCE_MODE_CHANGE, (data) => {
      this.handlePerformanceModeChange(data.isPerformanceMode);
    });
    
    // 监听粒子密度变化
    eventSystem.on(APP_EVENTS.PARTICLE_DENSITY_CHANGE, (data) => {
      this.handleParticleDensityChange(data.density);
    });
    
    // 监听最大粒子数量变化
    eventSystem.on(APP_EVENTS.MAX_PARTICLES_CHANGE, (data) => {
      this.handleMaxParticlesChange(data.maxParticles);
    });
    
    // 监听渲染缩放变化
    eventSystem.on(APP_EVENTS.RENDER_SCALE_CHANGE, (data) => {
      this.handleRenderScaleChange(data.scale);
    });
    
    // 监听阴影质量变化
    eventSystem.on(APP_EVENTS.SHADOW_QUALITY_CHANGE, (data) => {
      this.handleShadowQualityChange(data.quality);
    });
    
    // 监听后处理启用状态变化
    eventSystem.on(APP_EVENTS.POST_PROCESSING_ENABLED_CHANGE, (data) => {
      this.handlePostProcessingEnabledChange(data.enabled);
    });
    
    // 监听纹理质量变化
    eventSystem.on(APP_EVENTS.TEXTURE_QUALITY_CHANGE, (data) => {
      this.handleTextureQualityChange(data.quality);
    });
  }
  
  /**
   * 初始化可视化系统
   */
  public initialize(container: HTMLElement): void {
    if (this.isInitialized) {
      console.warn('VisualizationManager is already initialized');
      return;
    }
    
    try {
      // 初始化性能管理器
      if (this.config.performance) {
        unifiedPerformanceManager.updateConfig(this.config.performance);
      }
      
      // 1. 创建场景
      this.createScene();
      
      // 2. 创建相机
      this.createCamera(container);
      
      // 3. 创建渲染器
      this.createRenderer(container);
      
      // 4. 创建控制器
      this.createControls();
      
      // 5. 初始化后处理效果
      this.initializePostProcessing();
      
      // 6. 初始化粒子系统
      this.initializeParticleSystem();
      
      // 7. 初始化场可视化系统
      this.initializeFieldVisualization();
      
      // 8. 初始化资源管理器
      this.initializeResourceManager();
      
      // 9. 初始化性能优化系统
      if (this.scene && this.camera && this.renderer) {
        unifiedPerformanceManager.initialize(this.scene, this.camera, this.renderer);
      }
      
      // 10. 添加默认场景元素
      this.addDefaultSceneElements();
      
      this.isInitialized = true;
      
      // 发布初始化完成事件
      eventSystem.emit(VisualizationEvent.INITIALIZED, {
        scene: this.scene,
        camera: this.camera,
        renderer: this.renderer,
        controls: this.controls
      });
      
      console.log('🎨 VisualizationManager initialized successfully');
    } catch (error) {
      console.error('❌ VisualizationManager initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * 创建场景
   */
  private createScene(): void {
    this.scene = new THREE.Scene();
    
    // 应用场景配置
    if (this.config.scene?.backgroundColor) {
      this.scene.background = new THREE.Color(this.config.scene.backgroundColor);
    }
    
    // 应用雾配置
    if (this.config.scene?.fog) {
      const fogConfig = this.config.scene.fog;
      if (fogConfig.type === 'linear') {
        this.scene.fog = new THREE.Fog(
          fogConfig.color || 0x000000,
          fogConfig.near || 1,
          fogConfig.far || 100
        );
      } else {
        this.scene.fog = new THREE.FogExp2(
          fogConfig.color || 0x000000,
          fogConfig.density || 0.01
        );
      }
    }
    
    // 发布场景创建事件
    eventSystem.emit(VisualizationEvent.SCENE_CREATED, { scene: this.scene });
  }
  
  /**
   * 创建相机
   */
  private createCamera(container: HTMLElement): void {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera = new THREE.PerspectiveCamera(
      this.config.camera?.fov || 75,
      width / height,
      this.config.camera?.near || 0.1,
      this.config.camera?.far || 1000
    );
    
    // 设置相机位置
    if (this.config.camera?.position) {
      this.camera.position.copy(this.config.camera.position);
    }
    
    // 设置相机朝向
    if (this.config.camera?.lookAt) {
      this.camera.lookAt(this.config.camera.lookAt);
    }
    
    // 发布相机创建事件
    eventSystem.emit(VisualizationEvent.CAMERA_CREATED, { camera: this.camera });
  }
  
  /**
   * 创建渲染器
   */
  private createRenderer(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.renderer?.antialias || true,
      alpha: this.config.renderer?.alpha || true,
      physicallyCorrectLights: this.config.renderer?.physicallyCorrectLights || true,
      // 性能优化参数
      powerPreference: 'high-performance', // 优先使用高性能GPU
      premultipliedAlpha: false, // 减少透明度处理开销
      stencil: false, // 禁用不需要的模板缓冲区
      preserveDrawingBuffer: true // 保留绘制缓冲区用于截图等功能
    });
    
    // 设置渲染器大小
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    
    // 设置像素比率
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 设置输出编码
    if (this.config.renderer?.outputEncoding) {
      this.renderer.outputEncoding = this.config.renderer.outputEncoding;
    } else {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    // 启用阴影映射并优化
    if (this.config.renderer?.shadowMapEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = false; // 手动控制阴影更新，减少开销
      this.renderer.shadowMap.needsUpdate = true;
    }
    
    // 渲染质量和性能平衡设置
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // 性能优化设置
    this.renderer.localClippingEnabled = true; // 局部裁剪支持
    this.renderer.autoClear = false; // 手动控制清除
    this.renderer.info.autoReset = true; // 自动重置性能统计
    this.renderer.capabilities.logarithmicDepthBuffer = true; // 对数深度缓冲区，改善远距离渲染
    
    // 启用多采样抗锯齿（如果支持）
    if (!this.renderer.extensions.get('EXT_multisampled_renderbuffers')) {
      this.renderer.antialias = false;
    }
    
    // 添加到DOM
    container.appendChild(this.renderer.domElement);
    
    // 发布渲染器创建事件
    eventSystem.emit(VisualizationEvent.RENDERER_CREATED, { renderer: this.renderer });
  }
  
  /**
   * 创建控制器
   */
  private createControls(): void {
    if (!this.camera || !this.renderer) return;
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // 应用控制器配置
    this.controls.enableDamping = this.config.controls?.enableDamping || true;
    this.controls.dampingFactor = this.config.controls?.dampingFactor || 0.05;
    this.controls.rotateSpeed = this.config.controls?.rotateSpeed || 0.5;
    this.controls.zoomSpeed = this.config.controls?.zoomSpeed || 0.8;
    this.controls.enablePan = this.config.controls?.enablePan || true;
    this.controls.autoRotate = this.config.controls?.autoRotate || false;
    this.controls.autoRotateSpeed = this.config.controls?.autoRotateSpeed || 2.0;
    
    // 发布控制器创建事件
    eventSystem.emit(VisualizationEvent.CONTROLS_CREATED, { controls: this.controls });
  }
  
  /**
   * 初始化后处理效果
   */
  private initializePostProcessing(): void {
    if (!this.renderer || !this.camera || !this.scene || !this.config.postProcessing?.enabled) {
      return;
    }

    // 创建效果合成器
    this.composer = new EffectComposer(this.renderer);
    
    // 创建渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // 添加FXAA抗锯齿通道
    if (this.config.postProcessing.smaa) {
      const fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = this.renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.clientWidth * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.clientHeight * pixelRatio);
      this.composer.addPass(fxaaPass);
    }
    
    // 添加Unreal Bloom通道
    if (this.config.postProcessing.bloom?.enabled) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight),
        this.config.postProcessing.bloom.intensity || 0.5,
        this.config.postProcessing.bloom.radius || 0.85,
        this.config.postProcessing.bloom.threshold || 0.1
      );
      this.composer.addPass(bloomPass);
    }
    
    // 添加电影颗粒效果通道
    if (this.config.postProcessing.film?.enabled) {
      const filmPass = new FilmPass(
        this.config.postProcessing.film.noiseIntensity || 0.1,
        this.config.postProcessing.film.scanlineIntensity || 0.1,
        this.config.postProcessing.film.scanlineCount || 800,
        false
      );
      this.composer.addPass(filmPass);
    }
    
    // 添加伽马校正通道
    if (this.config.postProcessing.gammaCorrection) {
      const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      gammaCorrectionPass.renderToScreen = true;
      this.composer.addPass(gammaCorrectionPass);
    }
    
    // 发布后处理初始化事件
    eventSystem.emit(VisualizationEvent.POST_PROCESSING_INITIALIZED, { composer: this.composer });
  }
  
  /**
   * 初始化粒子系统
   */
  private initializeParticleSystem(): void {
    if (!this.scene || !this.config.particleSystem?.enabled) return;
    
    // 如果没有注入粒子系统管理器，创建新实例
    if (!this.particleSystemManager) {
      this.particleSystemManager = new GPUParticleSystemManager(this.scene);
    }
    
    // 发布粒子系统初始化事件
    eventSystem.emit(VisualizationEvent.PARTICLE_SYSTEM_INITIALIZED, {
      particleSystemManager: this.particleSystemManager
    });
  }
  
  /**
   * 初始化场可视化系统
   */
  private initializeFieldVisualization(): void {
    if (!this.scene) return;
    
    // 如果没有注入场可视化管理器，创建新实例
    if (!this.fieldVisualizerManager) {
      // 如果没有注入物理引擎，创建一个默认实例
      if (!this.physicsEngine) {
        this.physicsEngine = new PhysicsEngine();
      }
      this.fieldVisualizerManager = new FieldVisualizerManager(this.scene, this.physicsEngine);
    }
    
    // 发布场可视化初始化事件
    eventSystem.emit(VisualizationEvent.FIELD_VISUALIZATION_INITIALIZED, {
      fieldVisualizerManager: this.fieldVisualizerManager
    });
  }
  
  /**
   * 初始化资源管理器
   */
  private initializeResourceManager(): void {
    // 如果没有注入资源管理器，创建新实例
    if (!this.resourceManager) {
      this.resourceManager = new ResourceManager();
    }
  }
  
  /**
   * 添加可视化组件
   */
  public addComponent(component: VisualizationComponent): void {
    this.components.set(component.getId(), component);
    component.initialize();
    
    // 发布组件添加事件
    eventSystem.emit(VisualizationEvent.COMPONENT_ADDED, {
      component,
      id: component.getId(),
      type: component.getType()
    });
  }
  
  /**
   * 获取可视化组件
   */
  public getComponent(id: string): VisualizationComponent | undefined {
    return this.components.get(id);
  }
  
  /**
   * 移除可视化组件
   */
  public removeComponent(id: string): void {
    const component = this.components.get(id);
    if (component) {
      component.dispose();
      this.components.delete(id);
      
      // 发布组件移除事件
      eventSystem.emit(VisualizationEvent.COMPONENT_REMOVED, {
        id,
        type: component.getType()
      });
    }
  }
  
  /**
   * 获取所有可视化组件
   */
  public getAllComponents(): VisualizationComponent[] {
    return Array.from(this.components.values());
  }
  
  /**
   * 获取指定类型的可视化组件
   */
  public getComponentsByType(type: string): VisualizationComponent[] {
    return Array.from(this.components.values()).filter(
      component => component.getType() === type
    );
  }
  
  /**
   * 添加默认场景元素
   */
  private addDefaultSceneElements(): void {
    if (!this.scene) return;
    
    // 添加网格辅助线
    if (this.config.scene?.enableGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
      this.scene.add(gridHelper);
    }
    
    // 添加坐标轴辅助线
    if (this.config.scene?.enableAxes) {
      const axesHelper = new THREE.AxesHelper(10);
      this.scene.add(axesHelper);
    }
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }
  
  /**
   * 开始渲染循环
   */
  public startRendering(): void {
    if (this.isRendering) {
      console.warn('VisualizationManager is already rendering');
      return;
    }
    
    this.isRendering = true;
    this.lastFrameTime = performance.now();
    this.render();
  }
  
  /**
   * 停止渲染循环
   */
  public stopRendering(): void {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  // 渲染优化配置
  private renderConfig = {
    targetFPS: 60,
    frameTimeThreshold: 16.67, // 60fps
    maxDeltaTime: 0.1, // 限制最大deltaTime为100ms，避免大跳跃
    enableAdaptiveQuality: true,
    qualityLevels: [
      { minFPS: 50, shadowQuality: 1.0, renderScale: 1.0, bloomQuality: 'high', filmEnabled: true },
      { minFPS: 40, shadowQuality: 0.75, renderScale: 0.9, bloomQuality: 'medium', filmEnabled: false },
      { minFPS: 30, shadowQuality: 0.5, renderScale: 0.8, bloomQuality: 'low', filmEnabled: false },
      { minFPS: 20, shadowQuality: 0.25, renderScale: 0.7, bloomQuality: 'off', filmEnabled: false },
      { minFPS: 0, shadowQuality: 0, renderScale: 0.5, bloomQuality: 'off', filmEnabled: false }
    ],
    qualityUpdateInterval: 500, // 每500ms更新一次质量设置
    lastQualityUpdate: 0
  };

  /**
   * 渲染循环
   */
  private render = (): void => {
    if (!this.isRendering || !this.scene || !this.camera || !this.renderer) return;
    
    // 计算时间差并限制最大deltaTime
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, this.renderConfig.maxDeltaTime);
    this.frameTime = currentTime - this.lastFrameTime;
    this.fps = Math.min(1000 / Math.max(this.frameTime, 1), 120); // 限制最大显示FPS为120
    
    // 更新控制器（如果启用了阻尼）
    if (this.controls && this.controls.enableDamping) {
      this.controls.update();
    }
    
    // 只在需要时更新粒子系统（根据性能设置）
    if (this.particleSystemManager) {
      this.particleSystemManager.update(deltaTime);
    }
    
    // 只在场可视化启用时更新
    if (this.fieldVisualizerManager) {
      this.fieldVisualizerManager.update(deltaTime);
    }
    
    // 更新所有可视化组件
    this.components.forEach(component => {
      component.update(deltaTime);
    });
    
    // 应用性能优化
    unifiedPerformanceManager.applyOptimizations(deltaTime);
    
    // 只在采样间隔更新性能指标，减少计算开销
    const shouldUpdateMetrics = (currentTime - this.lastMetricsUpdateTime) > 100; // 每100ms更新一次
    if (shouldUpdateMetrics) {
      unifiedPerformanceManager.updateMetrics({
        fps: this.fps,
        frameTime: this.frameTime,
        drawCalls: this.renderer.info.render.calls,
        triangleCount: this.renderer.info.render.triangles,
        vertexCount: this.renderer.info.render.vertices,
        activeObjects: this.scene.children.length,
        particleCount: this.particleSystemManager?.getStats().particleCount || 0,
        sceneComplexity: this.scene.children.length,
        deviceScore: 0.5, // 初始值，将由设备性能分析器更新
        thermalState: 'cool', // 初始值，将由设备性能分析器更新
        renderScale: 1.0,
        particleDensity: 1.0,
        shadowQuality: 1.0
      });
      this.lastMetricsUpdateTime = currentTime;
    }
    
    // 自适应质量调整（减少频繁调用）
    if (this.renderConfig.enableAdaptiveQuality && 
        currentTime - this.renderConfig.lastQualityUpdate > this.renderConfig.qualityUpdateInterval) {
      this.applyAdaptiveQuality();
      this.renderConfig.lastQualityUpdate = currentTime;
    }
    
    // 渲染场景
    if (this.composer && this.config.postProcessing?.enabled) {
      this.composer.render(deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    
    // 更新时间
    this.lastFrameTime = currentTime;
    
    // 继续渲染循环
    this.animationFrameId = requestAnimationFrame(this.render);
  };

  /**
   * 应用自适应质量设置
   * 根据当前性能动态调整渲染质量
   */
  private applyAdaptiveQuality(): void {
    if (!this.renderer) return;

    // 找到当前FPS对应的质量级别
    let qualityLevel = this.renderConfig.qualityLevels[this.renderConfig.qualityLevels.length - 1];
    for (const level of this.renderConfig.qualityLevels) {
      if (this.fps >= level.minFPS) {
        qualityLevel = level;
        break;
      }
    }

    // 应用阴影质量
    if (this.renderer.shadowMap.enabled) {
      if (qualityLevel.shadowQuality === 0) {
        this.renderer.shadowMap.enabled = false;
      } else if (!this.renderer.shadowMap.enabled) {
        this.renderer.shadowMap.enabled = true;
      }
      // 根据shadowQuality调整阴影贴图大小等参数
    }

    // 应用渲染缩放
    const currentPixelRatio = this.renderer.getPixelRatio();
    const targetPixelRatio = Math.min(window.devicePixelRatio * qualityLevel.renderScale, 2);
    if (Math.abs(currentPixelRatio - targetPixelRatio) > 0.1) {
      this.renderer.setPixelRatio(targetPixelRatio);
      this.onResize(); // 重新调整大小
    }

    // 应用后处理质量
    if (this.config.postProcessing) {
      // 调整Bloom质量
      switch (qualityLevel.bloomQuality) {
        case 'high':
          this.config.postProcessing.bloom = { enabled: true, intensity: 1.5, radius: 0.5, threshold: 0.1 };
          break;
        case 'medium':
          this.config.postProcessing.bloom = { enabled: true, intensity: 0.7, radius: 0.3, threshold: 0.2 };
          break;
        case 'low':
          this.config.postProcessing.bloom = { enabled: true, intensity: 0.3, radius: 0.2, threshold: 0.3 };
          break;
        case 'off':
          this.config.postProcessing.bloom = { enabled: false, intensity: 0, radius: 0, threshold: 0 };
          break;
      }

      // 调整电影效果
      this.config.postProcessing.film = {
        enabled: qualityLevel.filmEnabled,
        noiseIntensity: 0.1,
        scanlineIntensity: 0.1,
        scanlineCount: 800
      };

      // 只在配置变化时重新初始化后处理
      this.reinitializePostProcessing();
    }
  }
  
  // 移除旧的autoAdjustPostProcessingQuality方法，使用applyAdaptiveQuality替代
  
  /**
   * 重新初始化后处理效果
   * 在配置变化时调用，更新后处理通道
   */
  private reinitializePostProcessing(): void {
    if (!this.renderer || !this.camera || !this.scene || !this.config.postProcessing?.enabled) return;
    
    // 清除现有的后处理通道
    if (this.composer) {
      this.composer.dispose();
    }
    
    // 重新创建效果合成器
    this.composer = new EffectComposer(this.renderer);
    
    // 创建渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // 添加FXAA抗锯齿通道
    if (this.config.postProcessing.smaa) {
      const fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = this.renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.clientWidth * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.clientHeight * pixelRatio);
      this.composer.addPass(fxaaPass);
    }
    
    // 添加Unreal Bloom通道
    if (this.config.postProcessing.bloom?.enabled) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight),
        this.config.postProcessing.bloom.intensity || 0.5,
        this.config.postProcessing.bloom.radius || 0.85,
        this.config.postProcessing.bloom.threshold || 0.1
      );
      this.composer.addPass(bloomPass);
    }
    
    // 添加电影颗粒效果通道
    if (this.config.postProcessing.film?.enabled) {
      const filmPass = new FilmPass(
        this.config.postProcessing.film.noiseIntensity || 0.1,
        this.config.postProcessing.film.scanlineIntensity || 0.1,
        this.config.postProcessing.film.scanlineCount || 800,
        false
      );
      this.composer.addPass(filmPass);
    }
    
    // 添加伽马校正通道
    if (this.config.postProcessing.gammaCorrection) {
      const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      gammaCorrectionPass.renderToScreen = true;
      this.composer.addPass(gammaCorrectionPass);
    }
  }
  
  /**
   * 处理窗口大小变化
   */
  public handleResize(container: HTMLElement): void {
    if (!this.camera || !this.renderer) return;
    
    // 更新相机
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // 更新渲染器
    this.renderer.setSize(width, height);
    
    // 更新后处理合成器
    if (this.composer) {
      this.composer.setSize(width, height);
      
      // 更新FXAA通道的分辨率
      const passes = this.composer.passes;
      for (const pass of passes) {
        if (pass instanceof THREE.ShaderPass && pass.material.uniforms.resolution) {
          const pixelRatio = this.renderer.getPixelRatio();
          pass.material.uniforms.resolution.value.x = 1 / (width * pixelRatio);
          pass.material.uniforms.resolution.value.y = 1 / (height * pixelRatio);
        }
        // 更新Bloom通道的分辨率
        else if (pass instanceof THREE.UnrealBloomPass) {
          pass.resolution.set(width, height);
        }
      }
    }
  }
  
  /**
   * 处理性能模式变化
   */
  private handlePerformanceModeChange(isPerformanceMode: boolean): void {
    // 更新后处理质量
    if (this.config.postProcessing) {
      this.config.postProcessing.quality = isPerformanceMode ? 'low' : 'high';
    }
    
    // 更新粒子系统配置
    if (this.particleSystemManager) {
      const particleSystem = this.particleSystemManager.getParticleSystem('equationParticles');
      if (particleSystem) {
        const config = particleSystem.getConfig();
        config.rate = isPerformanceMode ? config.rate * 0.5 : config.rate * 2;
        particleSystem.updateConfig(config);
      }
    }
    
    // 发布性能模式变化事件
    eventSystem.emit(VisualizationEvent.PERFORMANCE_MODE_CHANGED, {
      isPerformanceMode
    });
  }
  
  /**
   * 处理粒子密度变化
   */
  private handleParticleDensityChange(density: number): void {
    if (this.particleSystemManager) {
      const particleSystem = this.particleSystemManager.getParticleSystem('equationParticles');
      if (particleSystem) {
        const config = particleSystem.getConfig();
        config.rate = Math.max(10, config.rate * density);
        particleSystem.updateConfig(config);
      }
    }
  }
  
  /**
   * 处理最大粒子数量变化
   */
  private handleMaxParticlesChange(maxParticles: number): void {
    if (this.particleSystemManager) {
      const particleSystem = this.particleSystemManager.getParticleSystem('equationParticles');
      if (particleSystem) {
        const config = particleSystem.getConfig();
        config.maxParticles = maxParticles;
        particleSystem.updateConfig(config);
      }
    }
  }
  
  /**
   * 处理渲染缩放变化
   */
  private handleRenderScaleChange(scale: number): void {
    if (this.renderer) {
      const targetPixelRatio = Math.min(window.devicePixelRatio * scale, 2);
      this.renderer.setPixelRatio(targetPixelRatio);
      this.onResize();
    }
  }
  
  /**
   * 处理阴影质量变化
   */
  private handleShadowQualityChange(quality: number): void {
    if (this.renderer) {
      if (quality === 0) {
        this.renderer.shadowMap.enabled = false;
      } else {
        this.renderer.shadowMap.enabled = true;
        // 根据质量调整阴影贴图大小等参数
        // 这里简化处理，实际可以根据质量设置更详细的参数
      }
    }
  }
  
  /**
   * 处理后处理启用状态变化
   */
  private handlePostProcessingEnabledChange(enabled: boolean): void {
    if (this.config.postProcessing) {
      this.config.postProcessing.enabled = enabled;
      this.reinitializePostProcessing();
    }
  }
  
  /**
   * 处理纹理质量变化
   */
  private handleTextureQualityChange(quality: number): void {
    // 这里可以添加纹理质量调整逻辑
    // 例如：更新材质的纹理过滤方式、调整纹理分辨率等
    eventSystem.emit(VisualizationEvent.TEXTURE_QUALITY_UPDATED, { quality });
  }
  
  /**
   * 处理窗口大小变化（内部使用）
   */
  private onResize(): void {
    if (!this.camera || !this.renderer) return;
    
    // 获取容器大小
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    
    this.handleResize(container);
  }
  
  /**
   * 获取场景
   */
  public getScene(): THREE.Scene | null {
    return this.scene;
  }
  
  /**
   * 获取相机
   */
  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }
  
  /**
   * 获取渲染器
   */
  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }
  
  /**
   * 获取控制器
   */
  public getControls(): OrbitControls | null {
    return this.controls;
  }
  
  /**
   * 获取粒子系统管理器
   */
  public getParticleSystemManager(): GPUParticleSystemManager | null {
    return this.particleSystemManager;
  }
  
  /**
   * 获取资源管理器
   */
  public getResourceManager(): ResourceManager | null {
    return this.resourceManager;
  }
  
  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): {
    fps: number;
    frameTime: number;
  } {
    return {
      fps: this.fps,
      frameTime: this.frameTime
    };
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    // 停止渲染
    this.stopRendering();
    
    // 清理所有可视化组件
    this.components.forEach(component => {
      component.dispose();
    });
    this.components.clear();
    
    // 清理后处理效果
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    // 清理粒子系统
    if (this.particleSystemManager) {
      this.particleSystemManager.dispose();
      this.particleSystemManager = null;
    }
    
    // 清理场可视化系统
    if (this.fieldVisualizerManager) {
      this.fieldVisualizerManager.clear();
      this.fieldVisualizerManager = null;
    }
    
    // 清理控制器
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    // 清理渲染器
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // 清理场景
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    
    // 清理相机
    this.camera = null;
    
    // 清理性能管理器
    unifiedPerformanceManager.dispose();
    
    // 发布清理完成事件
    eventSystem.emit(VisualizationEvent.DISPOSED);
    
    this.isInitialized = false;
    
    console.log('🎨 VisualizationManager disposed successfully');
  }
}

// 导出单例实例
export const visualizationManager = VisualizationManager.getInstance();
