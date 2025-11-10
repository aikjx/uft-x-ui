// MathJax服务类，提供全局的MathJax配置和管理

// 声明全局MathJax对象接口
interface MathJaxInstance {
  typeset: (elements?: HTMLElement[]) => Promise<void>;
  typesetClear: () => void;
  typesetPromise: (elements?: HTMLElement[]) => Promise<HTMLElement[]>;
  startup: {
    promise: Promise<void>;
  };
  version: string;
}

interface WindowWithMathJax extends Window {
  MathJax?: MathJaxInstance;
}

declare const window: WindowWithMathJax;

// MathJax服务类
export class MathJaxService {
  private static instance: MathJaxService;
  private isInitialized: boolean = false;
  private isReady: boolean = false;
  private readyCallbacks: (() => void)[] = [];
  private renderQueue: HTMLElement[] = [];
  private renderTimeout: ReturnType<typeof setTimeout> | null = null;
  
  private constructor() {}
  
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
   */
  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }
    
    this.isInitialized = true;
    
    // 配置MathJax
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        packages: ['base', 'ams', 'noerrors', 'noundefined', 'physics'],
        macros: {
          \RR: '{\\mathbb{R}}',
          \ZZ: '{\\mathbb{Z}}',
          \NN: '{\\mathbb{N}}',
          \CC: '{\\mathbb{C}}',
          \degree: '{\\circ}',
          \abs: ['{|#1|}', 1],
          \norm: ['{\\lVert#1\\rVert}', 1],
          \vector: ['{\\vec{#1}}', 1],
          \gradient: '{\\nabla}',
          \laplacian: '{\\nabla^2}',
          \operator: ['{\\operatorname{#1}}', 1]
        }
      },
      svg: {
        fontCache: 'global',
        scale: 1.1,
        exFactor: 0.5,
        displayAlign: 'center',
        displayIndent: '0',
        localID: null,
        internalSpeechTitles: true,
        titleID: 0,
        title: null,
        assistiveMml: false,
        startScale: 1,
        merrorInheritFont: true
      },
      startup: {
        typeset: false,
        showProcessingMessages: false,
        showMathMenu: true,
        showMathMenuMSIE: true,
        useBrowserLocale: true,
        preview: 'none'
      },
      options: {
        enableMenu: true,
        enableAssistiveMml: false,
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
        renderActions: {
          addMenu: [1000, (doc: any) => {}, '']
        }
      }
    };
    
    // 动态加载MathJax脚本
    this.loadMathJaxScript();
  }
  
  /**
   * 加载MathJax脚本
   */
  private loadMathJaxScript(): void {
    if (typeof document === 'undefined') {
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.onload = () => {
      this.onMathJaxLoaded();
    };
    script.onerror = (error) => {
      console.error('MathJax加载失败:', error);
    };
    
    document.head.appendChild(script);
  }
  
  /**
   * MathJax加载完成回调
   */
  private async onMathJaxLoaded(): Promise<void> {
    if (!window.MathJax) {
      console.error('MathJax未正确加载');
      return;
    }
    
    try {
      // 等待MathJax完全启动
      await window.MathJax.startup.promise;
      
      this.isReady = true;
      
      // 执行所有等待的回调
      this.readyCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('MathJax就绪回调执行失败:', error);
        }
      });
      this.readyCallbacks = [];
      
      // 处理渲染队列中的元素
      this.processRenderQueue();
      
      console.log('MathJax初始化成功，版本:', window.MathJax.version);
    } catch (error) {
      console.error('MathJax启动失败:', error);
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
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }
  
  /**
   * 移除MathJax就绪事件监听
   */
  public offReady(callback: () => void): void {
    const index = this.readyCallbacks.indexOf(callback);
    if (index > -1) {
      this.readyCallbacks.splice(index, 1);
    }
  }
  
  /**
   * 立即渲染指定元素
   */
  public async typeset(elements?: HTMLElement[]): Promise<void> {
    if (!this.isReady || !window.MathJax) {
      throw new Error('MathJax未就绪');
    }
    
    try {
      window.MathJax.typesetClear();
      await window.MathJax.typesetPromise(elements);
    } catch (error) {
      console.error('MathJax渲染失败:', error);
      throw error;
    }
  }
  
  /**
   * 将元素加入渲染队列（防抖处理）
   */
  public queueTypeset(element: HTMLElement): void {
    if (!element || this.renderQueue.includes(element)) {
      return;
    }
    
    this.renderQueue.push(element);
    
    // 清除之前的定时器
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
    
    // 设置新的定时器，200ms后执行批量渲染
    this.renderTimeout = setTimeout(() => {
      this.processRenderQueue();
    }, 200);
  }
  
  /**
   * 处理渲染队列
   */
  private async processRenderQueue(): Promise<void> {
    if (this.renderQueue.length === 0 || !this.isReady || !window.MathJax) {
      return;
    }
    
    const elements = [...this.renderQueue];
    this.renderQueue = [];
    
    try {
      await this.typeset(elements);
    } catch (error) {
      console.error('渲染队列处理失败:', error);
    }
  }
  
  /**
   * 清除指定元素的MathJax渲染
   */
  public clear(element: HTMLElement): void {
    if (!element || !this.isReady || !window.MathJax) {
      return;
    }
    
    // 移除MathJax添加的元素和属性
    const mathElements = element.querySelectorAll('.MathJax, mjx-container');
    mathElements.forEach(el => el.remove());
    
    // 清除相关属性
    element.removeAttribute('data-mathml');
    element.removeAttribute('data-mjx-version');
  }
  
  /**
   * 销毁MathJax实例
   */
  public destroy(): void {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
    
    this.renderQueue = [];
    this.readyCallbacks = [];
    this.isReady = false;
    this.isInitialized = false;
    
    // 移除MathJax实例
    if (typeof window !== 'undefined' && window.MathJax) {
      delete window.MathJax;
    }
  }
}

// 创建并导出单例实例
export const MathJax = MathJaxService.getInstance();

// 导出类型
export type { MathJaxInstance, WindowWithMathJax };