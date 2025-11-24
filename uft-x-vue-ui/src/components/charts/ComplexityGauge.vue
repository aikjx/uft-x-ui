<template>
  <div class="complexity-gauge" :class="{ 'dark-theme': isDark }">
    <div class="gauge-container" ref="gaugeContainer">
      <svg
        :width="gaugeSize"
        :height="gaugeSize"
        viewBox="0 0 200 200"
        class="gauge-svg"
      >
        <!-- 背景弧 -->
        <path
          :d="backgroundArc"
          fill="none"
          :stroke="backgroundColor"
          stroke-width="12"
          stroke-linecap="round"
        />
        
        <!-- 数值弧 -->
        <path
          :d="valueArc"
          fill="none"
          :stroke="valueColor"
          stroke-width="12"
          stroke-linecap="round"
          class="value-arc"
        />
        
        <!-- 刻度线 -->
        <g v-for="(tick, index) in ticks" :key="index">
          <line
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
            :stroke="tickColor"
            stroke-width="2"
          />
          <text
            :x="tick.textX"
            :y="tick.textY"
            :fill="textColor"
            :font-size="tickFontSize"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ tick.label }}
          </text>
        </g>
        
        <!-- 中心数值 -->
        <text
          x="100"
          y="90"
          :fill="textColor"
          :font-size="valueFontSize"
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ displayValue }}
        </text>
        
        <!-- 单位标签 -->
        <text
          x="100"
          y="110"
          :fill="textColor"
          font-size="12"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ unit }}
        </text>
        
        <!-- 标题 -->
        <text
          x="100"
          y="130"
          :fill="textColor"
          font-size="14"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ title }}
        </text>
      </svg>
    </div>

    <div class="gauge-info" v-if="showInfo">
      <div class="info-item">
        <span class="info-label">等级:</span>
        <span class="info-value" :class="complexityLevel.class">
          {{ complexityLevel.label }}
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">建议:</span>
        <span class="info-suggestion">{{ complexityLevel.suggestion }}</span>
      </div>
    </div>

    <div class="gauge-history" v-if="showHistory && history.length > 0">
      <div class="history-title">历史趋势</div>
      <div class="history-chart">
        <div
          v-for="(point, index) in history"
          :key="index"
          class="history-point"
          :style="{ height: `${(point.value / maxValue) * 100}%` }"
        >
          <span class="history-value">{{ point.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface HistoryPoint {
  timestamp: number
  value: number
  label?: string
}

interface ComplexityLevel {
  label: string
  class: string
  suggestion: string
  color: string
}

interface Props {
  value: number
  title?: string
  unit?: string
  minValue?: number
  maxValue?: number
  thresholds?: {
    good: number
    moderate: number
    bad: number
  }
  showInfo?: boolean
  showHistory?: boolean
  size?: number
  animated?: boolean
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '复杂度',
  unit: '',
  minValue: 0,
  maxValue: 100,
  thresholds: () => ({ good: 25, moderate: 50, bad: 75 }),
  showInfo: true,
  showHistory: false,
  size: 200,
  animated: true,
  darkMode: false
})

const emit = defineEmits<{
  valueChange: [value: number]
  thresholdCross: [level: string, value: number]
}>()

// 响应式状态
const gaugeContainer = ref<HTMLElement>()
const isDark = ref(props.darkMode)
const history = ref<HistoryPoint[]>([])

// 计算属性
const gaugeSize = computed(() => props.size)
const displayValue = computed(() => Math.round(props.value))
const normalizedValue = computed(() => {
  const range = props.maxValue - props.minValue
  return Math.max(0, Math.min(1, (props.value - props.minValue) / range))
})

const valueColor = computed(() => {
  const color = complexityLevel.value.color
  return color
})

const backgroundColor = computed(() => {
  return isDark.value ? '#333' : '#e0e0e0'
})

const tickColor = computed(() => {
  return isDark.value ? '#999' : '#666'
})

const textColor = computed(() => {
  return isDark.value ? '#fff' : '#333'
})

const valueFontSize = computed(() => {
  return Math.max(20, gaugeSize.value / 8)
})

const tickFontSize = computed(() => {
  return Math.max(10, gaugeSize.value / 20)
})

const complexityLevel = computed((): ComplexityLevel => {
  const value = props.value
  
  if (value <= props.thresholds.good) {
    return {
      label: '优秀',
      class: 'level-good',
      suggestion: '代码质量很好，继续保持',
      color: '#52c41a'
    }
  } else if (value <= props.thresholds.moderate) {
    return {
      label: '良好',
      class: 'level-moderate',
      suggestion: '代码质量良好，可以考虑进一步优化',
      color: '#faad14'
    }
  } else if (value <= props.thresholds.bad) {
    return {
      label: '一般',
      class: 'level-bad',
      suggestion: '建议进行重构以降低复杂度',
      color: '#ff7a45'
    }
  } else {
    return {
      label: '较差',
      class: 'level-poor',
      suggestion: '需要立即重构，复杂度过高',
      color: '#f5222d'
    }
  }
})

// SVG路径计算
const backgroundArc = computed(() => {
  const startAngle = -180
  const endAngle = 0
  return createArc(100, 100, 80, startAngle, endAngle)
})

const valueArc = computed(() => {
  const startAngle = -180
  const endAngle = -180 + (normalizedValue.value * 180)
  return createArc(100, 100, 80, startAngle, endAngle)
})

const ticks = computed(() => {
  const tickCount = 5
  const ticks = []
  
  for (let i = 0; i <= tickCount; i++) {
    const angle = -180 + (i * 180 / tickCount)
    const radian = (angle * Math.PI) / 180
    
    const x1 = 100 + Math.cos(radian) * 70
    const y1 = 100 + Math.sin(radian) * 70
    const x2 = 100 + Math.cos(radian) * 65
    const y2 = 100 + Math.sin(radian) * 65
    
    const textRadius = 50
    const textX = 100 + Math.cos(radian) * textRadius
    const textY = 100 + Math.sin(radian) * textRadius
    
    const value = props.minValue + (i * (props.maxValue - props.minValue) / tickCount)
    
    ticks.push({
      x1, y1, x2, y2, textX, textY,
      label: Math.round(value).toString()
    })
  }
  
  return ticks
})

// 方法
function createArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const startRadian = (startAngle * Math.PI) / 180
  const endRadian = (endAngle * Math.PI) / 180
  
  const x1 = cx + radius * Math.cos(startRadian)
  const y1 = cy + radius * Math.sin(startRadian)
  const x2 = cx + radius * Math.cos(endRadian)
  const y2 = cy + radius * Math.sin(endRadian)
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}

