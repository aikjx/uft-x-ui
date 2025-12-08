import { EventEmitter } from 'events';
import { InputManager, InputType, InputEventType, InputState, InputManagerConfig } from './InputManager';
import { CameraController, CameraControllerType, CameraControllerConfig, CameraControllerState } from './CameraController';
import { InteractionHandler, InteractionEventType, InteractionConfig, InteractionState } from './InteractionHandler';
import * as THREE from 'three';

/**
 * 统一交互配置
 */
export interface UnifiedInteractionConfig {
  // 输入管理器配置
  input: Partial<InputManagerConfig>;
  
  // 相机控制器配置
  camera: Partial<CameraControllerConfig>;
  
  // 交互处理配置
  interaction: Partial<InteractionConfig>;
  
  // 整体启用/禁用
  enabled: boolean;
}

/**
 * 统一交互状态
 */
export interface UnifiedInteractionState {
  input: InputState;
  camera: CameraControllerState;
  interaction: InteractionState;
  isEnabled: boolean;
}

/**
 * 统一交互管理器
 * 整合输入管理、相机控制和交互处理，提供统一的交互接口
 */
export class UnifiedInteractionManager extends EventEmitter {
  private inputManager: InputManager;
  private cameraController: CameraController;
  private interactionHandler: InteractionHandler;
  private config: UnifiedInteractionConfig;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  
  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    config: Partial<UnifiedInteractionConfig> = {}
  ) {
    super();
    
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    
    // 合并默认配置
    this.config = {
      input: {},
      camera: {},
      interaction: {},
      enabled: true,
      ...config
    };
    
    // 初始化各组件
    this.inputManager = new InputManager(renderer.domElement, this.config.input);
    this.cameraController = new CameraController(camera, renderer, this.config.camera);
    this.interactionHandler = new InteractionHandler(
      this.inputManager,
      this.cameraController,
      camera,
      scene,
      this.config.interaction
    );
    
    // 绑定事件转发
    this.bindEventForwarding();
    
    // 设置初始启用状态
    this.setEnabled(this.config.enabled);
  }
  
  /**
   * 绑定事件转发，将子组件的事件转发到统一管理器
   */
  private bindEventForwarding(): void {
    // 转发输入事件
    this.inputManager.on('*', (eventType, ...args) => {
      this.emit(`input:${eventType}`, ...args);
    });
    
    // 转发交互事件
    this.interactionHandler.on('*', (eventType, ...args) => {
      this.emit(`interaction:${eventType}`, ...args);
    });
    
    // 转发相机相关事件
    this.on('interaction:camera_moved', () => {
      this.emit('camera:moved', this.cameraController.getState());
    });
    
    this.on('interaction:zoom_changed', (data) => {
      this.emit('camera:zoom_changed', data);
    });
  }
  
  /**
   * 更新统一管理器
   * 应该在动画循环中调用
   */
  update(): void {
    if (!this.config.enabled) return;
    
    // 更新相机控制器
    this.cameraController.update();
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<UnifiedInteractionConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新子组件配置
    if (config.input) {
      this.inputManager.updateConfig(config.input);
    }
    
    if (config.camera) {
      this.cameraController.updateConfig(config.camera);
    }
    
    if (config.interaction) {
      this.interactionHandler.updateConfig(config.interaction);
    }
    
    // 更新启用状态
    if (config.enabled !== undefined) {
      this.setEnabled(config.enabled);
    }
  }
  
  /**
   * 获取当前配置
   */
  getConfig(): UnifiedInteractionConfig {
    return { ...this.config };
  }
  
  /**
   * 获取当前状态
   */
  getState(): UnifiedInteractionState {
    return {
      input: this.inputManager.getState(),
      camera: this.cameraController.getState(),
      interaction: this.interactionHandler.getState(),
      isEnabled: this.config.enabled
    };
    }
    
    /**
     * 启用/禁用统一交互管理器
     */
    setEnabled(enabled: boolean): void {
      this.config.enabled = enabled;
      
      // 更新子组件启用状态
      if (enabled) {
        this.inputManager.enable();
        this.cameraController.enable();
      } else {
        this.inputManager.disable();
        this.cameraController.disable();
      }
    }
    
    /**
     * 检查是否启用
     */
    isEnabled(): boolean {
      return this.config.enabled;
    }
    
    /**
     * 获取输入管理器
     */
    getInputManager(): InputManager {
      return this.inputManager;
    }
    
    /**
     * 获取相机控制器
     */
    getCameraController(): CameraController {
      return this.cameraController;
    }
    
    /**
     * 获取交互处理程序
     */
    getInteractionHandler(): InteractionHandler {
      return this.interactionHandler;
    }
    
    /**
     * 重置交互状态
     */
    reset(): void {
      // 重置相机位置
      this.cameraController.reset();
      
      // 清除选中的对象
      this.interactionHandler.clearSelectedObject();
      
      // 重置输入状态
      // 注意：InputManager没有reset方法，因为它的状态是实时更新的
    }
    
    /**
     * 清理资源
     */
    dispose(): void {
      // 清理子组件
      this.inputManager.dispose();
      this.cameraController.dispose();
      this.interactionHandler.dispose();
      
      // 移除所有事件监听器
      this.removeAllListeners();
    }
    
    // ------------------
    // 便捷方法：输入管理
    // ------------------
    
    /**
     * 检查按键是否按下
     */
    isKeyDown(key: string): boolean {
      return this.inputManager.isKeyDown(key);
    }
    
    /**
     * 检查鼠标按钮是否按下
     */
    isMouseButtonDown(buttonIndex: number): boolean {
      return this.inputManager.isMouseButtonDown(buttonIndex);
    }
    
    /**
     * 获取鼠标位置
     */
    getMousePosition(): { x: number; y: number } {
      return this.inputManager.getMousePosition();
    }
    
    // ------------------
    // 便捷方法：相机控制
    // ------------------
    
    /**
     * 开始自动旋转
     */
    startAutoRotate(): void {
      this.cameraController.startAutoRotate();
    }
    
    /**
     * 停止自动旋转
     */
    stopAutoRotate(): void {
      this.cameraController.stopAutoRotate();
    }
    
    /**
     * 设置相机目标
     */
    setCameraTarget(target: THREE.Vector3): void {
      this.cameraController.setTarget(target);
    }
    
    /**
     * 放大
     */
    zoomIn(factor: number = 1.1): void {
      this.cameraController.zoomIn(factor);
    }
    
    /**
     * 缩小
     */
    zoomOut(factor: number = 1.1): void {
      this.cameraController.zoomOut(factor);
      }
      
      // ------------------
      // 便捷方法：交互处理
      // ------------------
      
      /**
       * 获取选中的对象
       */
      getSelectedObject(): THREE.Object3D | null {
        return this.interactionHandler.getSelectedObject();
      }
      
      /**
       * 获取悬停的对象
       */
      getHoveredObject(): THREE.Object3D | null {
        return this.interactionHandler.getHoveredObject();
      }
      
      /**
       * 设置选中的对象
       */
      setSelectedObject(object: THREE.Object3D | null): void {
        this.interactionHandler.setSelectedObject(object);
      }
      
      /**
       * 清除选中的对象
       */
      clearSelectedObject(): void {
        this.interactionHandler.clearSelectedObject();
      }
      
      /**
       * 检查是否正在交互
       */
      isInteracting(): boolean {
        return this.interactionHandler.isInteracting();
      }
      
      /**
       * 检查是否正在拖动
       */
      isDragging(): boolean {
        return this.interactionHandler.isDragging();
      }
    }

/**
 * 统一交互管理器工厂
 */
export class UnifiedInteractionManagerFactory {
  /**
   * 创建统一交互管理器实例
   */
  static create(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    config?: Partial<UnifiedInteractionConfig>
  ): UnifiedInteractionManager {
    return new UnifiedInteractionManager(camera, renderer, scene, config);
  }
}