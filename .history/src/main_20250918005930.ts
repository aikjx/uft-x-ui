import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

// 添加 MathJax 配置
declare global {
  interface Window {
    MathJax: any
  }
}

// 配置 MathJax
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
  }
}

// 动态加载 MathJax
const script = document.createElement('script')
script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
document.head.appendChild(script)

const mathJaxScript = document.createElement('script')
mathJaxScript.id = 'MathJax-script'
mathJaxScript.async = true
mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
document.head.appendChild(mathJaxScript)

const app = createApp(App)

app.use(createPinia())
app.use(router)


app.mount('#app')