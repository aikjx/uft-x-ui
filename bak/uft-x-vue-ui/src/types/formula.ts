export interface Formula {
  id: number
  name: string
  latex: string
  description: string
  category: FormulaCategory
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  variables: Variable[]
  applications: string[]
  relatedFormulas: number[]
}

export interface Variable {
  symbol: string
  name: string
  unit?: string
  description: string
}

export type FormulaCategory =
  | 'spacetime'
  | 'mechanics'
  | 'unified'
  | 'electromagnetic'
  | 'application'

export interface FormulaVisualization {
  id: number
  type: '3d' | '2d' | 'animation'
  config: Record<string, any>
}