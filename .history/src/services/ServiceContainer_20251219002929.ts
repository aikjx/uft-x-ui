/**
 * 服务容器 - 高级依赖注入框架
 * 支持构造函数注入、属性注入、作用域管理和自动依赖解析
 */

// 导入reflect-metadata以支持元数据反射
import 'reflect-metadata';

export enum ServiceLifetime {
  /** 单例模式 - 整个应用生命周期内只创建一个实例 */
  SINGLETON = 'singleton',
  /** 原型模式 - 每次请求都创建新实例 */
  TRANSIENT = 'transient',
  /** 请求作用域 - 每个请求创建一个实例 */
  SCOPED = 'scoped'
}

export interface ServiceDescriptor {
  /** 服务类型或令牌 */
  token: string | symbol | Function;
  /** 服务实现类型 */
  implementation: Function;
  /** 服务生命周期 */
  lifetime: ServiceLifetime;
  /** 服务依赖 */
  dependencies?: string[];
  /** 工厂函数，用于自定义实例创建 */
  factory?: (container: ServiceContainer) => any;
}

export class ServiceContainer {
  private static instance: ServiceContainer;
  
  /** 服务描述符映射 */
  private serviceDescriptors: Map<string | symbol | Function, ServiceDescriptor> = new Map();
  
  /** 单例实例缓存 */
  private singletonInstances: Map<string | symbol | Function, any> = new Map();
  
  /** 当前作用域实例缓存 */
  private scopedInstances: Map<string | symbol | Function, any> = new Map();
  
  private constructor() {}
  
  /**
   * 获取服务容器实例（单例模式）
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  /**
   * 注册服务
   */
  public register<T>(
    token: string | symbol | Function,
    implementation: Function,
    options?: {
      lifetime?: ServiceLifetime;
      dependencies?: string[];
      factory?: (container: ServiceContainer) => T;
    }
  ): void {
    const { 
      lifetime = ServiceLifetime.SINGLETON,
      dependencies = [],
      factory 
    } = options || {};
    
    const descriptor: ServiceDescriptor = {
      token,
      implementation,
      lifetime,
      dependencies,
      factory
    };
    
    this.serviceDescriptors.set(token, descriptor);
    
    // 如果是单例且已有实例，清除缓存
    if (lifetime === ServiceLifetime.SINGLETON && this.singletonInstances.has(token)) {
      this.singletonInstances.delete(token);
    }
  }
  
  /**
   * 注册服务实例
   */
  public registerInstance<T>(token: string | symbol | Function, instance: T): void {
    this.singletonInstances.set(token, instance);
    
    // 注册一个简单的描述符，指向已创建的实例
    this.serviceDescriptors.set(token, {
      token,
      implementation: () => instance,
      lifetime: ServiceLifetime.SINGLETON
    });
  }
  
  /**
   * 解析服务
   */
  public resolve<T>(token: string | symbol | Function): T {
    const descriptor = this.serviceDescriptors.get(token);
    
    if (!descriptor) {
      throw new Error(`Service ${String(token)} is not registered`);
    }
    
    // 根据生命周期获取或创建实例
    switch (descriptor.lifetime) {
      case ServiceLifetime.SINGLETON:
        return this.getOrCreateSingletonInstance<T>(descriptor);
      case ServiceLifetime.TRANSIENT:
        return this.createInstance<T>(descriptor);
      case ServiceLifetime.SCOPED:
        return this.getOrCreateScopedInstance<T>(descriptor);
      default:
        throw new Error(`Unknown service lifetime: ${descriptor.lifetime}`);
    }
  }
  
  /**
   * 检查服务是否已注册
   */
  public isRegistered(token: string | symbol | Function): boolean {
    return this.serviceDescriptors.has(token);
  }
  
  /**
   * 移除服务
   */
  public remove(token: string | symbol | Function): void {
    this.serviceDescriptors.delete(token);
    this.singletonInstances.delete(token);
    this.scopedInstances.delete(token);
  }
  
  /**
   * 清除所有服务
   */
  public clear(): void {
    this.serviceDescriptors.clear();
    this.singletonInstances.clear();
    this.scopedInstances.clear();
  }
  
  /**
   * 获取或创建单例实例
   */
  private getOrCreateSingletonInstance<T>(descriptor: ServiceDescriptor): T {
    if (this.singletonInstances.has(descriptor.token)) {
      return this.singletonInstances.get(descriptor.token) as T;
    }
    
    const instance = this.createInstance<T>(descriptor);
    this.singletonInstances.set(descriptor.token, instance);
    return instance;
  }
  
  /**
   * 获取或创建作用域实例
   */
  private getOrCreateScopedInstance<T>(descriptor: ServiceDescriptor): T {
    if (this.scopedInstances.has(descriptor.token)) {
      return this.scopedInstances.get(descriptor.token) as T;
    }
    
    const instance = this.createInstance<T>(descriptor);
    this.scopedInstances.set(descriptor.token, instance);
    return instance;
  }
  
