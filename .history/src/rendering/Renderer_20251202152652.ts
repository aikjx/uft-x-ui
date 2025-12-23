import * as THREE from 'three';
import { SceneGraph } from './SceneGraph';
import { MaterialSystem } from './MaterialSystem';
import { MeshManager } from './MeshManager';

/**
 * 渲染器配置
 */
export interface RendererConfig {
  antialias: boolean;
  alpha: boolean;
  pixelRatio: number;
  backgroundColor: number;
  shadowMapEnabled: boolean;
}

/**
 * 渲染器抽象类
 */
export abstract class Renderer {
  protected config: RendererConfig;
  protected sceneGraph: SceneGraph;
  protected materialSystem: MaterialSystem;
  protected meshManager: MeshManager;
  protected clock: THREE.Clock;
  protected frameId: number | null = null;
  protected isRunning: boolean = false;

  /**
   * 构造函数
   * @param config 渲染器配置
   */
  constructor(config: Partial<RendererConfig> = {}) {
    this.config = {
      antialias: true,
      alpha: false,
      pixelRatio: window.devicePixelRatio || 1,
      backgroundColor: 0x000000,
      shadowMapEnabled: true,
      ...config
    };

    this.sceneGraph = new SceneGraph();
    this.materialSystem = new MaterialSystem();
    this.meshManager = new MeshManager(this.sceneGraph);
    this.clock = new THREE.Clock();
  }

  /**
   * 初始化渲染器
   * @param container DOM容器
   */
  abstract init(container: HTMLElement): void;

  /**
   * 开始渲染循环
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frameId = requestAnimationFrame(this.renderLoop.bind(this));
  }

  /**
   * 停止渲染循环
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * 渲染循环
   */
  protected renderLoop(): void {
    if (!this.isRunning) return;
    
    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render(deltaTime);
    
    this.frameId = requestAnimationFrame(this.renderLoop.bind(this));
  }

  /**
   * 更新场景
   * @param deltaTime 时间增量
   */
  protected update(deltaTime: number): void {
    this.sceneGraph.update(deltaTime);
  }

  /**
   * 渲染场景
   * @param deltaTime 时间增量
   */
  protected abstract render(deltaTime: number): void;

  /**
   * 调整渲染器大小
   * @param width 宽度
   * @param height 高度
   */
  abstract resize(width: number, height: number): void;

  /**
   * 获取场景图
   */
  getSceneGraph(): SceneGraph {
    return this.sceneGraph;
  }

  /**
   * 获取材质系统
   */
  getMaterialSystem(): MaterialSystem {
    return this.materialSystem;
  }

  /**
   * 获取网格管理器
   */
  getMeshManager(): MeshManager {
    return this.meshManager;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop();
    this.sceneGraph.dispose();
    this.materialSystem.dispose();
    this.meshManager.dispose();
  }
}

/**
 * Three.js渲染器实现
 */
export class ThreeJSRendererImpl extends Renderer {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  /**
   * 构造函数
   * @param config 渲染器配置
   */
  constructor(config: Partial<RendererConfig> = {}) {
    super(config);
    
    // 创建Three.js场景
    this.scene = this.sceneGraph.getRoot() as THREE.Scene;
    
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: this.config.alpha
    });
    this.renderer.setPixelRatio(this.config.pixelRatio);
    this.renderer.setClearColor(this.config.backgroundColor);
    
    if (this.config.shadowMapEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  /**
   * 初始化渲染器
   * @param container DOM容器
   */
  init(container: HTMLElement): void {
    // 设置渲染器大小
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    
    // 添加到容器
    container.appendChild(this.renderer.domElement);
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      this.resize(container.clientWidth, container.clientHeight);
    });
  }

  /**
   * 渲染场景
   * @param deltaTime 时间增量
   */
  protected render(deltaTime: number): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 调整渲染器大小
   * @param width 宽度
   * @param height 高度
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 获取Three.js渲染器实例
   */
  getThreeRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * 获取相机
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * 获取场景
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    super.dispose();
    this.renderer.dispose();
  }
}

/**
 * 创建渲染器实例
 */
export function createRenderer(config: Partial<RendererConfig> = {}): Renderer {
  return new ThreeJSRendererImpl(config);
}
