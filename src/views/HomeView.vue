<template>
  <div class="min-h-screen cosmic-bg">
    <!-- 导航栏 -->
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
            <span class="text-xl font-bold gradient-text">统一场论探索网</span>
          </div>
          <div class="hidden md:flex space-x-8">
            <RouterLink to="/" class="text-gray-300 hover:text-white transition">首页</RouterLink>
            <RouterLink to="/formulas" class="text-gray-300 hover:text-white transition">核心公式</RouterLink>
            <RouterLink to="/visualization" class="text-gray-300 hover:text-white transition">3D可视化</RouterLink>
            <RouterLink to="/learn" class="text-gray-300 hover:text-white transition">学习路径</RouterLink>
            <RouterLink to="/about" class="text-gray-300 hover:text-white transition">关于</RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 英雄区 -->
    <section class="pt-32 pb-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-6xl md:text-8xl font-bold mb-6">
          <span class="gradient-text">统一场论</span>
        </h1>
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-8">
          人工场探索网
        </h2>
        <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          探索宇宙的终极奥秘 · 揭示时空、引力、电磁的本质统一
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink 
            to="/formulas" 
            class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            探索17个核心公式
          </RouterLink>
          <RouterLink 
            to="/visualization" 
            class="px-8 py-4 glass-effect text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            3D可视化体验
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 特色功能 -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h3 class="text-4xl font-bold text-center text-white mb-16">核心特性</h3>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="glass-effect p-8 rounded-2xl hover:scale-105 transition-all">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl mb-6 flex items-center justify-center">
              <span class="text-3xl">🌌</span>
            </div>
            <h4 class="text-2xl font-bold text-white mb-4">17个核心公式</h4>
            <p class="text-gray-300">从时空同一化到光速飞行器，完整呈现张祥前统一场论的数学框架</p>
          </div>
          <div class="glass-effect p-8 rounded-2xl hover:scale-105 transition-all">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl mb-6 flex items-center justify-center">
              <span class="text-3xl">🎨</span>
            </div>
            <h4 class="text-2xl font-bold text-white mb-4">实时3D可视化</h4>
            <p class="text-gray-300">基于Three.js的高性能渲染，让抽象的物理概念变得直观可见</p>
          </div>
          <div class="glass-effect p-8 rounded-2xl hover:scale-105 transition-all">
            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl mb-6 flex items-center justify-center">
              <span class="text-3xl">🎓</span>
            </div>
            <h4 class="text-2xl font-bold text-white mb-4">渐进式学习</h4>
            <p class="text-gray-300">从入门到精通，系统化的学习路径帮助你深入理解统一场论</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 公式分类 -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h3 class="text-4xl font-bold text-center text-white mb-16">公式分类</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="glass-effect p-6 rounded-xl hover:scale-105 transition-all cursor-pointer"
            @click="navigateToCategory(category.id)"
          >
            <div class="text-4xl mb-4">{{ category.icon }}</div>
            <h4 class="text-xl font-bold text-white mb-2">{{ category.name }}</h4>
            <p class="text-gray-300 text-sm mb-4">{{ category.description }}</p>
            <div class="text-cyan-400 font-semibold">{{ category.count }} 个公式 →</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="py-12 px-4 border-t border-white/10">
      <div class="max-w-7xl mx-auto text-center">
        <p class="text-gray-400 mb-4">
          © 2025 统一场论探索网 · UTF Star · 基于张祥前统一场论
        </p>
        <p class="text-gray-500 text-sm">
          探索宇宙的终极奥秘，让科学之美触手可及 ✨
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  {
    id: 'spacetime',
    name: '时空理论',
    icon: '⏰',
    description: '时空同一化和螺旋时空',
    count: 3
  },
  {
    id: 'mechanics',
    name: '力学基础',
    icon: '⚛️',
    description: '质量、动量和引力场',
    count: 4
  },
  {
    id: 'unified',
    name: '统一理论',
    icon: '🌟',
    description: '宇宙大统一方程',
    count: 4
  },
  {
    id: 'electromagnetic',
    name: '电磁理论',
    icon: '⚡',
    description: '电荷、电场、磁场统一',
    count: 4
  },
  {
    id: 'application',
    name: '应用理论',
    icon: '🚀',
    description: '能量方程和飞行器动力学',
    count: 2
  }
]

const navigateToCategory = (categoryId: string) => {
  router.push(`/formulas?category=${categoryId}`)
}
</script>
