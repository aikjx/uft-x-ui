import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useFormula } from '@/hooks/useFormula'

// 模拟React Router的useParams
vi.mock('react-router-dom')
import { useParams } from 'react-router-dom'

// 模拟constants中的FORMULAS
vi.mock('@/constants', () => ({
  FORMULAS: [
    {
      id: 1,
      name: '能量公式',
      latex: 'E = mc^2',
      description: '质能等价公式',
      category: '物理'
    }
  ]
}))

const mockedUseParams = vi.mocked(useParams)

describe('useFormula Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseParams.mockReturnValue({})
  })
  
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useFormula())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.formulas).toBeDefined()
    expect(result.current.formulasByCategory).toBeDefined()
  })
  
  it('should get formula by id correctly', () => {
    const { result } = renderHook(() => useFormula())
    
    const formula = result.current.getFormulaById('1')
    
    expect(typeof formula).toBe('object')
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
    mockedUseParams.mockReturnValue({ id: '1' })
    
    const { result } = renderHook(() => useFormula())
    
    expect(result.current.selectedFormula).toBeDefined()
  })
})
