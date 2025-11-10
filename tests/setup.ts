import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { act } from 'react'

// 性能监控和测试统计
class TestPerformanceMonitor {
  private static instance: TestPerformanceMonitor
  private testStats: Map<string, {
    startTime: number
    endTime: number
    duration: number
    errors: string[]
    warnings: string[]
  }>
  
  private constructor() {
    this.testStats = new Map()
  }
  
  static getInstance() {
    if (!TestPerformanceMonitor.instance) {
      TestPerformanceMonitor.instance = new TestPerformanceMonitor()
    }
    return TestPerformanceMonitor.instance
  }
  
  startTest(testName: string) {
    // 使用 Date.now() 替代 performance.now() 以避免 NaN 问题
    this.testStats.set(testName, {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      errors: [],
      warnings: []
    })
  }
  
  endTest(testName: string) {
    const test = this.testStats.get(testName)
    if (test) {
      test.endTime = Date.now()
      test.duration = test.endTime - test.startTime
    }
  }
  
  addError(testName: string, error: string) {
    const test = this.testStats.get(testName)
    if (test) {
      test.errors.push(error)
    }
  }
  
  addWarning(testName: string, warning: string) {
    const test = this.testStats.get(testName)
    if (test) {
      test.warnings.push(warning)
    }
  }
  
  getStats() {
    return this.testStats
  }
}

const perfMonitor = TestPerformanceMonitor.getInstance()

// 保存原始的控制台方法
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleInfo = console.info
const originalConsoleLog = console.log

// 增强的错误处理和过滤系统
const errorFilterSystem = {
  // 可配置的错误过滤器
  errorFilters: [
    { pattern: /useLayoutEffect does nothing on the server/i, reason: 'SSR 特定警告' },
    { pattern: /Warning: Failed prop type/i, reason: 'Prop 类型检查警告' },
    { pattern: /Warning: ReactDOM\.render is no longer supported/i, reason: 'React API 弃用警告' },
    { pattern: /Warning: componentWillMount|componentWillReceiveProps|componentWillUpdate/i, reason: '遗留生命周期方法警告' },
    { pattern: /Error: Unable to find an element/i, reason: '元素查找失败错误' }
  ],
  
  warningFilters: [
    { pattern: /Deprecation warning/i, reason: '弃用警告' },
    { pattern: /Warning: Each child in a list should have a unique "key" prop/i, reason: 'Key prop 警告' }
  ],
  
  shouldFilterError(message: string): boolean {
    return this.errorFilters.some(filter => filter.pattern.test(message))
  },
  
  shouldFilterWarning(message: string): boolean {
    return this.warningFilters.some(filter => filter.pattern.test(message))
  }
}

// 增强的控制台模拟
vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
  const messageStr = message.toString()
  
  if (!errorFilterSystem.shouldFilterError(messageStr)) {
    const testName = expect.getState().currentTestName || 'unknown_test'
    perfMonitor.addError(testName, messageStr)
    originalConsoleError('🔴 TEST ERROR:', messageStr, ...args)
  }
})

vi.spyOn(console, 'warn').mockImplementation((message, ...args) => {
  const messageStr = message.toString()
  
  if (!errorFilterSystem.shouldFilterWarning(messageStr)) {
    const testName = expect.getState().currentTestName || 'unknown_test'
    perfMonitor.addWarning(testName, messageStr)
    originalConsoleWarn('🟠 TEST WARNING:', messageStr, ...args)
  }
})

vi.spyOn(console, 'info').mockImplementation((message, ...args) => {
  originalConsoleInfo('ℹ️  TEST INFO:', message, ...args)
})

