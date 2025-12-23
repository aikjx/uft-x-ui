import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormulaVisualizationPage from '@/pages/FormulaVisualizationPage'

// 直接模拟useFormula钩子，避免useParams的问题
describe('FormulaVisualizationPage - 公式可视化集成测试', () => {
  it('应该完整渲染公式可视化页面', () => {
    // 模拟useFormula钩子，返回一个默认公式
    vi.mock('../src/hooks/useFormula', () => ({
      useFormula: vi.fn(() => ({
        selectedFormula: {
          id: 1,
          name: '时空同一化方程',
          expression: 'R = C × t',
          category: '基础方程',
          description: '时空同一化方程是统一场论的核心方程',
          derivative: '',
          visualizationType: '3d'
        },
        isLoading: false,
        selectFormula: vi.fn(),
        formulas: [
          {
            id: 1,
            name: '