/**
 * 插件系统核心
 * 提供模块化架构和插件管理功能
 * 优化版本：添加高级功能、更好的文档和性能监控
 */

import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import { TextureCompressionSystem } from '../utils/TextureCompressionSystem'

// 定义插件类型枚举
export enum PluginType {
  VISUALIZATION = 'visualization',
  RENDERING = 'rendering',
  PHYSICS = 'physics',
  UI = 'ui',
  INTERACTION = 'interaction',
  PERFORMANCE = 'performance',
  RESOURCE = 'resource',
  OTHER = 'other'
}

// 定义插件生命周期枚举
export enum PluginLifecycle {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  INITIALIZED = 'initialized',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

// 定义插件接口
export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  type: PluginType
  author?: string
  dependencies?: string[]
  lifecycle: PluginLifecycle
  priority: number
  enabled: boolean
  metadata?: Record<string, any>
  config?: Record<string, any>
  apiVersion?: string
  entryPoint?: string
  permissions?: string[]
}

// 定义插件上下文接口
export interface PluginContext {
  renderEngine?: any
  sceneManager?: any
  cameraManager?: any
  physicsEngine?: any
  uiManager?: any
  resourceManager?: any
  performanceManager?: any
  textureCompressionSystem?: TextureCompressionSystem
  eventSystem: typeof eventSystem
  registerHook: (hookName: string, callback: Function) => void
  unregisterHook: (hookName: string, callback: Function) => void
  emitEvent: (eventName: string, data?: any) => void
  onEvent: (eventName: string, callback: Function) => void
  offEvent: (eventName: string, callback: Function) => void
  getService: (serviceName: string) => any
  registerService: (serviceName: string, service: any) => void
  unregisterService: (serviceName: string) => void
  getConfig: (pluginId: string) => Record<string, any> | undefined
  setConfig: (pluginId: string, config: Record<string, any>) => void
  getPlugin: (pluginId: string) => Plugin | undefined
  getPlugins: () => Map<string, Plugin>
}

// 定义插件钩子类型
export type PluginHook = (context: PluginContext, ...args: any[]) => any

// 定义插件钩子接口
export interface PluginHooks {
  [key: string]: PluginHook[]
}

// 定义插件管理器配置接口
export interface PluginManagerConfig {
  autoLoadPlugins?: boolean
  pluginDirectory?: string
  enableHotReload?: boolean
  enablePluginValidation?: boolean
  maxPlugins?: number
  enablePerformanceMonitoring?: boolean
  enableSecurityValidation?: boolean
  enableVersionManagement?: boolean
}

// 定义插件性能数据接口
export interface PluginPerformanceData {
  loadTime: number
  enableTime: number
  disableTime: number
  unloadTime: number
  memoryUsage: number
  cpuUsage: number
  hooksExecuted: number
  eventsEmitted: number
}

// 定义插件依赖图接口
export interface PluginDependencyGraph {
  [pluginId: string]: {
    dependencies: string[]
    dependents: string[]
  }
}

