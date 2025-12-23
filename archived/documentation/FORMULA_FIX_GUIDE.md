# 公式渲染问题修复指南

## 问题诊断步骤

### 1. 打开浏览器开发者工具

- Windows/Linux: 按 `F12` 或 `Ctrl+Shift+I`
- Mac: 按 `Cmd+Option+I`

### 2. 运行诊断脚本

在控制台中粘贴并运行 `fix-formula-rendering.js` 的内容，或者直接运行：

```javascript
// 快速检查 MathJax 状态
console.log('MathJax:', !!window.MathJax)
console.log('typesetPromise:', !!(window.MathJax && window.MathJax.typesetPromise))

// 手动重新渲染所有公式
if (window.MathJax && window.MathJax.typesetPromise) {
  window.MathJax.typesetClear()
  window.MathJax.typesetPromise()
    .then(() => {
      console.log('✅ 渲染成功')
    })
    .catch(err => {
      console.error('❌ 渲染失败:', err)
    })
}
```

### 3. 常见问题和解决方案

#### 问题 1: MathJax 未加载

**症状**: 控制台显示 `MathJax: false`

**解决方案**:

1. 检查网络连接
2. 检查 `index.html` 中的 MathJax CDN 链接
3. 尝试刷新页面 (Ctrl+F5 强制刷新)

#### 问题 2: 公式显示为原始 LaTeX 代码

**症状**: 看到 `$\vec{r}(t) = ...$` 而不是渲染后的公式

**解决方案**:

```javascript
// 在控制台运行
window.MathJax.typesetPromise()
```

#### 问题 3: 公式渲染失败并显示错误

**症状**: 看到 "公式渲染失败" 或 "重试" 按钮

**解决方案**:

1. 点击"重试"按钮
2. 或在控制台运行:

```javascript
// 清除并重新渲染
window.MathJax.typesetClear()
await window.MathJax.typesetPromise()
```

#### 问题 4: 部分公式渲染成功，部分失败

**症状**: 有些公式显示正常，有些显示错误

**解决方案**:

```javascript
// 找到所有错误的公式元素
const errorElements = document.querySelectorAll('.formula-error')
console.log('错误元素数量:', errorElements.length)

// 逐个检查
errorElements.forEach((el, i) => {
  console.log(
    `错误 ${i + 1}:`,
    el.closest('.formula-card')?.querySelector('.formula-name')?.textContent
  )
})

// 重新渲染
window.MathJax.typesetPromise()
```

### 4. 测试公式渲染

#### 使用测试页面

打开 `test-formula-simple.html` 或 `formula-debug.html` 来测试基本的公式渲染功能。

#### 手动测试单个公式

```javascript
// 创建测试元素
const testDiv = document.createElement('div')
testDiv.textContent = '\\[E = mc^2\\]'
document.body.appendChild(testDiv)

// 渲染
await window.MathJax.typesetPromise([testDiv])
```

### 5. 检查公式语法

确保公式使用正确的 LaTeX 语法：

✅ 正确:

```latex
$\vec{r}(t) = \vec{C}t$
\[\frac{d\vec{P}}{dt} = \vec{F}\]
```

❌ 错误:

```latex
$\vec{r}(t) = \vec{C}t  // 缺少结束符
\[\frac{d\vec{P}}{dt} = \vec{F}  // 缺少结束符
```

### 6. 性能优化建议

如果页面有很多公式导致渲染缓慢：

1. **启用缓存**: 已在 `mathjax.ts` 中配置
2. **批量渲染**: 已在 `mathjax.ts` 中实现
3. **懒加载**: 可以在配置中启用

```javascript
// 检查性能指标
if (window.mathJaxManager) {
  console.log(window.mathJaxManager.getMetrics())
}
```

### 7. 重置应用状态

如果所有方法都失败，尝试完全重置：

```javascript
// 1. 清除所有渲染
window.MathJax.typesetClear()

// 2. 刷新页面
location.reload()

// 3. 清除缓存并刷新 (Ctrl+Shift+R 或 Cmd+Shift+R)
```

## 开发者调试

### 启用详细日志

在 `src/utils/mathjax.ts` 中添加更多日志：

```typescript
console.log('渲染公式:', formula)
console.log('清理后:', cleaned)
console.log('包装后:', wrapped)
```

### 监听 MathJax 事件

```javascript
window.addEventListener('mathjax-ready', () => {
  console.log('✅ MathJax 就绪事件触发')
})
```

### 检查组件状态

在 Vue DevTools 中检查 `MathFormula` 组件的状态：

- `isLoading`: 是否正在加载
- `hasError`: 是否有错误
- `formula`: 公式内容

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 浏览器版本和操作系统
2. 控制台错误信息
3. 失败的公式内容
4. 诊断脚本的输出结果
