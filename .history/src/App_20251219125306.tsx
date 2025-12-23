import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './errors/index.tsx'
import { logger } from './logging/index.ts'

// 导入页面组件
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'))
const FormulaVisualizationPage = React.lazy(() => import('./pages/FormulaVisualizationPage.tsx'))
const InteractiveExplorationPage = React.lazy(() => import('./pages/InteractiveExplorationPage.tsx'))
const KnowledgePage = React.lazy(() => import('./pages/KnowledgePage.tsx'))
const ArtificialFieldPage = React.lazy(() => import('./pages/ArtificialFieldPage.tsx'))
const CylindricalSpiralFieldPage = React.lazy(() => import('./pages/CylindricalSpiralFieldPage.tsx'))
const SpiralDivergencePage = React.lazy(() => import('./pages/SpiralDivergencePage.tsx'))
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
          <Route path="/formulas" element={<FormulaVisualizationPage />} />
          <Route path="/interactive" element={<InteractiveExplorationPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/artificial-field" element={<ArtificialFieldPage />} />
          <Route path="/cylindrical-spiral" element={<CylindricalSpiralFieldPage />} />
          <Route path="/spiral-divergence" element={<SpiralDivergencePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default App
