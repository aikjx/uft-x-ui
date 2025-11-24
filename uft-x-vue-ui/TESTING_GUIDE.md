# 📊 自动化测试与性能监控指南

## 🎯 概述
本文档详细说明了项目的自动化测试体系、性能监控框架和CI/CD流水线，确保系统具备高可用性、可扩展性和稳定性。

## 🏗️ 测试架构概览

### 测试分层架构
```
┌─────────────────┐
│   E2E测试层     │ - Playwright端到端测试
├─────────────────┤
│  性能测试层     │ - Vitest性能基准测试
├─────────────────┤
│  集成测试层     │ - 组件交互测试
├─────────────────┤
│  单元测试层     │ - Vitest单元测试
└─────────────────┘
```

## 🔧 测试工具链

### 核心测试框架
- **Vitest**: 单元测试和性能基准测试
- **Playwright**: E2E测试和浏览器兼容性测试
- **Vue Test Utils**: Vue组件测试

### 性能监控工具
- **Performance API**: 实时性能指标采集
- **Three.js性能测试**: 三维渲染性能基准
- **自定义监控工具**: 内存、FPS、GPU监控

## 📋 测试执行流程

### 1. 单元测试执行
```bash
# 运行所有单元测试
npm run test:run

# 运行特定测试文件
npm run test:run -- tests/unit/components/FieldVisualizer.test.ts

# 生成覆盖率报告
npm run test:coverage
```

### 2. 性能基准测试
```bash
# 运行性能基准测试
npm run test:performance

# 生成性能报告
npm run test:performance -- --reporter=json > performance-report.json
```

### 3. E2E测试执行
```bash
# 运行所有E2E测试
npm run test:e2e

# 运行特定浏览器测试
npm run test:e2e -- --project=chromium

# 查看测试报告
npm run test:e2e:report
```

## 🎯 性能指标标准

### 核心性能阈值
| 指标 | 目标值 | 严重阈值 | 测量方法 |
|------|--------|----------|----------|
| FPS | >60fps | <30fps | requestAnimationFrame |
| 内存使用 | <300MB | >500MB | performance.memory |
| 启动时间 | <2s | >5s | performance.timing |
| LCP | <2.5s | >4s | Largest Contentful Paint |
| FID | <100ms | >300ms | First Input Delay |

### Three.js性能指标
| 操作类型 | 目标时间 | 测试场景 |
|----------|----------|----------|
| 几何体创建 | <10ms | 1000个简单几何体 |
| 材质创建 | <5ms | 1000个基础材质 |
| 网格对象创建 | <15ms | 1000个网格对象 |
| 场景渲染 | <16ms | 100个对象的复杂场景 |

## 🚀 CI/CD流水线

### 流水线阶段
1. **代码质量检查** - ESLint + TypeScript类型检查
2. **单元测试** - 覆盖率报告生成
3. **性能测试** - 性能基准验证
4. **E2E测试** - 多浏览器兼容性测试
5. **构建部署** - 生产环境部署

### 触发条件
- **Push到main分支**: 自动触发完整流水线
- **Pull Request**: 运行代码质量和单元测试
- **定时任务**: 每天凌晨2点运行性能测试

## 📊 测试报告与分析

### 单元测试报告
```bash
# 查看HTML覆盖率报告
open coverage/index.html

# 控制台覆盖率摘要
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files|   85.23 |    78.91 |   82.34 |   85.23 |                   
----------|---------|----------|---------|---------|-------------------
```

### 性能测试报告
```bash
# 性能基准测试结果
📊 Three.js 性能测试报告
==========================
几何体创建性能: 8.23ms ✅
材质创建性能: 3.45ms ✅
网格对象创建: 12.67ms ✅
场景渲染性能: 14.89ms ✅
```

### E2E测试报告
```bash
# Playwright HTML报告
open playwright-report/index.html

# 测试结果摘要
✓ 应用应正常加载 (1.2s)
✓ 三维场景应交互正常 (0.8s)
✓ 性能监控功能应正常工作 (1.5s)
✓ 数据加载和渲染应高效 (2.1s)
```

## 🔍 故障排查指南

### 常见测试问题

#### 1. 性能测试失败
**症状**: FPS低于30，内存使用超过阈值
**解决方案**:
- 检查Three.js对象池使用情况
- 优化几何体重用机制
- 减少不必要的材质创建

#### 2. E2E测试超时
**症状**: 页面加载时间超过5秒
**解决方案**:
- 检查网络连接状态
- 优化资源加载策略
- 增加测试超时时间

#### 3. 内存泄漏检测
**症状**: 内存使用持续增长
**解决方案**:
- 使用Chrome DevTools内存分析
- 检查Three.js对象销毁情况
- 实现内存监控告警

### 调试工具

#### 性能分析工具
```javascript
// 在浏览器控制台执行
console.profile('性能分析');
// 执行性能敏感操作
console.profileEnd();
```

#### 内存快照分析
```javascript
// 创建内存快照
window.performance.memory && console.log('内存使用:', 
  (window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
```

## 📈 持续优化策略

### 1. 性能监控持续改进
- 实时监控关键性能指标
- 设置性能告警阈值
- 定期生成性能报告

### 2. 测试覆盖率提升
- 每周审查测试覆盖率
- 针对低覆盖率模块补充测试
- 集成代码质量门禁

### 3. 自动化优化流程
- 性能回归自动检测
- 测试失败自动回滚
- 优化建议自动生成

## 🎯 最佳实践

### 测试编写指南
1. **AAA模式**: Arrange-Act-Assert
2. **单一职责**: 每个测试只验证一个功能
3. **可读性**: 使用描述性的测试名称
4. **独立性**: 测试之间不相互依赖

### 性能优化策略
1. **对象池化**: 重用Three.js对象
2. **懒加载**: 按需加载资源
3. **缓存策略**: 合理使用浏览器缓存
4. **代码分割**: 动态导入非关键功能

## 📚 参考资料

### 官方文档
- [Vitest官方文档](https://vitest.dev/)
- [Playwright官方文档](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

### 性能优化资源
- [Three.js性能优化指南](https://threejs.org/manual/#optimization)
- [Web性能最佳实践](https://web.dev/performance/)
- [Chrome DevTools使用指南](https://developer.chrome.com/docs/devtools/)

---

**维护者**: 架构优化团队  
**最后更新**: 2025-11-17  
**版本**: v2.0.0