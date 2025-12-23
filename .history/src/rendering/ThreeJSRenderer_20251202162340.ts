import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ToneMappingPass } from 'three/examples/jsm/postprocessing/ToneMappingPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ParticleSystemManager } from '../visualization/ParticleSystem';
import { FieldVisualizerManager } from '../visualization/FieldVisualizer';
import { PhysicsEngine } from '../core/PhysicsEngine';

/**
 * 后处理效果配置
 */
export interface PostProcessingConfig {
  enabled: boolean;
  bloomEnabled: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  filmGrainEnabled: boolean;
  filmGrainIntensity: number;
  filmGrainCount: number;
  filmGrainScanlines: boolean;
  fxaaEnabled: boolean;
  toneMappingEnabled: boolean;
  toneMappingType: THREE.ToneMapping;
  toneMappingExposure: number;
  gammaCorrectionEnabled: boolean;
}

/**
 * Three.js渲染器配置
 */
export interface ThreeJSRendererConfig {
  antialias: boolean;
  alpha: boolean;
  physicallyCorrectLights: boolean;
  shadowMapEnabled: boolean;
  shadowMapType: THREE.ShadowMapType;
  pixelRatio: number;
  backgroundColor: number;
  postProcessing?: Partial<PostProcessingConfig>;
}

/**
 * 场景配置
 */
export interface SceneConfig {
  fogEnabled: boolean;
  fogType: 'linear' | 'exponential';
  fogColor: number;
  fogNear: number;
  fogFar: number;
  fogDensity: number;
}

/**
 * 相机配置
 */
export interface CameraConfig {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

/**
 * 控制器配置
 */
export interface ControlsConfig {
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

/**
 * Three.js渲染器组件
 */
export class ThreeJSRenderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private physicsEngine: PhysicsEngine;
  private particleSystemManager: ParticleSystemManager;
  private fieldVisualizerManager: FieldVisualizerManager;
  private animationId: number | null = null;
  private startTime: number = 0;
  private deltaTime: number = 0;
  private lastTime: number = 0;
  private isInitialized: boolean = false;
  private isAnimating: boolean = false;
  
  // 后处理相关
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private filmPass: FilmPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private toneMappingPass: ToneMappingPass | null = null;
  private gammaCorrectionPass: ShaderPass | null = null;
  
  // 配置项
  private rendererConfig: ThreeJSRendererConfig;
  private sceneConfig: SceneConfig;
  private cameraConfig: CameraConfig;
  private controlsConfig: ControlsConfig;
  private postProcessingConfig: PostProcessingConfig;

  constructor(
    container: HTMLElement,
    physicsEngine: PhysicsEngine,
    config: {
      renderer?: Partial<ThreeJSRendererConfig>;
      scene?: Partial<SceneConfig>;
      camera?: Partial<CameraConfig>;
      controls?: Partial<ControlsConfig>;
    } = {}
  ) {
    this.container = container;
    this.physicsEngine = physicsEngine;
    
    // 初始化默认配置
    this.rendererConfig = {
      antialias: true,
      alpha: false,
      physicallyCorrectLights: true,
      shadowMapEnabled: true,
      shadowMapType: THREE.PCFSoftShadowMap,
      pixelRatio: window.devicePixelRatio,
      backgroundColor: 0x000000,
      ...config.renderer
    };
    
    // 初始化后处理配置
    this.postProcessingConfig = {
      enabled: true,
      bloomEnabled: true,
      bloomStrength: 0.5,
      bloomRadius: 0.85,
      bloomThreshold: 0.1,
      filmGrainEnabled: false,
      filmGrainIntensity: 0.1,
      filmGrainCount: 800,
      filmGrainScanlines: false,
      fxaaEnabled: true,
      toneMappingEnabled: true,
      toneMappingType: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.0,
      gammaCorrectionEnabled: true,
      ...this.rendererConfig.postProcessing
    };
    
    this.sceneConfig = {
      fogEnabled: false,
      fogType: 'linear',
      fogColor: 0x000000,
      fogNear: 1,
      fogFar: 1000,
      fogDensity: 0.01,
      ...config.scene
    };
    
    this.cameraConfig = {
      fov: 75,
      aspect: container.clientWidth / container.clientHeight,
      near: 0.1,
      far: 1000,
      position: new THREE.Vector3(0, 5, 10),
      lookAt: new THREE.Vector3(0, 0, 0),
      ...config.camera
    };
    
    this.controlsConfig = {
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 1,
      zoomSpeed: 1,
      panSpeed: 1,
      autoRotate: false,
      autoRotateSpeed: 2,
      minDistance: 1,
      maxDistance: 1000,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2,
      ...config.controls
    };
    
    // 初始化组件
    this.initialize();
  }

