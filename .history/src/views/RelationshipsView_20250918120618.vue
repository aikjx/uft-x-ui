<template>
  <div class="relationships-view">
    <!-- 头部区域 -->
    <div class="view-header">
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
      <div class="graph-section">
        <!-- 工具栏 -->
        <div class="graph-toolbar">
          <div class="toolbar-group">
            <button @click="zoomIn" class="toolbar-btn" title="放大">🔍+</button>
            <button @click="zoomOut" class="toolbar-btn" title="缩小">🔍-</button>
            <button @click="fitToScreen" class="toolbar-btn" title="适应屏幕">⊞</button>
          </div>
          
          <div class="toolbar-group">
            <button
              @click="togglePhysics"
              class="toolbar-btn"
              :class="{ active: physicsEnabled }"
              title="切换物理引擎"
            >
              ⚡
            </button>
            <button
              @click="toggleLabels"
              class="toolbar-btn"
              :class="{ active: showLabels }"
              title="显示/隐藏标签"
            >
              🏷️
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
              <span>基础理论</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #10B981;"></div>
              <span>电磁学</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #F59E0B;"></div>
              <span>量子力学</span>
            </div>
            <div class="legend-item">
              <div class="legend-node" style="background: #EF4444;"></div>
              <span>相对论</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <!-- 分类筛选 -->
        <div class="panel-section">
          <h3 class="panel-title">🔍 分类筛选</h3>
          <div class="category-filters">
            <button
              @click="filterByCategory('')"
              class="category-btn"
              :class="{ active: selectedCategory === '' }"
            >
              <span class="category-count">{{ formulas.length }}</span>
              全部显示
            </button>
            <button
              v-for="category in categories"
              :key="category.name"
              @click="filterByCategory(category.name)"
              class="category-btn"
              :class="{ active: selectedCategory === category.name }"
            >
              <span class="category-count">{{ getCategoryCount(category.name) }}</span>
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- 搜索功能 -->
        <div class="panel-section">
          <h3 class="panel-title">🔍 搜索公式</h3>
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入公式名称或描述..."
              class="search-input"
            >
            <div v-if="searchResults.length > 0" class="search-results">
              <div
                v-for="result in searchResults"
                :key="result.id"
                @click="highlightNode(result)"
                class="search-result-item"
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
          <h3 class="panel-title">⚙️ 布局设置</h3>
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
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="panel-section">
          <div class="action-buttons">
            <button @click="resetGraph" class="action-btn primary">
              🔄 重置视图
            </button>
            <button @click="exportGraph" class="action-btn secondary">
              📥 导出图片
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中公式信息 -->
    <div v-if="selectedNode" class="selected-info">
      <div class="info-card">
        <div class="info-header">
          <div class="formula-number" :style="{ backgroundColor: selectedNode.color }">
            {{ selectedNode.id }}
          </div>
          <div class="formula-meta">
            <h3 class="formula-name">{{ selectedNode.name }}</h3>
            <span class="formula-category">{{ selectedNode.category }}</span>
          </div>
          <button @click="selectedNode = null" class="close-btn">×</button>
        </div>
        
        <div class="formula-latex">{{ selectedNode.latex }}</div>
        <p class="formula-description">{{ selectedNode.description }}</p>
        
        <!-- 相关公式 -->
        <div v-if="relatedFormulas.length > 0" class="related-formulas">
          <h4 class="related-title">相关公式</h4>
          <div class="related-list">
            <button
              v-for="related in relatedFormulas"
              :key="related.id"
              @click="selectRelatedFormula(related)"
              class="related-item"
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
          <button @click="focusOnNode(selectedNode)" class="focus-btn">
            🎯 聚焦节点
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!selectedNode && filteredNodes.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">没有找到匹配的公式</h3>
      <p class="empty-description">请尝试调整筛选条件或搜索关键词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { formulas, categories } from '../data/formulas'
import type { SimpleFormula } from '../types/simple-formula'

