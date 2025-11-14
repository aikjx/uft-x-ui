<template>
  <div class="field-visualization-container">
    <div ref="canvasContainer" class="canvas-container"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel" :class="{collapsed: !panelExpanded}">
      <div class="panel-header">
        <h3>场论参数控制</h3>
        <button @click="togglePanelExpanded" class="panel-toggle">{{ panelExpanded ? '收起' : '展开' }}</button>
      </div>
      
      <div class="panel-content">
      <!-- 场类型选择和预设 -->
      <div class="control-group">
        <label>场类型:</label>
        <select v-model="fieldType" @change="updateFieldType" class="field-type-select">
          <option value="gravity">引力场</option>
          <option value="magnetic">磁场</option>
          <option value="electric">电场</option>
          <option value="wave">波场</option>
          <option value="quantum">量子场</option>
        </select>
      </div>
      
      <!-- 预设方案 -->
      <div class="preset-section">
        <h4>预设方案</h4>
        <div class="preset-buttons">
          <button @click="applyPreset('solarSystem')" class="preset-btn" :class="{active: activePreset === 'solarSystem'}">太阳系</button>
          <button @click="applyPreset('magneticField')" class="preset-btn" :class="{active: activePreset === 'magneticField'}">磁场环</button>
          <button @click="applyPreset('electricDipole')" class="preset-btn" :class="{active: activePreset === 'electricDipole'}">电偶极</button>
          <button @click="applyPreset('wavePropagation')" class="preset-btn" :class="{active: activePreset === 'wavePropagation'}">波传播</button>
          <button @click="applyPreset('quantumInterference')" class="preset-btn" :class="{active: activePreset === 'quantumInterference'}">量子干涉</button>
        </div>
      </div>
      
      <!-- 场强度 -->
      <div class="control-group">
        <label>场强度: {{ fieldStrength.toFixed(2) }}</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            v-model.number="fieldStrength" 
            @input="updateFieldStrength"
            :disabled="isParameterLocked('fieldStrength')"
            class="slider"
          >
          <button 
            @click="toggleParameterLock('fieldStrength')" 
            class="lock-btn" 
            :class="{locked: isParameterLocked('fieldStrength')}"
            title="锁定/解锁参数"
          >
            🔒
          </button>
        </div>
      </div>
      
      <!-- 粒子密度 -->
      <div class="control-group">
        <label>粒子密度: {{ particleDensity.toFixed(0) }}</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="50" 
            max="500" 
            step="10" 
            v-model.number="particleDensity" 
            @input="updateParticleDensity"
            class="slider"
          >
        </div>
      </div>
      
      <!-- 动画速度 -->
      <div class="control-group">
        <label>动画速度: {{ animationSpeed.toFixed(2) }}</label>
        <input 
          type="range" 
          min="0" 
          max="0.2" 
          step="0.01" 
          v-model.number="animationSpeed" 
          @input="updateAnimationSpeed"
        >
      </div>
      
      <!-- 场分辨率 -->
      <div class="control-group">
        <label>场分辨率: {{ fieldResolution.toFixed(0) }}x{{ fieldResolution.toFixed(0) }}</label>
        <input 
          type="range" 
          min="10" 
          max="50" 
          step="5" 
          v-model.number="fieldResolution" 
          @input="updateFieldResolution"
        >
      </div>
      
      <!-- 引力场参数控制 -->
      <div v-if="fieldType === 'gravity'" class="gravity-controls">
        <div class="control-group">
          <label>引力强度: {{ gravityStrength.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0" 
            max="50" 
            step="1" 
            v-model.number="gravityStrength" 
            @input="updateFieldType"
          >
        </div>
      </div>
      
      <!-- 磁场参数控制 -->
      <div v-if="fieldType === 'magnetic'" class="magnetic-controls">
        <div class="control-group">
          <label>磁场强度: {{ magneticStrength.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            v-model.number="magneticStrength" 
            @input="updateFieldType"
          >
        </div>
      </div>
      
      <!-- 电场参数控制 -->
      <div v-if="fieldType === 'electric'" class="electric-controls">
        <div class="control-group">
          <label>电场强度: {{ electricStrength.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            v-model.number="electricStrength" 
            @input="updateFieldType"
          >
        </div>
        <div class="control-group checkbox-control">
          <label>
            <input 
              type="checkbox" 
              v-model="isPositiveCharge" 
              @change="updateFieldType"
            >
            正电荷
          </label>
        </div>
      </div>
      
      <!-- 波场参数控制 -->
      <div v-if="fieldType === 'wave'" class="wave-controls">
        <div class="control-group">
          <label>波幅: {{ waveAmplitude.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0" 
            max="20" 
            step="0.5" 
            v-model.number="waveAmplitude" 
            @input="updateWaveAmplitude"
          >
        </div>
        <div class="control-group">
          <label>频率: {{ waveFrequency.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1" 
            v-model.number="waveFrequency" 
            @input="updateWaveFrequency"
          >
        </div>
        <div class="control-group">
          <label>波长: {{ waveLength.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0.5" 
            max="20" 
            step="0.5" 
            v-model.number="waveLength" 
            @input="updateWaveLength"
          >
        </div>
      </div>
      
      <!-- 量子场参数控制 -->
      <div v-if="fieldType === 'quantum'" class="quantum-controls">
        <div class="control-group">
          <label>量子强度: {{ quantumStrength.toFixed(0) }}</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            v-model.number="quantumStrength" 
            @input="updateQuantumStrength"
          >
        </div>
        <div class="control-group">
          <label>量子涨落: {{ quantumFluctuation.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.1" 
            v-model.number="quantumFluctuation" 
            @input="updateQuantumFluctuation"
          >
        </div>
        <div class="control-group">
          <label>频率: {{ quantumFrequency.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1" 
            v-model.number="quantumFrequency" 
            @input="updateFieldType"
          >
        </div>
        <div class="control-group">
          <label>波包宽度: {{ wavePacketWidth.toFixed(1) }}</label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1" 
            v-model.number="wavePacketWidth" 
            @input="updateFieldType"
          >
        </div>
        <div class="control-row">
          <div class="control-group">
            <label>波矢 X: {{ quantumWaveVectorX.toFixed(1) }}</label>
            <input 
              type="range" 
              min="-2" 
              max="2" 
              step="0.1" 
              v-model.number="quantumWaveVectorX" 
              @input="updateFieldType"
            >
          </div>
          <div class="control-group">
            <label>波矢 Y: {{ quantumWaveVectorY.toFixed(1) }}</label>
            <input 
              type="range" 
              min="-2" 
              max="2" 
              step="0.1" 
              v-model.number="quantumWaveVectorY" 
              @input="updateFieldType"
            >
          </div>
          <div class="control-group">
            <label>波矢 Z: {{ quantumWaveVectorZ.toFixed(1) }}</label>
            <input 
              type="range" 
              min="-2" 
              max="2" 
              step="0.1" 
              v-model.number="quantumWaveVectorZ" 
              @input="updateFieldType"
            >
          </div>
        </div>
      </div>
      
      <!-- 色彩映射 -->
      <div class="control-group">
        <label>色彩映射:</label>
        <select v-model="colorMap" @change="updateColorMap">
          <option value="viridis">Viridis</option>
          <option value="plasma">Plasma</option>
          <option value="magma">Magma</option>
          <option value="inferno">Inferno</option>
          <option value="cividis">Cividis</option>
        </select>
      </div>
      
      <!-- 视图控制 -->
      <div class="view-controls">
        <button @click="resetCamera" class="control-button">重置视角</button>
        <button @click="toggleGrid" class="control-button">{{ showGrid ? '隐藏网格' : '显示网格' }}</button>
        <button @click="toggleAxes" class="control-button">{{ showAxes ? '隐藏坐标轴' : '显示坐标轴' }}</button>
      </div>
    </div>
    
    <!-- 性能控制面板 -->
    <PerformanceControlPanel 
      :fps="fps"
      :fps-status="fpsStatus"
      :memory-usage="memoryUsage"
      :memory-peak="memoryPeak"
      :draw-calls="drawCalls"
      :resource-count="resourceCount"
      :performance-mode="performanceMode"
      :render-scale="renderScale"
      :auto-optimize-enabled="autoOptimizeEnabled"
      :shadow-quality="shadowQuality"
      :max-particles="maxParticles"
      :frame-skip-threshold="frameSkipThreshold"
      :is-mobile="isMobileDevice"
      @performance-mode-change="setPerformanceMode"
      @auto-optimize-change="handleAutoOptimizeChange"
      @render-scale-change="handleRenderScaleChange"
      @shadow-quality-change="handleShadowQualityChange"
      @max-particles-change="handleMaxParticlesChange"
      @frame-skip-threshold-change="handleFrameSkipThresholdChange"
      @clean-memory="cleanMemory"
      @reset-settings="handleResetSettings"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FieldTheoryService, FieldType, Particle, FieldParameters } from '../services/fieldTheoryService';
import { performanceMonitor, particleOptimizer, renderOptimizer } from '../../../../../src/utils/performanceUtils';
import PerformanceControlPanel from './PerformanceControlPanel.vue';

// 响应式状态
  const canvasContainer = ref<HTMLElement>();
  const fieldType = ref('gravity');
  const fieldStrength = ref(1.0);
  const particleDensity = ref(200);
  const animationSpeed = ref(0.03);
  // 性能控制面板相关状态
  const renderScale = ref(1.0);
  const autoOptimizeEnabled = ref(true);
  const shadowQuality = ref<'high' | 'medium' | 'low'>('medium');
  const maxParticles = ref(500);
  const frameSkipThreshold = ref(16); // 默认60fps的阈值（约16ms）
  const fieldResolution = ref(30);
  const colorMap = ref('viridis');
  const showGrid = ref(true);
  const showAxes = ref(true);
  // 控制面板增强
  const panelExpanded = ref(true);
  const activePreset = ref('');
  const lockedParameters = ref<Record<string, boolean>>({});
  
  // 设备信息和响应式优化
  const deviceType = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
  const isTouchDevice = ref(false);
  
  // 性能模式和自适应状态
  const performanceMode = ref<'high' | 'medium' | 'low'>('high');
  const isMobileDevice = ref(false);
  const isLowPerformanceDevice = ref(false);
  const adaptiveSettings = ref({ enabled: true });
  
  // 引力场参数
  const gravityStrength = ref(15);
  
  // 磁场参数
  const magneticStrength = ref(20);
  
  // 电场参数
  const electricStrength = ref(25);
  const isPositiveCharge = ref(true);
  
  // 波场参数
  const waveAmplitude = ref(8);
  const waveFrequency = ref(2.5);
  const waveLength = ref(4);
  
  // 量子场参数
  const quantumStrength = ref(35);
  const quantumFluctuation = ref(3.0);
  const quantumFrequency = ref(4.0);
  const wavePacketWidth = ref(1.5);
  const quantumWaveVectorX = ref(1.0);
  const quantumWaveVectorY = ref(1.0);
  const quantumWaveVectorZ = ref(0.5);

// 性能监控
const fps = ref(0);
const particlesCount = ref(0);
const renderTime = ref(0);
const lastFrameTime = ref(0);
const frameTimeHistory = ref<number[]>([]);
const avgFrameTime = ref(0);
const memoryUsage = ref(0);
const memoryPeak = ref(0); // 内存使用峰值
const drawCalls = ref(0);
const performanceSuggestions = ref<string[]>([]);
const performanceWarning = ref('');
const fpsStatus = ref<'high' | 'medium' | 'low'>('high');
// 资源计数
const resourceCount = ref({
  geometries: 0,
  materials: 0,
  textures: 0,
  renderTargets: 0
});
let frameIndex = 0;
let memoryCheckInterval: number | null = null;

// Three.js核心对象
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let particles: THREE.Points;
let particleSystem: THREE.BufferGeometry;
let particlePositions: Float32Array;
let particleColors: Float32Array;
let gridHelper: THREE.GridHelper;
let axesHelper: THREE.AxesHelper;
let animationFrameId: number;
let clock: THREE.Clock;

// 场论服务和粒子系统
let fieldService: FieldTheoryService;
let particlesArray: Particle[];
let time = 0;

// 色彩映射
const colorMaps = {
  viridis: [
    [0.267004, 0.004874, 0.329415],
    [0.275299, 0.194951, 0.497439],
    [0.173399, 0.359962, 0.556582],
    [0.092291, 0.495176, 0.548132],
    [0.116612, 0.63843, 0.499057],
    [0.296827, 0.767244, 0.384511],
    [0.599696, 0.860763, 0.195626],
    [0.993248, 0.906157, 0.143936]
  ],
  plasma: [
    [0.050383, 0.029803, 0.527975],
    [0.236496, 0.119594, 0.597853],
    [0.370313, 0.206325, 0.631354],
    [0.491541, 0.299218, 0.623869],
    [0.603575, 0.397864, 0.584678],
    [0.712015, 0.498512, 0.521777],
    [0.811424, 0.608579, 0.444241],
    [0.905755, 0.725942, 0.359367],
    [0.976866, 0.859239, 0.283214],
    [0.993248, 0.993248, 0.993248]
  ],
  magma: [
    [0.001462, 0.000466, 0.013866],
    [0.092702, 0.031427, 0.127718],
    [0.226195, 0.06666, 0.247691],
    [0.361704, 0.105333, 0.337935],
    [0.499132, 0.149295, 0.409017],
    [0.632375, 0.201033, 0.470551],
    [0.759849, 0.265039, 0.536198],
    [0.872266, 0.346051, 0.599461],
    [0.958317, 0.452785, 0.633682],
    [0.999911, 0.592426, 0.628871],
    [0.996278, 0.736331, 0.654174],
    [0.945312, 0.86431, 0.727974],
    [0.843807, 0.954323, 0.853881],
    [0.731508, 0.996078, 0.944614]
  ],
  inferno: [
    [0.000402, 0.000153, 0.001352],
    [0.114276, 0.016617, 0.104939],
    [0.229721, 0.053862, 0.176713],
    [0.344086, 0.089887, 0.209991],
    [0.456222, 0.127942, 0.226328],
    [0.564686, 0.169547, 0.234017],
    [0.668092, 0.216084, 0.233609],
    [0.765581, 0.268978, 0.225185],
    [0.856023, 0.329648, 0.208633],
    [0.937573, 0.399939, 0.183577],
    [0.999205, 0.483479, 0.148996],
    [0.993364, 0.583668, 0.230802],
    [0.975692, 0.68748, 0.324981],
    [0.946467, 0.792376, 0.430213],
    [0.906633, 0.896075, 0.545026],
    [0.856857, 0.997015, 0.669315]
  ],
  cividis: [
    [0.002985, 0.001771, 0.001097],
    [0.116049, 0.070004, 0.094502],
    [0.171597, 0.164299, 0.203816],
    [0.198639, 0.264928, 0.301997],
    [0.200561, 0.368299, 0.392615],
    [0.233261, 0.471055, 0.470178],
    [0.332501, 0.568131, 0.528225],
    [0.462653, 0.656789, 0.565731],
    [0.613265, 0.734941, 0.579917],
    [0.770821, 0.800211, 0.571735],
    [0.906403, 0.849462, 0.566602],
    [0.967945, 0.897072, 0.678759],
    [0.982846, 0.941114, 0.799148],
    [0.997038, 0.982326, 0.916474]
  ]
};

// 启动内存监控
const startMemoryMonitoring = () => {
  // 清除可能存在的旧定时器
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
  }
  
  // 每秒检查一次内存使用
  memoryCheckInterval = window.setInterval(() => {
    const currentMemory = memoryUsage.value;
    memoryPeak.value = Math.max(memoryPeak.value, currentMemory);
    
    // 内存使用警告
    if (currentMemory > 500) {
      console.warn(`内存使用过高: ${currentMemory.toFixed(2)}MB`);
      // 当内存使用过高时，尝试优化
      if (currentMemory > 800 && performanceMode.value !== 'low') {
        console.warn('强制降低性能模式以减少内存使用');
        performanceMode.value = 'low';
      }
    }
    
    // 更新资源计数
    updateResourceCount();
  }, 1000);
};

// 更新资源计数
const updateResourceCount = () => {
  if (renderer) {
    try {
      // 使用Three.js的内部统计（如果可用）
      if ('info' in renderer) {
        const info = (renderer as any).info;
        if (info) {
          resourceCount.value = {
            geometries: info.memory.geometries || 0,
            materials: info.memory.materials || 0,
            textures: info.memory.textures || 0,
            renderTargets: info.memory.renderTargets || 0
          };
        }
      }
    } catch (error) {
      console.error('更新资源计数时出错:', error);
    }
  }
};

// 手动触发资源清理
const cleanupResources = () => {
  console.log('执行资源清理...');
  
  // 清理可能泄露的粒子系统
  if (particlesArray) {
    particlesArray = [];
  }
  
  // 清理场效果网格
  if (fieldEffectMesh) {
    if (scene && fieldEffectMesh.parent === scene) {
      scene.remove(fieldEffectMesh);
    }
    if (fieldEffectMesh.geometry) {
      fieldEffectMesh.geometry.dispose();
    }
    if (fieldEffectMesh.material) {
      (fieldEffectMesh.material as THREE.Material).dispose();
    }
    fieldEffectMesh = null as any;
  }
  
  // 清理缓存（如果有）
  if (fieldService) {
    try {
      (fieldService as any).clearCache();
    } catch (error) {
      console.error('清理场服务缓存时出错:', error);
    }
  }
  
  // 触发垃圾回收（如果浏览器支持）
  if (window.gc && typeof window.gc === 'function') {
    try {
      window.gc();
      console.log('已触发垃圾回收');
    } catch (error) {
      console.log('无法触发垃圾回收:', error);
    }
  }
  
  console.log('资源清理完成');
};

// 初始化场景优化
const initScene = () => {
  if (!canvasContainer.value) return;
  
  // 检测设备性能
  detectDevicePerformance();
  
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  
  // 优化相机设置
  const aspectRatio = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight;
  camera = new THREE.PerspectiveCamera(
    isMobileDevice.value ? 65 : 75,
    aspectRatio,
    0.1,
    1000
  );
  camera.position.z = 15;
  camera.position.y = 10;
  camera.position.x = 10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  // 优化渲染器设置
  const rendererOptions: THREE.WebGLRendererParameters = {
    antialias: performanceMode.value !== 'low', // 在低性能模式下禁用抗锯齿
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  };
  
  renderer = new THREE.WebGLRenderer(rendererOptions);
  
  // 根据性能模式设置渲染分辨率
  const renderScale = performanceMode.value === 'high' ? 1 : (performanceMode.value === 'medium' ? 0.8 : 0.6);
  const targetWidth = Math.floor(canvasContainer.value.clientWidth * renderScale);
  const targetHeight = Math.floor(canvasContainer.value.clientHeight * renderScale);
  
  renderer.setSize(targetWidth, targetHeight);
  renderer.domElement.style.width = `${canvasContainer.value.clientWidth}px`;
  renderer.domElement.style.height = `${canvasContainer.value.clientHeight}px`;
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceMode.value === 'high' ? 2 : 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  // 性能优化设置
  renderer.toneMapping = performanceMode.value === 'high' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  renderer.shadowMap.enabled = false; // 禁用阴影以提高性能
  renderer.autoClear = true;
  renderer.autoClearColor = true;
  
  canvasContainer.value.appendChild(renderer.domElement);
  
  // 优化控制器设置
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = performanceMode.value !== 'low'; // 在低性能模式下禁用阻尼
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.enableZoom = true;
  controls.enablePan = true;
  
  // 根据性能模式调整控制器灵敏度
  controls.rotateSpeed = performanceMode.value === 'high' ? 1.0 : 0.8;
  controls.zoomSpeed = performanceMode.value === 'high' ? 1.0 : 0.8;
  controls.panSpeed = performanceMode.value === 'high' ? 1.0 : 0.8;
  
  // 添加网格辅助（根据性能模式调整复杂度）
  const gridSize = performanceMode.value === 'high' ? 20 : 15;
  const gridDivisions = performanceMode.value === 'high' ? 20 : 10;
  gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x333355, 0x222233);
  scene.add(gridHelper);
  
  // 添加坐标轴
  axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
  
  // 初始化场论服务
  fieldService = FieldTheoryService.getInstance();
  
  // 初始化性能模式下的参数
  setPerformanceMode(performanceMode.value);
  
  // 创建粒子系统
  createParticleSystem();
  
  // 添加光源（简化光源设置以提高性能）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // 在低性能模式下减少光源数量和强度
  if (performanceMode.value !== 'low') {
    const directionalLight = new THREE.DirectionalLight(0xffffff, performanceMode.value === 'high' ? 1 : 0.7);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
  }
  
  // 初始化时钟和性能监控
  clock = new THREE.Clock();
  lastFrameTime.value = Date.now();
  
  // 启动动画循环
  animate();
  
  // 初始化设备检测
  initializeDeviceDetection();
  detectDeviceOrientation();
  
  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize);
  
  // 监听设备方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      onWindowResize();
      detectDeviceOrientation();
    }, 100); // 添加小延迟确保尺寸更新完成
  });
  
  // 监听触摸事件以优化触屏体验
  if (isTouchDevice.value) {
    renderer.domElement.addEventListener('touchstart', () => {
      // 在触摸时临时禁用某些性能密集型效果
      if (particles && particles.material) {
        const material = particles.material as THREE.PointsMaterial;
        const originalSize = material.size;
        material.size = Math.max(originalSize * 0.8, 1.0);
        
        // 触摸结束后恢复
        setTimeout(() => {
          if (particles && particles.material) {
            (particles.material as THREE.PointsMaterial).size = originalSize;
          }
        }, 200);
      }
    }, { passive: true });
  }
};

// 创建粒子系统
const createParticleSystem = () => {
  // 使用粒子优化器确定初始粒子数量
  const baseCount = particleDensity.value;
  const optimizedCount = particleOptimizer.getOptimalParticleCount(baseCount, performanceMode.value, camera.position.length());
  const count = optimizedCount;
  particlesCount.value = count;
  
  console.log(`创建粒子系统: 基础数量=${baseCount}, 优化后数量=${count}, 性能模式=${performanceMode.value}, 相机距离=${camera.position.length().toFixed(2)}`);
  
  // 使用场论服务初始化粒子
  const bounds = {
    min: new THREE.Vector3(-8, -8, -8),
    max: new THREE.Vector3(8, 8, 8)
  };
  
  particlesArray = fieldService.initializeParticles(
    count,
    bounds,
    FieldType[fieldType.value.toUpperCase() as keyof typeof FieldType]
  );
  
  // 创建缓冲区几何体
  particleSystem = new THREE.BufferGeometry();
  particlePositions = new Float32Array(count * 3);
  particleColors = new Float32Array(count * 3);
  
  // 将粒子数据填充到缓冲区
  for (let i = 0; i < count; i++) {
    const index = i * 3;
    const particle = particlesArray[i];
    
    particlePositions[index] = particle.position.x;
    particlePositions[index + 1] = particle.position.y;
    particlePositions[index + 2] = particle.position.z;
    
    particleColors[index] = particle.color.r;
    particleColors[index + 1] = particle.color.g;
    particleColors[index + 2] = particle.color.b;
  }
  
  particleSystem.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleSystem.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  
  // 创建材质
  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    // 添加发光效果
    fog: true
  });
  
  // 为不同场类型设置不同的粒子大小
  const sizeMap = {
    gravity: 0.08,
    magnetic: 0.06,
    electric: 0.07,
    wave: 0.09,
    quantum: 0.1
  };
  
  if (sizeMap[fieldType.value as keyof typeof sizeMap]) {
    (material as THREE.PointsMaterial).size = sizeMap[fieldType.value as keyof typeof sizeMap];
  }
  
  particles = new THREE.Points(particleSystem, material);
  scene.add(particles);
};

// 优化的粒子系统更新
// 平滑调整粒子数量的辅助变量
let targetParticlesCount = 0;
let currentParticlesCount = 0;
let particlesTransitionProgress = 0;
let needsParticleCountUpdate = false;

const updateParticleSystem = () => {
  if (!particles || !particleSystem || !particlesArray) return;
  
  const delta = clock.getDelta();
  time += delta * animationSpeed.value;
  
  // 每帧更新时检查并优化粒子数量
  if (frameIndex % 30 === 0 || needsParticleCountUpdate) {
    const cameraDistance = camera.position.length();
    const baseCount = particleDensity.value;
    const newOptimalCount = particleOptimizer.getOptimalParticleCount(baseCount, performanceMode.value, cameraDistance);
    
    // 如果优化后的粒子数量与当前有显著差异，则开始平滑过渡
    if (Math.abs(newOptimalCount - particlesArray.length) > baseCount * 0.1) {
      targetParticlesCount = newOptimalCount;
      currentParticlesCount = particlesArray.length;
      particlesTransitionProgress = 0;
      needsParticleCountUpdate = true;
      console.log(`优化粒子数量: 当前=${particlesArray.length}, 目标=${targetParticlesCount}, 相机距离=${cameraDistance.toFixed(2)}`);
    }
  }
  
  // 平滑过渡粒子数量
  if (needsParticleCountUpdate) {
    particlesTransitionProgress += delta * 1.5; // 过渡速度
    if (particlesTransitionProgress >= 1) {
      particlesTransitionProgress = 1;
      needsParticleCountUpdate = false;
    }
    
    // 使用缓动函数使过渡更自然
    const easeProgress = 1 - Math.pow(1 - particlesTransitionProgress, 3);
    const newCount = Math.floor(currentParticlesCount + (targetParticlesCount - currentParticlesCount) * easeProgress);
    
    // 更新粒子数量（添加或移除粒子）
    if (newCount !== particlesArray.length && newCount > 0) {
      const bounds = {
        min: new THREE.Vector3(-8, -8, -8),
        max: new THREE.Vector3(8, 8, 8)
      };
      
      // 调整粒子数组大小
      particlesArray = fieldService.resizeParticlesArray(
        particlesArray,
        newCount,
        bounds,
        FieldType[fieldType.value.toUpperCase() as keyof typeof FieldType]
      );
      
      // 更新缓冲区大小
      const newPositions = new Float32Array(newCount * 3);
      const newColors = new Float32Array(newCount * 3);
      
      // 复制现有数据
      const positionAttr = particleSystem.attributes.position;
      const colorAttr = particleSystem.attributes.color;
      const oldPositions = positionAttr.array as Float32Array;
      const oldColors = colorAttr.array as Float32Array;
      
      const copyCount = Math.min(particlesArray.length, oldPositions.length / 3) * 3;
      for (let i = 0; i < copyCount; i++) {
        newPositions[i] = oldPositions[i];
        newColors[i] = oldColors[i];
      }
      
      // 更新属性
      positionAttr.array = newPositions;
      colorAttr.array = newColors;
      positionAttr.count = newCount;
      colorAttr.count = newCount;
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      
      // 更新粒子材质大小，根据粒子数量进行优化
      const material = particles.material as THREE.PointsMaterial;
      const sizeFactor = Math.min(1, Math.sqrt(baseCount / newCount) * 0.9);
      const baseSize = 0.08;
      
      const sizeMap = {
        gravity: 0.08 * sizeFactor,
        magnetic: 0.06 * sizeFactor,
        electric: 0.07 * sizeFactor,
        wave: 0.09 * sizeFactor,
        quantum: 0.1 * sizeFactor
      };
      
      if (sizeMap[fieldType.value as keyof typeof sizeMap]) {
        material.size = sizeMap[fieldType.value as keyof typeof sizeMap];
      } else {
        material.size = baseSize * sizeFactor;
      }
      
      particlesCount.value = newCount;
    }
  }
  
  // 准备场参数
  const fieldParams: FieldParameters = {
    type: FieldType[fieldType.value.toUpperCase() as keyof typeof FieldType],
    strength: fieldStrength.value,
    resolution: fieldResolution.value,
    time: time,
    additionalParams: {}
  };
  
  // 根据场类型设置特定参数
  switch (fieldType.value) {
    case 'gravity':
      fieldParams.additionalParams = {
        gravityStrength: gravityStrength.value
      };
      break;
    case 'magnetic':
      fieldParams.additionalParams = {
        magneticStrength: magneticStrength.value
      };
      break;
    case 'electric':
      fieldParams.additionalParams = {
        electricStrength: electricStrength.value,
        isPositiveCharge: isPositiveCharge.value
      };
      break;
    case 'wave':
      fieldParams.additionalParams = {
        waveAmplitude: waveAmplitude.value,
        waveFrequency: waveFrequency.value,
        waveLength: waveLength.value
      };
      break;
    case 'quantum':
      fieldParams.additionalParams = {
        quantumStrength: quantumStrength.value,
        quantumFluctuation: quantumFluctuation.value,
        quantumFrequency: quantumFrequency.value,
        wavePacketWidth: wavePacketWidth.value,
        quantumWaveVectorX: quantumWaveVectorX.value,
        quantumWaveVectorY: quantumWaveVectorY.value,
        quantumWaveVectorZ: quantumWaveVectorZ.value
      };
      break;
  }
  
  // 使用场论服务更新粒子
  fieldService.updateParticles(particlesArray, delta, fieldParams);
  
  // 更新缓冲区数据 - 使用批处理和数据视图优化性能
  const positionAttr = particleSystem.attributes.position;
  const colorAttr = particleSystem.attributes.color;
  const positionArray = positionAttr.array as Float32Array;
  const colorArray = colorAttr.array as Float32Array;
  
  // 批量更新粒子数据，减少重复访问
  // 使用粒子优化器的LOD逻辑优化渲染
  const cameraDistance = camera.position.length();
  const lodLevel = particleOptimizer.getLODLevel(cameraDistance);
  const step = Math.max(1, lodLevel); // 根据LOD级别决定步长
  
  // 对于远距离，只更新和渲染部分粒子
  for (let i = 0; i < particlesArray.length; i += step) {
    const index = i * 3;
    const particle = particlesArray[i];
    
    // 优化的边界检查和处理
    const maxDistance = 15;
    const distance = particle.position.length();
    
    if (distance > maxDistance) {
      // 归一化并限制
      particle.position.normalize().multiplyScalar(maxDistance);
      // 反射速度
      particle.velocity.multiplyScalar(-0.5);
    }
    
    // 批量更新缓冲区 - 直接操作数组提升性能
    positionArray[index] = particle.position.x;
    positionArray[index + 1] = particle.position.y;
    positionArray[index + 2] = particle.position.z;
    
    colorArray[index] = particle.color.r;
    colorArray[index + 1] = particle.color.g;
    colorArray[index + 2] = particle.color.b;
  }
  
  // 一次性更新属性标记
  positionAttr.needsUpdate = true;
  colorAttr.needsUpdate = true;
};

// 场渲染优化：根据场类型添加特殊效果
let fieldEffectMesh: THREE.Mesh | null = null;
const updateFieldEffects = () => {
  // 移除旧的效果网格
  if (fieldEffectMesh && scene) {
    scene.remove(fieldEffectMesh);
    fieldEffectMesh.geometry.dispose();
    (fieldEffectMesh.material as THREE.Material).dispose();
    fieldEffectMesh = null;
  }
  
  // 只在高性能模式且粒子数量适中时添加效果
  if (performanceMode.value !== 'high' || particleDensity.value < 150) {
    return;
  }
  
  // 根据场类型添加不同的视觉效果
  switch (fieldType.value) {
    case 'magnetic':
      // 添加磁场线效果
      if (scene) {
        const torusGeometry = new THREE.TorusGeometry(6, 0.1, 8, 64);
        const torusMaterial = new THREE.MeshBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.3
        });
        fieldEffectMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        fieldEffectMesh.rotation.x = Math.PI / 2;
        scene.add(fieldEffectMesh);
      }
      break;
    case 'electric':
      // 添加电场辐射效果
      if (scene) {
        const sphereGeometry = new THREE.SphereGeometry(8, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: isPositiveCharge.value ? 0xef4444 : 0x3b82f6,
          wireframe: true,
          transparent: true,
          opacity: 0.15
        });
        fieldEffectMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(fieldEffectMesh);
      }
      break;
    case 'wave':
      // 添加波场效果
      if (scene) {
        const planeGeometry = new THREE.PlaneGeometry(15, 15, 32, 32);
        const planeMaterial = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
          wireframe: true
        });
        fieldEffectMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        scene.add(fieldEffectMesh);
      }
      break;
  }
};

// 重置时间
const resetTime = () => {
  time = 0;
};

// 颜色映射插值
const interpolateColorMap = (value: number): [number, number, number] => {
  const colors = colorMaps[colorMap.value as keyof typeof colorMaps];
  if (!colors) return [1, 1, 1];
  
  // 确保值在0-1范围内
  const clampedValue = Math.max(0, Math.min(1, value));
  
  // 计算插值位置
  const position = clampedValue * (colors.length - 1);
  const index = Math.floor(position);
  const fractionalPart = position - index;
  
  // 如果到达边界
  if (index >= colors.length - 1) {
    return colors[colors.length - 1];
  }
  
  // 线性插值
  const color1 = colors[index];
  const color2 = colors[index + 1];
  
  return [
    color1[0] + (color2[0] - color1[0]) * fractionalPart,
    color1[1] + (color2[1] - color1[1]) * fractionalPart,
    color1[2] + (color2[2] - color1[2]) * fractionalPart
  ];
};

// 性能检测和优化函数
const detectDevicePerformance = () => {
  // 启动内存监控
  startMemoryMonitoring();
  // 检测是否为移动设备
  isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 检测设备性能
  const performance = window.performance || (window as any).msPerformance || (window as any).webkitPerformance;
  if (performance) {
    // 使用简单的性能启发式方法
    const memoryInfo = (window as any).performance?.memory;
    if (memoryInfo) {
      memoryUsage.value = memoryInfo.usedJSHeapSize / 1024 / 1024; // 转换为MB
    }
    
    // 对于移动设备默认使用中等性能模式
    if (isMobileDevice.value) {
      isLowPerformanceDevice.value = true;
      if (adaptiveSettings.value.enabled) {
        setPerformanceMode('medium');
      }
    }
  }
};

const adjustPerformanceSettings = () => {
  // 根据FPS自动调整性能设置
  if (!adaptiveSettings.value.enabled) return;
  
  // 低FPS触发性能调整
  if (fps.value < 20 && performanceMode.value !== 'low') {
    setPerformanceMode('low');
    performanceWarning.value = '性能较低，已切换至低性能模式';
    setTimeout(() => { performanceWarning.value = ''; }, 5000);
  } 
  // 高FPS且设备性能允许时提高性能
  else if (fps.value > 50 && performanceMode.value === 'low' && !isLowPerformanceDevice.value) {
    setPerformanceMode('medium');
  }
};

const setPerformanceMode = (mode: 'high' | 'medium' | 'low') => {
  performanceMode.value = mode;
  
  switch (mode) {
    case 'high':
      fieldResolution.value = isMobileDevice.value ? 25 : 30;
      particleDensity.value = isMobileDevice.value ? 250 : 300;
      (particles?.material as THREE.PointsMaterial).size = 0.09;
      renderScale.value = 1.0;
      shadowQuality.value = 'high';
      break;
    case 'medium':
      fieldResolution.value = 20;
      particleDensity.value = 200;
      (particles?.material as THREE.PointsMaterial).size = 0.07;
      renderScale.value = 0.8;
      shadowQuality.value = 'medium';
      break;
    case 'low':
      fieldResolution.value = 15;
      particleDensity.value = 100;
      (particles?.material as THREE.PointsMaterial).size = 0.05;
      renderScale.value = 0.6;
      shadowQuality.value = 'low';
      break;
  }
  
  // 应用性能设置
  if (particles && particles.material) {
    gsap.to((particles.material as THREE.PointsMaterial), {
      opacity: 0.3,
      duration: 300,
      onComplete: () => {
        updateFieldType();
        gsap.to((particles?.material as THREE.PointsMaterial), {
          opacity: 0.9,
          duration: 500
        });
      }
    });
  }
};

// 性能控制面板事件处理函数
const handleAutoOptimizeChange = (enabled: boolean) => {
  autoOptimizeEnabled.value = enabled;
  if (autoOptimizeEnabled.value) {
    renderOptimizer.enableDynamicResolution = true;
    renderOptimizer.enableFrameSkipping = true;
  } else {
    renderOptimizer.enableDynamicResolution = false;
    renderOptimizer.enableFrameSkipping = false;
    // 恢复默认渲染分辨率
    renderScale.value = 1.0;
  }
};

const handleRenderScaleChange = (scale: number) => {
  renderScale.value = scale;
  // 禁用自动优化
  if (autoOptimizeEnabled.value) {
    autoOptimizeEnabled.value = false;
    renderOptimizer.enableDynamicResolution = false;
  }
  // 应用新的渲染分辨率
  if (renderer && canvasContainer.value) {
    const width = canvasContainer.value.clientWidth * scale;
    const height = canvasContainer.value.clientHeight * scale;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
};

const handleShadowQualityChange = (quality: 'high' | 'medium' | 'low') => {
  shadowQuality.value = quality;
  renderOptimizer.setShadowQuality(quality);
};

const handleMaxParticlesChange = (max: number) => {
  maxParticles.value = max;
  particleOptimizer.setMaxParticles(max);
  // 如果当前粒子密度超过最大值，调整粒子密度
  if (particleDensity.value > max) {
    particleDensity.value = max;
    updateFieldType();
  }
};

const handleFrameSkipThresholdChange = (threshold: number) => {
  frameSkipThreshold.value = threshold;
  renderOptimizer.setFrameSkipThreshold(threshold);
};

const handleResetSettings = () => {
  // 重置性能设置到默认值
  autoOptimizeEnabled.value = true;
  renderScale.value = 1.0;
  shadowQuality.value = 'medium';
  maxParticles.value = 500;
  frameSkipThreshold.value = 16;
  
  // 重新启用自动优化
  renderOptimizer.enableDynamicResolution = true;
  renderOptimizer.enableFrameSkipping = true;
  renderOptimizer.setShadowQuality('medium');
  renderOptimizer.setFrameSkipThreshold(16);
  particleOptimizer.setMaxParticles(500);
  
  // 重置性能模式
  setPerformanceMode('medium');
};

// 动画循环优化
let lastTime = 0;
let frames = 0;
const animate = () => {
  const currentTime = Date.now();
  
  // 计算FPS
  frames++;
  if (currentTime - lastTime >= 1000) {
    // 使用performanceMonitor更新FPS
    fps.value = performanceMonitor.updateFPS();
    
    // 更新FPS状态
    if (fps.value >= 45) fpsStatus.value = 'high';
    else if (fps.value >= 30) fpsStatus.value = 'medium';
    else fpsStatus.value = 'low';
    
    // 自动调整性能
    adjustPerformanceSettings();
    
    // 获取性能模式并更新
    const isMonitorPerformanceMode = performanceMonitor.getPerformanceMode();
    if (isMonitorPerformanceMode && performanceMode.value !== 'low') {
      setPerformanceMode('low');
      performanceWarning.value = '性能较低，已自动切换至低性能模式';
      setTimeout(() => { performanceWarning.value = ''; }, 5000);
    } else if (!isMonitorPerformanceMode && performanceMode.value === 'low' && !isLowPerformanceDevice.value) {
      setPerformanceMode('medium');
    }
    
    // 更新内存使用信息
    // 每30帧进行一次内存优化检查
    if (frames % 30 === 0) {
      const memoryInfo = (window as any).performance?.memory;
      if (memoryInfo) {
        const currentMemoryMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        memoryUsage.value = Math.round(currentMemoryMB * 10) / 10; // 保留一位小数
        
        // 更新内存峰值
        if (!memoryPeak.value) memoryPeak.value = 0;
        memoryPeak.value = Math.max(memoryPeak.value, memoryUsage.value);
        
        // 当内存使用过高时，自动触发资源清理
        if (currentMemoryMB > 600 && frames % 180 === 0) { // 每6秒执行一次清理
          console.log('动画循环中检测到内存使用过高，触发资源清理');
          cleanupResources();
        }
      }
      
      // 更新资源计数
      if (renderer?.info?.memory && !resourceCount.value) {
        resourceCount.value = {
          geometries: renderer.info.memory.geometries,
          materials: scene.children.reduce((count, child) => {
            return count + (child.material ? 1 : 0);
          }, 0),
          textures: renderer.info.memory.textures
        };
      }
      
      // 更新渲染分辨率缩放
      if (!renderScale.value) renderScale.value = 1;
      renderScale.value = renderOptimizer.calculateRenderScale(fps.value, renderScale.value, performanceMode.value === 'low');
    }
    const geometriesCount = scene ? scene.children.length : 0;
    const texturesCount = renderer?.info?.memory?.textures || 0;
    const shadersCount = renderer?.info?.memory?.programs || 0;
    memoryUsage.value = Math.round(performanceMonitor.estimateMemoryUsage(geometriesCount, texturesCount, shadersCount));
    
    // 更新内存峰值
    if (!memoryPeak.value) memoryPeak.value = 0;
    memoryPeak.value = Math.max(memoryPeak.value, memoryUsage.value);
    
    // 更新绘制调用信息
    drawCalls.value = performanceMonitor.getDrawCallCount();
    
    // 获取性能优化建议
    performanceSuggestions.value = performanceMonitor.getOptimizationSuggestions();
    if (performanceSuggestions.value.length > 0 && !performanceWarning.value) {
      performanceWarning.value = performanceSuggestions.value[0];
    }
    
    frames = 0;
    lastTime = currentTime;
  }
  
  // 智能帧跳过 - 根据当前FPS决定是否跳过渲染
  if (renderOptimizer.shouldSkipFrame(frameIndex, fps.value)) {
    frameIndex++;
    animationFrameId = requestAnimationFrame(animate);
    return;
  }
  
  // 计算帧时间
  const frameTime = currentTime - lastFrameTime.value;
  lastFrameTime.value = currentTime;
  
  // 维护帧时间历史记录
  frameTimeHistory.value.push(frameTime);
  if (frameTimeHistory.value.length > 60) {
    frameTimeHistory.value.shift();
  }
  
  // 计算平均帧时间
  avgFrameTime.value = frameTimeHistory.value.reduce((sum, time) => sum + time, 0) / frameTimeHistory.value.length;
  
  // 记录渲染时间
  const startTime = performance.now();
  
  // 更新控制器
  controls.update();
  
  // 根据性能模式调整更新频率
  const shouldUpdateParticles = performanceMode.value === 'high' || frames % 2 !== 0;
  if (shouldUpdateParticles) {
    updateParticleSystem();
  }
  
  // 应用渲染分辨率缩放
  if (renderScale.value !== 1 && renderScale.value) {
    renderer.setSize(window.innerWidth * renderScale.value, window.innerHeight * renderScale.value, false);
    renderer.domElement.style.width = `${window.innerWidth}px`;
    renderer.domElement.style.height = `${window.innerHeight}px`;
  } else {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.domElement.style.width = '';
    renderer.domElement.style.height = '';
  }
  
  // 对重要对象按优先级排序（性能模式下尤为重要）
  if (performanceMode.value === 'low' && frames % 10 === 0) {
    // 仅对可见对象进行处理
    const visibleObjects = scene.children.filter(child => 
      child.visible && renderOptimizer.isObjectVisible(child.position, 
      child.geometry?.boundingSphere?.radius || 1, camera)
    );
    
    // 根据优先级排序
    const prioritizedObjects = renderOptimizer.sortObjectsByPriority(
      visibleObjects,
      camera,
      performanceMode.value === 'low'
    );
    
    // 可以根据需要调整对象的渲染顺序、可见性或细节级别
    // 这里可以实现基于优先级的LOD或简化策略
  }
  
  // 渲染场景
  renderer.render(scene, camera);
  
  // 计算渲染时间
  renderTime.value = performance.now() - startTime;
  
  // 更新绘制调用计数
  if (renderer.info) {
    performanceMonitor.updateDrawCallCount(renderer.info.render.calls);
  }
  
  frameIndex++;
  
  // 继续动画循环
  animationFrameId = requestAnimationFrame(animate);
};

// 窗口大小变化处理优化
const onWindowResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return;
  
  let width = canvasContainer.value.clientWidth;
  let height = canvasContainer.value.clientHeight;
  
  // 在移动设备上，收起面板时给渲染器更多空间
  if (deviceType.value === 'mobile' && !panelExpanded.value) {
    // 计算剩余空间
    const totalHeight = window.innerHeight;
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
      // 减去控制面板高度和一些边距
      height = totalHeight - controlPanel.clientHeight - 20;
    }
  }
  
  // 防止极小尺寸
  const minSize = 100;
  const safeWidth = Math.max(width, minSize);
  const safeHeight = Math.max(height, minSize);
  
  // 更新相机
  camera.aspect = safeWidth / safeHeight;
  camera.updateProjectionMatrix();
  
  // 根据设备类型和性能模式调整渲染分辨率
  let renderScale = 1;
  if (deviceType.value === 'mobile') {
    // 移动设备默认降低分辨率
    renderScale = performanceMode.value === 'high' ? 0.8 : (performanceMode.value === 'medium' ? 0.6 : 0.5);
  } else {
    // 桌面设备正常分辨率
    renderScale = performanceMode.value === 'high' ? 1 : (performanceMode.value === 'medium' ? 0.8 : 0.6);
  }
  
  const targetWidth = Math.floor(safeWidth * renderScale);
  const targetHeight = Math.floor(safeHeight * renderScale);
  
  // 更新渲染器尺寸
  renderer.setSize(targetWidth, targetHeight);
  renderer.domElement.style.width = `${safeWidth}px`;
  renderer.domElement.style.height = `${safeHeight}px`;
  
  // 检测是否需要调整性能模式（基于窗口大小）
  const area = safeWidth * safeHeight;
  if (adaptiveSettings.value.enabled) {
    if (area > 200000 && performanceMode.value === 'low') {
      // 大屏幕但低性能模式，考虑提高性能
      if (!isLowPerformanceDevice.value && fps.value > 40) {
        setPerformanceMode('medium');
      }
    } else if (area < 50000) {
      // 小屏幕，考虑降低性能设置
      if (performanceMode.value === 'high' && fps.value < 30) {
        setPerformanceMode('medium');
      }
      // 移动设备竖屏模式强制使用低性能
      if (deviceType.value === 'mobile' && window.innerHeight > window.innerWidth) {
        setPerformanceMode('low');
      }
    }
  }
  
  // 重置相机位置以适应新尺寸
  resetCamera();
};

