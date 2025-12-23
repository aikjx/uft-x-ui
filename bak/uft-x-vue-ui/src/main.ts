import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// TDesign样式将通过组件自动导入

// 初始化 process polyfill
import processPolyfill from './utils/processPolyfill'
processPolyfill()

// 导入代码优化系统
import { CodeOptimizationPlugin } from './plugins/code-optimization'
import { createPerformanceMonitor } from './services/performance-monitor'
import { createCodeOptimizationErrorHandler } from './middleware/code-optimization'

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用Vue Router
app.use(router)

// 集成代码优化系统插件
app.use(CodeOptimizationPlugin, {
  global: true,
  autoMount: true,
  defaultOptions: {
    enableAutoAnalysis: false,
    enableRealTimeMetrics: true,
    analysisDelay: 500,
    maxCodeLength: 50000
  },
  routes: {
    optimizer: '/code-optimizer',
    analysis: '/code-analysis',
    settings: '/optimizer-settings'
  }
})

// 初始化性能监控
const performanceMonitor = createPerformanceMonitor()
app.provide('performanceMonitor', performanceMonitor)

// 设置错误处理
app.config.errorHandler = createCodeOptimizationErrorHandler()

// 开发模式下的调试
if (import.meta.env.DEV) {
  app.config.globalProperties.$debug = true

  // 启用Vue DevTools
  app.config.devtools = true

  // 性能监控
  app.config.performance = true
}

// 全局应用初始化
app.mixin({
  beforeCreate() {
    // 应用级别的初始化逻辑
    if (this.$options.name === 'App') {
      console.log('🚀 全自动代码优化系统启动中...')

      // 启动性能监控
      performanceMonitor.startMonitoring(2000)

      console.log('✅ 系统初始化完成')
    }
  },

  unmounted() {
    // 清理资源
    if (this.$options.name === 'App') {
      performanceMonitor.stopMonitoring()
      console.log('🔚 系统已关闭')
    }
  }
})

// 挂载应用
app.mount('#app')

// 导出全局实例供调试使用
if (import.meta.env.DEV) {
  ;(window as any).__CODE_OPTIMIZATION_APP__ = app(window as any).__PERFORMANCE_MONITOR__ =
    performanceMonitor
}
