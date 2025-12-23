import React, { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import { MathJax } from './components/MathJax';
import ChatComponent from './components/ChatComponent';
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
      {/* 全局背景网格 - 优化密度 */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.015)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      
      {/* 科技感装饰线条 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-10" />
      
      {shouldShowBackground && <ParticleBackground />}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 relative z-10 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ 
              opacity: 0, 
              y: 30,
              scale: 0.97
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              y: -30,
              scale: 0.97
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
              type: "spring",
              stiffness: 200,
              damping: 25
            }}
          >
            {/* 添加页面内容的淡入效果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// 加载组件
const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
    <motion.div
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 旋转动画 */}
      <motion.div
        className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {/* 脉冲效果 */}
      <motion.div
        className="absolute inset-0 border-4 border-blue-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-300 mb-2">统一场论3D可视化平台</h2>
      <p className="text-blue-200/80 max-w-md mx-auto">
        正在加载宇宙奥秘的可视化系统...
      </p>
    </motion.div>
    
    <motion.div
      className="w-full max-w-md bg-gray-800/50 rounded-full h-2 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
        animate={{ x: [0, "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
    
    <motion.div
      className="flex items-center space-x-2 text-sm text-blue-400/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <span>🔬</span>
      <span>正在初始化3D渲染引擎</span>
    </motion.div>
  </div>
);

// 根组件，包含Navbar和Footer
const RootLayout: React.FC = () => {
  return (
    <div className="App flex flex-col min-h-screen">
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        duration={4000}
      />
      
      {/* 将Navbar移到Routes外部，只渲染一次 */}
      <Navbar />
      
      {/* 使用Outlet渲染子路由内容 */}
      <Outlet />
      
      {/* Footer也移到Routes外部 */}
      <Footer />
      
      {/* 聊天组件 */}
      <ChatComponent />
    </div>
  );
};

// 创建路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <PageContainer>
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          </PageContainer>
        )
      },
      {
        path: "formulas",
        element: (
          <PageContainer>
            <Suspense fallback={<LoadingFallback />}>
              <FormulaVisualizationPage />
            </Suspense>
          </PageContainer>
        )
      },
      {
        path: "artificial-field",
        element: (
          <PageContainer>
            <Suspense fallback={<LoadingFallback />}>
              <ArtificialFieldPage />
            </Suspense>
          </PageContainer>
        )
      },
      {
        path: "interactive",
        element: (
          <PageContainer>
            <Suspense fallback={<LoadingFallback />}>
              <InteractiveExplorationPage />
            </Suspense>
          </PageContainer>
        )
      },
      {
        path: "knowledge",
        element: (
          <PageContainer>
            <Suspense fallback={<LoadingFallback />}>
              <KnowledgePage />
            </Suspense>
          </PageContainer>
        )
      },
      {
        path: "*",
        element: (
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
        )
      }
    ]
  }
]);

function App() {
  useEffect(() => {
    document.title = '统一场论3D可视化平台';

    // 性能监控
    if (import.meta.env.DEV) {
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

  return <RouterProvider router={router} />;
}

export default App;