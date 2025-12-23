<template>
  <div
    class="formula-card animate-fade-in-up hover-card"
    :style="{ 
      borderColor: formula.color,
      animationDelay: `${index * 100}ms`
    }"
    @click="$emit('select', formula)"
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
      class="formula-hover-indicator"
      :style="{ backgroundColor: formula.color }"
    >
      点击查看详情
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { SimpleFormula } from '../types/simple-formula'

interface Props {
  formula: SimpleFormula
  index: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0
})

const emit = defineEmits<{
  select: [formula: SimpleFormula]
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
         cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden;
}

.hover-card:hover {
  @apply shadow-xl;
  transform: scale(1.05) translateY(-4px);
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
  @apply absolute bottom-0 left-0 right-0 text-center py-2 text-white text-sm font-medium
         opacity-0 transition-opacity duration-300;
}

.hover-card:hover .formula-hover-indicator {
  @apply opacity-100;
}

/* 动画类 */
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>