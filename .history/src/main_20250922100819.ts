import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

// 添加 MathJax 全局类型声明
declare global {
  interface Window {
    MathJax: any
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 应用错误:', err, info)
}

app.mount('#app')

// 初始化 MathJax（如果需要）
if (typeof window !== 'undefined') {
  // 等待 MathJax 加载完成后进行全局配置
  const checkMathJax = () => {
    if (window.MathJax && window.MathJax.startup) {
      console.log('MathJax 已准备就绪')
      
      // 确保MathJax正确渲染页面上的所有公式
      window.MathJax.startup.defaultReady();
      
      // 添加全局方法用于手动渲染新添加的公式
      window.MathJax.typeset = function() {
        window.MathJax.typesetPromise && window.MathJax.typesetPromise();
      };
      
      return true
    }
    return false
  }

  // 检查 MathJax 是否已加载
  if (!checkMathJax()) {
    const checkInterval = setInterval(() => {
      if (checkMathJax()) {
        clearInterval(checkInterval)
      }
    }, 100)
    
    // 10秒后停止检查
    setTimeout(() => {
      clearInterval(checkInterval)
    }, 10000)
  }
}