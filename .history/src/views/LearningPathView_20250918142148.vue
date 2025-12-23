<template>
  <div class="exploration-view">
    <!-- 星际探索航线图头部 -->
    <div class="header-section">
      <div class="header-background">
        <div class="star-field">
          <div class="star" v-for="n in 50" :key="n" :style="getStarStyle()"></div>
        </div>
        <div class="nebula-effects">
          <div class="nebula n1"></div>
          <div class="nebula n2"></div>
          <div class="nebula n3"></div>
        </div>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🚀</span>
          星际探索航线图
        </h1>
        <p class="page-subtitle">
          穿越时空维度 · 探索人工场奥秘 · 开启光速虚拟时代的星际之旅
        </p>
        
        <!-- 探索进度仪表盘 -->
        <div class="progress-dashboard">
          <div class="dashboard-item">
            <div class="progress-ring">
              <svg class="ring-svg" width="120" height="120">
                <circle cx="60" cy="60" r="50" class="ring-background"/>
                <circle cx="60" cy="60" r="50" class="ring-progress" 
                        :stroke-dasharray="circumference"
                        :stroke-dashoffset="circumference - (explorationProgress / 100) * circumference"/>
              </svg>
              <div class="ring-content">
                <div class="progress-value">{{ explorationProgress }}%</div>
                <div class="progress-label">探索进度</div>
              </div>
            </div>
          </div>
          
          <div class="dashboard-stats">
            <div class="stat-item">
              <div class="stat-icon">🌌</div>
              <div class="stat-info">
                <div class="stat-value">{{ completedMissions }}</div>
                <div class="stat-label">已完成任务</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-value">{{ unlockedAchievements }}</div>
                <div class="stat-label">解锁成就</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🛸</div>
              <div class="stat-info">
                <div class="stat-value">{{ explorationTime }}</div>
                <div class="stat-label">探索时长</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 航线选择面板 -->
    <div class="route-selection">
      <div class="selection-container">
        <h2 class="section-title">
          <span class="title-icon">🗺️</span>
          选择探索航线
        </h2>
        <div class="route-tabs">
          <button
            v-for="route in explorationRoutes"
            :key="route.id"
            :class="['route-tab', { active: selectedRoute === route.id }]"
            @click="selectRoute(route.id)"
          >
            <div class="tab-background"></div>
            <div class="tab-content">
              <div class="tab-icon">{{ route.icon }}</div>
              <div class="tab-info">
                <div class="tab-name">{{ route.name }}</div>
                <div class="tab-description">{{ route.description }}</div>
              </div>
              <div class="tab-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: route.progress + '%' }"></div>
                </div>
                <div class="progress-text">{{ route.progress }}%</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 探索任务地图 -->
    <div class="mission-map">
      <div class="map-container">
        <div class="map-background">
          <div class="grid-lines">
            <div class="grid-line horizontal" v-for="n in 10" :key="'h' + n" :style="{ top: n * 10 + '%' }"></div>
            <div class="grid-line vertical" v-for="n in 10" :key="'v' + n" :style="{ left: n * 10 + '%' }"></div>
          </div>
          <div class="energy-flows">
            <div class="energy-flow f1"></div>
            <div class="energy-flow f2"></div>
            <div class="energy-flow f3"></div>
          </div>
        </div>
        
        <div class="mission-nodes">
          <div
            v-for="(mission, index) in currentRouteMissions"
            :key="mission.id"
            :class="['mission-node', mission.status, `level-${mission.level}`]"
            :style="getMissionPosition(index)"
            @click="selectMission(mission)"
          >
            <div class="node-background"></div>
            <div class="node-content">
              <div class="node-icon">{{ mission.icon }}</div>
              <div class="node-info">
                <div class="node-title">{{ mission.title }}</div>
                <div class="node-level">等级 {{ mission.level }}</div>
              </div>
              <div class="node-status">
                <div v-if="mission.status === 'completed'" class="status-icon completed">✓</div>
                <div v-else-if="mission.status === 'available'" class="status-icon available">▶</div>
                <div v-else class="status-icon locked">🔒</div>
              </div>
            </div>
            
            <!-- 连接线 -->
            <div v-if="index < currentRouteMissions.length - 1" class="connection-line">
              <div class="line-glow"></div>
            </div>
            
            <!-- 节点光效 -->
            <div class="node-effects">
              <div class="pulse-ring"></div>
              <div class="energy-particles">
                <div class="particle p1"></div>
                <div class="particle p2"></div>
                <div class="particle p3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情面板 -->
    <div v-if="selectedMission" class="mission-details">
      <div class="details-container">
        <div class="details-header">
          <div class="mission-info">
            <div class="mission-icon-large">{{ selectedMission.icon }}</div>
            <div class="mission-meta">
              <h3 class="mission-title">{{ selectedMission.title }}</h3>
              <div class="mission-tags">
                <span class="tag level">等级 {{ selectedMission.level }}</span>
                <span class="tag status" :class="selectedMission.status">{{ getStatusText(selectedMission.status) }}</span>
                <span class="tag difficulty" :class="selectedMission.difficulty">{{ selectedMission.difficulty }}</span>
              </div>
            </div>
          </div>
          <button class="close-details" @click="selectedMission = null">
            <span class="close-icon">×</span>
          </button>
        </div>
        
        <div class="details-content">
          <div class="mission-description">
            <h4 class="content-title">
              <span class="title-icon">📋</span>
              任务描述
            </h4>
            <p class="description-text">{{ selectedMission.description }}</p>
          </div>
          
          <div class="mission-objectives">
            <h4 class="content-title">
              <span class="title-icon">🎯</span>
              探索目标
            </h4>
            <div class="objectives-list">
              <div
                v-for="(objective, index) in selectedMission.objectives"
                :key="index"
                :class="['objective-item', { completed: objective.completed }]"
              >
                <div class="objective-status">
                  <div v-if="objective.completed" class="status-check">✓</div>
                  <div v-else class="status-pending">○</div>
                </div>
                <div class="objective-text">{{ objective.text }}</div>
              </div>
            </div>
          </div>
          
          <div class="mission-rewards">
            <h4 class="content-title">
              <span class="title-icon">🏆</span>
              探索奖励
            </h4>
            <div class="rewards-grid">
              <div
                v-for="reward in selectedMission.rewards"
                :key="reward.type"
                class="reward-item"
              >
                <div class="reward-icon">{{ reward.icon }}</div>
                <div class="reward-info">
                  <div class="reward-name">{{ reward.name }}</div>
                  <div class="reward-value">{{ reward.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-actions">
          <button
            v-if="selectedMission.status === 'available'"
            class="action-btn primary"
            @click="startMission(selectedMission)"
          >
            <span class="btn-icon">🚀</span>
            <span class="btn-text">开始探索</span>
          </button>
          <button
            v-else-if="selectedMission.status === 'completed'"
            class="action-btn secondary"
            @click="reviewMission(selectedMission)"
          >
            <span class="btn-icon">📊</span>
            <span class="btn-text">回顾探索</span>
          </button>
          <button
            v-else
            class="action-btn disabled"
            disabled
          >
            <span class="btn-icon">🔒</span>
            <span class="btn-text">尚未解锁</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 成就展示 -->
    <div class="achievements-section">
      <div class="achievements-container">
        <h2 class="section-title">
          <span class="title-icon">🏆</span>
          探索成就
        </h2>
        <div class="achievements-grid">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            :class="['achievement-card', { unlocked: achievement.unlocked }]"
            @click="showAchievementDetails(achievement)"
          >
            <div class="achievement-background"></div>
            <div class="achievement-content">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-description">{{ achievement.description }}</div>
              </div>
              <div class="achievement-status">
                <div v-if="achievement.unlocked" class="status-unlocked">已解锁</div>
                <div v-else class="status-locked">未解锁</div>
              </div>
            </div>
            <div class="achievement-glow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const selectedRoute = ref('basic-theory')
const selectedMission = ref(null)
const explorationProgress = ref(65)
const completedMissions = ref(12)
const unlockedAchievements = ref(8)
const explorationTime = ref('156h')
const circumference = ref(2 * Math.PI * 50)

// 探索航线数据
const explorationRoutes = ref([
  {
    id: 'basic-theory',
    name: '基础理论探索',
    description: '掌握人工场的基本原理',
    icon: '⚛️',
    progress: 75
  },
  {
    id: 'electromagnetic',
    name: '电磁场操控',
    description: '学习电磁场的时空操控技术',
    icon: '⚡',
    progress: 60
  },
  {
    id: 'quantum-mechanics',
    name: '量子维度跳跃',
    description: '探索量子世界的奥秘',
    icon: '🌀',
    progress: 45
  },
  {
    id: 'relativity',
    name: '相对论时空',
    description: '掌握时空弯曲与光速旅行',
    icon: '🌌',
    progress: 30
  }
])

// 任务数据
const missions = ref({
  'basic-theory': [
    {
      id: 1,
      title: '人工场基础认知',
      icon: '🔬',
      level: 1,
      status: 'completed',
      difficulty: 'beginner',
      description: '了解人工场的基本概念和理论基础，为后续探索奠定基础。',
      objectives: [
        { text: '理解人工场的定义', completed: true },
        { text: '掌握基本数学工具', completed: true },
        { text: '完成基础测试', completed: true }
      ],
      rewards: [
        { type: 'knowledge', icon: '📚', name: '基础知识', value: '+100' },
        { type: 'experience', icon: '⭐', name: '探索经验', value: '+50' }
      ]
    },
    {
      id: 2,
      title: '时空结构分析',
      icon: '🌐',
      level: 2,
      status: 'completed',
      difficulty: 'intermediate',
      description: '深入分析时空的基本结构，理解维度的概念。',
      objectives: [
        { text: '学习时空几何', completed: true },
        { text: '理解维度理论', completed: true },
        { text: '完成实践练习', completed: false }
      ],
      rewards: [
        { type: 'knowledge', icon: '📚', name: '时空知识', value: '+150' },
        { type: 'skill', icon: '🛠️', name: '分析技能', value: '+1' }
      ]
    },
    {
      id: 3,
      title: '场方程推导',
      icon: '📐',
      level: 3,
      status: 'available',
      difficulty: 'advanced',
      description: '学习推导人工场的基本方程，掌握数学推理过程。',
      objectives: [
        { text: '掌握微分几何', completed: false },
        { text: '推导场方程', completed: false },
        { text: '验证解的正确性', completed: false }
      ],
      rewards: [
        { type: 'knowledge', icon: '📚', name: '高级理论', value: '+200' },
        { type: 'achievement', icon: '🏆', name: '理论大师', value: '1' }
      ]
    },
    {
      id: 4,
      title: '实验验证',
      icon: '🧪',
      level: 4,
      status: 'locked',
      difficulty: 'expert',
      description: '通过虚拟实验验证理论预测，体验科学发现的过程。',
      objectives: [
        { text: '设计实验方案', completed: false },
        { text: '进行虚拟实验', completed: false },
        { text: '分析实验结果', completed: false }
      ],
      rewards: [
        { type: 'knowledge', icon: '📚', name: '实验技能', value: '+250' },
        { type: 'tool', icon: '🔧', name: '实验工具', value: '1' }
      ]
    }
  ]
})

// 成就数据
const achievements = ref([
  {
    id: 1,
    name: '初级探索者',
    description: '完成第一个探索任务',
    icon: '🌟',
    unlocked: true
  },
  {
    id: 2,
    name: '理论学者',
    description: '掌握基础理论知识',
    icon: '📚',
    unlocked: true
  },
  {
    id: 3,
    name: '时空导航员',
    description: '完成时空结构分析',
    icon: '🧭',
    unlocked: true
  },
  {
    id: 4,
    name: '方程大师',
    description: '成功推导场方程',
    icon: '📐',
    unlocked: false
  },
  {
    id: 5,
    name: '实验专家',
    description: '完成所有实验验证',
    icon: '🧪',
    unlocked: false
  },
  {
    id: 6,
    name: '星际探索者',
    description: '解锁所有探索航线',
    icon: '🚀',
    unlocked: false
  }
])

// 计算属性
const currentRouteMissions = computed(() => {
  return missions.value[selectedRoute.value] || []
})

// 方法
const selectRoute = (routeId: string) => {
  selectedRoute.value = routeId
  selectedMission.value = null
}

const selectMission = (mission: any) => {
  selectedMission.value = mission
}

const getMissionPosition = (index: number) => {
  const positions = [
    { top: '20%', left: '10%' },
    { top: '40%', left: '30%' },
    { top: '25%', left: '60%' },
    { top: '60%', left: '80%' }
  ]
  return positions[index] || { top: '50%', left: '50%' }
}

const getStarStyle = () => {
  return {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 3 + 's',
    animationDuration: (Math.random() * 2 + 1) + 's'
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    available: '可探索',
    locked: '未解锁'
  }
  return statusMap[status] || status
}

const startMission = (mission: any) => {
  console.log('开始任务:', mission.title)
  // 这里可以添加开始任务的逻辑
}

const reviewMission = (mission: any) => {
  console.log('回顾任务:', mission.title)
  // 这里可以添加回顾任务的逻辑
}

const showAchievementDetails = (achievement: any) => {
  console.log('查看成就:', achievement.name)
  // 这里可以添加显示成就详情的逻辑
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
})
</script>

<style scoped>
.exploration-view {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
}

/* 头部区域 */
.header-section {
  position: relative;
  padding: 4rem 2rem 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.nebula-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: nebulaFloat 15s ease-in-out infinite;
}

.n1 {
  top: 20%;
  left: 10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.1), transparent);
  animation-delay: 0s;
}

