import { Formula, FeatureItem } from '../types';

// 统一场论核心公式数据
export const FORMULAS: Formula[] = [
  {
    id: 1,
    name: '时空同一化方程',
    expression: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    description: '揭示时间和空间的本质联系，时间是空间本身的运动',
    category: '时空方程'
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    expression: '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
    description: '描述物质点在三维空间中的螺旋运动轨迹',
    category: '时空方程'
  },
  {
    id: 3,
    name: '质量定义方程',
    expression: 'm = k \\cdot \\frac{dn}{d\\Omega}',
    description: '质量本质是物体周围空间运动的运动量',
    category: '动力学方程'
  },
  {
    id: 4,
    name: '引力场定义方程',
    expression: '\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}',
    description: '引力场是空间的加速运动效应',
    category: '场方程'
  },
  {
    id: 5,
    name: '静止动量方程',
    expression: '\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}',
    description: '静止物体的动量与静止质量和光速有关',
    category: '动力学方程'
  },
  {
    id: 6,
    name: '运动动量方程',
    expression: '\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})',
    description: '运动物体的动量表达式，包含了相对论效应',
    category: '动力学方程'
  },
  {
    id: 7,
    name: '宇宙大统一方程（力方程）',
    expression: 'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
    description: '统一四种基本力的核心方程，揭示力的本质',
    category: '统一方程'
  },
  {
    id: 8,
    name: '空间波动方程',
    expression: '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
    description: '描述空间波动的传播规律',
    category: '场方程'
  },
  {
    id: 9,
    name: '电荷定义方程',
    expression: 'q = k^{\\prime}k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}',
    description: '电荷本质是空间角动量的变化率',
    category: '场方程'
  },
  {
    id: 10,
    name: '电场定义方程',
    expression: '\\vec{E} = -\\frac{kk^{\\prime}}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
    description: '电场是空间角动量变化产生的效应',
    category: '场方程'
  },
  {
    id: 11,
    name: '磁场定义方程',
    expression: '\\vec{B} = \\frac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
    description: '磁场是运动电荷产生的相对论效应',
    category: '场方程'
  },
  {
    id: 12,
    name: '变化的引力场产生电磁场',
    expression: '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})',
    description: '引力场与电磁场的相互转化关系',
    category: '统一方程'
  },
  {
    id: 13,
    name: '磁矢势方程',
    expression: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
    description: '磁矢势与磁场的关系',
    category: '场方程'
  },
  {
    id: 14,
    name: '变化的引力场产生电场',
    expression: '\\vec{E} = -f\\frac{d\\vec{A}}{dt}',
    description: '引力场变化如何产生电场',
    category: '统一方程'
  },
  {
    id: 15,
    name: '变化的磁场产生引力场和电场',
    expression: '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}',
    description: '磁场变化如何影响引力场和电场',
    category: '统一方程'
  },
  {
    id: 16,
    name: '统一场论能量方程',
    expression: 'e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}',
    description: '能量与质量的等价关系，扩展了爱因斯坦质能方程',
    category: '统一方程'
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    expression: '\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}',
    description: '基于统一场论的光速飞行器原理',
    category: '应用方程'
  },
  {
    id: 18,
    name: '核力场定义方程',
    expression: '\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}',
    description: '核力场的数学表达式',
    category: '场方程'
  },
  {
    id: 19,
    name: '引力光速统一方程',
    expression: 'Z = Gc/2',
    description: '揭示引力常数与光速的内在联系',
    category: '统一方程'
  }
];

// 首页特性数据
export const FEATURES: FeatureItem[] = [
  {
    icon: '📐',
    title: '核心公式3D可视化',
    description: '将19个核心公式转化为直观的3D交互模型，让抽象的物理概念变得清晰可见',
    link: '/formulas',
    color: 'from-blue-500 to-cyan-500',
    gradientFrom: 'rgb(59, 130, 246)',
    gradientTo: 'rgb(34, 211, 238)'
  },
  {
    icon: '🛸',
    title: '人工场技术模拟',
    description: '可视化展示人工场技术原理及其应用场景，探索未来科技的无限可能',
    link: '/artificial-field',
    color: 'from-purple-500 to-indigo-500',
    gradientFrom: 'rgb(168, 85, 247)',
    gradientTo: 'rgb(99, 102, 241)'
  },
  {
    icon: '🔍',
    title: '交互式探索系统',
    description: '通过直观的交互界面，调整参数，实时观察物理现象的变化',
    link: '/interactive',
    color: 'from-blue-600 to-blue-400',
    gradientFrom: 'rgb(37, 99, 235)',
    gradientTo: 'rgb(96, 165, 250)'
  }
];

// 动画变体常量
export const ANIMATION_VARIANTS = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.7,
        ease: "easeOut"
      }
    }
  },
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  formulaVariants: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },
  fadeInUpVariants: {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  },
  simulationVariants: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  tabVariants: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }
};

// 默认模拟参数
export const DEFAULT_SIMULATION_PARAMETERS = {
  spacetime: {
    speed: 1,
    curvature: 0.5,
    particleCount: 1000
  },
  gravity: {
    mass: 1,
    distance: 2,
    fieldStrength: 0.8
  },
  electromagnetic: {
    charge: 1,
    fieldStrength: 1,
    frequency: 1
  }
};