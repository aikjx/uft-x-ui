// MathJax服务类，提供全局的MathJax配置和管理

// 声明全局MathJax对象接口
export interface MathJaxInstance {
  typeset?: (elements?: HTMLElement[]) => Promise<void>;
  typesetClear?: () => void;
  typesetPromise?: (elements?: HTMLElement[]) => Promise<HTMLElement[]>;
  startup?: {
    promise: Promise<void>;
  };
  version?: string;
  tex?: any;
  svg?: any;
  options?: any;
  hub?: any;
}

export interface WindowWithMathJax {
  MathJax?: MathJaxInstance;
}

// 安全的window类型检查
declare const window: WindowWithMathJax;

// MathJax服务类
export class MathJaxService {
  private static instance: MathJaxService;
  private isInitialized: boolean = false;
  private isReady: boolean = false;
  private readyCallbacks: (() => void)[] = [];
  private renderQueue: HTMLElement[] = [];
  private renderTimeout: ReturnType<typeof setTimeout> | null = null;
  private scriptElement: HTMLScriptElement | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private isClient: boolean = typeof window !== 'undefined' && typeof document !== 'undefined';
  
  private constructor() {
    // 初始化时检查环境
    this.isClient = typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  
  /**
   * 获取MathJaxService单例实例
   */
  public static getInstance(): MathJaxService {
    if (!MathJaxService.instance) {
      MathJaxService.instance = new MathJaxService();
    }
    return MathJaxService.instance;
  }
  
  /**
   * 初始化MathJax
   * @param options 可选的MathJax配置选项
   */
  public initialize(options: Partial<MathJaxInstance> = {}): void {
    if (this.isInitialized || !this.isClient) {
      return;
    }
    
    this.isInitialized = true;
    
    // 合并默认配置和用户配置
    const defaultConfig: any = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        packages: ['base', 'ams', 'noerrors', 'noundefined'],
        // physics包可能不是核心包，移除以避免加载问题
        macros: {
          '\\RR': '{\\mathbb{R}}',
          '\\ZZ': '{\\mathbb{Z}}',
          '\\NN': '{\\mathbb{N}}',
          '\\CC': '{\\mathbb{C}}',
          '\\degree': '{\\circ}',
          '\\abs': ['{|#1|}', 1],
          '\\norm': ['{\\lVert#1\\rVert}', 1],
          '\\vector': ['{\\vec{#1}}', 1],
          '\\gradient': '{\\nabla}',
          '\\laplacian': '{\\nabla^2}',
          '\\operator': ['{\\operatorname{#1}}', 1]
        }
      },
      svg: {
        fontCache: 'global',
        scale: 1.05, // 略微调整以提高可读性
        exFactor: 0.5,
        displayAlign: 'center',
        displayIndent: '0',
        internalSpeechTitles: true,
        assistiveMml: false,
        merrorInheritFont: true
      },
      startup: {
        typeset: false,
        // 添加启动配置以确保正确初始化
        ready: () => {
          console.debug('MathJax启动就绪');
        }
      },
      options: {
        enableMenu: true,
        enableAssistiveMml: false,
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      }
    };
    
    // 合并用户配置
    const mergedConfig = this.deepMerge(defaultConfig, options);
    
    // 配置MathJax
    window.MathJax = mergedConfig;
    
