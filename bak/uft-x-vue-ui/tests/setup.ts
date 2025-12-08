import { expect } from 'vitest'
import { config } from '@vue/test-utils'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom'

// 配置Vue Test Utils
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// 扩展expect类型
declare global {
  namespace Vi {
    interface Assertion extends TestingLibraryMatchers<any, any> {}
  }
}

// 测试环境配置
const testConfig = {
  // 模拟全局对象
  global: {
    // 模拟浏览器API
    window: {
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener: () => {},
      removeEventListener: () => {},
      requestAnimationFrame: (cb: FrameRequestCallback) => setTimeout(cb, 16),
      cancelAnimationFrame: (id: number) => clearTimeout(id),
      performance: {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {}
      }
    },
    
    // 模拟document
    document: {
      createElement: () => ({
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {}
      }),
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    
    // 模拟navigator
    navigator: {
      userAgent: 'test',
      hardwareConcurrency: 8
    }
  },
  
  // 测试超时设置
  testTimeout: 30000,
  
  // 钩子函数
  hooks: {
    beforeEach: () => {
      // 每个测试前的清理工作
      console.log('开始执行测试...')
    },
    afterEach: () => {
      // 每个测试后的清理工作
      console.log('测试执行完成')
    }
  }
}

// 导出测试配置
export default testConfig

// 自定义匹配器
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      }
    }
  },
  
  toBePerformanceOptimal(received: number, threshold: number) {
    const pass = received <= threshold
    if (pass) {
      return {
        message: () => `expected ${received} not to be <= ${threshold}ms`,
        pass: true
      }
    } else {
      return {
        message: () => `性能测试失败: ${received}ms > ${threshold}ms`,
        pass: false
      }
    }
  }
})