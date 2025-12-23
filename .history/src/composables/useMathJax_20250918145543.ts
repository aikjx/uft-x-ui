import { ref, nextTick, readonly } from 'vue'

// MathJax 状态管理
const isLoaded = ref(false)
const isLoading = ref(false)

export function useMathJax() {
  // 检查 MathJax 是否已加载
  const checkMathJax = (): boolean => {
    return typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise
  }

  // 等待 MathJax 加载
  const waitForMathJax = (): Promise<void> => {
    return new Promise((resolve) => {
      if (checkMathJax()) {
        isLoaded.value = true
        resolve()
        return
      }

      if (isLoading.value) {
        // 如果正在加载，等待加载完成
        const checkInterval = setInterval(() => {
          if (checkMathJax()) {
            isLoaded.value = true
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
        return
      }

      isLoading.value = true

      // 监听 MathJax 脚本加载
      const script = document.getElementById('MathJax-script')
      if (script) {
        script.addEventListener('load', () => {
          // 等待 MathJax 完全初始化
          setTimeout(() => {
            if (checkMathJax()) {
              isLoaded.value = true
              isLoading.value = false
              resolve()
            }
          }, 500)
        })
      } else {
        // 如果脚本不存在，创建并加载
        loadMathJax().then(() => {
          isLoaded.value = true
          isLoading.value = false
          resolve()
        })
      }
    })
  }

  // 动态加载 MathJax
  const loadMathJax = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (checkMathJax()) {
        resolve()
        return
      }

      // 配置 MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
          packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
        },
        svg: {
          fontCache: 'global'
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
            resolve()
          }
        }
      }

      // 加载 MathJax 脚本
      const script = document.createElement('script')
      script.id = 'MathJax-script'
      script.async = true
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // 渲染数学公式
  const renderMath = async (element: HTMLElement | HTMLElement[]): Promise<void> => {
    await waitForMathJax()
    await nextTick()
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        const elements = Array.isArray(element) ? element : [element]
        await window.MathJax.typesetPromise(elements)
      } catch (error) {
        console.warn('MathJax 渲染失败:', error)
      }
    }
  }

  // 重新渲染页面中的所有数学公式
  const rerenderAll = async (): Promise<void> => {
    await waitForMathJax()
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        await window.MathJax.typesetPromise()
      } catch (error) {
        console.warn('MathJax 全局重新渲染失败:', error)
      }
    }
  }

  // 清除 MathJax 缓存
  const clearCache = (): void => {
    if (window.MathJax && window.MathJax.startup) {
      window.MathJax.startup.document.clear()
    }
  }

  return {
    isLoaded: readonly(isLoaded),
    isLoading: readonly(isLoading),
    waitForMathJax,
    renderMath,
    rerenderAll,
    clearCache,
    checkMathJax
  }
}