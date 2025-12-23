<template>
  <div class="rule-editor">
    <t-form :data="rule" :rules="rules" label-width="100px">
      <!-- 基础信息 -->
      <t-form-section title="基础信息">
        <t-form-item label="规则ID" name="id" required>
          <t-input v-model="rule.id" :disabled="isEditing" />
          <template #help>
            <span class="help-text">规则唯一标识符，创建后不可修改</span>
          </template>
        </t-form-item>

        <t-form-item label="规则名称" name="name" required>
          <t-input v-model="rule.name" />
        </t-form-item>

        <t-form-item label="描述" name="description" required>
          <t-textarea v-model="rule.description" :rows="3" />
        </t-form-item>
      </t-form-section>

      <!-- 规则配置 -->
      <t-form-section title="规则配置">
        <t-form-item label="编程语言" name="language" required>
          <t-select v-model="rule.language">
            <t-option v-for="lang in languages" :key="lang" :value="lang" :label="lang" />
          </t-select>
        </t-form-item>

        <t-form-item label="问题类别" name="category" required>
          <t-select v-model="rule.category">
            <t-option
              v-for="category in categories"
              :key="category"
              :value="category"
              :label="getCategoryText(category)"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="严重程度" name="severity" required>
          <t-select v-model="rule.severity">
            <t-option
              v-for="severity in severities"
              :key="severity"
              :value="severity"
              :label="getSeverityText(severity)"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="优先级" name="priority" required>
          <t-slider v-model="rule.priority" :min="1" :max="100" show-input />
        </t-form-item>

        <t-form-item label="启用规则" name="enabled">
          <t-switch v-model="rule.enabled" />
        </t-form-item>
      </t-form-section>

      <!-- 条件配置 -->
      <t-form-section title="匹配条件">
        <div class="conditions-section">
          <div class="conditions-header">
            <span class="section-title">条件列表</span>
            <t-button size="small" @click="addCondition"> <t-icon name="add" /> 添加条件 </t-button>
          </div>

          <div v-if="rule.conditions.length === 0" class="empty-conditions">
            <t-empty description="暂无条件" />
          </div>

          <div v-else class="conditions-list">
            <div v-for="(condition, index) in rule.conditions" :key="index" class="condition-item">
              <div class="condition-header">
                <span>条件 {{ index + 1 }}</span>
                <t-button
                  size="small"
                  variant="text"
                  theme="danger"
                  @click="removeCondition(index)"
                >
                  <t-icon name="delete" />
                </t-button>
              </div>

              <div class="condition-content">
                <t-form-item label="条件类型">
                  <t-select v-model="condition.type" @change="updateConditionTemplate(condition)">
                    <t-option
                      v-for="type in conditionTypes"
                      :key="type"
                      :value="type"
                      :label="type"
                    />
                  </t-select>
                </t-form-item>

                <t-form-item label="模式">
                  <t-input v-model="condition.pattern" />
                </t-form-item>

                <t-form-item label="参数">
                  <div class="parameters-section">
                    <div
                      v-for="(value, key) in condition.parameters"
                      :key="key"
                      class="parameter-item"
                    >
                      <span class="parameter-key">{{ key }}:</span>
                      <t-input v-model="condition.parameters[key]" size="small" />
                      <t-button
                        size="small"
                        variant="text"
                        @click="removeParameter(condition, key)"
                      >
                        <t-icon name="close" />
                      </t-button>
                    </div>

                    <div class="add-parameter">
                      <t-input v-model="newParameterKey" placeholder="参数名" size="small" />
                      <t-input v-model="newParameterValue" placeholder="参数值" size="small" />
                      <t-button size="small" @click="addParameter(condition)">添加</t-button>
                    </div>
                  </div>
                </t-form-item>
              </div>
            </div>
          </div>
        </div>
      </t-form-section>
    </t-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import {
    ProgrammingLanguage,
    IssueCategory,
    IssueSeverity,
    RuleCondition
  } from '../types/code-optimization'

  // 组件属性
  interface Props {
    modelValue: any
    isEditing?: boolean
  }

  const props = defineProps<Props>()

  // 当前编辑的规则
  const rule = reactive({
    id: '',
    name: '',
    description: '',
    category: IssueCategory.BEST_PRACTICE,
    severity: IssueSeverity.WARNING,
    language: ProgrammingLanguage.JAVASCRIPT,
    enabled: true,
    priority: 50,
    conditions: [] as RuleCondition[]
  })

  // 新参数输入
  const newParameterKey = ref('')
  const newParameterValue = ref('')

  // 选项列表
  const languages = Object.values(ProgrammingLanguage)
  const categories = Object.values(IssueCategory)
  const severities = Object.values(IssueSeverity)
  const conditionTypes = [
    'ast_pattern',
    'complexity_threshold',
    'length_threshold',
    'depth_threshold'
  ]

  // 表单验证规则
  const rules = {
    id: [
      { required: true, message: '请输入规则ID' },
      { pattern: /^[a-z0-9_-]+$/, message: '规则ID只能包含小写字母、数字、下划线和连字符' }
    ],
    name: [{ required: true, message: '请输入规则名称' }],
    description: [{ required: true, message: '请输入规则描述' }],
    language: [{ required: true, message: '请选择编程语言' }],
    category: [{ required: true, message: '请选择问题类别' }],
    severity: [{ required: true, message: '请选择严重程度' }],
    priority: [
      { required: true, message: '请设置优先级' },
      { type: 'number', min: 1, max: 100, message: '优先级必须在1-100之间' }
    ]
  }

  // 监听属性变化
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        Object.assign(rule, newValue)
      }
    },
    { immediate: true, deep: true }
  )

  // 获取类别文本
  const getCategoryText = (category: IssueCategory) => {
    switch (category) {
      case IssueCategory.PERFORMANCE:
        return '性能'
      case IssueCategory.MEMORY:
        return '内存'
      case IssueCategory.BEST_PRACTICE:
        return '最佳实践'
      case IssueCategory.CODE_STYLE:
        return '代码风格'
      case IssueCategory.BUG:
        return '错误'
      case IssueCategory.SECURITY:
        return '安全'
      default:
        return '其他'
    }
  }

  // 获取严重程度文本
  const getSeverityText = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.ERROR:
        return '错误'
      case IssueSeverity.WARNING:
        return '警告'
      case IssueSeverity.INFO:
        return '信息'
      default:
        return '未知'
    }
  }

  // 添加条件
  const addCondition = () => {
    rule.conditions.push({
      type: 'ast_pattern',
      pattern: '',
      parameters: {}
    })
  }

  // 删除条件
  const removeCondition = (index: number) => {
    rule.conditions.splice(index, 1)
  }

  // 更新条件模板
  const updateConditionTemplate = (condition: RuleCondition) => {
    // 根据条件类型设置默认参数
    switch (condition.type) {
      case 'complexity_threshold':
        condition.parameters = { threshold: '10' }
        condition.pattern = 'cyclomatic_complexity'
        break
      case 'length_threshold':
        condition.parameters = { threshold: '50' }
        condition.pattern = 'function_length'
        break
      case 'depth_threshold':
        condition.parameters = { threshold: '3' }
        condition.pattern = 'nested_depth'
        break
      default:
        condition.parameters = {}
        condition.pattern = ''
    }
  }

  // 添加参数
  const addParameter = (condition: RuleCondition) => {
    if (newParameterKey.value && newParameterValue.value) {
      condition.parameters[newParameterKey.value] = newParameterValue.value
      newParameterKey.value = ''
      newParameterValue.value = ''
    }
  }

  // 删除参数
  const removeParameter = (condition: RuleCondition, key: string) => {
    delete condition.parameters[key]
  }

  // 监听规则变化并通知父组件
  const emit = defineEmits<{
    'update:modelValue': [value: any]
  }>()

  watch(
    rule,
    newValue => {
      emit('update:modelValue', { ...newValue })
    },
    { deep: true }
  )
</script>

<style scoped>
  .rule-editor {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .help-text {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }

  .conditions-section {
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 4px;
    padding: 16px;
  }

  .conditions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-title {
    font-weight: bold;
    color: var(--td-text-color-primary);
  }

  .empty-conditions {
    text-align: center;
    padding: 40px 0;
  }

  .conditions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .condition-item {
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 4px;
    padding: 12px;
  }

  .condition-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  .condition-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .parameters-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .parameter-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .parameter-key {
    min-width: 80px;
    font-weight: bold;
  }

  .add-parameter {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--td-border-level-1-color);
  }

  :deep(.t-form-section) {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  :deep(.t-form-section:last-child) {
    border-bottom: none;
  }
</style>
