import { useRef, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VISUALIZATION_CONFIG } from '../constants';
import { performanceMonitor, renderOptimizer } from '../performance/performanceUtils';
import { RenderEngine } from '../rendering/RenderEngine';

interface UseThreeSceneOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  cameraPosition?: THREE.Vector3;
  enableControls?: boolean;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  autoUpdate?: boolean;
  enablePerformanceMonitoring?: boolean;
  maxObjects?: number;
  performanceThreshold?: number; // FPS阈值，低于此值将启用性能模式
  useBatchRendering?: boolean; // 是否使用批处理渲染
  enableFog?: boolean; // 是否启用雾化效果以提高性能
  dynamicPixelRatio?: boolean; // 是否动态调整像素比例
}

interface ThreeSceneReturn {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  isSceneReady: boolean;
  error: Error | null;
  currentFPS: number;
  isPerformanceMode: boolean;
  createScene: () => THREE.Scene;
  getScene: () => THREE.Scene | null;
  addToScene: (object: THREE.Object3D) => boolean;
  removeFromScene: (object: THREE.Object3D) => boolean;
  clearScene: () => void;
  setUpdateFunction: (updateFn: (deltaTime: number) => void) => void;
  updateScene: (scene: THREE.Scene | null, deltaTime: number) => void;
}

