import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion';
import { useThreeScene } from '../hooks/useThreeScene';
import { VisualizationService } from '../services/visualizationService';
import { cn } from '../utils';

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
  
  // 使用自定义hooks管理场景状态
  const { createScene: createThreeScene, getScene, clearScene, updateScene } = useThreeScene({ containerRef });
  
  // 保存Three.js实例的引用
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
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

  // 初始化Three.js场景
  const initialize = useCallback(() => {
    if (!containerRef.current || !webglSupported) return;

    try {
      const width = Math.max(minWidth, containerRef.current.clientWidth);
      const height = Math.max(minHeight, containerRef.current.clientHeight);
      setDimensions({ width, height });

      // 使用服务创建场景
      const scene = createThreeScene();
      
      // 应用场景配置
      if (sceneConfig.backgroundColor) {
        scene.background = new THREE.Color(sceneConfig.backgroundColor);
      } else {
        scene.background = new THREE.Color(0x0a0a14);
      }
      
      // 应用雾效果
      if (sceneConfig.fog) {
        VisualizationService.addFogToScene(scene, sceneConfig.fog);
      }

      // 创建相机
      const { fov = 75, near = 0.1, far = 1000, position = { x: 0, y: 0, z: 5 } } = cameraConfig;
      const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
      camera.position.set(position.x, position.y, position.z);
      cameraRef.current = camera;

      // 创建渲染器
      const { antialias = true, alpha = false, physicallyCorrectLights = true, shadowMapEnabled = false } = rendererConfig;
      const renderer = new THREE.WebGLRenderer({ 
        antialias, 
        alpha 
      });
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比例以提高性能
      renderer.physicallyCorrectLights = physicallyCorrectLights;
      
      if (shadowMapEnabled) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      
      // 清除容器并添加渲染器
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 创建控制器
      const { 
        enableDamping = true, 
        dampingFactor = 0.05, 
        rotateSpeed = 0.5, 
        zoomSpeed = 0.8,
        enablePan = true,
        autoRotate = false,
        autoRotateSpeed = 2.0
      } = controlsConfig;
      
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = enableDamping;
      controls.dampingFactor = dampingFactor;
      controls.rotateSpeed = rotateSpeed;
      controls.zoomSpeed = zoomSpeed;
      controls.enablePan = enablePan;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = autoRotateSpeed;
      controlsRef.current = controls;

      // 使用服务添加默认光照
      const { ambientLight, directionalLight } = VisualizationService.setupDefaultLighting(scene, rendererConfig.shadowMapEnabled || false);

      // 调用用户初始化函数
      if (onInit && scene && camera && renderer && controls) {
        onInit({ scene, camera, renderer, controls });
      }

      setIsInitialized(true);
      setHasError(null);
    } catch (error) {
      console.error('Three.js initialization error:', error);
      setHasError(error instanceof Error ? error : new Error('Three.js initialization failed'));
    }
  }, [onInit, cameraConfig, controlsConfig, rendererConfig, sceneConfig, minWidth, minHeight, webglSupported]);

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

  // 动画循环
  const animate = useCallback(() => {
    if (paused) return;

    animationFrameRef.current = requestAnimationFrame(animate);
    
    // 计算时间差
    const currentTime = performance.now();
    const deltaTime = lastFrameTimeRef.current ? (currentTime - lastFrameTimeRef.current) / 1000 : 0;
    lastFrameTimeRef.current = currentTime;

    // 更新控制器
    if (controlsRef.current) {
      controlsRef.current.update();
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
    const scene = getScene();
    updateScene(scene, deltaTime);

    // 渲染场景
    if (rendererRef.current && scene && cameraRef.current) {
      try {
        rendererRef.current.render(scene, cameraRef.current);
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
  }, [paused, onAnimationFrame, getScene, updateScene]);

  // 清理Three.js资源
  const cleanup = useCallback(() => {
    // 取消动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 清理控制器
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
    
    // 清理渲染器
    if (rendererRef.current && containerRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // 使用hook清理场景
    clearScene();
    
    // 清理相机
    cameraRef.current = null;
    setIsInitialized(false);
  }, [clearScene, getScene]);

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
  }, [initialize, handleResize, animate, autoFit, paused, checkWebGLSupport, cleanup]);

  // 当暂停状态改变时重新开始/停止动画循环
  useEffect(() => {
    if (isInitialized && !paused && !animationFrameRef.current) {
      lastFrameTimeRef.current = 0;
      animate();
    }
  }, [isInitialized, paused, animate]);

  // 渲染用户内容
  useEffect(() => {
    if (isInitialized && children && getScene() && cameraRef.current && rendererRef.current && controlsRef.current) {
      try {
        children({
          scene: getScene(),
          camera: cameraRef.current,
          renderer: rendererRef.current,
          controls: controlsRef.current
        });
      } catch (error) {
        console.error('Children render error:', error);
        setHasError(error instanceof Error ? error : new Error('Children rendering failed'));
      }
    }
  }, [isInitialized, children, getScene]);

  // 错误渲染
  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'relative w-full overflow-hidden flex flex-col items-center justify-center bg-red-900/10 border border-red-500/30 rounded-lg',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <h3 className="text-red-400 font-medium mb-2">Three.js 渲染错误</h3>
        <p className="text-red-300/80 text-sm text-center px-4">{hasError.message}</p>
        <button 
          onClick={initialize}
          className="mt-4 px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-300 rounded-md hover:bg-red-600/30 transition-colors"
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
          'relative w-full overflow-hidden flex flex-col items-center justify-center bg-blue-900/10 border border-blue-500/30 rounded-lg',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <h3 className="text-blue-400 font-medium mb-2">浏览器不支持 WebGL</h3>
        <p className="text-blue-300/80 text-sm text-center px-4">
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
          'relative w-full overflow-hidden flex items-center justify-center bg-gray-900/50',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-blue-300 text-sm">初始化3D场景...</p>
        </div>
      </div>
    );
  }

  // 正常渲染
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden',
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
  );
};

// 重新导出VisualizationService中的方法，保持向后兼容性
export { 
  createGrid, 
  createAxesHelper, 
  createFormulaText, 
  createParticleSystem 
} from '../services/visualizationService';

export default ThreeJSVisualization;
