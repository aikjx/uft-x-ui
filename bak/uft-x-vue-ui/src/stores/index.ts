import type { App } from 'vue'
import { createPinia } from 'pinia'

// 创建Pinia实例
const pinia = createPinia()

// 安装Pinia
function install(app: App) {
  app.use(pinia)
}

export { install, pinia }

export * from './counter'
export * from './formula'
export * from './visualization'