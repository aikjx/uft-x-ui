import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RenderEngine } from '../rendering/RenderEngine'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 配置选项接口
export interface ThreeJSContainerProps {
  // 子渲染函数
  children?: (props: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
  }) => void

  // CSS类名
  className?: string

  // 初始化回调
  onInit?: (props: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    renderEngine: RenderEngine
  }) => void

  // 动画帧回调
  onAnimationFrame?: (deltaTime: number) => void

  // 相机配置
  cameraConfig?: {
    fov?: number
    near?: number
    far?: number
    position?: { x: number; y: number; z: number }
  }

  // 控制器配置
  controlsConfig?: {
    enableDamping?: boolean
    dampingFactor?: number
    rotateSpeed?: number
    zoomSpeed?: number
    enablePan?: boolean
    autoRotate?: boolean
    autoRotateSpeed?: number
  }

  // 渲染器配置
  rendererConfig?: {
    antialias?: boolean
    alpha?: boolean
    physicallyCorrectLights?: boolean
    shadowMapEnabled?: boolean
  }

  // 场景配置
  sceneConfig?: {
    backgroundColor?: number | string
  }

  // 自动适应容器大小
  autoFit?: boolean

  // 暂停/恢复控制
  paused?: boolean

  // 最小尺寸
  minWidth?: number
  minHeight?: number

  // 性能优化选项
  performanceOptions?: {
    enableBatchRendering?: boolean
    dynamicPixelRatio?: boolean
    usePerformanceMonitoring?: boolean
    maxObjects?: number
  }
}

