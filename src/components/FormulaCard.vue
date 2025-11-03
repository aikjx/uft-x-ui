<template>
  <div 
    class="formula-card glass-effect rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
    :class="[difficultyClasses, { 'active': isActive }]"
    @click="$emit('select', formula)"
  >
    <!-- 公式头部 -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-2xl">{{ categoryIcon }}</span>
          <span class="text-xs px-2 py-1 rounded-full border" :class="difficultyBadgeClasses">
            {{ difficultyText }}
          </span>
        </div>
        <h3 class="text-xl font-bold text-white mb-1">{{ formula.name }}</h3>
        <p class="text-gray-300 text-sm">{{ formula.description }}</p>
      </div>
      <div class="text-3xl text-cyan-400">#{{ formula.id }}</div>
    </div>

    <!-- 公式渲染 -->
    <div class="formula-container mb-4 p-4 bg-black/20 rounded-lg">
      <div class="mathjax-formula text-center text-lg" ref="formulaElement">
        ${{ formula.latex }}$
      </div>
    </div>

    <!-- 变量信息 -->
    <div class="variables-grid grid grid-cols-2 gap-2 mb-4">
      <div 
        v-for="variable in formula.variables.slice(0, 4)" 
        :key="variable.symbol"
        class="variable-item text-xs p-2 rounded bg-white/5"
      >
        <div class="font-mono text-cyan-400">{{ variable.symbol }}</div>
        <div class="text-gray-300 truncate">{{ variable.name }}</div>
        <div v-if="variable.unit" class="text-gray-500 text-xs">{{ variable.unit }}</div>
      </div>
    </div>

    <!-- 应用领域 -->
    <div class="applications flex flex-wrap gap-1">
      <span 
        v-for="app in formula.applications.slice(0, 3)" 
        :key="app"
        class="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-300"
      >
        {{ app }}
      </span>
      <span v-if="formula.applications.length > 3" class="text-xs text-gray-500">
        +{{ formula.applications.length - 3 }} 更多
      </span>
    </div>

    <!-- 交互按钮 -->
    <div class="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
      <button 
        class="text-cyan-400 hover:text-cyan-300 text-sm flex items-center space-x-1"
        @click.stop="$emit('detail', formula)"
      >
        <span>详情</span>
        <span>→</span>
      </button>
      
      <div class="flex space-x-2">
        <button 
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          @click.stop="toggleFavorite"
        >
          <span :class="isFavorite ? 'text-red-400' : 'text-gray-400'">❤️</span>
        </button>
        <button 
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          @click.stop="$emit('visualize', formula)"
        >
          <span class="text-blue-400">🎨</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Formula } from '../types/formula'

interface Props {
  formula: Formula
  isActive?: boolean
}

interface Emits {
  (e: 'select', formula: Formula): void
  (e: 'detail', formula: Formula): void
  (e: 'visualize', formula: Formula): void
}

const props = defineProps<Props>()
// const emit = defineEmits<Emits>()

const formulaElement = ref<HTMLElement>()
const isFavorite = ref(false)

// 难度相关计算属性
const difficultyClasses = computed(() => {
  const base = 'border-l-4 '
  switch (props.formula.difficulty) {
    case 'beginner':
      return base + 'border-green-500'
    case 'intermediate':
      return base + 'border-yellow-500'
    case 'advanced':
      return base + 'border-red-500'
    default:
      return base + 'border-gray-500'
  }
})

const difficultyBadgeClasses = computed(() => {
  switch (props.formula.difficulty) {
    case 'beginner':
      return 'border-green-500 text-green-500 bg-green-500/10'
    case 'intermediate':
      return 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
    case 'advanced':
      return 'border-red-500 text-red-500 bg-red-500/10'
    default:
      return 'border-gray-500 text-gray-500 bg-gray-500/10'
  }
})

const difficultyText = computed(() => {
  switch (props.formula.difficulty) {
    case 'beginner':
      return '初级'
    case 'intermediate':
      return '中级'
    case 'advanced':
      return '高级'
    default:
      return '未知'
  }
})

const categoryIcon = computed(() => {
  switch (props.formula.category) {
    case 'spacetime':
      return '🌌'
    case 'mechanics':
      return '⚙️'
    case 'electromagnetic':
      return '⚡'
    case 'unified':
      return '🌟'
    case 'application':
      return '🚀'
    default:
      return '📊'
  }
})

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

// MathJax渲染
const renderMathJax = () => {
  if (formulaElement.value && window.MathJax) {
    window.MathJax.typesetPromise([formulaElement.value]).catch(console.error)
  }
}

onMounted(() => {
  // 监听MathJax加载完成
  if (window.MathJax) {
    renderMathJax()
  } else {
    window.addEventListener('mathjax-ready', renderMathJax)
  }
})

// 监听公式变化重新渲染
watch(() => props.formula, renderMathJax, { deep: true })
</script>

<style scoped>
.formula-card {
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.formula-card:hover {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.15);
}

.formula-card.active {
  border-color: rgb(6, 182, 212);
  background: rgba(6, 182, 212, 0.05);
}

.variable-item {
  transition: all 0.2s ease;
}

.variable-item:hover {
  background: rgba(6, 182, 212, 0.1);
  transform: translateY(-1px);
}

.mathjax-formula {
  font-family: 'Times New Roman', serif;
}
</style>