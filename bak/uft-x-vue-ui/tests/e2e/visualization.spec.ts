import { test, expect } from '@playwright/test'

test.describe('三维可视化E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('应用应正常加载', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/UFT-X Vue UI/)

    // 检查主要组件是否渲染
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 检查性能监控面板
    const performancePanel = page.locator('[data-testid="performance-monitor"]')
    await expect(performancePanel).toBeVisible()
  })

  test('三维场景应交互正常', async ({ page }) => {
    const canvas = page.locator('canvas')

    // 测试鼠标交互
    await canvas.click({ position: { x: 400, y: 300 } })

    // 测试拖拽交互
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 500, y: 400 }
    })

    // 验证交互后状态
    const fpsDisplay = page.locator('[data-testid="fps-display"]')
    await expect(fpsDisplay).toContainText(/FPS/)
  })

  test('性能监控功能应正常工作', async ({ page }) => {
    // 检查性能指标显示
    const fpsElement = page.locator('[data-testid="fps"]')
    const memoryElement = page.locator('[data-testid="memory"]')

    await expect(fpsElement).toBeVisible()
    await expect(memoryElement).toBeVisible()

    // 等待性能数据更新
    await page.waitForTimeout(1000)

    // 验证性能数据格式
    const fpsText = await fpsElement.textContent()
    const memoryText = await memoryElement.textContent()

    expect(fpsText).toMatch(/\d+(\.\d+)?/)
    expect(memoryText).toMatch(/\d+(\.\d+)? MB/)
  })

  test('数据加载和渲染应高效', async ({ page }) => {
    // 测量页面加载时间
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // 验证加载时间在合理范围内
    expect(loadTime).toBeLessThan(5000) // 5秒内完成加载

    // 验证三维场景初始化
    const sceneReady = page.locator('[data-testid="scene-ready"]')
    await expect(sceneReady).toBeVisible({ timeout: 10000 })
  })

  test('内存管理应稳定', async ({ page }) => {
    // 模拟长时间运行
    for (let i = 0; i < 10; i++) {
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }

    // 检查内存使用情况
    const memoryElement = page.locator('[data-testid="memory"]')
    const memoryText = await memoryElement.textContent()
    const memoryUsage = parseFloat(memoryText?.match(/\d+\.\d+/)![0] || '0')

    // 验证内存使用稳定
    expect(memoryUsage).toBeLessThan(500) // 内存使用应小于500MB
  })

  test('响应式设计应正常工作', async ({ page }) => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)

      // 验证关键元素可见
      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // 验证布局正确
      const canvasRect = await canvas.boundingBox()
      expect(canvasRect?.width).toBeGreaterThan(100)
      expect(canvasRect?.height).toBeGreaterThan(100)
    }
  })

  test('错误处理应友好', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/data', route => route.abort())

    // 验证错误处理
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })

    // 验证恢复功能
    await page.reload()
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('性能阈值应达标', async ({ page }) => {
    // 测量FPS性能
    const fpsElement = page.locator('[data-testid="fps"]')
    await page.waitForTimeout(2000) // 等待稳定

    const fpsText = await fpsElement.textContent()
    const fps = parseFloat(fpsText?.match(/\d+(\.\d+)?/)![0] || '0')

    // 验证FPS达到性能要求
    expect(fps).toBeGreaterThan(30) // FPS应高于30

    // 测量内存使用
    const memoryElement = page.locator('[data-testid="memory"]')
    const memoryText = await memoryElement.textContent()
    const memoryUsage = parseFloat(memoryText?.match(/\d+\.\d+/)![0] || '0')

    // 验证内存使用在合理范围内
    expect(memoryUsage).toBeLessThan(300) // 内存使用应小于300MB
  })

  test('浏览器兼容性', async ({ browserName, page }) => {
    // 验证在不同浏览器中的表现
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 浏览器特定测试
    if (browserName === 'chromium') {
      // Chrome特有功能测试
      await page.evaluate(() => {
        const gl = document.querySelector('canvas')?.getContext('webgl2')
        expect(gl).toBeDefined()
      })
    }

    // 通用功能验证
    const fpsElement = page.locator('[data-testid="fps"]')
    await expect(fpsElement).toBeVisible()
  })
})

// 性能基准测试组
test.describe('性能基准测试', () => {
  test('页面加载性能', async ({ page }) => {
    const navigationStart = await page.evaluate(() => window.performance.timing.navigationStart)
    const loadEventEnd = await page.evaluate(() => window.performance.timing.loadEventEnd)
    const loadTime = loadEventEnd - navigationStart

    expect(loadTime).toBeLessThan(3000) // 页面加载应小于3秒
  })

  test('首次内容绘制时间', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      return fcpEntry ? fcpEntry.startTime : 0
    })

    expect(fcp).toBeLessThan(1000) // FCP应小于1秒
  })

  test('最大内容绘制时间', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          const lcpEntry = entries[entries.length - 1]
          resolve(lcpEntry ? lcpEntry.startTime : 0)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })

    expect(lcp).toBeLessThan(2500) // LCP应小于2.5秒
  })
})
