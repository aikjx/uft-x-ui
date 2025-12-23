// 完整的公式类型定义（与 simple-formula.ts 保持一致）
export interface Formula {
  id: number
  name: string
  description: string
  latex: string
  category: string
  color: string
  keywords?: string[]
  relatedFormulas?: number[]
  difficulty?: 'easy' | 'medium' | 'hard'
  createdAt?: string
  updatedAt?: string
}

export interface FormulaCategory {
  name: string
  color: string
  count: number
  description?: string
  icon?: string
}

// 学习路径相关类型
export interface LearningLevel {
  title: string
  description: string
  color: string
  formulas: Formula[]
  completed: boolean
  progress: number
}

// 关系图谱相关类型
export interface FormulaNode extends Formula {
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

// 搜索相关类型
export interface SearchResult {
  formulas: Formula[]
  categories: FormulaCategory[]
  total: number
  query: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

// 分页类型
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}