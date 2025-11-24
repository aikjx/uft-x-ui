/**
 * 测试运行器优化脚本
 * 提供智能测试执行和性能优化功能
 */

import { spawn } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { testPerformanceMonitor } from './performance-monitor'

export class OptimizedTestRunner {
  private static instance: OptimizedTestRunner
  private config: TestRunnerConfig
  private results: TestRunResult[] = []

  private constructor(config?: Partial<TestRunnerConfig>) {
    this.config = {
      parallel: true,
      maxConcurrency: Math.max(1, Math.floor(require('os').cpus().length / 2)),
      cache: true,
      timeout: 60000,
      retryFailed: 2,
      watch: false,
      coverage: false,
      ...config
    }
  }

  static getInstance(config?: Partial<TestRunnerConfig>): OptimizedTestRunner {
    if (!OptimizedTestRunner.instance) {
      OptimizedTestRunner.instance = new OptimizedTestRunner(config)
    }
    return OptimizedTestRunner.instance
  }

  async runTests(options: TestRunOptions = {}): Promise<TestRunResult> {
    const startTime = Date.now()
    const testName = options.testName || 'all-tests'
    
    // 开始性能监控
    testPerformanceMonitor.startTestRun()
    testPerformanceMonitor.startTest(testName)

    try {
      const args = this.buildVitestArgs(options)
      const result = await this.executeVitest(args)
      
      const endTime = Date.now()
      const runResult: TestRunResult = {
        success: result.exitCode === 0,
        duration: endTime - startTime,
        testCount: result.testCount || 0,
        passed: result.passed || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        output: result.output,
        error: result.error,
        timestamp: new Date().toISOString()
      }

      // 结束性能监控
      testPerformanceMonitor.endTest(testName, result.exitCode === 0 ? 'passed' : 'failed')
      const performanceReport = testPerformanceMonitor.endTestRun()

      this.results.push(runResult)
      this.saveResults()

      console.log(`📊 测试执行完成:`)
      console.log(`  • 总耗时: ${runResult.duration}ms`)
      console.log(`  • 测试数量: ${runResult.testCount}`)
      console.log(`  • 通过: ${runResult.passed}`)
      console.log(`  • 失败: ${runResult.failed}`)
      console.log(`  • 跳过: ${runResult.skipped}`)
      
      if (performanceReport.performance.recommendations.length > 0) {
        console.log(`💡 优化建议:`)
        performanceReport.performance.recommendations.forEach(rec => {
          console.log(`  • ${rec}`)
        })
      }

      return runResult
    } catch (error) {
      testPerformanceMonitor.endTest(testName, 'failed')
      testPerformanceMonitor.endTestRun()
      
      throw error
    }
  }

  private buildVitestArgs(options: TestRunOptions): string[] {
    const args: string[] = []

    // 基础配置
    if (this.config.watch) {
      args.push('--watch')
    } else {
      args.push('run')
    }

    // 并行配置
    if (this.config.parallel) {
      args.push('--threads')
      args.push('--maxThreads', this.config.maxConcurrency.toString())
    }

    // 缓存配置
    if (this.config.cache) {
      args.push('--cache')
    }

    // 超时配置
    if (this.config.timeout) {
      args.push('--testTimeout', this.config.timeout.toString())
    }

    // 重试配置
    if (this.config.retryFailed > 0) {
      args.push('--retry', this.config.retryFailed.toString())
    }

    // 覆盖率配置
    if (this.config.coverage) {
      args.push('--coverage')
    }

    // 特定测试文件
    if (options.testFiles) {
      args.push(...options.testFiles)
    }

    // 测试模式
    if (options.testMode) {
      switch (options.testMode) {
        case 'unit':
          args.push('tests/unit')
          break
        case 'component':
          args.push('tests/components')
          break
        case 'integration':
          args.push('tests/integration')
          break
        case 'e2e':
          args.push('tests/e2e')
          break
      }
    }

    return args
  }

