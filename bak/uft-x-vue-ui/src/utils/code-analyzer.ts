/**
 * 企业级代码分析器
 * 提供深度代码分析功能
 */
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import type {
  CodeAnalysisResult,
  ProgrammingLanguage,
  CodeIssue,
  CodeComplexityMetrics,
  PerformanceMetrics,
  OptimizationSuggestion
} from '@/types/code-optimization'

export interface AnalysisOptions {
  strict?: boolean
  enableAdvancedMetrics?: boolean
  enableSecurityAnalysis?: boolean
  enablePerformanceProfiling?: boolean
}

export class CodeAnalyzer {
  private options: AnalysisOptions
  private startTime: number = 0

  constructor(options: AnalysisOptions = {}) {
    this.options = {
      strict: false,
      enableAdvancedMetrics: true,
      enableSecurityAnalysis: true,
      enablePerformanceProfiling: true,
      ...options
    }
  }

  /**
   * 完整代码分析
   */
  async analyzeCode(
    code: string,
    language: ProgrammingLanguage = 'javascript'
  ): Promise<CodeAnalysisResult> {
    this.startTime = performance.now()

    try {
      // 解析AST
      const ast = await this.parseCode(code, language)

      // 并行执行各种分析
      const [complexityMetrics, issues, performanceMetrics, securityIssues] = await Promise.all([
        this.calculateComplexityMetrics(ast, code),
        this.detectIssues(ast, language),
        this.analyzePerformance(ast, code),
        this.options.enableSecurityAnalysis ? this.analyzeSecurity(ast) : Promise.resolve([])
      ])

      // 合并所有问题
      const allIssues = [...issues, ...securityIssues]

      const analysisTime = performance.now() - this.startTime

      return {
        language,
        originalCode: code,
        ast,
        complexityMetrics,
        issues: allIssues,
        performanceMetrics,
        analysisTime,
        lineNumber: code.split('\n').length
      }
    } catch (error) {
      throw new Error(`代码分析失败: ${error}`)
    }
  }

  /**
   * 解析代码为AST
   */
  private async parseCode(code: string, language: ProgrammingLanguage): Promise<t.File> {
    const parseOptions = this.getParseOptions(language)

    try {
      return parser.parse(code, parseOptions) as t.File
    } catch (error) {
      throw new Error(`语法解析错误: ${error}`)
    }
  }

  /**
   * 获取解析选项
   */
  private getParseOptions(language: ProgrammingLanguage): any {
    const baseOptions = {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining'
      ] as const
    }

