import { EventEmitter } from 'events'

/**
 * 输入类型
 */
export enum InputType {
  MOUSE = 'mouse',
  TOUCH = 'touch',
  KEYBOARD = 'keyboard',
  GAMEPAD = 'gamepad',
  CUSTOM = 'custom'
}

/**
 * 输入事件类型
 */
export enum InputEventType {
  MOUSE_DOWN = 'mousedown',
  MOUSE_MOVE = 'mousemove',
  MOUSE_UP = 'mouseup',
  MOUSE_WHEEL = 'mousewheel',
  TOUCH_START = 'touchstart',
  TOUCH_MOVE = 'touchmove',
  TOUCH_END = 'touchend',
  KEY_DOWN = 'keydown',
  KEY_UP = 'keyup',
  GAMEPAD_CONNECTED = 'gamepadconnected',
  GAMEPAD_DISCONNECTED = 'gamepaddisconnected',
  GAMEPAD_BUTTON_DOWN = 'gamepadbuttondown',
  GAMEPAD_BUTTON_UP = 'gamepadbuttonup',
  GAMEPAD_AXIS_MOVE = 'gamepadaxismove'
}

/**
 * 输入状态
 */
export interface InputState {
  mouse: {
    position: { x: number; y: number }
    buttons: boolean[]
    wheelDelta: number
    isDown: boolean
  }
  touch: {
    touches: Array<{ identifier: number; x: number; y: number }>
    isTouching: boolean
  }
  keyboard: {
    keys: Map<string, boolean>
  }
  gamepad: {
    gamepads: Gamepad[]
  }
}

/**
 * 输入管理器配置
 */
export interface InputManagerConfig {
  enabled: boolean
  preventDefault: boolean
  stopPropagation: boolean
  enableMouse: boolean
  enableTouch: boolean
  enableKeyboard: boolean
  enableGamepad: boolean
}

/**
 * 输入管理器
 */
export class InputManager extends EventEmitter {
  private config: InputManagerConfig
  private state: InputState
  private element: HTMLElement
  private isInitialized: boolean = false

  constructor(element: HTMLElement, config: Partial<InputManagerConfig> = {}) {
    super()

    this.element = element
    this.config = {
      enabled: true,
      preventDefault: true,
      stopPropagation: false,
      enableMouse: true,
      enableTouch: true,
      enableKeyboard: true,
      enableGamepad: true,
      ...config
    }

    this.state = {
      mouse: {
        position: { x: 0, y: 0 },
        buttons: [false, false, false],
        wheelDelta: 0,
        isDown: false
      },
      touch: {
        touches: [],
        isTouching: false
      },
      keyboard: {
        keys: new Map()
      },
      gamepad: {
        gamepads: []
      }
    }

    this.initialize()
  }

  /**
   * 初始化输入管理器
   */
  private initialize(): void {
    if (this.config.enableMouse) {
      this.setupMouseEvents()
    }

    if (this.config.enableTouch) {
      this.setupTouchEvents()
    }

    if (this.config.enableKeyboard) {
      this.setupKeyboardEvents()
    }

    if (this.config.enableGamepad) {
      this.setupGamepadEvents()
    }

    this.isInitialized = true
  }

  /**
   * 设置鼠标事件
   */
  private setupMouseEvents(): void {
    const handleMouseDown = (event: MouseEvent) => {
      if (!this.config.enabled) return

      this.state.mouse.position = { x: event.clientX, y: event.clientY }
      this.state.mouse.buttons[event.button] = true
      this.state.mouse.isDown = true

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.MOUSE_DOWN, event)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!this.config.enabled) return

