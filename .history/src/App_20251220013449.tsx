import React, { lazy, Suspense, useEffect } from 'react';
import { NotificationProvider } from './components/Notification';
import { createBrowserRouter, RouterProvider, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import { MathJax } from './components/MathJax';
import ChatComponent from './components/ChatComponent';
import ErrorBoundary from './components/ErrorBoundary';
import { showNotification } from './utils';
import { startAutomatedOptimization, AutomatedOptimizationMode } from './performance/AutomatedPerformanceOptimizer';
import { registerAllServices, initializeAllServices, disposeAllServices } from './services';
import './index.css';

// 使用React.lazy进行代码分割，并添加预加载注释以优化加载
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './pages/HomePage'));
const FormulaVisualizationPage = lazy(() => import(/* webpackChunkName: "formulas" */ './pages/FormulaVisualizationPage'));
const ArtificialFieldPage = lazy(() => import(/* webpackChunkName: "artificial-field" */ './pages/ArtificialFieldPage'));
const InteractiveExplorationPage = lazy(() => import(/* webpackChunkName: "interactive" */ './pages/InteractiveExplorationPage'));
const KnowledgePage = lazy(() => import(/* webpackChunkName: "knowledge" */ './pages/KnowledgePage'));
// 添加新的可视化页面
const SpiralDivergencePage = lazy(() => import(/* webpackChunkName: "spiral-divergence" */ './pages/SpiralDivergencePage'));
const CylindricalSpiralFieldPage = lazy(() => import(/* webpackChunkName: "cylindrical-spiral" */ './pages/CylindricalSpiralFieldPage'));

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
    <div className="relative flex flex-col flex-grow bg-gradient-to-b from-[#050508] via-[#0a0a1a] to-[#151530]">
      {/* 全局背景网格 - 优化密度 */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.015)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      {/* 科技感装饰线条 */}
      <div className="absolute top-0 right-0 left-0 z-10 h-px bg-gradient-to-r from-transparent to-transparent via-blue-500/30" />

      {shouldShowBackground && <ParticleBackground />}
      <main className="container overflow-x-hidden relative z-10 px-4 py-4 pt-24 mx-auto md:py-6 md:pt-24">
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

// 加载组件 - 优化性能，减少不必要的动画
const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
    <div className="relative">
      {/* 旋转动画 - 使用CSS动画替代motion组件 */}
      <div className="w-16 h-16 rounded-full border-4 border-blue-500 animate-spin border-t-transparent" />
    </div>

    <div className="opacity-100">
      <h2 className="mb-2 text-2xl font-bold text-blue-300">统一场论3D可视化平台</h2>
      <p className="mx-auto max-w-md text-blue-200/80">
        正在加载宇宙奥秘的可视化系统...
      </p>
    </div>

    <div className="overflow-hidden w-full max-w-md h-2 rounded-full bg-gray-800/50">
      {/* 进度条 - 使用CSS动画替代motion组件 */}
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />
    </div>

    <div className="flex items-center space-x-2 text-sm opacity-100 text-blue-400/70">
      <span>🔬</span>
      <span>正在初始化3D渲染引擎</span>
    </div>
  </div>
);

// 根组件，包含Navbar和Footer
const RootLayout: React.FC = () => {
  return (
    <div className="flex flex-col App min-h-screen w-full">
      {/* 将Navbar移到Routes外部，只渲染一次 */}
      <Navbar />

      {/* 使用Outlet渲染子路由内容 */}
      <div className="flex-grow flex flex-col w-full">
        <Outlet />
      </div>

      {/* Footer也移到Routes外部 */}
      <Footer />

      {/* 聊天组件 - 使用fixed定位，避免影响布局 */}
      <ChatComponent />
    </div>
  );
};

// 路由配置项接口
type RouteConfig = {
  path: string;
  element: React.ReactNode;
  name: string;
  priority?: number; // 预加载优先级：1-最高，5-最低
  layout?: typeof PageContainer;
  requiresAuth?: boolean;
};

// 路由配置 - 模块化结构
const routes: RouteConfig[] = [
  {
    path: "/",
    element: <HomePage />,
    name: "首页",
    priority: 1
  },
  {
    path: "formulas",
    element: <FormulaVisualizationPage />,
    name: "公式可视化",
    priority: 2
  },
  {
    path: "artificial-field",
    element: <ArtificialFieldPage />,
    name: "人工场",
    priority: 2
  },
  {
    path: "interactive",
    element: <InteractiveExplorationPage />,
    name: "交互式探索",
    priority: 3
  },
  {
    path: "knowledge",
    element: <KnowledgePage />,
    name: "知识库",
    priority: 3
  },
  // 添加新的可视化页面路由
  {
    path: "spiral-divergence",
    element: <SpiralDivergencePage />,
    name: "螺旋发散可视化",
    priority: 3
  },
  {
    path: "cylindrical-spiral",
    element: <CylindricalSpiralFieldPage />,
    name: "圆柱螺旋场可视化",
    priority: 3
  }
];

// 404页面组件
const NotFoundPage: React.FC = () => (
  <PageContainer hideBackground>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-6xl font-bold text-gray-600">404</h1>
      </motion.div>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 max-w-md text-xl text-gray-400"
      >
        抱歉，您访问的页面不存在
      </motion.p>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
      >
        返回首页
      </motion.button>
    </div>
  </PageContainer>
);

// 创建路由配置 - 自动生成嵌套路由
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // 自动生成路由配置
      ...routes.map((route) => {
        // 创建路由元素，根据是否有自定义布局选择容器
        const RouteElement = route.layout || PageContainer;

        return {
          path: route.path === "/" ? "" : route.path,
          element: (
            <RouteElement>
              <Suspense fallback={<LoadingFallback />}>
                {route.element}
              </Suspense>
            </RouteElement>
          )
        };
      }),
      // 404页面
      {
        path: "*",
        element: <NotFoundPage />
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

    try {
      // 显示欢迎通知
      setTimeout(() => {
        showNotification.success('欢迎探索统一场论的奥秘！');
      }, 1000);
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      showNotification.error('应用初始化遇到问题，但导航菜单仍可使用');
    }

    return () => {
      // 清理资源
      try {
        disposeAllServices();
      } catch (error) {
        console.error('❌ 服务清理失败:', error);
      }
    };
  }, []);

  // 简化的预加载策略 - 只预加载核心页面，避免过度预加载影响性能
  useEffect(() => {
    // 只预加载核心页面，减少初始加载时间和内存占用
    const preloadCorePages = async () => {
      try {
        // 只预加载最常用的页面
        await Promise.allSettled([
          import('./pages/FormulaVisualizationPage').then(() => void 0),
          import('./pages/ArtificialFieldPage').then(() => void 0)
        ]);
      } catch (error) {
        console.warn('核心页面预加载失败:', error);
      }
    };

    // 在组件挂载后延迟预加载，避免阻塞初始渲染
    const timeoutId = setTimeout(() => {
      preloadCorePages();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <NotificationProvider maxVisible={5} position="top-right">
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </NotificationProvider>
  );
}

export default App;