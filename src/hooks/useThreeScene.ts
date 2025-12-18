import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface UseThreeSceneOptions {
  antialias?: boolean;
  alpha?: boolean;
  backgroundColor?: number;
}

interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export const useThreeScene = (containerRef: React.RefObject<HTMLElement>, options: UseThreeSceneOptions = {}) => {
  const { 
    antialias = true, 
    alpha = true, 
    backgroundColor = 0x000208 
  } = options;
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(45, 30, 45);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias, alpha });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 清理场景中的所有对象
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        } else if (object instanceof THREE.Points) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        } else if (object instanceof THREE.Line) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        }
      });
      
      renderer.dispose();
      
      if (containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [containerRef, antialias, alpha, backgroundColor]);
  
  const animate = (callback: (time: number) => void) => {
    const animateFrame = () => {
      animationRef.current = requestAnimationFrame(animateFrame);
      const time = performance.now() * 0.001;
      callback(time);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animateFrame();
  };
  
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    animate,
    stopAnimation
  };
};
