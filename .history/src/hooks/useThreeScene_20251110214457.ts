import { useRef, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
  updateScene: (deltaTime: number) => void;
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
    maxObjects = 1000
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
      scene.autoUpdate = autoUpdate;
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
  
  // 动画循环
  const animate = useCallback(() => {
    if (!isSceneReady || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const now = performance.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;
    frameIndexRef.current++;

    // 性能监控和优化
    if (enablePerformanceMonitoring) {
      const fps = performanceMonitor.updateFPS();
      setCurrentFPS(fps);
      
      // 更新性能模式状态
      const performanceMode = performanceMonitor.getPerformanceMode();
      if (performanceMode !== isPerformanceMode) {
        setIsPerformanceMode(performanceMode);
        
        // 当性能模式改变时应用优化
        if (performanceMode) {
          // 性能模式下降低渲染质量
          const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(true);
          rendererRef.current.setPixelRatio(optimalPixelRatio);
          
          // 禁用抗锯齿
          if (rendererRef.current.capabilities.isWebGL2) {
            // WebGL2可以动态调整抗锯齿
            const canvas = rendererRef.current.domElement;
            const gl = canvas.getContext('webgl2');
            if (gl) {
              gl.getContextAttributes()!.antialias = false;
            }
          }
          
          // 禁用阴影
          if (rendererRef.current.shadowMap) {
            rendererRef.current.shadowMap.enabled = false;
          }
        } else {
          // 质量模式下恢复高质量设置
          const optimalPixelRatio = renderOptimizer.calculateOptimalPixelRatio(false);
          rendererRef.current.setPixelRatio(optimalPixelRatio);
          
          // 恢复抗锯齿
          if (rendererRef.current.capabilities.isWebGL2) {
            const canvas = rendererRef.current.domElement;
            const gl = canvas.getContext('webgl2');
            if (gl) {
              gl.getContextAttributes()!.antialias = VISUALIZATION_CONFIG.performance.antialiasing;
            }
          }
          
          // 恢复阴影
          if (rendererRef.current.shadowMap && VISUALIZATION_CONFIG.performance.enableShadowMap) {
            rendererRef.current.shadowMap.enabled = true;
          }
        }
      }
      
      // 帧率控制 - 如果需要，跳过某些帧
      if (renderOptimizer.shouldSkipFrame(frameIndexRef.current, fps)) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    // 更新控制器
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // 执行场景更新
    if (sceneRef.current && sceneRef.current.userData.update) {
      sceneRef.current.userData.update(deltaTime);
    }

    // 渲染场景
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // 更新绘制调用计数用于性能监控
    if (enablePerformanceMonitoring && 
        rendererRef.current && 
        rendererRef.current.info && 
        rendererRef.current.info.render) {
      performanceMonitor.updateDrawCallCount(rendererRef.current.info.render.calls);
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isSceneReady, isPerformanceMode, enablePerformanceMonitoring]);
  
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

  // 添加对象到场景
  const addToScene = useCallback((object: THREE.Object3D) => {
    if (sceneRef.current) {
      sceneRef.current.add(object);
      return true;
    }
    return false;
  }, []);

  // 从场景中移除对象
  const removeFromScene = useCallback((object: THREE.Object3D) => {
    if (sceneRef.current) {
      sceneRef.current.remove(object);
      return true;
    }
    return false;
  }, []);

  // 清理场景 - 安全清理场景内容
  const clearScene = useCallback(() => {
    if (sceneRef.current) {
      // 移除场景中的所有对象
      while (sceneRef.current.children.length > 0) {
        const child = sceneRef.current.children[0];
        sceneRef.current.remove(child);
        
        // 安全清理对象资源
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        } else if (child instanceof THREE.Line || child instanceof THREE.Points) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      }
      
      // 重置场景属性
      sceneRef.current.background = null;
      sceneRef.current.fog = null;
    }
  }, []);
  
  // 生命周期管理
  useEffect(() => {
    // 初始化完整场景
    const success = initializeFullScene();
    
    // 开始动画循环
    if (success && isSceneReady) {
      animate();
    }

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);

      // 安全移除渲染器DOM元素
      if (rendererRef.current) {
        const canvas = rendererRef.current.domElement;
        if (containerRef.current && canvas.parentNode === containerRef.current) {
          containerRef.current.removeChild(canvas);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      clearScene();
    };
  }, [initializeFullScene, isSceneReady, animate, handleResize, clearScene, containerRef]);

  // 设置场景更新函数
  const setUpdateFunction = useCallback((updateFn: (deltaTime: number) => void) => {
    if (sceneRef.current) {
      sceneRef.current.userData.update = updateFn;
    }
  }, []);

  // 执行场景更新
  const updateScene = useCallback((deltaTime: number) => {
    if (sceneRef.current && sceneRef.current.userData.update) {
      sceneRef.current.userData.update(deltaTime);
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