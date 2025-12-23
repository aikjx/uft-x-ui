<template>
  <div class="code-suggestion-panel" :class="{ 'dark-theme': isDark }">
    <div class="panel-header">
      <h3 class="panel-title">
        <t-icon name="lightbulb" />
        智能优化建议
      </h3>
      <div class="panel-controls">
        <t-button
          variant="outline"
          size="small"
          @click="refreshSuggestions"
          :loading="isRefreshing"
        >
          <t-icon name="refresh" />
          刷新
        </t-button>
        <t-button variant="outline" size="small" @click="toggleFilter">
          <t-icon name="filter" />
          筛选
        </t-button>
      </div>
    </div>

    <div class="filter-section" v-show="showFilter">
      <t-form layout="inline">
        <t-form-item label="类型">
          <t-select
            v-model="filterType"
            multiple
            :options="typeOptions"
            placeholder="选择建议类型"
            @change="applyFilter"
          />
        </t-form-item>
        <t-form-item label="优先级">
          <t-select
            v-model="filterPriority"
            multiple
            :options="priorityOptions"
            placeholder="选择优先级"
            @change="applyFilter"
          />
        </t-form-item>
        <t-form-item label="影响">
          <t-select
            v-model="filterImpact"
            multiple
            :options="impactOptions"
            placeholder="选择影响范围"
            @change="applyFilter"
          />
        </t-form-item>
      </t-form>
    </div>

    <div class="suggestions-container" v-if="filteredSuggestions.length > 0">
      <transition-group name="suggestion" tag="div">
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion.id"
          class="suggestion-item"
          :class="[
            `priority-${suggestion.priority}`,
            { expanded: expandedItems.includes(suggestion.id) }
          ]"
        >
          <div class="suggestion-header" @click="toggleExpand(suggestion.id)">
            <div class="suggestion-meta">
              <t-tag
                :variant="getTypeVariant(suggestion.type)"
                size="small"
                class="suggestion-type"
              >
                {{ suggestion.type }}
              </t-tag>
              <t-tag
                :variant="getPriorityVariant(suggestion.priority)"
                size="small"
                class="suggestion-priority"
              >
                {{ suggestion.priority }}
              </t-tag>
              <t-tag
                :variant="getImpactVariant(suggestion.impact)"
                size="small"
                class="suggestion-impact"
              >
                {{ suggestion.impact }}
              </t-tag>
            </div>
            <div class="suggestion-actions">
              <t-button
                variant="text"
                size="small"
                @click.stop="applySuggestion(suggestion)"
                :loading="applyingSuggestion === suggestion.id"
              >
                应用
              </t-button>
              <t-button variant="text" size="small" @click.stop="ignoreSuggestion(suggestion)">
                忽略
              </t-button>
              <t-button variant="text" size="small" @click.stop="showDetails(suggestion)">
                详情
              </t-button>
            </div>
          </div>

          <div class="suggestion-content">
            <h4 class="suggestion-title">{{ suggestion.title }}</h4>
            <p class="suggestion-description">{{ suggestion.description }}</p>

            <!-- 代码示例 -->
            <div class="code-example" v-if="suggestion.codeExample">
              <div class="code-tabs">
                <div
                  class="code-tab"
                  :class="{ active: activeTab[suggestion.id] === 'before' }"
                  @click="switchCodeTab(suggestion.id, 'before')"
                >
                  优化前
                </div>
                <div
                  class="code-tab"
                  :class="{ active: activeTab[suggestion.id] === 'after' }"
                  @click="switchCodeTab(suggestion.id, 'after')"
                >
                  优化后
                </div>
              </div>
              <div class="code-content">
                <pre
                  v-if="activeTab[suggestion.id] === 'before'"
                ><code>{{ suggestion.codeExample.before }}</code></pre>
                <pre
                  v-if="activeTab[suggestion.id] === 'after'"
                ><code>{{ suggestion.codeExample.after }}</code></pre>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="suggestion-details" v-if="expandedItems.includes(suggestion.id)">
              <div class="detail-section">
                <h5>预期收益</h5>
                <div class="benefits">
                  <div
                    class="benefit-item"
                    v-for="benefit in suggestion.benefits"
                    :key="benefit.type"
                  >
                    <t-icon :name="getBenefitIcon(benefit.type)" />
                    <span class="benefit-label">{{ benefit.label }}</span>
                    <span class="benefit-value" :class="benefit.trend">
                      {{ benefit.value }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section" v-if="suggestion.risks && suggestion.risks.length > 0">
                <h5>潜在风险</h5>
                <ul class="risks">
                  <li v-for="risk in suggestion.risks" :key="risk">{{ risk }}</li>
                </ul>
              </div>

              <div class="detail-section">
                <h5>实施步骤</h5>
                <ol class="implementation-steps">
                  <li v-for="step in suggestion.implementationSteps" :key="step">{{ step }}</li>
                </ol>
              </div>

              <div class="detail-section" v-if="suggestion.references">
                <h5>相关资料</h5>
                <div class="references">
                  <a
                    v-for="ref in suggestion.references"
                    :key="ref.url"
                    :href="ref.url"
                    target="_blank"
                    class="reference-link"
                  >
                    <t-icon name="link" />
                    {{ ref.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <div class="empty-state" v-else>
      <t-empty description="暂无优化建议">
        <t-button variant="outline" @click="refreshSuggestions"> 重新分析 </t-button>
      </t-empty>
    </div>

    <!-- 详细对话框 -->
    <t-dialog
      v-model:visible="detailDialog.visible"
      :header="detailDialog.title"
      width="80%"
      max-height="80vh"
    >
      <div class="detail-dialog-content" v-if="detailDialog.suggestion">
        <div class="dialog-section">
          <h4>建议描述</h4>
          <p>{{ detailDialog.suggestion.description }}</p>
        </div>

        <div class="dialog-section" v-if="detailDialog.suggestion.codeExample">
          <h4>代码示例</h4>
          <div class="code-comparison">
            <div class="code-column">
              <h5>优化前</h5>
              <pre><code>{{ detailDialog.suggestion.codeExample.before }}</code></pre>
            </div>
            <div class="code-column">
              <h5>优化后</h5>
              <pre><code>{{ detailDialog.suggestion.codeExample.after }}</code></pre>
            </div>
          </div>
        </div>

        <div class="dialog-section">
          <h4>技术原理</h4>
          <p>{{ detailDialog.suggestion.technicalExplanation }}</p>
        </div>
      </div>

      <template #footer>
        <t-button variant="outline" @click="detailDialog.visible = false"> 关闭 </t-button>
        <t-button
          variant="primary"
          @click="applySuggestionFromDialog"
          :loading="applyingSuggestion === detailDialog.suggestion?.id"
        >
          应用此建议
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useCodeOptimizationStore } from '@/stores/code-optimization'
  import type { CodeAnalysisResult } from '@/types/code-optimization'

  interface CodeSuggestion {
    id: string
    type: 'performance' | 'readability' | 'maintainability' | 'security'
    priority: 'high' | 'medium' | 'low'
    impact: 'local' | 'function' | 'module' | 'global'
    title: string
    description: string
    codeExample?: {
      before: string
      after: string
    }
    benefits: Array<{
      type: 'performance' | 'memory' | 'readability' | 'maintainability'
      label: string
      value: string
      trend: 'up' | 'down'
    }>
    risks?: string[]
    implementationSteps: string[]
    references?: Array<{
      title: string
      url: string
    }>
    technicalExplanation?: string
    lineNumber?: number
    applicable?: boolean
  }

  interface Props {
    analysisResult?: CodeAnalysisResult
    language?: string
    darkMode?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    darkMode: false
  })

  const emit = defineEmits<{
    suggestionApplied: [suggestion: CodeSuggestion]
    suggestionIgnored: [suggestionId: string]
  }>()

  // Store
  const store = useCodeOptimizationStore()

  // 响应式状态
  const suggestions = ref<CodeSuggestion[]>([])
  const expandedItems = ref<string[]>([])
  const activeTab = ref<Record<string, string>>({})
  const isRefreshing = ref(false)
  const applyingSuggestion = ref<string | null>(null)
  const showFilter = ref(false)

  // 筛选状态
  const filterType = ref<string[]>([])
  const filterPriority = ref<string[]>([])
  const filterImpact = ref<string[]>([])

  // 详情对话框
  const detailDialog = ref({
    visible: false,
    title: '',
    suggestion: null as CodeSuggestion | null
  })

  const isDark = ref(props.darkMode)

  // 筛选选项
  const typeOptions = [
    { label: '性能优化', value: 'performance' },
    { label: '可读性', value: 'readability' },
    { label: '可维护性', value: 'maintainability' },
    { label: '安全性', value: 'security' }
  ]

  const priorityOptions = [
    { label: '高', value: 'high' },
    { label: '中', value: 'medium' },
    { label: '低', value: 'low' }
  ]

  const impactOptions = [
    { label: '局部', value: 'local' },
    { label: '函数', value: 'function' },
    { label: '模块', value: 'module' },
    { label: '全局', value: 'global' }
  ]

  // 计算属性
  const filteredSuggestions = computed(() => {
    let result = suggestions.value

    if (filterType.value.length > 0) {
      result = result.filter(s => filterType.value.includes(s.type))
    }

    if (filterPriority.value.length > 0) {
      result = result.filter(s => filterPriority.value.includes(s.priority))
    }

    if (filterImpact.value.length > 0) {
      result = result.filter(s => filterImpact.value.includes(s.impact))
    }

    return result.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  })

  // 方法
  async function generateSuggestions() {
    if (!props.analysisResult) return

    isRefreshing.value = true

    try {
      const newSuggestions: CodeSuggestion[] = []

      // 基于分析结果生成建议
      const metrics = props.analysisResult.complexityMetrics
      const issues = props.analysisResult.issues
      const code = props.analysisResult.originalCode

      // 循环优化建议
      if (metrics.cyclomaticComplexity > 10) {
        newSuggestions.push({
          id: 'reduce-complexity',
          type: 'maintainability',
          priority: 'high',
          impact: 'module',
          title: '降低循环复杂度',
          description: '当前代码的循环复杂度过高，建议将复杂函数拆分为更小的函数',
          codeExample: {
            before: `function processData(data) {
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'A') {
        for (let j = 0; j < data[i].items.length; j++) {
          if (data[i].items[j].active) {
            // 处理逻辑
          }
        }
      }
    }
  }
}`,
            after: `function processData(data) {
  return data
    .filter(item => item.type === 'A')
    .flatMap(item => item.items)
    .filter(item => item.active)
    .map(processItem);
}`
          },
          benefits: [
            { type: 'maintainability', label: '可维护性', value: '+40%', trend: 'up' },
            { type: 'readability', label: '可读性', value: '+60%', trend: 'up' },
            { type: 'performance', label: '性能', value: '+15%', trend: 'up' }
          ],
          implementationSteps: [
            '识别复杂的循环逻辑',
            '将嵌套循环转换为函数式方法',
            '提取独立的处理函数',
            '添加适当的类型注解'
          ],
          references: [
            {
              title: '函数式编程最佳实践',
              url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'
            }
          ]
        })
      }

      // 内存优化建议
      if (code.includes('new Array') || code.includes('[]')) {
        newSuggestions.push({
          id: 'optimize-array-creation',
          type: 'performance',
          priority: 'medium',
          impact: 'function',
          title: '优化数组创建',
          description: '检测到可能频繁的数组创建，建议使用更高效的创建方式',
          codeExample: {
            before: `function collectItems(items) {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    if (isValid(items[i])) {
      result.push(items[i]);
    }
  }
  return result;
}`,
            after: `function collectItems(items) {
  return items.filter(isValid);
}`
          },
          benefits: [
            { type: 'performance', label: '执行速度', value: '+25%', trend: 'up' },
            { type: 'memory', label: '内存使用', value: '-20%', trend: 'down' }
          ],
          implementationSteps: ['识别数组循环创建模式', '使用数组内置方法替代', '确保向后兼容性']
        })
      }

      // 变量命名建议
      const variableIssues = issues.filter(issue => issue.type === 'naming')
      if (variableIssues.length > 0) {
        newSuggestions.push({
          id: 'improve-naming',
          type: 'readability',
          priority: 'low',
          impact: 'local',
          title: '改进变量命名',
          description: '使用更具描述性的变量名来提高代码可读性',
          codeExample: {
            before: `const d = new Date();
const n = d.getMonth() + 1;
const y = d.getFullYear();`,
            after: `const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();`
          },
          benefits: [
            { type: 'readability', label: '可读性', value: '+80%', trend: 'up' },
            { type: 'maintainability', label: '可维护性', value: '+30%', trend: 'up' }
          ],
          implementationSteps: ['识别含义不明的变量名', '使用更具描述性的名称', '保持命名一致性']
        })
      }

      // 添加更多智能建议...
      suggestions.value = newSuggestions
    } catch (error) {
      console.error('生成建议失败:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  function toggleExpand(suggestionId: string) {
    const index = expandedItems.value.indexOf(suggestionId)
    if (index > -1) {
      expandedItems.value.splice(index, 1)
    } else {
      expandedItems.value.push(suggestionId)
    }
  }

  function switchCodeTab(suggestionId: string, tab: string) {
    activeTab.value[suggestionId] = tab
  }

  function toggleFilter() {
    showFilter.value = !showFilter.value
  }

  function applyFilter() {
    // 筛选逻辑已在计算属性中实现
  }

  async function applySuggestion(suggestion: CodeSuggestion) {
    applyingSuggestion.value = suggestion.id

    try {
      // 应用建议的逻辑
      if (suggestion.codeExample) {
        // 这里可以实现代码替换逻辑
        console.log('应用建议:', suggestion.title)
      }

      emit('suggestionApplied', suggestion)

      // 从列表中移除已应用的建议
      const index = suggestions.value.findIndex(s => s.id === suggestion.id)
      if (index > -1) {
        suggestions.value.splice(index, 1)
      }
    } catch (error) {
      console.error('应用建议失败:', error)
    } finally {
      applyingSuggestion.value = null
    }
  }

  function ignoreSuggestion(suggestion: CodeSuggestion) {
    emit('suggestionIgnored', suggestion.id)

    const index = suggestions.value.findIndex(s => s.id === suggestion.id)
    if (index > -1) {
      suggestions.value.splice(index, 1)
    }
  }

  function showDetails(suggestion: CodeSuggestion) {
    detailDialog.value = {
      visible: true,
      title: suggestion.title,
      suggestion
    }
  }

  function applySuggestionFromDialog() {
    if (detailDialog.value.suggestion) {
      applySuggestion(detailDialog.value.suggestion)
      detailDialog.value.visible = false
    }
  }

  function refreshSuggestions() {
    generateSuggestions()
  }

  // 工具方法
  function getTypeVariant(type: string): string {
    const variants = {
      performance: 'primary',
      readability: 'success',
      maintainability: 'warning',
      security: 'danger'
    }
    return variants[type] || 'default'
  }

  function getPriorityVariant(priority: string): string {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'default'
    }
    return variants[priority] || 'default'
  }

  function getImpactVariant(impact: string): string {
    const variants = {
      local: 'default',
      function: 'primary',
      module: 'warning',
      global: 'danger'
    }
    return variants[impact] || 'default'
  }

  function getBenefitIcon(type: string): string {
    const icons = {
      performance: 'speed',
      memory: 'storage',
      readability: 'visibility',
      maintainability: 'settings'
    }
    return icons[type] || 'check'
  }

  // 监听器
  watch(
    () => props.analysisResult,
    () => {
      if (props.analysisResult) {
        generateSuggestions()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.darkMode,
    dark => {
      isDark.value = dark
    }
  )

  // 生命周期
  onMounted(() => {
    if (props.analysisResult) {
      generateSuggestions()
    }
  })
</script>

<style scoped>
  .code-suggestion-panel {
    background: var(--td-bg-color-container, #fff);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .dark-theme {
    background: var(--td-bg-color-container-hover, #1f1f1f);
    color: var(--td-text-color-primary, #fff);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary, #333);
    margin: 0;
  }

  .panel-controls {
    display: flex;
    gap: 8px;
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--td-bg-color-container-select, #f5f5f5);
    border-radius: 6px;
  }

  .suggestions-container {
    max-height: 600px;
    overflow-y: auto;
  }

  .suggestion-item {
    margin-bottom: 16px;
    border: 1px solid var(--td-border-level-1-color, #e7e7e7);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .suggestion-item.priority-high {
    border-left: 4px solid var(--td-error-color, #f5222d);
  }

  .suggestion-item.priority-medium {
    border-left: 4px solid var(--td-warning-color, #faad14);
  }

  .suggestion-item.priority-low {
    border-left: 4px solid var(--td-success-color, #52c41a);
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--td-bg-color-container-select, #fafafa);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .suggestion-header:hover {
    background: var(--td-bg-color-container-hover, #f0f0f0);
  }

  .suggestion-meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .suggestion-actions {
    display: flex;
    gap: 4px;
  }

  .suggestion-content {
    padding: 16px;
    background: var(--td-bg-color-container, #fff);
  }

  .suggestion-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary, #333);
    margin: 0 0 8px 0;
  }

  .suggestion-description {
    color: var(--td-text-color-secondary, #666);
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .code-example {
    margin-bottom: 16px;
  }

  .code-tabs {
    display: flex;
    border-bottom: 1px solid var(--td-border-level-1-color, #e7e7e7);
    margin-bottom: 12px;
  }

  .code-tab {
    padding: 8px 16px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .code-tab.active {
    border-bottom-color: var(--td-brand-color, #1890ff);
    color: var(--td-brand-color, #1890ff);
  }

  .code-content {
    background: var(--td-bg-color-container-select, #f5f5f5);
    border-radius: 4px;
    overflow: hidden;
  }

  .code-content pre {
    margin: 0;
    padding: 12px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    overflow-x: auto;
  }

  .suggestion-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--td-border-level-1-color, #e7e7e7);
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .detail-section h5 {
    font-size: 12px;
    font-weight: 600;
    color: var(--td-text-color-secondary, #666);
    margin: 0 0 8px 0;
    text-transform: uppercase;
  }

  .benefits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .benefit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--td-bg-color-container-select, #f5f5f5);
    border-radius: 4px;
  }

  .benefit-label {
    flex: 1;
    font-size: 12px;
    color: var(--td-text-color-primary, #333);
  }

  .benefit-value.up {
    color: var(--td-success-color, #52c41a);
  }

  .benefit-value.down {
    color: var(--td-error-color, #f5222d);
  }

  .risks {
    margin: 0;
    padding-left: 16px;
  }

  .risks li {
    font-size: 12px;
    color: var(--td-text-color-secondary, #666);
    margin-bottom: 4px;
  }

  .implementation-steps {
    margin: 0;
    padding-left: 16px;
  }

  .implementation-steps li {
    font-size: 12px;
    color: var(--td-text-color-secondary, #666);
    margin-bottom: 4px;
  }

  .references {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reference-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--td-brand-color, #1890ff);
    text-decoration: none;
  }

  .reference-link:hover {
    color: var(--td-brand-color-hover, #40a9ff);
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .detail-dialog-content {
    max-height: 60vh;
    overflow-y: auto;
  }

  .dialog-section {
    margin-bottom: 24px;
  }

  .dialog-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary, #333);
    margin: 0 0 12px 0;
  }

  .code-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .code-column h5 {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-secondary, #666);
    margin: 0 0 8px 0;
  }

  /* 动画效果 */
  .suggestion-enter-active,
  .suggestion-leave-active {
    transition: all 0.3s ease;
  }

  .suggestion-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .suggestion-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .code-suggestion-panel {
      padding: 16px;
    }

    .panel-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .suggestion-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .suggestion-meta {
      flex-wrap: wrap;
    }

    .code-comparison {
      grid-template-columns: 1fr;
    }

    .benefits {
      grid-template-columns: 1fr;
    }
  }
</style>
