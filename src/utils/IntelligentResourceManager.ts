/**
 * 智能资源管理系统
 * 用于优化内存使用和资源加载/卸载
 */

import * as THREE from 'three'
import { eventSystem, APP_EVENTS } from './eventSystem'

// 定义资源类型枚举
export enum ResourceType {
  TEXTURE = 'texture',
  GEOMETRY = 'geometry',
  MATERIAL = 'material',
  MESH = 'mesh',
  SHADER = 'shader',
  AUDIO = 'audio',
  ANIMATION = 'animation',
  OTHER = 'other'
}

// 定义资源优先级枚举
export enum ResourcePriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

// 定义资源状态枚举
export enum ResourceState {
  LOADING = 'loading',
  LOADED = 'loaded',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNLOADING = 'unloading',
  UNLOADED = 'unloaded',
  ERROR = 'error'
}

// 定义资源接口
export interface Resource {
  id: string
  type: ResourceType
  name: string
  data: any
  size: number
  priority: ResourcePriority
  state: ResourceState
  lastAccessTime: number
  usageCount: number
  dependencies: string[]
  metadata: Record<string, any>
}

// 定义资源加载选项接口
export interface ResourceLoadOptions {
  priority?: ResourcePriority
  preload?: boolean
  compress?: boolean
  cache?: boolean
  dependencies?: string[]
  metadata?: Record<string, any>
}

// 定义内存限制接口
export interface MemoryLimits {
  total: number
  textures: number
  geometries: number
  materials: number
  other: number
}

// 定义资源统计接口
export interface ResourceStats {
  totalResources: number
  totalSize: number
  sizeByType: Record<ResourceType, number>
  countByType: Record<ResourceType, number>
  countByState: Record<ResourceState, number>
  memoryUsage: number
  memoryLimit: number
  compressionRatio: number
}

/**
 * 智能资源管理系统
 */
export class IntelligentResourceManager {
  private resources: Map<string, Resource> = new Map()
  private resourceCache: Map<string, Resource> = new Map()
  private memoryLimits: MemoryLimits
  private memoryUsage: number = 0
  private compressionRatio: number = 1.0
  private isInitialized: boolean = false
  private cleanupInterval: NodeJS.Timeout | null = null
  private resourceLoaders: Record<ResourceType, any> = {}

  constructor(memoryLimits?: Partial<MemoryLimits>) {
    this.memoryLimits = {
      total: memoryLimits?.total || 512 * 1024 * 1024, // 默认512MB
      textures: memoryLimits?.textures || 256 * 1024 * 1024, // 默认256MB
      geometries: memoryLimits?.geometries || 128 * 1024 * 1024, // 默认128MB
      materials: memoryLimits?.materials || 64 * 1024 * 1024, // 默认64MB
      other: memoryLimits?.other || 64 * 1024 * 1024, // 默认64MB
    }

    this.initializeResourceLoaders()
    this.startCleanupInterval()
    this.isInitialized = true

    console.log('Intelligent Resource Manager initialized')
  }

  /**
   * 初始化资源加载器
   */
  private initializeResourceLoaders(): void {
    // 纹理加载器
    this.resourceLoaders[ResourceType.TEXTURE] = new THREE.TextureLoader()

    // 立方体贴图加载器
    this.resourceLoaders[ResourceType.TEXTURE] = new THREE.CubeTextureLoader()

    // OBJ加载器
    try {
      const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js')
      this.resourceLoaders[ResourceType.MESH] = new OBJLoader()
    } catch (error) {
      console.warn('OBJLoader not available:', error)
    }

    // GLTF加载器
    try {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')
      this.resourceLoaders[ResourceType.MESH] = new GLTFLoader()
    } catch (error) {
      console.warn('GLTFLoader not available:', error)
    }
  }

