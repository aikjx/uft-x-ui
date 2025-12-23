/**
 * 全局错误监控服务
 * 用于集中处理和监控应用中的所有错误
 */

import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import { ErrorCategory, ErrorLevel } from '../components/ErrorBoundary'

// 错误监控配置
interface ErrorMonitoringConfig {
  enableConsoleLogging: boolean
  enableRemoteReporting: boolean
  remoteReportingURL?: string
  sampleRate: number // 错误采样率，0-1
  maxErrorsPerMinute: number
  ignoreErrors: string[]
}

// 错误统计信息
interface ErrorStats {
  totalErrors: number
  errorsPerCategory: Record<ErrorCategory, number>
  errorsPerLevel: Record<ErrorLevel, number>
  errorsInLastMinute: number
  lastErrorTimestamp: number
}

export class ErrorMonitoringService {
  private config: ErrorMonitoringConfig
  private stats: ErrorStats
  private errorQueue: any[]
  private lastReportTime: number
  private errorCountInMinute: number

  constructor() {
    this.config = {
      enableConsoleLogging: import.meta.env.DEV,
      enableRemoteReporting: import.meta.env.PROD,
      sampleRate: 1.0,
      maxErrorsPerMinute: 100,
      ignoreErrors: [
        'ResizeObserver loop completed with undelivered notifications',
        'Script error.',
        'NetworkError when attempting to fetch resource.',
        'Failed to fetch'
      ]
    }

    this.stats = {
      totalErrors: 0,
      errorsPerCategory: {
        [ErrorCategory.RENDER]: 0,
        [ErrorCategory.THREEJS]: 0,
        [ErrorCategory.API]: 0,
        [ErrorCategory.STATE]: 0,
        [ErrorCategory.PERFORMANCE]: 0,
        [ErrorCategory.OTHER]: 0
      },
      errorsPerLevel: {
        [ErrorLevel.DEBUG]: 0,
        [ErrorLevel.INFO]: 0,
        [ErrorLevel.WARNING]: 0,
        [ErrorLevel.ERROR]: 0,
        [ErrorLevel.CRITICAL]: 0
      },
      errorsInLastMinute: 0,
      lastErrorTimestamp: 0
    }

    this.errorQueue = []
    this.lastReportTime = Date.now()
    this.errorCountInMinute = 0

    this.init()
  }

  /**
   * 服务初始化方法
   */
  initialize(): void {
    // 已经在构造函数中初始化
    console.log('🔍 ErrorMonitoringService initialized')
  }

  /**
   * 服务销毁方法
   */
  dispose(): void {
    // 停止所有定时器
    window.removeEventListener('error', this.handleGlobalError.bind(this))
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    eventSystem.off(APP_EVENTS.ERROR_OCCURRED, this.handleAppError.bind(this))

    // 清空错误队列
    this.errorQueue = []

    console.log('💥 ErrorMonitoringService disposed')
  }

  /**
   * 初始化错误监控服务
   */
  private init(): void {
    // 监听全局错误事件
    window.addEventListener('error', this.handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))

    // 监听应用内错误事件
    eventSystem.on(APP_EVENTS.ERROR_OCCURRED, this.handleAppError.bind(this))

    // 定期清理错误计数
    setInterval(this.clearErrorCount.bind(this), 60000)

