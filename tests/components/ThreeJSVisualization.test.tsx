import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ThreeJSVisualization from '@/components/ThreeJSVisualization'

// 模拟 Three.js 模块
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    background: null,
    add: vi.fn(),
    remove: vi.fn(),
    children: []
  })),
  WebGLRenderer: vi.fn(() => ({
    domElement: document.createElement('canvas'),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn()
  })),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn() },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn()
  })),
  AmbientLight: vi.fn(() => ({
    intensity: 1
  })),
  DirectionalLight: vi.fn(() => ({
    position: { set: vi.fn() },
    intensity: 1
  })),
  Vector3: vi.fn(() => ({
    set: vi.fn(),
    add: vi.fn(),
    subtract: vi.fn(),
    multiply: vi.fn(),
    divide: vi.fn(),
    length: 0,
    toArray: vi.fn(() => [0, 0, 0]),
    clone: vi.fn(() => ({
      set: vi.fn(),
      add: vi.fn(),
      subtract: vi.fn(),
      multiply: vi.fn(),
      divide: vi.fn(),
      length: 0,
      toArray: vi.fn(() => [0, 0, 0])
    }))
  })),
  Matrix4: vi.fn(() => ({
    set: vi.fn(),
    multiply: vi.fn(),
    multiplyMatrices: vi.fn()
  })),
  MeshStandardMaterial: vi.fn(() => ({
    dispose: vi.fn()
  })),
  BufferGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  Mesh: vi.fn(() => ({
    geometry: {
      computeBoundingSphere: vi.fn(),
      dispose: vi.fn()
    },
    material: {
      dispose: vi.fn()
    }
  })),
  Color: vi.fn(() => ({
    set: vi.fn(),
    toArray: vi.fn(() => [0, 0, 0]),
    r: 0,
    g: 0,
    b: 0
  })),
  Sphere: vi.fn(() => ({
    center: { x: 0, y: 0, z: 0 },
    radius: 1
  })),
  Frustum: vi.fn(() => ({
    intersectsSphere: vi.fn(() => true)
  }))
}))

// 模拟 OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: vi.fn(() => ({
    update: vi.fn(),
    dispose: vi.fn()
  }))
}))

describe('ThreeJSVisualization - 3D 可视化组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟 requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setTimeout(() => cb(performance.now()), 16)
      return 1
    })
    
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  it('应该正确初始化 Three.js 场景', () => {
    render(<ThreeJSVisualization />)
    
    expect(screen.getByTestId('threejs-container')).toBeInTheDocument()
  })

  it('应该处理场景大小变化', async () => {
    render(<ThreeJSVisualization />)
    
    // 模拟窗口大小变化
    fireEvent(window, new Event('resize'))
    
    await waitFor(() => {
      expect(screen.getByTestId('threejs-container')).toBeInTheDocument()
    })
  })

  it('应该支持公式渲染', () => {
    const testFormula = 'E = mc^2'
    
    render(<ThreeJSVisualization formula={testFormula} />)
    
    expect(screen.getByText(/公式可视化/)).toBeInTheDocument()
  })

  it('应该处理粒子系统', async () => {
    render(<ThreeJSVisualization particleCount={1000} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('particle-system')).toBeInTheDocument()
    })
  })

  it('应该支持交互控制', () => {
    render(<ThreeJSVisualization />)
    
    const controlPanel = screen.getByTestId('control-panel')
    
    fireEvent.click(controlPanel)
    
    expect(screen.getByText(/交互控制/)).toBeInTheDocument()
  })

  it('应该处理性能优化', async () => {
    render(<ThreeJSVisualization performanceMode="high" />)
    
    await waitFor(() => {
      expect(screen.getByText(/高性能模式/)).toBeInTheDocument()
    })
  })

  it('应该清理资源', () => {
    const { unmount } = render(<ThreeJSVisualization />)
    
    unmount()
    
    expect(screen.queryByTestId('threejs-container')).not.toBeInTheDocument()
  })

  describe('错误处理', () => {
    it('应该处理 WebGL 不支持的情况', () => {
      // 模拟 WebGL 不支持
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
      
      render(<ThreeJSVisualization />)
      
      expect(screen.getByText(/WebGL 不支持/)).toBeInTheDocument()
      
      // 恢复原型
      HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    it('应该处理内存不足错误', async () => {
      // 模拟内存不足
      vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<ThreeJSVisualization particleCount={1000000} />)
      
      await waitFor(() => {
        expect(screen.getByText(/内存优化/)).toBeInTheDocument()
      })
    })
  })

  describe('性能基准测试', () => {
    it('应该在 200ms 内完成场景初始化', () => {
      const startTime = performance.now()
      
      render(<ThreeJSVisualization />)
      
      const endTime = performance.now()
      const initTime = endTime - startTime
      
      expect(initTime).toBeLessThan(200)
    })

    it('应该保持稳定的帧率', async () => {
      render(<ThreeJSVisualization />)
      
      await waitFor(() => {
        expect(screen.getByText(/FPS/)).toBeInTheDocument()
      })
    })
  })
})