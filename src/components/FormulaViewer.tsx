import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from '@/lib/utils';
import { useThreeSceneOptimized } from '@/hooks/useThreeSceneOptimized';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  createBackgroundGrid, 
  createSpaceTimeVisualization, 
  createHelixVisualization, 
  createFieldLinesVisualization, 
  createMathSymbolVisualization,
  addParticles
} from '@/lib/visualizationUtils';
import VisualizationControlPanel from './VisualizationControlPanel';

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
  const visualizationContainerRef = useRef<HTMLDivElement>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  
  // 性能监控状态
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    renderTime: 0,
    frameCount: 0,
    lastFpsUpdate: 0
  });
  
  // 信息框显示状态
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(true);
  
  // 可视化舞台全屏状态
  const [isVisualizationFullscreen, setIsVisualizationFullscreen] = useState(false);
  
  // 切换可视化舞台全屏模式
  const toggleVisualizationFullscreen = useCallback(() => {
    if (!visualizationContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      visualizationContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);
  
  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsVisualizationFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // 可视化控制参数
  const [particleCount, setParticleCount] = useState(1000);
  const [particleColor, setParticleColor] = useState('#0070f3');
  const [particleOpacity, setParticleOpacity] = useState(0.8);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [size, setSize] = useState(1.0);

  // 使用优化后的Three.js场景hook
  const { scene, camera, renderer, controls, isLoading: isSceneLoading } = useThreeSceneOptimized({
    containerRef,
    onPerformanceUpdate: (stats) => {
      setPerformanceStats(stats);
    },
    particleCount,
    particleColor,
    particleOpacity,
    autoRotate: isAutoRotate,
    speed,
    size
  });
  
  // 重置相机位置
  const resetCamera = useCallback(() => {
    if (camera && controls) {
      camera.position.set(0, 0, 5);
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.reset();
    }
  }, [camera, controls]);
  
  // 使用键盘快捷键hook
  useKeyboardShortcuts({
    camera,
    controls,
    onToggleInfoPanel: () => setIsInfoPanelVisible(prev => !prev),
    onToggleFullscreen: toggleVisualizationFullscreen,
    onResetCamera: resetCamera
  });
  
  // 合并加载状态
  useEffect(() => {
    setIsLoading(isSceneLoading);
  }, [isSceneLoading]);
  
  // 根据公式更新3D可视化
  useEffect(() => {
    if (!formula) return;
    
    setIsLoading(true);
    
    // 清空场景中的现有对象，优化资源释放
    
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
  }, [formula, scene]);
  
  // 创建公式的3D可视化
  const createFormulaVisualization = (formulaId: number, scene: THREE.Scene) => {
    // 根据公式ID创建不同的可视化效果
    switch (formulaId) {
      case 1: // 时空同一化方程 - 创建空间坐标系
        createSpaceTimeVisualization(scene);
        // 添加额外粒子
        addParticles(scene, 300, 0x00ffff);
        break;
      case 2: // 三维螺旋时空方程 - 创建螺旋线
        createHelixVisualization(scene);
        // 添加额外粒子
        addParticles(scene, 500, 0xffffff);
        break;
      case 7: // 宇宙大统一方程 - 创建场线可视化
        createFieldLinesVisualization(scene);
        // 添加额外粒子
        addParticles(scene, 300, 0xffffff);
        break;
      default: // 默认创建数学符号和粒子云
        createMathSymbolVisualization(scene);
    }
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
            onClick={() => setIsInfoPanelVisible(prev => !prev)}
            className="p-2 rounded-full transition-all duration-300 transform bg-indigo-600/70 hover:bg-indigo-500/80 hover:scale-110"
            aria-label={isInfoPanelVisible ? "隐藏信息框" : "显示信息框"}
          >
            <i className={`fa ${isInfoPanelVisible ? 'fa-info-circle' : 'fa-info-circle-o'} transition-all duration-300`}></i>
          </button>
          <button 
            onClick={toggleVisualizationFullscreen}
            className="p-2 rounded-full transition-all duration-300 transform bg-indigo-600/70 hover:bg-indigo-500/80 hover:scale-110"
            aria-label={isVisualizationFullscreen ? "退出全屏" : "进入全屏"}
          >
            <i className={`fa ${isVisualizationFullscreen ? 'fa-compress' : 'fa-expand'} transition-all duration-300`}></i>
          </button>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex overflow-hidden flex-col flex-1 lg:flex-row">
        {/* 3D可视化区域 */}
        <div 
          ref={visualizationContainerRef}
          className={`relative flex-1 bg-gray-900 lg:min-h-0 transition-all duration-300 ${!isInfoPanelVisible ? 'lg:w-full' : ''}`}
        >
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
          
          {/* 交互提示 */}
          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute bottom-4 left-4 p-3 text-xs text-gray-300 rounded-lg border backdrop-blur-md bg-gray-800/80 border-indigo-500/30"
            >
              <div className="space-y-1">
                <p><i className="mr-1 fa fa-mouse-pointer"></i> 拖动旋转视角</p>
                <p><i className="mr-1 fa fa-search-plus"></i> 滚轮缩放</p>
                <p><i className="mr-1 fa fa-expand"></i> 点击全屏按钮进入全屏模式</p>
              </div>
            </motion.div>
          )}
          
          {/* 可视化控制面板 */}
          <VisualizationControlPanel
            onParticleCountChange={setParticleCount}
            onParticleColorChange={setParticleColor}
            onParticleOpacityChange={setParticleOpacity}
            onAutoRotateChange={setIsAutoRotate}
            onSpeedChange={setSpeed}
            onSizeChange={setSize}
            particleCount={particleCount}
            particleColor={particleColor}
            particleOpacity={particleOpacity}
            isAutoRotate={isAutoRotate}
            speed={speed}
            size={size}
          />
        </div>
        
        {/* 公式和说明区域 */}
        <AnimatePresence>
          {isInfoPanelVisible && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
                    className="flex justify-center items-center mr-4 w-12 h-12 text-lg font-bold text-indigo-400 bg-gradient-to-br rounded-full border shadow-lg from-indigo-500/30 to-purple-500/30 border-indigo-500/20 shadow-indigo-500/10"
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
                    <p className="mt-1 text-xs text-indigo-400/80">公式 #{formula.id}</p>
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
                  <div className="relative">
                    <span>{renderFormula(formula.expression)}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(formula.expression).then(() => {
                          // 可以添加复制成功的提示
                          console.log('公式已复制到剪贴板');
                        }).catch(err => {
                          console.error('复制失败:', err);
                        });
                      }}
                      className="absolute top-2 right-2 p-1 text-xs text-gray-300 rounded-full transition-all duration-200 bg-gray-800/50 hover:bg-gray-700/70"
                      aria-label="复制公式"
                    >
                      <i className="fa fa-copy"></i>
                    </button>
                  </div>
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
                    className="p-5 leading-relaxed text-gray-300 rounded-lg border shadow-inner bg-gray-800/50 border-gray-700/50"
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
                  className="flex justify-center items-center p-3 mt-6 text-xs text-gray-400 rounded-full border bg-gray-800/50 border-gray-700/50"
                  whileHover={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}>

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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default React.memo(FormulaViewer);