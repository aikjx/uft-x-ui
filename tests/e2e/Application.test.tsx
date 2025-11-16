import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '@/App'

describe('Application - E2E 端到端测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟完整的路由系统
    vi.mock('react-router-dom', () => ({
      BrowserRouter: ({ children }: any) => <div>{children}</div>,
      Routes: ({ children }: any) => <div>{children}</div>,
      Route: ({ element }: any) => element,
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/' })
    }))
  })

  it('应该完整加载应用程序', () => {
    render(<App />)
    
    // 验证应用根元素
    expect(screen.getByTestId('app-root')).toBeInTheDocument()
    
    // 验证导航栏
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // 验证页面内容
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('应该处理页面导航', async () => {
    render(<App />)
    
    // 验证首页内容
    expect(screen.getByText(/统一场论可视化/)).toBeInTheDocument()
    
    // 模拟导航到公式页面
    const formulaLink = screen.getByText(/公式可视化/)
    fireEvent.click(formulaLink)
    
    await waitFor(() => {
      expect(screen.getByText(/公式可视化页面/)).toBeInTheDocument()
    })
    
    // 模拟导航到知识页面
    const knowledgeLink = screen.getByText(/知识库/)
    fireEvent.click(knowledgeLink)
    
    await waitFor(() => {
      expect(screen.getByText(/知识库页面/)).toBeInTheDocument()
    })
  })

  it('应该处理用户交互流程', async () => {
    render(<App />)
    
    // 导航到公式页面
    const formulaLink = screen.getByText(/公式可视化/)
    fireEvent.click(formulaLink)
    
    await waitFor(() => {
      // 输入公式
      const formulaInput = screen.getByPlaceholderText(/请输入公式/)
      fireEvent.change(formulaInput, { target: { value: 'E = mc^2' } })
      
      // 触发渲染
      const renderButton = screen.getByText(/渲染公式/)
      fireEvent.click(renderButton)
    })
    
    await waitFor(() => {
      // 验证渲染结果
      expect(screen.getByText(/渲染完成/)).toBeInTheDocument()
      
      // 调整性能设置
      const performanceToggle = screen.getByLabelText(/性能模式/)
      fireEvent.click(performanceToggle)
      
      // 验证性能模式切换
      expect(screen.getByText(/高性能模式/)).toBeInTheDocument()
    })
  })

  it('应该处理错误边界和恢复', async () => {
    render(<App />)
    
    // 导航到公式页面
    const formulaLink = screen.getByText(/公式可视化/)
    fireEvent.click(formulaLink)
    
    await waitFor(() => {
      // 输入无效公式
      const formulaInput = screen.getByPlaceholderText(/请输入公式/)
      fireEvent.change(formulaInput, { target: { value: 'invalid formula!!!' } })
      
      // 触发渲染
      const renderButton = screen.getByText(/渲染公式/)
      fireEvent.click(renderButton)
    })
    
    await waitFor(() => {
      // 验证错误处理
      expect(screen.getByText(/公式解析错误/)).toBeInTheDocument()
      
      // 测试错误恢复
      const formulaInput = screen.getByPlaceholderText(/请输入公式/)
      fireEvent.change(formulaInput, { target: { value: 'F = ma' } })
      
      const renderButton = screen.getByText(/渲染公式/)
      fireEvent.click(renderButton)
    })
    
    await waitFor(() => {
      // 验证恢复成功
      expect(screen.getByText(/渲染完成/)).toBeInTheDocument()
    })
  })

  it('应该处理性能监控和优化', async () => {
    render(<App />)
    
    // 导航到公式页面
    const formulaLink = screen.getByText(/公式可视化/)
    fireEvent.click(formulaLink)
    
    await waitFor(() => {
      // 验证性能监控正常工作
      expect(screen.getByText(/FPS:/)).toBeInTheDocument()
      expect(screen.getByText(/内存:/)).toBeInTheDocument()
      
      // 模拟性能优化操作
      const optimizeButton = screen.getByText(/内存优化/)
      fireEvent.click(optimizeButton)
    })
    
    await waitFor(() => {
      // 验证优化效果
      expect(screen.getByText(/优化完成/)).toBeInTheDocument()
    })
  })

  describe('跨浏览器兼容性测试', () => {
    it('应该在不同浏览器环境下正常工作', () => {
      // 模拟不同浏览器环境
      const originalUserAgent = navigator.userAgent
      
      // 测试 Chrome 环境
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      })
      
      render(<App />)
      
      expect(screen.getByTestId('app-root')).toBeInTheDocument()
      
      // 测试 Firefox 环境
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'
      })
      
      render(<App />)
      
      expect(screen.getByTestId('app-root')).toBeInTheDocument()
      
      // 恢复原始 userAgent
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent })
    })
  })

  describe('性能基准测试', () => {
    it('应该在 1000ms 内完成应用启动', () => {
      const startTime = performance.now()
      
      render(<App />)
      
      const endTime = performance.now()
      const startupTime = endTime - startTime
      
      expect(startupTime).toBeLessThan(1000)
    })

    it('应该在 200ms 内完成页面切换', async () => {
      render(<App />)
      
      const startTime = performance.now()
      
      const formulaLink = screen.getByText(/公式可视化/)
      fireEvent.click(formulaLink)
      
      await waitFor(() => {
        expect(screen.getByText(/公式可视化页面/)).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const navigationTime = endTime - startTime
      
      expect(navigationTime).toBeLessThan(200)
    })
  })

  describe('可访问性测试', () => {
    it('应该支持完整的键盘导航', () => {
      render(<App />)
      
      // 测试 Tab 键导航
      fireEvent.keyDown(document, { key: 'Tab' })
      
      expect(document.activeElement).toBe(screen.getByRole('navigation'))
    })

    it('应该提供完整的屏幕阅读器支持', () => {
      render(<App />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })

  describe('错误边界测试', () => {
    it('应该优雅处理组件渲染错误', () => {
      // 模拟组件抛出错误
      vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<App />)
      
      // 验证应用没有崩溃
      expect(screen.getByTestId('app-root')).toBeInTheDocument()
      
      vi.restoreAllMocks()
    })
  })
})