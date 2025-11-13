<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="container">
        <div class="logo">
          <span class="logo-text">UFT-X</span>
          <span class="logo-subtitle">统一场论可视化</span>
        </div>
        <nav class="nav-links">
          <router-link to="/" class="nav-link active">首页</router-link>
          <router-link to="/formula-visualization" class="nav-link">公式可视化</router-link>
          <router-link to="/interactive-exploration" class="nav-link">交互式探索</router-link>
          <router-link to="/knowledge" class="nav-link">知识库</router-link>
        </nav>
        <button class="theme-toggle" @click="toggleTheme">
          {{ isDark ? '🌙' : '☀️' }}
        </button>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="container">
        <motion.div 
          class="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 class="hero-title">
            探索宇宙的统一奥秘
            <span class="highlight">统一场论可视化</span>
          </h1>
          <p class="hero-description">
            通过先进的3D可视化技术，直观理解引力场与电磁场的统一理论，
            探索时空的本质与宇宙的基本规律。
          </p>
          <div class="hero-cta">
            <router-link to="/interactive-exploration" class="btn primary">
              开始探索
            </router-link>
            <router-link to="/formula-visualization" class="btn secondary">
              查看公式
            </router-link>
          </div>
        </motion.div>
        <motion.div 
          class="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <!-- 这里可以放置一个3D可视化组件 -->
          <div class="visual-placeholder">
            <div class="visual-icon">🔬</div>
            <p>3D场论可视化</p>
          </div>
        </motion.div>
      </div>
    </section>

    <!-- 特性展示 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">核心特性</h2>
        <div class="features-grid">
          <motion.div 
            class="feature-card"
            v-for="feature in features"
            :key="feature.id"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * feature.id }}
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <div class="container">
        <motion.div 
          class="quick-start-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 class="section-title">快速开始</h2>
          <div class="steps">
            <div class="step" v-for="step in steps" :key="step.id">
              <div class="step-number">{{ step.id }}</div>
              <div class="step-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
                <router-link :to="step.link" v-if="step.link" class="step-link">
                  {{ step.linkText }}
                </router-link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <div class="logo">UFT-X</div>
            <p>统一场论可视化平台</p>
          </div>
          <div class="footer-links">
            <h4>导航</h4>
            <router-link to="/" class="footer-link">首页</router-link>
            <router-link to="/formula-visualization" class="footer-link">公式可视化</router-link>
            <router-link to="/interactive-exploration" class="footer-link">交互式探索</router-link>
            <router-link to="/knowledge" class="footer-link">知识库</router-link>
          </div>
          <div class="footer-contact">
            <h4>联系我们</h4>
            <p>研究团队：统一场论可视化小组</p>
            <p>版本：v0.0.1</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 UFT-X 统一场论可视化平台. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { useVisualizationStore } from '@/stores/visualization'
import { motion } from 'framer-motion'

// 使用Store
const counterStore = useCounterStore()
const visualizationStore = useVisualizationStore()

// 响应式数据
const isDark = ref(true)

// 特性数据
const features = [
  {
    id: 1,
    icon: '📊',
    title: '实时3D可视化',
    description: '直观展示引力场和电磁场的相互作用，支持多维度观察'
  },
  {
    id: 2,
    icon: '🔍',
    title: '交互式探索',
    description: '通过调整参数，实时观察物理现象的变化，深入理解物理规律'
  },
  {
    id: 3,
    icon: '🧮',
    title: '公式推导',
    description: '详细的公式推导过程，帮助理解统一场论的数学基础'
  },
  {
    id: 4,
    icon: '💻',
    title: '高性能渲染',
    description: '采用先进的WebGL技术，保证复杂模型的流畅渲染'
  }
]

// 步骤数据
const steps = [
  {
    id: 1,
    title: '浏览公式库',
    description: '探索各种统一场论相关的数学公式和物理定律',
    link: '/formula-visualization',
    linkText: '前往公式库'
  },
  {
    id: 2,
    title: '体验交互式模拟',
    description: '通过调整参数，观察不同条件下的场论现象',
    link: '/interactive-exploration',
    linkText: '开始模拟'
  },
  {
    id: 3,
    title: '学习理论知识',
    description: '深入了解统一场论的基本概念和最新研究进展',
    link: '/knowledge',
    linkText: '学习更多'
  }
]

// 方法
function toggleTheme() {
  isDark.value = !isDark.value
  visualizationStore.updateConfig({
    theme: isDark.value ? 'dark' : 'light'
  })
  // 这里可以添加主题切换的具体逻辑
}

// 生命周期
onMounted(() => {
  // 初始化数据
  counterStore.increment()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.navbar {
  background-color: #1a1a1a;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4DBA87;
}

.logo-subtitle {
  font-size: 0.8rem;
  color: #999;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #fff;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #4DBA87;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4DBA87;
}

.theme-toggle {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #fff;
}

/* 英雄区域 */
.hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 6rem 0;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}

.hero-content {
  max-width: 50%;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #4DBA87;
}

.hero-description {
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-block;
}

.btn.primary {
  background-color: #4DBA87;
  color: #000;
}

.btn.primary:hover {
  background-color: #43b77d;
  transform: translateY(-2px);
}

.btn.secondary {
  background-color: transparent;
  color: #4DBA87;
  border: 1px solid #4DBA87;
}

.btn.secondary:hover {
  background-color: #4DBA87;
  color: #000;
}

.hero-visual {
  max-width: 50%;
}

.visual-placeholder {
  width: 100%;
  height: 300px;
  background-color: rgba(77, 186, 135, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(77, 186, 135, 0.3);
}

.visual-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* 特性展示 */
.features {
  padding: 6rem 0;
  background-color: #0f0f0f;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #1a1a1a;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid #2d2d2d;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-color: #4DBA87;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1rem;
}

.feature-description {
  color: #ccc;
  line-height: 1.6;
}

/* 快速开始 */
.quick-start {
  padding: 6rem 0;
  background-color: #121212;
}

.steps {
  max-width: 800px;
  margin: 0 auto;
}

.step {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: flex-start;
}

.step-number {
  width: 50px;
  height: 50px;
  background-color: #4DBA87;
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  color: #4DBA87;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #ccc;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.step-link {
  color: #4DBA87;
  text-decoration: underline;
}

.step-link:hover {
  color: #43b77d;
}

/* 页脚 */
.footer {
  background-color: #0a0a0a;
  padding: 4rem 0 2rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-info .logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4DBA87;
  margin-bottom: 1rem;
}

.footer-info p {
  color: #999;
}

.footer-links h4,
.footer-contact h4 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-link {
  display: block;
  color: #999;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #4DBA87;
}

.footer-contact p {
  color: #999;
  margin-bottom: 0.5rem;
}

.footer-bottom {
  border-top: 1px solid #2d2d2d;
  padding-top: 2rem;
  text-align: center;
}

.footer-bottom p {
  color: #999;
  font-size: 0.9rem;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero .container {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-content,
  .hero-visual {
    max-width: 100%;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
}
</style>