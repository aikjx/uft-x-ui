/**
 * 高级 LOD (Level of Detail) 系统
 * 实现几何、材质、光照、阴影的细节层次管理
 */

import * as THREE from 'three'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 定义 LOD 配置接口
export interface LODConfig {
  maxGeometryLevels: number
  maxMaterialLevels: number
  maxLightLevels: number
  maxShadowLevels: number
  geometryDistanceRatios: number[]
  materialDistanceRatios: number[]
  lightDistanceRatios: number[]
  shadowDistanceRatios: number[]
  enableAutoLOD: boolean
  enableDynamicLOD: boolean
  performanceMode: boolean
}

// 定义几何 LOD 级别接口
export interface GeometryLODLevel {
  level: number
  geometry: THREE.BufferGeometry
  distance: number
  triangleCount: number
}

// 定义材质 LOD 级别接口
export interface MaterialLODLevel {
  level: number
  material: THREE.Material
  distance: number
  complexity: number
}

// 定义光照 LOD 级别接口
export interface LightLODLevel {
  level: number
  intensity: number
  distance: number
  shadowEnabled: boolean
  shadowResolution: number
}

// 定义阴影 LOD 级别接口
export interface ShadowLODLevel {
  level: number
  resolution: number
  distance: number
  quality: number
}

// 定义对象 LOD 数据接口
export interface ObjectLODData {
  object: THREE.Object3D
  geometryLOD: GeometryLODLevel[]
  materialLOD: MaterialLODLevel[]
  lightLOD?: LightLODLevel[]
  shadowLOD?: ShadowLODLevel[]
  currentGeometryLevel: number
  currentMaterialLevel: number
  currentLightLevel: number
  currentShadowLevel: number
  distanceToCamera: number
  lastUpdateTime: number
}

/**
 * 高级 LOD 系统
 */
export class AdvancedLODSystem {
  private config: LODConfig
  private lodObjects: Map<string, ObjectLODData> = new Map()
  private camera: THREE.PerspectiveCamera | null = null
  private scene: THREE.Scene | null = null
  private isInitialized: boolean = false
  private performanceStats = {
    objectsProcessed: 0,
    averageLODSwitchTime: 0,
    totalLODSwitchTime: 0,
    lodSwitches: 0
  }

  constructor(config: Partial<LODConfig> = {}) {
    this.config = {
      maxGeometryLevels: 4,
      maxMaterialLevels: 3,
      maxLightLevels: 3,
      maxShadowLevels: 3,
      geometryDistanceRatios: [1, 0.6, 0.3, 0.1],
      materialDistanceRatios: [1, 0.7, 0.4],
      lightDistanceRatios: [1, 0.8, 0.5],
      shadowDistanceRatios: [1, 0.7, 0.4],
      enableAutoLOD: true,
      enableDynamicLOD: true,
      performanceMode: false,
      ...config
    }
  }

