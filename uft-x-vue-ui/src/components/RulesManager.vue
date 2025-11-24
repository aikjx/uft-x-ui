<template>
  <div class="rules-manager">
    <!-- 搜索和筛选区域 -->
    <div class="rules-header">
      <t-input
        v-model="searchQuery"
        placeholder="搜索规则..."
        clearable
        class="search-input"
      >
        <template #prefix-icon>
          <t-icon name="search" />
        </template>
      </t-input>
      
      <div class="filter-controls">
        <t-select v-model="filterLanguage" placeholder="按语言筛选" clearable>
          <t-option v-for="lang in languages" :key="lang" :value="lang" :label="lang" />
        </t-select>
        
        <t-select v-model="filterCategory" placeholder="按类别筛选" clearable>
          <t-option v-for="category in categories" :key="category" :value="category" :label="category" />
        </t-select>
        
        <t-button @click="addRule" class="add-rule-btn">
          <t-icon name="add" /> 添加规则
        </t-button>
      </div>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list">
      <t-table
        :data="filteredRules"
        :columns="columns"
        row-key="id"
        hover
        stripe
        size="medium"
      >
        <!-- 规则状态 -->
        <template #enabled="{ row }">
          <t-switch v-model="row.enabled" @change="toggleRule(row.id, row.enabled)" />
        </template>
        
        <!-- 严重程度 -->
        <template #severity="{ row }">
          <t-tag :theme="getSeverityTheme(row.severity)" variant="light">
            {{ getSeverityText(row.severity) }}
          </t-tag>
        </template>
        
        <!-- 操作列 -->
        <template #operation="{ row }">
          <t-space>
            <t-button variant="text" @click="editRule(row)">
              <t-icon name="edit" />
            </t-button>
            <t-button variant="text" theme="danger" @click="deleteRule(row.id)">
              <t-icon name="delete" />
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>

    <!-- 规则详情对话框 -->
    <t-dialog
      v-model:visible="ruleDialogVisible"
      :header="isEditing ? '编辑规则' : '添加规则'"
      width="600px"
      :on-confirm="saveRule"
      :on-close="closeRuleDialog"
    >
      <rule-editor 
        v-if="ruleDialogVisible"
        v-model="currentRule" 
        :is-editing="isEditing"
      />
    </t-dialog>

    <!-- 统计信息 -->
    <t-card class="stats-card">
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">总规则数</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">启用规则</span>
          <span class="stat-value">{{ stats.enabled }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">内置规则</span>
          <span class="stat-value">{{ stats.builtIn }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">自定义规则</span>
          <span class="stat-value">{{ stats.custom }}</span>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { RuleManager } from '../utils/ruleManager'
import { RuleTemplateGenerator } from '../utils/ruleManager'
import { ProgrammingLanguage, IssueCategory, IssueSeverity } from '../types/code-optimization'

// 组件状态
const searchQuery = ref('')
const filterLanguage = ref('')
const filterCategory = ref('')
const ruleDialogVisible = ref(false)
const isEditing = ref(false)
const ruleManager = ref<RuleManager | null>(null)

// 当前编辑的规则
const currentRule = ref({
  id: '',
  name: '',
  description: '',
  category: IssueCategory.BEST_PRACTICE,
  severity: IssueSeverity.WARNING,
  language: ProgrammingLanguage.JAVASCRIPT,
  enabled: true,
  priority: 50,
  conditions: []
})

// 统计信息
const stats = reactive({
  total: 0,
  enabled: 0,
  builtIn: 0,
  custom: 0
})

// 语言选项
const languages = Object.values(ProgrammingLanguage)

// 类别选项
const categories = Object.values(IssueCategory)

// 表格列配置
const columns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'name', title: '规则名称', width: 150 },
  { colKey: 'description', title: '描述', width: 200 },
  { colKey: 'language', title: '语言', width: 100 },
  { colKey: 'category', title: '类别', width: 100 },
  { colKey: 'severity', title: '严重程度', width: 100 },
  { colKey: 'priority', title: '优先级', width: 80 },
  { colKey: 'enabled', title: '状态', width: 80 },
  { colKey: 'operation', title: '操作', width: 120 }
]

