<template>
  <div class="relationships-view">
    <!-- 头部区域 -->
    <div class="view-header animate-fade-in">
      <h1 class="view-title">公式关系图谱</h1>
      <p class="view-subtitle">探索统一场论公式之间的内在联系与演化路径</p>
      
      <!-- 统计信息 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ filteredNodes.length }}</span>
          <span class="stat-label">公式节点</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ filteredLinks.length }}</span>
          <span class="stat-label">关系连接</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ categories.length }}</span>
          <span class="stat-label">理论分类</span>
        </div>
      </div>
    </div>

    <div class="graph-container">
      <!-- 关系图可视化区域 -->
      <div class="graph-section animate-scale-in">
        <!-- 工具栏 -->
        <div class="graph-toolbar">
          <div class="toolbar-group">
            <button
              @click="zoomIn"
              class="toolbar-btn"
              title="放大"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>
            <button
              @click="zoomOut"
              class="toolbar-btn"
              title="缩小"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            <button
              @click="fitToScreen"
              class="toolbar-btn"
              title="适应屏幕"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </button>
          </div>
          
          <div class="toolbar-group">
            <button
              @click="togglePhysics"
              class="toolbar-btn"
              :class="{ active: physicsEnabled }"
              title="切换物理引擎"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </button>
            <button
              @click="toggleLabels"
              class="toolbar-btn"
              :class="{ active: showLabels }"
              title="显示/隐藏标签"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 图形画布 -->
        <div class="graph-canvas" ref="graphContainer">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p class="loading-text">正在构建关系图谱...</p>
          </div>
        </div>

        <!-- 图例 -->
        <div class="graph-legend">
          <h4 class="legend-title">图例说明</h4>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-node" style="background: #3B82F6;"></div>
              <span>时空理论</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #10B981;"></div>
              <span>力学基础</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #F59E0B;"></div>
              <span>统一理论</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #EF4444;"></div>
              <span>电磁理论</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #8B5CF6;"></div>
              <span>应用理论</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel animate-slide-in">
        <!-- 分类筛选 -->
        <div class="panel-section">
          <h3 class="panel-title">
            <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            分类筛选
          </h3>
          <div class="category-filters">
            <button
              @click="filterByCategory('')"
              class="category-btn hover-scale"
              :class="{ active: selectedCategory === '' }"
            >
              <span class="category-count">{{ formulas.length }}</span>
              全部显示
            </button>
            <button
              v-for="category in categories"
              :key="category.name"
              @click="filterByCategory(category.name)"
              class="category-btn hover-scale"
              :class="{ active: selectedCategory === category.name }"
              :style="{ 
                borderColor: category.color,
                backgroundColor: selectedCategory === category.name ? category.color : 'transparent',
                color: selectedCategory === category.name ? 'white' : category.color
              }"
            >
              <span class="category-count">{{ category.count }}</span>
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- 搜索功能 -->
        <div class="panel-section">
          <h3 class="panel-title">
            <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            搜索公式
          </h3>
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入公式名称或描述..."
              class="search-input"
              @input="handleSearch"
            >
            <div v-if="searchResults.length > 0" class="search-results">
              <div
                v-for="result in searchResults"
                :key="result.id"
                @click="highlightNode(result)"
                class="search-result-item hover-scale"
              >
                <div class="result-number" :style="{ backgroundColor: result.color }">
                  {{ result.id }}
                </div>
                <div class="result-content">
                  <div class="result-name">{{ result.name }}</div>
                  <div class="result-category">{{ result.category }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 布局控制 -->
        <div class="panel-section">
          <h3 class="panel-title">
            <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
            布局设置
          </h3>
          <div class="layout-controls">
            <div class="control-group">
              <label class="control-label">节点大小</label>
              <input
                v-model="nodeSize"
                type="range"
                min="10"
                max="40"
                class="control-slider"
                @input="updateNodeSize"
              >
              <span class="control-value">{{ nodeSize }}px</span>
            </div>
            <div class="control-group">
              <label class="control-label">连线强度</label>
              <input
                v-model="linkStrength"
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                class="control-slider"
                @input="updateLinkStrength"
              >
              <span class="control-value">{{ linkStrength }}</span>
            </div>
            <div class="control-group">
              <label class="control-label">排斥力</label>
              <input
                v-model="chargeStrength"
                type="range"
                min="-1000"
                max="-100"
                step="50"
                class="control-slider"
                @input="updateChargeStrength"
              >
              <span class="control-value">{{ Math.abs(chargeStrength) }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="panel-section">
          <div class="action-buttons">
            <button
              @click="resetGraph"
              class="action-btn primary hover-scale"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              重置视图
            </button>
            <button
              @click="exportGraph"
              class="action-btn secondary hover-scale"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              导出图片
            </button>
            <button
              @click="toggleFullscreen"
              class="action-btn secondary hover-scale"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
              全屏模式
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中公式信息 -->
    <Transition name="slide-up">
      <div
        v-if="selectedNode"
        class="selected-info"
      >
        <div class="info-card">
          <div class="info-header">
            <div class="formula-number" :style="{ backgroundColor: selectedNode.color }">
              {{ selectedNode.id }}
            </div>
            <div class="formula-meta">
              <h3 class="formula-name">{{ selectedNode.name }}</h3>
              <span class="formula-category">{{ selectedNode.category }}</span>
            </div>
            <button
              @click="selectedNode = null"
              class="close-btn hover-scale"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="formula-latex" ref="latexContainer">
            $${{ selectedNode.latex }}$$
          </div>
          
          <p class="formula-description">{{ selectedNode.description }}</p>
          
          <!-- 相关公式 -->
          <div v-if="relatedFormulas.length > 0" class="related-formulas">
            <h4 class="related-title">相关公式</h4>
            <div class="related-list">
              <button
                v-for="related in relatedFormulas"
                :key="related.id"
                @click="selectRelatedFormula(related)"
                class="related-item hover-scale"
                :style="{ borderColor: related.color }"
              >
                <span class="related-number" :style="{ backgroundColor: related.color }">
                  {{ related.id }}
                </span>
                <span class="related-name">{{ related.name }}</span>
              </button>
            </div>
          </div>

          <div class="info-actions">
            <button
              @click="viewFormulaDetail(selectedNode)"
              class="detail-btn hover-scale"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              查看详情
            </button>
            <button
              @click="focusOnNode(selectedNode)"
              class="focus-btn hover-scale"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              聚焦节点
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 提示信息 -->
    <div v-if="!selectedNode && filteredNodes.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <h3 class="empty-title">没有找到匹配的公式</h3>
      <p class="empty-description">请尝试调整筛选条件或搜索关键词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { formulas, categories, type Formula } from '../data/formulas'

// 响应式状态
const graphContainer = ref<HTMLElement>()
const latexContainer = ref<HTMLElement>()
const selectedNode = ref<Formula | null>(null)
const selectedCategory = ref('')
const searchQuery = ref('')
const isLoading = ref(true)
const physicsEnabled = ref(true)
const showLabels = ref(true)

// 布局控制参数
const nodeSize = ref(20)
const linkStrength = ref(1)
const chargeStrength = ref(-300)

// D3 相关变量
let simulation: d3.Simulation<any, any> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
let nodeElements: d3.Selection<SVGCircleElement, any, SVGGElement, unknown> | null = null
let linkElements: d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null = null
let labelElements: d3.Selection<SVGTextElement, any, SVGGElement, unknown> | null = null

// 扩展节点类型
interface ExtendedFormula extends Formula {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  vx?: number
  vy?: number
}

// 创建图数据
const nodes: ExtendedFormula[] = formulas.map(formula => ({
  ...formula,
  x: 0,
  y: 0,
  fx: null,
  fy: null
}))

// 定义更复杂的关系网络
const linkData = [
  // 时空理论内部关系
  { source: 1, target: 2, strength: 1.5, type: 'evolution' },
  
  // 时空理论到力学基础
  { source: 1, target: 5, strength: 1.2, type: 'foundation' },
  { source: 2, target: 8, strength: 1.0, type: 'application' },
  
  // 力学基础内部关系
  { source: 3, target: 4, strength: 1.8, type: 'definition' },
  { source: 3, target: 6, strength: 1.3, type: 'extension' },
  { source: 5, target: 6, strength: 1.6, type: 'evolution' },
  
  // 力学基础到统一理论
  { source: 4, target: 7, strength: 1.4, type: 'integration' },
  { source: 6, target: 7, strength: 1.7, type: 'integration' },
  
  // 统一理论内部关系
  { source: 7, target: 8, strength: 1.5, type: 'complement' },
  
  // 统一理论到电磁理论
  { source: 7, target: 12, strength: 1.6, type: 'derivation' },
  { source: 7, target: 14, strength: 1.3, type: 'derivation' },
  { source: 8, target: 12, strength: 1.2, type: 'wave_relation' },
  
  // 电磁理论内部关系
  { source: 9, target: 10, strength: 1.8, type: 'definition' },
  { source: 9, target: 11, strength: 1.7, type: 'definition' },
  { source: 10, target: 14, strength: 1.4, type: 'field_relation' },
  { source: 11, target: 15, strength: 1.3, type: 'field_relation' },
  { source: 12, target: 14, strength: 1.5, type: 'transformation' },
  { source: 13, target: 15, strength: 1.4, type: 'vector_relation' },
  { source: 14, target: 15, strength: 1.6, type: 'field_interaction' },
  
  // 电磁理论到应用理论
  { source: 12, target: 16, strength: 1.2, type: 'energy_relation' },
  { source: 14, target: 17, strength: 1.1, type: 'dynamics' },
  
  // 应用理论内部关系
  { source: 16, target: 17, strength: 1.3, type: 'application' }
]

const links = linkData.map(link => ({
  source: nodes.find(n => n.id === link.source)!,
  target: nodes.find(n => n.id === link.target)!,
  strength: link.strength,
  type: link.type
}))

// 计算属性
const filteredNodes = computed(() => {
  if (!selectedCategory.value) return nodes
  return nodes.filter(node => node.category === selectedCategory.value)
})

const filteredLinks = computed(() => {
  const nodeIds = new Set(filteredNodes.value.map(n => n.id))
  return links.filter(link => 
    nodeIds.has((link.source as ExtendedFormula).id) && 
    nodeIds.has((link.target as ExtendedFormula).id)
  )
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return formulas.filter(formula => 
    formula.name.toLowerCase().includes(query) ||
    formula.description.toLowerCase().includes(query) ||
    formula.category.toLowerCase().includes(query)
  ).slice(0, 5)
})

const relatedFormulas = computed(() => {
  if (!selectedNode.value) return []
  
  const relatedIds = new Set<number>()
  
  // 找到所有相关的节点
  links.forEach(link => {
    const sourceId = (link.source as ExtendedFormula).id
    const targetId = (link.target as ExtendedFormula).id
    
    if (sourceId === selectedNode.value!.id) {
      relatedIds.add(targetId)
    } else if (targetId === selectedNode.value!.id) {
      relatedIds.add(sourceId)
    }
  })
  
  return formulas.filter(f => relatedIds.has(f.id))
})

// 生命周期
onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    if (graphContainer.value) {
      initGraph()
      isLoading.value = false
    }
  }, 500)
})

