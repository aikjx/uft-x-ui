<template>
  <div class="advanced-performance-panel">
    <!-- 面板标题和控制 -->
    <div class="panel-header">
      <h3>智能性能优化</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <!-- 性能概览卡片 -->
    <div class="performance-overview">
      <div class="performance-card">
        <div class="card-title">当前性能</div>
        <div class="performance-metrics">
          <div class="metric">
            <span class="metric-label">FPS</span>
            <span class="metric-value" :class="getFPSClass(currentStatus.currentFPS)">{{ currentStatus.currentFPS.toFixed(1) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">内存</span>
            <span class="metric-value" :class="getMemoryClass(currentStatus.currentMemory)">{{ currentStatus.currentMemory.toFixed(0) }}MB</span>
          </div>
          <div class="metric">
            <span class="metric-label">帧时间</span>
            <span class="metric-value" :class="getFrameTimeClass(currentStatus.currentFrameTime)">{{ currentStatus.currentFrameTime.toFixed(1) }}ms</span>
          </div>
        </div>
        <div class="status-indicator" :class="getStatusClass()">
          {{ getStatusText() }}
        </div>
      </div>
      
      <div class="device-card">
        <div class="card-title">设备信息</div>
        <div class="device-info">
          <div class="info-item">
            <span class="info-label">设备类型:</span>
            <span class="info-value">{{ deviceInfo.deviceType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">浏览器:</span>
            <span class="info-value">{{ deviceInfo.browser }} {{ deviceInfo.browserVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性能级别:</span>
            <span class="info-value" :class="getTierClass(deviceInfo.performanceTier)">
              {{ getTierText(deviceInfo.performanceTier) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 一键优化部分 -->
    <div class="one-click-section">
      <h4>智能优化</h4>
      <div class="optimize-controls">
        <button 
          class="primary-button optimize-button" 
          @click="runOneClickOptimization" 
          :disabled="isOptimizing"
        >
          <span v-if="!isOptimizing">一键优化</span>
          <span v-else class="loading">优化中...</span>
        </button>
        
        <div class="auto-mode-container">
          <input 
            type="checkbox" 
            id="autoMode" 
            v-model="autoModeEnabled"
            @change="toggleAutoMode"
          >
          <label for="autoMode">启用自动优化</label>
          <div class="tooltip">
            自动根据性能和复杂度调整设置
          </div>
        </div>
      </div>
    </div>
    
    <!-- 性能设置面板 -->
    <div class="settings-section">
      <h4>性能设置</h4>
      
      <!-- 性能模式选择 -->
      <div class="setting-group">
        <label class="setting-label">性能模式</label>
        <div class="mode-selector">
          <button 
            v-for="mode in performanceModes" 
            :key="mode.value"
            class="mode-button" 
            :class="{ active: selectedMode === mode.value }"
            @click="changePerformanceMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
      
      <!-- 高级设置 -->
      <div class="advanced-settings">
        <div class="setting-group">
          <label class="setting-label">渲染分辨率</label>
          <div class="slider-container">
            <input 
              type="range" 
              min="0.5" 
              max="1.0" 
              step="0.1" 
              v-model.number="renderScale"
              @input="updateRenderScale"
            >
            <span class="slider-value">{{ (renderScale * 100).toFixed(0) }}%</span>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">最大粒子数</label>
          <div class="slider-container">
            <input 
              type="range" 
              min="50" 
              max="500" 
              step="50" 
              v-model.number="maxParticles"
              @input="updateMaxParticles"
            >
            <span class="slider-value">{{ maxParticles }}</span>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">场分辨率</label>
          <div class="slider-container">
            <input 
              type="range" 
              min="10" 
              max="40" 
              step="5" 
              v-model.number="fieldResolution"
              @input="updateFieldResolution"
            >
            <span class="slider-value">{{ fieldResolution }}×{{ fieldResolution }}</span>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">阴影质量</label>
          <select v-model="shadowQuality" @change="updateShadowQuality">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
            <option value="none">无</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">像素比率</label>
          <select v-model.number="pixelRatio" @change="updatePixelRatio">
            <option :value="1.0">1.0</option>
            <option :value="1.5">1.5</option>
            <option :value="2.0">2.0</option>
            <option value="auto">自动</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 性能测试部分 -->
    <div class="test-section">
      <h4>性能测试</h4>
      <button 
        class="secondary-button test-button" 
        @click="runPerformanceTest" 
        :disabled="isTesting"
      >
        <span v-if="!isTesting">运行性能测试</span>
        <span v-else class="loading">测试中...</span>
      </button>
      
      <!-- 测试结果 -->
      <div v-if="testResult" class="test-results">
        <h5>测试结果</h5>
        <div class="test-metrics">
          <div class="test-metric">
            <span class="metric-label">总分</span>
            <span class="metric-value">{{ testResult.score }}/100</span>
          </div>
          <div class="test-metric">
            <span class="metric-label">GPU分数</span>
            <span class="metric-value">{{ testResult.gpuScore }}</span>
          </div>
          <div class="test-metric">
            <span class="metric-label">推荐模式</span>
            <span class="metric-value">{{ getModeText(testResult.recommendedMode) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 性能报告部分 -->
    <div class="report-section">
      <h4>性能报告</h4>
      <div class="report-actions">
        <button class="secondary-button" @click="generateReport">
          生成报告
        </button>
        <button class="secondary-button" @click="exportReport">
          导出数据
        </button>
      </div>
      
      <!-- 警告信息 -->
      <div v-if="currentWarnings.length > 0" class="warnings-section">
        <h5>性能警告</h5>
        <div class="warning-list">
          <div 
            v-for="(warning, index) in currentWarnings.slice(-3)" 
            :key="index"
            class="warning-item" 
            :class="warning.severity"
          >
            <span class="warning-icon">{{ warning.severity === 'critical' ? '⚠️' : '⚠' }}</span>
            <span class="warning-message">{{ warning.message }}</span>
            <small class="warning-action">{{ warning.recommendedAction }}</small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 重置按钮 -->
    <div class="reset-section">
      <button class="danger-button" @click="resetToDefaults">
        恢复默认设置
      </button>
    </div>
    
    <!-- 优化提示 -->
    <div class="tips-section">
      <h4>优化提示</h4>
      <ul class="tips-list">
        <li v-for="(tip, index) in optimizationTips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { 
  performanceOptimizationManager, 
  PerformanceMode 
} from '../utils/performanceOptimizationManager';
import { 
  devicePerformanceAnalyzer, 
  DevicePerformanceTier 
} from '../utils/devicePerformanceAnalyzer';
import { 
  performanceDataCollector, 
  PerformanceWarning 
} from '../utils/performanceDataCollector';
import { 
  sceneComplexityAnalyzer, 
  SceneComplexityLevel 
} from '../utils/sceneComplexityAnalyzer';
import { VISUALIZATION_CONFIG } from '../constants';

// 定义事件
const emit = defineEmits<{
  close: [];
  settingsChanged: [settings: Record<string, any>];
}>();

// 响应式状态
const isOptimizing = ref(false);
const isTesting = ref(false);
const autoModeEnabled = ref(false);
const selectedMode = ref<PerformanceMode>('medium');
const renderScale = ref(1.0);
const maxParticles = ref(200);
const fieldResolution = ref(20);
const shadowQuality = ref('medium');
const pixelRatio = ref<'auto' | number>('auto');
const testResult = ref<any>(null);
const currentWarnings = ref<PerformanceWarning[]>([]);
const currentStatus = ref({
  currentFPS: 0,
  currentFrameTime: 0,
  currentMemory: 0,
  isStable: true,
  lastWarning: null
});

// 设备信息
const deviceInfo = ref(devicePerformanceAnalyzer.getDeviceInfo());

// 性能模式选项
const performanceModes = [
  { label: '高性能', value: 'high' as PerformanceMode },
  { label: '平衡', value: 'medium' as PerformanceMode },
  { label: '省电', value: 'low' as PerformanceMode },
  { label: '自动', value: 'auto' as PerformanceMode }
];

// 优化提示
const optimizationTips = computed(() => {
  const tips: string[] = [];
  
  if (deviceInfo.value.deviceType === 'mobile') {
    tips.push('移动设备上建议使用省电模式以延长电池寿命');
  }
  
  if (currentStatus.value.currentFPS < 30) {
    tips.push('当前FPS较低，建议降低性能模式或减少场景复杂度');
  }
  
  if (currentStatus.value.currentMemory > 500) {
    tips.push('内存使用较高，考虑关闭其他应用或标签页');
  }
  
  if (autoModeEnabled.value) {
    tips.push('自动优化已启用，系统将根据性能自动调整设置');
  }
  
  return tips.length > 0 ? tips : ['当前设置已优化，保持良好的性能体验'];
});

// 初始化组件
onMounted(() => {
  // 设置引用关系
  performanceDataCollector.setPerformanceOptimizer(performanceOptimizationManager);
  
  // 加载当前设置
  loadCurrentSettings();
  
  // 开始性能数据收集
  performanceDataCollector.startCollection();
  
  // 定期更新性能状态
  startStatusUpdate();
  
  // 检查自动优化状态
  autoModeEnabled.value = performanceOptimizationManager.isAutoModeEnabled();
});

// 加载当前设置
function loadCurrentSettings() {
  const strategy = performanceOptimizationManager.getCurrentStrategy();
  selectedMode.value = performanceOptimizationManager.getCurrentMode();
  renderScale.value = strategy.renderScale || 1.0;
  maxParticles.value = strategy.particleCount || 200;
  fieldResolution.value = strategy.fieldResolution || 20;
  shadowQuality.value = strategy.shadowQuality || 'medium';
  pixelRatio.value = strategy.pixelRatio === 'auto' ? 'auto' : (strategy.pixelRatio || window.devicePixelRatio);
}

// 开始状态更新
function startStatusUpdate() {
  const updateInterval = setInterval(() => {
    // 更新性能状态
    const status = performanceDataCollector.getRealtimeStatus();
    currentStatus.value = status;
    
    // 更新警告列表
    currentWarnings.value = performanceDataCollector.getWarnings();
    
  }, 1000);
  
  // 清理函数
  const cleanup = () => clearInterval(updateInterval);
  
  // 组件卸载时清理
  const instance = getCurrentInstance();
  if (instance) {
    instance.proxy.$once('hook:beforeUnmount', cleanup);
  }
}

// 一键优化
async function runOneClickOptimization() {
  isOptimizing.value = true;
  
  try {
    // 1. 运行性能测试
    const result = await devicePerformanceAnalyzer.runPerformanceTest();
    testResult.value = result;
    
    // 2. 应用最佳设置
    devicePerformanceAnalyzer.applyOptimalSettings(performanceOptimizationManager);
    
    // 3. 分析场景复杂度并调整
    const complexityAnalysis = sceneComplexityAnalyzer.analyzeScene();
    
    // 4. 加载更新后的设置
    loadCurrentSettings();
    
    // 5. 触发设置变更事件
    emitSettingsChanged();
    
    console.log('一键优化完成:', { result, complexityAnalysis });
  } catch (error) {
    console.error('一键优化失败:', error);
  } finally {
    isOptimizing.value = false;
  }
}

// 切换自动优化模式
function toggleAutoMode() {
  performanceOptimizationManager.setAutoMode(autoModeEnabled.value);
  
  if (autoModeEnabled.value) {
    // 启动场景复杂度分析
    sceneComplexityAnalyzer.startAnalysis();
    console.log('自动优化已启用');
  } else {
    // 停止场景复杂度分析
    sceneComplexityAnalyzer.stopAnalysis();
    console.log('自动优化已禁用');
  }
}

// 更改性能模式
function changePerformanceMode(mode: PerformanceMode) {
  selectedMode.value = mode;
  performanceOptimizationManager.setPerformanceMode(mode);
  
  // 如果选择了自动模式，启用自动优化
  if (mode === 'auto') {
    autoModeEnabled.value = true;
    toggleAutoMode();
  }
  
  // 加载更新后的设置
  loadCurrentSettings();
  emitSettingsChanged();
}

// 更新渲染分辨率
function updateRenderScale() {
  performanceOptimizationManager.applyStrategy({ renderScale: renderScale.value });
  emitSettingsChanged();
}

// 更新最大粒子数
function updateMaxParticles() {
  performanceOptimizationManager.applyStrategy({ particleCount: maxParticles.value });
  emitSettingsChanged();
}

// 更新场分辨率
function updateFieldResolution() {
  performanceOptimizationManager.applyStrategy({ fieldResolution: fieldResolution.value });
  emitSettingsChanged();
}

// 更新阴影质量
function updateShadowQuality() {
  const enableShadows = shadowQuality.value !== 'none';
  performanceOptimizationManager.applyStrategy({
    shadowQuality: shadowQuality.value as 'high' | 'medium' | 'low',
    enableShadows
  });
  emitSettingsChanged();
}

// 更新像素比率
function updatePixelRatio() {
  const ratio = pixelRatio.value === 'auto' ? window.devicePixelRatio : pixelRatio.value;
  performanceOptimizationManager.applyStrategy({ 
    pixelRatio: pixelRatio.value === 'auto' ? 'auto' : ratio 
  });
  emitSettingsChanged();
}

// 运行性能测试
async function runPerformanceTest() {
  isTesting.value = true;
  
  try {
    const result = await devicePerformanceAnalyzer.runPerformanceTest();
    testResult.value = result;
    console.log('性能测试结果:', result);
  } catch (error) {
    console.error('性能测试失败:', error);
  } finally {
    isTesting.value = false;
  }
}

// 生成报告
function generateReport() {
  const summary = performanceDataCollector.getPerformanceSummary();
  const analysis = sceneComplexityAnalyzer.analyzeScene();
  
  const report = {
    performance: summary,
    complexity: analysis,
    device: deviceInfo.value,
    warnings: currentWarnings.value,
    generatedAt: new Date().toLocaleString()
  };
  
  console.log('性能报告:', report);
  
  // 显示简单的报告提示
  alert(`性能报告已生成:\n平均FPS: ${summary.averageFPS}\n性能评分: ${summary.performanceScore}\n场景复杂度: ${analysis.level}`);
}

// 导出报告
function exportReport() {
  const reportData = performanceDataCollector.exportPerformanceReport();
  const blob = new Blob([reportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-report-${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// 重置为默认设置
function resetToDefaults() {
  if (confirm('确定要恢复默认设置吗？')) {
    performanceOptimizationManager.resetToDefaults();
    loadCurrentSettings();
    emitSettingsChanged();
    console.log('已恢复默认设置');
  }
}

// 触发设置变更事件
function emitSettingsChanged() {
  emit('settingsChanged', {
    performanceMode: selectedMode.value,
    renderScale: renderScale.value,
    maxParticles: maxParticles.value,
    fieldResolution: fieldResolution.value,
    shadowQuality: shadowQuality.value,
    pixelRatio: pixelRatio.value,
    autoMode: autoModeEnabled.value
  });
}

// 获取FPS状态类
function getFPSClass(fps: number): string {
  if (fps >= 50) return 'excellent';
  if (fps >= 30) return 'good';
  if (fps >= 20) return 'fair';
  return 'poor';
}

// 获取内存状态类
function getMemoryClass(memory: number): string {
  if (memory < 300) return 'excellent';
  if (memory < 500) return 'good';
  if (memory < 800) return 'fair';
  return 'poor';
}

// 获取帧时间状态类
function getFrameTimeClass(frameTime: number): string {
  if (frameTime < 16) return 'excellent'; // 60fps
  if (frameTime < 33) return 'good';      // 30fps
  if (frameTime < 50) return 'fair';      // 20fps
  return 'poor';
}

// 获取整体状态类
function getStatusClass(): string {
  const fps = currentStatus.value.currentFPS;
  const memory = currentStatus.value.currentMemory;
  
  if (fps >= 45 && memory < 500) return 'status-excellent';
  if (fps >= 30 && memory < 800) return 'status-good';
  if (fps >= 20) return 'status-fair';
  return 'status-poor';
}

// 获取状态文本
function getStatusText(): string {
  const cls = getStatusClass();
  switch (cls) {
    case 'status-excellent': return '性能极佳';
    case 'status-good': return '性能良好';
    case 'status-fair': return '性能一般';
    case 'status-poor': return '性能较差';
    default: return '未知';
  }
}

// 获取性能级别类
function getTierClass(tier: DevicePerformanceTier): string {
  return `tier-${tier}`;
}

// 获取性能级别文本
function getTierText(tier: DevicePerformanceTier): string {
  const tierMap = {
    high: '高性能',
    medium: '中等性能',
    low: '低性能',
    unknown: '未知'
  };
  return tierMap[tier] || '未知';
}

// 获取模式文本
function getModeText(mode: PerformanceMode): string {
  const modeMap = {
    high: '高性能',
    medium: '平衡',
    low: '省电',
    auto: '自动'
  };
  return modeMap[mode] || '未知';
}
</script>

<style scoped>
.advanced-performance-panel {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 20px;
  color: #e0e0e0;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.panel-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #333;
  color: #fff;
}

/* 性能概览卡片 */
.performance-overview {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.performance-card, .device-card {
  background: #2d2d44;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #6366f1;
}

.card-title {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.metric {
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 5px;
}

.metric-value {
  display: block;
  font-size: 1.1rem;
  font-weight: bold;
}

/* 状态指示器 */
.status-indicator {
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-excellent { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.status-good { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.status-fair { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.status-poor { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

/* 指标状态颜色 */
.metric-value.excellent { color: #34d399; }
.metric-value.good { color: #10b981; }
.metric-value.fair { color: #f59e0b; }
.metric-value.poor { color: #ef4444; }

/* 设备信息 */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.info-label {
  color: #94a3b8;
}

.info-value {
  color: #e0e0e0;
  font-weight: 500;
}

/* 性能级别样式 */
.tier-high { color: #34d399; }
.tier-medium { color: #f59e0b; }
.tier-low { color: #ef4444; }
.tier-unknown { color: #94a3b8; }

/* 一键优化部分 */
.one-click-section {
  margin-bottom: 25px;
}

.optimize-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.primary-button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.primary-button:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.primary-button:disabled {
  background: #444;
  cursor: not-allowed;
  opacity: 0.7;
}

.secondary-button {
  background: #374151;
  color: #e0e0e0;
  border: 1px solid #4b5563;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.danger-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-button:hover {
  background: #b91c1c;
}

/* 自动模式开关 */
.auto-mode-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.auto-mode-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.auto-mode-container label {
  cursor: pointer;
  font-size: 0.9rem;
}

.tooltip {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 5px;
  background: #1e1e2e;
  color: #94a3b8;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
  border: 1px solid #333;
}

.auto-mode-container:hover .tooltip {
  opacity: 1;
}

/* 设置部分 */
.settings-section {
  margin-bottom: 25px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #94a3b8;
}

/* 模式选择器 */
.mode-selector {
  display: flex;
  gap: 5px;
}

.mode-button {
  flex: 1;
  padding: 8px 12px;
  background: #374151;
  border: 1px solid #4b5563;
  color: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.mode-button:hover {
  background: #4b5563;
}

.mode-button.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* 滑块容器 */
.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-container input[type="range"] {
  flex: 1;
  height: 6px;
  background: #374151;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
}

.slider-container input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-size: 0.85rem;
  color: #e0e0e0;
  font-weight: 500;
}

/* 下拉选择框 */
select {
  width: 100%;
  padding: 8px 12px;
  background: #374151;
  border: 1px solid #4b5563;
  color: #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #6366f1;
}

/* 测试和报告部分 */
.test-section, .report-section {
  margin-bottom: 25px;
}

.test-results {
  margin-top: 15px;
  padding: 15px;
  background: #2d2d44;
  border-radius: 6px;
  border-left: 4px solid #10b981;
}

.test-metrics {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.test-metric .metric-value {
  font-size: 1.2rem;
}

.report-actions {
  display: flex;
  gap: 10px;
}

/* 警告部分 */
.warnings-section {
  margin-top: 15px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.warning-item {
  padding: 10px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
}

.warning-item.warning {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
}

.warning-item.critical {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}

.warning-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.warning-message {
  flex: 1;
  color: #e0e0e0;
  font-weight: 500;
}

.warning-action {
  display: block;
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 2px;
}

/* 重置部分 */
.reset-section {
  margin-bottom: 25px;
  text-align: center;
}

/* 提示部分 */
.tips-section {
  background: #2d2d44;
  border-radius: 6px;
  padding: 15px;
  border-left: 4px solid #8b5cf6;
}

.tips-list {
  margin: 10px 0 0 0;
  padding-left: 20px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.tips-list li {
  margin-bottom: 5px;
}

/* 加载状态 */
.loading {
  display: inline-flex;
  align-items: center;
}

.loading::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-left: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .advanced-performance-panel {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .test-metrics {
    flex-direction: column;
    gap: 10px;
  }
  
  .report-actions {
    flex-direction: column;
  }
}
</style>