      this.state.mouse.position = { x: event.clientX, y: event.clientY }

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.MOUSE_MOVE, event)
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (!this.config.enabled) return

      this.state.mouse.position = { x: event.clientX, y: event.clientY }
      this.state.mouse.buttons[event.button] = false
      this.state.mouse.isDown = this.state.mouse.buttons.some(button => button)

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.MOUSE_UP, event)
    }

    const handleMouseWheel = (event: WheelEvent) => {
      if (!this.config.enabled) return

      this.state.mouse.wheelDelta = event.deltaY

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.MOUSE_WHEEL, event)
    }

    // 添加事件监听器
    this.element.addEventListener('mousedown', handleMouseDown)
    this.element.addEventListener('mousemove', handleMouseMove)
    this.element.addEventListener('mouseup', handleMouseUp)
    this.element.addEventListener('wheel', handleMouseWheel)

    // 添加全局事件监听器
    document.addEventListener('mouseup', handleMouseUp)
  }

  /**
   * 设置触摸事件
   */
  private setupTouchEvents(): void {
    const handleTouchStart = (event: TouchEvent) => {
      if (!this.config.enabled) return

      this.state.touch.touches = Array.from(event.touches).map(touch => ({
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
      }))
      this.state.touch.isTouching = true

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.TOUCH_START, event)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!this.config.enabled) return

      this.state.touch.touches = Array.from(event.touches).map(touch => ({
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
      }))

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.TOUCH_MOVE, event)
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (!this.config.enabled) return

      this.state.touch.touches = Array.from(event.touches).map(touch => ({
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
      }))
      this.state.touch.isTouching = this.state.touch.touches.length > 0

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.TOUCH_END, event)
    }

    // 添加事件监听器
    this.element.addEventListener('touchstart', handleTouchStart)
    this.element.addEventListener('touchmove', handleTouchMove)
    this.element.addEventListener('touchend', handleTouchEnd)
    this.element.addEventListener('touchcancel', handleTouchEnd)
  }

  /**
   * 设置键盘事件
   */
  private setupKeyboardEvents(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.config.enabled) return

      this.state.keyboard.keys.set(event.code, true)

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.KEY_DOWN, event)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!this.config.enabled) return

      this.state.keyboard.keys.set(event.code, false)

      if (this.config.preventDefault) event.preventDefault()
      if (this.config.stopPropagation) event.stopPropagation()

      this.emit(InputEventType.KEY_UP, event)
    }

    // 添加全局事件监听器
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
  }

  /**
   * 设置游戏手柄事件
   */
  private setupGamepadEvents(): void {
    const handleGamepadConnected = (event: GamepadEvent) => {
      if (!this.config.enabled) return

      this.state.gamepad.gamepads = navigator.getGamepads()
      this.emit(InputEventType.GAMEPAD_CONNECTED, event)
    }

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      if (!this.config.enabled) return

      this.state.gamepad.gamepads = navigator.getGamepads()
      this.emit(InputEventType.GAMEPAD_DISCONNECTED, event)
    }

    // 添加事件监听器
    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    // 开始游戏手柄轮询
    this.startGamepadPolling()
  }

  /**
   * 开始游戏手柄轮询
   */
  private startGamepadPolling(): void {
    const pollGamepads = () => {
      if (!this.config.enabled || !this.config.enableGamepad) return

      const gamepads = navigator.getGamepads()

      // 检查游戏手柄状态变化
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i]
        if (!gamepad) continue

        // 检查按钮状态
        for (let j = 0; j < gamepad.buttons.length; j++) {
          // TODO: 实现按钮状态检测
        }

        // 检查轴状态
        for (let j = 0; j < gamepad.axes.length; j++) {
          // TODO: 实现轴状态检测
        }
      }

      requestAnimationFrame(pollGamepads)
    }

    requestAnimationFrame(pollGamepads)
  }

  /**
   * 获取输入状态
   */
  getState(): InputState {
    return { ...this.state }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<InputManagerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 启用输入管理器
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * 禁用输入管理器
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 检查按键是否按下
   */
  isKeyDown(key: string): boolean {
    return this.state.keyboard.keys.get(key) || false
  }

  /**
   * 检查鼠标按钮是否按下
   */
  isMouseButtonDown(buttonIndex: number): boolean {
    return this.state.mouse.buttons[buttonIndex] || false
  }

  /**
   * 获取鼠标位置
   */
  getMousePosition(): { x: number; y: number } {
    return { ...this.state.mouse.position }
  }

  /**
   * 获取触摸点
   */
  getTouches(): Array<{ identifier: number; x: number; y: number }> {
    return [...this.state.touch.touches]
  }

  /**
   * 检查是否正在触摸
   */
  isTouching(): boolean {
    return this.state.touch.isTouching
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 移除事件监听器
    // TODO: 实现事件监听器移除

    this.isInitialized = false
    this.removeAllListeners()
  }
}

/**
 * 输入管理器工厂
 */
export class InputManagerFactory {
  /**
   * 创建输入管理器实例
   */
  static create(element: HTMLElement, config?: Partial<InputManagerConfig>): InputManager {
    return new InputManager(element, config)
  }
}
