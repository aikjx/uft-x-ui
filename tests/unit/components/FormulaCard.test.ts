import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormulaCard from '@/components/FormulaCard.vue'
import type { Formula } from '@/types/formula'

const mockFormula: Formula = {
  id: 1,
  name: '测试公式',
  latex: 'E = mc^2',
  description: '质能等价公式',
  category: 'spacetime',
  difficulty: 'beginner',
  variables: [
    {
      symbol: 'E',
      name: '能量',
      unit: 'J',
      description: '能量值'
    },
    {
      symbol: 'm',
      name: '质量',
      unit: 'kg',
      description: '质量值'
    },
    {
      symbol: 'c',
      name: '光速',
      unit: 'm/s',
      description: '真空中的光速'
    }
  ],
  applications: ['核物理', '宇宙学', '相对论'],
  relatedFormulas: [2, 3]
}

describe('FormulaCard', () => {
  it('渲染公式卡片', () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    expect(wrapper.find('.formula-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('测试公式')
    expect(wrapper.text()).toContain('质能等价公式')
  })

  it('显示正确的难度标签', () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    expect(wrapper.text()).toContain('初级')
  })

  it('显示变量信息', () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    expect(wrapper.text()).toContain('E')
    expect(wrapper.text()).toContain('能量')
    expect(wrapper.text()).toContain('m')
    expect(wrapper.text()).toContain('质量')
  })

  it('显示应用领域', () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    expect(wrapper.text()).toContain('核物理')
    expect(wrapper.text()).toContain('宇宙学')
    expect(wrapper.text()).toContain('相对论')
  })

  it('触发选择事件', async () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('select')
  })

  it('触发详情事件', async () => {
    const wrapper = mount(FormulaCard, {
      props: {
        formula: mockFormula
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('detail')
  })
})