import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ThreeJSVisualization from '@/components/ThreeJSVisualization'

// 模拟 Three.js 模块
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    background: null,
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    userData: {}
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
  })),
  LineBasicMaterial: vi.fn(() => ({
    color: 0xffffff,
    linewidth: 1
  })),
  Line: vi.fn(() => ({
    geometry: {
      setFromPoints: vi.fn(),
      attributes: {}
    }
  })),
  PointsMaterial: vi.fn(() => ({
    size: 0.05
  })),
  Points: vi.fn(() => ({
    geometry: {
      attributes: {}
    },
    rotation: { y: 0 }
  })),
  SphereGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  MeshBasicMaterial: vi.fn(() => ({
    color: 0xffffff,
    wireframe: false,
    transparent: false,
    opacity: 1
  })),
  TubeGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  ArrowHelper: vi.fn(() => ({})),
  PlaneGeometry: vi.fn(() => ({
    attributes: {}
  })),
  Mesh: vi.fn(() => ({
    geometry: {
      attributes: {}
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 }
  })),
  RingGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  TorusGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  CylinderGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  ConeGeometry: vi.fn(() => ({
    computeBoundingSphere: vi.fn(),
    dispose: vi.fn()
  })),
  CatmullRomCurve3: vi.fn(() => ({}))
}))

// 模拟 OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: vi.fn(() => ({
    update: vi.fn(),
    dispose: vi.fn()
  }))
}))

// 模拟 RenderEngine
vi.mock('@/rendering/RenderEngine', () => {
  const mockEngine = {
    getScene: vi.fn(() => ({
      background: null,
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
      userData: {}
    })),
    getCamera: vi.fn(() => ({
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn()
    })),
    getRenderer: vi.fn(() => ({
      domElement: document.createElement('canvas'),
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn()
    })),
    getControls: vi.fn(() => ({
      update: vi.fn(),
      dispose: vi.fn()
    })),
    handleResize: vi.fn(),
    dispose: vi.fn()
  }

  return {
    RenderEngine: vi.fn(() => mockEngine)
  }
})

// 模拟 window 对象在测试后仍然存在
Object.defineProperty(global, 'window', {
  value: {
    requestAnimationFrame: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    devicePixelRatio: 1,
    WebGLRenderingContext: vi.fn()
  },
  writable: true
})

// 模拟 AutomatedPerformanceOptimizer
vi.mock('@/performance/AutomatedPerformanceOptimizer', () => ({
  automatedPerformanceOptimizer: {
    updateConfig: vi.fn(),
    optimize: vi.fn()
  }
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

    // 完整模拟 WebGL 环境，确保 checkWebGLSupport() 返回 true
    // 1. 模拟 WebGLRenderingContext
    window.WebGLRenderingContext = class MockWebGLRenderingContext {
      constructor() {
        return {
          getExtension: vi.fn(),
          viewport: vi.fn(),
          clear: vi.fn(),
          drawElements: vi.fn(),
          enable: vi.fn(),
          disable: vi.fn(),
          bindBuffer: vi.fn(),
          bufferData: vi.fn(),
          useProgram: vi.fn(),
          uniformMatrix4fv: vi.fn(),
          uniform3fv: vi.fn(),
          uniform1f: vi.fn(),
          uniform1i: vi.fn(),
          vertexAttribPointer: vi.fn(),
          enableVertexAttribArray: vi.fn(),
          drawArrays: vi.fn(),
          createBuffer: vi.fn(),
          createProgram: vi.fn(),
          createShader: vi.fn(),
          shaderSource: vi.fn(),
          compileShader: vi.fn(),
          attachShader: vi.fn(),
          linkProgram: vi.fn(),
          getAttribLocation: vi.fn(),
          getUniformLocation: vi.fn()
        }
      }
    } as any

    // 2. 模拟 experimental-webgl 支持
    window['experimental-webgl'] = window.WebGLRenderingContext

    // 3. 模拟 canvas.getContext，确保返回有效的 WebGL 上下文
    const mockWebGLContext = {
      getExtension: vi.fn(),
      viewport: vi.fn(),
      clear: vi.fn(),
      drawElements: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      useProgram: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      uniform3fv: vi.fn(),
      uniform1f: vi.fn(),
      uniform1i: vi.fn(),
      vertexAttribPointer: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      drawArrays: vi.fn(),
      createBuffer: vi.fn(),
      createProgram: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getAttribLocation: vi.fn(),
      getUniformLocation: vi.fn()
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextId: string) => {
      if (contextId === 'webgl' || contextId === 'experimental-webgl') {
        return mockWebGLContext
      }
      return null
    })
  })

  it('应该正确初始化 Three.js 场景', () => {
    render(<ThreeJSVisualization />)

    // 组件应该渲染成功，没有错误
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该处理场景大小变化', async () => {
    render(<ThreeJSVisualization />)

    // 模拟窗口大小变化
    fireEvent(window, new Event('resize'))

    // 组件应该仍然渲染成功
    await waitFor(() => {
      expect(screen.getByRole('region')).toBeInTheDocument()
    })
  })

  it('应该支持自定义渲染函数', () => {
    const mockRender = vi.fn()

    render(<ThreeJSVisualization children={mockRender} />)

    // 组件应该渲染成功，children prop 被传递
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该支持动画帧回调', () => {
    const mockOnAnimationFrame = vi.fn()

    render(<ThreeJSVisualization onAnimationFrame={mockOnAnimationFrame} />)

    // 组件应该渲染成功
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该支持初始化回调', () => {
    const mockOnInit = vi.fn()

    render(<ThreeJSVisualization onInit={mockOnInit} />)

    // 组件应该渲染成功
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该支持暂停状态', () => {
    render(<ThreeJSVisualization paused={true} />)

    // 组件应该渲染成功
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该支持自定义相机配置', () => {
    render(<ThreeJSVisualization cameraConfig={{ position: { x: 1, y: 2, z: 3 } }} />)

    // 组件应该渲染成功
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该支持自定义场景配置', () => {
    render(<ThreeJSVisualization sceneConfig={{ backgroundColor: '#000000' }} />)

    // 组件应该渲染成功
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('应该清理资源', () => {
    const { unmount } = render(<ThreeJSVisualization />)

    unmount()

    // 组件应该被卸载，没有残留
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('应该处理 WebGL 不支持的情况', () => {
    // 模拟 WebGL 不支持
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)

    render(<ThreeJSVisualization />)

    expect(screen.getByText(/WebGL 不支持/)).toBeInTheDocument()
  })
})
