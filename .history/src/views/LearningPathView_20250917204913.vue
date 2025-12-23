<template>
  <div class="learning-path-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title gradient-text">学习路径</h1>
        <p class="page-description">
          按照科学的顺序学习统一场论，从基础概念到高级应用
        </p>
      </div>
      
      <div class="learning-path">
        <div 
          v-for="(stage, index) in learningStages" 
          :key="stage.id"
          class="learning-stage"
        >
          <div class="stage-header">
            <div class="stage-number">{{ index + 1 }}</div>
            <div class="stage-info">
              <h2 class="stage-title">{{ stage.title }}</h2>
              <p class="stage-description">{{ stage.description }}</p>
            </div>
            <div class="stage-progress">
              <n-progress 
                type="circle" 
                :percentage="getStageProgress(stage.id)"
                :stroke-width="8"
                :show-indicator="false"
              />
              <span class="progress-text">
                {{ getCompletedCount(stage.id) }}/{{ stage.formulas.length }}
              </span>
            </div>
          </div>
          
          <div class="stage-formulas">
            <div 
              v-for="formula in stage.formulas" 
              :key="formula.id"
              class="formula-item"
              :class="{ completed: isCompleted(formula.id) }"
              @click="navigateToFormula(formula.id)"
            >
              <div class="formula-status">
                <div class="status-indicator" :class="getStatusClass(formula.id)">
                  {{ getStatusIcon(formula.id) }}
                </div>
              </div>
              
              <div class="formula-content">
                <h4 class="formula-name">{{ formula.name }}</h4>
                <p class="formula-desc">{{ formula.description }}</p>
                <div class="formula-equation">
                  <code>{{ formula.equation }}</code>
                </div>
              </div>
              
              <div class="formula-actions">
                <n-button 
                  size="small" 
                  type="primary"
                  @click.stop="navigateToFormula(formula.id)"
                >
                  学习
                </n-button>
              </div>
            </div>
          </div>
          
          <div v-if="index < learningStages.length - 1" class="stage-connector">
            <div class="connector-line"></div>
            <div class="connector-arrow">↓</div>
          </div>
        </div>
      </div>
      
      <div class="learning-stats">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ totalFormulas }}</div>
            <div class="stat-label">总公式数</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-number">{{ completedFormulas }}</div>
            <div class="stat-label">已完成</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-number">{{ Math.round(overallProgress) }}%</div>
            <div class="stat-label">总进度</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-number">{{ currentStage }}</div>
            <div class="stat-label">当前阶段</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormulasStore } from '@/stores/formulas'

const formulasStore = useFormulasStore()
const router = useRouter()

// 学习阶段数据
const learningStages = [
  {
    id: 'foundation',
    title: '基础理论',
    description: '理解时空和质量的基本概念',
    formulas: [
      { id: 'spacetime-unity', name: '时空同一化方程', description: '空间和时间的统一', equation: 'r = ct' },
      { id: 'spiral-spacetime', name: '三维螺旋时空方程', description: '螺旋运动模式', equation: 'r⃗ = R(cos(ωt), sin(ωt), vt)' }
    ]
  },
  {
    id: 'mechanics',
    title: '力学基础',
    description: '掌握动量和引力场理论',
    formulas: [
      { id: 'mass-definition', name: '质量定义方程', description: '质量的本质定义', equation: 'm = ρV' },
      { id: 'gravity-field', name: '引力场定义方程', description: '引力场的数学描述', equation: 'g⃗ = -∇φ' }
    ]
  },
  {
    id: 'unified',
    title: '统一理论',
    description: '理解宇宙的统一方程',
    formulas: [
      { id: 'unified-equation', name: '宇宙大统一方程', description: '描述宇宙基本规律', equation: 'F = ma' }
    ]
  },
  {
    id: 'electromagnetic',
    title: '电磁理论',
    description: '探索电磁场的统一描述',
    formulas: [
      { id: 'charge-definition', name: '电荷定义方程', description: '电荷的基本性质', equation: 'q = ∫ρdV' },
      { id: 'electric-field', name: '电场定义方程', description: '电场的数学表达', equation: 'E⃗ = F⃗/q' }
    ]
  }
]

// 模拟完成状态（实际应用中应该从本地存储或服务器获取）
const completedFormulas = ref(new Set<string>())

// 计算属性
const totalFormulas = computed(() => {
  return learningStages.reduce((total, stage) => total + stage.formulas.length, 0)
})

const completedCount = computed(() => completedFormulas.value.size)

const overallProgress = computed(() => {
  return totalFormulas.value > 0 ? (completedCount.value / totalFormulas.value) * 100 : 0
})

const currentStage = computed(() => {
  for (let i = 0; i < learningStages.length; i++) {
    const stage = learningStages[i]
    const stageCompleted = stage.formulas.every(f => completedFormulas.value.has(f.id))
    if (!stageCompleted) {
      return i + 1
    }
  }
  return learningStages.length
})

// 方法
const getStageProgress = (stageId: string) => {
  const stage = learningStages.find(s => s.id === stageId)
  if (!stage) return 0
  
  const completed = stage.formulas.filter(f => completedFormulas.value.has(f.id)).length
  return (completed / stage.formulas.length) * 100
}

const getCompletedCount = (stageId: string) => {
  const stage = learningStages.find(s => s.id === stageId)
  if (!stage) return 0
  
  return stage.formulas.filter(f => completedFormulas.value.has(f.id)).length
}

const isCompleted = (formulaId: string) => {
  return completedFormulas.value.has(formulaId)
}

const getStatusClass = (formulaId: string) => {
  return isCompleted(formulaId) ? 'completed' : 'pending'
}

const getStatusIcon = (formulaId: string) => {
  return isCompleted(formulaId) ? '✓' : '○'
}

const navigateToFormula = (formulaId: string) => {
  router.push(`/formula/${formulaId}`)
}

// 模拟标记完成（实际应用中应该保存到本地存储或服务器）
const markAsCompleted = (formulaId: string) => {
  completedFormulas.value.add(formulaId)
}

onMounted(() => {
  formulasStore.initFormulas()
  
  // 模拟一些已完成的公式
  markAsCompleted('spacetime-unity')
  markAsCompleted('mass-definition')
})
</script>

<style scoped>
.learning-path-view {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.learning-stage {
  margin-bottom: 3rem;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

.stage-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.stage-info {
  flex: 1;
}

.stage-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.stage-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.5;
}

.stage-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.stage-formulas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.formula-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--glass-effect);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.formula-item:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.formula-item.completed {
  border-color: var(--color-matter);
  background: rgba(76, 205, 196, 0.1);
}

.formula-status {
  flex-shrink: 0;
}

.status-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.status-indicator.completed {
  background: var(--color-matter);
  color: white;
}

.status-indicator.pending {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.formula-content {
  flex: 1;
}

.formula-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.formula-desc {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.formula-equation {
  font-family: var(--font-mono);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 0.25rem;
  border-left: 3px solid var(--color-primary);
}

.formula-equation code {
  color: var(--color-accent);
  font-size: 0.9rem;
}

.formula-actions {
  flex-shrink: 0;
}

.stage-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
}

.connector-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, var(--color-primary), transparent);
}

.connector-arrow {
  font-size: 2rem;
  color: var(--color-primary);
  margin-top: -10px;
}

.learning-stats {
  margin-top: 3rem;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stage-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stage-formulas {
    grid-template-columns: 1fr;
  }
  
  .formula-item {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-card {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>