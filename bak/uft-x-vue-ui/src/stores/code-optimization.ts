/**
 * 代码优化系统状态管理
 * 简化版本 - 无外部依赖
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  ProgrammingLanguage,
  type CodeMetrics,
  type OptimizationRule,
  type UserPreferences,
  type CodeIssue,
  type OptimizationResult
} from '@/types/code-optimization'

export interface CodeOptimizationState {
  inputCode: string
  selectedLanguage: ProgrammingLanguage
  optimizationLevel: 'safe' | 'moderate' | 'aggressive'
  customRules: OptimizationRule[]
  isAnalyzing: boolean
  analysisResult: OptimizationResult | null
  isOptimizing: boolean
  optimizedCode: string
  optimizationReport: OptimizationResult | null
  activeTab: string
  showSettings: boolean
  showRuleManager: boolean
  userPreferences: UserPreferences
}

export const useCodeOptimizationStore = defineStore('codeOptimization', () => {
  // 状态定义
  const state = ref<CodeOptimizationState>({
    inputCode: '',
    selectedLanguage: ProgrammingLanguage.JAVASCRIPT,
    optimizationLevel: 'safe',
    customRules: [],
    isAnalyzing: false,
    analysisResult: null,
    isOptimizing: false,
    optimizedCode: '',
    optimizationReport: null,
    activeTab: 'analysis',
    showSettings: false,
    showRuleManager: false,
    userPreferences: {
      optimizationLevel: 'safe' as any,
      autoApplyFixes: false,
      enableExperimentalRules: false,
      maxFileSize: 50000,
      includeComments: true,
      languageSpecific: {}
    }
  })

  // 计算属性
  const hasCode = computed(() => state.value.inputCode.trim().length > 0)

  const canAnalyze = computed(
    () => hasCode.value && !state.value.isAnalyzing && !state.value.isOptimizing
  )

  const canOptimize = computed(
    () =>
      hasCode.value &&
      state.value.analysisResult !== null &&
      !state.value.isAnalyzing &&
      !state.value.isOptimizing
  )

  const hasOptimizationResult = computed(
    () => state.value.optimizedCode.trim().length > 0 && state.value.optimizationReport !== null
  )

  // Actions
  async function analyzeCode() {
    if (!state.value.inputCode.trim()) return

    try {
      state.value.isAnalyzing = true
      state.value.analysisResult = null

      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 创建模拟分析结果
      const mockResult: OptimizationResult = {
        originalCode: state.value.inputCode,
        optimizedCode: state.value.inputCode,
        issues: [],
        performanceMetrics: {
          complexity: 10,
          linesOfCode: state.value.inputCode.split('\n').length,
          estimatedExecutionTime: 100,
          memoryUsage: 1024
        },
        optimizationSummary: {
          totalIssues: 0,
          fixedIssues: 0,
          performanceImprovement: 0,
          readabilityScore: 85
        },
        appliedRules: []
      }

      state.value.analysisResult = mockResult
    } catch (error) {
      console.error('代码分析失败:', error)
    } finally {
      state.value.isAnalyzing = false
    }
  }

  async function optimizeCode() {
    if (!state.value.analysisResult) return

    try {
      state.value.isOptimizing = true

      // 模拟优化过程
      await new Promise(resolve => setTimeout(resolve, 1500))

      state.value.optimizedCode = state.value.inputCode
      state.value.optimizationReport = state.value.analysisResult
    } catch (error) {
      console.error('代码优化失败:', error)
    } finally {
      state.value.isOptimizing = false
    }
  }

  function setInputCode(code: string) {
    state.value.inputCode = code
    state.value.analysisResult = null
    state.value.optimizedCode = ''
    state.value.optimizationReport = null
  }

  function setLanguage(language: ProgrammingLanguage) {
    state.value.selectedLanguage = language
  }

  function setOptimizationLevel(level: 'safe' | 'moderate' | 'aggressive') {
    state.value.optimizationLevel = level
  }

  function clearResults() {
    state.value.analysisResult = null
    state.value.optimizedCode = ''
    state.value.optimizationReport = null
  }

  function reset() {
    state.value.inputCode = ''
    state.value.selectedLanguage = ProgrammingLanguage.JAVASCRIPT
    state.value.optimizationLevel = 'safe'
    clearResults()
  }

  return {
    // State
    state,

    // Computed
    hasCode,
    canAnalyze,
    canOptimize,
    hasOptimizationResult,

    // Actions
    analyzeCode,
    optimizeCode,
    setInputCode,
    setLanguage,
    setOptimizationLevel,
    clearResults,
    reset
  }
})
