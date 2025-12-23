import { ref, readonly } from 'vue'
import { useError } from './useError'
import { useLogger } from './useLogger'

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  retries: number
  retryDelay: number
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  data?: any
}

const defaultConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  retries: 3,
  retryDelay: 1000
}

export function useApi(config: Partial<ApiConfig> = {}) {
  const { handleNetworkError, withRetry } = useError()
  const { debug, info, warn, error: logError } = useLogger('API')
  
  const apiConfig = ref<ApiConfig>({ ...defaultConfig, ...config })
  const loading = ref(false)
  const requestCount = ref(0)
  
  // 请求拦截器
  const requestInterceptors: Array<(config: RequestInit) => RequestInit | Promise<RequestInit>> = []
  
  // 响应拦截器
  const responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = []
  
  // 创建请求
  const createRequest = async (
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse> => {
    const fullUrl = url.startsWith('http') ? url : `${apiConfig.value.baseURL}${url}`
    
    let requestOptions: RequestInit = {
      ...options,
      headers: {
        ...apiConfig.value.headers,
        ...options.headers
      }
    }
    
    // 应用请求拦截器
    for (const interceptor of requestInterceptors) {
      requestOptions = await interceptor(requestOptions)
    }
    
    debug(`Request: ${options.method || 'GET'} ${fullUrl}`, requestOptions)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.value.timeout)
    
    try {
      requestCount.value++
      loading.value = true
      
      let response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // 应用响应拦截器
      for (const interceptor of responseInterceptors) {
        response = await interceptor(response)
      }
      
      const responseData: ApiResponse = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
      
      // 解析响应数据
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        responseData.data = await response.json()
      } else {
        responseData.data = await response.text()
      }
      
      if (!response.ok) {
        const error: ApiError = {
          message: responseData.data?.message || response.statusText,
          status: response.status,
          code: responseData.data?.code,
          data: responseData.data
        }
        throw error
      }
      
      info(`Response: ${response.status} ${fullUrl}`, responseData.data)
      return responseData
      
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        const timeoutError: ApiError = {
          message: '请求超时',
          code: 'TIMEOUT'
        }
        logError('Request timeout', timeoutError)
        throw timeoutError
      }
      
      logError('Request failed', error)
      throw error
      
    } finally {
      requestCount.value--
      if (requestCount.value === 0) {
        loading.value = false
      }
    }
  }
  
  // GET 请求
  const get = async <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    const searchParams = params ? new URLSearchParams(params).toString() : ''
    const fullUrl = searchParams ? `${url}?${searchParams}` : url
    
    return withRetry(async () => {
      const response = await createRequest(fullUrl, { method: 'GET' })
      return response.data
    }, apiConfig.value.retries, apiConfig.value.retryDelay)
  }
  
  // POST 请求
  const post = async <T = any>(url: string, data?: any): Promise<T> => {
    return withRetry(async () => {
      const response = await createRequest(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      })
      return response.data
    }, apiConfig.value.retries, apiConfig.value.retryDelay)
  }
  
  // PUT 请求
  const put = async <T = any>(url: string, data?: any): Promise<T> => {
    return withRetry(async () => {
      const response = await createRequest(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
      })
      return response.data
    }, apiConfig.value.retries, apiConfig.value.retryDelay)
  }
  
  // DELETE 请求
  const del = async <T = any>(url: string): Promise<T> => {
    return withRetry(async () => {
      const response = await createRequest(url, { method: 'DELETE' })
      return response.data
    }, apiConfig.value.retries, apiConfig.value.retryDelay)
  }
  
  // PATCH 请求
  const patch = async <T = any>(url: string, data?: any): Promise<T> => {
    return withRetry(async () => {
      const response = await createRequest(url, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined
      })
      return response.data
    }, apiConfig.value.retries, apiConfig.value.retryDelay)
  }
  
  // 文件上传
  const upload = async <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve(xhr.responseText as any)
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })
      
      xhr.open('POST', `${apiConfig.value.baseURL}${url}`)
      
      // 添加认证头
      Object.entries(apiConfig.value.headers).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // FormData 会自动设置 Content-Type
          xhr.setRequestHeader(key, value)
        }
      })
      
      xhr.send(formData)
    })
  }
  
  // 添加请求拦截器
  const addRequestInterceptor = (interceptor: (config: RequestInit) => RequestInit | Promise<RequestInit>) => {
    requestInterceptors.push(interceptor)
    
    return () => {
      const index = requestInterceptors.indexOf(interceptor)
      if (index > -1) {
        requestInterceptors.splice(index, 1)
      }
    }
  }
  
  // 添加响应拦截器
  const addResponseInterceptor = (interceptor: (response: Response) => Response | Promise<Response>) => {
    responseInterceptors.push(interceptor)
    
    return () => {
      const index = responseInterceptors.indexOf(interceptor)
      if (index > -1) {
        responseInterceptors.splice(index, 1)
      }
    }
  }
  
  // 更新配置
  const updateConfig = (newConfig: Partial<ApiConfig>) => {
    apiConfig.value = { ...apiConfig.value, ...newConfig }
  }
  
  return {
    config: readonly(apiConfig),
    loading: readonly(loading),
    requestCount: readonly(requestCount),
    get,
    post,
    put,
    del,
    patch,
    upload,
    addRequestInterceptor,
    addResponseInterceptor,
    updateConfig
  }
}

// 创建默认 API 实例
export const api = useApi()

// 设置认证令牌
export const setAuthToken = (token: string) => {
  api.updateConfig({
    headers: {
      ...api.config.value.headers,
      Authorization: `Bearer ${token}`
    }
  })
}

// 清除认证令牌
export const clearAuthToken = () => {
  const { Authorization, ...headers } = api.config.value.headers
  api.updateConfig({ headers })
}