import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Styles
import './style.css'

// Naive UI
import {
  create,
  NButton,
  NCard,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NMenu,
  NSlider,
  NInputNumber,
  NSwitch,
  NSelect,
  NSpace,
  NGrid,
  NGridItem,
  NTooltip,
  NProgress,
  NTabs,
  NTabPane,
  NCollapse,
  NCollapseItem,
  NDrawer,
  NDrawerContent,
  NIcon,
  NPopover,
  NTag,
  NBadge,
  NAlert,
  NModal,
  NConfigProvider,
  darkTheme,
  lightTheme
} from 'naive-ui'

const naive = create({
  components: [
    NButton,
    NCard,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutSider,
    NMenu,
    NSlider,
    NInputNumber,
    NSwitch,
    NSelect,
    NSpace,
    NGrid,
    NGridItem,
    NTooltip,
    NProgress,
    NTabs,
    NTabPane,
    NCollapse,
    NCollapseItem,
    NDrawer,
    NDrawerContent,
    NIcon,
    NPopover,
    NTag,
    NBadge,
    NAlert,
    NModal,
    NConfigProvider
  ]
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)

// Global properties
app.config.globalProperties.$darkTheme = darkTheme
app.config.globalProperties.$lightTheme = lightTheme

// Hide loading screen after app is mounted
app.mount('#app').$nextTick(() => {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.style.opacity = '0'
    setTimeout(() => {
      loadingScreen.remove()
    }, 500)
  }
})