<template>
  <div class="exploration-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">交互式统一场论探索</h1>
        <p class="page-description">通过调整参数，实时观察引力场与电磁场的相互作用</p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <main class="container">
      <!-- 控制面板和可视化区域 -->
      <div class="exploration-layout">
        <!-- 左侧控制面板 -->
        <div class="control-panel">
          <div class="panel-section">
            <h2 class="panel-title">参数控制</h2>
            
            <!-- 场类型选择 -->
            <div class="control-group">
              <label class="control-label">场类型</label>
              <div class="field-type-selector">
                <button 
                  v-for="type in fieldTypes" 
                  :key="type.value"
                  :class="['field-type-btn', { active: selectedFieldType === type.value }]"
                  @click="selectFieldType(type.value)"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- 引力场参数 -->
            <div v-if="selectedFieldType === 'gravity' || selectedFieldType === 'unified'" class="control-group">
              <h3 class="sub-panel-title">引力场参数</h3>
              
              <div class="parameter-item">
                <label class="parameter-label">质量 (M)</label>
                <input 
                  type="range" 
                  v-model.number="gravityParams.mass"
                  :min="1" 
                  :max="100" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ gravityParams.mass.toFixed(1) }} M☉</span>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">引力常数比例</label>
                <input 
                  type="range" 
                  v-model.number="gravityParams.gConstantRatio"
                  :min="0.1" 
                  :max="2" 
                  :step="0.1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ gravityParams.gConstantRatio.toFixed(1) }} G</span>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">场强度</label>
                <input 
                  type="range" 
                  v-model.number="gravityParams.fieldStrength"
                  :min="0" 
                  :max="100" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ gravityParams.fieldStrength }}%</span>
              </div>
            </div>

            <!-- 电磁场参数 -->
            <div v-if="selectedFieldType === 'electromagnetic' || selectedFieldType === 'unified'" class="control-group">
              <h3 class="sub-panel-title">电磁场参数</h3>
              
              <div class="parameter-item">
                <label class="parameter-label">电荷量 (Q)</label>
                <input 
                  type="range" 
                  v-model.number="electroParams.charge"
                  :min="-50" 
                  :max="50" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ electroParams.charge.toFixed(1) }} e</span>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">电流强度</label>
                <input 
                  type="range" 
                  v-model.number="electroParams.current"
                  :min="0" 
                  :max="100" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ electroParams.current }} A</span>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">电磁场强度</label>
                <input 
                  type="range" 
                  v-model.number="electroParams.fieldStrength"
                  :min="0" 
                  :max="100" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ electroParams.fieldStrength }}%</span>
              </div>
            </div>

            <!-- 统一场参数 -->
            <div v-if="selectedFieldType === 'unified'" class="control-group">
              <h3 class="sub-panel-title">统一场参数</h3>
              
              <div class="parameter-item">
                <label class="parameter-label">耦合系数</label>
                <input 
                  type="range" 
                  v-model.number="unifiedParams.couplingConstant"
                  :min="0" 
                  :max="1" 
                  :step="0.01"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ unifiedParams.couplingConstant.toFixed(2) }}</span>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">时空曲率</label>
                <input 
                  type="range" 
                  v-model.number="unifiedParams.spacetimeCurvature"
                  :min="0" 
                  :max="100" 
                  :step="1"
                  class="parameter-slider"
                />
                <span class="parameter-value">{{ unifiedParams.spacetimeCurvature }}%</span>
              </div>
            </div>

            <!-- 可视化选项 -->
            <div class="control-group">
              <h3 class="sub-panel-title">可视化选项</h3>
              
              <div class="parameter-item checkbox">
                <input 
                  type="checkbox" 
                  id="showFieldLines" 
                  v-model="visualOptions.showFieldLines"
                />
                <label for="showFieldLines">显示场线</label>
              </div>

              <div class="parameter-item checkbox">
                <input 
                  type="checkbox" 
                  id="showParticles" 
                  v-model="visualOptions.showParticles"
                />
                <label for="showParticles">显示粒子轨迹</label>
              </div>

              <div class="parameter-item checkbox">
                <input 
                  type="checkbox" 
                  id="showGrid" 
                  v-model="visualOptions.showGrid"
                />
                <label for="showGrid">显示参考网格</label>
              </div>

              <div class="parameter-item">
                <label class="parameter-label">渲染质量</label>
                <select v-model="visualOptions.quality" class="parameter-select">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="control-buttons">
              <button class="btn btn-primary" @click="runSimulation">
                {{ isSimulating ? '暂停模拟' : '运行模拟' }}
              </button>
              <button class="btn btn-secondary" @click="resetParameters">
                重置参数
              </button>
              <button class="btn btn-tertiary" @click="saveConfiguration">
                保存配置
              </button>
            </div>
          </div>

          <!-- 性能监控 -->
          <div class="panel-section performance-panel">
            <h2 class="panel-title">性能监控</h2>
            <div class="performance-stats">
              <div class="stat-item">
                <span class="stat-label">FPS:</span>
                <span class="stat-value">{{ performanceStats.fps }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">渲染时间:</span>
                <span class="stat-value">{{ performanceStats.renderTime }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">内存使用:</span>
                <span class="stat-value">{{ performanceStats.memoryUsage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧可视化区域 -->
        <div class="visualization-area">
          <!-- 3D 渲染容器 -->
          <div class="render-container">
            <!-- 这里将由Three.js或其他3D库渲染 -->
            <div class="render-placeholder">
              <div class="loading-spinner"></div>
              <p class="loading-text">正在初始化3D渲染...</p>
              <p class="instruction-text">
                使用鼠标拖动旋转视角，滚轮缩放，右键拖动平移
              </p>
            </div>
          </div>

          <!-- 实时数据显示 -->
          <div class="data-display">
            <div class="data-section">
              <h3 class="data-title">场强分布</h3>
              <div class="field-intensity-chart">
                <!-- 这里将显示场强图表 -->
                <div class="chart-placeholder">场强分布图表</div>
              </div>
            </div>

            <div class="data-section">
              <h3 class="data-title">实时数据</h3>
              <div class="live-data">
                <div class="data-item">
                  <span class="data-label">最大场强:</span>
                  <span class="data-value">{{ maxFieldIntensity.toFixed(2) }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">能量密度:</span>
                  <span class="data-value">{{ energyDensity.toFixed(2) }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">相互作用强度:</span>
                  <span class="data-value">{{ interactionStrength.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 预设配置 -->
          <div class="preset-configs">
            <h3 class="preset-title">快速预设</h3>
            <div class="preset-list">
              <button 
                v-for="preset in presets" 
                :key="preset.id"
                class="preset-btn"
                @click="applyPreset(preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 理论说明 -->
      <div class="theory-section">
        <h2 class="section-title">理论基础</h2>
        <div class="theory-content">
          <p>
            统一场论试图将引力场与电磁场统一为单一的基本场。在这个交互式探索中，
            您可以通过调整各种参数，观察两种场之间的相互作用及其在统一框架下的行为。
          </p>
          <p>
            耦合系数决定了两种场之间的相互影响程度。当耦合系数为0时，两种场完全独立；
            当耦合系数增加时，场之间的相互作用增强，表现出统一场的特性。
          </p>
          <div class="formula-display">
            <MathJax :formula="unifiedFieldFormula" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useVisualizationStore } from '../stores/visualization'
import MathJax from '../components/MathJax.vue'

// 状态管理
const visualizationStore = useVisualizationStore()

// 响应式数据
const selectedFieldType = ref('unified') // gravity, electromagnetic, unified
const isSimulating = ref(false)

// 场类型选项
const fieldTypes = [
  { value: 'gravity', label: '引力场' },
  { value: 'electromagnetic', label: '电磁场' },
  { value: 'unified', label: '统一场' }
]

// 引力场参数
const gravityParams = reactive({
  mass: 50,
  gConstantRatio: 1,
  fieldStrength: 80
})

// 电磁场参数
const electroParams = reactive({
  charge: 0,
  current: 50,
  fieldStrength: 70
})

// 统一场参数
const unifiedParams = reactive({
  couplingConstant: 0.5,
  spacetimeCurvature: 60
})

// 可视化选项
const visualOptions = reactive({
  showFieldLines: true,
  showParticles: true,
  showGrid: true,
  quality: 'medium'
})

// 性能统计
const performanceStats = reactive({
  fps: 0,
  renderTime: 0,
  memoryUsage: '0 MB'
})

// 预设配置
const presets = [
  { id: 'earth-like', name: '类地球环境' },
  { id: 'strong-field', name: '强场环境' },
  { id: 'electro-dominant', name: '电主导' },
  { id: 'gravity-dominant', name: '引力主导' },
  { id: 'max-coupling', name: '最大耦合' }
]

// 统一场公式
const unifiedFieldFormula = '\\mathcal{L} = \\frac{1}{16\\pi G} R - \\frac{1}{4} F_{\\mu\\nu}F^{\\mu\\nu} + \\lambda (F_{\\mu\\nu}F^{\\mu\\nu})^2 + \\alpha R F_{\\mu\\nu}F^{\\mu\\nu}'

// 计算属性
const maxFieldIntensity = computed(() => {
  if (selectedFieldType.value === 'gravity') {
    return gravityParams.fieldStrength * 0.8
  } else if (selectedFieldType.value === 'electromagnetic') {
    return electroParams.fieldStrength * 0.7
  } else {
    return (gravityParams.fieldStrength + electroParams.fieldStrength) * unifiedParams.couplingConstant * 0.5
  }
})

const energyDensity = computed(() => {
  return Math.pow(maxFieldIntensity.value, 2) * 0.1
})

const interactionStrength = computed(() => {
  if (selectedFieldType.value === 'unified') {
    return unifiedParams.couplingConstant * 100
  }
  return 0
})

// 方法
function selectFieldType(type: string) {
  selectedFieldType.value = type
  updateVisualizationConfig()
}

function runSimulation() {
  isSimulating.value = !isSimulating.value
  if (isSimulating.value) {
    startSimulation()
  } else {
    pauseSimulation()
  }
}

function resetParameters() {
  Object.assign(gravityParams, { mass: 50, gConstantRatio: 1, fieldStrength: 80 })
  Object.assign(electroParams, { charge: 0, current: 50, fieldStrength: 70 })
  Object.assign(unifiedParams, { couplingConstant: 0.5, spacetimeCurvature: 60 })
  updateVisualizationConfig()
}

function saveConfiguration() {
  const config = {
    fieldType: selectedFieldType.value,
    gravityParams: { ...gravityParams },
    electroParams: { ...electroParams },
    unifiedParams: { ...unifiedParams },
    visualOptions: { ...visualOptions }
  }
  
  visualizationStore.updateConfig(config)
  alert('配置已保存！')
}

function applyPreset(preset: any) {
  switch (preset.id) {
    case 'earth-like':
      Object.assign(gravityParams, { mass: 1, gConstantRatio: 1, fieldStrength: 50 })
      Object.assign(electroParams, { charge: 0, current: 10, fieldStrength: 20 })
      Object.assign(unifiedParams, { couplingConstant: 0.3, spacetimeCurvature: 30 })
      break
    case 'strong-field':
      Object.assign(gravityParams, { mass: 80, gConstantRatio: 1.5, fieldStrength: 90 })
      Object.assign(electroParams, { charge: 40, current: 80, fieldStrength: 85 })
      Object.assign(unifiedParams, { couplingConstant: 0.7, spacetimeCurvature: 85 })
      break
    case 'electro-dominant':
      Object.assign(gravityParams, { mass: 30, gConstantRatio: 0.8, fieldStrength: 40 })
      Object.assign(electroParams, { charge: 50, current: 100, fieldStrength: 95 })
      Object.assign(unifiedParams, { couplingConstant: 0.4, spacetimeCurvature: 50 })
      break
    case 'gravity-dominant':
      Object.assign(gravityParams, { mass: 100, gConstantRatio: 2, fieldStrength: 95 })
      Object.assign(electroParams, { charge: 10, current: 20, fieldStrength: 30 })
      Object.assign(unifiedParams, { couplingConstant: 0.4, spacetimeCurvature: 90 })
      break
    case 'max-coupling':
      Object.assign(gravityParams, { mass: 70, gConstantRatio: 1.2, fieldStrength: 85 })
      Object.assign(electroParams, { charge: 30, current: 70, fieldStrength: 80 })
      Object.assign(unifiedParams, { couplingConstant: 1, spacetimeCurvature: 100 })
      break
  }
  updateVisualizationConfig()
}

function updateVisualizationConfig() {
  // 更新store中的配置
  visualizationStore.updateConfig({
    fieldType: selectedFieldType.value,
    parameters: {
      gravity: { ...gravityParams },
      electromagnetic: { ...electroParams },
      unified: { ...unifiedParams }
    },
    visualOptions: { ...visualOptions }
  })
}

function startSimulation() {
  // 模拟开始逻辑
  console.log('Starting simulation with params:', {
    gravityParams,
    electroParams,
    unifiedParams
  })
  
  // 这里应该初始化3D渲染
  // 为了演示，我们只更新性能统计
  updatePerformanceStats()
}

function pauseSimulation() {
  console.log('Pausing simulation')
  // 暂停模拟逻辑
}

function updatePerformanceStats() {
  // 模拟性能数据更新
  performanceStats.fps = Math.floor(Math.random() * 20) + 40
  performanceStats.renderTime = Math.random() * 20 + 5
  performanceStats.memoryUsage = `${(Math.random() * 200 + 100).toFixed(1)} MB`
}

// 生命周期钩子
let statsInterval: number | null = null

onMounted(() => {
  // 初始化时更新配置
  updateVisualizationConfig()
  
  // 定期更新性能统计
  statsInterval = window.setInterval(updatePerformanceStats, 1000)
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }
  if (isSimulating.value) {
    pauseSimulation()
  }
})
</script>

<style scoped>
.exploration-page {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #fff;
  padding-bottom: 3rem;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
  padding: 3rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(77, 186, 135, 0.2);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #4DBA87, #2A9D8F);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-description {
  font-size: 1.1rem;
  color: #999;
  max-width: 800px;
}

/* 主内容布局 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.exploration-layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 控制面板 */
.control-panel {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #2d2d2d;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 2rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #2d2d2d;
}

.sub-panel-title {
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 1rem;
}

.control-group {
  margin-bottom: 1.5rem;
}

/* 场类型选择器 */
.field-type-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-type-btn {
  padding: 0.75rem 1rem;
  background-color: #2d2d2d;
  color: #999;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.field-type-btn:hover {
  background-color: #3d3d3d;
  color: #fff;
}

.field-type-btn.active {
  background-color: #4DBA87;
  color: #000;
  border-color: #4DBA87;
}

/* 参数控制 */
.parameter-item {
  margin-bottom: 1.25rem;
}

.parameter-label {
  display: block;
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.parameter-slider {
  width: 100%;
  height: 4px;
  background-color: #2d2d2d;
  border-radius: 2px;
  outline: none;
  margin-bottom: 0.5rem;
  appearance: none;
}

.parameter-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background-color: #4DBA87;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.parameter-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background-color: #43b77d;
}

.parameter-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background-color: #4DBA87;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.parameter-value {
  display: inline-block;
  color: #4DBA87;
  font-weight: 500;
  font-size: 0.9rem;
}

/* 复选框 */
.parameter-item.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.parameter-item.checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4DBA87;
}

.parameter-item.checkbox label {
  margin: 0;
  cursor: pointer;
}

/* 下拉选择框 */
.parameter-select {
  width: 100%;
  padding: 0.5rem;
  background-color: #2d2d2d;
  color: #fff;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 0.95rem;
}

.parameter-select:focus {
  outline: none;
  border-color: #4DBA87;
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: #4DBA87;
  color: #000;
}

.btn-primary:hover {
  background-color: #43b77d;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #2d2d2d;
  color: #fff;
  border: 1px solid #3d3d3d;
}

.btn-secondary:hover {
  background-color: #3d3d3d;
}

.btn-tertiary {
  background-color: transparent;
  color: #4DBA87;
  border: 1px solid #4DBA87;
}

.btn-tertiary:hover {
  background-color: rgba(77, 186, 135, 0.1);
}

/* 性能监控面板 */
.performance-panel {
  background-color: #151515;
  border: 1px solid #252525;
  padding: 1rem;
  border-radius: 6px;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
}

.stat-value {
  color: #4DBA87;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

/* 可视化区域 */
.visualization-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.render-container {
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #2d2d2d;
  min-height: 600px;
  position: relative;
  overflow: hidden;
}

.render-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #2d2d2d;
  border-top-color: #4DBA87;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.instruction-text {
  font-size: 0.9rem;
  color: #444;
  text-align: center;
  max-width: 300px;
}

/* 数据显示 */
.data-display {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.data-section {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #2d2d2d;
}

.data-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1rem;
}

.field-intensity-chart {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #151515;
  border-radius: 4px;
  border: 1px solid #252525;
}

.chart-placeholder {
  color: #666;
  font-size: 0.95rem;
}

.live-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #151515;
  border-radius: 4px;
  border: 1px solid #252525;
}

.data-label {
  color: #999;
  font-size: 0.95rem;
}

.data-value {
  color: #4DBA87;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

/* 预设配置 */
.preset-configs {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #2d2d2d;
}

.preset-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1rem;
}

.preset-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.preset-btn {
  padding: 0.75rem 1rem;
  background-color: #2d2d2d;
  color: #ccc;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-align: center;
}

.preset-btn:hover {
  background-color: #3d3d3d;
  color: #4DBA87;
  border-color: #4DBA87;
}

/* 理论说明 */
.theory-section {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #2d2d2d;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1.5rem;
}

.theory-content p {
  color: #ccc;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
}

.formula-display {
  background-color: #151515;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #252525;
  overflow-x: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .exploration-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .control-panel {
    max-height: none;
    overflow-y: visible;
  }
  
  .data-display {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .render-container {
    min-height: 400px;
  }
  
  .preset-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theory-section {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 0;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .control-panel,
  .visualization-area > * {
    padding: 1rem;
  }
  
  .preset-list {
    grid-template-columns: 1fr;
  }
}
</style>