function addHistoryPoint(value: number) {
  const point: HistoryPoint = {
    timestamp: Date.now(),
    value: Math.round(value)
  }
  
  history.value.push(point)
  
  // 保持最多10个历史点
  if (history.value.length > 10) {
    history.value.shift()
  }
}

function updateHistory() {
  addHistoryPoint(props.value)
}

// 监听器
watch(() => props.value, (newValue, oldValue) => {
  if (oldValue !== undefined) {
    // 检查阈值跨越
    const currentLevel = complexityLevel.value.label
    const oldLevel = getComplexityLevel(oldValue)
    
    if (currentLevel !== oldLevel) {
      emit('thresholdCross', currentLevel, newValue)
    }
  }
  
  updateHistory()
})

watch(() => props.darkMode, (dark) => {
  isDark.value = dark
})

function getComplexityLevel(value: number): string {
  if (value <= props.thresholds.good) return '优秀'
  if (value <= props.thresholds.moderate) return '良好'
  if (value <= props.thresholds.bad) return '一般'
  return '较差'
}

// 暴露方法
defineExpose({
  resetHistory: () => { history.value = [] },
  exportData: () => ({
    currentValue: props.value,
    level: complexityLevel.value,
    history: [...history.value]
  })
})

onMounted(() => {
  updateHistory()
})
</script>

<style scoped>
.complexity-gauge {
  background: var(--td-bg-color-container, #fff);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-theme {
  background: var(--td-bg-color-container-hover, #1f1f1f);
  color: var(--td-text-color-primary, #fff);
}

.gauge-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.gauge-svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.value-arc {
  transition: all 0.5s ease-in-out;
}

.gauge-info {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--td-bg-color-container-select, #f5f5f5);
  border-radius: 6px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: var(--td-text-color-secondary, #666);
}

.info-value {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.info-value.level-good {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.info-value.level-moderate {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.info-value.level-bad {
  background: rgba(255, 122, 69, 0.1);
  color: #ff7a45;
}

.info-value.level-poor {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.info-suggestion {
  font-size: 12px;
  color: var(--td-text-color-placeholder, #999);
}

.gauge-history {
  margin-top: 20px;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--td-text-color-primary, #333);
}

.history-chart {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 40px;
  padding: 8px;
  background: var(--td-bg-color-container-select, #f5f5f5);
  border-radius: 4px;
}

.history-point {
  flex: 1;
  min-height: 4px;
  background: var(--td-brand-color, #1890ff);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-point:hover {
  background: var(--td-brand-color-hover, #40a9ff);
  transform: translateY(-2px);
}

.history-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  background: var(--td-bg-color-container, #fff);
  padding: 2px 4px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.history-point:hover .history-value {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .complexity-gauge {
    padding: 16px;
  }
  
  .gauge-info {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>