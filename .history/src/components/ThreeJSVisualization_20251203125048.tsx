import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { motion } from 'framer-motion';
import { useThreeScene } from '../hooks/useThreeScene';
import { visualizationService } from '../services/visualizationService';
import { cn } from '../utils';
import { VISUALIZATION_CONFIG } from '../constants';
import {
  performanceOptimizationManager
} from '../performance/performanceOptimizationManager';
import {
  devicePerformanceAnalyzer
} from '../performance/devicePerformanceAnalyzer';
import {
  performanceDataCollector
} from '../performance/performanceDataCollector';
import {
  sceneComplexityAnalyzer
} from '../performance/sceneComplexityAnalyzer';

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
    enablePerformanceMonitoring: performanceOptions.usePerformanceMonitoring ?? true,
    maxObjects: performanceOptions.maxObjects ?? 1000,
    useBatchRendering: performanceOptions.enableBatchRendering ?? true,
    dynamicPixelRatio: performanceOptions.dynamicPixelRatio ?? true
  });

  // 性能面板状态
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);

  // 动画帧引用和时间跟踪
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // 详细的性能监控
  const performanceStatsRef = useRef({
    totalFrameTime: 0,
    controllerUpdateTime: 0,
    userCallbackTime: 0,
    sceneUpdateTime: 0,
    renderTime: 0,
    frameCount: 0,
    fpsHistory: [] as number[],
    memoryHistory: [] as number[],
    drawCallsHistory: [] as number[],
    triangleCountHistory: [] as number[],
    objectCountHistory: [] as number[]
  });

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // 初始化性能优化系统
  const initializePerformanceSystem = useCallback((currentScene: THREE.Scene) => {
    // 设置场景复杂度分析器
    sceneComplexityAnalyzer.setScene(currentScene);
    if (renderer) {
      sceneComplexityAnalyzer.setRenderer(renderer);
    }
    sceneComplexityAnalyzer.setPerformanceOptimizer(performanceOptimizationManager);

    // 启动自动性能检测
    (devicePerformanceAnalyzer as any).detectPerformanceTier().then((tier: any) => {
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

    // 清理函数
    return () => {
      // 性能数据收集器不需要手动移除事件监听器
    };
  }, [renderer]);

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
  }, [onInit, minWidth, minHeight, webglSupported, memoizedControlsConfig, memoizedSceneConfig, getScene, createScene, camera, renderer, controls, initializePerformanceSystem]);



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
    if (!containerRef.current || !camera || !renderer || !autoFit) return;

    try {
      const width = Math.max(minWidth, containerRef.current.clientWidth);
      const height = Math.max(minHeight, containerRef.current.clientHeight);
      setDimensions({ width, height });

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    } catch (error) {
      console.error('Resize error:', error);
    }
  }, [autoFit, minWidth, minHeight, camera, renderer]);

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
    
    // 重置性能统计
    const stats = performanceStatsRef.current;
    stats.totalFrameTime = 0;
    stats.controllerUpdateTime = 0;
    stats.userCallbackTime = 0;
    stats.sceneUpdateTime = 0;
    stats.renderTime = 0;
    stats.frameCount++;

    // 更新控制器
    if (controls) {
      const controllerStart = performance.now();
      controls.update();
      stats.controllerUpdateTime = performance.now() - controllerStart;
    }

    // 应用性能优化
    if (autoModeEnabled) {
      performanceOptimizationManager.update(deltaTime);
      const complexity = sceneComplexityAnalyzer.analyzeScene();

      if (complexity.level === 'high' || complexity.level === 'very_high') {
        // 处理复杂度优化逻辑
      }
    }

    // 调用用户动画帧回调
    if (onAnimationFrame) {
      try {
        const userCallbackStart = performance.now();
        onAnimationFrame(deltaTime);
        stats.userCallbackTime = performance.now() - userCallbackStart;
      } catch (error) {
        console.error('Animation frame callback error:', error);
      }
    }

    // 使用服务更新场景
    const currentScene = getScene();
    if (currentScene) {
      const sceneUpdateStart = performance.now();
      updateScene(currentScene, deltaTime);
      stats.sceneUpdateTime = performance.now() - sceneUpdateStart;
    }

    // 渲染场景 - 使用useThreeScene提供的实例
    if (renderer && currentScene && camera) {
      try {
        // 帧跳过逻辑
        if (performanceOptimizationManager.shouldSkipFrame()) {
          return;
        }
        
        // 渲染场景并测量时间
        const renderStart = performance.now();
        renderer.render(currentScene, camera);
        stats.renderTime = performance.now() - renderStart;
        
        // 计算总帧时间
        stats.totalFrameTime = performance.now() - currentTime;
        
        // 更新性能历史记录
        if (stats.fpsHistory.length > 60) stats.fpsHistory.shift();
        if (stats.memoryHistory.length > 60) stats.memoryHistory.shift();
        if (stats.drawCallsHistory.length > 60) stats.drawCallsHistory.shift();
        if (stats.triangleCountHistory.length > 60) stats.triangleCountHistory.shift();
        if (stats.objectCountHistory.length > 60) stats.objectCountHistory.shift();
        
        stats.fpsHistory.push(Math.round(1000 / stats.totalFrameTime));
        stats.memoryHistory.push(renderer.info.memory.geometries + renderer.info.memory.textures + renderer.info.memory.programs);
        stats.drawCallsHistory.push(renderer.info.render.calls);
        stats.triangleCountHistory.push(renderer.info.render.triangles);
        stats.objectCountHistory.push(currentScene.children.length);
        
        // 每秒更新一次状态
        if (stats.frameCount % 60 === 0) {
          setCurrentFPS(Math.round(stats.fpsHistory.reduce((a, b) => a + b, 0) / stats.fpsHistory.length));
          setCurrentMemory(renderer.info.memory.geometries + renderer.info.memory.textures + renderer.info.memory.programs);
        }
        
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
  }, [paused, onAnimationFrame, getScene, updateScene, controls, renderer, camera, currentFPS, currentMemory, autoModeEnabled]);

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
    (performanceDataCollector as any).stopCollection();
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
      (performanceDataCollector as any).startCollection();
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

  // 几何体合并工具函数 - 优化版
  const mergeGeometries = useCallback((scene: THREE.Scene) => {
    if (!scene) return;
    
    // 检查是否需要合并（只有当对象数量超过阈值时才合并）
    const meshCount = scene.children.filter(child => child instanceof THREE.Mesh).length;
    if (meshCount < VISUALIZATION_CONFIG.performance.maxDrawCalls / 2) {
      console.log('跳过几何体合并：对象数量不足（当前：', meshCount, '，阈值：', VISUALIZATION_CONFIG.performance.maxDrawCalls / 2, '）');
      return;
    }
    
    try {
      // 按材质分组几何体
      const materialsToGeometries = new Map<THREE.Material, THREE.BufferGeometry[]>();
      const materialsToObjects = new Map<THREE.Material, THREE.Mesh[]>();
      const objectsToRemove: THREE.Object3D[] = [];
      
      // 遍历场景中的所有对象
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry && object.material) {
          // 跳过合并已经被合并的对象
          if (object.userData.isMerged) return;
          
          // 跳过标记为不可合并的对象
          if (object.userData.noMerge) return;
          
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (!materialsToGeometries.has(material)) {
              materialsToGeometries.set(material, []);
              materialsToObjects.set(material, []);
            }
            
            // 确保几何体是BufferGeometry
            let geometry: THREE.BufferGeometry;
            if (object.geometry instanceof THREE.BufferGeometry) {
              geometry = object.geometry;
            } else {
              // 转换为BufferGeometry（Three.js r125+已不再支持Geometry类）
              geometry = new THREE.BufferGeometry().fromGeometry(object.geometry as THREE.Geometry);
            }
            
            materialsToGeometries.get(material)!.push(geometry);
            materialsToObjects.get(material)!.push(object);
            objectsToRemove.push(object);
          });
        }
      });
      
      // 统计合并前的状态
      const initialDrawCalls = scene.children.filter(child => child instanceof THREE.Mesh).length;
      let mergedCount = 0;
      let savedDrawCalls = 0;
      
      // 合并每组几何体
      materialsToGeometries.forEach((geometries, material) => {
        if (geometries.length < 2) return; // 只有一个几何体，不需要合并
        
        const objects = materialsToObjects.get(material)!;
        
        // 使用BufferGeometryUtils.mergeBufferGeometries合并BufferGeometry
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries as THREE.BufferGeometry[]);
        
        // 创建合并后的网格
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        mergedMesh.name = `merged_mesh_${Date.now()}_${mergedCount++}`;
        
        // 保存合并相关的元数据
        mergedMesh.userData = {
          isMerged: true,
          mergedFrom: objects.map(obj => ({
            name: obj.name,
            uuid: obj.uuid,
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone()
          })),
          originalMaterial: material,
          mergeTime: Date.now()
        };
        
        // 计算合并后的位置（取平均值）
        const avgPosition = new THREE.Vector3();
        objects.forEach(obj => avgPosition.add(obj.position));
        avgPosition.divideScalar(objects.length);
        mergedMesh.position.copy(avgPosition);
        
        // 将合并后的网格添加到场景
        scene.add(mergedMesh);
        
        // 更新统计
        savedDrawCalls += geometries.length - 1;
      });
      
      // 移除原始对象
      objectsToRemove.forEach((object) => {
        if (object.parent) {
          // 保存原始对象的引用到合并组中
          object.parent.remove(object);
        }
      });
      
      // 记录合并结果
      console.log(`几何体合并完成：合并了 ${mergedCount} 组，减少了 ${savedDrawCalls} 个绘制调用（从 ${initialDrawCalls} 到 ${initialDrawCalls - savedDrawCalls}）`);
    } catch (error) {
      console.error('几何体合并失败:', error);
    }
  }, []);
  
  // 添加LOD支持 - 优化版
  const addLODSupport = useCallback((scene: THREE.Scene) => {
    if (!scene) return;
    
    try {
      // 获取相机引用，用于计算LOD距离
      let activeCamera: THREE.Camera | null = null;
      scene.traverse((object) => {
        if (object instanceof THREE.Camera) {
          activeCamera = object;
        }
      });
      
      // 遍历场景中的所有网格对象
      let lodCount = 0;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry && !object.userData.hasLOD) {
          // 跳过已经有LOD的对象
          if (object.userData.hasLOD) return;
          
          // 跳过标记为不需要LOD的对象
          if (object.userData.noLOD) return;
          
          // 跳过已经被合并的对象
          if (object.userData.isMerged) return;
          
          // 跳过简单几何体（顶点数少于500）
          let vertexCount = 0;
          if (object.geometry instanceof THREE.BufferGeometry) {
            vertexCount = object.geometry.attributes.position?.count || 0;
          } else {
            vertexCount = (object.geometry as THREE.Geometry).vertices.length || 0;
          }
          
          if (vertexCount < 500) return;
          
          // 创建LOD对象
          const lod = new THREE.LOD();
          
          // 原始高细节模型
          lod.addLevel(object, 0);
          
          // 根据几何体复杂度决定LOD级别数量
          const lodLevels = vertexCount > 5000 ? 3 : vertexCount > 2000 ? 2 : 1;
          
          // 计算相机距离（如果有相机的话）
          const cameraDistance = activeCamera ? activeCamera.position.distanceTo(object.position) : 100;
          
          // 根据相机距离和性能模式调整LOD距离阈值
          const baseDistance = isPerformanceMode ? 30 : 50;
          const distanceMultiplier = cameraDistance < 50 ? 0.5 : cameraDistance > 200 ? 2 : 1;
          
          // 智能简化几何体
          const simplifyGeometry = (geometry: THREE.BufferGeometry | THREE.Geometry, reductionRatio: number): THREE.BufferGeometry => {
            let bufferGeometry: THREE.BufferGeometry;
            
            if (geometry instanceof THREE.BufferGeometry) {
              bufferGeometry = geometry.clone();
            } else {
              bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry as THREE.Geometry);
            }
            
            // 尝试使用BufferGeometry的简化方法
            if (bufferGeometry.attributes.position) {
              const positionAttr = bufferGeometry.attributes.position;
              const originalCount = positionAttr.count;
              const targetCount = Math.max(100, Math.floor(originalCount * reductionRatio));
              
              // 如果需要简化
              if (originalCount > targetCount) {
                // 简单的顶点跳过方法（实际项目中可以使用更复杂的算法）
                const newPositionArray = [];
                const positionArray = positionAttr.array;
                
                for (let i = 0; i < positionArray.length; i += Math.ceil(originalCount / targetCount) * 3) {
                  newPositionArray.push(positionArray[i]);
                  newPositionArray.push(positionArray[i + 1]);
                  newPositionArray.push(positionArray[i + 2]);
                }
                
                // 创建新的几何体
                const newGeometry = new THREE.BufferGeometry();
                newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositionArray, 3));
                newGeometry.computeVertexNormals();
                
                return newGeometry;
              }
            }
            
            return bufferGeometry;
          };
          
          // 添加中细节模型
          if (lodLevels >= 1) {
            const mediumGeometry = simplifyGeometry(object.geometry, 0.5);
            const mediumMesh = new THREE.Mesh(mediumGeometry, object.material);
            mediumMesh.userData.lodLevel = 'medium';
            lod.addLevel(mediumMesh, baseDistance * distanceMultiplier * 1);
          }
          
          // 添加低细节模型
          if (lodLevels >= 2) {
            const lowGeometry = simplifyGeometry(object.geometry, 0.25);
            const lowMesh = new THREE.Mesh(lowGeometry, object.material);
            lowMesh.userData.lodLevel = 'low';
            lod.addLevel(lowMesh, baseDistance * distanceMultiplier * 2);
          }
          
          // 添加极低细节模型（仅用于非常复杂的几何体）
          if (lodLevels >= 3) {
            const veryLowGeometry = simplifyGeometry(object.geometry, 0.1);
            const veryLowMesh = new THREE.Mesh(veryLowGeometry, object.material);
            veryLowMesh.userData.lodLevel = 'very_low';
            lod.addLevel(veryLowMesh, baseDistance * distanceMultiplier * 3);
          }
          
          // 替换原始对象
          if (object.parent) {
            const parent = object.parent;
            const index = parent.children.indexOf(object);
            if (index !== -1) {
              parent.remove(object);
              parent.add(lod, index);
              lod.position.copy(object.position);
              lod.rotation.copy(object.rotation);
              lod.scale.copy(object.scale);
              
              // 保存原始对象的引用
              lod.userData.originalObject = object;
              lod.userData.hasLOD = true;
              lod.userData.lodLevels = lodLevels;
              
              lodCount++;
            }
          }
        }
      });
      
      console.log(`LOD支持已添加，为 ${lodCount} 个复杂几何体创建了LOD`);
    } catch (error) {
      console.error('添加LOD支持失败:', error);
    }
  }, [isPerformanceMode]);
  
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
        
        // 应用几何体合并和LOD支持
        if (performanceOptions.enableBatchRendering) {
          mergeGeometries(scene);
        }
        
        // 添加LOD支持
        addLODSupport(scene);
      } catch (error) {
        console.error('Children render error:', error);
        setHasError(error instanceof Error ? error : new Error('Children rendering failed'));
      }
    }
  }, [isInitialized, children, scene, camera, renderer, controls, mergeGeometries, addLODSupport, performanceOptions.enableBatchRendering]);

  // 全屏切换函数
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          // Safari
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          // IE11
          (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          // Safari
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          // IE11
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('全屏切换失败:', error);
    }
  }, [isFullscreen]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;

      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    <div className="relative w-full h-full">
      <motion.div
        ref={containerRef}
        className={cn(
          'overflow-hidden relative w-full h-full',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          minHeight: `${minHeight}px`,
          width: minWidth > 0 ? `${minWidth}px` : '100%',
          height: '100%'
        }}
      />

      {/* 控制条 - 优化布局，减少干扰 */}
      <div className="absolute top-2 left-2 flex gap-1 items-center">
        {/* FPS 指示器 */}
        <div className="px-2 py-1 text-xs font-medium text-white bg-black/70 rounded backdrop-blur-sm">
          {currentFPS?.toFixed(1) || '--'} FPS
        </div>

        {/* 内存使用指示器 */}
        <div className="px-2 py-1 text-xs font-medium text-white bg-black/70 rounded backdrop-blur-sm">
          {currentMemory?.toFixed(0) || '--'} MB
        </div>
      </div>

      {/* 右侧控制按钮组 */}
      <div className="absolute top-2 right-2 flex gap-1 items-center">
        {/* 全屏按钮 - 优化样式，突出显示 */}
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-md transition-all duration-300 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 backdrop-blur-sm"
          title={isFullscreen ? '退出全屏' : '全屏显示'}
        >
          {isFullscreen ? '🔲 退出全屏' : '⛶ 全屏显示'}
        </button>

        {/* 一键优化按钮 */}
        <button
          onClick={runOneClickOptimization}
          disabled={isOptimizing}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 backdrop-blur-sm ${isOptimizing ? 'bg-gray-600/80 text-gray-300 cursor-not-allowed shadow-md' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50'}`}
          title="一键优化性能"
        >
          {isOptimizing ? '⚙️ 优化中...' : '⚡ 优化'}
        </button>

        {/* 性能控制面板按钮 */}
        <button
          onClick={() => setShowPerformancePanel(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-md transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 backdrop-blur-sm"
          title="性能控制面板"
        >
          📊 性能
        </button>
      </div>

      {/* 高级性能控制面板 */}
      {showPerformancePanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPerformancePanel(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">性能控制面板</h3>
              
              {/* 详细性能统计 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">实时性能数据</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">当前FPS:</span>
                      <span className="ml-2 font-semibold text-white">{currentFPS?.toFixed(1) || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">内存使用:</span>
                      <span className="ml-2 font-semibold text-white">{currentMemory} MB</span>
                    </div>
                    <div>
                      <span className="text-gray-400">绘制调用:</span>
                      <span className="ml-2 font-semibold text-white">{renderer?.info.render.calls || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">三角形数:</span>
                      <span className="ml-2 font-semibold text-white">{renderer?.info.render.triangles || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">场景对象:</span>
                      <span className="ml-2 font-semibold text-white">{scene?.children.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">渲染模式:</span>
                      <span className="ml-2 font-semibold text-white">{isPerformanceMode ? '性能' : '质量'}</span>
                    </div>
                  </div>
                </div>
                
                {/* 帧时间分布 */}
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">帧时间分布 (ms)</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">总帧时间:</span>
                      <span className="font-semibold text-white">{performanceStatsRef.current.totalFrameTime.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">控制器更新:</span>
                      <span className="font-semibold text-white">{performanceStatsRef.current.controllerUpdateTime.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">用户回调:</span>
                      <span className="font-semibold text-white">{performanceStatsRef.current.userCallbackTime.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">场景更新:</span>
                      <span className="font-semibold text-white">{performanceStatsRef.current.sceneUpdateTime.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">渲染时间:</span>
                      <span className="font-semibold text-white">{performanceStatsRef.current.renderTime.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 优化控制 */}
              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2">优化控制</h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={runOneClickOptimization}
                    disabled={isOptimizing}
                    className={`px-4 py-2 rounded-md transition-all duration-300 ${isOptimizing ? 'bg-gray-600/80 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'}`}
                  >
                    {isOptimizing ? '⚙️ 优化中...' : '⚡ 一键优化'}
                  </button>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoModeEnabled}
                      onChange={(e) => setAutoModeEnabled(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">启用自动优化</span>
                  </label>
                </div>
              </div>
              
              {/* 性能优化建议 */}
              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2">优化建议</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {performanceOptimizationManager.getPerformanceStats().optimizationSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 text-yellow-400">💡</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                  {performanceOptimizationManager.getPerformanceStats().optimizationSuggestions.length === 0 && (
                    <li className="text-gray-500">当前性能良好，无需优化建议</li>
                  )}
                </ul>
              </div>
              
              <button
                onClick={() => setShowPerformancePanel(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// 重新导出VisualizationService中的方法，保持向后兼容性
export {
  visualizationService
};

export default ThreeJSVisualization;