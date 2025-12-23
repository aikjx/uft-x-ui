import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { initializeLogging } from './logging/index.ts'
import { registerErrorBoundary } from './errors/index.ts'

// 初始化日志系统
initializeLogging()

// 注册错误边界
registerErrorBoundary()

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        richColors
        expand={false}
        closeButton
        duration={3000}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
