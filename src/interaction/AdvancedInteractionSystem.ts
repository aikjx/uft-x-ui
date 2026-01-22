/**
 * 高级交互系统
 * 提供增强的用户交互能力和手势识别
 * 优化版本：添加性能改进、更好的事件处理和更直观的控制
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import { TextureCompressionSystem } from '../utils/TextureCompressionSystem'

// 定义交互模式枚举
export enum InteractionMode {
  ORBIT = 'orbit',
  FIRST_PERSON = 'firstPerson',
  TRACKBALL = 'trackball',
  FLY = 'fly',
  TOUCH = 'touch',
  GAMEPAD = 'gamepad',
  VOICE = 'voice',
  MIXED_REALITY = 'mixedReality'
}

// 定义手势类型枚举
export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'doubleTap',
  LONG_PRESS = 'longPress',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  PAN = 'pan',
  ROTATE = 'rotate',
  ZOOM = 'zoom'
}

// 定义交互配置接口
export interface InteractionConfig {
  mode: InteractionMode
  enableDamping: boolean
  dampingFactor: number
  enableAutoRotate: boolean
  autoRotateSpeed: number
  enableZoom: boolean
  zoomSpeed: number
  enablePan: boolean
  panSpeed: number
  enableRotate: boolean
  rotateSpeed: number
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
  enableGestures: boolean
  enableVoiceControl: boolean
  enableGamepad: boolean
  enableMixedReality: boolean
  performanceMode: 'high' | 'medium' | 'low'
}

// 定义手势数据接口
export interface GestureData {
  type: GestureType
  position: THREE.Vector2
  delta: THREE.Vector2
  velocity: THREE.Vector2
  scale: number
  rotation: number
  timestamp: number
  duration: number
  fingers: number
}

// 定义交互统计接口
export interface InteractionStats {
  mode: InteractionMode
  fps: number
  latency: number
  gestures: number
  eventsPerSecond: number
  memoryUsage: number
  batteryUsage: number
}

/**
 * 高级交互系统
 */
export class AdvancedInteractionSystem {
  private config: InteractionConfig
  private controls: any = null
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private enabled: boolean = false
  private stats: InteractionStats
  private gestureDetector: GestureDetector | null = null
  private gamepadManager: GamepadManager | null = null
  private voiceController: VoiceController | null = null
  private mixedRealityManager: MixedRealityManager | null = null
  private eventHistory: any[] = []
  private lastInteractionTime: number = 0

  constructor(config: Partial<InteractionConfig> = {}) {
    this.config = {
      mode: config.mode || InteractionMode.ORBIT,
      enableDamping: config.enableDamping !== false,
      dampingFactor: config.dampingFactor || 0.05,
      enableAutoRotate: config.enableAutoRotate || false,
      autoRotateSpeed: config.autoRotateSpeed || 2.0,
      enableZoom: config.enableZoom !== false,
      zoomSpeed: config.zoomSpeed || 1.0,
      enablePan: config.enablePan !== false,
      panSpeed: config.panSpeed || 1.0,
      enableRotate: config.enableRotate !== false,
      rotateSpeed: config.rotateSpeed || 1.0,
      minDistance: config.minDistance || 0.1,
      maxDistance: config.maxDistance || 1000,
      minPolarAngle: config.minPolarAngle || 0,
      maxPolarAngle: config.maxPolarAngle || Math.PI,
      minAzimuthAngle: config.minAzimuthAngle || -Infinity,
      maxAzimuthAngle: config.maxAzimuthAngle || Infinity,
      enableGestures: config.enableGestures !== false,
      enableVoiceControl: config.enableVoiceControl || false,
      enableGamepad: config.enableGamepad || false,
      enableMixedReality: config.enableMixedReality || false,
      performanceMode: config.performanceMode || 'medium'
    }

    this.stats = {
      mode: this.config.mode,
      fps: 60,
      latency: 0,
      gestures: 0,
      eventsPerSecond: 0,
      memoryUsage: 0,
      batteryUsage: 0
    }

    // 初始化子系统
    if (this.config.enableGestures) {
      this.gestureDetector = new GestureDetector()
    }

    if (this.config.enableGamepad) {
      this.gamepadManager = new GamepadManager()
    }

    if (this.config.enableVoiceControl) {
      this.voiceController = new VoiceController()
    }

    if (this.config.enableMixedReality) {
      this.mixedRealityManager = new MixedRealityManager()
    }
  }

