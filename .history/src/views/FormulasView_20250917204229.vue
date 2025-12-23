<template>
  <div class="formulas-view">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title gradient-text">公式列表</h1>
        <p class="page-description">
          探索张祥前统一场论的核心公式，每个公式都配有详细的可视化演示
        </p>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="filters-section">
        <div class="search-bar">
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索公式..."
            size="large"
            clearable
          >
            <template #prefix>
              <n-icon>🔍</n-icon>
            </template>
          </n-input>
        </div>
        
        <div class="filter-tabs">
          <n-tabs 
            v-model:value="selectedCategory" 
            type="segment"
            @update:value="handleCategoryChange"
          >
            <n-tab-pane name="all" tab="全部">
              <template #tab>
                <span>全部 ({{ totalFormulas }})</span>
              </template>
            </n-tab-pane>
            <n-tab-pane 
              v-for="category in categories" 
              :key="category.id"
              :name="category.id" 
              :tab="category.name"
            >
              <template #tab>
                <span>{{ category.icon }} {{ category.name }} ({{ getFormulaCount(category.id) }})</span>
              </template>
            </n-tab-pane>
          </n-tabs>
        </div>
        
        <div class="sort-options">
          <n-select
            v-model:value="sortBy"
            :options="sortOptions"
            placeholder="排序方式"
            size="large"
            style="width: 200px"
          />
        </div>
      </div>
      
      <!-- 公式网格 -->
      <div class="formulas-grid">
        <div 
          v-for="formula in filteredFormulas" 
          :key="formula.id"
          class="formula-card"
          @click="navigateToFormula(formula.id)"
        >
          <div class="formula-header">
            <div class="formula-category">
              {{ getCategoryById(formula.categoryId)?.icon }}
              {{ getCategoryById(formula.categoryId)?.name }}
            </div>
            <n-tag 
              :type="getDifficultyType(formula.difficulty)"
              size="small"
            >
              {{ getDifficultyLabel(formula.difficulty) }}
            </n-tag>
          </div>
          
          <h3 class="formula-title">{{ formula.name }}</h3>
          <p class="formula-description">{{ formula.description }}</p>
          
          <div class="formula-equation">
            <div class="math-formula">
              {{ formula.equation }}
            </div>
          </div>
          
          <div class="formula-keywords">
            <n-tag 
              v-for="keyword in formula.keywords.slice(0, 3)" 
              :key="keyword"
              size="small"
              type="info"
            >
              {{ keyword }}
            </n-tag>
            <span v-if="formula.keywords.length > 3" class="more-keywords">
              +{{ formula.keywords.length - 3 }}
            </span>
          </div>
          
          <div class="formula-actions">
            <n-button 
              type="primary" 
              size="small"
              @click.stop="navigateToFormula(formula.id)"
            >
              查看详情
            </n-button>
            <n-button 
              quaternary 
              size="small"
              @click.stop="previewFormula(formula)"
            >
              快速预览
            </n-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredFormulas.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到相关公式</h3>
        <p>尝试调整搜索条件或选择其他分类</p>
        <n-button @click="resetFilters">重置筛选</n-button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large">
          <template #description>
            正在加载公式数据...
          </template>
        </n-spin>
      </div>
    </div>
    
    <!-- 快速预览模态框 -->
    <n-modal 
      v-model:show="showPreview" 
      preset="card"
      style="width: 90%; max-width: 800px"
      title="公式预览"
    >
      <div v-if="previewFormula" class="formula-preview">
        <h2>{{ previewFormula.name }}</h2>
        <p>{{ previewFormula.description }}</p>
        
        <div class="preview-equation">
          <div class="math-formula">
            {{ previewFormula.equation }}
          </div>
        </div>
        
        <div class="preview-theory">
          <h4>理论背景</h4>
          <p>{{ previewFormula.theory.background }}</p>
        </div>
        
        <div class="preview-actions">
          <n-button 
            type="primary" 
            @click="navigateToFormula(previewFormula.id)"
          >
            查看完整可视化
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useFormulasStore } from '@/stores/formulas'
import type { Formula } from '@/types/formula'

