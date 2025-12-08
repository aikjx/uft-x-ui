import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PerformanceMonitor from '@/components/PerformanceMonitor.vue'
import { usePerformanceStore } from '@/stores/performance'

// 模拟性能存储
vi.mock('@/stores/performance', () => ({
  usePerformanceStore: vi.fn(() => ({
    metrics: {
      fps: 60,
      memory: { used: 100, total: 500, limit: 2000 },
      cpu: { usage: 30, threads: 4 },
      gpu: { memory: 512, temperature: 60 },
      network: { latency: 50, throughput: 1000 },
      rendering: { frameTime: 16, drawCalls: 100 }
    },
    score: 85,
    suggestions: [
      {
        category: 'rendering',
        priority: 'medium',
        suggestion: '优化渲染性能',
        impact: 'medium'
      }
    ],
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn()
  }))
}))

describe('PerformanceMonitor.vue', () => {
  it('renders performance metrics correctly', () => {
    const wrapper = mount(PerformanceMonitor)
    
    expect(wrapper.text()).toContain('性能监控面板')
    expect(wrapper.text()).toContain('FPS')
    expect(wrapper.text()).toContain('60')
    expect(wrapper.text()).toContain('内存使用')
    expect(wrapper.text()).toContain('100 MB')
  })

  it('displays performance score with appropriate color', () => {
    const wrapper = mount(PerformanceMonitor)
    
    const scoreElement = wrapper.find('.performance-score')
    expect(scoreElement.exists()).toBe(true)
    expect(scoreElement.text()).toContain('85')
    
    // 检查分数颜色类
    expect(scoreElement.classes()).toContain('score-good') // 85分应该显示良好
  })

  it('toggles monitoring when button is clicked', async () => {
    const wrapper = mount(PerformanceMonitor)
    const store = usePerformanceStore()
    
    const toggleButton = wrapper.find('.toggle-button')
    await toggleButton.trigger('click')
    
    expect(store.stopMonitoring).toHaveBeenCalled()
  })

  it('displays optimization suggestions', () => {
    const wrapper = mount(PerformanceMonitor)
    
    expect(wrapper.text()).toContain('优化建议')
    expect(wrapper.text()).toContain('优化渲染性能')
    
    const suggestionItems = wrapper.findAll('.suggestion-item')
    expect(suggestionItems.length).toBeGreaterThan(0)
  })

  it('shows/hides detailed metrics when toggle is clicked', async () => {
    const wrapper = mount(PerformanceMonitor)
    
    // 初始状态应该是隐藏的
    const detailedMetrics = wrapper.find('.detailed-metrics')
    expect(detailedMetrics.isVisible()).toBe(false)
    
    // 点击切换按钮
    const toggleButton = wrapper.find('.metrics-toggle')
    await toggleButton.trigger('click')
    
    // 现在应该显示详细指标
    expect(wrapper.find('.detailed-metrics').isVisible()).toBe(true)
  })

  it('formats memory usage correctly', () => {
    const wrapper = mount(PerformanceMonitor)
    
    const memoryUsage = wrapper.find('.memory-usage')
    expect(memoryUsage.text()).toContain('100 MB / 500 MB')
    
    const usagePercentage = wrapper.find('.usage-percentage')
    expect(usagePercentage.text()).toContain('20%') // 100/500 = 20%
  })

  it('handles real-time metric updates', async () => {
    const wrapper = mount(PerformanceMonitor)
    const store = usePerformanceStore()
    
    // 模拟实时更新
    store.metrics.fps = 45
    store.score = 70
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('45')
    expect(wrapper.find('.performance-score').text()).toContain('70')
    expect(wrapper.find('.performance-score').classes()).toContain('score-medium') // 70分应该显示中等
  })

  it('exports performance data when export button is clicked', async () => {
    const wrapper = mount(PerformanceMonitor)
    const store = usePerformanceStore()
    
    // 模拟导出功能
    const exportSpy = vi.spyOn(store, 'exportData').mockReturnValue({
      timestamp: '2024-01-01T00:00:00Z',
      metrics: store.metrics,
      score: store.score,
      suggestions: store.suggestions
    })
    
    const exportButton = wrapper.find('.export-button')
    await exportButton.trigger('click')
    
    expect(exportSpy).toHaveBeenCalled()
  })

  it('applies critical alerts styling', async () => {
    const store = usePerformanceStore()
    store.metrics.fps = 10 // 临界FPS
    store.score = 40 // 低分
    
    const wrapper = mount(PerformanceMonitor)
    
    expect(wrapper.find('.performance-score').classes()).toContain('score-critical')
    
    const fpsIndicator = wrapper.find('.fps-indicator')
    expect(fpsIndicator.classes()).toContain('critical')
  })
})