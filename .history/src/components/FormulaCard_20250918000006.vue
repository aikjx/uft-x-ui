<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 50 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100 } }"
    :hovered="{ scale: 1.02, y: -5 }"
    class="formula-card"
    :style="{ borderColor: formula.color }"
    @click="$emit('select', formula)"
    @mouseenter="$motion.apply('card', 'hovered')"
    @mouseleave="$motion.apply('card', 'enter')"
  >
    <div class="formula-header">
      <div class="formula-number" :style="{ backgroundColor: formula.color }">
        {{ formula.id }}
      </div>
      <div class="formula-category" :style="{ color: formula.color }">
        {{ formula.category }}
      </div>
    </div>
    
    <h3 class="formula-title">{{ formula.name }}</h3>
    
    <div class="formula-latex" ref="latexRef">
      ${{ formula.latex }}$
    </div>
    
    <p class="formula-description">{{ formula.description }}</p>
    
    <div
      v-motion
      class="formula-hover-indicator"
      :initial="{ opacity: 0 }"
      :hovered="{ opacity: 1 }"
      :style="{ backgroundColor: formula.color }"
    >
      点击查看详情
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Formula } from '../data/formulas'

interface Props {
  formula: Formula
  index: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [formula: Formula]
}>()

const latexRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  if (latexRef.value && window.MathJax) {
    window.MathJax.typesetPromise([latexRef.value])
  }
})
</script>

<style scoped>
.formula-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 
         cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden;
}

.formula-header {
  @apply flex items-center justify-between mb-4;
}

.formula-number {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm;
}

.formula-category {
  @apply text-sm font-medium;
}

.formula-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-4;
}

.formula-latex {
  @apply text-center py-4 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 
         text-lg overflow-x-auto;
}

.formula-description {
  @apply text-gray-600 dark:text-gray-300 text-sm leading-relaxed;
}

.formula-hover-indicator {
  @apply absolute bottom-0 left-0 right-0 text-center py-2 text-white text-sm font-medium;
}
</style>