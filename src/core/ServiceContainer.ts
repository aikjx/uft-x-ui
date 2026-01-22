/**
 * 服务容器
 * 提供依赖注入和服务管理功能
 */

import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 定义服务生命周期枚举
export enum ServiceLifecycle {
  UNREGISTERED = 'unregistered',
  REGISTERED = 'registered',
  INITIALIZED = 'initialized',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

// 定义服务接口
export interface Service {
  id: string
  name: string
  version: string
  description: string
  lifecycle: ServiceLifecycle
  priority: number
  singleton: boolean
  instance?: any
  factory?: Function
  dependencies?: string[]
  metadata?: Record<string, any>
}

// 定义服务容器配置接口
export interface ServiceContainerConfig {
  autoInitialize?: boolean
  enableDependencyInjection?: boolean
  enableServiceValidation?: boolean
  maxServices?: number
}

/**
 * 服务容器
 */
export class ServiceContainer {
  private services: Map<string, Service> = new Map()
  private serviceInstances: Map<string, any> = new Map()
  private config: ServiceContainerConfig
  private initialized: boolean = false

  constructor(config: ServiceContainerConfig = {}) {
    this.config = {
      autoInitialize: config.autoInitialize || true,
      enableDependencyInjection: config.enableDependencyInjection || true,
      enableServiceValidation: config.enableServiceValidation || true,
      maxServices: config.maxServices || 50
    }
  }

  /**
   * 注册服务
   */
  public registerService(service: Service): boolean {
    // 检查服务数量限制
    if (this.services.size >= this.config.maxServices) {
      console.error('Service limit reached')
      return false
    }

    // 检查服务是否已存在
    if (this.services.has(service.id)) {
      console.warn(`Service ${service.id} already registered`)
      return false
    }

    // 验证服务
    if (!this.validateService(service)) {
      return false
    }

    // 注册服务
    service.lifecycle = ServiceLifecycle.REGISTERED
    this.services.set(service.id, service)

    // 触发服务注册事件
    eventSystem.emit(APP_EVENTS.SERVICE_REGISTERED, service)

    // 自动初始化
    if (this.config.autoInitialize) {
      this.initializeService(service.id)
    }

    return true
  }

  /**
   * 注册服务工厂
   */
  public registerServiceFactory(
    id: string,
    name: string,
    factory: Function,
    options: {
      version?: string
      description?: string
      singleton?: boolean
      dependencies?: string[]
      priority?: number
      metadata?: Record<string, any>
    } = {}
  ): boolean {
    const service: Service = {
      id,
      name,
      version: options.version || '1.0.0',
      description: options.description || '',
      lifecycle: ServiceLifecycle.UNREGISTERED,
      priority: options.priority || 0,
      singleton: options.singleton !== false,
      factory,
      dependencies: options.dependencies || [],
      metadata: options.metadata || {}
    }

    return this.registerService(service)
  }

  /**
   * 注销服务
   */
  public unregisterService(serviceId: string): boolean {
    const service = this.services.get(serviceId)
    
    if (!service) {
      return false
    }

    // 销毁服务实例
    this.destroyServiceInstance(serviceId)

    // 移除服务
    this.services.delete(serviceId)

    // 触发服务注销事件
    eventSystem.emit(APP_EVENTS.SERVICE_UNREGISTERED, service)

    return true
  }

  /**
   * 初始化服务
   */
  public initializeService(serviceId: string): boolean {
    const service = this.services.get(serviceId)
    
    if (!service) {
      return false
    }

    // 检查依赖
    if (!this.checkServiceDependencies(service)) {
      return false
    }

    try {
      // 创建服务实例
      const instance = this.createServiceInstance(service)
      
      if (instance) {
        service.instance = instance
        service.lifecycle = ServiceLifecycle.INITIALIZED

        // 存储实例
        if (service.singleton) {
          this.serviceInstances.set(serviceId, instance)
        }

        // 触发服务初始化事件
        eventSystem.emit(APP_EVENTS.SERVICE_INITIALIZED, service)

        return true
      }
    } catch (error) {
      console.error(`Error initializing service ${serviceId}:`, error)
      service.lifecycle = ServiceLifecycle.ERROR
    }

    return false
  }

