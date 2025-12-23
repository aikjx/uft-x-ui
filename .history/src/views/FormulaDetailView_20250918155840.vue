<template>
  <div class="formula-detail-view" v-if="formula">
    <div class="detail-header animate-fade-in">
      <div class="header-content">
        <router-link to="/" class="back-btn">
          <div class="back-content hover-scale">
            ← 返回公式列表
          </div>
        </router-link>
        
        <div class="formula-meta">
          <span class="formula-number" :style="{ backgroundColor: formula.color }">
            {{ formula.id }}
          </span>
          <span class="formula-category" :style="{ color: formula.color }">
            {{ formula.category }}
          </span>
        </div>
      </div>

      <div class="formula-header-content animate-slide-up">
        <h1 class="formula-title">{{ formula.name }}</h1>
        <div class="formula-latex-display" ref="latexRef">
          $${{ formula.latex }}$$
        </div>
        <p class="formula-description">{{ formula.description }}</p>
      </div>
    </div>

    <div class="detail-content">
      <div class="content-grid">
        <div class="main-content">
          <section class="content-section animate-slide-up" style="animation-delay: 0.2s">
            <h2 class="section-title">物理意义</h2>
            <p class="section-text">{{ getPhysicalMeaning(formula.id) }}</p>
          </section>

          <section class="content-section animate-slide-up" style="animation-delay: 0.3s">
            <h2 class="section-title">参数说明</h2>
            <div class="parameters-list">
              <div
                v-for="param in getParameters(formula.id)"
                :key="param.symbol"
                class="parameter-item"
              >
                <span class="param-symbol">${{ param.symbol }}$</span>
                <span class="param-description">{{ param.description }}</span>
              </div>
            </div>
          </section>

          <section class="content-section animate-slide-up" style="animation-delay: 0.4s">
            <h2 class="section-title">应用场景</h2>
            <p class="section-text">{{ getApplications(formula.id) }}</p>
          </section>
        </div>

        <div class="sidebar">
          <div class="sidebar-section animate-slide-up" style="animation-delay: 0.5s">
            <h3 class="sidebar-title">相关公式</h3>
            <div class="related-formulas">
              <router-link
                v-for="relatedId in getRelatedFormulas(formula.id)"
                :key="relatedId"
                :to="`/formula/${relatedId}`"
                class="related-formula-link hover-scale"
                :style="{ backgroundColor: formula.color }"
              >
                公式 {{ relatedId }}
              </router-link>
            </div>
          </div>

          <div class="sidebar-section animate-slide-up" style="animation-delay: 0.6s">
            <h3 class="sidebar-title">研究建议</h3>
            <p class="sidebar-text">{{ getResearchTips(formula.id) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { formulas } from '../data/formulas'

const route = useRoute()
const latexRef = ref<HTMLElement>()

const formula = computed(() => {
  const id = parseInt(route.params.id as string)
  return formulas.find(f => f.id === id)
})

onMounted(async () => {
  await nextTick()
  if (latexRef.value && window.MathJax) {
    window.MathJax.typesetPromise([latexRef.value])
  }
})

const getPhysicalMeaning = (formulaId: number): string => {
  const meanings: Record<number, string> = {
    1: '时空同一化方程揭示了空间和时间的统一性，表明它们是同一个物理实体的不同表现形式。这个方程为理解宇宙的几何结构提供了基础框架。',
    2: '三维螺旋时空方程描述了时空的螺旋几何结构，揭示了宇宙可能具有的螺旋性质。这种结构可能解释了许多宇宙现象的起源。',
    3: '质量定义方程重新定义了质量的本质，将质量与空间密度的变化率联系起来，为理解物质的本质提供了新的视角。',
    // 可以继续添加其他公式的物理意义
  }
  return meanings[formulaId] || '该公式揭示了宇宙的深层统一性，为理解物理现象提供了新的理论框架。'
}

const getParameters = (formulaId: number) => {
  const params: Record<number, Array<{symbol: string, description: string}>> = {
    1: [
      { symbol: '\\vec{r}(t)', description: '时空中的位置矢量，描述物体的时空坐标' },
      { symbol: '\\vec{C}', description: '光速矢量，表示光在时空中的传播' },
      { symbol: 't', description: '时间参数，统一时空的基本变量' }
    ],
    2: [
      { symbol: 'r', description: '螺旋的半径，描述时空弯曲的程度' },
      { symbol: '\\omega', description: '角频率，描述时空螺旋的旋转速度' },
      { symbol: 'h', description: '螺旋上升速度，描述时空的演化方向' }
    ],
    // 可以继续添加其他公式的参数
  }
  return params[formulaId] || []
}

const getApplications = (formulaId: number): string => {
  const applications: Record<number, string> = {
    1: '时空同一化方程在宇宙学、相对论物理学和量子引力理论中有重要应用，为统一场论提供了基础框架。',
    2: '三维螺旋时空方程可用于解释星系的螺旋结构、宇宙的大尺度结构形成，以及可能的时空几何性质。',
    3: '质量定义方程为理解暗物质、黑洞物理学和粒子物理学中的质量起源问题提供了新的理论工具。',
    // 可以继续添加其他公式的应用
  }
  return applications[formulaId] || '该公式在统一场论的发展和应用中具有重要意义，为解决现代物理学的基本问题提供了新的思路。'
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

const getResearchTips = (formulaId: number): string => {
  const tips: Record<number, string> = {
    1: '建议先理解经典时空概念，然后逐步研究时空统一的思想。可以结合相对论的时空观来加深理解。',
    2: '需要具备一定的微分几何基础，建议先研究螺旋线的数学描述，再理解其在时空中的物理意义。',
    3: '建议先复习经典力学中的质量概念，然后研究这个新定义如何统一了质量和空间的关系。',
    // 可以继续添加其他公式的研究建议
  }
  return tips[formulaId] || '建议结合其他相关公式一起研究，理解它们之间的内在联系，这样能更好地掌握统一场论的整体思想。'
}
</script>

<style scoped>
.formula-detail-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800;
}

.detail-header {
  @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-8;
}

.header-content {
  @apply max-w-6xl mx-auto px-4 flex items-center justify-between mb-8;
}

.back-btn {
  @apply no-underline;
}

.back-content {
  @apply flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium;
}

.formula-meta {
  @apply flex items-center space-x-4;
}

.formula-number {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold;
}

.formula-category {
  @apply font-medium;
}

.formula-header-content {
  @apply max-w-6xl mx-auto px-4 text-center;
}

.formula-title {
  @apply text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6;
}

.formula-latex-display {
  @apply text-2xl mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl;
}

.formula-description {
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto;
}

.detail-content {
  @apply max-w-6xl mx-auto px-4 py-8;
}

.content-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-8;
}

.main-content {
  @apply lg:col-span-2;
}

.content-section {
  @apply mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg;
}

.section-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-4;
}

.section-text {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed;
}

.parameters-list {
  @apply space-y-3;
}

.parameter-item {
  @apply flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.param-symbol {
  @apply font-mono text-blue-600 dark:text-blue-400 font-semibold min-w-0 flex-shrink-0;
}

.param-description {
  @apply text-gray-700 dark:text-gray-300;
}

.sidebar {
  @apply space-y-6;
}

.sidebar-section {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg;
}

.sidebar-title {
  @apply text-lg font-bold text-gray-900 dark:text-white mb-4;
}

.sidebar-text {
  @apply text-gray-600 dark:text-gray-300 text-sm leading-relaxed;
}

.related-formulas {
  @apply flex flex-wrap gap-2;
}

.related-formula-link {
  @apply px-3 py-1 rounded-full text-white text-sm font-medium no-underline;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out both;
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
</style>