// 性能模式切换函数
const togglePerformanceMode = () => {
  const modes: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  const currentIndex = modes.indexOf(performanceMode.value);
  const nextIndex = (currentIndex + 1) % modes.length;
  setPerformanceMode(modes[nextIndex]);
};

// 控制函数
// 动画插值状态
const targetFieldParams = reactive({
  fieldStrength: fieldStrength.value,
  gravityStrength: gravityStrength.value,
  magneticStrength: magneticStrength.value,
  electricStrength: electricStrength.value,
  waveAmplitude: waveAmplitude.value,
  waveFrequency: waveFrequency.value,
  quantumStrength: quantumStrength.value,
  quantumFluctuation: quantumFluctuation.value
});

// 预设方案定义
const presets = {
  solarSystem: {
    fieldType: 'gravity',
    fieldStrength: 1.5,
    particleDensity: 150,
    animationSpeed: 0.02,
    gravityStrength: 45,
    description: '模拟太阳系引力场'
  },
  magneticField: {
    fieldType: 'magnetic',
    fieldStrength: 2.0,
    particleDensity: 250,
    animationSpeed: 0.04,
    magneticStrength: 80,
    description: '环形磁场效果'
  },
  electricDipole: {
    fieldType: 'electric',
    fieldStrength: 1.8,
    particleDensity: 200,
    animationSpeed: 0.03,
    electricStrength: 70,
    isPositiveCharge: true,
    description: '电偶极场分布'
  },
  wavePropagation: {
    fieldType: 'wave',
    fieldStrength: 1.2,
    particleDensity: 300,
    animationSpeed: 0.05,
    waveAmplitude: 12,
    waveFrequency: 3.0,
    waveLength: 6,
    description: '球面波传播'
  },
  quantumInterference: {
    fieldType: 'quantum',
    fieldStrength: 2.5,
    particleDensity: 350,
    animationSpeed: 0.06,
    quantumStrength: 60,
    quantumFluctuation: 4.0,
    quantumFrequency: 5.0,
    wavePacketWidth: 2.0,
    description: '量子干涉图案'
  }
};

