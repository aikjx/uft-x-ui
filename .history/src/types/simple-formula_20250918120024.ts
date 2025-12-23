// 简化的公式类型定义，用于整个应用
export interface SimpleFormula {
  id: number
  name: string
  description: string
  latex: string
  category: string
  color: string
}

export interface FormulaCategory {
  name: string
  color: string
  count: number
}

// 学习路径相关类型
export interface LearningLevel {
  title: string
  description: string
  color: string
  formulas: SimpleFormula[]
  completed: boolean
  progress: number
}

// 关系图谱相关类型
export interface FormulaNode extends SimpleFormula {
  x?: number
  y?: number
  fx?: number
  fy?: number
}

export interface FormulaLink {
  source: FormulaNode
  target: FormulaNode
  strength: number
  type: string
}