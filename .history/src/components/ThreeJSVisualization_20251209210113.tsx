import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { VISUALIZATION_CONFIG } from '../constants';
import { RenderEngine } from '../rendering/RenderEngine';
import { AutomatedPerformanceOptimizer, automatedPerformanceOptimizer } from '../performance/AutomatedPerformanceOptimizer';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

// 配置选项接口
export interface ThreeJSVisualizationProps {
  // 子渲染函数
  children?: (props: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
  }) => void;

  // CSS类名
  className?: string;

  // 初始化回调
  onInit?: (props: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
  }) => void;

  // 动画帧回调
  onAnimationFrame?: (deltaTime: number) => void;

  // 相机配置
  cameraConfig?: {
    fov?: number;
    near?: number;
    far?: number;
    position?: { x: number; y: number; z: number };
  };

  // 控制器配置
  controlsConfig?: {
    enableDamping?: boolean;
    dampingFactor?: number;
    rotateSpeed?: number;
    zoomSpeed?: number;
    enablePan?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
  };

  // 渲染器配置
  rendererConfig?: {
    antialias?: boolean;
    alpha?: boolean;
    physicallyCorrectLights?: boolean;
    shadowMapEnabled?: boolean;
  };

  // 场景配置
  sceneConfig?: {
    backgroundColor?: number | string;
  };

  // 自动适应容器大小
  autoFit?: boolean;

  // 暂停/恢复控制
  paused?: boolean;

  // 最小尺寸
  minWidth?: number;
  minHeight?: number;

  // 性能优化选项
  performanceOptions?: {
    enableBatchRendering?: boolean;
    dynamicPixelRatio?: boolean;
    usePerformanceMonitoring?: boolean;
    maxObjects?: number;
  };
}

