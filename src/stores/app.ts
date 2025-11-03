import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Formula } from '../types/formula'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentFormula = ref<Formula | null>(null)
  const visualizationMode = ref('spacetime')
  const isDarkMode = ref(true)
  const isLoading = ref(false)
  const userProgress = ref<Record<number, number>>({}) // 公式ID -> 学习进度(0-100)
  const favoriteFormulas = ref<number[]>([]) // 收藏的公式ID列表
  const searchQuery = ref('')
  const selectedCategory = ref<string>('all')
  const selectedDifficulty = ref<string>('all')

  // 计算属性
  const filteredFormulas = computed(() => {
    // 这里需要导入formulas数据
    let filtered = [] as Formula[]
    
    // 根据搜索查询过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(formula => 
        formula.name.toLowerCase().includes(query) ||
        formula.description.toLowerCase().includes(query) ||
        formula.latex.toLowerCase().includes(query)
      )
    }
    
    // 根据分类过滤
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(formula => formula.category === selectedCategory.value)
    }
    
    // 根据难度过滤
    if (selectedDifficulty.value !== 'all') {
      filtered = filtered.filter(formula => formula.difficulty === selectedDifficulty.value)
    }
    
    return filtered
  })

  const favoriteFormulasList = computed(() => {
    // 返回收藏的公式对象列表
    return [] as Formula[]
  })

  const learningProgress = computed(() => {
    const totalFormulas = 17 // 总公式数量
    const completedCount = Object.values(userProgress.value).filter(progress => progress >= 80).length
    return Math.round((completedCount / totalFormulas) * 100)
  })

  // 动作
  const setCurrentFormula = (formula: Formula | null) => {
    currentFormula.value = formula
  }

  const setVisualizationMode = (mode: string) => {
    visualizationMode.value = mode
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    // 保存到本地存储
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }

  const toggleFavorite = (formulaId: number) => {
    const index = favoriteFormulas.value.indexOf(formulaId)
    if (index > -1) {
      favoriteFormulas.value.splice(index, 1)
    } else {
      favoriteFormulas.value.push(formulaId)
    }
    // 保存到本地存储
    localStorage.setItem('favorites', JSON.stringify(favoriteFormulas.value))
  }

  const updateProgress = (formulaId: number, progress: number) => {
    userProgress.value[formulaId] = Math.max(0, Math.min(100, progress))
    // 保存到本地存储
    localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSelectedCategory = (category: string) => {
    selectedCategory.value = category
  }

  const setSelectedDifficulty = (difficulty: string) => {
    selectedDifficulty.value = difficulty
  }

  // 初始化
  const initialize = () => {
    // 从本地存储加载数据
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      isDarkMode.value = savedDarkMode === 'true'
    }

    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      favoriteFormulas.value = JSON.parse(savedFavorites)
    }

    const savedProgress = localStorage.getItem('userProgress')
    if (savedProgress) {
      userProgress.value = JSON.parse(savedProgress)
    }
  }

  // 重置数据
  const resetProgress = () => {
    userProgress.value = {}
    favoriteFormulas.value = []
    localStorage.removeItem('userProgress')
    localStorage.removeItem('favorites')
  }

  // 导出状态快照
  const exportData = () => {
    return {
      userProgress: userProgress.value,
      favoriteFormulas: favoriteFormulas.value,
      darkMode: isDarkMode.value,
      timestamp: new Date().toISOString()
    }
  }

  // 导入数据
  const importData = (data: any) => {
    if (data.userProgress) {
      userProgress.value = data.userProgress
      localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
    }
    if (data.favoriteFormulas) {
      favoriteFormulas.value = data.favoriteFormulas
      localStorage.setItem('favorites', JSON.stringify(favoriteFormulas.value))
    }
    if (data.darkMode !== undefined) {
      isDarkMode.value = data.darkMode
      localStorage.setItem('darkMode', data.darkMode.toString())
    }
  }

  return {
    // 状态
    currentFormula,
    visualizationMode,
    isDarkMode,
    isLoading,
    userProgress,
    favoriteFormulas,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    
    // 计算属性
    filteredFormulas,
    favoriteFormulasList,
    learningProgress,
    
    // 动作
    setCurrentFormula,
    setVisualizationMode,
    toggleDarkMode,
    toggleFavorite,
    updateProgress,
    setSearchQuery,
    setSelectedCategory,
    setSelectedDifficulty,
    initialize,
    resetProgress,
    exportData,
    importData
  }
})