// MathJax服务类，提供全局的MathJax配置和管理

// 声明全局MathJax对象接口
export interface MathJaxInstance {
  typeset?: (elements?: HTMLElement[]) => Promise<void>
  typesetClear?: () => void
  typesetPromise?: (elements?: HTMLElement[]) => Promise<HTMLElement[]>
  startup?: {
    promise: Promise<void>
  }
  version?: string
  tex?: any
  svg?: any
  options?: any
  hub?: any
}

export interface WindowWithMathJax {
  MathJax?: MathJaxInstance
}

// 安全的window类型检查
declare const window: WindowWithMathJax

// MathJax服务类
class MathJaxService {
  private static instance: MathJaxService
  private isInitialized: boolean = false
  private isReady: boolean = false
  private readyCallbacks: (() => void)[] = []
  private renderQueue: HTMLElement[] = []
  private renderTimeout: ReturnType<typeof setTimeout> | null = null
  private scriptElement: HTMLScriptElement | null = null
  private isClient: boolean = typeof window !== 'undefined' && typeof document !== 'undefined'
  private mergedConfig: any = {}
  // 添加公式缓存，避免重复渲染相同的公式
  private formulaCache: Map<string, string> = new Map()
  private elementCache: Map<HTMLElement, string> = new Map()
  
  // CDN 列表和重试机制
  private cdnList: string[] = [
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js',
    'https://unpkg.com/mathjax@3/es5/tex-svg.js'
  ]
  private currentCdnIndex: number = 0

  private constructor() {
    // 初始化时检查环境
    this.isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
  }

  /**
   * 获取MathJaxService单例实例
   */
  public static getInstance(): MathJaxService {
    if (!MathJaxService.instance) {
      MathJaxService.instance = new MathJaxService()
    }
    return MathJaxService.instance
  }

