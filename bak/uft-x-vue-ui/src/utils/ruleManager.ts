// 规则管理系统 - 支持自定义优化规则配置
import {
  OptimizationRule,
  RuleCondition,
  RuleLibrary,
  ProgrammingLanguage,
  IssueSeverity,
  IssueCategory
} from '../types/code-optimization'

/**
 * 规则管理器类
 */
export class RuleManager {
  private ruleLibrary: RuleLibrary

  constructor() {
    this.ruleLibrary = {
      builtIn: [],
      custom: [],
      disabled: []
    }
    this.loadDefaultRules()
  }

  /**
   * 加载默认规则
   */
  private loadDefaultRules(): void {
    this.ruleLibrary.builtIn = this.getBuiltInRules()
  }

  /**
   * 获取内置规则
   */
  private getBuiltInRules(): OptimizationRule[] {
    return [
      {
        id: 'unused-variable',
        name: '检测未使用变量',
        description: '检测并删除未使用的变量声明',
        category: IssueCategory.BEST_PRACTICE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 1,
        conditions: [
          {
            type: 'ast_pattern',
            pattern: 'VariableDeclarator',
            parameters: { checkReferences: true }
          }
        ]
      },
      {
        id: 'const-first',
        name: '优先使用const',
        description: '将可以改为const的let声明改为const',
        category: IssueCategory.BEST_PRACTICE,
        severity: IssueSeverity.INFO,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 2,
        conditions: [
          {
            type: 'ast_pattern',
            pattern: 'VariableDeclaration[kind="let"]',
            parameters: { allowReassignment: false }
          }
        ]
      },
      {
        id: 'complex-function',
        name: '函数复杂度检查',
        description: '检测函数复杂度是否过高',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 3,
        conditions: [
          {
            type: 'complexity_threshold',
            pattern: 'cyclomatic_complexity',
            parameters: { threshold: 10 }
          }
        ]
      },
      {
        id: 'long-function',
        name: '函数长度检查',
        description: '检测函数行数是否过长',
        category: IssueCategory.CODE_STYLE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 4,
        conditions: [
          {
            type: 'length_threshold',
            pattern: 'function_length',
            parameters: { threshold: 50 }
          }
        ]
      },
      {
        id: 'nested-loop',
        name: '嵌套循环检查',
        description: '检测嵌套循环是否过深',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 5,
        conditions: [
          {
            type: 'depth_threshold',
            pattern: 'loop_depth',
            parameters: { threshold: 3 }
          }
        ]
      }
    ]
  }

  /**
   * 获取所有规则
   */
  getAllRules(): OptimizationRule[] {
    return [...this.ruleLibrary.builtIn, ...this.ruleLibrary.custom]
  }

  /**
   * 获取启用的规则
   */
  getEnabledRules(): OptimizationRule[] {
    return this.getAllRules().filter(
      rule => rule.enabled && !this.ruleLibrary.disabled.includes(rule.id)
    )
  }

  /**
   * 根据语言获取规则
   */
  getRulesByLanguage(language: ProgrammingLanguage): OptimizationRule[] {
    return this.getEnabledRules().filter(rule => rule.language === language)
  }

  /**
   * 根据类别获取规则
   */
  getRulesByCategory(category: IssueCategory): OptimizationRule[] {
    return this.getEnabledRules().filter(rule => rule.category === category)
  }

  /**
   * 添加自定义规则
   */
  addCustomRule(rule: OptimizationRule): void {
    // 检查规则ID是否唯一
    if (this.getAllRules().some(r => r.id === rule.id)) {
      throw new Error(`规则ID ${rule.id} 已存在`)
    }

    this.ruleLibrary.custom.push(rule)
  }

  /**
   * 更新规则
   */
  updateRule(ruleId: string, updates: Partial<OptimizationRule>): void {
    const rule = this.findRuleById(ruleId)
    if (!rule) {
      throw new Error(`规则 ${ruleId} 不存在`)
    }

    Object.assign(rule, updates)
  }

