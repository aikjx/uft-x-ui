import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VISUALIZATION_CONFIG } from '../constants';
import { SceneManager } from './SceneManager';
import { CameraManager } from './CameraManager';
import { renderOptimizer } from '../performance/performanceUtils';

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
      stencil: false
    });

    // 初始设置
    const { width, height } = this.container.getBoundingClientRect();
    
    // 优化：使用devicePixelRatio的上限，避免过高的渲染分辨率
    const basePixelRatio = window.devicePixelRatio;
    const optimalPixelRatio = Math.min(basePixelRatio, 2); // 限制最大像素比为2

    renderer.setSize(width, height);
    renderer.setPixelRatio(optimalPixelRatio);
    renderer.setClearColor(VISUALIZATION_CONFIG.clearColor || 0x000000, VISUALIZATION_CONFIG.clearAlpha || 1);

    // 性能优化设置
    renderer.autoClear = true;
    renderer.localClippingEnabled = false;
    renderer.info.autoReset = true;
    renderer.sortObjects = true;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // 优化：设置渲染器的像素格式，提高性能
    renderer.setPixelFormat(THREE.RGBAFormat);
    renderer.setDepthFormat(THREE.DepthFormat);

    // 阴影优化
    if (VISUALIZATION_CONFIG.performance?.enableShadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
      // 移除：renderSingleSided属性在新版本Three.js中已移除
    }

    // 添加到容器
    this.container.appendChild(renderer.domElement);

    return renderer;
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

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, this.config.ambientLightIntensity);
    const directionalLight = new THREE.DirectionalLight(0xffffff, this.config.directionalLightIntensity);
    directionalLight.position.set(5, 10, 7.5);

    if (VISUALIZATION_CONFIG.performance.enableShadowMap) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
    }

    scene.add(ambientLight, directionalLight);

    // 添加网格辅助线
    if (VISUALIZATION_CONFIG.showGrid) {
      const gridHelper = new THREE.GridHelper(
        VISUALIZATION_CONFIG.gridSize,
        VISUALIZATION_CONFIG.gridDivisions
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

    // 优化：只在必要时更新控制器（当启用阻尼时）
    if (this.controls && this.controls.enableDamping) {
      this.controls.update();
    }

    // 更新场景
    this.sceneManager.update(deltaTime);

    // 渲染场景
    this.renderer.render(
      this.sceneManager.getScene(),
      this.cameraManager.getCamera()
    );

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

    // 更新渲染器
    const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(false);
    this.renderer.setPixelRatio(optimalPixelRatio);
    this.renderer.setSize(width, height);
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
    }
    
    this.renderer.dispose();
    
    // 移除渲染器DOM元素
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  /**
   * 应用性能模式设置
   */
  applyPerformanceMode(performanceMode: boolean): void {
    const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(performanceMode);
    this.renderer.setPixelRatio(optimalPixelRatio);

    // 阴影控制
    if (this.renderer.shadowMap) {
      const shouldEnableShadows = !performanceMode && VISUALIZATION_CONFIG.performance.enableShadowMap;
      if (this.renderer.shadowMap.enabled !== shouldEnableShadows) {
        this.renderer.shadowMap.enabled = shouldEnableShadows;
        if (shouldEnableShadows) {
          this.renderer.shadowMap.needsUpdate = true;
        }
      }
    }
  }
}