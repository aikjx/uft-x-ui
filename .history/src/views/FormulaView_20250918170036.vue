<template>
  <div class="formula-container">
    <header class="header">
      <h1 class="title">统一场论公式集</h1>
      <p class="subtitle">算法联盟 - 宇宙物理学统一理论</p>
    </header>

    <div class="formula-grid">
      <div 
        v-for="formula in formulas" 
        :key="formula.id"
        class="formula-card"
        @click="selectFormula(formula)"
        :class="{ active: selectedFormula?.id === formula.id }"
      >
        <div class="formula-header">
          <span class="formula-number">公式 {{ formula.id }}</span>
          <span class="formula-category" :class="formula.category">{{ getCategoryName(formula.category) }}</span>
        </div>
        <h3 class="formula-name">{{ formula.name }}</h3>
        <div class="formula-math" v-html="formula.latex"></div>
        <p class="formula-description">{{ formula.description }}</p>
      </div>
    </div>

    <!-- 详细信息模态框 -->
    <div v-if="selectedFormula" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">&times;</button>
        <div class="modal-header">
          <h2>公式 {{ selectedFormula.id }}: {{ selectedFormula.name }}</h2>
          <span class="modal-category" :class="selectedFormula.category">
            {{ getCategoryName(selectedFormula.category) }}
          </span>
        </div>
        <div class="modal-formula" v-html="selectedFormula.latex"></div>
        <div class="modal-details">
          <h4>详细说明</h4>
          <p>{{ selectedFormula.detailedDescription }}</p>
          <h4>物理意义</h4>
          <p>{{ selectedFormula.physicalMeaning }}</p>
          <h4>应用领域</h4>
          <ul>
            <li v-for="application in selectedFormula.applications" :key="application">
              {{ application }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMathJax } from '../composables/useMathJax'

interface Formula {
  id: number
  name: string
  latex: string
  description: string
  detailedDescription: string
  physicalMeaning: string
  applications: string[]
  category: 'spacetime' | 'mass' | 'force' | 'electromagnetic' | 'unified'
}

const selectedFormula = ref<Formula | null>(null)

