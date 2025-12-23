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

  // 处理公式文本，修复可能的编码问题
  const processFormulaText = (element: HTMLElement): void => {
    // 查找所有公式内容
    const formulaElements = element.querySelectorAll('.formula-content, .tex2jax_process')
    
    formulaElements.forEach(el => {
      if (el.textContent) {
        // 确保公式文本使用正确的编码
        let text = el.textContent
          // 替换可能导致乱码的特殊字符
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/\u2026/g, '...')
        
        // 确保向量符号正确显示
        text = text.replace(/\\vec{([^}]+)}/g, '\\vec{$1} ')
        
        // 确保数学符号正确显示，添加必要的空格
        text = text
          .replace(/\\infty/g, '\\infty ')
          .replace(/\\sum/g, '\\sum ')
          .replace(/\\int/g, '\\int ')
          .replace(/\\cos/g, '\\cos ')
          .replace(/\\sin/g, '\\sin ')
          .replace(/\\omega/g, '\\omega ')
          .replace(/\\Delta/g, '\\Delta ')
          .replace(/\\frac{([^}]+)}{([^}]+)}/g, '\\frac{$1}{$2} ')
        
        // 处理公式中的特殊符号，确保它们有足够的空格
        text = text
          .replace(/([^\\])([\+\-\*\/\=])/g, '$1 $2 ')
          .replace(/\\\\/g, '\\\\ ')
          
        el.textContent = text
      }
    })
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

      // 直接渲染新内容，不做任何预处理
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