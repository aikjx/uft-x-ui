import { Formula, FeatureItem } from '../types'
import { easeOut, easeInOut, Easing } from 'framer-motion'

// 统一场论核心公式数据
export const FORMULAS: Formula[] = [
  {
    id: 1,
    name: '时空同一化方程',
    expression: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    description: '揭示时间和空间的本质联系，时间是空间本身的运动',
    category: '时空方程',
    relatedFormulas: [2, 5, 6, 7],
    animations: [
      {
        id: 'animation-1-1',
        name: '时空流场可视化',
        type: 'streamline',
        description: '展示时空流场的流动效果',
        config: {
          fieldType: 'spacetime',
          particleCount: 1000,
          color: 0x00ffff,
          velocity: 0.01
        }
      },
      {
        id: 'animation-1-2',
        name: '三维坐标系动态',
        type: 'coordinate',
        description: '动态展示三维坐标系的变化',
        config: {
          axisColor: 0xffffff,
          gridColor: 0x333333,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    expression:
      '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
    description: '描述物质点在三维空间中的螺旋运动轨迹',
    category: '时空方程',
    relatedFormulas: [1, 7, 8],
    animations: [
      {
        id: 'animation-2-1',
        name: '螺旋轨迹动态',
        type: 'trajectory',
        description: '展示三维螺旋运动轨迹',
        config: {
          color: 0xff0000,
          lineWidth: 2,
          animationSpeed: 1
        }
      },
      {
        id: 'animation-2-2',
        name: '螺旋场可视化',
        type: 'field',
        description: '可视化螺旋场的分布',
        config: {
          fieldType: 'helical',
          resolution: 20,
          arrowSize: 0.5
        }
      }
    ]
  },
  {
    id: 3,
    name: '质量定义方程',
    expression: 'm = k \\cdot \\frac{dn}{d\\Omega}',
    description: '质量本质是物体周围空间运动的运动量',
    category: '动力学方程',
    relatedFormulas: [4, 5, 6, 7, 16],
    animations: [
      {
        id: 'animation-3-1',
        name: '质量场分布',
        type: 'field',
        description: '展示质量场的空间分布',
        config: {
          fieldType: 'mass',
          resolution: 15,
          color: 0x00ff00
        }
      },
      {
        id: 'animation-3-2',
        name: '质量粒子模拟',
        type: 'particle',
        description: '粒子系统模拟质量效应',
        config: {
          particleCount: 500,
          color: 0xffff00,
          size: 0.02
        }
      }
    ]
  },
  {
    id: 4,
    name: '引力场定义方程',
    expression:
      '\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}',
    description: '引力场是空间的加速运动效应',
    category: '场方程',
    relatedFormulas: [3, 7, 12, 14, 18, 19],
    animations: [
      {
        id: 'animation-4-1',
        name: '引力场线',
        type: 'field-lines',
        description: '展示引力场的场线分布',
        config: {
          color: 0x0000ff,
          lineCount: 20,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-4-2',
        name: '引力矢量场',
        type: 'vector-field',
        description: '矢量场形式展示引力场',
        config: {
          resolution: 15,
          arrowSize: 0.3
        }
      }
    ]
  },
  {
    id: 5,
    name: '静止动量方程',
    expression: '\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}',
    description: '静止物体的动量与静止质量和光速有关',
    category: '动力学方程',
    relatedFormulas: [1, 3, 6, 7, 16],
    animations: [
      {
        id: 'animation-5-1',
        name: '静止动量可视化',
        type: 'vector',
        description: '可视化静止动量矢量',
        config: {
          vectorColor: 0xff00ff,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-5-2',
        name: '质量-动量关系',
        type: 'relation',
        description: '展示质量与动量的关系',
        config: {
          color1: 0xff0000,
          color2: 0x0000ff,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 6,
    name: '运动动量方程',
    expression: '\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})',
    description: '运动物体的动量表达式，包含了相对论效应',
    category: '动力学方程',
    relatedFormulas: [1, 5, 7, 16, 17],
    animations: [
      {
        id: 'animation-6-1',
        name: '运动动量动态',
        type: 'dynamic-vector',
        description: '动态展示运动动量矢量',
        config: {
          color: 0x00ffff,
          animationSpeed: 1
        }
      },
      {
        id: 'animation-6-2',
        name: '相对论效应模拟',
        type: 'relativistic',
        description: '模拟相对论效应下的动量变化',
        config: {
          maxSpeed: 0.99,
          color: 0xffff00
        }
      }
    ]
  },
  {
    id: 7,
    name: '宇宙大统一方程（力方程）',
    expression:
      'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
    description: '统一四种基本力的核心方程，揭示力的本质',
    category: '统一方程',
    relatedFormulas: [1, 2, 3, 4, 5, 6, 12, 14, 15, 16, 17, 19, 20],
    animations: [
      {
        id: 'animation-7-1',
        name: '力的分解与合成',
        type: 'force-decomposition',
        description: '展示力的分解与合成过程',
        config: {
          color1: 0xff0000,
          color2: 0x00ff00,
          color3: 0x0000ff,
          animationSpeed: 0.8
        }
      },
      {
        id: 'animation-7-2',
        name: '统一场动态',
        type: 'unified-field',
        description: '动态展示统一场的变化',
        config: {
          resolution: 20,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 8,
    name: '空间波动方程',
    expression:
      '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
    description: '描述空间波动的传播规律',
    category: '场方程',
    relatedFormulas: [2, 4, 10, 11, 13],
    animations: [
      {
        id: 'animation-8-1',
        name: '空间波传播',
        type: 'wave',
        description: '展示空间波的传播过程',
        config: {
          color: 0x00ffff,
          waveSpeed: 1,
          amplitude: 0.5
        }
      },
      {
        id: 'animation-8-2',
        name: '波场干涉',
        type: 'interference',
        description: '展示波场的干涉现象',
        config: {
          waveCount: 2,
          color1: 0xff0000,
          color2: 0x0000ff,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 9,
    name: '电荷定义方程',
    expression: 'q = k^{\\prime}k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}',
    description: '电荷本质是空间角动量的变化率',
    category: '场方程',
    relatedFormulas: [10, 11, 13, 20],
    animations: [
      {
        id: 'animation-9-1',
        name: '电荷场分布',
        type: 'charge-field',
        description: '展示电荷场的空间分布',
        config: {
          chargeType: 'positive',
          resolution: 15,
          color: 0xff0000
        }
      },
      {
        id: 'animation-9-2',
        name: '角动量动态',
        type: 'angular-momentum',
        description: '动态展示角动量的变化',
        config: {
          color: 0x00ffff,
          animationSpeed: 1
        }
      }
    ]
  },
  {
    id: 10,
    name: '电场定义方程',
    expression:
      '\\vec{E} = -\\frac{kk^{\\prime}}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
    description: '电场是空间角动量变化产生的效应',
    category: '场方程',
    relatedFormulas: [9, 11, 13, 14, 15, 20],
    animations: [
      {
        id: 'animation-10-1',
        name: '电场线分布',
        type: 'electric-field-lines',
        description: '展示电场线的分布',
        config: {
          chargeType: 'positive',
          lineCount: 20,
          color: 0xff0000
        }
      },
      {
        id: 'animation-10-2',
        name: '电场矢量场',
        type: 'electric-vector-field',
        description: '矢量场形式展示电场',
        config: {
          resolution: 15,
          arrowSize: 0.3
        }
      }
    ]
  },
  {
    id: 11,
    name: '磁场定义方程',
    expression:
      '\\vec{B} = \\frac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
    description: '磁场是运动电荷产生的相对论效应',
    category: '场方程',
    relatedFormulas: [9, 10, 13, 15, 20],
    animations: [
      {
        id: 'animation-11-1',
        name: '磁场线分布',
        type: 'magnetic-field-lines',
        description: '展示磁场线的分布',
        config: {
          currentDirection: 'positive',
          lineCount: 20,
          color: 0x00ff00
        }
      },
      {
        id: 'animation-11-2',
        name: '电磁场耦合',
        type: 'electromagnetic-coupling',
        description: '展示电磁场的耦合效应',
        config: {
          resolution: 15,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 12,
    name: '变化的引力场产生电磁场',
    expression:
      '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})',
    description: '引力场与电磁场的相互转化关系',
    category: '统一方程',
    relatedFormulas: [4, 7, 10, 11, 14, 15],
    animations: [
      {
        id: 'animation-12-1',
        name: '引力-电磁场转化',
        type: 'field-transformation',
        description: '展示引力场到电磁场的转化过程',
        config: {
          color1: 0x0000ff,
          color2: 0xff0000,
          animationSpeed: 0.8
        }
      },
      {
        id: 'animation-12-2',
        name: '场耦合动态',
        type: 'field-coupling',
        description: '动态展示场之间的耦合效应',
        config: {
          resolution: 20,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 13,
    name: '磁矢势方程',
    expression: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
    description: '磁矢势与磁场的关系',
    category: '场方程',
    relatedFormulas: [8, 10, 11, 12, 15],
    animations: [
      {
        id: 'animation-13-1',
        name: '磁矢势分布',
        type: 'vector-potential',
        description: '展示磁矢势的空间分布',
        config: {
          resolution: 15,
          color: 0x00ffff
        }
      },
      {
        id: 'animation-13-2',
        name: '磁矢势与磁场关系',
        type: 'potential-field-relation',
        description: '展示磁矢势与磁场的关系',
        config: {
          color1: 0x00ffff,
          color2: 0x00ff00,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 14,
    name: '变化的引力场产生电场',
    expression: '\\vec{E} = -f\\frac{d\\vec{A}}{dt}',
    description: '引力场变化如何产生电场',
    category: '统一方程',
    relatedFormulas: [4, 7, 10, 12, 15],
    animations: [
      {
        id: 'animation-14-1',
        name: '引力场变化',
        type: 'gravity-change',
        description: '展示引力场的变化过程',
        config: {
          color: 0x0000ff,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-14-2',
        name: '感应电场生成',
        type: 'induced-electric-field',
        description: '展示感应电场的生成过程',
        config: {
          color: 0xff0000,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 15,
    name: '变化的磁场产生引力场和电场',
    expression:
      '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}',
    description: '磁场变化如何影响引力场和电场',
    category: '统一方程',
    relatedFormulas: [4, 7, 10, 11, 12, 14],
    animations: [
      {
        id: 'animation-15-1',
        name: '磁场变化',
        type: 'magnetic-change',
        description: '展示磁场的变化过程',
        config: {
          color: 0x00ff00,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-15-2',
        name: '多场相互作用',
        type: 'multi-field-interaction',
        description: '展示多种场之间的相互作用',
        config: {
          resolution: 20,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 16,
    name: '统一场论能量方程',
    expression: 'e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}',
    description: '能量与质量的等价关系，扩展了爱因斯坦质能方程',
    category: '统一方程',
    relatedFormulas: [3, 5, 6, 7, 17, 19, 20],
    animations: [
      {
        id: 'animation-16-1',
        name: '质能转化动态',
        type: 'mass-energy-conversion',
        description: '展示质量与能量的转化过程',
        config: {
          color1: 0xff0000,
          color2: 0x0000ff,
          animationSpeed: 0.8
        }
      },
      {
        id: 'animation-16-2',
        name: '相对论能量曲线',
        type: 'relativistic-energy',
        description: '展示相对论能量随速度变化的曲线',
        config: {
          color: 0x00ffff,
          animationSpeed: 0.5
        }
      }
    ]
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    expression: '\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}',
    description: '基于统一场论的光速飞行器原理',
    category: '应用方程',
    relatedFormulas: [6, 7, 16, 19],
    animations: [
      {
        id: 'animation-17-1',
        name: '飞行器轨迹模拟',
        type: 'vehicle-trajectory',
        description: '模拟光速飞行器的轨迹',
        config: {
          color: 0x00ffff,
          animationSpeed: 1
        }
      },
      {
        id: 'animation-17-2',
        name: '推力动态',
        type: 'thrust-dynamic',
        description: '动态展示推力的变化',
        config: {
          color: 0xff0000,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 18,
    name: '核力场定义方程',
    expression:
      '\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}',
    description: '核力场的数学表达式',
    category: '场方程',
    relatedFormulas: [4, 7, 19],
    animations: [
      {
        id: 'animation-18-1',
        name: '核力场分布',
        type: 'nuclear-field',
        description: '展示核力场的空间分布',
        config: {
          resolution: 15,
          color: 0xff00ff,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-18-2',
        name: '核力作用模拟',
        type: 'nuclear-interaction',
        description: '模拟核力的相互作用',
        config: {
          particleCount: 2,
          color1: 0x00ff00,
          color2: 0x00ffff,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 19,
    name: '引力光速统一方程',
    expression: 'Z = Gc/2',
    description: '揭示引力常数与光速的内在联系',
    category: '统一方程',
    relatedFormulas: [4, 7, 16, 17, 18, 20],
    animations: [
      {
        id: 'animation-19-1',
        name: '引力-光速关系',
        type: 'constant-relation',
        description: '展示引力常数与光速的关系',
        config: {
          color1: 0x0000ff,
          color2: 0x00ffff,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-19-2',
        name: '统一常数可视化',
        type: 'constant-visualization',
        description: '可视化展示统一常数',
        config: {
          color: 0xffffff,
          animationSpeed: 0.8
        }
      }
    ]
  },
  {
    id: 20,
    name: '电磁耦合常数',
    expression: 'Z = \\frac{c}{8\\pi\\epsilon_0}',
    description: '电磁相互作用的耦合常数，揭示电磁力的强度',
    category: '统一方程',
    relatedFormulas: [7, 10, 11, 16, 19],
    animations: [
      {
        id: 'animation-20-1',
        name: '电磁耦合可视化',
        type: 'electromagnetic-coupling',
        description: '展示电磁耦合常数的物理意义',
        config: {
          color: 0xffff00,
          animationSpeed: 0.5
        }
      },
      {
        id: 'animation-20-2',
        name: '常数关系动态',
        type: 'constant-dynamic',
        description: '动态展示电磁耦合常数与其他物理常数的关系',
        config: {
          color1: 0xff0000,
          color2: 0x0000ff,
          animationSpeed: 0.8
        }
      }
    ]
  }
]

// 首页特性数据
export const FEATURES: FeatureItem[] = [
  {
    icon: '📐',
    title: '核心公式3D可视化',
    description: '将20个核心公式转化为直观的3D交互模型，让抽象的物理概念变得清晰可见',
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
]

// 动画变体常量
export const ANIMATION_VARIANTS = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.7,
        ease: 'easeOut'
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
        ease: 'easeOut'
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
        ease: 'easeInOut'
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
        ease: 'easeOut'
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
        ease: 'easeOut'
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
        ease: 'easeOut'
      }
    }
  }
}

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
}

/**
 * 主题颜色常量
 */
export const THEME_COLORS = {
  primary: {
    DEFAULT: '#3b82f6', // 主蓝色
    light: '#60a5fa',
    dark: '#2563eb'
  },
  secondary: {
    DEFAULT: '#8b5cf6', // 紫色
    light: '#a78bfa',
    dark: '#7c3aed'
  },
  accent: {
    DEFAULT: '#06b6d4', // 青色
    light: '#22d3ee',
    dark: '#0891b2'
  },
  background: {
    DEFAULT: '#0f172a', // 深蓝黑色背景
    surface: '#1e293b', // 卡片背景
    elevated: '#334155' // 高亮背景
  },
  text: {
    DEFAULT: '#f8fafc', // 主文本
    muted: '#cbd5e1', // 次要文本
    disabled: '#94a3b8' // 禁用文本
  }
}

/**
 * 布局常量
 */
export const LAYOUT = {
  headerHeight: '64px',
  footerHeight: '72px',
  sidebarWidth: '240px',
  contentMaxWidth: '1200px',
  gutter: '24px',
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    full: '9999px'
  }
}

/**
 * 动画配置常量
 */
export const ANIMATION_CONFIG = {
  defaultDuration: 0.5,
  fastDuration: 0.3,
  slowDuration: 0.8,
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    cubicBezier: [0.22, 1, 0.36, 1]
  }
}

/**
 * 响应式断点
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

/**
 * 粒子背景配置
 */
export const PARTICLE_CONFIG = {
  count: 50,
  minSize: 1,
  maxSize: 3,
  minSpeed: 0.1,
  maxSpeed: 0.5,
  color: '#3b82f6',
  opacity: 0.5,
  connectDistance: 150
}

/**
 * 3D可视化配置
 */
export const VISUALIZATION_CONFIG = {
  // 场景配置
  backgroundColor: 0x0a0a14,
  clearColor: 0x0a0a14,
  clearAlpha: 1,

  // 相机配置
  fov: 60,
  near: 0.1,
  far: 1000,
  maxCameraDistance: 100,
  minCameraDistance: 5,

  // 辅助线配置
  showGrid: true,
  gridSize: 20,
  gridDivisions: 20,
  showAxes: true,
  axesSize: 10,

  // 光照配置
  defaultAmbientLightIntensity: 0.6,
  defaultDirectionalLightIntensity: 0.8,

  // 粒子系统配置
  particles: {
    count: 1000,
    size: 0.02,
    color: 0x00ffff,
    velocity: 0.01,
    maxAge: 3000
  },

  // 场配置
  field: {
    resolution: 20,
    range: 10,
    arrowSize: 0.5
  },

  // 动画配置
  animation: {
    duration: 10000,
    easing: 'easeInOutSine'
  },

  // 性能配置
  performance: {
    antialiasing: true,
    autoPixelRatio: true,
    maxFPS: 60,
    // 新增性能优化配置
    adaptiveQuality: true,
    defaultParticleCount: 200,
    minParticles: 500,
    maxParticles: 2000,
    qualityThresholdFPS: 30,
    performanceModeThresholdFPS: 20,
    maxDrawCalls: 100,
    enableOcclusionCulling: true,
    enableLevelOfDetail: true,
    textureCompression: true,
    // 渲染优化
    enableShadowMap: false,
    shadowMapResolution: 512,
    enableShadows: false,
    // 内存优化
    maxMemoryUsageMB: 512,
    // 动画优化
    animationFrameSkip: 0,
    // 粒子系统优化
    particleLODLevels: 3,
    particleDistanceFactor: 0.05
  }
}
