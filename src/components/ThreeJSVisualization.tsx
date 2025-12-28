import React, { useState, useCallback, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { motion } from 'framer-motion'
import { cn } from '../utils'
import {
  AutomatedPerformanceOptimizer,
  automatedPerformanceOptimizer,
  AutomatedOptimizationMode
} from '../performance/AutomatedPerformanceOptimizer'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'
import { RenderEngine } from '../rendering/RenderEngine'

// 导入拆分的组件
import ThreeJSContainer from './ThreeJSContainer'
import PerformanceMonitor from './PerformanceMonitor'
import ControlPanel from './ControlPanel'
import LoadingIndicator from './LoadingIndicator'

// 配置选项接口
export interface ThreeJSVisualizationProps {
  // 子渲染函数
  children?: (props: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    renderEngine: RenderEngine
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

const ThreeJSVisualization: React.FC<ThreeJSVisualizationProps> = React.memo(
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
    // 核心状态
    const [isSceneReady, setIsSceneReady] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [webglSupported, setWebglSupported] = useState(true)
    const [renderEngine, setRenderEngine] = useState<RenderEngine | null>(null)

    // 性能监控状态 - 使用更完整的性能指标
    const [performanceMetrics, setPerformanceMetrics] = useState({
      fps: 60, // 帧率
      renderTime: 0, // 渲染时间（毫秒）
      frameTime: 0, // 每帧时间（毫秒）
      memoryUsage: 0, // 内存使用情况（MB）
      gpuMemory: 0, // GPU内存使用情况（MB）
      drawCalls: 0, // 绘制调用次数
      triangles: 0, // 三角形数量
      vertices: 0, // 顶点数量
      renderResolution: 1.0, // 渲染分辨率
      shadowDrawCalls: 0, // 阴影绘制调用次数
      optimizationLevel: 2, // 优化级别（0-5）
      networkLatency: 0, // 网络延迟（毫秒）
      particleCount: 0, // 粒子数量
      objectCount: 0, // 对象数量
      textureMemory: 0, // 纹理内存（MB）
      shadowQuality: 1.0, // 阴影质量
      postProcessing: true, // 是否启用后处理
      thermalState: 'normal', // 设备温度状态
      batteryLevel: 1.0 // 电池电量
    })

    // 渲染控制状态
    const [renderState, setRenderState] = useState({
      isRendering: false, // 是否正在渲染
      isPaused: paused, // 暂停状态
      isOptimizing: false, // 是否正在进行性能优化
      optimizationLevel: 2, // 优化级别（0-5）
      isInitializing: true // 是否正在初始化
    })

    // UI控制状态
    const [uiState, setUiState] = useState({
      showPerformancePanel: true, // 是否显示性能监控面板
      showStats: true, // 是否显示统计信息
      autoModeEnabled: true, // 是否启用自动优化模式
      showControlPanel: false // 是否显示控制面板（默认隐藏，通过按钮切换）
    })

    // 检查WebGL支持 - 使用useMemo缓存结果
    const checkWebGLSupport = useMemo(() => {
      return () => {
        try {
          const canvas = document.createElement('canvas')
          const hasWebGL = !!(window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
          canvas.remove() // 立即清理Canvas元素，避免内存泄漏
          return hasWebGL
        } catch (e) {
          return false
        }
      }
    }, [])

    // 监听性能指标更新
    useEffect(() => {
      const handlePerformanceUpdate = (data: any) => {
        setPerformanceMetrics(prev => ({
          ...prev,
          ...data,
          optimizationLevel: data.optimizationLevel || prev.optimizationLevel
        }))
      }

      // 监听性能指标更新事件
      eventSystem.on(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, handlePerformanceUpdate)

      // 监听渲染质量更新事件
      eventSystem.on(APP_EVENTS.RENDER_QUALITY_UPDATED, (data: any) => {
        setPerformanceMetrics(prev => ({
          ...prev,
          optimizationLevel: data.qualityLevel
        }))
      })

      // 监听自动优化状态变更事件
      eventSystem.on(APP_EVENTS.AUTO_OPTIMIZATION_STATE_CHANGED, (data: any) => {
        setRenderState(prev => ({
          ...prev,
          isOptimizing: data.enabled
        }))
      })

      return () => {
        eventSystem.off(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, handlePerformanceUpdate)
        eventSystem.off(APP_EVENTS.RENDER_QUALITY_UPDATED)
        eventSystem.off(APP_EVENTS.AUTO_OPTIMIZATION_STATE_CHANGED)
      }
    }, [])

    // 初始化回调处理
    const handleInit = useCallback(
      (props: {
        scene: THREE.Scene
        camera: THREE.PerspectiveCamera
        renderer: THREE.WebGLRenderer
        controls: OrbitControls
        renderEngine: RenderEngine
      }) => {
        // 保存渲染引擎实例
        setRenderEngine(props.renderEngine)

        // 配置自动性能优化
        try {
          automatedPerformanceOptimizer.updateConfig({
            mode: uiState.autoModeEnabled
              ? AutomatedOptimizationMode.AUTO
              : AutomatedOptimizationMode.OFF,
            targetFPS: 60,
            enableAIOptimization: true,
            optimizationInterval: 1000
          })
        } catch (perfError) {
          console.warn('Performance optimizer initialization failed:', perfError)
        }

        // 调用用户初始化回调
        if (onInit) {
          try {
            onInit(props)
          } catch (initError) {
            console.error('User initialization callback failed:', initError)
            const wrappedError = initError instanceof Error ? initError : new Error('User initialization failed')
            setError(wrappedError)
            setRenderState(prev => ({ ...prev, isOptimizing: false, isInitializing: false }))

            // 发送错误事件
            eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
              component: 'ThreeJSVisualization',
              error: wrappedError,
              context: 'user_initialization'
            })
            return
          }
        }

        // 初始化完成，更新状态
        setIsSceneReady(true)
        setError(null)
        setRenderState(prev => ({
          ...prev,
          isInitializing: false,
          isOptimizing: true,
          isRendering: true
        }))
      },
      [onInit, uiState.autoModeEnabled]
    )

    // 更新UI状态
    const handleUpdateUIState = useCallback((updates: Partial<typeof uiState>) => {
      setUiState(prev => {
        const newState = { ...prev, ...updates }

        // 如果自动优化模式改变，更新性能优化器配置
        if (updates.autoModeEnabled !== undefined) {
          try {
            automatedPerformanceOptimizer.updateConfig({
              mode: newState.autoModeEnabled
                ? AutomatedOptimizationMode.AUTO
                : AutomatedOptimizationMode.OFF
            })
          } catch (perfError) {
            console.warn('Failed to update performance optimizer config:', perfError)
          }
        }

        return newState
      })
    }, [])

    // 暂停/恢复控制
    useEffect(() => {
      setRenderState(prev => ({
        ...prev,
        isPaused: paused
      }))
    }, [paused])

    // 自适应性能调整系统
    useEffect(() => {
      if (!isSceneReady || !renderEngine) return

      const adjustPerformance = () => {
        const { fps, renderTime } = performanceMetrics
        
        // 根据FPS动态调整渲染质量
        if (fps < 30) {
          // 严重卡顿，降低渲染质量
          renderEngine.setRenderQuality(1)
          renderEngine.applyPerformanceMode(true)
        } else if (fps < 45) {
          // 轻微卡顿，降低渲染质量
          renderEngine.setRenderQuality(2)
          renderEngine.applyPerformanceMode(true)
        } else if (fps > 55 && renderTime < 15) {
          // 流畅运行，提高渲染质量
          renderEngine.setRenderQuality(4)
          renderEngine.applyPerformanceMode(false)
        } else if (fps > 58 && renderTime < 10) {
          // 非常流畅，最高渲染质量
          renderEngine.setRenderQuality(5)
          renderEngine.applyPerformanceMode(false)
        }
      }

      // 定期检查性能并调整
      const intervalId = setInterval(adjustPerformance, 2000)
      
      return () => clearInterval(intervalId)
    }, [isSceneReady, renderEngine, performanceMetrics])

    // WebGL不支持时的优雅提示
    if (!webglSupported) {
      return (
        <motion.div
          className={cn(
            'flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md rounded-lg border border-red-500/30 bg-black/50 p-8 text-center backdrop-blur-sm">
            <div className="mb-6 text-6xl">🖥️</div>
            <h3 className="mb-4 text-2xl font-bold text-red-400">WebGL 不支持</h3>
            <p className="mb-6 text-gray-300">您的浏览器不支持 WebGL，无法运行 3D 可视化。</p>
            <div className="text-sm text-gray-400">
              <p className="mb-2">推荐使用以下现代浏览器：</p>
              <div className="flex justify-center gap-4">
                <span className="rounded-full bg-gray-700 px-3 py-1">Chrome</span>
                <span className="rounded-full bg-gray-700 px-3 py-1">Firefox</span>
                <span className="rounded-full bg-gray-700 px-3 py-1">Edge</span>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    // 错误提示 - 优雅的错误处理
    if (error) {
      return (
        <motion.div
          className={cn(
            'flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md rounded-lg border border-red-500/30 bg-black/50 p-8 text-center backdrop-blur-sm">
            <div className="mb-6 text-6xl">⚠️</div>
            <h3 className="mb-4 text-2xl font-bold text-red-400">初始化错误</h3>
            <p className="mb-6 break-words text-red-300">{error.message}</p>
            <div className="text-sm text-gray-400">
              <p className="mb-4">请检查控制台获取详细错误信息。</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-6 py-2 transition-colors duration-300 hover:bg-red-700"
              >
                刷新页面重试
              </button>
            </div>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        role="region"
        className={cn(
          'relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-black to-blue-950/20',
          className
        )}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Three.js容器 */}
        <ThreeJSContainer
          className="absolute inset-0"
          onInit={handleInit}
          onAnimationFrame={onAnimationFrame}
          cameraConfig={cameraConfig}
          controlsConfig={controlsConfig}
          rendererConfig={rendererConfig}
          sceneConfig={sceneConfig}
          autoFit={autoFit}
          paused={paused}
          minWidth={minWidth}
          minHeight={minHeight}
          performanceOptions={performanceOptions}
        >
          {children && renderEngine && (props => {
            return children({
              ...props,
              renderEngine
            })
          })}
        </ThreeJSContainer>

        {/* 性能监控面板 */}
        <PerformanceMonitor
          metrics={performanceMetrics}
          renderState={renderState}
          uiState={uiState}
          onUpdateUIState={handleUpdateUIState}
        />

        {/* 加载指示器 */}
        <LoadingIndicator isLoading={!isSceneReady && renderState.isInitializing} />

        {/* UI控制面板 */}
        <ControlPanel uiState={uiState} onUpdateUIState={handleUpdateUIState} />
      </motion.div>
    )
  }
)

export default ThreeJSVisualization
