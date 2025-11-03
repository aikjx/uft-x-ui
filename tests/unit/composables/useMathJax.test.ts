import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useMathJax } from '@/composables/useMathJax'

describe('useMathJax', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 模拟 MathJax
    global.MathJax = {
      typesetPromise: vi.fn().mockResolvedValue(undefined)
    } as any
  })

  it('正确初始化', () => {
    const { isReady, renderMathJax } = useMathJax()
    
    expect(isReady.value).toBe(false)
    expect(typeof renderMathJax).toBe('function')
  })

  it('处理 MathJax 加载', async () => {
    const { isReady } = useMathJax()
    
    // 模拟 MathJax 加载完成
    global.MathJax = {
      startup: {
        promise: Promise.resolve()
      }
    } as any
    
    // 等待下一个 tick
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(isReady.value).toBe(true)
  })

  it('渲染数学公式', async () => {
    const { renderMathJax } = useMathJax()
    const mockElement = document.createElement('div')
    
    await renderMathJax(mockElement)
    
    expect(global.MathJax.typesetPromise).toHaveBeenCalledWith([mockElement])
  })

  it('处理渲染错误', async () => {
    const { renderMathJax } = useMathJax()
    const mockElement = document.createElement('div')
    
    // 模拟渲染错误
    global.MathJax.typesetPromise = vi.fn().mockRejectedValue(new Error('渲染失败'))
    
    await expect(renderMathJax(mockElement)).rejects.toThrow('渲染失败')
  })
})