  /**
   * 初始化Three.js渲染器
   */
  private initialize(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.setupScene();
    
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      this.cameraConfig.fov,
      this.cameraConfig.aspect,
      this.cameraConfig.near,
      this.cameraConfig.far
    );
    this.camera.position.copy(this.cameraConfig.position);
    this.camera.lookAt(this.cameraConfig.lookAt);
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.rendererConfig.antialias && !this.postProcessingConfig.fxaaEnabled, // 如果启用了FXAA，可以关闭WebGL抗锯齿
      alpha: this.rendererConfig.alpha,
      powerPreference: 'high-performance',
      premultipliedAlpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.rendererConfig.pixelRatio);
    this.renderer.setClearColor(this.rendererConfig.backgroundColor);
    this.renderer.physicallyCorrectLights = this.rendererConfig.physicallyCorrectLights;
    
    // 配置阴影映射
    if (this.rendererConfig.shadowMapEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this.rendererConfig.shadowMapType;
    }
    
    // 添加到容器
    this.container.appendChild(this.renderer.domElement);
    
    // 创建控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.setupControls();
    
    // 添加默认光源
    this.addDefaultLights();
    
    // 创建管理器
    this.particleSystemManager = new ParticleSystemManager(this.scene);
    this.fieldVisualizerManager = new FieldVisualizerManager(this.scene, this.physicsEngine);
    
    // 初始化后处理效果
    this.initializePostProcessing();
    
    // 绑定事件监听器
    this.bindEventListeners();
    