.n2 {
  top: 60%;
  right: 20%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(100, 255, 218, 0.1), transparent);
  animation-delay: 5s;
}

.n3 {
  bottom: 30%;
  left: 60%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.05), transparent);
  animation-delay: 10s;
}

@keyframes nebulaFloat {
  0%, 100% { transform: translateX(0) translateY(0) scale(1); }
  33% { transform: translateX(20px) translateY(-10px) scale(1.1); }
  66% { transform: translateX(-15px) translateY(15px) scale(0.9); }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00f5ff, #64ffda, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px #00f5ff);
}

.page-subtitle {
  font-size: 1.25rem;
  color: #b0bec5;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.progress-dashboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring-svg {
  transform: rotate(-90deg);
}

.ring-background {
  fill: none;
  stroke: rgba(100, 255, 218, 0.2);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: url(#progressGradient);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f5ff;
}

.progress-label {
  font-size: 0.875rem;
  color: #64ffda;
}

.dashboard-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f5ff;
}

.stat-label {
  font-size: 0.875rem;
  color: #64ffda;
}

/* 航线选择 */
.route-selection {
  padding: 2rem;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.selection-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.route-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.route-tab {
  position: relative;
  background: transparent;
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.route-tab:hover,
.route-tab.active {
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
}

.route-tab.active .tab-background {
  opacity: 1;
}

.tab-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(100, 255, 218, 0.1));
  opacity: 0;
  transition: opacity 0.3s;
}

