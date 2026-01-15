import { describe, it, expect } from 'vitest'
import { unifiedFieldTheoryFormulas } from '../../../src/data/unifiedFieldTheoryFormulas'

describe('Unified Field Theory Formulas Data', () => {
  it('should have exactly 20 formulas', () => {
    expect(unifiedFieldTheoryFormulas).toHaveLength(20)
  })

  it('should have correct IDs from uf1 to uf20', () => {
    unifiedFieldTheoryFormulas.forEach((formula, index) => {
      expect(formula.id).toBe(`uf${index + 1}`)
    })
  })

  it('should have physicalDimension field for all formulas', () => {
    unifiedFieldTheoryFormulas.forEach(formula => {
      expect(formula.physicalDimension).toBeDefined()
      expect(typeof formula.physicalDimension).toBe('string')
      expect(formula.physicalDimension!.length).toBeGreaterThan(0)
    })
  })

  it('should include the 20th formula (Electric Magnetic Coupling Constant)', () => {
    const formula20 = unifiedFieldTheoryFormulas.find(f => f.id === 'uf20')
    expect(formula20).toBeDefined()
    expect(formula20!.name).toBe('电磁耦合常数')
    expect(formula20!.physicalDimension).toContain('电磁耦合')
  })

  it('should have valid LaTeX formulas', () => {
    unifiedFieldTheoryFormulas.forEach(formula => {
      expect(formula.formula).toContain('$$')
      // Basic check for some LaTeX commands
      if (formula.id === 'uf1') {
        expect(formula.formula).toContain('\\vec{r}(t)')
      }
    })
  })
})