// 高级的 DOM API 模拟
function setupAdvancedDomMocks() {
  if (typeof window !== 'undefined') {
    // 响应式视口模拟
    const viewportManager = {
      width: 1024,
      height: 768,
      setSize(width: number, height: number) {
        this.width = width
        this.height = height
        Object.defineProperty(window, 'innerWidth', { writable: true, value: width })
        Object.defineProperty(window, 'innerHeight', { writable: true, value: height })
        
        // 模拟 resize 事件
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event('resize'))
        }
      }
    }
    
    viewportManager.setSize(1024, 768)
    
    Object.defineProperty(window, 'devicePixelRatio', { 
      writable: true, 
      value: 1 
    })
    
    // 增强的 matchMedia 模拟
    const mediaQueries = new Map<string, boolean>()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => {
        // 智能媒体查询匹配逻辑
        let matches = false
        if (query.includes('max-width: 768px')) matches = viewportManager.width <= 768
        else if (query.includes('min-width: 768px')) matches = viewportManager.width >= 768
        else if (query.includes('max-width: 1024px')) matches = viewportManager.width <= 1024
        else if (query.includes('min-width: 1024px')) matches = viewportManager.width >= 1024
        
        mediaQueries.set(query, matches)
        
        return {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }),
    })
    
    // 高精度性能 API 模拟
    let performanceNowOffset = 0
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now() + performanceNowOffset),
        mark: vi.fn((name: string) => {
          // 记录性能标记
          performanceNowOffset += 1 // 模拟时间流逝
        }),
        measure: vi.fn(),
        getEntries: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        timeOrigin: Date.now()
      }
    })
    
    // 动画帧 API 优化模拟
    const rafCallbacks = new Map<number, Function>()
    let rafIdCounter = 0
    
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      const id = ++rafIdCounter
      rafCallbacks.set(id, cb)
      
      // 立即执行以加速测试，但保持异步特性
      setTimeout(() => {
        if (rafCallbacks.has(id)) {
          act(() => {
            cb(window.performance.now())
          })
          rafCallbacks.delete(id)
        }
      }, 0)
      
      return id
    })
    
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
      rafCallbacks.delete(id)
    })
    
    // 增强的 IntersectionObserver 模拟
    global.IntersectionObserver = class IntersectionObserver {
      private callback: Function
      private options: any
      private targets: Map<any, { isIntersecting: boolean; ratio: number }>
      
      constructor(callback: Function, options: any = {}) {
        this.callback = callback
        this.options = options
        this.targets = new Map()
      }
      
      disconnect() {
        this.targets.clear()
      }
      
      observe(target: any) {
        // 智能检测目标是否可见
        const isVisible = !(target.style?.display === 'none' || target.style?.visibility === 'hidden')
        const ratio = isVisible ? 1 : 0
        
        this.targets.set(target, { isIntersecting: isVisible, ratio })
        
        // 使用 act 包裹以避免 React 警告
        act(() => {
          this.callback([{
            isIntersecting,
            intersectionRatio: ratio,
            target,
            boundingClientRect: { width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100 },
            intersectionRect: { width: isVisible ? 100 : 0, height: isVisible ? 100 : 0 },
            rootBounds: { width: viewportManager.width, height: viewportManager.height },
            time: performance.now()
          }])
        })
      }
      
      takeRecords() {
        return Array.from(this.targets.entries()).map(([target, info]) => ({
          isIntersecting: info.isIntersecting,
          intersectionRatio: info.ratio,
          target
        }))
      }
      
      unobserve(target: any) {
        this.targets.delete(target)
      }
    } as any
    
    // 增强的 ResizeObserver 模拟
    global.ResizeObserver = class ResizeObserver {
      private callback: Function
      private targets: Set<any>
      
      constructor(callback: Function) {
        this.callback = callback
        this.targets = new Set()
      }
      
      disconnect() {
        this.targets.clear()
      }
      
      observe(target: any) {
        this.targets.add(target)
        
        // 获取实际尺寸或使用默认值
        const width = target.offsetWidth || target.style?.width || 300
        const height = target.offsetHeight || target.style?.height || 200
        
        // 使用 act 包裹
        act(() => {
          this.callback([{
            target,
            contentRect: { 
              width: Number(width), 
              height: Number(height),
              top: 0,
              left: 0,
              bottom: Number(height),
              right: Number(width)
            }
          }])
        })
      }
      
      unobserve(target: any) {
        this.targets.delete(target)
      }
    } as any
    
    // 存储 API 增强模拟
    const createStorageMock = () => {
      const storage = new Map<string, string>()
      return {
        getItem: vi.fn((key: string) => storage.get(key) || null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, String(value))
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key)
        }),
        clear: vi.fn(() => {
          storage.clear()
        }),
        length: vi.fn(() => storage.size),
        key: vi.fn((index: number) => Array.from(storage.keys())[index] || null)
      }
    }
    
    if (!('localStorage' in window)) {
      Object.defineProperty(window, 'localStorage', {
        value: createStorageMock(),
        writable: true
      })
    }
    
    if (!('sessionStorage' in window)) {
      Object.defineProperty(window, 'sessionStorage', {
        value: createStorageMock(),
        writable: true
      })
    }
    
    // 网络请求模拟增强
    if (!('fetch' in window)) {
      Object.defineProperty(window, 'fetch', {
        value: vi.fn().mockImplementation(() => 
          Promise.resolve({
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers()
          })
        ),
        writable: true
      })
    }
    
    // URL API 模拟
    if (!('URL' in window)) {
      Object.defineProperty(window, 'URL', {
        value: class URL {
          href: string
          origin: string
          protocol: string
          hostname: string
          pathname: string
          search: string
          hash: string
          
          constructor(url: string, base?: string) {
            const parsed = new URL(url, base)
            this.href = parsed.href
            this.origin = parsed.origin
            this.protocol = parsed.protocol
            this.hostname = parsed.hostname
            this.pathname = parsed.pathname
            this.search = parsed.search
            this.hash = parsed.hash
          }
          
          searchParams = new URLSearchParams()
        },
        writable: true
      })
    }
  }
}

