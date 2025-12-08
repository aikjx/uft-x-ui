// 代码优化系统类型定义

export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  GO = 'go',
  RUST = 'rust'
}

export enum OptimizationLevel {
  SAFE = 'safe',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

export enum IssueSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUGGESTION = 'suggestion'
}

export enum IssueCategory {
  PERFORMANCE = 'performance',
  MEMORY = 'memory',
  SECURITY = 'security',
  CODE_STYLE = 'code_style',
  BEST_PRACTICE = 'best_practice',
  BUG = 'bug'
}

export interface CodePosition {
  line: number
  column: number
  endLine?: number
  endColumn?: number
}

export interface CodeIssue {
  id: string
  severity: IssueSeverity
  category: IssueCategory
  message: string
  position: CodePosition
  suggestion?: string
  fixedCode?: string
  confidence: number // 0-1
}

export interface OptimizationRule {
  id: string
  name: string
  description: string
  category: IssueCategory
  severity: IssueSeverity
  language: ProgrammingLanguage
  enabled: boolean
  priority: number
  conditions: RuleCondition[]
}

export interface RuleCondition {
  type: string
  pattern: string
  parameters?: Record<string, any>
}

export interface OptimizationResult {
  originalCode: string
  optimizedCode: string
  issues: CodeIssue[]
  performanceMetrics: {
    complexity: number
    linesOfCode: number
    estimatedExecutionTime: number
    memoryUsage: number
  }
  optimizationSummary: {
    totalIssues: number
    fixedIssues: number
    performanceImprovement: number
    readabilityScore: number
  }
  appliedRules: string[]
}

export interface CodeMetrics {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  maintainabilityIndex: number
  halsteadMetrics: {
    volume: number
    difficulty: number
    effort: number
  }
}

export interface UserPreferences {
  optimizationLevel: OptimizationLevel
  autoApplyFixes: boolean
  enableExperimentalRules: boolean
  maxFileSize: number
  includeComments: boolean
  languageSpecific: {
    [language: string]: {
      styleGuide: string
      formattingRules: Record<string, any>
    }
  }
}

export interface CodeAnalysisReport {
  timestamp: Date
  fileInfo: {
    name: string
    language: ProgrammingLanguage
    size: number
  }
  metrics: CodeMetrics
  optimizationResults: OptimizationResult
  executionTime: number
}

export interface PerformanceBenchmark {
  baseline: {
    executionTime: number
    memoryUsage: number
    cpuUsage: number
  }
  optimized: {
    executionTime: number
    memoryUsage: number
    cpuUsage: number
  }
  improvement: {
    executionTime: number
    memoryUsage: number
    cpuUsage: number
  }
}

export interface CodeComparison {
  original: {
    code: string
    metrics: CodeMetrics
  }
  optimized: {
    code: string
    metrics: CodeMetrics
  }
  differences: CodeDifference[]
}

export interface CodeDifference {
  type: 'added' | 'removed' | 'modified'
  original: string
  optimized: string
  position: CodePosition
}

export interface RuleLibrary {
  builtIn: OptimizationRule[]
  custom: OptimizationRule[]
  disabled: string[]
}

export interface CodeOptimizerConfig {
  language: ProgrammingLanguage
  preferences: UserPreferences
  rules: RuleLibrary
  maxAnalysisTime: number
  includePerformanceTesting: boolean
}