export const useThreeScene = (options: UseThreeSceneOptions): ThreeSceneReturn => {
  const { 
    containerRef,
    cameraPosition = new THREE.Vector3(10, 10, 10),
    enableControls = true,
    ambientLightIntensity = 0.6,
    directionalLightIntensity = 0.8,
    autoUpdate = true,
    enablePerformanceMonitoring = true,
    maxObjects = 1000,
    performanceThreshold = 30, // FPS阈值，低于此值将启用性能模式
    useBatchRendering = true, // 是否使用批处理渲染
    enableFog = true, // 是否启用雾化效果以提高性能
    dynamicPixelRatio = true // 是否动态调整像素比例
  } = options;
  
  const renderEngineRef = useRef<RenderEngine | null>(null);
  const frameIndexRef = useRef<number>(0);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFPS, setCurrentFPS] = useState<number>(60);
  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(false);
  
  // 状态变量
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  // 创建新场景 - 保留兼容性
  const createScene = useCallback(() => {
    try {
      if (!renderEngineRef.current) {
        throw new Error('Render engine not initialized');
      }
      return renderEngineRef.current.getScene();
    } catch (err) {
      console.error('Failed to create scene:', err);
      setError(err instanceof Error ? err : new Error('Unknown scene creation error'));
      return new THREE.Scene();
    }
  }, []);
  
  // 初始化完整场景（包含相机、渲染器等）
  const initializeFullScene = useCallback(() => {
    try {
      if (!containerRef.current) {
        throw new Error('Container element is null');
      }

      // 初始化渲染引擎
      const renderEngine = new RenderEngine({
        container: containerRef.current,
        cameraPosition,
        enableControls,
        ambientLightIntensity,
        directionalLightIntensity,
        autoUpdate
      });

      renderEngineRef.current = renderEngine;

      // 更新状态变量
      setScene(renderEngine.getScene());
      setCamera(renderEngine.getCamera());
      setRenderer(renderEngine.getRenderer());
      setControls(renderEngine.getControls());
      setIsSceneReady(true);
      setError(null);

      return true;
    } catch (err) {
      console.error('Failed to initialize full scene:', err);
      setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      setIsSceneReady(false);
      return false;
    }
  }, [containerRef, cameraPosition, enableControls, ambientLightIntensity, directionalLightIntensity, autoUpdate]);
  
  // 应用性能模式设置的函数
  const applyPerformanceModeSettings = useCallback((performanceMode: boolean) => {
    if (!renderEngineRef.current) return;
    
    // 使用新的渲染引擎的性能模式设置
    renderEngineRef.current.applyPerformanceMode(performanceMode);
  }, []);
  
  // 高度优化的动画循环
  const animate = useCallback(() => {
    // 确保渲染引擎已准备就绪
    if (!isSceneReady || !renderEngineRef.current) {
      // 条件不满足时，延迟重试，避免高频率检查
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 100);
      return;
    }

    const now = performance.now();

    // 性能监控和优化 - 只在必要时执行
    if (enablePerformanceMonitoring) {
      // 大幅降低性能监控更新频率，每60帧更新一次
      if (frameIndexRef.current % 60 === 0) {
        const fps = performanceMonitor.updateFPS();
        // 仅当FPS变化超过阈值时才更新状态
        if (Math.abs(fps - currentFPS) > 2) {
          setCurrentFPS(fps);
        }
        
        // 更新性能模式状态
        const performanceMode = performanceMonitor.getPerformanceMode();
        if (performanceMode !== isPerformanceMode) {
          setIsPerformanceMode(performanceMode);
          applyPerformanceModeSettings(performanceMode);
        }
      }
    }

    // 继续动画循环
    requestAnimationFrame(animate);
  }, [isSceneReady, currentFPS, isPerformanceMode, enablePerformanceMonitoring, applyPerformanceModeSettings]);
  
  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    if (!renderEngineRef.current) return;
    
    renderEngineRef.current.handleResize();
    
    // 更新状态变量
    setScene(renderEngineRef.current.getScene());
    setCamera(renderEngineRef.current.getCamera());
    setRenderer(renderEngineRef.current.getRenderer());
  }, []);

  // 获取当前场景
  const getScene = useCallback((): THREE.Scene | null => {
    return renderEngineRef.current ? renderEngineRef.current.getScene() : null;
  }, []);

  // 添加对象到场景 - 优化版本
  const addToScene = useCallback((object: THREE.Object3D) => {
    if (!renderEngineRef.current) return false;
    
    try {
      renderEngineRef.current.addObject(object);
      return true;
    } catch (error) {
      console.error('Error adding object to scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to add object'));
      return false;
    }
  }, []);

  // 从场景中移除对象 - 优化版本
  const removeFromScene = useCallback((object: THREE.Object3D) => {
    if (!renderEngineRef.current) return false;
    
    try {
      renderEngineRef.current.removeObject(object);
      return true;
    } catch (error) {
      console.error('Error removing object from scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to remove object'));
      return false;
    }
  }, []);

  // 清理场景 - 使用新的渲染引擎
  const clearScene = useCallback(() => {
    if (!renderEngineRef.current) return;
    
    try {
      renderEngineRef.current.clearScene();
      
      // 更新状态变量
      setScene(renderEngineRef.current.getScene());
    } catch (error) {
      console.error('Error clearing scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to clear scene'));
    }
  }, []);
  
  // 生命周期管理
  useEffect(() => {
    // 初始化完整场景
    const success = initializeFullScene();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理函数 - 增强版本
    return () => {
      // 清理渲染引擎
      if (renderEngineRef.current) {
        renderEngineRef.current.dispose();
        renderEngineRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);

      // 重置时间引用
      frameIndexRef.current = 0;
      
      // 重置状态
      setIsSceneReady(false);
      setError(null);
      setCurrentFPS(60);
      setIsPerformanceMode(false);
      setScene(null);
      setCamera(null);
      setRenderer(null);
      setControls(null);
    };
  }, [initializeFullScene, handleResize, clearScene, containerRef, enablePerformanceMonitoring]);

  // 监听isSceneReady状态变化，开始动画循环
  useEffect(() => {
    // 开始动画循环
    if (isSceneReady && renderEngineRef.current) {
      // 初始化性能监控
      if (enablePerformanceMonitoring) {
        // 重置性能监控器
        performanceMonitor.updateFPS();
      }
      
      // 启动渲染引擎
      renderEngineRef.current.start();
      
      // 使用优化的animate函数进行性能监控
      animate();
    }
  }, [isSceneReady, animate, enablePerformanceMonitoring]);

  // 设置场景更新函数
  const setUpdateFunction = useCallback((updateFn: (deltaTime: number) => void) => {
    if (renderEngineRef.current) {
      renderEngineRef.current.setUpdateFunction(updateFn);
    }
  }, []);

  // 执行场景更新 - 使用新的渲染引擎
  const updateScene = useCallback((scene: THREE.Scene | null, deltaTime: number) => {
    // 新的渲染引擎已经内置了场景更新逻辑
    // 这个方法主要用于向后兼容
    if (renderEngineRef.current) {
      const currentScene = renderEngineRef.current.getScene();
      if (currentScene.userData && typeof currentScene.userData.update === 'function') {
        currentScene.userData.update(deltaTime);
      }
    }
  }, []);

  return {
    scene,
    camera,
    renderer,
    controls,
    isSceneReady,
    error,
    currentFPS,
    isPerformanceMode,
    createScene,
    getScene,
    addToScene,
    removeFromScene,
    clearScene,
    setUpdateFunction,
    updateScene
  };
};