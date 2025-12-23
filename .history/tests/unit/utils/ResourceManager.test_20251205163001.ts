import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ResourceManager, ResourceType, ResourceStatus } from '@/utils/ResourceManager'
import * as THREE from 'three'

// 模拟 THREE.js 加载器
vi.mock('three', () => {
  // 模拟 TextureLoader
  const mockTextureLoader = {
    load: vi.fn((url, onLoad, onProgress, onError) => {
      // 创建一个模拟的纹理对象
      const mockTexture = {
        type: 'Texture',
        image: { width: 100, height: 100 },
        dispose: vi.fn()
      }
      // 立即调用成功回调
      onLoad?.(mockTexture)
      return mockTexture
    })
  }

  // 模拟 GLTFLoader
  const mockGLTFLoader = {
    load: vi.fn((url, onLoad, onProgress, onError) => {
      // 创建一个模拟的 GLTF 对象
      const mockGLTF = {
        scene: {
          type: 'Scene',
          children: [],
          dispose: vi.fn()
        },
        dispose: vi.fn()
      }
      // 立即调用成功回调
      onLoad?.(mockGLTF)
      return mockGLTF
    })
  }

  // 模拟 FBXLoader
  const mockFBXLoader = {
    load: vi.fn((url, onLoad, onProgress, onError) => {
      // 创建一个模拟的 FBX 对象
      const mockFBX = {
        type: 'Group',
        children: [],
        dispose: vi.fn()
      }
      // 立即调用成功回调
      onLoad?.(mockFBX)
      return mockFBX
    })
  }

  // 模拟 OBJLoader
  const mockOBJLoader = {
    load: vi.fn((url, onLoad, onProgress, onError) => {
      // 创建一个模拟的 OBJ 对象
      const mockOBJ = {
        type: 'Group',
        children: [],
        dispose: vi.fn()
      }
      // 立即调用成功回调
      onLoad?.(mockOBJ)
      return mockOBJ
    })
  }

  return {
    __esModule: true,
    default: {
      TextureLoader: vi.fn(() => mockTextureLoader),
      GLTFLoader: vi.fn(() => mockGLTFLoader),
      FBXLoader: vi.fn(() => mockFBXLoader),
      OBJLoader: vi.fn(() => mockOBJLoader),
      MeshBasicMaterial: vi.fn(() => ({
        type: 'MeshBasicMaterial',
        dispose: vi.fn()
      })),
      CanvasTexture: vi.fn(() => ({
        type: 'CanvasTexture',
        dispose: vi.fn()
      }))
    },
    TextureLoader: vi.fn(() => mockTextureLoader),
    GLTFLoader: vi.fn(() => mockGLTFLoader),
    FBXLoader: vi.fn(() => mockFBXLoader),
    OBJLoader: vi.fn(() => mockOBJLoader)
  }
})

