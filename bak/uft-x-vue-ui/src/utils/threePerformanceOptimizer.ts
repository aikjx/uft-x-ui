import * as THREE from 'three'

export class ThreePerformanceOptimizer {
  private scene: THREE.Scene | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private stats: {
    drawCalls: number
    triangles: number
    textures: number
    geometries: number
    materials: number
  } = {
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    geometries: 0,
    materials: 0
  }

  private optimizationStrategies = {
    lodEnabled: true,
    objectPooling: true,
    textureCompression: true,
    geometryMerge: true,
    frustumCulling: true,
    occlusionCulling: false
  }

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene
    this.renderer = renderer
    this.initOptimizations()
  }

  /**
   * 初始化性能优化策略
   */
  private initOptimizations(): void {
    if (this.renderer) {
      // 启用WebGL优化
      this.renderer.autoClear = false
      this.renderer.sortObjects = true
      
      // 启用深度测试和剔除
      const context = this.renderer.getContext()
      context.enable(context.DEPTH_TEST)
      context.enable(context.CULL_FACE)
    }

    // 初始化LOD系统
    if (this.optimizationStrategies.lodEnabled) {
      this.initLODSystem()
    }

    // 初始化对象池
    if (this.optimizationStrategies.objectPooling) {
      this.initObjectPool()
    }
  }

  /**
   * 创建LOD(细节层次)系统
   */
  private initLODSystem(): void {
    // LOD距离阈值配置
    const lodConfig = {
      high: 50,    // 高细节距离 (50单位内)
      medium: 100, // 中等细节距离 (50-100单位)
      low: 200     // 低细节距离 (100-200单位)
    }

    // 为场景中的对象添加LOD
    this.scene?.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry) {
        this.applyLODToMesh(object, lodConfig)
      }
    })
  }

  /**
   * 为网格应用LOD
   */
  private applyLODToMesh(mesh: THREE.Mesh, lodConfig: any): void {
    const geometry = mesh.geometry
    
    // 创建不同细节级别的几何体
    const highDetail = geometry.clone()
    const mediumDetail = this.createSimplifiedGeometry(geometry, 0.7)
    const lowDetail = this.createSimplifiedGeometry(geometry, 0.4)

    // 创建LOD对象
    const lod = new THREE.LOD()
    
    lod.addLevel(highDetail, 0)           // 高细节 (0-50单位)
    lod.addLevel(mediumDetail, lodConfig.high)  // 中等细节 (50-100单位)
    lod.addLevel(lowDetail, lodConfig.medium)   // 低细节 (100-200单位)

    // 替换原始网格
    mesh.parent?.remove(mesh)
    mesh.parent?.add(lod)
  }

  /**
   * 创建简化几何体
   */
  private createSimplifiedGeometry(geometry: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    // 这里可以使用更复杂的几何体简化算法
    // 目前返回原始几何体，实际项目应使用MeshSimplifier等库
    return geometry.clone()
  }

  /**
   * 初始化对象池系统
   */
  private initObjectPool(): void {
    // 对象池管理
    this.objectPool = {
      meshes: new Map(),
      geometries: new Map(),
      materials: new Map(),
      textures: new Map()
    }
  }

  private objectPool: {
    meshes: Map<string, THREE.Mesh[]>
    geometries: Map<string, THREE.BufferGeometry[]>
    materials: Map<string, THREE.Material[]>
    textures: Map<string, THREE.Texture[]>
  } = {
    meshes: new Map(),
    geometries: new Map(),
    materials: new Map(),
    textures: new Map()
  }

  /**
   * 从对象池获取网格
   */
  getMeshFromPool(type: string, geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const pool = this.objectPool.meshes.get(type)
    
    if (pool && pool.length > 0) {
      const mesh = pool.pop()!
      mesh.geometry = geometry
      mesh.material = material
      mesh.visible = true
      return mesh
    }

    // 池中没有可用对象，创建新对象
    const mesh = new THREE.Mesh(geometry, material)
    
    // 将对象添加到池中以便后续重用
    this.addToPool('meshes', type, mesh)
    
    return mesh
  }

  /**
   * 将对象返回到池中
   */
  returnMeshToPool(type: string, mesh: THREE.Mesh): void {
    mesh.visible = false
    this.addToPool('meshes', type, mesh)
  }

  /**
   * 添加对象到池
   */
  private addToPool(category: keyof typeof this.objectPool, type: string, obj: any): void {
    const pool = this.objectPool[category].get(type) || []
    pool.push(obj)
    this.objectPool[category].set(type, pool)
  }

  /**
   * 合并几何体以减少绘制调用
   */
  mergeGeometries(meshes: THREE.Mesh[]): THREE.Mesh {
    if (meshes.length === 0) {
      throw new Error('无法合并空网格数组')
    }

    // 检查材质是否相同
    const firstMaterial = meshes[0].material
    const sameMaterial = meshes.every(mesh => mesh.material === firstMaterial)

    if (!sameMaterial) {
      console.warn('网格材质不同，合并可能影响渲染效果')
    }

    // 合并几何体
    const geometries: THREE.BufferGeometry[] = []
    
    meshes.forEach(mesh => {
      if (mesh.geometry) {
        geometries.push(mesh.geometry)
      }
    })

    const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries)
    
    return new THREE.Mesh(mergedGeometry, firstMaterial)
  }

  /**
   * 纹理压缩和优化
   */
  optimizeTexture(texture: THREE.Texture): THREE.Texture {
    // 设置纹理压缩参数
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipMapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    
    // 压缩纹理质量
    if (this.renderer) {
      this.renderer.compressedTextureExtension = true
    }

    return texture
  }

  /**
   * 动态细节调整
   */
  adjustDetailLevel(cameraPosition: THREE.Vector3, targetFPS: number = 60): void {
    if (!this.scene) return

    const currentFPS = this.getCurrentFPS()
    
    // 根据FPS调整细节级别
    if (currentFPS < targetFPS * 0.7) {
      // FPS过低，降低细节
      this.reduceDetailLevel(cameraPosition)
    } else if (currentFPS > targetFPS * 0.9) {
      // FPS足够，提高细节
      this.increaseDetailLevel(cameraPosition)
    }
  }

  /**
   * 降低细节级别
   */
  private reduceDetailLevel(cameraPosition: THREE.Vector3): void {
    this.scene?.traverse((object) => {
      if (object instanceof THREE.LOD) {
        // 强制使用更低的LOD级别
        object.levels.forEach((level, index) => {
          if (index > 0) {
            level.object.visible = true
          }
        })
      }
    })
  }

  /**
   * 提高细节级别
   */
  private increaseDetailLevel(cameraPosition: THREE.Vector3): void {
    this.scene?.traverse((object) => {
      if (object instanceof THREE.LOD) {
        // 使用更高的LOD级别
        object.levels.forEach((level, index) => {
          if (index === 0) {
            level.object.visible = true
          }
        })
      }
    })
  }

  /**
   * 获取当前FPS
   */
  private getCurrentFPS(): number {
    // 这里可以集成到性能监控系统
    return 60 // 模拟值
  }

  /**
   * 性能统计
   */
  getPerformanceStats(): typeof this.stats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 更新性能统计
   */
  private updateStats(): void {
    if (!this.scene) return

    let drawCalls = 0
    let triangles = 0
    let textures = 0
    let geometries = 0
    let materials = 0

    const textureSet = new Set()
    const geometrySet = new Set()
    const materialSet = new Set()

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        drawCalls++
        
        if (object.geometry) {
          geometries++
          geometrySet.add(object.geometry.uuid)
          
          // 估算三角形数量
          if (object.geometry.index) {
            triangles += object.geometry.index.count / 3
          } else if (object.geometry.attributes.position) {
            triangles += object.geometry.attributes.position.count / 3
          }
        }

        if (object.material) {
          materials++
          materialSet.add(object.material.uuid)
          
          // 统计纹理
          const material = object.material
          if (material.map) textureSet.add(material.map.uuid)
          if (material.normalMap) textureSet.add(material.normalMap.uuid)
          if (material.roughnessMap) textureSet.add(material.roughnessMap.uuid)
          if (material.metalnessMap) textureSet.add(material.metalnessMap.uuid)
        }
      }
    })

    this.stats = {
      drawCalls,
      triangles,
      textures: textureSet.size,
      geometries: geometrySet.size,
      materials: materialSet.size
    }
  }

  /**
   * 清理和资源释放
   */
  cleanup(): void {
    // 清理对象池
    this.objectPool.meshes.clear()
    this.objectPool.geometries.clear()
    this.objectPool.materials.clear()
    this.objectPool.textures.clear()

    // 释放资源
    this.scene?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      }
    })

    this.scene = null
    this.renderer = null
  }
}