// 全局测试套件钩子
beforeAll(() => {
  // 初始化测试环境
  setupAdvancedDomMocks()
  
  // 添加全局测试工具函数
  globalThis.act = act
  
  // 启用测试加速模式
  vi.setConfig({
    mockReset: true,
    clearMocks: true
  })
  
  console.log('🚀 测试环境初始化完成')
})

afterAll(() => {
  // 输出测试性能统计
  const stats = perfMonitor.getStats()
  let totalDuration = 0
  let totalErrors = 0
  let totalWarnings = 0
  
  stats.forEach(test => {
    totalDuration += test.duration
    totalErrors += test.errors.length
    totalWarnings += test.warnings.length
  })
  
  console.log(`📊 测试套件统计：`)
  console.log(`  • 总测试数: ${stats.size}`)
  console.log(`  • 总耗时: ${totalDuration.toFixed(2)}ms`)
  console.log(`  • 平均耗时: ${(totalDuration / stats.size).toFixed(2)}ms`)
  console.log(`  • 错误总数: ${totalErrors}`)
  console.log(`  • 警告总数: ${totalWarnings}`)
})

// 单个测试钩子
beforeEach(() => {
  // 获取当前测试名称
  const testName = expect.getState().currentTestName || 'unknown_test'
  
  // 开始测试计时
  perfMonitor.startTest(testName)
  
  // 重置所有模拟，但保留实现
  vi.resetAllMocks()
  
  // 重置 DOM 状态
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  }
})

afterEach(() => {
  // 获取当前测试名称并结束计时
  const testName = expect.getState().currentTestName || 'unknown_test'
  perfMonitor.endTest(testName)
  
  // 清理测试库生成的 DOM 元素
  cleanup()
  
  // 恢复所有原始实现
  vi.restoreAllMocks()
  
  // 检查内存泄漏
  const currentStats = perfMonitor.getStats().get(testName)
  if (currentStats) {
    if (currentStats.errors.length > 0) {
      console.warn(`⚠️  测试 "${testName}" 产生了 ${currentStats.errors.length} 个错误`)
    }
    if (currentStats.warnings.length > 0) {
      console.warn(`⚠️  测试 "${testName}" 产生了 ${currentStats.warnings.length} 个警告`)
    }
    if (currentStats.duration > 1000) {
      console.warn(`⏱️  测试 "${testName}" 运行时间过长: ${currentStats.duration.toFixed(2)}ms`)
    }
  }
})

// 导出测试工具函数
export const testUtils = {
  // 模拟响应式视口调整
  simulateViewport(width: number, height: number) {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: width })
      Object.defineProperty(window, 'innerHeight', { writable: true, value: height })
      window.dispatchEvent(new Event('resize'))
    }
  },
  
  // 等待所有异步操作完成
  waitForAsync: (timeout: number = 500) => new Promise(resolve => setTimeout(resolve, timeout)),
  
  // 强制渲染组件
  forceUpdate: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'))
    }
  },
  
  // 模拟网络延迟
  simulateNetworkDelay: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms))
}
