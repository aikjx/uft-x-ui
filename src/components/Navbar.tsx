import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { cn } from '../utils'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: '🏠 首页', icon: '🏠' },
    { path: '/formulas', label: '📐 公式可视化', icon: '📐' },
    { path: '/artificial-field', label: '⚡ 人工场技术', icon: '⚡' },
    { path: '/interactive', label: '🔭 交互探索', icon: '🔭' },
    { path: '/knowledge', label: '📚 知识学习', icon: '📚' }
  ]

  useEffect(() => {
    // 检测滚动状态
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-out',
        isScrolled
          ? 'border-b border-gray-700/50 bg-gray-900/95 shadow-xl shadow-blue-500/5 backdrop-blur-3xl'
          : 'border-b border-gray-700/30 bg-gradient-to-b from-gray-900/80 to-gray-900/30 backdrop-blur-lg'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 shadow-lg shadow-blue-500/20">
              <span className="text-xl font-bold text-white">🌌</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                统一场论
              </h1>
              <p className="text-xs text-blue-400/80">Unified Field Theory</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-2 md:flex">
            {navItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <RouterLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400'
                      : 'text-white hover:bg-gray-800/50 hover:text-blue-300'
                  )}
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    })
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label.replace(/^[^\s]+\s/, '')}</span>
                </RouterLink>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-3 text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-4 py-4">
              {navItems.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <RouterLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'block flex items-center space-x-3 rounded-lg px-5 py-4 text-base font-medium transition-all duration-300',
                      isActive
                        ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400'
                        : 'text-gray-300 hover:border-l-4 hover:border-blue-500/50 hover:bg-gray-800/50 hover:text-white'
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </RouterLink>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
