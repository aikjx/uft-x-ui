import { defineStore } from 'pinia'
import type { Formula, FormulaCategory } from '@/types/formula'

export const useFormulasStore = defineStore('formulas', () => {
  const formulas = ref<Formula[]>([])
  const categories = ref<FormulaCategory[]>([])
  const currentFormula = ref<Formula | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 初始化公式数据
  const initFormulas = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 这里将来可以从API获取数据
      const formulaData = await import('@/data/formulas.json')
      formulas.value = formulaData.formulas
      categories.value = formulaData.categories
    } catch (err) {
      error.value = '加载公式数据失败'
      console.error('Failed to load formulas:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 根据ID获取公式
  const getFormulaById = (id: string): Formula | undefined => {
    return formulas.value.find(formula => formula.id === id)
  }
  
  // 根据分类获取公式
  const getFormulasByCategory = (categoryId: string): Formula[] => {
    return formulas.value.filter(formula => formula.categoryId === categoryId)
  }
  
  // 搜索公式
  const searchFormulas = (query: string): Formula[] => {
    const lowercaseQuery = query.toLowerCase()
    return formulas.value.filter(formula => 
      formula.name.toLowerCase().includes(lowercaseQuery) ||
      formula.description.toLowerCase().includes(lowercaseQuery) ||
      formula.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    )
  }
  
  // 设置当前公式
  const setCurrentFormula = (formula: Formula | null) => {
    currentFormula.value = formula
  }
  
  // 获取相关公式
  const getRelatedFormulas = (formulaId: string): Formula[] => {
    const formula = getFormulaById(formulaId)
    if (!formula) return []
    
    return formulas.value.filter(f => 
      f.id !== formulaId && 
      (f.categoryId === formula.categoryId || 
       f.relatedFormulas?.includes(formulaId) ||
       formula.relatedFormulas?.includes(f.id))
    ).slice(0, 5)
  }
  
  // 获取学习路径中的下一个公式
  const getNextFormula = (currentId: string): Formula | null => {
    const currentIndex = formulas.value.findIndex(f => f.id === currentId)
    if (currentIndex === -1 || currentIndex === formulas.value.length - 1) {
      return null
    }
    return formulas.value[currentIndex + 1]
  }
  
  // 获取学习路径中的上一个公式
  const getPreviousFormula = (currentId: string): Formula | null => {
    const currentIndex = formulas.value.findIndex(f => f.id === currentId)
    if (currentIndex <= 0) {
      return null
    }
    return formulas.value[currentIndex - 1]
  }
  
  return {
    formulas: readonly(formulas),
    categories: readonly(categories),
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
    getPreviousFormula
  }
})