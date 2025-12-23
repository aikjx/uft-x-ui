/**
 * 资源管理系统 - 高效的资源缓存和预加载策略
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextureLoader } from 'three';
import { eventSystem, APP_EVENTS } from './eventSystem';

// 资源类型定义
export type ResourceType = 'texture' | 'model' | 'font' | 'geometry' | 'material' | 'shader' | 'audio' | 'data' | 'cube_texture' | 'gltf' | 'custom';

// 资源状态定义
export enum ResourceStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

// 资源元数据
export interface ResourceMetadata {
  id: string;
  url: string;
  type: ResourceType;
  status: ResourceStatus;
  size: number; // 资源大小（估计，单位：字节）
  loadedAt: number;
  lastUsedAt: number;
  usageCount: number;
  isPinned: boolean; // 是否固定，不会被自动释放
  isActive: boolean; // 是否正在使用中
  dependencies?: string[]; // 依赖的其他资源ID
  error?: Error; // 加载错误信息
  progress?: number; // 加载进度（0-1）
  loadStartTime?: number; // 加载开始时间
  loadEndTime?: number; // 加载结束时间
  loadDuration?: number; // 加载持续时间（毫秒）
}

// 资源加载选项
export interface ResourceLoadOptions {
  priority?: number; // 加载优先级，值越大优先级越高
  pin?: boolean; // 是否固定资源，不会被自动释放
  preload?: boolean; // 是否预加载
  dependencies?: string[]; // 依赖的其他资源
  onProgress?: (progress: number) => void; // 加载进度回调
  onLoad?: (resource: any) => void; // 加载完成回调
  onError?: (error: Error) => void; // 加载错误回调
}

// 资源管理配置
export interface ResourceManagerConfig {
  maxCacheSize?: number; // 最大缓存大小（估计，单位：字节）
  maxResources?: number; // 最大资源数量
  autoReleaseEnabled?: boolean; // 是否启用自动释放
  releaseInterval?: number; // 自动释放检查间隔（毫秒）
  defaultTTL?: number; // 默认资源生命周期（毫秒）
  enableLogging?: boolean; // 是否启用日志
  preloadBatchSize?: number; // 预加载批次大小
}

// 资源加载请求
export interface ResourceLoadRequest {
  id: string;
  url: string;
  type: ResourceType;
  options: ResourceLoadOptions;
  resolve: (resource: any) => void;
  reject: (error: Error) => void;
}

/**
 * 资源管理类 - 实现高效的资源缓存和预加载
 */
export class ResourceManager {
  private static instance: ResourceManager;
  private resources: Map<string, { data: any; metadata: ResourceMetadata }> = new Map();
  private loaders: Map<ResourceType, any> = new Map();
  private loadQueue: ResourceLoadRequest[] = [];
  private isLoading: boolean = false;
  private config: ResourceManagerConfig;
  private autoReleaseTimer: NodeJS.Timeout | null = null;
  private totalLoadedSize: number = 0;
  private totalCachedSize: number = 0;

  private constructor(config: ResourceManagerConfig = {}) {
    this.config = {
      maxCacheSize: 500 * 1024 * 1024, // 默认500MB
      maxResources: 1000, // 默认最多1000个资源
      autoReleaseEnabled: true,
      releaseInterval: 30000, // 默认30秒检查一次
      defaultTTL: 300000, // 默认5分钟未使用自动释放
      enableLogging: process.env.NODE_ENV === 'development',
      preloadBatchSize: 4, // 默认一次预加载4个资源
      ...config
    };

    // 初始化加载器
    this.initializeLoaders();

    // 启动自动释放计时器
    this.startAutoRelease();
  }

