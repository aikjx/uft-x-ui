<template>
  <motion.div
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :exit="{ opacity: 0, scale: 0.9 }"
    :transition="{ duration: 0.3 }"
    class="formula-detail"
  >
    <div class="detail-header">
      <motion.button
        :whileHover="{ scale: 1.1 }"
        :whileTap="{ scale: 0.9 }"
        @click="$emit('close')"
        class="close-btn"
      >
        ✕
      </motion.button>
      
      <div class="formula-info">
        <div class="formula-number" :style="{ backgroundColor: formula.color }">
          {{ formula.id }}
        </div>
        <div>
          <h2 class="formula-title">{{ formula.name }}</h2>
          <span class="formula-category" :style="{ color: formula.color }">
            {{ formula.category }}
          </span>
        </div>
      </div>
    </div>

    <motion.div
      :initial="{ y: 20, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :transition="{ delay: 0.2 }"
      class="formula-content"
    >
      <div class="formula-latex-large" ref="latexRef">
        $${{ formula.latex }}$$
      </div>
      
      <div class="formula-description-detailed">
        <h3>公式说明</h3>
        <p>{{ formula.description }}</p>
      </div>

      <div class="formula-parameters">
        <h3>参数说明</h3>
        <div class="parameters-grid">
          <div v-for="param in getParameters(formula.id)" :key="param.symbol" class="parameter-item">
            <span class="param-symbol">{{ param.symbol }}</span>
            <span class="param-description">{{ param.description }}</span>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

import type { Formula } from '../data/formulas'

interface Props {
  formula: Formula
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const latexRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  if (latexRef.value && window.MathJax) {
    window.MathJax.typesetPromise([latexRef.value])
  }
})

const getParameters = (formulaId: number) => {
  const parameterMap: Record<number, Array<{symbol: string, description: string}>> = {
    1: [
      { symbol: 'r⃗(t)', description: '位置矢量' },
      { symbol: 'C⃗', description: '光速矢量' },
      { symbol: 't', description: '时间' }
    ],
    2: [
      { symbol: 'r', description: '螺旋半径' },
      { symbol: 'ω', description: '角频率' },
      { symbol: 'h', description: '螺距参数' }
    ],
    3: [
      { symbol: 'm', description: '质量' },
      { symbol: 'k', description: '比例常数' },
      { symbol: 'n', description: '空间密度' }
    ]
  }
  
  return parameterMap[formulaId] || []
}
</script>

<style scoped>
.formula-detail {
  @apply fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto;
}

.detail-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.close-btn {
  @apply w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
         text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700;
}

.formula-info {
  @apply flex items-center gap-4;
}

.formula-number {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold;
}

.formula-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.formula-category {
  @apply text-sm font-medium;
}

.formula-content {
  @apply p-6 max-w-4xl mx-auto;
}

.formula-latex-large {
  @apply text-center py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-8 text-xl;
}

.formula-description-detailed h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.formula-description-detailed p {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed mb-6;
}

.formula-parameters h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.parameters-grid {
  @apply grid gap-3;
}

.parameter-item {
  @apply flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg;
}

.param-symbol {
  @apply font-mono font-bold text-blue-600 dark:text-blue-400 min-w-16;
}

.param-description {
  @apply text-gray-700 dark:text-gray-300;
}
</style>