// 面板展开/收起切换
const togglePanelExpanded = () => {
  panelExpanded.value = !panelExpanded.value;
  
  // 在移动设备上，切换面板时调整渲染器尺寸
  if (deviceType.value === 'mobile') {
    onWindowResize();
  }
  
  // 使用anime.js为面板收起/展开添加平滑动画
  anime({
    targets: '.control-panel',
    height: panelExpanded.value ? 'auto' : '80px',
    opacity: panelExpanded.value ? 1 : 0.8,
    duration: 300,
    easing: 'easeInOutQuad'
  });
};

// 初始化设备检测
const initializeDeviceDetection = () => {
  // 检测设备类型
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  if (isMobile) {
    deviceType.value = 'mobile';
    isMobileDevice.value = true;
  } else if (isTablet) {
    deviceType.value = 'tablet';
  } else {
    deviceType.value = 'desktop';
  }
  
  // 检测是否为触屏设备
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 在移动设备上默认收起面板，提供更大的渲染区域
  if (deviceType.value === 'mobile') {
    panelExpanded.value = false;
  }
  
  // 针对移动设备优化初始参数
  if (deviceType.value === 'mobile') {
    // 降低初始粒子密度以提高性能
    const originalDensity = particleDensity.value;
    if (particleDensity.value > 150) {
      particleDensity.value = 150;
    }
    // 降低场分辨率
    const originalResolution = fieldResolution.value;
    if (fieldResolution.value > 20) {
      fieldResolution.value = 20;
    }
    // 默认使用中性能模式
    const originalPerformanceMode = performanceMode.value;
    if (performanceMode.value === 'high') {
      performanceMode.value = 'medium';
    }
    
    console.log('移动设备优化应用:', {
      originalDensity,
      newDensity: particleDensity.value,
      originalResolution,
      newResolution: fieldResolution.value,
      originalPerformanceMode,
      newPerformanceMode: performanceMode.value
    });
  }
  
  console.log('设备检测完成:', {
    deviceType: deviceType.value,
    isMobileDevice: isMobileDevice.value,
    isTouchDevice: isTouchDevice.value,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    panelExpanded: panelExpanded.value,
    currentParams: {
      particleDensity: particleDensity.value,
      fieldResolution: fieldResolution.value,
      performanceMode: performanceMode.value
    }
  });
};

