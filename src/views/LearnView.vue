<template>
  <div class="min-h-screen cosmic-bg">
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <RouterLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
            <span class="text-xl font-bold gradient-text">学习路径</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="pt-24 pb-20 px-4">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-5xl font-bold text-center mb-4">
          <span class="gradient-text">学习路径</span>
        </h1>
        <p class="text-center text-gray-300 text-xl mb-16">
          从入门到精通，系统掌握统一场论
        </p>

        <!-- 学习路径 -->
        <div class="space-y-8">
          <div
            v-for="(level, index) in learningPath"
            :key="level.id"
            class="glass-effect p-8 rounded-2xl"
          >
            <div class="flex items-start gap-6">
              <div class="flex-shrink-0">
                <div 
                  :class="[
                    'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold',
                    level.color
                  ]"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-white mb-2">{{ level.title }}</h3>
                <p class="text-gray-300 mb-4">{{ level.description }}</p>
                <div class="grid md:grid-cols-2 gap-3">
                  <RouterLink
                    v-for="formulaId in level.formulas"
                    :key="formulaId"
                    :to="`/formula/${formulaId}`"
                    class="bg-black/30 p-4 rounded-xl hover:bg-black/50 transition"
                  >
                    <div class="text-cyan-400 font-bold mb-1">公式 {{ formulaId }}</div>
                    <div class="text-white text-sm">{{ getFormulaName(formulaId) }}</div>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFormulaById } from '../data/formulas'

const learningPath = [
  {
    id: 'beginner',
    title: '第一阶段：基础概念',
    description: '理解时空、质量、能量的基本定义',
    color: 'bg-gradient-to-br from-green-400 to-teal-600',
    formulas: [1, 5, 16]
  },
  {
    id: 'intermediate',
    title: '第二阶段：场论基础',
    description: '掌握引力场和电磁场的本质',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-600',
    formulas: [2, 3, 4, 9, 10]
  },
  {
    id: 'advanced',
    title: '第三阶段：统一理论',
    description: '理解引力与电磁的统一',
    color: 'bg-gradient-to-br from-red-400 to-pink-600',
    formulas: [7, 11, 12, 14, 15]
  },
  {
    id: 'expert',
    title: '第四阶段：高级应用',
    description: '探索波动方程和实际应用',
    color: 'bg-gradient-to-br from-purple-400 to-indigo-600',
    formulas: [6, 8, 13, 17]
  }
]

const getFormulaName = (id: number): string => {
  return getFormulaById(id)?.name || ''
}
</script>
