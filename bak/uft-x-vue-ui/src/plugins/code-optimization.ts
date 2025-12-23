/**
 * 代码优化系统插件
 * 为Vue应用提供全局代码优化功能
 */
import type { App, Plugin } from 'vue'
import { useCodeOptimizationStore } from '@/stores/code-optimization'
import type { CodeOptimizationOptions } from '@/composables/useCodeOptimization'

export interface CodeOptimizationPluginOptions {
  global?: boolean
  autoMount?: boolean
  defaultOptions?: CodeOptimizationOptions
  routes?: {
    optimizer?: string
    analysis?: string
    settings?: string
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $codeOptimization: ReturnType<typeof useCodeOptimizationStore>
  }
}

export const CodeOptimizationPlugin: Plugin<CodeOptimizationPluginOptions> = {
  install(app: App, options: CodeOptimizationPluginOptions = {}) {
    const {
      global = true,
      autoMount = true,
      defaultOptions = {},
      routes = {
        optimizer: '/code-optimizer',
        analysis: '/code-analysis',
        settings: '/optimizer-settings'
      }
    } = options

    // 创建全局store实例
    const store = useCodeOptimizationStore()

    // 全局属性
    if (global) {
      app.config.globalProperties.$codeOptimization = store
      app.provide('codeOptimization', store)
    }

    // 自动挂载初始化
    if (autoMount) {
      // 在应用挂载前初始化store
      app.mixin({
        beforeCreate() {
          if (this.$options.name === 'App') {
            store.initialize()
          }
        }
      })
    }

    // 路由配置辅助函数
    app.config.globalProperties.$codeOptimizerRoutes = routes

    // 全局工具函数
    app.config.globalProperties.$optimizeCode = async (
      code: string,
      language: string = 'javascript'
    ) => {
      store.setInputCode(code)
      store.setSelectedLanguage(language as any)
      await store.analyzeAndOptimize()
      return store.exportOptimizationReport()
    }

    // 开发模式下的调试工具
    if (import.meta.env.DEV) {
      app.config.globalProperties.$debugCodeOptimization = () => {
        console.group('🔧 Code Optimization Debug Info')
        console.log('Store State:', store.state)
        console.log('Can Analyze:', store.hasCode && !store.isAnalyzing)
        console.log('Can Optimize:', store.analysisResult !== null)
        console.log('Analysis Result:', store.analysisResult)
        console.log('Optimization Report:', store.optimizationReport)
        console.groupEnd()
      }
    }
  }
}

// 插件工厂函数
export function createCodeOptimizationPlugin(options: CodeOptimizationPluginOptions = {}) {
  return CodeOptimizationPlugin
}

// 自动安装（适用于CDN方式）
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(CodeOptimizationPlugin)
}

// 导出类型
export type CodeOptimizationPlugin = typeof CodeOptimizationPlugin
export type { CodeOptimizationPluginOptions }
