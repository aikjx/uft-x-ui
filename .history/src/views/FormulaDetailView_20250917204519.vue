<template>
  <div class="formula-detail-view">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large">
          <template #description>
            正在加载公式详情...
          </template>
        </n-spin>
      </div>
      
      <!-- 公式详情 -->
      <div v-else-if="formula" class="formula-detail">
        <!-- 头部信息 -->
        <div class="formula-header">
          <div class="breadcrumb">
            <router-link to="/formulas">公式列表</router-link>
            <span class="separator">></span>
            <span class="current">{{ formula.name }}</span>
          </div>
          
          <div class="formula-meta">
            <div class="category-badge">
              {{ getCategoryName(formula.categoryId) }}
            </div>
            <n-tag :type="getDifficultyType(formula.difficulty)" size="medium">
              {{ getDifficultyLabel(formula.difficulty) }}
            </n-tag>
          </div>
        </div>
        
        <!-- 主要内容 -->
        <div class="formula-content">
          <div class="content-left">
            <!-- 公式标题和描述 -->
            <div class="formula-info">
              <h1 class="formula-title">{{ formula.name }}</h1>
              <p class="formula-description">{{ formula.description }}</p>
              
              <!-- 公式方程 -->
              <div class="formula-equation">
                <div class="math-formula">
                  {{ formula.equation }}
                </div>
              </div>
            </div>
            
            <!-- 3D可视化区域 -->
            <div class="visualization-container">
              <div class="visualization-header">
                <h3>3D可视化</h3>
                <div class="visualization-controls">
                  <n-button-group>
                    <n-button 
                      :type="isPlaying ? 'primary' : 'default'"
                      @click="toggleAnimation"
                    >
                      {{ isPlaying ? '暂停' : '播放' }}
                    </n-button>
                    <n-button @click="resetView">重置视角</n-button>
                  </n-button-group>
                </div>
              </div>
              
              <div class="scene-container" ref="sceneContainer">
                <!-- Three.js场景将在这里渲染 -->
                <div class="scene-placeholder">
                  <div class="placeholder-content">
                    <div class="placeholder-icon">🌌</div>
                    <p>3D可视化场景</p>
                    <small>{{ formula.name }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧控制面板 -->
          <div class="content-right">
            <div class="control-panel">
              <h3>参数控制</h3>
              
              <div class="parameter-controls">
                <div 
                  v-for="param in formula.parameters" 
                  :key="param.name"
                  class="parameter-group"
                >
                  <label class="parameter-label">
                    {{ param.name }} ({{ param.symbol }})
                  </label>
                  <p class="parameter-description">{{ param.description }}</p>
                  
                  <div class="parameter-input">
                    <n-slider
                      v-if="param.type === 'slider'"
                      v-model:value="parameterValues[param.symbol]"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step"
                      :tooltip="false"
                    />
                    <n-input-number
                      v-else
                      v-model:value="parameterValues[param.symbol]"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step"
                      size="small"
                    />
                  </div>
                  
                  <div class="parameter-value">
                    当前值: {{ parameterValues[param.symbol] }}
                    <span v-if="param.unit" class="unit">{{ param.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 理论背景 -->
            <div class="theory-panel">
              <h3>理论背景</h3>
              <div class="theory-content">
                <div class="theory-section">
                  <h4>背景介绍</h4>
                  <p>{{ formula.theory.background }}</p>
                </div>
                
                <div class="theory-section">
                  <h4>重要意义</h4>
                  <p>{{ formula.theory.significance }}</p>
                </div>
                
                <div class="theory-section">
                  <h4>应用领域</h4>
                  <ul class="applications-list">
                    <li v-for="app in formula.theory.applications" :key="app">
                      {{ app }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 示例和参考资料 -->
        <div class="formula-extras">
          <div class="examples-section">
            <h3>应用示例</h3>
            <div class="examples-grid">
              <div 
                v-for="example in formula.examples" 
                :key="example.title"
                class="example-card"
              >
                <h4>{{ example.title }}</h4>
                <p>{{ example.description }}</p>
                <div class="example-result">
                  <strong>预期结果:</strong> {{ example.expectedResult }}
                </div>
                <p class="example-explanation">{{ example.explanation }}</p>
              </div>
            </div>
          </div>
          
          <div class="references-section">
            <h3>参考资料</h3>
            <div class="references-list">
              <div 
                v-for="ref in formula.references" 
                :key="ref.title"
                class="reference-item"
              >
                <div class="reference-title">{{ ref.title }}</div>
                <div class="reference-author">{{ ref.author }} ({{ ref.year }})</div>
                <div class="reference-type">{{ getRefTypeLabel(ref.type) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <n-button 
            v-if="previousFormula"
            @click="navigateToFormula(previousFormula.id)"
            class="nav-button"
          >
            ← {{ previousFormula.name }}
          </n-button>
          
          <n-button 
            v-if="nextFormula"
            @click="navigateToFormula(nextFormula.id)"
            class="nav-button"
            type="primary"
          >
            {{ nextFormula.name }} →
          </n-button>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else class="error-state">
        <div class="error-content">
          <div class="error-icon">❌</div>
          <h3>公式未找到</h3>
          <p>您访问的公式不存在或已被删除</p>
          <n-button @click="$router.push('/formulas')">
            返回公式列表
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormulasStore } from '@/stores/formulas'
import type { Formula } from '@/types/formula'

const route = useRoute()
const router = useRouter()
const formulasStore = useFormulasStore()

// 响应式数据
const loading = ref(true)
const isPlaying = ref(false)
const sceneContainer = ref<HTMLElement>()
const parameterValues = ref<Record<string, number>>({})

// 计算属性
const formula = computed(() => {
  const id = route.params.id as string
  return formulasStore.getFormulaById(id)
})

const previousFormula = computed(() => {
  if (!formula.value) return null
  return formulasStore.getPreviousFormula(formula.value.id)
})

const nextFormula = computed(() => {
  if (!formula.value) return null
  return formulasStore.getNextFormula(formula.value.id)
})

// 方法
const getCategoryName = (categoryId: string) => {
  const category = formulasStore.categories.find(cat => cat.id === categoryId)
  return category?.name || '未知分类'
}

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, any> = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'error'
  }
  return types[difficulty] || 'default'
}

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return labels[difficulty] || difficulty
}

const getRefTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'paper': '论文',
    'book': '书籍',
    'website': '网站',
    'video': '视频'
  }
  return labels[type] || type
}

