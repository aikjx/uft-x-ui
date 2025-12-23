<template>
  <div class="relationships-view">
    <div class="view-header animate-fade-in">
      <h1 class="view-title">公式关系图谱</h1>
      <p class="view-subtitle">探索统一场论公式之间的内在联系</p>
    </div>

    <div class="graph-container">
      <!-- 关系图可视化区域 -->
      <div class="graph-section animate-scale-in">
        <div class="graph-canvas" ref="graphContainer"></div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel animate-slide-in">
        <div class="panel-section">
          <h3 class="panel-title">分类筛选</h3>
          <div class="category-filters">
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
              {{ category.name }}
            </button>
          </div>
        </div>

        <div class="panel-section">
          <button
            @click="resetGraph"
            class="reset-btn hover-scale"
          >
            重置视图
          </button>
        </div>
      </div>
    </div>

    <!-- 选中公式信息 -->
    <div
      v-if="selectedNode"
      class="selected-info animate-slide-up"
    >
      <div class="info-card">
        <div class="info-header">
          <div class="formula-number" :style="{ backgroundColor: selectedNode.color }">
            {{ selectedNode.id }}
          </div>
          <h3 class="formula-name">{{ selectedNode.name }}</h3>
        </div>
        <div class="formula-latex">
          ${{ selectedNode.latex }}$
        </div>
        <p class="formula-description">{{ selectedNode.description }}</p>
        <div class="info-actions">
          <button
            @click="viewFormulaDetail(selectedNode)"
            class="detail-btn hover-scale"
          >
            查看详情
          </button>
          <button
            @click="selectedNode = null"
            class="close-btn hover-scale"
          >
            关闭
          </button>
        </div>
      </div>
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