/**
 * 插件管理器
 * 高级版本：添加性能监控、配置管理、依赖解析等功能
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private pluginInstances: Map<string, any> = new Map()
  private hooks: PluginHooks = {}
  private services: Map<string, any> = new Map()
  private context: PluginContext
  private config: PluginManagerConfig
  private pluginLoaders: Map<string, Function> = new Map()
  private pluginConfigs: Map<string, Record<string, any>> = new Map()
  private performanceData: Map<string, PluginPerformanceData> = new Map()
  private dependencyGraph: PluginDependencyGraph = {}
  private pluginPermissions: Map<string, string[]> = new Map()
  private apiVersion: string = '1.0.0'

  constructor(config: PluginManagerConfig = {}) {
    this.config = {
      autoLoadPlugins: config.autoLoadPlugins || false,
      pluginDirectory: config.pluginDirectory || './plugins',
      enableHotReload: config.enableHotReload || false,
      enablePluginValidation: config.enablePluginValidation || true,
      maxPlugins: config.maxPlugins || 100,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring || true,
      enableSecurityValidation: config.enableSecurityValidation || true,
      enableVersionManagement: config.enableVersionManagement || true
    }

    // 创建插件上下文
    this.context = {
      eventSystem,
      registerHook: (hookName: string, callback: Function) => this.registerHook(hookName, callback),
      unregisterHook: (hookName: string, callback: Function) =>
        this.unregisterHook(hookName, callback),
      emitEvent: (eventName: string, data?: any) => eventSystem.emit(eventName, data),
      onEvent: (eventName: string, callback: Function) => eventSystem.on(eventName, callback),
      offEvent: (eventName: string, callback: Function) => eventSystem.off(eventName, callback),
      getService: (serviceName: string) => this.getService(serviceName),
      registerService: (serviceName: string, service: any) =>
        this.registerService(serviceName, service),
      unregisterService: (serviceName: string) => this.unregisterService(serviceName),
      getConfig: (pluginId: string) => this.getPluginConfig(pluginId),
      setConfig: (pluginId: string, config: Record<string, any>) =>
        this.setPluginConfig(pluginId, config),
      getPlugin: (pluginId: string) => this.getPlugin(pluginId),
      getPlugins: () => this.getPlugins()
    }

    // 初始化内置插件加载器
    this.initializePluginLoaders()

    // 初始化依赖图
    this.initializeDependencyGraph()
  }

  /**
   * 初始化插件加载器
   */
  private initializePluginLoaders(): void {
    // 注册内置插件加载器
    this.registerPluginLoader('js', this.loadJSPlugin.bind(this))
    this.registerPluginLoader('ts', this.loadTSPlugin.bind(this))
    this.registerPluginLoader('json', this.loadJSONPlugin.bind(this))
    this.registerPluginLoader('mjs', this.loadJSPlugin.bind(this))
    this.registerPluginLoader('cjs', this.loadJSPlugin.bind(this))
  }

  /**
   * 初始化依赖图
   */
  private initializeDependencyGraph(): void {
    this.dependencyGraph = {}
  }

  /**
   * 更新依赖图
   */
  private updateDependencyGraph(): void {
    this.dependencyGraph = {}

    // 为每个插件创建依赖记录
    this.plugins.forEach(plugin => {
      this.dependencyGraph[plugin.id] = {
        dependencies: plugin.dependencies || [],
        dependents: []
      }
    })

    // 找出每个插件的依赖者
    this.plugins.forEach(plugin => {
      if (plugin.dependencies) {
        plugin.dependencies.forEach(depId => {
          if (this.dependencyGraph[depId]) {
            this.dependencyGraph[depId].dependents.push(plugin.id)
          }
        })
      }
    })
  }

  /**
   * 获取插件配置
   */
  public getPluginConfig(pluginId: string): Record<string, any> | undefined {
    return this.pluginConfigs.get(pluginId)
  }

  /**
   * 设置插件配置
   */
  public setPluginConfig(pluginId: string, config: Record<string, any>): void {
    this.pluginConfigs.set(pluginId, config)

    // 更新插件实例中的配置
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.config = config
    }

    // 通知插件配置已更改
    eventSystem.emit(APP_EVENTS.PLUGIN_CONFIG_UPDATED, { pluginId, config })
  }

  /**
   * 获取插件性能数据
   */
  public getPluginPerformanceData(pluginId: string): PluginPerformanceData | undefined {
    return this.performanceData.get(pluginId)
  }

  /**
   * 获取所有插件性能数据
   */
  public getPerformanceData(): Map<string, PluginPerformanceData> {
    return this.performanceData
  }

  /**
   * 获取依赖图
   */
  public getDependencyGraph(): PluginDependencyGraph {
    return this.dependencyGraph
  }

  /**
   * 检查插件依赖关系
   */
  public checkDependencies(plugin: Plugin): boolean {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return true
    }

    for (const depId of plugin.dependencies) {
      const dependency = this.plugins.get(depId)
      if (!dependency) {
        console.warn(`Plugin ${plugin.id} missing dependency: ${depId}`)
        return false
      }

      if (dependency.lifecycle === PluginLifecycle.ERROR) {
        console.warn(`Plugin ${plugin.id} has an error in dependency: ${depId}`)
        return false
      }
    }

    return true
  }

  /**
   * 解析插件依赖顺序
   */
  public resolveDependencyOrder(): string[] {
    const visited = new Set<string>()
    const temp = new Set<string>()
    const order: string[] = []

    const visit = (pluginId: string) => {
      if (temp.has(pluginId)) {
        throw new Error(`Circular dependency detected: ${pluginId}`)
      }

      if (visited.has(pluginId)) {
        return
      }

      temp.add(pluginId)

      const plugin = this.plugins.get(pluginId)
      if (plugin && plugin.dependencies) {
        for (const depId of plugin.dependencies) {
          visit(depId)
        }
      }

      temp.delete(pluginId)
      visited.add(pluginId)
      order.push(pluginId)
    }

    this.plugins.forEach(plugin => {
      if (!visited.has(plugin.id)) {
        visit(plugin.id)
      }
    })

    return order
  }

  /**
   * 验证插件权限
   */
  public validatePluginPermissions(plugin: Plugin): boolean {
    if (!this.config.enableSecurityValidation) {
      return true
    }

    if (plugin.permissions) {
      this.pluginPermissions.set(plugin.id, plugin.permissions)
      // 这里可以添加权限验证逻辑
    }

    return true
  }

  /**
   * 获取插件权限
   */
  public getPluginPermissions(pluginId: string): string[] {
    return this.pluginPermissions.get(pluginId) || []
  }

  /**
   * 检查插件API版本兼容性
   */
  public checkApiCompatibility(plugin: Plugin): boolean {
    if (!plugin.apiVersion) {
      return true
    }

    // 简单的版本比较
    const pluginVersion = plugin.apiVersion.split('.').map(Number)
    const managerVersion = this.apiVersion.split('.').map(Number)

    // 检查主要版本是否兼容
    return pluginVersion[0] === managerVersion[0]
  }

  /**
   * 注册插件加载器
   */
  public registerPluginLoader(extension: string, loader: Function): void {
    this.pluginLoaders.set(extension, loader)
  }

  /**
   * 加载JS插件
   */
  private async loadJSPlugin(pluginPath: string): Promise<Plugin | null> {
    try {
      const module = await import(pluginPath)
      const pluginClass = module.default || module[Object.keys(module)[0]]

      if (typeof pluginClass === 'function') {
        const pluginInstance = new pluginClass(this.context)
        return this.initializePlugin(pluginInstance)
      }

      return null
    } catch (error) {
      console.error('Failed to load JS plugin:', error)
      return null
    }
  }

  /**
   * 加载TS插件
   */
  private async loadTSPlugin(pluginPath: string): Promise<Plugin | null> {
    return this.loadJSPlugin(pluginPath)
  }

  /**
   * 加载JSON插件
   */
  private async loadJSONPlugin(pluginPath: string): Promise<Plugin | null> {
    try {
      const pluginData = await import(pluginPath)
      return this.createPluginFromJSON(pluginData.default || pluginData)
    } catch (error) {
      console.error('Failed to load JSON plugin:', error)
      return null
    }
  }

  /**
   * 从JSON创建插件
   */
  private createPluginFromJSON(pluginData: any): Plugin {
    return {
      id: pluginData.id,
      name: pluginData.name,
      version: pluginData.version,
      description: pluginData.description,
      type: pluginData.type || PluginType.OTHER,
      author: pluginData.author,
      dependencies: pluginData.dependencies,
      lifecycle: PluginLifecycle.LOADED,
      priority: pluginData.priority || 0,
      enabled: pluginData.enabled !== false,
      metadata: pluginData.metadata
    }
  }

  /**
   * 初始化插件
   */
  private initializePlugin(pluginInstance: any): Plugin {
    const plugin: Plugin = {
      id: pluginInstance.id || `plugin_${Date.now()}`,
      name: pluginInstance.name || 'Unknown Plugin',
      version: pluginInstance.version || '1.0.0',
      description: pluginInstance.description || 'No description',
      type: pluginInstance.type || PluginType.OTHER,
      author: pluginInstance.author,
      dependencies: pluginInstance.dependencies,
      lifecycle: PluginLifecycle.INITIALIZED,
      priority: pluginInstance.priority || 0,
      enabled: pluginInstance.enabled !== false,
      metadata: pluginInstance.metadata
    }

    // 存储插件实例
    this.pluginInstances.set(plugin.id, pluginInstance)

    // 触发插件初始化事件
    eventSystem.emit(APP_EVENTS.PLUGIN_INITIALIZED, plugin)

    return plugin
  }

  /**
   * 加载插件（优化版本）
   */
  public async loadPlugin(pluginPath: string): Promise<Plugin | null> {
    // 检查插件数量限制
    if (this.plugins.size >= this.config.maxPlugins) {
      console.error('Plugin limit reached')
      return null
    }

    // 确定插件类型
    const extension = pluginPath.split('.').pop()
    const loader = this.pluginLoaders.get(extension || 'js')

    if (!loader) {
      console.error(`No loader found for extension: ${extension}`)
      return null
    }

    try {
      const loadStartTime = performance.now()

      // 创建临时插件对象用于加载状态
      const tempPluginId = `loading_${Date.now()}`
      const tempPlugin: Plugin = {
        id: tempPluginId,
        name: 'Loading...',
        version: '0.0.0',
        description: 'Loading plugin...',
        type: PluginType.OTHER,
        lifecycle: PluginLifecycle.LOADING,
        priority: 0,
        enabled: false,
        metadata: { path: pluginPath }
      }

      this.plugins.set(tempPluginId, tempPlugin)

      const plugin = await loader(pluginPath)

      // 移除临时插件
      this.plugins.delete(tempPluginId)

      if (plugin) {
        // 添加插件路径到元数据
        if (!plugin.metadata) {
          plugin.metadata = {}
        }
        plugin.metadata.path = pluginPath

        // 验证插件
        if (!this.validatePlugin(plugin)) {
          console.error(`Plugin validation failed: ${plugin.id}`)
          plugin.lifecycle = PluginLifecycle.ERROR
        }

        // 验证API兼容性
        if (!this.checkApiCompatibility(plugin)) {
          console.warn(`Plugin API version mismatch: ${plugin.id}`)
        }

        // 验证权限
        this.validatePluginPermissions(plugin)

        // 检查依赖
        if (!this.checkDependencies(plugin)) {
          console.warn(`Plugin dependency check failed: ${plugin.id}`)
        }

        // 存储插件
        this.plugins.set(plugin.id, plugin)

        // 初始化插件配置
        if (plugin.config) {
          this.pluginConfigs.set(plugin.id, plugin.config)
        }

        // 初始化性能数据
        const loadTime = performance.now() - loadStartTime
        this.performanceData.set(plugin.id, {
          loadTime,
          enableTime: 0,
          disableTime: 0,
          unloadTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          hooksExecuted: 0,
          eventsEmitted: 0
        })

        // 更新依赖图
        this.updateDependencyGraph()

        // 触发插件加载事件
        eventSystem.emit(APP_EVENTS.PLUGIN_LOADED, plugin)
      }

      return plugin
    } catch (error) {
      console.error('Failed to load plugin:', error)
      return null
    }
  }

  /**
   * 加载多个插件
   */
  public async loadPlugins(pluginPaths: string[]): Promise<Plugin[]> {
    const plugins: Plugin[] = []

    for (const path of pluginPaths) {
      const plugin = await this.loadPlugin(path)
      if (plugin) plugins.push(plugin)
    }

    return plugins
  }

  /**
   * 卸载插件（优化版本）
   */
  public unloadPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      return false
    }

    // 检查是否有其他插件依赖此插件
    const dependencyInfo = this.dependencyGraph[pluginId]
    if (dependencyInfo && dependencyInfo.dependents.length > 0) {
      console.warn(
        `Plugin ${pluginId} is used by other plugins: ${dependencyInfo.dependents.join(', ')}`
      )
      // 可以选择是否卸载依赖此插件的其他插件
    }

    const unloadStartTime = performance.now()

    // 获取插件实例
    const pluginInstance = this.pluginInstances.get(pluginId)

    // 调用插件卸载方法
    if (pluginInstance && typeof pluginInstance.unload === 'function') {
      try {
        pluginInstance.unload()
      } catch (error) {
        console.error('Error unloading plugin:', error)
      }
    }

    // 移除插件
    this.plugins.delete(pluginId)
    this.pluginInstances.delete(pluginId)
    this.pluginConfigs.delete(pluginId)
    this.performanceData.delete(pluginId)
    this.pluginPermissions.delete(pluginId)

    // 更新依赖图
    this.updateDependencyGraph()

    // 更新性能数据
    const unloadTime = performance.now() - unloadStartTime
    const perfData = this.performanceData.get(pluginId)
    if (perfData) {
      perfData.unloadTime = unloadTime
    }

    // 触发插件卸载事件
    eventSystem.emit(APP_EVENTS.PLUGIN_UNLOADED, plugin)

    return true
  }

  /**
   * 启用插件（优化版本）
   */
  public enablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      return false
    }

    // 检查插件依赖是否已启用
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        const depPlugin = this.plugins.get(depId)
        if (depPlugin && !depPlugin.enabled) {
          console.warn(`Enabling dependency: ${depId} for plugin: ${pluginId}`)
          this.enablePlugin(depId)
        }
      }
    }

    const enableStartTime = performance.now()

    // 获取插件实例
    const pluginInstance = this.pluginInstances.get(pluginId)

    // 调用插件启用方法
    if (pluginInstance && typeof pluginInstance.enable === 'function') {
      try {
        pluginInstance.enable()
      } catch (error) {
        console.error('Error enabling plugin:', error)
        plugin.lifecycle = PluginLifecycle.ERROR
        return false
      }
    }

    // 更新插件状态
    plugin.enabled = true
    plugin.lifecycle = PluginLifecycle.ACTIVE

    // 更新性能数据
    const enableTime = performance.now() - enableStartTime
    const perfData = this.performanceData.get(pluginId)
    if (perfData) {
      perfData.enableTime = enableTime
      this.performanceData.set(pluginId, perfData)
    }

    // 触发插件启用事件
    eventSystem.emit(APP_EVENTS.PLUGIN_ENABLED, plugin)

    return true
  }

  /**
   * 禁用插件（优化版本）
   */
  public disablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      return false
    }

    // 检查是否有其他插件依赖此插件
    const dependencyInfo = this.dependencyGraph[pluginId]
    if (dependencyInfo && dependencyInfo.dependents.length > 0) {
      console.warn(
        `Plugin ${pluginId} is used by other plugins: ${dependencyInfo.dependents.join(', ')}`
      )
      // 可以选择是否禁用依赖此插件的其他插件
    }

    const disableStartTime = performance.now()

    // 获取插件实例
    const pluginInstance = this.pluginInstances.get(pluginId)

    // 调用插件禁用方法
    if (pluginInstance && typeof pluginInstance.disable === 'function') {
      try {
        pluginInstance.disable()
      } catch (error) {
        console.error('Error disabling plugin:', error)
        return false
      }
    }

    // 更新插件状态
    plugin.enabled = false
    plugin.lifecycle = PluginLifecycle.INACTIVE

    // 更新性能数据
    const disableTime = performance.now() - disableStartTime
    const perfData = this.performanceData.get(pluginId)
    if (perfData) {
      perfData.disableTime = disableTime
      this.performanceData.set(pluginId, perfData)
    }

    // 触发插件禁用事件
    eventSystem.emit(APP_EVENTS.PLUGIN_DISABLED, plugin)

    return true
  }

  /**
   * 注册钩子
   */
  public registerHook(hookName: string, callback: Function): void {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = []
    }
    this.hooks[hookName].push(callback)
  }

  /**
   * 注销钩子
   */
  public unregisterHook(hookName: string, callback: Function): void {
    if (this.hooks[hookName]) {
      this.hooks[hookName] = this.hooks[hookName].filter(cb => cb !== callback)
    }
  }

  /**
   * 触发钩子
   */
  public triggerHook(hookName: string, ...args: any[]): any[] {
    const callbacks = this.hooks[hookName] || []
    return callbacks.map(callback => callback(...args))
  }

  /**
   * 注册服务
   */
  public registerService(serviceName: string, service: any): void {
    this.services.set(serviceName, service)
  }

  /**
   * 注销服务
   */
  public unregisterService(serviceName: string): void {
    this.services.delete(serviceName)
  }

  /**
   * 获取服务
   */
  public getService(serviceName: string): any {
    return this.services.get(serviceName)
  }

  /**
   * 获取所有服务
   */
  public getServices(): Map<string, any> {
    return this.services
  }

  /**
   * 获取插件
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 获取所有插件
   */
  public getPlugins(): Map<string, Plugin> {
    return this.plugins
  }

  /**
   * 获取插件实例
   */
  public getPluginInstance(pluginId: string): any {
    return this.pluginInstances.get(pluginId)
  }

  /**
   * 获取按类型分类的插件
   */
  public getPluginsByType(type: PluginType): Plugin[] {
    const plugins: Plugin[] = []
    this.plugins.forEach(plugin => {
      if (plugin.type === type) {
        plugins.push(plugin)
      }
    })
    return plugins
  }

  /**
   * 获取启用的插件
   */
  public getEnabledPlugins(): Plugin[] {
    const plugins: Plugin[] = []
    this.plugins.forEach(plugin => {
      if (plugin.enabled) {
        plugins.push(plugin)
      }
    })
    return plugins
  }

  /**
   * 设置插件上下文
   */
  public setContext(context: Partial<PluginContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * 获取插件上下文
   */
  public getContext(): PluginContext {
    return this.context
  }

  /**
   * 初始化插件系统（优化版本）
   */
  public initialize(): void {
    // 初始化内置服务
    this.initializeBuiltinServices()

    // 加载默认插件
    if (this.config.autoLoadPlugins) {
      this.loadDefaultPlugins()
    }

    // 触发插件系统初始化事件
    eventSystem.emit(APP_EVENTS.PLUGIN_SYSTEM_INITIALIZED, this)
  }

  /**
   * 初始化内置服务
   */
  private initializeBuiltinServices(): void {
    // 注册纹理压缩系统服务
    try {
      const { textureCompressionSystem } = require('../utils/TextureCompressionSystem')
      this.registerService('textureCompression', textureCompressionSystem)
      this.context.textureCompressionSystem = textureCompressionSystem
    } catch (error) {
      console.warn('Failed to register texture compression service:', error)
    }

    // 这里可以添加其他内置服务
  }

  /**
   * 加载默认插件
   */
  private async loadDefaultPlugins(): Promise<void> {
    try {
      // 这里可以添加默认插件的加载逻辑
      // 例如从插件目录扫描并加载插件
    } catch (error) {
      console.error('Failed to load default plugins:', error)
    }
  }

  /**
   * 销毁插件系统（优化版本）
   */
  public dispose(): void {
    // 卸载所有插件
    const pluginIds = Array.from(this.plugins.keys())
    pluginIds.forEach(pluginId => {
      this.unloadPlugin(pluginId)
    })

    // 清空服务
    this.services.clear()

    // 清空钩子
    this.hooks = {}

    // 清空配置
    this.pluginConfigs.clear()

    // 清空性能数据
    this.performanceData.clear()

    // 清空权限
    this.pluginPermissions.clear()

    // 清空依赖图
    this.dependencyGraph = {}

    // 触发插件系统销毁事件
    eventSystem.emit(APP_EVENTS.PLUGIN_SYSTEM_DISPOSED)
  }

  /**
   * 获取插件系统状态
   */
  public getStatus(): {
    pluginCount: number
    enabledPlugins: number
    servicesCount: number
    hooksCount: number
    memoryUsage: number
    apiVersion: string
  } {
    const enabledPlugins = Array.from(this.plugins.values()).filter(p => p.enabled).length
    const hooksCount = Object.keys(this.hooks).length
    const memoryUsage = Array.from(this.performanceData.values()).reduce(
      (total, data) => total + data.memoryUsage,
      0
    )

    return {
      pluginCount: this.plugins.size,
      enabledPlugins,
      servicesCount: this.services.size,
      hooksCount,
      memoryUsage,
      apiVersion: this.apiVersion
    }
  }

  /**
   * 导出插件系统状态
   */
  public exportState(): any {
    const plugins = Array.from(this.plugins.values())
    const configs = Object.fromEntries(this.pluginConfigs)
    const services = Array.from(this.services.keys())

    return {
      plugins,
      configs,
      services,
      status: this.getStatus(),
      timestamp: Date.now()
    }
  }

  /**
   * 导入插件系统状态
   */
  public async importState(state: any): Promise<void> {
    // 这里可以添加状态导入逻辑
    // 例如加载保存的插件配置和状态
  }

  /**
   * 检查插件系统健康状态
   */
  public checkHealth(): {
    healthy: boolean
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []

    // 检查插件状态
    this.plugins.forEach(plugin => {
      if (plugin.lifecycle === PluginLifecycle.ERROR) {
        issues.push(`Plugin in error state: ${plugin.id}`)
      }
    })

    // 检查依赖关系
    Object.entries(this.dependencyGraph).forEach(([pluginId, info]) => {
      info.dependencies.forEach(depId => {
        if (!this.plugins.has(depId)) {
          warnings.push(`Missing dependency: ${depId} for plugin: ${pluginId}`)
        }
      })
    })

    return {
      healthy: issues.length === 0,
      issues,
      warnings
    }
  }

  /**
   * 热重载插件（优化版本）
   */
  public async hotReloadPlugin(pluginId: string): Promise<Plugin | null> {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      return null
    }

    // 保存插件路径和配置
    const pluginPath = plugin.metadata?.path

    if (!pluginPath) {
      console.error('Plugin path not found')
      return null
    }

    // 保存插件配置
    const pluginConfig = this.pluginConfigs.get(pluginId)
    const wasEnabled = plugin.enabled

    // 卸载插件
    this.unloadPlugin(pluginId)

    // 重新加载插件
    const reloadedPlugin = await this.loadPlugin(pluginPath)

    // 恢复插件配置
    if (reloadedPlugin && pluginConfig) {
      this.setPluginConfig(reloadedPlugin.id, pluginConfig)
    }

    // 恢复插件启用状态
    if (reloadedPlugin && wasEnabled) {
      this.enablePlugin(reloadedPlugin.id)
    }

    // 触发热重载事件
    eventSystem.emit(APP_EVENTS.PLUGIN_HOT_RELOADED, reloadedPlugin)

    return reloadedPlugin
  }

  /**
   * 热重载所有插件
   */
  public async hotReloadAllPlugins(): Promise<Plugin[]> {
    const pluginsToReload = Array.from(this.plugins.values())
    const reloadedPlugins: Plugin[] = []

    for (const plugin of pluginsToReload) {
      const reloadedPlugin = await this.hotReloadPlugin(plugin.id)
      if (reloadedPlugin) {
        reloadedPlugins.push(reloadedPlugin)
      }
    }

    return reloadedPlugins
  }

  /**
   * 验证插件（优化版本）
   */
  public validatePlugin(plugin: Plugin): boolean {
    if (!this.config.enablePluginValidation) {
      return true
    }

    // 基本验证
    if (!plugin.id || !plugin.name || !plugin.version) {
      console.error('Plugin missing required fields:', plugin.id)
      return false
    }

    // 验证插件ID格式
    if (!/^[a-zA-Z0-9_-]+$/.test(plugin.id)) {
      console.error('Invalid plugin ID format:', plugin.id)
      return false
    }

    // 验证版本格式
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version)) {
      console.warn('Invalid plugin version format:', plugin.version)
    }

    // 验证依赖
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        if (!this.plugins.has(depId)) {
          console.warn(`Plugin ${plugin.id} missing dependency: ${depId}`)
          // 不再直接返回false，允许插件在依赖缺失时仍能加载
        }
      }
    }

    // 验证插件类型
    if (!Object.values(PluginType).includes(plugin.type)) {
      console.warn('Invalid plugin type:', plugin.type)
      plugin.type = PluginType.OTHER
    }

    // 验证优先级范围
    if (plugin.priority < -1000 || plugin.priority > 1000) {
      console.warn('Plugin priority out of range:', plugin.priority)
      plugin.priority = Math.max(-1000, Math.min(1000, plugin.priority))
    }

    return true
  }
}

