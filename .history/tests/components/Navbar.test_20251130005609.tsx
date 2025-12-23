import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '@/components/Navbar'

// 模拟 framer-motion
vi.mock('framer-motion', () => {
  // 基础motion对象，支持函数调用和属性访问
  const baseMotion = (Component: any) => {
    return ({ children, ...props }: any) => React.createElement(Component, props, children);
  };
  
  // 扩展motion对象，添加常用HTML元素的支持
  const motion = Object.assign(baseMotion, {
    nav: ({ children, ...props }: any) => React.createElement('nav', props, children),
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    create: (Component: any) => {
      return ({ children, ...props }: any) => React.createElement(Component, props, children);
    }
  });
  
  return {
    motion,
    AnimatePresence: ({ children }: any) => {
      return React.createElement('div', null, children);
    },
  };
});

// 模拟 useLocation 钩子，确保它能正确返回当前路径
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
  };
});

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
    // 手动设置useLocation返回值
    const { useLocation } = await import('react-router-dom')
    (useLocation as any).mockReturnValue({ pathname: '/formulas', search: '', hash: '', state: null })
    
    renderWithRouter(['/formulas'])
    
    // 检查公式可视化菜单项
    const formulasMenuItem = screen.getByText('公式可视化')
    const formulasLink = formulasMenuItem.closest('a')
    expect(formulasLink).toHaveClass('text-blue-400')
  })

  it('应该正确高亮人工场技术菜单项', () => {
    // 手动设置useLocation返回值
    const { useLocation } = await import('react-router-dom')
    (useLocation as any).mockReturnValue({ pathname: '/artificial-field', search: '', hash: '', state: null })
    
    renderWithRouter(['/artificial-field'])
    
    // 检查人工场技术菜单项被高亮
    const artificialFieldMenuItem = screen.getByText('人工场技术')
    const artificialFieldLink = artificialFieldMenuItem.closest('a')
    expect(artificialFieldLink).toHaveClass('text-blue-400')
  })

  it('应该正确高亮交互探索菜单项', () => {
    // 手动设置useLocation返回值
    const { useLocation } = await import('react-router-dom')
    (useLocation as any).mockReturnValue({ pathname: '/interactive', search: '', hash: '', state: null })
    
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
