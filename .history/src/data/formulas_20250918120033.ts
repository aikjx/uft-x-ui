import type { SimpleFormula, FormulaCategory } from '../types/simple-formula'

export const formulas: SimpleFormula[] = [
  {
    id: 1,
    name: "时空同一化方程",
    description: "描述时空的统一性，将时间和空间统一在一个方程中",
    latex: "\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}",
    category: "时空理论",
    color: "#3B82F6"
  },
  {
    id: 2,
    name: "三维螺旋时空方程",
    description: "描述三维空间中的螺旋时空结构",
    latex: "\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}",
    category: "时空理论",
    color: "#3B82F6"
  },
  {
    id: 3,
    name: "质量定义方程",
    description: "定义质量与空间密度变化的关系",
    latex: "m = k \\cdot \\frac{dn}{d\\Omega}",
    category: "力学基础",
    color: "#10B981"
  },
  {
    id: 4,
    name: "引力场定义方程",
    description: "定义引力场与空间密度梯度的关系",
    latex: "\\vec{A} = -Gk \\frac{\\Delta n}{\\Delta s} \\frac{\\vec{r}}{r}",
    category: "力学基础",
    color: "#10B981"
  },
  {
    id: 5,
    name: "静止动量方程",
    description: "描述静止状态下的动量",
    latex: "\\vec{p}_0 = m_0 \\vec{C}_0",
    category: "力学基础",
    color: "#10B981"
  },
  {
    id: 6,
    name: "运动动量方程",
    description: "描述运动状态下的动量",
    latex: "\\vec{P} = m(\\vec{C} - \\vec{V})",
    category: "力学基础",
    color: "#10B981"
  },
  {
    id: 7,
    name: "宇宙大统一方程（力方程）",
    description: "统一描述宇宙中所有力的基本方程",
    latex: "\\vec{F} = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}",
    category: "统一理论",
    color: "#F59E0B"
  },
  {
    id: 8,
    name: "空间波动方程",
    description: "描述空间的波动性质",
    latex: "\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}",
    category: "统一理论",
    color: "#F59E0B"
  },
  {
    id: 9,
    name: "电荷定义方程",
    description: "定义电荷与空间角度变化的关系",
    latex: "q = k'k \\frac{1}{\\Omega^2} \\frac{d\\Omega}{dt}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 10,
    name: "电场定义方程",
    description: "定义电场强度",
    latex: "\\vec{E} = -\\frac{kk'}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 11,
    name: "磁场定义方程",
    description: "定义磁场强度",
    latex: "\\vec{B} = \\frac{\\mu_0 \\gamma kk'}{4\\pi\\Omega^2} \\frac{d\\Omega}{dt} \\frac{[(x-vt)\\vec{i} + y\\vec{j} + z\\vec{k}]}{[\\gamma^2(x-vt)^2 + y^2 + z^2]^{3/2}}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 12,
    name: "变化的引力场产生电磁场",
    description: "描述引力场变化如何产生电磁场",
    latex: "\\frac{\\partial^2\\vec{A}}{\\partial t^2} = \\frac{\\vec{V}}{f}(\\nabla \\cdot \\vec{E}) - \\frac{C^2}{f}(\\nabla \\times \\vec{B})",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 13,
    name: "磁矢势方程",
    description: "描述磁矢势与磁场的关系",
    latex: "\\nabla \\times \\vec{A} = \\frac{\\vec{B}}{f}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 14,
    name: "变化的引力场产生电场",
    description: "描述引力场变化如何产生电场",
    latex: "\\vec{E} = -f \\frac{d\\vec{A}}{dt}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 15,
    name: "变化的磁场产生引力场和电场",
    description: "描述磁场变化如何产生引力场和电场",
    latex: "\\frac{d\\vec{B}}{dt} = \\frac{-\\vec{A} \\times \\vec{E}}{c^2} - \\frac{\\vec{V}}{c^2} \\times \\frac{d\\vec{E}}{dt}",
    category: "电磁理论",
    color: "#EF4444"
  },
  {
    id: 16,
    name: "统一场论能量方程",
    description: "统一场论中的能量关系",
    latex: "E = m_0c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}",
    category: "应用理论",
    color: "#8B5CF6"
  },
  {
    id: 17,
    name: "光速飞行器动力学方程",
    description: "描述光速飞行器的动力学特性",
    latex: "\\vec{F} = (\\vec{C} - \\vec{V}) \\frac{dm}{dt}",
    category: "应用理论",
    color: "#8B5CF6"
  }
];

export const categories: FormulaCategory[] = [
  { name: "时空理论", color: "#3B82F6", count: 2 },
  { name: "力学基础", color: "#10B981", count: 4 },
  { name: "统一理论", color: "#F59E0B", count: 2 },
  { name: "电磁理论", color: "#EF4444", count: 7 },
  { name: "应用理论", color: "#8B5CF6", count: 2 }
];