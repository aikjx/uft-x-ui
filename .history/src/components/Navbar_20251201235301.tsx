import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

// 使用正确的方式创建motion Link组件
const MotionLink = motion(RouterLink);

const Navbar: React.FC = () => {
  const location = useLocation() || { pathname: '/', search: '', hash: '', state: null };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '🏠 首页', icon: '🏠' },
    { path: '/formulas', label: '📐 公式可视化', icon: '📐' },
    { path: '/artificial-field', label: '⚡ 人工场技术', icon: '⚡' },
    { path: '/interactive', label: '🔭 交互探索', icon: '🔭' },
    { path: '/knowledge', label: '📚 知识学习', icon: '📚' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform translate-y-0',
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-2xl border-b border-gray-700/50 shadow-xl shadow-blue-500/5'
            : 'bg-gray-900/60 backdrop-blur-lg border-b border-gray-700/30'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div 
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse-shadow"
              >
                <span className="text-white font-bold text-xl">🌌</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">统一场论探索</h1>
                <p className="text-xs text-gray-400">Unified Field Theory</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative px-6 py-3 text-sm font-medium transition-all duration-300 rounded-lg hover:scale-105 hover:-translate-y-1',
                      isActive
                        ? 'text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30'
                        : 'text-white hover:text-blue-300 hover:bg-gray-800/50'
                    )}
                  >
                    <span className="flex items-center space-x-2">
                      <span className={`${isActive ? 'animate-pulse' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.label.replace(/^[^\s]+\s/, '')}</span>
                    </span>
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transition-all duration-300"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-xl"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <MotionLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block px-5 py-4 rounded-lg text-base font-medium transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-l-4 border-blue-500'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      )}
                    >
                      <span className="flex items-center space-x-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    </MotionLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;