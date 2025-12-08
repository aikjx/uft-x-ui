// 性能基准测试配置
export default {
  // 基准测试配置
  benchmarks: {
    // 渲染性能测试
    rendering: {
      iterations: 1000,
      timeout: 30000,
      metrics: ['fps', 'frameTime', 'drawCalls']
    },
    
    // 内存使用测试
    memory: {
      iterations: 100,
      timeout: 60000,
      metrics: ['usedHeap', 'totalHeap', 'heapLimit']
    },
    
    // 加载性能测试
    loading: {
      iterations: 50,
      timeout: 30000,
      metrics: ['loadTime', 'firstContentfulPaint', 'largestContentfulPaint']
    }
  },
  
  // 性能阈值
  thresholds: {
    // 渲染性能阈值
    rendering: {
      fps: {
        critical: 30,
        warning: 45,
        target: 60
      },
      frameTime: {
        critical: 33, // 对应30fps
        warning: 22,  // 对应45fps
        target: 16    // 对应60fps
      },
      drawCalls: {
        critical: 1000,
        warning: 500,
        target: 200
      }
    },
    
    // 内存使用阈值
    memory: {
      usedHeap: {
        critical: 500, // MB
        warning: 300,
        target: 150
      },
      heapUsage: {
        critical: 85, // %
        warning: 70,
        target: 50
      }
    },
    
    // 加载性能阈值
    loading: {
      loadTime: {
        critical: 5000, // ms
        warning: 3000,
        target: 2000
      },
      firstContentfulPaint: {
        critical: 3000,
        warning: 2000,
        target: 1500
      },
      largestContentfulPaint: {
        critical: 4000,
        warning: 2500,
        target: 2000
      }
    }
  },
  
  // 测试场景配置
  scenarios: {
    // 简单场景测试
    simple: {
      objects: 100,
      complexity: 'low',
      description: '基本渲染场景测试'
    },
    
    // 中等复杂度场景
    medium: {
      objects: 500,
      complexity: 'medium',
      description: '中等复杂度渲染测试'
    },
    
    // 高复杂度场景
    complex: {
      objects: 2000,
      complexity: 'high',
      description: '高复杂度压力测试'
    },
    
    // 极端场景测试
    extreme: {
      objects: 5000,
      complexity: 'extreme',
      description: '极限性能压力测试'
    }
  },
  
  // 浏览器配置
  browsers: {
    chrome: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    firefox: {
      headless: true
    },
    safari: {
      headless: true
    }
  },
  
  // 报告配置
  reporting: {
    // 输出格式
    formats: ['json', 'html', 'csv'],
    
    // 报告目录
    outputDir: './reports/performance',
    
    // 比较基准
    baseline: {
      enabled: true,
      file: './reports/baseline.json'
    },
    
    // 趋势分析
    trends: {
      enabled: true,
      days: 30
    }
  },
  
  // 通知配置
  notifications: {
    // Slack通知
    slack: {
      enabled: false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL
    },
    
    // 邮件通知
    email: {
      enabled: false,
      recipients: ['team@example.com']
    },
    
    // 阈值告警
    alerts: {
      // 性能下降告警
      performanceDrop: {
        enabled: true,
        threshold: 20 // 性能下降20%触发告警
      },
      
      // 内存泄漏告警
      memoryLeak: {
        enabled: true,
        threshold: 50 // 内存使用增加50%触发告警
      }
    }
  }
}