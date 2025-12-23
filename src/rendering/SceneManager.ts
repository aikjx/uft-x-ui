import * as THREE from 'three'
import { VISUALIZATION_CONFIG } from '../constants'

/**
 * 场景管理器配置接口
 */
export interface SceneManagerConfig {
  /** 是否自动更新场景 */
  autoUpdate?: boolean
  /** 场景背景颜色 */
  backgroundColor?: THREE.Color
  /** 是否启用矩阵自动更新 */
  enableMatrixAutoUpdate?: boolean
  /** 场景雾效配置 */
  fog?: THREE.Fog | THREE.FogExp2 | null
  /** 是否启用阴影 */
  enableShadows?: boolean
}

/**
 * 场景管理器 - 负责Three.js场景的创建、管理和优化
 */
export class SceneManager {
  private scene: THREE.Scene
  private config: SceneManagerConfig

  /**
   * 构造函数
   * @param config 场景管理器配置
   */
  constructor(config: SceneManagerConfig = {}) {
    try {
      // 合并默认配置和用户配置，确保类型安全
      this.config = {
        autoUpdate: true,
        backgroundColor: new THREE.Color(VISUALIZATION_CONFIG.backgroundColor),
        enableMatrixAutoUpdate: false,
        enableShadows: false,
        fog: null,
        ...config
      }

      this.scene = this.createScene()
    } catch (error) {
      console.error('🚨 SceneManager: Failed to initialize scene manager:', error)
      // 创建一个默认场景，确保实例仍然可用（优雅降级）
      this.config = {
        autoUpdate: true,
        backgroundColor: new THREE.Color(0x000000),
        enableMatrixAutoUpdate: false,
        enableShadows: false,
        fog: null
      }
      this.scene = new THREE.Scene()
      // 添加调试标记
      this.scene.userData = { isFallbackScene: true }
    }
  }

  /**
   * 创建并配置场景
   * @returns 配置好的Three.js场景
   */
  private createScene(): THREE.Scene {
    try {
      const scene = new THREE.Scene()

      // 配置场景基本属性
      ;(scene as any).autoUpdate = this.config.autoUpdate
      scene.background = this.config.backgroundColor || null
      scene.matrixAutoUpdate = this.config.enableMatrixAutoUpdate || false

      // 配置雾效
      if (this.config.fog) {
        scene.fog = this.config.fog
      }

      // 配置阴影
      if (this.config.enableShadows) {
        scene.shadowMap.enabled = true
        scene.shadowMap.type = THREE.PCFSoftShadowMap // 软阴影，视觉效果更好
      }

      // 添加调试信息
      if (import.meta.env.DEV) {
        console.log('✅ SceneManager: Scene created successfully with config:', {
          autoUpdate: this.config.autoUpdate,
          hasBackground: !!this.config.backgroundColor,
          enableMatrixAutoUpdate: this.config.enableMatrixAutoUpdate,
          hasFog: !!this.config.fog,
          enableShadows: this.config.enableShadows
        })
      }

      return scene
    } catch (error) {
      console.error('🚨 SceneManager: Failed to create scene:', error)
      // 返回一个默认场景，确保方法不会失败（优雅降级）
      const fallbackScene = new THREE.Scene()
      fallbackScene.userData = { isFallbackScene: true }
      return fallbackScene
    }
  }

  /**
   * 获取场景实例
   * @returns Three.js场景实例
   */
  getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * 获取当前场景配置
   * @returns 当前场景配置的只读副本
   */
  getConfig(): Readonly<SceneManagerConfig> {
    return { ...this.config }
  }

