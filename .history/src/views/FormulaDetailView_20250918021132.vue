<template>
  <div class="formula-detail-view" v-if="formula">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="detail-container"
    >
      <div class="detail-header">
        <router-link to="/" class="back-btn">
          <motion.div
            :whileHover="{ scale: 1.1 }"
            :whileTap="{ scale: 0.9 }"
          >
            ← 返回公式列表
          </motion.div>
        </router-link>
        
        <div class="formula-info">
          <div class="formula-number" :style="{ backgroundColor: formula.color }">
            {{ formula.id }}
          </div>
          <div>
            <h1 class="formula-title">{{ formula.name }}</h1>
            <span class="formula-category" :style="{ color: formula.color }">
              {{ formula.category }}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        :initial="{ y: 30, opacity: 0 }"
        :animate="{ y: 0, opacity: 1 }"
        :transition="{ delay: 0.3, duration: 0.6 }"
        class="formula-content"
      >
        <div class="formula-latex-display" ref="latexRef">
          $${{ formula.latex }}$$
        </div>
        
        <div class="content-sections">
          <section class="description-section">
            <h2>公式说明</h2>
            <p>{{ formula.description }}</p>
          </section>

          <section class="parameters-section">
            <h2>参数说明</h2>
            <div class="parameters-list">
              <div v-for="param in getParameters(formula.id)" :key="param.symbol" class="parameter-item">
                <span class="param-symbol" v-html="param.symbol"></span>
                <span class="param-description">{{ param.description }}</span>
              </div>
            </div>
          </section>

          <section class="applications-section">
            <h2>物理意义</h2>
            <p>{{ getPhysicalMeaning(formula.id) }}</p>
          </section>

          <section class="related-section">
            <h2>相关公式</h2>
            <div class="related-formulas">
              <router-link
                v-for="relatedId in getRelatedFormulas(formula.id)"
                :key="relatedId"
                :to="`/formula/${relatedId}`"
                class="related-formula-link"
              >
                公式 {{ relatedId }}
              </router-link>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
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

const getParameters = (formulaId: number) => {
  const parameterMap: Record<number, Array<{symbol: string, description: string}>> = {
    1: [
      { symbol: '\\(\\vec{r}(t)\\)', description: '位置矢量，描述物体在时空中的位置' },
      { symbol: '\\(\\vec{C}\\)', description: '光速矢量，表示光在真空中的传播速度' },
      { symbol: '\\(t\\)', description: '时间参数' },
      { symbol: '\\(x,y,z\\)', description: '三维空间坐标' }
    ],
    2: [
      { symbol: '\\(r\\)', description: '螺旋运动的半径' },
      { symbol: '\\(\\omega\\)', description: '角频率，描述旋转的快慢' },
      { symbol: '\\(h\\)', description: '螺距参数，控制螺旋的紧密程度' }
    ],
    3: [
      { symbol: '\\(m\\)', description: '物体的质量' },
      { symbol: '\\(k\\)', description: '比例常数' },
      { symbol: '\\(n\\)', description: '空间密度' },
      { symbol: '\\(\\Omega\\)', description: '立体角' }
    ]
  }
  
  return parameterMap[formulaId] || []
}

const getPhysicalMeaning = (formulaId: number) => {
  const meanings: Record<number, string> = {
    1: '这个方程揭示了时间和空间的统一性，表明时空是一个整体，物体的运动轨迹可以用光速和时间的乘积来描述。',
    2: '描述了物质在三维空间中的螺旋运动模式，这种运动形式在宇宙中普遍存在，从微观粒子到宏观天体都遵循这一规律。',
    3: '重新定义了质量的概念，将质量与空间密度的变化率联系起来，为理解物质的本质提供了新的视角。'
  }
  
  return meanings[formulaId] || '这个公式在统一场论中具有重要的理论意义。'
}

const getRelatedFormulas = (formulaId: number) => {
  const relations: Record<number, number[]> = {
    1: [2, 7],
    2: [1, 8],
    3: [4, 5, 6],
    4: [3, 12, 14],
    5: [3, 6],
    6: [5, 7],
    7: [1, 6, 16],
    8: [2, 12],
    9: [10, 11],
    10: [9, 11, 14],
    11: [9, 10, 15],
    12: [4, 8, 13, 14],
    13: [11, 12],
    14: [4, 10, 12],
    15: [11, 14],
    16: [7, 17],
    17: [16]
  }
  
  return relations[formulaId] || []
}
</script>

<style scoped>
.formula-detail-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800;
}

.detail-container {
  @apply max-w-4xl mx-auto px-4 py-8;
}

.detail-header {
  @apply mb-8;
}

.back-btn {
  @apply inline-block mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
         font-medium transition-colors;
}

.formula-info {
  @apply flex items-center gap-6;
}

.formula-number {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl;
}

.formula-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.formula-category {
  @apply text-lg font-medium;
}

.formula-latex-display {
  @apply text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8 text-2xl;
}

.content-sections {
  @apply space-y-8;
}

.content-sections section {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg;
}

.content-sections h2 {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-4;
}

.content-sections p {
  @apply text-gray-700 dark:text-gray-300 leading-relaxed;
}

.parameters-list {
  @apply space-y-3;
}

.parameter-item {
  @apply flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.param-symbol {
  @apply font-mono text-blue-600 dark:text-blue-400 min-w-24 flex-shrink-0;
}

.param-description {
  @apply text-gray-700 dark:text-gray-300;
}

.related-formulas {
  @apply flex flex-wrap gap-2;
}

.related-formula-link {
  @apply px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 
         rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors;
}
</style>