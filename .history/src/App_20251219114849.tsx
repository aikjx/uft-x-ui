import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './errors/index.tsx'
import { logger } from './logging/index.ts'

// 导入页面组件
// 注意：这些组件需要根据实际情况创建
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'))
const FormulasPage = React.lazy(() => import('./pages/FormulasPage.tsx'))
const FormulaDetailPage = React.lazy(() => import('./pages/FormulaDetailPage.tsx'))
const VisualizationPage = React.lazy(() => import('./pages/VisualizationPage.tsx'))
const LearnPage = React.lazy(() => import('./pages/LearnPage.tsx'))
const AboutPage = React.lazy(() => import('./pages/AboutPage.tsx'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'))

function App() {
  React.useEffect(() => {
    logger.info('Application initialized')
    
    // 可以在这里添加应用初始化逻辑
    initializeApp()
  }, [])

  const initializeApp = () => {
    // 应用初始化逻辑
    // 例如：加载用户设置、初始化服务等
  }

  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
              <h2 className="text-lg font-medium">加载中...</h2>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/formulas/:id" element={<FormulaDetailPage />} />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/visualization/:type" element={<VisualizationPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default App
