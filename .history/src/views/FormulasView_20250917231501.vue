<template>
  <div class="formulas-view">
    <motion.div
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="view-header"
    >
      <h1 class="view-title">张祥前统一场论核心公式</h1>
      <p class="view-subtitle">探索宇宙的统一理论，理解时空、引力、电磁场的本质联系</p>
    </motion.div>

    <motion.div
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 0.3, duration: 0.6 }"
      class="category-filters"
    >
      <motion.button
        v-for="category in categories"
        :key="category.name"
        :whileHover="{ scale: 1.05 }"
        :whileTap="{ scale: 0.95 }"
        @click="selectedCategory = selectedCategory === category.name ? '' : category.name"
        class="category-btn"
        :class="{ active: selectedCategory === category.name }"
        :style="{ 
          borderColor: category.color,
          backgroundColor: selectedCategory === category.name ? category.color : 'transparent',
          color: selectedCategory === category.name ? 'white' : category.color
        }"
      >
        {{ category.name }} ({{ category.count }})
      </motion.button>
    </motion.div>

    <motion.div
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 0.5, duration: 0.6 }"
      class="formulas-grid"
    >
      <FormulaCard
        v-for="(formula, index) in filteredFormulas"
        :key="formula.id"
        :formula="formula"
        :index="index"
        @select="selectFormula"
      />
    </motion.div>

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
import { motion } from 'framer-motion'
import FormulaCard from '../components/FormulaCard.vue'
import FormulaDetail from '../components/FormulaDetail.vue'
import { formulas, categories, type Formula } from '../data/formulas'

const selectedCategory = ref('')
const selectedFormula = ref<Formula | null>(null)

const filteredFormulas = computed(() => {
  if (!selectedCategory.value) return formulas
  return formulas.filter(formula => formula.category === selectedCategory.value)
})

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}
</script>

<style scoped>
.formulas-view {
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

.category-filters {
  @apply flex flex-wrap justify-center gap-3 mb-8 px-4;
}

.category-btn {
  @apply px-4 py-2 rounded-full border-2 font-medium transition-all duration-300
         hover:shadow-lg;
}

.category-btn.active {
  @apply shadow-lg;
}

.formulas-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4;
}
</style>