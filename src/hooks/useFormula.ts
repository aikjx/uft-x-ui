import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FORMULAS } from '../constants';
import { Formula } from '../types';

export const useFormula = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取特定公式
  const getFormulaById = useCallback((formulaId: string): Formula | undefined => {
    return FORMULAS.find(f => f.id.toString() === formulaId);
  }, []);

  // 选择公式
  const selectFormula = useCallback((formula: Formula) => {
    setIsLoading(true);
    setSelectedFormula(formula);
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 初始化选中的公式
  useEffect(() => {
    setIsLoading(true);
    if (id) {
      const formula = getFormulaById(id);
      if (formula) {
        setSelectedFormula(formula);
      } else if (FORMULAS.length > 0) {
        setSelectedFormula(FORMULAS[0]);
      }
    } else if (FORMULAS.length > 0) {
      setSelectedFormula(FORMULAS[0]);
    }
    setIsLoading(false);
  }, [id, getFormulaById]);

  // 根据类别分组公式
  const formulasByCategory = useMemo(() => {
    return FORMULAS.reduce<Record<string, Formula[]>>((acc, formula) => {
      if (!acc[formula.category]) {
        acc[formula.category] = [];
      }
      acc[formula.category].push(formula);
      return acc;
    }, {});
  }, []);

  return {
    selectedFormula,
    isLoading,
    selectFormula,
    formulas: FORMULAS,
    formulasByCategory,
    getFormulaById
  };
};