  /**
   * 启动服务
   */
  public startService(serviceId: string): boolean {
    const service = this.services.get(serviceId)
    
    if (!service) {
      return false
    }

    // 确保服务已初始化
    if (service.lifecycle !== ServiceLifecycle.INITIALIZED) {
      if (!this.initializeService(serviceId)) {
        return false
      }
    }

    try {
      // 调用服务启动方法
      if (service.instance && typeof service.instance.start === 'function') {
        service.instance.start()
      }

      service.lifecycle = ServiceLifecycle.ACTIVE

      // 触发服务启动事件
      eventSystem.emit(APP_EVENTS.SERVICE_STARTED, service)

      return true
    } catch (error) {
      console.error(`Error starting service ${serviceId}:`, error)
      service.lifecycle = ServiceLifecycle.ERROR
      return false
    }
  }

  /**
   * 停止服务
   */
  public stopService(serviceId: string): boolean {
    const service = this.services.get(serviceId)
    
    if (!service) {
      return false
    }

    try {
      // 调用服务停止方法
      if (service.instance && typeof service.instance.stop === 'function') {
        service.instance.stop()
      }

      service.lifecycle = ServiceLifecycle.INACTIVE

      // 触发服务停止事件
      eventSystem.emit(APP_EVENTS.SERVICE_STOPPED, service)

      return true
    } catch (error) {
      console.error(`Error stopping service ${serviceId}:`, error)
      return false
    }
  }

  /**
   * 获取服务
   */
  public getService(serviceId: string): any {
    // 检查服务是否存在
    const service = this.services.get(serviceId)
    
    if (!service) {
      console.warn(`Service ${serviceId} not found`)
      return null
    }

    // 确保服务已初始化
    if (service.lifecycle === ServiceLifecycle.REGISTERED) {
      this.initializeService(serviceId)
    }

    // 对于单例服务，返回存储的实例
    if (service.singleton) {
      return this.serviceInstances.get(serviceId)
    }

    // 对于非单例服务，创建新实例
    return this.createServiceInstance(service)
  }

  /**
   * 获取所有服务
   */
  public getServices(): Map<string, Service> {
    return this.services
  }

  /**
   * 获取服务元数据
   */
  public getServiceMetadata(serviceId: string): Record<string, any> | null {
    const service = this.services.get(serviceId)
    return service?.metadata || null
  }

  /**
   * 创建服务实例
   */
  private createServiceInstance(service: Service): any {
    try {
      if (service.factory) {
        // 使用工厂函数创建实例
        const dependencies = this.resolveServiceDependencies(service)
        return service.factory(...dependencies)
      } else if (service.instance) {
        // 使用已提供的实例
        return service.instance
      }
    } catch (error) {
      console.error(`Error creating service instance:`, error)
    }

    return null
  }

  /**
   * 解析服务依赖
   */
  private resolveServiceDependencies(service: Service): any[] {
    const dependencies: any[] = []
    
    if (service.dependencies && this.config.enableDependencyInjection) {
      for (const depId of service.dependencies) {
        const dep = this.getService(depId)
        if (dep) {
          dependencies.push(dep)
        } else {
          console.warn(`Dependency ${depId} not found for service ${service.id}`)
          dependencies.push(null)
        }
      }
    }
    
    return dependencies
  }

  /**
   * 检查服务依赖
   */
  private checkServiceDependencies(service: Service): boolean {
    if (!service.dependencies) {
      return true
    }

    for (const depId of service.dependencies) {
      if (!this.services.has(depId)) {
        console.warn(`Service ${service.id} missing dependency: ${depId}`)
        return false
      }
    }

    return true
  }

