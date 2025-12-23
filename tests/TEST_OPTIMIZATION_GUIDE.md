# 测试优化指南

本文档提供了针对 Unified Field Theory Visualization 项目的测试优化指南。

## 📊 优化概览

### 当前优化状态

- ✅ 测试配置优化完成
- ✅ 性能监控工具已实现
- ✅ 智能测试运行器已部署
- ✅ 单元测试结构已优化

### 性能目标

- 测试执行时间减少 30-50%
- 内存使用降低 20-30%
- 测试覆盖率提高至 85%+
- 并行测试效率提升 2-3倍

## 🚀 快速开始

### 使用优化后的测试命令

```bash
# 运行所有测试
pnpm test

# 按类型运行测试
pnpm test:unit        # 单元测试
pnpm test:components   # 组件测试
pnpm test:integration  # 集成测试
pnpm test:services    # 服务测试

# 性能测试
pnpm test:benchmark   # 基准测试
pnpm test:performance # 性能测试

# 覆盖率测试
pnpm test:coverage    # 生成覆盖率报告

# UI 模式测试
pnpm test:ui          # Vitest UI 界面
```

## ⚙️ 配置优化

### Vitest 配置优化 (`vitest.config.ts`)

```typescript
// 主要优化特性：
// - 动态线程数管理 (基于 CPU 核心数)
// - 智能缓存策略
// - 优化的超时设置
// - 依赖预加载
// - 类型化路径别名
```

### 性能监控

```typescript
import { testPerformanceMonitor } from './tests/performance/performance-monitor'
import { testRunner } from './tests/performance/test-runner'

// 启动性能监控
const report = testPerformanceMonitor.startTestRun()

// 获取性能趋势
const trends = testRunner.getPerformanceTrends()
```

## 🏗️ 测试架构优化

### 测试目录结构

```
tests/
├── performance/           # 性能测试工具
│   ├── performance-monitor.ts    # 性能监控
│   ├── test-runner.ts             # 智能运行器
│   └── test-optimization.config.ts # 优化配置
├── unit/                  # 单元测试
│   ├── basic.test.ts
│   ├── hooks/             # React Hooks 测试
│   ├── utils/             # 工具函数测试
│   └── components/        # 组件测试
├── integration/           # 集成测试
├── e2e/                  # 端到端测试
├── benchmark/             # 性能基准测试
└── setup.ts              # 测试环境设置
```

### 测试类型划分

| 测试类型 | 位置                 | 超时时间 | 并行度 | 用途              |
| -------- | -------------------- | -------- | ------ | ----------------- |
| 单元测试 | `tests/unit/`        | 2秒      | 高     | 测试单个函数/组件 |
| 组件测试 | `tests/components/`  | 4秒      | 中     | 测试 React 组件   |
| 集成测试 | `tests/integration/` | 8秒      | 低     | 测试模块集成      |
| E2E 测试 | `tests/e2e/`         | 15秒     | 串行   | 端到端测试        |

## 🎯 性能优化技巧

### 1. 避免不必要的渲染

```typescript
// ✅ 好的做法
const { result } = renderHook(() => useCustomHook())

// ❌ 避免的做法
const { result } = renderHook(() => useCustomHook(), {
  wrapper: ({ children }) => <Provider>{children}</Provider>
})
```

### 2. 使用智能模拟

```typescript
// 使用模块模拟而非全局模拟
vi.mock('@/services/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}))
```

### 3. 优化异步测试

```typescript
// ✅ 使用 waitFor 和 findBy
test('async operation', async () => {
  render(<AsyncComponent />)
  const result = await screen.findByText('Loaded')
  expect(result).toBeInTheDocument()
})
```

## 📈 性能监控指标

### 关键性能指标 (KPIs)

1. **测试执行时间**
   - 目标: < 30秒 (完整测试套件)
   - 监控: 实时性能追踪

2. **内存使用**
   - 目标: < 100MB 峰值内存
   - 监控: 内存泄漏检测

3. **测试覆盖率**
   - 目标: 行覆盖率 > 85%
   - 监控: 自动覆盖率报告

4. **并行效率**
   - 目标: 并行度 > CPU 核心数/2
   - 监控: 线程使用率

### 性能趋势分析

```typescript
// 获取性能趋势
const trends = testRunner.getPerformanceTrends()
console.log('测试性能趋势:', trends.trend) // 'improving' | 'declining' | 'stable'
```

## 🔧 故障排除

### 常见问题

#### 1. 测试超时

```bash
# 解决方案：增加超时时间或优化测试代码
pnpm test --testTimeout=10000
```

#### 2. 内存泄漏

```typescript
// 在 afterEach 中清理
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

#### 3. 并行测试冲突

```typescript
// 使用独立的测试环境
vi.setConfig({ isolate: true })
```

### 调试技巧

1. **启用详细日志**

```bash
pnpm test --reporter=verbose
```

2. **使用 Vitest UI**

```bash
pnpm test:ui
```

3. **性能分析**

```bash
# 生成性能报告
pnpm test:performance
```

## 🚀 持续优化

### 监控建议

1. **定期运行性能测试**

   ```bash
   pnpm test:benchmark
   ```

2. **分析覆盖率报告**

   ```bash
   pnpm test:coverage
   ```

3. **检查慢测试**
   ```bash
   # 查看慢测试列表
   pnpm test --reporter=verbose | grep "slow"
   ```

### 最佳实践

1. **保持测试独立** - 每个测试应该独立运行
2. **使用合适的模拟** - 避免过度模拟
3. **优化测试数据** - 使用最小的测试数据集
4. **定期重构** - 清理过时的测试代码

## 📚 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 最佳实践](https://testing-library.com/docs/)
- [React 测试指南](https://reactjs.org/docs/testing.html)

---

**注意**: 本指南基于项目当前配置，建议定期更新以反映最新的最佳实践和性能优化策略。
