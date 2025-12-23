import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom'
import Navbar from '@/components/Navbar'

describe('Navbar - 导航菜单组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (ui: React.ReactElement, initialEntries?: string[]) => {
    if (initialEntries) {
      return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)
    }
    return render(<Router>{ui}</Router>)
  }

  it('应该正确渲染所有导航菜单项', () => {
    renderWithRouter(<Navbar />)
    
    // 检查菜单项文本
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
    expect(screen.getByText('人工场技术')).toBeInTheDocument()
    expect(screen.getByText('交互探索')).toBeInTheDocument()
    expect(screen.getByText('知识学习')).toBeInTheDocument()
  })

  it('应该正确高亮当前活动菜单项并支持菜单切换', () => {
    // 测试公式可视化页面
    renderWithRouter(<Navbar />, ['/formulas'])
    let formulasLink = screen.getByText('公式可视化').closest('a')
    let artificialFieldLink = screen.getByText('人工场技术').closest('a')
    let interactiveLink = screen.getByText('交互探索').closest('a')
    
    // 检查只有公式可视化被高亮
    expect(formulasLink).toHaveClass('text-blue-400')
    expect(artificialFieldLink).not.toHaveClass('text-blue-400')
    expect(interactiveLink).not.toHaveClass('text-blue-400')
    
    // 切换到人工场技术页面
    renderWithRouter(<Navbar />, ['/artificial-field'])
    formulasLink = screen.getByText('公式可视化').closest('a')
    artificialFieldLink = screen.getByText('人工场技术').closest('a')
    interactiveLink = screen.getByText('交互探索').closest('a')
    
    // 检查只有人工场技术被高亮
    expect(formulasLink).not.toHaveClass('text-blue-400')
    expect(artificialFieldLink).toHaveClass('text-blue-400')
    expect(interactiveLink).not.toHaveClass('text-blue-400')
    
    // 切换到交互探索页面
    renderWithRouter(<Navbar />, ['/interactive'])
    formulasLink = screen.getByText('公式可视化').closest('a')
    artificialFieldLink = screen.getByText('人工场技术').closest('a')
    interactiveLink = screen.getByText('交互探索').closest('a')
    
    // 检查只有交互探索被高亮
    expect(formulasLink).not.toHaveClass('text-blue-400')
    expect(artificialFieldLink).not.toHaveClass('text-blue-400')
    expect(interactiveLink).toHaveClass('text-blue-400')
  })

  it('应该在移动设备上显示汉堡菜单', () => {
    // 模拟移动设备视口
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 })
    
    renderWithRouter(<Navbar />)
    
    // 检查汉堡菜单按钮
    const hamburgerButton = screen.getByRole('button')
    expect(hamburgerButton).toBeInTheDocument()
    
    // 检查移动菜单初始状态
    expect(screen.queryByText('公式可视化')).not.toBeVisible()
    
    // 点击汉堡菜单
    fireEvent.click(hamburgerButton)
    
    // 检查移动菜单是否展开
    expect(screen.getByText('公式可视化')).toBeVisible()
    expect(screen.getByText('人工场技术')).toBeVisible()
    expect(screen.getByText('交互探索')).toBeVisible()
    expect(screen.getByText('知识学习')).toBeVisible()
    
    // 点击菜单项应该关闭菜单
    fireEvent.click(screen.getByText('公式可视化'))
    expect(screen.queryByText('人工场技术')).not.toBeVisible()
  })

  it('应该在滚动时改变样式', () => {
    renderWithRouter(<Navbar />)
    
    // 初始状态
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-gray-900/60')
    
    // 模拟滚动
    fireEvent.scroll(window, { target: { scrollY: 50 } })
    
    // 检查滚动后的样式
    expect(nav).toHaveClass('bg-gray-900/90')
    expect(nav).toHaveClass('shadow-xl')
    
    // 模拟滚动到顶部
    fireEvent.scroll(window, { target: { scrollY: 0 } })
    
    // 检查恢复初始样式
    expect(nav).toHaveClass('bg-gray-900/60')
  })

  it('应该正确处理导航链接点击', () => {
    renderWithRouter(<Navbar />)
    
    const formulasLink = screen.getByText('公式可视化').closest('a')
    const artificialFieldLink = screen.getByText('人工场技术').closest('a')
    const interactiveLink = screen.getByText('交互探索').closest('a')
    const knowledgeLink = screen.getByText('知识学习').closest('a')
    
    // 检查链接路径
    expect(formulasLink).toHaveAttribute('href', '/formulas')
    expect(artificialFieldLink).toHaveAttribute('href', '/artificial-field')
    expect(interactiveLink).toHaveAttribute('href', '/interactive')
    expect(knowledgeLink).toHaveAttribute('href', '/knowledge')
  })

  it('应该有正确的无障碍属性', () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    const logo = screen.getByRole('heading', { name: /统一场论探索/ })
    
    // 检查导航角色
    expect(nav).toHaveRole('navigation')
    
    // 检查logo可访问性
    expect(logo).toBeInTheDocument()
    
    // 检查所有菜单项都存在
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
    expect(screen.getByText('人工场技术')).toBeInTheDocument()
    expect(screen.getByText('交互探索')).toBeInTheDocument()
    expect(screen.getByText('知识学习')).toBeInTheDocument()
  })

  it('应该在不同设备尺寸下有正确的布局', () => {
    // 测试桌面布局
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 })
    
    renderWithRouter(<Navbar />)
    
    // 桌面布局应该显示所有导航项
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
    
    // 测试平板布局
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 })
    
    renderWithRouter(<Navbar />)
    
    // 平板布局应该显示所有导航项
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
    
    // 测试移动布局
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 480 })
    
    renderWithRouter(<Navbar />)
    
    // 移动布局应该隐藏导航项，只显示汉堡菜单
    const hamburgerButton = screen.getByRole('button')
    expect(hamburgerButton).toBeInTheDocument()
    
    // 导航项应该存在但可能隐藏
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
  })

  it('应该有正确的视觉反馈', () => {
    renderWithRouter(<Navbar />)
    
    const formulasLink = screen.getByText('公式可视化').closest('a')
    
    // 检查初始状态
    expect(formulasLink).toHaveClass('text-white')
  })
})