    // 初始化完成
    this.isInitialized = true;
  }
  
  /**
   * 初始化后处理效果
   */
  private initializePostProcessing(): void {
    // 创建效果合成器
    this.composer = new EffectComposer(this.renderer);
    
    // 创建渲染通道
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    
    // 添加FXAA抗锯齿通道
    if (this.postProcessingConfig.fxaaEnabled) {
      this.fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.container.clientWidth * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.container.clientHeight * pixelRatio);
      this.composer.addPass(this.fxaaPass);
    }
    
    // 添加Unreal Bloom通道
    if (this.postProcessingConfig.bloomEnabled) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
        this.postProcessingConfig.bloomStrength,
        this.postProcessingConfig.bloomRadius,
        this.postProcessingConfig.bloomThreshold
      );
      this.composer.addPass(this.bloomPass);
    }
    
    // 添加色调映射通道
    if (this.postProcessingConfig.toneMappingEnabled) {
      this.toneMappingPass = new ToneMappingPass(
        this.postProcessingConfig.toneMappingType,
        this.postProcessingConfig.toneMappingExposure
      );
      this.composer.addPass(this.toneMappingPass);
    }
    
    // 添加电影颗粒效果通道
    if (this.postProcessingConfig.filmGrainEnabled) {
      this.filmPass = new FilmPass(
        this.postProcessingConfig.filmGrainIntensity,
        this.postProcessingConfig.filmGrainCount,
        this.postProcessingConfig.filmGrainScanlines ? 1 : 0,
        0
      );
      this.filmPass.renderToScreen = false;
      this.composer.addPass(this.filmPass);
    }
    
    // 添加伽马校正通道
    if (this.postProcessingConfig.gammaCorrectionEnabled) {
      this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      this.gammaCorrectionPass.renderToScreen = true;
      this.composer.addPass(this.gammaCorrectionPass);
    }
    
    // 如果没有伽马校正，确保最后一个通道渲染到屏幕
    if (!this.postProcessingConfig.gammaCorrectionEnabled) {
      if (this.filmPass) {
        this.filmPass.renderToScreen = true;
      } else if (this.toneMappingPass) {
        this.toneMappingPass.renderToScreen = true;
      } else if (this.bloomPass) {
        this.bloomPass.renderToScreen = true;
      } else if (this.fxaaPass) {
        this.fxaaPass.renderToScreen = true;
      }
    }
  }

  /**
   * 设置场景
   */
  private setupScene(): void {
    // 配置雾效
    if (this.sceneConfig.fogEnabled) {
      if (this.sceneConfig.fogType === 'linear') {
        this.scene.fog = new THREE.Fog(
          this.sceneConfig.fogColor,
          this.sceneConfig.fogNear,
          this.sceneConfig.fogFar
        );
      } else {
        this.scene.fog = new THREE.FogExp2(
          this.sceneConfig.fogColor,
          this.sceneConfig.fogDensity
        );
      }
    }
  }

  /**
   * 设置控制器
   */
  private setupControls(): void {
    this.controls.enableDamping = this.controlsConfig.enableDamping;
    this.controls.dampingFactor = this.controlsConfig.dampingFactor;
    this.controls.rotateSpeed = this.controlsConfig.rotateSpeed;
    this.controls.zoomSpeed = this.controlsConfig.zoomSpeed;
    this.controls.panSpeed = this.controlsConfig.panSpeed;
    this.controls.autoRotate = this.controlsConfig.autoRotate;
    this.controls.autoRotateSpeed = this.controlsConfig.autoRotateSpeed;
    this.controls.minDistance = this.controlsConfig.minDistance;
    this.controls.maxDistance = this.controlsConfig.maxDistance;
    this.controls.minPolarAngle = this.controlsConfig.minPolarAngle;
    this.controls.maxPolarAngle = this.controlsConfig.maxPolarAngle;
    this.controls.update();
  }

  /**
   * 添加默认光源
   */
  private addDefaultLights(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // 点光源
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -10);
    this.scene.add(pointLight);
  }

  /**
   * 绑定事件监听器
   */
  private bindEventListeners(): void {
    // 窗口大小变化事件
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // 更新相机
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // 更新渲染器
    this.renderer.setSize(width, height);
  }

  /**
   * 动画循环
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // 计算时间差
    const currentTime = performance.now();
    if (this.startTime === 0) {
      this.startTime = currentTime;
    }
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // 更新控制器
    this.controls.update();
    
    // 更新粒子系统
    this.particleSystemManager.update(this.deltaTime);
    
    // 更新场可视化
    this.fieldVisualizerManager.update(this.deltaTime);
    
    // 渲染场景 - 使用后处理或直接渲染
    if (this.postProcessingConfig.enabled && this.composer) {
      this.composer.render(this.deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * 开始动画
   */
  startAnimation(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.startTime = 0;
      this.lastTime = 0;
      this.animate();
    }
  }

  /**
   * 停止动画
   */
  stopAnimation(): void {
    if (this.isAnimating && this.animationId) {
      this.isAnimating = false;
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 渲染单帧
   */
  render(): void {
    if (this.postProcessingConfig.enabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * 更新渲染器配置
   */
  updateRendererConfig(config: Partial<ThreeJSRendererConfig>): void {
    this.rendererConfig = { ...this.rendererConfig, ...config };
    
    // 更新渲染器设置
    this.renderer.setPixelRatio(this.rendererConfig.pixelRatio);
    this.renderer.setClearColor(this.rendererConfig.backgroundColor);
    this.renderer.physicallyCorrectLights = this.rendererConfig.physicallyCorrectLights;
    
    // 更新阴影映射
    if (this.rendererConfig.shadowMapEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this.rendererConfig.shadowMapType;
    } else {
      this.renderer.shadowMap.enabled = false;
    }
  }

  /**
   * 更新场景配置
   */
  updateSceneConfig(config: Partial<SceneConfig>): void {
    this.sceneConfig = { ...this.sceneConfig, ...config };
    this.setupScene();
  }

  /**
   * 更新相机配置
   */
  updateCameraConfig(config: Partial<CameraConfig>): void {
    this.cameraConfig = { ...this.cameraConfig, ...config };
    
    // 更新相机设置
    this.camera.fov = this.cameraConfig.fov;
    this.camera.aspect = this.cameraConfig.aspect;
    this.camera.near = this.cameraConfig.near;
    this.camera.far = this.cameraConfig.far;
    this.camera.position.copy(this.cameraConfig.position);
    this.camera.lookAt(this.cameraConfig.lookAt);
    this.camera.updateProjectionMatrix();
  }

  /**
   * 更新控制器配置
   */
  updateControlsConfig(config: Partial<ControlsConfig>): void {
    this.controlsConfig = { ...this.controlsConfig, ...config };
    this.setupControls();
  }

  /**
   * 添加对象到场景
   */
  addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  /**
   * 从场景移除对象
   */
  removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  /**
   * 获取场景
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * 获取相机
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * 获取渲染器
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * 获取控制器
   */
  getControls(): OrbitControls {
    return this.controls;
  }

  /**
   * 获取粒子系统管理器
   */
  getParticleSystemManager(): ParticleSystemManager {
    return this.particleSystemManager;
  }

  /**
   * 获取场可视化管理器
   */
  getFieldVisualizerManager(): FieldVisualizerManager {
    return this.fieldVisualizerManager;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 停止动画
    this.stopAnimation();
    
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // 清理控制器
    this.controls.dispose();
    
    // 清理管理器
    this.particleSystemManager.clear();
    this.fieldVisualizerManager.clear();
    
    // 清理场景中的对象
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
      
      // 释放几何体和材质
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      } else if (child instanceof THREE.Light) {
        // 光源不需要额外清理
      } else if (child instanceof THREE.Points) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      } else if (child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    
    // 清理渲染器
    this.renderer.dispose();
    
    // 移除DOM元素
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    this.isInitialized = false;
  }

  /**
   * 获取渲染状态
   */
  getStatus(): {
    isInitialized: boolean;
    isAnimating: boolean;
    containerSize: { width: number; height: number };
    cameraPosition: THREE.Vector3;
    cameraRotation: THREE.Euler;
  } {
    return {
      isInitialized: this.isInitialized,
      isAnimating: this.isAnimating,
      containerSize: {
        width: this.container.clientWidth,
        height: this.container.clientHeight
      },
      cameraPosition: this.camera.position.clone(),
      cameraRotation: this.camera.rotation.clone()
    };
  }
}

/**
 * Three.js渲染器工厂
 */
export class ThreeJSRendererFactory {
  /**
   * 创建Three.js渲染器实例
   */
  static create(
    container: HTMLElement,
    physicsEngine: PhysicsEngine,
    config?: {
      renderer?: Partial<ThreeJSRendererConfig>;
      scene?: Partial<SceneConfig>;
      camera?: Partial<CameraConfig>;
      controls?: Partial<ControlsConfig>;
    }
  ): ThreeJSRenderer {
    return new ThreeJSRenderer(container, physicsEngine, config);
  }
}
