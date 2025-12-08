/**
 * 导出服务
 * 支持多种格式的代码优化结果导出
 */
import type { OptimizationReport, CodeAnalysisResult, CodeDiffResult } from '@/types/code-optimization'
import type { CodeDiffResult } from './code-comparison'

export interface ExportOptions {
  format: 'json' | 'html' | 'markdown' | 'pdf' | 'csv' | 'xml'
  includeOriginalCode?: boolean
  includeOptimizedCode?: boolean
  includeAnalysis?: boolean
  includeComparison?: boolean
  includeTimestamp?: boolean
  customFileName?: string
  theme?: 'light' | 'dark' | 'professional'
}

export interface ExportResult {
  success: boolean
  data: string | Blob
  fileName: string
  mimeType: string
  error?: string
}

export class ExportService {
  private defaultOptions: Partial<ExportOptions> = {
    includeOriginalCode: true,
    includeOptimizedCode: true,
    includeAnalysis: true,
    includeComparison: true,
    includeTimestamp: true,
    theme: 'professional'
  }

  /**
   * 导出优化报告
   */
  async exportReport(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions = { format: 'json' }
  ): Promise<ExportResult> {
    const exportOptions = { ...this.defaultOptions, ...options }

    try {
      switch (exportOptions.format) {
        case 'json':
          return this.exportJSON(report, analysisResult, diffResult, exportOptions)
        case 'html':
          return this.exportHTML(report, analysisResult, diffResult, exportOptions)
        case 'markdown':
          return this.exportMarkdown(report, analysisResult, diffResult, exportOptions)
        case 'pdf':
          return this.exportPDF(report, analysisResult, diffResult, exportOptions)
        case 'csv':
          return this.exportCSV(report, analysisResult, diffResult, exportOptions)
        case 'xml':
          return this.exportXML(report, analysisResult, diffResult, exportOptions)
        default:
          throw new Error(`不支持的导出格式: ${exportOptions.format}`)
      }
    } catch (error) {
      return {
        success: false,
        data: '',
        fileName: '',
        mimeType: '',
        error: `导出失败: ${error}`
      }
    }
  }

  /**
   * 导出JSON格式
   */
  private async exportJSON(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData: any = {
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        language: report.language,
        optimizationLevel: report.optimizationLevel
      },
      report: {
        appliedRules: report.appliedRules,
        performanceImprovement: report.performanceImprovement,
        executionTime: report.executionTime,
        fixes: report.fixes,
        warnings: report.warnings
      }
    }

    if (options.includeOriginalCode) {
      exportData.originalCode = report.originalCode
    }

    if (options.includeOptimizedCode) {
      exportData.optimizedCode = report.optimizedCode
    }

    if (options.includeAnalysis && analysisResult) {
      exportData.analysis = {
        complexityMetrics: analysisResult.complexityMetrics,
        performanceMetrics: analysisResult.performanceMetrics,
        issues: analysisResult.issues
      }
    }

    if (options.includeComparison && diffResult) {
      exportData.comparison = {
        summary: diffResult.summary,
        differences: diffResult.differences,
        unified: diffResult.unified
      }
    }

    const jsonString = JSON.stringify(exportData, null, 2)

