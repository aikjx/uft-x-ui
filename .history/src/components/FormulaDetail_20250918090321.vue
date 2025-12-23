<template>
  <div class="formula-detail-modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ formula.name }}</h2>
        <button @click="closeModal" class="close-btn">
          <span class="close-icon">×</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="formula-display">
          <div class="formula-number" :style="{ backgroundColor: getFormulaColor(formula.categoryId) }">
            {{ formula.id }}
          </div>
          <div class="formula-latex" ref="mathRef">
            {{ formula.equation }}
          </div>
        </div>
        
        <div class="formula-info">
          <div class="info-section">
            <h3 class="section-title">公式描述</h3>
            <p class="section-content">{{ formula.description }}</p>
          </div>
          
          <div class="info-section" v-if="formula.parameters && formula.parameters.length > 0">
            <h3 class="section-title">参数说明</h3>
            <div class="variables-list">
              <div v-for="param in formula.parameters" :key="param.symbol" class="variable-item">
                <span class="variable-symbol">{{ param.symbol }}</span>
                <span class="variable-description">{{ param.description }}</span>
                <span class="variable-unit" v-if="param.unit">({{ param.unit }})</span>
              </div>
            </div>
          </div>
          
          <div class="info-section" v-if="formula.applications && formula.applications.length > 0">
            <h3 class="section-title">应用领域</h3>
            <div class="applications-list">
              <span v-for="app in formula.applications" :key="app" class="application-tag">
                {{ app }}
              </span>
            </div>
          </div>
          
          <div class="info-section" v-if="formula.relatedFormulas && formula.relatedFormulas.length > 0">
            <h3 class="section-title">相关公式</h3>
            <div class="related-formulas">
              <button 
                v-for="relatedId in formula.relatedFormulas" 
                :key="relatedId"
                @click="viewRelatedFormula(relatedId)"
                class="related-formula-btn"
              >
                公式 {{ relatedId }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="toggleBookmark" class="bookmark-btn" :class="{ active: isBookmarked }">
          <span class="bookmark-icon">{{ isBookmarked ? '★' : '☆' }}</span>
          {{ isBookmarked ? '已收藏' : '收藏' }}
        </button>
        <button @click="shareFormula" class="share-btn">
          <span class="share-icon">📤</span>
          分享
        </button>
        <button @click="closeModal" class="close-modal-btn">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import type { Formula } from '../types/formula'

// Props
interface Props {
  formula: Formula
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'view-formula': [formulaId: number]
}>()

// 响应式状态
const mathRef = ref<HTMLElement>()
const isBookmarked = ref(false)

// 计算属性
const isVisible = computed(() => props.modelValue)

// 方法
const closeModal = () => {
  emit('update:modelValue', false)
}

const viewRelatedFormula = (formulaId: string) => {
  emit('view-formula', parseInt(formulaId))
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  // 这里可以添加保存到本地存储的逻辑
  const bookmarks = JSON.parse(localStorage.getItem('formula-bookmarks') || '[]')
  if (isBookmarked.value) {
    if (!bookmarks.includes(props.formula.id)) {
      bookmarks.push(props.formula.id)
    }
  } else {
    const index = bookmarks.indexOf(props.formula.id)
    if (index > -1) {
      bookmarks.splice(index, 1)
    }
  }
  localStorage.setItem('formula-bookmarks', JSON.stringify(bookmarks))
}

const getFormulaColor = (categoryId: string) => {
  const colors: Record<string, string> = {
    'basic': '#3B82F6',
    'mechanics': '#10B981', 
    'unified': '#8B5CF6',
    'electromagnetic': '#F59E0B',
    'advanced': '#EF4444'
  }
  return colors[categoryId] || '#6B7280'
}

const shareFormula = () => {
  const shareText = `张祥前统一场论 - ${props.formula.name}: ${props.formula.equation}`
  
  if (navigator.share) {
    navigator.share({
      title: props.formula.name,
      text: shareText,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(shareText).then(() => {
      alert('公式信息已复制到剪贴板！')
    })
  }
}

const renderMathJax = async () => {
  await nextTick()
  if (window.MathJax && mathRef.value) {
    try {
      await window.MathJax.typesetPromise([mathRef.value])
    } catch (error) {
      console.warn('MathJax rendering failed:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已收藏
  const bookmarks = JSON.parse(localStorage.getItem('formula-bookmarks') || '[]')
  isBookmarked.value = bookmarks.includes(props.formula.id)
  
  // 渲染数学公式
  renderMathJax()
})

// 监听公式变化，重新渲染
watch(() => props.formula, () => {
  if (props.formula) {
    renderMathJax()
    const bookmarks = JSON.parse(localStorage.getItem('formula-bookmarks') || '[]')
    isBookmarked.value = bookmarks.includes(props.formula.id)
  }
}, { deep: true })
</script>

<style scoped>
.formula-detail-modal {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
  backdrop-filter: blur(4px);
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.close-btn {
  @apply w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200;
}

.close-icon {
  @apply text-2xl text-gray-500 dark:text-gray-400;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[60vh];
}

.formula-display {
  @apply flex items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl;
}

.formula-number {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg;
}

.formula-latex {
  @apply flex-1 text-xl font-mono text-gray-800 dark:text-gray-200 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto;
}

.formula-info {
  @apply space-y-6;
}

.info-section {
  @apply space-y-3;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.section-content {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed;
}

.variables-list {
  @apply space-y-2;
}

.variable-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.variable-symbol {
  @apply font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[2rem];
}

.variable-description {
  @apply flex-1 text-gray-700 dark:text-gray-300;
}

.variable-unit {
  @apply text-sm text-gray-500 dark:text-gray-400 font-mono;
}

.applications-list {
  @apply flex flex-wrap gap-2;
}

.application-tag {
  @apply px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium;
}

.related-formulas {
  @apply flex flex-wrap gap-2;
}

.related-formula-btn {
  @apply px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700;
}

.bookmark-btn, .share-btn, .close-modal-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2;
}

.bookmark-btn {
  @apply bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800;
}

.bookmark-btn.active {
  @apply bg-yellow-500 text-white hover:bg-yellow-600;
}

.share-btn {
  @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800;
}

.close-modal-btn {
  @apply bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500;
}

.bookmark-icon, .share-icon {
  @apply text-lg;
}

/* 动画 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    @apply max-w-full m-2;
  }
  
  .formula-display {
    @apply flex-col items-start gap-4;
  }
  
  .formula-number {
    @apply w-12 h-12 text-lg;
  }
  
  .formula-latex {
    @apply text-lg;
  }
  
  .modal-footer {
    @apply flex-col gap-2;
  }
  
  .bookmark-btn, .share-btn, .close-modal-btn {
    @apply w-full justify-center;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .formula-detail-modal {
    backdrop-filter: blur(8px);
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .modal-content {
    animation: none;
  }
  
  .bookmark-btn, .share-btn, .close-modal-btn, .related-formula-btn, .close-btn {
    transition: none;
  }
}
</style>