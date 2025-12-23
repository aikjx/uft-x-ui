import { defineStore } from 'pinia'
import type { SimpleFormula, FormulaCategory } from '@/types/simple-formula'
import { formulas, categories } from '@/data/formulas'

export const useFormulasStore = defineStore('formulas', () => {
  const formulaList = ref<SimpleFormula[]>([])
  const categoryList = ref<FormulaCategory[]>([])
  const currentFormula = ref<SimpleFormula | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 初始化公式数据
  const initFormulas = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 使用本地数据
      formulaList.value = formulas as SimpleFormula[]
      categoryList.value = categories
    } catch (err) {
      error.value = '加载公式数据失败'
      console.error('Failed to load formulas:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 根据ID获取公式
  const getFormulaById = (id: number): SimpleFormula | undefined => {
    return formulaList.value.find(formula => formula.id === id)
  }
  
  // 根据分类获取公式
  const getFormulasByCategory = (categoryName: string): SimpleFormula[] => {
    return formulaList.value.filter(formula => formula.category === categoryName)
  }
  
  // 搜索公式
  const searchFormulas = (query: string): SimpleFormula[] => {
    const lowercaseQuery = query.toLowerCase()
    return formulaList.value.filter(formula => 
      formula.name.toLowerCase().includes(lowercaseQuery) ||
      formula.description.toLowerCase().includes(lowercaseQuery)
    )
  }
  
  // 设置当前公式
  const setCurrentFormula = (formula: SimpleFormula | null) => {
    currentFormula.value = formula
  }
  
  // 获取相关公式（基于相同分类）
  const getRelatedFormulas = (formulaId: number): SimpleFormula[] => {
    const formula = getFormulaById(formulaId)
    if (!formula) return []
    
    return formulaList.value.filter(f => 
      f.id !== formulaId && 
      f.category === formula.category
    ).slice(0, 4)
  }
  
  // 获取学习路径中的下一个公式
  const getNextFormula = (currentId: number): SimpleFormula | null => {
    const currentIndex = formulaList.value.findIndex(f => f.id === currentId)
    if (currentIndex === -1 || currentIndex === formulaList.value.length - 1) {
      return null
    }
    return formulaList.value[currentIndex + 1]
  }
  
  // 获取学习路径中的上一个公式
  const getPreviousFormula = (currentId: number): SimpleFormula | null => {
    const currentIndex = formulaList.value.findIndex(f => f.id === currentId)
    if (currentIndex <= 0) {
      return null
    }
    return formulaList.value[currentIndex - 1]
  }
  
  // 获取所有分类
  const getAllCategories = computed(() => categoryList.value)
  
  // 获取每个分类的公式数量
  const getCategoryStats = computed(() => {
    const stats: Record<string, number> = {}
    formulaList.value.forEach(formula => {
      stats[formula.category] = (stats[formula.category] || 0) + 1
    })
    return stats
  })
  
  return {
    formulas: readonly(formulaList),
    categories: readonly(categoryList),
    currentFormula: readonly(currentFormula),
    loading: readonly(loading),
    error: readonly(error),
    initFormulas,
    getFormulaById,
    getFormulasByCategory,
    searchFormulas,
    setCurrentFormula,
    getRelatedFormulas,
    getNextFormula,
    getPreviousFormula,
    getAllCategories,
    getCategoryStats
  }
})