    // 动态加载MathJax脚本
    this.loadMathJaxScript();
  }
  
  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
  
  /**
   * 检查是否为对象
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
  
  /**
   * 加载MathJax脚本
   */
  private loadMathJaxScript(): void {
    if (!this.isClient) {
      return;
    }
    
    // 避免重复添加脚本
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
    }
    
    const script = document.createElement('script');
    // 使用CDN的MathJax v3版本，确保兼容性
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.type = 'text/javascript';
    
    // 增加超时处理
    const timeoutId = setTimeout(() => {
      console.error('MathJax加载超时');
      this.handleLoadError(new Error('加载超时'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      this.onMathJaxLoaded();
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('MathJax加载失败:', error);
      this.handleLoadError(error);
    };
    
    this.scriptElement = script;
    document.head.appendChild(script);
  }
  
  /**
   * 处理加载错误，实现自动重试
   */
  private handleLoadError(error: any): void {
    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      console.warn(`MathJax加载失败，尝试第${this.retryCount}次重试...`);
      // 延迟后重试
      setTimeout(() => {
        this.loadMathJaxScript();
      }, 2000 * this.retryCount);
    } else {
      console.error('MathJax达到最大重试次数，加载失败');
      // 通知所有等待的回调，提供降级处理机会
      this.readyCallbacks.forEach(callback => {
        try {
          callback(); // 即使失败也要调用回调，让应用可以做降级处理
        } catch (err) {
          console.error('MathJax就绪回调执行失败:', err);
        }
      });
      this.readyCallbacks = [];
    }
  }
  
  /**
   * MathJax加载完成回调
   */
  private async onMathJaxLoaded(): Promise<void> {
    if (!this.isClient || !window.MathJax) {
      console.error('MathJax未正确加载或环境不支持');
      return;
    }
    
    try {
      // 等待MathJax完全启动
      if (window.MathJax.startup && window.MathJax.startup.promise) {
        await window.MathJax.startup.promise;
      }
      
      this.isReady = true;
      this.retryCount = 0; // 重置重试计数
      
      // 执行所有等待的回调
      const callbacks = [...this.readyCallbacks];
      this.readyCallbacks = []; // 清空队列再执行回调，避免回调中再次添加回调导致的问题
      
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('MathJax就绪回调执行失败:', error);
        }
      });
      
      // 处理渲染队列中的元素
      this.processRenderQueue();
      
      console.log('MathJax初始化成功，版本:', window.MathJax.version || '未知');
    } catch (error) {
      console.error('MathJax启动失败:', error);
      // 尝试重试
      this.handleLoadError(error);
    }
  }
  
  /**
   * 获取MathJax是否准备就绪
   */
  public get isReadyState(): boolean {
    return this.isReady;
  }
  
  /**
   * 监听MathJax就绪事件
   */
  public onReady(callback: () => void): void {
    if (!callback || typeof callback !== 'function') {
      return;
    }
    
    if (this.isReady) {
      // 异步执行回调，避免阻塞
      setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.error('MathJax就绪回调执行失败:', error);
        }
      }, 0);
    } else {
      this.readyCallbacks.push(callback);
    }
  }
  
  /**
   * 移除MathJax就绪事件监听
   */
  public offReady(callback: () => void): void {
    if (!callback || typeof callback !== 'function') {
      return;
    }
    
    const index = this.readyCallbacks.indexOf(callback);
    if (index > -1) {
      this.readyCallbacks.splice(index, 1);
    }
  }
  
  /**
   * 立即渲染指定元素
   */
  public async typeset(elements?: HTMLElement[]): Promise<void> {
    if (!this.isClient || !this.isReady || !window.MathJax) {
      throw new Error('MathJax未就绪或环境不支持');
    }
    
    try {
      // 安全地清除之前的渲染
      if (window.MathJax.typesetClear) {
        try {
          window.MathJax.typesetClear();
        } catch (err) {
          console.warn('MathJax清除渲染失败:', err);
        }
      }
      
      // 优先使用typesetPromise，降级到typeset
      if (window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise(elements);
      } else if (window.MathJax.typeset) {
        await window.MathJax.typeset(elements);
      } else if (window.MathJax.hub && window.MathJax.hub.Typeset) {
        // 兼容旧版本API
        await new Promise<void>((resolve) => {
          window.MathJax.hub.Typeset(elements, () => resolve());
        });
      } else {
        throw new Error('未找到可用的MathJax渲染方法');
      }
    } catch (error) {
      console.error('MathJax渲染失败:', error);
      throw error;
    }
  }
  
  /**
   * 将元素加入渲染队列（防抖处理）
   * @param element 要渲染的元素
   * @param immediate 是否立即渲染，不加入队列
   */
  public queueTypeset(element: HTMLElement, immediate: boolean = false): void {
    if (!element || !element.isConnected) {
      console.warn('尝试渲染不存在或已断开连接的DOM元素');
      return;
    }
    
    // 如果元素已在队列中，不再重复添加
    if (this.renderQueue.includes(element)) {
      return;
    }
    
    // 立即渲染模式
    if (immediate && this.isReady) {
      this.typeset([element]).catch(err => {
        console.warn('MathJax立即渲染失败:', err);
      });
      return;
    }
    
    this.renderQueue.push(element);
    
    // 清除之前的定时器
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
    
    // 设置新的定时器，使用更短的延迟以提高响应速度
    this.renderTimeout = setTimeout(() => {
      this.processRenderQueue();
    }, 150);
  }
  
  /**
   * 处理渲染队列
   */
  private async processRenderQueue(): Promise<void> {
    if (this.renderQueue.length === 0 || !this.isClient || !this.isReady || !window.MathJax) {
      return;
    }
    
    // 过滤掉无效的元素
    const validElements = this.renderQueue.filter(el => el && el.isConnected);
    const elements = [...validElements];
    this.renderQueue = [];
    
    if (elements.length === 0) {
      return;
    }
    
    try {
      await this.typeset(elements);
    } catch (error) {
      console.error('渲染队列处理失败:', error);
      // 失败后尝试重新加入队列，限制重试次数
      elements.forEach(element => {
        // 避免重复加入
        if (!this.renderQueue.includes(element)) {
          this.renderQueue.push(element);
        }
      });
      
      // 稍后重试
      setTimeout(() => {
        this.processRenderQueue();
      }, 500);
    }
  }
  
  /**
   * 清除指定元素的MathJax渲染
   */
  public clear(element: HTMLElement): void {
    if (!this.isClient || !element) {
      return;
    }
    
    try {
      // 移除MathJax添加的元素和属性
      const mathElements = element.querySelectorAll('.MathJax, mjx-container, mjx-assistive-mml');
      mathElements.forEach(el => {
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (err) {
          console.warn('移除MathJax元素失败:', err);
        }
      });
      
      // 清除相关属性
      element.removeAttribute('data-mathml');
      element.removeAttribute('data-mjx-version');
      element.removeAttribute('data-mathjax');
    } catch (error) {
      console.error('清除MathJax渲染失败:', error);
    }
  }
  
  /**
   * 销毁MathJax实例
   */
  public destroy(): void {
    // 清除定时器
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
    
    // 清空队列
    this.renderQueue = [];
    this.readyCallbacks = [];
    
    // 重置状态
    this.isReady = false;
    this.isInitialized = false;
    this.retryCount = 0;
    
    // 移除脚本元素
    if (this.scriptElement && this.scriptElement.parentNode) {
      try {
        this.scriptElement.parentNode.removeChild(this.scriptElement);
      } catch (err) {
        console.warn('移除MathJax脚本失败:', err);
      }
      this.scriptElement = null;
    }
    
    // 移除MathJax实例
    if (this.isClient && window.MathJax) {
      try {
        // 尝试安全地关闭MathJax（如果支持）
        if (window.MathJax.startup && window.MathJax.startup.shutdown) {
          window.MathJax.startup.shutdown();
        }
      } catch (err) {
        console.warn('关闭MathJax失败:', err);
      }
      
      // 最后删除全局实例
      delete window.MathJax;
    }
  }
}

// 创建并导出单例实例
export const MathJax = MathJaxService.getInstance();