  /**
   * 删除规则
   */
  deleteRule(ruleId: string): void {
    const index = this.ruleLibrary.custom.findIndex(rule => rule.id === ruleId)
    if (index !== -1) {
      this.ruleLibrary.custom.splice(index, 1)
    } else {
      throw new Error(`规则 ${ruleId} 不存在或为内置规则`)
    }
  }

  /**
   * 启用/禁用规则
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.findRuleById(ruleId)
    if (!rule) {
      throw new Error(`规则 ${ruleId} 不存在`)
    }

    rule.enabled = enabled

    // 更新禁用列表
    if (enabled) {
      this.ruleLibrary.disabled = this.ruleLibrary.disabled.filter(id => id !== ruleId)
    } else {
      if (!this.ruleLibrary.disabled.includes(ruleId)) {
        this.ruleLibrary.disabled.push(ruleId)
      }
    }
  }

  /**
   * 导入规则库
   */
  importRules(rules: OptimizationRule[]): void {
    rules.forEach(rule => {
      try {
        this.addCustomRule(rule)
      } catch (error) {
        console.warn(`导入规则失败: ${rule.id}`, error)
      }
    })
  }

  /**
   * 导出规则库
   */
  exportRules(): OptimizationRule[] {
    return [...this.ruleLibrary.custom]
  }

