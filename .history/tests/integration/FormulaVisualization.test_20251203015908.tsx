import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 在模块级别模拟react-router-dom，确保所有组件都能访问到mock
vi.mock('react-router-dom', () => {
  const actual = vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1' })),
    useLocation: vi.fn(() => ({ pathname: '/formula' })),
    useNavigate: vi.fn(),
  }
})

describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/公式可视化/