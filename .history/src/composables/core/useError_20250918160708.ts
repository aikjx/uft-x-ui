import { ref, readonly } from 'vue'
import { useLogger } from './useLogger'

export interface AppError {
  id: string
  type: 'network' | 'validation' | 'runtime' | 'user' | 'system'
  message: string
  details?: any
  timestamp: number
  stack?: string
  context?: Record<string, any>
}

export interface ErrorHandler {
  (error: AppError): void
}

const errors = ref<AppError[]>([])
const globalHandlers = new Set<ErrorHandler>()

export function useError() {
  const { log } = useLogger()
  
  // 创建错误对象
  const createError = (
    type: AppError['type'],
    message: string,
    details?: any,
    context?: Record<string, any>
  ): AppError => {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      details,
      timestamp: Date.now(),
      stack: new Error().stack,
      context
    }
  }
  
  // 处理错误
  const handleError = (error: AppError | Error | string) => {
    let appError: AppError
    
    if (typeof error === 'string') {
      appError = createError('runtime', error)
    } else if (error instanceof Error) {
      appError = createError('runtime', error.message, error, {
        name: error.name,
        stack: error.stack
      })
    } else {
      appError = error
    }
    
    // 记录错误
    errors.value.unshift(appError)
    
    // 限制错误数量
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(0, 100)
    }
    
    // 记录日志
    log('error', appError.message, appError)
    
    // 调用全局处理器
    globalHandlers.forEach(handler => {
      try {
        handler(appError)
      } catch (e) {
        console.error('Error in error handler:', e)
      }
    })
    
    return appError
  }
  
  // 网络错误处理
  const handleNetworkError = (error: any, context?: Record<string, any>) => {
    const message = error.response?.data?.message || 
                   error.message || 
                   '网络请求失败'
    
    return handleError(createError('network', message, error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      ...context
    }))
  }
  
  // 验证错误处理
  const handleValidationError = (message: string, field?: string, value?: any) => {
    return handleError(createError('validation', message, { field, value }))
  }
  
  // 用户错误处理
  const handleUserError = (message: string, action?: string) => {
    return handleError(createError('user', message, { action }))
  }
  
  // 系统错误处理
  const handleSystemError = (message: string, details?: any) => {
    return handleError(createError('system', message, details))
  }
  
  // 清除错误
  const clearErrors = () => {
    errors.value = []
  }
  
  // 清除特定类型的错误
  const clearErrorsByType = (type: AppError['type']) => {
    errors.value = errors.value.filter(error => error.type !== type)
  }
  
  // 获取最新错误
  const getLatestError = () => {
    return errors.value[0] || null
  }
  
  // 获取特定类型的错误
  const getErrorsByType = (type: AppError['type']) => {
    return errors.value.filter(error => error.type === type)
  }
  
  // 注册全局错误处理器
  const registerGlobalHandler = (handler: ErrorHandler) => {
    globalHandlers.add(handler)
    
    return () => {
      globalHandlers.delete(handler)
    }
  }
  
  // 错误重试机制
  const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: any
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (i === maxRetries) {
          handleError(lastError)
          throw lastError
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    
    throw lastError
  }
  
  return {
    errors: readonly(errors),
    handleError,
    handleNetworkError,
    handleValidationError,
    handleUserError,
    handleSystemError,
    clearErrors,
    clearErrorsByType,
    getLatestError,
    getErrorsByType,
    registerGlobalHandler,
    withRetry,
    createError
  }
}

// 全局错误处理
export function setupGlobalErrorHandling() {
  const { handleError, createError } = useError()
  
  // 捕获未处理的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason)
    event.preventDefault()
  })
  
  // 捕获 JavaScript 运行时错误
  window.addEventListener('error', (event) => {
    handleError(createError('runtime', event.message, event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }))
  })
}