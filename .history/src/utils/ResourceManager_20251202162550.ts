import { showNotification } from './index';

/**
 * 资源类型枚举
 */
export enum ResourceType {
  TEXTURE = 'texture',
  MODEL = 'model',
  SHADER = 'shader',
  AUDIO = 'audio',
  DATA = 'data',
  FONT = 'font'
}

/**
 * 资源状态枚举
 */
export enum ResourceStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * 资源项接口
 */
export interface ResourceItem<T = any> {
  id: string;
  url: string;
  type: ResourceType;
  data?: T;
  status: ResourceStatus;
  error?: string;
  size?: number;
  loadTime?: number;
}

/**
 * 资源加载选项
 */
export interface LoadOptions {
  priority?: number;
  retryCount?: number;
  retryDelay?: number;
  cache?: boolean;
  headers?: Record<string, string>;
}

/**
 * 资源管理器类
 * 用于管理资源的加载、缓存和预加载
 */
export class ResourceManager {
  private cache: Map<string, ResourceItem> = new Map();
  private loadingPromises: Map<string, Promise<ResourceItem>> = new Map();
  private preloadQueue: Array<{ item: ResourceItem; options: LoadOptions }> = [];
  private isPreloading: boolean = false;
  private maxConcurrentLoads: number = 4;
  private currentLoads: number = 0;
  private cacheEnabled: boolean = true;
  private memoryLimit: number = 50 * 1024 * 1024; // 50MB 内存限制
  private totalMemoryUsed: number = 0;

  /**
   * 构造函数
   */
  constructor(options?: {
    maxConcurrentLoads?: number;
    cacheEnabled?: boolean;
    memoryLimit?: number;
  }) {
    if (options) {
      this.maxConcurrentLoads = options.maxConcurrentLoads || 4;
      this.cacheEnabled = options.cacheEnabled !== false;
      this.memoryLimit = options.memoryLimit || 50 * 1024 * 1024;
    }
  }

  /**
   * 加载单个资源
   * @param id 资源ID
   * @param url 资源URL
   * @param type 资源类型
   * @param options 加载选项
   */
  async load<T>(
    id: string,
    url: string,
    type: ResourceType,
    options: LoadOptions = {}
  ): Promise<ResourceItem<T>> {
    // 默认选项
    const defaultOptions: LoadOptions = {
      priority: 0,
      retryCount: 3,
      retryDelay: 1000,
      cache: true,
      ...options
    };

    // 检查缓存
    if (this.cacheEnabled && defaultOptions.cache && this.cache.has(id)) {
      const cachedItem = this.cache.get(id)!;
      if (cachedItem.status === ResourceStatus.LOADED) {
        return cachedItem as ResourceItem<T>;
      }
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)! as Promise<ResourceItem<T>>;
    }

    // 创建资源项
    const resourceItem: ResourceItem<T> = {
      id,
      url,
      type,
      status: ResourceStatus.IDLE,
      data: undefined,
      error: undefined
    };

    // 创建加载Promise
    const loadPromise = this.performLoad(resourceItem, defaultOptions);
    this.loadingPromises.set(id, loadPromise);

    try {
      const result = await loadPromise;
      return result as ResourceItem<T>;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  /**
   * 执行实际的资源加载
   * @param item 资源项
   * @param options 加载选项
   */
  private async performLoad<T>(
    item: ResourceItem<T>,
    options: LoadOptions
  ): Promise<ResourceItem<T>> {
    let attempts = 0;

    while (attempts < (options.retryCount || 3)) {
      try {
        item.status = ResourceStatus.LOADING;
        const startTime = Date.now();

        // 根据资源类型选择不同的加载方式
        let data: T;
        switch (item.type) {
          case ResourceType.TEXTURE:
          case ResourceType.MODEL:
          case ResourceType.AUDIO:
          case ResourceType.FONT:
            data = await this.loadBinaryResource(item.url, options);
            break;
          case ResourceType.SHADER:
          case ResourceType.DATA:
          default:
            data = await this.loadTextResource(item.url, options);
            break;
        }

        const loadTime = Date.now() - startTime;
        item.data = data;
        item.status = ResourceStatus.LOADED;
        item.loadTime = loadTime;

        // 估算资源大小
        item.size = this.estimateResourceSize(data);
        this.totalMemoryUsed += item.size || 0;

        // 缓存资源
        if (this.cacheEnabled && options.cache) {
          this.cache.set(item.id, item);
          this.ensureMemoryLimit();
        }

        return item;
      } catch (error) {
        attempts++;
        if (attempts >= (options.retryCount || 3)) {
          item.status = ResourceStatus.ERROR;
          item.error = error instanceof Error ? error.message : 'Unknown error';
          showNotification.error(`资源加载失败: ${item.url}`);
          throw error;
        }
        // 重试延迟
        await new Promise(resolve => setTimeout(resolve, options.retryDelay || 1000));
      }
    }

    return item;
  }

  /**
   * 加载文本资源
   * @param url 资源URL
   * @param options 加载选项
   */
  private async loadTextResource(url: string, options: LoadOptions): Promise<any> {
    const response = await fetch(url, {
      headers: options.headers || {}
    });

    if (!response.ok) {
      throw new Error(`Failed to load resource: ${url} (${response.status})`);
    }

    return await response.text();
  }

  /**
   * 加载二进制资源
   * @param url 资源URL
   * @param options 加载选项
   */
  private async loadBinaryResource(url: string, options: LoadOptions): Promise<any> {
    const response = await fetch(url, {
      headers: options.headers || {}
    });

    if (!response.ok) {
      throw new Error(`Failed to load resource: ${url} (${response.status})`);
    }

    return await response.blob();
  }

  /**
   * 预加载资源
   * @param resources 资源列表
   * @param options 加载选项
   */
  preload(
    resources: Array<{
      id: string;
      url: string;
      type: ResourceType;
    }>,
    options: LoadOptions = {}
  ): void {
    // 添加到预加载队列
    resources.forEach(resource => {
      const item: ResourceItem = {
        id: resource.id,
        url: resource.url,
        type: resource.type,
        status: ResourceStatus.IDLE
      };
      this.preloadQueue.push({ item, options });
    });

    // 按优先级排序
    this.preloadQueue.sort((a, b) => {
      const priorityA = a.options.priority || 0;
      const priorityB = b.options.priority || 0;
      return priorityB - priorityA;
    });

    // 开始预加载
    if (!this.isPreloading) {
      this.startPreloading();
    }
  }

  /**
   * 开始预加载过程
   */
  private async startPreloading(): Promise<void> {
    this.isPreloading = true;

    while (this.preloadQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      this.currentLoads++;
      const { item, options } = this.preloadQueue.shift()!;

      // 异步加载，不阻塞主线程
      (async () => {
        try {
          await this.performLoad(item, options);
        } catch (error) {
          // 预加载失败不抛出错误，只记录
          console.warn(`Preload failed for ${item.url}:`, error);
        } finally {
          this.currentLoads--;
          // 继续加载下一个资源
          this.startPreloading();
        }
      })();
    }

    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
    }
  }