const ThreeJSContainer: React.FC<ThreeJSContainerProps> = React.memo(
  ({
    children,
    className = '',
    onInit,
    onAnimationFrame,
    cameraConfig = {},
    controlsConfig = {},
    rendererConfig = {},
    sceneConfig = {},
    autoFit = true,
    paused = false,
    minWidth = 0,
    minHeight = 300,
    performanceOptions = {}
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const renderEngineRef = useRef<RenderEngine | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const lastFrameTimeRef = useRef<number>(0)

    // 核心状态
    const [isSceneReady, setIsSceneReady] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [webglSupported, setWebglSupported] = useState(true)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // 检查WebGL支持
    const checkWebGLSupport = useCallback(() => {
      try {
        const canvas = document.createElement('canvas')
        const hasWebGL = !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        )
        canvas.remove() // 立即清理Canvas元素，避免内存泄漏
        return hasWebGL
      } catch (e) {
        return false
      }
    }, [])

    // 初始化Three.js场景
    const initialize = useCallback(() => {
      if (!containerRef.current || !webglSupported) return

      try {
        // 计算容器尺寸
        const container = containerRef.current
        const width = Math.max(minWidth, container.clientWidth || 0)
        const height = Math.max(minHeight, container.clientHeight || 0)
        setDimensions({ width, height })

        // 初始化渲染引擎配置
        const cameraPosition = cameraConfig.position
          ? new THREE.Vector3(
              cameraConfig.position.x,
              cameraConfig.position.y,
              cameraConfig.position.z
            )
          : undefined

        // 防御性检查：确保RenderEngine存在
        if (typeof RenderEngine !== 'function') {
          throw new Error('RenderEngine is not available')
        }

        // 使用requestIdleCallback优化渲染引擎初始化，避免阻塞主线程
        const initRenderEngine = () => {
          try {
            // 配置渲染引擎
            const renderEngine = new RenderEngine({
              container,
              cameraPosition,
              enableControls: true,
              autoUpdate: true,
              enablePerformanceMonitoring: true,
              useBatchRendering: performanceOptions.enableBatchRendering ?? true,
              dynamicPixelRatio: performanceOptions.dynamicPixelRatio ?? true
            })

            renderEngineRef.current = renderEngine

            // 应用场景配置
            if (sceneConfig.backgroundColor) {
              const scene = renderEngine.getScene?.()
              if (scene) {
                scene.background = new THREE.Color(sceneConfig.backgroundColor)
              }
            }

            // 应用控制器配置
            const controls = renderEngine.getControls?.()
            if (controls) {
              Object.assign(controls, controlsConfig)
            }

            // 调用用户初始化回调
            if (onInit) {
              const scene = renderEngine.getScene?.()
              const camera = renderEngine.getCamera?.()
              const renderer = renderEngine.getRenderer?.()
              const engineControls = renderEngine.getControls?.() as OrbitControls

              if (scene && camera && renderer) {
                try {
                  onInit({
                    scene,
                    camera,
                    renderer,
                    controls: engineControls,
                    renderEngine
                  })
                } catch (initError) {
                  console.error('User initialization callback failed:', initError)
                  const wrappedError =
                    initError instanceof Error ? initError : new Error('User initialization failed')
                  setError(wrappedError)

                  // 发送错误事件
                  eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
                    component: 'ThreeJSContainer',
                    error: wrappedError,
                    context: 'user_initialization'
                  })
                  return
                }
              }
            }

            // 初始化完成
            setIsSceneReady(true)
            setError(null)
          } catch (engineError) {
            console.error('Render engine initialization failed:', engineError)
            const wrappedError =
              engineError instanceof Error
                ? engineError
                : new Error('Render engine initialization failed')
            setError(wrappedError)
            setIsSceneReady(false)

            // 发送错误事件
            eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
              component: 'ThreeJSContainer',
              error: wrappedError,
              context: 'render_engine_initialization'
            })
          }
        }

        // 使用requestIdleCallback或降级到setTimeout
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(initRenderEngine, { timeout: 1000 })
        } else {
          setTimeout(initRenderEngine, 0)
        }
      } catch (err) {
        console.error('Three.js initialization error:', err)
        const initError = err instanceof Error ? err : new Error('Three.js initialization failed')
        setError(initError)
        setIsSceneReady(false)

        // 发送错误事件
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSContainer',
          error: initError,
          context: 'initialization'
        })
      }
    }, [
      onInit,
      minWidth,
      minHeight,
      webglSupported,
      cameraConfig,
      controlsConfig,
      sceneConfig,
      performanceOptions
    ])

    // 动画循环
    const animate = useCallback(() => {
      if (paused || !renderEngineRef.current) {
        return
      }

      const currentTime = performance.now()
      // 限制最大deltaTime为1/30秒，防止帧率骤降时的异常行为
      const deltaTime = Math.min(
        lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0,
        1 / 30
      )
      lastFrameTimeRef.current = currentTime

      // 调用用户动画帧回调，增加错误捕获
      if (onAnimationFrame) {
        try {
          onAnimationFrame(deltaTime)
        } catch (animationError) {
          console.error('User animation callback failed:', animationError)
          // 发送错误事件
          eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
            component: 'ThreeJSContainer',
            error:
              animationError instanceof Error
                ? animationError
                : new Error('Animation callback failed'),
            context: 'animation'
          })
          // 继续动画循环，不因为用户回调错误而中断
        }
      }

      // 继续动画循环，确保requestAnimationFrame可用
      if (typeof requestAnimationFrame === 'function') {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }, [paused, onAnimationFrame])

    // 清理资源
    const cleanup = useCallback(() => {
      // 取消动画帧
      if (animationFrameRef.current && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // 重置帧时间，防止下次启动时出现异常大的deltaTime
      lastFrameTimeRef.current = 0

      // 停止渲染引擎，增加更安全的调用方式
      if (renderEngineRef.current) {
        try {
          // 先停止渲染
          if (typeof renderEngineRef.current.stop === 'function') {
            renderEngineRef.current.stop()
          }

          // 再释放资源 - 使用可选链操作符和类型检查
          if (typeof renderEngineRef.current.dispose === 'function') {
            renderEngineRef.current.dispose()
          }
        } catch (disposeError) {
          console.error('Render engine dispose failed:', disposeError)
          // 发送错误事件
          eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
            component: 'ThreeJSContainer',
            error:
              disposeError instanceof Error
                ? disposeError
                : new Error('Render engine dispose failed'),
            context: 'cleanup'
          })
        }
        renderEngineRef.current = null
      }

      // 重置状态
      setError(null)
      setIsSceneReady(false)
    }, [])

    // 调整大小处理函数
    const handleResize = useCallback(() => {
      if (!containerRef.current || !renderEngineRef.current) return

      try {
        // 使用更精确的尺寸获取方式，考虑缩放因子
        const rect = containerRef.current.getBoundingClientRect()

        // 只调用渲染引擎的调整大小方法，不更新React状态，减少重渲染
        // 渲染引擎内部会处理尺寸变化
        if (typeof renderEngineRef.current.handleResize === 'function') {
          renderEngineRef.current.handleResize()
        }
      } catch (resizeError) {
        console.error('Resize handling failed:', resizeError)
        // 发送错误事件，确保错误对象类型安全
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSContainer',
          error: resizeError instanceof Error ? resizeError : new Error('Resize handling failed'),
          context: 'resize'
        })
      }
    }, [minWidth, minHeight])

    // 组件挂载时初始化
    useEffect(() => {
      const isSupported = checkWebGLSupport()
      setWebglSupported(isSupported)

      if (isSupported) {
        initialize()

        // 添加窗口调整大小监听
        if (autoFit) {
          window.addEventListener('resize', handleResize)
        }

        // 开始动画循环
        if (!paused) {
          animate()
        }
      }

      // 组件卸载时清理资源
      return () => {
        if (autoFit) {
          window.removeEventListener('resize', handleResize)
        }
        cleanup()
      }
    }, [initialize, handleResize, cleanup, autoFit, paused, animate, checkWebGLSupport])

    // 暂停/恢复控制
    useEffect(() => {
      if (paused && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      } else if (!paused && isSceneReady && !animationFrameRef.current) {
        animate()
      }
    }, [paused, isSceneReady, animate])

    return (
      <div
        ref={containerRef}
        data-testid="threejs-container"
        className={className}
        style={{
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`
        }}
      />
    )
  }
)

export default React.memo(ThreeJSContainer)
