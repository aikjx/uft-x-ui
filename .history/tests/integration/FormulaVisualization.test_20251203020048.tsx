import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// 在模块级别模拟useFormula钩子，确保在组件导入之前执行
vi.mock('@/hooks/useFormula', () => ({
  useFormula: vi.fn(() => ({
    selectedFormula: {
      id: 1,
      name: '时空同一化方程',
      expression: 'R = C × t',
      category: '基础方程',
      description: '时空同一