  private executeVitest(args: string[]): Promise<VitestResult> {
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['vitest', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: 'true' }
      })

      let output = ''
      let error = ''

      child.stdout?.on('data', (data) => {
        output += data.toString()
        process.stdout.write(data)
      })

      child.stderr?.on('data', (data) => {
        error += data.toString()
        process.stderr.write(data)
      })

      child.on('close', (code) => {
        const result: VitestResult = {
          exitCode: code || 0,
          output,
          error
        }

        // 解析测试统计信息
        const match = output.match(/Tests\s+(\d+)\s+passed\s+(\d+)\s+failed\s+(\d+)\s+skipped/)
        if (match) {
          result.testCount = parseInt(match[1])
          result.passed = parseInt(match[2])
          result.failed = parseInt(match[3])
          result.skipped = parseInt(match[4])
        }

        if (code === 0) {
          resolve(result)
        } else {
          reject(new Error(`测试执行失败，退出码: ${code}\n${error}`))
        }
      })

      child.on('error', reject)

      // 设置超时
      if (this.config.timeout) {
        setTimeout(() => {
          child.kill()
          reject(new Error(`测试执行超时 (${this.config.timeout}ms)`))
        }, this.config.timeout)
      }
    })
  }

  private saveResults(): void {
    const resultsFile = join(__dirname, 'test-results.json')
    try {
      const existingData = existsSync(resultsFile) 
        ? JSON.parse(readFileSync(resultsFile, 'utf8')) 
        : { runs: [] }
      
      existingData.runs.push(...this.results)
      
      // 只保留最近20次运行结果
      if (existingData.runs.length > 20) {
        existingData.runs = existingData.runs.slice(-20)
      }
      
      require('fs').writeFileSync(resultsFile, JSON.stringify(existingData, null, 2))
      this.results = [] // 清空当前结果
    } catch (error) {
      console.warn('无法保存测试结果:', error)
    }
  }

  getRunHistory(): TestRunResult[] {
    const resultsFile = join(__dirname, 'test-results.json')
    if (existsSync(resultsFile)) {
      try {
        const data = JSON.parse(readFileSync(resultsFile, 'utf8'))
        return data.runs || []
      } catch (error) {
        console.warn('无法加载测试历史:', error)
      }
    }
    return []
  }

  getPerformanceTrends(): PerformanceTrends {
    const history = this.getRunHistory()
    if (history.length < 2) {
      return { trend: 'stable', confidence: 'low', metrics: {} }
    }

    const durations = history.map(r => r.duration)
    const successRates = history.map(r => (r.passed / r.testCount) * 100)

    return {
      trend: this.calculateTrend(durations, successRates),
      confidence: 'medium',
      metrics: {
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        averageSuccessRate: successRates.reduce((a, b) => a + b, 0) / successRates.length,
        durationChange: this.calculateChange(durations),
        successRateChange: this.calculateChange(successRates)
      }
    }
  }

  private calculateTrend(durations: number[], successRates: number[]): 'improving' | 'declining' | 'stable' {
    const durationTrend = this.linearRegression(durations)
    const successTrend = this.linearRegression(successRates)
    
    if (durationTrend.slope < -0.1 && successTrend.slope > 0.1) {
      return 'improving'
    } else if (durationTrend.slope > 0.1 && successTrend.slope < -0.1) {
      return 'declining'
    }
    
    return 'stable'
  }

  private linearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length
    const x = Array.from({ length: n }, (_, i) => i)
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = data.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return { slope, intercept }
  }

  private calculateChange(data: number[]): number {
    if (data.length < 2) return 0
    return ((data[data.length - 1] - data[0]) / data[0]) * 100
  }
}

// 类型定义
interface TestRunnerConfig {
  parallel: boolean
  maxConcurrency: number
  cache: boolean
  timeout: number
  retryFailed: number
  watch: boolean
  coverage: boolean
}

interface TestRunOptions {
  testName?: string
  testMode?: 'unit' | 'component' | 'integration' | 'e2e'
  testFiles?: string[]
  timeout?: number
}

interface VitestResult {
  exitCode: number
  output: string
  error: string
  testCount?: number
  passed?: number
  failed?: number
  skipped?: number
}

interface TestRunResult {
  success: boolean
  duration: number
  testCount: number
  passed: number
  failed: number
  skipped: number
  output: string
  error: string
  timestamp: string
}

interface PerformanceTrends {
  trend: 'improving' | 'declining' | 'stable'
  confidence: 'low' | 'medium' | 'high'
  metrics: {
    averageDuration: number
    averageSuccessRate: number
    durationChange: number
    successRateChange: number
  }
}

// 导出单例实例
export const testRunner = OptimizedTestRunner.getInstance()

// 便捷函数
export async function runUnitTests(): Promise<TestRunResult> {
  return testRunner.runTests({ testMode: 'unit', testName: 'unit-tests' })
}

export async function runComponentTests(): Promise<TestRunResult> {
  return testRunner.runTests({ testMode: 'component', testName: 'component-tests' })
}

export async function runIntegrationTests(): Promise<TestRunResult> {
  return testRunner.runTests({ testMode: 'integration', testName: 'integration-tests' })
}

export async function runAllTests(): Promise<TestRunResult> {
  return testRunner.runTests({ testName: 'all-tests' })
}