  /**
   * 创建服务实例
   */
  private createInstance<T>(descriptor: ServiceDescriptor): T {
    // 如果有工厂函数，使用工厂函数创建实例
    if (descriptor.factory) {
      return descriptor.factory(this) as T;
    }
    
    const { implementation, dependencies = [] } = descriptor;
    
    // 解析所有依赖
    const resolvedDependencies = dependencies.map(dep => {
      if (typeof dep === 'string') {
        return this.resolve(dep);
      }
      return this.resolve(dep);
    });
    
    // 创建实例
    try {
      const instance = new (implementation as any)(...resolvedDependencies);
      return instance as T;
    } catch (error) {
      throw new Error(`Failed to create instance for service ${String(descriptor.token)}: ${error}`);
    }
  }
  
  /**
   * 自动扫描并注册服务
   * @param modules 包含服务的模块数组
   */
  public autoRegister(modules: any[]): void {
    modules.forEach(module => {
      // 扫描模块中的所有导出
      for (const [key, value] of Object.entries(module)) {
        if (typeof value === 'function' && value.prototype && value.prototype.constructor) {
          // 检查是否有@Injectable装饰器
          if (Reflect.getMetadata && Reflect.getMetadata('injectable', value)) {
            this.register(value, value, {
              lifetime: Reflect.getMetadata('lifetime', value) || ServiceLifetime.SINGLETON,
              dependencies: Reflect.getMetadata('dependencies', value) || []
            });
          }
        }
      }
    });
  }
  
  /**
   * 初始化所有服务（调用initialize方法，如果存在）
   */
  public async initializeAllServices(): Promise<void> {
    const initializationPromises: Promise<void>[] = [];
    
    // 收集所有需要初始化的服务
    this.serviceDescriptors.forEach((descriptor) => {
      try {
        const instance = this.resolve(descriptor.token);
        // 使用类型断言解决类型检查问题
        const serviceInstance = instance as any;
        if (serviceInstance && typeof serviceInstance.initialize === 'function') {
          initializationPromises.push(Promise.resolve(serviceInstance.initialize()));
        }
      } catch (error) {
        console.error(`Failed to initialize service ${String(descriptor.token)}:`, error);
      }
    });
    
    // 等待所有初始化完成
    await Promise.allSettled(initializationPromises);
  }
  
  /**
   * 销毁所有服务（调用dispose方法，如果存在）
   */
  public disposeAllServices(): void {
    // 销毁顺序：先销毁作用域实例，再销毁单例实例
    this.scopedInstances.forEach((instance) => {
      if (instance && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
        } catch (error) {
          console.error('Failed to dispose service instance:', error);
        }
      }
    });
    
    this.singletonInstances.forEach((instance) => {
      if (instance && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
        } catch (error) {
          console.error('Failed to dispose service instance:', error);
        }
      }
    });
    
    // 清除所有实例缓存
    this.scopedInstances.clear();
    this.singletonInstances.clear();
  }
}

/**
 * 服务容器实例
 */
export const serviceContainer = ServiceContainer.getInstance();

/**
 * 可注入装饰器 - 标记类为可注入服务
 */
export function Injectable(options?: {
  lifetime?: ServiceLifetime;
  dependencies?: any[];
}) {
  return function (target: Function) {
    // 使用Reflect.metadata存储服务元数据
    // 注意：需要在tsconfig.json中启用experimentalDecorators和emitDecoratorMetadata
    Reflect.defineMetadata('injectable', true, target);
    Reflect.defineMetadata('lifetime', options?.lifetime || ServiceLifetime.SINGLETON, target);
    Reflect.defineMetadata('dependencies', options?.dependencies || [], target);
  };
}

/**
 * 依赖装饰器 - 标记构造函数参数为依赖
 */
export function Inject(token: string | symbol | Function) {
  return function (target: Function, propertyKey: string | symbol, parameterIndex: number) {
    // 获取现有依赖
    const dependencies = Reflect.getMetadata('dependencies', target) || [];
    dependencies[parameterIndex] = token;
    Reflect.defineMetadata('dependencies', dependencies, target);
  };
}

/**
 * 属性注入装饰器 - 标记属性为依赖
 */
export function InjectProperty(token: string | symbol | Function) {
  return function (target: any, propertyKey: string | symbol) {
    // 获取现有属性依赖
    const propertyDependencies = Reflect.getMetadata('propertyDependencies', target.constructor) || {};
    propertyDependencies[propertyKey] = token;
    Reflect.defineMetadata('propertyDependencies', propertyDependencies, target.constructor);
    
    // 定义属性访问器
    Object.defineProperty(target, propertyKey, {
      get: function() {
        // 延迟注入
        if (!this[`_${String(propertyKey)}`]) {
          this[`_${String(propertyKey)}`] = serviceContainer.resolve(token);
        }
        return this[`_${String(propertyKey)}`];
      },
      enumerable: true,
      configurable: true
    });
  };
}