  /**
   * 验证服务
   */
  private validateService(service: Service): boolean {
    if (!this.config.enableServiceValidation) {
      return true
    }

    // 验证服务基本信息
    if (!service.id || !service.name || !service.version) {
      console.error('Invalid service: missing required fields')
      return false
    }

    // 验证服务工厂
    if (!service.instance && !service.factory) {
      console.error(`Service ${service.id} must have either an instance or a factory`)
      return false
    }

    return true
  }

  /**
   * 销毁服务实例
   */
  private destroyServiceInstance(serviceId: string): void {
    const instance = this.serviceInstances.get(serviceId)
    
    if (instance && typeof instance.dispose === 'function') {
      try {
        instance.dispose()
      } catch (error) {
        console.error(`Error disposing service instance:`, error)
      }
    }

    this.serviceInstances.delete(serviceId)
  }

  /**
   * 初始化服务容器
   */
  public initialize(): void {
    if (this.initialized) {
      return
    }

    // 初始化所有服务
    this.services.forEach(service => {
      if (service.lifecycle === ServiceLifecycle.REGISTERED) {
        this.initializeService(service.id)
      }
    })

    this.initialized = true

    // 触发服务容器初始化事件
    eventSystem.emit(APP_EVENTS.SERVICE_CONTAINER_INITIALIZED, this)
  }

  /**
   * 销毁服务容器
   */
  public dispose(): void {
    // 停止所有服务
    this.services.forEach(service => {
      if (service.lifecycle === ServiceLifecycle.ACTIVE) {
        this.stopService(service.id)
      }
    })

    // 销毁所有服务实例
    this.serviceInstances.forEach((instance, serviceId) => {
      this.destroyServiceInstance(serviceId)
    })

    // 清空服务
    this.services.clear()

    // 触发服务容器销毁事件
    eventSystem.emit(APP_EVENTS.SERVICE_CONTAINER_DISPOSED)
  }

  /**
   * 启动所有服务
   */
  public startAllServices(): void {
    this.services.forEach(service => {
      if (service.lifecycle === ServiceLifecycle.INITIALIZED) {
        this.startService(service.id)
      }
    })
  }

  /**
   * 停止所有服务
   */
  public stopAllServices(): void {
    this.services.forEach(service => {
      if (service.lifecycle === ServiceLifecycle.ACTIVE) {
        this.stopService(service.id)
      }
    })
  }

  /**
   * 获取服务统计信息
   */
  public getStats(): Record<string, any> {
    const stats = {
      totalServices: this.services.size,
      initializedServices: 0,
      activeServices: 0,
      inactiveServices: 0,
      errorServices: 0,
      servicesByLifecycle: {} as Record<string, number>
    }

    this.services.forEach(service => {
      stats.servicesByLifecycle[service.lifecycle] = (stats.servicesByLifecycle[service.lifecycle] || 0) + 1
      
      switch (service.lifecycle) {
        case ServiceLifecycle.INITIALIZED:
          stats.initializedServices++
          break
        case ServiceLifecycle.ACTIVE:
          stats.activeServices++
          break
        case ServiceLifecycle.INACTIVE:
          stats.inactiveServices++
          break
        case ServiceLifecycle.ERROR:
          stats.errorServices++
          break
      }
    })

    return stats
  }
}

// 导出单例实例
export const serviceContainer = new ServiceContainer()

// 导出便捷函数
export const registerService = (service: Service) => serviceContainer.registerService(service)
export const registerServiceFactory = (id: string, name: string, factory: Function, options?: any) => 
  serviceContainer.registerServiceFactory(id, name, factory, options)
export const getService = (serviceId: string) => serviceContainer.getService(serviceId)
export const unregisterService = (serviceId: string) => serviceContainer.unregisterService(serviceId)
export const startService = (serviceId: string) => serviceContainer.startService(serviceId)
export const stopService = (serviceId: string) => serviceContainer.stopService(serviceId)
export const getServices = () => serviceContainer.getServices()