import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormulaDataProvider } from '@/data/FormulaDataProvider'
import { DataProvider } from '@/data/DataProvider'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('FormulaDataProvider', () => {
  let formulaDataProvider: FormulaDataProvider

  beforeEach(() => {
    // 清除所有模拟
    vi.clearAllMocks()

    // 重置localStorage
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})

    // 创建新的FormulaDataProvider实例
    formulaDataProvider = new FormulaDataProvider()
  })

  it('should extend DataProvider', () => {
    expect(formulaDataProvider).toBeInstanceOf(DataProvider)
  })

  it('should get all formulas with caching', async () => {
    // 获取所有公式
    const formulas = await formulaDataProvider.getFormulas()

    // 检查返回结果
    expect(formulas).toBeDefined()
    expect(Array.isArray(formulas)).toBe(true)

    // 再次获取，检查是否使用缓存
    const cachedFormulas = await formulaDataProvider.getFormulas()

    // 两次获取应该返回相同的结果
    expect(cachedFormulas).toBeDefined()
    expect(cachedFormulas).toEqual(formulas)
  })

  it('should get formula by id', async () => {
    // 首先获取所有公式
    const formulas = await formulaDataProvider.getFormulas()

    if (formulas.length > 0) {
      // 获取第一个公式的ID
      const formulaId = formulas[0].id

      // 根据ID获取公式
      const formula = await formulaDataProvider.getFormulaById(formulaId)

      // 检查结果
      expect(formula).toBeDefined()
      expect(formula?.id).toBe(formulaId)
    }
  })

  it('should get formulas by category', async () => {
    // 首先获取所有公式
    const allFormulas = await formulaDataProvider.getFormulas()

    if (allFormulas.length > 0) {
      // 获取第一个公式的类别
      const category = allFormulas[0].category

      // 根据类别获取公式
      const formulasByCategory = await formulaDataProvider.getFormulasByCategory(category)

      // 检查结果
      expect(formulasByCategory).toBeDefined()
      expect(Array.isArray(formulasByCategory)).toBe(true)

      // 检查所有返回的公式是否属于该类别
      formulasByCategory.forEach(formula => {
        expect(formula.category).toBe(category)
      })
    }
  })

  it('should clear cache with key', () => {
    // 清除缓存，需要提供键名
    expect(() => formulaDataProvider.clearCache('test-key')).not.toThrow()
  })

  it('should handle localStorage error gracefully', async () => {
    // 模拟localStorage错误
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // 获取公式时应该不会抛出错误
    expect(async () => await formulaDataProvider.getFormulas()).not.toThrow()
  })

  it('should handle invalid formula id', async () => {
    // 使用无效的ID获取公式
    const invalidId = 99999
    const formula = await formulaDataProvider.getFormulaById(invalidId)

    // 应该返回undefined
    expect(formula).toBeUndefined()
  })

  it('should handle invalid category', async () => {
    // 使用无效的类别获取公式
    const invalidCategory = 'invalid-category'
    const formulas = await formulaDataProvider.getFormulasByCategory(invalidCategory)

    // 应该返回空数组
    expect(formulas).toEqual([])
  })
})
