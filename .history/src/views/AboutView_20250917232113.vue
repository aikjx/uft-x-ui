<template>
  <div class="about-view">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="view-header"
    >
      <h1 class="view-title">关于项目</h1>
      <p class="view-subtitle">探索宇宙的统一理论，让科学之美触手可及</p>
    </motion.div>

    <div class="content-container">
      <!-- 项目介绍 -->
      <motion.section
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2, duration: 0.6 }"
        class="section"
      >
        <h2 class="section-title">项目简介</h2>
        <div class="section-content">
          <p>
            UTF Star 是一个基于 Vue 3 的现代化 Web 应用，专门用于可视化张祥前统一场论的核心公式。
            通过先进的 3D 渲染技术和交互式界面，帮助用户深入理解时空、引力、电磁场的本质联系。
          </p>
          <p>
            张祥前统一场论是一个革命性的物理理论框架，它试图统一描述宇宙中的所有基本力和现象。
            本项目通过现代化的可视化技术，让这些深奥的物理概念变得更加直观和易于理解。
          </p>
        </div>
      </motion.section>

      <!-- 技术栈 -->
      <motion.section
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.4, duration: 0.6 }"
        class="section"
      >
        <h2 class="section-title">技术栈</h2>
        <div class="tech-grid">
          <motion.div
            v-for="(tech, index) in techStack"
            :key="tech.name"
            :initial="{ opacity: 0, scale: 0.8 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ delay: 0.6 + index * 0.1, duration: 0.4 }"
            :whileHover="{ scale: 1.05, y: -5 }"
            class="tech-card"
          >
            <div class="tech-icon" :style="{ backgroundColor: tech.color }">
              {{ tech.icon }}
            </div>
            <h3 class="tech-name">{{ tech.name }}</h3>
            <p class="tech-description">{{ tech.description }}</p>
          </motion.div>
        </div>
      </motion.section>

      <!-- 核心功能 -->
      <motion.section
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.6, duration: 0.6 }"
        class="section"
      >
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <motion.div
            v-for="(feature, index) in features"
            :key="feature.title"
            :initial="{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.8 + index * 0.1, duration: 0.5 }"
            class="feature-card"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </motion.div>
        </div>
      </motion.section>

      <!-- 公式分类 -->
      <motion.section
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.8, duration: 0.6 }"
        class="section"
      >
        <h2 class="section-title">公式分类</h2>
        <div class="categories-grid">
          <motion.div
            v-for="(category, index) in formulaCategories"
            :key="category.name"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 1 + index * 0.1, duration: 0.4 }"
            :whileHover="{ scale: 1.02 }"
            class="category-card"
            :style="{ borderColor: category.color }"
          >
            <div class="category-header">
              <div class="category-icon" :style="{ backgroundColor: category.color }">
                {{ category.icon }}
              </div>
              <div>
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-count">{{ category.count }} 个公式</p>
              </div>
            </div>
            <p class="category-description">{{ category.description }}</p>
          </motion.div>
        </div>
      </motion.section>

      <!-- 开发团队 -->
      <motion.section
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 1, duration: 0.6 }"
        class="section"
      >
        <h2 class="section-title">开发信息</h2>
        <div class="team-info">
          <div class="info-card">
            <h3>版本信息</h3>
            <p>当前版本：v1.0.0</p>
            <p>发布日期：2024年1月</p>
            <p>更新频率：持续更新</p>
          </div>
          <div class="info-card">
            <h3>开源协议</h3>
            <p>MIT License</p>
            <p>欢迎贡献代码和建议</p>
            <p>GitHub: UTF-Star-Project</p>
          </div>
          <div class="info-card">
            <h3>联系方式</h3>
            <p>邮箱：utf-star@example.com</p>
            <p>QQ群：123456789</p>
            <p>微信群：扫码加入</p>
          </div>
        </div>
      </motion.section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { motion } from 'framer-motion'

