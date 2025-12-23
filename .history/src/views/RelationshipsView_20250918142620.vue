<template>
  <div class="spacetime-network">
    <!-- 时空关系网络头部 -->
    <div class="header-section">
      <div class="cosmic-background">
        <div class="star-field">
          <div class="star" v-for="n in 100" :key="n" :style="getStarStyle()"></div>
        </div>
        <div class="cosmic-web">
          <div class="web-strand" v-for="n in 20" :key="n" :style="getWebStrandStyle()"></div>
        </div>
        <div class="energy-vortex">
          <div class="vortex-ring" v-for="n in 5" :key="n" :style="getVortexStyle(n)"></div>
        </div>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🌌</span>
          时空关系网络
        </h1>
        <p class="page-subtitle">
          探索人工场之间的时空连接 · 揭示宇宙的隐秘结构 · 构建星际知识图谱
        </p>
        
        <!-- 网络控制面板 -->
        <div class="control-panel">
          <div class="panel-section">
            <h3 class="panel-title">
              <span class="panel-icon">🎛️</span>
              网络控制
            </h3>
            <div class="control-buttons">
              <button
                v-for="mode in visualModes"
                :key="mode.id"
                :class="['control-btn', { active: currentMode === mode.id }]"
                @click="setVisualizationMode(mode.id)"
              >
                <span class="btn-icon">{{ mode.icon }}</span>
                <span class="btn-text">{{ mode.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="panel-section">
            <h3 class="panel-title">
              <span class="panel-icon">🔍</span>
              探索工具
            </h3>
            <div class="tool-controls">
              <div class="slider-control">
                <label class="slider-label">时空深度</label>
                <input
                  type="range"
                  v-model="spaceTimeDepth"
                  min="1"
                  max="10"
                  class="cosmic-slider"
                />
                <span class="slider-value">{{ spaceTimeDepth }}</span>
              </div>
              <div class="slider-control">
                <label class="slider-label">连接强度</label>
                <input
                  type="range"
                  v-model="connectionStrength"
                  min="0.1"
                  max="1"
                  step="0.1"
                  class="cosmic-slider"
                />
                <span class="slider-value">{{ connectionStrength }}</span>
              </div>
            </div>
          </div>
          
          <div class="panel-section">
            <h3 class="panel-title">
              <span class="panel-icon">📊</span>
              网络统计
            </h3>
            <div class="network-stats">
              <div class="stat-item">
                <div class="stat-icon">🌟</div>
                <div class="stat-info">
                  <div class="stat-value">{{ networkStats.nodes }}</div>
                  <div class="stat-label">节点数量</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🔗</div>
                <div class="stat-info">
                  <div class="stat-value">{{ networkStats.connections }}</div>
                  <div class="stat-label">连接数量</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">⚡</div>
                <div class="stat-info">
                  <div class="stat-value">{{ networkStats.energy }}</div>
                  <div class="stat-label">网络能量</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要可视化区域 -->
    <div class="visualization-area">
      <div class="network-container">
        <!-- 3D网络背景 -->
        <div class="network-background">
          <div class="dimension-grid">
            <div class="grid-plane xy-plane"></div>
            <div class="grid-plane xz-plane"></div>
            <div class="grid-plane yz-plane"></div>
          </div>
          <div class="quantum-field">
            <div class="field-particle" v-for="n in 50" :key="n" :style="getFieldParticleStyle()"></div>
          </div>
        </div>
        
        <!-- SVG网络图 -->
        <svg class="network-svg" ref="networkSvg" :width="svgDimensions.width" :height="svgDimensions.height">
          <!-- 定义渐变和滤镜 -->
          <defs>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#00f5ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#64ffda;stop-opacity:0.3" />
            </radialGradient>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#00f5ff;stop-opacity:0.8" />
              <stop offset="50%" style="stop-color:#64ffda;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ff00ff;stop-opacity:0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- 连接线 -->
          <g class="connections-group">
            <line
              v-for="connection in networkConnections"
              :key="`${connection.source}-${connection.target}`"
              :x1="getNodePosition(connection.source).x"
              :y1="getNodePosition(connection.source).y"
              :x2="getNodePosition(connection.target).x"
              :y2="getNodePosition(connection.target).y"
              :class="['connection-line', connection.type]"
              :stroke-width="connection.strength * 3"
              stroke="url(#connectionGradient)"
              filter="url(#glow)"
              @click="selectConnection(connection)"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.3;1;0.3"
                :dur="connection.animationSpeed + 's'"
                repeatCount="indefinite"
              />
            </line>
          </g>
          
          <!-- 节点 -->
          <g class="nodes-group">
            <g
              v-for="node in networkNodes"
              :key="node.id"
              :class="['network-node', node.category, { selected: selectedNode?.id === node.id }]"
              :transform="`translate(${getNodePosition(node.id).x}, ${getNodePosition(node.id).y})`"
              @click="selectNode(node)"
              @mouseenter="highlightNode(node)"
              @mouseleave="unhighlightNode()"
            >
              <!-- 节点光环 -->
              <circle
                :r="node.size + 10"
                fill="none"
                :stroke="node.color"
                stroke-width="2"
                stroke-opacity="0.3"
                class="node-halo"
              >
                <animate
                  attributeName="r"
                  :values="`${node.size + 5};${node.size + 15};${node.size + 5}`"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              
              <!-- 节点主体 -->
              <circle
                :r="node.size"
                :fill="node.color"
                filter="url(#glow)"
                class="node-body"
              />
              
              <!-- 节点图标 -->
              <text
                :font-size="node.size * 0.8"
                text-anchor="middle"
                dominant-baseline="central"
                fill="#ffffff"
                class="node-icon"
              >
                {{ node.icon }}
              </text>
              
              <!-- 节点标签 -->
              <text
                :y="node.size + 20"
                text-anchor="middle"
                fill="#64ffda"
                font-size="12"
                class="node-label"
              >
                {{ node.name }}
              </text>
              
              <!-- 能量脉冲 -->
              <circle
                :r="node.size"
                fill="none"
                :stroke="node.color"
                stroke-width="2"
                stroke-opacity="0"
                class="energy-pulse"
              >
                <animate
                  attributeName="r"
                  :values="`${node.size};${node.size * 2}`"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.8;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        </svg>
        
        <!-- 交互提示 -->
        <div class="interaction-hints">
          <div class="hint-item">
            <span class="hint-icon">🖱️</span>
            <span class="hint-text">点击节点查看详情</span>
          </div>
          <div class="hint-item">
            <span class="hint-icon">🔗</span>
            <span class="hint-text">点击连接线查看关系</span>
          </div>
          <div class="hint-item">
            <span class="hint-icon">🌀</span>
            <span class="hint-text">滚轮缩放网络</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点详情面板 -->
    <div v-if="selectedNode" class="node-details-panel">
      <div class="panel-container">
        <div class="panel-header">
          <div class="node-info">
            <div class="node-icon-large" :style="{ color: selectedNode.color }">
              {{ selectedNode.icon }}
            </div>
            <div class="node-meta">
              <h3 class="node-title">{{ selectedNode.name }}</h3>
              <div class="node-tags">
                <span class="tag category" :class="selectedNode.category">{{ getCategoryName(selectedNode.category) }}</span>
                <span class="tag importance" :class="selectedNode.importance">{{ selectedNode.importance }}</span>
                <span class="tag connections">{{ getNodeConnections(selectedNode.id).length }} 连接</span>
              </div>
            </div>
          </div>
          <button class="close-panel" @click="selectedNode = null">
            <span class="close-icon">×</span>
          </button>
        </div>
        
        <div class="panel-content">
          <div class="node-description">
            <h4 class="content-title">
              <span class="title-icon">📋</span>
              概念描述
            </h4>
            <p class="description-text">{{ selectedNode.description }}</p>
          </div>
          
          <div class="node-properties">
            <h4 class="content-title">
              <span class="title-icon">⚙️</span>
              属性参数
            </h4>
            <div class="properties-grid">
              <div
                v-for="property in selectedNode.properties"
                :key="property.name"
                class="property-item"
              >
                <div class="property-name">{{ property.name }}</div>
                <div class="property-value">{{ property.value }}</div>
                <div class="property-unit">{{ property.unit }}</div>
              </div>
            </div>
          </div>
          
          <div class="related-nodes">
            <h4 class="content-title">
              <span class="title-icon">🔗</span>
              相关节点
            </h4>
            <div class="related-list">
              <div
                v-for="relatedId in getNodeConnections(selectedNode.id)"
                :key="relatedId"
                class="related-item"
                @click="selectNode(getNodeById(relatedId))"
              >
                <div class="related-icon">{{ getNodeById(relatedId)?.icon }}</div>
                <div class="related-info">
                  <div class="related-name">{{ getNodeById(relatedId)?.name }}</div>
                  <div class="related-type">{{ getConnectionType(selectedNode.id, relatedId) }}</div>
                </div>
                <div class="related-strength">
                  {{ getConnectionStrength(selectedNode.id, relatedId) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-actions">
          <button class="action-btn primary" @click="exploreNode(selectedNode)">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">深入探索</span>
          </button>
          <button class="action-btn secondary" @click="analyzeConnections(selectedNode)">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">分析连接</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 连接详情面板 -->
    <div v-if="selectedConnection" class="connection-details-panel">
      <div class="panel-container">
        <div class="panel-header">
          <div class="connection-info">
            <div class="connection-icon">🔗</div>
            <div class="connection-meta">
              <h3 class="connection-title">
                {{ getNodeById(selectedConnection.source)?.name }} 
                ↔ 
                {{ getNodeById(selectedConnection.target)?.name }}
              </h3>
              <div class="connection-tags">
                <span class="tag type" :class="selectedConnection.type">{{ getConnectionTypeName(selectedConnection.type) }}</span>
                <span class="tag strength">强度: {{ selectedConnection.strength }}</span>
              </div>
            </div>
          </div>
          <button class="close-panel" @click="selectedConnection = null">
            <span class="close-icon">×</span>
          </button>
        </div>
        
        <div class="panel-content">
          <div class="connection-description">
            <h4 class="content-title">
              <span class="title-icon">📋</span>
              关系描述
            </h4>
            <p class="description-text">{{ selectedConnection.description }}</p>
          </div>
          
          <div class="connection-metrics">
            <h4 class="content-title">
              <span class="title-icon">📊</span>
              连接指标
            </h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-icon">💪</div>
                <div class="metric-info">
                  <div class="metric-value">{{ selectedConnection.strength }}</div>
                  <div class="metric-label">连接强度</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">📏</div>
                <div class="metric-info">
                  <div class="metric-value">{{ selectedConnection.distance }}</div>
                  <div class="metric-label">时空距离</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">⚡</div>
                <div class="metric-info">
                  <div class="metric-value">{{ selectedConnection.energy }}</div>
                  <div class="metric-label">能量流动</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-actions">
          <button class="action-btn primary" @click="strengthenConnection(selectedConnection)">
            <span class="btn-icon">⚡</span>
            <span class="btn-text">强化连接</span>
          </button>
          <button class="action-btn secondary" @click="traceConnection(selectedConnection)">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">追踪路径</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 网络分析工具 -->
    <div class="analysis-tools">
      <div class="tools-container">
        <h2 class="section-title">
          <span class="title-icon">🔬</span>
          网络分析工具
        </h2>
        <div class="tools-grid">
          <div class="tool-card" @click="runCentralityAnalysis">
            <div class="tool-icon">🎯</div>
            <div class="tool-info">
              <div class="tool-name">中心性分析</div>
              <div class="tool-description">识别网络中的关键节点</div>
            </div>
            <div class="tool-status">
              <div class="status-indicator ready"></div>
            </div>
          </div>
          
          <div class="tool-card" @click="runClusterAnalysis">
            <div class="tool-icon">🌐</div>
            <div class="tool-info">
              <div class="tool-name">聚类分析</div>
              <div class="tool-description">发现概念群组和社区</div>
            </div>
            <div class="tool-status">
              <div class="status-indicator ready"></div>
            </div>
          </div>
          
          <div class="tool-card" @click="runPathAnalysis">
            <div class="tool-icon">🛤️</div>
            <div class="tool-info">
              <div class="tool-name">路径分析</div>
              <div class="tool-description">寻找最短连接路径</div>
            </div>
            <div class="tool-status">
              <div class="status-indicator ready"></div>
            </div>
          </div>
          
          <div class="tool-card" @click="runInfluenceAnalysis">
            <div class="tool-icon">📈</div>
            <div class="tool-info">
              <div class="tool-name">影响力分析</div>
              <div class="tool-description">评估节点的影响范围</div>
            </div>
            <div class="tool-status">
              <div class="status-indicator ready"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// 定义类型
interface NetworkNode {
  id: string
  name: string
  icon: string
  category: 'theory' | 'field' | 'application' | 'experiment'
  importance: 'high' | 'medium' | 'low'
  size: number
  color: string
  description: string
  properties: Array<{
    name: string
    value: string
    unit: string
  }>
}

interface NetworkConnection {
  source: string
  target: string
  type: 'causal' | 'mathematical' | 'conceptual' | 'experimental'
  strength: number
  distance: number
  energy: number
  description: string
  animationSpeed: number
}

interface VisualizationMode {
  id: string
  name: string
  icon: string
}

// 响应式数据
const currentMode = ref('network')
const spaceTimeDepth = ref(5)
const connectionStrength = ref(0.7)
const selectedNode = ref<NetworkNode | null>(null)
const selectedConnection = ref<NetworkConnection | null>(null)
const networkSvg = ref<SVGElement>()

const svgDimensions = ref({
  width: 1200,
  height: 800
})

const networkStats = ref({
  nodes: 24,
  connections: 48,
  energy: '95.7%'
})

// 可视化模式
const visualModes = ref<VisualizationMode[]>([
  { id: 'network', name: '网络图', icon: '🕸️' },
  { id: 'hierarchy', name: '层次图', icon: '🌳' },
  { id: 'force', name: '力导向图', icon: '⚡' },
  { id: 'circular', name: '环形图', icon: '🔄' }
])

// 网络节点数据
const networkNodes = ref<NetworkNode[]>([
  {
    id: 'electromagnetic-field',
    name: '电磁场理论',
    icon: '⚡',
    category: 'theory',
    importance: 'high',
    size: 25,
    color: '#00f5ff',
    description: '描述电荷和电流产生的电磁现象的基础理论，是人工场技术的核心基础。',
    properties: [
      { name: '场强度', value: '10^6', unit: 'V/m' },
      { name: '频率范围', value: '1-100', unit: 'THz' },
      { name: '能量密度', value: '10^12', unit: 'J/m³' }
    ]
  },
  {
    id: 'quantum-mechanics',
    name: '量子力学',
    icon: '🌀',
    category: 'theory',
    importance: 'high',
    size: 24,
    color: '#64ffda',
    description: '研究微观粒子运动规律的理论，为量子场操控提供理论基础。',
    properties: [
      { name: '量子态数', value: '∞', unit: '维' },
      { name: '不确定性', value: 'ℏ/2', unit: 'J·s' },
      { name: '纠缠度', value: '0.95', unit: '' }
    ]
  },
  {
    id: 'relativity-theory',
    name: '相对论',
    icon: '🌌',
    category: 'theory',
    importance: 'high',
    size: 23,
    color: '#ff00ff',
    description: '描述时空结构和引力本质的理论，是时空操控技术的理论基础。',
    properties: [
      { name: '时空曲率', value: '10^-15', unit: 'm^-1' },
      { name: '光速', value: '2.998×10^8', unit: 'm/s' },
      { name: '引力波频率', value: '100-1000', unit: 'Hz' }
    ]
  },
  {
    id: 'artificial-field',
    name: '人工场生成',
    icon: '🔬',
    category: 'field',
    importance: 'high',
    size: 22,
    color: '#ffd700',
    description: '通过技术手段创造和控制各种物理场的核心技术。',
    properties: [
      { name: '场强控制精度', value: '0.001', unit: '%' },
      { name: '响应时间', value: '10^-12', unit: 's' },
      { name: '稳定性', value: '99.99', unit: '%' }
    ]
  },
  {
    id: 'space-time-manipulation',
    name: '时空操控',
    icon: '⏰',
    category: 'application',
    importance: 'high',
    size: 21,
    color: '#00ff00',
    description: '利用人工场技术实现对时空结构的精确控制和操作。',
    properties: [
      { name: '时间膨胀因子', value: '1.001', unit: '' },
      { name: '空间弯曲度', value: '10^-10', unit: 'm^-1' },
      { name: '操控范围', value: '1000', unit: 'm' }
    ]
  },
  {
    id: 'warp-drive',
    name: '曲速引擎',
    icon: '🚀',
    category: 'application',
    importance: 'medium',
    size: 20,
    color: '#ff6b6b',
    description: '基于时空弯曲原理的超光速推进系统。',
    properties: [
      { name: '最大速度', value: '10c', unit: '光速' },
      { name: '能量需求', value: '10^20', unit: 'J' },
      { name: '稳定性', value: '85', unit: '%' }
    ]
  },
  {
    id: 'quantum-entanglement',
    name: '量子纠缠',
    icon: '🔗',
    category: 'field',
    importance: 'medium',
    size: 19,
    color: '#9c27b0',
    description: '量子粒子间的非局域关联现象，用于量子通信和计算。',
    properties: [
      { name: '纠缠保真度', value: '0.99', unit: '' },
      { name: '传输距离', value: '1000', unit: 'km' },
      { name: '纠缠寿命', value: '10', unit: 's' }
    ]
  },
  {
    id: 'holographic-projection',
    name: '全息投影',
    icon: '🎭',
    category: 'application',
    importance: 'medium',
    size: 18,
    color: '#ff9800',
    description: '基于光场操控的三维全息显示技术。',
    properties: [
      { name: '分辨率', value: '8K×8K', unit: 'pixels' },
      { name: '视角范围', value: '360', unit: '度' },
      { name: '刷新率', value: '120', unit: 'Hz' }
    ]
  }
])

// 网络连接数据
const networkConnections = ref<NetworkConnection[]>([
  {
    source: 'electromagnetic-field',
    target: 'artificial-field',
    type: 'causal',
    strength: 0.9,
    distance: 1.2,
    energy: 85,
    description: '电磁场理论为人工场生成提供了基础的物理原理和数学框架。',
    animationSpeed: 2
  },
  {
    source: 'quantum-mechanics',
    target: 'quantum-entanglement',
    type: 'mathematical',
    strength: 0.95,
    distance: 0.8,
    energy: 92,
    description: '量子力学直接描述了量子纠缠现象的本质和规律。',
    animationSpeed: 1.5
  },
  {
    source: 'relativity-theory',
    target: 'space-time-manipulation',
    type: 'causal',
    strength: 0.88,
    distance: 1.1,
    energy: 78,
    description: '相对论为时空操控技术提供了理论基础和数学工具。',
    animationSpeed: 2.5
  },
  {
    source: 'space-time-manipulation',
    target: 'warp-drive',
    type: 'conceptual',
    strength: 0.85,
    distance: 1.0,
    energy: 88,
    description: '时空操控技术是实现曲速引擎的关键技术基础。',
    animationSpeed: 2
  },
  {
    source: 'artificial-field',
    target: 'holographic-projection',
    type: 'experimental',
    strength: 0.75,
    distance: 1.3,
    energy: 65,
    description: '人工场技术可以用于控制光场，实现高质量的全息投影。',
    animationSpeed: 3
  },
  {
    source: 'quantum-entanglement',
    target: 'space-time-manipulation',
    type: 'conceptual',
    strength: 0.7,
    distance: 1.5,
    energy: 72,
    description: '量子纠缠现象可能与时空的非局域性质存在深层联系。',
    animationSpeed: 2.8
  }
])

// 计算属性
const nodePositions = computed(() => {
  const positions: Record<string, { x: number; y: number }> = {}
  const centerX = svgDimensions.value.width / 2
  const centerY = svgDimensions.value.height / 2
  const radius = Math.min(centerX, centerY) * 0.7
  
  networkNodes.value.forEach((node, index) => {
    const angle = (index / networkNodes.value.length) * 2 * Math.PI
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
  
  return positions
})

// 方法
const setVisualizationMode = (mode: string) => {
  currentMode.value = mode
  // 这里可以添加切换可视化模式的逻辑
}

const getStarStyle = () => {
  return {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 3 + 's',
    animationDuration: (Math.random() * 2 + 1) + 's'
  }
}

const getWebStrandStyle = () => {
  return {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    width: Math.random() * 200 + 100 + 'px',
    transform: `rotate(${Math.random() * 360}deg)`,
    animationDelay: Math.random() * 5 + 's'
  }
}

const getVortexStyle = (index: number) => {
  const size = 100 + index * 50
  return {
    width: size + 'px',
    height: size + 'px',
    animationDelay: index * 0.5 + 's'
  }
}

const getFieldParticleStyle = () => {
  return {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 4 + 's',
    animationDuration: (Math.random() * 3 + 2) + 's'
  }
}

const getNodePosition = (nodeId: string) => {
  return nodePositions.value[nodeId] || { x: 0, y: 0 }
}

const selectNode = (node: NetworkNode | undefined) => {
  if (node) {
    selectedNode.value = node
    selectedConnection.value = null
  }
}

const selectConnection = (connection: NetworkConnection) => {
  selectedConnection.value = connection
  selectedNode.value = null
}

const highlightNode = (node: NetworkNode) => {
  // 高亮节点的逻辑
}

const unhighlightNode = () => {
  // 取消高亮的逻辑
}

const getNodeById = (id: string) => {
  return networkNodes.value.find(node => node.id === id)
}

const getNodeConnections = (nodeId: string) => {
  return networkConnections.value
    .filter(conn => conn.source === nodeId || conn.target === nodeId)
    .map(conn => conn.source === nodeId ? conn.target : conn.source)
}

const getConnectionType = (sourceId: string, targetId: string) => {
  const connection = networkConnections.value.find(
    conn => (conn.source === sourceId && conn.target === targetId) ||
            (conn.source === targetId && conn.target === sourceId)
  )
  return getConnectionTypeName(connection?.type || 'unknown')
}

const getConnectionStrength = (sourceId: string, targetId: string) => {
  const connection = networkConnections.value.find(
    conn => (conn.source === sourceId && conn.target === targetId) ||
            (conn.source === targetId && conn.target === sourceId)
  )
  return connection?.strength.toFixed(2) || '0.00'
}

const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    theory: '理论',
    field: '场技术',
    application: '应用',
    experiment: '实验'
  }
  return categoryMap[category] || category
}

const getConnectionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    causal: '因果关系',
    mathematical: '数学关系',
    conceptual: '概念关系',
    experimental: '实验关系',
    unknown: '未知关系'
  }
  return typeMap[type] || type
}

const exploreNode = (node: NetworkNode) => {
  console.log('探索节点:', node.name)
  // 这里可以添加探索节点的逻辑
}

const analyzeConnections = (node: NetworkNode) => {
  console.log('分析连接:', node.name)
  // 这里可以添加分析连接的逻辑
}

const strengthenConnection = (connection: NetworkConnection) => {
  console.log('强化连接:', connection.source, '->', connection.target)
  // 这里可以添加强化连接的逻辑
}

const traceConnection = (connection: NetworkConnection) => {
  console.log('追踪路径:', connection.source, '->', connection.target)
  // 这里可以添加追踪连接的逻辑
}

const runCentralityAnalysis = () => {
  console.log('运行中心性分析')
  // 这里可以添加中心性分析的逻辑
}

const runClusterAnalysis = () => {
  console.log('运行聚类分析')
  // 这里可以添加聚类分析的逻辑
}

const runPathAnalysis = () => {
  console.log('运行路径分析')
  // 这里可以添加路径分析的逻辑
}

const runInfluenceAnalysis = () => {
  console.log('运行影响力分析')
  // 这里可以添加影响力分析的逻辑
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
  nextTick(() => {
    if (networkSvg.value) {
      // 初始化SVG相关逻辑
    }
  })
})
</script>

<style scoped>
.spacetime-network {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
  overflow-x: hidden;
}

/* 头部区域 */
.header-section {
  position: relative;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.cosmic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 1px;
  height: 1px;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.cosmic-web {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.web-strand {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.3), transparent);
  animation: webPulse 5s ease-in-out infinite;
}

@keyframes webPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

.energy-vortex {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vortex-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(0, 245, 255, 0.2);
  border-radius: 50%;
  animation: vortexSpin 10s linear infinite;
}

@keyframes vortexSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00f5ff, #64ffda, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px #00f5ff);
}

