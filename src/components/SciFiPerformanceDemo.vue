<template>
  <div class="scifi-performance-demo">
    <div class="demo-header">
      <h1 class="title">
        🚀 科幻级性能优化系统
        <span class="subtitle">AI + 量子计算 + 神经网络</span>
      </h1>
      <div class="status-panel">
        <div class="status-item">
          <span class="status-label">系统状态:</span>
          <span class="status-value" :class="systemHealthClass">
            {{ systemStatusLabel }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">性能评分:</span>
          <span class="status-value">{{ performanceScore }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">优化级别:</span>
          <span class="status-value">{{ optimizationLevel }}%</span>
        </div>
      </div>
    </div>

    <!-- 性能模式选择面板 -->
    <div class="mode-selector">
      <h2>🎯 性能模式选择</h2>
      <div class="mode-buttons">
        <button 
          v-for="mode in availableModes" 
          :key="mode.key"
          :class="['mode-btn', { active: currentMode === mode.mode.name }]"
          @click="switchMode(mode.key)"
        >
          {{ mode.mode.name }}
          <span class="mode-desc">{{ mode.mode.description }}</span>
        </button>
      </div>
    </div>

    <!-- 实时监控面板 -->
    <div class="monitor-panel" ref="monitorContainer">
      <h2>📊 实时性能监控</h2>
      <div class="monitor-content">
        <div class="metric-grid">
          <div class="metric-card">
            <h3>🖥️ CPU使用率</h3>
            <div class="progress-bar">
              <div class="progress" :style="{ width: cpuUsage + '%' }"></div>
            </div>
            <span class="metric-value">{{ cpuUsage }}%</span>
          </div>
          
          <div class="metric-card">
            <h3>🎮 GPU使用率</h3>
            <div class="progress-bar">
              <div class="progress" :style="{ width: gpuUsage + '%' }"></div>
            </div>
            <span class="metric-value">{{ gpuUsage }}%</span>
          </div>
          
          <div class="metric-card">
            <h3>💾 内存使用</h3>
            <div class="progress-bar">
              <div class="progress" :style="{ width: memoryUsage + '%' }"></div>
            </div>
            <span class="metric-value">{{ memoryUsage }}%</span>
          </div>
          
          <div class="metric-card">
            <h3>⚡ 帧率</h3>
            <div class="fps-value">{{ frameRate }} FPS</div>
            <div class="fps-target">目标: {{ targetFPS }} FPS</div>
          </div>
          
          <div class="metric-card">
            <h3>🌡️ 温度</h3>
            <div class="temperature-value">{{ temperature }}°C</div>
          </div>
          
          <div class="metric-card">
            <h3>🔋 功耗</h3>
            <div class="power-value">{{ energyConsumption }}W</div>
            <div class="carbon-footprint">碳足迹: {{ carbonFootprint }}g CO₂</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI和量子状态 -->
    <div class="tech-status">
      <h2>🤖 AI & 量子计算状态</h2>
      <div class="tech-grid">
        <div class="tech-item">
          <h3>🧠 AI引擎</h3>
          <div class="tech-status-item">
            <span>置信度:</span>
            <span class="tech-value">{{ (aiConfidence * 100).toFixed(1) }}%</span>
          </div>
          <div class="tech-status-item">
            <span>预测准确度:</span>
            <span class="tech-value">{{ neuralAccuracy }}%</span>
          </div>
        </div>
        
        <div class="tech-item">
          <h3>⚛️ 量子加速</h3>
          <div class="tech-status-item">
            <span>量子效率:</span>
            <span class="tech-value">{{ (quantumEfficiency * 100).toFixed(1) }}%</span>
          </div>
          <div class="tech-status-item">
            <span>叠加态:</span>
            <span class="tech-value">{{ quantumStates }} 态</span>
          </div>
        </div>
        
        <div class="tech-item">
          <h3>🔗 神经网络</h3>
          <div class="tech-status-item">
            <span>任务调度:</span>
            <span class="tech-value">{{ activeTasks }} 任务</span>
          </div>
          <div class="tech-status-item">
            <span>资源分配:</span>
            <span class="tech-value">{{ resourceUtilization }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h2>🎮 系统控制</h2>
      <div class="control-grid">
        <div class="control-item">
          <button 
            class="control-btn" 
            :class="{ active: autoOptimization }"
            @click="toggleAutoOptimization"
          >
            {{ autoOptimization ? '🤖 自动优化已启用' : '🤖 启用自动优化' }}
          </button>
        </div>
        
        <div class="control-item">
          <button class="control-btn" @click="startStressTest">
            🔥 启动压力测试
          </button>
        </div>
        
        <div class="control-item">
          <button class="control-btn" @click="enableEmergencyMode">
            🚨 紧急模式
          </button>
        </div>
        
        <div class="control-item">
          <button class="control-btn" @click="exportPerformanceReport">
            📋 导出报告
          </button>
        </div>
      </div>
    </div>

    <!-- 全息投影模式 -->
    <div class="hologram-toggle">
      <button 
        class="hologram-btn" 
        :class="{ active: hologramMode }"
        @click="toggleHologramMode"
      >
        {{ hologramMode ? '🌈 全息模式已启用' : '🌈 启用全息模式' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { startSciFiPerformance, enableQuantumMode } from '../utils';

// 系统状态
const systemStatus = ref(0);
const performanceScore = ref(100);
const optimizationLevel = ref(100);
const aiConfidence = ref(0.95);
const quantumEfficiency = ref(0.0);
const neuralAccuracy = ref(85);
const energyConsumption = ref(50);
const carbonFootprint = ref(0.5);
const cpuUsage = ref(25);
const gpuUsage = ref(30);
const memoryUsage = ref(45);
const frameRate = ref(60);
const temperature = ref(35);
const quantumStates = ref(8);
const activeTasks = ref(5);
const resourceUtilization = ref(78);

// 控制状态
const autoOptimization = ref(true);
const hologramMode = ref(false);
const currentMode = ref('量子超神模式');
const availableModes = ref<Array<{key: string, mode: any}>>([]);

// 系统引用
const sciFiSystem = ref<any>(null);
const monitorContainer = ref<HTMLDivElement>();

// 计算属性
const systemHealthClass = computed(() => {
  if (systemStatus.value >= 0.8) return 'excellent';
  if (systemStatus.value >= 0.6) return 'good';
  if (systemStatus.value >= 0.4) return 'fair';
  return 'poor';
});

const systemStatusLabel = computed(() => {
  if (systemStatus.value >= 0.8) return '优秀';
  if (systemStatus.value >= 0.6) return '良好';
  if (systemStatus.value >= 0.4) return '一般';
  return '需要优化';
});

const targetFPS = computed(() => {
  switch (currentMode.value) {
    case '游戏模式': return 60;
    case '开发模式': return 30;
    case '演示模式': return 30;
    case '节能模式': return 24;
    case '性能模式': return 120;
    case '量子超神模式': return 144;
    default: return 60;
  }
});

// 生命周期
onMounted(async () => {
  try {
    console.log('🚀 初始化科幻性能优化系统...');
    
    // 启动量子超神模式
    if (monitorContainer.value) {
      sciFiSystem.value = await enableQuantumMode(monitorContainer.value);
    } else {
      sciFiSystem.value = await startSciFiPerformance();
    }
    
    // 获取可用模式
    availableModes.value = sciFiSystem.value.getAvailableModes();
    
    // 监听系统事件
    sciFiSystem.value.on('optimization_complete', updateSystemMetrics);
    sciFiSystem.value.on('mode_switch', (data: any) => {
      currentMode.value = data.to;
      console.log('🔄 模式切换:', data);
    });
    
    // 启动监控更新
    startMetricsUpdate();
    
    console.log('✨ 科幻性能优化系统初始化完成');
    
  } catch (error) {
    console.error('❌ 系统初始化失败:', error);
  }
});

onUnmounted(() => {
  if (sciFiSystem.value) {
    sciFiSystem.value.dispose();
  }
});

// 模拟数据更新
let updateInterval: NodeJS.Timeout | null = null;

const startMetricsUpdate = () => {
  updateInterval = setInterval(() => {
    updateSystemMetrics();
  }, 1000);
};

const updateSystemMetrics = () => {
  // 模拟性能数据变化
  const variation = () => (Math.random() - 0.5) * 0.1;
  
  systemStatus.value = Math.max(0, Math.min(1, 0.8 + variation()));
  performanceScore.value = Math.max(60, Math.min(100, 95 + variation() * 20));
  optimizationLevel.value = Math.max(70, Math.min(100, 90 + variation() * 15));
  aiConfidence.value = Math.max(0.8, Math.min(1.0, 0.95 + variation()));
  quantumEfficiency.value = Math.max(0, Math.min(1.0, 0.7 + variation()));
  
  // 资源使用率
  cpuUsage.value = Math.max(10, Math.min(90, 35 + Math.random() * 30));
  gpuUsage.value = Math.max(10, Math.min(85, 40 + Math.random() * 35));
  memoryUsage.value = Math.max(20, Math.min(80, 50 + Math.random() * 25));
  
  // 性能和温度
  frameRate.value = Math.max(30, Math.min(144, 60 + Math.random() * 60));
  temperature.value = Math.max(25, Math.min(75, 35 + Math.random() * 30));
  
  // 能源
  energyConsumption.value = Math.max(30, Math.min(120, 60 + Math.random() * 40));
  carbonFootprint.value = energyConsumption.value * 0.0005;
};

// 事件处理方法
const switchMode = (modeKey: string) => {
  if (sciFiSystem.value) {
    sciFiSystem.value.switchMode(modeKey as any);
  }
};

const toggleAutoOptimization = () => {
  autoOptimization.value = !autoOptimization.value;
  if (sciFiSystem.value) {
    sciFiSystem.value.setAutoOptimization(autoOptimization.value);
  }
};

const toggleHologramMode = async () => {
  hologramMode.value = !hologramMode.value;
  
  if (hologramMode.value && monitorContainer.value) {
    console.log('🌈 启用全息模式');
    // 这里可以添加全息界面的特殊逻辑
  }
};

const startStressTest = () => {
  console.log('🔥 启动性能压力测试');
  // 实现压力测试逻辑
};

const enableEmergencyMode = () => {
  console.log('🚨 启用紧急模式');
  if (sciFiSystem.value) {
    sciFiSystem.value.switchMode('energySaving');
  }
};

const exportPerformanceReport = () => {
  if (sciFiSystem.value) {
    const report = sciFiSystem.value.getPerformanceReport();
    console.log('📋 性能报告:', report);
    
    // 导出为JSON
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sciFi-performance-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
</script>

<style scoped>
.scifi-performance-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #00ffff;
  padding: 2rem;
  font-family: 'Courier New', monospace;
}

/* 标题区域 */
.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff;
  animation: glow 2s ease-in-out infinite alternate;
}

.subtitle {
  display: block;
  font-size: 1.2rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

@keyframes glow {
  from { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; }
  to { text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff; }
}

/* 状态面板 */
.status-panel {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-value {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border: 2px solid #00ffff;
  border-radius: 8px;
  background: rgba(0, 255, 255, 0.1);
}

.status-value.excellent { color: #00ff00; border-color: #00ff00; }
.status-value.good { color: #ffff00; border-color: #ffff00; }
.status-value.fair { color: #ff8800; border-color: #ff8800; }
.status-value.poor { color: #ff0000; border-color: #ff0000; }

/* 模式选择器 */
.mode-selector {
  margin-bottom: 3rem;
}

.mode-selector h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.mode-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  border-radius: 12px;
  padding: 1.5rem;
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.mode-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
}

.mode-btn.active {
  background: rgba(0, 255, 255, 0.3);
  border-color: #ffff00;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.mode-btn .mode-desc {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 监控面板 */
.monitor-panel {
  margin-bottom: 3rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00ffff;
  border-radius: 16px;
  padding: 2rem;
  min-height: 300px;
}

.monitor-panel h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.metric-card h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ffff00);
  transition: width 0.3s ease;
  border-radius: 5px;
}

.metric-value, .fps-value, .temperature-value, .power-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffff00;
}

.fps-target {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.5rem;
}

.carbon-footprint {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.5rem;
}

/* 技术状态 */
.tech-status {
  margin-bottom: 3rem;
}

.tech-status h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.tech-item {
  background: rgba(255, 255, 0, 0.05);
  border: 1px solid rgba(255, 255, 0, 0.3);
  border-radius: 12px;
  padding: 2rem;
}

.tech-item h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ffff00;
}

.tech-status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.tech-value {
  color: #00ff00;
  font-weight: bold;
}

/* 控制面板 */
.control-panel {
  margin-bottom: 3rem;
}

.control-panel h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.control-btn {
  background: linear-gradient(45deg, #00ffff, #0088cc);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
}

.control-btn.active {
  background: linear-gradient(45deg, #ffff00, #ff8800);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
}

/* 全息按钮 */
.hologram-toggle {
  text-align: center;
}

.hologram-btn {
  background: linear-gradient(45deg, #ff00ff, #8800ff);
  border: none;
  border-radius: 25px;
  padding: 1rem 3rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.hologram-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 0, 255, 0.5);
}

.hologram-btn.active {
  background: linear-gradient(45deg, #00ffff, #ffffff);
  color: #000;
  animation: rainbow 2s linear infinite;
}

@keyframes rainbow {
  0% { background: linear-gradient(45deg, #ff00ff, #8800ff); }
  25% { background: linear-gradient(45deg, #0088ff, #0088ff); }
  50% { background: linear-gradient(45deg, #00ff88, #00ff88); }
  75% { background: linear-gradient(45deg, #ffff00, #ffff00); }
  100% { background: linear-gradient(45deg, #ff00ff, #8800ff); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scifi-performance-demo {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .status-panel {
    flex-direction: column;
    gap: 1rem;
  }
  
  .mode-buttons {
    grid-template-columns: 1fr;
  }
  
  .metric-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
  }
}
</style>