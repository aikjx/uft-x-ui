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
  @apply py-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
}

/* 头部样式 */
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
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12;
}

/* 整体进度样式 */
.overall-progress {
  @apply flex flex-col md:flex-row items-center justify-center gap-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto;
}

.progress-circle {
  @apply relative;
}

.progress-ring {
  @apply transform -rotate-90;
}

.progress-ring-background {
  @apply dark:stroke-gray-700;
}

.progress-ring-progress {
  @apply transition-all duration-1000 ease-out;
  stroke-linecap: round;
}

.progress-text {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.progress-percentage {
  @apply text-2xl font-bold text-blue-600 dark:text-blue-400;
}

.progress-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.progress-stats {
  @apply grid grid-cols-3 gap-6;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

/* 路径导航样式 */
.path-navigation {
  @apply max-w-6xl mx-auto px-4 mb-12;
}

.nav-container {
  @apply flex justify-center items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto;
}

.nav-step {
  @apply flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700;
}

.nav-step.active {
  @apply bg-blue-50 dark:bg-blue-900/30;
}

.nav-step.completed {
  @apply bg-green-50 dark:bg-green-900/30;
}

.nav-step-number {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm;
}

.nav-step-title {
  @apply text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap;
}

/* 学习阶段样式 */
.learning-levels {
  @apply max-w-6xl mx-auto px-4 space-y-16;
}

.learning-level {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700;
}

.level-header {
  @apply flex flex-col md:flex-row md:items-center gap-6 mb-8;
}

.level-badge {
  @apply flex items-center gap-4;
}

.level-number {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg;
}

.level-status {
  @apply px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300;
}

.level-status.completed {
  @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200;
}

.level-info {
  @apply flex-1;
}

.level-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.level-description {
  @apply text-gray-600 dark:text-gray-300 mb-4;
}

.level-progress {
  @apply flex items-center gap-3;
}

.progress-bar-small {
  @apply flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill-small {
  @apply h-full transition-all duration-1000 ease-out;
}

.progress-text-small {
  @apply text-sm font-medium text-gray-500 dark:text-gray-400;
}

/* 公式卡片样式 */
.formulas-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8;
}

.formula-card-mini {
  @apply relative bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:shadow-lg;
}

.formula-card-mini.completed {
  @apply border-green-400 bg-green-50 dark:bg-green-900/20;
}

.formula-card-mini.current {
  @apply border-blue-400 bg-blue-50 dark:bg-blue-900/20;
}

.formula-status {
  @apply absolute top-3 right-3;
}

.status-icon {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold;
}

.status-icon.completed {
  @apply bg-green-500 text-white;
}

.status-icon.current {
  @apply bg-blue-500 text-white;
}

.status-icon.pending {
  @apply bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300;
}

.formula-number-mini {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4;
}

.formula-name-mini {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.formula-latex-mini {
  @apply text-sm text-gray-600 dark:text-gray-300 font-mono mb-4 p-2 bg-white dark:bg-gray-800 rounded border overflow-x-auto;
}

.formula-actions {
  @apply flex justify-center;
}

.action-btn-mini {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500;
}

.action-btn-mini.completed {
  @apply bg-green-500 text-white hover:bg-green-600;
}

/* 阶段操作样式 */
.level-actions {
  @apply flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700;
}

.complete-level-btn, .next-level-btn {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2;
}

.complete-level-btn {
  @apply text-white shadow-lg hover:shadow-xl;
}

.next-level-btn {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600;
}

/* 学习统计样式 */
.learning-stats {
  @apply max-w-6xl mx-auto px-4 mt-16;
}

.stats-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white text-center mb-8;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center;
}

.stat-icon {
  @apply text-3xl mb-3;
}

.stat-content {
  @apply space-y-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

/* 操作按钮样式 */
.progress-actions {
  @apply flex flex-wrap justify-center gap-4;
}

.action-btn {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2;
}

.reset-btn {
  @apply bg-gray-500 hover:bg-gray-600 text-white;
}

.export-btn {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.share-btn {
  @apply bg-purple-500 hover:bg-purple-600 text-white;
}

.btn-icon {
  @apply text-lg;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-delayed {
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* 动画关键帧 */
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .overall-progress {
    @apply flex-col;
  }
  
  .progress-stats {
    @apply grid-cols-1 gap-4;
  }
  
  .formulas-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
  
  .stats-grid {
    @apply grid-cols-2;
  }
}

@media (max-width: 768px) {
  .view-title {
    @apply text-3xl;
  }
  
  .level-header {
    @apply flex-col items-start;
  }
  
  .formulas-grid {
    @apply grid-cols-1;
  }
  
  .stats-grid {
    @apply grid-cols-1;
  }
  
  .level-actions {
    @apply flex-col;
  }
  
  .progress-actions {
    @apply flex-col;
  }
  
  .nav-container {
    @apply gap-2 p-4;
  }
  
  .nav-step-title {
    @apply hidden;
  }
}

@media (max-width: 640px) {
  .learning-level {
    @apply p-6;
  }
  
  .formula-card-mini {
    @apply p-4;
  }
  
  .overall-progress {
    @apply p-6;
  }
  
  .stat-card {
    @apply p-4;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .progress-ring-progress {
    @apply stroke-blue-400;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-in-delayed,
  .animate-slide-up,
  .animate-fade-in-up,
  .hover-scale,
  .progress-ring-progress,
  .progress-fill-small {
    animation: none;
    transition: none;
  }
}

/* 自定义滚动条 */
.nav-container::-webkit-scrollbar {
  height: 6px;
}

.nav-container::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700 rounded;
}

.nav-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-500 rounded hover:bg-gray-400 dark:hover:bg-gray-400;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .formula-card-mini {
    @apply border-4;
  }
  
  .nav-step {
    @apply border-2 border-gray-400;
  }
}
</style>