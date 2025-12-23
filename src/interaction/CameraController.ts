import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * 相机控制器类型
 */
export enum CameraControllerType {
  ORBIT = 'orbit',
  FIRST_PERSON = 'first_person',
  FLIGHT = 'flight',
  TRACKBALL = 'trackball',
  CUSTOM = 'custom'
}

/**
 * 相机控制器配置
 */
export interface CameraControllerConfig {
  type: CameraControllerType
  enableDamping: boolean
  dampingFactor: number
  rotateSpeed: number
  zoomSpeed: number
  panSpeed: number
  autoRotate: boolean
  autoRotateSpeed: number
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
  enableKeys: boolean
  enablePan: boolean
  enableRotate: boolean
  enableZoom: boolean
  enableTouch: boolean
}

/**
 * 相机控制器状态
 */
export interface CameraControllerState {
  isEnabled: boolean
  isAutoRotating: boolean
  distance: number
  polarAngle: number
  azimuthAngle: number
  target: THREE.Vector3
}

/**
 * 相机控制器
 */
export class CameraController {
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private config: CameraControllerConfig
  private state: CameraControllerState
  private isInitialized: boolean = false

  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    config: Partial<CameraControllerConfig> = {}
  ) {
    this.camera = camera
    this.renderer = renderer

    this.config = {
      type: CameraControllerType.ORBIT,
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 1.0,
      zoomSpeed: 1.0,
      panSpeed: 1.0,
      autoRotate: false,
      autoRotateSpeed: 2.0,
      minDistance: 1,
      maxDistance: 1000,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      enableKeys: true,
      enablePan: true,
      enableRotate: true,
      enableZoom: true,
      enableTouch: true,
      ...config
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.state = {
      isEnabled: true,
      isAutoRotating: this.config.autoRotate,
      distance: this.camera.position.distanceTo(this.controls.target),
      polarAngle: this.controls.getPolarAngle(),
      azimuthAngle: this.controls.getAzimuthalAngle(),
      target: this.controls.target.clone()
    }

    this.initialize()
  }

  /**
   * 初始化相机控制器
   */
  private initialize(): void {
    this.updateControlsFromConfig()
    this.controls.update()
    this.isInitialized = true
  }

  /**
   * 从配置更新控制器设置
   */
  private updateControlsFromConfig(): void {
    this.controls.enableDamping = this.config.enableDamping
    this.controls.dampingFactor = this.config.dampingFactor
    this.controls.rotateSpeed = this.config.rotateSpeed
    this.controls.zoomSpeed = this.config.zoomSpeed
    this.controls.panSpeed = this.config.panSpeed
    this.controls.autoRotate = this.config.autoRotate
    this.controls.autoRotateSpeed = this.config.autoRotateSpeed
    this.controls.minDistance = this.config.minDistance
    this.controls.maxDistance = this.config.maxDistance
    this.controls.minPolarAngle = this.config.minPolarAngle
    this.controls.maxPolarAngle = this.config.maxPolarAngle
    this.controls.minAzimuthAngle = this.config.minAzimuthAngle
    this.controls.maxAzimuthAngle = this.config.maxAzimuthAngle
    this.controls.enableKeys = this.config.enableKeys
    this.controls.enablePan = this.config.enablePan
    this.controls.enableRotate = this.config.enableRotate
    this.controls.enableZoom = this.config.enableZoom

    // 触摸控制设置
    this.controls.enableTouchZoom = this.config.enableTouch
    this.controls.enableTouchRotate = this.config.enableTouch
    this.controls.enablePan = this.config.enablePan
  }

  /**
   * 更新控制器
   */
  update(): void {
    if (!this.isInitialized || !this.state.isEnabled) return

    this.controls.update()
    this.updateState()
  }

  /**
   * 更新状态
   */
  private updateState(): void {
    this.state.distance = this.camera.position.distanceTo(this.controls.target)
    this.state.polarAngle = this.controls.getPolarAngle()
    this.state.azimuthAngle = this.controls.getAzimuthalAngle()
    this.state.target.copy(this.controls.target)
    this.state.isAutoRotating = this.controls.autoRotate
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CameraControllerConfig>): void {
    this.config = { ...this.config, ...config }
    this.updateControlsFromConfig()
  }

  /**
   * 获取配置
   */
  getConfig(): CameraControllerConfig {
    return { ...this.config }
  }

  /**
   * 获取状态
   */
  getState(): CameraControllerState {
    return { ...this.state }
  }

  /**
   * 启用控制器
   */
  enable(): void {
    this.state.isEnabled = true
    this.controls.enabled = true
  }

  /**
   * 禁用控制器
   */
  disable(): void {
    this.state.isEnabled = false
    this.controls.enabled = false
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.state.isEnabled
  }

  /**
   * 开始自动旋转
   */
  startAutoRotate(): void {
    this.controls.autoRotate = true
    this.state.isAutoRotating = true
  }

  /**
   * 停止自动旋转
   */
  stopAutoRotate(): void {
    this.controls.autoRotate = false
    this.state.isAutoRotating = false
  }

  /**
   * 检查是否正在自动旋转
   */
  isAutoRotating(): boolean {
    return this.state.isAutoRotating
  }

  /**
   * 设置目标点
   */
  setTarget(target: THREE.Vector3): void {
    this.controls.target.copy(target)
    this.state.target.copy(target)
    this.controls.update()
  }

  /**
   * 重置相机位置
   */
  reset(): void {
    this.camera.position.set(0, 5, 10)
    this.controls.target.set(0, 0, 0)
    this.controls.update()
    this.updateState()
  }

  /**
   * 放大
   */
  zoomIn(factor: number = 1.1): void {
    this.controls.zoom = Math.max(0.1, this.controls.zoom / factor)
    this.controls.update()
    this.updateState()
  }

  /**
   * 缩小
   */
  zoomOut(factor: number = 1.1): void {
    this.controls.zoom = Math.min(10, this.controls.zoom * factor)
    this.controls.update()
    this.updateState()
  }

  /**
   * 平移相机
   */
  pan(deltaX: number, deltaY: number): void {
    this.controls.panLeft(deltaX)
    this.controls.panUp(deltaY)
    this.controls.update()
    this.updateState()
  }

  /**
   * 旋转相机
   */
  rotate(deltaPolar: number, deltaAzimuth: number): void {
    this.controls.rotateLeft(deltaAzimuth)
    this.controls.rotateUp(deltaPolar)
    this.controls.update()
    this.updateState()
  }

  /**
   * 获取OrbitControls实例
   */
  getOrbitControls(): OrbitControls {
    return this.controls
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.controls.dispose()
    this.isInitialized = false
  }
}

/**
 * 相机控制器工厂
 */
export class CameraControllerFactory {
  /**
   * 创建相机控制器实例
   */
  static create(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    config?: Partial<CameraControllerConfig>
  ): CameraController {
    return new CameraController(camera, renderer, config)
  }
}
