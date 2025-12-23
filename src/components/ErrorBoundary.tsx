import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 错误分类枚举
export enum ErrorCategory {
  RENDER = 'render',
  THREEJS = 'threejs',
  API = 'api',
  STATE = 'state',
  PERFORMANCE = 'performance',
  OTHER = 'other'
}

// 错误级别枚举
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 扩展的错误信息接口
interface ExtendedErrorInfo {
  category: ErrorCategory
  level: ErrorLevel
  timestamp: number
  userAgent: string
  url: string
  componentName: string
  stack: string
  context?: Record<string, any>
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  errorCategory?: ErrorCategory
  context?: Record<string, any>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  userFeedback: string
  isSubmitting: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userFeedback: '',
      isSubmitting: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  // 分类错误
  private categorizeError(error: Error): ErrorCategory {
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('three.js') || errorMessage.includes('webgl')) {
      return ErrorCategory.THREEJS
    } else if (
      errorMessage.includes('api') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('axios')
    ) {
      return ErrorCategory.API
    } else if (errorMessage.includes('state') || errorMessage.includes('hook')) {
      return ErrorCategory.STATE
    } else if (errorMessage.includes('render') || errorMessage.includes('component')) {
      return ErrorCategory.RENDER
    } else if (errorMessage.includes('performance') || errorMessage.includes('timeout')) {
      return ErrorCategory.PERFORMANCE
    } else {
      return ErrorCategory.OTHER
    }
  }

  // 确定错误级别
  private determineErrorLevel(error: Error): ErrorLevel {
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
      return ErrorLevel.CRITICAL
    } else if (errorMessage.includes('error')) {
      return ErrorLevel.ERROR
    } else if (errorMessage.includes('warning')) {
      return ErrorLevel.WARNING
    } else {
      return ErrorLevel.INFO
    }
  }

  // 生成扩展错误信息
  private generateExtendedErrorInfo(error: Error, errorInfo: ErrorInfo): ExtendedErrorInfo {
    // 从错误堆栈中提取组件名称
    const componentStack = errorInfo.componentStack || ''
    const componentMatch = componentStack.match(/\s+at\s+(\w+)/)
    const componentName = componentMatch ? componentMatch[1] : 'UnknownComponent'

    return {
      category: this.categorizeError(error),
      level: this.determineErrorLevel(error),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentName,
      stack: error.stack || 'No stack trace available',
      context: {
        ...this.props.context,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        memory: performance.memory ? performance.memory.usedJSHeapSize : undefined
      }
    }
  }

  // 报告错误到监控服务
  private reportErrorToService(error: Error, errorInfo: ErrorInfo): void {
    const extendedInfo = this.generateExtendedErrorInfo(error, errorInfo)

    // 发送错误事件到事件系统
    eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
      error,
      errorInfo,
      extendedInfo
    })

    // 记录错误到控制台（开发环境）
    if (import.meta.env.DEV) {
      console.error('🚨 ErrorBoundary Caught:', {
        error,
        errorInfo,
        extendedInfo
      })
    } else {
      // 生产环境：发送到错误监控服务
      // 这里可以添加实际的错误上报逻辑，例如使用Sentry、Bugsnag等
      try {
        // 模拟错误上报
        console.error('🚨 Error reported to monitoring service:', extendedInfo)

        // 可以添加实际的API调用
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ error, extendedInfo })
        // });
      } catch (reportError) {
        console.error('Failed to report error:', reportError)
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      hasError: true,
      error,
      errorInfo
    })

    // 报告错误
    this.reportErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      userFeedback: ''
    })
  }

  handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ userFeedback: e.target.value })
  }

  handleFeedbackSubmit = async (): Promise<void> => {
    const { userFeedback } = this.state
    if (!userFeedback.trim()) return

    this.setState({ isSubmitting: true })

    try {
      // 发送用户反馈
      console.log('📝 User feedback submitted:', userFeedback)

      // 可以添加实际的API调用
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ feedback: userFeedback, error: this.state.error?.message })
      // });

      this.setState({ userFeedback: '', isSubmitting: false })

      // 显示成功反馈
      eventSystem.emit(APP_EVENTS.SHOW_NOTIFICATION, {
        type: 'success',
        message: '感谢您的反馈！我们会尽快处理。'
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      this.setState({ isSubmitting: false })
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 使用自定义 fallback 或默认错误页面
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#050508] via-[#0a0a1a] to-[#151530] p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-red-500/30 bg-gray-900/80 shadow-xl backdrop-blur-lg"
          >
            {/* 错误图标 */}
            <div className="bg-red-500/20 px-6 py-8 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="inline-block"
              >
                <div className="mb-4 text-6xl">⚠️</div>
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold text-white">系统出错了</h2>
              <p className="text-gray-400">抱歉，应用遇到了意外错误。</p>
            </div>

            {/* 错误详情 */}
            <div className="space-y-4 p-6">
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <h3 className="mb-2 text-lg font-semibold text-white">错误信息</h3>
                <p className="break-all font-mono text-sm text-red-400">
                  {this.state.error?.message || '未知错误'}
                </p>
              </div>

              {/* 仅在开发环境显示完整堆栈 */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <div className="max-h-60 overflow-auto rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-white">错误堆栈</h3>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* 用户反馈 */}
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <h3 className="mb-2 text-lg font-semibold text-white">帮助我们改进</h3>
                <p className="mb-3 text-sm text-gray-400">
                  请告诉我们您遇到的问题，这将帮助我们改进应用。
                </p>
                <div className="space-y-3">
                  <textarea
                    value={this.state.userFeedback}
                    onChange={this.handleFeedbackChange}
                    placeholder="请描述您遇到的问题..."
                    className="h-24 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleFeedbackSubmit}
                    disabled={!this.state.userFeedback.trim() || this.state.isSubmitting}
                    className={`rounded-lg px-4 py-2 transition-colors ${this.state.isSubmitting ? 'cursor-not-allowed bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} font-medium text-white`}
                  >
                    {this.state.isSubmitting ? '提交中...' : '提交反馈'}
                  </motion.button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col justify-center space-y-3 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReset}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 sm:flex-none sm:px-6"
                >
                  重试
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = '/')}
                  className="flex-1 rounded-lg bg-gray-700 py-3 text-white transition-colors hover:bg-gray-600 sm:flex-none sm:px-6"
                >
                  返回首页
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* 调试信息 */}
          {import.meta.env.DEV && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              <p className="mb-2">开发环境：完整错误信息已记录到控制台</p>
              <div className="inline-block rounded-lg bg-gray-900/50 p-3">
                <code className="text-xs">{this.state.error?.constructor.name || 'Error'}</code>
              </div>
            </motion.div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
