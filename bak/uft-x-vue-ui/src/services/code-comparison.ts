/**
 * 代码对比服务
 * 提供强大的代码差异对比和可视化功能
 */
import type { CodeAnalysisResult, OptimizationReport } from '@/types/code-optimization'

export interface CodeDiffResult {
  originalCode: string
  optimizedCode: string
  differences: CodeDifference[]
  summary: DiffSummary
  html: string
  unified: string
}

export interface CodeDifference {
  type: 'added' | 'removed' | 'modified'
  lineNumber: number
  originalLine: string
  optimizedLine: string
  context: CodeContext
  description: string
  impact: 'low' | 'medium' | 'high'
}

export interface CodeContext {
  before: string[]
  after: string[]
  function: string | null
  class: string | null
  module: string | null
}

export interface DiffSummary {
  totalChanges: number
  addedLines: number
  removedLines: number
  modifiedLines: number
  performanceImpact: string
  qualityScore: number
  complexityReduction: number
}

export class CodeComparisonService {
  private readonly LINE_SEPARATOR = /\r?\n/
  private readonly CONTEXT_LINES = 3

  /**
   * 执行代码对比分析
   */
  async compareCode(
    originalCode: string,
    optimizedCode: string,
    language: string = 'javascript'
  ): Promise<CodeDiffResult> {
    const originalLines = originalCode.split(this.LINE_SEPARATOR)
    const optimizedLines = optimizedCode.split(this.LINE_SEPARATOR)

    // 计算差异
    const differences = await this.calculateDifferences(originalLines, optimizedLines, language)

    // 生成总结
    const summary = this.generateSummary(differences, originalLines, optimizedLines)

    // 生成HTML差异视图
    const html = this.generateHTMLDiff(differences)

    // 生成统一差异格式
    const unified = this.generateUnifiedDiff(differences)

    return {
      originalCode,
      optimizedCode,
      differences,
      summary,
      html,
      unified
    }
  }

  /**
   * 基于AST进行智能对比
   */
  async compareWithAST(
    analysisResult: CodeAnalysisResult,
    optimizationReport: OptimizationReport
  ): Promise<CodeDiffResult> {
    const originalCode = analysisResult.originalCode
    const optimizedCode = optimizationReport.optimizedCode

    const result = await this.compareCode(originalCode, optimizedCode, analysisResult.language)

    // 增强差异信息，包含AST分析结果
    result.differences = result.differences.map(diff => ({
      ...diff,
      complexityImpact: this.calculateComplexityImpact(diff),
      performanceImpact: this.calculatePerformanceImpact(diff, analysisResult)
    }))

    return result
  }

  /**
   * 计算代码差异
   */
  private async calculateDifferences(
    originalLines: string[],
    optimizedLines: string[],
    language: string
  ): Promise<CodeDifference[]> {
    const differences: CodeDifference[] = []

    // 使用LCS算法计算最长公共子序列
    const lcsResult = this.longestCommonSubsequence(originalLines, optimizedLines)

    // 分析差异
    let originalIndex = 0
    let optimizedIndex = 0

    for (let i = 0; i < lcsResult.length; i++) {
      const [originalLineIndex, optimizedLineIndex] = lcsResult[i]

      // 处理删除的行
      while (originalIndex < originalLineIndex) {
        differences.push({
          type: 'removed',
          lineNumber: originalIndex + 1,
          originalLine: originalLines[originalIndex],
          optimizedLine: '',
          context: this.getContext(originalLines, optimizedLines, originalIndex, -1),
          description: this.describeRemoval(originalLines[originalIndex]),
          impact: this.analyzeImpact(originalLines[originalIndex], 'removed')
        })
        originalIndex++
      }

      // 处理添加的行
      while (optimizedIndex < optimizedLineIndex) {
        differences.push({
          type: 'added',
          lineNumber: originalIndex + 1,
          originalLine: '',
          optimizedLine: optimizedLines[optimizedIndex],
          context: this.getContext(originalLines, optimizedLines, -1, optimizedIndex),
          description: this.describeAddition(optimizedLines[optimizedIndex]),
          impact: this.analyzeImpact(optimizedLines[optimizedIndex], 'added')
        })
        optimizedIndex++
      }

      // 处理修改的行
      if (originalLines[originalIndex] !== optimizedLines[optimizedIndex]) {
        differences.push({
          type: 'modified',
          lineNumber: originalIndex + 1,
          originalLine: originalLines[originalIndex],
          optimizedLine: optimizedLines[optimizedIndex],
          context: this.getContext(originalLines, optimizedLines, originalIndex, optimizedIndex),
          description: this.describeModification(
            originalLines[originalIndex],
            optimizedLines[optimizedIndex]
          ),
          impact: this.analyzeImpact(optimizedLines[optimizedIndex], 'modified')
        })
      }

      originalIndex++
      optimizedIndex++
    }

    // 处理剩余的行
    while (originalIndex < originalLines.length) {
      differences.push({
        type: 'removed',
        lineNumber: originalIndex + 1,
        originalLine: originalLines[originalIndex],
        optimizedLine: '',
        context: this.getContext(originalLines, optimizedLines, originalIndex, -1),
        description: this.describeRemoval(originalLines[originalIndex]),
        impact: this.analyzeImpact(originalLines[originalIndex], 'removed')
      })
      originalIndex++
    }

    while (optimizedIndex < optimizedLines.length) {
      differences.push({
        type: 'added',
        lineNumber: originalIndex + 1,
        originalLine: '',
        optimizedLine: optimizedLines[optimizedIndex],
        context: this.getContext(originalLines, optimizedLines, -1, optimizedIndex),
        description: this.describeAddition(optimizedLines[optimizedIndex]),
        impact: this.analyzeImpact(optimizedLines[optimizedIndex], 'added')
      })
      optimizedIndex++
    }

    return differences
  }