    return {
      success: true,
      data: jsonString,
      fileName: this.generateFileName(options, 'json'),
      mimeType: 'application/json'
    }
  }

  /**
   * 导出HTML格式
   */
  private async exportHTML(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    const htmlContent = this.generateHTMLReport(report, analysisResult, diffResult, options)

    return {
      success: true,
      data: htmlContent,
      fileName: this.generateFileName(options, 'html'),
      mimeType: 'text/html'
    }
  }

  /**
   * 导出Markdown格式
   */
  private async exportMarkdown(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    const markdownContent = this.generateMarkdownReport(report, analysisResult, diffResult, options)

    return {
      success: true,
      data: markdownContent,
      fileName: this.generateFileName(options, 'md'),
      mimeType: 'text/markdown'
    }
  }

  /**
   * 导出PDF格式
   */
  private async exportPDF(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // 使用浏览器的打印功能生成PDF
      const htmlContent = this.generateHTMLReport(report, analysisResult, diffResult, options)
      
      // 创建新窗口用于打印
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('无法创建打印窗口')
      }

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // 等待内容加载完成后触发打印
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }

      return {
        success: true,
        data: 'PDF将通过浏览器打印功能生成',
        fileName: this.generateFileName(options, 'pdf'),
        mimeType: 'application/pdf'
      }
    } catch (error) {
      throw new Error(`PDF导出失败: ${error}`)
    }
  }

  /**
   * 导出CSV格式
   */
  private async exportCSV(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    let csvContent = 'Metric,Value,Type
'
    
    // 基本信息
    csvContent += `Language,${report.language},Basic
`
    csvContent += `Optimization Level,${report.optimizationLevel},Basic
`
    csvContent += `Performance Improvement,${report.performanceImprovement}%,Performance\n`
`
    csvContent += `Execution Time,${report.executionTime}ms,Performance
`

    // 规则应用
    csvContent += '
Applied Rules
'
    csvContent += 'Rule Name,Category,Impact
'
    report.appliedRules.forEach(rule => {
      csvContent += `"${rule}","optimization","high"
`
    })

    // 修复和警告
    csvContent += '
Issues and Warnings
'
    csvContent += 'Type,Message,Severity,Line
'
    report.fixes.forEach(fix => {
      csvContent += `"Fix","${fix.description}","${fix.severity}",${fix.line}
`
    })
    report.warnings.forEach(warning => {
      csvContent += `"Warning","${warning.message}","${warning.severity}",${warning.line}
`
    })

    if (analysisResult) {
      csvContent += '
Complexity Metrics
'
      csvContent += 'Metric,Value,Category
'
      const metrics = analysisResult.complexityMetrics
      csvContent += `Cyclomatic Complexity,${metrics.cyclomaticComplexity},Complexity
`
      csvContent += `Cognitive Complexity,${metrics.cognitiveComplexity},Complexity
`
      csvContent += `Maintainability Index,${metrics.maintainabilityIndex},Quality
`
      csvContent += `Lines of Code,${metrics.linesOfCode},Size
`
    }

    return {
      success: true,
      data: csvContent,
      fileName: this.generateFileName(options, 'csv'),
      mimeType: 'text/csv'
    }
  }

  /**
   * 导出XML格式
   */
  private async exportXML(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    const xmlContent = this.generateXMLReport(report, analysisResult, diffResult, options)

    return {
      success: true,
      data: xmlContent,
      fileName: this.generateFileName(options, 'xml'),
      mimeType: 'application/xml'
    }
  }

  /**
   * 生成HTML报告
   */
  private generateHTMLReport(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): string {
    const theme = this.getThemeCSS(options.theme || 'professional')

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码优化报告</title>
    <style>${theme}</style>
</head>
<body>
    <div class="report-container">
        <header class="report-header">
            <h1>代码优化报告</h1>
            ${options.includeTimestamp ? `<p class="timestamp">生成时间: ${new Date().toLocaleString('zh-CN')}</p>` : ''}
            <div class="metadata">
                <span class="badge language">${report.language}</span>
                <span class="badge level">${report.optimizationLevel}</span>
            </div>
        </header>

        <section class="summary">
            <h2>优化摘要</h2>
            <div class="metrics-grid">
                <div class="metric-card performance">
                    <h3>性能提升</h3>
                    <div class="value">+${report.performanceImprovement}%</div>
                </div>
                <div class="metric-card time">
                    <h3>执行时间</h3>
                    <div class="value">${report.executionTime}ms</div>
                </div>
                <div class="metric-card rules">
                    <h3>应用规则</h3>
                    <div class="value">${report.appliedRules.length}</div>
                </div>
                <div class="metric-card fixes">
                    <h3>修复问题</h3>
                    <div class="value">${report.fixes.length}</div>
                </div>
            </div>
        </section>

        ${options.includeOriginalCode ? this.generateOriginalCodeSection(report.originalCode) : ''}
        ${options.includeOptimizedCode ? this.generateOptimizedCodeSection(report.optimizedCode) : ''}
        ${options.includeAnalysis && analysisResult ? this.generateAnalysisSection(analysisResult) : ''}
        ${options.includeComparison && diffResult ? this.generateComparisonSection(diffResult) : ''}

        <footer class="report-footer">
            <p>由全自动代码优化系统生成</p>
        </footer>
    </div>
</body>
</html>`
  }

  /**
   * 生成Markdown报告
   */
  private generateMarkdownReport(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): string {
    let markdown = '# 代码优化报告

'

    // 基本信息
    markdown += `**语言**: ${report.language}
`
    markdown += `**优化级别**: ${report.optimizationLevel}
`
    if (options.includeTimestamp) {
      markdown += `**生成时间**: ${new Date().toLocaleString('zh-CN')}
`
    }
    markdown += '
'

    // 优化摘要
    markdown += '## 📊 优化摘要

'
    markdown += `- 🚀 **性能提升**: +${report.performanceImprovement}%\n`
    markdown += `- ⏱️ **执行时间**: ${report.executionTime}ms\n`
    markdown += `- 🔧 **应用规则**: ${report.appliedRules.length}\n`
    markdown += `- ✅ **修复问题**: ${report.fixes.length}\n`
    markdown += `- ⚠️ **警告信息**: ${report.warnings.length}\n\n`

    // 应用规则
    if (report.appliedRules.length > 0) {
      markdown += '## 🔧 应用的优化规则

'
      report.appliedRules.forEach(rule => {
        markdown += `- ${rule}
`
      })
      markdown += '
'
    }

    // 修复的问题
    if (report.fixes.length > 0) {
      markdown += '## ✅ 修复的问题

'
      report.fixes.forEach(fix => {
        markdown += `- **${fix.description}** (行 ${fix.line})
`
      })
      markdown += '
'
    }

    // 警告信息
    if (report.warnings.length > 0) {
      markdown += '## ⚠️ 警告信息

'
      report.warnings.forEach(warning => {
        markdown += `- ${warning.message} (行 ${warning.line})
`
      })
      markdown += '
'
    }

    // 代码对比
    if (options.includeComparison && diffResult) {
      markdown += '## 📝 代码对比

'
      markdown += `**总变更**: ${diffResult.summary.totalChanges}
`
      markdown += `- 新增行数: ${diffResult.summary.addedLines}
`
      markdown += `- 删除行数: ${diffResult.summary.removedLines}
`
      markdown += `- 修改行数: ${diffResult.summary.modifiedLines}
`
      markdown += `- 质量分数: ${diffResult.summary.qualityScore}

'
    }

    // 代码片段
    if (options.includeOriginalCode) {
      markdown += '## 📄 原始代码

'
      markdown += `\`\`\`${report.language}
${report.originalCode}
\`\`\`

`
    }

    if (options.includeOptimizedCode) {
      markdown += '## ✨ 优化后代码

'
      markdown += `\`\`\`${report.language}
${report.optimizedCode}
\`\`\`

`
    }

    markdown += '---

'
    markdown += '*由全自动代码优化系统生成*'

    return markdown
  }

  /**
   * 生成XML报告
   */
  private generateXMLReport(
    report: OptimizationReport,
    analysisResult?: CodeAnalysisResult,
    diffResult?: CodeDiffResult,
    options: ExportOptions
  ): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>