  /**
   * 初始化交互系统
   */
  public initialize(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera

    // 创建控制器
    this.createControls()

    // 初始化事件监听
    this.initializeEventListeners()

    // 初始化子系统
    this.initializeSubsystems()

    // 触发初始化事件
    eventSystem.emit(APP_EVENTS.INTERACTION_SYSTEM_INITIALIZED, this.config)
  }

  /**
   * 创建控制器
   */
  private createControls(): void {
    if (!this.renderer || !this.camera) return

    const domElement = this.renderer.domElement

    switch (this.config.mode) {
      case InteractionMode.ORBIT:
        this.controls = new OrbitControls(this.camera, domElement)
        this.configureOrbitControls()
        break
      case InteractionMode.FIRST_PERSON:
        this.controls = new FirstPersonControls(this.camera, domElement)
        this.configureFirstPersonControls()
        break
      case InteractionMode.TRACKBALL:
        this.controls = new TrackballControls(this.camera, domElement)
        this.configureTrackballControls()
        break
      case InteractionMode.FLY:
        this.controls = new FlyControls(this.camera, domElement)
        this.configureFlyControls()
        break
      default:
        this.controls = new OrbitControls(this.camera, domElement)
        this.configureOrbitControls()
    }

    // 触发控制器创建事件
    eventSystem.emit(APP_EVENTS.INTERACTION_CONTROLS_CREATED, this.config.mode)
  }

  /**
   * 配置轨道控制器
   */
  private configureOrbitControls(): void {
    if (!this.controls) return

    this.controls.enableDamping = this.config.enableDamping
    this.controls.dampingFactor = this.config.dampingFactor
    this.controls.enableAutoRotate = this.config.enableAutoRotate
    this.controls.autoRotateSpeed = this.config.autoRotateSpeed
    this.controls.enableZoom = this.config.enableZoom
    this.controls.zoomSpeed = this.config.zoomSpeed
    this.controls.enablePan = this.config.enablePan
    this.controls.panSpeed = this.config.panSpeed
    this.controls.enableRotate = this.config.enableRotate
    this.controls.rotateSpeed = this.config.rotateSpeed
    this.controls.minDistance = this.config.minDistance
    this.controls.maxDistance = this.config.maxDistance
    this.controls.minPolarAngle = this.config.minPolarAngle
    this.controls.maxPolarAngle = this.config.maxPolarAngle
    this.controls.minAzimuthAngle = this.config.minAzimuthAngle
    this.controls.maxAzimuthAngle = this.config.maxAzimuthAngle
  }

  /**
   * 配置第一人称控制器
   */
  private configureFirstPersonControls(): void {
    if (!this.controls) return

    this.controls.movementSpeed = 10.0
    this.controls.lookSpeed = 0.05
    this.controls.lookVertical = true
    this.controls.constrainVertical = true
    this.controls.maxPolarAngle = Math.PI / 2
  }

  /**
   * 配置轨迹球控制器
   */
  private configureTrackballControls(): void {
    if (!this.controls) return

    this.controls.rotateSpeed = this.config.rotateSpeed * 1.5
    this.controls.zoomSpeed = this.config.zoomSpeed
    this.controls.panSpeed = this.config.panSpeed
    this.controls.noRotate = !this.config.enableRotate
    this.controls.noZoom = !this.config.enableZoom
    this.controls.noPan = !this.config.enablePan
  }

  /**
   * 配置飞行控制器
   */
  private configureFlyControls(): void {
    if (!this.controls) return

    this.controls.movementSpeed = 10.0
    this.controls.rollSpeed = 0.05
    this.controls.autoForward = false
    this.controls.dragToLook = true
  }

