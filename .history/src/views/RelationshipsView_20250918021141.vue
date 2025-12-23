<template>
  <div class="relationships-view">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="view-header"
    >
      <h1 class="view-title">公式关系图</h1>
      <p class="view-subtitle">探索统一场论公式之间的内在联系</p>
    </motion.div>

    <div class="relationships-container">
      <!-- 关系图可视化区域 -->
      <motion.div
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.3, duration: 0.6 }"
        class="graph-container"
        ref="graphContainer"
      >
        <div class="graph-canvas" ref="canvasRef"></div>
      </motion.div>

      <!-- 控制面板 -->
      <motion.div
        :initial="{ opacity: 0, x: 50 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.5, duration: 0.6 }"
        class="control-panel"
      >
        <h3 class="panel-title">控制面板</h3>
        
        <div class="control-group">
          <label class="control-label">显示类别</label>
          <div class="category-filters">
            <motion.button
              v-for="category in categories"
              :key="category.name"
              :whileHover="{ scale: 1.05 }"
              :whileTap="{ scale: 0.95 }"
              @click="toggleCategory(category.name)"
              class="category-btn"
              :class="{ active: activCategories.includes(category.name) }"
              :style="{ 
                borderColor: category.color,
                backgroundColor: activCategories.includes(category.name) ? category.color : 'transparent',
                color: activCategories.includes(category.name) ? 'white' : category.color
              }"
            >
              {{ category.name }}
            </motion.button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">布局模式</label>
          <select v-model="layoutMode" class="layout-select">
            <option value="force">力导向布局</option>
            <option value="circular">环形布局</option>
            <option value="hierarchical">层次布局</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">连接强度</label>
          <input
            v-model="linkStrength"
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            class="strength-slider"
          />
        </div>

        <motion.button
          :whileHover="{ scale: 1.05 }"
          :whileTap="{ scale: 0.95 }"
          @click="resetGraph"
          class="reset-btn"
        >
          重置视图
        </motion.button>
      </motion.div>
    </div>

    <!-- 选中公式信息 -->
    <motion.div
      v-if="selectedNode"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 30 }"
      class="selected-info"
    >
      <div class="info-header">
        <div class="formula-number" :style="{ backgroundColor: selectedNode.color }">
          {{ selectedNode.id }}
        </div>
        <div>
          <h3 class="formula-name">{{ selectedNode.name }}</h3>
          <p class="formula-category">{{ selectedNode.category }}</p>
        </div>
      </div>
      <div class="formula-latex" ref="selectedLatexRef">
        $${{ selectedNode.latex }}$$
      </div>
      <p class="formula-description">{{ selectedNode.description }}</p>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

import * as d3 from 'd3'
import { formulas, categories, type Formula } from '../data/formulas'

const graphContainer = ref<HTMLElement>()
const canvasRef = ref<HTMLElement>()
const selectedLatexRef = ref<HTMLElement>()
const selectedNode = ref<Formula | null>(null)
const activCategories = ref(categories.map(c => c.name))
const layoutMode = ref('force')
const linkStrength = ref(1)

let simulation: d3.Simulation<any, any> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null

// 定义公式之间的关系
const relationships = [
  { source: 1, target: 2, strength: 0.8 },
  { source: 1, target: 7, strength: 0.6 },
  { source: 2, target: 8, strength: 0.7 },
  { source: 3, target: 4, strength: 0.9 },
  { source: 3, target: 5, strength: 0.7 },
  { source: 3, target: 6, strength: 0.7 },
  { source: 4, target: 12, strength: 0.8 },
  { source: 4, target: 14, strength: 0.6 },
  { source: 5, target: 6, strength: 0.8 },
  { source: 6, target: 7, strength: 0.9 },
  { source: 7, target: 16, strength: 0.7 },
  { source: 8, target: 12, strength: 0.6 },
  { source: 9, target: 10, strength: 0.9 },
  { source: 9, target: 11, strength: 0.8 },
  { source: 10, target: 11, strength: 0.7 },
  { source: 10, target: 14, strength: 0.8 },
  { source: 11, target: 15, strength: 0.8 },
  { source: 12, target: 13, strength: 0.9 },
  { source: 12, target: 14, strength: 0.7 },
  { source: 13, target: 11, strength: 0.6 },
  { source: 14, target: 15, strength: 0.7 },
  { source: 16, target: 17, strength: 0.8 }
]

