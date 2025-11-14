import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion } from 'framer-motion';
import { useThreeScene } from '../hooks/useThreeScene';
import { visualizationService, createGridHelper, createAxesHelper } from '../services/visualizationService';
import { cn } from '../utils';
import { VISUALIZATION_CONFIG } from '../constants';
import { 
  performanceOptimizationManager 
} from '../utils/performanceOptimizationManager';
import { 
  devicePerformanceAnalyzer 
} from '../utils/devicePerformanceAnalyzer';
import { 
  performanceDataCollector 
} from '../utils/performanceDataCollector';
import { 
  sceneComplexityAnalyzer 
} from '../utils/sceneComplexityAnalyzer';

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
    fog?: {
      type: 'linear' | 'exponential';
      near?: number;
      far?: number;
      color?: number | string;
      density?: number;
    };
  };
  
  // 自动适应容器大小
  autoFit?: boolean;
  
  // 暂停/恢复控制
  paused?: boolean;
  
  // 最小尺寸
  minWidth?: number;
  minHeight?: number;
}

const ThreeJSVisualization: React.FC<ThreeJSVisualizationProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState<Error | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  
  // 使用useThreeScene返回的实例引用
  const { 
    scene, 
    camera, 
    renderer, 
    controls, 
    isSceneReady, 
    error: sceneError,
    currentFPS, 
    isPerformanceMode,
    performanceMonitor,
    renderOptimizer,
    particleOptimizer,
    createScene, 
    getScene, 
    addToScene,
    removeFromScene,
    clearScene, 
    setUpdateFunction,
    updateScene
  } = useThreeScene({ 
    containerRef,
    autoUpdate: true,
    enablePerformanceMonitoring: true,
    maxObjects: VISUALIZATION_CONFIG.maxObjects || 1000
  });
  
  // 性能面板状态
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  
  // 动画帧引用和时间跟踪
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

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

  // 使用useMemo缓存配置对象，避免每次渲染创建新引用
  const memoizedCameraConfig = useMemo(() => cameraConfig, Object.values(cameraConfig || {}));
  const memoizedControlsConfig = useMemo(() => controlsConfig, Object.values(controlsConfig || {}));
  const memoizedRendererConfig = useMemo(() => rendererConfig, Object.values(rendererConfig || {}));
  const memoizedSceneConfig = useMemo(() => sceneConfig, Object.values(sceneConfig || {}));

  // 初始化Three.js场景和性能优化系统
  const initialize = useCallback(() => {
    if (!containerRef.current || !webglSupported) return;

    try {
      const width = Math.max(minWidth, containerRef.current.clientWidth);
      const height = Math.max(minHeight, containerRef.current.clientHeight);
      setDimensions({ width, height });

      // 使用useThreeScene中的场景，避免重复创建
      const currentScene = getScene() || createScene();
      
      // 应用场景配置到现有的场景
      if (memoizedSceneConfig.backgroundColor && currentScene) {
        currentScene.background = new THREE.Color(memoizedSceneConfig.backgroundColor);
      }

      // 应用自定义配置到控制器
      if (controls) {
        const { 
          enableDamping = true, 
          dampingFactor = 0.05, 
          rotateSpeed = 0.5, 
          zoomSpeed = 0.8,
          enablePan = true,
          autoRotate = false,
          autoRotateSpeed = 2.0
        } = memoizedControlsConfig;
        
        controls.enableDamping = enableDamping;
        controls.dampingFactor = dampingFactor;
        controls.rotateSpeed = rotateSpeed;
        controls.zoomSpeed = zoomSpeed;
        controls.enablePan = enablePan;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = autoRotateSpeed;
      }

      // 初始化性能优化系统
      initializePerformanceSystem(currentScene);

      // 调用用户初始化函数，添加错误处理
      if (onInit && currentScene && camera && renderer && controls) {
        try {
          onInit({ scene: currentScene, camera, renderer, controls });
        } catch (error) {
          console.error('Error in onInit callback:', error);
          setHasError(error instanceof Error ? error : new Error('Initialization callback failed'));
        }
      }

      setIsInitialized(true);
      setHasError(null);
    } catch (error) {
      console.error('Three.js initialization error:', error);
      setHasError(error instanceof Error ? error : new Error('Three.js initialization failed'));
    }
  }, [onInit, minWidth, minHeight, webglSupported, memoizedControlsConfig, memoizedSceneConfig, getScene, createScene, camera, renderer, controls]);
  
  // 初始化性能优化系统
  const initializePerformanceSystem = useCallback((currentScene: THREE.Scene) => {
    if (!performanceMonitor || !renderOptimizer || !particleOptimizer) return;
    
    // 初始化所有性能组件
    performanceDataCollector.setPerformanceMonitor(performanceMonitor);
    performanceDataCollector.setRenderOptimizer(renderOptimizer);
    performanceDataCollector.setParticleOptimizer(particleOptimizer);
    
    // 将性能工具传递给管理器
    performanceOptimizationManager.setPerformanceTools({
      performanceMonitor,
      renderOptimizer,
      particleOptimizer
    });
    
    // 设置场景复杂度分析器
    sceneComplexityAnalyzer.setScene(currentScene);
    sceneComplexityAnalyzer.setCamera(camera);
    
    // 启动自动性能检测
    devicePerformanceAnalyzer.detectPerformanceTier().then(tier => {
      console.log('检测到设备性能级别:', tier);
      // 根据设备性能自动选择合适的性能模式
      if (tier === 'low') {
        performanceOptimizationManager.setPerformanceMode('low');
      } else if (tier === 'medium') {
        performanceOptimizationManager.setPerformanceMode('medium');
      } else {
        performanceOptimizationManager.setPerformanceMode('high');
      }
    });
    
    // 订阅性能数据更新
    performanceMonitor.on('memoryUpdated', (memory: number) => {
      setCurrentMemory(memory);
    });
  }, [performanceMonitor, renderOptimizer, particleOptimizer, camera]);
  
  // 性能设置变更处理
  const handleSettingsChanged = useCallback((settings: Record<string, any>) => {
    console.log('性能设置已更新:', settings);
    setAutoModeEnabled(settings.autoMode || false);
    
    // 确保场景已初始化
    const currentScene = getScene();
    if (!currentScene) return;
    
    // 更新渲染器设置
    if (renderer && settings.pixelRatio !== undefined) {
      renderer.setPixelRatio(settings.pixelRatio === 'auto' ? window.devicePixelRatio : settings.pixelRatio);
    }
  }, [getScene, renderer]);
  
  // 一键优化
  const runOneClickOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // 运行性能测试
      const result = await devicePerformanceAnalyzer.runPerformanceTest();
      
      // 应用最佳设置
      devicePerformanceAnalyzer.applyOptimalSettings(performanceOptimizationManager);
      
      // 分析场景复杂度并调整
      const complexityAnalysis = sceneComplexityAnalyzer.analyzeScene();
      
      console.log('一键优化完成:', { result, complexityAnalysis });
    } catch (error) {
      console.error('一键优化失败:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  // 调整大小处理函数
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || !autoFit) return;

    try {
      const width = Math.max(minWidth, containerRef.current.clientWidth);
      const height = Math.max(minHeight, containerRef.current.clientHeight);
      setDimensions({ width, height });

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    } catch (error) {
      console.error('Resize error:', error);
    }
  }, [autoFit, minWidth, minHeight]);

  // 动画循环 - 优化版本
  const animate = useCallback(() => {
    if (paused) return;

    // 性能优化：只在可见区域内渲染
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0 && 
                       rect.left < window.innerWidth && rect.right >= 0;
      
      if (!isVisible) {
        // 元素不可见时，降低更新频率
        animationFrameRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, 500); // 每500ms检查一次
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
    
    // 计算时间差
    const currentTime = performance.now();
    const deltaTime = lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0;
    const frameTime = deltaTime * 1000; // 转换为毫秒
    lastFrameTimeRef.current = currentTime;

    // 更新控制器
    if (controls) {
      controls.update();
    }
    
    // 应用性能优化
    if (autoModeEnabled && performanceOptimizationManager.isAutoModeEnabled()) {
      // 使用性能优化管理器进行自动优化
      performanceOptimizationManager.update();
      
      // 分析场景复杂度
      const complexity = sceneComplexityAnalyzer.analyzeScene();
      
      // 如果场景复杂度过高，应用额外优化
      if (complexity.level === 'high' || complexity.level === 'very_high') {
        performanceOptimizationManager.applyComplexityOptimization(complexity);
      }
    }

    // 调用用户动画帧回调
    if (onAnimationFrame) {
      try {
        onAnimationFrame(deltaTime);
      } catch (error) {
        console.error('Animation frame callback error:', error);
      }
    }

    // 使用服务更新场景
    const currentScene = getScene();
    if (currentScene) {
      updateScene(currentScene, deltaTime);
    }
    
    // 收集性能数据
    performanceDataCollector.recordFrameData({
      fps: currentFPS || 0,
      frameTime,
      memory: currentMemory,
      drawCalls: renderOptimizer?.getDrawCalls() || 0,
      sceneComplexity: sceneComplexityAnalyzer.getCurrentComplexity()
    });

    // 渲染场景 - 使用useThreeScene提供的实例
    if (renderer && currentScene && camera) {
      try {
        // 帧跳过逻辑
        if (renderOptimizer?.shouldSkipFrame()) {
          return;
        }
        
        renderer.render(currentScene, camera);
      } catch (error) {
        console.error('Render error:', error);
        setHasError(error instanceof Error ? error : new Error('Rendering failed'));
        // 停止动画循环以防止错误持续发生
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    }
  }, [paused, onAnimationFrame, getScene, updateScene, controls, renderer, camera, currentFPS, currentMemory, autoModeEnabled, renderOptimizer]);

  // 清理Three.js资源和性能优化系统
  const cleanup = useCallback(() => {
    // 取消动画帧
    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current);
      } else {
        clearTimeout(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    }
    
    // 重置时间引用
    lastFrameTimeRef.current = 0;
    
    // 停止性能监控和收集
    performanceDataCollector.stopCollection();
    sceneComplexityAnalyzer.stopAnalysis();
    
    // 清理场景资源 - useThreeScene已经处理了控制器、渲染器和相机的清理
    clearScene();
    
    setIsInitialized(false);
  }, [clearScene]);

  // 组件挂载时初始化
  useEffect(() => {
    const isSupported = checkWebGLSupport();
    setWebglSupported(isSupported);
    
    // 设置用户更新函数到场景
    if (onAnimationFrame) {
      setUpdateFunction(onAnimationFrame);
    }
    
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
      
      // 开始性能数据收集
      performanceDataCollector.startCollection();
    }
    
    // 组件卸载时清理资源
    return () => {
      if (autoFit) {
        window.removeEventListener('resize', handleResize);
      }
      cleanup();
    };
  }, [initialize, handleResize, animate, autoFit, paused, checkWebGLSupport, cleanup, onAnimationFrame, setUpdateFunction]);

  // 当暂停状态改变时重新开始/停止动画循环
  useEffect(() => {
    if (isInitialized && !paused && !animationFrameRef.current) {
      lastFrameTimeRef.current = 0;
      animate();
    }
  }, [isInitialized, paused, animate]);
  
  // 监听场景错误
  useEffect(() => {
    if (sceneError) {
      setHasError(sceneError);
    }
  }, [sceneError]);

  // 渲染用户内容
  useEffect(() => {
    if (isInitialized && children && scene && camera && renderer && controls) {
      try {
        children({
          scene,
          camera,
          renderer,
          controls
        });
      } catch (error) {
        console.error('Children render error:', error);
        setHasError(error instanceof Error ? error : new Error('Children rendering failed'));
      }
    }
  }, [isInitialized, children, scene, camera, renderer, controls]);

  // 错误渲染
  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex overflow-hidden relative flex-col justify-center items-center w-full rounded-lg border bg-red-900/10 border-red-500/30',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <h3 className="mb-2 font-medium text-red-400">Three.js 渲染错误</h3>
        <p className="px-4 text-sm text-center text-red-300/80">{hasError.message}</p>
        <button 
          onClick={initialize}
          className="px-4 py-2 mt-4 text-red-300 rounded-md border transition-colors bg-red-600/20 border-red-500/50 hover:bg-red-600/30"
        >
          重试初始化
        </button>
      </div>
    );
  }

  // WebGL不支持
  if (!webglSupported) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex overflow-hidden relative flex-col justify-center items-center w-full rounded-lg border bg-blue-900/10 border-blue-500/30',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <h3 className="mb-2 font-medium text-blue-400">浏览器不支持 WebGL</h3>
        <p className="px-4 text-sm text-center text-blue-300/80">
          您的浏览器不支持WebGL，无法显示3D可视化内容。请尝试更新浏览器或使用支持WebGL的现代浏览器。
        </p>
      </div>
    );
  }

  // 加载状态
  if (!isInitialized) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex overflow-hidden relative justify-center items-center w-full bg-gray-900/50',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="flex flex-col items-center">
          <div className="mb-3 w-10 h-10 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
          <p className="text-sm text-blue-300">初始化3D场景...</p>
        </div>
      </div>
    );
  }

  // 正常渲染
  return (
    <div className="relative">
      <motion.div
        ref={containerRef}
        className={cn(
          'overflow-hidden relative w-full',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          minHeight: `${minHeight}px`,
          width: minWidth > 0 ? `${minWidth}px` : '100%'
        }}
      />
      
      {/* FPS 指示器 */}
      <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded backdrop-blur-sm">
        {currentFPS?.toFixed(1) || '--'} FPS
      </div>
      
      {/* 内存使用指示器 */}
      <div className="absolute top-2 left-20 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded backdrop-blur-sm">
        {currentMemory?.toFixed(0) || '--'} MB
      </div>
      
      {/* 性能控制面板按钮 */}
      <button
        onClick={() => setShowPerformancePanel(true)}
        className="absolute top-2 right-2 px-3 py-1 text-xs font-medium text-white bg-indigo-600/80 hover:bg-indigo-700/90 rounded transition-colors backdrop-blur-sm"
      >
        性能优化
      </button>
      
      {/* 一键优化按钮 */}
      <button
        onClick={runOneClickOptimization}
        disabled={isOptimizing}
        className={`absolute top-2 right-24 px-3 py-1 text-xs font-medium rounded transition-colors backdrop-blur-sm ${isOptimizing ? 'bg-gray-600/80 text-gray-300 cursor-not-allowed' : 'bg-emerald-600/80 text-white hover:bg-emerald-700/90'}`}
      >
        {isOptimizing ? '优化中...' : '一键优化'}
      </button>
      
      {/* 高级性能控制面板 */}
      {showPerformancePanel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPerformancePanel(false)}
        >
          <div 
            className="relative w-full max-w-md mx-4 bg-gray-900 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AdvancedPerformancePanel
              onClose={() => setShowPerformancePanel(false)}
              onSettingsChanged={handleSettingsChanged}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 重新导出VisualizationService中的方法，保持向后兼容性
export { 
  createGridHelper, 
  createAxesHelper
} from '../services/visualizationService';

export default ThreeJSVisualization;