// 响应式状态
const graphContainer = ref<HTMLElement>()
const selectedNode = ref<SimpleFormula | null>(null)
const selectedCategory = ref('')
const searchQuery = ref('')
const isLoading = ref(true)
const physicsEnabled = ref(true)
const showLabels = ref(true)

// 布局控制参数
const nodeSize = ref(20)
const linkStrength = ref(1)

// 简化的节点数据
const nodes = formulas.map(formula => ({
  ...formula,
  x: Math.random() * 800,
  y: Math.random() * 600
}))

// 简化的连接数据
const linkData = [
  { source: 1, target: 2, strength: 1.5 },
  { source: 1, target: 3, strength: 1.2 },
  { source: 2, target: 4, strength: 1.0 },
  { source: 3, target: 5, strength: 1.3 },
  { source: 4, target: 6, strength: 1.6 },
  { source: 5, target: 7, strength: 1.4 },
  { source: 6, target: 8, strength: 1.7 },
  { source: 7, target: 9, strength: 1.5 },
  { source: 8, target: 10, strength: 1.2 }
]

const links = linkData.map(link => ({
  source: nodes.find(n => n.id === link.source)!,
  target: nodes.find(n => n.id === link.target)!,
  strength: link.strength
}))

// 计算属性
const filteredNodes = computed(() => {
  if (!selectedCategory.value) return nodes
  return nodes.filter(node => node.category === selectedCategory.value)
})

const filteredLinks = computed(() => {
  const nodeIds = new Set(filteredNodes.value.map(n => n.id))
  return links.filter(link => 
    nodeIds.has(link.source.id) && nodeIds.has(link.target.id)
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
    if (link.source.id === selectedNode.value!.id) {
      relatedIds.add(link.target.id)
    } else if (link.target.id === selectedNode.value!.id) {
      relatedIds.add(link.source.id)
    }
  })
  
  return formulas.filter(f => relatedIds.has(f.id))
})

// 方法
const getCategoryCount = (categoryName: string) => {
  return formulas.filter(f => f.category === categoryName).length
}

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

// 简化的图形初始化
const initGraph = () => {
  if (!graphContainer.value) return

  const container = graphContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清除之前的内容
  container.innerHTML = ''

  // 创建 SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())
  svg.style.background = '#f8fafc'
  container.appendChild(svg)

  // 绘制连线
  filteredLinks.value.forEach(link => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', link.source.x.toString())
    line.setAttribute('y1', link.source.y.toString())
    line.setAttribute('x2', link.target.x.toString())
    line.setAttribute('y2', link.target.y.toString())
    line.setAttribute('stroke', '#cbd5e0')
    line.setAttribute('stroke-width', (1 + link.strength).toString())
    line.setAttribute('opacity', '0.6')
    svg.appendChild(line)
  })

  // 绘制节点
  filteredNodes.value.forEach(node => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', node.x.toString())
    circle.setAttribute('cy', node.y.toString())
    circle.setAttribute('r', nodeSize.value.toString())
    circle.setAttribute('fill', node.color)
    circle.setAttribute('stroke', '#fff')
    circle.setAttribute('stroke-width', '2')
    circle.style.cursor = 'pointer'
    
    circle.addEventListener('click', () => {
      selectedNode.value = node
    })
    
    svg.appendChild(circle)

    // 添加标签
    if (showLabels.value) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', node.x.toString())
      text.setAttribute('y', node.y.toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dy', '0.35em')
      text.setAttribute('fill', 'white')
      text.setAttribute('font-weight', 'bold')
      text.setAttribute('font-size', '12px')
      text.style.pointerEvents = 'none'
      text.textContent = node.id.toString()
      svg.appendChild(text)
    }
  })
}

// 控制面板功能
const filterByCategory = (categoryName: string) => {
  selectedCategory.value = categoryName
  updateGraph()
}

const highlightNode = (formula: SimpleFormula) => {
  selectedNode.value = formula
}