const ThreeJSVisualization: React.FC<ThreeJSVisualizationProps> = React.memo(({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const renderEngineRef = useRef<RenderEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // 核心状态
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // 性能监控状态
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,               // 帧率
    renderTime: 0,         // 渲染时间（毫秒）
    frameTime: 0,          // 每帧时间（毫秒）
    memoryUsage: 0,        // 内存使用情况（MB）
    drawCalls: 0,          // 绘制调用次数
    triangles: 0,          // 三角形数量
    vertices: 0,           // 顶点数量
    gpuMemory: 0           // GPU内存使用情况（MB）
  });
  
  // 渲染控制状态
  const [renderState, setRenderState] = useState({
    isRendering: false,    // 是否正在渲染
    isPaused: paused,      // 暂停状态
    isOptimizing: false,   // 是否正在进行性能优化
    optimizationLevel: 0,  // 优化级别（0-5）
    isInitializing: false  // 是否正在初始化
  });
  
  // UI控制状态
  const [uiState, setUiState] = useState({
    showPerformancePanel: true,  // 是否显示性能监控面板
    showStats: true,             // 是否显示统计信息
    autoModeEnabled: true        // 是否启用自动优化模式
  });

  // 检查WebGL支持 - 使用useMemo缓存结果
  const checkWebGLSupport = useMemo(() => {
    return () => {
      try {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        canvas.remove(); // 立即清理Canvas元素，避免内存泄漏
        return hasWebGL;
      } catch (e) {
        return false;
      }
    };
  }, []);

  // 初始化Three.js场景 - 优化性能和错误处理
  const initialize = useCallback(() => {
    if (!containerRef.current || !webglSupported) return;

    try {
      // 开始初始化，更新状态
      setRenderState(prev => ({ 
        ...prev, 
        isInitializing: true,
        isOptimizing: true, 
        optimizationLevel: 1 
      }));
      
      // 计算容器尺寸
      const container = containerRef.current;
      const width = Math.max(minWidth, container.clientWidth || 0);
      const height = Math.max(minHeight, container.clientHeight || 0);
      setDimensions({ width, height });

      // 初始化渲染引擎配置 - 直接计算，避免在useCallback中使用useMemo
      const cameraPosition = cameraConfig.position 
        ? new THREE.Vector3(cameraConfig.position.x, cameraConfig.position.y, cameraConfig.position.z)
        : undefined;

      // 防御性检查：确保RenderEngine存在
      if (typeof RenderEngine !== 'function') {
        throw new Error('RenderEngine is not available');
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
          });

          renderEngineRef.current = renderEngine;

          // 应用场景配置 - 使用防抖避免频繁更新
          if (sceneConfig.backgroundColor) {
            const scene = renderEngine.getScene?.();
            if (scene) {
              scene.background = new THREE.Color(sceneConfig.backgroundColor);
            }
          }

          // 应用控制器配置
          const controls = renderEngine.getControls?.();
          if (controls) {
            Object.assign(controls, controlsConfig);
          }

          // 配置自动性能优化 - 使用防抖避免频繁更新
          try {
            automatedPerformanceOptimizer.updateConfig({
              mode: uiState.autoModeEnabled ? 'auto' : 'off',
              targetFPS: 60,
              enableAIOptimization: true,
              optimizationInterval: 1000
            });
          } catch (perfError) {
            console.warn('Performance optimizer initialization failed:', perfError);
          }

          // 调用用户初始化回调
          if (onInit) {
            const scene = renderEngine.getScene?.();
            const camera = renderEngine.getCamera?.();
            const renderer = renderEngine.getRenderer?.();
            const engineControls = renderEngine.getControls?.() as OrbitControls;

            if (scene && camera && renderer) {
              try {
                onInit({
                  scene,
                  camera,
                  renderer,
                  controls: engineControls
                });
              } catch (initError) {
                console.error('User initialization callback failed:', initError);
                const wrappedError = initError instanceof Error ? initError : new Error('User initialization failed');
                setError(wrappedError);
                setRenderState(prev => ({ ...prev, isOptimizing: false, isInitializing: false }));
                
                // 发送错误事件
                eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
                  component: 'ThreeJSVisualization',
                  error: wrappedError,
                  context: 'user_initialization'
                });
                return;
              }
            }
          }

          // 初始化完成，更新状态 - 合并更新减少重渲染
          setIsSceneReady(true);
          setError(null);
          setRenderState(prev => ({ 
            ...prev, 
            isInitializing: false,
            isOptimizing: false, 
            optimizationLevel: 2,
            isRendering: true
          }));
        } catch (engineError) {
          console.error('Render engine initialization failed:', engineError);
          const wrappedError = engineError instanceof Error ? engineError : new Error('Render engine initialization failed');
          setError(wrappedError);
          setIsSceneReady(false);
          setRenderState(prev => ({ 
            ...prev, 
            isOptimizing: false, 
            isInitializing: false 
          }));
          
          // 发送错误事件
          eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
            component: 'ThreeJSVisualization',
            error: wrappedError,
            context: 'render_engine_initialization'
          });
        }
      };

      // 使用requestIdleCallback或降级到setTimeout
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(initRenderEngine, { timeout: 1000 });
      } else {
        setTimeout(initRenderEngine, 0);
      }

    } catch (err) {
      console.error('Three.js initialization error:', err);
      const initError = err instanceof Error ? err : new Error('Three.js initialization failed');
      setError(initError);
      setIsSceneReady(false);
      setRenderState(prev => ({ 
        ...prev, 
        isOptimizing: false, 
        isInitializing: false 
      }));
      
      // 发送错误事件
      eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
        component: 'ThreeJSVisualization',
        error: initError,
        context: 'initialization'
      });
    }
  }, [onInit, minWidth, minHeight, webglSupported, cameraConfig, controlsConfig, sceneConfig, performanceOptions, uiState.autoModeEnabled]);

  // 动画循环 - 优化性能，减少不必要的计算和状态更新
  const animate = useCallback(() => {
    if (paused || !renderEngineRef.current) {
      // 只在状态变化时更新，避免不必要的重渲染
      setRenderState(prev => 
        prev.isRendering || !prev.isPaused 
          ? { ...prev, isRendering: false, isPaused: true } 
          : prev
      );
      return;
    }

    // 只在状态变化时更新，避免不必要的重渲染
    setRenderState(prev => 
      !prev.isRendering || prev.isPaused 
        ? { ...prev, isRendering: true, isPaused: false } 
        : prev
    );
    
    const currentTime = performance.now();
    // 限制最大deltaTime为1/30秒，防止帧率骤降时的异常行为
    const deltaTime = Math.min(
      lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0,
      1/30
    );
    lastFrameTimeRef.current = currentTime;
    
    // 调用用户动画帧回调，增加错误捕获
    if (onAnimationFrame) {
      try {
        onAnimationFrame(deltaTime);
      } catch (animationError) {
        console.error('User animation callback failed:', animationError);
        // 发送错误事件
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSVisualization',
          error: animationError instanceof Error ? animationError : new Error('Animation callback failed'),
          context: 'animation'
        });
        // 继续动画循环，不因为用户回调错误而中断
      }
    }

    // 继续动画循环，确保requestAnimationFrame可用
    if (typeof requestAnimationFrame === 'function') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [paused, onAnimationFrame]);

  // 清理资源
  const cleanup = useCallback(() => {
    // 更新渲染状态
    setRenderState(prev => ({ 
      ...prev, 
      isRendering: false, 
      isPaused: true, 
      isOptimizing: false 
    }));
    
    // 取消动画帧
    if (animationFrameRef.current && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 重置帧时间，防止下次启动时出现异常大的deltaTime
    lastFrameTimeRef.current = 0;

    // 停止渲染引擎，增加更安全的调用方式
    if (renderEngineRef.current) {
      try {
        // 先停止渲染
        if (typeof renderEngineRef.current.stop === 'function') {
          renderEngineRef.current.stop();
        }
        
        // 再释放资源 - 使用可选链操作符和类型检查
        if (typeof renderEngineRef.current.dispose === 'function') {
          renderEngineRef.current.dispose();
        }
      } catch (disposeError) {
        console.error('Render engine dispose failed:', disposeError);
        // 发送错误事件
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSVisualization',
          error: disposeError instanceof Error ? disposeError : new Error('Render engine dispose failed'),
          context: 'cleanup'
        });
      }
      renderEngineRef.current = null;
    }

    // 重置状态，减少重渲染次数（合并状态更新）
    setError(null);
    setIsSceneReady(false);
    
    // 重置性能指标
    setPerformanceMetrics({
      fps: 60,
      renderTime: 0,
      frameTime: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0
    });
  }, []);

  // 调整大小处理函数 - 使用节流优化，减少频繁调整大小导致的性能问题
  const handleResize = useCallback(
    throttle(() => {
      if (!containerRef.current || !renderEngineRef.current) return;

      try {
        // 使用更精确的尺寸获取方式，考虑缩放因子
        const rect = containerRef.current.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        
        // 计算实际尺寸，确保不小于最小尺寸
        const width = Math.max(minWidth, Math.round(rect.width * pixelRatio));
        const height = Math.max(minHeight, Math.round(rect.height * pixelRatio));
        
        // 只有当尺寸真正改变时才更新状态，减少重渲染
        if (dimensions.width !== width || dimensions.height !== height) {
          setDimensions({ width, height });
        }

        // 调用渲染引擎的调整大小方法，增加类型安全检查
        if (typeof renderEngineRef.current.handleResize === 'function') {
          renderEngineRef.current.handleResize();
        }
      } catch (resizeError) {
        console.error('Resize handling failed:', resizeError);
        // 发送错误事件，确保错误对象类型安全
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSVisualization',
          error: resizeError instanceof Error ? resizeError : new Error('Resize handling failed'),
          context: 'resize'
        });
      }
    }, 100), // 每100ms最多执行一次，减少性能消耗
    [minWidth, minHeight, dimensions.width, dimensions.height]
  );

  // 组件挂载时初始化
  useEffect(() => {
    const isSupported = checkWebGLSupport();
    setWebglSupported(isSupported);

    if (isSupported) {
      initialize();

      // 添加窗口调整大小监听
      if (autoFit) {
        window.addEventListener('resize', handleResize);
      }

      // 开始动画循环
      if (!paused) {
        animate();
      }
    }

    // 组件卸载时清理资源
    return () => {
      if (autoFit) {
        window.removeEventListener('resize', handleResize);
      }
      cleanup();
    };
  }, [initialize, handleResize, cleanup, autoFit, paused, animate, checkWebGLSupport]);

  // 监听paused属性变化，更新渲染状态
  useEffect(() => {
    setRenderState(prev => ({ ...prev, isPaused: paused }));
  }, [paused]);

  // 暂停/恢复控制
  useEffect(() => {
    if (paused && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    } else if (!paused && isSceneReady && !animationFrameRef.current) {
      animate();
    }
  }, [paused, isSceneReady, animate]);

  // WebGL不支持时的优雅提示
  if (!webglSupported) {
    return (
      <motion.div
        className={cn('flex justify-center items-center w-full h-full text-white bg-gradient-to-br from-gray-900 to-gray-800', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8 max-w-md text-center rounded-lg border backdrop-blur-sm bg-black/50 border-red-500/30">
          <div className="mb-6 text-6xl">🖥️</div>
          <h3 className="mb-4 text-2xl font-bold text-red-400">WebGL 不支持</h3>
          <p className="mb-6 text-gray-300">您的浏览器不支持 WebGL，无法运行 3D 可视化。</p>
          <div className="text-sm text-gray-400">
            <p className="mb-2">推荐使用以下现代浏览器：</p>
            <div className="flex gap-4 justify-center">
              <span className="px-3 py-1 bg-gray-700 rounded-full">Chrome</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">Firefox</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">Edge</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // 错误提示 - 优雅的错误处理
  if (error) {
    return (
      <motion.div
        className={cn('flex justify-center items-center w-full h-full text-white bg-gradient-to-br from-gray-900 to-gray-800', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8 max-w-md text-center rounded-lg border backdrop-blur-sm bg-black/50 border-red-500/30">
          <div className="mb-6 text-6xl">⚠️</div>
          <h3 className="mb-4 text-2xl font-bold text-red-400">初始化错误</h3>
          <p className="mb-6 text-red-300 break-words">{error.message}</p>
          <div className="text-sm text-gray-400">
            <p className="mb-4">请检查控制台获取详细错误信息。</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 rounded-lg transition-colors duration-300 hover:bg-red-700"
            >
              刷新页面重试
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      role="region"
      className={cn(
        'overflow-hidden relative w-full h-full bg-gradient-to-br via-black from-gray-950 to-blue-950/20',
        className
      )}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div
        ref={containerRef}
        data-testid="threejs-container"
        className="absolute inset-0"
        style={{
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`
        }}
      />
      
      {/* 性能监控面板 - 增强版 */}
      {uiState.showPerformancePanel && (
        <motion.div
          className="absolute top-4 right-4 p-4 text-xs text-white rounded-xl border shadow-lg backdrop-blur-lg bg-black/85 border-blue-500/30 shadow-blue-500/15"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(59, 130, 246, 0.2)" }}
        >
          {/* 面板标题和控制 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <motion.span 
                className="text-blue-400"
                animate={{ rotate: [0, 5, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                📊
              </motion.span>
              <h4 className="font-semibold text-transparent text-blue-300 bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">性能监控</h4>
            </div>
            <motion.button
              onClick={() => setUiState(prev => ({ ...prev, showPerformancePanel: false }))}
              className="p-1 text-gray-400 rounded-full transition-colors hover:text-white hover:bg-blue-500/20"
              aria-label="关闭性能面板"
              whileHover={{ scale: 1.2, rotate: 90, color: '#60a5fa' }}
              whileTap={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              ✕
            </motion.button>
          </div>
          
          {/* 性能指标网格 - 增强版 */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-3">
            {/* FPS指标 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">帧率</span>
              <div className="flex gap-1 items-baseline">
                <motion.span 
                  className={`font-mono text-lg ${performanceMetrics.fps < 30 ? 'text-red-400' : performanceMetrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}
                  animate={{ scale: performanceMetrics.fps < 30 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: performanceMetrics.fps < 30 ? Infinity : 0 }}
                >
                  {performanceMetrics.fps}
                </motion.span>
                <span className="text-gray-500">FPS</span>
              </div>
            </motion.div>
            
            {/* 优化级别 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">优化级别</span>
              <span className="font-mono text-lg text-purple-400">{renderState.optimizationLevel}</span>
            </motion.div>
            
            {/* 渲染时间 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">渲染时间</span>
              <div className="flex gap-1 items-baseline">
                <span className="font-mono text-lg text-cyan-400">{performanceMetrics.renderTime}</span>
                <span className="text-gray-500">ms</span>
              </div>
            </motion.div>
            
            {/* 内存使用 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">内存使用</span>
              <div className="flex gap-1 items-baseline">
                <span className="font-mono text-lg text-orange-400">{performanceMetrics.memoryUsage.toFixed(0)}</span>
                <span className="text-gray-500">MB</span>
              </div>
            </motion.div>
            
            {/* 绘制调用 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">绘制调用</span>
              <span className="font-mono text-lg text-green-400">{performanceMetrics.drawCalls}</span>
            </motion.div>
            
            {/* 三角形数量 */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">三角形</span>
              <span className="font-mono text-lg text-yellow-400">{performanceMetrics.triangles.toLocaleString()}</span>
            </motion.div>
          </div>
          
          {/* 渲染状态标签 - 增强版 */}
          <div className="flex flex-wrap gap-2 pt-3 mt-4 border-t border-blue-500/20">
            <motion.span 
              className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isRendering ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}
              whileHover={{ scale: 1.1 }}
            >
              {renderState.isRendering ? '🟢 渲染中' : '⏸️ 已暂停'}
            </motion.span>
            <motion.span 
              className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isOptimizing ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-500/30 text-gray-300'}`}
              whileHover={{ scale: 1.1 }}
            >
              {renderState.isOptimizing ? '🔮 优化中' : '✅ 已优化'}
            </motion.span>
            <motion.span 
              className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isInitializing ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-500/30 text-gray-300'}`}
              whileHover={{ scale: 1.1 }}
            >
              {renderState.isInitializing ? '🔄 初始化' : '✅ 就绪'}
            </motion.span>
          </div>
          
          {/* 性能优化提示 */}
          {renderState.optimizationLevel > 3 && (
            <motion.div 
              className="pt-3 mt-3 text-xs italic border-t border-blue-500/20 text-blue-300/80"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              💡 当前已启用高级优化，可获得最佳性能体验
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* 加载指示器 - 增强版 */}
      {!isSceneReady && renderState.isInitializing && (
        <motion.div
          className="flex absolute inset-0 justify-center items-center backdrop-blur-md bg-black/80"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="p-8 text-center rounded-2xl border shadow-2xl backdrop-blur-lg bg-black/50 border-blue-500/30 shadow-blue-500/15">
            <motion.div
              className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
              }}
            />
            <motion.h3 
              className="mb-2 text-xl font-semibold text-transparent text-white bg-clip-text bg-gradient-to-r from-blue-300 to-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              正在初始化 3D 场景
            </motion.h3>
            <motion.p 
              className="mb-6 text-sm text-blue-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              加载渲染引擎和资源...
            </motion.p>
            
            {/* 初始化进度条 - 增强版 */}
            <motion.div 
              className="overflow-hidden w-64 h-2 bg-gray-700 rounded-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: ['0%', '30%', '55%', '75%', '90%', '75%'] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)"
                }}
              />
            </motion.div>
            
            {/* 初始化步骤指示器 */}
            <motion.div 
              className="flex gap-2 mt-6 text-xs text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <span className="px-2 py-1 text-blue-300 rounded-full bg-blue-500/20">引擎初始化</span>
              <span className="px-2 py-1 rounded-full bg-gray-500/20">资源加载</span>
              <span className="px-2 py-1 rounded-full bg-gray-500/20">场景构建</span>
              <span className="px-2 py-1 rounded-full bg-gray-500/20">渲染准备</span>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* UI控制面板 - 可折叠 */}
      <motion.div
        className="absolute top-4 left-4 p-3 text-xs text-white rounded-xl border shadow-lg backdrop-blur-md bg-black/80 border-blue-500/30 shadow-blue-500/10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-col gap-2">
          {/* 性能设置 */}
          <div className="flex justify-between items-center">
            <span className="text-blue-300">⚡ 自动优化</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={uiState.autoModeEnabled} 
                onChange={(e) => setUiState(prev => ({ ...prev, autoModeEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* 性能面板开关 */}
          <div className="flex justify-between items-center">
            <span className="text-blue-300">📊 性能面板</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={uiState.showPerformancePanel} 
                onChange={(e) => setUiState(prev => ({ ...prev, showPerformancePanel: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ThreeJSVisualization;