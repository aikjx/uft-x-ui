<template>
  <div class="performance-monitor" :class="[monitorPosition, { minimized: isMinimized }]">
    <!-- 监控面板头部 -->
    <div class="monitor-header" @click="toggleMinimize">
      <div class="header-left">
        <span class="monitor-icon">📊</span>
        <span class="monitor-title">性能监控</span>
        <span class="performance-score" :class="performanceStatus">
          {{ performanceScore }}
        </span>
        <span class="status-indicator" :class="performanceStatus"></span>
      </div>
      <div class="header-right">
        <button
          class="control-btn"
          @click.stop="toggleMonitoring"
          :title="isMonitoring ? '停止监控' : '开始监控'"
        >
          {{ isMonitoring ? '⏹️' : '▶️' }}
        </button>
        <button
          class="control-btn"
          @click.stop="toggleMinimize"
          :title="isMinimized ? '展开' : '最小化'"
        >
          {{ isMinimized ? '⬆️' : '⬇️' }}
        </button>
        <button class="control-btn" @click.stop="closeMonitor" title="关闭">❌</button>
      </div>
    </div>

    <!-- 监控面板内容 -->
    <div v-if="!isMinimized" class="monitor-content">
      <!-- 实时指标 -->
      <div class="metrics-grid">
        <!-- FPS指标 -->
        <div class="metric-card" :class="getMetricClass('fps')">
          <div class="metric-header">
            <span class="metric-icon">🎮</span>
            <span class="metric-name">FPS</span>
            <span class="metric-value">{{ metrics.fps }}</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: getFPSPercentage() + '%' }"></div>
          </div>
          <div class="metric-target">目标: 60</div>
        </div>

        <!-- 内存指标 -->
        <div class="metric-card" :class="getMetricClass('memory')">
          <div class="metric-header">
            <span class="metric-icon">💾</span>
            <span class="metric-name">内存</span>
            <span class="metric-value">{{ metrics.memory.used }}MB</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: getMemoryPercentage() + '%' }"></div>
          </div>
          <div class="metric-target">
            已用: {{ metrics.memory.used }}MB / 总量: {{ metrics.memory.limit }}MB
          </div>
        </div>

        <!-- CPU指标 -->
        <div class="metric-card" :class="getMetricClass('cpu')">
          <div class="metric-header">
            <span class="metric-icon">⚡</span>
            <span class="metric-name">CPU</span>
            <span class="metric-value">{{ Math.round(metrics.cpu.usage * 100) }}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: metrics.cpu.usage * 100 + '%' }"></div>
          </div>
          <div class="metric-target">线程数: {{ metrics.cpu.threads }}</div>
        </div>

        <!-- GPU指标 -->
        <div class="metric-card" :class="getMetricClass('gpu')">
          <div class="metric-header">
            <span class="metric-icon">🎨</span>
            <span class="metric-name">GPU</span>
            <span class="metric-value">{{ metrics.gpu.memory }}MB</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: getGPUPercentage() + '%' }"></div>
          </div>
          <div class="metric-target">温度: {{ metrics.gpu.temperature }}°C</div>
        </div>

        <!-- 网络指标 -->
        <div class="metric-card" :class="getMetricClass('network')">
          <div class="metric-header">
            <span class="metric-icon">🌐</span>
            <span class="metric-name">网络</span>
            <span class="metric-value">{{ metrics.network.latency }}ms</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: getNetworkPercentage() + '%' }"></div>
          </div>
          <div class="metric-target">吞吐量: {{ metrics.network.throughput }}KB/s</div>
        </div>

        <!-- 渲染指标 -->
        <div class="metric-card" :class="getMetricClass('rendering')">
          <div class="metric-header">
            <span class="metric-icon">🖥️</span>
            <span class="metric-name">渲染</span>
            <span class="metric-value">{{ metrics.rendering.frameTime }}ms</span>
          </div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: getRenderingPercentage() + '%' }"></div>
          </div>
          <div class="metric-target">绘制调用: {{ metrics.rendering.drawCalls }}</div>
        </div>
      </div>

      <!-- 性能趋势图 -->
      <div class="performance-chart">
        <div class="chart-header">
          <span>性能趋势</span>
          <div class="chart-controls">
            <button
              v-for="timeRange in timeRanges"
              :key="timeRange"
              :class="{ active: selectedTimeRange === timeRange }"
              @click="selectedTimeRange = timeRange"
              class="time-range-btn"
            >
              {{ timeRange }}
            </button>
          </div>
        </div>
        <div class="chart-container">
          <!-- 简化的趋势图（实际项目中可以使用Chart.js等库） -->
          <div class="trend-chart">
            <div
              v-for="(point, index) in trendData"
              :key="index"
              class="trend-point"
              :style="{
                height: point + '%',
                left: index * 10 + 'px'
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="optimization-suggestions">
        <div class="suggestions-header">
          <span>💡 优化建议</span>
        </div>
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in activeSuggestions"
            :key="index"
            class="suggestion-item"
            :class="suggestion.priority"
          >
            <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.priority) }}</span>
            <span class="suggestion-text">{{ suggestion.message }}</span>
          </div>
          <div v-if="activeSuggestions.length === 0" class="no-suggestions">
            🎉 当前性能表现优秀！
          </div>
        </div>
      </div>
    </div>

    <!-- 最小化状态显示 -->
    <div v-else class="minimized-content">
      <span class="minimized-score" :class="performanceStatus">
        {{ performanceScore }}
      </span>
      <span class="minimized-fps">{{ metrics.fps }} FPS</span>
      <span class="minimized-memory">{{ metrics.memory.used }}MB</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { usePerformanceMonitor, type PerformanceMetrics } from '@/utils/performanceMonitor'

  // Props
  interface Props {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    autoStart?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    position: 'top-right',
    autoStart: true
  })

  // Emits
  const emit = defineEmits<{
    close: []
    alert: [alert: { type: string; message: string; timestamp: number }]
  }>()

  // 监控Hook
  const {
    metrics,
    performanceScore,
    performanceStatus,
    startMonitoring,
    stopMonitoring,
    isMonitoringActive
  } = usePerformanceMonitor()

  // 本地状态
  const isMinimized = ref(false)
  const isMonitoring = ref(props.autoStart)
  const selectedTimeRange = ref('5m')
  const timeRanges = ['1m', '5m', '15m', '1h']

  // 简化的趋势数据（实际项目中需要真实数据）
  const trendData = ref([60, 65, 58, 70, 75, 80, 85, 90, 85, 80])

  // 计算属性
  const monitorPosition = computed(() => `position-${props.position}`)
  const isMonitoring = computed(() => isMonitoringActive())

  // 优化建议
  const activeSuggestions = computed(() => {
    const suggestions = []

    // FPS建议
    if (metrics.value.fps < 30) {
      suggestions.push({
        priority: 'high',
        message: 'FPS过低，建议优化渲染性能'
      })
    } else if (metrics.value.fps < 45) {
      suggestions.push({
        priority: 'medium',
        message: 'FPS有提升空间，考虑优化绘制调用'
      })
    }

    // 内存建议
    if (metrics.value.memory.limit > 0) {
      const memoryUsage = metrics.value.memory.used / metrics.value.memory.limit
      if (memoryUsage > 0.8) {
        suggestions.push({
          priority: 'high',
          message: '内存使用率过高，建议清理无用对象'
        })
      } else if (memoryUsage > 0.6) {
        suggestions.push({
          priority: 'medium',
          message: '内存使用率较高，注意内存泄漏'
        })
      }
    }

    // CPU建议
    if (metrics.value.cpu.usage > 0.8) {
      suggestions.push({
        priority: 'high',
        message: 'CPU使用率过高，优化计算密集型任务'
      })
    }

    return suggestions
  })

  // 方法
  const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value
  }

  const toggleMonitoring = () => {
    if (isMonitoring.value) {
      stopMonitoring()
      isMonitoring.value = false
    } else {
      startMonitoring()
      isMonitoring.value = true
    }
  }

  const closeMonitor = () => {
    stopMonitoring()
    emit('close')
  }

  const getMetricClass = (metricType: string) => {
    const metric = metrics.value[metricType as keyof PerformanceMetrics]
    if (typeof metric === 'number') {
      if (metricType === 'fps') {
        return metric < 30 ? 'critical' : metric < 45 ? 'warning' : 'normal'
      }
    }
    return 'normal'
  }

  const getFPSPercentage = () => {
    return Math.min((metrics.value.fps / 60) * 100, 100)
  }

  const getMemoryPercentage = () => {
    if (metrics.value.memory.limit === 0) return 0
    return Math.min((metrics.value.memory.used / metrics.value.memory.limit) * 100, 100)
  }

  const getGPUPercentage = () => {
    return Math.min((metrics.value.gpu.memory / 2000) * 100, 100)
  }

  const getNetworkPercentage = () => {
    return Math.min(((100 - metrics.value.network.latency) / 100) * 100, 100)
  }

  const getRenderingPercentage = () => {
    return Math.min(((16.67 - metrics.value.rendering.frameTime) / 16.67) * 100, 100)
  }

  const getSuggestionIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🚨'
      case 'medium':
        return '⚠️'
      default:
        return '💡'
    }
  }

  // 生命周期
  onMounted(() => {
    if (props.autoStart) {
      startMonitoring()
    }

    // 监听性能告警
    window.addEventListener('performanceAlert', (event: any) => {
      emit('alert', event.detail)
    })
  })

  onUnmounted(() => {
    stopMonitoring()
  })
