import { EventEmitter } from 'events';
import { InputManager } from './InputManager';
import { CameraController } from './CameraController';
import * as THREE from 'three';

/**
 * 交互事件类型
 */
export enum InteractionEventType {
  OBJECT_SELECTED = 'object_selected',
  OBJECT_HOVERED = 'object_hovered',
  OBJECT_CLICKED = 'object_clicked',
  SCENE_CLICKED = 'scene_clicked',
  DRAG_STARTED = 'drag_started',
  DRAG_MOVED = 'drag_moved',
  DRAG_ENDED = 'drag_ended',
  ZOOM_CHANGED = 'zoom_changed',
  CAMERA_MOVED = 'camera_moved',
  INTERACTION_STARTED = 'interaction_started',
  INTERACTION_ENDED = 'interaction_ended'
}

/**
 * 交互配置
 */
export interface InteractionConfig {
  enableObjectSelection: boolean;
  enableObjectHover: boolean;
  enableDragAndDrop: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  raycasterParams: {
    near: number;
    far: number;
    recursive: boolean;
  };
}

/**
 * 交互状态
 */
export interface InteractionState {
  isInteracting: boolean;
  selectedObject: THREE.Object3D | null;
  hoveredObject: THREE.Object3D | null;
  isDragging: boolean;
  dragStartPosition: { x: number; y: number };
  dragCurrentPosition: { x: number; y: number };
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
}

/**
 * 交互处理程序
 */
export class InteractionHandler extends EventEmitter {
  private inputManager: InputManager;
  private cameraController: CameraController;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private config: InteractionConfig;
  private state: InteractionState;
  private isInitialized: boolean = false;

  constructor(inputManager: InputManager, cameraController: CameraController, camera: THREE.PerspectiveCamera, scene: THREE.Scene, config: Partial<InteractionConfig> = {}) {
    super();
    
    this.inputManager = inputManager;
    this.cameraController = cameraController;
    this.camera = camera;
    this.scene = scene;
    
    this.config = {
      enableObjectSelection: true,
      enableObjectHover: true,
      enableDragAndDrop: true,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      raycasterParams: {
        near: 0.1,
        far: 1000,
        recursive: true
      },
      ...config
    };
    
    this.state = {
      isInteracting: false,
      selectedObject: null,
      hoveredObject: null,
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      dragCurrentPosition: { x: 0, y: 0 },
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2()
    };
    
    this.initialize();
  }

  /**
   * 初始化交互处理程序
   */
  private initialize(): void {
    // 设置射线投射器
    this.state.raycaster.near = this.config.raycasterParams.near;
    this.state.raycaster.far = this.config.raycasterParams.far;
    
    // 绑定输入事件
    this.bindInputEvents();
    
    this.isInitialized = true;
  }

  /**
   * 绑定输入事件
   */
  private bindInputEvents(): void {
    // 鼠标按下事件
    this.inputManager.on('mousedown', (event: MouseEvent) => {
      this.handleMouseDown(event);
    });
    
    // 鼠标移动事件
    this.inputManager.on('mousemove', (event: MouseEvent) => {
      this.handleMouseMove(event);
    });
    
    // 鼠标释放事件
    this.inputManager.on('mouseup', (event: MouseEvent) => {
      this.handleMouseUp(event);
    });
    
    // 鼠标滚轮事件
    this.inputManager.on('mousewheel', (event: WheelEvent) => {
      this.handleMouseWheel(event);
    });
    
    // 触摸开始事件
    this.inputManager.on('touchstart', (event: TouchEvent) => {
      this.handleTouchStart(event);
    });
    
    // 触摸移动事件
    this.inputManager.on('touchmove', (event: TouchEvent) => {
      this.handleTouchMove(event);
    });
    
    // 触摸结束事件
    this.inputManager.on('touchend', (event: TouchEvent) => {
      this.handleTouchEnd(event);
    });
  }

  /**
   * 更新射线投射器
   */
  private updateRaycaster(clientX: number, clientY: number): void {
    const rect = this.inputManager.getState().mouse.position;
    const container = this.cameraController.getOrbitControls().domElement;
    
    if (!container) return;
    
    const rectBounds = container.getBoundingClientRect();
    
    // 归一化鼠标坐标
    this.state.mouse.x = ((clientX - rectBounds.left) / rectBounds.width) * 2 - 1;
    this.state.mouse.y = -((clientY - rectBounds.top) / rectBounds.height) * 2 + 1;
    
    // 更新射线投射器
    this.state.raycaster.setFromCamera(this.state.mouse, this.camera);
  }

  /**
   * 执行射线检测
   */
  private raycast(): THREE.Intersection[] {
    return this.state.raycaster.intersectObjects(this.scene.children, this.config.raycasterParams.recursive);
  }

  /**
   * 处理对象选择
   */
  private handleObjectSelection(intersections: THREE.Intersection[]): void {
    if (!this.config.enableObjectSelection) return;
    
    const previousSelectedObject = this.state.selectedObject;
    
    if (intersections.length > 0) {
      const selectedObject = intersections[0].object;
      this.state.selectedObject = selectedObject;
      
      if (selectedObject !== previousSelectedObject) {
        this.emit(InteractionEventType.OBJECT_SELECTED, { object: selectedObject });
      }
    } else {
      this.state.selectedObject = null;
      
      if (previousSelectedObject !== null) {
        this.emit(InteractionEventType.OBJECT_SELECTED, { object: null });
      }
    }
  }