  /**
   * 最长公共子序列算法
   */
  private longestCommonSubsequence(a: string[], b: string[]): [number, number][] {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0))

    // 构建DP表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (this.normalizeLine(a[i - 1]) === this.normalizeLine(b[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // 回溯找到LCS
    const result: [number, number][] = []
    let i = m,
      j = n

    while (i > 0 && j > 0) {
      if (this.normalizeLine(a[i - 1]) === this.normalizeLine(b[j - 1])) {
        result.unshift([i - 1, j - 1])
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    return result
  }

  /**
   * 标准化行内容（去除空白和注释影响）
   */
  private normalizeLine(line: string): string {
    return line
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\/\/.*$/, '')
      .replace(/\/\*.*?\*\//g, '')
  }

  /**
   * 获取代码上下文
   */
  private getContext(
    originalLines: string[],
    optimizedLines: string[],
    originalIndex: number,
    optimizedIndex: number
  ): CodeContext {
    const getSurroundingLines = (lines: string[], index: number) => {
      const start = Math.max(0, index - this.CONTEXT_LINES)
      const end = Math.min(lines.length, index + this.CONTEXT_LINES + 1)
      return lines.slice(start, end)
    }

    return {
      before: originalIndex >= 0 ? getSurroundingLines(originalLines, originalIndex) : [],
      after: optimizedIndex >= 0 ? getSurroundingLines(optimizedLines, optimizedIndex) : [],
      function: this.detectFunction(originalLines, originalIndex),
      class: this.detectClass(originalLines, originalIndex),
      module: this.detectModule(originalLines, originalIndex)
    }
  }

  /**
   * 检测函数名
   */
  private detectFunction(lines: string[], index: number): string | null {
    for (let i = index; i >= Math.max(0, index - 10); i--) {
      const line = lines[i]
      const match = line.match(
        /^\s*(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/
      )
      if (match) {
        return match[1] || match[2]
      }
    }
    return null
  }

  /**
   * 检测类名
   */
  private detectClass(lines: string[], index: number): string | null {
    for (let i = index; i >= Math.max(0, index - 20); i--) {
      const line = lines[i]
      const match = line.match(/^\s*class\s+(\w+)/)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  /**
   * 检测模块名
   */
  private detectModule(lines: string[], index: number): string | null {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(/^\s*(?:export\s+)?(?:class|function|const)\s+(\w+)/)
      if (match && i <= index) {
        return match[1]
      }
    }
    return null
  }

  /**
   * 描述代码移除
   */
  private describeRemoval(line: string): string {
    const trimmed = line.trim()

    if (trimmed.startsWith('console.') || trimmed.startsWith('debugger')) {
      return '移除调试代码'
    }

    if (trimmed.match(/^\s*\/\*[\s\S]*?\*\/\s*$/)) {
      return '移除注释'
    }

    if (trimmed.match(/^\s*$/)) {
      return '移除空行'
    }

    if (trimmed.match(/(let|const|var)\s+\w+\s*=.*\{.*\}/)) {
      return '简化对象声明'
    }

    return '移除冗余代码'
  }

  /**
   * 描述代码添加
   */
  private describeAddition(line: string): string {
    const trimmed = line.trim()

    if (trimmed.includes('const length = ')) {
      return '添加长度缓存优化'
    }

    if (trimmed.includes('reduce(') || trimmed.includes('map(') || trimmed.includes('filter(')) {
      return '添加函数式编程优化'
    }

    if (trimmed.includes('async') || trimmed.includes('await')) {
      return '添加异步处理优化'
    }

    return '添加优化代码'
  }

  /**
   * 描述代码修改
   */
  private describeModification(original: string, optimized: string): string {
    const originalTrim = original.trim()
    const optimizedTrim = optimized.trim()

    if (originalTrim.includes('.length') && optimizedTrim.includes('const length = ')) {
      return '缓存长度属性以提升循环性能'
    }

    if (originalTrim.includes('for(') && optimizedTrim.includes('for(const')) {
      return '改进循环变量声明'
    }

    if (originalTrim.includes('if(') && optimizedTrim.includes('?')) {
      return '简化条件表达式'
    }

    return '代码结构优化'
  }

  /**
   * 分析影响级别
   */
  private analyzeImpact(
    line: string,
    type: 'added' | 'removed' | 'modified'
  ): 'low' | 'medium' | 'high' {
    const trimmed = line.trim()

    // 高影响
    if (trimmed.includes('for(') || trimmed.includes('while(') || trimmed.includes('function')) {
      return 'high'
    }

    // 中等影响
    if (trimmed.includes('if(') || trimmed.includes('switch(') || trimmed.includes('.length')) {
      return 'medium'
    }

    // 低影响
    if (trimmed.includes('console.') || trimmed.match(/^\s*\/\/.*$/) || trimmed.match(/^\s*$/)) {
      return 'low'
    }

    return 'medium'
  }

  /**
   * 生成差异总结
   */
  private generateSummary(
    differences: CodeDifference[],
    originalLines: string[],
    optimizedLines: string[]
  ): DiffSummary {
    const summary: DiffSummary = {
      totalChanges: differences.length,
      addedLines: differences.filter(d => d.type === 'added').length,
      removedLines: differences.filter(d => d.type === 'removed').length,
      modifiedLines: differences.filter(d => d.type === 'modified').length,
      performanceImpact: 'moderate',
      qualityScore: 85,
      complexityReduction: 15
    }

    // 计算性能影响
    const highImpactChanges = differences.filter(d => d.impact === 'high').length
    const totalLines = Math.max(originalLines.length, optimizedLines.length)

    if (highImpactChanges > totalLines * 0.1) {
      summary.performanceImpact = 'significant'
    } else if (highImpactChanges > totalLines * 0.05) {
      summary.performanceImpact = 'moderate'
    } else {
      summary.performanceImpact = 'minimal'
    }

    // 计算质量分数
    summary.qualityScore = Math.max(0, 100 - summary.removedLines * 2 + summary.modifiedLines)

    // 计算复杂度降低
    summary.complexityReduction = Math.min(50, summary.removedLines * 3 + summary.modifiedLines)

    return summary
  }

  /**
   * 生成HTML差异视图
   */
  private generateHTMLDiff(differences: CodeDifference[]): string {
    let html = '<div class="code-diff">'

    differences.forEach(diff => {
      const className = `diff-${diff.type} diff-impact-${diff.impact}`
      const impactBadge = `<span class="impact-badge impact-${diff.impact}">${diff.impact}</span>`
      const description = `<span class="diff-description">${diff.description}</span>`

      switch (diff.type) {
        case 'added':
          html += `
            <div class="${className}">
              <div class="line-number">${diff.lineNumber}</div>
              <div class="code-line added">${this.escapeHtml(diff.optimizedLine)}</div>
              <div class="diff-info">${impactBadge} ${description}</div>
            </div>
          `
          break
        case 'removed':
          html += `
            <div class="${className}">
              <div class="line-number">${diff.lineNumber}</div>
              <div class="code-line removed">${this.escapeHtml(diff.originalLine)}</div>
              <div class="diff-info">${impactBadge} ${description}</div>
            </div>
          `
          break
        case 'modified':
          html += `
            <div class="${className}">
              <div class="line-number">${diff.lineNumber}</div>
              <div class="code-line removed">${this.escapeHtml(diff.originalLine)}</div>
              <div class="code-line added">${this.escapeHtml(diff.optimizedLine)}</div>
              <div class="diff-info">${impactBadge} ${description}</div>
            </div>
          `
          break
      }
    })

    html += '</div>'
    return html
  }

  /**
   * 生成统一差异格式
   */
  private generateUnifiedDiff(differences: CodeDifference[]): string {
    let unified = '--- Original\n+++ Optimized\n'

    differences.forEach(diff => {
      const prefix = diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : ' '
      const line = diff.type === 'added' ? diff.optimizedLine : diff.originalLine

      unified += `${prefix}${line}\n`

      // 添加差异描述
      if (diff.description) {
        unified += `# ${diff.description}\n`
      }
    })

    return unified
  }

  /**
   * HTML转义
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }

  /**
   * 计算复杂度影响
   */
  private calculateComplexityImpact(diff: CodeDifference): number {
    switch (diff.type) {
      case 'removed':
        return diff.impact === 'high' ? -5 : diff.impact === 'medium' ? -2 : -1
      case 'added':
        return diff.impact === 'high' ? 5 : diff.impact === 'medium' ? 2 : 1
      case 'modified':
        return diff.impact === 'high' ? -3 : diff.impact === 'medium' ? -1 : 0
      default:
        return 0
    }
  }

  /**
   * 计算性能影响
   */
  private calculatePerformanceImpact(
    diff: CodeDifference,
    analysisResult: CodeAnalysisResult
  ): string {
    // 基于分析结果计算具体性能影响
    if (diff.description.includes('缓存') || diff.description.includes('优化')) {
      return 'positive'
    }
    if (diff.type === 'added' && diff.impact === 'high') {
      return 'negative'
    }
    return 'neutral'
  }
}

// 导出便捷函数
export function createCodeComparisonService(): CodeComparisonService {
  return new CodeComparisonService()
}

export async function compareCode(
  originalCode: string,
  optimizedCode: string,
  language?: string
): Promise<CodeDiffResult> {
  const service = new CodeComparisonService()
  return await service.compareCode(originalCode, optimizedCode, language)
}