onUnmounted(() => {
  if (simulation) {
    simulation.stop()
  }
})

// 监听器
watch(selectedNode, async (newNode) => {
  if (newNode && latexContainer.value) {
    await nextTick()
    // 重新渲染 MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        await window.MathJax.typesetPromise([latexContainer.value])
      } catch (error) {
        console.warn('MathJax rendering failed:', error)
      }
    }
  }
})

watch([selectedCategory, searchQuery], () => {
  updateGraphData()
})

watch([nodeSize, linkStrength, chargeStrength], () => {
  updateSimulationForces()
})

// 图形初始化
const initGraph = () => {
  if (!graphContainer.value) return

  const container = graphContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清除之前的内容
  d3.select(container).selectAll('*').remove()

  // 创建 SVG
  svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 创建缩放行为
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      if (svg) {
        svg.select('.graph-content').attr('transform', event.transform)
      }
    })

  svg.call(zoom)

  // 创建主要内容组
  const g = svg.append('g').attr('class', 'graph-content')

  // 创建箭头标记
  svg.append('defs').selectAll('marker')
    .data(['arrow'])
    .enter().append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 创建力导向图
  simulation = d3.forceSimulation(filteredNodes.value)
    .force('link', d3.forceLink(filteredLinks.value)
      .id((d: any) => d.id)
      .distance(d => 80 + (d as any).strength * 20)
      .strength(linkStrength.value))
    .force('charge', d3.forceManyBody().strength(chargeStrength.value))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(nodeSize.value + 5))

  // 创建连线
  linkElements = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(filteredLinks.value)
    .enter().append('line')
    .attr('stroke', d => getLinkColor((d as any).type))
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => 1 + (d as any).strength)
    .attr('marker-end', 'url(#arrow)')

  // 创建节点
  nodeElements = g.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(filteredNodes.value)
    .enter().append('circle')
    .attr('r', nodeSize.value)
    .attr('fill', (d: any) => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      event.stopPropagation()
      selectedNode.value = d as Formula
      highlightConnections(d as ExtendedFormula)
    })
    .on('mouseover', (event, d) => {
      showTooltip(event, d as Formula)
      highlightConnections(d as ExtendedFormula, 0.3)
    })
    .on('mouseout', () => {
      hideTooltip()
      resetHighlight()
    })

  // 创建标签
  labelElements = g.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(filteredNodes.value)
    .enter().append('text')
    .text((d: any) => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .style('pointer-events', 'none')
    .style('display', showLabels.value ? 'block' : 'none')

  // 更新位置
  simulation.on('tick', () => {
    if (linkElements) {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
    }

    if (nodeElements) {
      nodeElements
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
    }

    if (labelElements) {
      labelElements
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    }
  })

  // 点击空白区域取消选择
  svg.on('click', () => {
    selectedNode.value = null
    resetHighlight()
  })
}