// 导出单例实例
export const pluginManager = new PluginManager()

// 导出便捷函数
export const loadPlugin = (pluginPath: string) => pluginManager.loadPlugin(pluginPath)
export const unloadPlugin = (pluginId: string) => pluginManager.unloadPlugin(pluginId)
export const enablePlugin = (pluginId: string) => pluginManager.enablePlugin(pluginId)
export const disablePlugin = (pluginId: string) => pluginManager.disablePlugin(pluginId)
export const getPlugin = (pluginId: string) => pluginManager.getPlugin(pluginId)
export const getPlugins = () => pluginManager.getPlugins()
export const registerHook = (hookName: string, callback: Function) =>
  pluginManager.registerHook(hookName, callback)
export const triggerHook = (hookName: string, ...args: any[]) =>
  pluginManager.triggerHook(hookName, ...args)
export const registerService = (serviceName: string, service: any) =>
  pluginManager.registerService(serviceName, service)
export const getService = (serviceName: string) => pluginManager.getService(serviceName)
export const getPluginConfig = (pluginId: string) => pluginManager.getPluginConfig(pluginId)
export const setPluginConfig = (pluginId: string, config: Record<string, any>) =>
  pluginManager.setPluginConfig(pluginId, config)
export const getPluginPerformanceData = (pluginId: string) =>
  pluginManager.getPluginPerformanceData(pluginId)
export const getPerformanceData = () => pluginManager.getPerformanceData()
export const getDependencyGraph = () => pluginManager.getDependencyGraph()
export const getPluginPermissions = (pluginId: string) =>
  pluginManager.getPluginPermissions(pluginId)
export const checkHealth = () => pluginManager.checkHealth()
export const getStatus = () => pluginManager.getStatus()
export const hotReloadPlugin = (pluginId: string) => pluginManager.hotReloadPlugin(pluginId)
export const hotReloadAllPlugins = () => pluginManager.hotReloadAllPlugins()
export const exportState = () => pluginManager.exportState()
export const importState = (state: any) => pluginManager.importState(state)
export const resolveDependencyOrder = () => pluginManager.resolveDependencyOrder()
export const cleanupPluginCache = () => pluginManager.dispose()