  /**
   * 批量加载资源
   * @param resources 资源列表
   * @param options 加载选项
   */
  async loadBatch(
    resources: Array<{
      id: string;
      url: string;
      type: ResourceType;
    }>,
    options: LoadOptions = {}
  ): Promise<ResourceItem[]> {
    const promises = resources.map(resource => 
      this.load(resource.id, resource.url, resource.type, options)
    );
    return Promise.all(promises);
  }

  /**
   * 获取已加载的资源
   * @param id 资源ID
   */
  get<T>(id: string): ResourceItem<T> | undefined {
    return this.cache.get(id) as ResourceItem<T> | undefined;
  }

  /**
   * 检查资源是否已加载
   * @param id 资源ID
   */
  isLoaded(id: string): boolean {
    const resource = this.cache.get(id);
    return resource?.status === ResourceStatus.LOADED || false;
  }

  /**
   * 移除资源
   * @param id 资源ID
   */
  remove(id: string): void {
    const resource = this.cache.get(id);
    if (resource) {
      this.totalMemoryUsed -= resource.size || 0;
      this.cache.delete(id);
    }
  }

  /**
   * 清空所有资源
   */
  clear(): void {
    this.cache.clear();
    this.totalMemoryUsed = 0;
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  /**
   * 获取资源加载状态
   */
  getStats() {
    const loaded = Array.from(this.cache.values()).filter(item => 
      item.status === ResourceStatus.LOADED
    ).length;
    const loading = Array.from(this.cache.values()).filter(item => 
      item.status === ResourceStatus.LOADING
    ).length;
    const errored = Array.from(this.cache.values()).filter(item => 
      item.status === ResourceStatus.ERROR
    ).length;

    return {
      total: this.cache.size,
      loaded,
      loading,
      errored,
      preloadQueue: this.preloadQueue.length,
      memoryUsed: this.totalMemoryUsed,
      memoryLimit: this.memoryLimit
    };
  }

  /**
   * 估算资源大小
   * @param data 资源数据
   */
  private estimateResourceSize(data: any): number {
    if (data === null || data === undefined) {
      return 0;
    }

    switch (typeof data) {
      case 'string':
        return data.length * 2; // UTF-16 估计
      case 'number':
      case 'boolean':
        return 8;
      case 'object':
        if (data instanceof Blob) {
          return data.size;
        }
        if (ArrayBuffer.isView(data)) {
          return data.byteLength;
        }
        if (data instanceof ArrayBuffer) {
          return data.byteLength;
        }
        // 粗略估计对象大小
        return JSON.stringify(data).length * 2;
      default:
        return 0;
    }
  }

  /**
   * 确保内存使用不超过限制
   */
  private ensureMemoryLimit(): void {
    if (this.totalMemoryUsed <= this.memoryLimit) {
      return;
    }

    // 按加载时间排序，移除最早加载的资源
    const resources = Array.from(this.cache.values())
      .filter(item => item.status === ResourceStatus.LOADED)
      .sort((a, b) => (a.loadTime || 0) - (b.loadTime || 0));

    // 释放资源直到内存使用在限制内
    for (const resource of resources) {
      if (this.totalMemoryUsed <= this.memoryLimit) {
        break;
      }
      this.remove(resource.id);
    }
  }

  /**
   * 预加载关键资源
   */
  preloadCriticalResources() {
    // 可以在这里添加应用的关键资源
    const criticalResources = [
      // { id: 'main-texture', url: '/textures/main-texture.png', type: ResourceType.TEXTURE },
      // { id: 'main-model', url: '/models/main-model.glb', type: ResourceType.MODEL },
      // { id: 'main-shader', url: '/shaders/main-shader.glsl', type: ResourceType.SHADER }
    ];

    this.preload(criticalResources, {
      priority: 10,
      retryCount: 5
    });
  }
}

// 创建全局资源管理器实例
export const resourceManager = new ResourceManager({
  maxConcurrentLoads: 6,
  memoryLimit: 100 * 1024 * 1024 // 100MB 内存限制
});

// 导出资源管理器工具函数
export const preloadResources = resourceManager.preload.bind(resourceManager);
export const loadResource = resourceManager.load.bind(resourceManager);
export const getResource = resourceManager.get.bind(resourceManager);
export const isResourceLoaded = resourceManager.isLoaded.bind(resourceManager);
export const preloadCritical = resourceManager.preloadCriticalResources.bind(resourceManager);