'
    xml += '<optimization-report>
'
    
    // 元数据
    xml += '  <metadata>
'
    xml += `    <language>${report.language}</language>
`
    xml += `    <optimization-level>${report.optimizationLevel}</optimization-level>
`
    if (options.includeTimestamp) {
      xml += `    <timestamp>${new Date().toISOString()}</timestamp>
`
    }
    xml += '  </metadata>
'
    
    // 优化结果
    xml += '  <optimization-result>
'
    xml += `    <performance-improvement>${report.performanceImprovement}</performance-improvement>
`
    xml += `    <execution-time>${report.executionTime}</execution-time>
`
    xml += '    <applied-rules>
'
    report.appliedRules.forEach(rule => {
      xml += `      <rule>${rule}</rule>
`
    })
    xml += '    </applied-rules>
'
    xml += '  </optimization-result>
'

    xml += '</optimization-report>'
    return xml
  }

  /**
   * 生成主题CSS
   */
  private getThemeCSS(theme: string): string {
    switch (theme) {
      case 'dark':
        return `
          body { background: #1a1a1a; color: #fff; font-family: 'Segoe UI', system-ui, sans-serif; }
          .report-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .metric-card { background: #2d2d2d; border-radius: 8px; padding: 20px; margin: 10px; }
          .code-block { background: #000; color: #fff; padding: 20px; border-radius: 8px; overflow-x: auto; }
        `
      case 'light':
        return `
          body { background: #fff; color: #333; font-family: 'Segoe UI', system-ui, sans-serif; }
          .report-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .metric-card { background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 10px; }
          .code-block { background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; }
        `
      case 'professional':
      default:
        return `
          body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: #333; 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            min-height: 100vh;
          }
          .report-container { 
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(10px);
            max-width: 1200px; 
            margin: 20px auto; 
            padding: 40px; 
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .report-header { text-align: center; margin-bottom: 40px; }
          .report-header h1 { color: #2c3e50; font-size: 2.5rem; margin-bottom: 10px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
          .metric-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            border-radius: 15px; 
            padding: 30px; 
            text-align: center;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
          }
          .metric-card:hover { transform: translateY(-5px); }
          .metric-card h3 { font-size: 1rem; opacity: 0.9; margin-bottom: 10px; }
          .metric-card .value { font-size: 2.5rem; font-weight: bold; }
          .code-block { 
            background: #2d3748; 
            color: #e2e8f0; 
            padding: 30px; 
            border-radius: 10px; 
            overflow-x: auto; 
            font-family: 'Courier New', monospace;
            margin: 20px 0;
          }
          .badge { 
            display: inline-block; 
            padding: 8px 16px; 
            margin: 0 5px; 
            border-radius: 20px; 
            font-size: 0.875rem;
            font-weight: 500;
          }
          .language { background: #4299e1; color: white; }
          .level { background: #48bb78; color: white; }
        `
    }
  }

  /**
   * 生成文件名
   */
  private generateFileName(options: ExportOptions, extension: string): string {
    if (options.customFileName) {
      return `${options.customFileName}.${extension}`
    }
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    return `code-optimization-report-${timestamp}.${extension}`
  }

  /**
   * 生成原始代码部分
   */
  private generateOriginalCodeSection(code: string): string {
    return `
        <section class="original-code">
            <h2>📄 原始代码</h2>
            <div class="code-block">
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
        </section>`
  }

  /**
   * 生成优化后代码部分
   */
  private generateOptimizedCodeSection(code: string): string {
    return `
        <section class="optimized-code">
            <h2>✨ 优化后代码</h2>
            <div class="code-block">
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
        </section>`
  }

  /**
   * 生成分析结果部分
   */
  private generateAnalysisSection(analysisResult: CodeAnalysisResult): string {
    const metrics = analysisResult.complexityMetrics
    return `
        <section class="analysis">
            <h2>📊 代码分析结果</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>循环复杂度</h3>
                    <div class="value">${metrics.cyclomaticComplexity}</div>
                </div>
                <div class="metric-card">
                    <h3>认知复杂度</h3>
                    <div class="value">${metrics.cognitiveComplexity}</div>
                </div>
                <div class="metric-card">
                    <h3>可维护性指数</h3>
                    <div class="value">${metrics.maintainabilityIndex}</div>
                </div>
                <div class="metric-card">
                    <h3>代码行数</h3>
                    <div class="value">${metrics.linesOfCode}</div>
                </div>
            </div>
        </section>`
  }

  /**
   * 生成对比结果部分
   */
  private generateComparisonSection(diffResult: CodeDiffResult): string {
    return `
        <section class="comparison">
            <h2>📝 代码对比</h2>
            <div class="comparison-summary">
                <p>总变更: ${diffResult.summary.totalChanges}</p>
                <p>新增行数: ${diffResult.summary.addedLines}</p>
                <p>删除行数: ${diffResult.summary.removedLines}</p>
                <p>修改行数: ${diffResult.summary.modifiedLines}</p>
                <p>质量分数: ${diffResult.summary.qualityScore}</p>
            </div>
        </section>`
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
}

// 导出便捷函数
export function createExportService(): ExportService {
  return new ExportService()
}

export async function exportReport(
  report: OptimizationReport,
  analysisResult?: CodeAnalysisResult,
  diffResult?: CodeDiffResult,
  options?: ExportOptions
): Promise<ExportResult> {
  const service = new ExportService()
  return await service.exportReport(report, analysisResult, diffResult, options)
}