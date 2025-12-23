# 🔧 故障排除指南

## 常见问题解决方案

### 1. MathJax 公式不显示

**问题**: 页面加载后公式显示为 LaTeX 代码而不是渲染后的数学公式

**解决方案**:

```bash
# 1. 检查网络连接
# MathJax 从 CDN 加载，需要网络连接

# 2. 清除浏览器缓存
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete

# 3. 检查浏览器控制台
# 打开开发者工具 (F12) 查看是否有错误

# 4. 等待几秒钟
# MathJax 需要时间加载和渲染
```

**已修复**: 移除了不可用的 polyfill.io CDN

### 2. Chrome 扩展错误

**问题**: 控制台显示 "Attempting to use a disconnected port object"

**原因**: 这是浏览器扩展的问题，不影响网站功能

**解决方案**:

- 可以安全忽略这些错误
- 或者禁用相关的 Chrome 扩展
- 使用无痕模式测试（Ctrl+Shift+N）

### 3. 开发服务器启动失败

**问题**: `npm run dev` 命令失败

**解决方案**:

```bash
# 1. 检查 Node.js 版本
node --version  # 需要 >= 16.0.0

# 2. 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 3. 清除 npm 缓存
npm cache clean --force

# 4. 使用 pnpm（推荐）
npm install -g pnpm
pnpm install
pnpm dev
```

### 4. TypeScript 类型错误

**问题**: 构建时出现类型错误

**解决方案**:

```bash
# 1. 运行类型检查
npm run type-check

# 2. 查看具体错误信息
# 根据错误提示修复类型问题

# 3. 确保所有依赖已安装
npm install
```

### 5. Tailwind CSS 样式不生效

**问题**: 自定义样式不显示

**解决方案**:

```bash
# 1. 检查 tailwind.config.js 的 content 配置
# 确保包含所有 Vue 文件路径

# 2. 重启开发服务器
# Ctrl+C 停止，然后 npm run dev

# 3. 清除构建缓存
rm -rf dist .vite
npm run dev
```

### 6. 路由 404 错误

**问题**: 刷新页面后显示 404

**解决方案**:

```bash
# 开发环境：
# Vite 自动处理，不应该出现此问题

# 生产环境：
# 需要配置服务器重定向所有请求到 index.html
# 参见 DEPLOYMENT.md
```

### 7. 公式渲染缓慢

**问题**: 页面加载后公式渲染需要很长时间

**优化方案**:

```typescript
// 已实现：使用 setTimeout 延迟渲染
setTimeout(() => typeset(), 100)

// 可选：使用 IntersectionObserver 懒加载
// 只渲染可见区域的公式
```

### 8. 3D 可视化不工作

**状态**: 3D 可视化框架已搭建，Three.js 实现待完成

**临时方案**:

- 当前显示占位符界面
- 可以选择不同场景
- 参数控制面板已就绪

**开发计划**:

- 将在后续版本中实现完整的 Three.js 场景

## 性能优化建议

### 1. 开发环境优化

```bash
# 使用 pnpm 代替 npm（更快）
npm install -g pnpm
pnpm install

# 启用 Vite 的 HMR
# 已默认启用，修改代码后自动刷新
```

### 2. 生产环境优化

```bash
# 构建前进行类型检查
npm run type-check

# 构建生产版本
npm run build

# 分析打包大小
npm run analyze

# 预览生产版本
npm run preview
```

### 3. 浏览器优化

- 使用最新版本的 Chrome/Firefox/Safari
- 启用硬件加速
- 清除浏览器缓存
- 禁用不必要的扩展

## 调试技巧

### 1. 查看 MathJax 状态

```javascript
// 在浏览器控制台运行
console.log('MathJax:', window.MathJax)
console.log('MathJax Ready:', !!window.MathJax?.typesetPromise)
```

### 2. 手动触发公式渲染

```javascript
// 在浏览器控制台运行
if (window.MathJax?.typesetPromise) {
  window.MathJax.typesetPromise()
    .then(() => console.log('✅ 渲染成功'))
    .catch(err => console.error('❌ 渲染失败:', err))
}
```

### 3. 检查路由状态

```javascript
// 在浏览器控制台运行
console.log('Current Route:', window.location.pathname)
```

### 4. Vue DevTools

```bash
# 安装 Vue DevTools 浏览器扩展
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org

# 使用 DevTools 查看：
# - 组件树
# - 组件状态
# - 路由信息
# - Pinia 状态
```

## 环境检查清单

运行项目前，确保：

- [ ] Node.js >= 16.0.0
- [ ] npm >= 7.0.0 或 pnpm >= 6.0.0
- [ ] 网络连接正常（用于加载 CDN 资源）
- [ ] 端口 5173 未被占用
- [ ] 浏览器版本较新（Chrome 90+, Firefox 88+, Safari 14+）

## 获取帮助

如果以上方案都无法解决问题：

1. **查看文档**
   - README.md
   - QUICKSTART.md
   - docs/API.md

2. **检查 Issues**
   - GitHub Issues
   - 搜索类似问题

3. **提交 Issue**
   - 描述问题
   - 提供错误信息
   - 说明环境信息

4. **联系我们**
   - 📧 Email: support@utf-star.com
   - 💬 Discord: UTF Star Community

## 快速修复命令

```bash
# 完全重置项目
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev

# 或使用 pnpm
rm -rf node_modules pnpm-lock.yaml dist .vite
pnpm install
pnpm dev
```

---

**大多数问题都可以通过重新安装依赖和清除缓存解决** 🔧