.page-subtitle {
  font-size: 1.25rem;
  color: #b0bec5;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.panel-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-icon {
  font-size: 1.5rem;
}

.control-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover,
.control-btn.active {
  border-color: rgba(100, 255, 218, 0.6);
  background: rgba(100, 255, 218, 0.1);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.2);
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-text {
  font-size: 0.875rem;
  font-weight: bold;
}

.tool-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-label {
  font-size: 0.875rem;
  color: #64ffda;
  min-width: 80px;
}

.cosmic-slider {
  flex: 1;
  height: 6px;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.cosmic-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
}

.slider-value {
  font-size: 0.875rem;
  color: #ffffff;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.network-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #00f5ff;
}

.stat-label {
  font-size: 0.875rem;
  color: #64ffda;
}

/* 可视化区域 */
.visualization-area {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
}

.network-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  background: rgba(26, 26, 46, 0.5);
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.network-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dimension-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.grid-plane {
  position: absolute;
  border: 1px solid #64ffda;
}

.xy-plane {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.xz-plane {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: perspective(500px) rotateX(45deg);
}

.yz-plane {
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  transform: perspective(500px) rotateY(45deg);
}

.quantum-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.field-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #64ffda;
  border-radius: 50%;
  animation: quantumFloat 4s ease-in-out infinite;
}

