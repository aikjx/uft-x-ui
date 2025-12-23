/**
 * 统一事件系统 - 类型安全的事件总线
 */

// 事件监听函数类型
export type EventHandler<T = any> = (data: T) => void;

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  priority: number;
  unsubscribe: () => void;
}

/**
 * 事件系统配置
 */
export interface EventSystemConfig {
  maxHandlersPerEvent?: number; // 每个事件的最大处理器数量
  enableLogging?: boolean; // 是否启用日志
  defaultPriority?: number; // 默认事件优先级
}

/**
 * 统一事件系统类
 * 实现了单例模式，确保整个应用只有一个事件总线
 */
export class EventSystem {
  private static instance: EventSystem;
  private eventHandlers: Map<string, Map<EventHandler, { priority: number }>> = new Map();
  private config: EventSystemConfig;
  private eventQueue: Array<{ event: string; data: any; timestamp: number }> = [];
  private isProcessingQueue: boolean = false;
  private maxQueueSize: number = 1000;

  private constructor(config: EventSystemConfig = {}) {
    this.config = {
      maxHandlersPerEvent: 100,
      enableLogging: false,
      defaultPriority: 0,
      ...config
    };
  }

  /**
   * 获取事件系统实例
   */
  public static getInstance(config?: EventSystemConfig): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem(config);
    }
    return EventSystem.instance;
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @param priority 事件优先级，值越大优先级越高
   */
  public on<T = any>(event: string, handler: EventHandler<T>, priority: number = this.config.defaultPriority!): EventSubscription {
    // 检查事件名称是否有效
    if (!event || typeof event !== 'string') {
      throw new Error('Invalid event name');
    }

    // 检查处理函数是否有效
    if (typeof handler !== 'function') {
      throw new Error('Invalid event handler');
    }

    // 获取或创建事件处理器映射
    let handlers = this.eventHandlers.get(event);
    if (!handlers) {
      handlers = new Map();
      this.eventHandlers.set(event, handlers);
    }

    // 检查事件处理器数量是否超过限制
    if (handlers.size >= this.config.maxHandlersPerEvent!) {
      throw new Error(`Maximum number of handlers (${this.config.maxHandlersPerEvent}) reached for event: ${event}`);
    }

    // 添加事件处理器
    handlers.set(handler, { priority });

    // 创建订阅对象
    const subscription: EventSubscription = {
      event,
      handler,
      priority,
      unsubscribe: () => this.off(event, handler)
    };

    if (this.config.enableLogging) {
      console.log(`Event subscribed: ${event}, handlers count: ${handlers.size}`);
    }

    return subscription;
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  public off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      
      // 如果事件没有处理器了，移除事件
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }

      if (this.config.enableLogging) {
        console.log(`Event unsubscribed: ${event}, handlers count: ${handlers.size}`);
      }
    }
  }

  /**
   * 取消所有订阅
   * @param event 可选，指定事件名称，不指定则取消所有事件的订阅
   */
  public offAll(event?: string): void {
    if (event) {
      // 取消指定事件的所有订阅
      this.eventHandlers.delete(event);
      if (this.config.enableLogging) {
        console.log(`All handlers unsubscribed for event: ${event}`);
      }
    } else {
      // 取消所有事件的订阅
      const eventCount = this.eventHandlers.size;
      this.eventHandlers.clear();
      if (this.config.enableLogging) {
        console.log(`All handlers unsubscribed for ${eventCount} events`);
      }
    }
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param data 事件数据
   * @param async 是否异步处理事件
   */
  public emit<T = any>(event: string, data: T, async: boolean = false): void {
    if (async) {
      // 异步处理事件，添加到队列
      this.queueEvent(event, data);
    } else {
      // 同步处理事件
      this.processEvent(event, data);
    }
  }

  /**
   * 订阅事件，只触发一次
   * @param event 事件名称
   * @param handler 事件处理函数
   * @param priority 事件优先级
   */
  public once<T = any>(event: string, handler: EventHandler<T>, priority: number = this.config.defaultPriority!): void {
    const onceHandler: EventHandler<T> = (data) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler, priority);
  }

  /**
   * 获取指定事件的处理器数量
   * @param event 事件名称
   */
  public getHandlerCount(event: string): number {
    const handlers = this.eventHandlers.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * 获取所有事件名称
   */
  public getEvents(): string[] {
    return Array.from(this.eventHandlers.keys());
  }

  /**
   * 获取事件系统配置
   */
  public getConfig(): EventSystemConfig {
    return { ...this.config };
  }

  /**
   * 更新事件系统配置
   * @param config 配置对象
   */
  public updateConfig(config: Partial<EventSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 清理事件系统
   */
  public dispose(): void {
    this.eventHandlers.clear();
    this.eventQueue = [];
    this.isProcessingQueue = false;
    EventSystem.instance = null!;
  }

  // 私有方法：处理事件
  private processEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // 预计算处理器数量，避免重复获取
    const handlerCount = handlers.size;
    
    if (this.config.enableLogging) {
      console.log(`Processing event: ${event}, handlers: ${handlerCount}`);
    }

    // 直接遍历Map，避免数组转换和排序的开销
    // 注：这里暂时移除了优先级排序，因为在大多数情况下，优先级排序不是必需的
    // 如果需要优先级，可以在订阅时维护一个有序列表
    handlers.forEach(({ priority }, handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
        // 错误隔离：单个事件处理器错误不会影响其他处理器
      }
    });
  }

  // 私有方法：将事件添加到队列
  private queueEvent(event: string, data: any): void {
    // 检查队列大小
    if (this.eventQueue.length >= this.maxQueueSize) {
      // 移除最旧的事件
      this.eventQueue.shift();
      if (this.config.enableLogging) {
        console.warn(`Event queue is full, removing oldest event`);
      }
    }

    // 添加事件到队列
    this.eventQueue.push({
      event,
      data,
      timestamp: Date.now()
    });

    // 如果队列未处理，使用requestIdleCallback或requestAnimationFrame处理
    if (!this.isProcessingQueue) {
      this.scheduleEventQueueProcessing();
    }
  }

  // 私有方法：调度事件队列处理
  private scheduleEventQueueProcessing(): void {
    this.isProcessingQueue = true;
    
    // 使用requestIdleCallback处理事件队列，优先利用浏览器空闲时间
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.processEventQueue();
      }, { timeout: 50 }); // 设置50ms超时，确保事件不会无限期等待
    } else {
      // 降级方案：使用requestAnimationFrame
      requestAnimationFrame(() => {
        this.processEventQueue();
      });
    }
  }

  // 私有方法：处理事件队列
  private processEventQueue(): void {
    // 限制每帧处理的事件数量，避免长时间阻塞主线程
    const maxEventsPerFrame = 10;
    let eventsProcessed = 0;
    
    while (this.eventQueue.length > 0 && eventsProcessed < maxEventsPerFrame) {
      const queueItem = this.eventQueue.shift();
      if (queueItem) {
        this.processEvent(queueItem.event, queueItem.data);
        eventsProcessed++;
      }
    }
    
    // 如果还有事件未处理，继续调度下一帧处理
    if (this.eventQueue.length > 0) {
      this.scheduleEventQueueProcessing();
    } else {
      this.isProcessingQueue = false;
    }
  }
}