  /**
   * 验证规则
   */
  validateRule(rule: OptimizationRule): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!rule.id || rule.id.trim() === '') {
      errors.push('规则ID不能为空')
    }

    if (!rule.name || rule.name.trim() === '') {
      errors.push('规则名称不能为空')
    }

    if (!rule.description || rule.description.trim() === '') {
      errors.push('规则描述不能为空')
    }

    if (rule.priority < 1 || rule.priority > 100) {
      errors.push('优先级必须在1-100之间')
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('规则必须包含至少一个条件')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 搜索规则
   */
  searchRules(query: string): OptimizationRule[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllRules().filter(
      rule =>
        rule.id.toLowerCase().includes(lowerQuery) ||
        rule.name.toLowerCase().includes(lowerQuery) ||
        rule.description.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 根据ID查找规则
   */
  private findRuleById(ruleId: string): OptimizationRule | undefined {
    return this.getAllRules().find(rule => rule.id === ruleId)
  }

  /**
   * 获取规则统计信息
   */
  getRuleStatistics(): {
    total: number
    builtIn: number
    custom: number
    enabled: number
    disabled: number
    byCategory: Record<string, number>
    byLanguage: Record<string, number>
  } {
    const allRules = this.getAllRules()
    const enabledRules = this.getEnabledRules()

    const byCategory: Record<string, number> = {}
    const byLanguage: Record<string, number> = {}

    allRules.forEach(rule => {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1
      byLanguage[rule.language] = (byLanguage[rule.language] || 0) + 1
    })

    return {
      total: allRules.length,
      builtIn: this.ruleLibrary.builtIn.length,
      custom: this.ruleLibrary.custom.length,
      enabled: enabledRules.length,
      disabled: allRules.length - enabledRules.length,
      byCategory,
      byLanguage
    }
  }

  /**
   * 批量更新规则优先级
   */
  updateRulePriorities(priorityUpdates: Array<{ ruleId: string; priority: number }>): void {
    priorityUpdates.forEach(({ ruleId, priority }) => {
      const rule = this.findRuleById(ruleId)
      if (rule && priority >= 1 && priority <= 100) {
        rule.priority = priority
      }
    })
  }

  /**
   * 重置为默认规则
   */
  resetToDefaults(): void {
    this.ruleLibrary.custom = []
    this.ruleLibrary.disabled = []
    this.ruleLibrary.builtIn.forEach(rule => {
      rule.enabled = true
    })
  }
}

/**
 * 规则条件评估器
 */
export class RuleConditionEvaluator {
  /**
   * 评估规则条件
   */
  static evaluate(condition: RuleCondition, ast: any, code: string): boolean {
    switch (condition.type) {
      case 'ast_pattern':
        return this.evaluateAstPattern(condition, ast)
      case 'complexity_threshold':
        return this.evaluateComplexityThreshold(condition, code)
      case 'length_threshold':
        return this.evaluateLengthThreshold(condition, code)
      case 'depth_threshold':
        return this.evaluateDepthThreshold(condition, ast)
      default:
        return false
    }
  }

  /**
   * 评估AST模式
   */
  private static evaluateAstPattern(condition: RuleCondition, ast: any): boolean {
    // 简化的AST模式匹配实现
    // 实际实现需要更复杂的AST遍历和模式匹配
    return true
  }

  /**
   * 评估复杂度阈值
   */
  private static evaluateComplexityThreshold(condition: RuleCondition, code: string): boolean {
    // 简化的复杂度评估
    const threshold = condition.parameters?.threshold || 10
    const complexity = this.calculateCyclomaticComplexity(code)
    return complexity > threshold
  }

  /**
   * 评估长度阈值
   */
  private static evaluateLengthThreshold(condition: RuleCondition, code: string): boolean {
    const threshold = condition.parameters?.threshold || 50
    const lines = code.split('\n').length
    return lines > threshold
  }

  /**
   * 评估深度阈值
   */
  private static evaluateDepthThreshold(condition: RuleCondition, ast: any): boolean {
    const threshold = condition.parameters?.threshold || 3
    const depth = this.calculateMaxDepth(ast)
    return depth > threshold
  }

  /**
   * 计算循环复杂度
   */
  private static calculateCyclomaticComplexity(code: string): number {
    // 简化的循环复杂度计算
    const patterns = ['if', 'for', 'while', 'case', 'catch', '&&', '||']
    return patterns.reduce((count, pattern) => count + (code.split(pattern).length - 1), 1)
  }

  /**
   * 计算最大深度
   */
  private static calculateMaxDepth(ast: any): number {
    // 简化的深度计算
    return 1
  }
}

/**
 * 规则模板生成器
 */
export class RuleTemplateGenerator {
  /**
   * 获取规则模板
   */
  static getTemplate(language: ProgrammingLanguage, category: IssueCategory): OptimizationRule {
    const baseTemplate: OptimizationRule = {
      id: `custom-${Date.now()}`,
      name: '自定义规则',
      description: '自定义优化规则',
      category,
      severity: IssueSeverity.INFO,
      language,
      enabled: true,
      priority: 50,
      conditions: []
    }

    // 根据类别添加特定模板
    switch (category) {
      case IssueCategory.PERFORMANCE:
        baseTemplate.conditions.push({
          type: 'complexity_threshold',
          pattern: 'performance_check',
          parameters: { threshold: 10 }
        })
        break
      case IssueCategory.MEMORY:
        baseTemplate.conditions.push({
          type: 'ast_pattern',
          pattern: 'memory_leak_pattern',
          parameters: { checkAllocations: true }
        })
        break
      case IssueCategory.CODE_STYLE:
        baseTemplate.conditions.push({
          type: 'length_threshold',
          pattern: 'style_check',
          parameters: { threshold: 30 }
        })
        break
    }

    return baseTemplate
  }

  /**
   * 生成常见规则模板
   */
  static getCommonTemplates(): OptimizationRule[] {
    return [
      {
        id: 'template-performance-1',
        name: '性能优化模板',
        description: '检测性能瓶颈的常见模式',
        category: IssueCategory.PERFORMANCE,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 50,
        conditions: [
          {
            type: 'complexity_threshold',
            pattern: 'high_complexity',
            parameters: { threshold: 15 }
          }
        ]
      },
      {
        id: 'template-memory-1',
        name: '内存优化模板',
        description: '检测内存泄漏和优化机会',
        category: IssueCategory.MEMORY,
        severity: IssueSeverity.WARNING,
        language: ProgrammingLanguage.JAVASCRIPT,
        enabled: true,
        priority: 50,
        conditions: [
          {
            type: 'ast_pattern',
            pattern: 'potential_memory_leak',
            parameters: { checkClosures: true }
          }
        ]
      }
    ]
  }
}
