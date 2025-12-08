import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

// 使用正确的方式创建motion Link组件
const MotionLink = motion.create(RouterLink);

const Navbar: React.FC = () => {
  const location = useLocation() || { pathname: '/', search: '', hash: '', state: null };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', label: '🏠 首页', icon: '🏠' },
    { path: '/formulas', label: '📐 公式可视化', icon: '📐' },
    { path: '/artificial-field', label: '⚡ 人工场技术', icon: '⚡' },
    { path: '/interactive', label: '🔭 交互探索', icon: '🔭' },
    { path: '/knowledge', label: '📚 知识学习', icon: '📚' }
  ];

  useEffect(() => {
    // 检测滚动状态
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // 检测当前活动项
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);
    if (activeIndex !== -1) {
      setActiveIndex(activeIndex);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // 平滑滚动到锚点
  const handleScrollToAnchor = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out transform translate-y-0',
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-3xl border-b border-gray-700/50 shadow-xl shadow-blue-500/5'
            : 'bg-gray-900/60 backdrop-blur-lg border-b border-gray-700/30'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              ref={navRef}
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden group"
              >
                {/* 背景动画 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-white font-bold text-xl relative z-10 group-hover:animate-pulse">🌌</span>
              </div>
              <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">统一场论</h1>
            </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                  >
                    <MotionLink
                      to={item.path}
                      className={cn(
                        'relative px-6 py-3 text-sm font-medium transition-all duration-400 rounded-lg group flex items-center space-x-2',
                        isActive
                          ? 'text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30'
                          : 'text-white hover:text-blue-300 hover:bg-gray-800/50'
                      )}
                      whileHover={{
                        scale: 1.08,
                        y: -2,
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // 添加平滑滚动效果
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }}
                    >
                      {/* 图标动画 */}
                      <motion.span
                        className={`${isActive ? 'animate-pulse' : ''}`}
                        animate={{
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        {item.icon}
                      </motion.span>
                      <span>{item.label.replace(/^[^\s]+\s/, '')}</span>
                      
                      {/* 活性指示器 */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* 悬停效果 */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </MotionLink>
                  </motion.div>
                );
              })}
            </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            whileHover={{ scale: 1.1, rotate: isMobileMenuOpen ? 180 : 0 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              rotate: isMobileMenuOpen ? 180 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-xl"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="py-4 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <MotionLink
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block px-5 py-4 rounded-lg text-base font-medium transition-all duration-300 flex items-center space-x-3',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-l-4 border-blue-500'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-l-4 hover:border-blue-500/50'
                        )}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span
                          className="text-lg"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.icon}
                        </motion.span>
                        <span>{item.label}</span>
                      </MotionLink>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;