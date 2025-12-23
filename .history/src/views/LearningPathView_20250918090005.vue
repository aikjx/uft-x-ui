<template>
  <div class="learning-path-view">
    <!-- 头部区域 -->
    <div class="view-header animate-fade-in">
      <h1 class="view-title">学习路径</h1>
      <p class="view-subtitle">循序渐进地掌握张祥前统一场论的核心概念</p>
      
      <!-- 整体进度概览 -->
      <div class="overall-progress">
        <div class="progress-circle">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-background"
              stroke="#e5e7eb"
              stroke-width="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring-progress"
              stroke="#3b82f6"
              stroke-width="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
          <div class="progress-text">
            <span class="progress-percentage">{{ Math.round(overallProgress) }}%</span>
            <span class="progress-label">完成度</span>
          </div>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-number">{{ completedFormulas }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalFormulas }}</div>
            <div class="stat-label">总公式</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ completedLevels }}</div>
            <div class="stat-label">完成阶段</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习路径导航 -->
    <div class="path-navigation animate-fade-in-delayed">
      <div class="nav-container">
        <div
          v-for="(level, index) in learningLevels"
          :key="level.title"
          class="nav-step"
          :class="{ 
            active: currentLevel === index,
            completed: level.completed 
          }"
          @click="scrollToLevel(index)"
        >
          <div class="nav-step-number" :style="{ backgroundColor: level.color }">
            <span v-if="level.completed">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="nav-step-title">{{ level.title }}</div>
        </div>
      </div>
    </div>

    <!-- 学习阶段 -->
    <div class="learning-levels">
      <div
        v-for="(level, index) in learningLevels"
        :key="level.title"
        :ref="el => levelRefs[index] = el"
        class="learning-level animate-slide-up"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <div class="level-header">
          <div class="level-badge">
            <div class="level-number" :style="{ backgroundColor: level.color }">
              <span v-if="level.completed">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="level-status" :class="{ completed: level.completed }">
              {{ level.completed ? '已完成' : '进行中' }}
            </div>
          </div>
          <div class="level-info">
            <h2 class="level-title">{{ level.title }}</h2>
            <p class="level-description">{{ level.description }}</p>
            <div class="level-progress">
              <div class="progress-bar-small">
                <div 
                  class="progress-fill-small" 
                  :style="{ 
                    width: `${level.progress}%`,
                    backgroundColor: level.color 
                  }"
                ></div>
              </div>
              <span class="progress-text-small">{{ level.progress }}% 完成</span>
            </div>
          </div>
        </div>

        <div class="formulas-grid">
          <div
            v-for="formula in level.formulas"
            :key="formula.id"
            class="formula-card-mini hover-scale animate-fade-in-up"
            :class="{ 
              completed: completedFormulaIds.includes(formula.id),
              current: currentFormula?.id === formula.id 
            }"
            :style="{ 
              borderColor: formula.color,
              animationDelay: `${index * 0.2 + 0.1}s`
            }"
            @click="selectFormula(formula)"
          >
            <div class="formula-status">
              <span v-if="completedFormulaIds.includes(formula.id)" class="status-icon completed">✓</span>
              <span v-else-if="currentFormula?.id === formula.id" class="status-icon current">📖</span>
              <span v-else class="status-icon pending">○</span>
            </div>
            <div class="formula-number-mini" :style="{ backgroundColor: formula.color }">
              {{ formula.id }}
            </div>
            <h3 class="formula-name-mini">{{ formula.name }}</h3>
            <div class="formula-latex-mini" :ref="el => mathRefs[formula.id] = el">
              $${{ formula.latex.length > 50 ? formula.latex.substring(0, 50) + '...' : formula.latex }}$$
            </div>
            <div class="formula-actions">
              <button
                @click.stop="toggleFormulaCompletion(formula.id)"
                class="action-btn-mini"
                :class="{ completed: completedFormulaIds.includes(formula.id) }"
              >
                {{ completedFormulaIds.includes(formula.id) ? '已掌握' : '标记完成' }}
              </button>
            </div>
          </div>
        </div>

        <div class="level-actions">
          <button
            v-if="!level.completed"
            @click="completeLevel(index)"
            class="complete-level-btn hover-scale"
            :style="{ backgroundColor: level.color }"
          >
            完成本阶段
          </button>
          <button
            v-if="index < learningLevels.length - 1"
            @click="scrollToLevel(index + 1)"
            class="next-level-btn hover-scale"
          >
            下一阶段 →
          </button>
        </div>
      </div>
    </div>

    <!-- 学习统计 -->
    <div class="learning-stats animate-slide-up" style="animation-delay: 1s">
      <h2 class="stats-title">学习统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">{{ studyTime }}</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ completedFormulas }}/{{ totalFormulas }}</div>
            <div class="stat-label">完成公式</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">{{ masteryLevel }}</div>
            <div class="stat-label">掌握程度</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-value">{{ achievements }}</div>
            <div class="stat-label">获得成就</div>
          </div>
        </div>
      </div>
      
      <div class="progress-actions">
        <button
          @click="resetProgress"
          class="action-btn reset-btn hover-scale"
        >
          <span class="btn-icon">🔄</span>
          重置进度
        </button>
        <button
          @click="exportProgress"
          class="action-btn export-btn hover-scale"
        >
          <span class="btn-icon">📊</span>
          导出报告
        </button>
        <button
          @click="shareProgress"
          class="action-btn share-btn hover-scale"
        >
          <span class="btn-icon">📤</span>
          分享进度
        </button>
      </div>
    </div>

    <!-- 公式详情弹窗 -->
    <Teleport to="body">
      <FormulaDetail
        v-if="selectedFormula"
        :formula="selectedFormula"
        @close="selectedFormula = null"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import FormulaDetail from '../components/FormulaDetail.vue'
