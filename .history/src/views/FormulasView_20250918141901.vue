<template>
  <div class="formulas-view">
    <!-- 人工场方程库头部 -->
    <div class="header-section">
      <div class="header-background"></div>
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🔬</span>
          人工场方程库
        </h1>
        <p class="page-subtitle">
          探索时空操控的数学密码 · 解锁光速虚拟世界的核心算法
        </p>
        
        <!-- 实时统计 -->
        <div class="stats-display">
          <div class="stat-item">
            <div class="stat-value">{{ formulas.length }}</div>
            <div class="stat-label">已发现方程</div>
            <div class="stat-indicator active"></div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ categories.length }}</div>
            <div class="stat-label">维度领域</div>
            <div class="stat-indicator active"></div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ filteredFormulas.length }}</div>
            <div class="stat-label">当前显示</div>
            <div class="stat-indicator" :class="{ active: filteredFormulas.length > 0 }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-container">
        <!-- 搜索模块 -->
        <div class="search-module">
          <div class="search-header">
            <span class="module-icon">🔍</span>
            <span class="module-title">量子搜索</span>
          </div>
          <div class="search-input-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入方程名称或描述进行量子搜索..."
              class="search-input"
            />
            <div class="search-effects">
              <div class="search-glow"></div>
            </div>
          </div>
        </div>

        <!-- 维度筛选 -->
        <div class="filter-module">
          <div class="filter-header">
            <span class="module-icon">🌌</span>
            <span class="module-title">维度筛选</span>
          </div>
          <div class="dimension-filters">
            <button
              :class="['dimension-btn', { active: selectedCategory === '' }]"
              @click="selectedCategory = ''"
            >
              <span class="btn-glow"></span>
              <span class="btn-content">
                <span class="btn-icon">∞</span>
                <span class="btn-text">全维度</span>
                <span class="btn-count">{{ formulas.length }}</span>
              </span>
            </button>
            <button
              v-for="category in categories"
              :key="category.name"
              :class="['dimension-btn', { active: selectedCategory === category.name }]"
              @click="selectedCategory = selectedCategory === category.name ? '' : category.name"
            >
              <span class="btn-glow"></span>
              <span class="btn-content">
                <span class="btn-icon">{{ getCategoryIcon(category.name) }}</span>
                <span class="btn-text">{{ category.name }}</span>
                <span class="btn-count">{{ getCategoryCount(category.name) }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- 视图模式 -->
        <div class="view-module">
          <div class="view-header">
            <span class="module-icon">👁️</span>
            <span class="module-title">视图模式</span>
          </div>
          <div class="view-toggle">
            <button
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
            >
              <span class="btn-icon">⊞</span>
              <span class="btn-text">矩阵视图</span>
            </button>
            <button
              :class="['view-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              <span class="btn-icon">☰</span>
              <span class="btn-text">列表视图</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 方程展示区域 -->
    <div class="equations-section">
      <div :class="['equations-container', viewMode]">
        <div
          v-for="formula in filteredFormulas"
          :key="formula.id"
          class="equation-card"
          :class="`category-${formula.category.toLowerCase().replace(/\s+/g, '-')}`"
          @click="selectFormula(formula)"
        >
          <div class="card-background"></div>
          <div class="card-header">
            <div class="equation-id">
              <span class="id-number">{{ String(formula.id).padStart(3, '0') }}</span>
              <div class="id-glow"></div>
            </div>
            <div class="equation-status">
              <div class="status-indicator active"></div>
              <span class="status-text">已解锁</span>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="equation-name">{{ formula.name }}</h3>
            <div class="equation-category">
              <span class="category-icon">{{ getCategoryIcon(formula.category) }}</span>
              <span class="category-text">{{ formula.category }}</span>
            </div>
            
            <div class="equation-formula">
              <div class="formula-container">
                <div class="formula-display">{{ formula.latex }}</div>
                <div class="formula-effects">
                  <div class="effect-particle p1"></div>
                  <div class="effect-particle p2"></div>
                  <div class="effect-particle p3"></div>
                </div>
              </div>
            </div>
            
            <p class="equation-description">{{ formula.description }}</p>
          </div>
          
          <div class="card-actions">
            <button class="action-btn primary">
              <span class="btn-icon">🔬</span>
              <span class="btn-text">深度分析</span>
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">🌌</span>
              <span class="btn-text">时空模拟</span>
            </button>
          </div>
          
          <div class="card-glow"></div>
        </div>
      </div>
    </div>

    <!-- 方程详情弹窗 -->
    <div v-if="selectedFormula" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="modal-header">
            <div class="formula-info">
              <div class="formula-id">
                <span class="id-display">{{ String(selectedFormula.id).padStart(3, '0') }}</span>
                <div class="id-effects"></div>
              </div>
              <div class="formula-meta">
                <h2 class="formula-title">{{ selectedFormula.name }}</h2>
                <div class="formula-tags">
                  <span class="tag category">{{ selectedFormula.category }}</span>
                  <span class="tag status">已解锁</span>
                </div>
              </div>
            </div>
            <button class="close-btn" @click="closeModal">
              <span class="close-icon">×</span>
              <div class="close-glow"></div>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="formula-display-section">
              <div class="display-container">
                <div class="hologram-formula">{{ selectedFormula.latex }}</div>
                <div class="hologram-effects">
                  <div class="energy-field"></div>
                  <div class="quantum-dots">
                    <div class="dot d1"></div>
                    <div class="dot d2"></div>
                    <div class="dot d3"></div>
                    <div class="dot d4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="formula-details">
              <div class="detail-section">
                <h3 class="section-title">
                  <span class="title-icon">📋</span>
                  方程描述
                </h3>
                <p class="section-content">{{ selectedFormula.description }}</p>
              </div>
              
              <div class="detail-section">
                <h3 class="section-title">
                  <span class="title-icon">🌌</span>
                  维度属性
                </h3>
                <div class="attributes-grid">
                  <div class="attribute-item">
                    <span class="attr-label">理论领域</span>
                    <span class="attr-value">{{ selectedFormula.category }}</span>
                  </div>
                  <div class="attribute-item">
                    <span class="attr-label">方程编号</span>
                    <span class="attr-value">{{ String(selectedFormula.id).padStart(3, '0') }}</span>
                  </div>
                  <div class="attribute-item">
                    <span class="attr-label">解锁状态</span>
                    <span class="attr-value status-unlocked">已解锁</span>
                  </div>
                  <div class="attribute-item">
                    <span class="attr-label">应用范围</span>
                    <span class="attr-value">星际探索</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="modal-btn primary">
              <span class="btn-icon">🚀</span>
              <span class="btn-text">开始探索</span>
            </button>
            <button class="modal-btn secondary">
              <span class="btn-icon">📊</span>
              <span class="btn-text">数据分析</span>
            </button>
            <button class="modal-btn tertiary" @click="closeModal">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">返回</span>
            </button>
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
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    '基础理论': '⚛️',
    '电磁学': '⚡',
    '量子力学': '🌀',
    '相对论': '🌌'
  }
  return icons[category] || '🔬'
}

