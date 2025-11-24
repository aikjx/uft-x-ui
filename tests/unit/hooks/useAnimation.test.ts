import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnimation } from '@/hooks/useAnimation'

describe('useAnimation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确初始化动画状态', () => {
    const { result } = renderHook(() => useAnimation({ duration: 1000 }))
    
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.elapsedTime).toBe(0)
  })

  it('应该开始和停止动画', async () => {
    const { result } = renderHook(() => useAnimation({ duration: 500 }))
    
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isAnimating).toBe(true)
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.stop()
    })
    
    expect(result.current.isAnimating).toBe(false)
  })

  it('应该重置动画状态', () => {
    const { result } = renderHook(() => useAnimation({ duration: 1000 }))
    
    act(() => {
      result.current.start()
      result.current.reset()
    })
    
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.elapsedTime).toBe(0)
  })

  it('应该在动画完成时调用回调', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => 
      useAnimation({ duration: 100, onComplete })
    )
    
    act(() => {
      result.current.start()
    })
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })
    
    expect(onComplete).toHaveBeenCalled()
  })
})