import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 直接模拟useParams，确保它返回正确的id
describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  it('应该完整渲染公式可视化页面', () => {
    // 在测试运行前直接模拟useParams，确保它返回正确的id
    vi.mock('react-router-dom', () => ({
      ...vi.importActual<any>('react-router-dom'),
      useParams: vi.fn(() => ({ id: '1' })),
      useLocation: vi.fn(() => ({ pathname: '/formula' })),
      useNavigate: vi.fn(),
    }))

    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/公式可视化/)).toBeInTheDocument()
  })
})