import { ref, nextTick, readonly } from 'vue'

// MathJax 状态管理
const isLoaded = ref(false)
const isLoading = ref(false)
const loadPromise = ref<Promise<void> | null>(null)

export function useMathJax() {
  // 检查 MathJax 是否已加载
  const checkMathJax = (): boolean => {
    return typeof window !== 'undefined' && 
           window.MathJax && 
           window.MathJax.typesetPromise &&
           window.MathJax.startup &&
           window.MathJax.startup.document
  }

  // 等待 MathJax 加载
  const waitForMathJax = (): Promise<void> => {
    if (checkMathJax()) {
      isLoaded.value = true
      return Promise.resolve()
    }

    // 如果已经有加载 Promise，直接返回
    if (loadPromise.value) {
      return loadPromise.value
    }

    // 检查是否已经在 HTML 中加载了 MathJax
    const existingScript = document.getElementById('MathJax-script')
    if (existingScript && !checkMathJax()) {
      // 如果脚本存在但 MathJax 还没准备好，等待它
      loadPromise.value = new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (checkMathJax()) {
            isLoaded.value = true
            isLoading.value = false
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
        
        // 10秒超时
        setTimeout(() => {
          clearInterval(checkInterval)
          console.warn('MathJax 加载超时')
          resolve()
        }, 10000)
      })
      return loadPromise.value
    }

    // 如果没有脚本，不要动态加载，因为 HTML 中已经配置了
    if (!existingScript) {
      console.warn('MathJax 脚本未在 HTML 中找到，请检查 index.html 配置')
      return Promise.resolve()
    }

    return Promise.resolve()
  }

  // 渲染数学公式
  const renderMath = async (element: HTMLElement | HTMLElement[]): Promise<void> => {
    try {
      await waitForMathJax()
      await nextTick()
      
      if (!checkMathJax()) {
        console.warn('MathJax 未准备就绪，跳过渲染')
        return
      }

      const elements = Array.isArray(element) ? element : [element]
      
      // 清理之前的渲染
      elements.forEach(el => {
        if (el && window.MathJax.startup.document) {
          window.MathJax.startup.document.clear()
        }
      })

      // 渲染新内容
      await window.MathJax.typesetPromise(elements)
      
    } catch (error) {
      console.error('MathJax 渲染失败:', error)
      throw error
    }
  }

  // 重新渲染页面中的所有数学公式
  const rerenderAll = async (): Promise<void> => {
    try {
      await waitForMathJax()
      
      if (!checkMathJax()) {
        console.warn('MathJax 未准备就绪，跳过全局渲染')
        return
      }

      // 清理所有之前的渲染
      if (window.MathJax.startup.document) {
        window.MathJax.startup.document.clear()
      }

      // 重新渲染整个文档
      await window.MathJax.typesetPromise()
      
    } catch (error) {
      console.error('MathJax 全局重新渲染失败:', error)
    }
  }

  // 清除 MathJax 缓存
  const clearCache = (): void => {
    if (checkMathJax() && window.MathJax.startup.document) {
      window.MathJax.startup.document.clear()
    }
  }

  // 初始化 MathJax（仅在需要时调用）
  const initMathJax = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value) {
      return
    }

    isLoading.value = true
    
    try {
      await waitForMathJax()
      isLoaded.value = true
    } catch (error) {
      console.error('MathJax 初始化失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoaded: readonly(isLoaded),
    isLoading: readonly(isLoading),
    waitForMathJax,
    renderMath,
    rerenderAll,
    clearCache,
    checkMathJax,
    initMathJax
  }
}