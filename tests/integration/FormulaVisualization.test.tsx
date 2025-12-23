import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 简化测试，只测试基本功能
describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)

    // 验证页面标题
    expect(screen.getByText(/统一场论核心公式/)).toBeInTheDocument()
  })
})
