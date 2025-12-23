import * as THREE from 'three';
import { LoadingManager, TextureLoader, CubeTextureLoader, FontLoader, GLTFLoader } from 'three';

/**
 * 资源类型
 */
export enum ResourceType {
  TEXTURE = 'texture',
  CUBE_TEXTURE = 'cube_texture',
  FONT = 'font',
  GLTF = 'gltf',
  GEOMETRY = 'geometry',
  MATERIAL = 'material',
  SHADER = 'shader',
  AUDIO = 'audio',
  CUSTOM = 'custom'
}

/**
 * 资源加载进度
 */
export interface ResourceLoadProgress {
  loaded: number;
  total: number;
  progress: number;
  resource: Resource;
  url: string;
}

/**
 * 资源配置
 */
export interface ResourceConfig {
  url: string;
  type: ResourceType;
  name?: string;
  options?: any;
  preload?: boolean;
  cache?: boolean;
  priority?: number;
  onLoad?: (resource: any) => void;
  onProgress?: (progress: ResourceLoadProgress) => void;
  onError?: (error: Error) => void;
}

/**
 * 资源
 */
export interface Resource {
  id: string;
  name: string;
  url: string;
  type: ResourceType;
  data: any;
  config: ResourceConfig;
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  timestamp: number;
  accessCount: number;
  size: number;
}

/**
 * 资源管理器配置
 */
export interface ResourceManagerConfig {
  maxCacheSizeMB: number;
  enableCaching: boolean;
  enablePreloading: boolean;
  enableAutoRelease: boolean;
  autoReleaseInterval: number;
  minAccessIntervalMs: number;
  enableProgressTracking: boolean;
}

/**
 * 资源管理器
 */
export class ResourceManager {
  private config: ResourceManagerConfig;
  private resources: Map<string, Resource>;
  private loadingManager: THREE.LoadingManager;
  private loaders: Map<ResourceType, any>;
  private totalCacheSize: number = 0;
  private autoReleaseTimer: NodeJS.Timeout | null = null;
  private progressListeners: Array<(progress: ResourceLoadProgress) => void> = [];
  private loadCompleteListeners: Array<() => void> = [];

  constructor(config: Partial<ResourceManagerConfig> = {}) {
    this.config = {
      maxCacheSizeMB: 512,
      enableCaching: true,
      enablePreloading: true,
      enableAutoRelease: true,
      autoReleaseInterval: 60000, // 1分钟
      minAccessIntervalMs: 30000, // 30秒
      enableProgressTracking: true,
      ...config
    };

    this.resources = new Map();
    this.loadingManager = new LoadingManager();

    // 初始化加载器
    this.loaders = new Map();
    this.loaders.set(ResourceType.TEXTURE, new TextureLoader(this.loadingManager));
    this.loaders.set(ResourceType.CUBE_TEXTURE, new CubeTextureLoader(this.loadingManager));
    this.loaders.set(ResourceType.FONT, new FontLoader(this.loadingManager));
    this.loaders.set(ResourceType.GLTF, new GLTFLoader(this.loadingManager));

    // 设置加载管理器回调
    this.loadingManager.onProgress = (url, loaded, total) => {
      this.onLoadProgress(url, loaded, total);
    };

    // 启动自动释放计时器
    if (this.config.enableAutoRelease) {
      this.startAutoRelease();
    }
  }

  /**
   * 注册资源
   */
  registerResource(config: ResourceConfig): string {
    const id = this.generateResourceId(config);
    
    // 如果资源已存在，返回现有ID
    if (this.resources.has(id)) {
      return id;
    }

    const resource: Resource = {
      id,
      name: config.name || id,
      url: config.url,
      type: config.type,
      data: null,
      config,
      loaded: false,
      loading: false,
      error: null,
      timestamp: Date.now(),
      accessCount: 0,
      size: 0
    };

    this.resources.set(id, resource);

    // 如果配置了预加载，立即加载资源
    if (config.preload) {
      this.loadResource(id);
    }

    return id;
  }

