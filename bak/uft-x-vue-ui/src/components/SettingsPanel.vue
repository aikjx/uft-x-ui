<template>
  <div class="settings-panel">
    <t-form :data="settings" :rules="rules" label-width="120px">
      <!-- 基础设置 -->
      <t-form-section title="基础设置">
        <t-form-item label="自动应用修复" name="autoApplyFixes">
          <t-switch v-model="settings.autoApplyFixes" />
          <template #help>
            <span class="help-text">检测到问题时自动应用修复建议</span>
          </template>
        </t-form-item>

        <t-form-item label="启用实验性规则" name="enableExperimentalRules">
          <t-switch v-model="settings.enableExperimentalRules" />
          <template #help>
            <span class="help-text">启用可能不稳定但功能强大的实验性规则</span>
          </template>
        </t-form-item>

        <t-form-item label="最大文件大小" name="maxFileSize">
          <t-input-number v-model="settings.maxFileSize" :min="1000" :max="1000000" suffix="字节" />
          <template #help>
            <span class="help-text">单个文件的最大处理大小限制</span>
          </template>
        </t-form-item>

        <t-form-item label="包含注释" name="includeComments">
          <t-switch v-model="settings.includeComments" />
          <template #help>
            <span class="help-text">在优化过程中保留代码注释</span>
          </template>
        </t-form-item>
      </t-form-section>

      <!-- 语言特定设置 -->
      <t-form-section title="语言特定设置">
        <t-form-item label="JavaScript风格指南" name="jsStyleGuide">
          <t-select v-model="settings.languageSpecific.javascript.styleGuide">
            <t-option value="standard" label="Standard" />
            <t-option value="airbnb" label="Airbnb" />
            <t-option value="google" label="Google" />
            <t-option value="custom" label="自定义" />
          </t-select>
        </t-form-item>

        <t-form-item label="TypeScript严格模式" name="tsStrictMode">
          <t-switch v-model="settings.languageSpecific.typescript.strictMode" />
        </t-form-item>

        <t-form-item label="Python缩进" name="pythonIndent">
          <t-select v-model="settings.languageSpecific.python.indentSize">
            <t-option value="2" label="2空格" />
            <t-option value="4" label="4空格" />
          </t-select>
        </t-form-item>
      </t-form-section>

      <!-- 性能设置 -->
      <t-form-section title="性能设置">
        <t-form-item label="最大优化时间" name="maxOptimizationTime">
          <t-input-number v-model="settings.maxOptimizationTime" :min="1" :max="300" suffix="秒" />
        </t-form-item>

        <t-form-item label="内存使用限制" name="memoryLimit">
          <t-input-number v-model="settings.memoryLimit" :min="100" :max="8192" suffix="MB" />
        </t-form-item>

        <t-form-item label="并行处理" name="parallelProcessing">
          <t-switch v-model="settings.parallelProcessing" />
        </t-form-item>
      </t-form-section>

      <!-- 输出设置 -->
      <t-form-section title="输出设置">
        <t-form-item label="输出格式" name="outputFormat">
          <t-select v-model="settings.outputFormat">
            <t-option value="pretty" label="美化格式" />
            <t-option value="minified" label="压缩格式" />
            <t-option value="original" label="保持原格式" />
          </t-select>
        </t-form-item>

        <t-form-item label="生成报告" name="generateReport">
          <t-switch v-model="settings.generateReport" />
        </t-form-item>

        <t-form-item label="报告格式" name="reportFormat">
          <t-select v-model="settings.reportFormat">
            <t-option value="html" label="HTML" />
            <t-option value="json" label="JSON" />
            <t-option value="markdown" label="Markdown" />
          </t-select>
        </t-form-item>
      </t-form-section>
    </t-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  // 定义设置接口
  interface Settings {
    autoApplyFixes: boolean
    enableExperimentalRules: boolean
    maxFileSize: number
    includeComments: boolean
    maxOptimizationTime: number
    memoryLimit: number
    parallelProcessing: boolean
    outputFormat: string
    generateReport: boolean
    reportFormat: string
    languageSpecific: {
      javascript: {
        styleGuide: string
      }
      typescript: {
        strictMode: boolean
      }
      python: {
        indentSize: string
      }
    }
  }

  // 组件属性
  interface Props {
    modelValue: Partial<Settings>
  }

  const props = defineProps<Props>()

  // 默认设置
  const defaultSettings: Settings = {
    autoApplyFixes: true,
    enableExperimentalRules: false,
    maxFileSize: 100000,
    includeComments: true,
    maxOptimizationTime: 30,
    memoryLimit: 1024,
    parallelProcessing: true,
    outputFormat: 'pretty',
    generateReport: true,
    reportFormat: 'html',
    languageSpecific: {
      javascript: {
        styleGuide: 'standard'
      },
      typescript: {
        strictMode: true
      },
      python: {
        indentSize: '4'
      }
    }
  }

  // 合并默认设置和传入的设置
  const settings = reactive<Settings>({
    ...defaultSettings,
    ...props.modelValue
  })

  // 表单验证规则
  const rules = {
    maxFileSize: [
      { required: true, message: '请输入文件大小限制' },
      { type: 'number', min: 1000, message: '文件大小不能小于1KB' }
    ],
    maxOptimizationTime: [{ type: 'number', min: 1, message: '优化时间不能小于1秒' }],
    memoryLimit: [{ type: 'number', min: 100, message: '内存限制不能小于100MB' }]
  }

  // 监听设置变化并通知父组件
  const emit = defineEmits<{
    'update:modelValue': [value: Partial<Settings>]
  }>()

  // 当设置发生变化时通知父组件
  const updateSettings = () => {
    emit('update:modelValue', { ...settings })
  }

  // 添加观察器
  Object.keys(settings).forEach(key => {
    // Vue 3.3+ 使用 watch
    watch(() => settings[key as keyof Settings], updateSettings, { deep: true })
  })
</script>

<style scoped>
  .settings-panel {
    max-height: 500px;
    overflow-y: auto;
  }

  .help-text {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
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