@keyframes quantumFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
}

.network-svg {
  position: relative;
  z-index: 1;
  background: transparent;
}

.connection-line {
  cursor: pointer;
  transition: all 0.3s;
}

.connection-line:hover {
  stroke-width: 5 !important;
  filter: drop-shadow(0 0 10px currentColor);
}

.network-node {
  cursor: pointer;
  transition: all 0.3s;
}

.network-node:hover {
  transform: scale(1.1);
}

.network-node.selected .node-halo {
  stroke-width: 4;
  stroke-opacity: 0.8;
}

.node-body {
  transition: all 0.3s;
}

.node-icon {
  pointer-events: none;
  font-weight: bold;
}

.node-label {
  pointer-events: none;
  font-weight: bold;
}

.interaction-hints {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 20px;
  font-size: 0.875rem;
  color: #64ffda;
  backdrop-filter: blur(10px);
}

.hint-icon {
  font-size: 1rem;
}

/* 详情面板 */
.node-details-panel,
.connection-details-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-left: 2px solid rgba(100, 255, 218, 0.3);
  z-index: 1000;
  overflow-y: auto;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.panel-container {
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.node-info,
.connection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.node-icon-large {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
}

.connection-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-meta,
.connection-meta {
  flex: 1;
}

.node-title,
.connection-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.node-tags,
.connection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.tag.category {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.tag.importance.high {
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
}

.tag.importance.medium {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
}

.tag.importance.low {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.tag.connections {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.tag.type {
  background: rgba(0, 245, 255, 0.2);
  color: #00f5ff;
}

.tag.strength {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.close-panel {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-panel:hover {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.close-icon {
  font-size: 1.5rem;
  color: #ffffff;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 1rem;
}

.description-text {
  color: #b0bec5;
  line-height: 1.6;
}

.properties-grid,
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.property-item,
.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  text-align: center;
}

.property-name {
  font-size: 0.875rem;
  color: #64ffda;
  margin-bottom: 0.5rem;
}

.property-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.property-unit {
  font-size: 0.75rem;
  color: #b0bec5;
}

.metric-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.metric-info {
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f5ff;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #64ffda;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.4);
}

.related-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.related-info {
  flex: 1;
}

.related-name {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.related-type {
  font-size: 0.875rem;
  color: #64ffda;
}

.related-strength {
  font-size: 0.875rem;
  color: #ffa500;
  font-weight: bold;
}

.panel-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
}

.action-btn.primary {
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  color: #0a0a0f;
}

.action-btn.primary:hover {
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: transparent;
  color: #64ffda;
  border: 2px solid rgba(100, 255, 218, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
}

/* 分析工具 */
.analysis-tools {
  padding: 2rem;
  background: rgba(26, 26, 46, 0.5);
}

.tools-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-card:hover {
  border-color: rgba(100, 255, 218, 0.5);
  background: rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.2);
}

.tool-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.tool-description {
  font-size: 0.875rem;
  color: #b0bec5;
}

.tool-status {
  width: 40px;
  text-align: center;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto;
}

.status-indicator.ready {
  background: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .node-details-panel,
  .connection-details-panel {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
  }
  
  .panel-actions {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-buttons {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .properties-grid,
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .spacetime-network {
    padding: 0;
  }
  
  .header-section {
    padding: 2rem 1rem;
  }
  
  .visualization-area {
    padding: 1rem;
  }
  
  .analysis-tools {
    padding: 1rem;
  }
  
  .properties-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>