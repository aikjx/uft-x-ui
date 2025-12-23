import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdvancedPerformancePanel from '@/components/AdvancedPerformancePanel'

describe('AdvancedPerformancePanel - 高级性能控制面板', () => {
  // 模拟 onClose 和 onSettingsChanged 函数
  const mockOnClose = vi.fn()
  const mockOnSettingsChanged = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染组件结构', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    // 验证面板标题
    expect(screen.getByText('高级性能控制面板')).toBeInTheDocument()
    
    // 验证性能概览部分
    expect(screen.getByText('性能概览')).toBeInTheDocument()
    expect(screen.getByText('当前 FPS')).toBeInTheDocument()
    expect(screen.getByText('内存使用')).toBeInTheDocument()
    expect(screen.getByText('绘制调用')).toBeInTheDocument()
    expect(screen.getByText('场景复杂度')).toBeInTheDocument()
    
    // 验证性能模式部分
    expect(screen.getByText('性能模式')).toBeInTheDocument()
    expect(screen.getByText('高质量')).toBeInTheDocument()
    expect(screen.getByText('平衡')).toBeInTheDocument()
    expect(screen.getByText('性能')).toBeInTheDocument()
    expect(screen.getByText('自动')).toBeInTheDocument()
    
    // 验证高级设置部分
    expect(screen.getByText('高级设置')).toBeInTheDocument()
    expect(screen.getByText('像素比率')).toBeInTheDocument()
    expect(screen.getByText('阴影质量')).toBeInTheDocument()
    expect(screen.getByText('渲染距离')).toBeInTheDocument()
    expect(screen.getByText('反锯齿')).toBeInTheDocument()
    expect(screen.getByText('动态帧跳过')).toBeInTheDocument()
    expect(screen.getByText('最大FPS')).toBeInTheDocument()
    
    // 验证性能测试部分
    expect(screen.getByText('性能测试')).toBeInTheDocument()
    expect(screen.getByText('运行性能测试')).toBeInTheDocument()
  })

  it('应该正确处理关闭按钮点击', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('应该正确处理性能模式切换', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    const performanceButton = screen.getByText('性能')
    fireEvent.click(performanceButton)
    
    expect(mockOnSettingsChanged).toHaveBeenCalledWith({
      performanceMode: 'low',
      autoMode: false
    })
  })

  it('应该正确处理自动性能优化开关', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    // 使用 getByText 获取自动性能优化的开关容器，然后获取其中的复选框
    const autoModeContainer = screen.getByText('自动性能优化').closest('.flex')
    expect(autoModeContainer).toBeInTheDocument()
    
    const checkbox = autoModeContainer?.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeInTheDocument()
    
    fireEvent.click(checkbox!)
    
    expect(mockOnSettingsChanged).toHaveBeenCalledWith({
      autoMode: false
    })
  })

  it('应该正确处理高级设置变更', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    // 测试像素比率变更
    const pixelRatioContainer = screen.getByText('像素比率').closest('.mb-3')
    expect(pixelRatioContainer).toBeInTheDocument()
    
    const pixelRatioSelect = pixelRatioContainer?.querySelector('select')
    expect(pixelRatioSelect).toBeInTheDocument()
    
    fireEvent.change(pixelRatioSelect!, { target: { value: '1.5' } })
    
    // 测试阴影质量变更
    const shadowQualityContainer = screen.getByText('阴影质量').closest('.mb-3')
    expect(shadowQualityContainer).toBeInTheDocument()
    
    const shadowQualitySelect = shadowQualityContainer?.querySelector('select')
    expect(shadowQualitySelect).toBeInTheDocument()
    
    fireEvent.change(shadowQualitySelect!, { target: { value: 'high' } })
    
    // 测试渲染距离变更
    const renderDistanceContainer = screen.getByText('渲染距离').closest('.mb-3')
    expect(renderDistanceContainer).toBeInTheDocument()
    
    const renderDistanceSelect = renderDistanceContainer?.querySelector('select')
    expect(renderDistanceSelect).toBeInTheDocument()
    
    fireEvent.change(renderDistanceSelect!, { target: { value: 'high' } })
  })

  it('应该正确处理性能测试按钮点击', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    const runTestButton = screen.getByText('运行性能测试')
    fireEvent.click(runTestButton)
    
    // 验证按钮文本变为 "测试中..."
    expect(screen.getByText('测试中...')).toBeInTheDocument()
  })

  it('应该正确处理导出报告按钮点击', () => {
    // 模拟 URL.createObjectURL 和 URL.revokeObjectURL
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    
    URL.createObjectURL = vi.fn().mockReturnValue('http://example.com/report.json')
    URL.revokeObjectURL = vi.fn()
    
    // 模拟 document.createElement 和相关方法
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    const originalCreateElement = document.createElement
    document.createElement = vi.fn().mockReturnValue(mockLink as any)
    
    const originalAppendChild = document.body.appendChild
    document.body.appendChild = vi.fn()
    
    const originalRemoveChild = document.body.removeChild
    document.body.removeChild = vi.fn()
    
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    const exportButton = screen.getByText('导出报告')
    fireEvent.click(exportButton)
    
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
    expect(mockLink.click).toHaveBeenCalled()
    
    // 恢复原始方法
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
  })

  it('应该正确处理重置设置按钮点击', () => {
    render(<AdvancedPerformancePanel onClose={mockOnClose} onSettingsChanged={mockOnSettingsChanged} />)
    
    const resetButton = screen.getByText('重置设置')
    fireEvent.click(resetButton)
    
    // 验证 onSettingsChanged 被调用，且传递了默认设置
    expect(mockOnSettingsChanged).toHaveBeenCalled()
    expect(mockOnSettingsChanged.mock.calls[0][0].performanceMode).toBe('auto')
    expect(mockOnSettingsChanged.mock.calls[0][0].autoMode).toBe(true)
  })
})
