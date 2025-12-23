import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Vector3, Box3, Color, BufferGeometry as THREEBufferGeometry, MeshBasicMaterial, MeshStandardMaterial, PointsMaterial, Points, BufferAttribute, LineSegments, LineBasicMaterial, AxesHelper, GridHelper, Raycaster, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';
import { useThreeScene } from '../hooks/useThreeScene';
import { visualizationService } from '../services/visualizationService';
import { cn } from '../utils';
import { VISUALIZATION_CONFIG } from '../constants';
import { unifiedPerformanceManager } from '../performance/UnifiedPerformanceManager';
import {
  devicePerformanceAnalyzer
} from '../performance/devicePerformanceAnalyzer';
import {
  performanceDataCollector
} from '../performance/performanceDataCollector';
import {
  sceneComplexityAnalyzer
} from '../performance/sceneComplexityAnalyzer';
// 后处理效果
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BloomEffect, ChromaticAberrationEffect, DepthOfFieldEffect, EffectPass, NoiseEffect, VignetteEffect } from 'three/examples/jsm/effects/';
import { BlendFunction } from 'three/examples/jsm/constants/';
import { GPUParticleSystem, GPUParticleSystemManager } from '../visualization/GPUParticleSystem';
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
  const [currentFPS, setCurrentFPS] = useState(60);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  
  // 资源预加载状态
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  
  // 资源引用
  const resourcesRef = useRef<Map<string, any>>(new Map());
  const preloadQueueRef = useRef<Array<{ url: string; type: string; id: string }>>([]);

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
  
  // 后处理效果状态
  const [usePostProcessing, setUsePostProcessing] = useState(true);
  const [bloomIntensity, setBloomIntensity] = useState(1.8);
  const [bloomRadius, setBloomRadius] = useState(0.6);
  const [bloomThreshold, setBloomThreshold] = useState(0.05);
  const [filmNoiseIntensity, setFilmNoiseIntensity] = useState(0.2);
  const [filmScanlineIntensity, setFilmScanlineIntensity] = useState(0.02);
  const [filmScanlineCount, setFilmScanlineCount] = useState(300);
  const [useSMAA, setUseSMAA] = useState(true);
  const [useFilmPass, setUseFilmPass] = useState(true);
  const [useGammaCorrection, setUseGammaCorrection] = useState(true);
  const [chromaticAberration, setChromaticAberration] = useState(0.02);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.4);
  const [depthOfField, setDepthOfField] = useState(0.0);
  const [noiseIntensity, setNoiseIntensity] = useState(0.1);
  const [postProcessingQuality, setPostProcessingQuality] = useState('high'); // high, medium, low, auto
  
  // 交互状态
  const [showControls, setShowControls] = useState(true);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [raycastInfo, setRaycastInfo] = useState<any>(null);
  
  // 可视化效果状态
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  
  // 性能监控状态
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // 后处理相关引用
  const composerRef = useRef<EffectComposer | null>(null);
  const particleSystemManagerRef = useRef<GPUParticleSystemManager | null>(null);

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
  
  // 增强的资源元数据类型
  interface ResourceMetadata {
    id: string;
    url: string;
    type: string;
    loadedAt: number;
    lastUsedAt: number;
    usageCount: number;
    size: number; // 估计大小（KB）
    isPinned: boolean; // 是否固定，不会被自动释放
    isActive: boolean; // 是否正在使用
  }
  
  // 资源元数据引用
  const resourceMetadataRef = useRef<Map<string, ResourceMetadata>>(new Map());
  
  // 内存管理配置
  const memoryConfig = useMemo(() => ({
    maxMemoryUsageMB: VISUALIZATION_CONFIG.performance.maxMemoryUsageMB || 512,
    autoReleaseInterval: 30000, // 30秒自动检查一次
    idleTimeout: 60000, // 60秒未使用的资源将被释放
    minimumResourceCount: 10, // 保留至少10个资源
    highMemoryThreshold: 0.8, // 达到最大内存的80%时开始自动释放
    mediumMemoryThreshold: 0.6, // 达到最大内存的60%时开始选择性释放
  }), []);
  
  // 资源预加载管理 - 优化版
  const resourceManager = useMemo(() => {
    // 估算资源大小
    const estimateResourceSize = (resource: any, type: string): number => {
      try {
        if (type === 'texture' && resource.image) {
          // 估计纹理大小（宽×高×4字节，单位KB）
          return (resource.image.width * resource.image.height * 4) / 1024;
        } else if (type === 'geometry' && resource.attributes.position) {
          // 估计几何体大小（顶点数×4字节×3坐标，单位KB）
          return (resource.attributes.position.count * 4 * 3) / 1024;
        } else if (type === 'model') {
          // 估计模型大小（基于子对象数量）
          let size = 0;
          resource.traverse((child: any) => {
            if (child.geometry) {
              size += estimateResourceSize(child.geometry, 'geometry');
            }
            if (child.material) {
              // 材料大小估计
              size += 10; // 假设每个材料10KB
            }
            if (child.material && child.material.map) {
              size += estimateResourceSize(child.material.map, 'texture');
            }
          });
          return size;
        }
        return 0;
      } catch (error) {
        return 0;
      }
    };
    
    // 释放单个资源
    const releaseSingleResource = (id: string, metadata?: ResourceMetadata) => {
      const actualMetadata = metadata || resourceMetadataRef.current.get(id);
      if (!actualMetadata) return false;
      
      const resource = resourcesRef.current.get(id);
      if (resource) {
        // 释放Three.js资源
        try {
          if (resource.dispose) {
            resource.dispose();
          } else if (resource.geometry && resource.geometry.dispose) {
            resource.geometry.dispose();
          } else if (resource.material && resource.material.dispose) {
            resource.material.dispose();
          }
          
          resourcesRef.current.delete(id);
          resourceMetadataRef.current.delete(id);
          setResourcesLoaded(prev => prev - 1);
          
          console.log(`资源已释放: ${id} (${actualMetadata.type})，大小: ${actualMetadata.size.toFixed(1)}KB`);
          return true;
        } catch (error) {
          console.error(`释放资源失败: ${id}`, error);
          return false;
        }
      }
      return false;
    };
    
    // 自动释放资源
    const autoReleaseResources = () => {
      if (resourcesRef.current.size <= memoryConfig.minimumResourceCount) {
        return; // 保留至少一定数量的资源
      }
      
      // 计算当前内存使用情况
      let currentMemoryUsage = 0;
      resourceMetadataRef.current.forEach(metadata => {
        currentMemoryUsage += metadata.size;
      });
      const currentMemoryMB = currentMemoryUsage / 1024;
      
      // 检查是否需要释放资源
      const memoryRatio = currentMemoryMB / memoryConfig.maxMemoryUsageMB;
      if (memoryRatio < memoryConfig.mediumMemoryThreshold) {
        return; // 内存使用正常，不需要释放
      }
      
      console.log(`开始自动释放资源，当前内存使用: ${currentMemoryMB.toFixed(1)}MB/${memoryConfig.maxMemoryUsageMB}MB (${(memoryRatio * 100).toFixed(0)}%)`);
      
      // 准备释放的资源列表
      const resourcesToRelease = Array.from(resourceMetadataRef.current.values())
        .filter(metadata => !metadata.isPinned && !metadata.isActive) // 排除固定和活跃资源
        .sort((a, b) => {
          // 按最后使用时间排序，最早使用的先释放
          return a.lastUsedAt - b.lastUsedAt;
        });
      
      // 计算需要释放的内存大小
      let targetMemoryMB = memoryConfig.maxMemoryUsageMB * memoryConfig.mediumMemoryThreshold;
      let memoryToReleaseMB = currentMemoryMB - targetMemoryMB;
      
      if (memoryToReleaseMB <= 0) {
        return;
      }
      
      let releasedMemoryMB = 0;
      let releasedCount = 0;
      
      // 释放资源直到达到目标
      for (const metadata of resourcesToRelease) {
        if (releasedMemoryMB >= memoryToReleaseMB) {
          break;
        }
        
        const success = releaseSingleResource(metadata.id, metadata);
        if (success) {
          releasedMemoryMB += metadata.size / 1024;
          releasedCount++;
        }
      }
      
      console.log(`自动释放完成，释放了 ${releasedCount} 个资源，释放内存: ${releasedMemoryMB.toFixed(1)}MB`);
    };
    
    // 定期自动释放资源的定时器
    let autoReleaseTimer: NodeJS.Timeout;
    const startAutoRelease = () => {
      stopAutoRelease();
      autoReleaseTimer = setInterval(autoReleaseResources, memoryConfig.autoReleaseInterval);
    };
    
    const stopAutoRelease = () => {
      if (autoReleaseTimer) {
        clearInterval(autoReleaseTimer);
      }
    };
    
    startAutoRelease();
    
    return {
      // 添加资源到预加载队列
      addToPreloadQueue: (resources: Array<{ url: string; type: string; id: string }>) => {
        preloadQueueRef.current.push(...resources);
        setTotalResources(prev => prev + resources.length);
      },
      
      // 预加载资源 - 优化版：并行加载 + 优先级排序
      preloadResources: async () => {
        if (preloadQueueRef.current.length === 0) {
          setPreloadComplete(true);
          return;
        }
        
        // 按资源类型优先级排序
        const priorityMap: Record<string, number> = {
          'geometry': 1,  // 几何数据优先
          'texture': 2,   // 纹理其次
          'model': 3,     // 模型最后
          'default': 4    // 其他资源
        };
        
        const queue = [...preloadQueueRef.current].sort((a, b) => {
          const aPriority = priorityMap[a.type] || priorityMap.default;
          const bPriority = priorityMap[b.type] || priorityMap.default;
          return aPriority - bPriority;
        });
        
        let loadedCount = 0;
        const total = queue.length;
        
        // 并行加载控制：根据设备性能调整并发数
        const devicePerformance = devicePerformanceAnalyzer.getPerformanceScore();
        const maxConcurrent = devicePerformance > 70 ? 8 : devicePerformance > 40 ? 4 : 2;
        
        // 资源加载函数
        const loadResource = async (resource: typeof queue[0]) => {
          try {
            let loadedResource: any;
            
            switch (resource.type) {
              case 'texture':
                loadedResource = await new Promise((resolve, reject) => {
                  const textureLoader = new THREE.TextureLoader();
                  textureLoader.load(
                    resource.url,
                    (texture) => resolve(texture),
                    undefined,
                    reject
                  );
                });
                break;
              
              case 'geometry':
                // 假设是JSON格式的几何体
                const response = await fetch(resource.url);
                const geometryData = await response.json();
                loadedResource = new THREEBufferGeometry().fromJSON(geometryData);
                break;
              
              case 'model':
                // 假设是GLTF模型
                if (typeof GLTFLoader !== 'undefined') {
                  const loader = new GLTFLoader();
                  const gltf = await loader.loadAsync(resource.url);
                  loadedResource = gltf.scene;
                }
                break;
              
              default:
                // 通用资源加载
                const res = await fetch(resource.url);
                loadedResource = await res.blob();
            }
            
            // 估算资源大小
            const estimatedSize = estimateResourceSize(loadedResource, resource.type);
            
            // 存储已加载的资源
            resourcesRef.current.set(resource.id, loadedResource);
            
            // 存储资源元数据
            resourceMetadataRef.current.set(resource.id, {
              id: resource.id,
              url: resource.url,
              type: resource.type,
              loadedAt: Date.now(),
              lastUsedAt: Date.now(),
              usageCount: 0,
              size: estimatedSize,
              isPinned: false,
              isActive: false
            });
            
            loadedCount++;
            
            // 更新预加载进度
            const progress = Math.round((loadedCount / total) * 100);
            setPreloadProgress(progress);
            setResourcesLoaded(prev => prev + 1);
            
            // 检查内存使用，必要时自动释放
            autoReleaseResources();
            
          } catch (error) {
            console.error(`资源加载失败: ${resource.url}`, error);
            loadedCount++;
          }
        };
        
        // 并行加载实现
        for (let i = 0; i < queue.length; i += maxConcurrent) {
          const batch = queue.slice(i, i + maxConcurrent);
          await Promise.all(batch.map(loadResource));
        }
        
        // 清空预加载队列
        preloadQueueRef.current = [];
        setPreloadComplete(true);
        setPreloadProgress(100);
      },
      
      // 懒加载资源
      lazyLoadResource: async (url: string, type: string, id: string) => {
        // 检查资源是否已经加载
        if (resourcesRef.current.has(id)) {
          // 更新最后使用时间和使用次数
          const metadata = resourceMetadataRef.current.get(id);
          if (metadata) {
            metadata.lastUsedAt = Date.now();
            metadata.usageCount++;
            metadata.isActive = true;
            resourceMetadataRef.current.set(id, metadata);
          }
          return resourcesRef.current.get(id);
        }
        
        try {
          let loadedResource: any;
          
          switch (type) {
            case 'texture':
              loadedResource = await new Promise((resolve, reject) => {
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                  url,
                  (texture) => resolve(texture),
                  undefined,
                  reject
                );
              });
              break;
              
            case 'geometry':
              const response = await fetch(url);
              const geometryData = await response.json();
              loadedResource = new THREE.BufferGeometry().fromJSON(geometryData);
              break;
              
            default:
              const res = await fetch(url);
              loadedResource = await res.blob();
          }
          
          // 估算资源大小
          const estimatedSize = estimateResourceSize(loadedResource, type);
          
          // 存储已加载的资源
          resourcesRef.current.set(id, loadedResource);
          
          // 存储资源元数据
          resourceMetadataRef.current.set(id, {
            id,
            url,
            type,
            loadedAt: Date.now(),
            lastUsedAt: Date.now(),
            usageCount: 1,
            size: estimatedSize,
            isPinned: false,
            isActive: true
          });
          
          // 检查内存使用，必要时自动释放
          autoReleaseResources();
          
          return loadedResource;
          
        } catch (error) {
          console.error(`懒加载资源失败: ${url}`, error);
          throw error;
        }
      },
      
      // 获取资源
      getResource: (id: string) => {
        const resource = resourcesRef.current.get(id);
        if (resource) {
          // 更新最后使用时间和使用次数
          const metadata = resourceMetadataRef.current.get(id);
          if (metadata) {
            metadata.lastUsedAt = Date.now();
            metadata.usageCount++;
            resourceMetadataRef.current.set(id, metadata);
          }
        }
        return resource;
      },
      
      // 释放资源
      releaseResource: (id: string) => {
        return releaseSingleResource(id);
      },
      
      // 释放所有资源
      releaseAllResources: () => {
        console.log('释放所有资源...');
        let releasedCount = 0;
        let releasedMemory = 0;
        
        resourcesRef.current.forEach((resource, id) => {
          const metadata = resourceMetadataRef.current.get(id);
          if (metadata) {
            const success = releaseSingleResource(id, metadata);
            if (success) {
              releasedCount++;
              releasedMemory += metadata.size;
            }
          }
        });
        
        console.log(`释放完成，共释放 ${releasedCount} 个资源，释放内存 ${(releasedMemory / 1024).toFixed(1)}MB`);
        
        setResourcesLoaded(0);
        setPreloadProgress(0);
        setPreloadComplete(false);
      },
      
      // 固定资源，不会被自动释放
      pinResource: (id: string) => {
        const metadata = resourceMetadataRef.current.get(id);
        if (metadata) {
          metadata.isPinned = true;
          resourceMetadataRef.current.set(id, metadata);
        }
      },
      
      // 取消固定资源
      unpinResource: (id: string) => {
        const metadata = resourceMetadataRef.current.get(id);
        if (metadata) {
          metadata.isPinned = false;
          resourceMetadataRef.current.set(id, metadata);
        }
      },
      
      // 设置资源活跃状态
      setResourceActive: (id: string, isActive: boolean) => {
        const metadata = resourceMetadataRef.current.get(id);
        if (metadata) {
          metadata.isActive = isActive;
          if (isActive) {
            metadata.lastUsedAt = Date.now();
          }
          resourceMetadataRef.current.set(id, metadata);
        }
      },
      
      // 触发垃圾回收
      triggerGarbageCollection: () => {
        console.log('手动触发垃圾回收...');
        autoReleaseResources();
        
        // 尝试触发浏览器垃圾回收（如果可用）
        if (typeof (window as any).gc === 'function') {
          try {
            (window as any).gc();
            console.log('浏览器垃圾回收已触发');
          } catch (error) {
            console.warn('无法触发浏览器垃圾回收:', error);
          }
        }
      },
      
      // 获取资源统计信息
      getResourceStats: () => {
        let totalSizeKB = 0;
        let byType: Record<string, { count: number; size: number }> = {};
        
        resourceMetadataRef.current.forEach(metadata => {
          totalSizeKB += metadata.size;
          
          if (!byType[metadata.type]) {
            byType[metadata.type] = { count: 0, size: 0 };
          }
          byType[metadata.type].count++;
          byType[metadata.type].size += metadata.size;
        });
        
        return {
          totalResources: resourcesRef.current.size,
          totalSizeKB,
          totalSizeMB: totalSizeKB / 1024,
          byType,
          memoryUsageRatio: (totalSizeKB / 1024) / memoryConfig.maxMemoryUsageMB
        };
      }
    };
  }, [memoryConfig]);
  
  // 定期更新资源活跃状态
  useEffect(() => {
    const updateResourceActivity = () => {
      // 这里可以添加逻辑来检测资源是否活跃
      // 例如，检查资源是否在当前场景中使用
    };
    
    const activityInterval = setInterval(updateResourceActivity, 5000);
    return () => clearInterval(activityInterval);
  }, []);
  
  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      // 资源管理器内部已经清理了定时器
    };
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

    // 启动自动性能检测
    (devicePerformanceAnalyzer as any).detectPerformanceTier().then((tier: any) => {
      console.log('检测到设备性能级别:', tier);
      // 根据设备性能自动选择合适的性能模式
      // 统一性能管理器会根据指标自动调整，不需要手动设置
    });

    // 清理函数
    return () => {
      // 性能数据收集器不需要手动移除事件监听器
    };
  }, [renderer]);

  // 初始化后处理效果
  const initializePostProcessing = useCallback(() => {
    if (!renderer || !camera || !getScene()) return;
    
    try {
      const currentScene = getScene()!;
      
      // 创建后处理合成器
      const composer = new EffectComposer(renderer);
      
      // 添加渲染通道
      const renderPass = new RenderPass(currentScene, camera);
      composer.addPass(renderPass);
      
      // 获取设备性能分数
      const devicePerformance = devicePerformanceAnalyzer.getPerformanceScore();
      
      // 根据质量设置调整后处理效果
      let effectiveQuality = postProcessingQuality;
      if (effectiveQuality === 'auto') {
        if (devicePerformance < 40) {
          effectiveQuality = 'low';
        } else if (devicePerformance < 70) {
          effectiveQuality = 'medium';
        } else {
          effectiveQuality = 'high';
        }
      }
      
      // 添加SMAA抗锯齿通道
      if (useSMAA && (effectiveQuality === 'high' || effectiveQuality === 'medium')) {
        const smaaPass = new SMAAPass();
        composer.addPass(smaaPass);
      }
      
      // 添加UnrealBloomPass，创建震撼的发光效果
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        bloomIntensity,
        bloomRadius,
        bloomThreshold
      );
      composer.addPass(bloomPass);
      
      // 添加胶片颗粒效果，增强视觉质感
      if (useFilmPass && (effectiveQuality === 'high' || effectiveQuality === 'medium')) {
        const filmPass = new FilmPass(
          filmNoiseIntensity,
          filmScanlineIntensity,
          filmScanlineCount,
          false
        );
        composer.addPass(filmPass);
      }
      
      // 添加伽马校正通道
      if (useGammaCorrection) {
        const gammaPass = new ShaderPass(GammaCorrectionShader);
        composer.addPass(gammaPass);
      }
      
      // 添加输出通道
      const outputPass = new OutputPass();
      composer.addPass(outputPass);
      
      composerRef.current = composer;
      
      console.log('后处理效果初始化完成', {
        quality: effectiveQuality,
        useSMAA,
        useFilmPass,
        useGammaCorrection
      });
    } catch (error) {
      console.error('后处理效果初始化失败:', error);
    }
  }, [renderer, camera, getScene, bloomIntensity, bloomRadius, bloomThreshold, filmNoiseIntensity, filmScanlineIntensity, filmScanlineCount, useSMAA, useFilmPass, useGammaCorrection, postProcessingQuality]);
  
  // 初始化GPU粒子系统 - 优化：根据设备性能动态调整粒子数量
  const initializeParticleSystem = useCallback(() => {
    if (!getScene()) return;
    
    const currentScene = getScene()!;
    
    // 根据设备性能调整粒子数量（使用简化的性能检测）
    const isHighPerformance = window.navigator.hardwareConcurrency > 4 || (window.devicePixelRatio > 1.5);
    const maxParticles = isHighPerformance ? 100000 : 50000;
    const emissionRate = isHighPerformance ? 500 : 250;
    
    const particleSystemManager = new GPUParticleSystemManager(currentScene);
    particleSystemManagerRef.current = particleSystemManager;
    
    // 创建一个示例粒子系统 - 优化：根据设备性能调整配置
    const particleConfig = {
      maxParticles: maxParticles,
      position: new THREE.Vector3(0, 0, 0),
      rate: emissionRate,
      lifetime: 5,
      lifetimeVariance: 2,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 2,
      size: 0.5,
      sizeVariance: 0.2,
      color: new THREE.Color(0x00ffff),
      colorVariance: 0.5,
      spread: Math.PI * 2,
      gravity: new THREE.Vector3(0, -0.5, 0),
      turbulence: 0.5,
      damping: 0.98,
      startSize: 0.1,
      endSize: 1.0,
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0xff00ff)
    };
    
    particleSystemManager.createParticleSystem('equationParticles', particleConfig);
    
    console.log(`GPU粒子系统初始化完成，粒子数量: ${maxParticles}`);
  }, [getScene]);
  
  // 重新初始化后处理效果
  const reinitializePostProcessing = useCallback(() => {
    if (composerRef.current) {
      composerRef.current.dispose();
      composerRef.current = null;
    }
    initializePostProcessing();
  }, [initializePostProcessing]);

  // 监听后处理参数变化，自动重新初始化
  useEffect(() => {
    if (isInitialized) {
      reinitializePostProcessing();
    }
  }, [isInitialized, postProcessingQuality, useSMAA, useFilmPass, useGammaCorrection, reinitializePostProcessing]);

  // 射线检测和对象选择
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // 鼠标移动处理
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !camera || !renderer) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition({ x: mouse.current.x, y: mouse.current.y });

    // 更新射线检测
    raycaster.current.setFromCamera(mouse.current, camera);
    const currentScene = getScene();
    if (!currentScene) return;

    const intersects = raycaster.current.intersectObjects(currentScene.children, true);
    if (intersects.length > 0) {
      const closest = intersects[0];
      setRaycastInfo({
        object: closest.object,
        point: closest.point,
        distance: closest.distance,
        face: closest.face
      });
    } else {
      setRaycastInfo(null);
    }
  }, [camera, renderer, getScene]);

  // 鼠标点击处理
  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!camera || !renderer) return;

    const currentScene = getScene();
    if (!currentScene) return;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(currentScene.children, true);
    
    if (intersects.length > 0) {
      const closest = intersects[0];
      setSelectedObject(closest.object);
      console.log('Selected object:', closest.object);
      
      // 添加选中效果
      currentScene.traverse(obj => {
        if (obj.userData && obj.userData.originalMaterial) {
          obj.material = obj.userData.originalMaterial;
        }
      });
      
      if (closest.object instanceof THREE.Mesh) {
        closest.object.userData.originalMaterial = closest.object.material;
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        closest.object.material = highlightMaterial;
      }
    } else {
      setSelectedObject(null);
      // 清除所有选中效果
      const currentScene = getScene();
      if (currentScene) {
        currentScene.traverse(obj => {
          if (obj.userData && obj.userData.originalMaterial) {
            obj.material = obj.userData.originalMaterial;
          }
        });
      }
    }
  }, [camera, renderer, getScene]);

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
      
      // 初始化后处理效果
      initializePostProcessing();
      
      // 初始化GPU粒子系统
      initializeParticleSystem();
      
      // 初始化智能渲染调度器
      if (renderer && camera) {
        smartRenderScheduler.setRendererAndCamera(renderer, camera);
      }

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
  }, [onInit, minWidth, minHeight, webglSupported, memoizedControlsConfig, memoizedSceneConfig, getScene, createScene, camera, renderer, controls, initializePerformanceSystem, initializePostProcessing, initializeParticleSystem]);



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
      // 统一性能管理器会根据指标自动调整，不需要手动应用设置

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

  // 更新剔除状态 - 必须在animate函数之前定义
  const updateCullingState = useCallback((scene: THREE.Scene) => {
    if (!scene || !camera) return;
    
    try {
      // 创建视锥体
      const frustum = new THREE.Frustum();
      const projectionMatrix = new THREE.Matrix4();
      
      // 更新视锥体
      projectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(projectionMatrix);
      
      // 遍历场景中的所有对象
      let visibleCount = 0;
      let culledCount = 0;
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && !object.userData.isMerged && !object.userData.noCulling) {
          // 计算世界边界
          if (!object.geometry.boundingSphere) {
            object.geometry.computeBoundingSphere();
          }
          
          if (object.geometry.boundingSphere) {
            // 获取世界边界
            const worldPosition = new THREE.Vector3();
            object.getWorldPosition(worldPosition);
            const worldRadius = object.geometry.boundingSphere.radius * Math.max(
              object.scale.x,
              object.scale.y,
              object.scale.z
            );
            
            // 应用高级剔除策略
            let isCulled = false;
            
            // 1. 距离剔除
            const maxDistance = VISUALIZATION_CONFIG.maxCameraDistance || 1000;
            const distanceToCamera = worldPosition.distanceTo(camera.position);
            if (distanceToCamera > maxDistance) {
              isCulled = true;
            } else {
              // 2. 视锥体剔除
              const worldSphere = new THREE.Sphere(worldPosition, worldRadius);
              if (!frustum.intersectsSphere(worldSphere)) {
                isCulled = true;
              }
            }
            
            // 更新对象可见性
            object.visible = !isCulled;
            
            if (object.visible) {
              visibleCount++;
            } else {
              culledCount++;
            }
          }
        }
      });
      
      // 记录剔除统计
      if (performanceStatsRef.current.frameCount % 60 === 0) {
        console.log(`剔除统计: 可见对象 ${visibleCount}, 剔除对象 ${culledCount}`);
      }
    } catch (error) {
      console.error('更新剔除状态失败:', error);
    }
  }, [camera]);

  // 自适应性能调整系统
  const adaptivePerformanceAdjustment = useCallback(() => {
    if (!autoModeEnabled) return;
    
    const currentFPS = performanceStatsRef.current.fpsHistory.length > 0 
      ? Math.round(performanceStatsRef.current.fpsHistory.reduce((a, b) => a + b, 0) / performanceStatsRef.current.fpsHistory.length)
      : 60;
    
    const devicePerformance = devicePerformanceAnalyzer.getPerformanceScore();
    const targetFPS = VISUALIZATION_CONFIG.performance.targetFPS || 60;
    
    // 根据FPS调整后处理质量
    if (currentFPS < targetFPS * 0.7) {
      // FPS低于目标的70%，降低后处理质量
      if (postProcessingQuality === 'high') {
        setPostProcessingQuality('medium');
      } else if (postProcessingQuality === 'medium') {
        setPostProcessingQuality('low');
      }
    } else if (currentFPS > targetFPS * 0.9 && devicePerformance > 60) {
      // FPS高于目标的90%且设备性能良好，提高后处理质量
      if (postProcessingQuality === 'low') {
        setPostProcessingQuality('medium');
      } else if (postProcessingQuality === 'medium') {
        setPostProcessingQuality('high');
      }
    }
    
    // 根据设备性能调整粒子系统
    if (particleSystemManagerRef.current) {
      const particleSystem = particleSystemManagerRef.current.getParticleSystem('equationParticles');
      if (particleSystem) {
        // 可以在这里调整粒子系统的参数
      }
    }
    
    // 根据内存使用情况调整资源加载策略
    const memoryUsage = renderer?.info.memory.geometries + renderer?.info.memory.textures + renderer?.info.memory.programs || 0;
    if (memoryUsage > 500) {
      // 内存使用过高，释放一些资源
      resourceManager.triggerGarbageCollection();
    }
  }, [autoModeEnabled, postProcessingQuality, devicePerformanceAnalyzer, renderer, resourceManager]);

  // 动画循环 - 优化版本
  const animate = useCallback(() => {
    if (paused) return;

    // 性能优化：只在可见区域内渲染
    const container = containerRef.current;
    let isVisible = true;
    if (container) {
      const rect = container.getBoundingClientRect();
      isVisible = rect.top < window.innerHeight && rect.bottom >= 0 &&
        rect.left < window.innerWidth && rect.right >= 0;

      if (!isVisible) {
        // 元素不可见时，降低更新频率
        animationFrameRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, 500); // 每500ms检查一次
        return;
      }
    }

    // 计算时间差
    const currentTime = performance.now();
    const deltaTime = lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0;
    const frameTime = deltaTime * 1000; // 转换为毫秒
    const fps = deltaTime > 0 ? 1 / deltaTime : 60;
    
    // 目标帧率和最大时间步长
    const targetFPS = VISUALIZATION_CONFIG.performance.targetFPS || 60;
    const maxDeltaTime = 1 / 30; // 最大允许的时间步长（30FPS）
    
    // 限制最大时间步长，防止物理模拟不稳定
    const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
    
    // 重置性能统计
    const stats = performanceStatsRef.current;
    stats.totalFrameTime = 0;
    stats.controllerUpdateTime = 0;
    stats.userCallbackTime = 0;
    stats.sceneUpdateTime = 0;
    stats.renderTime = 0;
    stats.frameCount++;

    // 计算场景复杂度
    const currentScene = getScene();
    
    // 发布渲染开始事件
    eventSystem.emit(APP_EVENTS.RENDER_START, {
      frameIndex: stats.frameCount,
      timestamp: currentTime,
      priority: 0
    });

    // 更新控制器
    if (controls) {
      const controllerStart = performance.now();
      controls.update();
      stats.controllerUpdateTime = performance.now() - controllerStart;
    }

    // 应用性能优化
    if (autoModeEnabled && currentScene) {
      // 使用统一性能管理器应用优化
      unifiedPerformanceManager.applyOptimizations(clampedDeltaTime);
      const complexity = sceneComplexityAnalyzer.analyzeScene();

      if (complexity.level === 'high' || complexity.level === 'very_high') {
        // 处理复杂度优化逻辑
      }
      
      // 自适应性能调整
      if (stats.frameCount % 30 === 0) { // 每30帧调整一次
        adaptivePerformanceAdjustment();
      }
    }

    // 调用用户动画帧回调
    if (onAnimationFrame) {
      try {
        const userCallbackStart = performance.now();
        onAnimationFrame(clampedDeltaTime);
        stats.userCallbackTime = performance.now() - userCallbackStart;
      } catch (error) {
        console.error('Animation frame callback error:', error);
      }
    }

    // 更新GPU粒子系统
    if (particleSystemManagerRef.current) {
      particleSystemManagerRef.current.update(clampedDeltaTime);
    }

    // 使用服务更新场景
    if (currentScene) {
      const sceneUpdateStart = performance.now();
      updateScene(currentScene, clampedDeltaTime);
      stats.sceneUpdateTime = performance.now() - sceneUpdateStart;
    }

    // 渲染场景 - 使用useThreeScene提供的实例
    if (renderer && currentScene && camera) {
      try {
        // 更新剔除状态（每10帧更新一次，减少计算开销）
        if (stats.frameCount % 10 === 0) {
          updateCullingState(currentScene);
        }
        
        // 渲染场景并测量时间
        const renderStart = performance.now();
        
        // 使用后处理合成器渲染，实现震撼的视觉效果
        if (usePostProcessing && composerRef.current) {
          composerRef.current.render();
        } else {
          renderer.render(currentScene, camera);
        }
        
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
        // 发布渲染错误事件
        eventSystem.emit(APP_EVENTS.RENDER_ERROR, {
          error,
          frameIndex: stats.frameCount
        });
        // 停止动画循环以防止错误持续发生
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    }
    
    // 更新时间
    lastFrameTimeRef.current = currentTime;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [paused, onAnimationFrame, getScene, updateScene, controls, renderer, camera, currentMemory, autoModeEnabled, updateCullingState, adaptivePerformanceAdjustment, devicePerformanceAnalyzer, resourceManager]);

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
    
    // 清理后处理合成器资源
    if (composerRef.current) {
      composerRef.current.dispose();
      composerRef.current = null;
    }
    
    // 清理GPU粒子系统资源
    if (particleSystemManagerRef.current) {
      particleSystemManagerRef.current.dispose();
      particleSystemManagerRef.current = null;
    }

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
      // 执行资源预加载
      const performPreload = async () => {
        await resourceManager.preloadResources();
        
        // 预加载完成后初始化场景
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
      };
      
      performPreload();
    }

    // 组件卸载时清理资源
    return () => {
      if (autoFit) {
        window.removeEventListener('resize', handleResize);
      }
      cleanup();
      resourceManager.releaseAllResources();
    };
  }, [initialize, handleResize, animate, autoFit, paused, checkWebGLSupport, cleanup, onAnimationFrame, setUpdateFunction, resourceManager]);

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
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries as BufferGeometry[]);
        
        // 创建合并后的网格
        const mergedMesh = new Mesh(mergedGeometry, material);
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
  
  // 添加高级剔除策略支持 - 优化版
  const addAdvancedCullingSupport = useCallback((scene: THREE.Scene) => {
    if (!scene) return;
    
    try {
      // 获取相机引用
      let activeCamera: THREE.PerspectiveCamera | null = null;
      scene.traverse((object) => {
        if (object instanceof THREE.PerspectiveCamera) {
          activeCamera = object;
        }
      });
      
      if (!activeCamera) return;
      
      // 创建视锥体
      const frustum = new THREE.Frustum();
      const projectionMatrix = new THREE.Matrix4();
      
      // 遍历场景中的所有对象
      let cullingCount = 0;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // 跳过已经被合并的对象
          if (object.userData.isMerged) return;
          
          // 跳过标记为不可剔除的对象
          if (object.userData.noCulling) return;
          
          // 计算世界边界
          if (!object.geometry.boundingSphere) {
            object.geometry.computeBoundingSphere();
          }
          
          if (object.geometry.boundingSphere) {
            // 获取世界边界
            const worldPosition = new THREE.Vector3();
            object.getWorldPosition(worldPosition);
            const worldRadius = object.geometry.boundingSphere.radius * Math.max(
              object.scale.x,
              object.scale.y,
              object.scale.z
            );
            
            // 应用高级剔除策略
            const cullingResults = {
              frustumCulled: false,
              occlusionCulled: false,
              distanceCulled: false
            };
            
            // 1. 距离剔除
            const maxDistance = VISUALIZATION_CONFIG.maxCameraDistance || 1000;
            const distanceToCamera = worldPosition.distanceTo(activeCamera!.position);
            if (distanceToCamera > maxDistance) {
              cullingResults.distanceCulled = true;
            } else {
              // 2. 视锥体剔除
              projectionMatrix.multiplyMatrices(activeCamera!.projectionMatrix, activeCamera!.matrixWorldInverse);
              frustum.setFromProjectionMatrix(projectionMatrix);
              
              // 计算世界边界球
              const worldSphere = new THREE.Sphere(worldPosition, worldRadius);
              
              if (!frustum.intersectsSphere(worldSphere)) {
                cullingResults.frustumCulled = true;
              } else {
                // 3. 遮挡剔除（简化版本，实际项目中可以使用更复杂的算法）
                // 这里使用简单的距离优先级，实际项目中可以使用Octree或BVH进行更精确的遮挡检测
                const occlusionPriority = distanceToCamera / maxDistance;
                if (occlusionPriority > 0.8 && Math.random() > 0.5) {
                  cullingResults.occlusionCulled = true;
                }
              }
            }
            
            // 保存剔除结果到对象的userData
            object.userData.culling = cullingResults;
            
            // 根据剔除结果设置对象可见性
            object.visible = !(cullingResults.frustumCulled || cullingResults.occlusionCulled || cullingResults.distanceCulled);
            
            if (!object.visible) {
              cullingCount++;
            }
          }
        }
      });
      
      console.log(`高级剔除策略已应用，剔除了 ${cullingCount} 个不可见对象`);
    } catch (error) {
      console.error('添加高级剔除策略失败:', error);
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
        
        // 添加高级剔除策略支持
        addAdvancedCullingSupport(scene);
      } catch (error) {
        console.error('Children render error:', error);
        setHasError(error instanceof Error ? error : new Error('Children rendering failed'));
      }
    }
  }, [isInitialized, children, scene, camera, renderer, controls, mergeGeometries, addLODSupport, addAdvancedCullingSupport, performanceOptions.enableBatchRendering]);

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
        <div className="flex flex-col items-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50">
          <div className="mb-4 w-12 h-12 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
          <p className="text-sm text-blue-300 mb-2">{preloadComplete ? '初始化3D场景...' : '预加载资源中...'}</p>
          
          {/* 资源预加载进度 */}
          {!preloadComplete && (
            <div className="w-64 mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{resourcesLoaded}/{totalResources}</span>
                <span>{preloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${preloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-400">
                已加载资源: {resourcesLoaded} / {totalResources}
              </div>
            </div>
          )}
          
          {/* 资源统计 */}
          {preloadComplete && resourcesLoaded > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              已加载 {resourcesLoaded} 个资源
            </div>
          )}
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