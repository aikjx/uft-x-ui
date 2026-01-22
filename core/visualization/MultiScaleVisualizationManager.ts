// 统一场论可视化系统 - 多尺度可视化管理器
// 版本: v2.0
// 功能: 实现从量子到宇宙尺度的无缝过渡

import { Vector3, Vector4, Matrix4, Quaternion } from 'three'
import { QuantumScale } from './scales/QuantumScale'
import { AtomicScale } from './scales/AtomicScale'
import { MolecularScale } from './scales/MolecularScale'
import { MacroscopicScale } from './scales/MacroscopicScale'
import { AstronomicalScale } from './scales/AstronomicalScale'
import { CosmicScale } from './scales/CosmicScale'
import { ScaleTransition } from './transitions/ScaleTransition'
import { DataLoader } from './data/DataLoader'

export class MultiScaleVisualizationManager {
  private scales: Map<string, any> = new Map()
  private currentScale: string = 'macroscopic'
  private transition: ScaleTransition | null = null
  private isTransitioning: boolean = false
  private dataLoader: DataLoader
  private camera: any = null
  private scene: any = null
  private scaleRanges: Map<string, { min: number; max: number }> = new Map()
  private useAdaptiveLOD: boolean = true
  private enableSmoothTransitions: boolean = true
  private lodSettings: any = {}
  private lodLevel: number = 2 // 0: 低, 1: 中, 2: 高
  private maxLODLevel: number = 2
  private minLODLevel: number = 0

  constructor() {
    this.dataLoader = new DataLoader()
    this.init()
  }

  private init(): void {
    console.log('🌌 多尺度可视化管理器初始化')
    this.initScales()
    this.initScaleRanges()
  }

  private initScales(): void {
    // 初始化各个尺度
    this.scales.set('quantum', new QuantumScale())
    this.scales.set('atomic', new AtomicScale())
    this.scales.set('molecular', new MolecularScale())
    this.scales.set('macroscopic', new MacroscopicScale())
    this.scales.set('astronomical', new AstronomicalScale())
    this.scales.set('cosmic', new CosmicScale())
    console.log('🔬 尺度初始化完成')
  }

  private initScaleRanges(): void {
    // 初始化尺度范围 (以米为单位)
    this.scaleRanges.set('quantum', { min: 1e-18, max: 1e-10 })
    this.scaleRanges.set('atomic', { min: 1e-10, max: 1e-9 })
    this.scaleRanges.set('molecular', { min: 1e-9, max: 1e-6 })
    this.scaleRanges.set('macroscopic', { min: 1e-6, max: 1e6 })
    this.scaleRanges.set('astronomical', { min: 1e6, max: 1e15 })
    this.scaleRanges.set('cosmic', { min: 1e15, max: 1e25 })
  }

  public setScene(scene: any): void {
    this.scene = scene
  }

  public setCamera(camera: any): void {
    this.camera = camera
  }

  public update(deltaTime: number): void {
    // 更新当前尺度
    const currentScaleObj = this.scales.get(this.currentScale)
    if (currentScaleObj) {
      currentScaleObj.update(deltaTime)
    }

    // 处理尺度转换
    if (this.isTransitioning && this.transition) {
      this.transition.update(deltaTime)
      if (this.transition.isComplete()) {
        this.isTransitioning = false
        this.transition = null
      }
    }

    // 自适应LOD
    if (this.useAdaptiveLOD) {
      this.adjustLOD()
    }
  }

  public switchScale(targetScale: string): void {
    if (targetScale === this.currentScale) return
    if (this.isTransitioning) return

    console.log(`🔄 从 ${this.currentScale} 切换到 ${targetScale}`)

    const currentScaleObj = this.scales.get(this.currentScale)
    const targetScaleObj = this.scales.get(targetScale)

    if (currentScaleObj && targetScaleObj) {
      // 开始尺度转换
      this.transition = new ScaleTransition(
        currentScaleObj,
        targetScaleObj,
        this.camera,
        this.scene
      )
      this.isTransitioning = true
      this.currentScale = targetScale
    }
  }

  public zoomToScale(targetScale: string, position: Vector3): void {
    // 缩放到指定尺度和位置
    this.switchScale(targetScale)
    // 可以在这里实现相机定位逻辑
  }

  public getScale(scaleName: string): any {
    return this.scales.get(scaleName) || null
  }

  public getCurrentScale(): any {
    return this.scales.get(this.currentScale) || null
  }

  public getCurrentScaleName(): string {
    return this.currentScale
  }

  public getScaleRange(scaleName: string): { min: number; max: number } | null {
    return this.scaleRanges.get(scaleName) || null
  }

  public adjustLOD(): void {
    // 自适应调整LOD
    const currentScaleObj = this.scales.get(this.currentScale)
    if (currentScaleObj) {
      const distance = this.camera.position.length()
      currentScaleObj.adjustLOD(distance)
    }
  }

  public loadScaleData(scaleName: string, dataType: string): Promise<any> {
    // 加载尺度数据
    return this.dataLoader.loadScaleData(scaleName, dataType)
  }

  public setScaleParameter(scaleName: string, parameter: string, value: any): void {
    const scale = this.scales.get(scaleName)
    if (scale && scale.setParameter) {
      scale.setParameter(parameter, value)
    }
  }

  public getScaleParameter(scaleName: string, parameter: string): any {
    const scale = this.scales.get(scaleName)
    if (scale && scale.getParameter) {
      return scale.getParameter(parameter)
    }
    return null
  }

  public enableAdaptiveLOD(enabled: boolean): void {
    this.useAdaptiveLOD = enabled
  }

  public enableSmoothTransitions(enabled: boolean): void {
    this.enableSmoothTransitions = enabled
  }

  public isScaleAvailable(scaleName: string): boolean {
    return this.scales.has(scaleName)
  }

  public getAvailableScales(): string[] {
    return Array.from(this.scales.keys())
  }

  public reset(): void {
    // 重置多尺度管理器
    this.currentScale = 'macroscopic'
    this.isTransitioning = false
    this.transition = null
  }

  public dispose(): void {
    // 清理资源
    this.scales.forEach(scale => {
      if (scale.dispose) {
        scale.dispose()
      }
    })
    this.scales.clear()
    this.scaleRanges.clear()
    this.dataLoader.dispose()
    console.log('🧹 多尺度可视化管理器资源清理完成')
  }
}
