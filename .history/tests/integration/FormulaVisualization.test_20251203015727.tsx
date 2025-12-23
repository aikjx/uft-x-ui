import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 简化的集成测试，专注于基本功能测试
describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  // 在测试文件顶部直接模拟react-router-dom，避免与setup.ts冲突
  vi.mock('react-router-dom', () => ({
    ...vi.importActual<any>('react-router-dom'),
    useLocation: vi.fn(() => ({ pathname: '/formula' })),
    useParams: vi.fn(() => ({ formulaId: '1' })),
    useNavigate: vi.fn(),
  }))

  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/公式可视化/)).toBeInTheDocument()
  })
})