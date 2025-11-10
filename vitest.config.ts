import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// 获取 __dirname 在 ES 模块中的兼容实现
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig({
  plugins: [react()],
  test: {
    // 基础配置
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    // 测试执行优化
    threads: true, // 启用并行测试
    maxThreads: 4, // 最大线程数
    minThreads: 2, // 最小线程数
    isolate: true, // 隔离测试环境
    pool: 'threads', // 使用线程池执行测试
    
    // 测试文件匹配
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // 覆盖率高级配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'], // 增加 lcov 格式支持 CI 集成
      exclude: [
        'node_modules/', 
        'tests/', 
        '**/*.d.ts', 
        'src/main.tsx',
        'src/App.tsx',
        '**/index.ts'
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        lines: 80, // 行覆盖率目标
        functions: 80, // 函数覆盖率目标
        branches: 70, // 分支覆盖率目标
        statements: 80 // 语句覆盖率目标
      },
      all: true, // 检查所有文件的覆盖率，包括未测试的文件
      clean: true // 每次生成覆盖率报告时清理之前的结果
    },
    
    // 超时配置优化
    testTimeout: 8000, // 减少超时时间以提高效率
    hookTimeout: 5000, // 钩子函数超时时间
    
    // 缓存优化
    cache: {
      dir: '.vitest/cache', // 自定义缓存目录
      enabled: true // 启用测试缓存
    },
    
    // 依赖预加载
    deps: {
      interopDefault: true, // 自动处理 CommonJS 模块的 default 导出
      external: ['react', 'react-dom', 'three'], // 外部化大型依赖
      inline: ['@testing-library/react', '@testing-library/jest-dom'] // 内联常用测试库
    },
    
    // 报告优化
    reporters: ['default'], // 使用默认报告
    outputFile: { html: 'test-results/index.html' }, // HTML 报告输出位置
    
    // 监视模式优化
    watch: {
      ignored: ['node_modules/**', 'dist/**', 'coverage/**'],
      include: ['src/**/*.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}']
    },
    
    // 基础路径别名
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // 项目级路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, './')
    },
    conditions: ['browser', 'development'], // 优先使用浏览器环境的模块
    dedupe: ['react', 'react-dom'] // 防止重复加载核心库
  },
  
  // 构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', '@testing-library/react', 'vitest'],
    exclude: ['node_modules/**'],
    force: false // 避免不必要的依赖优化
  }
})
