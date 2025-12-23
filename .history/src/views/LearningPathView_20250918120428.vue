<template>
  <div class="learning-path-view">
    <!-- 头部介绍 -->
    <section class="intro-section">
      <div class="intro-content">
        <h1 class="page-title">学习路径</h1>
        <p class="page-description">
          系统化的学习计划，从基础概念到高级理论，循序渐进地掌握张祥前统一场论的核心思想
        </p>
        <div class="progress-overview">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${overallProgress}%` }"
            ></div>
          </div>
          <div class="progress-text">
            总体进度: {{ overallProgress }}% ({{ completedLessons }}/{{ totalLessons }})
          </div>
        </div>
      </div>
    </section>

    <!-- 学习路径 -->
    <section class="path-section">
      <div class="path-container">
        <div
          v-for="(chapter, index) in learningPath"
          :key="chapter.id"
          class="chapter-card"
          :class="{ 
            completed: chapter.completed,
            current: chapter.current,
            locked: chapter.locked
          }"
        >
          <!-- 连接线 -->
          <div v-if="index < learningPath.length - 1" class="connection-line"></div>
          
          <!-- 章节内容 -->
          <div class="chapter-header">
            <div class="chapter-number">{{ index + 1 }}</div>
            <div class="chapter-status">
              <span v-if="chapter.completed" class="status-icon completed">✓</span>
              <span v-else-if="chapter.current" class="status-icon current">▶</span>
              <span v-else-if="chapter.locked" class="status-icon locked">🔒</span>
              <span v-else class="status-icon available">○</span>
            </div>
          </div>
          
          <div class="chapter-content">
            <h3 class="chapter-title">{{ chapter.title }}</h3>
            <p class="chapter-description">{{ chapter.description }}</p>
            
            <div class="chapter-meta">
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span class="meta-text">{{ chapter.duration }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📚</span>
                <span class="meta-text">{{ chapter.lessons.length }} 课时</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⭐</span>
                <span class="meta-text">{{ chapter.difficulty }}</span>
              </div>
            </div>
            
            <!-- 课程列表 -->
            <div class="lessons-list" v-if="chapter.expanded">
              <div
                v-for="lesson in chapter.lessons"
                :key="lesson.id"
                class="lesson-item"
                :class="{ completed: lesson.completed, current: lesson.current }"
                @click="selectLesson(lesson)"
              >
                <div class="lesson-status">
                  <span v-if="lesson.completed" class="lesson-icon completed">✓</span>
                  <span v-else-if="lesson.current" class="lesson-icon current">▶</span>
                  <span v-else class="lesson-icon">○</span>
                </div>
                <div class="lesson-content">
                  <div class="lesson-title">{{ lesson.title }}</div>
                  <div class="lesson-duration">{{ lesson.duration }}</div>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="chapter-actions">
              <button
                v-if="!chapter.locked"
                class="btn btn-primary"
                @click="startChapter(chapter)"
                :disabled="chapter.completed"
              >
                {{ chapter.completed ? '已完成' : chapter.current ? '继续学习' : '开始学习' }}
              </button>
              <button
                class="btn btn-secondary"
                @click="toggleChapter(chapter)"
              >
                {{ chapter.expanded ? '收起' : '展开' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 成就系统 -->
    <section class="achievements-section">
      <h2 class="section-title">学习成就</h2>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h4 class="achievement-title">{{ achievement.title }}</h4>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="!achievement.unlocked">
              <div class="progress-bar small">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${achievement.progress}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ achievement.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 学习统计 -->
    <section class="stats-section">
      <h2 class="section-title">学习统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <div class="stat-number">{{ completedLessons }}</div>
            <div class="stat-label">已完成课时</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalStudyTime }}</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-number">{{ unlockedAchievements }}</div>
            <div class="stat-label">获得成就</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-number">{{ studyStreak }}</div>
            <div class="stat-label">连续学习天数</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 学习路径数据
const learningPath = ref([
  {
    id: 1,
    title: '基础概念入门',
    description: '了解统一场论的基本概念和历史背景',
    duration: '2小时',
    difficulty: '入门',
    completed: true,
    current: false,
    locked: false,
    expanded: false,
    lessons: [
      { id: 1, title: '什么是统一场论', duration: '30分钟', completed: true, current: false },
      { id: 2, title: '历史发展脉络', duration: '45分钟', completed: true, current: false },
      { id: 3, title: '基本假设和原理', duration: '45分钟', completed: true, current: false }
    ]
  },
  {
    id: 2,
    title: '时空几何基础',
    description: '掌握时空的几何性质和基本数学工具',
    duration: '3小时',
    difficulty: '初级',
    completed: true,
    current: false,
    locked: false,
    expanded: false,
    lessons: [
      { id: 4, title: '时空的几何性质', duration: '60分钟', completed: true, current: false },
      { id: 5, title: '坐标变换', duration: '60分钟', completed: true, current: false },
      { id: 6, title: '度规张量', duration: '60分钟', completed: true, current: false }
    ]
  },
  {
    id: 3,
    title: '电磁场统一',
    description: '理解电磁场在统一场论中的地位和作用',
    duration: '4小时',
    difficulty: '中级',
    completed: false,
    current: true,
    locked: false,
    expanded: true,
    lessons: [
      { id: 7, title: '电磁场方程', duration: '90分钟', completed: true, current: false },
      { id: 8, title: '场的统一描述', duration: '90分钟', completed: false, current: true },
      { id: 9, title: '对称性原理', duration: '60分钟', completed: false, current: false }
    ]
  },
  {
    id: 4,
    title: '引力场理论',
    description: '深入理解引力场的本质和几何化描述',
    duration: '5小时',
    difficulty: '中级',
    completed: false,
    current: false,
    locked: false,
    expanded: false,
    lessons: [
      { id: 10, title: '爱因斯坦场方程', duration: '120分钟', completed: false, current: false },
      { id: 11, title: '时空弯曲', duration: '90分钟', completed: false, current: false },
      { id: 12, title: '引力波', duration: '90分钟', completed: false, current: false }
    ]
  },
  {
    id: 5,
    title: '量子场论基础',
    description: '掌握量子场论的基本概念和方法',
    duration: '6小时',
    difficulty: '高级',
    completed: false,
    current: false,
    locked: true,
    expanded: false,
    lessons: [
      { id: 13, title: '场的量子化', duration: '120分钟', completed: false, current: false },
      { id: 14, title: '费曼图技术', duration: '120分钟', completed: false, current: false },
      { id: 15, title: '重整化理论', duration: '120分钟', completed: false, current: false }
    ]
  },
  {
    id: 6,
    title: '统一场方程',
    description: '学习张祥前统一场论的核心方程',
    duration: '8小时',
    difficulty: '高级',
    completed: false,
    current: false,
    locked: true,
    expanded: false,
    lessons: [
      { id: 16, title: '统一场方程推导', duration: '180分钟', completed: false, current: false },
      { id: 17, title: '解的性质分析', duration: '150分钟', completed: false, current: false },
      { id: 18, title: '物理意义解释', duration: '150分钟', completed: false, current: false }
    ]
  }
])

// 成就数据
const achievements = ref([
  {
    id: 1,
    title: '初学者',
    description: '完成第一个章节的学习',
    icon: '🌱',
    unlocked: true,
    progress: 100
  },
  {
    id: 2,
    title: '时空探索者',
    description: '掌握时空几何基础知识',
    icon: '🌌',
    unlocked: true,
    progress: 100
  },
  {
    id: 3,
    title: '电磁大师',
    description: '完成电磁场统一章节',
    icon: '⚡',
    unlocked: false,
    progress: 67
  },
  {
    id: 4,
    title: '引力专家',
    description: '理解引力场理论',
    icon: '🌍',
    unlocked: false,
    progress: 0
  },
  {
    id: 5,
    title: '量子先锋',
    description: '掌握量子场论基础',
    icon: '⚛️',
    unlocked: false,
    progress: 0
  },
  {
    id: 6,
    title: '统一理论家',
    description: '完成所有章节学习',
    icon: '🏆',
    unlocked: false,
    progress: 0
  }
])

// 计算属性
const totalLessons = computed(() => {
  return learningPath.value.reduce((total, chapter) => total + chapter.lessons.length, 0)
})

const completedLessons = computed(() => {
  return learningPath.value.reduce((total, chapter) => {
    return total + chapter.lessons.filter(lesson => lesson.completed).length
  }, 0)
})

const overallProgress = computed(() => {
  return Math.round((completedLessons.value / totalLessons.value) * 100)
})

const unlockedAchievements = computed(() => {
  return achievements.value.filter(achievement => achievement.unlocked).length
})

const totalStudyTime = computed(() => '24小时')
const studyStreak = computed(() => 7)

// 方法
const startChapter = (chapter: any) => {
  if (!chapter.locked) {
    chapter.current = true
    // 这里可以添加导航到具体课程的逻辑
    console.log('开始学习章节:', chapter.title)
  }
}

const toggleChapter = (chapter: any) => {
  chapter.expanded = !chapter.expanded
}

const selectLesson = (lesson: any) => {
  // 这里可以添加选择具体课程的逻辑
  console.log('选择课程:', lesson.title)
}
</script>

<style scoped>
.learning-path-view {
  min-height: 100vh;
  background: #f8fafc;
}

/* 介绍区域 */
.intro-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
}

.intro-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.progress-overview {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 1rem;
  font-weight: bold;
}

/* 学习路径 */
.path-section {
  padding: 4rem 2rem;
}

.path-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.chapter-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.chapter-card.completed {
  border-left: 4px solid #48bb78;
}

.chapter-card.current {
  border-left: 4px solid #667eea;
  box-shadow: 0 8px 12px rgba(102, 126, 234, 0.2);
}

.chapter-card.locked {
  opacity: 0.6;
  border-left: 4px solid #cbd5e0;
}

.connection-line {
  position: absolute;
  left: 50%;
  bottom: -2rem;
  width: 2px;
  height: 2rem;
  background: #e2e8f0;
  transform: translateX(-50%);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chapter-number {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-icon.completed {
  background: #48bb78;
  color: white;
}

.status-icon.current {
  background: #667eea;
  color: white;
}

.status-icon.locked {
  background: #cbd5e0;
  color: #718096;
}

.status-icon.available {
  background: #e2e8f0;
  color: #718096;
}

.chapter-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.chapter-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.meta-icon {
  font-size: 1rem;
}

/* 课程列表 */
.lessons-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.lesson-item:hover {
  background: #e2e8f0;
}

.lesson-item.completed {
  background: #f0fff4;
}

.lesson-item.current {
  background: #ebf4ff;
}

.lesson-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.lesson-icon.completed {
  background: #48bb78;
  color: white;
}

.lesson-icon.current {
  background: #667eea;
  color: white;
}

.lesson-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lesson-title {
  font-weight: 500;
  color: #2d3748;
}

.lesson-duration {
  color: #718096;
  font-size: 0.875rem;
}

/* 按钮 */
.chapter-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-primary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

/* 成就系统 */
.achievements-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  text-align: center;
  margin-bottom: 2rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.3s;
}

.achievement-card.unlocked {
  border-left: 4px solid #ffd700;
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.2);
}

.achievement-card:not(.unlocked) {
  opacity: 0.6;
}

.achievement-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.achievement-description {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar.small {
  height: 4px;
  flex: 1;
}

/* 学习统计 */
.stats-section {
  padding: 4rem 2rem;
  background: white;
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .intro-section {
    padding: 2rem 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .path-section {
    padding: 2rem 1rem;
  }
  
  .chapter-card {
    padding: 1.5rem;
  }
  
  .chapter-actions {
    flex-direction: column;
  }
  
  .achievements-section,
  .stats-section {
    padding: 2rem 1rem;
  }
  
  .achievements-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>