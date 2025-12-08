// 智能代码优化引擎
import { parse } from '@babel/parser'
import { traverse } from '@babel/traverse'
import { generate } from '@babel/generator'
import * as t from '@babel/types'
import { 
  ProgrammingLanguage, 
  OptimizationResult, 
  CodeIssue, 
  IssueSeverity, 
  IssueCategory,
  CodePosition,
  OptimizationRule,
  UserPreferences,
  OptimizationLevel
} from '../types/code-optimization'
import { CodeParser, CodeParserFactory } from './codeParser'

/**
 * 智能代码优化引擎类
 */
export class CodeOptimizer {
  private parser: CodeParser
  private preferences: UserPreferences
  private rules: OptimizationRule[]

  constructor(
    language: ProgrammingLanguage,
    preferences: UserPreferences,
    rules: OptimizationRule[]
  ) {
    this.parser = new CodeParser(language)
    this.preferences = preferences
    this.rules = rules.filter(rule => rule.enabled)
  }

  /**
   * 优化代码
   */
  async optimize(code: string): Promise<OptimizationResult> {
    const startTime = performance.now()
    
    try {
      // 解析代码
      const ast = this.parser.parseCode(code)
      
      // 检测问题
      const issues = this.parser.detectIssues(code)
      
      // 应用优化规则
      const optimizedCode = this.applyOptimizations(code, ast, issues)
      
      // 计算性能指标
      const metrics = this.calculatePerformanceMetrics(code, optimizedCode)
      
      // 生成优化总结
      const summary = this.generateOptimizationSummary(issues, metrics)
      
      const executionTime = performance.now() - startTime
      
      return {
        originalCode: code,
        optimizedCode,
        issues,
        performanceMetrics: metrics,
        optimizationSummary: summary,
        appliedRules: this.getAppliedRuleIds()
      }
    } catch (error) {
      throw new Error(`代码优化失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 应用优化规则
   */
  private applyOptimizations(code: string, ast: any, issues: CodeIssue[]): string {
    let optimizedAst = ast
    
    // 根据优化级别应用不同的规则
    const applicableRules = this.getApplicableRules()
    
    // 遍历AST并应用优化
    traverse(optimizedAst, {
      // 优化变量声明
      VariableDeclaration(path) {
        this.optimizeVariableDeclarations(path, applicableRules)
      },
      
      // 优化循环
      ForStatement(path) {
        this.optimizeLoops(path, applicableRules)
      },
      
      // 优化函数调用
      CallExpression(path) {
        this.optimizeFunctionCalls(path, applicableRules)
      },
      
      // 优化条件语句
      IfStatement(path) {
        this.optimizeConditionals(path, applicableRules)
      },
      
      // 优化字符串操作
      StringLiteral(path) {
        this.optimizeStrings(path, applicableRules)
      }
    })

    // 生成优化后的代码
    const result = generate(optimizedAst, {
      retainLines: true,
      concise: false
    })

    return result.code
  }

  /**
   * 优化变量声明
   */
  private optimizeVariableDeclarations(path: any, rules: OptimizationRule[]) {
    const node = path.node
    
    // 应用const优先规则
    if (this.shouldApplyRule('const-first', rules)) {
      if (node.kind === 'let' && !node.declarations.some((decl: any) => decl.init === null)) {
        // 如果可以，将let改为const
        if (this.canBeConst(node)) {
          node.kind = 'const'
          this.markRuleApplied('const-first')
        }
      }
    }
    
    // 应用变量合并规则
    if (this.shouldApplyRule('variable-merge', rules)) {
      this.mergeVariableDeclarations(path)
    }
    
    // 应用未使用变量删除规则
    if (this.shouldApplyRule('remove-unused-variables', rules)) {
      this.removeUnusedVariables(path)
    }
  }

  /**
   * 优化循环
   */
  private optimizeLoops(path: any, rules: OptimizationRule[]) {
    const node = path.node
    
    // 应用循环展开规则（激进优化）
    if (this.preferences.optimizationLevel === OptimizationLevel.AGGRESSIVE && 
        this.shouldApplyRule('loop-unrolling', rules)) {
      this.unrollSmallLoops(path)
    }
    
    // 应用循环变量提取规则
    if (this.shouldApplyRule('loop-variable-extraction', rules)) {
      this.extractLoopVariables(path)
    }
    
    // 应用提前终止规则
    if (this.shouldApplyRule('early-termination', rules)) {
      this.addEarlyTermination(path)
    }
  }

  /**
   * 优化函数调用
   */
  private optimizeFunctionCalls(path: any, rules: OptimizationRule[]) {
    const node = path.node
    
    // 应用内联函数规则
    if (this.shouldApplyRule('function-inlining', rules)) {
      this.inlineSmallFunctions(path)
    }
    
    // 应用尾调用优化
    if (this.shouldApplyRule('tail-call-optimization', rules)) {
      this.optimizeTailCalls(path)
    }
    
    // 应用函数柯里化优化
    if (this.shouldApplyRule('currying-optimization', rules)) {
      this.optimizeCurrying(path)
    }
  }

  /**
   * 优化条件语句
   */
  private optimizeConditionals(path: any, rules: OptimizationRule[]) {
    const node = path.node
    
    // 应用条件简化规则
    if (this.shouldApplyRule('conditional-simplification', rules)) {
      this.simplifyConditionals(path)
    }
    
    // 应用短路评估优化
    if (this.shouldApplyRule('short-circuit-optimization', rules)) {
      this.optimizeShortCircuit(path)
    }
    
    // 应用switch优化
    if (this.shouldApplyRule('switch-optimization', rules) && t.isSwitchStatement(node)) {
      this.optimizeSwitchStatements(path)
    }
  }

  /**
   * 优化字符串操作
   */
  private optimizeStrings(path: any, rules: OptimizationRule[]) {
    const node = path.node
    
    // 应用字符串模板优化
    if (this.shouldApplyRule('string-template-optimization', rules)) {
      this.convertToTemplateLiterals(path)
    }
    
    // 应用字符串连接优化
    if (this.shouldApplyRule('string-concatenation-optimization', rules)) {
      this.optimizeStringConcatenation(path)
    }
  }

  /**
   * 检查是否应该应用规则
   */
  private shouldApplyRule(ruleId: string, rules: OptimizationRule[]): boolean {
    return rules.some(rule => rule.id === ruleId && rule.enabled)
  }

  /**
   * 标记规则已应用
   */
  private markRuleApplied(ruleId: string): void {
    // 记录应用的规则，用于报告
  }

  /**
   * 获取应用的规则ID
   */
  private getAppliedRuleIds(): string[] {
    return this.rules
      .filter(rule => rule.enabled)
      .map(rule => rule.id)
  }

  /**
   * 检查变量是否可以改为const
   */
  private canBeConst(node: any): boolean {
    // 简化实现：检查是否所有变量都有初始值
    return node.declarations.every((decl: any) => decl.init !== null)
  }

  /**
   * 合并变量声明
   */
  private mergeVariableDeclarations(path: any): void {
    // 实现变量声明合并逻辑
  }

  /**
   * 删除未使用的变量
   */
  private removeUnusedVariables(path: any): void {
    // 实现未使用变量删除逻辑
  }

  /**
   * 展开小循环
   */
  private unrollSmallLoops(path: any): void {
    // 实现循环展开逻辑
  }

  /**
   * 提取循环变量
   */
  private extractLoopVariables(path: any): void {
    // 实现循环变量提取逻辑
  }

  /**
   * 添加提前终止
   */
  private addEarlyTermination(path: any): void {
    // 实现提前终止逻辑
  }

  /**
   * 内联小函数
   */
  private inlineSmallFunctions(path: any): void {
    // 实现函数内联逻辑
  }

  /**
   * 优化尾调用
   */
  private optimizeTailCalls(path: any): void {
    // 实现尾调用优化逻辑
  }

  /**
   * 优化柯里化
   */
  private optimizeCurrying(path: any): void {
    // 实现柯里化优化逻辑
  }

  /**
   * 简化条件语句
   */
  private simplifyConditionals(path: any): void {
    // 实现条件简化逻辑
  }

  /**
   * 优化短路评估
   */
  private optimizeShortCircuit(path: any): void {
    // 实现短路评估优化逻辑
  }

  /**
   * 优化switch语句
   */
  private optimizeSwitchStatements(path: any): void {
    // 实现switch优化逻辑
  }

  /**
   * 转换为模板字符串
   */
  private convertToTemplateLiterals(path: any): void {
    // 实现模板字符串转换逻辑
  }

  /**
   * 优化字符串连接
   */
  private optimizeStringConcatenation(path: any): void {
    // 实现字符串连接优化逻辑
  }

  /**
   * 获取适用的规则
   */
  private getApplicableRules(): OptimizationRule[] {
    return this.rules.filter(rule => {
      // 根据优化级别过滤规则
      switch (this.preferences.optimizationLevel) {
        case OptimizationLevel.SAFE:
          return rule.severity !== IssueSeverity.ERROR
        case OptimizationLevel.MODERATE:
          return rule.severity !== IssueSeverity.ERROR && rule.category !== IssueCategory.SECURITY
        case OptimizationLevel.AGGRESSIVE:
          return true
        default:
          return rule.severity !== IssueSeverity.ERROR
      }
    })
  }

  /**
   * 计算性能指标
   */
  private calculatePerformanceMetrics(originalCode: string, optimizedCode: string): any {
    const originalMetrics = this.parser.calculateMetrics(originalCode)
    const optimizedMetrics = this.parser.calculateMetrics(optimizedCode)
    
    // 估计执行时间改进（基于复杂度降低）
    const complexityImprovement = (originalMetrics.cyclomaticComplexity - optimizedMetrics.cyclomaticComplexity) / 
                                  originalMetrics.cyclomaticComplexity
    
    return {
      complexity: optimizedMetrics.cyclomaticComplexity,
      linesOfCode: optimizedCode.split('\n').length,
      estimatedExecutionTime: Math.max(0.1, 1 - complexityImprovement * 0.5), // 简化的估计
      memoryUsage: Math.max(0.5, 1 - complexityImprovement * 0.3) // 简化的估计
    }
  }

  /**
   * 生成优化总结
   */
  private generateOptimizationSummary(issues: CodeIssue[], metrics: any): any {
    const fixedIssues = issues.filter(issue => issue.severity === IssueSeverity.ERROR || 
                                              issue.severity === IssueSeverity.WARNING)
    
    return {
      totalIssues: issues.length,
      fixedIssues: fixedIssues.length,
      performanceImprovement: Math.max(0, (1 - metrics.estimatedExecutionTime) * 100),
      readabilityScore: Math.max(0, Math.min(100, metrics.complexity > 10 ? 80 : 95))
    }
  }
}

/**
 * 代码优化器工厂
 */
export class CodeOptimizerFactory {
  static createOptimizer(
    language: ProgrammingLanguage,
    preferences: UserPreferences,
    rules: OptimizationRule[]
  ): CodeOptimizer {
    return new CodeOptimizer(language, preferences, rules)
  }

  /**
   * 获取默认优化规则
   */
  static getDefaultRules(): OptimizationRule[] {
    return [
      {
        id: 'const-first',
        name: '优先使用const',
        description: '将可以改为const的let声明改为const',
        category: IssueCategory.BEST_PRACTICE,
        severity: IssueSeverity.INFO,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 1,
        conditions: []
      },
      {
        id: 'variable-merge',
        name: '合并变量声明',
        description: '将连续的变量声明合并为一个声明',
        category: IssueCategory.CODE_STYLE,
        severity: IssueSeverity.INFO,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 2,
        conditions: []
      },
      {
        id: 'remove-unused-variables',
        name: '删除未使用变量',
        description: '删除未使用的变量声明',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 3,
        conditions: []
      },
      {
        id: 'function-inlining',
        name: '函数内联',
        description: '将小函数内联到调用处',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.INFO,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: false, // 默认禁用，需要激进优化
        priority: 4,
        conditions: []
      },
      {
        id: 'loop-unrolling',
        name: '循环展开',
        description: '将小循环展开为重复代码',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.INFO,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: false, // 默认禁用，需要激进优化
        priority: 5,
        conditions: []
      }
    ]
  }

  /**
   * 获取默认用户偏好
   */
  static getDefaultPreferences(): UserPreferences {
    return {
      optimizationLevel: OptimizationLevel.MODERATE,
      autoApplyFixes: true,
      enableExperimentalRules: false,
      maxFileSize: 100000, // 100KB
      includeComments: true,
      languageSpecific: {
        javascript: {
          styleGuide: 'standard',
          formattingRules: {}
        }
      }
    }
  }
}