/**
 * 服务管理器
 * 负责服务的注册、发现和依赖管理
 */

export interface Service {
  /**
   * 服务初始化方法
   */
  initialize?(): Promise<void> | void

  /**
   * 服务销毁方法
   */
  dispose?(): void

  /**
   * 服务名称
   */
  readonly serviceName: string
}

export class ServiceManager {
  private static instance: ServiceManager
  private services: Map<string, Service> = new Map()
  private dependencies: Map<string, Set<string>> = new Map()

  private constructor() {}

  /**
   * 获取服务管理器实例
   */
  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager()
    }
    return ServiceManager.instance
  }

  /**
   * 注册服务
   */
  public register<T extends Service>(service: T, dependencies: string[] = []): void {
    const serviceName = service.serviceName

    if (this.services.has(serviceName)) {
      console.warn(`Service ${serviceName} is already registered`)
      return
    }

    this.services.set(serviceName, service)
    this.dependencies.set(serviceName, new Set(dependencies))

    console.log(`🔧 Service registered: ${serviceName}`)
  }

  /**
   * 获取服务
   */
  public get<T extends Service>(serviceName: string): T | null {
    return (this.services.get(serviceName) as T) || null
  }

  /**
   * 获取所有服务
   */
  public getAllServices(): Service[] {
    return Array.from(this.services.values())
  }

  /**
   * 初始化所有服务
   */
  public async initializeAllServices(): Promise<void> {
    const sortedServices = this.topologicalSort()

    for (const serviceName of sortedServices) {
      const service = this.services.get(serviceName)
      if (service && service.initialize) {
        try {
          await service.initialize()
          console.log(`🚀 Service initialized: ${serviceName}`)
        } catch (error) {
          console.error(`❌ Failed to initialize service ${serviceName}:`, error)
        }
      }
    }
  }

  /**
   * 销毁所有服务
   */
  public disposeAllServices(): void {
    const sortedServices = this.topologicalSort().reverse()

    for (const serviceName of sortedServices) {
      const service = this.services.get(serviceName)
      if (service && service.dispose) {
        try {
          service.dispose()
          console.log(`💥 Service disposed: ${serviceName}`)
        } catch (error) {
          console.error(`❌ Failed to dispose service ${serviceName}:`, error)
        }
      }
    }

    this.services.clear()
    this.dependencies.clear()
  }

  /**
   * 检查服务是否已注册
   */
  public isRegistered(serviceName: string): boolean {
    return this.services.has(serviceName)
  }

  /**
   * 移除服务
   */
  public remove(serviceName: string): void {
    this.services.delete(serviceName)
    this.dependencies.delete(serviceName)

    // 移除所有依赖于该服务的依赖关系
    for (const [depServiceName, deps] of this.dependencies.entries()) {
      deps.delete(serviceName)
    }

    console.log(`🗑️  Service removed: ${serviceName}`)
  }

  /**
   * 拓扑排序，确保服务按依赖顺序初始化
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const result: string[] = []

    const dfs = (serviceName: string) => {
      if (visiting.has(serviceName)) {
        throw new Error(`Circular dependency detected: ${serviceName}`)
      }

      if (visited.has(serviceName)) {
        return
      }

      visiting.add(serviceName)

      const deps = this.dependencies.get(serviceName) || new Set()
      for (const dep of deps) {
        dfs(dep)
      }

      visiting.delete(serviceName)
      visited.add(serviceName)
      result.push(serviceName)
    }

    for (const serviceName of this.services.keys()) {
      dfs(serviceName)
    }

    return result
  }
}

/**
 * 服务管理器实例
 */
export const serviceManager = ServiceManager.getInstance()