// 检测设备方向变化，调整渲染参数
const detectDeviceOrientation = () => {
  if (!canvasContainer.value) return;
  
  if (window.innerWidth > window.innerHeight) {
    // 横屏模式，可使用更高的性能设置
    if (deviceType.value === 'mobile' && adaptiveSettings.value.enabled) {
      // 在横屏时可适当提升性能设置
      if (particleDensity.value < 200 && !isLowPerformanceDevice.value) {
        particleDensity.value = Math.min(200, particleDensity.value + 50);
      }
    }
  } else {
    // 竖屏模式，优先考虑性能
    if (deviceType.value === 'mobile' && adaptiveSettings.value.enabled) {
      // 在竖屏时降低性能消耗
      if (particleDensity.value > 100) {
        particleDensity.value = Math.max(100, particleDensity.value - 50);
      }
    }
  }
  
  // 调整渲染器尺寸
  onWindowResize();
};

// 触摸事件处理 - 用于移动设备上的交互优化
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
const isPinching = ref(false);
const initialPinchDistance = ref(0);

// 处理触摸开始
const handleTouchStart = (event: TouchEvent) => {
  if (!isTouchDevice.value) return;
  
  const touches = event.touches;
  touchStartTime = Date.now();
  
  console.log('触摸开始事件:', {
    touchCount: touches.length,
    timestamp: touchStartTime,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    deviceType: deviceType.value
  });
  
  if (touches.length === 1) {
    // 单指操作 - 记录初始位置
    touchStartX = touches[0].clientX;
    touchStartY = touches[0].clientY;
    console.log('单指触摸开始位置:', { x: touchStartX, y: touchStartY });
  } else if (touches.length === 2) {
    // 双指操作 - 处理缩放
    isPinching.value = true;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    initialPinchDistance.value = Math.sqrt(dx * dx + dy * dy);
    console.log('双指触摸开始:', { 
      pinchDistance: initialPinchDistance.value,
      touch1: { x: touches[0].clientX, y: touches[0].clientY },
      touch2: { x: touches[1].clientX, y: touches[1].clientY }
    });
  }
};

