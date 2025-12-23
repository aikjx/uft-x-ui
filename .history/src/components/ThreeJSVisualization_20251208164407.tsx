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
  
  // 状态管理
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFPS, setCurrentFPS] = useState(60);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [webglSupported, setWebglSupported] = useState(true);
  
  // 性能设置状态
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);

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
      const width = Math.max(minWidth, containerRef.current.clientWidth || 0);
      const height = Math.max(minHeight, containerRef.current.clientHeight || 0);
      setDimensions({ width, height });

      // 初始化渲染引擎
      const cameraPosition = cameraConfig.position 
        ? new THREE.Vector3(cameraConfig.position.x, cameraConfig.position.y, cameraConfig.position.z)
        : undefined;

      // 防御性检查：确保RenderEngine存在
      if (typeof RenderEngine !== 'function') {
        throw new Error('RenderEngine is not available');
      }

      const renderEngine = new RenderEngine({
        container: containerRef.current,
        cameraPosition,
        enableControls: true,
        autoUpdate: true
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

      // 启动自动性能优化
      try {
        automatedPerformanceOptimizer.updateConfig({
          mode: 'auto',
          targetFPS: 60,
          enableAIOptimization: true,
          optimizationInterval: 1000
        });
      } catch (perfError) {
        console.warn('Performance optimizer initialization failed:', perfError);
      }

      // 调用用户初始化函数
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
            console.error('User initialization failed:', initError);
            setError(initError instanceof Error ? initError : new Error('User initialization failed'));
            return;
          }
        }
      }

      setIsSceneReady(true);
      setError(null);
    } catch (err) {
      console.error('Three.js initialization error:', err);
      setError(err instanceof Error ? err : new Error('Three.js initialization failed'));
      setIsSceneReady(false);
    }
  }, [onInit, minWidth, minHeight, webglSupported, cameraConfig, controlsConfig, sceneConfig]);

  // 动画循环
  const animate = useCallback(() => {
    if (paused || !renderEngineRef.current) return;

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
        if (typeof renderEngineRef.current.dispose === 'function') {
          renderEngineRef.current.dispose();
        }
      } catch (disposeError) {
        console.error('Render engine dispose failed:', disposeError);
      }
      renderEngineRef.current = null;
    }

    setIsSceneReady(false);
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
      
      {/* 性能监控面板 */}
      {autoModeEnabled && (
        <div className="absolute top-4 right-4 p-2 text-xs text-white bg-black bg-opacity-70 rounded">
          <div>FPS: {currentFPS}</div>
          <div>性能模式: 自动</div>
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