// 性能优化工具集合

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 懒加载函数
export function lazyLoad<T>(
  loader: () => Promise<T>,
  fallback?: T
): () => Promise<T> {
  let cached: T | null = null
  let loading: Promise<T> | null = null
  
  return async () => {
    if (cached) return cached
    if (loading) return loading
    
    loading = loader().then(result => {
      cached = result
      loading = null
      return result
    }).catch(error => {
      loading = null
      if (fallback !== undefined) {
        cached = fallback
        return fallback
      }
      throw error
    })
    
    return loading
  }
}

// 内存缓存
export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; expires: number }>()
  private defaultTTL: number
  
  constructor(defaultTTL = 5 * 60 * 1000) { // 默认5分钟
    this.defaultTTL = defaultTTL
  }
  
  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL)
    this.cache.set(key, { value, expires })
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  has(key: string): boolean {
    return this.get(key) !== null
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    // 清理过期项
    this.cleanup()
    return this.cache.size
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// 批处理函数
export function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize = 10,
  delay = 0
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = []
    let currentIndex = 0
    
    const processBatch = async () => {
      try {
        const batch = items.slice(currentIndex, currentIndex + batchSize)
        if (batch.length === 0) {
          resolve(results)
          return
        }
        
        const batchResults = await processor(batch)
        results.push(...batchResults)
        currentIndex += batchSize
        
        if (delay > 0) {
          setTimeout(processBatch, delay)
        } else {
          processBatch()
        }
      } catch (error) {
        reject(error)
      }
    }
    
    processBatch()
  })
}

// 虚拟滚动辅助函数
export function calculateVirtualScrollItems(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1,
    offsetY: startIndex * itemHeight
  }
}

// 图片懒加载
export function createImageLazyLoader(options: {
  rootMargin?: string
  threshold?: number
  placeholder?: string
} = {}) {
  const { rootMargin = '50px', threshold = 0.1, placeholder } = options
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          observer.unobserve(img)
        }
      }
    })
  }, { rootMargin, threshold })
  
  return {
    observe: (img: HTMLImageElement) => {
      if (placeholder && !img.src) {
        img.src = placeholder
      }
      observer.observe(img)
    },
    unobserve: (img: HTMLImageElement) => {
      observer.unobserve(img)
    },
    disconnect: () => {
      observer.disconnect()
    }
  }
}

// 性能监控
export class PerformanceMonitor {
  private marks = new Map<string, number>()
  private measures = new Map<string, number>()
  
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`)
    }
    
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    if (endMark && !endTime) {
      throw new Error(`End mark "${endMark}" not found`)
    }
    
    const duration = (endTime || performance.now()) - startTime
    this.measures.set(name, duration)
    
    return duration
  }
  
  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }
  
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures)
  }
  
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

// 资源预加载
export function preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    
    switch (type) {
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
      case 'image':
        link.as = 'image'
        break
      case 'font':
        link.as = 'font'
        link.crossOrigin = 'anonymous'
        break
    }
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to preload ${url}`))
    
    document.head.appendChild(link)
  })
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 全局缓存实例
export const globalCache = new MemoryCache()

// 导出所有工具
export * from './debounce'
export * from './throttle'
export * from './lazy-load'