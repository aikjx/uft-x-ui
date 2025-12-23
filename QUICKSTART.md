# ⚡ 快速启动指南

## 🎯 5分钟上手

### 第一步：克隆项目

```bash
git clone https://github.com/your-org/utf-star.git
cd utf-star
```

### 第二步：安装依赖

```bash
npm install
# 或使用 pnpm（推荐，更快）
pnpm install
```

### 第三步：启动开发服务器

```bash
npm run dev
```

### 第四步：打开浏览器

访问 http://localhost:5173

🎉 **恭喜！你已经成功运行了统一场论探索网！**

## 📂 项目结构速览

```
utf_star/
├── src/
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue           # 首页
│   │   ├── FormulasView.vue       # 公式列表
│   │   ├── FormulaDetailView.vue  # 公式详情
│   │   ├── VisualizationView.vue  # 3D可视化
│   │   ├── LearnView.vue          # 学习路径
│   │   └── AboutView.vue          # 关于页面
│   ├── data/               # 数据文件
│   │   └── formulas.ts            # 17个核心公式
│   ├── types/              # TypeScript 类型
│   │   └── formula.ts             # 公式类型定义
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── assets/             # 静态资源
│   │   └── styles/
│   │       └── main.css           # 全局样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── docs/                   # 文档
│   ├── API.md                     # API 文档
│   └── FEATURES.md                # 功能特性
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
└── README.md               # 项目说明
```

## 🎨 核心功能体验

### 1. 浏览17个核心公式

- 访问 `/formulas` 查看所有公式
- 点击任意公式查看详情
- 使用分类筛选快速定位

### 2. 3D可视化体验

- 访问 `/visualization` 进入3D实验室
- 选择不同的物理场景
- 调节参数观察实时变化

### 3. 系统化学习

- 访问 `/learn` 查看学习路径
- 按照四个阶段循序渐进
- 点击公式深入学习

### 4. 了解理论背景

- 访问 `/about` 了解统一场论
- 探索核心思想
- 查看技术实现

## 🛠️ 常用命令

```bash
# 开发模式（热重载）
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 分析打包大小
npm run analyze
```

## 🎓 学习资源

### 推荐学习顺序

1. 📖 阅读 `README.md` 了解项目概况
2. 🎯 查看 `docs/FEATURES.md` 了解功能特性
3. 📚 阅读 `docs/API.md` 了解数据结构
4. 💻 浏览源代码，从 `src/main.ts` 开始
5. 🎨 修改样式，在 `src/assets/styles/main.css`
6. 🧪 添加新功能，参考现有组件

### 关键文件说明

- `src/data/formulas.ts` - 所有公式数据的来源
- `src/router/index.ts` - 路由配置，控制页面跳转
- `src/types/formula.ts` - TypeScript 类型定义
- `tailwind.config.js` - UI 样式配置

## 🐛 常见问题

### Q: MathJax 公式不显示？

A: 确保网络连接正常，MathJax 从 CDN 加载。检查浏览器控制台是否有错误。

### Q: 开发服务器启动失败？

A: 检查 Node.js 版本（需要 >= 16），删除 `node_modules` 重新安装依赖。

### Q: 构建失败？

A: 运行 `npm run type-check` 检查 TypeScript 错误，修复后重新构建。

### Q: 样式不生效？

A: 确保 Tailwind CSS 配置正确，检查 `content` 路径是否包含所有组件文件。

## 🚀 下一步

### 初学者

- 🎨 修改主题颜色
- 📝 添加新的公式描述
- 🖼️ 更换图标和图片

### 进阶开发者

- 🧩 创建新的可视化场景
- 📊 添加数据统计功能
- 🌐 实现多语言支持

### 高级开发者

- 🎮 集成 Three.js 高级特效
- 🤖 添加 AI 辅助学习
- 📱 开发移动端应用

## 💡 贡献指南

欢迎提交 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 获取帮助

- 📧 Email: support@utf-star.com
- 💬 Discord: UTF Star Community
- 🐛 Issues: GitHub Issues
- 📖 文档: `/docs` 目录

---

**开始你的统一场论探索之旅！** 🌌✨
