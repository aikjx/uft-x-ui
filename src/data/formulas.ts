import type { Formula } from '../types/formula'

export const formulas: Formula[] = [
  {
    id: 1,
    name: '时空同一化方程',
    latex: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    description: '揭示时间与空间的本质统一，时间是空间的运动形式',
    category: 'spacetime',
    difficulty: 'beginner',
    variables: [
      { symbol: 'r', name: '位置矢量', description: '空间中的位置' },
      { symbol: 'C', name: '光速矢量', unit: 'm/s', description: '光速方向' },
      { symbol: 't', name: '时间', unit: 's', description: '时间参数' }
    ],
    applications: ['相对论基础', '时空结构', '光速不变原理'],
    relatedFormulas: [2, 16]
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    latex: '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
    description: '描述粒子在三维空间中的螺旋运动轨迹',
    category: 'spacetime',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'r', name: '螺旋半径', unit: 'm', description: '螺旋运动的半径' },
      { symbol: 'ω', name: '角频率', unit: 'rad/s', description: '旋转角速度' },
      { symbol: 'h', name: '螺距参数', unit: 'm/s', description: '沿z轴的速度' }
    ],
    applications: ['粒子轨迹', '电磁波传播', '量子自旋'],
    relatedFormulas: [1, 8]
  },
  {
    id: 3,
    name: '质量定义方程',
    latex: 'm = k \\cdot \\frac{dn}{d\\Omega}',
    description: '质量是空间密度梯度的体现',
    category: 'mechanics',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'm', name: '质量', unit: 'kg', description: '物体的质量' },
      { symbol: 'k', name: '比例常数', description: '空间密度系数' },
      { symbol: 'n', name: '空间密度', description: '单位体积的空间点数' },
      { symbol: 'Ω', name: '立体角', unit: 'sr', description: '空间角度' }
    ],
    applications: ['引力理论', '质量起源', '暗物质'],
    relatedFormulas: [4, 5]
  },
  {
    id: 4,
    name: '引力场定义方程',
    latex: '\\overrightarrow{A} = -G k \\frac{\\Delta n}{\\Delta s} \\frac{\\overrightarrow{r}}{r}',
    description: '引力场是空间密度梯度产生的加速度场',
    category: 'mechanics',
    difficulty: 'advanced',
    variables: [
      { symbol: 'A', name: '引力场强度', unit: 'm/s²', description: '引力加速度' },
      { symbol: 'G', name: '引力常数', unit: 'N·m²/kg²', description: '万有引力常数' },
      { symbol: 'Δn/Δs', name: '空间密度梯度', description: '空间密度变化率' }
    ],
    applications: ['万有引力', '黑洞', '引力波'],
    relatedFormulas: [3, 12]
  },
  {
    id: 5,
    name: '静止动量方程',
    latex: '\\overrightarrow{p}_0 = m_0 \\overrightarrow{C}_0',
    description: '静止物体的动量由其质量和光速决定',
    category: 'mechanics',
    difficulty: 'beginner',
    variables: [
      { symbol: 'p₀', name: '静止动量', unit: 'kg·m/s', description: '静止状态的动量' },
      { symbol: 'm₀', name: '静止质量', unit: 'kg', description: '物体的静止质量' },
      { symbol: 'C₀', name: '光速', unit: 'm/s', description: '真空中的光速' }
    ],
    applications: ['相对论动力学', '能量守恒'],
    relatedFormulas: [6, 16]
  },
  {
    id: 6,
    name: '运动动量方程',
    latex: '\\overrightarrow{P} = m (\\overrightarrow{C} - \\overrightarrow{V})',
    description: '运动物体的动量修正公式',
    category: 'mechanics',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'P', name: '动量', unit: 'kg·m/s', description: '运动动量' },
      { symbol: 'm', name: '质量', unit: 'kg', description: '相对论质量' },
      { symbol: 'V', name: '速度', unit: 'm/s', description: '物体运动速度' }
    ],
    applications: ['高速粒子', '相对论效应'],
    relatedFormulas: [5, 7]
  },
  {
    id: 7,
    name: '宇宙大统一方程',
    latex: 'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
    description: '统一描述引力、电磁力的终极力方程',
    category: 'unified',
    difficulty: 'advanced',
    variables: [
      { symbol: 'F', name: '力', unit: 'N', description: '作用力' },
      { symbol: 'P', name: '动量', unit: 'kg·m/s', description: '系统动量' }
    ],
    applications: ['统一场论', '四种基本力', '宇宙演化'],
    relatedFormulas: [6, 12, 15]
  },
  {
    id: 8,
    name: '空间波动方程',
    latex: '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
    description: '空间本身的波动特性，引力波的数学基础',
    category: 'spacetime',
    difficulty: 'advanced',
    variables: [
      { symbol: 'L', name: '空间位移', unit: 'm', description: '空间扰动' },
      { symbol: 'c', name: '光速', unit: 'm/s', description: '波传播速度' }
    ],
    applications: ['引力波', '时空涟漪', 'LIGO探测'],
    relatedFormulas: [1, 2]
  },
  {
    id: 9,
    name: '电荷定义方程',
    latex: 'q = k\' k \\frac{1}{\\Omega^2} \\frac{d\\Omega}{dt}',
    description: '电荷是空间旋转变化率的体现',
    category: 'electromagnetic',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'q', name: '电荷', unit: 'C', description: '电荷量' },
      { symbol: 'Ω', name: '立体角', unit: 'sr', description: '空间角度' }
    ],
    applications: ['电荷守恒', '量子化', '基本电荷'],
    relatedFormulas: [10, 11]
  },
  {
    id: 10,
    name: '电场定义方程',
    latex: '\\vec{E} = -\\frac{k k\'}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
    description: '电场源于空间旋转的时间变化',
    category: 'electromagnetic',
    difficulty: 'advanced',
    variables: [
      { symbol: 'E', name: '电场强度', unit: 'V/m', description: '电场' },
      { symbol: 'ε₀', name: '真空介电常数', unit: 'F/m', description: '介电常数' }
    ],
    applications: ['库仑定律', '电场线', '电势'],
    relatedFormulas: [9, 11, 14]
  },
  {
    id: 11,
    name: '磁场定义方程',
    latex: '\\vec{B} = \\frac{\\mu_0 \\gamma k k\'}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
    description: '磁场是运动电荷产生的相对论效应',
    category: 'electromagnetic',
    difficulty: 'advanced',
    variables: [
      { symbol: 'B', name: '磁感应强度', unit: 'T', description: '磁场' },
      { symbol: 'μ₀', name: '真空磁导率', unit: 'H/m', description: '磁导率' },
      { symbol: 'γ', name: '洛伦兹因子', description: '相对论修正' }
    ],
    applications: ['毕奥-萨伐尔定律', '磁场线', '电磁感应'],
    relatedFormulas: [10, 13, 15]
  },
  {
    id: 12,
    name: '变化引力场产生电磁场',
    latex: '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f} ( \\overline{\\nabla} \\cdot \\overline{E} ) - \\frac{C^{2}}{f} ( \\overline{\\nabla} \\times \\overline{B} )',
    description: '引力场与电磁场的相互转化关系',
    category: 'unified',
    difficulty: 'advanced',
    variables: [
      { symbol: 'A', name: '引力场', unit: 'm/s²', description: '引力加速度' },
      { symbol: 'E', name: '电场', unit: 'V/m', description: '电场强度' },
      { symbol: 'B', name: '磁场', unit: 'T', description: '磁感应强度' }
    ],
    applications: ['引力电磁统一', '场的转化', '宇宙磁场起源'],
    relatedFormulas: [4, 7, 14, 15]
  },
  {
    id: 13,
    name: '磁矢势方程',
    latex: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
    description: '磁场的矢势表示',
    category: 'electromagnetic',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'A', name: '矢势', unit: 'Wb/m', description: '磁矢势' },
      { symbol: 'B', name: '磁场', unit: 'T', description: '磁感应强度' }
    ],
    applications: ['规范场论', 'AB效应', '量子电动力学'],
    relatedFormulas: [11, 14]
  },
  {
    id: 14,
    name: '变化引力场产生电场',
    latex: '\\vec{E} = -f \\frac{d\\vec{A}}{dt}',
    description: '时变引力场激发电场',
    category: 'unified',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'E', name: '电场', unit: 'V/m', description: '感生电场' },
      { symbol: 'A', name: '引力场', unit: 'm/s²', description: '引力加速度' }
    ],
    applications: ['法拉第定律推广', '引力感应'],
    relatedFormulas: [10, 12, 15]
  },
  {
    id: 15,
    name: '变化磁场产生引力场和电场',
    latex: '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}} \\times \\frac{d\\overrightarrow{E}}{dt}',
    description: '磁场变化产生引力场的耦合方程',
    category: 'unified',
    difficulty: 'advanced',
    variables: [
      { symbol: 'B', name: '磁场', unit: 'T', description: '磁感应强度' },
      { symbol: 'A', name: '引力场', unit: 'm/s²', description: '引力加速度' },
      { symbol: 'E', name: '电场', unit: 'V/m', description: '电场强度' }
    ],
    applications: ['麦克斯韦方程推广', '引力磁效应'],
    relatedFormulas: [11, 12, 14]
  },
  {
    id: 16,
    name: '统一场论能量方程',
    latex: 'e = m_0 c^2 = m c^2 \\sqrt{1 - \\frac{v^2}{c^2}}',
    description: '质能等价关系的统一场论表述',
    category: 'application',
    difficulty: 'beginner',
    variables: [
      { symbol: 'e', name: '能量', unit: 'J', description: '总能量' },
      { symbol: 'm₀', name: '静止质量', unit: 'kg', description: '静止质量' },
      { symbol: 'c', name: '光速', unit: 'm/s', description: '光速' }
    ],
    applications: ['核能', '粒子物理', '宇宙学'],
    relatedFormulas: [1, 5, 17]
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    latex: '\\vec{F} = (\\vec{C} - \\vec{V}) \\frac{dm}{dt}',
    description: '接近光速飞行的推进原理',
    category: 'application',
    difficulty: 'advanced',
    variables: [
      { symbol: 'F', name: '推力', unit: 'N', description: '飞行器推力' },
      { symbol: 'C', name: '光速', unit: 'm/s', description: '光速' },
      { symbol: 'V', name: '飞行速度', unit: 'm/s', description: '当前速度' }
    ],
    applications: ['星际旅行', '光速引擎', '反物质推进'],
    relatedFormulas: [6, 7, 16]
  }
]

export const getFormulaById = (id: number): Formula | undefined => {
  return formulas.find(f => f.id === id)
}

export const getFormulasByCategory = (category: string): Formula[] => {
  return formulas.filter(f => f.category === category)
}
