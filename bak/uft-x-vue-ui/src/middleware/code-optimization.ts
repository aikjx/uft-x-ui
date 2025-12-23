/**
 * 代码优化系统中间件
 * 为路由和组件提供代码优化功能
 */
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useCodeOptimizationStore } from '@/stores/code-optimization'
import type { ProgrammingLanguage } from '@/types/code-optimization'

export interface CodeOptimizationGuardOptions {
  requireAnalysis?: boolean
  autoSave?: boolean
  validateCode?: boolean
  maxCodeLength?: number
}

/**
 * 路由守卫 - 确保代码优化功能的正确使用
 */
export function createCodeOptimizationGuard(options: CodeOptimizationGuardOptions = {}) {
  const {
    requireAnalysis = false,
    autoSave = true,
    validateCode = true,
    maxCodeLength = 50000
  } = options

  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const store = useCodeOptimizationStore()

    try {
      // 自动保存当前状态
      if (autoSave) {
        localStorage.setItem(
          'code-optimizer-last-state',
          JSON.stringify({
            code: store.inputCode,
            language: store.selectedLanguage,
            analysisResult: store.analysisResult,
            optimizationReport: store.optimizationReport,
            timestamp: Date.now()
          })
        )
      }

      // 验证代码长度
      if (validateCode && store.inputCode.length > maxCodeLength) {
        next({
          path: '/error',
          query: {
            error: 'code_too_long',
            max: maxCodeLength.toString()
          }
        })
        return
      }

      // 要求完成分析
      if (requireAnalysis && !store.analysisResult && store.hasCode) {
        await store.analyzeCode()
      }

      next()
    } catch (error) {
      console.error('代码优化路由守卫错误:', error)
      next({ path: '/error' })
    }
  }
}

/**
 * 组件级代码优化混入
 */
export function createCodeOptimizationMixin() {
  return {
    setup() {
      const store = useCodeOptimizationStore()

      // 组件挂载时恢复状态
      onMounted(() => {
        const savedState = localStorage.getItem('code-optimizer-last-state')
        if (savedState) {
          try {
            const state = JSON.parse(savedState)
            if (state.code) store.setInputCode(state.code)
            if (state.language) store.setSelectedLanguage(state.language)
            // 注意：不能直接设置AST对象，需要重新分析
          } catch (error) {
            console.warn('恢复代码优化状态失败:', error)
          }
        }
      })

      return {
        store,
        codeOptimization: {
          canAnalyze: computed(() => store.hasCode && !store.isAnalyzing),
          canOptimize: computed(() => store.analysisResult !== null),
          performanceScore: computed(() => {
            const metrics = store.complexityMetrics
            if (!metrics) return 100
            return Math.max(0, 100 - metrics.cyclomaticComplexity * 2)
          })
        }
      }
    }
  }
}

/**
 * 错误处理中间件
 */
export function createCodeOptimizationErrorHandler() {
  return (error: Error, instance: any, info: string) => {
    if (info.includes('code-optimization')) {
      console.group('🔧 代码优化错误处理')
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
      console.error('组件信息:', instance)
      console.groupEnd()

      // 尝试恢复到安全状态
      const store = useCodeOptimizationStore()
      store.resetState()

      // 记录错误统计
      const errorStats = JSON.parse(localStorage.getItem('code-optimizer-errors') || '{}')
      errorStats[error.name] = (errorStats[error.name] || 0) + 1
      localStorage.setItem('code-optimizer-errors', JSON.stringify(errorStats))
    }
  }
}

/**
 * 性能监控中间件
 */
export function createPerformanceMonitor() {
  return (app: any) => {
    app.config.performance = true

    // 监控代码优化相关性能
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('code-optimization')) {
            console.log(`📊 代码优化性能: ${entry.name} - ${entry.duration}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }
}

/**
 * 权限控制中间件
 */
export function createPermissionGuard() {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 检查是否有访问代码优化功能的权限
    const hasPermission = localStorage.getItem('code-optimizer-permission') !== 'denied'

    if (to.path.startsWith('/code-optimizer') && !hasPermission) {
      next({ path: '/permission-denied' })
    } else {
      next()
    }
  }
}

/**
 * 状态持久化中间件
 */
export function createStatePersistenceMiddleware() {
  return {
    install(app: any) {
      // 在应用卸载时保存状态
      window.addEventListener('beforeunload', () => {
        const store = useCodeOptimizationStore()
        if (store.userPreferences.autoSave) {
          localStorage.setItem(
            'code-optimizer-final-state',
            JSON.stringify({
              inputCode: store.inputCode,
              selectedLanguage: store.selectedLanguage,
              optimizationLevel: store.optimizationLevel,
              timestamp: Date.now()
            })
          )
        }
      })
    }
  }
}

/**
 * 代码安全检查中间件
 */
export function createSecurityCheckMiddleware() {
  return (code: string): { isSafe: boolean; warnings: string[] } => {
    const warnings: string[] = []
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*["'`]/gi,
      /setInterval\s*\(\s*["'`]/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi
    ]

    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(code)) {
        const patterns = [
          'eval',
          'Function构造器',
          'setTimeout字符串',
          'setInterval字符串',
          'innerHTML',
          'outerHTML'
        ]
        warnings.push(`检测到潜在安全风险: ${patterns[index]}`)
      }
    })

    return {
      isSafe: warnings.length === 0,
      warnings
    }
  }
}
