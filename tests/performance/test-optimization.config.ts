/**
 * 测试性能优化配置
 * 该文件包含针对大型测试套件的优化配置
 */

export const TEST_OPTIMIZATION_CONFIG = {
  // 并行测试配置
  parallelism: {
    maxThreads: Math.max(1, Math.floor(require('os').cpus().length / 2)),
    minThreads: 1,
    isolate: true
  },

  // 内存管理
  memory: {
    maxMemory: '1G', // 最大内存限制
    gcInterval: 5000 // GC 间隔 (ms)
  },

  // 缓存策略
  cache: {
    enabled: true,
    strategy: 'filesystem',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  },

  // 超时配置
  timeouts: {
    test: 6000, // 单个测试超时
    hook: 3000, // 钩子超时
    suite: 30000 // 测试套件超时
  },

  // 测试分类和优先级
  testCategories: {
    unit: {
      timeout: 2000,
      priority: 'high',
      concurrency: 'high'
    },
    component: {
      timeout: 4000,
      priority: 'medium',
      concurrency: 'medium'
    },
    integration: {
      timeout: 8000,
      priority: 'low',
      concurrency: 'low'
    },
    e2e: {
      timeout: 15000,
      priority: 'low',
      concurrency: 'serial'
    }
  },

  // 资源限制
  resourceLimits: {
    maxConcurrentTests: 10,
    maxConcurrentSuites: 5,
    maxHeapSize: '512mb'
  },

  // 性能监控指标
  performanceMetrics: {
    slowTestThreshold: 1000, // 慢测试阈值 (ms)
    memoryLeakThreshold: '10mb', // 内存泄漏阈值
    testRetries: 2 // 测试重试次数
  }
}

// 测试执行策略
export const TEST_EXECUTION_STRATEGY = {
  // 智能测试选择
  testSelection: {
    // 基于变更的测试选择
    changedFiles: true,
    // 最近失败的测试优先
    failedFirst: true,
    // 长时间运行的测试分离
    separateSlowTests: true
  },

  // 依赖预加载
  preloading: {
    // 预加载常用模块
    modules: [
      'react',
      'react-dom',
      '@testing-library/react',
      'three'
    ],
    // 模块缓存策略
    cacheStrategy: 'aggressive'
  },

  // 监控和报告
  monitoring: {
    // 实时性能监控
    realTimeMetrics: true,
    // 内存使用跟踪
    memoryTracking: true,
    // CPU 使用率监控
    cpuTracking: true
  }
}

// 测试环境优化
export const ENVIRONMENT_OPTIMIZATIONS = {
  // Node.js 优化
  node: {
    // 启用 V8 优化
    v8Optimizations: true,
    // 垃圾回收策略
    gcStrategy: 'aggressive',
    // 堆大小优化
    heapSize: 'auto'
  },

  // 浏览器环境优化
  browser: {
    // 虚拟内存优化
    virtualMemory: '1gb',
    // GPU 加速设置
    gpuAcceleration: false, // 测试中禁用 GPU 加速
    // 视口优化
    viewport: '1024x768'
  },

  // 网络优化
  network: {
    // 请求延迟模拟
    latency: 0,
    // 带宽限制
    bandwidth: 'unlimited',
    // 离线模式
    offline: false
  }
}