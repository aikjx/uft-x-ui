import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormulaService } from '@/services/formulaService'

describe('FormulaService - 公式处理服务', () => {
  let formulaService: FormulaService

  beforeEach(() => {
    formulaService = new FormulaService()
    vi.clearAllMocks()
  })

  describe('公式解析', () => {
    it('应该正确解析基础数学公式', () => {
      const result = formulaService.parse('E = mc^2')
      
      expect(result).toEqual({
        isValid: true,
        ast: expect.any(Object),
        variables: ['E', 'm', 'c'],
        constants: ['c']
      })
    })

    it('应该处理复杂物理公式', () => {
      const result = formulaService.parse('F = G * (m1 * m2) / r^2')
      
      expect(result.isValid).toBe(true)
      expect(result.variables).toContain('F')
      expect(result.variables).toContain('m1')
      expect(result.variables).toContain('m2')
      expect(result.variables).toContain('r')
    })

    it('应该检测无效公式', () => {
      const result = formulaService.parse('E = m * c^ + 2')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该支持特殊数学符号', () => {
      const formulas = [
        '∫ f(x) dx',
        '∑_{i=1}^n i',
        '∇·E = ρ/ε₀',
        'e^{iπ} + 1 = 0'
      ]
      
      formulas.forEach(formula => {
        const result = formulaService.parse(formula)
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('公式验证', () => {
    it('应该验证变量命名规范', () => {
      const validFormulas = [
        'E = mc^2',
        'F = ma',
        'v = dx/dt'
      ]
      
      validFormulas.forEach(formula => {
        const result = formulaService.validate(formula)
        expect(result.isValid).toBe(true)
      })
    })

    it('应该检测语法错误', () => {
      const invalidFormulas = [
        'E = m * c^',
        'F = m * a +',
        'v = dx//dt'
      ]
      
      invalidFormulas.forEach(formula => {
        const result = formulaService.validate(formula)
        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(1)
      })
    })

    it('应该检查数学一致性', () => {
      const result = formulaService.validateMath('E = mc^2')
      
      expect(result.dimensionalAnalysis).toBeDefined()
      expect(result.unitsConsistency).toBe(true)
    })
  })

  describe('公式计算', () => {
    it('应该正确计算数值', () => {
      const result = formulaService.evaluate('E = mc^2', { m: 1, c: 299792458 })
      
      expect(result.E).toBeCloseTo(8.987551787e16)
    })

    it('应该处理变量替换', () => {
      const result = formulaService.evaluate('F = ma', { m: 10, a: 9.8 })
      
      expect(result.F).toBe(98)
    })

    it('应该处理单位转换', () => {
      const result = formulaService.evaluateWithUnits('E = mc^2', 
        { m: { value: 1, unit: 'kg' }, c: { value: 299792458, unit: 'm/s' } },
        { E: 'J' }
      )
      
      expect(result.E.value).toBeCloseTo(8.987551787e16)
      expect(result.E.unit).toBe('J')
    })
  })

  describe('性能优化', () => {
    it('应该缓存解析结果', () => {
      const formula = 'E = mc^2'
      
      const result1 = formulaService.parse(formula)
      const result2 = formulaService.parse(formula)
      
      expect(result1).toBe(result2) // 应该返回相同的缓存对象
    })

    it('应该在 10ms 内完成复杂公式解析', () => {
      const complexFormula = '∇²ψ = (8π²m/h²)(E - V)ψ'
      
      const startTime = performance.now()
      formulaService.parse(complexFormula)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(10)
    })

    it('应该处理大量公式批量处理', () => {
      const formulas = Array(1000).fill('E = mc^2')
      
      const startTime = performance.now()
      const results = formulas.map(formula => formulaService.parse(formula))
      const endTime = performance.now()
      
      expect(results).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // 100ms 内完成
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理空输入', () => {
      const result = formulaService.parse('')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('公式不能为空')
    })

    it('应该处理未定义变量', () => {
      const result = formulaService.evaluate('E = mc^2', { m: 1 })
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('未定义的变量')
    })

    it('应该处理除零错误', () => {
      const result = formulaService.evaluate('a = 1 / 0', {})
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('除零错误')
    })
  })

  describe('API 接口', () => {
    it('应该提供完整的服务接口', () => {
      expect(formulaService.parse).toBeDefined()
      expect(formulaService.validate).toBeDefined()
      expect(formulaService.evaluate).toBeDefined()
      expect(formulaService.optimize).toBeDefined()
    })

    it('应该支持插件扩展', () => {
      const plugin = {
        name: 'test-plugin',
        process: vi.fn()
      }
      
      formulaService.use(plugin)
      
      expect(formulaService.plugins).toContain(plugin)
    })
  })
})