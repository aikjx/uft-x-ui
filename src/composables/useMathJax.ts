import { ref, onMounted, onUnmounted } from 'vue'

export function useMathJax() {
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const typeset = async () => {
    if (!window.MathJax) {
      error.value = 'MathJax 未加载'
      return
    }

    try {
      await window.MathJax.typesetPromise()
      isReady.value = true
    } catch (err) {
      console.error('MathJax 渲染错误:', err)
      error.value = '公式渲染失败'
    }
  }

  const handleMathJaxReady = () => {
    isReady.value = true
    typeset()
  }

  onMounted(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      handleMathJaxReady()
    } else {
      window.addEventListener('mathjax-ready', handleMathJaxReady)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('mathjax-ready', handleMathJaxReady)
  })

  return {
    isReady,
    error,
    typeset
  }
}
