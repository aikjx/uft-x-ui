import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormulaDataProvider } from '@/data/FormulaDataProvider';
import { DataProvider } from '@/data/DataProvider';

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('FormulaDataProvider', () => {
  let formulaDataProvider: FormulaDataProvider;

  beforeEach(() => {
    // 清除所有模拟
    vi.clearAllMocks();
    
    // 重置localStorage
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    
    // 创建新的FormulaDataProvider实例
    formulaDataProvider = new FormulaDataProvider();
  });

  it('should extend DataProvider', () => {
    expect(formulaDataProvider).toBeInstanceOf(DataProvider);
  });

  it('should initialize with empty cache', () => {
    // 检查初始状态
    expect(formulaDataProvider.getCachedItems().length).toBe(0);
  });

  it('should get all formulas with caching', async () => {
    // 获取所有公式
    const formulas = await formulaDataProvider.getAllFormulas();
    
    // 检查返回结果
    expect(formulas).toBeDefined();
    expect(Array.isArray(formulas)).toBe(true);
    
    // 再次获取，检查是否使用缓存
    const cachedFormulas = await formulaDataProvider.getAllFormulas();
    
    // 两次获取应该返回相同的结果
    expect(cachedFormulas).toBeDefined();
    expect(cachedFormulas).toEqual(formulas);
  });

  it('should get formula by id', async () => {
    // 首先获取所有公式
    const formulas = await formulaDataProvider.getAllFormulas();
    
    if (formulas.length > 0) {
      // 获取第一个公式的ID
      const formulaId = formulas[0].id;
      
      // 根据ID获取公式
      const formula = await formulaDataProvider.getFormulaById(formulaId);
      
      // 检查结果
      expect(formula).toBeDefined();
      expect(formula?.id).toBe(formulaId);
    }
  });

  it('should get formulas by category', async () => {
    // 首先获取所有公式
    const allFormulas = await formulaDataProvider.getAllFormulas();
    
    if (allFormulas.length > 0) {
      // 获取第一个公式的类别
      const category = allFormulas[0].category;
      
      // 根据类别获取公式
      const formulasByCategory = await formulaDataProvider.getFormulasByCategory(category);
      
      // 检查结果
      expect(formulasByCategory).toBeDefined();
      expect(Array.isArray(formulasByCategory)).toBe(true);
      
      // 检查所有返回的公式是否属于该类别
      formulasByCategory.forEach(formula => {
        expect(formula.category).toBe(category);
      });
    }
  });

  it('should refresh cache', async () => {
    // 首先获取所有公式，填充缓存
    const initialFormulas = await formulaDataProvider.getAllFormulas();
    
    // 刷新缓存
    await formulaDataProvider.refreshCache();
    
    // 再次获取公式
    const refreshedFormulas = await formulaDataProvider.getAllFormulas();
    
    // 检查结果
    expect(refreshedFormulas).toBeDefined();
    expect(refreshedFormulas).toEqual(initialFormulas);
  });

  it('should clear cache', () => {
    // 清除缓存
    formulaDataProvider.clearCache();
    
    // 检查缓存是否为空
    expect(formulaDataProvider.getCachedItems().length).toBe(0);
  });

  it('should handle localStorage error gracefully', () => {
    // 模拟localStorage错误
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // 清除缓存应该不会抛出错误
    expect(() => formulaDataProvider.clearCache()).not.toThrow();
    
    // 刷新缓存应该不会抛出错误
    expect(async () => await formulaDataProvider.refreshCache()).not.toThrow();
  });

  it('should handle invalid formula id', async () => {
    // 使用无效的ID获取公式
    const invalidId = 'invalid-id';
    const formula = await formulaDataProvider.getFormulaById(invalidId);
    
    // 应该返回null
    expect(formula).toBeNull();
  });

  it('should handle invalid category', async () => {
    // 使用无效的类别获取公式
    const invalidCategory = 'invalid-category';
    const formulas = await formulaDataProvider.getFormulasByCategory(invalidCategory);
    
    // 应该返回空数组
    expect(formulas).toEqual([]);
  });
});