    switch (language) {
      case 'typescript':
        return {
          ...baseOptions,
          plugins: [...baseOptions.plugins, 'typescript', 'decorators-legacy', 'classProperties']
        }

      case 'jsx':
      case 'react':
        return {
          ...baseOptions,
          plugins: [...baseOptions.plugins, 'jsx', 'typescript']
        }

      default:
        return baseOptions
    }
  }

  /**
   * 计算复杂度指标
   */
  private async calculateComplexityMetrics(
    ast: t.File,
    code: string
  ): Promise<CodeComplexityMetrics> {
    let cyclomaticComplexity = 1 // 基础复杂度
    let cognitiveComplexity = 0
    let totalLinesOfCode = 0
    let totalStatements = 0
    let totalFunctions = 0
    let maxNestedDepth = 0
    let currentDepth = 0

    // 分析AST节点
    traverse(ast, {
      // 计算循环复杂度
      FunctionDeclaration: () => {
        totalFunctions++
        cyclomaticComplexity++
      },
      FunctionExpression: () => {
        totalFunctions++
        cyclomaticComplexity++
      },
      ArrowFunctionExpression: () => {
        totalFunctions++
        cyclomaticComplexity++
      },

      // 控制流语句
      IfStatement: () => {
        cyclomaticComplexity++
        cognitiveComplexity += currentDepth + 1
      },
      WhileStatement: () => {
        cyclomaticComplexity++
        cognitiveComplexity += currentDepth + 1
      },
      ForStatement: () => {
        cyclomaticComplexity++
        cognitiveComplexity += currentDepth + 1
      },
      SwitchCase: () => {
        cyclomaticComplexity++
        cognitiveComplexity += currentDepth + 1
      },
      ConditionalExpression: () => {
        cyclomaticComplexity++
        cognitiveComplexity += currentDepth + 1
      },
      LogicalExpression: () => {
        cognitiveComplexity += 1
      },

      // 语句计数
      Statement: () => {
        totalStatements++
      },

      // 嵌套深度
      BlockStatement: {
        enter: () => {
          currentDepth++
          maxNestedDepth = Math.max(maxNestedDepth, currentDepth)
        },
        exit: () => {
          currentDepth--
        }
      }
    })

    // 计算代码行数
    const lines = code.split('\n')
    totalLinesOfCode = lines.filter(
      line => line.trim() !== '' && !line.trim().startsWith('//')
    ).length

    // 计算可维护性指数（Microsoft公式）
    const maintainabilityIndex = Math.max(
      0,
      Math.round(
        171 -
          5.2 * Math.log(totalLinesOfCode) -
          0.23 * cyclomaticComplexity -
          16.2 * Math.log(totalStatements)
      )
    )

    // 计算技术债务比率
    const technicalDebtRatio = Math.round((cyclomaticComplexity / totalFunctions) * 10)

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode: totalLinesOfCode,
      numberOfFunctions: totalFunctions,
      maxNestedDepth,
      maintainabilityIndex,
      technicalDebtRatio,
      duplicatedLines: this.detectCodeDuplication(ast),
      codeDensity: Math.round((totalStatements / totalLinesOfCode) * 100)
    }
  }

  /**
   * 检测代码问题
   */
  private async detectIssues(ast: t.File, language: ProgrammingLanguage): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = []

    traverse(ast, {
      // 检测未使用的变量
      VariableDeclarator(path) {
        if (path.node.id.type === 'Identifier') {
          const binding = path.scope.getBinding(path.node.id.name)
          if (!binding || binding.referenced === false) {
            issues.push({
              type: 'unused-variable',
              severity: 'warning',
              message: `未使用的变量: ${path.node.id.name}`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0
            })
          }
        }
      },

      // 检测调试代码
      CallExpression(path) {
        if (path.node.callee.type === 'Identifier') {
          const calleeName = path.node.callee.name
          if (['console.log', 'debugger', 'alert'].includes(calleeName)) {
            issues.push({
              type: 'debug-code',
              severity: 'warning',
              message: `检测到调试代码: ${calleeName}`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0
            })
          }
        }
      },

      // 检测性能问题
      ForStatement(path) {
        // 检查for循环中的length属性重复访问
        if (path.node.test?.type === 'BinaryExpression') {
          const test = path.node.test
          if (
            test.operator === '<' &&
            test.right.type === 'MemberExpression' &&
            test.right.property.type === 'Identifier' &&
            test.right.property.name === 'length'
          ) {
            issues.push({
              type: 'performance',
              severity: 'info',
              message: '建议在循环外缓存length属性',
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0
            })
          }
        }
      },

      // 检测空代码块
      BlockStatement(path) {
        if (path.node.body.length === 0) {
          issues.push({
            type: 'empty-block',
            severity: 'info',
            message: '检测到空代码块',
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0
          })
        }
      }
    })

    return issues
  }

  /**
   * 性能分析
   */
  private async analyzePerformance(ast: t.File, code: string): Promise<PerformanceMetrics> {
    let functionCount = 0
    let loopCount = 0
    let recursionDepth = 0
    const bottlenecks: string[] = []
    let estimatedTimeComplexity = 'O(1)'

    traverse(ast, {
      FunctionDeclaration: () => functionCount++,
      FunctionExpression: () => functionCount++,
      ArrowFunctionExpression: () => functionCount++,

      ForStatement: () => loopCount++,
      WhileStatement: () => loopCount++,
      DoWhileStatement: () => loopCount++,

      CallExpression(path) {
        // 检测递归调用
        const funcName = (path.parent as t.FunctionDeclaration)?.id?.name
        if (
          funcName &&
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === funcName
        ) {
          recursionDepth = Math.max(recursionDepth, 3) // 简化的递归检测
        }
      }
    })

    // 分析时间复杂度
    if (loopCount > 3) {
      estimatedTimeComplexity = 'O(n³)'
    } else if (loopCount > 1) {
      estimatedTimeComplexity = 'O(n²)'
    } else if (loopCount === 1) {
      estimatedTimeComplexity = 'O(n)'
    }

    // 识别性能瓶颈
    if (loopCount > 2) {
      bottlenecks.push('检测到嵌套循环，可能存在性能问题')
    }
    if (recursionDepth > 5) {
      bottlenecks.push('检测到深度递归，可能导致栈溢出')
    }
    if (functionCount > 20) {
      bottlenecks.push('函数数量过多，可能影响模块加载性能')
    }

    return {
      functionCount,
      loopCount,
      recursionDepth,
      estimatedTimeComplexity,
      bottlenecks,
      memoryUsage: this.estimateMemoryUsage(ast),
      executionTime: this.estimateExecutionTime(ast)
    }
  }

  /**
   * 安全性分析
   */
  private async analyzeSecurity(ast: t.File): Promise<CodeIssue[]> {
    const securityIssues: CodeIssue[] = []

    traverse(ast, {
      // 检测eval使用
      CallExpression(path) {
        if (path.node.callee.type === 'Identifier' && path.node.callee.name === 'eval') {
          securityIssues.push({
            type: 'security',
            severity: 'error',
            message: '使用eval函数存在安全风险',
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0
          })
        }
      },

      // 检测innerHTML使用
      AssignmentExpression(path) {
        if (
          path.node.left.type === 'MemberExpression' &&
          path.node.left.property.type === 'Identifier' &&
          path.node.left.property.name === 'innerHTML'
        ) {
          securityIssues.push({
            type: 'security',
            severity: 'warning',
            message: '直接设置innerHTML可能导致XSS攻击',
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0
          })
        }
      }
    })

    return securityIssues
  }

  /**
   * 检测代码重复
   */
  private detectCodeDuplication(ast: t.File): number {
    // 简化的重复代码检测
    const codeBlocks = new Set<string>()
    let duplicatedLines = 0

    traverse(ast, {
      BlockStatement(path) {
        const code = generate(path.node).code
        if (codeBlocks.has(code)) {
          duplicatedLines += path.node.body.length
        } else {
          codeBlocks.add(code)
        }
      }
    })

    return duplicatedLines
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(ast: t.File): number {
    let variableCount = 0
    let objectCount = 0
    let arrayCount = 0

    traverse(ast, {
      VariableDeclarator(path) {
        variableCount++
        if (path.node.init?.type === 'ObjectExpression') objectCount++
        if (path.node.init?.type === 'ArrayExpression') arrayCount++
      }
    })

    // 简化的内存估算（字节）
    return variableCount * 64 + objectCount * 256 + arrayCount * 128
  }

  /**
   * 估算执行时间
   */
  private estimateExecutionTime(ast: t.File): number {
    let complexityScore = 0

    traverse(ast, {
      FunctionDeclaration: () => (complexityScore += 1),
      CallExpression: () => (complexityScore += 0.5),
      ForStatement: () => (complexityScore += 2),
      WhileStatement: () => (complexityScore += 2),
      IfStatement: () => (complexityScore += 0.5)
    })

    return Math.round(complexityScore * 10) // 毫秒
  }
}

// 导出便捷函数
export async function analyzeCode(
  code: string,
  language: ProgrammingLanguage = 'javascript',
  options?: AnalysisOptions
): Promise<CodeAnalysisResult> {
  const analyzer = new CodeAnalyzer(options)
  return await analyzer.analyzeCode(code, language)
}
