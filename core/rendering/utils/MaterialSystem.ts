// 统一场论可视化系统 - 材质系统
// 版本: v1.0
// 功能: 管理光线追踪的材质

import { Vector3 } from 'three'

export class MaterialSystem {
  private materials: Map<string, any> = new Map()

  constructor() {
    this.initDefaultMaterials()
  }

  private initDefaultMaterials(): void {
    // 初始化默认材质
    this.addMaterial('default', {
      diffuseColor: new Vector3(0.5, 0.5, 0.5),
      specularColor: new Vector3(1, 1, 1),
      shininess: 32,
      reflectivity: 0,
      transparency: 0,
      ior: 1.0,
      emissive: false,
      emissiveColor: new Vector3(0, 0, 0),
      emissiveIntensity: 0
    })

    this.addMaterial('mirror', {
      diffuseColor: new Vector3(0.8, 0.8, 0.8),
      specularColor: new Vector3(1, 1, 1),
      shininess: 128,
      reflectivity: 0.9,
      transparency: 0,
      ior: 1.0,
      emissive: false,
      emissiveColor: new Vector3(0, 0, 0),
      emissiveIntensity: 0
    })

    this.addMaterial('glass', {
      diffuseColor: new Vector3(0.1, 0.1, 0.1),
      specularColor: new Vector3(1, 1, 1),
      shininess: 128,
      reflectivity: 0.1,
      transparency: 0.9,
      ior: 1.5,
      emissive: false,
      emissiveColor: new Vector3(0, 0, 0),
      emissiveIntensity: 0
    })

    this.addMaterial('emissive', {
      diffuseColor: new Vector3(1, 1, 1),
      specularColor: new Vector3(1, 1, 1),
      shininess: 32,
      reflectivity: 0,
      transparency: 0,
      ior: 1.0,
      emissive: true,
      emissiveColor: new Vector3(1, 0.8, 0.6),
      emissiveIntensity: 1.0
    })
  }

  public addMaterial(id: string, material: any): void {
    this.materials.set(id, material)
  }

  public getMaterial(id: string): any {
    return this.materials.get(id) || this.materials.get('default')
  }

  public removeMaterial(id: string): void {
    this.materials.delete(id)
  }

  public getAllMaterials(): Map<string, any> {
    return this.materials
  }

  public clear(): void {
    this.materials.clear()
    this.initDefaultMaterials()
  }

  public dispose(): void {
    this.materials.clear()
  }
}
