import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('正确初始化', () => {
    const store = useAppStore()
    
    expect(store.isLoading).toBe(false)
    expect(store.currentView).toBe('home')
    expect(store.theme).toBe('dark')
    expect(store.sidebarOpen).toBe(true)
  })

  it('切换主题', () => {
    const store = useAppStore()
    
    store.toggleTheme()
    expect(store.theme).toBe('light')
    
    store.toggleTheme()
    expect(store.theme).toBe('dark')
  })

  it('切换侧边栏', () => {
    const store = useAppStore()
    
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(false)
    
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(true)
  })

  it('设置当前视图', () => {
    const store = useAppStore()
    
    store.setCurrentView('formulas')
    expect(store.currentView).toBe('formulas')
    
    store.setCurrentView('visualization')
    expect(store.currentView).toBe('visualization')
  })

  it('设置加载状态', () => {
    const store = useAppStore()
    
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })
})