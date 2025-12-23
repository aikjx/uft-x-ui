<template>
  <div 
    ref="formulaRef" 
    class="math-formula"
    :class="{ 
      'loading': isLoading, 
      'error': hasError,
      'inline': inline,
      'display': !inline
    }"
  >
    <div v-if="isLoading" class="formula-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">渲染中...</span>
    </div>
    
    <div v-else-if="hasError" class="formula-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">公式渲染失败</span>
      <button @click="retry" class="retry-btn">重试</button>
    </div>
    
    <div 
      v-else 
      class="formula-content"
      :class="{ 'tex2jax_process': true }"
      v-html="formattedFormula"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { useMathJax } from '../composables/useMathJax'

interface Props {
  formula: string
  inline?: boolean
  color?: string
  size?: 'small' | 'medium' | 'large' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  inline: false,
  color: '#00f5ff',
  size: 'medium'
})

const formulaRef = ref<HTMLElement>()
const isLoading = ref(true)
const hasError = ref(false)
const retryCount = ref(0)
const maxRetries = 3

const { renderMath, initMathJax, checkMathJax } = useMathJax()

// 格式化公式
const formattedFormula = computed(() => {
  if (!props.formula) return ''
  
  // 清理公式字符串
  const cleanFormula = props.formula.trim()
  
  if (props.inline) {
    return `$${cleanFormula}$`
  } else {
    return `$$${cleanFormula}$$`
  }
})

// 渲染公式
const renderFormula = async () => {
  if (!formulaRef.value || !props.formula) {
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    hasError.value = false
    
    // 确保 MathJax 已初始化
    await initMathJax()
    
    // 等待 DOM 更新
    await nextTick()
    
    // 检查 MathJax 是否可用
    if (!checkMathJax()) {
      throw new Error('MathJax 未准备就绪')
    }
    
    // 渲染公式
    await renderMath(formulaRef.value)
    
    isLoading.value = false
    retryCount.value = 0
    
  } catch (error) {
    console.error('公式渲染错误:', error)
    
    // 自动重试机制
    if (retryCount.value < maxRetries) {
      retryCount.value++
      setTimeout(() => {
        renderFormula()
      }, 1000 * retryCount.value) // 递增延迟
    } else {
      hasError.value = true
      isLoading.value = false
    }
  }
}

// 手动重试渲染
const retry = () => {
  retryCount.value = 0
  renderFormula()
}

// 监听公式变化
watch(() => props.formula, (newFormula, oldFormula) => {
  if (newFormula !== oldFormula && newFormula) {
    renderFormula()
  }
}, { immediate: false })

// 监听内联模式变化
watch(() => props.inline, () => {
  if (props.formula) {
    renderFormula()
  }
})

onMounted(() => {
  // 延迟一点时间确保 DOM 完全准备好
  setTimeout(() => {
    renderFormula()
  }, 100)
})

onUnmounted(() => {
  // 清理工作
  retryCount.value = 0
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