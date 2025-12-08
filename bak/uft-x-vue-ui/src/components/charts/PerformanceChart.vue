<template>
  <div class="performance-chart" :class="{ 'dark-theme': isDark }">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-controls">
        <t-button-group>
          <t-button
            v-for="type in chartTypes"
            :key="type.value"
            :variant="selectedChartType === type.value ? 'primary' : 'outline'"
            size="small"
            @click="switchChartType(type.value)"
          >
            {{ type.label }}
          </t-button>
        </t-button-group>
      </div>
    </div>

    <div class="chart-container" ref="chartContainer">
      <canvas ref="chartCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>

    <div class="chart-legend" v-if="showLegend">
      <div
        v-for="(item, index) in legendItems"
        :key="index"
        class="legend-item"
      >
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}</span>
      </div>
    </div>

    <div class="chart-stats" v-if="showStats">
      <div class="stat-item" v-for="(stat, index) in stats" :key="index">
        <span class="stat-label">{{ stat.label }}:</span>
        <span class="stat-value" :class="stat.trend">{{ stat.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { PerformanceMetrics, CodeComplexityMetrics } from '@/types/code-optimization'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
}

interface ChartType {
  value: 'line' | 'bar' | 'radar' | 'pie' | 'doughnut'
  label: string
}

interface LegendItem {
  label: string
  value: string
  color: string
}

interface StatItem {
  label: string
  value: string
  trend?: 'up' | 'down' | 'stable'
}

interface Props {
  title?: string
  data?: ChartData
  originalMetrics?: PerformanceMetrics & CodeComplexityMetrics
  optimizedMetrics?: PerformanceMetrics & CodeComplexityMetrics
  chartType?: 'line' | 'bar' | 'radar' | 'pie' | 'doughnut'
  height?: number
  showLegend?: boolean
  showStats?: boolean
  darkMode?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '性能图表',
  chartType: 'bar',
  height: 300,
  showLegend: true,
  showStats: true,
  darkMode: false,
  animated: true
})

const emit = defineEmits<{
  chartTypeChange: [type: string]
  dataPointClick: [data: any, index: number]
}>()

// 响应式状态
const chartContainer = ref<HTMLElement>()
const chartCanvas = ref<HTMLCanvasElement>()
const selectedChartType = ref(props.chartType)
const isDark = ref(props.darkMode)

// 图表类型选项
const chartTypes: ChartType[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'radar', label: '雷达图' },
  { value: 'pie', label: '饼图' },
  { value: 'doughnut', label: '环形图' }
]

// 计算属性
const canvasWidth = computed(() => {
  if (!chartContainer.value) return 800
  return chartContainer.value.clientWidth || 800
})

const canvasHeight = computed(() => props.height)

const chartData = computed((): ChartData => {
  if (props.data) {
    return props.data
  }

  // 从指标生成默认图表数据
  return generateChartFromMetrics()
})

const legendItems = computed((): LegendItem[] => {
  const items: LegendItem[] = []
  
  chartData.value.datasets.forEach((dataset, index) => {
    const maxValue = Math.max(...dataset.data)
    const minValue = Math.min(...dataset.data)
    const averageValue = Math.round(dataset.data.reduce((a, b) => a + b, 0) / dataset.data.length)
    
    items.push({
      label: dataset.label,
      value: `平均: ${averageValue}`,
      color: dataset.backgroundColor || getDefaultColor(index)
    })
  })

  return items
})

const stats = computed((): StatItem[] => {
  if (!props.originalMetrics || !props.optimizedMetrics) {
    return []
  }

  const original = props.originalMetrics
  const optimized = props.optimizedMetrics

  return [
    {
      label: '复杂度降低',
      value: `${calculateImprovement(original.cyclomaticComplexity, optimized.cyclomaticComplexity)}%`,
      trend: optimized.cyclomaticComplexity < original.cyclomaticComplexity ? 'up' : 'down'
    },
    {
      label: '可维护性提升',
      value: `${calculateImprovement(original.maintainabilityIndex, optimized.maintainabilityIndex)}%`,
      trend: optimized.maintainabilityIndex > original.maintainabilityIndex ? 'up' : 'down'
    },
    {
      label: '代码行数减少',
      value: `${calculateImprovement(original.linesOfCode, optimized.linesOfCode)}%`,
      trend: optimized.linesOfCode < original.linesOfCode ? 'up' : 'down'
    },
    {
      label: '函数数量',
      value: `${optimized.functionCount} / ${original.functionCount}`,
      trend: optimized.functionCount <= original.functionCount ? 'stable' : 'down'
    }
  ]
})

