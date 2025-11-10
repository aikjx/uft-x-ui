import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 使用useRef存储timeoutId
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 优化的滚动监听函数 - 使用防抖
  const handleScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsScrolled(window.scrollY > 30);
    }, 16); // 约60fps
  }, []);

  useEffect(() => {
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始检查
    handleScroll();
    
    // 关闭菜单时重置为false
    const closeMenuOnScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    
    window.addEventListener('scroll', closeMenuOnScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', closeMenuOnScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  // 导航项配置
  const navItems = [
    { path: '/', label: '首页', icon: '🏠', key: 'home' },
    { path: '/formulas', label: '公式可视化', icon: '📐', key: 'formulas' },
    { path: '/artificial-field', label: '人工场技术', icon: '⚡', key: 'artificial-field' },
    { path: '/interactive', label: '交互探索', icon: '🔭', key: 'interactive' },
    { path: '/knowledge', label: '知识学习', icon: '📚', key: 'knowledge' }
  ];

  // 检查当前路径是否匹配导航项（支持带参数的路由）
  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // 导航处理
  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled 
        ? 'bg-[#0a0a14]/95 backdrop-blur-md border-b border-blue-900/30 shadow-lg shadow-blue-900/10 py-2' 
        : 'bg-transparent py-3'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="flex gap-2 items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Link 
              to="/" 
              className="flex gap-2 items-center text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              <motion.div 
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌌
              </motion.div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                统一场论探索
              </span>
            </Link>
          </motion.div>

          {/* 桌面端导航 */}
          <nav className="hidden gap-6 items-center md:flex">
            {navItems.map((item) => (
              <motion.div 
                key={item.key}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${isActivePath(item.path) 
                    ? 'bg-blue-900/30 text-blue-300' 
                    : 'text-blue-100/70 hover:text-blue-300 hover:bg-blue-900/20'}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                {isActivePath(item.path) && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                    layoutId="activeNavIndicator"
                  />
                )}
              </motion.div>
            ))}
          </nav>

          {/* 移动端菜单按钮 */}
          <motion.button
            className="p-2 text-blue-200 rounded-full transition-colors md:hidden hover:bg-blue-900/20"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label={isOpen ? '关闭菜单' : '打开菜单'}
          >
            <motion.svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={false}
              animate={{
                rotate: isOpen ? 90 : 0
              }}
            >
              {isOpen ? (
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
                <>
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 12h16"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 18h16"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                </>
              )}
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div 
              className="fixed inset-0 z-40 backdrop-blur-sm bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* 菜单内容 */}
            <motion.div
              className="md:hidden bg-[#0a0a14] border-t border-blue-900/30 shadow-xl shadow-blue-900/20 z-50"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="container px-4 py-4 mx-auto space-y-2">
                {navItems.map((item, index) => (
                  <motion.div 
                    key={item.key} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActivePath(item.path) 
                        ? 'bg-blue-900/30 text-blue-300 font-medium' 
                        : 'text-blue-100/70 hover:bg-blue-900/20'}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
