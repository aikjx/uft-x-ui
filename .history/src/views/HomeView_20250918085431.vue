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
import { useFormulasStore } from '@/stores/formulas'

const formulasStore = useFormulasStore()
const router = useRouter()

// 响应式检测
const isMobile = ref(false)

// 分类数据
const categories = computed(() => formulasStore.categories)

// 学习步骤
const learningSteps = [
  {
    title: '基础篇',
    description: '理解时空和质量的基本概念',
    formulas: ['时空同一化', '螺旋时空', '质量定义', '引力场']
  },
  {
    title: '动力学篇',
    description: '掌握动量和统一方程',
    formulas: ['静止动量', '运动动量', '大统一方程']
  },
  {
    title: '场论篇',
    description: '探索电磁场与引力场的统一',
    formulas: ['空间波动', '电磁场方程', '场间相互作用']
  },
  {
    title: '应用篇',
    description: '学习实际应用和高级理论',
    formulas: ['能量方程', '飞行器动力学', '统一方程']
  }
]

// 获取分类下的公式数量
const getFormulaCount = (categoryId: string) => {
  return formulasStore.getFormulasByCategory(categoryId).length
}

// 导航到分类
const navigateToCategory = (categoryId: string) => {
  router.push(`/formulas?category=${categoryId}`)
}

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  formulasStore.initFormulas()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* 英雄区域 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
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
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: pulse-slow 8s ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.8rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.cta-button {
  padding: 0 2rem;
  height: 48px;
  font-size: 1.1rem;
}

.secondary-button {
  padding: 0 2rem;
  height: 48px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.formula-preview {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.formula-caption {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* 特色功能 */
.features-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--color-primary);
}

.feature-card {
  text-align: center;
  padding: 2rem;
  height: 100%;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
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