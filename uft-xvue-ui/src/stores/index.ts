import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建Pinia实例
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 安装Pinia
function install(app: App) {
  app.use(pinia)
}

export { install, pinia }

export * from './counter'
export * from './formula'
export * from './visualization'