  /**
   * 处理对象悬停
   */
  private handleObjectHover(intersections: THREE.Intersection[]): void {
    if (!this.config.enableObjectHover) return;
    
    const previousHoveredObject = this.state.hoveredObject;
    
    if (intersections.length > 0) {
      const hoveredObject = intersections[0].object;
      this.state.hoveredObject = hoveredObject;
      
      if (hoveredObject !== previousHoveredObject) {
        this.emit(InteractionEventType.OBJECT_HOVERED, { object: hoveredObject });
      }
    } else {
      this.state.hoveredObject = null;
      
      if (previousHoveredObject !== null) {
        this.emit(InteractionEventType.OBJECT_HOVERED, { object: null });
      }
    }
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    this.updateRaycaster(event.clientX, event.clientY);
    const intersections = this.raycast();
    
    this.state.isInteracting = true;
    this.emit(InteractionEventType.INTERACTION_STARTED, { event });
    
    // 处理场景点击
    if (intersections.length === 0) {
      this.emit(InteractionEventType.SCENE_CLICKED, { event });
    } else {
      // 处理对象点击
      this.emit(InteractionEventType.OBJECT_CLICKED, { object: intersections[0].object, event });
    }
    
    // 处理对象选择
    this.handleObjectSelection(intersections);
    
    // 开始拖动
    if (this.config.enableDragAndDrop) {
      this.state.isDragging = true;
      this.state.dragStartPosition = { x: event.clientX, y: event.clientY };
      this.state.dragCurrentPosition = { x: event.clientX, y: event.clientY };
      this.emit(InteractionEventType.DRAG_STARTED, {
        object: this.state.selectedObject,
        startPosition: this.state.dragStartPosition,
        event
      });
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent): void {
    this.updateRaycaster(event.clientX, event.clientY);
    const intersections = this.raycast();
    
    // 处理对象悬停
    this.handleObjectHover(intersections);
    
    // 处理拖动
    if (this.state.isDragging && this.config.enableDragAndDrop) {
      this.state.dragCurrentPosition = { x: event.clientX, y: event.clientY };
      this.emit(InteractionEventType.DRAG_MOVED, {
        object: this.state.selectedObject,
        startPosition: this.state.dragStartPosition,
        currentPosition: this.state.dragCurrentPosition,
        event
      });
    }
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(event: MouseEvent): void {
    this.state.isInteracting = false;
    this.emit(InteractionEventType.INTERACTION_ENDED, { event });
    
    // 结束拖动
    if (this.state.isDragging && this.config.enableDragAndDrop) {
      this.emit(InteractionEventType.DRAG_ENDED, {
        object: this.state.selectedObject,
        startPosition: this.state.dragStartPosition,
        endPosition: { x: event.clientX, y: event.clientY },
        event
      });
      this.state.isDragging = false;
    }
  }

  /**
   * 处理鼠标滚轮事件
   */
  private handleMouseWheel(event: WheelEvent): void {
    if (this.config.enableZoom) {
      this.emit(InteractionEventType.ZOOM_CHANGED, { delta: event.deltaY, event });
    }
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.handleMouseDown(new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      }));
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.handleMouseMove(new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      }));
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      this.handleMouseUp(new MouseEvent('mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
      }));
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<InteractionConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新射线投射器参数
    if (config.raycasterParams) {
      this.state.raycaster.near = config.raycasterParams.near || this.state.raycaster.near;
      this.state.raycaster.far = config.raycasterParams.far || this.state.raycaster.far;
    }
  }

  /**
   * 获取配置
   */
  getConfig(): InteractionConfig {
    return { ...this.config };
  }

  /**
   * 获取状态
   */
  getState(): InteractionState {
    return { ...this.state };
  }

  /**
   * 获取选中的对象
   */
  getSelectedObject(): THREE.Object3D | null {
    return this.state.selectedObject;
  }

  /**
   * 获取悬停的对象
   */
  getHoveredObject(): THREE.Object3D | null {
    return this.state.hoveredObject;
  }

  /**
   * 设置选中的对象
   */
  setSelectedObject(object: THREE.Object3D | null): void {
    this.state.selectedObject = object;
    this.emit(InteractionEventType.OBJECT_SELECTED, { object });
  }

  /**
   * 清除选中的对象
   */
  clearSelectedObject(): void {
    this.setSelectedObject(null);
  }

  /**
   * 检查是否正在交互
   */
  isInteracting(): boolean {
    return this.state.isInteracting;
  }

  /**
   * 检查是否正在拖动
   */
  isDragging(): boolean {
    return this.state.isDragging;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 移除事件监听器
    this.inputManager.removeAllListeners();
    
    this.isInitialized = false;
    this.removeAllListeners();
  }
}

/**
 * 交互处理程序工厂
 */
export class InteractionHandlerFactory {
  /**
   * 创建交互处理程序实例
   */
  static create(
    inputManager: InputManager,
    cameraController: CameraController,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    config?: Partial<InteractionConfig>
  ): InteractionHandler {
    return new InteractionHandler(inputManager, cameraController, camera, scene, config);
  }
}
