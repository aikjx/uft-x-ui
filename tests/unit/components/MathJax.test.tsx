import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import MathJax from '@/components/MathJax'

describe('MathJax Component', () => {
  beforeEach(() => {
    // 在每个测试前清除所有模拟
    vi.clearAllMocks()
    // 删除全局MathJax对象
    delete global.MathJax
    delete window.MathJax
  })
  
  afterEach(() => {
    // 测试后清理
    delete global.MathJax
    delete window.MathJax
  })
  
  it('renders without crashing', () => {
    // 基本渲染测试，不依赖MathJax
    const { container } = render(<MathJax>测试内容</MathJax>)
    expect(container).toBeDefined()
  })
  
  it('handles MathJax not being available', () => {
    // 确保当MathJax不可用时不会抛出错误
    expect(() => render(<MathJax>\\(E=mc^2\\)</MathJax>)).not.toThrow()
  })
})
