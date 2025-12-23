import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('utf-theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统主题偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  }
  
  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
    localStorage.setItem('utf-theme', isDark.value ? 'dark' : 'light')
  }
  
  // 设置主题
  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
    updateTheme()
    localStorage.setItem('utf-theme', theme)
  }
  
  // 更新DOM主题类
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('utf-theme')) {
        isDark.value = e.matches
        updateTheme()
      }
    })
  }
  
  return {
    isDark: readonly(isDark),
    initTheme,
    toggleTheme,
    setTheme,
    watchSystemTheme
  }
})