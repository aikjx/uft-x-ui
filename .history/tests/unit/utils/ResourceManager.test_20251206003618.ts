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

  return {
    __esModule: true,
    default: {
      TextureLoader: vi.fn(() => mockTextureLoader),
      MeshBasicMaterial: vi.fn(() => ({
        type: 'MeshBasicMaterial',
        dispose: vi.fn()
      })),
      CanvasTexture: vi.fn(() => ({
        type: 'CanvasTexture',
        dispose: vi.fn()
      }))
    },
    TextureLoader: vi.fn(() => mockTextureLoader)
  }
})

// 模拟 GLTFLoader
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => {
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

  return {
    __esModule: true,
    GLTFLoader: vi.fn(() => mockGLTFLoader)
  }
})

// 模拟 FontLoader
vi.mock('three/examples/jsm/loaders/FontLoader.js', () => {
  const mockFontLoader = {
    load: vi.fn((url, onLoad, onProgress, onError) => {
      // 创建一个模拟的字体对象
      const mockFont = {
        type: 'Font',
        data: { glyphs: {} },
        dispose: vi.fn()
      }
      // 立即调用成功回调
      onLoad?.(mockFont)
      return mockFont
    })
  }

  return {
    __esModule: true,
    FontLoader: vi.fn(() => mockFontLoader)
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
    resourceManager.dispose();
    // 清理所有模拟
    vi.clearAllMocks();
    // 重置资源管理器实例
    (ResourceManager as any).instance = null;
  })
  
  it('should return the same instance using getInstance()', () => {
    const instance1 = ResourceManager.getInstance()
    const instance2 = ResourceManager.getInstance()
    
    expect(instance1).toBe(instance2)
  })
  
  it('should load a resource with injected loader', async () => {
    // 创建一个模拟加载器
    const mockData = { type: 'MockData', value: 'test' }
    const mockLoader = {
      load: vi.fn((url, onLoad, onProgress, onError) => {
        // 立即调用成功回调
        onLoad?.(mockData)
      })
    }
    
    // 注入模拟加载器
    resourceManager.injectLoader('texture', mockLoader)
    
    const textureId = 'test-texture-injected'
    const textureUrl = 'test-texture.png'
    
    // 加载资源
    const result = await resourceManager.loadResource(textureId, textureUrl, 'texture')
    
    // 验证结果
    expect(result).toBe(mockData)
    expect(mockLoader.load).toHaveBeenCalledWith(textureUrl, expect.any(Function), expect.any(Function), expect.any(Function))
    
    // 验证资源是否被正确缓存
    const resourceEntry = resourceManager['resources'].get(textureId)
    expect(resourceEntry).toBeDefined()
    expect(resourceEntry.data).toBe(mockData)
    expect(resourceEntry.metadata.status).toBe('loaded')
  })
  
  it('should initialize with correct default values', () => {
    // 检查默认配置
    expect(resourceManager['config']).toBeDefined()
    expect(resourceManager['resources']).toBeInstanceOf(Map)
    expect(resourceManager['loaders']).toBeInstanceOf(Map)
    expect(resourceManager['loadQueue']).toBeInstanceOf(Array)
  })
  
  it('should load a texture resource correctly', async () => {
    const textureId = 'test-texture'
    const textureUrl = 'test-texture.png'
    
    // 加载资源
    const texture = await resourceManager.loadResource(textureId, textureUrl, 'texture')
    
    // 检查资源是否存在
    const resourceEntry = resourceManager['resources'].get(textureId)
    expect(resourceEntry).toBeDefined()
    expect(resourceEntry.data).toBeDefined()
    expect(resourceEntry.data).toBe(texture)
    expect(resourceEntry.metadata.type).toBe('texture')
    expect(resourceEntry.metadata.status).toBe('loaded')
    expect(resourceEntry.metadata.lastUsedAt).toBeGreaterThan(0)
    expect(resourceEntry.metadata.usageCount).toBe(1)
  })
  
  it('should preload resources correctly', async () => {
    const resourcesToPreload = [
      { id: 'preload-texture1', url: 'preload-texture1.png', type: 'texture' },
      { id: 'preload-model1', url: 'preload-model1.gltf', type: 'gltf' },
      { id: 'preload-font1', url: 'preload-font1.json', type: 'font' }
    ]
    
    // 预加载资源
    await resourceManager.preloadResources(resourcesToPreload)
    
    // 检查资源是否被预加载
    resourcesToPreload.forEach(resource => {
      expect(resourceManager['resources'].has(resource.id)).toBe(true)
      const resourceEntry = resourceManager['resources'].get(resource.id)
      expect(resourceEntry).toBeDefined()
      expect(resourceEntry?.metadata.status).toBe('loaded')
      expect(resourceEntry?.metadata.isActive).toBe(false) // 预加载资源默认不激活
    })
  })
  
  it('should load batch resources correctly', async () => {
    const batchResources = [
      { id: 'batch-texture1', url: 'batch-texture1.png', type: 'texture' },
      { id: 'batch-model1', url: 'batch-model1.gltf', type: 'gltf' },
      { id: 'batch-font1', url: 'batch-font1.json', type: 'font' }
    ]
    
    // 批量加载资源
    const loadedResources = await resourceManager.loadBatchResources(batchResources)
    
    // 检查资源是否被加载
    expect(loadedResources.size).toBe(3)
    
    batchResources.forEach(resource => {
      expect(loadedResources.has(resource.id)).toBe(true)
      const resourceEntry = resourceManager['resources'].get(resource.id)
      expect(resourceEntry).toBeDefined()
      expect(resourceEntry.metadata.status).toBe('loaded')
    })
  })
  
  it('should release a resource correctly', async () => {
    const textureId = 'release-texture'
    const textureUrl = 'release-texture.png'
    
    // 先加载资源
    await resourceManager.loadResource(textureId, textureUrl, 'texture')
    
    // 检查资源是否存在
    expect(resourceManager['resources'].has(textureId)).toBe(true)
    
    // 释放资源
    resourceManager.releaseResource(textureId)
    
    // 检查资源是否被移除
    expect(resourceManager['resources'].has(textureId)).toBe(false)
  })
  
  it('should release all resources correctly', async () => {
    // 先加载多个资源
    const resources = [
      { id: 'all-texture1', url: 'all-texture1.png', type: 'texture' },
      { id: 'all-texture2', url: 'all-texture2.png', type: 'texture' },
      { id: 'all-texture3', url: 'all-texture3.png', type: 'texture' }
    ]
    
    // 加载资源
    await resourceManager.loadBatchResources(resources)
    
    // 检查资源数量
    expect(resourceManager['resources'].size).toBe(3)
    
    // 释放所有资源
    resourceManager.releaseAllResources()
    
    // 检查所有资源是否被释放
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
    const textureId = 'dispose-texture'
    const textureUrl = 'dispose-texture.png'
    await resourceManager.loadResource(textureId, textureUrl, 'texture')
    
    // 检查资源是否存在
    expect(resourceManager['resources'].size).toBe(1)
    
    // 销毁资源管理器
    resourceManager.dispose()
    
    // 检查资源是否被释放
    expect(resourceManager['resources'].size).toBe(0)
  })
})
