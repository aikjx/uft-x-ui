/**
 * 代码优化系统组合式API
 * 提供响应式业务逻辑和状态管理
 */
import { computed, ref, watch, nextTick } from 'vue'
import type {
  CodeAnalysisResult,
  OptimizationReport,
  ProgrammingLanguage,
  OptimizationLevel,
  PerformanceMetrics
} from '@/types/code-optimization'
import { useCodeOptimizationStore } from '@/stores/code-optimization'

export interface CodeOptimizationOptions {
  enableAutoAnalysis?: boolean
  enableRealTimeMetrics?: boolean
  analysisDelay?: number
  maxCodeLength?: number
}

export function useCodeOptimization(options: CodeOptimizationOptions = {}) {
  const {
    enableAutoAnalysis = false,
    enableRealTimeMetrics = false,
    analysisDelay = 500,
    maxCodeLength = 50000
  } = options

  // Store实例
  const store = useCodeOptimizationStore()

  // 本地状态
  const isInitializing = ref(true)
  const lastAnalysisTime = ref(0)
  const error = ref<Error | null>(null)

  // 响应式计算属性
  const canAnalyze = computed(
    () =>
      store.hasCode &&
      !store.isAnalyzing &&
      !store.isOptimizing &&
      store.inputCode.length <= maxCodeLength
  )

  const canOptimize = computed(
    () => store.analysisResult !== null && !store.isAnalyzing && !store.isOptimizing
  )

  const codeTooLong = computed(() => store.inputCode.length > maxCodeLength)

  const performanceScore = computed(() => {
    const metrics = store.complexityMetrics
    if (!metrics) return 100

    // 计算性能分数 (0-100)
    let score = 100

    // 循环复杂度影响
    score -= Math.min(metrics.cyclomaticComplexity * 2, 30)

    // 认知复杂度影响
    score -= Math.min(metrics.cognitiveComplexity * 1.5, 25)

    // 可维护性指数影响
    score -= Math.max(100 - metrics.maintainabilityIndex, 0)

    return Math.max(0, Math.round(score))
  })

  const optimizationPotential = computed(() => {
    const metrics = store.complexityMetrics
    if (!metrics) return 0

    let potential = 0

    // 高复杂度代码有更大优化潜力
    if (metrics.cyclomaticComplexity > 10) potential += 20
    if (metrics.cognitiveComplexity > 15) potential += 15
    if (metrics.maintainabilityIndex < 70) potential += 25

    // 代码长度因素
    if (store.inputCode.length > 1000) potential += 10

    return Math.min(100, potential)
  })

  // 防抖分析函数
  let analysisTimeout: NodeJS.Timeout | null = null
  const debouncedAnalyze = () => {
    if (!enableAutoAnalysis) return

    if (analysisTimeout) {
      clearTimeout(analysisTimeout)
    }

    analysisTimeout = setTimeout(async () => {
      if (canAnalyze.value) {
        await performAnalysis()
      }
    }, analysisDelay)
  }

  // 分析函数
  async function performAnalysis() {
    if (!canAnalyze.value) return

    try {
      error.value = null
      const startTime = performance.now()

      await store.analyzeCode()

      lastAnalysisTime.value = performance.now() - startTime
    } catch (err) {
      console.error('代码分析失败:', err)
      error.value = err as Error
    }
  }

  // 优化函数
  async function performOptimization() {
    if (!canOptimize.value) return

    try {
      error.value = null
      await store.optimizeCode()
    } catch (err) {
      console.error('代码优化失败:', err)
      error.value = err as Error
    }
  }

  // 一键分析优化
  async function performFullOptimization() {
    if (!store.hasCode) return

    try {
      error.value = null
      await store.analyzeAndOptimize()
    } catch (err) {
      console.error('全流程优化失败:', err)
      error.value = err as Error
    }
  }

  // 更新输入代码
  function updateCode(code: string) {
    store.setInputCode(code)

    // 触发防抖分析
    if (enableAutoAnalysis) {
      debouncedAnalyze()
    }
  }

  // 更新语言
  function updateLanguage(language: ProgrammingLanguage) {
    store.setSelectedLanguage(language)

    // 如果启用自动分析，重新分析
    if (enableAutoAnalysis && store.hasCode) {
      debouncedAnalyze()
    }
  }

  // 更新优化级别
  function updateOptimizationLevel(level: OptimizationLevel) {
    store.setOptimizationLevel(level)

    // 如果有优化结果，重新优化
    if (store.analysisResult) {
      performOptimization()
    }
  }

  // 获取优化建议
  function getOptimizationSuggestions() {
    const result = store.analysisResult
    if (!result) return []

    const suggestions: string[] = []

    // 基于复杂度的建议
    if (result.complexityMetrics.cyclomaticComplexity > 10) {
      suggestions.push('考虑将复杂函数拆分为更小的函数以降低循环复杂度')
    }

    if (result.complexityMetrics.cognitiveComplexity > 15) {
      suggestions.push('简化控制流结构，减少嵌套层级以提高代码可读性')
    }

    // 基于性能指标的建议
    if (result.performanceMetrics.bottlenecks.length > 0) {
      suggestions.push('检测到性能瓶颈，建议优化相关算法或数据结构')
    }

    // 基于问题的建议
    if (result.issues.some(issue => issue.severity === 'error')) {
      suggestions.push('存在严重错误，需要优先修复')
    }

    if (result.issues.some(issue => issue.type === 'performance')) {
      suggestions.push('存在性能问题，建议进行代码重构')
    }

    return suggestions
  }

  // 导出功能
  function exportResults(format: 'json' | 'html' | 'markdown') {
    const data = store.exportOptimizationReport()
    if (!data) return null

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)

      case 'html':
        return generateHTMLReport(data)

      case 'markdown':
        return generateMarkdownReport(data)

      default:
        return data
    }
  }

  // 生成HTML报告
  function generateHTMLReport(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>代码优化报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e9ecef; border-radius: 3px; }
        .code-block { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .improvement { color: #28a745; font-weight: bold; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>代码优化报告</h1>
        <p>生成时间: ${new Date(data.timestamp).toLocaleString()}</p>
        <p>编程语言: ${data.language}</p>
        <p>优化级别: ${data.optimizationLevel}</p>
    </div>
    
    <div class="section">
        <h2>优化效果</h2>
        <div class="metric">性能提升: <span class="improvement">+${data.report.performanceImprovement}%</span></div>
        <div class="metric">执行时间: ${data.report.executionTime}ms</div>
        <div class="metric">应用规则: ${data.report.appliedRules.length}</div>
    </div>
    
    <div class="section">
        <h2>原始代码</h2>
        <div class="code-block"><pre>${data.originalCode}</pre></div>
    </div>
    
    <div class="section">
        <h2>优化后代码</h2>
        <div class="code-block"><pre>${data.optimizedCode}</pre></div>
    </div>
</body>
</html>`
  }

  // 生成Markdown报告
  function generateMarkdownReport(data: any): string {
    return `# 代码优化报告

**生成时间**: ${new Date(data.timestamp).toLocaleString()}
**编程语言**: ${data.language}
**优化级别**: ${data.optimizationLevel}

## 优化效果

- 📈 性能提升: +${data.report.performanceImprovement}%
- ⏱️ 执行时间: ${data.report.executionTime}ms
- 🔧 应用规则: ${data.report.appliedRules.length}

## 原始代码

\`\`\`${data.language}
${data.originalCode}
\`\`\`

## 优化后代码

\`\`\`${data.language}
${data.optimizedCode}
\`\`\`

## 修复的问题

${
  data.report.fixes.length > 0
    ? data.report.fixes.map((fix: any) => `- ✅ ${fix.description}`).join('\n')
    : '无问题修复'
}

## 警告信息

${
  data.report.warnings.length > 0
    ? data.report.warnings.map((warning: any) => `- ⚠️ ${warning.message}`).join('\n')
    : '无警告'
}`
  }

  // 监听器
  watch(() => store.inputCode, debouncedAnalyze)
  watch(() => store.selectedLanguage, debouncedAnalyze)

  // 初始化
  nextTick(() => {
    store.initialize()
    isInitializing.value = false
  })

  return {
    // 状态
    isInitializing,
    error,
    lastAnalysisTime,

    // 计算属性
    canAnalyze,
    canOptimize,
    codeTooLong,
    performanceScore,
    optimizationPotential,

    // 方法
    performAnalysis,
    performOptimization,
    performFullOptimization,
    updateCode,
    updateLanguage,
    updateOptimizationLevel,
    getOptimizationSuggestions,
    exportResults
  }
}

// 工具函数
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatComplexityLevel(complexity: number): string {
  if (complexity <= 5) return '简单'
  if (complexity <= 10) return '中等'
  if (complexity <= 20) return '复杂'
  return '极复杂'
}

export function getPerformanceGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: '#28a745' }
  if (score >= 80) return { grade: 'B', color: '#17a2b8' }
  if (score >= 70) return { grade: 'C', color: '#ffc107' }
  if (score >= 60) return { grade: 'D', color: '#fd7e14' }
  return { grade: 'F', color: '#dc3545' }
}
