import * as THREE from 'three'
import { VISUALIZATION_CONFIG } from '../constants'

interface CameraConfig {
  fov?: number
  aspect?: number
  near?: number
  far?: number
  position?: THREE.Vector3
  lookAt?: THREE.Vector3
}

export class CameraManager {
  private camera: THREE.PerspectiveCamera
  private config: CameraConfig

  constructor(config: CameraConfig = {}) {
    this.config = {
      fov: VISUALIZATION_CONFIG.fov,
      aspect: 16 / 9, // 默认宽高比
      near: VISUALIZATION_CONFIG.near,
      far: VISUALIZATION_CONFIG.far,
      position: new THREE.Vector3(10, 10, 10),
      lookAt: new THREE.Vector3(0, 0, 0),
      ...config
    }

    this.camera = this.createCamera()
  }

  /**
   * 创建并配置相机
   */
  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      this.config.fov!,
      this.config.aspect!,
      this.config.near!,
      this.config.far!
    )

    camera.position.copy(this.config.position!)
    camera.lookAt(this.config.lookAt!)

    return camera
  }

  /**
   * 获取相机实例
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * 更新相机宽高比
   */
  updateAspectRatio(aspect: number): void {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  /**
   * 更新相机位置
   */
  setPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position)
    this.camera.updateMatrixWorld(true)
  }

  /**
   * 设置相机朝向
   */
  lookAt(target: THREE.Vector3): void {
    this.camera.lookAt(target)
    this.camera.updateMatrixWorld(true)
  }

  /**
   * 更新相机投影矩阵
   */
  updateProjectionMatrix(): void {
    this.camera.updateProjectionMatrix()
  }

  /**
   * 重置相机到初始状态
   */
  reset(): void {
    this.camera = this.createCamera()
  }
}