const formulas = ref<Formula[]>([
  {
    id: 1,
    name: '时空同一化方程',
    latex: '$$\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}$$',
    description: '描述时空的统一性，将时间与空间坐标统一表示',
    detailedDescription: '该方程建立了时间与空间的直接关系，表明时空是一个统一的四维连续体。',
    physicalMeaning: '时空不是分离的概念，而是一个统一的几何结构，物体在其中的运动轨迹由时间参数完全确定。',
    applications: ['相对论物理学', '宇宙学建模', '时空几何分析'],
    category: 'spacetime'
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    latex: '$$\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}$$',
    description: '描述螺旋运动在时空中的轨迹',
    detailedDescription: '该方程描述了物体在三维空间中的螺旋运动，结合了圆周运动和直线运动。',
    physicalMeaning: '展现了宇宙中普遍存在的螺旋结构，从微观粒子到宏观星系都遵循这种运动模式。',
    applications: ['粒子物理学', '天体力学', '螺旋星系建模'],
    category: 'spacetime'
  },
  {
    id: 3,
    name: '质量定义方程',
    latex: '$$m = k \\cdot \\frac{dn}{d\\Omega}$$',
    description: '从空间密度变化角度重新定义质量',
    detailedDescription: '质量被定义为空间密度在立体角上的变化率，揭示了质量的几何本质。',
    physicalMeaning: '质量不是固有属性，而是空间几何结构的表现，与空间曲率密切相关。',
    applications: ['引力理论', '质量起源研究', '空间几何学'],
    category: 'mass'
  },
  {
    id: 4,
    name: '引力场定义方程',
    latex: '$$\\overrightarrow{A} = -G k \\frac{\\Delta n}{\\Delta s} \\frac{\\overrightarrow{r}}{r}$$',
    description: '将引力场表示为空间密度梯度',
    detailedDescription: '引力场强度与空间密度的梯度成正比，提供了引力的几何解释。',
    physicalMeaning: '引力不是力，而是空间几何的表现，物体沿着空间曲率最小的路径运动。',
    applications: ['广义相对论', '引力波理论', '宇宙结构形成'],
    category: 'force'
  },
  {
    id: 5,
    name: '静止动量方程',
    latex: '$$\\overrightarrow{p}_0 = m_0 \\overrightarrow{C}_0$$',
    description: '静止状态下的动量表达式',
    detailedDescription: '即使在静止状态，物体仍具有由其静止质量和基础时空速度决定的动量。',
    physicalMeaning: '揭示了静止是相对的概念，所有物体都在时空中运动。',
    applications: ['相对论力学', '能量守恒', '粒子物理'],
    category: 'force'
  },
  {
    id: 6,
    name: '运动动量方程',
    latex: '$$\\overrightarrow{P} = m (\\overrightarrow{C} - \\overrightarrow{V})$$',
    description: '运动状态下的广义动量表达式',
    detailedDescription: '运动动量是质量与时空速度和物体速度之差的乘积。',
    physicalMeaning: '动量的本质是时空运动与物质运动的相互作用。',
    applications: ['高能物理', '宇宙射线研究', '粒子加速器'],
    category: 'force'
  },
  {
    id: 7,
    name: '宇宙大统一方程（力方程）',
    latex: '$$F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}$$',
    description: '统一描述宇宙中所有力的作用',
    detailedDescription: '该方程统一了所有基本力，将力表示为动量随时间的变化率。',
    physicalMeaning: '所有力都源于时空结构的变化和物质在时空中的运动。',
    applications: ['统一场理论', '基本力统一', '宇宙演化模型'],
    category: 'unified'
  },
  {
    id: 8,
    name: '空间波动方程',
    latex: '$$\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}$$',
    description: '描述空间结构的波动性质',
    detailedDescription: '空间本身具有波动性质，遵循类似于电磁波的传播方程。',
    physicalMeaning: '空间不是静态的背景，而是动态的物理实体，能够传播扰动。',
    applications: ['引力波理论', '宇宙微波背景', '空间量子涨落'],
    category: 'spacetime'
  },
  {
    id: 9,
    name: '电荷定义方程',
    latex: '$$q = k\' k \\frac{1}{\\Omega^2} \\frac{d\\Omega}{dt}$$',
    description: '从几何角度定义电荷',
    detailedDescription: '电荷被定义为立体角变化率的函数，揭示了电荷的几何本质。',
    physicalMeaning: '电荷是空间几何结构的表现，与空间的扭曲程度相关。',
    applications: ['电动力学', '量子电动力学', '电荷守恒定律'],
    category: 'electromagnetic'
  },
  {
    id: 10,
    name: '电场定义方程',
    latex: '$$\\vec{E} = -\\frac{k k\'}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}$$',
    description: '电场强度的几何表达式',
    detailedDescription: '电场强度与立体角的变化率和空间位置相关。',
    physicalMeaning: '电场是空间几何扭曲的表现，电荷周围的空间结构发生了改变。',
    applications: ['静电学', '电场分布计算', '电容器设计'],
    category: 'electromagnetic'
  },
  {
    id: 11,
    name: '磁场定义方程',
    latex: '$$\\vec{B} = \\frac{\\mu_0 \\gamma k k\'}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{\\left[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}\\right]^{\\frac{3}{2}}}$$',
    description: '运动电荷产生的磁场',
    detailedDescription: '磁场是运动电荷周围空间几何结构的相对论性表现。',
    physicalMeaning: '磁场体现了时空的相对论性质，是电场在不同参考系中的表现。',
    applications: ['磁学', '电磁感应', '粒子加速器磁场设计'],
    category: 'electromagnetic'
  },
  {
    id: 12,
    name: '变化的引力场产生电磁场',
    latex: '$$\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f} ( \\overline{\\nabla} \\cdot \\overline{E} ) - \\frac{C^{2}}{f} ( \\overline{\\nabla} \\times \\overline{B} )$$',
    description: '引力场与电磁场的相互转换',
    detailedDescription: '变化的引力场能够产生电磁场，揭示了引力与电磁力的统一性。',
    physicalMeaning: '引力和电磁力是同一种基本相互作用的不同表现形式。',
    applications: ['统一场理论', '引力电磁耦合', '宇宙磁场起源'],
    category: 'unified'
  },
  {
    id: 13,
    name: '磁矢势方程',
    latex: '$$\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}$$',
    description: '磁矢势与磁场的关系',
    detailedDescription: '磁矢势的旋度给出磁场强度，建立了势场与场强的关系。',
    physicalMeaning: '磁矢势是更基本的物理量，磁场是其空间变化的表现。',
    applications: ['电磁场理论', '量子力学中的规范场', '超导体理论'],
    category: 'electromagnetic'
  },
  {
    id: 14,
    name: '变化的引力场产生电场',
    latex: '$$\\vec{E} = -f \\frac{d\\vec{A}}{dt}$$',
    description: '引力场变化诱导电场',
    detailedDescription: '时变引力场能够诱导电场，类似于法拉第电磁感应定律。',
    physicalMeaning: '引力和电磁现象在本质上是统一的，都源于时空几何的变化。',
    applications: ['引力波探测', '引力电磁效应', '宇宙电场研究'],
    category: 'unified'
  },
  {
    id: 15,
    name: '变化的磁场产生引力场和电场',
    latex: '$$\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}} \\times \\frac{d\\overrightarrow{E}}{dt}$$',
    description: '磁场变化的多重效应',
    detailedDescription: '变化的磁场不仅产生电场，还能产生引力场效应。',
    physicalMeaning: '电磁场和引力场是相互耦合的，它们的变化会相互影响。',
    applications: ['电磁引力耦合实验', '统一场效应', '高能物理实验'],
    category: 'unified'
  },
  {
    id: 16,
    name: '统一场论能量方程',
    latex: '$$e = m_0 c^2 = m c^2 \\sqrt{1 - \\frac{v^2}{c^2}}$$',
    description: '质能关系的统一表达',
    detailedDescription: '能量与质量的关系在统一场论框架下的表达式。',
    physicalMeaning: '能量和质量是同一物理实体的不同表现，都源于时空的几何性质。',
    applications: ['核物理', '粒子物理', '宇宙学能量计算'],
    category: 'unified'
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    latex: '$$\\vec{F} = (\\vec{C} - \\vec{V}) \\frac{dm}{dt}$$',
    description: '接近光速运动的推进力方程',
    detailedDescription: '描述高速飞行器所需推进力与质量变化率的关系。',
    physicalMeaning: '在接近光速时，推进力主要用于改变物体的相对论质量。',
    applications: ['航天推进技术', '高速粒子加速', '星际旅行理论'],
    category: 'force'
  }
])

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}

