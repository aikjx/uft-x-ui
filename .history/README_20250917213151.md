# 🌌 张祥前统一场论核心公式可视化项目

## 项目简介

基于Vue3的现代化Web应用，专门用于可视化张祥前统一场论的核心公式。通过先进的3D渲染技术和交互式界面，帮助用户深入理解时空、引力、电磁场的本质联系。


| 公式编号 | 公式名称与表述 |
| :--- | :--- |
| 1 | **时空同一化方程**<br>$\vec{r}(t) = \vec{C}t = x\vec{i} + y\vec{j} + z\vec{k}$ |
| 2 | **三维螺旋时空方程**<br>$\vec{r}(t) = r\cos\omega t \cdot \vec{i} + r\sin\omega t \cdot \vec{j} + ht \cdot \vec{k}$ |
| 3 | **质量定义方程**<br>$m = k \cdot \frac{dn}{d\Omega}$ |
| 4 | **引力场定义方程**<br>$\overrightarrow{A} = -G k \frac{\Delta n}{\Delta s} \frac{\overrightarrow{r}}{r}$ |
| 5 | **静止动量方程**<br>$\overrightarrow{p}_0 = m_0 \overrightarrow{C}_0$ |
| 6 | **运动动量方程**<br>$\overrightarrow{P} = m (\overrightarrow{C} - \overrightarrow{V})$ |
| 7 | **宇宙大统一方程（力方程）**<br>$F = \frac{d\vec{P}}{dt} = \vec{C}\frac{dm}{dt} - \vec{V}\frac{dm}{dt} + m\frac{d\vec{C}}{dt} - m\frac{d\vec{V}}{dt}$ |
| 8 | **空间波动方程**<br>$\frac{\partial^2 L}{\partial x^2} + \frac{\partial^2 L}{\partial y^2} + \frac{\partial^2 L}{\partial z^2} = \frac{1}{c^2} \frac{\partial^2 L}{\partial t^2}$ |
| 9 | **电荷定义方程**<br>$q = k' k \frac{1}{\Omega^2} \frac{d\Omega}{dt}$ |
| 10 | **电场定义方程**<br>$\vec{E} = -\frac{k k'}{4\pi\epsilon_0\Omega^2}\frac{d\Omega}{dt}\frac{\vec{r}}{r^3}$ |
| 11 | **磁场定义方程**<br>$\vec{B} = \frac{\mu_0 \gamma k k'}{4 \pi \Omega^{2}} \frac{d \Omega}{d t} \frac{[(x-v t) \vec{i}+y \vec{j}+z \vec{k}]}{\left[\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}\right]^{\frac{3}{2}}}$ |
| 12 | **变化的引力场产生电磁场**<br>$\frac{\partial^{2}\overline{A}}{\partial t^{2}} = \frac{\overline{V}}{f} ( \overline{\nabla} \cdot \overline{E} ) - \frac{C^{2}}{f} ( \overline{\nabla} \times \overline{B} )$ |
| 13 | **磁矢势方程**<br>$\vec{\nabla} \times \vec{A} = \frac{\vec{B}}{f}$ |
| 14 | **变化的引力场产生电场**<br>$\vec{E} = -f \frac{d\vec{A}}{dt}$ |
| 15 | **变化的磁场产生引力场和电场**<br>$\frac{d\overrightarrow{B}}{dt} = \frac{-\overrightarrow{A}\times\overrightarrow{E}}{c^2} - \frac{\overrightarrow{V}}{c^{2}} \times \frac{d\overrightarrow{E}}{dt}$ |
| 16 | **统一场论能量方程**<br>$e = m_0 c^2 = m c^2 \sqrt{1 - \frac{v^2}{c^2}}$ |
| 17 | **光速飞行器动力学方程**<br>$\vec{F} = (\vec{C} - \vec{V}) \frac{dm}{dt}$ |



## ✨ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI组件**: Naive UI + Tailwind CSS
- **3D渲染**: Three.js + WebGL 2.0
- **数学渲染**: MathJax 3.0
- **动画**: GSAP
- **工具库**: VueUse + D3.js

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
utf_star/
├── src/
│   ├── components/          # 可复用组件
│   ├── views/              # 页面组件
│   ├── stores/             # Pinia状态管理
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── data/               # 静态数据
│   └── assets/             # 静态资源
├── public/                 # 公共资源
└── docs/                   # 项目文档
```

## 🎯 核心功能

- **实时3D可视化**: 基于Three.js的高性能3D场景
- **交互式参数控制**: 实时调节公式参数
- **数学公式渲染**: MathJax动态公式显示
- **响应式设计**: 支持桌面和移动设备
- **主题切换**: 明暗主题自由切换
- **学习路径**: 渐进式公式学习体验

## 📊 公式分类

1. **时空理论** - 时空同一化和螺旋时空
2. **力学基础** - 质量、动量和引力场
3. **统一理论** - 宇宙大统一方程
4. **电磁理论** - 电荷、电场、磁场统一
5. **应用理论** - 能量方程和飞行器动力学

## 🛠️ 开发指南

### 代码规范

- 使用ESLint + Prettier进行代码格式化
- 遵循Vue 3 Composition API最佳实践
- TypeScript严格模式开发

### 提交规范

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

## 📄 许可证

MIT License

## 👥 贡献者

UTF Star Team

---

**探索宇宙的统一理论，让科学之美触手可及** ✨