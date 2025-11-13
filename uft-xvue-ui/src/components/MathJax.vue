<template>
  <div 
    ref="mathElement" 
    class="mathjax-container"
    :class="{ 'mathjax-error': hasError }"
  >
    <!-- 错误状态显示 -->
    <div v-if="hasError" class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
    </div>
    <!-- 加载状态显示 -->
    <div v-else-if="isLoading" class="loading-indicator">
      <span class="loading-spinner"></span>
      <span class="loading-text">渲染公式中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'

// Props
interface Props {
  formula: string
  displayMode?: boolean
  className?: string
  scale?: number
  color?: string
  backgroundColor?: string
  fontFamily?: string
  lineWidth?: number
  equationNumber?: boolean
  throwError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: true,
  className: '',
  scale: 1.0,
  color: '#000000',
  backgroundColor: 'transparent',
  fontFamily: 'Computer Modern',
  lineWidth: 1,
  equationNumber: false,
  throwError: false
})

// 事件
const emit = defineEmits<{
  rendered: [success: boolean]
  error: [error: Error]
}>()

// 状态
const mathElement = ref<HTMLElement>()
const hasError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)
const isInitialized = ref(false)
const renderQueue = ref<(() => void)[]>([])
const lastRenderedFormula = ref('')
const typesetPromise = ref<Promise<void> | null>(null)

// 计算样式
const formulaStyle = computed(() => ({
  color: props.color,
  backgroundColor: props.backgroundColor,
  fontFamily: props.fontFamily,
  lineWidth: `${props.lineWidth}px`
}))

// 高级配置MathJax
function configureMathJax() {
  const config: any = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      packages: {'[+]': [
        'ams',           // 美国数学学会宏包
        'noerrors',      // 错误处理
        'physics',       // 物理公式支持
        'enclose',       // 包围命令
        'mathtools',     // 数学工具
        'mhchem',        // 化学公式
        'color',         // 颜色支持
        'amsCd',         // 交换图表
        'amsrefs'        // 引用支持
      ]},
      // 物理宏包配置
      physics: {
        italicdiff: true,
        boldGreek: true
      },
      // 行内公式配置
      inlineMathDisplaystyle: false,
      // 方程编号
      tags: props.equationNumber ? 'all' : 'none'
    },
    svg: {
      fontCache: 'global',
      scale: props.scale,
      minScale: 0.5,
      maxScale: 3.0,
      mtextInheritFont: true,
      merrorInheritFont: true,
      fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/svg/fonts/tex-svg',
      // 改进的抗锯齿
      adaptiveCSS: true
    },
    startup: {
      typeset: false,
      // 性能优化
      skipWarnings: false,
      document: window.document
    },
    // 扩展配置
    extensions: [
      'tex2jax.js',
      'mml3.js',
      'content-mathml.js'
    ],
    // 处理配置
    tex2jax: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true,
      processRefs: true,
      preview: 'none'
    },
    // 延迟加载配置
    loader: {
      load: [
        '[tex]/physics',
        '[tex]/enclose',
        '[tex]/mathtools',
        '[tex]/mhchem',
        '[tex]/color',
        '[tex]/amsCd',
        '[tex]/amsrefs'
      ]
    }
  }
  
  return config
}

// 初始化MathJax
async function initMathJax() {
  if (window.MathJax && isInitialized.value) {
    await renderMath()
    return
  }
  
  isLoading.value = true
  hasError.value = false
  
  try {
    // 配置MathJax
    (window as any).MathJax = configureMathJax()
    
    // 使用动态导入避免阻塞
    if (!window.MathJax) {
      await loadMathJaxScript()
    }
    
    // 等待MathJax完全初始化
    await waitForMathJax()
    
    isInitialized.value = true
    isLoading.value = false
    
    // 渲染公式
    await renderMath()
    
    // 处理队列中的其他渲染请求
    processRenderQueue()
  } catch (error) {
    handleMathJaxError(error as Error)
  }
}

// 加载MathJax脚本
function loadMathJaxScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已经有脚本
    const existingScript = document.querySelector('script[src*="mathjax"]')
    if (existingScript) {
      // 监听加载完成
      existingScript.addEventListener('load', resolve)
      existingScript.addEventListener('error', reject)
      return
    }
    
    // 创建新脚本
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
    script.async = true
    script.onload = () => {
      console.log('MathJax loaded successfully')
      resolve()
    }
    script.onerror = (err) => {
      console.error('Failed to load MathJax:', err)
      reject(new Error('Failed to load MathJax library'))
    }
    document.head.appendChild(script)
  })
}

// 等待MathJax初始化完成
function waitForMathJax(): Promise<void> {
  return new Promise((resolve) => {
    const checkMathJax = () => {
      if (window.MathJax && window.MathJax.isReady) {
        resolve()
      } else {
        setTimeout(checkMathJax, 100)
      }
    }
    checkMathJax()
  })
}

