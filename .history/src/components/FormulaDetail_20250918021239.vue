<template>
  <div class="formula-detail-overlay animate-fade-in" @click="$emit('close')">
    <div class="formula-detail-modal animate-scale-in" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ formula.name }}</h2>
        <button @click="$emit('close')" class="close-button hover-scale">
          ✕
        </button>
      </div>

      <div class="modal-content">
        <div class="formula-display">
          <div class="formula-latex-large" ref="latexRef">
            $${{ formula.latex }}$$
          </div>
        </div>

        <div class="formula-info">
          <div class="info-section animate-slide-up">
            <h3>公式描述</h3>
            <p>{{ formula.description }}</p>
          </div>

          <div class="info-section animate-slide-up" style="animation-delay: 0.1s">
            <h3>物理意义</h3>
            <p>{{ getPhysicalMeaning(formula.id) }}</p>
          </div>

          <div class="info-section animate-slide-up" style="animation-delay: 0.2s">
            <h3>参数说明</h3>
            <div class="parameters-grid">
              <div
                v-for="param in getParameters(formula.id)"
                :key="param.symbol"
                class="parameter-item"
              >
                <span class="param-symbol">${{ param.symbol }}$</span>
                <span class="param-description">{{ param.description }}</span>
              </div>
            </div>
          </div>

          <div class="info-section animate-slide-up" style="animation-delay: 0.3s">
            <h3>相关公式</h3>
            <div class="related-formulas">
              <span
                v-for="relatedId in getRelatedFormulas(formula.id)"
                :key="relatedId"
                class="related-formula-tag hover-scale"
                :style="{ backgroundColor: formula.color }"
              >
                公式 {{ relatedId }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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

const getPhysicalMeaning = (formulaId: number): string => {
  const meanings: Record<number, string> = {
    1: '描述了时空的统一性，表明空间和时间是统一的整体。',
    2: '描述了三维螺旋时空的几何结构，揭示了时空的螺旋性质。',
    3: '重新定义了质量的本质，将质量与空间密度变化联系起来。',
    4: '统一了引力场的定义，将引力与空间密度梯度联系。',
    5: '描述了静止状态下的动量，揭示了静止的相对性。',
    6: '描述了运动状态下的动量，统一了经典和相对论动量。',
    7: '宇宙的大统一力方程，统一了所有基本力的本质。',
    8: '描述了空间本身的波动性质，揭示了空间的动态特性。',
    9: '重新定义了电荷的本质，将电荷与空间变化率联系。',
    10: '统一了电场的定义，将电场与空间几何联系。',
    11: '统一了磁场的定义，揭示了磁场的几何本质。',
    12: '描述了变化引力场如何产生电磁场，统一了引力和电磁。',
    13: '定义了磁矢势与磁场的关系，揭示了磁场的矢势本质。',
    14: '描述了变化引力场如何产生电场，统一了引力和电场。',
    15: '描述了变化磁场如何产生引力场和电场的复杂关系。',
    16: '统一场论的能量方程，揭示了能量的统一本质。',
    17: '光速飞行器的动力学方程，为未来科技提供理论基础。'
  }
  return meanings[formulaId] || '该公式揭示了宇宙的深层统一性。'
}

const getParameters = (formulaId: number) => {
  const params: Record<number, Array<{symbol: string, description: string}>> = {
    1: [
      { symbol: '\\vec{r}(t)', description: '位置矢量' },
      { symbol: '\\vec{C}', description: '光速矢量' },
      { symbol: 't', description: '时间' }
    ],
    2: [
      { symbol: 'r', description: '螺旋半径' },
      { symbol: '\\omega', description: '角频率' },
      { symbol: 'h', description: '螺旋上升速度' }
    ],
    // 可以继续添加其他公式的参数
  }
  return params[formulaId] || []
}

const getRelatedFormulas = (formulaId: number): number[] => {
  const relations: Record<number, number[]> = {
    1: [2, 5],
    2: [1, 8],
    3: [4, 6],
    4: [3, 12],
    5: [1, 6],
    6: [3, 5, 7],
    7: [6, 12, 14],
    8: [2, 12],
    9: [10, 11],
    10: [9, 14],
    11: [9, 15],
    12: [4, 7, 8, 14],
    13: [11, 15],
    14: [7, 10, 12],
    15: [11, 13],
    16: [7, 17],
    17: [16]
  }
  return relations[formulaId] || []
}
</script>

<style scoped>
.formula-detail-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.formula-detail-modal {
  @apply bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.close-button {
  @apply w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
         flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors;
}

.modal-content {
  @apply p-6;
}

.formula-display {
  @apply text-center mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl;
}

.formula-latex-large {
  @apply text-2xl;
}

.info-section {
  @apply mb-6;
}

.info-section h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.info-section p {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed;
}

.parameters-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.parameter-item {
  @apply flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.param-symbol {
  @apply font-mono text-blue-600 dark:text-blue-400 font-semibold;
}

.param-description {
  @apply text-gray-700 dark:text-gray-300;
}

.related-formulas {
  @apply flex flex-wrap gap-2;
}

.related-formula-tag {
  @apply px-3 py-1 rounded-full text-white text-sm font-medium cursor-pointer;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>