import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormula, useFormulaSearch } from '@/composables/useFormula'
import { createPinia, setActivePinia } from 'pinia'
import type { Formula } from '@/types/formula'

// 模拟公式数据
const mockFormula: Formula = {
  id: 'test-formula',
  name: '测试公式',
  description: '这是一个测试公式',
  categoryId: 'basic',
  difficulty: 'beginner',
  formula: 'E = mc^2',
  keywords: ['能量', '质量', '光速'],
  parameters: [
    {
      symbol: 'm',
      name: '质量',
      unit: 'kg',
      min: 0,
      max: 100,
      defaultValue: 1,
      step: 0.1
    },
    {
      symbol: 'c',
      name: '光速',
      unit: 'm/s',
      min: 299792458,
      max: 299792458,
      defaultValue: 299792458,
      step: 1
    }
  ],
  relatedFormulas: ['related-formula-1']
}

// 模拟 store
vi.mock('@/stores/formulas', () => ({
  useFormulasStore: () => ({
    loadFormulas: vi.fn().mockResolvedValue(undefined),
    getFormulaById: vi.fn().mockReturnValue(mockFormula),
    allFormulas: [mockFormula],
    searchFormulas: vi.fn().mockReturnValue([mockFormula])
  })
}))

describe('useFormula', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该正确初始化', () => {
    const { currentFormula, parameters, isLoading, error } = useFormula()
    
    expect(currentFormula.value).toBeNull()
    expect(parameters.value).toEqual({})
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('应该能够加载公式', async () => {
    const { loadFormula, currentFormula, parameters } = useFormula()
    
    await loadFormula('test-formula')
    
    expect(currentFormula.value).toEqual(mockFormula)
    expect(parameters.value).toEqual({
      m: 1,
      c: 299792458
    })
  })

  it('应该能够更新参数', async () => {
    const { loadFormula, updateParameter, parameters } = useFormula()
    
    await loadFormula('test-formula')
    updateParameter('m', 2.5)
    
    expect(parameters.value.m).toBe(2.5)
  })

  it('应该验证参数范围', async () => {
    const { loadFormula, updateParameter, parameters } = useFormula()
    
    await loadFormula('test-formula')
    updateParameter('m', 150) // 超出最大值
    
    expect(parameters.value.m).toBe(100) // 应该被限制在最大值
  })

  it('应该能够重置参数', async () => {
    const { loadFormula, updateParameter, resetParameters, parameters } = useFormula()
    
    await loadFormula('test-formula')
    updateParameter('m', 5)
    resetParameters()
    
    expect(parameters.value.m).toBe(1) // 回到默认值
  })

  it('应该能够验证参数', async () => {
    const { loadFormula, validateParameter } = useFormula()
    
    await loadFormula('test-formula')
    
    expect(validateParameter('m', 50)).toBe(true)
    expect(validateParameter('m', 150)).toBe(false)
    expect(validateParameter('invalid', 1)).toBe(false)
  })
})

describe('useFormulaSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该正确初始化搜索', () => {
    const { searchQuery, selectedCategory, selectedDifficulty, searchResults } = useFormulaSearch()
    
    expect(searchQuery.value).toBe('')
    expect(selectedCategory.value).toBe('')
    expect(selectedDifficulty.value).toBe('')
    expect(searchResults.value).toEqual([])
  })

  it('应该能够执行搜索', () => {
    const { searchQuery, search, searchResults } = useFormulaSearch()
    
    searchQuery.value = '测试'
    search()
    
    expect(searchResults.value).toEqual([mockFormula])
  })

  it('应该能够清除搜索', () => {
    const { searchQuery, selectedCategory, clearSearch } = useFormulaSearch()
    
    searchQuery.value = '测试'
    selectedCategory.value = 'basic'
    clearSearch()
    
    expect(searchQuery.value).toBe('')
    expect(selectedCategory.value).toBe('')
  })
})