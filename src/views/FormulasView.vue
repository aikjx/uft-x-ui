<template>
  <div class="min-h-screen cosmic-bg">
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <RouterLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
            <span class="text-xl font-bold gradient-text">统一场论</span>
          </RouterLink>
          <div class="hidden md:flex space-x-8">
            <RouterLink to="/" class="text-gray-300 hover:text-white transition">首页</RouterLink>
            <RouterLink to="/formulas" class="text-white font-semibold">核心公式</RouterLink>
            <RouterLink to="/visualization" class="text-gray-300 hover:text-white transition">3D可视化</RouterLink>
            <RouterLink to="/learn" class="text-gray-300 hover:text-white transition">学习路径</RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="pt-24 pb-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-5xl font-bold text-center mb-4">
          <span class="gradient-text">17个核心公式</span>
        </h1>
        <p class="text-center text-gray-300 text-xl mb-12">
          探索统一场论的数学基础
        </p>

        <!-- 筛选器 -->
        <div class="flex flex-wrap gap-3 justify-center mb-12">
          <button
            @click="selectedCategory = null"
            :class="[
              'px-6 py-2 rounded-full font-semibold transition-all',
              selectedCategory === null 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'glass-effect text-gray-300 hover:text-white'
            ]"
          >
            全部 (17)
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'px-6 py-2 rounded-full font-semibold transition-all',
              selectedCategory === cat.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'glass-effect text-gray-300 hover:text-white'
            ]"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>

        <!-- 公式列表 -->
        <div class="grid gap-6">
          <div
            v-for="formula in filteredFormulas"
            :key="formula.id"
            class="glass-effect p-6 rounded-2xl hover:scale-[1.02] transition-all cursor-pointer"
            @click="goToDetail(formula.id)"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-cyan-400 font-bold text-lg">公式 {{ formula.id }}</span>
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      formula.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      formula.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    ]"
                  >
                    {{ difficultyMap[formula.difficulty] }}
                  </span>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">{{ formula.name }}</h3>
                <p class="text-gray-300">{{ formula.description }}</p>
              </div>
            </div>

            <!-- 公式渲染 -->
            <div class="bg-black/30 p-6 rounded-xl mb-4 overflow-x-auto">
              <div 
                class="formula-content text-white text-center"
                v-html="renderFormula(formula.latex)"
              ></div>
            </div>

            <!-- 应用标签 -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="app in formula.applications"
                :key="app"
                class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
              >
                {{ app }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formulas } from '../data/formulas'
import { useMathJax } from '../composables/useMathJax'

const router = useRouter()
const selectedCategory = ref<string | null>(null)

const categories = [
  { id: 'spacetime', name: '时空理论', icon: '⏰' },
  { id: 'mechanics', name: '力学基础', icon: '⚛️' },
  { id: 'unified', name: '统一理论', icon: '🌟' },
  { id: 'electromagnetic', name: '电磁理论', icon: '⚡' },
  { id: 'application', name: '应用理论', icon: '🚀' }
]

const difficultyMap = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
}

const filteredFormulas = computed(() => {
  if (!selectedCategory.value) return formulas
  return formulas.filter(f => f.category === selectedCategory.value)
})

const renderFormula = (latex: string) => {
  return `\\[${latex}\\]`
}

const goToDetail = (id: number) => {
  router.push(`/formula/${id}`)
}

const { typeset } = useMathJax()

onMounted(() => {
  setTimeout(() => typeset(), 100)
})

// 监听分类变化，重新渲染公式
watch(selectedCategory, () => {
  setTimeout(() => typeset(), 100)
})
</script>

<style scoped>
.formula-content {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