const getCategoryCount = (categoryName: string) => {
  return formulas.filter(f => f.category === categoryName).length
}

const selectFormula = (formula: SimpleFormula) => {
  selectedFormula.value = formula
}

const closeModal = () => {
  selectedFormula.value = null
}
</script>

<style scoped>
.formulas-view {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
}

/* 头部区域 */
.header-section {
  position: relative;
  padding: 4rem 2rem 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(100, 255, 218, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 0, 255, 0.05) 0%, transparent 50%);
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  33% { transform: translateX(-10px) translateY(-5px); }
  66% { transform: translateX(10px) translateY(5px); }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 4rem;
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.stats-display {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
  position: relative;
}

.stat-value {
  font-size: 3rem;
  font-weight: bold;
  color: #00f5ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #64ffda;
  margin-bottom: 0.5rem;
}

.stat-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  margin: 0 auto;
  transition: all 0.3s;
}

.stat-indicator.active {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* 控制面板 */
.control-panel {
  padding: 2rem;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.panel-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 2rem;
  align-items: center;
}

.search-module,
.filter-module,
.view-module {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
}

.search-header,
.filter-header,
.view-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #64ffda;
  font-weight: bold;
}

.module-icon {
  font-size: 1.25rem;
}

.search-input-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #00f5ff;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.search-input::placeholder {
  color: #64ffda;
  opacity: 0.7;
}

.dimension-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dimension-btn {
  position: relative;
  background: transparent;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 20px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.dimension-btn:hover,
.dimension-btn.active {
  border-color: #00f5ff;
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);
}

.dimension-btn.active .btn-glow {
  opacity: 1;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(0, 245, 255, 0.1), rgba(100, 255, 218, 0.1));
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  color: #ffffff;
  font-size: 0.875rem;
}

