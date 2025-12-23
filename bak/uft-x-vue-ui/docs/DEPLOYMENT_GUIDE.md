# 🚀 全自动代码优化系统 - 部署指南

## 📋 部署概览

本系统支持多种部署方式，从本地开发到生产环境，提供灵活的部署选择。

## 🛠️ 环境要求

### 基础要求

- **Node.js**: >= 16.0.0
- **pnpm**: >= 7.0.0 (推荐)
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+
- **内存**: 最少 4GB RAM
- **存储**: 最少 2GB 可用空间

### 推荐配置

- **Node.js**: 18.x LTS
- **内存**: 8GB+ RAM
- **SSD存储**: 10GB+ 可用空间
- **CPU**: 4核+处理器

## 🏠 本地开发部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd uft-x-vue-ui
```

### 2. 安装依赖

```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 访问应用

- **主应用**: http://localhost:3000
- **代码优化器**: http://localhost:3000/code-optimizer

### 5. 开发工具

```bash
# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# E2E测试
pnpm test:e2e
```

## 🐳 Docker部署

### 创建Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine as builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose配置

```yaml
version: '3.8'

services:
  code-optimizer:
    build: .
    ports:
      - '3000:80'
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

  # 可选：Redis缓存服务
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### 部署命令

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f code-optimizer

# 停止服务
docker-compose down
```

## 🌐 云平台部署

### Vercel部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
vercel --prod

# 配置域名
vercel --prod --domains code-optimizer.yourdomain.com
```

**vercel.json配置:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {},
  "rewrites": [
    {
      "source": "/code-optimizer/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Netlify部署

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 构建并部署
netlify deploy --prod --dir=dist
```

**netlify.toml配置:**

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/code-optimizer/*"
  to = "/index.html"
  status = 200

[build.processing]
  skip_processing = false
```

### AWS S3 + CloudFront

```bash
# 构建应用
pnpm build

# 安装AWS CLI
pip install awscli

# 同步到S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 使内容公开
aws s3 sync dist/ s3://your-bucket-name --delete --acl public-read
```

## ⚙️ Nginx配置

### 基础配置

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 启用缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API代理 (可选)
        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

## 🔧 环境配置

### 开发环境

```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_DEBUG=true
VITE_PERFORMANCE_MONITORING=true
VITE_LOG_LEVEL=debug
```

### 生产环境

```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_DEBUG=false
VITE_PERFORMANCE_MONITORING=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=your-sentry-dsn
```

### 测试环境

```bash
# .env.test
VITE_API_URL=http://test-api.yourdomain.com
VITE_DEBUG=true
VITE_PERFORMANCE_MONITORING=true
VITE_LOG_LEVEL=warn
```

## 📊 性能优化

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['tdesign-vue-next'],
          utils: ['@babel/parser', '@babel/traverse']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 缓存策略

```typescript
// Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('code-optimizer-v1').then(cache => {
      return cache.addAll(['/', '/code-optimizer', '/static/js/main.js', '/static/css/main.css'])
    })
  )
})
```

## 🔍 监控和日志

### 错误监控 (Sentry)

```typescript
// main.ts
import * as Sentry from '@sentry/vue'

app.use(
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: '1.0.0'
  })
)
```

### 性能监控

```typescript
// 性能指标收集
import { createPerformanceMonitor } from './services/performance-monitor'

const monitor = createPerformanceMonitor()
monitor.startMonitoring(5000)

// 上报性能数据
setInterval(() => {
  const stats = monitor.getStatistics()
  fetch('/api/performance', {
    method: 'POST',
    body: JSON.stringify(stats)
  })
}, 30000)
```

## 🔒 安全配置

### HTTPS配置

```bash
# 使用Let's Encrypt
certbot --nginx -d yourdomain.com
```

### CSP策略

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;"
/>
```

## 🚀 CI/CD流水线

### GitHub Actions

```yaml
name: Deploy Code Optimizer

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:coverage
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

## 🔧 故障排除

### 常见问题

#### 1. 内存不足

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

#### 2. 构建失败

```bash
# 清理缓存
rm -rf node_modules
rm -rf dist
rm -rf .vite
pnpm install
pnpm build
```

#### 3. 性能问题

```bash
# 启用生产模式调试
export VITE_DEBUG=true
export VITE_LOG_LEVEL=debug
pnpm dev
```

### 日志分析

```bash
# 查看构建日志
tail -f logs/build.log

# 查看应用日志
tail -f logs/application.log

# 错误日志
tail -f logs/error.log
```

## 📈 扩展部署

### 微服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   分析服务      │    │   优化服务      │
│   (Vue 3)      │    │   (Node.js)    │    │   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Redis缓存     │
                    └─────────────────┘
```

### Kubernetes部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-optimizer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-optimizer
  template:
    metadata:
      labels:
        app: code-optimizer
    spec:
      containers:
        - name: frontend
          image: your-registry/code-optimizer:latest
          ports:
            - containerPort: 80
          env:
            - name: NODE_ENV
              value: 'production'
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

---

## 🎯 部署检查清单

### 部署前

- [ ] 代码通过所有测试
- [ ] 类型检查无错误
- [ ] 构建成功
- [ ] 环境变量配置正确
- [ ] 安全审查通过

### 部署后

- [ ] 应用正常启动
- [ ] 所有页面可访问
- [ ] 性能指标正常
- [ ] 错误监控正常
- [ ] 日志记录正常
- [ ] 备份完成

### 监控检查

- [ ] 响应时间 < 2秒
- [ ] 错误率 < 1%
- [ ] 内存使用 < 80%
- [ ] CPU使用 < 70%
- [ ] 磁盘空间充足

按照此指南，您可以成功部署全自动代码优化系统到任何目标环境。
