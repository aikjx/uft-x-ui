// 代码解析器 - 支持多种编程语言的AST分析
import { parse } from '@babel/parser'
import { traverse } from '@babel/traverse'
import * as t from '@babel/types'
import { 
  ProgrammingLanguage, 
  CodeMetrics, 
  CodeIssue, 
  IssueSeverity, 
  IssueCategory,
  CodePosition 
} from '../types/code-optimization'

/**
 * 代码解析器类 - 支持多种编程语言的抽象语法树分析
 */
export class CodeParser {
  private language: ProgrammingLanguage
  
  constructor(language: ProgrammingLanguage) {
    this.language = language
  }

  /**
   * 解析代码并生成抽象语法树
   */
  parseCode(code: string): any {
    try {
      switch (this.language) {
        case ProgrammingLanguage.JAVASCRIPT:
        case ProgrammingLanguage.TYPESCRIPT:
          return this.parseJavaScript(code)
        case ProgrammingLanguage.PYTHON:
          return this.parsePython(code)
        case ProgrammingLanguage.JAVA:
          return this.parseJava(code)
        default:
          throw new Error(`不支持的语言: ${this.language}`)
      }
    } catch (error) {
      throw new Error(`代码解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 解析JavaScript/TypeScript代码
   */
  private parseJavaScript(code: string): any {
    const plugins = []
    if (this.language === ProgrammingLanguage.TYPESCRIPT) {
      plugins.push('typescript')
    }
    
    return parse(code, {
      sourceType: 'module',
      plugins: [...plugins, 'jsx', 'decorators-legacy'],
      allowUndeclaredExports: true,
    })
  }

  /**
   * 解析Python代码（占位实现）
   */
  private parsePython(code: string): any {
    // TODO: 集成Python解析器
    console.warn('Python解析器暂未实现，返回基础分析')
    return this.basicPythonAnalysis(code)
  }

  /**
   * 解析Java代码（占位实现）
   */
  private parseJava(code: string): any {
    // TODO: 集成Java解析器
    console.warn('Java解析器暂未实现，返回基础分析')
    return this.basicJavaAnalysis(code)
  }

  /**
   * 计算代码复杂度指标
   */
  calculateMetrics(code: string): CodeMetrics {
    const ast = this.parseCode(code)
    
    switch (this.language) {
      case ProgrammingLanguage.JAVASCRIPT:
      case ProgrammingLanguage.TYPESCRIPT:
        return this.calculateJavaScriptMetrics(ast, code)
      case ProgrammingLanguage.PYTHON:
        return this.calculatePythonMetrics(ast, code)
      case ProgrammingLanguage.JAVA:
        return this.calculateJavaMetrics(ast, code)
      default:
        return this.calculateBasicMetrics(code)
    }
  }

  /**
   * 计算JavaScript/TypeScript代码指标
   */
  private calculateJavaScriptMetrics(ast: any, code: string): CodeMetrics {
    let cyclomaticComplexity = 1
    let cognitiveComplexity = 0
    const linesOfCode = code.split('\n').length
    
    // 遍历AST计算复杂度
    traverse(ast, {
      IfStatement: () => { cyclomaticComplexity++; cognitiveComplexity += 2 },
      ForStatement: () => { cyclomaticComplexity++; cognitiveComplexity += 3 },
      WhileStatement: () => { cyclomaticComplexity++; cognitiveComplexity += 3 },
      DoWhileStatement: () => { cyclomaticComplexity++; cognitiveComplexity += 3 },
      SwitchStatement: (path) => {
        cyclomaticComplexity += path.node.cases.length
        cognitiveComplexity += path.node.cases.length * 2
      },
      ConditionalExpression: () => { cyclomaticComplexity++ },
      LogicalExpression: (path) => {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          cyclomaticComplexity++
        }
      },
      TryStatement: () => { cognitiveComplexity += 2 },
      CatchClause: () => { cognitiveComplexity += 1 },
    })

    // 计算Halstead指标
    const halsteadMetrics = this.calculateHalsteadMetrics(code)
    
    // 计算可维护性指数
    const maintainabilityIndex = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(halsteadMetrics.volume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)
    ))

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      maintainabilityIndex,
      halsteadMetrics
    }
  }

  /**
   * 计算Halstead指标
   */
  private calculateHalsteadMetrics(code: string): any {
    // 简化的Halstead指标计算
    const operators = ['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '>', '<', '>=', '<=', '&&', '||', '!']
    const keywords = ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'function']
    
    const operatorCount = operators.reduce((count, op) => 
      count + (code.split(op).length - 1), 0
    )
    const keywordCount = keywords.reduce((count, kw) => 
      count + (code.split(kw).length - 1), 0
    )
    
    const totalOperators = operatorCount + keywordCount
    const uniqueOperators = new Set([...operators, ...keywords]).size
    
    // 简化的计算
    const volume = totalOperators * Math.log2(uniqueOperators || 1)
    const difficulty = (uniqueOperators / 2) * (totalOperators / (uniqueOperators || 1))
    const effort = volume * difficulty

    return { volume, difficulty, effort }
  }

  /**
   * 检测代码问题
   */
  detectIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = []
    
    switch (this.language) {
      case ProgrammingLanguage.JAVASCRIPT:
      case ProgrammingLanguage.TYPESCRIPT:
        issues.push(...this.detectJavaScriptIssues(code))
        break
      case ProgrammingLanguage.PYTHON:
        issues.push(...this.detectPythonIssues(code))
        break
      case ProgrammingLanguage.JAVA:
        issues.push(...this.detectJavaIssues(code))
        break
    }

    return issues
  }

  /**
   * 检测JavaScript/TypeScript代码问题
   */
  private detectJavaScriptIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = []
    const ast = this.parseCode(code)
    
    traverse(ast, {
      // 检测未使用的变量
      VariableDeclarator(path) {
        if (path.node.id && t.isIdentifier(path.node.id)) {
          const binding = path.scope.getBinding(path.node.id.name)
          if (binding && !binding.referenced) {
            issues.push({
              id: 'unused-variable',
              severity: IssueSeverity.WARNING,
              category: IssueCategory.BEST_PRACTICE,
              message: `未使用的变量: ${path.node.id.name}`,
              position: this.getNodePosition(path.node),
              suggestion: '删除未使用的变量',
              confidence: 0.9
            })
          }
        }
      },
      
      // 检测循环中的var声明
      ForStatement(path) {
        if (t.isVariableDeclaration(path.node.init) && path.node.init.kind === 'var') {
          issues.push({
            id: 'var-in-loop',
            severity: IssueSeverity.WARNING,
            category: IssueCategory.BEST_PRACTICE,
            message: '循环中使用了var声明，可能导致变量提升问题',
            position: this.getNodePosition(path.node.init),
            suggestion: '使用let或const替代var',
            confidence: 0.8
          })
        }
      },
      
      // 检测未处理的Promise
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee) && 
            t.isIdentifier(path.node.callee.property) && 
            path.node.callee.property.name === 'then') {
          issues.push({
            id: 'unhandled-promise',
            severity: IssueSeverity.WARNING,
            category: IssueCategory.BUG,
            message: 'Promise未处理错误',
            position: this.getNodePosition(path.node),
            suggestion: '添加.catch()错误处理',
            confidence: 0.7
          })
        }
      },
      
      // 检测可能的内存泄漏
      FunctionDeclaration(path) {
        if (this.hasPotentialMemoryLeak(path.node)) {
          issues.push({
            id: 'potential-memory-leak',
            severity: IssueSeverity.WARNING,
            category: IssueCategory.MEMORY,
            message: '可能存在内存泄漏风险',
            position: this.getNodePosition(path.node),
            suggestion: '检查闭包和事件监听器是否正确清理',
            confidence: 0.6
          })
        }
      }
    })

    return issues
  }

  /**
   * 获取节点位置信息
   */
  private getNodePosition(node: any): CodePosition {
    return {
      line: node.loc?.start.line || 1,
      column: node.loc?.start.column || 0,
      endLine: node.loc?.end.line,
      endColumn: node.loc?.end.column
    }
  }

  /**
   * 检测潜在的内存泄漏
   */
  private hasPotentialMemoryLeak(node: any): boolean {
    // 简化的内存泄漏检测逻辑
    // 实际实现需要更复杂的分析
    return false
  }

  /**
   * 简化的Python代码分析
   */
  private basicPythonAnalysis(code: string): any {
    return {
      type: 'PythonProgram',
      body: []
    }
  }

  /**
   * 简化的Java代码分析
   */
  private basicJavaAnalysis(code: string): any {
    return {
      type: 'JavaProgram',
      body: []
    }
  }

  /**
   * 计算Python代码指标
   */
  private calculatePythonMetrics(ast: any, code: string): CodeMetrics {
    const linesOfCode = code.split('\n').length
    
    // 简化的Python复杂度计算
    const cyclomaticComplexity = (code.match(/if|elif|for|while|and|or/g) || []).length + 1
    const cognitiveComplexity = cyclomaticComplexity * 1.5
    
    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      maintainabilityIndex: 70, // 基础值
      halsteadMetrics: { volume: 100, difficulty: 10, effort: 1000 }
    }
  }

  /**
   * 计算Java代码指标
   */
  private calculateJavaMetrics(ast: any, code: string): CodeMetrics {
    const linesOfCode = code.split('\n').length
    
    // 简化的Java复杂度计算
    const cyclomaticComplexity = (code.match(/if|else|for|while|&&|\|\||case/g) || []).length + 1
    const cognitiveComplexity = cyclomaticComplexity * 1.3
    
    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      maintainabilityIndex: 75, // 基础值
      halsteadMetrics: { volume: 120, difficulty: 12, effort: 1200 }
    }
  }

  /**
   * 计算基础指标
   */
  private calculateBasicMetrics(code: string): CodeMetrics {
    const linesOfCode = code.split('\n').length
    
    return {
      cyclomaticComplexity: 1,
      cognitiveComplexity: 1,
      maintainabilityIndex: 85,
      halsteadMetrics: { volume: 50, difficulty: 5, effort: 250 }
    }
  }

  /**
   * 检测Python代码问题
   */
  private detectPythonIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = []
    
    // 简化的Python代码问题检测
    if (code.includes('except:')) {
      issues.push({
        id: 'bare-except',
        severity: IssueSeverity.WARNING,
        category: IssueCategory.BEST_PRACTICE,
        message: '使用了裸except语句，可能捕获不希望捕获的异常',
        position: { line: 1, column: 0 },
        suggestion: '使用具体的异常类型',
        confidence: 0.8
      })
    }
    
    return issues
  }

  /**
   * 检测Java代码问题
   */
  private detectJavaIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = []
    
    // 简化的Java代码问题检测
    if (code.includes('Thread.sleep')) {
      issues.push({
        id: 'thread-sleep',
        severity: IssueSeverity.WARNING,
        category: IssueCategory.PERFORMANCE,
        message: '使用了Thread.sleep，可能影响性能',
        position: { line: 1, column: 0 },
        suggestion: '考虑使用定时器或异步处理',
        confidence: 0.7
      })
    }
    
    return issues
  }
}

/**
 * 多语言代码分析器工厂
 */
export class CodeParserFactory {
  static createParser(language: ProgrammingLanguage): CodeParser {
    return new CodeParser(language)
  }

  /**
   * 根据文件扩展名检测编程语言
   */
  static detectLanguage(filename: string): ProgrammingLanguage {
    const ext = filename.toLowerCase().split('.').pop()
    
    switch (ext) {
      case 'js':
        return ProgrammingLanguage.JAVASCRIPT
      case 'ts':
        return ProgrammingLanguage.TYPESCRIPT
      case 'py':
        return ProgrammingLanguage.PYTHON
      case 'java':
        return ProgrammingLanguage.JAVA
      case 'cpp':
      case 'cc':
      case 'cxx':
        return ProgrammingLanguage.CPP
      case 'go':
        return ProgrammingLanguage.GO
      case 'rs':
        return ProgrammingLanguage.RUST
      default:
        return ProgrammingLanguage.JAVASCRIPT // 默认返回JavaScript
    }
  }
}