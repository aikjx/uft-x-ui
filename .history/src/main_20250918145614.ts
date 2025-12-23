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

app.mount('#app')