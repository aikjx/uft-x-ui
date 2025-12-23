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

// MathJax已在index.html中全局配置