export interface LogMessage {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  timestamp: number
  context?: Record<string, any>
  stack?: string
}

class Logger {
  private enabledLevels = ['info', 'warn', 'error', 'fatal'] as const
  private isDev = import.meta.env.DEV
  private maxHistory = 100
  private logHistory: LogMessage[] = []

  constructor() {
    if (this.isDev) {
      this.enabledLevels = ['debug', 'info', 'warn', 'error', 'fatal'] as const
    }
  }

  private shouldLog(level: LogMessage['level']): boolean {
    return this.enabledLevels.includes(level)
  }

  private log(level: LogMessage['level'], message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return
    }

    const logEntry: LogMessage = {
      level,
      message,
      timestamp: Date.now(),
      context,
      stack: level === 'error' || level === 'fatal' ? new Error().stack : undefined
    }

    this.logHistory.push(logEntry)
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift()
    }

    this.outputLog(logEntry)
    this.sendToRemote(logEntry)
  }

  private outputLog(entry: LogMessage) {
    const { level, message, context, timestamp } = entry
    const timestampStr = new Date(timestamp).toISOString()

    const styles = {
      debug: 'color: #6b7280',
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
      fatal: 'color: #dc2626; font-weight: bold'
    }

    const logArgs = [`%c[${timestampStr}] [${level.toUpperCase()}] ${message}`, styles[level]]
    
    if (context) {
      logArgs.push(context)
    }

    switch (level) {
      case 'debug':
        console.debug(...logArgs)
        break
      case 'info':
        console.info(...logArgs)
        break
      case 'warn':
        console.warn(...logArgs)
        break
      case 'error':
      case 'fatal':
        console.error(...logArgs)
        break
    }
  }

  private sendToRemote(entry: LogMessage) {
    // 在生产环境中，可以将日志发送到远程日志服务
    if (!this.isDev && (entry.level === 'error' || entry.level === 'fatal')) {
      // 这里可以添加远程日志发送逻辑
      // 例如使用 fetch 发送到 Sentry、Datadog 等
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context)
  }

  fatal(message: string, context?: Record<string, any>) {
    this.log('fatal', message, context)
  }

  getHistory(): LogMessage[] {
    return [...this.logHistory]
  }

  clearHistory() {
    this.logHistory = []
  }
}

// 创建单例实例
const logger = new Logger()

export { logger }

export function initializeLogging() {
  logger.info('Logging system initialized', {
    environment: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || 'unknown',
    timestamp: Date.now()
  })

  // 浏览器环境下的错误处理
  if (typeof window !== 'undefined') {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise rejection', {
        reason: event.reason,
        promise: event.promise
      })
    })

    // 捕获未捕获的异常
    window.addEventListener('error', (event) => {
      logger.fatal('Uncaught exception', {
        error: {
          message: event.message,
          stack: event.error?.stack,
          name: event.error?.name,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement || event.target instanceof HTMLImageElement) {
        logger.error('Resource load error', {
          resource: {
            src: event.target.src || event.target.href,
            tagName: event.target.tagName
          }
        })
      }
    }, true)
  }

  // Node.js环境下的错误处理
  if (typeof process !== 'undefined') {
    // 捕获未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise rejection', {
        reason,
        promise
      })
    })

    // 捕获未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.fatal('Uncaught exception', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    })
  }
}