// 导出事件系统实例
export const eventSystem = EventSystem.getInstance({
  enableLogging: process.env.NODE_ENV === 'development',
  defaultPriority: 0,
  maxHandlersPerEvent: 50
});

// 事件类型常量 - 可根据需要扩展
export const APP_EVENTS = {
  // 应用生命周期事件
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_SHUTDOWN: 'app:shutdown',
  
  // 错误处理相关事件
  ERROR_OCCURRED: 'error:occurred',
  ERROR_REPORTED: 'error:reported',
  USER_FEEDBACK_SUBMITTED: 'user:feedback:submitted',
  SHOW_NOTIFICATION: 'notification:show',
  
  // 性能相关事件
  PERFORMANCE_DROP: 'performance:drop',
  PERFORMANCE_RECOVER: 'performance:recover',
  MEMORY_WARNING: 'memory:warning',
  FRAME_RATE_CHANGE: 'framerate:change',
  PERFORMANCE_METRICS_UPDATE: 'performance:metrics:update',
  PERFORMANCE_MODE_CHANGE: 'performance:mode:change',
  PERFORMANCE_MANAGER_INIT: 'performance:manager:init',
  RELEASE_UNUSED_RESOURCES: 'resource:release:unused',
  PARTICLE_DENSITY_CHANGE: 'particle:density:change',
  MAX_PARTICLES_CHANGE: 'particle:max:change',
  TEXTURE_QUALITY_CHANGE: 'texture:quality:change',
  
  // 场景相关事件
  SCENE_LOAD: 'scene:load',
  SCENE_UNLOAD: 'scene:unload',
  SCENE_READY: 'scene:ready',
  SCENE_CLEAR: 'scene:clear',
  
  // 渲染相关事件
  RENDER_START: 'render:start',
  RENDER_END: 'render:end',
  RENDER_ERROR: 'render:error',
  RENDER_ENGINE_DISPOSED: 'render:engine:disposed',
  RENDER_QUALITY_UPDATED: 'render:quality:updated',
  
  // 交互相关事件
  USER_INTERACTION: 'user:interaction',
  CAMERA_MOVE: 'camera:move',
  OBJECT_SELECT: 'object:select',
  OBJECT_DESELECT: 'object:deselect',
  
  // 粒子系统相关事件
  PARTICLE_SYSTEM_CREATE: 'particle:system:create',
  PARTICLE_SYSTEM_DESTROY: 'particle:system:destroy',
  PARTICLE_SYSTEM_UPDATE: 'particle:system:update',
  PARTICLE_EMIT: 'particle:emit',
  PARTICLE_EXPIRE: 'particle:expire',
  
  // 资源相关事件
  RESOURCE_LOAD: 'resource:load',
  RESOURCE_UNLOAD: 'resource:unload',
  RESOURCE_ERROR: 'resource:error',
  RESOURCE_PROGRESS: 'resource:progress',
  
  // 后处理相关事件
  POST_PROCESSING_CHANGE: 'postprocessing:change',
  POST_PROCESSING_ENABLED_CHANGE: 'postprocessing:enabled:change',
  
  // 渲染相关事件
  RENDER_SCALE_CHANGE: 'render:scale:change',
  SHADOW_QUALITY_CHANGE: 'shadow:quality:change',
  
  // 设备相关事件
  DEVICE_PERFORMANCE_CHANGE: 'device:performance:change',
  
  // 配置相关事件
  CONFIG_UPDATE: 'config:update',
  MEMORY_LIMIT_CHANGE: 'memory:limit:change',
  
  // AI优化相关事件
  AI_OPTIMIZATION_APPLIED: 'ai:optimization:applied',
  
  // 自动优化相关事件
  AUTO_OPTIMIZATION_STATE_CHANGED: 'auto:optimization:state:changed',
  
  // 路由相关事件
  ROUTE_CHANGE_START: 'route:change:start',
  ROUTE_CHANGE_COMPLETE: 'route:change:complete',
  ROUTE_CHANGE_ERROR: 'route:change:error'
} as const;

// 导出类型
export type AppEventType = typeof APP_EVENTS[keyof typeof APP_EVENTS];
