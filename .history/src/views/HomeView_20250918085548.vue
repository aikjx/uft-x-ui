<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="stars"></div>
        <div class="cosmic-waves"></div>
      </div>
      
      <div class="container hero-content">
        <div class="hero-text fade-in">
          <h1 class="hero-title gradient-text">
            张祥前统一场论
          </h1>
          <h2 class="hero-subtitle">
            核心公式可视化项目
          </h2>
          <p class="hero-description">
            探索宇宙的统一理论，通过先进的3D可视化技术，
            深入理解时空、引力、电磁场的本质联系
          </p>
          
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ totalFormulas }}</div>
              <div class="stat-label">核心公式</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ categories.length }}</div>
              <div class="stat-label">理论分类</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">3D</div>
              <div class="stat-label">可视化</div>
            </div>
          </div>
          
          <div class="hero-actions">
            <button 
              @click="$router.push('/formulas')"
              class="cta-button hover-scale"
            >
              <span class="button-icon">🚀</span>
              开始探索
            </button>
            <button 
              @click="$router.push('/learning-path')"
              class="secondary-button hover-scale"
            >
              <span class="button-icon">📚</span>
              学习路径
            </button>
          </div>
        </div>
        
        <div class="hero-visual slide-up">
          <div class="formula-preview">
            <div class="math-formula" ref="heroFormulaRef">
              $$\vec{r}(t) = \vec{C}t = x\vec{i} + y\vec{j} + z\vec{k}$$
            </div>
            <p class="formula-caption">时空同一化方程</p>
            <div class="formula-animation">
              <div class="particle" v-for="i in 12" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 特色功能 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title animate-fade-in-up">项目特色</h2>
        
        <div class="features-grid">
          <div 
            v-for="(feature, index) in features" 
            :key="feature.title"
            class="feature-card glass-effect animate-fade-in-up hover-scale"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <div class="feature-icon" :style="{ background: feature.gradient }">
              {{ feature.icon }}
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <div class="feature-stats">
              <span class="feature-stat">{{ feature.stat }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 公式分类 -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title animate-fade-in-up">公式分类</h2>
        <p class="section-subtitle animate-fade-in-up" style="animation-delay: 0.2s">
          按理论体系分类，系统性学习统一场论
        </p>
        
        <div class="categories-grid">
          <div 
            v-for="(category, index) in categoriesWithStats" 
            :key="category.name"
            class="category-card animate-fade-in-up hover-scale"
            :style="{ 
              animationDelay: `${index * 0.15}s`,
              borderColor: category.color 
            }"
            @click="navigateToCategory(category.name)"
          >
            <div class="category-header">
              <div class="category-icon" :style="{ background: `linear-gradient(135deg, ${category.color}, ${category.color}80)` }">
                {{ getCategoryIcon(category.name) }}
              </div>
              <div class="category-count" :style="{ color: category.color }">
                {{ category.count }} 个公式
              </div>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-description">{{ getCategoryDescription(category.name) }}</p>
            <div class="category-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: `${(category.count / totalFormulas) * 100}%`,
                    backgroundColor: category.color 
                  }"
                ></div>
              </div>
              <span class="progress-text">{{ Math.round((category.count / totalFormulas) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 学习路径 -->
    <section class="learning-section">
      <div class="container">
        <h2 class="section-title">推荐学习路径</h2>
        
        <div class="learning-path">
          <div class="path-step" v-for="(step, index) in learningSteps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
              <div class="step-formulas">
                <n-tag 
                  v-for="formula in step.formulas" 
                  :key="formula"
                  size="small"
                  type="info"
                >
                  {{ formula }}
                </n-tag>
              </div>
            </div>
            <div v-if="index < learningSteps.length - 1" class="step-arrow">→</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { formulas, categories } from '../data/formulas'

const router = useRouter()
const heroFormulaRef = ref<HTMLElement>()

// 响应式检测
const isMobile = ref(false)

// 数据统计
const totalFormulas = computed(() => formulas.length)
const categoriesWithStats = computed(() => categories)

// 特色功能数据
const features = [
  {
    icon: '🌌',
    title: '实时3D渲染',
    description: '基于WebGL 2.0的高性能3D场景，提供沉浸式的物理现象可视化体验',
    stat: 'WebGL 2.0',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: '🎛️',
    title: '交互式控制',
    description: '实时调节公式参数，观察物理量变化对系统行为的影响',
    stat: '实时交互',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: '📊',
    title: '数学公式同步',
    description: 'MathJax动态渲染，公式与可视化完美同步显示',
    stat: 'MathJax',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: '🔗',
    title: '关系图谱',
    description: '可视化公式间的内在联系，构建完整的理论体系',
    stat: 'D3.js',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: '📚',
    title: '学习路径',
    description: '循序渐进的学习指导，从基础概念到高级应用',
    stat: '5个阶段',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: '⚡',
    title: '高性能计算',
    description: '优化的算法和数据结构，确保流畅的用户体验',
    stat: '60 FPS',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
]

// 学习步骤
const learningSteps = [
  {
    title: '基础概念',
    description: '理解时空统一和基本定义',
    formulas: ['时空同一化方程', '三维螺旋时空方程', '质量定义方程'],
    color: '#3B82F6',
    progress: 25
  },
  {
    title: '力学基础',
    description: '掌握动量和力的统一概念',
    formulas: ['引力场定义方程', '静止动量方程', '运动动量方程'],
    color: '#10B981',
    progress: 50
  },
  {
    title: '统一理论',
    description: '理解大统一方程和空间波动',
    formulas: ['宇宙大统一方程', '空间波动方程'],
    color: '#F59E0B',
    progress: 75
  },
  {
    title: '电磁与应用',
    description: '掌握电磁场理论和实际应用',
    formulas: ['电磁场方程', '统一场论能量方程', '光速飞行器动力学方程'],
    color: '#EF4444',
    progress: 100
  }
]

// 获取分类图标
const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, string> = {
    '时空理论': '🌌',
    '力学基础': '⚡',
    '统一理论': '🔮',
    '电磁理论': '🧲',
    '应用理论': '🚀'
  }
  return icons[categoryName] || '📐'
}

// 获取分类描述
const getCategoryDescription = (categoryName: string) => {
  const descriptions: Record<string, string> = {
    '时空理论': '探索时间与空间的统一本质，理解宇宙的基本结构',
    '力学基础': '建立统一的力学框架，重新定义质量、动量和引力',
    '统一理论': '构建描述所有物理现象的大统一方程',
    '电磁理论': '揭示电磁场的几何本质和统一场论基础',
    '应用理论': '将理论应用于实际问题，探索未来科技可能'
  }
  return descriptions[categoryName] || '深入理解统一场论的核心概念'
}

// 导航到分类
const navigateToCategory = (categoryName: string) => {
  router.push(`/formulas?category=${encodeURIComponent(categoryName)}`)
}

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 渲染数学公式
const renderMathJax = async () => {
  await nextTick()
  if (heroFormulaRef.value && window.MathJax) {
    try {
      await window.MathJax.typesetPromise([heroFormulaRef.value])
    } catch (error) {
      console.warn('MathJax rendering failed:', error)
    }
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  renderMathJax()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.home-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
}

/* 英雄区域 */
.hero-section {
  @apply relative min-h-screen flex items-center overflow-hidden;
}

.hero-background {
  @apply absolute inset-0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.stars {
  @apply absolute w-full h-full;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s ease-in-out infinite alternate;
}

.cosmic-waves {
  @apply absolute w-full h-full;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: pulse-slow 8s ease-in-out infinite;
}

.hero-content {
  @apply relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.hero-text {
  @apply text-center lg:text-left;
}

.hero-title {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  @apply text-xl md:text-2xl font-light text-white/90 mb-6;
}

.hero-description {
  @apply text-lg text-white/80 mb-8 leading-relaxed max-w-2xl;
}

.hero-stats {
  @apply flex justify-center lg:justify-start gap-8 mb-8;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl md:text-3xl font-bold text-white mb-1;
}

.stat-label {
  @apply text-sm text-white/70;
}

.hero-actions {
  @apply flex flex-col sm:flex-row gap-4 justify-center lg:justify-start;
}

.cta-button, .secondary-button {
  @apply px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3;
}

.cta-button {
  @apply bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl;
}

.secondary-button {
  @apply bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 backdrop-blur-sm;
}

.button-icon {
  @apply text-xl;
}

.hero-visual {
  @apply flex justify-center items-center;
}

.formula-preview {
  @apply relative text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl;
}

.math-formula {
  @apply text-2xl md:text-3xl text-white mb-4;
}

.formula-caption {
  @apply text-white/80 text-lg font-medium;
}

.formula-animation {
  @apply absolute inset-0 pointer-events-none;
}

.particle {
  @apply absolute w-2 h-2 bg-white/30 rounded-full;
  animation: float 3s ease-in-out infinite;
}

.particle:nth-child(1) { top: 10%; left: 10%; }
.particle:nth-child(2) { top: 20%; right: 15%; }
.particle:nth-child(3) { bottom: 30%; left: 20%; }
.particle:nth-child(4) { bottom: 20%; right: 10%; }
.particle:nth-child(5) { top: 50%; left: 5%; }
.particle:nth-child(6) { top: 60%; right: 5%; }
.particle:nth-child(7) { bottom: 50%; left: 50%; }
.particle:nth-child(8) { top: 30%; left: 60%; }
.particle:nth-child(9) { bottom: 60%; right: 40%; }
.particle:nth-child(10) { top: 80%; left: 30%; }
.particle:nth-child(11) { bottom: 10%; right: 60%; }
.particle:nth-child(12) { top: 40%; right: 30%; }

/* 特色功能 */
.features-section {
  @apply py-20 bg-white dark:bg-gray-900;
}

.section-title {
  @apply text-center text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white;
}

.section-subtitle {
  @apply text-center text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.feature-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-300;
  backdrop-filter: blur(10px);
}

.feature-icon {
  @apply w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 mx-auto;
}

.feature-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-4;
}

.feature-description {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed mb-6;
}

.feature-stats {
  @apply mt-4;
}

.feature-stat {
  @apply inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full;
}

/* 公式分类 */
.categories-section {
  padding: 6rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.category-card {
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.category-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.category-count {
  font-size: 0.9rem;
  color: var(--color-accent);
  font-weight: 500;
}

/* 学习路径 */
.learning-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
}

.learning-path {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.step-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.step-formulas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.step-arrow {
  font-size: 2rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* 动画 */
@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.4rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .path-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
}
</style>