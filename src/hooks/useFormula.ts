import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Formula } from '../types'
import { unifiedFieldTheoryFormulas } from '../data/unifiedFieldTheoryFormulas'

export const useFormula = () => {
  // 添加错误处理，确保即使useParams返回undefined，也能正常工作
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [selectedFormula, setSelectedFormula] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取特定公式
  const getFormulaById = useCallback((formulaId: string): any | undefined => {
    return unifiedFieldTheoryFormulas.find(f => f.id === formulaId)
  }, [])

  // 选择公式
  const selectFormula = useCallback((formula: any) => {
    setIsLoading(true)
    setSelectedFormula(formula)
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 初始化选中的公式
  useEffect(() => {
    setIsLoading(true)

    // 确保unifiedFieldTheoryFormulas有数据
    if (unifiedFieldTheoryFormulas.length === 0) {
      setIsLoading(false)
      return
    }

    if (id) {
      const formula = getFormulaById(id)
      if (formula) {
        setSelectedFormula(formula)
      } else {
        setSelectedFormula(unifiedFieldTheoryFormulas[0])
      }
    } else {
      setSelectedFormula(unifiedFieldTheoryFormulas[0])
    }

    // 延迟设置isLoading为false，确保组件有足够时间渲染
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    // 添加清除函数，避免测试环境错误
    return () => clearTimeout(timer)
  }, [id, getFormulaById])

  // 根据类别分组公式
  const formulasByCategory = useMemo(() => {
    return unifiedFieldTheoryFormulas.reduce<Record<string, any[]>>((acc, formula) => {
      if (!acc[formula.category]) {
        acc[formula.category] = []
      }
      acc[formula.category].push(formula)
      return acc
    }, {})
  }, [])

  return {
    selectedFormula,
    isLoading,
    selectFormula,
    formulas: unifiedFieldTheoryFormulas,
    formulasByCategory,
    getFormulaById
  }
}