// 处理触摸移动
const handleTouchMove = (event: TouchEvent) => {
  if (!isTouchDevice.value) return;
  
  // 阻止默认行为以避免滚动冲突
  event.preventDefault();
  
  const touches = event.touches;
  
  console.log('触摸移动事件:', { touchCount: touches.length, isPinching: isPinching.value });
  
  if (touches.length === 1 && !isPinching.value) {
    // 单指滑动 - 可以用于旋转或平移视图
    const currentX = touches[0].clientX;
    const currentY = touches[0].clientY;
    
    // 计算移动距离
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;
    
    console.log('单指触摸移动:', { deltaX, deltaY });
    
    // 更新相机角度或位置（这里需要根据实际的相机控制方式实现）
    if (controls && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
      console.log('应用相机控制移动');
      // 对于OrbitControls，我们可以模拟鼠标移动
      // 如果使用自定义控制逻辑，这里需要相应地调整
    }
    
    // 更新起始位置
    touchStartX = currentX;
    touchStartY = currentY;
  } else if (touches.length === 2) {
    // 双指缩放
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (initialPinchDistance.value > 0) {
      const scaleFactor = currentDistance / initialPinchDistance.value;
      
      console.log('双指触摸缩放:', {
        currentDistance,
        initialDistance: initialPinchDistance.value,
        scaleFactor
      });
      
      // 应用缩放（根据实际相机控制方式实现）
      if (camera && Math.abs(scaleFactor - 1) > 0.01) { // 添加阈值避免微小变化
        // 对于OrbitControls，可以调整相机位置或缩放
        camera.position.multiplyScalar(1.0 + (1.0 - scaleFactor) * 0.1);
        // 限制最小和最大缩放
        camera.position.clampLength(20, 100);
        console.log('相机位置缩放后:', { x: camera.position.x, y: camera.position.y, z: camera.position.z });
      }
    }
    
    initialPinchDistance.value = currentDistance;
  }
};

