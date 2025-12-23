import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// 在模块级别模拟useFormula钩子，确保在组件导入之前执行
vi.mock('@/hooks/useFormula', () => ({
  useFormula: vi.fn(() => ({
    selectedFormula: {
      id: 1,
      name: '时空同一化方程',
      expression: 'R = C × t',
      category: '基础方程',
      description: '时空同一化方程是统一场论的核心方程',
      derivative: '',
      visualizationType: '3d'
    },
    isLoading: false,
    selectFormula: vi.fn(),
    formulas: [
      {
        id: 1,
        name: '时空同一化方程',
        expression: 'R = C × t',
        category: '基础方程',
        description: '时空同一化方程是统一场论的核心方程',
        derivative: '',
        visualizationType: '3d'
      }
    ],
    formulasByCategory: {
      '基础方程': [
        {
          id: 1,
          name: '时空同一化方程',
          expression: 'R = C × t',
          category: '基础方程',
          description: '时空同一化方程是统一场论的核心方程',
          derivative: '',
          visualizationType: '3d'
        }
      ]
    },
    getFormulaById: vi.fn()
  }))
}))

// 模拟react-router-dom的useNavigate，避免额外的错误
vi.mock('react-router-dom', () => ({
  ...vi.importActual<any>('react-router-dom'),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useLocation: vi.fn()
}))

// 导入组件，确保在所有模拟之后执行
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/