const initGraph = () => {
  if (!canvasRef.value) return

  const container = canvasRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清除之前的SVG
  d3.select(container).selectAll('*').remove()

  svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')

  // 添加缩放功能
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  updateGraph()
}

const updateGraph = () => {
  if (!svg) return

  const filteredFormulas = formulas.filter(f => activCategories.value.includes(f.category))
  const filteredLinks = relationships.filter(link => 
    filteredFormulas.some(f => f.id === link.source) && 
    filteredFormulas.some(f => f.id === link.target)
  )

  const g = svg.select('g')
  
  // 清除现有元素
  g.selectAll('*').remove()

  // 创建力导向模拟
  simulation = d3.forceSimulation(filteredFormulas)
    .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).strength(linkStrength.value))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(canvasRef.value!.clientWidth / 2, canvasRef.value!.clientHeight / 2))

  // 绘制连线
  const links = g.append('g')
    .selectAll('line')
    .data(filteredLinks)
    .enter().append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: any) => Math.sqrt(d.strength * 5))

  // 绘制节点
  const nodes = g.append('g')
    .selectAll('circle')
    .data(filteredFormulas)
    .enter().append('circle')
    .attr('r', 20)
    .attr('fill', (d: Formula) => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag<SVGCircleElement, Formula>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      selectedNode.value = d
      nextTick(() => {
        if (selectedLatexRef.value && window.MathJax) {
          window.MathJax.typesetPromise([selectedLatexRef.value])
        }
      })
    })

  // 添加节点标签
  const labels = g.append('g')
    .selectAll('text')
    .data(filteredFormulas)
    .enter().append('text')
    .text((d: Formula) => d.id.toString())
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .style('pointer-events', 'none')

  // 更新位置
  simulation.on('tick', () => {
    links
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    nodes
      .attr('cx', (d: Formula) => d.x!)
      .attr('cy', (d: Formula) => d.y!)

    labels
      .attr('x', (d: Formula) => d.x!)
      .attr('y', (d: Formula) => d.y!)
  })
}

const dragstarted = (event: any, d: Formula) => {
  if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

const dragged = (event: any, d: Formula) => {
  d.fx = event.x
  d.fy = event.y
}

const dragended = (event: any, d: Formula) => {
  if (!event.active && simulation) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}

const toggleCategory = (categoryName: string) => {
  const index = activCategories.value.indexOf(categoryName)
  if (index > -1) {
    activCategories.value.splice(index, 1)
  } else {
    activCategories.value.push(categoryName)
  }
  updateGraph()
}

const resetGraph = () => {
  activCategories.value = categories.map(c => c.name)
  layoutMode.value = 'force'
  linkStrength.value = 1
  selectedNode.value = null
  updateGraph()
}

watch([layoutMode, linkStrength], () => {
  updateGraph()
})

onMounted(() => {
  initGraph()
  window.addEventListener('resize', initGraph)
})
</script>

<style scoped>
.relationships-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8;
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

.relationships-container {
  @apply max-w-7xl mx-auto px-4 flex gap-6;
}

.graph-container {
  @apply flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden;
}

.graph-canvas {
  @apply w-full h-96 lg:h-[600px];
}

.control-panel {
  @apply w-80 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl;
}

.panel-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-6;
}

.control-group {
  @apply mb-6;
}

.control-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3;
}

.category-filters {
  @apply flex flex-wrap gap-2;
}

.category-btn {
  @apply px-3 py-1 rounded-full border text-sm font-medium transition-all duration-300;
}

.layout-select {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
}

.strength-slider {
  @apply w-full;
}

.reset-btn {
  @apply w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
         font-medium transition-colors;
}

.selected-info {
  @apply max-w-4xl mx-auto mt-8 px-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl;
}

.info-header {
  @apply flex items-center gap-4 mb-4;
}

.formula-number {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold;
}

.formula-name {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.formula-category {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.formula-latex {
  @apply text-center py-4 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4;
}

.formula-description {
  @apply text-gray-700 dark:text-gray-300 leading-relaxed;
}
</style>