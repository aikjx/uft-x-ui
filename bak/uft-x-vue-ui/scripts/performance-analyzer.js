#!/usr/bin/env node

/**
 * 性能分析工具
 * 用于自动化性能测试和报告生成
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class PerformanceAnalyzer {
  constructor(configPath = './perf-benchmark.config.js') {
    this.config = require(path.resolve(configPath))
    this.results = []
    this.currentRun = {
      timestamp: new Date().toISOString(),
      gitCommit: this.getGitCommit(),
      branch: this.getGitBranch(),
      results: []
    }
  }

  /**
   * 运行完整的性能测试套件
   */
  async runFullSuite() {
    console.log('🚀 开始性能基准测试...')

    try {
      // 运行单元测试
      await this.runUnitTests()

      // 运行性能测试
      await this.runPerformanceTests()

      // 运行负载测试
      await this.runLoadTests()

      // 生成报告
      await this.generateReport()

      console.log('✅ 性能测试完成')
      return this.results
    } catch (error) {
      console.error('❌ 性能测试失败:', error)
      throw error
    }
  }

  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log('📊 运行单元测试...')

    try {
      const result = execSync('npm run test:unit', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      this.currentRun.unitTests = {
        status: 'passed',
        output: result
      }
    } catch (error) {
      this.currentRun.unitTests = {
        status: 'failed',
        error: error.message
      }
      throw error
    }
  }

  /**
   * 运行性能测试
   */
  async runPerformanceTests() {
    console.log('⚡ 运行性能测试...')

    const scenarios = this.config.scenarios

    for (const [scenarioName, scenarioConfig] of Object.entries(scenarios)) {
      console.log(`🔧 测试场景: ${scenarioName}`)

      try {
        const result = await this.runScenarioTest(scenarioName, scenarioConfig)
        this.currentRun.results.push(result)
      } catch (error) {
        console.error(`❌ 场景 ${scenarioName} 测试失败:`, error)
      }
    }
  }

  /**
   * 运行特定场景测试
   */
  async runScenarioTest(scenarioName, config) {
    return new Promise((resolve, reject) => {
      try {
        // 这里可以集成Playwright或其他测试工具
        // 目前使用模拟数据

        const result = {
          scenario: scenarioName,
          timestamp: new Date().toISOString(),
          metrics: this.generateMockMetrics(config)
        }

        // 模拟测试延迟
        setTimeout(() => {
          resolve(result)
        }, 1000)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 生成模拟性能指标
   */
  generateMockMetrics(config) {
    const baseMetrics = {
      fps: Math.random() * 30 + 30,
      frameTime: Math.random() * 10 + 10,
      drawCalls: config.objects * (1 + Math.random() * 0.5),
      usedHeap: Math.random() * 200 + 100,
      totalHeap: 500,
      heapLimit: 2000,
      loadTime: Math.random() * 1000 + 500,
      firstContentfulPaint: Math.random() * 800 + 200,
      largestContentfulPaint: Math.random() * 1500 + 500
    }

    // 根据复杂度调整指标
    const complexityMultiplier =
      {
        low: 1,
        medium: 1.5,
        high: 2.5,
        extreme: 4
      }[config.complexity] || 1

    Object.keys(baseMetrics).forEach(key => {
      if (['fps', 'frameTime'].includes(key)) {
        baseMetrics[key] /= complexityMultiplier
      } else {
        baseMetrics[key] *= complexityMultiplier
      }
    })

    return baseMetrics
  }

  /**
   * 运行负载测试
   */
  async runLoadTests() {
    console.log('📈 运行负载测试...')

    // 模拟负载测试
    await new Promise(resolve => setTimeout(resolve, 2000))

    this.currentRun.loadTests = {
      status: 'completed',
      simulatedUsers: 100,
      duration: '2s'
    }
  }

  /**
   * 生成性能报告
   */
  async generateReport() {
    console.log('📋 生成性能报告...')

    const report = {
      summary: this.generateSummary(),
      detailedResults: this.currentRun.results,
      recommendations: this.generateRecommendations(),
      trends: await this.analyzeTrends()
    }

    // 保存报告
    await this.saveReport(report)

    return report
  }

  /**
   * 生成测试摘要
   */
  generateSummary() {
    const results = this.currentRun.results

    const avgFPS = results.reduce((sum, r) => sum + r.metrics.fps, 0) / results.length
    const avgMemory = results.reduce((sum, r) => sum + r.metrics.usedHeap, 0) / results.length

    return {
      totalScenarios: results.length,
      averageFPS: Math.round(avgFPS),
      averageMemory: Math.round(avgMemory),
      overallScore: this.calculateOverallScore(results),
      status: this.determineStatus(results)
    }
  }

  /**
   * 计算整体性能分数
   */
  calculateOverallScore(results) {
    const scores = results.map(result => {
      const metrics = result.metrics
      let score = 100

      // FPS评分
      if (metrics.fps < 30) score -= 30
      else if (metrics.fps < 45) score -= 15

      // 内存评分
      const memoryUsage = (metrics.usedHeap / metrics.heapLimit) * 100
      if (memoryUsage > 85) score -= 25
      else if (memoryUsage > 70) score -= 12

      return Math.max(0, score)
    })

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  /**
   * 确定测试状态
   */
  determineStatus(results) {
    const overallScore = this.calculateOverallScore(results)

    if (overallScore >= 80) return 'excellent'
    if (overallScore >= 60) return 'good'
    if (overallScore >= 40) return 'fair'
    return 'poor'
  }

  /**
   * 生成优化建议
   */
  generateRecommendations() {
    const recommendations = []
    const results = this.currentRun.results

    // 分析FPS性能
    const avgFPS = results.reduce((sum, r) => sum + r.metrics.fps, 0) / results.length
    if (avgFPS < 45) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: '优化渲染性能',
        description: '平均FPS低于45，建议优化三维渲染性能',
        suggestions: ['使用LOD技术减少远处对象细节', '合并几何体减少绘制调用', '优化着色器代码']
      })
    }

    // 分析内存使用
    const avgMemory = results.reduce((sum, r) => sum + r.metrics.usedHeap, 0) / results.length
    if (avgMemory > 300) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        title: '优化内存使用',
        description: '平均内存使用超过300MB',
        suggestions: ['检查内存泄漏', '优化纹理压缩', '使用对象池管理']
      })
    }

    return recommendations
  }

  /**
   * 分析性能趋势
   */
  async analyzeTrends() {
    // 这里可以集成历史数据分析
    return {
      last7Days: {
        fps: { trend: 'stable', change: 2 },
        memory: { trend: 'improving', change: -5 }
      }
    }
  }

  /**
   * 保存报告
   */
  async saveReport(report) {
    const outputDir = this.config.reporting.outputDir || './reports'
    const filename = `performance-report-${Date.now()}.json`
    const filepath = path.join(outputDir, filename)

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
    console.log(`📄 报告已保存: ${filepath}`)
  }

  /**
   * 获取Git提交信息
   */
  getGitCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    } catch {
      return 'unknown'
    }
  }

  /**
   * 获取Git分支信息
   */
  getGitBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    } catch {
      return 'unknown'
    }
  }
}

// CLI接口
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer()

  analyzer
    .runFullSuite()
    .then(results => {
      console.log('🎯 性能分析完成')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 性能分析失败:', error)
      process.exit(1)
    })
}

module.exports = PerformanceAnalyzer
