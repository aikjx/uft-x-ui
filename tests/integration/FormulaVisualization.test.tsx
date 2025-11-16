import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟路由
    vi.mock('react-router-dom', () => ({
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/formula' })
    }))
  })

  it('应该完整渲染公式可视化页面', () => {
    render(<FormulaVisualizationPage />)
    
    // 验证页面标题
    expect(screen.getByText(/公式可视化/)).toBeInTheDocument()
    
    // 验证主要组件
    expect(screen.getByTestId('threejs-visualization')).toBeInTheDocument()
    expect(screen.getByTestId('performance-panel')).toBeInTheDocument()
    expect(screen.getByTestId('control-panel')).toBeInTheDocument()
  })

  it('应该处理公式输入和渲染', async () => {
    render(<FormulaVisualizationPage />)
    
    const formulaInput = screen.getByPlaceholderText(/请输入公式/)
    const renderButton = screen.getByText(/渲染公式/)
    
    // 输入公式
    fireEvent.change(formulaInput, { target: { value: 'E = mc^2' } })
    
    // 触发渲染
    fireEvent.click(renderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/渲染完成/)).toBeInTheDocument()
    })
  })

  it('应该处理性能模式切换', async () => {
    render(<FormulaVisualizationPage />)
    
    const performanceToggle = screen.getByLabelText(/性能模式/)
    
    fireEvent.click(performanceToggle)
    
    await waitFor(() => {
      expect(screen.getByText(/高性能模式/)).toBeInTheDocument()
    })
  })

  it('应该处理3D场景交互', async () => {
    render(<FormulaVisualizationPage />)
    
    const rotateButton = screen.getByText(/旋转视图/)
    const zoomButton = screen.getByText(/缩放视图/)
    
    fireEvent.click(rotateButton)
    fireEvent.click(zoomButton)
    
    await waitFor(() => {
      expect(screen.getByText(/交互模式激活/)).toBeInTheDocument()
    })
  })

  it('应该处理复杂的物理公式', async () => {
    render(<FormulaVisualizationPage />)
    
    const complexFormula = '∇²ψ = (8π²m/h²)(E - V)ψ'
    
    const formulaInput = screen.getByPlaceholderText(/请输入公式/)
    fireEvent.change(formulaInput, { target: { value: complexFormula } })
    
    const renderButton = screen.getByText(/渲染公式/)
    fireEvent.click(renderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/量子力学方程/)).toBeInTheDocument()
    })
  })

  it('应该处理实时性能监控', async () => {
    render(<FormulaVisualizationPage />)
    
    // 模拟性能数据变化
    await waitFor(() => {
      expect(screen.getByText(/FPS:/)).toBeInTheDocument()
      expect(screen.getByText(/内存:/)).toBeInTheDocument()
      expect(screen.getByText(/粒子:/)).toBeInTheDocument()
    })
  })

  it('应该处理错误恢复', async () => {
    render(<FormulaVisualizationPage />)
    
    // 模拟错误输入
    const formulaInput = screen.getByPlaceholderText(/请输入公式/)
    fireEvent.change(formulaInput, { target: { value: 'invalid formula' } })
    
    const renderButton = screen.getByText(/渲染公式/)
    fireEvent.click(renderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/公式解析错误/)).toBeInTheDocument()
    })
    
    // 测试错误恢复
    fireEvent.change(formulaInput, { target: { value: 'E = mc^2' } })
    fireEvent.click(renderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/渲染完成/)).toBeInTheDocument()
    })
  })

  describe('性能基准测试', () => {
    it('应该在 500ms 内完成页面加载', () => {
      const startTime = performance.now()
      
      render(<FormulaVisualizationPage />)
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(500)
    })

    it('应该在 100ms 内处理公式渲染', async () => {
      render(<FormulaVisualizationPage />)
      
      const startTime = performance.now()
      
      const formulaInput = screen.getByPlaceholderText(/请输入公式/)
      fireEvent.change(formulaInput, { target: { value: 'E = mc^2' } })
      
      const renderButton = screen.getByText(/渲染公式/)
      fireEvent.click(renderButton)
      
      await waitFor(() => {
        expect(screen.getByText(/渲染完成/)).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('响应式设计测试', () => {
    it('应该适应移动端布局', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 })
      
      render(<FormulaVisualizationPage />)
      
      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument()
    })

    it('应该适应平板端布局', () => {
      // 模拟平板端视口
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 })
      
      render(<FormulaVisualizationPage />)
      
      expect(screen.getByTestId('tablet-layout')).toBeInTheDocument()
    })
  })

  describe('可访问性测试', () => {
    it('应该支持键盘导航', () => {
      render(<FormulaVisualizationPage />)
      
      const formulaInput = screen.getByPlaceholderText(/请输入公式/)
      
      // 测试 Tab 导航
      fireEvent.keyDown(formulaInput, { key: 'Tab' })
      
      expect(document.activeElement).toBe(formulaInput)
    })

    it('应该提供完整的 ARIA 标签', () => {
      render(<FormulaVisualizationPage />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /可视化区域/ })).toBeInTheDocument()
    })
  })
})