// 计算过滤后的规则列表
const filteredRules = computed(() => {
  if (!ruleManager.value) return []
  
  let rules = ruleManager.value.getAllRules()
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    rules = rules.filter(rule => 
      rule.id.toLowerCase().includes(query) ||
      rule.name.toLowerCase().includes(query) ||
      rule.description.toLowerCase().includes(query)
    )
  }
  
  // 语言过滤
  if (filterLanguage.value) {
    rules = rules.filter(rule => rule.language === filterLanguage.value)
  }
  
  // 类别过滤
  if (filterCategory.value) {
    rules = rules.filter(rule => rule.category === filterCategory.value)
  }
  
  return rules
})

// 初始化规则管理器
onMounted(() => {
  ruleManager.value = new RuleManager()
  updateStats()
})

// 更新统计信息
const updateStats = () => {
  if (!ruleManager.value) return
  
  const statistics = ruleManager.value.getRuleStatistics()
  Object.assign(stats, statistics)
}

// 获取严重程度主题色
const getSeverityTheme = (severity: IssueSeverity) => {
  switch (severity) {
    case IssueSeverity.ERROR: return 'danger'
    case IssueSeverity.WARNING: return 'warning'
    case IssueSeverity.INFO: return 'info'
    default: return 'default'
  }
}

// 获取严重程度文本
const getSeverityText = (severity: IssueSeverity) => {
  switch (severity) {
    case IssueSeverity.ERROR: return '错误'
    case IssueSeverity.WARNING: return '警告'
    case IssueSeverity.INFO: return '信息'
    default: return '未知'
  }
}

// 切换规则状态
const toggleRule = (ruleId: string, enabled: boolean) => {
  if (!ruleManager.value) return
  
  try {
    ruleManager.value.toggleRule(ruleId, enabled)
    updateStats()
  } catch (error) {
    console.error('切换规则状态失败:', error)
  }
}

// 添加规则
const addRule = () => {
  isEditing.value = false
  currentRule.value = RuleTemplateGenerator.getTemplate(
    ProgrammingLanguage.JAVASCRIPT,
    IssueCategory.BEST_PRACTICE
  )
  ruleDialogVisible.value = true
}

// 编辑规则
const editRule = (rule: any) => {
  isEditing.value = true
  currentRule.value = { ...rule }
  ruleDialogVisible.value = true
}

// 删除规则
const deleteRule = (ruleId: string) => {
  if (!ruleManager.value) return
  
  if (confirm('确定要删除这个规则吗？')) {
    try {
      ruleManager.value.deleteRule(ruleId)
      updateStats()
    } catch (error) {
      console.error('删除规则失败:', error)
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
}

// 保存规则
const saveRule = () => {
  if (!ruleManager.value) return
  
  try {
    const validation = ruleManager.value.validateRule(currentRule.value)
    
    if (!validation.isValid) {
      alert('规则验证失败：' + validation.errors.join(', '))
      return
    }
    
    if (isEditing.value) {
      ruleManager.value.updateRule(currentRule.value.id, currentRule.value)
    } else {
      ruleManager.value.addCustomRule(currentRule.value)
    }
    
    updateStats()
    ruleDialogVisible.value = false
  } catch (error) {
    console.error('保存规则失败:', error)
    alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 关闭规则对话框
const closeRuleDialog = () => {
  ruleDialogVisible.value = false
}
</script>

<style scoped>
.rules-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rules-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.filter-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-rule-btn {
  margin-left: auto;
}

.rules-list {
  flex: 1;
  overflow-y: auto;
}

.stats-card {
  margin-top: 16px;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: var(--td-bg-color-container);
  border-radius: 4px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: var(--td-brand-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rules-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>