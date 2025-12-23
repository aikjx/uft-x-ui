<template>
  <div class="learning-path-view">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="view-header"
    >
      <h1 class="view-title">学习路径</h1>
      <p class="view-subtitle">循序渐进地掌握张祥前统一场论的核心概念</p>
    </motion.div>

    <div class="learning-levels">
      <motion.div
        v-for="(level, index) in learningLevels"
        :key="level.id"
        :initial="{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: index * 0.2, duration: 0.6 }"
        class="level-section"
      >
        <div class="level-header">
          <div class="level-icon" :style="{ backgroundColor: level.color }">
            {{ level.icon }}
          </div>
          <div class="level-info">
            <h2 class="level-title">{{ level.title }}</h2>
            <p class="level-description">{{ level.description }}</p>
          </div>
        </div>

        <div class="formulas-grid">
          <motion.div
            v-for="formula in level.formulas"
            :key="formula.id"
            :whileHover="{ scale: 1.02, y: -2 }"
            :whileTap="{ scale: 0.98 }"
            @click="selectFormula(formula)"
            class="formula-item"
            :style="{ borderColor: level.color }"
          >
            <div class="formula-number" :style="{ backgroundColor: level.color }">
              {{ formula.id }}
            </div>
            <div class="formula-content">
              <h3 class="formula-name">{{ formula.name }}</h3>
              <div class="formula-latex" ref="latexRefs">
                ${{ formula.latex }}$
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>

    <!-- 学习进度 -->
    <motion.div
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.8, duration: 0.6 }"
      class="progress-section"
    >
      <h2 class="progress-title">学习进度</h2>
      <div class="progress-bar">
        <motion.div
          :initial="{ width: 0 }"
          :animate="{ width: `${progress}%` }"
          :transition="{ delay: 1, duration: 1.5, ease: 'easeOut' }"
          class="progress-fill"
        ></motion.div>
      </div>
      <p class="progress-text">已完成 {{ completedFormulas }}/17 个公式</p>
    </motion.div>

    <!-- 公式详情弹窗 -->
    <Teleport to="body">
      <FormulaDetail
        v-if="selectedFormula"
        :formula="selectedFormula"
        @close="selectedFormula = null"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

import FormulaDetail from '../components/FormulaDetail.vue'
import { formulas, type Formula } from '../data/formulas'

const selectedFormula = ref<Formula | null>(null)
const latexRefs = ref<HTMLElement[]>([])
const completedFormulas = ref(8) // 示例进度

const progress = computed(() => (completedFormulas.value / 17) * 100)

const learningLevels = [
  {
    id: 'basic',
    title: '基础概念',
    description: '理解时空和质量的基本定义',
    icon: '🌱',
    color: '#10B981',
    formulas: formulas.filter(f => [1, 2, 3].includes(f.id))
  },
  {
    id: 'intermediate',
    title: '力学原理',
    description: '掌握引力场和动量的概念',
    icon: '⚡',
    color: '#3B82F6',
    formulas: formulas.filter(f => [4, 5, 6, 7].includes(f.id))
  },
  {
    id: 'advanced',
    title: '统一理论',
    description: '理解空间波动和统一方程',
    icon: '🌊',
    color: '#F59E0B',
    formulas: formulas.filter(f => [8, 7].includes(f.id))
  },
  {
    id: 'electromagnetic',
    title: '电磁理论',
    description: '掌握电磁场的统一描述',
    icon: '⚡',
    color: '#EF4444',
    formulas: formulas.filter(f => [9, 10, 11, 12, 13, 14, 15].includes(f.id))
  },
  {
    id: 'applications',
    title: '应用拓展',
    description: '探索理论的实际应用',
    icon: '🚀',
    color: '#8B5CF6',
    formulas: formulas.filter(f => [16, 17].includes(f.id))
  }
]

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}

onMounted(async () => {
  await nextTick()
  if (latexRefs.value.length > 0 && window.MathJax) {
    window.MathJax.typesetPromise(latexRefs.value)
  }
})
</script>

<style scoped>
.learning-path-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8;
}

.view-header {
  @apply text-center mb-12 px-4;
}

.view-title {
  @apply text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto;
}

.learning-levels {
  @apply max-w-6xl mx-auto px-4 space-y-12;
}

.level-section {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl;
}

.level-header {
  @apply flex items-center gap-6 mb-8;
}

.level-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white;
}

.level-info {
  @apply flex-1;
}

.level-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.level-description {
  @apply text-gray-600 dark:text-gray-300;
}

.formulas-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.formula-item {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-transparent
         cursor-pointer transition-all duration-300 hover:shadow-lg;
}

.formula-number {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3;
}

.formula-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-2;
}

.formula-latex {
  @apply text-sm text-center;
}

.progress-section {
  @apply max-w-2xl mx-auto mt-16 px-4 text-center;
}

.progress-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-6;
}

.progress-bar {
  @apply w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full;
}

.progress-text {
  @apply text-gray-600 dark:text-gray-300 font-medium;
}
</style>