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

  // 检查WebGL支持
  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }, []);

  // 初始化Three.js场景
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

      // 初始化渲染引擎
      const cameraPosition = cameraConfig.position 
        ? new THREE.Vector3(cameraConfig.position.x, cameraConfig.position.y, cameraConfig.position.z)
        : undefined;

      // 防御性检查：确保RenderEngine存在
      if (typeof RenderEngine !== 'function') {
        throw new Error('RenderEngine is not available');
      }

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

      // 应用场景配置
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

      // 配置自动性能优化
      try {
        automatedPerformanceOptimizer.updateConfig({
          mode: uiState.autoModeEnabled ? 'auto' : 'off',
          targetFPS: 60,
          enableAIOptimization: true,
          optimizationInterval: 1000
        });
        
        // 监听性能指标更新事件
        eventSystem.on(APP_EVENTS.PERFORMANCE_METRICS_UPDATED, (metrics) => {
          setPerformanceMetrics(prev => ({
            ...prev,
            fps: metrics.fps ?? prev.fps,
            renderTime: metrics.renderTime ?? prev.renderTime,
            frameTime: metrics.frameTime ?? prev.frameTime,
            memoryUsage: metrics.memoryUsageMB ?? prev.memoryUsage,
            drawCalls: metrics.drawCalls ?? prev.drawCalls,
            triangles: metrics.triangles ?? prev.triangles,
            vertices: metrics.vertices ?? prev.vertices
          }));
          
          setRenderState(prev => ({
            ...prev,
            optimizationLevel: metrics.optimizationLevel ?? prev.optimizationLevel
          }));
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

      // 初始化完成，更新状态
      setIsSceneReady(true);
      setError(null);
      setRenderState(prev => ({ 
        ...prev, 
        isInitializing: false,
        isOptimizing: false, 
        optimizationLevel: 2,
        isRendering: true
      }));
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

  // 动画循环
  const animate = useCallback(() => {
    if (paused || !renderEngineRef.current) {
      setRenderState(prev => ({ ...prev, isRendering: false, isPaused: true }));
      return;
    }

    setRenderState(prev => ({ ...prev, isRendering: true, isPaused: false }));
    
    const currentTime = performance.now();
    const deltaTime = lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0;
    lastFrameTimeRef.current = currentTime;
    
    // 计算FPS，确保deltaTime有效
    const fps = deltaTime > 0 && deltaTime < 1 ? 1 / deltaTime : 60;
    setCurrentFPS(Math.round(fps));

    // 调用用户动画帧回调，增加错误捕获
    if (onAnimationFrame) {
      try {
        onAnimationFrame(deltaTime);
      } catch (animationError) {
        console.error('User animation callback failed:', animationError);
        // 发送错误事件
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSVisualization',
          error: animationError,
          context: 'animation'
        });
        // 继续动画循环，不因为用户回调错误而中断
      }
    }

    // 更新渲染器性能指标
    const renderer = renderEngineRef.current.getRenderer();
    if (renderer && renderer.info) {
      const info = renderer.info;
      setPerformanceMetrics(prev => ({
        ...prev,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        vertices: info.render.vertices
      }));
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

    // 移除事件监听器
    eventSystem.off(APP_EVENTS.PERFORMANCE_METRICS_UPDATED);

    // 停止渲染引擎，增加更安全的调用方式
    if (renderEngineRef.current) {
      try {
        // 先停止渲染
        if (typeof renderEngineRef.current.stop === 'function') {
          renderEngineRef.current.stop();
        }
        
        // 再释放资源
        if (typeof renderEngineRef.current.dispose === 'function') {
          renderEngineRef.current.dispose();
        }
      } catch (disposeError) {
        console.error('Render engine dispose failed:', disposeError);
        // 发送错误事件
        eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
          component: 'ThreeJSVisualization',
          error: disposeError,
          context: 'cleanup'
        });
      }
      renderEngineRef.current = null;
    }

    setIsSceneReady(false);
    setError(null);
    
    // 重置性能指标
    setPerformanceMetrics({
      renderTime: 0,
      frameTime: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0
    });
  }, []);

  // 调整大小处理函数
  const handleResize = useCallback(() => {
    if (!containerRef.current || !renderEngineRef.current) return;

    try {
      const width = Math.max(minWidth, containerRef.current.clientWidth || 0);
      const height = Math.max(minHeight, containerRef.current.clientHeight || 0);
      setDimensions({ width, height });

      if (typeof renderEngineRef.current.handleResize === 'function') {
        renderEngineRef.current.handleResize();
      }
    } catch (resizeError) {
      console.error('Resize handling failed:', resizeError);
      // 发送错误事件
      eventSystem.emit(APP_EVENTS.ERROR_OCCURRED, {
        component: 'ThreeJSVisualization',
        error: resizeError,
        context: 'resize'
      });
    }
  }, [minWidth, minHeight]);

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

  // WebGL不支持时的提示
  if (!webglSupported) {
    return (
      <div className={cn('flex justify-center items-center w-full h-full text-white bg-gray-900', className)}>
        <div className="p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold">WebGL 不支持</h3>
          <p className="text-gray-300">您的浏览器不支持 WebGL，无法运行 3D 可视化。请使用现代浏览器如 Chrome、Firefox 或 Edge。</p>
        </div>
      </div>
    );
  }

  // 错误提示
  if (error) {
    return (
      <div className={cn('flex justify-center items-center w-full h-full text-white bg-gray-900', className)}>
        <div className="p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold">初始化错误</h3>
          <p className="mb-4 text-red-400">{error.message}</p>
          <p className="text-gray-300">请检查控制台获取详细错误信息。</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      role="region"
      className={cn(
        'overflow-hidden relative w-full h-full bg-black',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
      {autoModeEnabled && (
        <div className="absolute top-4 right-4 p-3 text-xs text-white bg-black bg-opacity-80 rounded-lg border backdrop-blur-sm border-blue-500/30">
          <div className="mb-2 font-semibold text-blue-400">📊 性能监控</div>
          <div className="grid grid-cols-2 gap-y-1 gap-x-3">
            <div>FPS: <span className={currentFPS < 30 ? 'text-red-400' : currentFPS < 50 ? 'text-yellow-400' : 'text-green-400'}>{currentFPS}</span></div>
            <div>优化级别: <span className="text-purple-400">{renderState.optimizationLevel}</span></div>
            <div>渲染时间: <span className="text-cyan-400">{performanceMetrics.renderTime.toFixed(1)}ms</span></div>
            <div>内存使用: <span className="text-orange-400">{performanceMetrics.memoryUsage.toFixed(0)}MB</span></div>
            <div>绘制调用: <span className="text-green-400">{performanceMetrics.drawCalls}</span></div>
            <div>三角形: <span className="text-yellow-400">{performanceMetrics.triangles}</span></div>
          </div>
          <div className="mt-2 text-xs">
            <span className={`mr-2 px-1.5 py-0.5 rounded-full ${renderState.isRendering ? 'bg-green-500/50 text-green-300' : 'bg-gray-500/50 text-gray-300'}`}>
              {renderState.isRendering ? '渲染中' : '已暂停'}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full ${renderState.isOptimizing ? 'bg-purple-500/50 text-purple-300' : 'bg-gray-500/50 text-gray-300'}`}>
              {renderState.isOptimizing ? '优化中' : '已优化'}
            </span>
          </div>
        </div>
      )}
      
      {/* 加载指示器 */}
      {!isSceneReady && (
        <div className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-50">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
});

export default ThreeJSVisualization;