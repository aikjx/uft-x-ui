# 部署指南

## 🚀 快速部署

### 1. 本地开发环境部署

```bash
# 克隆项目
git clone https://github.com/your-username/unified-field-theory-visualization.git
cd unified-field-theory-visualization

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

### 2. 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 构建产物位于 dist/ 目录
ls dist/
```

## ☁️ 云平台部署

### Vercel 部署 (推荐)

1. **一键部署**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 部署到 Vercel
   vercel --prod
   ```

2. **GitHub 集成**
   - 推送代码到 GitHub
   - 在 Vercel 中导入项目
   - 自动部署生效

### Netlify 部署

1. **手动部署**
   ```bash
   # 构建项目
   npm run build
   
   # 上传 dist/ 目录到 Netlify
   ```

2. **Git 集成**
   - 连接 GitHub 仓库
   - 设置构建命令: `npm run build`
   - 设置发布目录: `dist`

### AWS S3 + CloudFront

```bash
# 安装 AWS CLI
pip install awscli

# 配置 AWS 凭证
aws configure

# 创建 S3 存储桶
aws s3 mb s3://your-bucket-name

# 上传构建文件
aws s3 sync dist/ s3://your-bucket-name --delete

# 配置 CloudFront 分发
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 📦 容器化部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建 Docker 镜像
docker build -t unified-field-theory-app .

# 运行容器
docker run -p 80:80 unified-field-theory-app
```

### Kubernetes 部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unified-field-theory-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: unified-field-theory
  template:
    metadata:
      labels:
        app: unified-field-theory
    spec:
      containers:
      - name: app
        image: unified-field-theory-app:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: unified-field-theory-service
spec:
  selector:
    app: unified-field-theory
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

## 🔧 环境配置

### 环境变量配置

```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_APP_TITLE="统一场论可视化平台"
VITE_ENABLE_ANALYTICS=true
VITE_MAX_PARTICLES=100000
VITE_PERFORMANCE_MODE=high
```

### 性能优化配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three'],
          'animation-vendor': ['framer-motion'],
          'charts-vendor': ['recharts']
        }
      }
    },
    
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

## 📊 性能监控部署

### Sentry 错误监控

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
})
```

### Google Analytics 集成

```typescript
// src/utils/analytics.ts
export const initAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    // 初始化 Google Analytics
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href
    })
  }
}
```

## 🔒 安全部署

### HTTPS 配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 内容安全策略 (CSP)

```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;">
```

## 🚢 持续部署流程

### GitHub Actions 自动化

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🧪 部署前检查清单

### 代码质量检查

```bash
# 运行所有测试
npm test

# 检查代码质量
npm run lint

# 检查类型错误
npm run type-check

# 构建验证
npm run build
```

### 性能检查

```bash
# 性能分析
npm run analyze

# 包大小检查
npm run bundle-size

# 性能基准测试
npm run benchmark
```

### 安全检查

```bash
# 安全漏洞扫描
npm audit

# 依赖安全性检查
npx snyk test

# 代码安全扫描
npm run security-scan
```

## 📈 监控和告警

### 健康检查端点

```typescript
// 健康检查 API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  })
})
```

### 性能监控配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'unified-field-theory-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## 🔄 回滚策略

### 快速回滚机制

```bash
# 查看部署历史
git log --oneline -10

# 回滚到特定版本
git revert <commit-hash>

# 强制回滚
git reset --hard <commit-hash>
```

### 蓝绿部署策略

```yaml
# 蓝绿部署配置
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    version: v1.2.0  # 当前版本
  ports:
    - port: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-v1.3.0  # 新版本
spec:
  replicas: 0  # 初始为0，逐步切换
```

## 📚 部署文档

### 部署架构图

```
用户请求 → CDN (CloudFront) → 负载均衡器 → 应用服务器 → 静态资源
                                           ↘ 数据库
                                           ↘ 缓存服务
```

### 部署流程

1. **开发环境** → 代码编写和单元测试
2. **测试环境** → 集成测试和功能验证
3. **预生产环境** → 性能测试和安全扫描
4. **生产环境** → 正式发布和监控

通过这套完整的部署方案，确保应用能够稳定、安全、高性能地运行在各种环境中。