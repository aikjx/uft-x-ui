<template>
  <div class="performance-control-panel" :class="{ expanded: isExpanded }">
    <!-- 控制面板头部 -->
    <div class="panel-header" @click="toggleExpanded">
      <div class="panel-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
          <line x1="2" y1="20" x2="22" y2="20"></line>
        </svg>
        <span>性能控制</span>
      </div>
      <div class="expand-indicator" :class="{ expanded: isExpanded }">
        ▼
      </div>
    </div>
    
    <!-- 控制面板内容 -->
    <div v-if="isExpanded" class="panel-content">
      <!-- 性能指标显示 -->
      <div class="metrics-section">
        <h4>实时性能指标</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <label>FPS</label>
            <div class="metric-value" :class="fpsClass">{{ fps || 0 }}</div>
          </div>
          <div class="metric-item">
            <label>内存使用</label>
            <div class="metric-value memory">{{ memoryUsage || 0 }} MB</div>
          </div>
          <div class="metric-item">
            <label>内存峰值</label>
            <div class="metric-value memory-peak">{{ memoryPeak || 0 }} MB</div>
          </div>
          <div class="metric-item">
            <label>绘制调用</label>
            <div class="metric-value draw-calls">{{ drawCalls || 0 }}</div>
          </div>
          <div class="metric-item">
            <label>渲染时间</label>
            <div class="metric-value">{{ renderTime || 0 }} ms</div>
          </div>
          <div class="metric-item">
            <label>平均帧时间</label>
            <div class="metric-value">{{ avgFrameTime || 0 }} ms</div>
          </div>
        </div>
        
        <!-- 资源统计 -->
        <div class="resources-section" v-if="resourceCount">
          <h5>资源统计</h5>
          <div class="resource-grid">
            <div class="resource-item">
              <span class="resource-label">几何体:</span>
              <span class="resource-value">{{ resourceCount.geometries || 0 }}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">材质:</span>
              <span class="resource-value">{{ resourceCount.materials || 0 }}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">纹理:</span>
              <span class="resource-value">{{ resourceCount.textures || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 性能设置 -->
      <div class="settings-section">
        <h4>性能设置</h4>
        
        <!-- 性能模式选择 -->
        <div class="setting-item">
          <label>性能模式</label>
          <select v-model="localPerformanceMode" @change="updatePerformanceMode">
            <option value="high">高质量 - 最佳视觉效果</option>
            <option value="medium">平衡 - 性能与质量平衡</option>
            <option value="low">高性能 - 最佳流畅度</option>
          </select>
        </div>
        
        <!-- 自动优化开关 -->
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="autoOptimize" @change="updateAutoOptimize">
            <span>启用自动性能优化</span>
          </label>
        </div>
        
        <!-- 渲染分辨率设置 -->
        <div class="setting-item">
          <label>渲染分辨率</label>
          <input 
            type="range" 
            v-model.number="localRenderScale" 
            @change="updateRenderScale"
            min="0.5" 
            max="1.0" 
            step="0.1"
          >
          <span class="range-value">{{ (localRenderScale * 100).toFixed(0) }}%</span>
        </div>
        
        <!-- 粒子密度设置 -->
        <div class="setting-item">
          <label>粒子密度</label>
          <input 
            type="range" 
            v-model.number="particleDensity" 
            @change="updateParticleDensity"
            min="0.2" 
            max="1.0" 
            step="0.1"
          >
          <span class="range-value">{{ (particleDensity * 100).toFixed(0) }}%</span>
        </div>
        
        <!-- 特效开关 -->
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="enableEffects" @change="updateEffects">
            <span>启用视觉特效</span>
          </label>
        </div>
        
        <!-- 阴影开关 -->
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="enableShadows" @change="updateShadows">
            <span>启用阴影</span>
          </label>
        </div>
      </div>
      
      <!-- 性能操作按钮 -->
      <div class="actions-section">
        <button class="action-btn cleanup" @click="triggerCleanup">
          清理内存资源
        </button>
        <button class="action-btn reset" @click="resetSettings">
          重置性能设置
        </button>
      </div>
      
      <!-- 性能警告 -->
      <div v-if="performanceWarning" class="warning-section">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">{{ performanceWarning }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// 定义属性
const props = defineProps<{
  fps?: number;
  memoryUsage?: number;
  memoryPeak?: number;
  drawCalls?: number;
  renderTime?: number;
  avgFrameTime?: number;
  resourceCount?: {
    geometries?: number;
    materials?: number;
    textures?: number;
  };
  performanceMode?: string;
  renderScale?: number;
  performanceWarning?: string;
}>();

// 定义事件
const emit = defineEmits<{
  updatePerformanceMode: [mode: string];
  updateAutoOptimize: [enabled: boolean];
  updateRenderScale: [scale: number];
  updateParticleDensity: [density: number];
  updateEffects: [enabled: boolean];
  updateShadows: [enabled: boolean];
  cleanupResources: [];
  resetSettings: [];
}>();

// 组件状态
const isExpanded = ref(true);
const autoOptimize = ref(true);
const enableEffects = ref(true);
const enableShadows = ref(false);
const particleDensity = ref(1.0);
const localPerformanceMode = ref(props.performanceMode || 'medium');
const localRenderScale = ref(props.renderScale || 1.0);

// 计算FPS状态类
const fpsClass = computed(() => {
  if (!props.fps) return 'medium';
  if (props.fps >= 45) return 'high';
  if (props.fps >= 30) return 'medium';
  return 'low';
});

// 监听props变化
watch(() => props.performanceMode, (newMode) => {
  if (newMode) localPerformanceMode.value = newMode;
});

watch(() => props.renderScale, (newScale) => {
  if (newScale) localRenderScale.value = newScale;
});

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 更新性能设置
const updatePerformanceMode = () => {
  emit('updatePerformanceMode', localPerformanceMode.value);
  
  // 根据性能模式自动调整其他设置
  if (localPerformanceMode.value === 'low') {
    localRenderScale.value = 0.7;
    enableShadows.value = false;
    emit('updateRenderScale', 0.7);
    emit('updateShadows', false);
  } else if (localPerformanceMode.value === 'high') {
    localRenderScale.value = 1.0;
    emit('updateRenderScale', 1.0);
  }
};

const updateAutoOptimize = () => {
  emit('updateAutoOptimize', autoOptimize.value);
};

const updateRenderScale = () => {
  emit('updateRenderScale', localRenderScale.value);
};

const updateParticleDensity = () => {
  emit('updateParticleDensity', particleDensity.value);
};

const updateEffects = () => {
  emit('updateEffects', enableEffects.value);
};

const updateShadows = () => {
  emit('updateShadows', enableShadows.value);
};

// 触发内存清理
const triggerCleanup = () => {
  emit('cleanupResources');
};

// 重置设置
const resetSettings = () => {
  localPerformanceMode.value = 'medium';
  autoOptimize.value = true;
  localRenderScale.value = 1.0;
  particleDensity.value = 1.0;
  enableEffects.value = true;
  enableShadows.value = false;
  
  emit('resetSettings');
  emit('updatePerformanceMode', 'medium');
  emit('updateRenderScale', 1.0);
};
</script>

<style scoped>
.performance-control-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: #fff;
  z-index: 1000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s ease;
}

.panel-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.expand-indicator {
  transition: transform 0.3s ease;
  font-size: 12px;
}

.expand-indicator.expanded {
  transform: rotate(180deg);
}

.panel-content {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.metrics-section, .settings-section {
  margin-bottom: 20px;
}

h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #8884d8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

h5 {
  margin: 16px 0 8px 0;
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.metric-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.metric-item label {
  display: block;
  font-size: 11px;
  color: #aaa;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
}

.metric-value.high {
  color: #4ade80;
}

.metric-value.medium {
  color: #facc15;
}

.metric-value.low {
  color: #f87171;
}

.metric-value.memory {
  color: #60a5fa;
}

.metric-value.memory-peak {
  color: #fb923c;
}

.metric-value.draw-calls {
  color: #a78bfa;
}

.resources-section {
  margin-top: 16px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.resource-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}

.resource-label {
  display: block;
  font-size: 10px;
  color: #aaa;
  margin-bottom: 2px;
}

.resource-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4ade80;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item label {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.setting-item select {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
}

.setting-item select:focus {
  outline: none;
  border-color: #8884d8;
}

.setting-item input[type="range"] {
  flex: 1;
  margin: 0 10px;
  accent-color: #8884d8;
  cursor: pointer;
}

.range-value {
  font-size: 12px;
  color: #aaa;
  min-width: 40px;
  text-align: right;
}

.actions-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.cleanup {
  background: #60a5fa;
  color: white;
}

.action-btn.cleanup:hover {
  background: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.action-btn.reset {
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
  border: 1px solid #444;
}

.action-btn.reset:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: #666;
}

.warning-section {
  margin-top: 16px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid #f59e0b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.warning-text {
  font-size: 12px;
  color: #fcd34d;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-control-panel {
    width: calc(100vw - 40px);
    bottom: 10px;
    right: 10px;
  }
  
  .metric-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>