import { formulas, type Formula } from '../data/formulas'

// 响应式状态
const selectedFormula = ref<Formula | null>(null)
const currentFormula = ref<Formula | null>(null)
const completedFormulaIds = ref<number[]>([])
const currentLevel = ref(0)
const studyStartTime = ref(Date.now())

// DOM 引用
const levelRefs = ref<HTMLElement[]>([])
const mathRefs = ref<Record<number, HTMLElement>>({})

// 学习阶段数据
const learningLevels = ref([
  {
    title: '基础概念',
    description: '理解时空统一和基本定义',
    color: '#3B82F6',
    formulas: formulas.filter(f => [1, 2, 3].includes(f.id)),
    completed: false,
    progress: 0
  },
  {
    title: '力学基础',
    description: '掌握动量和力的统一概念',
    color: '#10B981',
    formulas: formulas.filter(f => [4, 5, 6].includes(f.id)),
    completed: false,
    progress: 0
  },
  {
    title: '统一理论',
    description: '理解大统一方程和空间波动',
    color: '#8B5CF6',
    formulas: formulas.filter(f => [7, 8].includes(f.id)),
    completed: false,
    progress: 0
  },
  {
    title: '电磁理论',
    description: '掌握电磁场的几何本质',
    color: '#F59E0B',
    formulas: formulas.filter(f => [9, 10, 11, 12, 13].includes(f.id)),
    completed: false,
    progress: 0
  },
  {
    title: '高级应用',
    description: '理解场的相互作用和应用',
    color: '#EF4444',
    formulas: formulas.filter(f => [14, 15, 16, 17].includes(f.id)),
    completed: false,
    progress: 0
  }
])

// 计算属性
const totalFormulas = computed(() => formulas.length)
const completedFormulas = computed(() => completedFormulaIds.value.length)
const overallProgress = computed(() => (completedFormulas.value / totalFormulas.value) * 100)

const completedLevels = computed(() => {
  return learningLevels.value.filter(level => level.completed).length
})

const studyTime = computed(() => {
  const minutes = Math.floor((Date.now() - studyStartTime.value) / 60000)
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
})

const masteryLevel = computed(() => {
  const progress = overallProgress.value
  if (progress >= 90) return '专家'
  if (progress >= 70) return '熟练'
  if (progress >= 50) return '中级'
  if (progress >= 30) return '初级'
  return '入门'
})

const achievements = computed(() => {
  let count = 0
  if (completedFormulas.value >= 5) count++
  if (completedFormulas.value >= 10) count++
  if (completedFormulas.value >= 15) count++
  if (completedLevels.value >= 3) count++
  if (overallProgress.value >= 100) count++
  return count
})

// 进度环相关计算
const circumference = computed(() => 2 * Math.PI * 52)
const progressOffset = computed(() => {
  return circumference.value - (overallProgress.value / 100) * circumference.value
})