// 处理触摸结束
const handleTouchEnd = () => {
  if (!isTouchDevice.value) return;
  
  const touchDuration = Date.now() - touchStartTime;
  
  console.log('触摸结束事件:', {
    touchDuration,
    isPinching: isPinching.value,
    deviceType: deviceType.value
  });
  
  // 检查是否为点击（短时间内触摸）
  if (touchDuration < 200 && !isPinching.value) {
    console.log('检测到快速点击事件');
    // 处理点击事件，例如可以切换控制面板的显示状态
    // 在移动设备上，可以点击空白区域收起控制面板
    if (deviceType.value === 'mobile' && panelExpanded.value) {
      console.log('移动设备上点击且面板展开，触发面板切换');
      togglePanelExpanded();
    }
  }
  
  // 重置触摸状态
  console.log('重置触摸状态');
  isPinching.value = false;
  initialPinchDistance.value = 0;
  
  console.log('触摸交互完成，当前状态:', {
    panelExpanded: panelExpanded.value,
    cameraPosition: camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null
  });
};

// 应用预设
const applyPreset = (presetName: string) => {
  const preset = presets[presetName as keyof typeof presets];
  if (!preset) return;
  
  // 保存当前激活的预设
  activePreset.value = presetName;
  
  // 使用GSAP进行平滑过渡
  gsap.to({}, {
    duration: 0.8,
    onUpdate: () => {
      // 在过渡期间更新参数
      if (!isParameterLocked('fieldType')) {
        fieldType.value = preset.fieldType || fieldType.value;
      }
      if (!isParameterLocked('fieldStrength')) {
        fieldStrength.value = preset.fieldStrength || fieldStrength.value;
      }
      if (!isParameterLocked('particleDensity')) {
        particleDensity.value = preset.particleDensity || particleDensity.value;
      }
      if (!isParameterLocked('animationSpeed')) {
        animationSpeed.value = preset.animationSpeed || animationSpeed.value;
      }
      
      // 特定场类型参数
      if (preset.gravityStrength !== undefined) gravityStrength.value = preset.gravityStrength;
      if (preset.magneticStrength !== undefined) magneticStrength.value = preset.magneticStrength;
      if (preset.electricStrength !== undefined) electricStrength.value = preset.electricStrength;
      if (preset.isPositiveCharge !== undefined) isPositiveCharge.value = preset.isPositiveCharge;
      if (preset.waveAmplitude !== undefined) waveAmplitude.value = preset.waveAmplitude;
      if (preset.waveFrequency !== undefined) waveFrequency.value = preset.waveFrequency;
      if (preset.waveLength !== undefined) waveLength.value = preset.waveLength;
      if (preset.quantumStrength !== undefined) quantumStrength.value = preset.quantumStrength;
      if (preset.quantumFluctuation !== undefined) quantumFluctuation.value = preset.quantumFluctuation;
      if (preset.quantumFrequency !== undefined) quantumFrequency.value = preset.quantumFrequency;
      if (preset.wavePacketWidth !== undefined) wavePacketWidth.value = preset.wavePacketWidth;
    },
    onComplete: () => {
      // 完成后更新场类型
      updateFieldType();
    }
  });
};