const toggleAnimation = () => {
  isPlaying.value = !isPlaying.value
  // TODO: 控制Three.js动画
}

const resetView = () => {
  // TODO: 重置Three.js相机视角
}

const navigateToFormula = (formulaId: string) => {
  router.push(`/formula/${formulaId}`)
}

// 初始化参数值
const initParameterValues = () => {
  if (formula.value) {
    formula.value.parameters.forEach(param => {
      parameterValues.value[param.symbol] = param.defaultValue
    })
  }
}

// 生命周期
onMounted(async () => {
  await formulasStore.initFormulas()
  
  if (formula.value) {
    initParameterValues()
    // TODO: 初始化Three.js场景
  }
  
  loading.value = false
})

// 监听参数变化
watch(parameterValues, () => {
  // TODO: 更新Three.js场景参数
}, { deep: true })
</script>

<style scoped>
.formula-detail-view {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

.breadcrumb {
  color: rgba(255, 255, 255, 0.8);
}

.breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
}

.separator {
  margin: 0 0.5rem;
}

.formula-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-primary);
  color: white;
  border-radius: 1rem;
  font-size: 0.9rem;
}

.formula-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.formula-info {
  margin-bottom: 2rem;
}

.formula-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.formula-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.formula-equation {
  text-align: center;
  margin: 2rem 0;
}

.visualization-container {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.visualization-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.scene-container {
  height: 400px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.scene-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.control-panel,
.theory-panel {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.control-panel h3,
.theory-panel h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.parameter-group {
  margin-bottom: 1.5rem;
}

.parameter-label {
  display: block;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.parameter-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
}

.parameter-input {
  margin-bottom: 0.5rem;
}

.parameter-value {
  font-size: 0.9rem;
  color: var(--color-primary);
}

.unit {
  color: rgba(255, 255, 255, 0.6);
  margin-left: 0.25rem;
}

.theory-section {
  margin-bottom: 1.5rem;
}

.theory-section h4 {
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.applications-list {
  list-style: none;
  padding: 0;
}

.applications-list li {
  padding: 0.25rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.applications-list li::before {
  content: "→";
  color: var(--color-primary);
  margin-right: 0.5rem;
}

.formula-extras {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.examples-section,
.references-section {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
}

.examples-section h3,
.references-section h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.example-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.example-card h4 {
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.example-result {
  background: rgba(59, 130, 246, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin: 0.5rem 0;
  border-left: 3px solid var(--color-primary);
}

.reference-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.reference-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.reference-author {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.reference-type {
  color: var(--color-primary);
  font-size: 0.8rem;
  text-transform: uppercase;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-button {
  flex: 1;
  max-width: 300px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .formula-content {
    grid-template-columns: 1fr;
  }
  
  .formula-extras {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .formula-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .formula-title {
    font-size: 2rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
  }
}
</style>