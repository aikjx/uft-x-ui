import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PerformanceMonitor, performanceMonitor } from '../performance/PerformanceMonitor'

interface PerformanceStats {
  fps: number
  renderTime: number
  frameCount: number
  lastFpsUpdate: number
}

interface UseThreeSceneProps {
  containerRef: React.RefObject<HTMLElement>
  onPerformanceUpdate?: (stats: PerformanceStats) => void
  particleCount?: number
  particleColor?: string
  particleOpacity?: number
  autoRotate?: boolean
  speed?: number
  size?: number
}

interface UseThreeSceneReturn {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  isLoading: boolean
  performanceStats: PerformanceStats
}

export const useThreeSceneOptimized = ({
  containerRef,
  onPerformanceUpdate,
  particleCount = 1000,
  particleColor = '#0070f3',
  particleOpacity = 0.8,
  autoRotate = false,
  speed = 1.0,
  size = 1.0
}: UseThreeSceneProps): UseThreeSceneReturn => {
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    fps: 0,
    renderTime: 0,
    frameCount: 0,
    lastFpsUpdate: 0
  })

  // 初始化Three.js场景
  const initializeScene = useCallback(() => {
    if (!containerRef.current) return

    setIsLoading(true)

    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1117)

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // 创建渲染器，优化性能设置
    const renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // 仅在低分辨率设备上启用抗锯齿
      powerPreference: 'high-performance', // 优先使用高性能GPU
      alpha: false, // 禁用alpha通道，提高性能
      premultipliedAlpha: false, // 禁用预乘alpha，减少计算负担
      stencil: false, // 禁用模板缓冲，提高性能
      depth: true // 保留深度缓冲，确保正确的3D渲染
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比，减少渲染负担
    renderer.setClearColor(0x0f1117, 1)

    // 优化渲染器性能
    renderer.autoClear = true
    renderer.sortObjects = false // 禁用对象排序，提高渲染速度
    renderer.info.autoReset = true // 自动重置性能统计
    renderer.shadowMap.enabled = true // 启用阴影映射
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // 使用软阴影，提高视觉效果
    renderer.shadowMap.needsUpdate = true
    renderer.outputColorSpace = THREE.SRGBColorSpace // 使用正确的色彩空间
    renderer.toneMapping = THREE.ACESFilmicToneMapping // 启用色调映射，提高视觉效果
    renderer.toneMappingExposure = 1.0
    renderer.physicallyCorrectLights = true // 启用物理正确的光照
    renderer.maxLights = 8 // 限制最大光源数量，提高性能

    // 清空容器并添加渲染器
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)

    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = true // 启用平移功能
    controls.enableZoom = true // 启用缩放功能
    controls.enableRotate = true // 启用旋转功能
    controls.minDistance = 1
    controls.maxDistance = 50 // 增加最大距离，允许用户查看更广阔的场景
    controls.minZoom = 0.1
    controls.maxZoom = 2
    controls.minPolarAngle = 0 // 允许查看底部
    controls.maxPolarAngle = Math.PI // 允许查看顶部
    controls.autoRotate = false // 默认禁用自动旋转
    controls.autoRotateSpeed = 2.0 // 自动旋转速度
    controls.panSpeed = 1.0 // 平移速度
    controls.zoomSpeed = 1.0 // 缩放速度
    controls.rotateSpeed = 1.0 // 旋转速度

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // 保存引用
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    // 设置性能监控器的渲染器
    performanceMonitor.setRenderer(renderer)
    // 启用性能监控
    performanceMonitor.enable()

    setIsLoading(false)

    return { scene, camera, renderer, controls }
  }, [containerRef])

  // 动画循环
  const startAnimationLoop = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current) {
      return
    }

    const scene = sceneRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current
    const controls = controlsRef.current

    // 性能监控变量
    let fps = 0
    let frameCount = 0
    let lastFpsUpdate = 0
    let lastRenderTime = 0
    let lastAnimationFrame = 0

    // 根据设备性能动态调整渲染频率
    const getTargetFrameTime = () => {
      const devicePixelRatio = window.devicePixelRatio || 1
      if (devicePixelRatio > 2) {
        return 33 // 30fps for high-DPI devices
      }
      return 16 // 60fps for standard devices
    }

    // 动画循环 - 添加智能渲染节流和性能监控
    const animate = (timestamp: number) => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const deltaTime = timestamp - lastAnimationFrame
      lastAnimationFrame = timestamp

      // 根据设备性能动态调整渲染频率
      const targetFrameTime = getTargetFrameTime()
      if (timestamp - lastRenderTime < targetFrameTime) return

      // 记录渲染开始时间
      const renderStartTime = performance.now()

      // 只在必要时更新控制器
      if (controls.autoRotate || controls.isDragging || controls.isZooming || controls.isPanning) {
        controls.update()
      }

      // 更新所有带有animate方法的对象
      scene.traverse(object => {
        if (object.userData && typeof object.userData.animate === 'function') {
          object.userData.animate(deltaTime)
        }
      })

      renderer.render(scene, camera)

      // 记录渲染结束时间并计算渲染时间
      const renderEndTime = performance.now()
      const renderTime = renderEndTime - renderStartTime

      // 记录渲染时间到性能监控器
      performanceMonitor.recordRenderTime(renderTime)

      // 更新帧率统计
      frameCount++
      if (timestamp - lastFpsUpdate >= 1000) {
        // 每秒更新一次FPS
        fps = frameCount
        frameCount = 0
        lastFpsUpdate = timestamp

        const stats = {
          fps,
          renderTime,
          frameCount,
          lastFpsUpdate
        }

        // 更新性能统计
        setPerformanceStats(stats)

        // 调用外部回调
        if (onPerformanceUpdate) {
          onPerformanceUpdate(stats)
        }

        // 控制台输出性能统计（仅开发环境）
        if (import.meta.env.DEV) {
          const threeStats = performanceMonitor.getStats()
          console.log(
            `🎮 性能统计: FPS = ${fps}, 渲染时间 = ${renderTime.toFixed(2)}ms, 绘制调用 = ${threeStats.drawCalls}, 三角形 = ${threeStats.triangles}, 内存使用 = ${threeStats.memoryUsage}MB`
          )
        }
      }

      lastRenderTime = timestamp
    }

    animate(0)
  }, [onPerformanceUpdate])

  // 窗口大小调整处理
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) {
      return
    }

    const camera = cameraRef.current
    const renderer = rendererRef.current

    camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
  }, [containerRef])

  // 监听可视化参数变化并更新场景
  useEffect(() => {
    if (!sceneRef.current || !controlsRef.current) return

    const scene = sceneRef.current
    const controls = controlsRef.current

    // 更新控制器参数
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = speed

    // 更新场景中的粒子系统
    scene.traverse(object => {
      if (object instanceof THREE.Points) {
        // 更新粒子系统的属性
        if (object.material instanceof THREE.PointsMaterial) {
          object.material.size = size
          object.material.color.set(particleColor)
          object.material.opacity = particleOpacity
        }
      }
    })
  }, [particleCount, particleColor, particleOpacity, autoRotate, speed, size])

  // 初始化场景和动画循环
  useEffect(() => {
    initializeScene()
    startAnimationLoop()

    // 添加窗口大小调整监听
    window.addEventListener('resize', handleResize)

    return () => {
      // 清理资源
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // 禁用性能监控
      performanceMonitor.disable();

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      if (controlsRef.current) {
        controlsRef.current.dispose()
      }

      // 移除事件监听
      window.removeEventListener('resize', handleResize)
    }
  }, [initializeScene, startAnimationLoop, handleResize])

  // 返回场景、相机、渲染器和控制器
  return {
    scene: sceneRef.current || new THREE.Scene(),
    camera: cameraRef.current || new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    renderer: rendererRef.current || new THREE.WebGLRenderer(),
    controls:
      controlsRef.current ||
      new OrbitControls(
        new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
        document.createElement('canvas')
      ),
    isLoading,
    performanceStats
  }
}
