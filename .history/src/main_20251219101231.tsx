import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { initializeLogging } from './logging/index.ts'
import { registerErrorBoundary } from './errors/index.tsx'

// 初始化日志系统
initializeLogging()

// 注册错误边界
registerErrorBoundary()

// 创建根节点并渲染应用
const root = createRoot(document.getElementById('app')!)
root.render(
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
  </React.StrictMode>
)
