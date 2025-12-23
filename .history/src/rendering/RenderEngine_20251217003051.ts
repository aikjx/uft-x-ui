import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VISUALIZATION_CONFIG } from '../constants';
import { SceneManager } from './SceneManager';
import { CameraManager } from './CameraManager';
import { renderOptimizer } from '../performance/performanceUtils';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

interface RenderEngineConfig {
  container: HTMLElement;
  cameraPosition?: THREE.Vector3;
  enableControls?: boolean;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  autoUpdate?: boolean;
  enablePerformanceMonitoring?: boolean;
  useBatchRendering?: boolean;
  enableFog?: boolean;
  dynamicPixelRatio?: boolean;
}

export class RenderEngine {
  private container: HTMLElement;
  private sceneManager: SceneManager;
  private cameraManager: CameraManager;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private outlinePass: OutlinePass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private smaaPass: SMAAPass | null = null;
  private filmPass: FilmPass | null = null;
  private glitchPass: GlitchPass | null = null;
  private controls: OrbitControls | null;
  private config: RenderEngineConfig;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private lastTime: number = 0;

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
    };

    this.container = config.container;
    this.sceneManager = new SceneManager({ autoUpdate: config.autoUpdate });
    this.cameraManager = new CameraManager({ position: config.cameraPosition });
    this.renderer = this.createRenderer();
    this.controls = this.config.enableControls ? this.createControls() : null;

    this.setupScene();
    this.setupPostProcessing();
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
    });

    // 初始设置
    const { width, height } = this.container.getBoundingClientRect();
    
    // 优化：使用devicePixelRatio的上限，避免过高的渲染分辨率
    const basePixelRatio = window.devicePixelRatio;
    const optimalPixelRatio = Math.min(basePixelRatio, 2); // 限制最大像素比为2

    renderer.setSize(width, height);
    renderer.setPixelRatio(optimalPixelRatio);
    renderer.setClearColor(VISUALIZATION_CONFIG.clearColor || 0x000000, VISUALIZATION_CONFIG.clearAlpha || 0.8);

    // 高级渲染设置
    renderer.autoClear = true;
    renderer.localClippingEnabled = false;
    renderer.info.autoReset = true;
    renderer.sortObjects = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.physicallyCorrectLights = true;

    // 阴影优化
    if (VISUALIZATION_CONFIG.performance?.enableShadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
      renderer.shadowMap.renderSingleSided = false;
    }

    // 添加到容器
    this.container.appendChild(renderer.domElement);

    return renderer;
  }

  /**
   * 设置后期处理效果 - 优化性能，减少不必要的通道
   */
  private setupPostProcessing(): void {
    const { width, height } = this.container.getBoundingClientRect();
    
    // 创建效果合成器
    this.composer = new EffectComposer(this.renderer);
    
    // 渲染通道
    this.renderPass = new RenderPass(
      this.sceneManager.getScene(),
      this.cameraManager.getCamera()
    );
    this.composer.addPass(this.renderPass);
    
    // 只添加必要的后期处理通道，减少性能消耗
    
    // 1. 基础抗锯齿 - 根据设备性能选择合适的抗锯齿方案
    const useHighQualityAA = VISUALIZATION_CONFIG.performance?.highQualityAA || false;
    if (useHighQualityAA) {
      // SMAAPass - 高质量抗锯齿，性能消耗较大
      this.smaaPass = new SMAAPass(width, height);
      this.composer.addPass(this.smaaPass);
    } else {
      // FXAA - 快速抗锯齿，性能消耗较小
      this.fxaaPass = new ShaderPass(FXAAShader);
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
      this.composer.addPass(this.fxaaPass);
    }
    
    // 2. 泛光效果 - 可选，根据性能设置强度
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.0, // 降低强度，提高性能
      0.3, // 降低半径，提高性能
      0.85 // 阈值
    );
    this.composer.addPass(this.bloomPass);
    
    // 3. 边缘轮廓通道 - 可选，默认禁用，需要时启用
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      this.sceneManager.getScene(),
      this.cameraManager.getCamera()
    );
    this.outlinePass.edgeStrength = 3.0;
    this.outlinePass.edgeGlow = 1.5;
    this.outlinePass.edgeThickness = 2.0;
    this.outlinePass.pulsePeriod = 2.0;
    this.outlinePass.visibleEdgeColor.set('#00ffff');
    this.outlinePass.hiddenEdgeColor.set('#00ffff');
    this.outlinePass.enabled = false; // 默认禁用，减少性能消耗
    this.composer.addPass(this.outlinePass);
    
    // 4. 其他效果通道 - 默认禁用，需要时启用
    this.filmPass = new FilmPass(
      0.3, // 噪点强度
      0.025, // 扫描线强度
      648, // 扫描线计数
      false // 灰度
    );
    this.filmPass.enabled = false;
    this.composer.addPass(this.filmPass);
    
    this.glitchPass = new GlitchPass();
    this.glitchPass.enabled = false;
    this.composer.addPass(this.glitchPass);
  }

  /**
   * 创建并配置控制器
   */
  private createControls(): OrbitControls {
    const controls = new OrbitControls(
      this.cameraManager.getCamera(),
      this.renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = VISUALIZATION_CONFIG.maxCameraDistance;
    controls.minDistance = VISUALIZATION_CONFIG.minCameraDistance;

    return controls;
  }

  /**
   * 设置场景，添加灯光和辅助对象
   */
  private setupScene(): void {
    const scene = this.sceneManager.getScene();

    // 设置场景雾效
    if (this.config.enableFog) {
      scene.fog = new THREE.FogExp2(0x000000, 0.03);
    }

    // 添加高级灯光系统
    // 1. 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, this.config.ambientLightIntensity);
    scene.add(ambientLight);

    // 2. 主方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, this.config.directionalLightIntensity);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // 3. 补光
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-5, 5, -7.5);
    scene.add(fillLight);

    // 4. 点光源 - 用于创建发光效果
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-10, -10, -10);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    // 5. 聚光灯 - 用于强调特定区域
    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 20;
    scene.add(spotLight);

    // 添加网格辅助线
    if (VISUALIZATION_CONFIG.showGrid) {
      const gridHelper = new THREE.GridHelper(
        VISUALIZATION_CONFIG.gridSize,
        VISUALIZATION_CONFIG.gridDivisions,
        0x444444,
        0x222222
      );
      gridHelper.name = 'gridHelper';
      scene.add(gridHelper);
    }

    // 添加坐标轴
    if (VISUALIZATION_CONFIG.showAxes) {
      const axesHelper = new THREE.AxesHelper(VISUALIZATION_CONFIG.axesSize);
      axesHelper.name = 'axesHelper';
      scene.add(axesHelper);
    }

    // 添加星空背景
    this.addStarfield(scene);
  }

  /**
   * 添加星空背景 - 优化性能，减少星星数量，使用实例化渲染
   */
  private addStarfield(scene: THREE.Scene): void {
    // 优化：减少星星数量，根据设备性能动态调整
    const starsCount = VISUALIZATION_CONFIG.performance?.starCount || 2000;
    
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending, // 优化：使用加法混合，提高视觉效果同时降低性能消耗
      depthWrite: false, // 优化：禁用深度写入，提高性能
      sizeAttenuation: true // 优化：启用大小衰减，提高视觉效果
    });

    const starsVertices = [];
    for (let i = 0; i < starsCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    
    // 优化：使用BufferGeometryUtils优化几何体
    if (typeof THREE.BufferGeometryUtils !== 'undefined' && THREE.BufferGeometryUtils.mergeVertices) {
      starsGeometry = THREE.BufferGeometryUtils.mergeVertices(starsGeometry, 0.1);
    }
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  }

  /**
   * 性能监控数据
   */
  private performanceData = {
    frameCount: 0,
    startTime: performance.now(),
    lastMetricsUpdate: 0,
    renderTimeHistory: [] as number[],
    frameTimeHistory: [] as number[]
  };

  /**
   * 收集性能指标
   */
  private collectPerformanceMetrics(): void {
    const now = performance.now();
    const renderer = this.renderer;
    
    // 计算FPS
    const elapsed = now - this.performanceData.startTime;
    const fps = (this.performanceData.frameCount / elapsed) * 1000;
    
    // 计算平均渲染时间
    const avgRenderTime = this.performanceData.renderTimeHistory.length > 0
      ? this.performanceData.renderTimeHistory.reduce((a, b) => a + b, 0) / this.performanceData.renderTimeHistory.length
      : 0;
    
    // 计算平均帧时间
    const avgFrameTime = this.performanceData.frameTimeHistory.length > 0
      ? this.performanceData.frameTimeHistory.reduce((a, b) => a + b, 0) / this.performanceData.frameTimeHistory.length
      : 0;
    
    // 内存使用情况（使用performance API，如果可用）
    let memoryUsageMB = 0;
    if (performance.memory) {
      memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    
    // 发送性能指标事件
    const metrics = {
      fps: Math.round(fps),
      renderTime: avgRenderTime,
      frameTime: avgFrameTime,
      memoryUsageMB: Math.round(memoryUsageMB),
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      optimizationLevel: this.config.dynamicPixelRatio ? 2 : 1,
      pixelRatio: renderer.getPixelRatio()
    };
    
    // 触发性能指标更新事件
    // @ts-ignore - 假设eventSystem存在
    if (typeof eventSystem !== 'undefined') {
      eventSystem.emit(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, metrics);
    }
    
    // 限制历史数据长度，避免内存泄漏
    if (this.performanceData.renderTimeHistory.length > 100) {
      this.performanceData.renderTimeHistory.shift();
    }
    if (this.performanceData.frameTimeHistory.length > 100) {
      this.performanceData.frameTimeHistory.shift();
    }
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    // 优化：限制最大deltaTime为1/30秒，防止帧率骤降时的异常行为
    const deltaTime = Math.min((now - this.lastTime) / 1000, 1/30);
    this.lastTime = now;

    // 记录帧开始时间
    const frameStartTime = now;
    
    // 优化：只在必要时更新控制器（当启用阻尼时）
    if (this.controls && this.controls.enableDamping) {
      this.controls.update();
    }

    // 更新场景
    this.sceneManager.update(deltaTime);

    // 记录渲染开始时间
    const renderStartTime = performance.now();
    
    // 使用效果合成器渲染场景
    if (this.composer) {
      this.composer.render();
    } else {
      // 备选方案：直接渲染
      this.renderer.render(
        this.sceneManager.getScene(),
        this.cameraManager.getCamera()
      );
    }
    
    // 记录渲染结束时间
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime;
    const frameTime = renderEndTime - frameStartTime;
    
    // 更新性能数据
    this.performanceData.frameCount++;
    this.performanceData.renderTimeHistory.push(renderTime);
    this.performanceData.frameTimeHistory.push(frameTime);
    
    // 定期收集和发送性能指标（每500ms）
    if (now - this.performanceData.lastMetricsUpdate > 500) {
      this.collectPerformanceMetrics();
      this.performanceData.lastMetricsUpdate = now;
    }

    // 继续动画循环
    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * 启动渲染引擎
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  /**
   * 停止渲染引擎
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    const { width, height } = this.container.getBoundingClientRect();

    // 更新相机
    this.cameraManager.updateAspectRatio(width / height);

    // 优化：根据窗口大小动态调整像素比
    const isLargeWindow = width > 1920 || height > 1080;
    const basePixelRatio = window.devicePixelRatio;
    let optimalPixelRatio = basePixelRatio;
    
    if (isLargeWindow) {
      // 大屏幕使用较低的像素比，提高性能
      optimalPixelRatio = Math.min(basePixelRatio, 1.5);
    } else {
      // 小屏幕可以使用较高的像素比，提高质量
      optimalPixelRatio = Math.min(basePixelRatio, 2);
    }
    
    this.renderer.setPixelRatio(optimalPixelRatio);
    this.renderer.setSize(width, height);
    
    // 更新后期处理效果
    if (this.composer) {
      this.composer.setSize(width, height);
      
      // 更新FXAA分辨率
      if (this.fxaaPass) {
        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
      }
      
      // 更新边缘轮廓通道
      if (this.outlinePass) {
        this.outlinePass.setSize(width, height);
      }
    }
    
    // 优化：更新阴影贴图大小
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.needsUpdate = true;
    }
  }

  /**
   * 添加对象到场景
   */
  addObject(object: THREE.Object3D): void {
    this.sceneManager.addObject(object);
  }

  /**
   * 从场景移除对象
   */
  removeObject(object: THREE.Object3D): void {
    this.sceneManager.removeObject(object);
  }

  /**
   * 清理场景
   */
  clearScene(): void {
    this.sceneManager.clear();
  }

  /**
   * 设置场景更新函数
   */
  setUpdateFunction(updateFn: (deltaTime: number) => void): void {
    this.sceneManager.setUpdateFunction(updateFn);
  }

  /**
   * 获取场景实例
   */
  getScene(): THREE.Scene {
    return this.sceneManager.getScene();
  }

  /**
   * 获取相机实例
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.cameraManager.getCamera();
  }

  /**
   * 获取渲染器实例
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * 获取控制器实例
   */
  getControls(): OrbitControls | null {
    return this.controls;
  }

  /**
   * 重置渲染引擎
   */
  reset(): void {
    this.stop();
    this.sceneManager.reset();
    this.cameraManager.reset();
    this.setupScene();
    this.start();
  }

  /**
   * 销毁渲染引擎
   */
  dispose(): void {
    this.stop();
    this.clearScene();
    
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    // 释放后期处理资源
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    // 清理性能监控数据
    this.performanceData = {
      frameCount: 0,
      startTime: performance.now(),
      lastMetricsUpdate: 0,
      renderTimeHistory: [],
      frameTimeHistory: []
    };
    
    // 释放渲染器资源
    this.renderer.dispose();
    
    // 移除渲染器DOM元素
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    // 触发销毁事件
    eventSystem.emit(APP_EVENTS.RENDER_ENGINE_DISPOSED, {
      container: this.container
    });
  }

  /**
   * 获取当前性能数据
   */
  getPerformanceData(): {
    fps: number;
    renderTime: number;
    frameTime: number;
    drawCalls: number;
    triangles: number;
  } {
    
    const now = performance.now();
    const elapsed = now - this.performanceData.startTime;
    const fps = (this.performanceData.frameCount / elapsed) * 1000;
    
    const avgRenderTime = this.performanceData.renderTimeHistory.length > 0
      ? this.performanceData.renderTimeHistory.reduce((a, b) => a + b, 0) / this.performanceData.renderTimeHistory.length
      : 0;
    
    const avgFrameTime = this.performanceData.frameTimeHistory.length > 0
      ? this.performanceData.frameTimeHistory.reduce((a, b) => a + b, 0) / this.performanceData.frameTimeHistory.length
      : 0;
    
    return {
      fps: Math.round(fps),
      renderTime: avgRenderTime,
      frameTime: avgFrameTime,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles
    };
  }

  /**
   * 动态调整渲染质量
   * @param qualityLevel 质量级别 (1-5, 1最低, 5最高)
   */
  setRenderQuality(qualityLevel: number): void {
    const clampedQuality = Math.max(1, Math.min(5, qualityLevel));
    
    // 调整像素比
    const basePixelRatio = window.devicePixelRatio;
    const pixelRatioMap = [0.5, 0.75, 1, 1.5, 2];
    const optimalPixelRatio = pixelRatioMap[clampedQuality - 1];
    this.renderer.setPixelRatio(optimalPixelRatio);
    
    // 调整阴影质量
    const shadowMapSizeMap = [512, 1024, 2048, 4096, 8192];
    const shadowMapSize = shadowMapSizeMap[clampedQuality - 1];
    
    // 调整场景中的灯光阴影
    const scene = this.sceneManager.getScene();
    scene.traverse((object) => {
      if (object instanceof THREE.Light && 'shadow' in object && object.shadow) {
        object.shadow.mapSize.width = shadowMapSize;
        object.shadow.mapSize.height = shadowMapSize;
        
        // 调整阴影相机参数
        if (object.shadow.camera) {
          const shadowCamera = object.shadow.camera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
          if (shadowCamera instanceof THREE.PerspectiveCamera) {
            shadowCamera.near = 0.1;
            shadowCamera.far = 100;
          }
        }
      }
    });
    
    // 触发渲染质量更新事件
    eventSystem.emit(APP_EVENTS.RENDER_QUALITY_UPDATED, {
      qualityLevel: clampedQuality,
      pixelRatio: optimalPixelRatio,
      shadowMapSize: shadowMapSize
    });
  }

  /**
   * 启用/禁用自动性能优化
   * @param enabled 是否启用
   */
  setAutoPerformanceOptimization(enabled: boolean): void {
    this.config.dynamicPixelRatio = enabled;
    // 触发自动优化状态变更事件
    eventSystem.emit(APP_EVENTS.AUTO_OPTIMIZATION_STATE_CHANGED, {
      enabled: enabled
    });
  }

  /**
   * 应用性能模式设置
   */
  applyPerformanceMode(performanceMode: boolean): void {
    const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(performanceMode);
    this.renderer.setPixelRatio(optimalPixelRatio);

    // 阴影控制
    if (this.renderer.shadowMap) {
      const shouldEnableShadows = !performanceMode && VISUALIZATION_CONFIG.performance?.enableShadowMap;
      if (this.renderer.shadowMap.enabled !== shouldEnableShadows) {
        this.renderer.shadowMap.enabled = shouldEnableShadows;
        if (shouldEnableShadows) {
          this.renderer.shadowMap.needsUpdate = true;
        }
      }
    }
    
    // 优化：根据性能模式调整渲染质量设置
    if (performanceMode) {
      // 高性能模式
      this.renderer.sortObjects = false; // 禁用对象排序，提高性能
      this.renderer.localClippingEnabled = false; // 禁用局部裁剪
      this.renderer.toneMapping = THREE.NoToneMapping; // 禁用色调映射
    } else {
      // 高质量模式
      this.renderer.sortObjects = true; // 启用对象排序
      this.renderer.localClippingEnabled = false; // 禁用局部裁剪（大多数情况不需要）
      this.renderer.toneMapping = THREE.LinearToneMapping; // 启用线性色调映射
    }
  }
}