# 🚀 MathJax 修复 - 快速测试指南

## ⚡ 一键测试

### Windows CMD

```cmd
test-mathjax.bat
```

### Windows PowerShell

```powershell
.\test-mathjax.ps1
```

### 手动测试

```bash
npm run dev
```

然后访问：http://localhost:5173/mathjax-fix-test.html

---

## 📋 测试检查清单

打开测试页面后，确认以下内容：

### ✅ 状态指示器

- [ ] 顶部显示 "✅ MathJax 已就绪"（不是"正在加载"）

### ✅ 公式渲染

- [ ] **时空同一化方程** 正确显示
- [ ] **统一场方程** 正确显示
- [ ] **向量场方程** 正确显示（向量箭头）
- [ ] **爱因斯坦场方程** 正确显示

### ✅ 控制台

- [ ] 显示 "✅ MathJax 已成功加载并初始化"
- [ ] 显示 4 条 "✅ 公式 formulaX 渲染成功"
- [ ] 无红色错误信息

---

## 🎯 预期效果

### 时空同一化方程

应该看到：

```
x⁰ = ct,    xⁱ = (x, y, z)
```

### 统一场方程

应该看到：

```
∇²φ = 4πGρ
```

### 向量场方程

应该看到：

```
F⃗ = ma⃗
```

（注意向量上方的箭头）

### 爱因斯坦场方程

应该看到：

```
Rμν - ½Rgμν = (8πG/c⁴)Tμν
```

---

## 🐛 如果出现问题

### 问题 1：一直显示"正在加载"

**原因：** MathJax CDN 加载失败

**解决：**

1. 检查网络连接
2. 尝试刷新页面（F5）
3. 检查浏览器控制台错误

### 问题 2：显示"⚠️ 渲染失败"

**原因：** 公式语法错误或 MathJax 未就绪

**解决：**

1. 点击"重试"按钮
2. 查看控制台详细错误
3. 确认 MathJax 已加载

### 问题 3：向量箭头不显示

**原因：** 向量宏未正确配置

**解决：**

- 已自动转换 `\vec{x}` 为 `\overrightarrow{x}`
- 如果仍有问题，检查 `index.html` 中的宏定义

---

## 📱 在应用中测试

测试页面验证通过后，在实际应用中使用：

```vue
<template>
  <MathFormula
    formula="x^0 = ct, \quad x^i = (x, y, z)"
    :inline="false"
    size="large"
    color="#64ffda"
  />
</template>

<script setup>
  import MathFormula from '@/components/MathFormula.vue'
</script>
```

---

## 📊 性能指标

正常情况下：

- MathJax 加载时间：< 2 秒
- 单个公式渲染：< 100ms
- 页面首次渲染：< 3 秒

如果超过这些时间，可能存在网络或配置问题。

---

## 🎉 成功标志

当你看到：

- ✅ 所有公式正确渲染
- ✅ 控制台无错误
- ✅ 向量箭头正确显示
- ✅ 公式可以点击缩放

**恭喜！修复成功！** 🎊

---

## 📚 更多信息

- 详细指南：`MATHJAX_FIX_GUIDE.md`
- 修复总结：`MATHJAX_修复完成.md`
- 源码：`src/utils/mathjax.ts`
- 组件：`src/components/MathFormula.vue`

---

## 💬 需要帮助？

如果测试失败，请提供：

1. 浏览器控制台截图
2. 测试页面截图
3. 错误信息

祝测试顺利！🚀