  /**
   * 初始化 LOD 系统
   */
  public initialize(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    this.scene = scene
    this.camera = camera
    this.isInitialized = true

    // 监听相机移动事件
    eventSystem.on(APP_EVENTS.CAMERA_MOVED, () => {
      this.updateAllLOD()
    })

    // 监听性能模式变化事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_MODE_CHANGE, (data: any) => {
      this.config.performanceMode = data.enabled
      this.updateAllLOD()
    })

    console.log('Advanced LOD system initialized')
  }

  /**
   * 添加对象到 LOD 系统
   */
  public addObject(object: THREE.Object3D, lodData?: Partial<ObjectLODData>): string {
    if (!object) return ''

    const objectId = object.uuid || Math.random().toString(36).substr(2, 9)
    
    // 生成默认 LOD 数据
    const defaultLODData: ObjectLODData = {
      object,
      geometryLOD: this.generateGeometryLOD(object),
      materialLOD: this.generateMaterialLOD(object),
      lightLOD: this.generateLightLOD(object),
      shadowLOD: this.generateShadowLOD(object),
      currentGeometryLevel: 0,
      currentMaterialLevel: 0,
      currentLightLevel: 0,
      currentShadowLevel: 0,
      distanceToCamera: 0,
      lastUpdateTime: performance.now(),
      ...lodData
    }

    this.lodObjects.set(objectId, defaultLODData)
    return objectId
  }

  /**
   * 移除对象从 LOD 系统
   */
  public removeObject(objectId: string): void {
    this.lodObjects.delete(objectId)
  }

  /**
   * 生成几何 LOD 级别
   */
  private generateGeometryLOD(object: THREE.Object3D): GeometryLODLevel[] {
    const levels: GeometryLODLevel[] = []
    
    if (object instanceof THREE.Mesh && object.geometry) {
      const baseGeometry = object.geometry
      const baseTriangleCount = this.countTriangles(baseGeometry)
      
      for (let i = 0; i < this.config.maxGeometryLevels; i++) {
        const ratio = this.config.geometryDistanceRatios[i] || 1
        const simplifiedGeometry = this.simplifyGeometry(baseGeometry, ratio)
        const triangleCount = this.countTriangles(simplifiedGeometry)
        
        levels.push({
          level: i,
          geometry: simplifiedGeometry,
          distance: i * 10, // 基础距离，会根据实际情况调整
          triangleCount
        })
      }
    }
    
    return levels
  }

  /**
   * 生成材质 LOD 级别
   */
  private generateMaterialLOD(object: THREE.Object3D): MaterialLODLevel[] {
    const levels: MaterialLODLevel[] = []
    
    if (object instanceof THREE.Mesh && object.material) {
      const baseMaterial = object.material
      
      for (let i = 0; i < this.config.maxMaterialLevels; i++) {
        const ratio = this.config.materialDistanceRatios[i] || 1
        const simplifiedMaterial = this.simplifyMaterial(baseMaterial, ratio)
        
        levels.push({
          level: i,
          material: simplifiedMaterial,
          distance: i * 15, // 基础距离，会根据实际情况调整
          complexity: this.calculateMaterialComplexity(simplifiedMaterial)
        })
      }
    }
    
    return levels
  }

  /**
   * 生成光照 LOD 级别
   */
  private generateLightLOD(object: THREE.Object3D): LightLODLevel[] {
    const levels: LightLODLevel[] = []
    
    if (object instanceof THREE.Light) {
      const baseIntensity = object instanceof THREE.AmbientLight ? 1 : (object as any).intensity || 1
      
      for (let i = 0; i < this.config.maxLightLevels; i++) {
        const ratio = this.config.lightDistanceRatios[i] || 1
        
        levels.push({
          level: i,
          intensity: baseIntensity * ratio,
          distance: i * 20, // 基础距离，会根据实际情况调整
          shadowEnabled: i < 2, // 只有近距离启用阴影
          shadowResolution: 1024 / (i + 1) // 随距离降低阴影分辨率
        })
      }
    }
    
    return levels
  }

  /**
   * 生成阴影 LOD 级别
   */
  private generateShadowLOD(object: THREE.Object3D): ShadowLODLevel[] {
    const levels: ShadowLODLevel[] = []
    
    if (object instanceof THREE.Light && 'shadow' in object && object.shadow) {
      const baseResolution = object.shadow.mapSize.width
      
      for (let i = 0; i < this.config.maxShadowLevels; i++) {
        const ratio = this.config.shadowDistanceRatios[i] || 1
        const resolution = Math.max(512, baseResolution * ratio)
        
        levels.push({
          level: i,
          resolution,
          distance: i * 25, // 基础距离，会根据实际情况调整
          quality: 1 - (i * 0.3) // 随距离降低质量
        })
      }
    }
    
    return levels
  }

  /**
   * 简化几何体
   */
  private simplifyGeometry(geometry: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    // 这里可以使用更复杂的几何体简化算法
    // 现在使用简单的方法，实际项目中可以使用外部库如 Simplify.js
    const simplifiedGeometry = geometry.clone()
    
    // 对于演示，我们只是返回克隆的几何体
    // 实际实现中应该根据 ratio 减少顶点和面数
    return simplifiedGeometry
  }

  /**
   * 简化材质
   */
  private simplifyMaterial(material: THREE.Material, ratio: number): THREE.Material {
    if (material instanceof THREE.MeshStandardMaterial) {
      const simplifiedMaterial = material.clone() as THREE.MeshStandardMaterial
      
      // 降低材质复杂度
      simplifiedMaterial.metalness = material.metalness * ratio
      simplifiedMaterial.roughness = material.roughness * (1 - (ratio * 0.3))
      simplifiedMaterial.emissiveIntensity = material.emissiveIntensity * ratio
      
      // 禁用某些高级特性
      if (ratio < 0.5) {
        simplifiedMaterial.clearcoat = 0
        simplifiedMaterial.sheen = 0
        simplifiedMaterial.iridescence = 0
      }
      
      return simplifiedMaterial
    }
    
    return material.clone()
  }

  /**
   * 计算三角形数量
   */
  private countTriangles(geometry: THREE.BufferGeometry): number {
    if (geometry.index) {
      return geometry.index.count / 3
    } else if (geometry.attributes.position) {
      return geometry.attributes.position.count / 3
    }
    return 0
  }

  /**
   * 计算材质复杂度
   */
  private calculateMaterialComplexity(material: THREE.Material): number {
    let complexity = 1
    
    if (material instanceof THREE.MeshStandardMaterial) {
      complexity += material.metalness * 0.5
      complexity += material.roughness * 0.3
      complexity += material.clearcoat * 0.4
      complexity += material.sheen * 0.3
      complexity += material.iridescence * 0.5
    }
    
    return complexity
  }

  /**
   * 更新所有对象的 LOD
   */
  public updateAllLOD(): void {
    if (!this.isInitialized || !this.camera) return
    
    const startTime = performance.now()
    let processed = 0
    
    this.lodObjects.forEach((lodData, objectId) => {
      this.updateObjectLOD(lodData)
      processed++
    })
    
    const endTime = performance.now()
    this.performanceStats.objectsProcessed += processed
    this.performanceStats.totalLODSwitchTime += (endTime - startTime)
    this.performanceStats.averageLODSwitchTime = this.performanceStats.totalLODSwitchTime / this.performanceStats.objectsProcessed
    
    // 每100帧发送一次性能统计
    if (this.performanceStats.objectsProcessed % 100 === 0) {
      eventSystem.emit(APP_EVENTS.LOD_PERFORMANCE_UPDATE, {
        objectsProcessed: this.performanceStats.objectsProcessed,
        averageLODSwitchTime: this.performanceStats.averageLODSwitchTime,
        lodSwitches: this.performanceStats.lodSwitches
      })
    }
  }

  /**
   * 更新单个对象的 LOD
   */
  private updateObjectLOD(lodData: ObjectLODData): void {
    if (!this.camera) return
    
    // 计算对象到相机的距离
    const distance = this.calculateDistanceToCamera(lodData.object)
    lodData.distanceToCamera = distance
    
    // 更新几何 LOD
    this.updateGeometryLOD(lodData, distance)
    
    // 更新材质 LOD
    this.updateMaterialLOD(lodData, distance)
    
    // 更新光照 LOD
    this.updateLightLOD(lodData, distance)
    
    // 更新阴影 LOD
    this.updateShadowLOD(lodData, distance)
    
    lodData.lastUpdateTime = performance.now()
  }

  /**
   * 计算对象到相机的距离
   */
  private calculateDistanceToCamera(object: THREE.Object3D): number {
    if (!this.camera) return 0
    
    const boundingBox = new THREE.Box3().setFromObject(object)
    const center = new THREE.Vector3()
    boundingBox.getCenter(center)
    
    return this.camera.position.distanceTo(center)
  }

  /**
   * 更新几何 LOD
   */
  private updateGeometryLOD(lodData: ObjectLODData, distance: number): void {
    if (!(lodData.object instanceof THREE.Mesh) || lodData.geometryLOD.length === 0) return
    
    // 找到合适的 LOD 级别
    let targetLevel = 0
    
    for (let i = 0; i < lodData.geometryLOD.length; i++) {
      if (distance > lodData.geometryLOD[i].distance) {
        targetLevel = i
      } else {
        break
      }
    }
    
    // 如果级别发生变化，更新几何
    if (targetLevel !== lodData.currentGeometryLevel) {
      const newLevel = lodData.geometryLOD[targetLevel]
      lodData.object.geometry = newLevel.geometry
      lodData.currentGeometryLevel = targetLevel
      this.performanceStats.lodSwitches++
    }
  }

  /**
   * 更新材质 LOD
   */
  private updateMaterialLOD(lodData: ObjectLODData, distance: number): void {
    if (!(lodData.object instanceof THREE.Mesh) || lodData.materialLOD.length === 0) return
    
    // 找到合适的 LOD 级别
    let targetLevel = 0
    
    for (let i = 0; i < lodData.materialLOD.length; i++) {
      if (distance > lodData.materialLOD[i].distance) {
        targetLevel = i
      } else {
        break
      }
    }
    
    // 如果级别发生变化，更新材质
    if (targetLevel !== lodData.currentMaterialLevel) {
      const newLevel = lodData.materialLOD[targetLevel]
      lodData.object.material = newLevel.material
      lodData.currentMaterialLevel = targetLevel
      this.performanceStats.lodSwitches++
    }
  }

  /**
   * 更新光照 LOD
   */
  private updateLightLOD(lodData: ObjectLODData, distance: number): void {
    if (!(lodData.object instanceof THREE.Light) || !lodData.lightLOD) return
    
    // 找到合适的 LOD 级别
    let targetLevel = 0
    
    for (let i = 0; i < lodData.lightLOD.length; i++) {
      if (distance > lodData.lightLOD[i].distance) {
        targetLevel = i
      } else {
        break
      }
    }
    
    // 如果级别发生变化，更新光照
    if (targetLevel !== lodData.currentLightLevel) {
      const newLevel = lodData.lightLOD[targetLevel]
      
      if (lodData.object instanceof THREE.DirectionalLight || 
          lodData.object instanceof THREE.PointLight || 
          lodData.object instanceof THREE.SpotLight) {
        (lodData.object as any).intensity = newLevel.intensity
        
        // 更新阴影设置
        if (lodData.object.shadow) {
          lodData.object.castShadow = newLevel.shadowEnabled
        }
      }
      
      lodData.currentLightLevel = targetLevel
      this.performanceStats.lodSwitches++
    }
  }

  /**
   * 更新阴影 LOD
   */
  private updateShadowLOD(lodData: ObjectLODData, distance: number): void {
    if (!(lodData.object instanceof THREE.Light) || 
        !lodData.object.shadow || 
        !lodData.shadowLOD) return
    
    // 找到合适的 LOD 级别
    let targetLevel = 0
    
    for (let i = 0; i < lodData.shadowLOD.length; i++) {
      if (distance > lodData.shadowLOD[i].distance) {
        targetLevel = i
      } else {
        break
      }
    }
    
    // 如果级别发生变化，更新阴影
    if (targetLevel !== lodData.currentShadowLevel) {
      const newLevel = lodData.shadowLOD[targetLevel]
      
      if (lodData.object.shadow) {
        lodData.object.shadow.mapSize.width = newLevel.resolution
        lodData.object.shadow.mapSize.height = newLevel.resolution
        lodData.object.shadow.needsUpdate = true
      }
      
      lodData.currentShadowLevel = targetLevel
      this.performanceStats.lodSwitches++
    }
  }

  /**
   * 设置 LOD 配置
   */
  public setConfig(config: Partial<LODConfig>): void {
    this.config = { ...this.config, ...config }
    this.updateAllLOD()
  }

  /**
   * 获取 LOD 配置
   */
  public getConfig(): LODConfig {
    return { ...this.config }
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): any {
    return { ...this.performanceStats }
  }

  /**
   * 清理 LOD 系统
   */
  public dispose(): void {
    this.lodObjects.forEach((lodData, objectId) => {
      // 释放几何体和材质
      lodData.geometryLOD.forEach(level => {
        level.geometry.dispose()
      })
      
      lodData.materialLOD.forEach(level => {
        level.material.dispose()
      })
    })
    
    this.lodObjects.clear()
    this.isInitialized = false
  }
}

// 导出默认实例
export const advancedLODSystem = new AdvancedLODSystem()

// 导出便捷函数
export const initializeLODSystem = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
  advancedLODSystem.initialize(scene, camera)
}

export const addObjectToLOD = (object: THREE.Object3D) => {
  return advancedLODSystem.addObject(object)
}

export const removeObjectFromLOD = (objectId: string) => {
  advancedLODSystem.removeObject(objectId)
}

export const updateLODSystem = () => {
  advancedLODSystem.updateAllLOD()
}

export const setLODConfig = (config: Partial<LODConfig>) => {
  advancedLODSystem.setConfig(config)
}