</script>

<style scoped>
  .performance-monitor {
    position: fixed;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-family: 'Segoe UI', system-ui, sans-serif;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    max-width: 400px;
    min-width: 300px;
  }

  .performance-monitor.minimized {
    max-width: 200px;
    min-width: 150px;
  }

  .position-top-right {
    top: 20px;
    right: 20px;
  }

  .position-top-left {
    top: 20px;
    left: 20px;
  }

  .position-bottom-right {
    bottom: 20px;
    right: 20px;
  }

  .position-bottom-left {
    bottom: 20px;
    left: 20px;
  }

  /* 头部样式 */
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    user-select: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .monitor-icon {
    font-size: 1.2em;
  }

  .monitor-title {
    font-weight: 600;
    font-size: 0.9em;
  }

  .performance-score {
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 0.8em;
  }

  .performance-score.excellent {
    background: rgba(76, 175, 80, 0.3);
  }
  .performance-score.good {
    background: rgba(255, 193, 7, 0.3);
  }
  .performance-score.fair {
    background: rgba(255, 152, 0, 0.3);
  }
  .performance-score.poor {
    background: rgba(244, 67, 54, 0.3);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-indicator.excellent {
    background: #4caf50;
  }
  .status-indicator.good {
    background: #ffc107;
  }
  .status-indicator.fair {
    background: #ff9800;
  }
  .status-indicator.poor {
    background: #f44336;
  }

  .header-right {
    display: flex;
    gap: 4px;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 6px;
    color: white;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.8em;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  /* 内容区域样式 */
  .monitor-content {
    padding: 16px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

  .metric-card.critical {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
  }

  .metric-card.warning {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
  }

  .metric-card.normal {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .metric-icon {
    font-size: 1.1em;
  }

  .metric-name {
    font-size: 0.8em;
    opacity: 0.8;
    flex: 1;
    margin-left: 8px;
  }

  .metric-value {
    font-weight: bold;
    font-size: 0.9em;
  }

  .metric-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .metric-progress {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #8bc34a);
    transition: width 0.3s ease;
  }

  .metric-card.critical .metric-progress {
    background: linear-gradient(90deg, #f44336, #ff5252);
  }

  .metric-card.warning .metric-progress {
    background: linear-gradient(90deg, #ff9800, #ffc107);
  }

  .metric-target {
    font-size: 0.7em;
    opacity: 0.6;
  }

  /* 图表区域 */
  .performance-chart {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 0.9em;
    font-weight: 600;
  }

  .chart-controls {
    display: flex;
    gap: 4px;
  }

  .time-range-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 2px 8px;
    font-size: 0.7em;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .time-range-btn.active {
    background: rgba(76, 175, 80, 0.3);
  }

  .chart-container {
    height: 60px;
    position: relative;
  }

  .trend-chart {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .trend-point {
    position: absolute;
    bottom: 0;
    width: 8px;
    background: #4caf50;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  /* 优化建议 */
  .optimization-suggestions {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
  }

  .suggestions-header {
    font-size: 0.9em;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    font-size: 0.8em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item.high {
    color: #f44336;
  }

  .suggestion-item.medium {
    color: #ff9800;
  }

  .suggestion-item.low {
    color: #4caf50;
  }

  .suggestion-icon {
    font-size: 1.1em;
  }

  .no-suggestions {
    text-align: center;
    opacity: 0.6;
    font-size: 0.8em;
    padding: 12px 0;
  }

  /* 最小化状态 */
  .minimized-content {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 8px 12px;
    gap: 12px;
  }

  .minimized-score {
    font-weight: bold;
    font-size: 1.1em;
    padding: 4px 8px;
    border-radius: 8px;
  }

  .minimized-score.excellent {
    background: rgba(76, 175, 80, 0.3);
  }
  .minimized-score.good {
    background: rgba(255, 193, 7, 0.3);
  }
  .minimized-score.fair {
    background: rgba(255, 152, 0, 0.3);
  }
  .minimized-score.poor {
    background: rgba(244, 67, 54, 0.3);
  }

  .minimized-fps,
  .minimized-memory {
    font-size: 0.8em;
    opacity: 0.8;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .performance-monitor {
      max-width: 100vw;
      width: calc(100vw - 40px);
      left: 20px;
      right: 20px;
      bottom: 20px;
      top: auto;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
