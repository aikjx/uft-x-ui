import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from '@/lib/utils';

// 公式数据类型
interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
}

interface FormulaViewerProps {
  formula: Formula | null;
  onToggleTheme: () => void;
  isMenuOpen: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

// 移除自定义比较函数，让React.memo使用默认的比较逻辑
// 这样当formula变化时，组件会重新渲染

const FormulaViewer = ({ 
  formula, 
  onToggleTheme,
  isMenuOpen,
  toggleFullscreen,
  isFullscreen
}: FormulaViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  
  // 性能监控状态
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    renderTime: 0,
    frameCount: 0,
    lastFpsUpdate: 0
  });

  // 初始化Three.js场景
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1117);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // 创建渲染器，优化性能设置
    const renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // 仅在低分辨率设备上启用抗锯齿
      powerPreference: 'high-performance', // 优先使用高性能GPU
      alpha: false // 禁用alpha通道，提高性能
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比，减少渲染负担
    renderer.setClearColor(0x0f1117, 1);
    
    // 优化渲染器性能
    renderer.autoClear = true;
    renderer.sortObjects = false; // 禁用对象排序，提高渲染速度
    
    // 清空容器并添加渲染器
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false; // 禁用平移，减少计算负担
    controls.minDistance = 1;
    controls.maxDistance = 20;
    
    // 保存引用
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // 性能监控变量
    let fps = 0;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    let lastRenderTime = 0;
    
    // 动画循环 - 添加渲染节流和性能监控
    const animate = (timestamp: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // 限制渲染频率为60fps
      if (timestamp - lastRenderTime < 16) return;
      
      // 记录渲染开始时间
      const renderStartTime = performance.now();
      
      controls.update();
      renderer.render(scene, camera);
      
      // 记录渲染结束时间并计算渲染时间
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      
      // 更新帧率统计
      frameCount++;
      if (timestamp - lastFpsUpdate >= 1000) { // 每秒更新一次FPS
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = timestamp;
        
        // 更新性能统计
        setPerformanceStats({
          fps,
          renderTime,
          frameCount,
          lastFpsUpdate
        });
        
        // 控制台输出性能统计（仅开发环境）
        if (import.meta.env.DEV) {
          console.log(`🎮 性能统计: FPS = ${fps}, 渲染时间 = ${renderTime.toFixed(2)}ms`);
        }
      }
      
      lastRenderTime = timestamp;
    };
    
    animate(0);
    
    // 窗口大小调整处理 - 添加节流
    let resizeTimeout: number;
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        camera.aspect = containerRef.current!.clientWidth / containerRef.current!.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
      }, 100); // 100ms节流
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);
  
  // 根据公式更新3D可视化
  useEffect(() => {
    if (!formula || !sceneRef.current) return;
    
    setIsLoading(true);
    
    // 清空场景中的现有对象，优化资源释放
    const scene = sceneRef.current;
    
    // 保留光源和网格
    const objectsToKeep = [];
    for (const child of scene.children) {
      if (child instanceof THREE.AmbientLight || 
          child instanceof THREE.DirectionalLight ||
          child instanceof THREE.GridHelper) {
        objectsToKeep.push(child);
      }
    }
    
    // 移除所有其他对象
    for (const child of scene.children) {
      if (!objectsToKeep.includes(child)) {
        // 释放资源
        if (child instanceof THREE.Object3D) {
          // 递归释放子对象资源
          child.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) {
                  obj.material.forEach(material => material.dispose());
                } else {
                  obj.material.dispose();
                }
              }
            }
          });
        }
        scene.remove(child);
      }
    }
    
    // 如果没有背景网格，添加背景网格效果
    let hasGrid = false;
    for (const child of scene.children) {
      if (child instanceof THREE.GridHelper) {
        hasGrid = true;
        break;
      }
    }
    
    if (!hasGrid) {
      createBackgroundGrid(scene);
    }
    
    // 根据公式类型创建不同的可视化效果
    createFormulaVisualization(formula.id, scene);
    
    setIsLoading(false);
  }, [formula]);
  
  // 创建公式的3D可视化
  const createFormulaVisualization = (formulaId: number, scene: THREE.Scene) => {
    // 根据公式ID创建不同的可视化效果
    switch (formulaId) {
      case 1: // 时空同一化方程 - 创建空间坐标系
        createSpaceTimeVisualization(scene);
        break;
      case 2: // 三维螺旋时空方程 - 创建螺旋线
        createHelixVisualization(scene);
        break;
      case 7: // 宇宙大统一方程 - 创建场线可视化
        createFieldLinesVisualization(scene);
        break;
      default: // 默认创建数学符号和粒子云
        createMathSymbolVisualization(scene);
    }
  };
  
  // 背景网格效果
  const createBackgroundGrid = (scene: THREE.Scene) => {
    // 创建主网格
    const gridHelper = new THREE.GridHelper(10, 10, 0x222233, 0x111122);
    scene.add(gridHelper);
    
    // 创建辅助网格
    const gridHelperX = new THREE.GridHelper(10, 10, 0x222233, 0x111122);
    gridHelperX.rotation.x = Math.PI / 2;
    scene.add(gridHelperX);
    
    const gridHelperY = new THREE.GridHelper(10, 10, 0x222233, 0x111122);
    gridHelperY.rotation.y = Math.PI / 2;
    scene.add(gridHelperY);
  };
  
  // 时空同一化方程可视化
  const createSpaceTimeVisualization = (scene: THREE.Scene) => {
    // 创建坐标轴
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // 创建光锥
    createLightCone(scene);
    
    // 创建时间箭头
    createTimeArrow(scene);
    
    // 添加粒子点
    addParticles(scene, 300, 0x00ffff);
  };
  
  // 创建光锥
  const createLightCone = (scene: THREE.Scene) => {
    const geometry = new THREE.ConeGeometry(2, 4, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true
    });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.z = 2;
    scene.add(cone);
    
    const invertedCone = new THREE.Mesh(geometry, material);
    invertedCone.position.z = -2;
    invertedCone.rotation.z = Math.PI;
    scene.add(invertedCone);
  };
  
  // 创建时间箭头
  const createTimeArrow = (scene: THREE.Scene) => {
    const arrowGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.z = 2;
    scene.add(arrow);
  };
  
  // 添加粒子 - 优化性能
  const addParticles = (scene: THREE.Scene, count: number, color: number) => {
    // 根据设备性能调整粒子数量
    const isMobile = window.innerWidth < 768;
    const adjustedCount = isMobile ? Math.floor(count * 0.3) : count;
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = adjustedCount;
    const posArray = new Float32Array(particleCount * 3);
    
    // 使用更高效的随机数生成
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // 优化粒子材质
    const particleMaterial = new THREE.PointsMaterial({ 
      size: isMobile ? 0.03 : 0.05, // 移动设备上使用更小的粒子
      color: color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending, // 使用加法混合，提高视觉效果
      depthWrite: false, // 禁用深度写入，提高性能
      sizeAttenuation: true // 启用大小衰减，提高视觉效果
    });
    
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);
  };
  
  // 三维螺旋时空方程可视化
  const createHelixVisualization = (scene: THREE.Scene) => {
    // 创建螺旋线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(0, 2, 2),
      new THREE.Vector3(-1, 1, 3),
      new THREE.Vector3(0, 0, 4),
      new THREE.Vector3(1, -1, 5),
      new THREE.Vector3(0, -2, 6),
      new THREE.Vector3(-1, -1, 7),
      new THREE.Vector3(0, 0, 8),
    ]);
    
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 2
    });
    
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
    
    // 添加粒子
    addParticles(scene, 500, 0xffffff);
  };
  
  // 场线可视化
  const createFieldLinesVisualization = (scene: THREE.Scene) => {
    const fieldLinesCount = 20;
    
    for (let i = 0; i < fieldLinesCount; i++) {
      // 随机角度和半径
      const angle = (i / fieldLinesCount) * Math.PI * 2;
      const radius = 1 + Math.random() * 2;
      
      // 创建圆形场线
      const curve = new THREE.EllipseCurve(
        0, 0,             // 中心
        radius, radius,   // x, y半径
        0, Math.PI * 2,   // 起始角度，终止角度
        false,            // 顺时针方向
        angle             // 旋转角度
      );
      
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // 随机颜色
      const color = new THREE.Color(`hsl(${angle / (Math.PI * 2) * 360}, 70%, 60%)`);
      
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        linewidth: 1
      });
      
      const line = new THREE.Line(geometry, material);
      line.position.z = (Math.random() - 0.5) * 3;
      scene.add(line);
    }
    
    // 添加中心球体
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff00ff,
      wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // 添加粒子
    addParticles(scene, 300, 0xffffff);
  };
  
  // 默认数学符号可视化
  const createMathSymbolVisualization = (scene: THREE.Scene) => {
    // 创建粒子云
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({ 
      size: 0.05, 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);
    
    // 添加数学符号表示（使用简单的几何体组合表示）
    const symbolGroup = new THREE.Group();
    
    // 创建一个简单的"∇"符号表示
    const line1Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1, 1, 0),
      new THREE.Vector3(1, -1, 0)
    ]);
    const line2Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(-1, -1, 0)
    ]);
    const line3Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0, -1.5, 0)
    ]);
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff00ff,
      linewidth: 3
    });
    
    const line1 = new THREE.Line(line1Geometry, lineMaterial);
    const line2 = new THREE.Line(line2Geometry, lineMaterial);
    const line3 = new THREE.Line(line3Geometry, lineMaterial);
    
    symbolGroup.add(line1, line2, line3);
    symbolGroup.position.set(0, 0, 0);
    scene.add(symbolGroup);
  };
  
  // 使用KaTeX渲染LaTeX公式
  const renderFormula = (expression: string) => {
    // 这里返回原始公式，实际渲染在useEffect中通过KaTeX完成
    return expression;
  };

  // 当公式更新时，使用KaTeX渲染公式
  useEffect(() => {
    if (!formula) return;
    
    // 直接更新DOM内容，确保公式内容已更新
    const formulaElements = document.querySelectorAll('.formula-renderer');
    formulaElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // 直接设置innerHTML，确保内容已更新
        el.innerHTML = `$$ ${formula.expression} $$`;
        
        // 检查KaTeX是否已加载
        if (window.katex && window.renderMathInElement) {
          // 延迟渲染，确保DOM已更新
          const timeoutId = setTimeout(() => {
            window.renderMathInElement(el, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          }, 50);
          
          // 清理函数，避免内存泄漏
          return () => clearTimeout(timeoutId);
        }
      }
    });
  }, [formula]);
  
  if (!formula) {
    return (
      <div className="flex flex-1 justify-center items-center text-gray-400 bg-gray-900">
        <p>请选择一个公式进行查看</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex overflow-hidden flex-col flex-1 h-screen transition-all duration-300",
      isMenuOpen ? "lg:ml-0" : "ml-0"
    )}>
      {/* 顶部控制栏 */}
      <div className="flex z-20 justify-between items-center p-4 border-b shadow-lg backdrop-blur-md bg-gray-800/80 border-indigo-900/50">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          >
            <i className="text-white fa fa-atom"></i>
          </motion.div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            公式可视化展示
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full transition-all duration-300 transform bg-gray-700/50 hover:bg-gray-600/50 hover:scale-110"
            aria-label="切换主题"
          >
            <i className="fa fa-moon"></i>
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full transition-all duration-300 transform bg-indigo-600/70 hover:bg-indigo-500/80 hover:scale-110"
            aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            <i className={`fa ${isFullscreen ? 'fa-compress' : 'fa-expand'} transition-all duration-300`}></i>
          </button>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex overflow-hidden flex-col flex-1 lg:flex-row">
        {/* 3D可视化区域 */}
        <div className="relative flex-1 bg-gray-900 lg:min-h-0">
          <div ref={containerRef} className="absolute inset-0"></div>
          
          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex absolute inset-0 justify-center items-center backdrop-blur-md bg-gray-900/80">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent"
                />
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 font-medium text-gray-300"
                >
                  正在构建{formula.name}的3D可视化...
                </motion.span>
              </div>
            </div>
          )}
        </div>
        
        {/* 公式和说明区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full lg:w-96 xl:w-[480px] bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-indigo-900/50 overflow-y-auto p-4 md:p-6 transition-all duration-300 shadow-xl"
        >
          <div className="space-y-6">
            {/* 公式标题和编号 */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              className="flex items-center"
            >
              <motion.div 
                className="flex justify-center items-center mr-4 w-12 h-12 text-lg font-bold text-indigo-400 bg-gradient-to-br rounded-full border from-indigo-500/30 to-purple-500/30 border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                whileHover={{ 
                  scale: 1.15, 
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)",
                  rotate: 5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {formula.id}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">{formula.name}</h2>
                <p className="text-xs text-indigo-400/80 mt-1">公式 #{formula.id}</p>
              </div>
            </motion.div>
            
            {/* 公式显示 */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ 
                delay: 0.3, 
                type: "spring", 
                stiffness: 250, 
                damping: 20 
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 15px 40px rgba(99, 102, 241, 0.4)",
                rotate: [0, -0.5, 0.5, -0.5, 0],
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              whileTap={{ scale: 0.98 }}
              className="overflow-hidden relative p-6 rounded-xl border shadow-lg bg-gray-900/70 border-indigo-500/30"
            >
              {/* 装饰背景 */}
              <div className="absolute inset-0 bg-gradient-to-br pointer-events-none from-indigo-900/10 to-purple-900/10"></div>
              
              {/* 动态网格背景 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="h-full w-full bg-[linear-gradient(to_right,#6366f110_1px,transparent_1px),linear-gradient(to_bottom,#6366f110_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              </div>
              
              {/* 公式内容 */}
              <div className="overflow-x-auto relative z-10 py-4 text-2xl text-center text-blue-300 formula-renderer">
                $$ {renderFormula(formula.expression)} $$
              </div>
              
              {/* 增强的发光效果 */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r rounded-xl opacity-70 blur-xl pointer-events-none from-indigo-500/20 to-purple-500/20"
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.98, 1.05, 0.98],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              ></motion.div>
            </motion.div>
            
            {/* 公式说明 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                delay: 0.4, 
                type: "spring", 
                stiffness: 250, 
                damping: 20 
              }}
              className="space-y-5"
            >
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-purple-400">
                  <motion.i 
                    className="mr-2 fa fa-info-circle"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.i> 公式说明
                </h3>
              </motion.div>
              
              <motion.p 
                className="p-5 leading-relaxed text-gray-300 rounded-lg border bg-gray-800/50 border-gray-700/50 shadow-inner"
                whileHover={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  borderColor: 'rgba(99, 102, 241, 0.4)'
                }}
                transition={{ duration: 0.3 }}
              >
                {formula.description}
              </motion.p>
              
              {/* 公式应用示例 */}
              <div className="pt-4 mt-6 border-t border-indigo-500/20">
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-purple-400">
                    <motion.i 
                      className="mr-2 fa fa-lightbulb"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    ></motion.i> 应用场景
                  </h3>
                </motion.div>
                
                <motion.div 
                  className="p-5 rounded-lg border shadow-inner bg-gray-700/30 border-indigo-500/10"
                  whileHover={{ 
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                    borderColor: 'rgba(99, 102, 241, 0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-300">
                    此公式在统一场论中用于描述{formula.name.toLowerCase()}，
                    帮助我们理解宇宙的基本规律和物理现象。通过可视化，
                    我们可以更直观地把握{formula.name.toLowerCase()}的本质内涵。
                  </p>
                </motion.div>
              </div>
              
              {/* 互动提示 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex justify-center items-center mt-6 text-xs text-gray-400 p-3 rounded-full bg-gray-800/50 border border-gray-700/50"
                whileHover={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  scale: 1.05
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.i 
                  className="mr-2 fa fa-hand-pointer"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                ></motion.i>
                <span>在3D区域拖动鼠标可旋转视角</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default React.memo(FormulaViewer);