// 拖拽事件处理
function dragstarted(event: any, d: any) {
  if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(event: any, d: any) {
  d.fx = event.x
  d.fy = event.y
}

function dragended(event: any, d: any) {
  if (!event.active && simulation) simulation.alphaTarget(0)
  if (!event.sourceEvent.ctrlKey) {
    d.fx = null
    d.fy = null
  }
}

// 工具函数
const getLinkColor = (type: string) => {
  const colors: Record<string, string> = {
    'evolution': '#3B82F6',
    'foundation': '#10B981',
    'application': '#F59E0B',
    'definition': '#EF4444',
    'extension': '#8B5CF6',
    'integration': '#F97316',
    'complement': '#06B6D4',
    'derivation': '#84CC16',
    'wave_relation': '#EC4899',
    'field_relation': '#6366F1',
    'transformation': '#14B8A6',
    'vector_relation': '#F59E0B',
    'field_interaction': '#EF4444',
    'energy_relation': '#8B5CF6',
    'dynamics': '#10B981'
  }
  return colors[type] || '#999'
}

const showTooltip = (event: MouseEvent, formula: Formula) => {
  // 实现工具提示显示逻辑
  console.log('Show tooltip for:', formula.name)
}

const hideTooltip = () => {
  // 实现工具提示隐藏逻辑
}

const highlightConnections = (node: ExtendedFormula, opacity = 1) => {
  if (!linkElements || !nodeElements) return

  // 高亮相关连接
  linkElements
    .style('opacity', (d: any) => {
      return (d.source.id === node.id || d.target.id === node.id) ? opacity : 0.1
    })
    .style('stroke-width', (d: any) => {
      return (d.source.id === node.id || d.target.id === node.id) ? 
        (2 + d.strength) : (1 + d.strength)
    })

  // 高亮相关节点
  nodeElements
    .style('opacity', (d: any) => {
      const isConnected = links.some(link => 
        (link.source.id === node.id && link.target.id === d.id) ||
        (link.target.id === node.id && link.source.id === d.id)
      )
      return (d.id === node.id || isConnected) ? opacity : 0.3
    })
}

const resetHighlight = () => {
  if (!linkElements || !nodeElements) return

  linkElements
    .style('opacity', 0.6)
    .style('stroke-width', (d: any) => 1 + d.strength)

  nodeElements
    .style('opacity', 1)
}

// 控制面板功能
const filterByCategory = (categoryName: string) => {
  selectedCategory.value = categoryName
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const highlightNode = (formula: Formula) => {
  selectedNode.value = formula
  
  // 找到节点并聚焦
  const node = filteredNodes.value.find(n => n.id === formula.id)
  if (node && svg && zoom) {
    const transform = d3.zoomIdentity
      .translate(
        graphContainer.value!.clientWidth / 2 - (node.x || 0),
        graphContainer.value!.clientHeight / 2 - (node.y || 0)
      )
      .scale(1.5)
    
    svg.transition()
      .duration(750)
      .call(zoom.transform, transform)
  }
}

// 工具栏功能
const zoomIn = () => {
  if (svg && zoom) {
    svg.transition().call(zoom.scaleBy, 1.5)
  }
}

const zoomOut = () => {
  if (svg && zoom) {
    svg.transition().call(zoom.scaleBy, 1 / 1.5)
  }
}

const fitToScreen = () => {
  if (svg && zoom) {
    const bounds = svg.select('.graph-content').node()?.getBBox()
    if (bounds) {
      const width = graphContainer.value!.clientWidth
      const height = graphContainer.value!.clientHeight
      const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9
      
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-bounds.x - bounds.width / 2, -bounds.y - bounds.height / 2)
      
      svg.transition().duration(750).call(zoom.transform, transform)
    }
  }
}

const togglePhysics = () => {
  physicsEnabled.value = !physicsEnabled.value
  if (simulation) {
    if (physicsEnabled.value) {
      simulation.alpha(0.3).restart()
    } else {
      simulation.stop()
    }
  }
}

const toggleLabels = () => {
  showLabels.value = !showLabels.value
  if (labelElements) {
    labelElements.style('display', showLabels.value ? 'block' : 'none')
  }
}

// 布局控制
const updateNodeSize = () => {
  if (nodeElements) {
    nodeElements.attr('r', nodeSize.value)
  }
  if (simulation) {
    simulation.force('collision', d3.forceCollide().radius(nodeSize.value + 5))
    simulation.alpha(0.3).restart()
  }
}

const updateLinkStrength = () => {
  updateSimulationForces()
}

const updateChargeStrength = () => {
  updateSimulationForces()
}

const updateSimulationForces = () => {
  if (simulation) {
    simulation
      .force('link', d3.forceLink(filteredLinks.value)
        .id((d: any) => d.id)
        .distance(d => 80 + (d as any).strength * 20)
        .strength(linkStrength.value))
      .force('charge', d3.forceManyBody().strength(chargeStrength.value))
      .alpha(0.3)
      .restart()
  }
}

const updateGraphData = () => {
  if (!simulation || !svg) return

  // 更新节点数据
  nodeElements = svg.select('.nodes')
    .selectAll('circle')
    .data(filteredNodes.value, (d: any) => d.id)

  nodeElements.exit().remove()

  const nodeEnter = nodeElements.enter().append('circle')
    .attr('r', nodeSize.value)
    .attr('fill', (d: any) => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      event.stopPropagation()
      selectedNode.value = d as Formula
      highlightConnections(d as ExtendedFormula)
    })
    .on('mouseover', (event, d) => {
      showTooltip(event, d as Formula)
      highlightConnections(d as ExtendedFormula, 0.3)
    })
    .on('mouseout', () => {
      hideTooltip()
      resetHighlight()
    })

  nodeElements = nodeElements.merge(nodeEnter)

  // 更新连线数据
  linkElements = svg.select('.links')
    .selectAll('line')
    .data(filteredLinks.value)

  linkElements.exit().remove()

  const linkEnter = linkElements.enter().append('line')
    .attr('stroke', d => getLinkColor((d as any).type))
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => 1 + (d as any).strength)
    .attr('marker-end', 'url(#arrow)')

  linkElements = linkElements.merge(linkEnter)

  // 更新标签数据
  labelElements = svg.select('.labels')
    .selectAll('text')
    .data(filteredNodes.value, (d: any) => d.id)

  labelElements.exit().remove()

  const labelEnter = labelElements.enter().append('text')
    .text((d: any) => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .style('pointer-events', 'none')
    .style('display', showLabels.value ? 'block' : 'none')

  labelElements = labelElements.merge(labelEnter)

  // 更新仿真
  simulation.nodes(filteredNodes.value)
  simulation.force('link', d3.forceLink(filteredLinks.value)
    .id((d: any) => d.id)
    .distance(d => 80 + (d as any).strength * 20)
    .strength(linkStrength.value))
  simulation.alpha(1).restart()
}

