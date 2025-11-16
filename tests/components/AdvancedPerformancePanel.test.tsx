import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdvancedPerformancePanel from '@/components/AdvancedPerformancePanel'

// 模拟复杂的性能数据
const mockPerformanceData = {
  fps: 60,
  frameTime: 16.67,
  memoryUsage: 128.5,
  drawCalls: 1500,
  particleCount: 50000,
  gpuMemory: 256.2,
  frameDrops: 2,
  activeProcesses: 8,
  optimizationLevel: 3
}

// 模拟 Three.js 性能监视器
const mockPerformanceMonitor = {
  update: vi.fn().mockReturnValue(mockPerformanceData),
  getStats: vi.fn().mockReturnValue(mockPerformanceData),
  optimize: vi.fn().mockResolvedValue(true),
  reset: vi.fn()
}

// 模拟渲染优化器
const mockRenderOptimizer = {
  setQuality: vi.fn(),
  setPerformanceMode: vi.fn(),
  enableAdvancedFeatures: vi.fn(),
  disableAdvancedFeatures: vi.fn()
}

describe('AdvancedPerformancePanel - 顶级性能监控组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟 window.performance API
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntries: vi.fn(() => [])
      }
    })
  })

  it('应该正确渲染所有性能指标', () => {
    render(<AdvancedPerformancePanel />)
    
    // 验证基础性能指标显示
    expect(screen.getByText(/FPS/i)).toBeInTheDocument()
    expect(screen.getByText(/内存使用/i)).toBeInTheDocument()
    expect(screen.getByText(/绘制调用/i)).toBeInTheDocument()
    expect(screen.getByText(/粒子数量/i)).toBeInTheDocument()
    
    // 验证高级控制面板
    expect(screen.getByText(/渲染质量/i)).toBeInTheDocument()
    expect(screen.getByText(/性能模式/i)).toBeInTheDocument()
    expect(screen.getByText(/优化设置/i)).toBeInTheDocument()
  })

  it('应该实时更新性能数据', async () => {
    render(<AdvancedPerformancePanel />)
    
    // 模拟性能数据更新
    await waitFor(() => {
      expect(screen.getByText(/60/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('应该处理渲染质量设置', async () => {
    render(<AdvancedPerformancePanel />)
    
    const qualitySlider = screen.getByLabelText(/渲染质量/i)
    
    // 测试质量设置交互
    fireEvent.change(qualitySlider, { target: { value: '80' } })
    
    await waitFor(() => {
      expect(screen.getByText(/80%/)).toBeInTheDocument()
    })
  })

  it('应该切换性能模式', () => {
    render(<AdvancedPerformancePanel />)
    
    const performanceToggle = screen.getByLabelText(/性能模式/i)
    
    // 测试模式切换
    fireEvent.click(performanceToggle)
    
    expect(screen.getByText(/高性能模式/)).toBeInTheDocument()
  })

  it('应该处理内存优化操作', async () => {
    render(<AdvancedPerformancePanel />)
    
    const optimizeButton = screen.getByText(/内存优化/i)
    
    fireEvent.click(optimizeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/优化中.../)).toBeInTheDocument()
    })
  })

  it('应该处理紧急性能恢复', () => {
    render(<AdvancedPerformancePanel />)
    
    const emergencyButton = screen.getByText(/紧急恢复/i)
    
    fireEvent.click(emergencyButton)
    
    expect(screen.getByText(/系统恢复中/)).toBeInTheDocument()
  })

  it('应该显示性能警告', async () => {
    // 模拟低性能数据
    const lowPerformanceData = {
      fps: 15,
      frameTime: 66.67,
      memoryUsage: 95.5,
      drawCalls: 8000,
      particleCount: 100000
    }
    
    vi.spyOn(window, 'performance', 'get').mockReturnValue({
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntries: vi.fn(() => [
        { name: 'frame', duration: 66.67, entryType: 'measure' }
      ])
    } as any)
    
    render(<AdvancedPerformancePanel />)
    
    await waitFor(() => {
      expect(screen.getByText(/性能警告/)).toBeInTheDocument()
      expect(screen.getByText(/FPS过低/)).toBeInTheDocument()
    })
  })

  it('应该处理响应式布局', () => {
    // 测试移动端布局
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 })
    
    render(<AdvancedPerformancePanel />)
    
    expect(screen.getByTestId('performance-panel')).toHaveClass('mobile')
  })

  it('应该记录性能分析数据', async () => {
    const mockConsoleLog = vi.spyOn(console, 'log')
    
    render(<AdvancedPerformancePanel />)
    
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('性能数据更新')
      )
    })
    
    mockConsoleLog.mockRestore()
  })

  it('应该处理组件卸载时的清理', () => {
    const { unmount } = render(<AdvancedPerformancePanel />)
    
    // 模拟组件卸载
    unmount()
    
    expect(screen.queryByTestId('performance-panel')).not.toBeInTheDocument()
  })

  it('应该支持键盘导航', () => {
    render(<AdvancedPerformancePanel />)
    
    const qualitySlider = screen.getByLabelText(/渲染质量/i)
    
    // 测试键盘控制
    fireEvent.keyDown(qualitySlider, { key: 'ArrowRight' })
    
    expect(qualitySlider).toHaveFocus()
  })

  describe('性能基准测试', () => {
    it('应该在 100ms 内完成渲染', () => {
      const startTime = performance.now()
      
      render(<AdvancedPerformancePanel />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100)
    })

    it('应该在 50ms 内处理状态更新', async () => {
      const { rerender } = render(<AdvancedPerformancePanel />)
      
      const startTime = performance.now()
      
      rerender(<AdvancedPerformancePanel />)
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      expect(updateTime).toBeLessThan(50)
    })
  })

  describe('错误边界处理', () => {
    it('应该优雅处理性能数据获取失败', async () => {
      // 模拟性能 API 错误
      vi.spyOn(window, 'performance', 'get').mockImplementation(() => {
        throw new Error('Performance API not available')
      })
      
      render(<AdvancedPerformancePanel />)
      
      await waitFor(() => {
        expect(screen.getByText(/性能监控不可用/)).toBeInTheDocument()
      })
    })

    it('应该处理无效的性能数据', () => {
      // 模拟无效数据
      render(<AdvancedPerformancePanel />)
      
      expect(screen.getByText(/--/)).toBeInTheDocument()
    })
  })

  describe('可访问性测试', () => {
    it('应该提供完整的 ARIA 标签', () => {
      render(<AdvancedPerformancePanel />)
      
      expect(screen.getByRole('slider', { name: /渲染质量/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /内存优化/i })).toBeInTheDocument()
    })

    it('应该支持屏幕阅读器', () => {
      render(<AdvancedPerformancePanel />)
      
      const panel = screen.getByRole('region', { name: /性能监控面板/i })
      expect(panel).toBeInTheDocument()
    })
  })
})