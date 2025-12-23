import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()
  
  // 主题相关的计算属性
  const isDark = computed(() => themeStore.isDark)
  
  const themeClass = computed(() => ({
    'theme-dark': isDark.value,
    'theme-light': !isDark.value
  }))
  
  const primaryColor = computed(() => 
    isDark.value ? '#00f5ff' : '#1976d2'
  )
  
  const secondaryColor = computed(() => 
    isDark.value ? '#64ffda' : '#26a69a'
  )
  
  const backgroundColor = computed(() => 
    isDark.value ? '#0a0a0f' : '#ffffff'
  )
  
  const textColor = computed(() => 
    isDark.value ? '#ffffff' : '#333333'
  )
  
  const cardBackground = computed(() => 
    isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  )
  
  const borderColor = computed(() => 
    isDark.value ? 'rgba(100, 255, 218, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  )
  
  // 主题切换方法
  const toggleTheme = () => {
    themeStore.toggleTheme()
  }
  
  const setTheme = (theme: 'light' | 'dark') => {
    themeStore.setTheme(theme)
  }
  
  // 初始化主题
  const initTheme = () => {
    themeStore.initTheme()
    themeStore.watchSystemTheme()
  }
  
  return {
    isDark,
    themeClass,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    cardBackground,
    borderColor,
    toggleTheme,
    setTheme,
    initTheme
  }
}