# MathJax 公式渲染修复指南

## 🎯 问题描述

之前遇到的问题：

- ⚠️ 公式渲染失败
- MathJax 配置文件损坏
- 缺少统一的错误处理和重试机制

## ✅ 已完成的修复

### 1. 修复 `index.html` 中的 MathJax 配置

**问题：** 配置文件中的 `inlineMath` 数组被破坏

**修复：**

```javascript
window.MathJax = {
  tex: {
    inlineMath: [
      ['\\(', '\\)'],
      ['$', '$']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    macros: {
      vec: ['\\overrightarrow{#1}', 1],
      R: '\\mathbb{R}',
      C: '\\mathbb{C}'
    },
    packages: { '[+]': ['ams', 'physics', 'color'] }
  },
  startup: {
    pageReady: () => {
      return window.MathJax.startup.defaultPageReady().then(() => {
        console.log('✅ MathJax 已成功加载并初始化')
        window.dispatchEvent(new Event('mathjax-ready'))
      })
    }
  }
}
```

### 2. 创建全局 MathJax 管理器

**文件：** `src/utils/mathjax.ts`

**功能：**

- ✅ 统一的 MathJax 初始化管理
- ✅ 自动重试机制（指数退避）
- ✅ 公式清理和包装
- ✅ 错误处理和状态管理
- ✅ 单例模式，全局共享

**使用方法：**

```typescript
import { mathJaxManager, typesetMath, cleanFormula } from '@/utils/mathjax'

// 等待 MathJax 就绪
await mathJaxManager.waitForReady()

// 渲染公式（自动重试）
await mathJaxManager.typeset([element])

// 清理公式
const cleaned = mathJaxManager.cleanFormula('$x^2 + y^2 = z^2$')

// 包装公式
const wrapped = mathJaxManager.wrapFormula('E = mc^2', false)
```

### 3. 更新 MathFormula 组件

**文件：** `src/components/MathFormula.vue`

**改进：**

- ✅ 使用全局管理器统一处理
- ✅ 简化代码逻辑
- ✅ 自动重试机制
- ✅ 更好的错误提示
- ✅ 清理资源管理

**使用示例：**

```vue
<template>
  <MathFormula
    formula="x^0 = ct, \quad x^i = (x, y, z)"
    :inline="false"
    size="large"
    color="#64ffda"
  />
</template>
```

## 🧪 测试

### 测试文件

- `mathjax-fix-test.html` - 独立测试页面

### 运行测试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中打开
http://localhost:5173/mathjax-fix-test.html
```

### 测试内容

1. ✅ 时空同一化方程：`x^0 = ct, \quad x^i = (x, y, z)`
2. ✅ 统一场方程：`\nabla^2 \phi = 4\pi G\rho`
3. ✅ 向量场方程：`\vec{F} = m\vec{a}`
4. ✅ 爱因斯坦场方程：`R_{\mu\nu} - \frac{1}{2}Rg_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}`

## 🔧 配置选项

### MathJax 管理器配置

```typescript
mathJaxManager.updateConfig({
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
  timeout: 10000 // 加载超时（毫秒）
})
```

### 支持的公式格式

- 行内公式：`$...$` 或 `\(...\)`
- 显示公式：`$$...$$` 或 `\[...\]`
- 向量符号：`\vec{x}` 自动转换为 `\overrightarrow{x}`

## 📊 性能优化

### 自动重试机制

- 第 1 次重试：延迟 1 秒
- 第 2 次重试：延迟 2 秒
- 第 3 次重试：延迟 4 秒
- 超过 3 次：显示错误提示

### 资源管理

- 组件卸载时自动清理 MathJax 渲染
- 避免内存泄漏
- 优化重复渲染

## 🎨 UI 状态

### 加载状态

```
🔄 渲染中...
```

### 错误状态

```
⚠️ 公式渲染失败 [重试]
```

### 成功状态

```
显示渲染后的公式
```

## 🚀 使用建议

### 1. 在组件中使用

```vue
<script setup>
  import MathFormula from '@/components/MathFormula.vue'
</script>

<template>
  <MathFormula formula="E = mc^2" :inline="true" size="medium" />
</template>
```

### 2. 在代码中使用

```typescript
import { mathJaxManager } from '@/utils/mathjax'

// 等待就绪
await mathJaxManager.waitForReady()

// 渲染元素
const element = document.getElementById('formula')
element.textContent = '\\[E = mc^2\\]'
await mathJaxManager.typeset([element])
```

### 3. 批量渲染

```typescript
const elements = document.querySelectorAll('.math-formula')
await mathJaxManager.typeset(Array.from(elements))
```

## 🐛 故障排除

### 问题：公式一直显示"渲染中..."

**解决：**

1. 检查浏览器控制台是否有错误
2. 确认 MathJax CDN 可访问
3. 检查公式语法是否正确

### 问题：公式显示"渲染失败"

**解决：**

1. 点击"重试"按钮
2. 检查公式语法
3. 查看控制台错误信息

### 问题：向量符号显示异常

**解决：**

- 使用 `\vec{x}` 会自动转换为 `\overrightarrow{x}`
- 或直接使用 `\overrightarrow{x}`

## 📝 注意事项

1. **公式格式**：确保公式语法符合 LaTeX 标准
2. **特殊字符**：使用 `\` 转义特殊字符
3. **性能**：避免在短时间内渲染大量公式
4. **错误处理**：始终处理渲染失败的情况

## 🎉 总结

通过这次修复，我们实现了：

- ✅ 修复了 MathJax 配置错误
- ✅ 创建了统一的全局管理器
- ✅ 实现了自动重试机制
- ✅ 优化了组件代码
- ✅ 提供了完整的测试页面

现在公式渲染更加稳定可靠！🚀