const closeModal = () => {
  selectedFormula.value = null
}

const getCategoryName = (category: string) => {
  const categoryNames = {
    spacetime: '时空理论',
    mass: '质量理论',
    force: '力学理论',
    electromagnetic: '电磁理论',
    unified: '统一场论'
  }
  return categoryNames[category as keyof typeof categoryNames] || category
}

onMounted(async () => {
  // 使用统一的 MathJax 管理
  const { initMathJax, rerenderAll } = useMathJax()
  
  try {
    await initMathJax()
    // 渲染页面中的所有公式
    setTimeout(() => {
      rerenderAll()
    }, 500)
  } catch (error) {
    console.error('MathJax 初始化失败:', error)
  }
})
</script>

<style scoped>
.formula-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
}

.formula-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.formula-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.formula-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.formula-card.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px #667eea;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.formula-number {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.formula-category {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.formula-category.spacetime {
  background: #e3f2fd;
  color: #1976d2;
}

.formula-category.mass {
  background: #f3e5f5;
  color: #7b1fa2;
}

.formula-category.force {
  background: #e8f5e8;
  color: #388e3c;
}

.formula-category.electromagnetic {
  background: #fff3e0;
  color: #f57c00;
}

.formula-category.unified {
  background: #fce4ec;
  color: #c2185b;
}

.formula-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.formula-math {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.formula-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-header {
  margin-bottom: 2rem;
  padding-right: 3rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.modal-category {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 600;
}

.modal-formula {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.modal-details h4 {
  color: #333;
  margin-bottom: 0.5rem;
  margin-top: 1.5rem;
}

.modal-details p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.modal-details ul {
  color: #666;
  padding-left: 1.5rem;
}

.modal-details li {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .formula-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>