.btn-count {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  flex: 1;
  background: transparent;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.view-btn:hover,
.view-btn.active {
  border-color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
}

.view-btn .btn-text {
  font-size: 0.875rem;
}

/* 方程展示区域 */
.equations-section {
  padding: 2rem;
  min-height: 60vh;
}

.equations-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.equations-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.equations-container.list {
  grid-template-columns: 1fr;
}

.equation-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.equation-card:hover {
  transform: translateY(-5px);
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
}

.equation-card:hover .card-glow {
  opacity: 1;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  transition: opacity 0.3s;
}

.category-基础理论 .card-background {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(100, 255, 218, 0.1));
}

.category-电磁学 .card-background {
  background: linear-gradient(135deg, rgba(255, 255, 0, 0.1), rgba(255, 165, 0, 0.1));
}

.category-量子力学 .card-background {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(128, 0, 255, 0.1));
}

.category-相对论 .card-background {
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(0, 245, 255, 0.1));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.equation-id {
  position: relative;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-number {
  font-weight: bold;
  color: #0a0a0f;
  font-size: 1.25rem;
  position: relative;
  z-index: 1;
}

.id-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 14px;
  opacity: 0;
  animation: idGlow 3s ease-in-out infinite;
}

@keyframes idGlow {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.equation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff00;
  box-shadow: 0 0 8px #00ff00;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-size: 0.875rem;
  color: #64ffda;
}

.equation-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 1rem;
}

.equation-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-text {
  color: #64ffda;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 12px;
}

.equation-formula {
  margin-bottom: 1.5rem;
}

.formula-container {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.formula-display {
  font-family: 'Times New Roman', serif;
  font-size: 1.5rem;
  color: #00f5ff;
  position: relative;
  z-index: 1;
}

.formula-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.effect-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #64ffda;
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

.p1 { top: 20%; left: 20%; animation-delay: 0s; }
.p2 { top: 30%; right: 20%; animation-delay: 1s; }
.p3 { bottom: 20%; left: 30%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
}

.equation-description {
  color: #b0bec5;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.card-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, rgba(0, 245, 255, 0.2), rgba(100, 255, 218, 0.2));
  border-radius: 18px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  position: relative;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.modal-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.formula-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.formula-id {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0a0a0f;
}

.formula-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.formula-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.tag.category {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.tag.status {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.close-btn {
  position: relative;
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

.close-btn:hover {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.close-icon {
  font-size: 1.5rem;
  color: #ffffff;
}

.formula-display-section {
  margin-bottom: 2rem;
}

.display-container {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

.hologram-formula {
  font-family: 'Times New Roman', serif;
  font-size: 2rem;
  color: #00f5ff;
  position: relative;
  z-index: 1;
}

.hologram-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.energy-field {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0, 245, 255, 0.1), transparent);
  border-radius: 50%;
  animation: energyPulse 3s ease-in-out infinite;
}

@keyframes energyPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

.quantum-dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #64ffda;
  border-radius: 50%;
  animation: quantumFloat 4s ease-in-out infinite;
}

.d1 { top: 20%; left: 20%; animation-delay: 0s; }
.d2 { top: 20%; right: 20%; animation-delay: 1s; }
.d3 { bottom: 20%; left: 20%; animation-delay: 2s; }
.d4 { bottom: 20%; right: 20%; animation-delay: 3s; }

@keyframes quantumFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-15px) scale(1.3); opacity: 1; }
}

.formula-details {
  display: grid;
  gap: 2rem;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 1rem;
}

.title-icon {
  font-size: 1.25rem;
}

.section-content {
  color: #b0bec5;
  line-height: 1.6;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.attr-label {
  color: #64ffda;
  font-size: 0.875rem;
}

.attr-value {
  color: #ffffff;
  font-weight: bold;
}

.attr-value.status-unlocked {
  color: #00ff00;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
}

.modal-btn {
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

.modal-btn.primary {
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  color: #0a0a0f;
}

.modal-btn.primary:hover {
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.modal-btn.secondary {
  background: transparent;
  color: #64ffda;
  border: 2px solid rgba(100, 255, 218, 0.3);
}

.modal-btn.secondary:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
}

.modal-btn.tertiary {
  background: transparent;
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.modal-btn.tertiary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .panel-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .equations-container.grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .stats-display {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .equations-container.grid {
    grid-template-columns: 1fr;
  }
  
  .dimension-filters {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .attributes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .formulas-view {
    padding: 0;
  }
  
  .header-section {
    padding: 2rem 1rem;
  }
  
  .control-panel {
    padding: 1rem;
  }
  
  .equations-section {
    padding: 1rem;
  }
  
  .equation-card {
    padding: 1.5rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
}
</style>