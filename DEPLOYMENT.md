# 🚀 统一场论探索网 - 部署指南

## 快速开始

### 1. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 2. 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 3. 构建生产版本
```bash
npm run build
```

### 4. 预览生产版本
```bash
npm run preview
```

## 部署到生产环境

### Vercel 部署（推荐）
1. 连接 GitHub 仓库
2. 自动检测 Vite 项目
3. 一键部署

### Netlify 部署
1. 构建命令：`npm run build`
2. 发布目录：`dist`
3. 自动部署

### 自托管服务器
```bash
# 构建
npm run build

# 将 dist 目录部署到 Nginx/Apache
# Nginx 配置示例：
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 环境变量

创建 `.env.production` 文件：
```env
VITE_APP_TITLE=统一场论探索网
VITE_API_URL=https://api.your-domain.com
```

## 性能优化

- ✅ 代码分割（Vue Router 懒加载）
- ✅ 资源压缩（Vite 自动处理）
- ✅ CDN 加速（MathJax, Google Fonts）
- ✅ 图片优化（WebP 格式）

## 国际化支持

项目已预留国际化接口，可轻松扩展多语言支持：
- 中文（默认）
- English
- 日本語
- Español

## 监控与分析

建议集成：
- Google Analytics
- Sentry（错误追踪）
- Lighthouse（性能监控）

## 技术支持

- 📧 Email: support@utf-star.com
- 🌐 Website: https://utf-star.com
- 💬 Discord: UTF Star Community

---

**让全球用户都能探索宇宙的终极奥秘！** 🌟