  /**
   * 更新场景配置
   * @param newConfig 新的场景配置
   */
  updateConfig(newConfig: Partial<SceneManagerConfig>): void {
    try {
      this.config = { ...this.config, ...newConfig }

      // 重新应用配置到场景
      if (this.config.fog !== undefined) {
        this.scene.fog = this.config.fog
      }

      if (this.config.backgroundColor !== undefined) {
        this.scene.background = this.config.backgroundColor
      }

      if (this.config.enableShadows !== undefined) {
        this.scene.shadowMap.enabled = this.config.enableShadows
        if (this.config.enableShadows) {
          this.scene.shadowMap.type = THREE.PCFSoftShadowMap
        }
      }

      if (import.meta.env.DEV) {
        console.log('🔄 SceneManager: Scene config updated successfully')
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to update scene config:', error)
    }
  }

  /**
   * 添加对象到场景
   * @param object 要添加的Three.js对象
   * @param parent 可选的父对象，如果不提供则直接添加到场景根节点
   */
  addObject(object: THREE.Object3D, parent?: THREE.Object3D): void {
    try {
      // 严格的输入验证
      if (!object || !(object instanceof THREE.Object3D)) {
        throw new TypeError('Invalid object: must be a valid THREE.Object3D instance')
      }

      // 确定父对象
      const targetParent = parent || this.scene

      // 优化：直接添加对象，避免O(n)的includes检查
      // THREE.Object3D.add() 方法内部会处理重复添加的情况
      targetParent.add(object)

      if (import.meta.env.DEV) {
        console.log('➕ SceneManager: Object added successfully:', {
          objectName: object.name || 'unnamed',
          objectType: object.type,
          parentName: targetParent.name || (targetParent === this.scene ? 'scene' : 'unnamed')
        })
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to add object to scene:', error)
      // 可以选择重新抛出异常，让调用者处理
      // throw error;
    }
  }

  /**
   * 从场景移除对象
   * @param object 要移除的Three.js对象
   */
  removeObject(object: THREE.Object3D): void {
    try {
      // 严格的输入验证
      if (!object || !(object instanceof THREE.Object3D)) {
        throw new TypeError('Invalid object: must be a valid THREE.Object3D instance')
      }

      // 优化：直接移除对象，避免O(n)的includes检查
      // THREE.Scene.remove() 方法内部会处理不存在的情况
      this.scene.remove(object)

      if (import.meta.env.DEV) {
        console.log('➖ SceneManager: Object removed successfully:', {
          objectName: object.name || 'unnamed',
          objectType: object.type
        })
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to remove object from scene:', error)
    }
  }

  /**
   * 批量添加对象到场景
   * @param objects 要添加的Three.js对象数组
   * @param parent 可选的父对象，如果不提供则直接添加到场景根节点
   */
  addObjects(objects: THREE.Object3D[], parent?: THREE.Object3D): void {
    try {
      // 输入验证
      if (!Array.isArray(objects)) {
        throw new TypeError('Invalid objects: must be an array of THREE.Object3D instances')
      }

      // 批量添加，减少日志输出
      for (const object of objects) {
        if (object && object instanceof THREE.Object3D) {
          const targetParent = parent || this.scene
          targetParent.add(object)
        }
      }

      if (import.meta.env.DEV) {
        console.log('📦 SceneManager: Batch added objects:', objects.length)
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to batch add objects:', error)
    }
  }

  /**
   * 批量从场景移除对象
   * @param objects 要移除的Three.js对象数组
   */
  removeObjects(objects: THREE.Object3D[]): void {
    try {
      // 输入验证
      if (!Array.isArray(objects)) {
        throw new TypeError('Invalid objects: must be an array of THREE.Object3D instances')
      }

      // 批量移除，减少日志输出
      for (const object of objects) {
        if (object && object instanceof THREE.Object3D) {
          this.scene.remove(object)
        }
      }

      if (import.meta.env.DEV) {
        console.log('📤 SceneManager: Batch removed objects:', objects.length)
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to batch remove objects:', error)
    }
  }

  /**
   * 清理场景
   * @param disposeResources 是否释放资源，默认为true
   */
  clear(disposeResources: boolean = true): void {
    try {
      // 优化：直接获取children数组的副本，避免for...of循环中的性能问题
      const children = [...this.scene.children]

      // 统计信息，用于调试
      const initialCount = children.length
      let disposedCount = 0

      for (const child of children) {
        // 从场景中移除对象
        this.scene.remove(child)

        // 释放资源（如果需要）
        if (disposeResources) {
          this.disposeObject(child)
          disposedCount++
        }
      }

      if (import.meta.env.DEV) {
        console.log('🗑️ SceneManager: Scene cleared successfully:', {
          totalObjects: initialCount,
          disposedObjects: disposedCount,
          disposedResources: disposeResources
        })
      }
    } catch (error) {
      console.error('🚨 SceneManager: Failed to clear scene:', error)
    }
  }

  /**
   * 递归释放对象资源
   */
  private disposeObject(object: THREE.Object3D): void {
    try {
      // 优化：先处理子对象，再处理当前对象
      // 遍历子对象，使用for循环替代递归，避免栈溢出
      const objectsToDispose: THREE.Object3D[] = [object]

      while (objectsToDispose.length > 0) {
        const currentObject = objectsToDispose.pop()!

        // 先将子对象添加到处理队列
        for (let i = currentObject.children.length - 1; i >= 0; i--) {
          objectsToDispose.push(currentObject.children[i])
        }

        // 处理当前对象
        if (
          currentObject instanceof THREE.Mesh ||
          currentObject instanceof THREE.Line ||
          currentObject instanceof THREE.Points
        ) {
          // 释放几何体
          if (currentObject.geometry) {
            currentObject.geometry.dispose()
          }

          // 释放材质
          if (Array.isArray(currentObject.material)) {
            currentObject.material.forEach(material => this.disposeMaterial(material))
          } else if (currentObject.material) {
            this.disposeMaterial(currentObject.material)
          }
        }

        // 处理骨骼网格
        if (currentObject instanceof THREE.SkinnedMesh) {
          if (currentObject.skeleton) {
            currentObject.skeleton.dispose()
          }
        }
      }
    } catch (error) {
      console.error('SceneManager: Failed to dispose object:', error)
    }
  }

  /**
   * 释放材质资源
   */
  private disposeMaterial(material: THREE.Material): void {
    try {
      // 优化：处理更多材质属性，确保资源完全释放
      const typedMaterial = material as any

      // 基础贴图
      if (typedMaterial.map) {
        typedMaterial.map.dispose()
        typedMaterial.map = null
      }
      if (typedMaterial.lightMap) {
        typedMaterial.lightMap.dispose()
        typedMaterial.lightMap = null
      }
      if (typedMaterial.normalMap) {
        typedMaterial.normalMap.dispose()
        typedMaterial.normalMap = null
      }
      if (typedMaterial.specularMap) {
        typedMaterial.specularMap.dispose()
        typedMaterial.specularMap = null
      }
      if (typedMaterial.envMap) {
        typedMaterial.envMap.dispose()
        typedMaterial.envMap = null
      }

      // 高级贴图
      if (typedMaterial.aoMap) {
        typedMaterial.aoMap.dispose()
        typedMaterial.aoMap = null
      }
      if (typedMaterial.displacementMap) {
        typedMaterial.displacementMap.dispose()
        typedMaterial.displacementMap = null
      }
      if (typedMaterial.roughnessMap) {
        typedMaterial.roughnessMap.dispose()
        typedMaterial.roughnessMap = null
      }
      if (typedMaterial.metalnessMap) {
        typedMaterial.metalnessMap.dispose()
        typedMaterial.metalnessMap = null
      }
      if (typedMaterial.alphaMap) {
        typedMaterial.alphaMap.dispose()
        typedMaterial.alphaMap = null
      }
      if (typedMaterial.emissiveMap) {
        typedMaterial.emissiveMap.dispose()
        typedMaterial.emissiveMap = null
      }
      if (typedMaterial.bumpMap) {
        typedMaterial.bumpMap.dispose()
        typedMaterial.bumpMap = null
      }
      if (typedMaterial.gradientMap) {
        typedMaterial.gradientMap.dispose()
        typedMaterial.gradientMap = null
      }

      // 释放材质
      material.dispose()
    } catch (error) {
      console.error('SceneManager: Failed to dispose material:', error)
    }
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    try {
      // 输入验证
      if (typeof deltaTime !== 'number' || isNaN(deltaTime) || deltaTime < 0) {
        console.warn('SceneManager: Invalid deltaTime provided:', deltaTime)
        deltaTime = 0
      }

      // 执行用户定义的更新函数
      if (this.scene.userData && typeof this.scene.userData.update === 'function') {
        this.scene.userData.update(deltaTime)
      }
    } catch (error) {
      console.error('SceneManager: Failed to update scene:', error)
    }
  }

  /**
   * 设置场景更新函数
   */
  setUpdateFunction(updateFn: (deltaTime: number) => void): void {
    try {
      // 输入验证
      if (typeof updateFn !== 'function') {
        throw new Error('Invalid update function: must be a function')
      }

      if (!this.scene.userData) {
        this.scene.userData = {}
      }
      this.scene.userData.update = updateFn
    } catch (error) {
      console.error('SceneManager: Failed to set update function:', error)
    }
  }

  /**
   * 重置场景
   */
  reset(): void {
    try {
      this.clear()
      this.scene = this.createScene()
    } catch (error) {
      console.error('SceneManager: Failed to reset scene:', error)
    }
  }
}
