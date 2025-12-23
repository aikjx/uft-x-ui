import { useEffect, useRef, useState } from 'react';
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

const FormulaViewer: React.FC<FormulaViewerProps> = ({ 
  formula, 
  onToggleTheme,
  isMenuOpen,
  toggleFullscreen,
  isFullscreen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始化Three.js场景
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1117);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 清空容器并添加渲染器
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
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
    
    // 动画循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 窗口大小调整处理
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
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
    
     // 清空场景中的现有对象
    const scene = sceneRef.current;
    while (scene.children.length > 2) { // 保留光源
      const object = scene.children[scene.children.length - 1];
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
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      } else if (object instanceof THREE.Line) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
      scene.remove(object);
    }
    
    // 添加背景网格效果
    createBackgroundGrid(scene);
    
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
  
  // 添加粒子
  const addParticles = (scene: THREE.Scene, count: number, color: number) => {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = count;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({ 
      size: 0.05, 
      color: color,
      transparent: true,
      opacity: 0.8
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

  // 当公式表达式更新时，使用KaTeX渲染公式
  useEffect(() => {
    if (!formula) return;
    
    // 检查KaTeX是否已加载
    if (window.katex && window.renderMathInElement) {
      // 延迟渲染，确保DOM已更新
      setTimeout(() => {
        const formulaElements = document.querySelectorAll('.formula-renderer');
        formulaElements.forEach(el => {
          if (el instanceof HTMLElement) {
            window.renderMathInElement(el, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          }
        });
      }, 100);
    }
  }, [formula]);
  
  if (!formula) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <p>请选择一个公式进行查看</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300",
      isMenuOpen ? "lg:ml-0" : "ml-0"
    )}>
      {/* 顶部控制栏 */}
      <div className="p-4 bg-gray-800/80 backdrop-blur-md border-b border-indigo-900/50 flex justify-between items-center z-20 shadow-lg">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <i className="fa fa-atom text-white"></i>
          </motion.div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            公式可视化展示
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300 transform hover:scale-110"
            aria-label="切换主题"
          >
            <i className="fa fa-moon"></i>
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-indigo-600/70 hover:bg-indigo-500/80 transition-all duration-300 transform hover:scale-110"
            aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            <i className={`fa ${isFullscreen ? 'fa-compress' : 'fa-expand'} transition-all duration-300`}></i>
          </button>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 3D可视化区域 */}
        <div className="flex-1 relative bg-gray-900">
          <div ref={containerRef} className="absolute inset-0"></div>
          
          {/* 加载指示器 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-gray-300 font-medium"
                >
                  正在构建{formula.name}的3D可视化...
                </motion.span>
              </div>
            </div>
          )}
        </div>
        
        {/* 公式和说明区域 */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full lg:w-96 xl:w-[480px] bg-gray-800/90 backdrop-blur-md border-l border-indigo-900/50 overflow-y-auto p-6 transition-all duration-300 shadow-xl"
        >
          <div className="space-y-6">
            {/* 公式标题和编号 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-400 font-bold text-lg mr-4 border border-indigo-500/20">
                {formula.id}
              </div>
              <h2 className="text-2xl font-bold text-white">{formula.name}</h2>
            </motion.div>
            
            {/* 公式显示 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gray-900/70 border border-indigo-500/30 rounded-xl shadow-lg overflow-hidden relative"
            >
              {/* 装饰背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 pointer-events-none"></div>
              
              {/* 公式内容 */}
              <div className="formula-renderer text-center text-blue-300 text-2xl py-4 overflow-x-auto relative z-10">
                $$ {renderFormula(formula.expression)} $$
              </div>
              
              {/* 发光效果 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl opacity-70 pointer-events-none"></div>
            </motion.div>
            
            {/* 公式说明 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-purple-400 flex items-center">
                <i className="fa fa-info-circle mr-2"></i> 公式说明
              </h3>
              <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                {formula.description}
              </p>
              
              {/* 公式应用示例 */}
              <div className="mt-6 pt-4 border-t border-indigo-500/20">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center mb-3">
                  <i className="fa fa-lightbulb mr-2"></i> 应用场景
                </h3>
                <div className="bg-gray-700/30 p-5 rounded-lg border border-indigo-500/10 shadow-inner">
                  <p className="text-gray-300">
                    此公式在统一场论中用于描述{formula.name.toLowerCase()}，
                    帮助我们理解宇宙的基本规律和物理现象。通过可视化，
                    我们可以更直观地把握{formula.name.toLowerCase()}的本质内涵。
                  </p>
                </div>
              </div>
              
              {/* 互动提示 */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 flex items-center justify-center text-xs text-gray-400"
              >
                <i className="fa fa-hand-pointer mr-1"></i>
                <span>在3D区域拖动鼠标可旋转视角</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FormulaViewer;