.tab-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tab-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.tab-info {
  flex: 1;
}

.tab-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.tab-description {
  font-size: 0.875rem;
  color: #b0bec5;
}

.tab-progress {
  width: 80px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f5ff, #64ffda);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  color: #64ffda;
  font-weight: bold;
}

/* 任务地图 */
.mission-map {
  padding: 2rem;
  min-height: 600px;
}

.map-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.grid-line {
  position: absolute;
  background: #64ffda;
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
}

.energy-flows {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.energy-flow {
  position: absolute;
  width: 2px;
  background: linear-gradient(45deg, transparent, #00f5ff, transparent);
  animation: energyFlow 4s linear infinite;
}

.f1 {
  top: 20%;
  left: 10%;
  height: 200px;
  animation-delay: 0s;
}

.f2 {
  top: 40%;
  right: 20%;
  height: 150px;
  animation-delay: 1s;
}

.f3 {
  bottom: 30%;
  left: 60%;
  height: 180px;
  animation-delay: 2s;
}

@keyframes energyFlow {
  0% { opacity: 0; transform: translateY(-20px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(20px); }
}

.mission-nodes {
  position: relative;
  width: 100%;
  height: 100%;
}

.mission-node {
  position: absolute;
  width: 200px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.mission-node:hover {
  transform: scale(1.05);
  border-color: rgba(100, 255, 218, 0.6);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.2);
}

.mission-node.completed {
  border-color: rgba(0, 255, 0, 0.5);
  background: rgba(0, 255, 0, 0.05);
}

.mission-node.available {
  border-color: rgba(0, 245, 255, 0.5);
  background: rgba(0, 245, 255, 0.05);
}

.mission-node.locked {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
  opacity: 0.6;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.node-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.node-info {
  flex: 1;
}

.node-title {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.node-level {
  font-size: 0.75rem;
  color: #64ffda;
}

.node-status {
  width: 30px;
  text-align: center;
}

.status-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-icon.completed {
  background: #00ff00;
  color: #000000;
}

.status-icon.available {
  background: #00f5ff;
  color: #000000;
}

.status-icon.locked {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.connection-line {
  position: absolute;
  top: 50%;
  right: -50px;
  width: 50px;
  height: 2px;
  background: rgba(100, 255, 218, 0.3);
  transform: translateY(-50%);
}

.line-glow {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #64ffda, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.node-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulseRing 3s ease-in-out infinite;
}

@keyframes pulseRing {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.energy-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #64ffda;
  border-radius: 50%;
  animation: particleFloat 3s ease-in-out infinite;
}

.p1 { top: -20px; left: -20px; animation-delay: 0s; }
.p2 { top: -20px; right: -20px; animation-delay: 1s; }
.p3 { bottom: -20px; left: 0; animation-delay: 2s; }

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
}

/* 任务详情 */
.mission-details {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-left: 2px solid rgba(100, 255, 218, 0.3);
  z-index: 1000;
  overflow-y: auto;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.details-container {
  padding: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.mission-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mission-icon-large {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mission-meta {
  flex: 1;
}

.mission-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.mission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.tag.level {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.tag.status.completed {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.tag.status.available {
  background: rgba(0, 245, 255, 0.2);
  color: #00f5ff;
  border: 1px solid rgba(0, 245, 255, 0.3);
}

.tag.status.locked {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tag.difficulty.beginner {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.tag.difficulty.intermediate {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
}

.tag.difficulty.advanced {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.tag.difficulty.expert {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
}

.close-details {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-details:hover {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.close-icon {
  font-size: 1.5rem;
  color: #ffffff;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 1rem;
}

.description-text {
  color: #b0bec5;
  line-height: 1.6;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s;
}

.objective-item.completed {
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.objective-status {
  width: 20px;
  text-align: center;
}

.status-check {
  color: #00ff00;
  font-weight: bold;
}

.status-pending {
  color: #64ffda;
}

.objective-text {
  flex: 1;
  color: #ffffff;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
}

.reward-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 0.875rem;
  color: #64ffda;
  margin-bottom: 0.25rem;
}

.reward-value {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
}

.details-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
}

.action-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.action-btn.primary {
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  color: #0a0a0f;
}

.action-btn.primary:hover {
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: transparent;
  color: #64ffda;
  border: 2px solid rgba(100, 255, 218, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
}

.action-btn.disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

/* 成就展示 */
.achievements-section {
  padding: 2rem;
  background: rgba(26, 26, 46, 0.5);
}

.achievements-container {
  max-width: 1400px;
  margin: 0 auto;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.achievement-card:hover {
  transform: translateY(-2px);
  border-color: rgba(100, 255, 218, 0.4);
}

.achievement-card.unlocked {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.05);
}

.achievement-card.unlocked:hover .achievement-glow {
  opacity: 1;
}

.achievement-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  opacity: 0;
  transition: opacity 0.3s;
}

.achievement-card.unlocked .achievement-background {
  opacity: 1;
}

.achievement-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievement-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.achievement-description {
  font-size: 0.875rem;
  color: #b0bec5;
}

.achievement-status {
  text-align: center;
}

.status-unlocked {
  color: #ffd700;
  font-weight: bold;
  font-size: 0.875rem;
}

.status-locked {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.achievement-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .progress-dashboard {
    flex-direction: column;
    gap: 2rem;
  }
  
  .route-tabs {
    grid-template-columns: 1fr;
  }
  
  .mission-details {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .mission-node {
    width: 150px;
    padding: 0.75rem;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .exploration-view {
    padding: 0;
  }
  
  .header-section {
    padding: 2rem 1rem;
  }
  
  .route-selection {
    padding: 1rem;
  }
  
  .mission-map {
    padding: 1rem;
  }
  
  .map-container {
    height: 400px;
  }
  
  .achievements-section {
    padding: 1rem;
  }
}
</style>