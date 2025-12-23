import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import { MathJax } from './components/MathJax';
import { showNotification } from './utils';
import './index.css';

// 使用React.lazy进行代码分割，并添加预加载注释以优化加载
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './pages/HomePage'));
const FormulaVisualizationPage = lazy(() => import(/* webpackChunkName: "formulas" */ './pages/FormulaVisualizationPage'));
const ArtificialFieldPage = lazy(() => import(/* webpackChunkName: "artificial-field" */ './pages/ArtificialFieldPage'));
const InteractiveExplorationPage = lazy(() => import(/* webpackChunkName: "interactive" */ './pages/InteractiveExplorationPage'));
const KnowledgePage = lazy(() => import(/* webpackChunkName: "knowledge" */ './pages/KnowledgePage'));

// 页面容器组件
export const PageContainer: React.FC<{
  children: React.ReactNode;
  hideBackground?: boolean;
}> = ({ children, hideBackground = false }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 只在首页和知识页面显示粒子背景，减少其他页面的性能消耗
  const shouldShowBackground = !hideBackground && 
    (location.pathname === '/' || location.pathname === '/knowledge');

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#050508] via-[#0a0a1a] to-[#151530]">
      {shouldShowBackground && <ParticleBackground />}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 relative z-10 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[70vh]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// 加载组件
const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <motion.div
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-blue-300 text-lg font-light"
    >
      加载统一场论可视化系统...
    </motion.p>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "200px" }}
      transition={{ delay: 0.5, duration: 2 }}
      className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
    />
  </div>
);

function App() {
  useEffect(() => {
    document.title = '统一场论3D可视化平台';

    // 性能监控
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 统一场论可视化平台启动成功');
    }

    // 显示欢迎通知
    setTimeout(() => {
      showNotification.success('欢迎探索统一场论的奥秘！');
    }, 1000);

    return () => {
      // 清理资源
    };
  }, []);

  // 预加载关键页面组件，提高用户体验
  useEffect(() => {
    // 预加载导航菜单中的关键页面
    import('./pages/FormulaVisualizationPage');
    import('./pages/ArtificialFieldPage');
    import('./pages/InteractiveExplorationPage');
    import('./pages/KnowledgePage');
  }, []);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          duration={4000}
        />
        
        {/* 将Navbar移到Routes外部，只渲染一次 */}
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <PageContainer>
                <Suspense fallback={<LoadingFallback />}>
                  <HomePage />
                </Suspense>
              </PageContainer>
            }
          />

          <Route
            path="/formulas"
            element={
              <PageContainer>
                <Suspense fallback={<LoadingFallback />}>
                  <FormulaVisualizationPage />
                </Suspense>
              </PageContainer>
            }
          />

          <Route
            path="/artificial-field"
            element={
              <PageContainer>
                <Suspense fallback={<LoadingFallback />}>
                  <ArtificialFieldPage />
                </Suspense>
              </PageContainer>
            }
          />

          <Route
            path="/interactive"
            element={
              <PageContainer>
                <Suspense fallback={<LoadingFallback />}>
                  <InteractiveExplorationPage />
                </Suspense>
              </PageContainer>
            }
          />

          <Route
            path="/knowledge"
            element={
              <PageContainer>
                <Suspense fallback={<LoadingFallback />}>
                  <KnowledgePage />
                </Suspense>
              </PageContainer>
            }
          />

          <Route
            path="*"
            element={
              <PageContainer hideBackground>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
                  <p className="text-xl text-gray-400 mb-8">页面未找到</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    返回首页
                  </motion.button>
                </div>
              </PageContainer>
            }
          />
        </Routes>

        {/* Footer也移到Routes外部 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;