// 方法
function switchChartType(type: string) {
  selectedChartType.value = type as any
  emit('chartTypeChange', type)
  drawChart()
}

function generateChartFromMetrics(): ChartData {
  if (!props.originalMetrics || !props.optimizedMetrics) {
    return { labels: [], datasets: [] }
  }

  const original = props.originalMetrics
  const optimized = props.optimizedMetrics

  const labels = ['循环复杂度', '认知复杂度', '可维护性指数', '代码行数', '函数数量']
  
  const datasets = [
    {
      label: '优化前',
      data: [
        original.cyclomaticComplexity,
        original.cognitiveComplexity,
        original.maintainabilityIndex,
        original.linesOfCode,
        original.functionCount
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2
    },
    {
      label: '优化后',
      data: [
        optimized.cyclomaticComplexity,
        optimized.cognitiveComplexity,
        optimized.maintainabilityIndex,
        optimized.linesOfCode,
        optimized.functionCount
      ],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }
  ]

  return { labels, datasets }
}

function calculateImprovement(original: number, optimized: number): number {
  if (original === 0) return 0
  return Math.round(Math.abs(((optimized - original) / original) * 100))
}

function getDefaultColor(index: number): string {
  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)'
  ]
  return colors[index % colors.length]
}

function drawChart() {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 根据图表类型绘制
  switch (selectedChartType.value) {
    case 'bar':
      drawBarChart(ctx, chartData.value, canvas.width, canvas.height)
      break
    case 'line':
      drawLineChart(ctx, chartData.value, canvas.width, canvas.height)
      break
    case 'radar':
      drawRadarChart(ctx, chartData.value, canvas.width, canvas.height)
      break
    case 'pie':
    case 'doughnut':
      drawPieChart(ctx, chartData.value, canvas.width, canvas.height, selectedChartType.value === 'doughnut')
      break
  }
}

function drawBarChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const barWidth = chartWidth / (data.labels.length * data.datasets.length + data.labels.length + 1)
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data))

  // 绘制坐标轴
  ctx.strokeStyle = isDark.value ? '#666' : '#ccc'
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // 绘制柱状图
  data.datasets.forEach((dataset, datasetIndex) => {
    dataset.data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + (index * (data.datasets.length + 1) + datasetIndex + 1) * barWidth
      const y = height - padding - barHeight

      ctx.fillStyle = dataset.backgroundColor || getDefaultColor(datasetIndex)
      ctx.fillRect(x, y, barWidth, barHeight)

      // 添加数值标签
      ctx.fillStyle = isDark.value ? '#fff' : '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
    })
  })

  // 绘制标签
  ctx.fillStyle = isDark.value ? '#fff' : '#333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  data.labels.forEach((label, index) => {
    const x = padding + (index * (data.datasets.length + 1) + data.datasets.length / 2 + 1) * barWidth
    const y = height - padding + 20
    ctx.fillText(label, x, y)
  })
}

function drawLineChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const pointSpacing = chartWidth / (data.labels.length - 1)
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data))

  // 绘制坐标轴
  ctx.strokeStyle = isDark.value ? '#666' : '#ccc'
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // 绘制折线
  data.datasets.forEach((dataset, datasetIndex) => {
    ctx.strokeStyle = dataset.borderColor || getDefaultColor(datasetIndex)
    ctx.lineWidth = 2
    ctx.beginPath()

    dataset.data.forEach((value, index) => {
      const x = padding + index * pointSpacing
      const y = height - padding - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // 绘制数据点
      ctx.fillStyle = dataset.backgroundColor || getDefaultColor(datasetIndex)
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.stroke()
  })

  // 绘制标签
  ctx.fillStyle = isDark.value ? '#fff' : '#333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  data.labels.forEach((label, index) => {
    const x = padding + index * pointSpacing
    const y = height - padding + 20
    ctx.fillText(label, x, y)
  })
}

function drawRadarChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 40
  const angleStep = (Math.PI * 2) / data.labels.length

  // 绘制网格
  ctx.strokeStyle = isDark.value ? '#444' : '#ddd'
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    for (let j = 0; j < data.labels.length; j++) {
      const angle = j * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * (radius * i / 5)
      const y = centerY + Math.sin(angle) * (radius * i / 5)
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
  }

  // 绘制轴线
  for (let i = 0; i < data.labels.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    )
    ctx.stroke()
  }

  // 绘制数据
  data.datasets.forEach((dataset, datasetIndex) => {
    const maxValue = Math.max(...dataset.data)
    
    ctx.strokeStyle = dataset.borderColor || getDefaultColor(datasetIndex)
    ctx.fillStyle = dataset.backgroundColor || getDefaultColor(datasetIndex)
    ctx.lineWidth = 2
    ctx.beginPath()

    dataset.data.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2
      const distance = (value / maxValue) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.closePath()
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.stroke()
  })

  // 绘制标签
  ctx.fillStyle = isDark.value ? '#fff' : '#333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  data.labels.forEach((label, index) => {
    const angle = index * angleStep - Math.PI / 2
    const x = centerX + Math.cos(angle) * (radius + 20)
    const y = centerY + Math.sin(angle) * (radius + 20)
    ctx.fillText(label, x, y)
  })
}

function drawPieChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number, isDoughnut: boolean) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 40
  const innerRadius = isDoughnut ? radius * 0.6 : 0

  // 计算总和
  const total = data.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 0
  let currentAngle = -Math.PI / 2

  data.datasets[0]?.data.forEach((value, index) => {
    const sliceAngle = (value / total) * Math.PI * 2
    
    // 绘制扇形
    ctx.fillStyle = getDefaultColor(index)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    if (isDoughnut) {
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    } else {
      ctx.lineTo(centerX, centerY)
    }
    ctx.closePath()
    ctx.fill()

    // 绘制边框
    ctx.strokeStyle = isDark.value ? '#000' : '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 绘制标签
    const labelAngle = currentAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
    const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
    
    ctx.fillStyle = isDark.value ? '#fff' : '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    const percentage = ((value / total) * 100).toFixed(1)
    ctx.fillText(`${percentage}%`, labelX, labelY)

    currentAngle += sliceAngle
  })

  // 绘制图例
  ctx.font = '12px Arial'
  ctx.textAlign = 'left'
  data.labels.forEach((label, index) => {
    const legendY = 20 + index * 20
    const color = getDefaultColor(index)
    
    ctx.fillStyle = color
    ctx.fillRect(10, legendY - 10, 15, 15)
    
    ctx.fillStyle = isDark.value ? '#fff' : '#333'
    ctx.fillText(label, 30, legendY)
  })
}

// 响应式处理
function handleResize() {
  if (chartCanvas.value) {
    nextTick(() => {
      drawChart()
    })
  }
}

// 监听器
watch(() => props.chartType, (newType) => {
  selectedChartType.value = newType
  drawChart()
})

watch(() => props.darkMode, (dark) => {
  isDark.value = dark
  drawChart()
})

watch(() => chartData.value, () => {
  drawChart()
}, { deep: true })

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 监听暗色模式变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      isDark.value = e.matches
      drawChart()
    })
  }

  nextTick(() => {
    drawChart()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法供父组件调用
defineExpose({
  drawChart,
  exportChart: () => {
    if (chartCanvas.value) {
      return chartCanvas.value.toDataURL('image/png')
    }
  }
})
</script>

<style scoped>
.performance-chart {
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary, #333);
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.chart-container canvas {
  display: block;
  width: 100%;
  height: auto;
  max-height: 400px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color, #e7e7e7);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--td-text-color-secondary, #666);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  flex: 1;
}

.legend-value {
  font-weight: 500;
  color: var(--td-text-color-primary, #333);
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color, #e7e7e7);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder, #999);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary, #333);
}

.stat-value.up {
  color: var(--td-success-color, #52c41a);
}

.stat-value.down {
  color: var(--td-error-color, #f5222d);
}

.stat-value.stable {
  color: var(--td-warning-color, #faad14);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-chart {
    padding: 16px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }
  
  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .chart-stats {
    grid-template-columns: 1fr;
  }
}
</style>