// 导出工具函数
export const ThreeOptimizationUtils = {
  /**
   * 创建实例化网格以提高性能
   */
  createInstancedMesh(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
    
    // 设置实例化矩阵
    const matrix = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      matrix.setPosition(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50)
      instancedMesh.setMatrixAt(i, matrix)
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true
    return instancedMesh
  },

  /**
   * 批量创建几何体
   */
  batchCreateGeometries(config: {
    type: 'box' | 'sphere' | 'cylinder'
    count: number
    size?: number
  }): THREE.BufferGeometry[] {
    const geometries: THREE.BufferGeometry[] = []
    
    for (let i = 0; i < config.count; i++) {
      let geometry: THREE.BufferGeometry
      
      switch (config.type) {
        case 'box':
          geometry = new THREE.BoxGeometry(config.size || 1, config.size || 1, config.size || 1)
          break
        case 'sphere':
          geometry = new THREE.SphereGeometry(config.size || 1, 32, 32)
          break
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(config.size || 1, config.size || 1, config.size || 2)
          break
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1)
      }
      
      geometries.push(geometry)
    }
    
    return geometries
  },

  /**
   * 内存使用监控
   */
  getMemoryUsage(): { geometries: number; textures: number; total: number } {
    let geometriesMemory = 0
    let texturesMemory = 0

    // 这里可以添加更精确的内存计算逻辑
    // 目前返回估算值
    
    return {
      geometries: geometriesMemory,
      textures: texturesMemory,
      total: geometriesMemory + texturesMemory
    }
  }
}