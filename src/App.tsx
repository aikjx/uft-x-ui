import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import FormulaVisualizationPage from './pages/FormulaVisualizationPage';
import ArtificialFieldPage from './pages/ArtificialFieldPage';
import InteractiveExplorationPage from './pages/InteractiveExplorationPage';
import KnowledgePage from './pages/KnowledgePage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';

// 页面容器组件，用于处理每个页面的通用布局
const PageContainer: React.FC<{ children: React.ReactNode; hideBackground?: boolean }> = ({ 
  children, 
  hideBackground = false 
}) => {
  const location = useLocation();
  const isNotFound = location.pathname === '*';
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {!hideBackground && <ParticleBackground />}
      <Navbar />
      <main className={`flex-1 container mx-auto px-4 py-16 md:py-24 relative z-10 
        ${isNotFound ? 'flex items-center justify-center' : ''}`}
      >
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" theme="dark" richColors /> 
    </div>
  );
};

function App() {
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