  /**
   * 启动资源清理定时器
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performResourceCleanup()
    }, 30000) // 每30秒执行一次清理
  }

  /**
   * 执行资源清理
   */
  private performResourceCleanup(): void {
    if (!this.isInitialized) return

    const now = Date.now()
    const inactiveResources: Resource[] = []

    // 收集不活跃的资源
    this.resources.forEach((resource) => {
      if (resource.state === ResourceState.INACTIVE) {
        inactiveResources.push(resource)
      }
    })

    // 按最后访问时间排序（最久未使用的排在前面）
    inactiveResources.sort((a, b) => a.lastAccessTime - b.lastAccessTime)

    // 计算需要释放的内存
    const memoryUsage = this.getMemoryUsage()
    const memoryLimit = this.memoryLimits.total
    const memoryToFree = Math.max(0, memoryUsage - memoryLimit * 0.8) // 保持在内存限制的80%以下

    if (memoryToFree > 0) {
      let freedMemory = 0

      for (const resource of inactiveResources) {
        if (freedMemory >= memoryToFree) break

        this.unloadResource(resource.id)
        freedMemory += resource.size
      }

      if (freedMemory > 0) {
        console.log(`Resource cleanup: Freed ${(freedMemory / (1024 * 1024)).toFixed(2)}MB of memory`)
        eventSystem.emit(APP_EVENTS.RESOURCE_CLEANUP, {
          freedMemory,
          remainingMemory: memoryUsage - freedMemory
        })
      }
    }
  }

  /**
   * 添加资源
   */
  public addResource(
    id: string,
    type: ResourceType,
    name: string,
    data: any,
    size: number,
    options: ResourceLoadOptions = {}
  ): Resource {
    const resource: Resource = {
      id,
      type,
      name,
      data,
      size,
      priority: options.priority || ResourcePriority.MEDIUM,
      state: ResourceState.LOADED,
      lastAccessTime: Date.now(),
      usageCount: 0,
      dependencies: options.dependencies || [],
      metadata: options.metadata || {}
    }

    this.resources.set(id, resource)
    this.memoryUsage += size

    // 触发资源添加事件
    eventSystem.emit(APP_EVENTS.RESOURCE_ADDED, resource)

    return resource
  }

  /**
   * 加载资源
   */
  public async loadResource(
    id: string,
    type: ResourceType,
    name: string,
    url: string,
    options: ResourceLoadOptions = {}
  ): Promise<Resource> {
    // 检查资源是否已存在
    if (this.resources.has(id)) {
      const resource = this.resources.get(id)!
      resource.lastAccessTime = Date.now()
      resource.usageCount++
      resource.state = ResourceState.ACTIVE
      return resource
    }

    // 检查缓存
    if (this.resourceCache.has(id)) {
      const cachedResource = this.resourceCache.get(id)!
      this.resources.set(id, cachedResource)
      this.resourceCache.delete(id)
      this.memoryUsage += cachedResource.size
      cachedResource.state = ResourceState.ACTIVE
      cachedResource.lastAccessTime = Date.now()
      return cachedResource
    }

    // 创建资源对象
    const resource: Resource = {
      id,
      type,
      name,
      data: null,
      size: 0,
      priority: options.priority || ResourcePriority.MEDIUM,
      state: ResourceState.LOADING,
      lastAccessTime: Date.now(),
      usageCount: 0,
      dependencies: options.dependencies || [],
      metadata: options.metadata || {}
    }

    this.resources.set(id, resource)

    // 触发资源加载开始事件
    eventSystem.emit(APP_EVENTS.RESOURCE_LOADING, resource)

    try {
      // 根据资源类型选择加载器
      let loader: any = this.resourceLoaders[type]

      if (!loader) {
        switch (type) {
          case ResourceType.TEXTURE:
            loader = new THREE.TextureLoader()
            break
          case ResourceType.GEOMETRY:
            loader = new THREE.BufferGeometryLoader()
            break
          case ResourceType.MATERIAL:
            loader = new THREE.MaterialLoader()
            break
          default:
            throw new Error(`No loader available for resource type: ${type}`)
        }
      }

      // 加载资源
      const data = await new Promise<any>((resolve, reject) => {
        if (loader.loadAsync) {
          loader.loadAsync(url).then(resolve).catch(reject)
        } else {
          loader.load(
            url,
            resolve,
            undefined,
            reject
          )
        }
      })

      // 计算资源大小
      let resourceSize = this.calculateResourceSize(data, type)
      let optimizedData = data

      // 应用压缩
      if (options.compress) {
        const compressedData = this.compressResource(data, type)
        if (compressedData) {
          optimizedData = compressedData
          resourceSize *= 0.7 // 假设压缩率为30%
        }
      }

      // 更新资源信息
      resource.data = optimizedData
      resource.size = resourceSize
      resource.state = ResourceState.LOADED
      this.memoryUsage += resourceSize

      // 触发资源加载完成事件
      eventSystem.emit(APP_EVENTS.RESOURCE_LOADED, resource)

      return resource
    } catch (error) {
      resource.state = ResourceState.ERROR
      resource.metadata.error = error.message

      // 触发资源加载错误事件
      eventSystem.emit(APP_EVENTS.RESOURCE_ERROR, {
        resource,
        error
      })

      throw error
    }
  }

