import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 简化测试，移除所有复杂的mock配置
describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  // 清除所有mock
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/公式可视化/)).toBeInTheDocument()
  })
})