<template>
  <div class="min-h-screen cosmic-bg">
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <RouterLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
          </RouterLink>
          <button @click="$router.back()" class="text-gray-300 hover:text-white transition">
            ← 返回
          </button>
        </div>
      </div>
    </nav>

    <div v-if="formula" class="pt-24 pb-20 px-4">
      <div class="max-w-5xl mx-auto">
        <!-- 标题区 -->
        <div class="text-center mb-12">
          <div class="text-cyan-400 font-bold text-xl mb-2">公式 {{ formula.id }}</div>
          <h1 class="text-5xl font-bold gradient-text mb-4">{{ formula.name }}</h1>
          <p class="text-xl text-gray-300">{{ formula.description }}</p>
        </div>

        <!-- 公式展示 -->
        <div class="glass-effect p-12 rounded-3xl mb-8">
          <div 
            class="formula-display text-white text-center"
            v-html="renderFormula(formula.latex)"
          ></div>
        </div>

        <!-- 变量说明 -->
        <div class="glass-effect p-8 rounded-2xl mb-8">
          <h2 class="text-2xl font-bold text-white mb-6">变量说明</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="variable in formula.variables"
              :key="variable.symbol"
              class="bg-black/30 p-4 rounded-xl"
            >
              <div class="flex items-baseline gap-3 mb-2">
                <span class="text-cyan-400 font-mono text-xl">{{ variable.symbol }}</span>
                <span class="text-white font-semibold">{{ variable.name }}</span>
                <span v-if="variable.unit" class="text-gray-400 text-sm">{{ variable.unit }}</span>
              </div>
              <p class="text-gray-300 text-sm">{{ variable.description }}</p>
            </div>
          </div>
        </div>

        <!-- 应用领域 -->
        <div class="glass-effect p-8 rounded-2xl mb-8">
          <h2 class="text-2xl font-bold text-white mb-6">应用领域</h2>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="app in formula.applications"
              :key="app"
              class="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 rounded-xl font-semibold"
            >
              {{ app }}
            </span>
          </div>
        </div>

        <!-- 相关公式 -->
        <div v-if="relatedFormulas.length > 0" class="glass-effect p-8 rounded-2xl">
          <h2 class="text-2xl font-bold text-white mb-6">相关公式</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="related in relatedFormulas"
              :key="related.id"
              class="bg-black/30 p-4 rounded-xl cursor-pointer hover:bg-black/50 transition"
              @click="goToFormula(related.id)"
            >
              <div class="text-cyan-400 font-bold mb-1">公式 {{ related.id }}</div>
              <div class="text-white font-semibold">{{ related.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFormulaById } from '../data/formulas'
import { useMathJax } from '../composables/useMathJax'

const route = useRoute()
const router = useRouter()

const formula = computed(() => {
  const id = parseInt(route.params.id as string)
  return getFormulaById(id)
})

const relatedFormulas = computed(() => {
  if (!formula.value) return []
  return formula.value.relatedFormulas
    .map(id => getFormulaById(id))
    .filter(f => f !== undefined)
})

const renderFormula = (latex: string) => {
  return `\\[${latex}\\]`
}

const goToFormula = (id: number) => {
  router.push(`/formula/${id}`)
}

const { typeset } = useMathJax()

onMounted(() => {
  setTimeout(() => typeset(), 100)
})

watch(() => route.params.id, () => {
  setTimeout(() => typeset(), 100)
})
</script>

<style scoped>
.formula-display {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>
