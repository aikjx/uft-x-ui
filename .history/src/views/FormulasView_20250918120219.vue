<template>
  <div class="formulas-view">
    <!-- 头部统计 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📐</div>
        <div class="stat-info">
          <div class="stat-number">{{ formulas.length }}</div>
          <div class="stat-label">公式总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-number">{{ filteredFormulas.length }}</div>
          <div class="stat-label">当前显示</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索公式名称或描述..."
          class="search-input"
        />
        <button class="search-btn">🔍</button>
      </div>
      
      <div class="filter-section">
        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: selectedCategory === category.name }]"
            @click="selectedCategory = selectedCategory === category.name ? '' : category.name"
          >
            {{ category.name }}
          </button>
        </div>
        
        <div class="view-toggle">
          <button
            :class="['toggle-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            ⊞ 网格
          </button>
          <button
            :class="['toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            ☰ 列表
          </button>
        </div>
      </div>
    </div>

    <!-- 公式列表 -->
    <div :class="['formulas-grid', viewMode]">
      <div
        v-for="formula in filteredFormulas"
        :key="formula.id"
        class="formula-card"
        @click="selectFormula(formula)"
      >
        <div class="formula-header">
          <h3 class="formula-name">{{ formula.name }}</h3>
          <span :class="['category-tag', formula.category.toLowerCase()]">
            {{ formula.category }}
          </span>
        </div>
        <div class="formula-content">
          <div class="formula-latex">{{ formula.latex }}</div>
          <p class="formula-description">{{ formula.description }}</p>
        </div>
      </div>
    </div>

    <!-- 公式详情弹窗 -->
    <div v-if="selectedFormula" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedFormula.name }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="formula-display">
            <div class="latex-formula">{{ selectedFormula.latex }}</div>
          </div>
          <div class="formula-info">
            <p><strong>描述：</strong>{{ selectedFormula.description }}</p>
            <p><strong>分类：</strong>{{ selectedFormula.category }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formulas, categories } from '../data/formulas'
import type { SimpleFormula } from '../types/simple-formula'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFormula = ref<SimpleFormula | null>(null)

// 计算属性
const filteredFormulas = computed(() => {
  let filtered = formulas

  // 按搜索查询过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(formula =>
      formula.name.toLowerCase().includes(query) ||
      formula.description.toLowerCase().includes(query)
    )
  }

  // 按分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(formula => formula.category === selectedCategory.value)
  }

  return filtered
})

// 方法
const selectFormula = (formula: SimpleFormula) => {
  selectedFormula.value = formula
}

const closeModal = () => {
  selectedFormula.value = null
}
</script>

<style scoped>
.formulas-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* 搜索区域 */
.search-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover,
.category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:first-child {
  border-radius: 8px 0 0 8px;
}

.toggle-btn:last-child {
  border-radius: 0 8px 8px 0;
}

.toggle-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 公式网格 */
.formulas-grid {
  display: grid;
  gap: 1rem;
}

.formulas-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.formulas-grid.list {
  grid-template-columns: 1fr;
}

.formula-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.formula-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.formula-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.category-tag.基础理论 { background: #e6fffa; color: #234e52; }
.category-tag.电磁学 { background: #fef5e7; color: #744210; }
.category-tag.量子力学 { background: #f0fff4; color: #22543d; }
.category-tag.相对论 { background: #e6f3ff; color: #2a4365; }

.formula-content {
  text-align: center;
}

.formula-latex {
  font-family: 'Times New Roman', serif;
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.formula-description {
  color: #718096;
  line-height: 1.5;
  margin: 0;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.modal-body {
  padding: 1.5rem;
}

.formula-display {
  text-align: center;
  margin-bottom: 2rem;
}

.latex-formula {
  font-family: 'Times New Roman', serif;
  font-size: 2rem;
  color: #667eea;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.formula-info p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .formulas-view {
    padding: 1rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .formulas-grid.grid {
    grid-template-columns: 1fr;
  }
}
</style>