  /**
   * 获取资源
   */
  public getResource(id: string): Resource | null {
    const resource = this.resources.get(id)

    if (resource) {
      resource.lastAccessTime = Date.now()
      resource.usageCount++
      resource.state = ResourceState.ACTIVE
    }

    return resource || null
  }

  /**
   * 卸载资源
   */
  public unloadResource(id: string): boolean {
    const resource = this.resources.get(id)

    if (!resource) {
      return false
    }

    // 检查是否有依赖
    if (resource.dependencies.length > 0) {
      for (const depId of resource.dependencies) {
        if (this.resources.has(depId)) {
          return false
        }
      }
    }

    // 释放资源
    this.releaseResourceData(resource)

    // 移至缓存
    resource.state = ResourceState.UNLOADED
    this.resourceCache.set(id, resource)
    this.resources.delete(id)
    this.memoryUsage -= resource.size

    // 触发资源卸载事件
    eventSystem.emit(APP_EVENTS.RESOURCE_UNLOADED, resource)

    return true
  }

  /**
   * 释放资源数据
   */
  private releaseResourceData(resource: Resource): void {
    const { data, type } = resource

    if (!data) return

    switch (type) {
      case ResourceType.TEXTURE:
        if (data.dispose) data.dispose()
        break
      case ResourceType.GEOMETRY:
        if (data.dispose) data.dispose()
        break
      case ResourceType.MATERIAL:
        if (data.dispose) data.dispose()
        break
      case ResourceType.SHADER:
        if (data.dispose) data.dispose()
        break
      case ResourceType.MESH:
        if (data.geometry?.dispose) data.geometry.dispose()
        if (data.material?.dispose) data.material.dispose()
        break
    }

    resource.data = null
  }

  /**
   * 计算资源大小
   */
  private calculateResourceSize(data: any, type: ResourceType): number {
    switch (type) {
      case ResourceType.TEXTURE:
        if (data.image) {
          return data.image.width * data.image.height * 4 // 假设RGBA 8位
        }
        return 0
      case ResourceType.GEOMETRY:
        if (data.attributes) {
          let size = 0
          for (const attribute in data.attributes) {
            const attr = data.attributes[attribute]
            if (attr.array) {
              size += attr.array.byteLength
            }
          }
          return size
        }
        return 0
      case ResourceType.MATERIAL:
        return 1024 // 估算材质大小
      case ResourceType.MESH:
        let meshSize = 0
        if (data.geometry) meshSize += this.calculateResourceSize(data.geometry, ResourceType.GEOMETRY)
        if (data.material) meshSize += this.calculateResourceSize(data.material, ResourceType.MATERIAL)
        return meshSize
      default:
        return 1024 // 估算其他资源大小
    }
  }

  /**
   * 压缩资源
   */
  private compressResource(data: any, type: ResourceType): any {
    // 这里可以实现具体的资源压缩算法
    // 目前返回原始数据
    return data
  }

  /**
   * 获取内存使用情况
   */
  public getMemoryUsage(): number {
    return this.memoryUsage
  }

  /**
   * 获取内存限制
   */
  public getMemoryLimits(): MemoryLimits {
    return { ...this.memoryLimits }
  }

  /**
   * 设置内存限制
   */
  public setMemoryLimits(limits: Partial<MemoryLimits>): void {
    this.memoryLimits = { ...this.memoryLimits, ...limits }
  }