// 渲染MathJax公式
async function renderMath() {
  if (!mathElement.value || !window.MathJax || !props.formula) {
    return
  }
  
  // 避免重复渲染相同的公式
  if (props.formula === lastRenderedFormula.value && !hasError.value) {
    return
  }
  
  lastRenderedFormula.value = props.formula
  isLoading.value = true
  hasError.value = false
  
  try {
    // 等待DOM更新
    await nextTick()
    
    const element = mathElement.value
    
    // 设置公式内容
    const wrapper = document.createElement(props.displayMode ? 'div' : 'span')
    wrapper.className = props.className
    wrapper.style.cssText = `
      color: ${props.color};
      background-color: ${props.backgroundColor};
      line-height: 1.6;
    `
    wrapper.textContent = props.formula
    
    // 清空并添加新内容
    element.innerHTML = ''
    element.appendChild(wrapper)
    
    // 使用Promise链进行渲染，避免阻塞
    if (typesetPromise.value) {
      // 如果已有渲染任务，将当前任务加入队列
      await typesetPromise.value
    }
    
    typesetPromise.value = window.MathJax.typesetPromise([element])
    await typesetPromise.value
    
    isLoading.value = false
    emit('rendered', true)
    
    // 性能优化：调整渲染结果
    optimizeRenderedFormula(element)
  } catch (error) {
    handleMathJaxError(error as Error)
  } finally {
    typesetPromise.value = null
  }
}

// 处理MathJax错误
function handleMathJaxError(error: Error) {
  isLoading.value = false
  hasError.value = true
  
  // 构建用户友好的错误消息
  const errorMsg = error.message || '公式渲染失败'
  errorMessage.value = props.throwError 
    ? `公式错误: ${errorMsg}` 
    : '公式渲染失败，请检查公式语法'
  
  console.error('MathJax rendering error:', error)
  emit('error', error)
}

// 优化渲染后的公式
function optimizeRenderedFormula(element: HTMLElement) {
  // 查找所有SVG元素
  const svgElements = element.querySelectorAll('svg')
  svgElements.forEach(svg => {
    // 应用样式优化
    svg.style.maxWidth = '100%'
    svg.style.height = 'auto'
    svg.style.display = 'inline-block'
    
    // 提高可访问性
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', `数学公式: ${props.formula.substring(0, 50)}${props.formula.length > 50 ? '...' : ''}`)
  })
}

// 处理渲染队列
function processRenderQueue() {
  while (renderQueue.value.length > 0) {
    const renderTask = renderQueue.value.shift()
    if (renderTask) {
      renderTask()
    }
  }
}

// 监听公式变化 - 添加防抖
let renderTimeout: number | null = null
watch(() => props.formula, () => {
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
  
  renderTimeout = window.setTimeout(() => {
    if (isInitialized.value) {
      renderMath()
    } else {
      // 如果未初始化，将渲染任务加入队列
      renderQueue.value.push(() => renderMath())
    }
  }, 300) // 300ms防抖延迟
}, { immediate: false })

// 监听配置变化
watch([() => props.scale, () => props.color, () => props.equationNumber], () => {
  if (isInitialized.value && window.MathJax) {
    // 更新配置
    window.MathJax.config.svg.scale = props.scale
    window.MathJax.config.tex.tags = props.equationNumber ? 'all' : 'none'
    
    // 重新渲染
    renderMath()
  }
})

// 生命周期
onMounted(() => {
  initMathJax()
})

onUnmounted(() => {
  // 清理定时器
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
  
  // 清理DOM
  if (mathElement.value) {
    mathElement.value.innerHTML = ''
  }
  
  // 清理渲染Promise
  typesetPromise.value = null
})

// 暴露方法给父组件
defineExpose({
  renderMath,
  hasError,
  isLoading
})

</script>

<style scoped>
.mathjax-container {
  display: inline-block;
  position: relative;
  min-width: 20px;
  min-height: 20px;
  transition: all 0.3s ease;
  width: 100%;
  overflow-x: auto;
}

/* 错误状态样式 */
.mathjax-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 8px 12px;
  color: #dc2626;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text {
  font-weight: 500;
}

/* 加载状态样式 */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #6b7280;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-style: italic;
}

/* 公式容器样式增强 */
:deep(svg) {
  display: inline-block !important;
  vertical-align: middle !important;
  max-width: 100% !important;
  height: auto !important;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .mathjax-container {
    font-size: 0.9rem;
  }
  
  .error-message,
  .loading-indicator {
    font-size: 0.8rem;
    padding: 6px 8px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .mathjax-error {
    background-color: #450a0a;
    border-color: #b91c1c;
  }
  
  .error-text {
    color: #fca5a5;
  }
  
  .loading-indicator {
    color: #9ca3af;
  }
  
  .loading-spinner {
    border-color: #374151;
    border-top-color: #60a5fa;
  }
}
</style>

/* 自定义MathJax渲染样式 */
:deep(.mjx-chtml) {
  font-size: 110% !important;
}

:deep(.mjx-chtml.MJXc-display) {
  overflow-x: auto;
  overflow-y: hidden;
}
</style>