import { ref, readonly } from 'vue'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  data?: any
  timestamp: number
  context?: Record<string, any>
}

export interface LoggerConfig {
  level: LogLevel
  maxEntries: number
  enableConsole: boolean
  enableStorage: boolean
  storageKey: string
}

const defaultConfig: LoggerConfig = {
  level: import.meta.env.DEV ? 'debug' : 'warn',
  maxEntries: 1000,
  enableConsole: true,
  enableStorage: false,
  storageKey: 'utf_star_logs'
}

const logs = ref<LogEntry[]>([])
const config = ref<LoggerConfig>({ ...defaultConfig })

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

export function useLogger(namespace?: string) {
  
  // 创建日志条目
  const createLogEntry = (
    level: LogLevel,
    message: string,
    data?: any,
    context?: Record<string, any>
  ): LogEntry => {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message: namespace ? `[${namespace}] ${message}` : message,
      data,
      timestamp: Date.now(),
      context
    }
  }
  
  // 记录日志
  const log = (level: LogLevel, message: string, data?: any, context?: Record<string, any>) => {
    // 检查日志级别
    if (levelPriority[level] < levelPriority[config.value.level]) {
      return
    }
    
    const entry = createLogEntry(level, message, data, context)
    
    // 添加到日志列表
    logs.value.unshift(entry)
    
    // 限制日志数量
    if (logs.value.length > config.value.maxEntries) {
      logs.value = logs.value.slice(0, config.value.maxEntries)
    }
    
    // 控制台输出
    if (config.value.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level
      const timestamp = new Date(entry.timestamp).toISOString()
      
      console[consoleMethod](
        `%c[${timestamp}] ${entry.message}`,
        getLogStyle(level),
        data || ''
      )
    }
    
    // 存储到本地
    if (config.value.enableStorage) {
      try {
        const storedLogs = JSON.parse(
          localStorage.getItem(config.value.storageKey) || '[]'
        )
        storedLogs.unshift(entry)
        
        // 限制存储数量
        const limitedLogs = storedLogs.slice(0, config.value.maxEntries)
        localStorage.setItem(config.value.storageKey, JSON.stringify(limitedLogs))
      } catch (error) {
        console.warn('Failed to store log:', error)
      }
    }
    
    return entry
  }
  
  // 获取日志样式
  const getLogStyle = (level: LogLevel): string => {
    const styles = {
      debug: 'color: #6b7280; font-weight: normal;',
      info: 'color: #3b82f6; font-weight: normal;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;'
    }
    return styles[level]
  }
  
  // 便捷方法
  const debug = (message: string, data?: any, context?: Record<string, any>) => {
    return log('debug', message, data, context)
  }
  
  const info = (message: string, data?: any, context?: Record<string, any>) => {
    return log('info', message, data, context)
  }
  
  const warn = (message: string, data?: any, context?: Record<string, any>) => {
    return log('warn', message, data, context)
  }
  
  const error = (message: string, data?: any, context?: Record<string, any>) => {
    return log('error', message, data, context)
  }
  
  // 性能日志
  const time = (label: string) => {
    const startTime = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - startTime
        debug(`Timer [${label}]: ${duration.toFixed(2)}ms`)
        return duration
      }
    }
  }
  
  // 分组日志
  const group = (label: string) => {
    if (config.value.enableConsole) {
      console.group(label)
    }
    
    return {
      log: (level: LogLevel, message: string, data?: any) => {
        log(level, message, data, { group: label })
      },
      end: () => {
        if (config.value.enableConsole) {
          console.groupEnd()
        }
      }
    }
  }
  
  // 清除日志
  const clearLogs = () => {
    logs.value = []
    if (config.value.enableStorage) {
      localStorage.removeItem(config.value.storageKey)
    }
  }
  
  // 获取特定级别的日志
  const getLogsByLevel = (level: LogLevel) => {
    return logs.value.filter(log => log.level === level)
  }
  
  // 搜索日志
  const searchLogs = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return logs.value.filter(log => 
      log.message.toLowerCase().includes(lowercaseQuery) ||
      JSON.stringify(log.data).toLowerCase().includes(lowercaseQuery)
    )
  }
  
  // 导出日志
  const exportLogs = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify(logs.value, null, 2)
    }
    
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'data']
      const rows = logs.value.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.message,
        JSON.stringify(log.data || '')
      ])
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
    }
  }
  
  // 配置日志器
  const configure = (newConfig: Partial<LoggerConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }
  
  return {
    logs: readonly(logs),
    config: readonly(config),
    log,
    debug,
    info,
    warn,
    error,
    time,
    group,
    clearLogs,
    getLogsByLevel,
    searchLogs,
    exportLogs,
    configure
  }
}

// 全局日志器实例
export const globalLogger = useLogger('Global')