  /**
   * 获取资源管理器实例
   */
  public static getInstance(config?: ResourceManagerConfig): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager(config);
    }
    return ResourceManager.instance;
  }

  /**
   * 初始化加载器
   */
  private initializeLoaders(): void {
    this.loaders.set('texture', new TextureLoader());
    this.loaders.set('cube_texture', new THREE.CubeTextureLoader());
    this.loaders.set('gltf', new GLTFLoader());
    this.loaders.set('model', new GLTFLoader());
    this.loaders.set('font', new FontLoader());
    // 其他加载器可以根据需要添加
  }

  /**
   * 加载单个资源
   * @param id 资源唯一标识符
   * @param url 资源URL
   * @param type 资源类型
   * @param options 加载选项
   */
  public async loadResource(
    id: string,
    url: string,
    type: ResourceType,
    options: ResourceLoadOptions = {}
  ): Promise<any> {
    // 检查资源是否已存在
    const existingResource = this.resources.get(id);
    if (existingResource) {
      // 更新资源使用信息
      this.updateResourceUsage(id);
      
      if (existingResource.metadata.status === ResourceStatus.LOADED) {
        options.onLoad?.(existingResource.data);
        return existingResource.data;
      } else if (existingResource.metadata.status === ResourceStatus.ERROR) {
        // 资源加载失败，重新加载
        return this.retryLoadResource(id, url, type, options);
      } else {
        // 资源正在加载中，等待加载完成
        return this.waitForResourceLoad(id, options);
      }
    }

    // 创建资源元数据
    const metadata: ResourceMetadata = {
      id,
      url,
      type,
      status: ResourceStatus.IDLE,
      size: 0,
      loadedAt: 0,
      lastUsedAt: 0,
      usageCount: 0,
      isPinned: options.pin || false,
      isActive: true,
      dependencies: options.dependencies,
      progress: 0
    };

    // 将资源添加到缓存
    this.resources.set(id, { data: null!, metadata });

    // 发布资源加载开始事件
    eventSystem.emit(APP_EVENTS.RESOURCE_LOAD, {
      id,
      url,
      type,
      status: ResourceStatus.LOADING,
      progress: 0
    });

    return new Promise((resolve, reject) => {
      // 将加载请求添加到队列
      this.loadQueue.push({
        id,
        url,
        type,
        options,
        resolve,
        reject
      });

      // 按优先级排序队列
      this.loadQueue.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

      // 开始处理加载队列
      this.processLoadQueue();
    });
  }

  /**
   * 重新加载资源
   */
  private async retryLoadResource(
    id: string,
    url: string,
    type: ResourceType,
    options: ResourceLoadOptions = {}
  ): Promise<any> {
    const existingResource = this.resources.get(id);
    if (existingResource) {
      // 清除旧的错误信息
      existingResource.metadata.status = ResourceStatus.IDLE;
      existingResource.metadata.error = undefined;
    }

    return this.loadResource(id, url, type, options);
  }

  /**
   * 等待资源加载完成
   */
  private waitForResourceLoad(id: string, options: ResourceLoadOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const resource = this.resources.get(id);
        if (!resource) {
          clearInterval(checkInterval);
          reject(new Error(`Resource with id ${id} not found`));
          return;
        }

        if (resource.metadata.status === ResourceStatus.LOADED) {
          clearInterval(checkInterval);
          options.onLoad?.(resource.data);
          resolve(resource.data);
        } else if (resource.metadata.status === ResourceStatus.ERROR) {
          clearInterval(checkInterval);
          reject(resource.metadata.error || new Error(`Failed to load resource ${id}`));
        }
      }, 100);
    }

  /**
   * 处理加载队列
   */
  private async processLoadQueue(): Promise<void> {
    if (this.isLoading) return;
    
    // 只处理特定数量的加载请求
    const batchSize = this.config.preloadBatchSize || 4;
    const currentBatch = this.loadQueue.slice(0, batchSize);
    
    if (currentBatch.length === 0) return;
    
    this.isLoading = true;
    
    try {
      // 并行处理当前批次的加载请求
      const loadPromises = currentBatch.map(request => this.loadSingleResourceFromQueue(request));
      await Promise.allSettled(loadPromises);
    } catch (error) {
      console.error('Error processing load queue:', error);
    } finally {
      this.isLoading = false;
      
      // 移除已处理的请求
      this.loadQueue.splice(0, batchSize);
      
      // 继续处理下一批
      this.processLoadQueue();
    }
  }

  /**
   * 从队列中加载单个资源
   */
  private async loadSingleResourceFromQueue(request: ResourceLoadRequest): Promise<void> {
    const { id, url, type, options, resolve, reject } = request;
    
    const resource = this.resources.get(id);
    if (!resource) {
      reject(new Error(`Resource ${id} not found in cache`));
      return;
    }

    // 更新资源状态为加载中
    resource.metadata.status = ResourceStatus.LOADING;
    resource.metadata.loadStartTime = Date.now();
    resource.metadata.progress = 0;
    
    try {
      // 获取对应的加载器
      const loader = this.loaders.get(type);
      if (!loader) {
        throw new Error(`No loader available for resource type: ${type}`);
      }

      // 根据资源类型执行加载
      let data: any;
      
      switch (type) {
        case 'texture':
          data = await this.loadTexture(loader as THREE.TextureLoader, url, (progress) => {
            this.updateResourceProgress(id, progress);
            options.onProgress?.(progress);
          });
          break;
        case 'cube_texture':
          data = await this.loadCubeTexture(loader as THREE.CubeTextureLoader, url, (progress) => {
            this.updateResourceProgress(id, progress);
            options.onProgress?.(progress);
          });
          break;
        case 'model':
        case 'gltf':
          data = await this.loadModel(loader as GLTFLoader, url, (progress) => {
            this.updateResourceProgress(id, progress);
            options.onProgress?.(progress);
          });
          break;
        case 'font':
          data = await this.loadFont(loader as THREE.FontLoader, url, (progress) => {
            this.updateResourceProgress(id, progress);
            options.onProgress?.(progress);
          });
          break;
        default:
          throw new Error(`Resource type ${type} not supported`);
      }

      // 估计资源大小
      const size = this.estimateResourceSize(data, type);
      
      // 更新资源信息
      resource.data = data;
      resource.metadata.status = ResourceStatus.LOADED;
      resource.metadata.size = size;
      resource.metadata.loadedAt = Date.now();
      resource.metadata.lastUsedAt = Date.now();
      resource.metadata.usageCount = 1;
      resource.metadata.loadEndTime = Date.now();
      resource.metadata.loadDuration = resource.metadata.loadEndTime - (resource.metadata.loadStartTime || 0);
      resource.metadata.progress = 1;
      
      // 更新总缓存大小
      this.totalCachedSize += size;
      
      // 发布资源加载完成事件
      eventSystem.emit(APP_EVENTS.RESOURCE_LOAD, {
        id,
        url,
        type,
        status: ResourceStatus.LOADED,
        progress: 1,
        size,
        loadDuration: resource.metadata.loadDuration
      });
      
      // 检查是否需要释放旧资源
      this.checkResourceLimit();
      
      // 调用完成回调
      options.onLoad?.(data);
      resolve(data);
      
    } catch (error) {
      // 更新资源状态为错误
      resource.metadata.status = ResourceStatus.ERROR;
      resource.metadata.error = error instanceof Error ? error : new Error(String(error));
      resource.metadata.loadEndTime = Date.now();
      resource.metadata.loadDuration = resource.metadata.loadEndTime - (resource.metadata.loadStartTime || 0);
      
      // 发布资源加载错误事件
      eventSystem.emit(APP_EVENTS.RESOURCE_ERROR, {
        id,
        url,
        type,
        error: resource.metadata.error
      });
      
      // 调用错误回调
      options.onError?.(resource.metadata.error!);
      reject(resource.metadata.error!);
    }
  }

  /**
   * 加载纹理资源
   */
  private loadTexture(loader: THREE.TextureLoader, url: string, onProgress: (progress: number) => void): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (texture) => resolve(texture),
        (progressEvent) => {
          const progress = progressEvent.lengthComputable ? progressEvent.loaded / progressEvent.total : 0;
          onProgress(progress);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * 加载模型资源
   */
  private loadModel(loader: GLTFLoader, url: string, onProgress: (progress: number) => void): Promise<THREE.Scene> {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        (progressEvent) => {
          const progress = progressEvent.lengthComputable ? progressEvent.loaded / progressEvent.total : 0;
          onProgress(progress);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * 加载字体资源
   */
  private loadFont(loader: THREE.FontLoader, url: string, onProgress: (progress: number) => void): Promise<THREE.Font> {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (font) => resolve(font),
        (progressEvent) => {
          const progress = progressEvent.lengthComputable ? progressEvent.loaded / progressEvent.total : 0;
          onProgress(progress);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * 加载立方体纹理资源
   */
  private loadCubeTexture(loader: THREE.CubeTextureLoader, urls: string | string[], onProgress: (progress: number) => void): Promise<THREE.CubeTexture> {
    return new Promise((resolve, reject) => {
      loader.load(
        urls,
        (texture) => resolve(texture),
        (progressEvent) => {
          const progress = progressEvent.lengthComputable ? progressEvent.loaded / progressEvent.total : 0;
          onProgress(progress);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * 批量加载资源
   * @param resources 资源数组
   */
  public async loadBatchResources(
    resources: Array<{
      id: string;
      url: string;
      type: ResourceType;
      options?: ResourceLoadOptions;
    }>
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    // 计算总资源数量用于进度报告
    const totalResources = resources.length;
    let loadedResources = 0;
    
    // 并行加载所有资源
    const loadPromises = resources.map(async (resource) => {
      try {
        const data = await this.loadResource(
          resource.id,
          resource.url,
          resource.type,
          {
            ...resource.options,
            onProgress: (progress) => {
              // 计算整体进度
              const overallProgress = (loadedResources + progress) / totalResources;
              eventSystem.emit(APP_EVENTS.RESOURCE_PROGRESS, {
                total: totalResources,
                loaded: loadedResources,
                progress: overallProgress
              });
              resource.options?.onProgress?.(progress);
            }
          }
        );
        results.set(resource.id, data);
        loadedResources++;
        
        // 发布批量加载进度事件
        eventSystem.emit(APP_EVENTS.RESOURCE_PROGRESS, {
          total: totalResources,
          loaded: loadedResources,
          progress: loadedResources / totalResources
        });
      } catch (error) {
        console.error(`Failed to load resource ${resource.id}:`, error);
        loadedResources++;
        
        // 发布批量加载进度事件
        eventSystem.emit(APP_EVENTS.RESOURCE_PROGRESS, {
          total: totalResources,
          loaded: loadedResources,
          progress: loadedResources / totalResources
        });
      }
    });
    
    await Promise.allSettled(loadPromises);
    return results;
  }

  /**
   * 预加载资源
   * @param resources 要预加载的资源数组
   */
  public preloadResources(
    resources: Array<{
      id: string;
      url: string;
      type: ResourceType;
      options?: ResourceLoadOptions;
    }>
  ): void {
    resources.forEach(resource => {
      this.loadResource(
        resource.id,
        resource.url,
        resource.type,
        {
          ...resource.options,
          pin: false, // 预加载的资源默认不固定
          preload: true
        }
      ).catch(error => {
        console.warn(`Preloading resource ${resource.id} failed:`, error);
      });
    });
  }

  /**
   * 估算资源大小（字节）
   * @param data 资源数据
   * @param type 资源类型
   */
  private estimateResourceSize(data: any, type: ResourceType): number {
    if (!data) return 0;

    try {
      switch (type) {
        case 'texture':
          if (data instanceof THREE.Texture && data.image) {
            return data.image.width * data.image.height * 4; // RGBA 4字节/像素
          }
          break;
        case 'cube_texture':
          if (data instanceof THREE.CubeTexture && data.image && data.image.length > 0) {
            return data.image[0].width * data.image[0].height * 4 * 6; // 6个面
          }
          break;
        case 'model':
        case 'gltf':
          if (data.scene) {
            let size = 0;
            data.scene.traverse((object: any) => {
              if (object.geometry) {
                size += object.geometry.attributes.position.count * 4 * 3; // 顶点数据
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(() => size += 102400); // 每个材质约100KB
                } else {
                  size += 102400; // 每个材质约100KB
                }
              }
            });
            return size;
          }
          break;
        case 'font':
          if (data instanceof THREE.Font) {
            // 估算字体大小
            return JSON.stringify(data.data).length;
          }
          break;
        case 'geometry':
          if (data instanceof THREE.BufferGeometry) {
            let size = 0;
            for (const attribute of Object.values(data.attributes)) {
              size += attribute.count * attribute.itemSize * 4; // 4字节/值
            }
            return size;
          }
          break;
        case 'material':
          if (data instanceof THREE.Material) {
            return 102400; // 每个材质约100KB
          }
          break;
        case 'shader':
          return 10240; // 每个着色器约10KB
        case 'audio':
          return 1024000; // 每个音频约1MB
        case 'data':
          if (typeof data === 'string') {
            return data.length;
          } else if (typeof data === 'object') {
            return JSON.stringify(data).length;
          }
          break;
        default:
          return 10240; // 默认10KB
      }
    } catch (error) {
      console.warn('Failed to estimate resource size:', error);
    }

    return 10240; // 默认10KB
  }

  /**
   * 更新资源进度
   * @param id 资源ID
   * @param progress 进度值（0-1）
   */
  private updateResourceProgress(id: string, progress: number): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.metadata.progress = progress;
      eventSystem.emit(APP_EVENTS.RESOURCE_LOAD, {
        id,
        url: resource.metadata.url,
        type: resource.metadata.type,
        status: ResourceStatus.LOADING,
        progress
      });
    }
  }

  /**
   * 检查资源限制并释放旧资源
   */
  private checkResourceLimit(): void {
    if (!this.config.autoReleaseEnabled) return;

    // 检查资源数量限制
    if (this.resources.size > this.config.maxResources!) {
      this.releaseOldestResource();
    }

    // 检查缓存大小限制
    if (this.totalCachedSize > this.config.maxCacheSize!) {
      this.releaseOldestResource();
    }
  }

  /**
   * 释放最旧的未固定资源
   */
  private releaseOldestResource(): void {
    let oldestResource: string | null = null;
    let oldestTime = Date.now();

    this.resources.forEach((resource, id) => {
      if (!resource.metadata.isPinned && resource.metadata.lastUsedAt < oldestTime) {
        oldestTime = resource.metadata.lastUsedAt;
        oldestResource = id;
      }
    });

    if (oldestResource) {
      this.releaseResource(oldestResource);
    }
  }

  /**
   * 释放资源
   * @param id 资源ID
   */
  public releaseResource(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      // 释放资源数据
      this.disposeResource(resource.data, resource.metadata.type);
      
      // 更新缓存大小
      this.totalCachedSize -= resource.metadata.size;
      
      // 从资源列表中移除
      this.resources.delete(id);
      
      // 发布资源卸载事件
      eventSystem.emit(APP_EVENTS.RESOURCE_UNLOAD, {
        id,
        url: resource.metadata.url,
        type: resource.metadata.type
      });
    }
  }

  /**
   * 释放资源数据
   * @param data 资源数据
   * @param type 资源类型
   */
  private disposeResource(data: any, type: ResourceType): void {
    if (!data) return;

    try {
      switch (type) {
        case 'texture':
        case 'cube_texture':
          if (data instanceof THREE.Texture) {
            data.dispose();
          }
          break;
        case 'model':
        case 'gltf':
          if (data.scene) {
            data.scene.traverse((object: any) => {
              if (object.geometry) {
                object.geometry.dispose();
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material: THREE.Material) => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
              if (object.texture) {
                object.texture.dispose();
              }
            });
          }
          break;
        case 'geometry':
          if (data instanceof THREE.BufferGeometry) {
            data.dispose();
          }
          break;
        case 'material':
          if (data instanceof THREE.Material) {
            data.dispose();
          }
          break;
        // 其他资源类型可以根据需要添加释放逻辑
      }
    } catch (error) {
      console.warn('Failed to dispose resource:', error);
    }
  }

  /**
   * 更新资源使用信息
   * @param id 资源ID
   */
  private updateResourceUsage(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.metadata.lastUsedAt = Date.now();
      resource.metadata.usageCount++;
    }
  }