  /**
   * 初始化事件监听
   */
  private initializeEventListeners(): void {
    if (!this.renderer) return

    const domElement = this.renderer.domElement

    // 鼠标事件
    domElement.addEventListener('mousedown', this.handleMouseDown.bind(this))
    domElement.addEventListener('mousemove', this.handleMouseMove.bind(this))
    domElement.addEventListener('mouseup', this.handleMouseUp.bind(this))
    domElement.addEventListener('wheel', this.handleWheel.bind(this))

    // 触摸事件
    domElement.addEventListener('touchstart', this.handleTouchStart.bind(this))
    domElement.addEventListener('touchmove', this.handleTouchMove.bind(this))
    domElement.addEventListener('touchend', this.handleTouchEnd.bind(this))
    domElement.addEventListener('touchcancel', this.handleTouchCancel.bind(this))

    // 键盘事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    // 窗口事件
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * 初始化子系统
   */
  private initializeSubsystems(): void {
    // 初始化手势检测器
    if (this.gestureDetector) {
      this.gestureDetector.initialize()
      this.gestureDetector.onGesture(this.handleGesture.bind(this))
    }

    // 初始化游戏手柄管理器
    if (this.gamepadManager) {
      this.gamepadManager.initialize()
      this.gamepadManager.onInput(this.handleGamepadInput.bind(this))
    }

    // 初始化语音控制器
    if (this.voiceController) {
      this.voiceController.initialize()
      this.voiceController.onCommand(this.handleVoiceCommand.bind(this))
    }

    // 初始化混合现实管理器
    if (this.mixedRealityManager) {
      this.mixedRealityManager.initialize()
      this.mixedRealityManager.onInput(this.handleMixedRealityInput.bind(this))
    }
  }

  /**
   * 更新交互系统
   */
  public update(deltaTime: number): void {
    if (!this.enabled || !this.controls) return

    // 更新控制器
    this.controls.update(deltaTime)

    // 更新子系统
    this.updateSubsystems(deltaTime)

    // 更新统计信息
    this.updateStats(deltaTime)

    // 触发更新事件
    eventSystem.emit(APP_EVENTS.INTERACTION_UPDATED, {
      deltaTime,
      stats: this.stats
    })
  }

  /**
   * 更新子系统
   */
  private updateSubsystems(deltaTime: number): void {
    if (this.gestureDetector) {
      this.gestureDetector.update(deltaTime)
    }

    if (this.gamepadManager) {
      this.gamepadManager.update(deltaTime)
    }

    if (this.voiceController) {
      this.voiceController.update(deltaTime)
    }

    if (this.mixedRealityManager) {
      this.mixedRealityManager.update(deltaTime)
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(deltaTime: number): void {
    this.stats.fps = 1 / deltaTime
    this.stats.latency = performance.now() - this.lastInteractionTime
    this.stats.eventsPerSecond = this.eventHistory.length / 10 // 每10秒事件数
    this.stats.gestures = this.gestureDetector ? this.gestureDetector.getGestureCount() : 0

    // 限制事件历史长度
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100)
    }
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    this.lastInteractionTime = performance.now()
    this.eventHistory.push({ type: 'mousedown', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_MOUSE_DOWN, event)
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent): void {
    this.eventHistory.push({ type: 'mousemove', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_MOUSE_MOVE, event)
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(event: MouseEvent): void {
    this.eventHistory.push({ type: 'mouseup', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_MOUSE_UP, event)
  }

  /**
   * 处理鼠标滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    this.eventHistory.push({ type: 'wheel', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_WHEEL, event)
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    this.lastInteractionTime = performance.now()
    this.eventHistory.push({ type: 'touchstart', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_TOUCH_START, event)
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    this.eventHistory.push({ type: 'touchmove', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_TOUCH_MOVE, event)
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    this.eventHistory.push({ type: 'touchend', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_TOUCH_END, event)
  }

  /**
   * 处理触摸取消事件
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.eventHistory.push({ type: 'touchcancel', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_TOUCH_CANCEL, event)
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.eventHistory.push({ type: 'keydown', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_KEY_DOWN, event)
  }

  /**
   * 处理键盘释放事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.eventHistory.push({ type: 'keyup', event, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_KEY_UP, event)
  }

  /**
   * 处理窗口调整事件
   */
  private handleResize(event: Event): void {
    eventSystem.emit(APP_EVENTS.INTERACTION_RESIZE, event)
  }

  /**
   * 处理手势事件
   */
  private handleGesture(gesture: GestureData): void {
    this.eventHistory.push({ type: 'gesture', gesture, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_GESTURE, gesture)
  }

  /**
   * 处理游戏手柄输入
   */
  private handleGamepadInput(input: any): void {
    this.eventHistory.push({ type: 'gamepad', input, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_GAMEPAD_INPUT, input)
  }

  /**
   * 处理语音命令
   */
  private handleVoiceCommand(command: string, confidence: number): void {
    this.eventHistory.push({ type: 'voice', command, confidence, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_VOICE_COMMAND, { command, confidence })
  }

  /**
   * 处理混合现实输入
   */
  private handleMixedRealityInput(input: any): void {
    this.eventHistory.push({ type: 'mixedReality', input, timestamp: performance.now() })
    eventSystem.emit(APP_EVENTS.INTERACTION_MIXED_REALITY_INPUT, input)
  }

  /**
   * 设置交互模式
   */
  public setMode(mode: InteractionMode): void {
    this.config.mode = mode
    this.createControls()
    this.stats.mode = mode

    // 触发模式变更事件
    eventSystem.emit(APP_EVENTS.INTERACTION_MODE_CHANGED, mode)
  }

  /**
   * 获取交互模式
   */
  public getMode(): InteractionMode {
    return this.config.mode
  }

  /**
   * 设置配置
   */
  public setConfig(config: Partial<InteractionConfig>): void {
    this.config = { ...this.config, ...config }
    this.createControls()

    // 触发配置更新事件
    eventSystem.emit(APP_EVENTS.INTERACTION_CONFIG_UPDATED, this.config)
  }

  /**
   * 获取配置
   */
  public getConfig(): InteractionConfig {
    return { ...this.config }
  }

  /**
   * 获取统计信息
   */
  public getStats(): InteractionStats {
    return { ...this.stats }
  }

  /**
   * 启用交互系统
   */
  public enable(): void {
    this.enabled = true
    eventSystem.emit(APP_EVENTS.INTERACTION_ENABLED)
  }

  /**
   * 禁用交互系统
   */
  public disable(): void {
    this.enabled = false
    eventSystem.emit(APP_EVENTS.INTERACTION_DISABLED)
  }

  /**
   * 重置交互系统
   */
  public reset(): void {
    this.eventHistory = []
    this.lastInteractionTime = 0
    this.stats = {
      mode: this.config.mode,
      fps: 60,
      latency: 0,
      gestures: 0,
      eventsPerSecond: 0,
      memoryUsage: 0,
      batteryUsage: 0
    }

    eventSystem.emit(APP_EVENTS.INTERACTION_RESET)
  }

  /**
   * 设置性能模式
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode

    // 根据性能模式调整设置
    switch (mode) {
      case 'high':
        this.config.enableDamping = true
        this.config.enableGestures = true
        this.config.enableVoiceControl = true
        this.config.enableGamepad = true
        this.config.enableMixedReality = true
        break
      case 'medium':
        this.config.enableDamping = true
        this.config.enableGestures = true
        this.config.enableVoiceControl = false
        this.config.enableGamepad = false
        this.config.enableMixedReality = false
        break
      case 'low':
        this.config.enableDamping = false
        this.config.enableGestures = false
        this.config.enableVoiceControl = false
        this.config.enableGamepad = false
        this.config.enableMixedReality = false
        break
    }

    this.createControls()
    eventSystem.emit(APP_EVENTS.INTERACTION_PERFORMANCE_MODE_CHANGED, mode)
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.enabled = false

    // 清理控制器
    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }

    // 清理子系统
    if (this.gestureDetector) {
      this.gestureDetector.dispose()
      this.gestureDetector = null
    }

    if (this.gamepadManager) {
      this.gamepadManager.dispose()
      this.gamepadManager = null
    }

    if (this.voiceController) {
      this.voiceController.dispose()
      this.voiceController = null
    }

    if (this.mixedRealityManager) {
      this.mixedRealityManager.dispose()
      this.mixedRealityManager = null
    }

    // 触发清理事件
    eventSystem.emit(APP_EVENTS.INTERACTION_DISPOSED)
  }
}

// 辅助类：手势检测器
class GestureDetector {
  private gestures: GestureData[] = []
  private lastGestureTime: number = 0
  private touchPoints: Map<number, { x: number; y: number; time: number }> = new Map()
  private gestureCallback: Function | null = null
  private isInitialized: boolean = false

  initialize(): void {
    if (this.isInitialized) return
    this.isInitialized = true
    // 可以在这里添加触摸事件监听器
  }

  update(deltaTime: number): void {
    // 清理过期手势
    const now = performance.now()
    this.gestures = this.gestures.filter(gesture => now - gesture.timestamp < 10000)
  }

  onGesture(callback: Function): void {
    this.gestureCallback = callback
  }

  getGestureCount(): number {
    return this.gestures.length
  }

  // 处理触摸开始
  handleTouchStart(touches: TouchList): void {
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i]
      this.touchPoints.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        time: performance.now()
      })
    }
  }

  // 处理触摸移动
  handleTouchMove(touches: TouchList): void {
    // 实现手势检测逻辑
    if (touches.length === 1) {
      this.detectSingleFingerGestures(touches[0])
    } else if (touches.length === 2) {
      this.detectTwoFingerGestures(touches[0], touches[1])
    }
  }

  // 处理触摸结束
  handleTouchEnd(touches: TouchList): void {
    for (let i = 0; i < touches.length; i++) {
      this.touchPoints.delete(touches[i].identifier)
    }
  }

  // 检测单指手势
  private detectSingleFingerGestures(touch: Touch): void {
    const prevTouch = this.touchPoints.get(touch.identifier)
    if (!prevTouch) return

    const deltaX = touch.clientX - prevTouch.x
    const deltaY = touch.clientY - prevTouch.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = performance.now() - prevTouch.time

    // 检测点击
    if (distance < 10 && duration < 200) {
      const gesture: GestureData = {
        type: GestureType.TAP,
        position: new THREE.Vector2(touch.clientX, touch.clientY),
        delta: new THREE.Vector2(deltaX, deltaY),
        velocity: new THREE.Vector2(deltaX / duration, deltaY / duration),
        scale: 1,
        rotation: 0,
        timestamp: performance.now(),
        duration,
        fingers: 1
      }
      this.gestures.push(gesture)
      if (this.gestureCallback) {
        this.gestureCallback(gesture)
      }
    }
    // 检测滑动
    else if (distance > 50) {
      const gesture: GestureData = {
        type: GestureType.SWIPE,
        position: new THREE.Vector2(touch.clientX, touch.clientY),
        delta: new THREE.Vector2(deltaX, deltaY),
        velocity: new THREE.Vector2(deltaX / duration, deltaY / duration),
        scale: 1,
        rotation: 0,
        timestamp: performance.now(),
        duration,
        fingers: 1
      }
      this.gestures.push(gesture)
      if (this.gestureCallback) {
        this.gestureCallback(gesture)
      }
    }

    // 更新触摸点
    this.touchPoints.set(touch.identifier, {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now()
    })
  }

  // 检测双指手势
  private detectTwoFingerGestures(touch1: Touch, touch2: Touch): void {
    const prevTouch1 = this.touchPoints.get(touch1.identifier)
    const prevTouch2 = this.touchPoints.get(touch2.identifier)
    if (!prevTouch1 || !prevTouch2) return

    // 计算当前和之前的距离
    const currentDist = Math.sqrt(
      Math.pow(touch1.clientX - touch2.clientX, 2) +
      Math.pow(touch1.clientY - touch2.clientY, 2)
    )
    const prevDist = Math.sqrt(
      Math.pow(prevTouch1.x - prevTouch2.x, 2) +
      Math.pow(prevTouch1.y - prevTouch2.y, 2)
    )

    // 计算当前和之前的角度
    const currentAngle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    )
    const prevAngle = Math.atan2(
      prevTouch2.y - prevTouch1.y,
      prevTouch2.x - prevTouch1.x
    )

    // 检测缩放
    const scale = currentDist / prevDist
    if (Math.abs(scale - 1) > 0.05) {
      const gesture: GestureData = {
        type: GestureType.PINCH,
        position: new THREE.Vector2(
          (touch1.clientX + touch2.clientX) / 2,
          (touch1.clientY + touch2.clientY) / 2
        ),
        delta: new THREE.Vector2(0, 0),
        velocity: new THREE.Vector2(0, 0),
        scale,
        rotation: 0,
        timestamp: performance.now(),
        duration: performance.now() - Math.min(prevTouch1.time, prevTouch2.time),
        fingers: 2
      }
      this.gestures.push(gesture)
      if (this.gestureCallback) {
        this.gestureCallback(gesture)
      }
    }

    // 检测旋转
    const rotation = currentAngle - prevAngle
    if (Math.abs(rotation) > 0.1) {
      const gesture: GestureData = {
        type: GestureType.ROTATE,
        position: new THREE.Vector2(
          (touch1.clientX + touch2.clientX) / 2,
          (touch1.clientY + touch2.clientY) / 2
        ),
        delta: new THREE.Vector2(0, 0),
        velocity: new THREE.Vector2(0, 0),
        scale: 1,
        rotation,
        timestamp: performance.now(),
        duration: performance.now() - Math.min(prevTouch1.time, prevTouch2.time),
        fingers: 2
      }
      this.gestures.push(gesture)
      if (this.gestureCallback) {
        this.gestureCallback(gesture)
      }
    }

    // 更新触摸点
    this.touchPoints.set(touch1.identifier, {
      x: touch1.clientX,
      y: touch1.clientY,
      time: performance.now()
    })
    this.touchPoints.set(touch2.identifier, {
      x: touch2.clientX,
      y: touch2.clientY,
      time: performance.now()
    })
  }

  dispose(): void {
    this.gestures = []
    this.touchPoints.clear()
    this.gestureCallback = null
    this.isInitialized = false
  }
}

// 辅助类：游戏手柄管理器
class GamepadManager {
  private gamepads: any[] = []
  private inputCallback: Function | null = null
  private isInitialized: boolean = false
  private lastUpdateTime: number = 0

  initialize(): void {
    if (this.isInitialized) return
    this.isInitialized = true
    // 开始游戏手柄轮询
    this.startPolling()
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return
    this.pollGamepads()
  }

  onInput(callback: Function): void {
    this.inputCallback = callback
  }

  private startPolling(): void {
    if ('gamepads' in navigator) {
      const poll = () => {
        if (this.isInitialized) {
          this.pollGamepads()
          requestAnimationFrame(poll)
        }
      }
      requestAnimationFrame(poll)
    }
  }

  private pollGamepads(): void {
    const now = performance.now()
    if (now - this.lastUpdateTime < 16) return // 限制更新频率
    this.lastUpdateTime = now

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
    this.gamepads = []

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i]
      if (gamepad && gamepad.connected) {
        this.gamepads.push(gamepad)
        this.processGamepadInput(gamepad)
      }
    }
  }

  private processGamepadInput(gamepad: Gamepad): void {
    if (!this.inputCallback) return

    const inputData = {
      id: gamepad.id,
      index: gamepad.index,
      buttons: gamepad.buttons.map(button => ({
        pressed: button.pressed,
        value: button.value
      })),
      axes: gamepad.axes,
      timestamp: gamepad.timestamp
    }

    this.inputCallback(inputData)
  }

  dispose(): void {
    this.gamepads = []
    this.inputCallback = null
    this.isInitialized = false
  }
}

// 辅助类：语音控制器
class VoiceController {
  private commands: string[] = []
  private commandCallback: Function | null = null
  private isInitialized: boolean = false
  private recognition: any = null

  initialize(): void {
    if (this.isInitialized) return
    
    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'zh-CN'

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const command = event.results[i][0].transcript.trim()
            const confidence = event.results[i][0].confidence
            this.processCommand(command, confidence)
          }
        }
      }

      this.recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
      }

      this.isInitialized = true
    } else {
      console.warn('浏览器不支持语音识别')
    }
  }

  update(deltaTime: number): void {
    // 语音控制器通常不需要每一帧更新
  }

  onCommand(callback: Function): void {
    this.commandCallback = callback
  }

  // 开始语音识别
  start(): void {
    if (this.recognition && this.isInitialized) {
      try {
        this.recognition.start()
      } catch (error) {
        console.error('无法启动语音识别:', error)
      }
    }
  }

  // 停止语音识别
  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('无法停止语音识别:', error)
      }
    }
  }

  private processCommand(command: string, confidence: number): void {
    if (confidence < 0.7) return // 过滤低置信度命令

    this.commands.push(command)
    if (this.commands.length > 10) {
      this.commands = this.commands.slice(-10)
    }

    if (this.commandCallback) {
      this.commandCallback(command, confidence)
    }
  }

  dispose(): void {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (error) {
        // 忽略错误
      }
      this.recognition = null
    }
    this.commands = []
    this.commandCallback = null
    this.isInitialized = false
  }
}

// 辅助类：混合现实管理器
class MixedRealityManager {
  private devices: any[] = []
  private inputCallback: Function | null = null
  private isInitialized: boolean = false

  initialize(): void {
    if (this.isInitialized) return
    this.isInitialized = true

    // 检查 WebXR 支持
    if ('xr' in navigator) {
      this.checkXRDevices()
    } else {
      console.warn('浏览器不支持 WebXR')
    }
  }

  update(deltaTime: number): void {
    // 混合现实管理器通常通过事件处理输入
  }

  onInput(callback: Function): void {
    this.inputCallback = callback
  }

  private async checkXRDevices(): Promise<void> {
    try {
      const isSupported = await navigator.xr?.isSessionSupported('immersive-vr')
      if (isSupported) {
        console.log('WebXR 沉浸式 VR 会话受支持')
      }
    } catch (error) {
      console.error('检查 XR 设备时出错:', error)
    }
  }

  // 尝试启动 XR 会话
  async startXRSession(): Promise<void> {
    if (!('xr' in navigator)) return

    try {
      const session = await navigator.xr?.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor', 'bounded-floor'],
        optionalFeatures: ['hand-tracking', 'layers']
      })

      if (session) {
        this.setupXRSession(session)
      }
    } catch (error) {
      console.error('启动 XR 会话时出错:', error)
    }
  }

  private setupXRSession(session: XRSession): void {
    // 设置会话事件监听器
    session.addEventListener('inputsourceschange', (event) => {
      this.handleInputSourcesChange(event, session)
    })

    session.addEventListener('end', () => {
      console.log('XR 会话结束')
    })
  }

  private handleInputSourcesChange(event: XRInputSourcesChangeEvent, session: XRSession): void {
    // 处理输入源变化
    event.added.forEach(inputSource => {
      this.devices.push(inputSource)
      if (this.inputCallback) {
        this.inputCallback({
          type: 'inputsourceadded',
          inputSource
        })
      }
    })

    event.removed.forEach(inputSource => {
      this.devices = this.devices.filter(device => device !== inputSource)
      if (this.inputCallback) {
        this.inputCallback({
          type: 'inputsourceremoved',
          inputSource
        })
      }
    })
  }

  dispose(): void {
    this.devices = []
    this.inputCallback = null
    this.isInitialized = false
  }
}

// 导出默认实例
export const advancedInteractionSystem = new AdvancedInteractionSystem()