    console.log('🔍 Error Monitoring Service initialized')
  }

  /**
   * 处理全局JavaScript错误
   */
  private handleGlobalError(event: ErrorEvent): void {
    if (this.shouldIgnoreError(event.error?.message || '')) {
      return
    }

    const errorInfo = {
      error: event.error,
      errorInfo: {
        componentStack: `at window.onerror (${event.filename}:${event.lineno}:${event.colno})`
      } as any,
      extendedInfo: {
        category: this.categorizeError(event.error),
        level: ErrorLevel.ERROR,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        componentName: 'Global',
        stack: event.error?.stack || '',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        }
      }
    }

    this.processError(errorInfo)
  }

  /**
   * 处理未处理的Promise拒绝
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    if (this.shouldIgnoreError(event.reason?.message || '')) {
      return
    }

    const errorInfo = {
      error: event.reason || new Error('Unhandled Promise Rejection'),
      errorInfo: {
        componentStack: 'at Promise (unhandled rejection)'
      } as any,
      extendedInfo: {
        category: this.categorizeError(event.reason),
        level: ErrorLevel.ERROR,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        componentName: 'Promise',
        stack: event.reason?.stack || '',
        context: {
          reason: event.reason?.toString() || 'Unknown reason'
        }
      }
    }

    this.processError(errorInfo)
  }

  /**
   * 处理应用内错误事件
   */
  private handleAppError(errorInfo: any): void {
    if (this.shouldIgnoreError(errorInfo.error?.message || '')) {
      return
    }

    this.processError(errorInfo)
  }

  /**
   * 处理错误
   */
  private processError(errorInfo: any): void {
    // 更新错误统计
    this.updateErrorStats(errorInfo.extendedInfo)

    // 检查错误速率限制
    if (this.errorCountInMinute >= this.config.maxErrorsPerMinute) {
      console.warn('🚨 Error rate limit exceeded, dropping error')
      return
    }

    // 检查采样率
    if (Math.random() > this.config.sampleRate) {
      return
    }

    // 记录到控制台
    if (this.config.enableConsoleLogging) {
      this.logErrorToConsole(errorInfo)
    }

    // 远程报告
    if (this.config.enableRemoteReporting) {
      this.queueErrorForRemoteReport(errorInfo)
    }

    // 更新错误计数
    this.errorCountInMinute++
  }

  /**
   * 分类错误
   */
  private categorizeError(error: any): ErrorCategory {
    if (!error || typeof error !== 'object') {
      return ErrorCategory.OTHER
    }

    const errorMessage = error.message?.toLowerCase() || ''

    if (errorMessage.includes('three.js') || errorMessage.includes('webgl')) {
      return ErrorCategory.THREEJS
    } else if (
      errorMessage.includes('api') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('axios')
    ) {
      return ErrorCategory.API
    } else if (
      errorMessage.includes('state') ||
      errorMessage.includes('hook') ||
      errorMessage.includes('use')
    ) {
      return ErrorCategory.STATE
    } else if (
      errorMessage.includes('render') ||
      errorMessage.includes('component') ||
      errorMessage.includes('element')
    ) {
      return ErrorCategory.RENDER
    } else if (
      errorMessage.includes('performance') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('slow')
    ) {
      return ErrorCategory.PERFORMANCE
    } else {
      return ErrorCategory.OTHER
    }
  }

  /**
   * 更新错误统计信息
   */
  private updateErrorStats(extendedInfo: any): void {
    this.stats.totalErrors++
    this.stats.errorsPerCategory[extendedInfo.category]++
    this.stats.errorsPerLevel[extendedInfo.level]++
    this.stats.errorsInLastMinute++
    this.stats.lastErrorTimestamp = Date.now()
  }

  /**
   * 将错误记录到控制台
   */
  private logErrorToConsole(errorInfo: any): void {
    const { error, errorInfo: info, extendedInfo } = errorInfo
    const { category, level, componentName } = extendedInfo

    console.groupCollapsed(`🚨 [${level.toUpperCase()}] ${category} Error in ${componentName}`)
    console.error('Error:', error)
    console.error('Error Info:', info)
    console.error('Extended Info:', extendedInfo)
    console.groupEnd()
  }

  /**
   * 将错误加入远程报告队列
   */
  private queueErrorForRemoteReport(errorInfo: any): void {
    this.errorQueue.push(errorInfo)

    // 如果队列长度超过10，立即报告
    if (this.errorQueue.length >= 10) {
      this.reportErrorsToRemote()
    } else {
      // 否则延迟报告
      setTimeout(this.reportErrorsToRemote.bind(this), 1000)
    }
  }

  /**
   * 报告错误到远程监控服务
   */
  private reportErrorsToRemote(): void {
    if (this.errorQueue.length === 0) {
      return
    }

    // 复制队列并清空
    const errorsToReport = [...this.errorQueue]
    this.errorQueue = []

    // 模拟远程报告
    console.log(`📤 Reporting ${errorsToReport.length} errors to remote service`)

    // 这里可以添加实际的API调用
    // fetch(this.config.remoteReportingURL || '/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorsToReport)
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Failed to report errors');
    //   }
    //   console.log('✅ Errors reported successfully');
    // })
    // .catch(error => {
    //   console.error('❌ Failed to report errors:', error);
    //   // 将错误重新加入队列
    //   this.errorQueue = [...this.errorQueue, ...errorsToReport];
    // });
  }

  /**
   * 检查是否应该忽略错误
   */
  private shouldIgnoreError(errorMessage: string): boolean {
    return this.config.ignoreErrors.some(ignorePattern => errorMessage.includes(ignorePattern))
  }

  /**
   * 清空每分钟错误计数
   */
  private clearErrorCount(): void {
    this.errorCountInMinute = 0
    this.stats.errorsInLastMinute = 0
  }

  /**
   * 获取错误统计信息
   */
  public getStats(): ErrorStats {
    return { ...this.stats }
  }

  /**
   * 更新错误监控配置
   */
  public updateConfig(config: Partial<ErrorMonitoringConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 手动报告错误
   */
  public reportError(error: Error, context?: Record<string, any>): void {
    const errorInfo = {
      error,
      errorInfo: {
        componentStack: error.stack || ''
      } as any,
      extendedInfo: {
        category: this.categorizeError(error),
        level: ErrorLevel.ERROR,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        componentName: 'Manual',
        stack: error.stack || '',
        context
      }
    }

    this.processError(errorInfo)
  }
}