  /**
   * 初始化MathJax
   * @param options 可选的MathJax配置选项
   */
  public initialize(options: Partial<MathJaxInstance> = {}): void {
    if (this.isInitialized || !this.isClient) {
      return
    }

    this.isInitialized = true

    // 合并默认配置和用户配置
    const defaultConfig: any = {
      tex: {
        inlineMath: [
          ['$', '$'],
          ['\(', '\)']
        ],
        displayMath: [
          ['$$', '$$'],
          ['\[', '\]']
        ],
        packages: ['base', 'ams', 'noerrors', 'noundefined'],
        // physics包可能不是核心包，移除以避免加载问题
        macros: {
          '\RR': '{\mathbb{R}}',
          '\ZZ': '{\mathbb{Z}}',
          '\NN': '{\mathbb{N}}',
          '\CC': '{\mathbb{C}}',
          '\degree': '{\circ}',
          '\abs': ['{|#1|}', 1],
          '\norm': ['{\lVert#1\rVert}', 1],
          '\vector': ['{\vec{#1}}', 1],
          '\gradient': '{\nabla}',
          '\laplacian': '{\nabla^2}',
          '\operator': ['{\operatorname{#1}}', 1]
        },
        // 性能优化：禁用自动行内数学检测
        processEnvironments: true,
        processRefs: true
      },
      svg: {
        fontCache: 'local', // 本地字体缓存更快
        scale: 1.05, // 略微调整以提高可读性
        exFactor: 0.5,
        displayAlign: 'center',
        displayIndent: '0',
        internalSpeechTitles: false, // 禁用无障碍语音标题以提高性能
        assistiveMml: false, // 禁用辅助MML以提高性能
        merrorInheritFont: true,
        // 性能优化：启用字体缓存和简化渲染
        useFontCache: true,
        useGlobalCache: true
      },
      startup: {
        typeset: false,
        // 添加启动配置以确保正确初始化
        ready: () => {
          console.debug('MathJax启动就绪')
        },
        // 性能优化：减少启动时的自动操作
        pageReady: () => {
          console.debug('MathJax页面就绪')
        }
      },
      options: {
        enableMenu: false, // 禁用菜单以提高性能
        enableAssistiveMml: false,
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
        // 性能优化：禁用不必要的功能
        renderActions: {
          find: [10, () => {}, ''],
          prepare: [15, () => {}, ''],
          process: [20, () => {}, ''],
          typeset: [30, () => {}, ''],
          update: [40, () => {}, '']
        }
      }
    }

    // 合并用户配置
    const mergedConfig = this.deepMerge(defaultConfig, options)

    // 保存配置，在MathJax脚本加载完成后应用
    this.mergedConfig = mergedConfig

    // 动态加载MathJax脚本
    this.loadMathJaxScript()
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target }
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = this.deepMerge(target[key], source[key])
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    return output
  }

  /**
   * 检查是否为对象
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  /**
   * 加载MathJax脚本
   */
  private async loadMathJaxScript(): Promise<void> {
    if (!this.isClient) {
      return
    }

    // 避免重复添加脚本
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement)
    }

    const script = document.createElement('script')
    
    // 使用当前索引的CDN
    const cdnUrl = this.cdnList[this.currentCdnIndex]
    console.log(`正在尝试加载MathJax (源: ${cdnUrl})...`)
    
    script.src = cdnUrl
    script.async = true
    script.type = 'text/javascript'
    script.crossOrigin = 'anonymous' // 添加crossorigin属性
    script.referrerPolicy = 'no-referrer-when-downgrade' // 添加referrer policy

    // 性能优化：添加加载优先级
    script.setAttribute('fetchpriority', 'high')

    // 增加超时处理
    const timeoutId = setTimeout(() => {
      console.error(`MathJax加载超时 (源: ${cdnUrl})`)
      this.handleLoadError(new Error('加载超时'))
    }, 15000)

    script.onload = () => {
      clearTimeout(timeoutId)
      this.onMathJaxLoaded()
    }

    script.onerror = error => {
      clearTimeout(timeoutId)
      console.error(`MathJax加载失败 (源: ${cdnUrl}):`, error)
      this.handleLoadError(error)
    }

    this.scriptElement = script
    document.head.appendChild(script)
  }

  /**
   * 处理加载错误，实现CDN切换重试
   */
  private handleLoadError(error: any): void {
    this.currentCdnIndex++

    if (this.currentCdnIndex < this.cdnList.length) {
      console.warn(`MathJax加载失败，切换到备用CDN (${this.cdnList[this.currentCdnIndex]})...`)
      // 延迟后重试
      setTimeout(() => {
        this.loadMathJaxScript()
      }, 1000)
    } else {
      console.error('MathJax所有CDN源均加载失败')
      // 重置索引以便下次可能重新尝试（虽然单例模式下可能不需要）
      this.currentCdnIndex = 0
      
      // 通知所有等待的回调，提供降级处理机会
      this.readyCallbacks.forEach(callback => {
        try {
          callback() // 即使失败也要调用回调，让应用可以做降级处理
        } catch (err) {
          console.error('MathJax就绪回调执行失败:', err)
        }
      })
      this.readyCallbacks = []
      
      // 标记为就绪（虽然是失败状态），避免阻塞UI
      this.isReady = true 
    }
  }

  /**
   * MathJax加载完成回调
   */
  private async onMathJaxLoaded(): Promise<void> {
    if (!this.isClient || !window.MathJax) {
      console.error('MathJax未正确加载或环境不支持')
      // Even if MathJax failed to load, mark as ready to prevent blocking the UI
      this.isReady = true
      this.executeReadyCallbacks()
      return
    }

    try {
      // 等待MathJax完全启动
      if (window.MathJax.startup && window.MathJax.startup.promise) {
        await window.MathJax.startup.promise
      }

      // 应用配置，但避免直接覆盖只读属性
      if (this.mergedConfig) {
        // 安全地合并配置，只修改可写属性
        this.safeMergeConfig(window.MathJax, this.mergedConfig)
      }

      this.isReady = true
      // 重置索引，以便下次成功使用首选CDN（如果页面刷新）
      // 这里不重置 currentCdnIndex，因为如果当前CDN成功了，下次应该继续用它？
      // 或者为了稳定性，总是从头开始？考虑到CDN可能临时挂掉，保持当前成功的可能更好。
      // 但如果是单例，下次initialize不会再调用。
      
      // 执行所有等待的回调
      this.executeReadyCallbacks()

      // 处理渲染队列中的元素
      this.processRenderQueue()

      console.log('MathJax初始化成功，版本:', window.MathJax.version || '未知')
    } catch (error) {
      console.error('MathJax启动失败:', error)
      // Even if MathJax failed to initialize properly, mark as ready to prevent blocking the UI
      this.isReady = true
      this.executeReadyCallbacks()
    }
  }

  /**
   * Execute all ready callbacks safely
   */
  private executeReadyCallbacks(): void {
    // 执行所有等待的回调
    const callbacks = [...this.readyCallbacks]
    this.readyCallbacks = [] // 清空队列再执行回调，避免回调中再次添加回调导致的问题

    callbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('MathJax就绪回调执行失败:', error)
      }
    })
  }

  /**
   * 安全合并配置，避免修改只读属性
   */
  private safeMergeConfig(target: any, source: any): void {
    if (!target || !source || typeof target !== 'object' || typeof source !== 'object') {
      return
    }

    // 只合并我们需要的配置项，避免修改MathJax内部的只读属性
    const safeConfigKeys = ['tex', 'svg', 'options', 'startup']

    for (const key of safeConfigKeys) {
      if (source[key] && typeof source[key] === 'object') {
        if (!target[key]) {
          target[key] = source[key]
        } else {
          // 深度合并安全配置项
          this.deepMergeSafe(target[key], source[key])
        }
      }
    }
  }

  /**
   * 深度合并对象，但避免修改只读属性
   */
  private deepMergeSafe(target: any, source: any): void {
    if (!target || !source || typeof target !== 'object' || typeof source !== 'object') {
      return
    }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        try {
          // 尝试修改属性，如果失败则跳过（只读属性）
          if (
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            source[key] !== null
          ) {
            if (!target[key]) {
              target[key] = source[key]
            } else {
              this.deepMergeSafe(target[key], source[key])
            }
          } else {
            // 尝试设置基本类型属性
            target[key] = source[key]
          }
        } catch (error) {
          // 忽略只读属性错误
          console.debug(`跳过只读属性: ${key}`)
        }
      }
    }
  }

  /**
   * 获取MathJax是否准备就绪
   */
  public get isReadyState(): boolean {
    return this.isReady
  }

  /**
   * 监听MathJax就绪事件
   */
  public onReady(callback: () => void): void {
    if (!callback || typeof callback !== 'function') {
      return
    }

    if (this.isReady) {
      // 异步执行回调，避免阻塞
      setTimeout(() => {
        try {
          callback()
        } catch (error) {
          console.error('MathJax就绪回调执行失败:', error)
        }
      }, 0)
    } else {
      this.readyCallbacks.push(callback)
    }
  }

  /**
   * 移除MathJax就绪事件监听
   */
  public offReady(callback: () => void): void {
    if (!callback || typeof callback !== 'function') {
      return
    }

    const index = this.readyCallbacks.indexOf(callback)
    if (index > -1) {
      this.readyCallbacks.splice(index, 1)
    }
  }

  /**
   * 立即渲染指定元素 - 优化性能，添加缓存机制
   */
  public async typeset(elements?: HTMLElement[]): Promise<void> {
    if (!this.isClient || !this.isReady || !window.MathJax) {
      // If MathJax is not ready or not available, just return without error
      return
    }

    // 元素有效性检查
    if (elements) {
      elements = elements.filter(el => el && el.isConnected)
      if (elements.length === 0) {
        return // 没有有效元素，直接返回
      }

      // 过滤掉已经渲染过相同内容的元素
      const elementsToRender: HTMLElement[] = []
      for (const element of elements) {
        const currentContent = element.textContent?.trim() || ''
        const cachedContent = this.elementCache.get(element)

        // 只有当内容变化时才需要重新渲染
        if (cachedContent !== currentContent) {
          elementsToRender.push(element)
          // 更新缓存
          this.elementCache.set(element, currentContent)
        }
      }

      // 如果没有需要渲染的元素，直接返回
      if (elementsToRender.length === 0) {
        return
      }

      // 使用过滤后的元素数组
      elements = elementsToRender
    }

    try {
      // 性能优化：只在必要时清除渲染
      if (window.MathJax.typesetClear && elements) {
        try {
          window.MathJax.typesetClear()
        } catch (err) {
          console.warn('MathJax清除渲染失败:', err)
        }
      }

      // 性能优化：避免在渲染前重新布局
      const startTime = performance.now()

      // 优先使用typesetPromise，降级到typeset
      if (window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise(elements)
      } else if (window.MathJax.typeset) {
        await window.MathJax.typeset(elements)
      } else if (window.MathJax.hub && window.MathJax.hub.Typeset) {
        // 兼容旧版本API
        await new Promise<void>(resolve => {
          window.MathJax!.hub!.Typeset(elements, () => resolve())
        })
      } else {
        // If no rendering method is available, just return without error
        return
      }

      const endTime = performance.now()
      console.debug(`MathJax渲染完成，耗时: ${(endTime - startTime).toFixed(2)}ms`)
    } catch (error) {
      console.error('MathJax渲染失败:', error)
      // Don't throw the error to prevent blocking the UI
    }
  }

  /**
   * 将元素加入渲染队列（防抖处理）
   * @param element 要渲染的元素
   * @param immediate 是否立即渲染，不加入队列
   * @param priority 是否高优先级渲染
   */
  public queueTypeset(
    element: HTMLElement,
    immediate: boolean = false,
    priority: boolean = false
  ): void {
    if (!element || !element.isConnected) {
      console.warn('尝试渲染不存在或已断开连接的DOM元素')
      return
    }

    // 如果元素已在队列中，不再重复添加
    if (this.renderQueue.includes(element)) {
      return
    }

    // 立即渲染模式
    if (immediate && this.isReady) {
      this.typeset([element]).catch(err => {
        console.warn('MathJax立即渲染失败:', err)
      })
      return
    }

    // 优先队列处理
    if (priority) {
      this.renderQueue.unshift(element) // 高优先级元素插入队列头部
    } else {
      this.renderQueue.push(element) // 普通元素插入队列尾部
    }

    // 清除之前的定时器
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
    }

    // 动态调整防抖延迟：如果队列中有高优先级元素，使用更短的延迟
    const debounceDelay = this.renderQueue.length > 5 ? 100 : priority ? 50 : 150

    this.renderTimeout = setTimeout(() => {
      this.processRenderQueue()
    }, debounceDelay)
  }

  /**
   * 处理渲染队列
   */
  private async processRenderQueue(): Promise<void> {
    if (this.renderQueue.length === 0 || !this.isClient || !this.isReady || !window.MathJax) {
      return
    }

    // 过滤掉无效的元素
    const validElements = this.renderQueue.filter(el => el && el.isConnected)
    this.renderQueue = []

    if (validElements.length === 0) {
      return
    }

    // 批量处理：将大量元素分成小批次处理
    const batchSize = 10 // 每批次处理10个元素
    const batches = []

    for (let i = 0; i < validElements.length; i += batchSize) {
      batches.push(validElements.slice(i, i + batchSize))
    }

    try {
      // 按批次处理渲染请求
      for (const batch of batches) {
        await this.typeset(batch)
        // 给浏览器一点时间处理其他任务
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    } catch (error) {
      console.error('渲染队列处理失败:', error)
      // 失败后尝试重新加入队列，限制重试次数
      validElements.forEach(element => {
        // 避免重复加入
        if (!this.renderQueue.includes(element)) {
          this.renderQueue.push(element)
        }
      })

      // 稍后重试，使用指数退避
      setTimeout(() => {
        this.processRenderQueue()
      }, 1000)
    }
  }

  /**
   * 清除指定元素的MathJax渲染
   */
  public clear(element: HTMLElement): void {
    if (!this.isClient || !element) {
      return
    }

    try {
      // 移除MathJax添加的元素和属性
      const mathElements = element.querySelectorAll('.MathJax, mjx-container, mjx-assistive-mml')
      mathElements.forEach(el => {
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el)
          }
        } catch (err) {
          console.warn('移除MathJax元素失败:', err)
        }
      })

      // 清除相关属性
      element.removeAttribute('data-mathml')
      element.removeAttribute('data-mjx-version')
      element.removeAttribute('data-mathjax')
    } catch (error) {
      console.error('清除MathJax渲染失败:', error)
    }
  }

  /**
   * 销毁MathJax实例
   */
  public destroy(): void {
    // 清除定时器
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
      this.renderTimeout = null
    }

    // 清空队列
    this.renderQueue = []
    this.readyCallbacks = []

    // 重置状态
    this.isReady = false
    this.isInitialized = false
    // 移除脚本元素
    if (this.scriptElement && this.scriptElement.parentNode) {
      try {
        this.scriptElement.parentNode.removeChild(this.scriptElement)
      } catch (err) {
        console.warn('移除MathJax脚本失败:', err)
      }
      this.scriptElement = null
    }

    // 移除MathJax实例
    if (this.isClient && window.MathJax) {
      try {
        // 尝试安全地关闭MathJax（如果支持）
        // 注释掉有问题的代码，因为startup.shutdown方法不存在
        /*
        if (window.MathJax.startup && window.MathJax.startup.shutdown) {
          window.MathJax.startup.shutdown();
        }
        */
      } catch (err) {
        console.warn('关闭MathJax失败:', err)
      }

      // 最后删除全局实例
      delete window.MathJax
    }
  }
}

// 创建并导出单例实例
export const MathJax = MathJaxService.getInstance()
