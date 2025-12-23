<template>
  <div class="learning-path-view">
    <div class="view-header animate-fade-in">
      <h1 class="view-title">学习路径</h1>
      <p class="view-subtitle">循序渐进地掌握张祥前统一场论的核心概念</p>
    </div>

    <div class="learning-levels">
      <div
        v-for="(level, index) in learningLevels"
        :key="level.title"
        class="learning-level animate-slide-up"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <div class="level-header">
          <div class="level-number" :style="{ backgroundColor: level.color }">
            {{ index + 1 }}
          </div>
          <div class="level-info">
            <h2 class="level-title">{{ level.title }}</h2>
            <p class="level-description">{{ level.description }}</p>
          </div>
        </div>

        <div class="formulas-grid">
          <div
            v-for="formula in level.formulas"
            :key="formula.id"
            class="formula-card-mini hover-scale animate-fade-in-up"
            :style="{ 
              borderColor: formula.color,
              animationDelay: `${index * 0.2 + 0.1}s`
            }"
            @click="selectFormula(formula)"
          >
            <div class="formula-number-mini" :style="{ backgroundColor: formula.color }">
              {{ formula.id }}
            </div>
            <h3 class="formula-name-mini">{{ formula.name }}</h3>
            <div class="formula-latex-mini">
              ${{ formula.latex.substring(0, 50) }}...$
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习进度 -->
    <div class="progress-section animate-slide-up" style="animation-delay: 1s">
      <h2 class="progress-title">学习进度</h2>
      <div class="progress-bar">
        <div
          class="progress-fill animate-progress"
          :style="{ width: `${(completedFormulas / 17) * 100}%` }"
        ></div>
      </div>
      <p class="progress-text">已完成 {{ completedFormulas }}/17 个公式</p>
      
      <div class="progress-actions">
        <button
          @click="resetProgress"
          class="action-btn reset-btn hover-scale"
        >
          重置进度
        </button>
        <button
          @click="markAllCompleted"
          class="action-btn complete-btn hover-scale"
        >
          标记全部完成
        </button>
      </div>
    </div>

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
import { ref, computed } from 'vue'
import FormulaDetail from '../components/FormulaDetail.vue'
import { formulas, type Formula } from '../data/formulas'

const selectedFormula = ref<Formula | null>(null)
const completedFormulas = ref(0)

const learningLevels = [
  {
    title: '基础概念',
    description: '理解时空统一和基本定义',
    color: '#3B82F6',
    formulas: formulas.filter(f => [1, 2, 3].includes(f.id))
  },
  {
    title: '力学基础',
    description: '掌握动量和力的统一概念',
    color: '#10B981',
    formulas: formulas.filter(f => [4, 5, 6].includes(f.id))
  },
  {
    title: '统一理论',
    description: '理解大统一方程和空间波动',
    color: '#8B5CF6',
    formulas: formulas.filter(f => [7, 8].includes(f.id))
  },
  {
    title: '电磁理论',
    description: '掌握电磁场的几何本质',
    color: '#F59E0B',
    formulas: formulas.filter(f => [9, 10, 11, 12, 13].includes(f.id))
  },
  {
    title: '高级应用',
    description: '理解场的相互作用和应用',
    color: '#EF4444',
    formulas: formulas.filter(f => [14, 15, 16, 17].includes(f.id))
  }
]

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}

const resetProgress = () => {
  completedFormulas.value = 0
}

const markAllCompleted = () => {
  completedFormulas.value = 17
}
</script>

<style scoped>
.learning-path-view {
  @apply py-8;
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

.learning-level {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg;
}

.level-header {
  @apply flex items-center mb-6;
}

.level-number {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-6;
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

.formula-card-mini {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 
         cursor-pointer transition-all duration-300;
}

.formula-number-mini {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3;
}

.formula-name-mini {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-2;
}

.formula-latex-mini {
  @apply text-sm text-gray-600 dark:text-gray-300 font-mono;
}

.progress-section {
  @apply max-w-4xl mx-auto px-4 mt-16 text-center;
}

.progress-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-6;
}

.progress-bar {
  @apply w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000;
}

.progress-text {
  @apply text-lg text-gray-600 dark:text-gray-300 mb-6;
}

.progress-actions {
  @apply flex justify-center space-x-4;
}

.action-btn {
  @apply px-6 py-2 rounded-lg font-medium transition-all duration-300;
}

.reset-btn {
  @apply bg-gray-500 hover:bg-gray-600 text-white;
}

.complete-btn {
  @apply bg-green-500 hover:bg-green-600 text-white;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.animate-progress {
  animation: progressFill 2s ease-out;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressFill {
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0%);
  }
}
</style>