const formulasStore = useFormulasStore()
const router = useRouter()
const route = useRoute()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('order')
const showPreview = ref(false)
const previewFormulaData = ref<Formula | null>(null)

// 计算属性
const formulas = computed(() => formulasStore.formulas)
const categories = computed(() => formulasStore.categories)
const loading = computed(() => formulasStore.loading)
const totalFormulas = computed(() => formulas.value.length)

// 排序选项
const sortOptions = [
  { label: '默认排序', value: 'order' },
  { label: '按名称', value: 'name' },
  { label: '按难度', value: 'difficulty' },
  { label: '按分类', value: 'category' }
]

// 筛选后的公式
const filteredFormulas = computed(() => {
  let result = formulas.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(formula => formula.categoryId === selectedCategory.value)
  }

  // 搜索筛选
  if (searchQuery.value.trim()) {
    result = formulasStore.searchFormulas(searchQuery.value.trim())
    if (selectedCategory.value !== 'all') {
      result = result.filter(formula => formula.categoryId === selectedCategory.value)
    }
  }

  // 排序
  switch (sortBy.value) {
    case 'name':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'difficulty':
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
      result = [...result].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
      break
    case 'category':
      result = [...result].sort((a, b) => a.categoryId.localeCompare(b.categoryId))
      break
    default:
      // 保持默认顺序
      break
  }

  return result
})

// 方法
const getFormulaCount = (categoryId: string) => {
  return formulasStore.getFormulasByCategory(categoryId).length
}

const getCategoryById = (categoryId: string) => {
  return categories.value.find(cat => cat.id === categoryId)
}

const getDifficultyType = (difficulty: string) => {
  const types = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'error'
  }
  return types[difficulty] || 'default'
}

const getDifficultyLabel = (difficulty: string) => {
  const labels = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return labels[difficulty] || difficulty
}

const handleCategoryChange = (category: string) => {
  selectedCategory.value = category
  // 更新URL参数
  router.push({ query: { ...route.query, category: category === 'all' ? undefined : category } })
}

const navigateToFormula = (formulaId: string) => {
  router.push(`/formula/${formulaId}`)
}

const previewFormula = (formula: Formula) => {
  previewFormulaData.value = formula
  showPreview.value = true
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'order'
  router.push({ query: {} })
}

// 初始化
onMounted(() => {
  formulasStore.initFormulas()
  
  // 从URL参数设置初始分类
  const categoryParam = route.query.category as string
  if (categoryParam && categories.value.some(cat => cat.id === categoryParam)) {
    selectedCategory.value = categoryParam
  }
})

// 监听路由变化
watch(() => route.query.category, (newCategory) => {
  if (newCategory && typeof newCategory === 'string') {
    selectedCategory.value = newCategory
  } else {
    selectedCategory.value = 'all'
  }
})
</script>

<style scoped>
.formulas-view {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

.search-bar {
  max-width: 400px;
}

.filter-tabs {
  flex: 1;
}

.sort-options {
  align-self: flex-end;
}

.formulas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.formula-card {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.formula-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: var(--color-primary);
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.formula-category {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 500;
}

.formula-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.formula-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.formula-equation {
  margin: 1.5rem 0;
  text-align: center;
}

.formula-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.more-keywords {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  align-self: center;
}

.formula-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.formula-preview {
  padding: 1rem;
}

.preview-equation {
  margin: 2rem 0;
  text-align: center;
}

.preview-theory {
  margin: 1.5rem 0;
}

.preview-theory h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.preview-actions {
  margin-top: 2rem;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .formulas-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-options {
    align-self: stretch;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .formula-actions {
    flex-direction: column;
  }
}
</style>