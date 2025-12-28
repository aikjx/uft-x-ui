import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
    // 检测滚动状态，使用更平滑的过渡
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 重置移动端菜单状态当路由变化时
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-in-out',
        isScrolled
          ? 'border-b border-gray-700/50 bg-gray-900/95 shadow-xl shadow-blue-500/10 backdrop-blur-3xl'
          : 'border-b border-gray-700/30 bg-gradient-to-b from-gray-900/80 to-gray-900/30 backdrop-blur-lg'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 shadow-lg shadow-blue-500/20"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.2)',
                  '0 0 40px rgba(99, 102, 241, 0.4)',
                  '0 0 20px rgba(99, 102, 241, 0.2)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <span className="text-xl font-bold text-white">🌌</span>
            </motion.div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                统一场论
              </h1>
              <p className="text-xs text-blue-400/80">Unified Field Theory</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-2 md:flex">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index 
                  }}
                >
                  <RouterLink
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                      isActive
                        ? 'border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 shadow-md shadow-blue-500/10'
                        : 'text-white hover:bg-gray-800/50 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/5'
                    )}
                    onClick={() => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      })
                    }}
                  >
                    {/* 选中状态指示器 */}
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, origin: 'left' }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.label.replace(/^[^\s]+\s/, '')}</span>
                  </RouterLink>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-3 text-gray-400 transition-all duration-300 hover:bg-gray-800/50 hover:text-white hover:shadow-lg hover:shadow-blue-500/10 md:hidden"
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-xl md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div className="space-y-1 px-4 py-4">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <RouterLink
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block flex items-center space-x-3 rounded-lg px-5 py-4 text-base font-medium transition-all duration-300 relative overflow-hidden',
                          isActive
                            ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 shadow-md shadow-blue-500/10'
                            : 'text-gray-300 hover:border-l-4 hover:border-blue-500/50 hover:bg-gray-800/50 hover:text-white'
                        )}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, origin: 'left' }}
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </RouterLink>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
