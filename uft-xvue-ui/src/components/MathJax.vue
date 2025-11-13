<template>
  <div ref="mathElement" class="mathjax-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  formula: string
  displayMode?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: true,
  className: ''
})

// 模板引用
const mathElement = ref<HTMLElement>()

// 渲染MathJax
function renderMath() {
  if (!mathElement.value || !window.MathJax) {
    return
  }
  
  const element = mathElement.value
  
  // 设置公式内容
  const wrapper = document.createElement(props.displayMode ? 'div' : 'span')
  wrapper.className = props.className
  wrapper.textContent = props.formula
  
  // 清空并添加新内容
  element.innerHTML = ''
  element.appendChild(wrapper)
  
  // 触发MathJax渲染
  window.MathJax.typesetPromise([element]).catch((err: any) => {
    console.error('MathJax rendering error:', err)
  })
}

// 初始化MathJax
function initMathJax() {
  if (window.MathJax) {
    // 如果已经加载，直接渲染
    renderMath()
    return
  }
  
  // 配置MathJax
  (window as any).MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      packages: {'[+]': ['ams', 'noerrors']}
    },
    svg: {
      fontCache: 'global',
      scale: 1.1
    },
    startup: {
      typeset: false
    }
  }
  
  // 加载MathJax脚本
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
  script.async = true
  script.onload = () => {
    console.log('MathJax loaded successfully')
    renderMath()
  }
  script.onerror = (err) => {
    console.error('Failed to load MathJax:', err)
  }
  document.head.appendChild(script)
}

// 监听公式变化
watch(() => props.formula, () => {
  renderMath()
}, { immediate: false })

// 生命周期
onMounted(() => {
  initMathJax()
})

onUnmounted(() => {
  // 清理
  if (mathElement.value) {
    mathElement.value.innerHTML = ''
  }
})
</script>

<style scoped>
.mathjax-container {
  width: 100%;
  overflow-x: auto;
}

/* 自定义MathJax渲染样式 */
:deep(.mjx-chtml) {
  font-size: 110% !important;
}

:deep(.mjx-chtml.MJXc-display) {
  overflow-x: auto;
  overflow-y: hidden;
}
</style>