// 参数锁定功能
const toggleParameterLock = (paramName: string) => {
  lockedParameters.value[paramName] = !lockedParameters.value[paramName];
};

const isParameterLocked = (paramName: string): boolean => {
  return !!lockedParameters.value[paramName];
};

// 导入动画库
import anime from 'animejs';
import { gsap } from 'gsap';

const updateFieldType = () => {
  // 添加平滑过渡效果
  anime({
    targets: targetFieldParams,
    fieldStrength: fieldStrength.value,
    gravityStrength: gravityStrength.value,
    magneticStrength: magneticStrength.value,
    electricStrength: electricStrength.value,
    waveAmplitude: waveAmplitude.value,
    waveFrequency: waveFrequency.value,
    quantumStrength: quantumStrength.value,
    quantumFluctuation: quantumFluctuation.value,
    duration: 800,
    easing: 'easeOutQuad',
    complete: () => {
      fieldService.resetTime();
    }
  });
  
  // 添加粒子系统重初始化的动画效果
  if (particles && particles.material && typeof (particles.material as THREE.PointsMaterial).opacity !== 'undefined') {
    // 淡出当前粒子
    gsap.to((particles.material as THREE.PointsMaterial), {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        // 重新初始化粒子系统以适应新的场类型
        if (particles) {
          scene.remove(particles);
          particles.geometry.dispose();
          (particles.material as THREE.PointsMaterial).dispose();
        }
        createParticleSystem();
        
        // 淡入新粒子
        if (particles && particles.material) {
          gsap.to((particles.material as THREE.PointsMaterial), {
            opacity: 0.9,
            duration: 0.6
          });
        }
      }
    });
  } else {
    // 如果没有动画库或粒子材质不存在，使用原始方法
    if (particles) {
      scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.PointsMaterial).dispose();
    }
    createParticleSystem();
  }
};

const updateFieldStrength = () => {
  // 使用GSAP添加平滑动画过渡
  gsap.to(targetFieldParams, {
    fieldStrength: fieldStrength.value,
    duration: 400,
    easing: 'power2.out',
    onUpdate: () => {
      // 场强度在updateParticleSystem中实时应用
    }
  });
};

const updateParticleDensity = () => {
  // 添加粒子数量变化的平滑过渡效果
  if (particles && particles.material) {
    gsap.to((particles.material as THREE.PointsMaterial), {
      opacity: 0.3,
      duration: 300,
      onComplete: () => {
        updateFieldType();
        gsap.to((particles.material as THREE.PointsMaterial), {
          opacity: 0.9,
          duration: 500
        });
      }
    });
  } else {
    updateFieldType();
  }
};

const updateAnimationSpeed = () => {
  // 动画速度在animate循环中实时应用
};

const updateFieldResolution = () => {
  // 分辨率变化影响粒子密度
  updateFieldType();
};

const updateColorMap = () => {
  // 颜色映射在updateParticleSystem中实时应用
};

const updateQuantumStrength = () => {
  gsap.to(targetFieldParams, {
    quantumStrength: quantumStrength.value,
    duration: 500,
    easing: 'elastic.out(1, 0.5)',
    onUpdate: () => {
      // 平滑更新量子强度参数
    }
  });
};

const updateQuantumFluctuation = () => {
  gsap.to(targetFieldParams, {
    quantumFluctuation: quantumFluctuation.value,
    duration: 600,
    easing: 'power3.inOut',
    onUpdate: () => {
      // 平滑更新量子涨落参数
    }
  });
};

// 波场参数平滑动画更新函数
const updateWaveAmplitude = () => {
  gsap.to(targetFieldParams, {
    waveAmplitude: waveAmplitude.value,
    duration: 700,
    easing: 'sine.inOut',
    onUpdate: () => {
      // 平滑更新波幅参数
    }
  });
};

const updateWaveFrequency = () => {
  gsap.to(targetFieldParams, {
    waveFrequency: waveFrequency.value,
    duration: 600,
    easing: 'power2.out',
    onUpdate: () => {
      // 平滑更新频率参数
    }
  });
};

const updateWaveLength = () => {
  gsap.to(targetFieldParams, {
    waveLength: waveLength.value,
    duration: 750,
    easing: 'elastic.out(1, 0.3)',
    onUpdate: () => {
      // 平滑更新波长参数
    }
  });
};

const resetCamera = () => {
  if (!camera || !controls) return;
  
  // 根据窗口宽高比调整相机位置
  const aspectRatio = camera.aspect;
  let distance = 15;
  
  if (aspectRatio < 1) {
    // 竖屏模式调整
    distance = 18;
  }
  
  camera.position.set(distance * 0.67, distance * 0.67, distance);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  // 重置控制器
  controls.reset();
  
  // 重置时间
  resetTime();
  fieldService.resetTime();
  
  // 重置粒子系统
  if (performanceMode.value !== 'low') {
    // 只在非低性能模式下重新初始化粒子系统以避免性能问题
    updateFieldType();
  }
};

const toggleGrid = () => {
  showGrid.value = !showGrid.value;
  gridHelper.visible = showGrid.value;
};

const toggleAxes = () => {
  showAxes.value = !showAxes.value;
  axesHelper.visible = showAxes.value;
};

// 生命周期钩子
onMounted(() => {
  // 初始化设备检测
  initializeDeviceDetection();
  
  // 初始化场景
  initScene();
  
  // 监听方向变化（针对移动设备）
  window.addEventListener('orientationchange', detectDeviceOrientation);
});

onUnmounted(() => {
  // 清理资源
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
  
  // 清理粒子系统
  if (particles) {
    if (scene && particles.parent === scene) {
      scene.remove(particles);
    }
    if (particles.geometry) {
      particles.geometry.dispose();
    }
    if (particles.material) {
      (particles.material as THREE.PointsMaterial).dispose();
    }
    particles = null as any;
  }
  
  // 清理渲染器
  if (renderer) {
    // 清理渲染器资源
    if ('info' in renderer && renderer.info && 'memory' in renderer.info) {
      // 可以记录最终的资源使用情况
      console.log('组件卸载前的资源使用情况:', renderer.info.memory);
    }
    renderer.dispose();
    
    // 从DOM中移除canvas元素
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null as any;
  }
  
  // 清理内存监控
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    memoryCheckInterval = null;
  }
  
  // 执行全面的资源清理
  cleanupResources();
  
  // 清理场服务实例
  if (fieldService) {
    fieldService = null;
  }
  
  // 清理辅助对象
  if (scene) {
    if (gridHelper) {
      scene.remove(gridHelper);
      gridHelper = null as any;
    }
    if (axesHelper) {
      scene.remove(axesHelper);
      axesHelper = null as any;
    }
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('orientationchange', detectDeviceOrientation);
  
  // 移除触摸事件监听器
  if (canvasContainer.value) {
    canvasContainer.value.removeEventListener('touchstart', handleTouchStart);
    canvasContainer.value.removeEventListener('touchmove', handleTouchMove);
    canvasContainer.value.removeEventListener('touchend', handleTouchEnd);
  }
  
  // 清理场论服务资源
  if (fieldService) {
    fieldService.clearCache();
    fieldService = null as any;
  }
  
  // 清理其他引用
  particleColors = null as any;
  clock = null as any;
});
</script>

<style scoped>
/* 主容器样式 - 增强视觉深度和现代感 */
.field-visualization-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #050510 0%, #0a0a1a 40%, #12122a 100%);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 装饰性背景光效 */
.field-visualization-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 450px;
  overflow: hidden;
}

/* 控制面板 - 增强玻璃态效果和层次感 */
.control-panel {
  background: rgba(20, 20, 40, 0.88);
  backdrop-filter: blur(16px);
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  max-height: 320px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

/* 面板收起状态 */
.control-panel.collapsed {
  max-height: 80px;
  padding: 16px 24px;
  overflow: hidden;
}

/* 面板内容 */
.panel-content {
  transition: opacity 0.3s ease;
}

.control-panel.collapsed .panel-content {
  opacity: 0;
  height: 0;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动设备上的主容器 */
  .field-visualization-container {
    border-radius: 0;
    box-shadow: none;
  }
  
  /* 画布容器在移动设备上 */
  .canvas-container {
    min-height: 300px;
    flex: 1;
  }
  
  /* 控制面板在移动设备上 */
  .control-panel {
    padding: 16px;
    background: rgba(20, 20, 40, 0.95);
    backdrop-filter: blur(10px);
  }
  
  /* 控制面板标题在移动设备上 */
  .control-panel h3 {
    font-size: 1.1rem;
  }
  
  /* 控制组在移动设备上 */
  .control-group {
    margin-bottom: 16px;
  }
  
  /* 预设按钮在移动设备上 */
  .preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  /* 预设按钮样式调整 */
  .preset-btn {
    font-size: 0.75rem;
    padding: 10px 8px;
    text-align: center;
  }
  
  /* 滑块调整 */
  .slider {
    height: 8px;
  }
  
  .slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }
}

/* 触屏设备优化 */
@media (hover: none) and (pointer: coarse) {
  /* 增大按钮点击区域 */
  .preset-btn,
  .lock-btn,
  .panel-toggle,
  .control-group button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 增大滑块触控区域 */
  .slider {
    height: 12px;
  }
  
  .slider::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
  }
  
  /* 选择框优化 */
  .field-type-select {
    padding: 12px 16px;
    font-size: 1rem;
  }
}

