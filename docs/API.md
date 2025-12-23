# 📡 API 文档

## 数据结构

### Formula 接口

```typescript
interface Formula {
  id: number // 公式ID (1-17)
  name: string // 公式名称
  latex: string // LaTeX 格式的公式
  description: string // 公式描述
  category: FormulaCategory // 公式分类
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  variables: Variable[] // 变量列表
  applications: string[] // 应用领域
  relatedFormulas: number[] // 相关公式ID
}
```

### Variable 接口

```typescript
interface Variable {
  symbol: string // 变量符号
  name: string // 变量名称
  unit?: string // 单位（可选）
  description: string // 变量描述
}
```

### FormulaCategory 类型

```typescript
type FormulaCategory =
  | 'spacetime' // 时空理论
  | 'mechanics' // 力学基础
  | 'unified' // 统一理论
  | 'electromagnetic' // 电磁理论
  | 'application' // 应用理论
```

## 数据访问函数

### getFormulaById

获取指定ID的公式

```typescript
function getFormulaById(id: number): Formula | undefined

// 示例
const formula = getFormulaById(1)
console.log(formula?.name) // "时空同一化方程"
```

### getFormulasByCategory

获取指定分类的所有公式

```typescript
function getFormulasByCategory(category: string): Formula[]

// 示例
const spacetimeFormulas = getFormulasByCategory('spacetime')
console.log(spacetimeFormulas.length) // 3
```

## 路由配置

### 页面路由

```typescript
{
  path: '/',
  name: 'Home',
  component: HomeView
}

{
  path: '/formulas',
  name: 'Formulas',
  component: FormulasView,
  query: { category?: string }  // 可选的分类筛选
}

{
  path: '/formula/:id',
  name: 'FormulaDetail',
  component: FormulaDetailView,
  params: { id: string }  // 公式ID
}

{
  path: '/visualization',
  name: 'Visualization',
  component: VisualizationView
}

{
  path: '/learn',
  name: 'Learn',
  component: LearnView
}

{
  path: '/about',
  name: 'About',
  component: AboutView
}
```

## 组件 Props

### FormulaCard (规划中)

```typescript
interface FormulaCardProps {
  formula: Formula
  compact?: boolean
  showActions?: boolean
}
```

### VisualizationScene (规划中)

```typescript
interface VisualizationSceneProps {
  sceneType: 'spacetime' | 'spiral' | 'gravity' | 'electromagnetic' | 'unified'
  parameters: Record<string, number>
  autoRotate?: boolean
}
```

## 事件系统

### MathJax 事件

```typescript
// MathJax 加载完成
window.addEventListener('mathjax-ready', () => {
  console.log('MathJax is ready')
})

// 手动触发公式渲染
if (window.MathJax?.typesetPromise) {
  window.MathJax.typesetPromise()
}
```

## 工具函数

### 公式渲染

```typescript
// 将 LaTeX 转换为 MathJax 可渲染的格式
function renderFormula(latex: string): string {
  return `\\[${latex}\\]`
}
```

### 难度映射

```typescript
const difficultyMap = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
}
```

## 样式类

### Tailwind 自定义类

```css
.glass-effect {
  @apply border border-white/20 bg-white/10 backdrop-blur-xl dark:bg-black/20;
}

.gradient-text {
  @apply bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent;
}

.cosmic-bg {
  background: radial-gradient(ellipse at top, #1e3a8a 0%, #0f172a 50%, #000000 100%);
}
```

## 扩展指南

### 添加新公式

1. 在 `src/data/formulas.ts` 中添加公式对象
2. 确保 ID 唯一且连续
3. 填写完整的元数据
4. 更新相关公式的 `relatedFormulas` 字段

### 添加新的可视化场景

1. 在 `src/views/VisualizationView.vue` 的 `scenes` 数组中添加
2. 实现对应的 Three.js 场景
3. 添加参数控制面板

### 添加新的学习路径

1. 在 `src/views/LearnView.vue` 的 `learningPath` 数组中添加
2. 组织相关公式ID
3. 编写阶段描述

---

**API 设计遵循 RESTful 原则，易于扩展和维护** 📚