// 操作按钮功能
const resetGraph = () => {
  selectedCategory.value = ''
  selectedNode.value = null
  searchQuery.value = ''
  
  if (simulation) {
    // 重置所有节点的固定位置
    filteredNodes.value.forEach(node => {
      node.fx = null
      node.fy = null
    })
    simulation.alpha(1).restart()
  }
  
  // 重置缩放
  if (svg && zoom) {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity)
  }
  
  resetHighlight()
}

const exportGraph = () => {
  if (!svg) return
  
  try {
    const svgElement = svg.node()
    if (!svgElement) return
    
    // 创建 canvas 元素
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return
    
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      context.drawImage(img, 0, 0)
      
      // 下载图片
      const link = document.createElement('a')
      link.download = 'formula-relationships.png'
      link.href = canvas.toDataURL()
      link.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请稍后重试')
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    graphContainer.value?.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// 公式详情功能
const viewFormulaDetail = (formula: Formula) => {
  // 这里可以跳转到公式详情页面或打开详情弹窗
  console.log('View detail for formula:', formula.id)
  // 可以使用 router 跳转或者打开模态框
}

const selectRelatedFormula = (formula: Formula) => {
  selectedNode.value = formula
  highlightNode(formula)
}

const focusOnNode = (formula: Formula) => {
  highlightNode(formula)
}
</script>

<style scoped>
.relationships-view {
  @apply py-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
}

/* 头部样式 */
.view-header {
  @apply text-center mb-8 px-4;
}

.view-title {
  @apply text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6;
}

.stats-bar {
  @apply flex justify-center space-x-8 mt-6;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl font-bold text-blue-600 dark:text-blue-400;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

/* 主容器样式 */
.graph-container {
  @apply max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6;
}

.graph-section {
  @apply lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 工具栏样式 */
.graph-toolbar {
  @apply absolute top-4 left-4 right-4 z-10 flex justify-between items-center;
}

.toolbar-group {
  @apply flex space-x-2;
}

.toolbar-btn {
  @apply p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400;
}

.toolbar-btn.active {
  @apply bg-blue-500 text-white;
}

/* 图形画布样式 */
.graph-canvas {
  @apply w-full h-96 lg:h-[600px] relative;
}

.loading-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 bg-opacity-90;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4;
}

.loading-text {
  @apply text-gray-600 dark:text-gray-300 font-medium;
}

/* 图例样式 */
.graph-legend {
  @apply absolute bottom-4 left-4 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-lg;
}

.legend-title {
  @apply text-sm font-bold text-gray-900 dark:text-white mb-2;
}

.legend-items {
  @apply space-y-1;
}

.legend-item {
  @apply flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300;
}

.legend-node {
  @apply w-3 h-3 rounded-full;
}

/* 控制面板样式 */
.control-panel {
  @apply space-y-6;
}

.panel-section {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700;
  backdrop-filter: blur(10px);
}

.panel-title {
  @apply text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center;
}

/* 分类筛选样式 */
.category-filters {
  @apply space-y-2;
}

.category-btn {
  @apply w-full px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300 text-left flex items-center justify-between hover:shadow-md;
}

.category-btn.active {
  @apply shadow-lg transform scale-105;
}

.category-count {
  @apply text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300;
}

.category-btn.active .category-count {
  @apply bg-white bg-opacity-20 text-white;
}

/* 搜索样式 */
.search-container {
  @apply relative;
}

.search-input {
  @apply w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all;
}

.search-results {
  @apply absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto z-20;
}

.search-result-item {
  @apply flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0;
}

.result-number {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3;
}

.result-content {
  @apply flex-1;
}

.result-name {
  @apply font-medium text-gray-900 dark:text-white text-sm;
}

.result-category {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

/* 布局控制样式 */
.layout-controls {
  @apply space-y-4;
}

.control-group {
  @apply space-y-2;
}

.control-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.control-slider {
  @apply w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer;
}

.control-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.control-value {
  @apply text-xs text-gray-500 dark:text-gray-400 font-mono;
}

/* 操作按钮样式 */
.action-buttons {
  @apply space-y-3;
}

.action-btn {
  @apply w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center;
}

.action-btn.primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg;
}

.action-btn.secondary {
  @apply bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300;
}

/* 选中公式信息样式 */
.selected-info {
  @apply max-w-4xl mx-auto px-4 mt-8;
}

.info-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700;
  backdrop-filter: blur(10px);
}

.info-header {
  @apply flex items-center justify-between mb-4;
}

.formula-number {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg;
}

.formula-meta {
  @apply flex-1 ml-4;
}

.formula-name {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.formula-category {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors;
}

.formula-latex {
  @apply text-center py-6 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6 text-lg overflow-x-auto;
}

.formula-description {
  @apply text-gray-600 dark:text-gray-300 mb-6 leading-relaxed;
}

/* 相关公式样式 */
.related-formulas {
  @apply mb-6;
}

.related-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.related-list {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-2;
}

.related-item {
  @apply flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer;
}

.related-number {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2;
}

.related-name {
  @apply text-sm text-gray-700 dark:text-gray-300 truncate;
}

.info-actions {
  @apply flex flex-wrap gap-3;
}

.detail-btn, .focus-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center;
}

.detail-btn {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.focus-btn {
  @apply bg-purple-500 hover:bg-purple-600 text-white;
}

/* 空状态样式 */
.empty-state {
  @apply text-center py-16 px-4;
}

.empty-icon {
  @apply mb-4;
}

.empty-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-2;
}

.empty-description {
  @apply text-gray-500 dark:text-gray-400;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 基础动画类 */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.6s ease-out;
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .graph-container {
    @apply grid-cols-1;
  }
  
  .graph-section {
    @apply order-2;
  }
  
  .control-panel {
    @apply order-1;
  }
  
  .graph-toolbar {
    @apply flex-col space-y-2;
  }
  
  .toolbar-group {
    @apply justify-center;
  }
  
  .stats-bar {
    @apply flex-col space-y-2 space-x-0;
  }
}

@media (max-width: 640px) {
  .view-title {
    @apply text-3xl;
  }
  
  .graph-canvas {
    @apply h-80;
  }
  
  .info-actions {
    @apply flex-col;
  }
  
  .related-list {
    @apply grid-cols-1;
  }
  
  .graph-legend {
    @apply hidden;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .control-slider::-webkit-slider-thumb {
    @apply bg-blue-400;
  }
}

/* 动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 自定义滚动条 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-600 rounded;
}

.search-results::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-500 rounded hover:bg-gray-400 dark:hover:bg-gray-400;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .category-btn {
    @apply border-4;
  }
  
  .toolbar-btn {
    @apply border-2 border-gray-400;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-scale-in,
  .animate-slide-in,
  .hover-scale,
  .slide-up-enter-active,
  .slide-up-leave-active {
    animation: none;
    transition: none;
  }
}
</style>