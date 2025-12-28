import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Formula } from '../types'
import { unifiedFieldTheoryFormulas } from '../data/unifiedFieldTheoryFormulas'

// 定义统一场论公式类型
interface UnifiedFieldTheoryFormula {
  id: string
  name: string
  category: string
  formula: string
  description: string
  variables: Array<{
    name: string
    description: string
    unit: string
  }>
  applications: string[]
}

export const useFormula = () => {
  // 添加错误处理，确保即使useParams返回undefined，也能正常工作
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [selectedFormula, setSelectedFormula] = useState<UnifiedFieldTheoryFormula | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取特定公式
  const getFormulaById = useCallback(
    (formulaId: string | number): UnifiedFieldTheoryFormula | undefined => {
      // 处理数字ID，转换为对应的字符串ID格式（如 1 或 '1' -> 'uf1'）
      const idStr = typeof formulaId === 'number' ? formulaId.toString() : formulaId
      const formattedId = idStr.startsWith('uf') ? idStr : `uf${idStr}`
      return unifiedFieldTheoryFormulas.find(
        (f): f is UnifiedFieldTheoryFormula => f.id === formattedId
      )
    },
    []
  )

  // 选择公式
  const selectFormula = useCallback(
    (formula: UnifiedFieldTheoryFormula | { id: string | number; name: string }) => {
      setIsLoading(true)

      // 确保选择的公式是unifiedFieldTheoryFormulas中的对象
      let targetFormula: UnifiedFieldTheoryFormula

      if ('formula' in formula) {
        // 如果是完整的公式对象，直接使用
        targetFormula = formula
      } else {
        // 如果是简化的公式对象，查找对应的完整公式
        const formulaId = typeof formula.id === 'number' ? `uf${formula.id}` : formula.id
        const foundFormula = getFormulaById(formulaId)
        if (!foundFormula) {
          // 如果找不到，使用第一个公式作为默认值
          targetFormula = unifiedFieldTheoryFormulas[0] as UnifiedFieldTheoryFormula
        } else {
          targetFormula = foundFormula
        }
      }

      setSelectedFormula(targetFormula)
      // 模拟加载延迟
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    },
    [getFormulaById]
  )

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
        setSelectedFormula(unifiedFieldTheoryFormulas[0] as UnifiedFieldTheoryFormula)
      }
    } else {
      setSelectedFormula(unifiedFieldTheoryFormulas[0] as UnifiedFieldTheoryFormula)
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
    return unifiedFieldTheoryFormulas.reduce<Record<string, UnifiedFieldTheoryFormula[]>>(
      (acc, formula) => {
        if (!acc[formula.category]) {
          acc[formula.category] = []
        }
        acc[formula.category].push(formula as UnifiedFieldTheoryFormula)
        return acc
      },
      {}
    )
  }, [])

  return {
    selectedFormula,
    isLoading,
    selectFormula,
    formulas: unifiedFieldTheoryFormulas as UnifiedFieldTheoryFormula[],
    formulasByCategory,
    getFormulaById
  }
}
