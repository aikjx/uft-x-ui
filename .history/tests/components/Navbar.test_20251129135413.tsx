import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '@/components/Navbar'

describe('Navbar - 导航菜单组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置窗口尺寸
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 })
    // 重置滚动位置
    window.scrollY = 0
  })

  const renderWithRouter = (initialEntries?: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries || ['/']}>
        <Navbar />
      </MemoryRouter>
    )
  }

  it('应该正确渲染所有导航菜单项', () => {
    renderWithRouter()
    
    // 检查菜单项文本
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('公式可视化')).toBeInTheDocument()
    expect(screen.getByText('人工场技术')).toBeInTheDocument()
    expect(screen.getByText('交互探索')).toBeInTheDocument()
    expect(screen.getByText('知识学习')).toBeInTheDocument()
  })

  it('应该正确高亮当前活动菜单项并支持菜单切换', async () => {
    // 测试公式可视化页面
    renderWithRouter(['/formulas'])
    
    // 等待动画完成
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ transform: 'translateY(0px)' })
    })
    
    // 检查公式可视化菜单项
    const formulasMenuItem = screen.getByText('公式可视化')
    expect(formulasMenuItem.closest('a')).toHaveClass('text-blue-400')
    
    // 检查其他菜单项未被高亮
    const artificialFieldMenuItem = screen.getByText('人工场技术')
    const interactiveMenuItem = screen.getByText('交互探索')
    expect(artificialFieldMenuItem.closest('a')).toHaveClass('text-white')
    expect(interactiveMenuItem.closest('a')).toHaveClass('text-white')
    
    // 重新渲染到人工场技术页面
    renderWithRouter(['/artificial-field'])
    
    // 等待动画完成
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ transform: 'translateY(0px)' })
    })
    
    // 检查人工场技术菜单项被高亮
    const artificialFieldMenuItem2 = screen.getByText('人工场技术')
    expect(artificialFieldMenuItem2.closest('a')).toHaveClass('text-blue-400')
    
    // 检查其他菜单项未被高亮
    const formulasMenuItem2 = screen.getByText('公式可视化')
    const interactiveMenuItem2 = screen.getByText('交互探索')
    expect(formulasMenuItem2.closest('a')).toHaveClass('text-white')
    expect(interactiveMenuItem2.closest('a')).toHaveClass('text-white')
    
    // 重新渲染到交互探索页面
    renderWithRouter(['/interactive'])
    
    // 等待动画完成
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ transform: 'translateY(0px)' })
    })
    
    // 检查交互探索菜单项被高亮
    const interactiveMenuItem3 = screen.getByText('交互探索')
    expect(interactiveMenuItem3.closest('a')).toHaveClass('text-blue-400')
    
    // 检查其他菜单项未被高亮
    const formulasMenuItem3 = screen.getByText('公式可视化')
    const artificialFieldMenuItem3 = screen.getByText('人工场技术')
    expect(formulasMenuItem3.closest('a')).toHaveClass('text-white')
    expect(artificialFieldMenuItem3.closest('a')).toHaveClass('text-white')
  })

  it('应该正确处理导航链接点击', async () => {
    renderWithRouter()
    
    // 等待动画完成
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ transform: 'translateY(0px)' })
    })
    
    // 检查链接路径
    const formulasLink = screen.getByText('公式可视化').closest('a')
    const artificialFieldLink = screen.getByText('人工场技术').closest('a')
    const interactiveLink = screen.getByText('交互探索').closest('a')
    
    expect(formulasLink).toHaveAttribute('href', '/formulas')
    expect(artificialFieldLink).toHaveAttribute('href', '/artificial-field')
    expect(interactiveLink).toHaveAttribute('href', '/interactive')
  })

  it('应该有正确的无障碍属性', async () => {
    renderWithRouter()
    
    // 等待动画完成
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ transform: 'translateY(0px)' })
    })
    
    const nav = screen.getByRole('navigation')
    const logo = screen.getByRole('heading', { name: /统一场论探索/ })
    
    // 检查导航角色
    expect(nav).toHaveRole('navigation')
    
    // 检查logo可访问性
    expect(logo).toBeInTheDocument()
  })
})
