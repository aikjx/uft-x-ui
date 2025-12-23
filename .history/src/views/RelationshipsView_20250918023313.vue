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
import { ref, computed, onMounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { formulas, categories, type Formula } from '../data/formulas'

const graphContainer = ref<HTMLElement>()
const selectedNode = ref<Formula | null>(null)
const selectedCategory = ref('')

// 创建图数据
const nodes = formulas.map(formula => ({
  ...formula,
  x: 0,
  y: 0,
  fx: null as number | null,
  fy: null as number | null
}))

const links = [
  { source: 1, target: 2 },
  { source: 1, target: 5 },
  { source: 2, target: 8 },
  { source: 3, target: 4 },
  { source: 3, target: 6 },
  { source: 4, target: 12 },
  { source: 5, target: 6 },
  { source: 6, target: 7 },
  { source: 7, target: 12 },
  { source: 7, target: 14 },
  { source: 8, target: 12 },
  { source: 9, target: 10 },
  { source: 9, target: 11 },
  { source: 10, target: 14 },
  { source: 11, target: 15 },
  { source: 12, target: 14 },
  { source: 13, target: 15 },
  { source: 16, target: 17 }
].map(link => ({
  source: nodes.find(n => n.id === link.source)!,
  target: nodes.find(n => n.id === link.target)!
}))

let simulation: d3.Simulation<any, any> | null = null

onMounted(async () => {
  await nextTick()
  if (graphContainer.value) {
    initGraph()
  }
})

const initGraph = () => {
  if (!graphContainer.value) return

  const container = graphContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清除之前的内容
  d3.select(container).selectAll('*').remove()

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 创建力导向图
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))

  // 创建连线
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)

  // 创建节点
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('r', 20)
    .attr('fill', (d: any) => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      selectedNode.value = d
    })

  // 添加标签
  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .text((d: any) => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .style('pointer-events', 'none')

  // 更新位置
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)

    label
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
  })

  function dragstarted(event: any, d: any) {
    if (!event.active) simulation?.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: any, d: any) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event: any, d: any) {
    if (!event.active) simulation?.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

const filterByCategory = (categoryName: string) => {
  selectedCategory.value = selectedCategory.value === categoryName ? '' : categoryName
  // 这里可以添加筛选逻辑
}

const resetGraph = () => {
  selectedCategory.value = ''
  selectedNode.value = null
  if (simulation) {
    simulation.alpha(1).restart()
  }
}

const viewFormulaDetail = (formula: Formula) => {
  // 这里可以跳转到公式详情页面或打开详情弹窗
  console.log('View detail for formula:', formula.id)
}
</script>

<style scoped>
.relationships-view {
  @apply py-8;
}

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
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto;
}

.graph-container {
  @apply max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6;
}

.graph-section {
  @apply lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden;
}

.graph-canvas {
  @apply w-full h-96 lg:h-[600px];
}

.control-panel {
  @apply space-y-6;
}

.panel-section {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg;
}

.panel-title {
  @apply text-lg font-bold text-gray-900 dark:text-white mb-4;
}

.category-filters {
  @apply space-y-2;
}

.category-btn {
  @apply w-full px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 text-left;
}

.category-btn.active {
  @apply shadow-lg;
}

.reset-btn {
  @apply w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors;
}

.selected-info {
  @apply max-w-4xl mx-auto px-4 mt-8;
}

.info-card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg;
}

.info-header {
  @apply flex items-center mb-4;
}

.formula-number {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4;
}

.formula-name {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.formula-latex {
  @apply text-center py-4 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 text-lg;
}

.formula-description {
  @apply text-gray-600 dark:text-gray-300 mb-4;
}

.info-actions {
  @apply flex space-x-4;
}

.detail-btn {
  @apply px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors;
}

.close-btn {
  @apply px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

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
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>