  /**
   * 获取资源统计信息
   */
  public getStats(): ResourceStats {
    const stats: ResourceStats = {
      totalResources: this.resources.size,
      totalSize: this.memoryUsage,
      sizeByType: {} as Record<ResourceType, number>,
      countByType: {} as Record<ResourceType, number>,
      countByState: {} as Record<ResourceState, number>,
      memoryUsage: this.memoryUsage,
      memoryLimit: this.memoryLimits.total,
      compressionRatio: this.compressionRatio
    }

    // 初始化统计对象
    Object.values(ResourceType).forEach(type => {
      stats.sizeByType[type] = 0
      stats.countByType[type] = 0
    })

    Object.values(ResourceState).forEach(state => {
      stats.countByState[state] = 0
    })

    // 计算统计数据
    this.resources.forEach(resource => {
      stats.sizeByType[resource.type] += resource.size
      stats.countByType[resource.type]++
      stats.countByState[resource.state]++
    })

    return stats
  }

  /**
   * 清理所有资源
   */
  public cleanup(): void {
    // 停止清理定时器
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // 释放所有资源
    this.resources.forEach((resource) => {
      this.releaseResourceData(resource)
    })

    this.resourceCache.forEach((resource) => {
      this.releaseResourceData(resource)
    })

    // 清空资源和缓存
    this.resources.clear()
    this.resourceCache.clear()
    this.memoryUsage = 0

    // 触发清理事件
    eventSystem.emit(APP_EVENTS.RESOURCE_MANAGER_CLEANUP)
  }

  /**
   * 暂停资源管理器
   */
  public pause(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * 恢复资源管理器
   */
  public resume(): void {
    if (!this.cleanupInterval) {
      this.startCleanupInterval()
    }
  }

  /**
   * 预加载资源
   */
  public async preloadResources(resources: Array<{
    id: string
    type: ResourceType
    name: string
    url: string
    options: ResourceLoadOptions
  }>): Promise<void> {
    // 按优先级排序
    resources.sort((a, b) => {
      const priorityA = a.options.priority || ResourcePriority.MEDIUM
      const priorityB = b.options.priority || ResourcePriority.MEDIUM
      return priorityB - priorityA
    })

    // 批量加载
    const loadPromises = resources.map(resource => 
      this.loadResource(resource.id, resource.type, resource.name, resource.url, resource.options)
    )

    await Promise.all(loadPromises)
  }

  /**
   * 获取资源使用情况
   */
  public getResourceUsage(): Record<string, number> {
    const usage: Record<string, number> = {}
    this.resources.forEach((resource) => {
      usage[resource.id] = resource.usageCount
    })
    return usage
  }

  /**
   * 优化资源
   */
  public optimizeResources(): void {
    const stats = this.getStats()
    
    // 检查内存使用情况
    if (stats.memoryUsage > this.memoryLimits.total * 0.9) {
      // 内存使用超过90%，需要优化
      this.performResourceCleanup()
    }

    // 分析资源使用模式
    const usage = this.getResourceUsage()
    const lowUsageResources: string[] = []

    // 找出低使用频率的资源
    Object.entries(usage).forEach(([id, count]) => {
      if (count < 5) { // 使用次数少于5次
        lowUsageResources.push(id)
      }
    })

    // 对低使用频率的资源进行优化
    for (const id of lowUsageResources) {
      const resource = this.resources.get(id)
      if (resource && resource.priority === ResourcePriority.LOW) {
        this.unloadResource(id)
      }
    }
  }
}

// 导出单例实例
export const resourceManager = new IntelligentResourceManager()

// 导出便捷函数
export const addResource = (
  id: string,
  type: ResourceType,
  name: string,
  data: any,
  size: number,
  options?: ResourceLoadOptions
) => {
  return resourceManager.addResource(id, type, name, data, size, options)
}

export const loadResource = (
  id: string,
  type: ResourceType,
  name: string,
  url: string,
  options?: ResourceLoadOptions
) => {
  return resourceManager.loadResource(id, type, name, url, options)
}

export const getResource = (id: string) => {
  return resourceManager.getResource(id)
}

export const unloadResource = (id: string) => {
  return resourceManager.unloadResource(id)
}

export const getResourceStats = () => {
  return resourceManager.getStats()
}

export const optimizeResources = () => {
  resourceManager.optimizeResources()
}
