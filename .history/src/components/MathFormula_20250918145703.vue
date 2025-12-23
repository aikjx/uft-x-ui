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
import { ref, onMounted, watch, nextTick, computed } from 'vue'
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

const { renderMath } = useMathJax()

// 格式化公式
const formattedFormula = computed(() => {
  if (!props.formula) return ''
  
  if (props.inline) {
    return `$${props.formula}$`
  } else {
    return `$$${props.formula}$$`
  }
})

// 渲染公式
const renderFormula = async () => {
  if (!formulaRef.value || !props.formula) return
  
  try {
    isLoading.value = true
    hasError.value = false
    
    await nextTick()
    await renderMath(formulaRef.value)
    
    isLoading.value = false
  } catch (error) {
    console.error('公式渲染错误:', error)
    hasError.value = true
    isLoading.value = false
  }
}

// 重试渲染
const retry = () => {
  renderFormula()
}

// 监听公式变化
watch(() => props.formula, () => {
  renderFormula()
}, { immediate: false })

onMounted(() => {
  renderFormula()
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