// 工具栏功能
const zoomIn = () => {
  console.log('Zoom in')
}

const zoomOut = () => {
  console.log('Zoom out')
}

const fitToScreen = () => {
  console.log('Fit to screen')
}

const togglePhysics = () => {
  physicsEnabled.value = !physicsEnabled.value
}

const toggleLabels = () => {
  showLabels.value = !showLabels.value
  updateGraph()
}

// 布局控制
const updateNodeSize = () => {
  updateGraph()
}

const updateLinkStrength = () => {
  updateGraph()
}

const updateGraph = () => {
  if (graphContainer.value) {
    initGraph()
  }
}

// 操作按钮功能
const resetGraph = () => {
  selectedCategory.value = ''
  selectedNode.value = null
  searchQuery.value = ''
  updateGraph()
}

const exportGraph = () => {
  console.log('Export graph')
  alert('导出功能开发中...')
}

// 公式详情功能
const selectRelatedFormula = (formula: SimpleFormula) => {
  selectedNode.value = formula
}

const focusOnNode = (formula: SimpleFormula) => {
  selectedNode.value = formula
}

// 监听器
watch([selectedCategory, searchQuery], () => {
  updateGraph()
})
</script>

<style scoped>
.relationships-view {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* 头部样式 */
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}

.view-title {
  font-size: 3rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-subtitle {
  font-size: 1.25rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

/* 主容器样式 */
.graph-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.graph-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

/* 工具栏样式 */
.graph-toolbar {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.toolbar-btn:hover,
.toolbar-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 图形画布样式 */
.graph-canvas {
  width: 100%;
  height: 600px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #718096;
  font-weight: 500;
}

/* 图例样式 */
.graph-legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-size: 0.875rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #718096;
}

.legend-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* 控制面板样式 */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

/* 分类筛选样式 */
.category-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.category-btn:hover,
.category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.category-count {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f7fafc;
  color: #718096;
  border-radius: 12px;
}

.category-btn.active .category-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 搜索样式 */
.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f7fafc;
}

.search-result-item:hover {
  background: #f7fafc;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  margin-right: 0.75rem;
}

.result-content {
  flex: 1;
}

.result-name {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
}

.result-category {
  font-size: 0.75rem;
  color: #718096;
}

/* 布局控制样式 */
.layout-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

.control-slider {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.control-value {
  font-size: 0.75rem;
  color: #718096;
  font-family: monospace;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a67d8;
}

.action-btn.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #edf2f7;
}

/* 选中公式信息样式 */
.selected-info {
  max-width: 1400px;
  margin: 2rem auto 0;
  padding: 0 2rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.formula-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.formula-meta {
  flex: 1;
  margin-left: 1rem;
}

.formula-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.formula-category {
  font-size: 0.875rem;
  color: #718096;
}

.close-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f7fafc;
  color: #4a5568;
}

.formula-latex {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-family: 'Times New Roman', serif;
  font-size: 1.5rem;
  color: #667eea;
}

.formula-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* 相关公式样式 */
.related-formulas {
  margin-bottom: 1.5rem;
}

.related-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.related-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.related-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  margin-right: 0.75rem;
}

.related-name {
  font-size: 0.875rem;
  color: #4a5568;
  flex: 1;
}

.info-actions {
  display: flex;
  gap: 1rem;
}

.focus-btn {
  padding: 0.75rem 1.5rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.focus-btn:hover {
  background: #7c3aed;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #718096;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .graph-container {
    grid-template-columns: 1fr;
  }
  
  .control-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .relationships-view {
    padding: 1rem;
  }
  
  .view-title {
    font-size: 2rem;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .graph-canvas {
    height: 400px;
  }
  
  .graph-toolbar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .toolbar-group {
    justify-content: center;
  }
  
  .graph-legend {
    display: none;
  }
  
  .info-actions {
    flex-direction: column;
  }
}
</style>