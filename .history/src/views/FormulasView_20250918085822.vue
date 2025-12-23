<template>
  <div class="formulas-view-content">
    <!-- 头部区域 -->
    <div class="view-header animate-fade-in">
      <h1 class="view-title">张祥前统一场论核心公式</h1>
      <p class="view-subtitle">探索宇宙的统一理论，理解时空、引力、电磁场的本质联系</p>
      
      <!-- 统计信息 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-number">{{ filteredFormulas.length }}</div>
          <div class="stat-label">当前显示</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ formulas.length }}</div>
          <div class="stat-label">总公式数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">理论分类</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="controls-section animate-fade-in-delayed">
      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索公式名称或描述..."
            class="search-input"
          >
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="category-filters">
        <button
          @click="selectedCategory = ''"
          class="category-btn hover-btn"
          :class="{ active: selectedCategory === '' }"
        >
          <span class="category-icon">🌟</span>
          全部 ({{ formulas.length }})
        </button>
        <button
          v-for="category in categories"
          :key="category.name"
          @click="selectedCategory = selectedCategory === category.name ? '' : category.name"
          class="category-btn hover-btn"
          :class="{ active: selectedCategory === category.name }"
          :style="{ 
            borderColor: category.color,
            backgroundColor: selectedCategory === category.name ? category.color : 'transparent',
            color: selectedCategory === category.name ? 'white' : category.color
          }"
        >
          <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
          {{ category.name }} ({{ category.count }})
        </button>
      </div>

      <!-- 排序选项 -->
      <div class="sort-options">
        <label class="sort-label">排序方式：</label>
        <select v-model="sortBy" class="sort-select">
          <option value="id">按编号</option>
          <option value="name">按名称</option>
          <option value="category">按分类</option>
        </select>
      </div>
    </div>

    <!-- 公式网格 -->
    <div class="formulas-container animate-fade-in-delayed-more">
      <div v-if="filteredFormulas.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h3 class="empty-title">没有找到匹配的公式</h3>
        <p class="empty-description">请尝试调整搜索条件或筛选选项</p>
      </div>

      <div v-else class="formulas-grid">
        <FormulaCard
          v-for="(formula, index) in sortedFormulas"
          :key="formula.id"
          :formula="formula"
          :index="index"
          @select="selectFormula"
        />
      </div>
    </div>

    <!-- 分页控制 -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          上一页
        </button>
        <span class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 公式详情弹窗 -->
    <Teleport to="body">
      <FormulaDetail
        v-if="selectedFormula"
        :formula="selectedFormula"
        @close="selectedFormula = null"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormulaCard from '../components/FormulaCard.vue'
import FormulaDetail from '../components/FormulaDetail.vue'
import { formulas, categories, type Formula } from '../data/formulas'

const route = useRoute()
const router = useRouter()

// 响应式状态
const selectedCategory = ref('')
const selectedFormula = ref<Formula | null>(null)
const searchQuery = ref('')
const sortBy = ref('id')
const currentPage = ref(1)
const itemsPerPage = 12

// 从URL参数初始化状态
if (route.query.category) {
  selectedCategory.value = decodeURIComponent(route.query.category as string)
}

// 获取分类图标
const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, string> = {
    '时空理论': '🌌',
    '力学基础': '⚡',
    '统一理论': '🔮',
    '电磁理论': '🧲',
    '应用理论': '🚀'
  }
  return icons[categoryName] || '📐'
}

// 计算属性
const filteredFormulas = computed(() => {
  let result = formulas

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter(formula => formula.category === selectedCategory.value)
  }

  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(formula => 
      formula.name.toLowerCase().includes(query) ||
      formula.description.toLowerCase().includes(query) ||
      formula.category.toLowerCase().includes(query)
    )
  }

  return result
})

const sortedFormulas = computed(() => {
  const sorted = [...filteredFormulas.value]
  
  switch (sortBy.value) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category))
    case 'id':
    default:
      return sorted.sort((a, b) => a.id - b.id)
  }
})

const paginatedFormulas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedFormulas.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sortedFormulas.value.length / itemsPerPage)
})

// 方法
const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}

// 监听筛选条件变化，重置分页
watch([selectedCategory, searchQuery, sortBy], () => {
  currentPage.value = 1
})

// 监听分类变化，更新URL
watch(selectedCategory, (newCategory) => {
  const query = { ...route.query }
  if (newCategory) {
    query.category = encodeURIComponent(newCategory)
  } else {
    delete query.category
  }
  router.replace({ query })
})
</script>

<style scoped>
.formulas-view-content {
  @apply py-8;
}

.view-header {
  @apply text-center mb-12 px-4;
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

.category-filters {
  @apply flex flex-wrap justify-center gap-3 mb-8 px-4;
}

.category-btn {
  @apply px-4 py-2 rounded-full border-2 font-medium transition-all duration-300;
}

.hover-btn:hover {
  @apply shadow-lg transform scale-105;
}

.category-btn.active {
  @apply shadow-lg;
}

.formulas-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4;
}

/* 动画类 */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-delayed {
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.animate-fade-in-delayed-more {
  animation: fadeIn 0.6s ease-out 0.5s both;
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
</style>