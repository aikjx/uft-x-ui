// 依赖注入容器

type Class<T = any> = new (...args: any[]) => T;
type Factory<T> = () => T;
type Instance<T> = T;

export type RegistrationType<T> = Class<T> | Factory<T> | Instance<T>;

export interface DependencyContainer {
  /**
   * 注册依赖
   * @param key 依赖键
   * @param registration 依赖注册项（类、工厂函数或实例）
   * @param options 注册选项
   */
  register<T>(
    key: string | symbol,
    registration: RegistrationType<T>,
    options?: {
      singleton?: boolean;
      dependencies?: (string | symbol)[];
    }
  ): void;

  /**
   * 解析依赖
   * @param key 依赖键
   * @returns 依赖实例
   */
  resolve<T>(key: string | symbol): T;

  /**
   * 检查依赖是否已注册
   * @param key 依赖键
   * @returns 是否已注册
   */
  has(key: string | symbol): boolean;

  /**
   * 清除所有依赖
   */
  clear(): void;
}

class DependencyContainerImpl implements DependencyContainer {
  private registry = new Map<string | symbol, any>();
  private instances = new Map<string | symbol, any>();

  register<T>(
    key: string | symbol,
    registration: RegistrationType<T>,
    options: {
      singleton?: boolean;
      dependencies?: (string | symbol)[];
    } = {}
  ): void {
    const {
      singleton = true,
      dependencies = []
    } = options;

    this.registry.set(key, {
      registration,
      singleton,
      dependencies
    });
  }

  resolve<T>(key: string | symbol): T {
    if (!this.registry.has(key)) {
      throw new Error(`Dependency ${String(key)} not registered`);
    }

    const { registration, singleton, dependencies } = this.registry.get(key);

    // 如果是单例且已存在实例，直接返回
    if (singleton && this.instances.has(key)) {
      return this.instances.get(key);
    }

    let instance: T;

    if (typeof registration === 'function' && registration.prototype?.constructor) {
      // 类注册
      const resolvedDependencies = dependencies.map(depKey => this.resolve(depKey));
      instance = new (registration as Class<T>)(...resolvedDependencies);
    } else if (typeof registration === 'function') {
      // 工厂函数注册
      instance = (registration as Factory<T>)();
    } else {
      // 实例注册
      instance = registration as Instance<T>;
    }

    // 如果是单例，缓存实例
    if (singleton) {
      this.instances.set(key, instance);
    }

    return instance;
  }

  has(key: string | symbol): boolean {
    return this.registry.has(key);
  }

  clear(): void {
    this.registry.clear();
    this.instances.clear();
  }
}

// 创建全局容器实例
export const container = new DependencyContainerImpl();

// 创建依赖键符号
export const DEPENDENCY_KEYS = {
  // 物理引擎相关
  PhysicsEngine: Symbol('PhysicsEngine'),
  SpacetimeStateCalculator: Symbol('SpacetimeStateCalculator'),
  GravitationalFieldCalculator: Symbol('GravitationalFieldCalculator'),
  ElectromagneticFieldCalculator: Symbol('ElectromagneticFieldCalculator'),
  UnifiedFieldCalculator: Symbol('UnifiedFieldCalculator'),
  CurvatureCache: Symbol('CurvatureCache'),

  // 渲染引擎相关
  RenderEngine: Symbol('RenderEngine'),
  SceneManager: Symbol('SceneManager'),
  CameraManager: Symbol('CameraManager'),
  Renderer: Symbol('Renderer'),

  // 性能管理相关
  PerformanceMonitor: Symbol('PerformanceMonitor'),
  AutomatedPerformanceOptimizer: Symbol('AutomatedPerformanceOptimizer'),
  PerformanceDataCollector: Symbol('PerformanceDataCollector'),

  // 交互引擎相关
  InputManager: Symbol('InputManager'),
  CameraController: Symbol('CameraController'),
  InteractionHandler: Symbol('InteractionHandler'),

  // 资源管理相关
  ResourceManager: Symbol('ResourceManager'),
  ObjectPool: Symbol('ObjectPool'),
  CacheManager: Symbol('CacheManager')
};