/* 平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .control-panel {
    max-height: 350px;
  }
  
  .preset-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

/* 控制面板头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* 控制面板标题 */
.control-panel h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  position: relative;
  display: inline-block;
}

/* 面板展开/收起按钮 */
.panel-toggle {
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.panel-toggle:hover {
  background: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.control-panel h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
}

/* 控制组样式重置 */
.control-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 复选框控制组 */
.control-group.checkbox-control {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.control-group.checkbox-control input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
  cursor: pointer;
  transition: transform 0.2s;
}

.control-group.checkbox-control input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.control-group.checkbox-control label {
  cursor: pointer;
  user-select: none;
  color: #e0e0e0;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.control-group.checkbox-control label:hover {
  color: #ffffff;
}

/* 预设方案样式 */
.preset-section {
  margin: 24px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preset-section h4 {
  color: #e0e0e0;
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 500;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.preset-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.preset-btn.active {
  background: rgba(99, 102, 241, 0.3);
  border-color: #6366f1;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.5);
}

/* 滑块容器样式 */
.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 滑块样式增强 */
.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  transition: background 0.3s ease;
}

.slider:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 参数锁定按钮 */
.lock-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
}

.lock-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.05);
}

.lock-btn.locked {
  color: #ef4444;
  opacity: 1;
  transform: rotate(15deg);
}

/* 场类型选择器样式增强 */
.field-type-select {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.field-type-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.field-type-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.field-type-select option {
  background: #1a1a2e;
  color: #ffffff;
}

/* 场类型控制面板样式 - 增强视觉识别度 */
.gravity-controls,
.magnetic-controls,
.electric-controls,
.wave-controls,
.quantum-controls {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-left: 4px solid #6366f1;
  animation: fadeIn 0.5s ease-out;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}

/* 添加发光边缘效果 */
.gravity-controls::after,
.magnetic-controls::after,
.electric-controls::after,
.wave-controls::after,
.quantum-controls::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.gravity-controls:hover,
.magnetic-controls:hover,
.electric-controls:hover,
.wave-controls:hover,
.quantum-controls:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.gravity-controls:hover::after,
.magnetic-controls:hover::after,
.electric-controls:hover::after,
.wave-controls:hover::after,
.quantum-controls:hover::after {
  opacity: 1;
}

/* 各场类型独特颜色标识 */
.gravity-controls {
  border-left-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.gravity-controls::after {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
}

.magnetic-controls {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.magnetic-controls::after {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

.electric-controls {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

.electric-controls::after {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
}

.wave-controls {
  border-left-color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%);
}

.wave-controls::after {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
}

.quantum-controls {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.quantum-controls::after {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
}

/* 渐入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 控制行布局 */
.control-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-row .control-group {
  flex: 1;
  margin-bottom: 0;
  min-width: 180px;
}

/* 标签样式 */
.control-group label {
  display: block;
  color: #b8b8e8;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}

.control-group:hover label {
  color: #ffffff;
}

/* 输入控件样式 */
.control-group select,
.control-group input[type="range"] {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.control-group select:focus,
.control-group input[type="range"]:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

/* 滑块样式增强 */
.control-group input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  padding: 0;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
  outline: none;
  border-radius: 4px;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.control-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
}

.control-group input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.2);
  background: linear-gradient(135deg, #4f46e5, #4338ca);
}

.control-group input[type="range"]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.control-group input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
}

.control-group input[type="range"]::-moz-range-thumb:active {
  transform: scale(1.2);
}

/* 选择框样式 */
.control-group select {
  cursor: pointer;
  transition: all 0.3s;
}

.control-group select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 查看控制按钮组 */
.view-controls {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

/* 控制按钮 - 增强视觉效果和交互体验 */
.control-button {
  flex: 1;
  min-width: 120px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.control-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.control-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #4f46e5, #4338ca);
}

.control-button:hover::before {
  left: 100%;
}

.control-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

/* 性能监视器 - 增强视觉效果和交互 */
.performance-monitor {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 0.85rem;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  min-width: 240px;
  z-index: 100;
}

/* 性能监视器根据状态变色 */
.performance-monitor.high {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.performance-monitor.medium {
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.performance-monitor.low {
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.performance-monitor:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.25);
}

.performance-monitor div {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performance-monitor div:last-child {
  margin-bottom: 0;
}

/* FPS 显示颜色变化 */
.performance-monitor .fps-counter {
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.performance-monitor .fps-counter::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.performance-monitor .fps-counter.high {
  color: #10b981;
}

.performance-monitor .fps-counter.high::before {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.performance-monitor .fps-counter.medium {
  color: #f59e0b;
}

.performance-monitor .fps-counter.medium::before {
  background-color: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.performance-monitor .fps-counter.low {
  color: #ef4444;
}

.performance-monitor .fps-counter.low::before {
  background-color: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

/* 性能模式显示 */
.performance-mode {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
}

.performance-monitor.high .performance-mode {
  color: #10b981;
}

.performance-monitor.medium .performance-mode {
  color: #f59e0b;
}

.performance-monitor.low .performance-mode {
  color: #ef4444;
}

/* 内存和资源显示 */
.performance-monitor .memory-usage {
  color: #64b5f6;
}

.performance-monitor .memory-peak {
  color: #ffb74d;
}

.performance-monitor .resources-count {
  color: #81c784;
  font-size: 0.8em;
}

/* 性能警告 */
.performance-warning {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 8px 10px;
  margin: 8px 0;
  color: #ef4444;
  font-size: 0.8rem;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 性能模式切换按钮 */
.performance-mode-toggle {
  width: 100%;
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1));
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.performance-mode-toggle:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.performance-mode-toggle:active {
  transform: translateY(0);
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .control-row {
    flex-direction: column;
  }
  
  .control-row .control-group {
    min-width: auto;
  }
  
  .field-visualization-container {
    flex-direction: column;
    align-items: center;
  }

  .control-panel {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin-bottom: 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    border-radius: 15px;
  }

  .canvas-container {
    width: 100%;
    border-radius: 15px;
    overflow: hidden;
  }
}

@media (max-width: 768px) {
  .control-panel {
    padding: 20px;
    max-height: 280px;
    border-radius: 12px;
  }
  
  .field-visualization-container {
    flex-direction: column-reverse;
    border-radius: 12px;
    padding: 10px;
  }
  
  .canvas-container {
    min-height: 350px;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .control-button {
    min-width: auto;
    width: 100%;
    padding: 12px 20px;
  }
  
  /* 移动端性能监视器优化 */
  .performance-monitor {
    position: relative;
    top: 0;
    right: 0;
    margin: 20px auto;
    min-width: auto;
    width: 100%;
    max-width: none;
    font-size: 0.8rem;
    padding: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: none;
  }
  
  .performance-monitor:hover {
    transform: translateY(-4px) scale(1.03);
  }
  
  .performance-monitor .fps-counter {
    font-size: 0.85rem;
    gap: 6px;
  }
  
  .performance-mode {
    font-size: 0.75rem;
  }
  
  .performance-warning {
    font-size: 0.75rem;
    padding: 6px 8px;
  }
  
  .performance-mode-toggle {
    padding: 10px 16px;
    font-size: 0.75rem;
  }
  
  .control-row label {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .field-visualization-container {
    padding: 8px;
  }
  
  .control-panel {
    padding: 16px;
    max-height: 250px;
    border-radius: 10px;
  }
  
  .canvas-container {
    min-height: 300px;
    border-radius: 10px;
  }
  
  .gravity-controls,
  .magnetic-controls,
  .electric-controls,
  .wave-controls,
  .quantum-controls {
    padding: 16px;
    margin-top: 20px;
  }
  
  /* 小屏设备性能监视器优化 */
  .performance-monitor {
    font-size: 0.75rem;
    padding: 12px;
    min-width: auto;
  }
  
  .performance-monitor div {
    margin-bottom: 4px;
  }
  
  .performance-monitor .fps-counter {
    font-size: 0.8rem;
  }
  
  .performance-mode-toggle {
    padding: 8px 12px;
    margin-top: 10px;
  }
  
  .field-type-selector {
    width: 100%;
    padding: 10px;
  }
}

/* 触屏设备优化 */
@media (hover: none) and (pointer: coarse) {
  .control-button:hover {
    transform: none;
  }
  
  .control-button:active {
    transform: scale(0.97);
  }
  
  .performance-monitor:hover {
    transform: none;
  }
  
  .performance-mode-toggle:hover {
    transform: none;
  }
  
  .performance-mode-toggle:active {
    transform: scale(0.95);
  }
  
  .control-panel::-webkit-scrollbar-thumb:hover {
    transform: none;
  }
}

/* 高分辨率屏幕优化 */
@media (-webkit-device-pixel-ratio: 2), (resolution: 192dpi) {
  .control-panel {
    border: 0.5px solid rgba(255, 255, 255, 0.15);
  }
  
  .performance-monitor {
    border: 0.5px solid rgba(255, 255, 255, 0.15);
  }
}

/* 滚动条样式增强 */
.control-panel::-webkit-scrollbar {
  width: 8px;
}

.control-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin: 10px 0;
}

.control-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.25) 100%);
  border-radius: 4px;
  transition: all 0.3s;
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 100%);
  transform: scale(1.2);
}

.control-panel::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.45) 100%);
}

/* 工具提示样式 - 为控件添加悬停提示 */
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;
  z-index: 1000;
  margin-bottom: 8px;
}

.tooltip:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}

/* 参数值显示 - 添加实时参数值反馈 */
.parameter-value {
  font-size: 0.85rem;
  color: #6366f1;
  font-weight: 600;
  text-align: right;
  margin-top: 4px;
  transition: color 0.3s;
}

.control-group:hover .parameter-value {
  color: #818cf8;
}
</style>