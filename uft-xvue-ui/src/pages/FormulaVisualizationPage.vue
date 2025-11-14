<template>
  <div class="formula-visualization-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="container">
        <h1>公式可视化</h1>
        <p>探索统一场论中的关键数学公式</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 公式分类 -->
        <div class="category-filters">
          <button 
            v-for="category in categories" 
            :key="category"
            :class="['category-btn', { active: selectedCategory === category }]"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <!-- 公式列表 -->
        <div class="formula-grid">
          <motion.div 
            v-for="formula in filteredFormulas" 
            :key="formula.id"
            class="formula-card"
            :class="{ selected: selectedFormula?.id === formula.id }"
            @click="selectFormula(formula.id)"
            :while-hover="{ scale: 1.02 }"
            :while-tap="{ scale: 0.98 }"
          >
            <h3 class="formula-title">{{ formula.name }}</h3>
            <div class="formula-math">
              <mathjax :formula="formula.formula" />
            </div>
            <p class="formula-description">{{ formula.description }}</p>
          </motion.div>
        </div>

        <!-- 公式详情 -->
        <motion.div 
          v-if="selectedFormula" 
          class="formula-detail"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
        >
          <div class="detail-header">
            <h2>{{ selectedFormula.name }}</h2>
            <button class="close-btn" @click="clearSelection">✕</button>
          </div>
          
          <div class="detail-content">
            <div class="formula-large">
              <mathjax :formula="selectedFormula.formula" />
            </div>
            
            <div class="formula-info">
              <h3>描述</h3>
              <p>{{ selectedFormula.description }}</p>
            </div>
            
            <div class="formula-variables">
              <h3>变量说明</h3>
              <table class="variables-table">
                <thead>
                  <tr>
                    <th>变量</th>
                    <th>描述</th>
                    <th>单位</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(variable, index) in selectedFormula.variables" :key="index">
                    <td><mathjax :formula="variable.name" /></td>
                    <td>{{ variable.description }}</td>
                    <td>{{ variable.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="formula-actions">
              <button class="btn primary" @click="visualizeFormula">
                可视化公式
              </button>
              <button class="btn secondary" @click="exportFormula">
                导出公式
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFormulaStore } from '@/stores/formula'
import { motion } from 'framer-motion'
import MathJax from '@/components/MathJax.vue'

// 使用Store
const formulaStore = useFormulaStore()

// 响应式数据
const selectedCategory = ref<string>('全部')

// 计算属性
const categories = computed(() => {
  const cats = ['全部', ...new Set(formulaStore.formulas.map(f => f.category))]
  return cats
})

const filteredFormulas = computed(() => {
  if (selectedCategory.value === '全部') {
    return formulaStore.formulas
  }
  return formulaStore.formulas.filter(f => f.category === selectedCategory.value)
})

const selectedFormula = computed(() => formulaStore.selectedFormula)

// 方法
function selectFormula(id: string) {
  formulaStore.selectFormula(id)
}

function clearSelection() {
  formulaStore.clearSelection()
}

function visualizeFormula() {
  // 这里可以实现公式可视化的逻辑
  console.log('Visualizing formula:', selectedFormula.value?.name)
  // 可以导航到交互式探索页面并传递公式ID
  // router.push({ path: '/interactive-exploration', query: { formulaId: selectedFormula.value?.id } })
}

function exportFormula() {
  // 实现导出公式的逻辑
  console.log('Exporting formula:', selectedFormula.value?.name)
}

// 生命周期
onMounted(async () => {
  await formulaStore.fetchFormulas()
})
</script>

<style scoped>
.formula-visualization-page {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #fff;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4DBA87;
}

.page-header p {
  font-size: 1.2rem;
  color: #ccc;
}

/* 主要内容 */
.main-content {
  padding: 4rem 0;
}

/* 分类过滤器 */
.category-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  justify-content: center;
}

.category-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  background-color: #1a1a1a;
  color: #ccc;
  border: 1px solid #2d2d2d;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  border-color: #4DBA87;
  color: #4DBA87;
}

.category-btn.active {
  background-color: #4DBA87;
  color: #000;
  border-color: #4DBA87;
}

/* 公式网格 */
.formula-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.formula-card {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.formula-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transform: translateY(-5px);
  border-color: #4DBA87;
}

.formula-card.selected {
  border-color: #4DBA87;
  box-shadow: 0 0 20px rgba(77, 186, 135, 0.3);
}

.formula-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #4DBA87;
}

.formula-math {
  margin: 1.5rem 0;
  text-align: center;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.formula-description {
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 公式详情 */
.formula-detail {
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #2d2d2d;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2d2d2d;
}

.detail-header h2 {
  font-size: 2rem;
  color: #4DBA87;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #fff;
}

.detail-content {
  max-width: 800px;
  margin: 0 auto;
}

.formula-large {
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background-color: rgba(77, 186, 135, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(77, 186, 135, 0.2);
}

.formula-info h3,
.formula-variables h3 {
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.formula-info p {
  color: #ccc;
  line-height: 1.6;
}

/* 变量表格 */
.variables-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.variables-table th,
.variables-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #2d2d2d;
}

.variables-table th {
  color: #4DBA87;
  font-weight: 600;
}

.variables-table td {
  color: #ccc;
}

.variables-table tr:hover {
  background-color: rgba(77, 186, 135, 0.05);
}

/* 操作按钮 */
.formula-actions {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn.primary {
  background-color: #4DBA87;
  color: #000;
}

.btn.primary:hover {
  background-color: #43b77d;
  transform: translateY(-2px);
}

.btn.secondary {
  background-color: transparent;
  color: #4DBA87;
  border: 1px solid #4DBA87;
}

.btn.secondary:hover {
  background-color: #4DBA87;
  color: #000;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .formula-grid {
    grid-template-columns: 1fr;
  }
  
  .formula-detail {
    padding: 1rem;
  }
  
  .detail-header h2 {
    font-size: 1.5rem;
  }
  
  .formula-actions {
    flex-direction: column;
  }
  
  .variables-table {
    font-size: 0.9rem;
  }
  
  .variables-table th,
  .variables-table td {
    padding: 0.6rem 0.4rem;
  }
}
</style>