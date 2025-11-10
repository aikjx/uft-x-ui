import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import ThreeJSVisualization from '../components/ThreeJSVisualization';
import { MathJax } from '../components/MathJax';
import { useFormula } from '../hooks/useFormula';
import { useThreeScene } from '../hooks/useThreeScene';
import { ANIMATION_VARIANTS } from '../constants';
import { cn, showNotification } from '../utils';
import { FormulaService } from '../services/formulaService';
import { VisualizationService } from '../services/visualizationService';

const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS;

const FormulaVisualizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedFormula, isLoading, selectFormula, formulas, formulasByCategory } = useFormula();
  const { createScene: createThreeScene, getScene, clearScene, setUpdateFunction, updateScene } = useThreeScene();
  
  // 使用useCallback优化导航函数
  const handleFormulaSelect = useCallback((formula: any) => {
    selectFormula(formula);
    navigate(`/formulas/${formula.id}`);
    showNotification.success(`已选择公式：${formula.name}`);
  }, [navigate, selectFormula]);

  // 页面挂载时初始化场景
  React.useEffect(() => {
    return () => {
      // 清理Three.js资源
      clearScene();
    };
  }, [clearScene]);

  // 使用自定义渲染函数创建3D可视化
  const createVisualization = useCallback((scene: THREE.Scene) => {
    if (!selectedFormula) return;
    
    // 添加坐标轴和网格
    const axesHelper = VisualizationService.createAxesHelper(3);
    scene.add(axesHelper);
    
    const gridHelper = VisualizationService.createGridHelper(10, 10);
    scene.add(gridHelper);
    
    // 根据公式ID创建不同的可视化
    switch (selectedFormula.id) {
      case 1: // 时空同一化方程
        createSpaceTimeVisualization(scene);
        break;
      case 2: // 三维螺旋时空方程
        createHelixVisualization(scene);
        break;
      case 4: // 引力场定义方程
        createGravitationalFieldVisualization(scene);
        break;
      case 7: // 宇宙大统一方程
        createUnifiedForceVisualization(scene);
        break;
      default:
        // 默认可视化
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
    }
    
    setIsLoading(false);
  }, [selectedFormula]);
  
  // 更新可视化的动画函数
  const updateVisualization = useCallback((scene: THREE.Scene, deltaTime: number) => {
    if (scene.userData.update) {
      scene.userData.update();
    }
  }, []);



  // 时空同一化方程可视化
  const createSpaceTimeVisualization = (scene: THREE.Scene) => {
    // 创建时间轴
    const timeLineGeometry = new THREE.BufferGeometry();
    const timeLinePoints = [];
    for (let i = -5; i <= 5; i += 0.1) {
      timeLinePoints.push(new THREE.Vector3(i, 0, 0));
    }
    timeLineGeometry.setFromPoints(timeLinePoints);
    const timeLineMaterial = new THREE.LineBasicMaterial({ color: 0xff6b6b });
    const timeLine = new THREE.Line(timeLineGeometry, timeLineMaterial);
    scene.add(timeLine);

    // 创建空间点运动轨迹
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = [];
    for (let t = 0; t <= 10; t += 0.1) {
      // C = (1, 1, 1) 简化示例
      pathPoints.push(new THREE.Vector3(t * 0.3, t * 0.3, t * 0.3));
    }
    pathGeometry.setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x4ecdc4 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);

    // 添加动态点
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x45b7d1 });
    const movingPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    scene.add(movingPoint);

    // 动画更新
    let t = 0;
    scene.userData.update = () => {
      t += 0.01;
      movingPoint.position.set(t * 0.3, t * 0.3, t * 0.3);
      if (t > 10) t = 0;
    };
  };

  // 三维螺旋时空方程可视化
  const createHelixVisualization = (scene: THREE.Scene) => {
    const helixGeometry = new THREE.BufferGeometry();
    const helixPoints = [];
    const r = 1; // 半径
    const h = 0.5; // 高度系数
    const omega = 2; // 角速度
    
    for (let t = 0; t <= 10; t += 0.05) {
      const x = r * Math.cos(omega * t);
      const y = r * Math.sin(omega * t);
      const z = h * t;
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    
    helixGeometry.setFromPoints(helixPoints);
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x95e1d3 });
    const helixLine = new THREE.Line(helixGeometry, helixMaterial);
    scene.add(helixLine);

    // 添加螺旋管道效果
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(helixPoints),
      100,
      0.05,
      8,
      false
    );
    const tubeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x5352ed, 
      transparent: true,
      opacity: 0.3
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);
  };

  // 引力场定义方程可视化
  const createGravitationalFieldVisualization = (scene: THREE.Scene) => {
    // 中心质点
    const centralGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const centralMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const centralMass = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralMass);

    // 场线
    const fieldLines = [];
    const numLines = 12;
    const numPointsPerLine = 20;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];
      
      for (let j = 1; j <= numPointsPerLine; j++) {
        const r = 0.7 + j * 0.3;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4facfe,
        linewidth: 2
      });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      fieldLines.push(fieldLine);
    }
  };

  // 宇宙大统一方程可视化
  const createUnifiedForceVisualization = (scene: THREE.Scene) => {
    // 创建四个分力向量
    const forces = [
      { color: 0xff6b6b, vector: new THREE.Vector3(1, 0, 0), label: 'dP/dt' },
      { color: 0x4ecdc4, vector: new THREE.Vector3(0, 1, 0), label: 'C·dm/dt' },
      { color: 0x45b7d1, vector: new THREE.Vector3(-0.5, 0, 0), label: '-V·dm/dt' },
      { color: 0x96ceb4, vector: new THREE.Vector3(0, -0.5, 0), label: 'm·dC/dt - m·dV/dt' }
    ];

    forces.forEach((force, index) => {
      const { color, vector, label } = force;
      
      // 向量线
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        vector
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // 箭头
      const arrowHelper = new THREE.ArrowHelper(
        vector.clone().normalize(),
        vector,
        0.1,
        color
      );
      scene.add(arrowHelper);
    });

    // 合力
    const resultant = forces.reduce((sum, force) => sum.add(force.vector), new THREE.Vector3());
    const resultantGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      resultant
    ]);
    const resultantMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffd93d, 
      linewidth: 3 
    });
    const resultantLine = new THREE.Line(resultantGeometry, resultantMaterial);
    scene.add(resultantLine);

    const resultantArrow = new THREE.ArrowHelper(
      resultant.clone().normalize(),
      resultant,
      0.1,
      0xffd93d
    );
    scene.add(resultantArrow);
  };

  // 使用服务层的公式格式化方法
  const formatFormula = useCallback((expression: string) => {
    return FormulaService.formatFormulaExpression(expression);
  }, []);

  if (!selectedFormula) {
    return (
      <PageContainer>
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a14]">
          <div className="text-blue-400">加载中...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col bg-[#0a0a14] py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* 左侧公式列表 - 改进响应式布局 */}
          <motion.div
            className="lg:w-1/4 bg-[#121228] rounded-xl p-4 border border-blue-900/30 h-fit sticky top-4 lg:max-h-[80vh] overflow-hidden flex flex-col"
            variants={formulaVariants}
          >
            <h2 className="text-xl font-bold text-blue-200 mb-4">统一场论核心公式</h2>
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-900/30 scrollbar-track-transparent">
              {formulaList.map((formula) => (
                <motion.button
                  key={formula.id}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${selectedFormula.id === formula.id ? 'bg-blue-600/20 border-l-4 border-blue-500 text-blue-300' : 'hover:bg-blue-900/20 text-blue-100/70 hover:shadow-lg hover:shadow-blue-900/10'}`}
                  onClick={() => handleFormulaSelect(formula)}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`选择公式：${formula.name}`}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="font-medium mb-1">{formula.id}. {formula.name}</div>
                  <div className="text-xs text-blue-200/60">{formula.category}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 右侧可视化和详情 - 改进响应式布局 */}
          <motion.div
            className="lg:w-3/4 flex flex-col"
            variants={itemVariants}
          >
            {/* 公式详情 */}
            <motion.div
              className="bg-[#121228] rounded-xl p-6 border border-blue-900/30 mb-6 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300"
              key={selectedFormula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <span className="text-blue-500">{selectedFormula.id}.</span>
                {selectedFormula.name}
              </h3>
              <div className="text-lg text-blue-100/80 mb-4 leading-relaxed">{selectedFormula.description}</div>
              <div className="bg-[#0a0a14] p-6 rounded-lg border border-blue-800/30 overflow-x-auto shadow-inner shadow-blue-900/10">
                <MathJax formula={formatFormula(selectedFormula.expression)} />
              </div>
            </motion.div>

            {/* 3D可视化区域 - 使用优化的ThreeJSVisualization组件 */}
            <div className="flex-1 bg-[#121228] rounded-xl border border-blue-900/30 overflow-hidden relative min-h-[400px] lg:min-h-[500px] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#121228]/80 z-10">
                  <motion.div 
                className="text-blue-400 flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <span>正在渲染3D可视化...</span>
              </motion.div>
                </div>
              )}
              <ThreeJSVisualization
                onSceneInit={createVisualization}
                onAnimate={updateVisualization}
                initialCameraPosition={{ x: 0, y: 0, z: 5 }}
                backgroundColor={0x0a0a14}
                enableOrbitControls={true}
                orbitControlsConfig={{
                  enableDamping: true,
                  dampingFactor: 0.05
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default FormulaVisualizationPage;
