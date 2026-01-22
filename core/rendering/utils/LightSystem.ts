// 统一场论可视化系统 - 光照系统
// 版本: v1.0
// 功能: 管理光线追踪的光源

import { Vector3 } from 'three'

export class LightSystem {
  private lights: any[] = []

  constructor() {
    this.initDefaultLights()
  }

  private initDefaultLights(): void {
    // 初始化默认光源
    this.addLight({
      type: 'point',
      position: new Vector3(10, 10, 10),
      color: new Vector3(1, 1, 1),
      intensity: 1.0,
      range: 100
    })
  }

  public addLight(light: any): void {
    this.lights.push(light)
  }

  public removeLight(light: any): void {
    const index = this.lights.indexOf(light)
    if (index > -1) {
      this.lights.splice(index, 1)
    }
  }

  public getLights(): any[] {
    return this.lights
  }

  public clear(): void {
    this.lights = []
    this.initDefaultLights()
  }

  public updateLightPosition(lightIndex: number, position: Vector3): void {
    if (this.lights[lightIndex]) {
      this.lights[lightIndex].position = position
    }
  }

  public updateLightIntensity(lightIndex: number, intensity: number): void {
    if (this.lights[lightIndex]) {
      this.lights[lightIndex].intensity = intensity
    }
  }

  public dispose(): void {
    this.lights = []
  }
}