const techStack = [
  {
    name: 'Vue 3',
    description: '现代化前端框架',
    icon: '⚡',
    color: '#4FC08D'
  },
  {
    name: 'TypeScript',
    description: '类型安全的JavaScript',
    icon: '📝',
    color: '#3178C6'
  },
  {
    name: 'Framer Motion',
    description: '流畅的动画库',
    icon: '🎬',
    color: '#FF0055'
  },
  {
    name: 'Three.js',
    description: '3D图形渲染',
    icon: '🎮',
    color: '#000000'
  },
  {
    name: 'MathJax',
    description: '数学公式渲染',
    icon: '📐',
    color: '#FF6B35'
  },
  {
    name: 'D3.js',
    description: '数据可视化',
    icon: '📊',
    color: '#F68E56'
  },
  {
    name: 'Tailwind CSS',
    description: '实用优先的CSS框架',
    icon: '🎨',
    color: '#06B6D4'
  },
  {
    name: 'Vite',
    description: '快速构建工具',
    icon: '⚡',
    color: '#646CFF'
  }
]

const features = [
  {
    title: '实时3D可视化',
    description: '基于Three.js的高性能3D场景渲染，直观展示物理概念',
    icon: '🌐'
  },
  {
    title: '交互式参数控制',
    description: '实时调节公式参数，观察物理量的变化过程',
    icon: '🎛️'
  },
  {
    title: '数学公式渲染',
    description: 'MathJax动态公式显示，支持复杂数学表达式',
    icon: '📐'
  },
  {
    title: '响应式设计',
    description: '完美支持桌面和移动设备，随时随地学习',
    icon: '📱'
  },
  {
    title: '学习路径',
    description: '渐进式公式学习体验，从基础到高级',
    icon: '🛤️'
  },
  {
    title: '关系图谱',
    description: '可视化公式之间的内在联系和依赖关系',
    icon: '🕸️'
  }
]

const formulaCategories = [
  {
    name: '时空理论',
    description: '时空同一化和螺旋时空的基础概念',
    count: 2,
    color: '#3B82F6',
    icon: '🌌'
  },
  {
    name: '力学基础',
    description: '质量、动量和引力场的定义',
    count: 4,
    color: '#10B981',
    icon: '⚖️'
  },
  {
    name: '统一理论',
    description: '宇宙大统一方程和空间波动',
    count: 2,
    color: '#F59E0B',
    icon: '🌊'
  },
  {
    name: '电磁理论',
    description: '电荷、电场、磁场的统一描述',
    count: 7,
    color: '#EF4444',
    icon: '⚡'
  },
  {
    name: '应用理论',
    description: '能量方程和飞行器动力学',
    count: 2,
    color: '#8B5CF6',
    icon: '🚀'
  }
]
</script>

<style scoped>
.about-view {
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

.content-container {
  @apply max-w-6xl mx-auto px-4 space-y-16;
}

.section {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl;
}

.section-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-6;
}

.section-content p {
  @apply text-gray-700 dark:text-gray-300 leading-relaxed mb-4;
}

.tech-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.tech-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center;
}

.tech-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-3;
}

.tech-name {
  @apply font-semibold text-gray-900 dark:text-white mb-2;
}

.tech-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.feature-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-6;
}

.feature-icon {
  @apply text-3xl mb-4;
}

.feature-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.feature-description {
  @apply text-gray-600 dark:text-gray-400 leading-relaxed;
}

.categories-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.category-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2;
}

.category-header {
  @apply flex items-center gap-3 mb-3;
}

.category-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white;
}

.category-name {
  @apply font-semibold text-gray-900 dark:text-white;
}

.category-count {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.category-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.team-info {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.info-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-6;
}

.info-card h3 {
  @apply font-semibold text-gray-900 dark:text-white mb-4;
}

.info-card p {
  @apply text-gray-600 dark:text-gray-400 mb-2;
}
</style>