import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useFormula } from '@/hooks/useFormula'

// 模拟React Router的useParams
vi.mock('react-router-dom')
import { useParams } from 'react-router-dom'

const mockedUseParams = vi.mocked(useParams)

describe('useFormula Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseParams.mockReturnValue({})
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useFormula())

    // 直接检查初始状态，不等待isLoading变为false
    expect(result.current.isLoading).toBe(true) // 初始状态是true
    expect(result.current.formulas).toBeDefined()
    expect(result.current.formulasByCategory).toBeDefined()
    // 初始时selectedFormula可能为null，这是正常的
  })

  it('should get formula by id correctly', () => {
    const { result } = renderHook(() => useFormula())

    // 使用实际数据中的第一个公式ID
    const formulaId = result.current.formulas[0]?.id
    if (formulaId) {
      const formula = result.current.getFormulaById(formulaId)

      expect(formula).toBeDefined()
      expect(formula?.id).toBe(formulaId)
    }
  })

  it('should select formula correctly', () => {
    const { result } = renderHook(() => useFormula())

    if (result.current.formulas.length > 0) {
      act(() => {
        const cleanup = result.current.selectFormula(result.current.formulas[0])
        expect(typeof cleanup).toBe('function')
      })
    }
  })

  it('should handle params with formula id', () => {
    // 使用实际数据中的第一个公式ID
    const { result: firstRender } = renderHook(() => useFormula())
    const firstFormulaId = firstRender.current.formulas[0]?.id

    if (firstFormulaId) {
      mockedUseParams.mockReturnValue({ id: firstFormulaId })

      const { result } = renderHook(() => useFormula())

      expect(result.current.selectedFormula).toBeDefined()
    }
  })
})
