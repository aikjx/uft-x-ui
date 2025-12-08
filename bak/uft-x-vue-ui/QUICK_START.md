# 🚀 统一场论3D可视化平台 - 快速启动指南

## 📦 5分钟快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/unified-field-visualization.git
cd unified-field-visualization
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问: `http://localhost:3000/unified-field`

## 🎯 核心功能演示

### 可视化时空同一化方程
```typescript
import { useUnifiedField } from '@/composables/useUnifiedField'
import { FormulaType } from '@/types/unified-field-theory'

const { initialize, visualizeFormula } = useUnifiedField(container.value)

// 初始化渲染器
initialize()

// 可视化公式
visualizeFormula(FormulaType.SPACETIME_UNITY, {
  c: 299792458,  // 光速
  t: 1           // 时间
})
```

### 调整参数
```typescript
// 更新参数
updateParameters({
  t: 2,  // 改变时间
  c: 3e8 // 改变光速
})
```

### 切换公式
```typescript
// 切换到引力场方程
visualizeFormula(FormulaType.GRAVITY_FIELD, {
  G: 6.67e-11,
  k: 1,
  n: 1,
  r: 1
})
```

## 🎨 自定义配置

### 基础配置
```typescript
const config: VisualizationConfig = {
  formulaType: FormulaType.SPACETIME_UNITY,
  renderMode: 'hybrid',
  quality: 'high',
  particleCount: 100000,
  fieldResolution: 64
}
```

### 视觉效果配置
```typescript
const config = {
  effects: {
    bloom: true,        // 辉光效果
    glow: true,         // 发光
    trails: true,       // 轨迹
    holographic: true,  // 全息投影
    quantumRipple: true // 量子涟漪
  }
}
```

### 色彩方案配置
```typescript
const config = {
  colorScheme: {
    primary: '#00d4ff',
    secondary: '#b400ff',
    accent: '#ff0080',
    fieldColors: {
      gravity: '#ff0080',
      electric: '#00d4ff',
      magnetic: '#b400ff',
      quantum: '#ffd700'
    }
  }
}
```

## 📊 性能优化

### 自动性能检测
```typescript
import { DevicePerformanceDetector } from '@/utils/PerformanceOptimizer'

const detector = DevicePerformanceDetector.getInstance()
const level = detector.getPerformanceLevel()
const config = detector.getRecommendedConfig()

console.log('性能级别:', level)
console.log('推荐配置:', config)
```

### 自适应质量管理
```typescript
import { AdaptiveQualityManager } from '@/utils/PerformanceOptimizer'

const manager = new AdaptiveQualityManager(PerformanceLevel.HIGH)

// 每帧更新
function animate() {
  const { quality, changed } = manager.update()
  
  if (changed) {
    console.log('质量调整为:', quality)
    updateRenderQuality(quality)
  }
  
  requestAnimationFrame(animate)
}
```

## 🧪 运行测试

### 单元测试
```bash
npm run test
```

### 测试覆盖率
```bash
npm run test:coverage
```

### 性能测试
```bash
node scripts/performance-test.js
```

## 🎬 使用示例

### 示例1: 基础可视化
```vue
<template>
  <div ref="container" class="visualization"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUnifiedField } from '@/composables/useUnifiedField'
import { FormulaType } from '@/types/unified-field-theory'

const container = ref<HTMLElement | null>(null)
const { initialize, visualizeFormula } = useUnifiedField(container.value)

onMounted(() => {
  initialize()
  visualizeFormula(FormulaType.SPACETIME_UNITY)
})
</script>
```

### 示例2: 参数控制
```vue
<template>
  <div>
    <div ref="container" class="visualization"></div>
    <div class="controls">
      <input 
        v-model="time" 
        type="range" 
        min="0" 
        max="10" 
        step="0.1"
        @input="updateTime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUnifiedField } from '@/composables/useUnifiedField'

const container = ref<HTMLElement | null>(null)
const time = ref(1)

const { initialize, updateParameters } = useUnifiedField(container.value)

const updateTime = () => {
  updateParameters({ t: time.value })
}

onMounted(() => {
  initialize()
})
</script>
```

### 示例3: 多公式对比
```typescript
// 创建多个渲染器
const renderer1 = new QuantumRenderer(container1)
const renderer2 = new QuantumRenderer(container2)

// 可视化不同公式
visualizeFormula(FormulaType.SPACETIME_UNITY, params1)
visualizeFormula(FormulaType.GRAVITY_FIELD, params2)
```

## 🔧 常见问题

### Q: 如何提高性能？
A: 
1. 降低粒子数量
2. 减小场分辨率
3. 关闭部分视觉效果
4. 使用自适应质量管理

### Q: 如何添加新公式？
A:
1. 在`FormulaType`枚举中添加新类型
2. 在`FormulaEngine`中实现计算方法
3. 在`FORMULA_METADATA`中添加元数据
4. 更新可视化逻辑

### Q: 如何自定义着色器？
A:
1. 在`src/shaders/`目录创建新着色器
2. 实现顶点和片段着色器
3. 创建材质工厂函数
4. 在渲染器中使用

### Q: 如何优化内存使用？
A:
1. 使用对象池
2. 及时释放资源
3. 使用LOD系统
4. 启用自动内存管理

## 📚 学习资源

### 官方文档
- [完整文档](./UNIFIED_FIELD_README.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [部署指南](./DEPLOYMENT_CHECKLIST.md)

### 代码示例
- [基础示例](./examples/basic.md)
- [高级示例](./examples/advanced.md)
- [性能优化](./examples/performance.md)

### API参考
- [FormulaEngine API](./docs/api/FormulaEngine.md)
- [QuantumRenderer API](./docs/api/QuantumRenderer.md)
- [PerformanceOptimizer API](./docs/api/PerformanceOptimizer.md)

## 🎯 下一步

### 探索更多功能
1. 尝试不同的公式可视化
2. 调整参数观察变化
3. 自定义视觉效果
4. 优化性能配置

### 参与贡献
1. Fork项目
2. 创建功能分支
3. 提交Pull Request
4. 参与讨论

### 获取帮助
- [GitHub Issues](https://github.com/your-repo/issues)
- [讨论区](https://github.com/your-repo/discussions)
- [技术支持](mailto:support@example.com)

## 🌟 推荐配置

### 开发环境
```json
{
  "editor": "VS Code",
  "extensions": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ],
  "node": "18+",
  "npm": "9+"
}
```

### 生产环境
```json
{
  "server": "Nginx",
  "node": "18 LTS",
  "memory": "2GB+",
  "cpu": "2 cores+",
  "storage": "10GB+"
}
```

## 🎉 开始探索

现在你已经准备好开始探索统一场论的奇妙世界了！

访问 `http://localhost:3000/unified-field` 开始你的宇宙之旅！

---

**祝你探索愉快！** 🌌✨

Made with ❤️ by the Unified Field Visualization Team
