<template>
  <div class="about-view">
    <div class="view-header animate-fade-in">
      <h1 class="view-title">关于 UTF Star</h1>
      <p class="view-subtitle">探索宇宙的统一理论，让科学之美触手可及</p>
    </div>

    <div class="about-content">
      <!-- 项目介绍 -->
      <section class="about-section animate-slide-up">
        <h2 class="section-title">项目简介</h2>
        <div class="section-content">
          <p class="intro-text">
            UTF Star 是一个专门为张祥前统一场论设计的可视化研究平台。
            通过现代化的交互界面和精美的数学公式渲染，让复杂的物理理论变得直观易懂。
          </p>
          <p class="intro-text">
            我们致力于将深奥的统一场论知识以最优雅的方式呈现，
            帮助研究者更好地理解宇宙的统一性和物理定律的内在联系。
          </p>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="about-section animate-slide-up" style="animation-delay: 0.2s">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-grid">
          <div
            v-for="(tech, index) in techStack"
            :key="tech.name"
            class="tech-card hover-scale"
            :style="{ 
              borderColor: tech.color,
              animationDelay: `${index * 0.1}s`
            }"
          >
            <div class="tech-icon" :style="{ color: tech.color }">
              {{ tech.icon }}
            </div>
            <h3 class="tech-name">{{ tech.name }}</h3>
            <p class="tech-description">{{ tech.description }}</p>
          </div>
        </div>
      </section>

      <!-- 核心功能 -->
      <section class="about-section animate-slide-up" style="animation-delay: 0.4s">
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            class="feature-card hover-scale animate-fade-in-up"
            :style="{ animationDelay: `${index * 0.1 + 0.5}s` }"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- 公式分类 -->
      <section class="about-section animate-slide-up" style="animation-delay: 0.6s">
        <h2 class="section-title">公式分类</h2>
        <div class="categories-grid">
          <div
            v-for="(category, index) in formulaCategories"
            :key="category.name"
            class="category-card hover-scale animate-fade-in-up"
            :style="{ 
              borderColor: category.color,
              animationDelay: `${index * 0.1 + 0.7}s`
            }"
          >
            <div class="category-header">
              <div class="category-icon" :style="{ backgroundColor: category.color }">
                {{ category.count }}
              </div>
              <h3 class="category-name">{{ category.name }}</h3>
            </div>
            <p class="category-description">{{ category.description }}</p>
          </div>
        </div>
      </section>

      <!-- 开发团队 -->
      <section class="about-section animate-slide-up" style="animation-delay: 0.8s">
        <h2 class="section-title">开发理念</h2>
        <div class="team-content">
          <p class="team-description">
            我们相信，最复杂的科学理论也应该以最简洁优雅的方式呈现。
            通过精心设计的用户界面和流畅的交互体验，
            让每一个对物理学感兴趣的人都能轻松探索宇宙的奥秘。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const techStack = [
  {
    name: 'Vue 3',
    description: '现代化的前端框架，提供响应式和组合式API',
    icon: '⚡',
    color: '#4FC08D'
  },
  {
    name: 'TypeScript',
    description: '类型安全的JavaScript，提供更好的开发体验',
    icon: '📘',
    color: '#3178C6'
  },
  {
    name: 'MathJax',
    description: '专业的数学公式渲染引擎',
    icon: '∑',
    color: '#FF6B35'
  },
  {
    name: 'Tailwind CSS',
    description: '实用优先的CSS框架，快速构建美观界面',
    icon: '🎨',
    color: '#06B6D4'
  },
  {
    name: 'Vite',
    description: '快速的构建工具，提供极速的开发体验',
    icon: '⚡',
    color: '#646CFF'
  },
  {
    name: 'D3.js',
    description: '强大的数据可视化库，用于关系图谱展示',
    icon: '📊',
    color: '#F68E56'
  }
]

const features = [
  {
    title: '公式可视化',
    description: '17个核心公式的精美展示，支持LaTeX渲染',
    icon: '📐'
  },
  {
    title: '交互式研究',
    description: '点击查看详细解释，理解公式的物理意义',
    icon: '🎯'
  },
  {
    title: '分类筛选',
    description: '按照理论类别筛选公式，系统化研究',
    icon: '🔍'
  },
  {
    title: '关系图谱',
    description: '可视化公式间的内在联系和依赖关系',
    icon: '🕸️'
  },
  {
    title: '探索路径',
    description: '循序渐进的研究建议，从基础到高级',
    icon: '🛤️'
  },
  {
    title: '响应式设计',
    description: '完美适配各种设备，随时随地研究',
    icon: '📱'
  }
]

const formulaCategories = [
  {
    name: '时空理论',
    description: '描述时空统一性和几何结构的基础理论',
    color: '#3B82F6',
    count: 3
  },
  {
    name: '力学基础',
    description: '重新定义质量、动量和力的统一概念',
    color: '#10B981',
    count: 4
  },
  {
    name: '统一理论',
    description: '统一所有基本力的核心理论框架',
    color: '#8B5CF6',
    count: 3
  },
  {
    name: '电磁理论',
    description: '电磁场的几何本质和统一描述',
    color: '#F59E0B',
    count: 4
  },
  {
    name: '应用理论',
    description: '能量方程和未来科技的理论基础',
    color: '#EF4444',
    count: 3
  }
]
</script>

<style scoped>
.about-view {
  @apply py-8;
}

.view-header {
  @apply text-center mb-16 px-4;
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

.about-content {
  @apply max-w-6xl mx-auto px-4;
}

.about-section {
  @apply mb-16;
}

.section-title {
  @apply text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center;
}

.section-content {
  @apply max-w-4xl mx-auto;
}

.intro-text {
  @apply text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4;
}

.tech-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.tech-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 
         text-center transition-all duration-300 shadow-lg;
}

.tech-icon {
  @apply text-4xl mb-4;
}

.tech-name {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-2;
}

.tech-description {
  @apply text-gray-600 dark:text-gray-300 text-sm;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.feature-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 shadow-lg;
}

.feature-icon {
  @apply text-4xl mb-4;
}

.feature-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-3;
}

.feature-description {
  @apply text-gray-600 dark:text-gray-300 text-sm;
}

.categories-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.category-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 
         transition-all duration-300 shadow-lg;
}

.category-header {
  @apply flex items-center mb-4;
}

.category-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4;
}

.category-name {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.category-description {
  @apply text-gray-600 dark:text-gray-300 text-sm;
}

.team-content {
  @apply max-w-4xl mx-auto text-center;
}

.team-description {
  @apply text-lg text-gray-600 dark:text-gray-300 leading-relaxed;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>