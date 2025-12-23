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
    <div className="relative flex flex-col bg-gradient-to-b from-[#050508] via-[#0a0a1a] to-[#151530]">
      {/* 全局背景网格 - 优化密度 */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.015)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      {/* 科技感装饰线条 */}
      <div className="absolute top-0 right-0 left-0 z-10 h-px bg-gradient-to-r from-transparent to-transparent via-blue-500/30" />

      {shouldShowBackground && <ParticleBackground />}
      <main className="container overflow-x-hidden relative z-10 px-4 py-4 mx-auto md:py-6">
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
    <div className="flex flex-col App min-h-screen">
      {/* 将Navbar移到Routes外部，只渲染一次 */}
      <Navbar />

      {/* 使用Outlet渲染子路由内容 */}
      <div className="flex-grow">
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

    // 注册和初始化所有服务
    registerAllServices();
    initializeAllServices().catch(error => {
      console.error('❌ 服务初始化失败:', error);
      showNotification.error('服务初始化失败，请刷新页面重试');
    });

    // 启动自动化性能优化
    startAutomatedOptimization({
      mode: AutomatedOptimizationMode.AUTO,
      targetFPS: 60,
      maxMemoryUsageMB: 512,
      enableAIOptimization: true,
      autoAdjustParticleCount: true,
      autoAdjustRenderScale: true,
      autoAdjustShadowQuality: true,
      autoAdjustPostProcessing: true
    });

    // 显示欢迎通知
    setTimeout(() => {
      showNotification.success('欢迎探索统一场论的奥秘！');
    }, 1000);

    return () => {
      // 清理资源
      disposeAllServices();
    };
  }, []);

  // 智能预加载策略 - 基于优先级和用户行为的动态预加载
  useEffect(() => {
    // 预加载优先级映射：根据优先级决定预加载顺序和时机
    const priorityPreloadMap: Record<number, () => Promise<unknown>[]> = {
      1: () => [
        import('./pages/FormulaVisualizationPage').then(() => void 0),
        import('./pages/ArtificialFieldPage').then(() => void 0)
      ],
      2: () => [
        import('./pages/InteractiveExplorationPage').then(() => void 0),
        import('./pages/KnowledgePage').then(() => void 0)
      ]
    };

    // 预加载函数
    const preload = async (priority: number) => {
      try {
        if (priorityPreloadMap[priority]) {
          const promises = priorityPreloadMap[priority]();
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.warn(`预加载优先级 ${priority} 失败:`, error);
      }
    };

    // 智能预加载调度器
    const schedulePreloading = () => {
      // 立即预加载最高优先级（1级）的组件
      preload(1);

      // 延迟预加载次级优先级（2级）的组件
      const level2Timeout = setTimeout(() => {
        preload(2);
      }, 2000);

      // 监听用户交互，提前触发预加载
      const handleMouseEnter = (event: MouseEvent) => {
        const target = event.target as Element;
        if (target instanceof HTMLElement) {
          const link = target.closest('a');
          if (link && link.href) {
            // 解析链接，预加载对应的页面组件
            const url = new URL(link.href);
            const pathname = url.pathname.replace(/^\//, '');

            switch (pathname) {
              case 'formulas':
                import('./pages/FormulaVisualizationPage').then(() => void 0);
                break;
              case 'artificial-field':
                import('./pages/ArtificialFieldPage').then(() => void 0);
                break;
              case 'interactive':
                import('./pages/InteractiveExplorationPage').then(() => void 0);
                break;
              case 'knowledge':
                import('./pages/KnowledgePage').then(() => void 0);
                break;
            }
          }
        }
      };

      // 添加鼠标悬停事件监听
      document.addEventListener('mouseover', handleMouseEnter);

      return () => {
        clearTimeout(level2Timeout);
        document.removeEventListener('mouseover', handleMouseEnter);
      };
    };

    // 检查浏览器是否支持requestIdleCallback
    if ('requestIdleCallback' in window) {
      // 使用requestIdleCallback在浏览器空闲时启动预加载调度
      const idleCallbackId = (window as any).requestIdleCallback(schedulePreloading, { timeout: 1000 });

      return () => {
        (window as any).cancelIdleCallback(idleCallbackId);
      };
    } else {
      // 降级方案：使用setTimeout延迟启动预加载调度
      const timeoutId = setTimeout(schedulePreloading, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
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