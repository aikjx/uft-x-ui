<template>
  <div 
    ref="formulaContainer" 
    class="math-formula"
    :class="{ 
      'loading': isLoading, 
      'error': hasError,
      'inline': inline,
      'display': !inline,
      [size]: true
    }"
    :style="{ '--formula-color': color }"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="formula-loading" aria-label="公式加载中">
      <div class="loading-spinner" role="status"></div>
      <span class="loading-text">渲染中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="formula-error" aria-label="公式渲染错误">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <span class="error-text">公式渲染失败</span>
      <button @click="retry" class="retry-btn" aria-label="重试渲染">
        重试
      </button>
    </div>
    
    <!-- 成功状态 -->
    <div 
      v-else 
      class="formula-content"
      :class="{ 'tex2jax_process': true }"
      v-html="formattedFormula"
      aria-label="数学公式"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { useMathJax } from '../composables/useMathJax'

// 定义 props 接口
interface FormulaProps {
  /** 数学公式字符串 */
  formula: string
  /** 是否为行内模式 */
  inline?: boolean
  /** 公式颜色 */
  color?: string
  /** 公式尺寸 */
  size?: 'small' | 'medium' | 'large' | 'xl'
  /** 渲染延迟（毫秒） */
  renderDelay?: number
  /** 最大重试次数 */
  maxRetries?: number
}

// 手动实现 withDefaults
const props = defineProps<FormulaProps>()
const inline = props.inline ?? false
const color = props.color ?? '#00f5ff'
const size = props.size ?? 'medium'
const renderDelay = props.renderDelay ?? 100
const maxRetries = props.maxRetries ?? 3

// 模板引用
const formulaContainer = ref<HTMLElement>()
const isLoading = ref(true)
const hasError = ref(false)
const retryCount = ref(0)
const renderTimeout = ref<number>()
const retryTimeout = ref<number>()

const { renderMath, initMathJax, checkMathJax } = useMathJax()

// 格式化公式（带缓存优化）
const formattedFormula = computed(() => {
  if (!props.formula.trim()) return ''
  
  const cleanFormula = props.formula.trim()
  return props.inline ? `$${cleanFormula}$` : `$$${cleanFormula}$$`
})

// 渲染公式（带防抖和错误处理）
const renderFormula = async (immediate = false) => {
  if (!formulaContainer.value || !props.formula.trim()) {
    isLoading.value = false
    return
  }
  
  // 清除之前的定时器
  if (renderTimeout.value) {
    clearTimeout(renderTimeout.value)
  }
  
  const executeRender = async () => {
    try {
      isLoading.value = true
      hasError.value = false
      
      // 确保 MathJax 已初始化
      await initMathJax()
      await nextTick()
      
      if (!checkMathJax()) {
        throw new Error('MathJax 未准备就绪')
      }
      
      // 渲染公式
      await renderMath(formulaContainer.value!)
      
      isLoading.value = false
      retryCount.value = 0
      
    } catch (error) {
      console.error('公式渲染错误:', error)
      handleRenderError(error)
    }
  }
  
  if (immediate) {
    await executeRender()
  } else {
    renderTimeout.value = setTimeout(executeRender, props.renderDelay)
  }
}

// 处理渲染错误
const handleRenderError = (error: unknown) => {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    const delay = 1000 * retryCount.value
    
    retryTimeout.value = setTimeout(() => {
      renderFormula(true)
    }, delay) as unknown as number
  } else {
    hasError.value = true
    isLoading.value = false
    console.error(`公式渲染失败，已重试 ${maxRetries} 次:`, error)
  }
}

// 手动重试渲染
const retry = () => {
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value)
  }
  retryCount.value = 0
  renderFormula(true)
}

// 监听公式变化（带防抖）
watch(() => props.formula, () => {
  renderFormula()
}, { immediate: true })

// 监听内联模式变化
watch(() => props.inline, () => {
  if (props.formula) {
    renderFormula(true)
  }
})

// 监听尺寸变化
watch(() => props.size, () => {
  if (props.formula && !isLoading.value && !hasError.value) {
    // 尺寸变化时重新渲染以确保样式正确应用
    nextTick(() => {
      if (checkMathJax()) {
        renderMath(formulaContainer.value!).catch(console.error)
      }
    })
  }
})

onMounted(() => {
  // 初始渲染
  renderFormula()
})

onUnmounted(() => {
  // 清理所有定时器
  if (renderTimeout.value) {
    clearTimeout(renderTimeout.value)
  }
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value)
  }
  retryCount.value = 0
})

// 暴露方法供外部调用
defineExpose({
  retry,
  reload: () => renderFormula(true),
  isLoading,
  hasError
})
</script>

<style scoped>
.math-formula {
  position: relative;
  transition: all 0.3s ease;
}

.math-formula.inline {
  display: inline-block;
  vertical-align: middle;
}

.math-formula.display {
  display: block;
  text-align: center;
  margin: 1rem 0;
}

.formula-content {
  color: v-bind(color);
  transition: color 0.3s ease;
}

/* 尺寸样式 */
.math-formula.display .formula-content {
  font-size: 1.2rem;
}

.math-formula.display.small .formula-content {
  font-size: 1rem;
}

.math-formula.display.large .formula-content {
  font-size: 1.5rem;
}

.math-formula.display.xl .formula-content {
  font-size: 2rem;
}

.math-formula.inline .formula-content {
  font-size: 1rem;
}

.math-formula.inline.small .formula-content {
  font-size: 0.875rem;
}

.math-formula.inline.large .formula-content {
  font-size: 1.25rem;
}

/* 加载状态 */
.formula-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #64ffda;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-top: 2px solid #64ffda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
}

/* 错误状态 */
.formula-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.25rem;
}

.error-text {
  font-size: 0.875rem;
}

.retry-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 4px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

/* 悬停效果 */
.math-formula:hover .formula-content {
  filter: brightness(1.2);
  text-shadow: 0 0 10px currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .math-formula.display.xl .formula-content {
    font-size: 1.5rem;
  }
  
  .math-formula.display.large .formula-content {
    font-size: 1.25rem;
  }
  
  .math-formula.display .formula-content {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .math-formula.display.xl .formula-content {
    font-size: 1.25rem;
  }
  
  .math-formula.display.large .formula-content {
    font-size: 1.1rem;
  }
  
  .math-formula.display .formula-content {
    font-size: 0.9rem;
  }
}
</style>