// 方法
const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
  currentFormula.value = formula
}

const toggleFormulaCompletion = (formulaId: number) => {
  const index = completedFormulaIds.value.indexOf(formulaId)
  if (index > -1) {
    completedFormulaIds.value.splice(index, 1)
  } else {
    completedFormulaIds.value.push(formulaId)
  }
  updateLevelProgress()
}

const updateLevelProgress = () => {
  learningLevels.value.forEach(level => {
    const completedInLevel = level.formulas.filter(f => 
      completedFormulaIds.value.includes(f.id)
    ).length
    level.progress = Math.round((completedInLevel / level.formulas.length) * 100)
    level.completed = level.progress === 100
  })
}

const completeLevel = (levelIndex: number) => {
  const level = learningLevels.value[levelIndex]
  level.formulas.forEach(formula => {
    if (!completedFormulaIds.value.includes(formula.id)) {
      completedFormulaIds.value.push(formula.id)
    }
  })
  updateLevelProgress()
}

const scrollToLevel = (levelIndex: number) => {
  currentLevel.value = levelIndex
  const element = levelRefs.value[levelIndex]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const resetProgress = () => {
  completedFormulaIds.value = []
  currentFormula.value = null
  currentLevel.value = 0
  studyStartTime.value = Date.now()
  updateLevelProgress()
}

const exportProgress = () => {
  const progressData = {
    completedFormulas: completedFormulas.value,
    totalFormulas: totalFormulas.value,
    overallProgress: overallProgress.value,
    completedLevels: completedLevels.value,
    studyTime: studyTime.value,
    masteryLevel: masteryLevel.value,
    achievements: achievements.value,
    completedFormulaIds: completedFormulaIds.value,
    timestamp: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(progressData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `学习进度报告_${new Date().toLocaleDateString()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const shareProgress = () => {
  const shareText = `我在张祥前统一场论学习平台上已完成 ${completedFormulas.value}/${totalFormulas.value} 个公式，达到 ${masteryLevel.value} 水平！`
  
  if (navigator.share) {
    navigator.share({
      title: '学习进度分享',
      text: shareText,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(shareText).then(() => {
      alert('进度信息已复制到剪贴板！')
    })
  }
}

// 渲染数学公式
const renderMathJax = async () => {
  await nextTick()
  if (window.MathJax) {
    try {
      const elements = Object.values(mathRefs.value).filter(Boolean)
      if (elements.length > 0) {
        await window.MathJax.typesetPromise(elements)
      }
    } catch (error) {
      console.warn('MathJax rendering failed:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  updateLevelProgress()
  renderMathJax()
  
  // 监听滚动以更新当前阶段
  const handleScroll = () => {
    const scrollTop = window.pageYOffset
    const windowHeight = window.innerHeight
    
    for (let i = 0; i < levelRefs.value.length; i++) {
      const element = levelRefs.value[i]
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
          currentLevel.value = i
          break
        }
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.learning-path-view {
  @apply py-8;
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

.learning-levels {
  @apply max-w-6xl mx-auto px-4 space-y-12;
}

.learning-level {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg;
}

.level-header {
  @apply flex items-center mb-6;
}

.level-number {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-6;
}

.level-info {
  @apply flex-1;
}

.level-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.level-description {
  @apply text-gray-600 dark:text-gray-300;
}

.formulas-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.formula-card-mini {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 
         cursor-pointer transition-all duration-300;
}

.formula-number-mini {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3;
}

.formula-name-mini {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-2;
}

.formula-latex-mini {
  @apply text-sm text-gray-600 dark:text-gray-300 font-mono;
}

.progress-section {
  @apply max-w-4xl mx-auto px-4 mt-16 text-center;
}

.progress-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-6;
}

.progress-bar {
  @apply w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000;
}

.progress-text {
  @apply text-lg text-gray-600 dark:text-gray-300 mb-6;
}

.progress-actions {
  @apply flex justify-center space-x-4;
}

.action-btn {
  @apply px-6 py-2 rounded-lg font-medium transition-all duration-300;
}

.reset-btn {
  @apply bg-gray-500 hover:bg-gray-600 text-white;
}

.complete-btn {
  @apply bg-green-500 hover:bg-green-600 text-white;
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

.animate-progress {
  animation: progressFill 2s ease-out;
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

@keyframes progressFill {
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0%);
  }
}
</style>