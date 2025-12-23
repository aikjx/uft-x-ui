<template>
  <div class="unified-field-visualization">
    <!-- 顶部导航栏 -->
    <header class="quantum-header">
      <div class="header-content">
        <h1 class="cosmic-title">
          <span class="title-icon">🌌</span>
          统一场论3D可视化平台
        </h1>
        <div class="header-actions">
          <t-button theme="primary" @click="showFormulaSelector = true"> 选择公式 </t-button>
          <t-button theme="default" @click="resetView"> 重置视图 </t-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 左侧控制面板 -->
      <aside class="control-panel quantum-panel">
        <div class="panel-section">
          <h3 class="section-title">当前公式</h3>
          <div class="formula-display">
            <div class="formula-name">{{ currentFormulaName }}</div>
            <div class="formula-latex" v-html="currentFormulaLatex"></div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">参数调整</h3>
          <div class="parameter-controls">
            <div v-for="(value, key) in displayParameters" :key="key" class="param-item">
              <label class="param-label">{{ getParameterLabel(key) }}</label>
              <t-slider
                v-model="parameters[key]"
                :min="getParameterRange(key).min"
                :max="getParameterRange(key).max"
                :step="getParameterRange(key).step"
                @change="handleParameterChange"
              />
              <span class="param-value">{{ formatValue(parameters[key]) }}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">渲染模式</h3>
          <t-radio-group v-model="config.renderMode" @change="handleConfigChange">
            <t-radio value="field">场线</t-radio>
            <t-radio value="particle">粒子</t-radio>
            <t-radio value="wave">波动</t-radio>
            <t-radio value="hybrid">混合</t-radio>
          </t-radio-group>
        </div>

        <div class="panel-section">
          <h3 class="section-title">视觉效果</h3>
          <div class="effects-controls">
            <t-checkbox v-model="config.effects.bloom">辉光效果</t-checkbox>
            <t-checkbox v-model="config.effects.glow">发光</t-checkbox>
            <t-checkbox v-model="config.effects.trails">轨迹</t-checkbox>
            <t-checkbox v-model="config.effects.holographic">全息投影</t-checkbox>
            <t-checkbox v-model="config.effects.quantumRipple">量子涟漪</t-checkbox>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">性能统计</h3>
          <div class="stats-display" v-if="stats">
            <div class="stat-item">
              <span class="stat-label">FPS:</span>
              <span class="stat-value">{{ stats.fps.toFixed(0) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">绘制调用:</span>
              <span class="stat-value">{{ stats.drawCalls }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">三角形:</span>
              <span class="stat-value">{{ formatNumber(stats.triangles) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中央3D渲染区域 -->
      <main class="render-container">
        <div ref="canvasContainer" class="canvas-wrapper"></div>

        <!-- 浮动信息面板 -->
        <div class="floating-info">
          <div class="info-item">
            <span class="info-icon">⚡</span>
            <span class="info-text">{{ currentFormulaName }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🎯</span>
            <span class="info-text">{{ config.renderMode }}</span>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="!isInitialized" class="loading-overlay">
          <div class="quantum-loader">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-text">初始化量子渲染引擎...</div>
          </div>
        </div>
      </main>

      <!-- 右侧信息面板 -->
      <aside class="info-panel quantum-panel">
        <div class="panel-section">
          <h3 class="section-title">物理意义</h3>
          <p class="physics-description">
            {{ currentFormulaDescription }}
          </p>
        </div>

        <div class="panel-section">
          <h3 class="section-title">应用领域</h3>
          <div class="applications-list">
            <t-tag v-for="app in currentApplications" :key="app" theme="primary" variant="light">
              {{ app }}
            </t-tag>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">相关公式</h3>
          <div class="related-formulas">
            <t-button
              v-for="relatedId in currentRelatedFormulas"
              :key="relatedId"
              size="small"
              variant="outline"
              @click="switchFormula(relatedId)"
            >
              公式 {{ relatedId }}
            </t-button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">计算结果</h3>
          <div class="calculation-result">
            <pre>{{ JSON.stringify(calculate, null, 2) }}</pre>
          </div>
        </div>
      </aside>
    </div>

    <!-- 公式选择对话框 -->
    <t-dialog v-model:visible="showFormulaSelector" header="选择统一场论公式" width="800px">
      <div class="formula-grid">
        <div
          v-for="formula in availableFormulas"
          :key="formula.id"
          class="formula-card"
          :class="{ active: currentFormula === formula.id }"
          @click="selectFormula(formula.id)"
        >
          <div class="formula-card-header">
            <span class="formula-number">{{ formula.id }}</span>
            <span class="formula-category">{{ formula.category }}</span>
          </div>
          <div class="formula-card-title">{{ formula.name }}</div>
          <div class="formula-card-description">{{ formula.description }}</div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useUnifiedField } from '@/composables/useUnifiedField'
  import { FormulaType, FORMULA_METADATA } from '@/core/FormulaEngine'
  import type { FormulaParameters } from '@/types/unified-field-theory'

  // 组件状态
  const canvasContainer = ref<HTMLElement | null>(null)
  const showFormulaSelector = ref(false)
  const stats = ref<any>(null)

  // 使用统一场论组合式函数
  const {
    isInitialized,
    currentFormula,
    parameters,
    config,
    calculate,
    initialize,
    visualizeFormula,
    updateParameters,
    updateConfig,
    getPerformanceStats
  } = useUnifiedField(canvasContainer.value)

  // 可用公式列表
  const availableFormulas = computed(() => {
    return Object.values(FORMULA_METADATA).filter(f => f !== undefined)
  })

  // 当前公式信息
  const currentFormulaMetadata = computed(() => {
    return FORMULA_METADATA[currentFormula.value]
  })

  const currentFormulaName = computed(() => {
    return currentFormulaMetadata.value?.name || '未知公式'
  })

  const currentFormulaLatex = computed(() => {
    // 这里应该使用KaTeX渲染，暂时返回原始LaTeX
    return `$$${currentFormulaMetadata.value?.latex || ''}$$`
  })

  const currentFormulaDescription = computed(() => {
    return currentFormulaMetadata.value?.physicalMeaning || ''
  })

  const currentApplications = computed(() => {
    return currentFormulaMetadata.value?.applications || []
  })

  const currentRelatedFormulas = computed(() => {
    return currentFormulaMetadata.value?.relatedFormulas || []
  })

  // 显示的参数（根据当前公式）
  const displayParameters = computed(() => {
    const params: Record<string, any> = {}

    switch (currentFormula.value) {
      case FormulaType.SPACETIME_UNITY:
        params.c = parameters.value.c
        params.t = parameters.value.t
        break
      case FormulaType.SPIRAL_SPACETIME:
        params.r = parameters.value.r
        params.omega = parameters.value.omega
        params.h = parameters.value.h
        params.t = parameters.value.t
        break
      case FormulaType.MASS_DEFINITION:
        params.k = parameters.value.k
        params.n = parameters.value.n
        params.Omega = parameters.value.Omega
        break
      default:
        Object.assign(params, parameters.value)
    }

    return params
  })

  // 参数标签
  const getParameterLabel = (key: string): string => {
    const labels: Record<string, string> = {
      c: '光速 (c)',
      t: '时间 (t)',
      r: '半径 (r)',
      omega: '角速度 (ω)',
      h: '螺旋高度 (h)',
      k: '比例常数 (k)',
      n: '空间位移条数 (n)',
      Omega: '立体角 (Ω)',
      m: '质量 (m)',
      v: '速度 (v)',
      G: '引力常数 (G)'
    }
    return labels[key] || key
  }

  // 参数范围
  const getParameterRange = (key: string) => {
    const ranges: Record<string, any> = {
      c: { min: 1e8, max: 3e8, step: 1e7 },
      t: { min: 0, max: 10, step: 0.1 },
      r: { min: 0.1, max: 10, step: 0.1 },
      omega: { min: 0.1, max: 10, step: 0.1 },
      h: { min: 0.01, max: 1, step: 0.01 },
      k: { min: 0.1, max: 10, step: 0.1 },
      n: { min: 1, max: 100, step: 1 },
      Omega: { min: 0.1, max: 10, step: 0.1 }
    }
    return ranges[key] || { min: 0, max: 100, step: 1 }
  }

  // 格式化数值
  const formatValue = (value: number): string => {
    if (value > 1e6) {
      return value.toExponential(2)
    }
    return value.toFixed(2)
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  // 事件处理
  const handleParameterChange = () => {
    updateParameters(parameters.value)
  }

  const handleConfigChange = () => {
    updateConfig(config.value)
  }

  const selectFormula = (formulaId: FormulaType) => {
    visualizeFormula(formulaId)
    showFormulaSelector.value = false
  }

  const switchFormula = (formulaId: FormulaType) => {
    visualizeFormula(formulaId)
  }

  const resetView = () => {
    // 重置相机视图
    console.log('重置视图')
  }

  // 性能统计更新
  const updateStats = () => {
    stats.value = getPerformanceStats()
  }

  // 生命周期
  onMounted(() => {
    if (canvasContainer.value) {
      initialize()

      // 初始化后可视化第一个公式
      setTimeout(() => {
        visualizeFormula(FormulaType.SPACETIME_UNITY)
      }, 100)

      // 定期更新性能统计
      setInterval(updateStats, 1000)
    }
  })
</script>

<style scoped lang="scss">
  .unified-field-visualization {
    width: 100vw;
    height: 100vh;
    background: #000000;
    color: #ffffff;
    overflow: hidden;
    font-family:
      'SF Pro Display',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }

  .quantum-header {
    height: 70px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(180, 0, 255, 0.1));
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    backdrop-filter: blur(20px);

    .header-content {
      max-width: 100%;
      height: 100%;
      padding: 0 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cosmic-title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #00d4ff, #b400ff, #ff0080);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;

      .title-icon {
        font-size: 32px;
        filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .main-container {
    display: flex;
    height: calc(100vh - 70px);
  }

  .quantum-panel {
    background: rgba(10, 10, 30, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 212, 255, 0.2);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.5);
      border-radius: 4px;
    }
  }

  .control-panel {
    width: 320px;
    padding: 20px;
  }

  .info-panel {
    width: 320px;
    padding: 20px;
  }

  .panel-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }

  .formula-display {
    padding: 15px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;

    .formula-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #ffffff;
    }

    .formula-latex {
      font-family: 'KaTeX_Main', serif;
      font-size: 14px;
      color: #b400ff;
    }
  }

  .parameter-controls {
    .param-item {
      margin-bottom: 20px;

      .param-label {
        display: block;
        font-size: 13px;
        color: #aaaaaa;
        margin-bottom: 8px;
      }

      .param-value {
        display: inline-block;
        margin-top: 5px;
        font-size: 12px;
        color: #00d4ff;
        font-weight: 600;
      }
    }
  }

  .effects-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stats-display {
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .stat-label {
        color: #aaaaaa;
        font-size: 13px;
      }

      .stat-value {
        color: #00d4ff;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }

  .render-container {
    flex: 1;
    position: relative;

    .canvas-wrapper {
      width: 100%;
      height: 100%;
    }

    .floating-info {
      position: absolute;
      top: 20px;
      left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;

        .info-icon {
          font-size: 20px;
        }

        .info-text {
          font-size: 14px;
          color: #ffffff;
        }
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
    }
  }

  .quantum-loader {
    position: relative;
    width: 200px;
    height: 200px;

    .loader-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top-color: #00d4ff;
      border-radius: 50%;
      animation: quantum-spin 2s linear infinite;

      &:nth-child(2) {
        border-top-color: #b400ff;
        animation-duration: 3s;
        animation-direction: reverse;
      }

      &:nth-child(3) {
        border-top-color: #ff0080;
        animation-duration: 4s;
      }
    }

    .loader-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: #00d4ff;
      text-align: center;
      white-space: nowrap;
    }
  }

  @keyframes quantum-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .physics-description {
    font-size: 14px;
    line-height: 1.6;
    color: #cccccc;
  }

  .applications-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .related-formulas {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .calculation-result {
    padding: 15px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    color: #00d4ff;
    overflow-x: auto;
  }

  .formula-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    max-height: 600px;
    overflow-y: auto;
    padding: 10px;
  }

  .formula-card {
    padding: 20px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateY(-2px);
    }

    &.active {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00d4ff;
    }

    .formula-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .formula-number {
        font-size: 24px;
        font-weight: 700;
        color: #00d4ff;
      }

      .formula-category {
        font-size: 11px;
        text-transform: uppercase;
        color: #b400ff;
        padding: 4px 8px;
        background: rgba(180, 0, 255, 0.2);
        border-radius: 4px;
      }
    }

    .formula-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .formula-card-description {
      font-size: 13px;
      color: #aaaaaa;
      line-height: 1.4;
    }
  }
</style>
