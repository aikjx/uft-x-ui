import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  particleSize?: number;
  particleColor?: number;
  particleOpacity?: number;
  enableMouseInteraction?: boolean;
  enableAutoRotation?: boolean;
  autoRotationSpeed?: number;
  isActive?: boolean; // 控制背景是否激活
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  particleCount = 2000, // 减少粒子数量提高性能
  particleSize = 2,
  particleColor = 0x4a6cf7,
  particleOpacity = 0.6,
  enableMouseInteraction = true,
  enableAutoRotation = true,
  autoRotationSpeed = 0.001,
  isActive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesCountRef = useRef(0);
  const particlePositionsRef = useRef<Float32Array>();
  const lastUpdateRef = useRef(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  
  // 检查是否为移动设备
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 鼠标移动处理 - 使用useCallback优化性能
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enableMouseInteraction) return;
    
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    mouseRef.current.x = (clientX / innerWidth) * 2 - 1;
    mouseRef.current.y = -(clientY / innerHeight) * 2 + 1;
  }, [enableMouseInteraction]);

  // 窗口大小调整处理
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    const { innerWidth, innerHeight } = window;
    cameraRef.current.aspect = innerWidth / innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(innerWidth, innerHeight);
  }, []);

  // 初始化场景
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;
    
    // 移动设备上进一步优化粒子数量
    const actualParticleCount = isMobile ? Math.floor(particleCount * 0.5) : particleCount;
    const actualParticleSize = isMobile ? Math.max(1.5, particleSize * 0.8) : particleSize;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: !isMobile, // 移动设备禁用抗锯齿以提高性能
      powerPreference: 'high-performance' // 优先考虑性能
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比例
    rendererRef.current = renderer;

    // 创建粒子几何体
    particlesCountRef.current = actualParticleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(actualParticleCount * 3);
    particlePositionsRef.current = positions;

    // 初始化粒子位置 - 使用更高效的分布算法
    const spread = isMobile ? 800 : 1000; // 移动设备减小分布范围
    for (let i = 0; i < actualParticleCount * 3; i += 3) {
      // 使用球面分布创建更均匀的粒子场
      const radius = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2; // 方位角
      const phi = Math.random() * Math.PI; // 极角
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: actualParticleSize,
      color: particleColor,
      transparent: true,
      opacity: particleOpacity,
      sizeAttenuation: true,
      depthWrite: false, // 提高性能，减少深度测试
      blending: THREE.AdditiveBlending // 更漂亮的发光效果
    });

    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 添加轨道控制器
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 鼠标交互
    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 动画循环 - 根据设备性能调整更新频率
    const targetFPS = isMobile ? 30 : 60;
    const frameTime = 1000 / targetFPS;
    
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateRef.current;
      
      // 控制更新频率
      if (deltaTime >= frameTime) {
        lastUpdateRef.current = currentTime;
        
        if (controlsRef.current) controlsRef.current.update();
        
        // 自动旋转
        if (enableAutoRotation && particlesRef.current) {
          particlesRef.current.rotation.y += autoRotationSpeed;
        }
        
        // 鼠标交互效果
        if (enableMouseInteraction && particlesRef.current) {
          particlesRef.current.rotation.x += mouseRef.current.y * 0.001;
          particlesRef.current.rotation.y += mouseRef.current.x * 0.001;
        }
        
        // 更新粒子位置 - 移动设备减少更新频率
        if (particlesRef.current && particlePositionsRef.current) {
          // 每N帧更新一次粒子位置，移动设备更少
          const updateInterval = isMobile ? 3 : 1;
          if (Math.floor(currentTime / frameTime) % updateInterval === 0) {
            const positions = particlePositionsRef.current;
            const particlesCount = particlesCountRef.current;
            
            // 减少更新的粒子数量
            const updateRatio = isMobile ? 0.2 : 0.5; // 移动设备只更新20%的粒子
            const particlesToUpdate = Math.floor(particlesCount * updateRatio);
            
            for (let i = 0; i < particlesToUpdate; i++) {
              // 随机选择粒子进行更新
              const index = Math.floor(Math.random() * particlesCount) * 3;
              
              // 使粒子轻微移动
              positions[index] += (Math.random() - 0.5) * 0.05;
              positions[index + 1] += (Math.random() - 0.5) * 0.05;
              positions[index + 2] += (Math.random() - 0.5) * 0.05;
              
              // 边界检查
              if (Math.abs(positions[index]) > spread * 0.5) positions[index] *= 0.99;
              if (Math.abs(positions[index + 1]) > spread * 0.5) positions[index + 1] *= 0.99;
              if (Math.abs(positions[index + 2]) > spread * 0.5) positions[index + 2] *= 0.99;
            }
            
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
        }
        
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.render(scene, cameraRef.current);
        }
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // 资源释放
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach(mat => mat.dispose());
        } else {
          particlesRef.current.material.dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // 清空引用
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      particlesRef.current = null;
      controlsRef.current = null;
    };
  }, [handleMouseMove, handleResize, isActive, particleCount, particleSize, particleColor, 
       particleOpacity, enableMouseInteraction, enableAutoRotation, autoRotationSpeed, isMobile]);

  // 如果不激活，不渲染canvas
  if (!isActive) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none -z-10 ${className}`}
      aria-hidden="true" // 提高可访问性
    />
  );
};

export default ParticleBackground;
