import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// 全局设置
// 增强的错误捕获和处理
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleInfo = console.info

// 错误统计
let errorCount = 0
let warningCount = 0

vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
  const messageStr = message.toString()
  
  // 扩展的忽略消息列表
  const ignoreMessages = [
    'useLayoutEffect does nothing on the server',
    'Warning: Failed prop type',
    'Warning: ReactDOM.render is no longer supported',
    'Warning: componentWillMount',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillUpdate',
    'Error: Unable to find an element'
  ]
  
  const shouldIgnore = ignoreMessages.some(ignore => messageStr.includes(ignore))
  
  if (!shouldIgnore) {
    errorCount++
    originalConsoleError('TEST ERROR:', messageStr, ...args)
  }
})

vi.spyOn(console, 'warn').mockImplementation((message, ...args) => {
  const messageStr = message.toString()
  
  // 忽略的警告消息
  const ignoreWarnings = [
    'Deprecation warning',
    'Warning: Each child in a list should have a unique "key" prop'
  ]
  
  if (!ignoreWarnings.some(ignore => messageStr.includes(ignore))) {
    warningCount++
    originalConsoleWarn('TEST WARNING:', messageStr, ...args)
  }
})

vi.spyOn(console, 'info').mockImplementation((message, ...args) => {
  originalConsoleInfo('TEST INFO:', message, ...args)
})

// 全局 beforeEach 钩子
beforeEach(() => {
  // 重置错误计数
  errorCount = 0
  warningCount = 0
  
  // 重置所有模拟
  vi.resetAllMocks()
  
  // 增强的窗口模拟
  if (typeof window !== 'undefined') {
    // 基础窗口属性
    Object.defineProperty(window, 'innerWidth', { 
      writable: true, 
      value: 1024 
    })
    Object.defineProperty(window, 'innerHeight', { 
      writable: true, 
      value: 768 
    })
    Object.defineProperty(window, 'devicePixelRatio', { 
      writable: true, 
      value: 1 
    })
    
    // 增强的 matchMedia 模拟
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => {
        // 智能匹配一些常见的媒体查询
        const matches = query.includes('max-width: 768px') ? true : false
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
    
    // 性能 API 模拟
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntries: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn()
      }
    })
    
    // 动画帧 API 模拟
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => 
      setTimeout(() => cb(Date.now()), 0)
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => 
      clearTimeout(id)
    )
    
    // 增强的 IntersectionObserver 模拟
    global.IntersectionObserver = class IntersectionObserver {
      private callback: Function
      private options: any
      private targets: Set<any> = new Set()
      
      constructor(callback: Function, options: any = {}) {
        this.callback = callback
        this.options = options
      }
      
      disconnect() {
        this.targets.clear()
      }
      
      observe(target: any) {
        this.targets.add(target)
        // 立即触发回调，模拟元素可见
        setTimeout(() => {
          this.callback([{
            isIntersecting: true,
            intersectionRatio: 1,
            target,
            boundingClientRect: { width: 100, height: 100 },
            intersectionRect: { width: 100, height: 100 },
            rootBounds: { width: 1024, height: 768 }
          }])
        }, 0)
      }
      
      takeRecords() {
        return Array.from(this.targets).map(target => ({
          isIntersecting: true,
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
      private targets: Set<any> = new Set()
      
      constructor(callback: Function) {
        this.callback = callback
      }
      
      disconnect() {
        this.targets.clear()
      }
      
      observe(target: any) {
        this.targets.add(target)
        // 立即触发回调
        setTimeout(() => {
          this.callback([{
            target,
            contentRect: { width: 300, height: 200 }
          }])
        }, 0)
      }
      
      unobserve(target: any) {
        this.targets.delete(target)
      }
    } as any
    
    // localStorage 模拟
    if (!('localStorage' in window)) {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0
        },
        writable: true
      })
    }
    
    // sessionStorage 模拟
    if (!('sessionStorage' in window)) {
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0
        },
        writable: true
      })
    }
  }
})

// 全局 afterEach 钩子
afterEach(() => {
  // 清理测试库生成的 DOM 元素
  cleanup()
  
  // 恢复所有模拟
  vi.restoreAllMocks()
  
  // 记录测试统计信息
  if (errorCount > 0) {
    console.log(`⚠️  当前测试产生了 ${errorCount} 个错误`)
  }
  if (warningCount > 0) {
    console.log(`⚠️  当前测试产生了 ${warningCount} 个警告`)
  }
})
