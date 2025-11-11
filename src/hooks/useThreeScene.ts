import { useRef, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VISUALIZATION_CONFIG } from '../constants';
import { visualizationService, createGridHelper, createAxesHelper } from '../services/visualizationService';
import { performanceMonitor, renderOptimizer } from '../utils/performanceUtils';

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
    performanceThreshold = 30, // 默认30FPS为阈值
    useBatchRendering = true,
    enableFog = true,
    dynamicPixelRatio = true
  } = options;
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameIndexRef = useRef<number>(0);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFPS, setCurrentFPS] = useState<number>(60);
  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(false);

  // 创建新场景
  const createScene = useCallback(() => {
    try {
      // 使用静态方法创建场景
      const scene = new THREE.Scene();
      // autoUpdate是THREE.Object3D的属性，Scene继承自Object3D
      (scene as any).autoUpdate = autoUpdate;
      scene.background = new THREE.Color(VISUALIZATION_CONFIG.backgroundColor);
      sceneRef.current = scene;
      setIsSceneReady(true);
      setError(null);
      return scene;
    } catch (err) {
      console.error('Failed to create scene:', err);
      setError(err instanceof Error ? err : new Error('Unknown scene creation error'));
      return new THREE.Scene();
    }
  }, [autoUpdate]);
  
  // 初始化完整场景（包含相机、渲染器等）
  const initializeFullScene = useCallback(() => {
    try {
      if (!containerRef.current) {
        throw new Error('Container element is null');
      }

      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();

      // 创建场景
      const scene = createScene();
      
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        VISUALIZATION_CONFIG.fov,
        width / height,
        VISUALIZATION_CONFIG.near,
        VISUALIZATION_CONFIG.far
      );
      camera.position.copy(cameraPosition);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({
        antialias: VISUALIZATION_CONFIG.performance.antialiasing,
        alpha: true,
        // 性能优化选项
        powerPreference: 'high-performance',
        premultipliedAlpha: false
      });
      
      // 应用渲染优化
      const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(false);
      renderer.setSize(width, height);
      renderer.setPixelRatio(optimalPixelRatio);
      renderer.setClearColor(VISUALIZATION_CONFIG.clearColor, VISUALIZATION_CONFIG.clearAlpha);
      
      // 性能优化设置
      renderer.autoClear = true;
      renderer.localClippingEnabled = false; // 禁用局部裁剪以提高性能
      
      // 阴影优化
      if (VISUALIZATION_CONFIG.performance.enableShadowMap) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = false;
      }
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 创建控制器
      if (enableControls) {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = VISUALIZATION_CONFIG.maxCameraDistance;
        controls.minDistance = VISUALIZATION_CONFIG.minCameraDistance;
        controlsRef.current = controls;
      }

      // 设置灯光 - 直接创建光照
      const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
      const directionalLight = new THREE.DirectionalLight(0xffffff, directionalLightIntensity);
      directionalLight.position.set(5, 10, 7.5);
      
      if (VISUALIZATION_CONFIG.performance.enableShadowMap) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
      }
      
      scene.add(ambientLight, directionalLight);

      // 添加网格辅助线
      if (VISUALIZATION_CONFIG.showGrid) {
        const gridHelper = createGridHelper(
          VISUALIZATION_CONFIG.gridSize,
          VISUALIZATION_CONFIG.gridDivisions
        );
        scene.add(gridHelper);
      }

      // 添加坐标轴
      if (VISUALIZATION_CONFIG.showAxes) {
        const axesHelper = createAxesHelper(
          VISUALIZATION_CONFIG.axesSize
        );
        scene.add(axesHelper);
      }

      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to initialize full scene:', err);
      setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      return false;
    }
  }, [containerRef, cameraPosition, enableControls, ambientLightIntensity, directionalLightIntensity, createScene]);
  
  // 应用性能模式设置的函数
  const applyPerformanceModeSettings = useCallback((performanceMode: boolean) => {
    if (!rendererRef.current) return;
    
    // 应用性能优化设置
    const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(performanceMode);
    rendererRef.current.setPixelRatio(optimalPixelRatio);
    
    // 抗锯齿控制
    if (rendererRef.current.capabilities.isWebGL2) {
      const canvas = rendererRef.current.domElement;
      const gl = canvas.getContext('webgl2');
      if (gl) {
        gl.getContextAttributes()!.antialias = performanceMode ? false : VISUALIZATION_CONFIG.performance.antialiasing;
      }
    }
    
    // 阴影控制
    if (rendererRef.current.shadowMap) {
      rendererRef.current.shadowMap.enabled = performanceMode ? false : VISUALIZATION_CONFIG.performance.enableShadowMap;
      if (rendererRef.current.shadowMap.enabled && !performanceMode) {
        rendererRef.current.shadowMap.needsUpdate = true;
      }
    }
  }, []);
  
  // 单一优化的动画循环
  const animate = useCallback(() => {
    if (!isSceneReady || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
      // 条件不满足时，延迟重试，避免高频率检查
      animationIdRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 100);
      return;
    }

    const now = performance.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;
    frameIndexRef.current++;

    // 性能监控和优化
    if (enablePerformanceMonitoring) {
      // 大幅降低性能监控更新频率，每30帧更新一次
      if (frameIndexRef.current % 30 === 0) {
        const fps = performanceMonitor.updateFPS();
        // 仅当FPS变化超过阈值时才更新状态
        if (Math.abs(fps - currentFPS) > 1) {
          setCurrentFPS(fps);
        }
        
        // 更新性能模式状态
        const performanceMode = performanceMonitor.getPerformanceMode();
        if (performanceMode !== isPerformanceMode) {
          setIsPerformanceMode(performanceMode);
          applyPerformanceModeSettings(performanceMode);
        }
      }
      
      // 帧率控制 - 更智能的帧跳过策略
      if (renderOptimizer.shouldSkipFrame(frameIndexRef.current, currentFPS)) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    // 更新控制器
    if (controlsRef.current && controlsRef.current.enabled) {
      controlsRef.current.update();
    }

    // 执行场景更新
    updateScene(sceneRef.current, deltaTime);

    // 渲染场景
    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    } catch (error) {
      console.error('Rendering error:', error);
      setError(error instanceof Error ? error : new Error('Rendering failed'));
    }
    
    // 更新绘制调用计数用于性能监控
    if (enablePerformanceMonitoring && 
        rendererRef.current.info && 
        rendererRef.current.info.render) {
      performanceMonitor.updateDrawCallCount(rendererRef.current.info.render.calls);
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isSceneReady, currentFPS, isPerformanceMode, enablePerformanceMonitoring, applyPerformanceModeSettings, updateScene]);
  
  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // 更新相机
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    // 更新渲染器 - 应用自适应像素比率
    const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(isPerformanceMode);
    rendererRef.current.setPixelRatio(optimalPixelRatio);
    rendererRef.current.setSize(width, height);
  }, [containerRef, isPerformanceMode]);

  // 获取当前场景
  const getScene = useCallback((): THREE.Scene | null => {
    return sceneRef.current;
  }, []);

  // 添加对象到场景 - 优化版本
  const addToScene = useCallback((object: THREE.Object3D) => {
    if (!sceneRef.current) return false;
    
    try {
      // 检查对象是否已在场景中
      if (sceneRef.current.children.includes(object)) {
        console.warn('Object already in scene');
        return true;
      }
      
      // 检查对象数量限制
      if (maxObjects > 0 && sceneRef.current.children.length >= maxObjects) {
        console.warn(`Maximum object limit of ${maxObjects} reached`);
        return false;
      }
      
      // 性能优化：预加载纹理和几何体
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat && mat.map && typeof mat.map.load === 'function') {
              mat.map.load();
            }
          });
        } else if (object.material.map && typeof object.material.map.load === 'function') {
          object.material.map.load();
        }
      }
      
      sceneRef.current.add(object);
      return true;
    } catch (error) {
      console.error('Error adding object to scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to add object'));
      return false;
    }
  }, [maxObjects]);

  // 从场景中移除对象 - 优化版本
  const removeFromScene = useCallback((object: THREE.Object3D) => {
    if (!sceneRef.current) return false;
    
    try {
      // 检查对象是否在场景中
      if (!sceneRef.current.children.includes(object)) {
        console.warn('Object not found in scene');
        return true; // 视为成功，因为对象不在场景中
      }
      
      // 从场景中移除
      sceneRef.current.remove(object);
      
      // 释放对象资源
      const disposeObject = (obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(material => material.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        } else if (obj instanceof THREE.Line || obj instanceof THREE.Points) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        } else if (obj instanceof THREE.Group) {
          obj.children.forEach(child => disposeObject(child));
        }
      };
      
      // 递归释放对象
      disposeObject(object);
      
      return true;
    } catch (error) {
      console.error('Error removing object from scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to remove object'));
      return false;
    }
  }, []);

  // 清理场景 - 增强版本
  const clearScene = useCallback(() => {
    if (!sceneRef.current) return;
    
    try {
      // 递归释放对象资源
      const disposeRecursive = (object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              if (material.map) material.map.dispose();
              if (material.lightMap) material.lightMap.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.specularMap) material.specularMap.dispose();
              if (material.envMap) material.envMap.dispose();
              material.dispose();
            });
          } else if (object.material) {
            if (object.material.map) object.material.map.dispose();
            if (object.material.lightMap) object.material.lightMap.dispose();
            if (object.material.normalMap) object.material.normalMap.dispose();
            if (object.material.specularMap) object.material.specularMap.dispose();
            if (object.material.envMap) object.material.envMap.dispose();
            object.material.dispose();
          }
        } else if (object instanceof THREE.Line || object instanceof THREE.Points) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        } else if (object instanceof THREE.SkinnedMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
          if (object.skeleton) object.skeleton.dispose();
        } else if (object instanceof THREE.Group || object instanceof THREE.Object3D) {
          // 递归处理子对象
          for (let i = object.children.length - 1; i >= 0; i--) {
            disposeRecursive(object.children[i]);
          }
        }
      };
      
      // 临时保存辅助线对象（如果需要）
      const helpersToKeep: THREE.Object3D[] = [];
      if (VISUALIZATION_CONFIG.showGrid || VISUALIZATION_CONFIG.showAxes) {
        sceneRef.current.children.forEach(child => {
          if (child.name === 'gridHelper' || child.name === 'axesHelper') {
            helpersToKeep.push(child);
          }
        });
      }
      
      // 移除并清理所有对象
      while (sceneRef.current.children.length > 0) {
        const child = sceneRef.current.children[0];
        sceneRef.current.remove(child);
        disposeRecursive(child);
      }
      
      // 重置场景属性
      sceneRef.current.background = new THREE.Color(VISUALIZATION_CONFIG.backgroundColor);
      sceneRef.current.fog = null;
      sceneRef.current.matrixAutoUpdate = true;
      
      // 恢复辅助线
      helpersToKeep.forEach(helper => sceneRef.current?.add(helper));
      
      // 添加默认光照（如果被移除）
      if (VISUALIZATION_CONFIG.autoAddLighting) {
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
        const directionalLight = new THREE.DirectionalLight(0xffffff, directionalLightIntensity);
        directionalLight.position.set(5, 10, 7.5);
        sceneRef.current.add(ambientLight, directionalLight);
      }
      
    } catch (error) {
      console.error('Error clearing scene:', error);
      setError(error instanceof Error ? error : new Error('Failed to clear scene'));
    }
  }, [ambientLightIntensity, directionalLightIntensity]);
  
  // 生命周期管理
  useEffect(() => {
    // 初始化完整场景
    const success = initializeFullScene();
    
    // 开始动画循环
    if (success && isSceneReady) {
      // 初始化性能监控
      if (enablePerformanceMonitoring) {
        performanceMonitor.reset();
      }
      
      // 使用优化的animate函数
      animate();
    }

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理函数 - 增强版本
    return () => {
      // 清理动画帧
      if (animationIdRef.current) {
        // 检查是requestAnimationFrame还是setTimeout的ID
        if (typeof animationIdRef.current === 'number') {
          if (animationIdRef.current.toString().length < 15) {
            cancelAnimationFrame(animationIdRef.current);
          } else {
            clearTimeout(animationIdRef.current);
          }
        }
        animationIdRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);

      // 重置时间引用
      lastTimeRef.current = 0;
      frameIndexRef.current = 0;
      
      // 安全移除渲染器DOM元素
      if (rendererRef.current) {
        try {
          const canvas = rendererRef.current.domElement;
          if (containerRef.current && canvas.parentNode === containerRef.current) {
            containerRef.current.removeChild(canvas);
          }
          rendererRef.current.dispose();
        } catch (error) {
          console.error('Error disposing renderer:', error);
        }
        rendererRef.current = null;
      }

      // 清理控制器
      if (controlsRef.current) {
        try {
          controlsRef.current.dispose();
        } catch (error) {
          console.error('Error disposing controls:', error);
        }
        controlsRef.current = null;
      }

      // 清理场景
      clearScene();
      
      // 重置状态
      setIsSceneReady(false);
      setError(null);
      setCurrentFPS(60);
      setIsPerformanceMode(false);
    };
  }, [initializeFullScene, isSceneReady, handleResize, clearScene, containerRef, enablePerformanceMonitoring, animate]);

  // 设置场景更新函数
  const setUpdateFunction = useCallback((updateFn: (deltaTime: number) => void) => {
    if (sceneRef.current) {
      sceneRef.current.userData.update = updateFn;
    }
  }, []);

  // 执行场景更新 - 增强版本
  const updateScene = useCallback((scene: THREE.Scene | null, deltaTime: number) => {
    const targetScene = scene || sceneRef.current;
    try {
      if (!targetScene) return;
      
      // 安全调用用户定义的更新函数
      if (targetScene.userData && typeof targetScene.userData.update === 'function') {
        targetScene.userData.update(deltaTime);
      }
      
      // 自动更新场景中的动画对象
      if (targetScene.animations && targetScene.animations.length > 0) {
        targetScene.animations.forEach(animation => {
          if (animation.isAnimationClip && animation.tracks && animation.tracks.length > 0) {
            // 动画更新逻辑可以在这里添加
          }
        });
      }
      
      // 性能优化：仅当需要时更新矩阵
      targetScene.traverse(object => {
        if (object.matrixAutoUpdate === false) {
          // 对象已禁用自动更新，避免不必要的计算
          return;
        }
        
        // 智能判断是否需要更新矩阵
        if (object.position.x !== 0 || object.position.y !== 0 || object.position.z !== 0 ||
            object.rotation.x !== 0 || object.rotation.y !== 0 || object.rotation.z !== 0 ||
            object.scale.x !== 1 || object.scale.y !== 1 || object.scale.z !== 1) {
          object.updateMatrixWorld(false); // 仅更新自身矩阵，不递归
        }
      });
      
    } catch (error) {
      console.error('Error in scene update function:', error);
      // 错误不会导致整个应用崩溃
    }
  }, []);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
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