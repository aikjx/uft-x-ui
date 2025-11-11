import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import { MathJax } from './components/MathJax';
import { showNotification } from './utils';

// 使用React.lazy进行代码分割，确保只导入一个HomePage组件
const HomePage = lazy(() => import('./pages/HomePage'));
const FormulaVisualizationPage = lazy(() => import('./pages/FormulaVisualizationPage'));
const ArtificialFieldPage = lazy(() => import('./pages/ArtificialFieldPage'));
const InteractiveExplorationPage = lazy(() => import('./pages/InteractiveExplorationPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// 页面容器组件，用于处理每个页面的通用布局
export const PageContainer: React.FC<{ children: React.ReactNode; hideBackground?: boolean }> = ({ 
  children, 
  hideBackground = false 
}) => {
  const location = useLocation();
  const isNotFound = location.pathname === '*';
  
  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#050508] to-[#0a0a14]">
      {!hideBackground && <ParticleBackground />}
      <Navbar />
      <main className={`flex-1 container mx-auto px-4 py-12 md:py-20 relative z-10 
        ${isNotFound ? 'flex items-center justify-center' : ''}`}
      >
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-300 text-lg">加载中...</p>
          </div>
        }>
          {children}
        </Suspense>
      </main>
      <Footer />
      <Toaster position="top-right" theme="dark" richColors /> 
      {/* 预加载MathJax组件 */}
      <div className="hidden">
        <MathJax formula="E = mc^2" />
      </div>
    </div>
  );
};

function App() {
  // 应用初始化
  useEffect(() => {
    // 设置页面标题
    document.title = '统一场论3D可视化平台';
    
    // 添加页面加载事件
    const handleBeforeUnload = () => {
      // 可以在这里清理资源
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 显示欢迎信息
    showNotification.info('欢迎使用统一场论3D可视化平台');
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <PageContainer>
              <HomePage />
            </PageContainer>
          } 
          // 确保首页路由正确配置，只使用一个HomePage组件
        />
        <Route 
          path="/formulas/:id?" 
          element={
            <PageContainer>
              <FormulaVisualizationPage />
            </PageContainer>
          } 
        />
        <Route 
          path="/artificial-field" 
          element={
            <PageContainer>
              <ArtificialFieldPage />
            </PageContainer>
          } 
        />
        <Route 
          path="/interactive" 
          element={
            <PageContainer>
              <InteractiveExplorationPage />
            </PageContainer>
          } 
        />
        <Route 
          path="/knowledge" 
          element={
            <PageContainer>
              <KnowledgePage />
            </PageContainer>
          } 
        />
        <Route 
          path="*" 
          element={
            <PageContainer hideBackground>
              <NotFoundPage />
            </PageContainer>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