  /**
   * 加载资源
   */
  async loadResource(id: string): Promise<any> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error(`Resource with id ${id} not found`);
    }

    // 如果资源已加载，直接返回
    if (resource.loaded) {
      resource.accessCount++;
      resource.timestamp = Date.now();
      return resource.data;
    }

    // 如果资源正在加载，等待加载完成
    if (resource.loading) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (resource.loaded) {
            clearInterval(checkInterval);
            resource.accessCount++;
            resource.timestamp = Date.now();
            resolve(resource.data);
          } else if (resource.error) {
            clearInterval(checkInterval);
            reject(resource.error);
          }
        }, 100);
      });
    }

    // 开始加载资源
    resource.loading = true;
    resource.error = null;

    try {
      const loader = this.loaders.get(resource.type);
      if (!loader) {
        throw new Error(`No loader found for resource type ${resource.type}`);
      }

      // 加载资源
      const data = await new Promise((resolve, reject) => {
        loader.load(
          resource.url,
          (result: any) => resolve(result),
          (progress: any) => {
            if (resource.config.onProgress) {
              resource.config.onProgress({
                loaded: progress.loaded,
                total: progress.total,
                progress: progress.loaded / progress.total,
                resource,
                url: resource.url
              });
            }
          },
          (error: Error) => reject(error)
        );
      });

      // 资源加载完成
      resource.data = data;
      resource.loaded = true;
      resource.loading = false;
      resource.timestamp = Date.now();
      resource.accessCount++;

      // 估算资源大小
      resource.size = this.estimateResourceSize(data, resource.type);

      // 更新缓存大小
      if (this.config.enableCaching) {
        this.totalCacheSize += resource.size;
        this.ensureCacheSize();
      }

      // 调用资源加载完成回调
      if (resource.config.onLoad) {
        resource.config.onLoad(data);
      }

      return data;
    } catch (error) {
      resource.error = error as Error;
      resource.loading = false;
      
      // 调用资源加载错误回调
      if (resource.config.onError) {
        resource.config.onError(error as Error);
      }
      
      throw error;
    }
  }

  /**
   * 获取资源
   */
  getResource(id: string): any | null {
    const resource = this.resources.get(id);
    if (resource && resource.loaded) {
      resource.accessCount++;
      resource.timestamp = Date.now();
      return resource.data;
    }
    return null;
  }

  /**
   * 释放资源
   */
  releaseResource(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      // 释放资源数据
      this.disposeResource(resource);
      
      // 更新缓存大小
      if (this.config.enableCaching) {
        this.totalCacheSize -= resource.size;
      }
      
      // 从资源列表中移除
      this.resources.delete(id);
    }
  }

  /**
   * 预加载资源
   */
  preloadResources(ids: string[]): void {
    ids.forEach(id => this.loadResource(id));
  }

  /**
   * 释放所有资源
   */
  releaseAllResources(): void {
    this.resources.forEach((resource) => {
      this.disposeResource(resource);
    });
    this.resources.clear();
    this.totalCacheSize = 0;
  }

  /**
   * 释放未使用的资源
   */
  releaseUnusedResources(): void {
    const now = Date.now();
    const minAccessInterval = this.config.minAccessIntervalMs;

    this.resources.forEach((resource, id) => {
      if (resource.loaded && 
          !resource.loading && 
          now - resource.timestamp > minAccessInterval && 
          resource.accessCount < 5) {
        this.releaseResource(id);
      }
    });
  }

  /**
   * 确保缓存大小不超过限制
   */
  private ensureCacheSize(): void {
    if (!this.config.enableCaching) return;

    // 如果缓存大小超过限制，释放最不常用的资源
    while (this.totalCacheSize > this.config.maxCacheSizeMB * 1024 * 1024) {
      let leastUsedResource: Resource | null = null;
      let leastUsedId: string | null = null;

      // 找到最不常用的资源
      this.resources.forEach((resource, id) => {
        if (resource.loaded && !resource.loading) {
          if (!leastUsedResource || 
              resource.timestamp < leastUsedResource.timestamp ||
              (resource.timestamp === leastUsedResource.timestamp && 
               resource.accessCount < leastUsedResource.accessCount)) {
            leastUsedResource = resource;
            leastUsedId = id;
          }
        }
      });

      if (leastUsedId) {
        this.releaseResource(leastUsedId);
      } else {
        break; // 没有更多可释放的资源
      }
    }
  }

  /**
   * 估算资源大小
   */
  private estimateResourceSize(data: any, type: ResourceType): number {
    // 简单估算不同类型资源的大小
    switch (type) {
      case ResourceType.TEXTURE:
        if (data instanceof THREE.Texture) {
          return (data.image.width * data.image.height * 4) / (1024 * 1024); // MB
        }
        break;
      case ResourceType.CUBE_TEXTURE:
        if (data instanceof THREE.CubeTexture && data.image && data.image.length > 0) {
          return (data.image[0].width * data.image[0].height * 4 * 6) / (1024 * 1024); // MB
        }
        break;
      case ResourceType.GLTF:
        if (data.scene) {
          // 估算GLTF大小
          let size = 0;
          data.scene.traverse((object: any) => {
            if (object.geometry) {
              size += (object.geometry.attributes.position.count * 4 * 3) / (1024 * 1024); // 顶点数据
            }
            if (object.material) {
              size += 0.1; // 每个材质大约0.1MB
            }
          });
          return size;
        }
        break;
      case ResourceType.GEOMETRY:
        if (data instanceof THREE.BufferGeometry) {
          return (data.attributes.position.count * 4 * 3) / (1024 * 1024); // 顶点数据
        }
        break;
      case ResourceType.MATERIAL:
        return 0.1; // 每个材质大约0.1MB
      default:
        return 0.01; // 默认10KB
    }
    return 0;
  }

  /**
   * 释放资源数据
   */
  private disposeResource(resource: Resource): void {
    const data = resource.data;
    if (!data) return;

    switch (resource.type) {
      case ResourceType.TEXTURE:
        if (data instanceof THREE.Texture) {
          data.dispose();
        }
        break;
      case ResourceType.CUBE_TEXTURE:
        if (data instanceof THREE.CubeTexture) {
          data.dispose();
        }
        break;
      case ResourceType.GLTF:
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
          });
        }
        break;
      case ResourceType.GEOMETRY:
        if (data instanceof THREE.BufferGeometry) {
          data.dispose();
        }
        break;
      case ResourceType.MATERIAL:
        if (data instanceof THREE.Material) {
          data.dispose();
        }
        break;
      // 其他资源类型可能需要特殊处理
    }
  }

  /**
   * 生成资源ID
   */
  private generateResourceId(config: ResourceConfig): string {
    if (config.name) {
      return `${config.type}_${config.name}`;
    }
    return `${config.type}_${config.url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * 处理加载进度
   */
  private onLoadProgress(url: string, loaded: number, total: number): void {
    const resource = Array.from(this.resources.values()).find(r => r.url === url);
    if (resource) {
      const progress: ResourceLoadProgress = {
        loaded,
        total,
        progress: loaded / total,
        resource,
        url
      };
      
      // 通知所有进度监听器
      this.progressListeners.forEach(listener => listener(progress));
      
      // 调用资源特定的进度回调
      if (resource.config.onProgress) {
        resource.config.onProgress(progress);
      }
      
      // 检查是否所有资源都已加载完成
      if (loaded === total) {
        this.checkLoadComplete();
      }
    }
  }

  /**
   * 检查是否所有资源都已加载完成
   */
  private checkLoadComplete(): void {
    const allLoaded = Array.from(this.resources.values()).every(r => r.loaded || !r.loading);
    if (allLoaded) {
      this.loadCompleteListeners.forEach(listener => listener());
    }
  }

  /**
   * 开始自动释放计时器
   */
  private startAutoRelease(): void {
    if (this.autoReleaseTimer) {
      clearInterval(this.autoReleaseTimer);
    }
    
    this.autoReleaseTimer = setInterval(() => {
      this.releaseUnusedResources();
    }, this.config.autoReleaseInterval);
  }

  /**
   * 停止自动释放计时器
   */
  private stopAutoRelease(): void {
    if (this.autoReleaseTimer) {
      clearInterval(this.autoReleaseTimer);
      this.autoReleaseTimer = null;
    }
  }

  /**
   * 添加进度监听器
   */
  addProgressListener(listener: (progress: ResourceLoadProgress) => void): void {
    this.progressListeners.push(listener);
  }

  /**
   * 移除进度监听器
   */
  removeProgressListener(listener: (progress: ResourceLoadProgress) => void): void {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }

  /**
   * 添加加载完成监听器
   */
  addLoadCompleteListener(listener: () => void): void {
    this.loadCompleteListeners.push(listener);
  }

  /**
   * 移除加载完成监听器
   */
  removeLoadCompleteListener(listener: () => void): void {
    this.loadCompleteListeners = this.loadCompleteListeners.filter(l => l !== listener);
  }

  /**
   * 获取资源列表
   */
  getResources(): Array<Resource> {
    return Array.from(this.resources.values());
  }

  /**
   * 获取已加载的资源数量
   */
  getLoadedCount(): number {
    return Array.from(this.resources.values()).filter(r => r.loaded).length;
  }

  /**
   * 获取总资源数量
   */
  getTotalCount(): number {
    return this.resources.size;
  }

  /**
   * 获取当前缓存大小（MB）
   */
  getCurrentCacheSizeMB(): number {
    return this.totalCacheSize / (1024 * 1024);
  }

  /**
   * 清理资源管理器
   */
  dispose(): void {
    this.stopAutoRelease();
    this.releaseAllResources();
    this.progressListeners = [];
    this.loadCompleteListeners = [];
  }
}

/**
 * 资源管理器工厂
 */
export class ResourceManagerFactory {
  /**
   * 创建资源管理器实例
   */
  static create(config?: Partial<ResourceManagerConfig>): ResourceManager {
    return new ResourceManager(config);
  }
}

/**
 * 全局资源管理器实例
 */
export const globalResourceManager = new ResourceManager();
