import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '@/components/Navbar'

describe('Navbar - 导航菜单组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟matchMedia API，解决Framer Motion的addEventListener错误
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    })
    
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

  it('应该正确高亮公式可视化菜单项', () => {
    renderWithRouter(['/formulas'])
    
    // 检查公式可视化菜单项
    const formulasMenuItem = screen.getByText('公式可视化')
    const formulasLink = formulasMenuItem.closest('a')
    expect(formulasLink).toHaveClass('text-blue-400')
  })

  it('应该正确高亮人工场技术菜单项', () => {
    renderWithRouter(['/artificial-field'])
    
    // 检查人工场技术菜单项被高亮
    const artificialFieldMenuItem = screen.getByText('人工场技术')
    const artificialFieldLink = artificialFieldMenuItem.closest('a')
    expect(artificialFieldLink).toHaveClass('text-blue-400')
  })

  it('应该正确高亮交互探索菜单项', () => {
    renderWithRouter(['/interactive'])
    
    // 检查交互探索菜单项被高亮
    const interactiveMenuItem = screen.getByText('交互探索')
    const interactiveLink = interactiveMenuItem.closest('a')
    expect(interactiveLink).toHaveClass('text-blue-400')
  })

  it('应该正确处理导航链接点击', () => {
    renderWithRouter()
    
    // 检查链接路径
    const formulasMenuItem = screen.getByText('公式可视化')
    const artificialFieldMenuItem = screen.getByText('人工场技术')
    const interactiveMenuItem = screen.getByText('交互探索')
    
    const formulasLink = formulasMenuItem.closest('a')
    const artificialFieldLink = artificialFieldMenuItem.closest('a')
    const interactiveLink = interactiveMenuItem.closest('a')
    
    expect(formulasLink).toHaveAttribute('href', '/formulas')
    expect(artificialFieldLink).toHaveAttribute('href', '/artificial-field')
    expect(interactiveLink).toHaveAttribute('href', '/interactive')
  })

  it('应该有正确的无障碍属性', () => {
    renderWithRouter()
    
    const nav = screen.getByRole('navigation')
    const logo = screen.getByRole('heading', { name: /统一场论探索/ })
    
    // 检查导航角色
    expect(nav).toHaveRole('navigation')
    
    // 检查logo可访问性
    expect(logo).toBeInTheDocument()
  })
})