describe('ResourceManager 类', () => {
  let resourceManager: ResourceManager
  
  beforeEach(() => {
    // 获取单例实例
    resourceManager = ResourceManager.getInstance()
    // 不使用假定时器，因为异步操作可能无法正确完成
  })

  afterEach(() => {
    // 清理资源
    resourceManager.dispose()
    // 清理所有模拟
    vi.clearAllMocks()
    // 重置资源管理器实例
    (ResourceManager as any).instance = null
  })
  
  it('should return the same instance using getInstance()', () => {
    const instance1 = ResourceManager.getInstance()
    const instance2 = ResourceManager.getInstance()
    
    expect(instance1).toBe(instance2)
  })
  
  it('should initialize with correct default values', () => {
    // 检查默认配置
    expect(resourceManager['config']).toBeDefined()
    expect(resourceManager['resources']).toBeInstanceOf(Map)
    expect(resourceManager['loaders']).toBeInstanceOf(Map)
    expect(resourceManager['loadQueue']).toBeInstanceOf(Array)
  })
  
  it('should load a texture resource correctly', async () => {
    const textureUrl = 'test-texture.png'
    const texturePromise = resourceManager.loadResource(textureUrl, textureUrl, 'texture')
    
    // 推进时间，让加载完成
    vi.runAllTimers()
    
    const texture = await texturePromise
    
    expect(texture).toBeDefined()
    expect(resourceManager['resources'].has(textureUrl)).toBe(true)
    
    const resourceEntry = resourceManager['resources'].get(textureUrl)
    expect(resourceEntry?.metadata.status).toBe(ResourceStatus.LOADED)
    expect(resourceEntry?.data).toBe(texture)
  })
  
  it('should preload resources correctly', async () => {
    const resourcesToPreload = [
      { id: 'preload-texture1', url: 'preload-texture1.png', type: 'texture' },
      { id: 'preload-model1', url: 'preload-model1.gltf', type: 'gltf' },
      { id: 'preload-font1', url: 'preload-font1.json', type: 'font' }
    ]
    
    const preloadPromise = resourceManager.preloadResources(resourcesToPreload)
    
    // 推进时间
    vi.runAllTimers()
    
    await preloadPromise
    
    // 检查资源是否被预加载
    resourcesToPreload.forEach(resource => {
      expect(resourceManager['resources'].has(resource.id)).toBe(true)
      const resourceEntry = resourceManager['resources'].get(resource.id)
      expect(resourceEntry).toBeDefined()
      expect(resourceEntry?.metadata.status).toBe(ResourceStatus.LOADED)
      expect(resourceEntry?.metadata.isActive).toBe(false) // 预加载资源默认不激活
    })
  })
  
  it('should load batch resources correctly', async () => {
    const batchResources = [
      { id: 'batch-texture1', url: 'batch-texture1.png', type: 'texture' },
      { id: 'batch-model1', url: 'batch-model1.gltf', type: 'gltf' },
      { id: 'batch-font1', url: 'batch-font1.json', type: 'font' }
    ]
    
    const batchPromise = resourceManager.loadBatchResources(batchResources)
    vi.runAllTimers()
    
    const loadedResources = await batchPromise
    
    // 检查资源是否被加载
    expect(loadedResources.size).toBe(3)
    
    batchResources.forEach(resource => {
      expect(loadedResources.has(resource.id)).toBe(true)
      const resourceEntry = resourceManager['resources'].get(resource.id)
      expect(resourceEntry).toBeDefined()
      expect(resourceEntry.metadata.status).toBe(ResourceStatus.LOADED)
    })
  })
  
  it('should release a resource correctly', async () => {
    const textureUrl = 'release-texture.png'
    
    // 先加载资源
    await resourceManager.loadResource(textureUrl, textureUrl, 'texture')
    vi.runAllTimers()
    
    // 检查资源是否存在
    expect(resourceManager['resources'].has(textureUrl)).toBe(true)
    
    // 释放资源
    resourceManager.releaseResource(textureUrl)
    
    // 检查资源是否被移除
    expect(resourceManager['resources'].has(textureUrl)).toBe(false)
  })
  
  it('should release all resources correctly', async () => {
    // 加载多个资源
    const resourceUrls = ['all-texture1.png', 'all-texture2.png', 'all-texture3.png']
    
    for (const url of resourceUrls) {
      await resourceManager.loadResource(url, url, 'texture')
      vi.runAllTimers()
    }
    
    // 检查资源数量
    expect(resourceManager['resources'].size).toBe(3)
    
    // 释放所有资源
    resourceManager.releaseAllResources()
    
    // 检查资源是否都被移除
    expect(resourceManager['resources'].size).toBe(0)
  })
  
  it('should trigger garbage collection correctly', async () => {
    const textureId = 'gc-texture'
    const textureUrl = 'gc-texture.png'
    
    // 加载资源
    await resourceManager.loadResource(textureId, textureUrl, 'texture')
    
    // 设置资源为未使用
    const resourceEntry = resourceManager['resources'].get(textureId)
    if (resourceEntry) {
      resourceEntry.metadata.lastUsedAt = Date.now() - 2 * 60 * 1000 // 2分钟前使用
    }
    
    // 触发垃圾回收
    resourceManager.triggerGarbageCollection()
    
    // 检查资源是否被回收
    expect(resourceManager['resources'].has(textureId)).toBe(false)
  })
  
  it('should dispose correctly', async () => {
    // 加载一些资源
    const textureUrl = 'dispose-texture.png'
    await resourceManager.loadResource(textureUrl, textureUrl, 'texture')
    vi.runAllTimers()
    
    // 检查资源是否存在
    expect(resourceManager['resources'].size).toBe(1)
    
    // 调用 dispose
    resourceManager.dispose()
    
    // 检查资源是否被清理
    expect(resourceManager['resources'].size).toBe(0)
  })
})
