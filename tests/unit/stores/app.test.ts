import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 模拟 localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })
  })

  it('正确初始化', () => {
    const store = useAppStore()
    
    expect(store.isLoading).toBe(false)
    expect(store.isDarkMode).toBe(true)
    expect(store.visualizationMode).toBe('spacetime')
    expect(store.selectedCategory).toBe('all')
    expect(store.selectedDifficulty).toBe('all')
  })

  it('切换暗黑模式', () => {
    const store = useAppStore()
    
    store.toggleDarkMode()
    expect(store.isDarkMode).toBe(false)
    
    store.toggleDarkMode()
    expect(store.isDarkMode).toBe(true)
  })

  it('设置可视化模式', () => {
    const store = useAppStore()
    
    store.setVisualizationMode('electromagnetic')
    expect(store.visualizationMode).toBe('electromagnetic')
    
    store.setVisualizationMode('spacetime')
    expect(store.visualizationMode).toBe('spacetime')
  })

  it('设置搜索查询', () => {
    const store = useAppStore()
    
    store.setSearchQuery('能量')
    expect(store.searchQuery).toBe('能量')
    
    store.setSearchQuery('')
    expect(store.searchQuery).toBe('')
  })

  it('设置分类和难度', () => {
    const store = useAppStore()
    
    store.setSelectedCategory('mechanics')
    expect(store.selectedCategory).toBe('mechanics')
    
    store.setSelectedDifficulty('advanced')
    expect(store.selectedDifficulty).toBe('advanced')
  })
})