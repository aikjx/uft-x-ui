import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ThreeJSVisualization from '../components/ThreeJSVisualization';
import { PageContainer } from '../App';

// 统一场论核心公式数据
const formulas = [
  {
    id: 1,
    name: '时空同一化方程',
    expression: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    description: '揭示时间和空间的本质联系，时间是空间本身的运动',
    category: '时空方程'
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    expression: '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
    description: '描述物质点在三维空间中的螺旋运动轨迹',
    category: '时空方程'
  },
  {
    id: 3,
    name: '质量定义方程',
    expression: 'm = k \\cdot \\frac{dn}{d\\Omega}',
    description: '质量本质是物体周围空间运动的运动量',
    category: '动力学方程'
  },
  {
    id: 4,
    name: '引力场定义方程',
    expression: '\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}',
    description: '引力场是空间的加速运动效应',
    category: '场方程'
  },
  {
    id: 5,
    name: '静止动量方程',
    expression: '\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}',
    description: '静止物体的动量与静止质量和光速有关',
    category: '动力学方程'
  },
  {
    id: 6,
    name: '运动动量方程',
    expression: '\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})',
    description: '运动物体的动量表达式，包含了相对论效应',
    category: '动力学方程'
  },
  {
    id: 7,
    name: '宇宙大统一方程（力方程）',
    expression: 'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
    description: '统一四种基本力的核心方程，揭示力的本质',
    category: '统一方程'
  },
  {
    id: 8,
    name: '空间波动方程',
    expression: '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
    description: '描述空间波动的传播规律',
    category: '场方程'
  },
  {
    id: 9,
    name: '电荷定义方程',
    expression: 'q = k^{\\prime}k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}',
    description: '电荷本质是空间角动量的变化率',
    category: '场方程'
  },
  {
    id: 10,
    name: '电场定义方程',
    expression: '\\vec{E} = -\\frac{kk^{\\prime}}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
    description: '电场是空间角动量变化产生的效应',
    category: '场方程'
  },
  {
    id: 11,
    name: '磁场定义方程',
    expression: '\\vec{B} = \\frac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
    description: '磁场是运动电荷产生的相对论效应',
    category: '场方程'
  },
  {
    id: 12,
    name: '变化的引力场产生电磁场',
    expression: '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})',
    description: '引力场与电磁场的相互转化关系',
    category: '统一方程'
  },
  {
    id: 13,
    name: '磁矢势方程',
    expression: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
    description: '磁矢势与磁场的关系',
    category: '场方程'
  },
  {
    id: 14,
    name: '变化的引力场产生电场',
    expression: '\\vec{E} = -f\\frac{d\\vec{A}}{dt}',
    description: '引力场变化如何产生电场',
    category: '统一方程'
  },
  {
    id: 15,
    name: '变化的磁场产生引力场和电场',
    expression: '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}',
    description: '磁场变化如何影响引力场和电场',
    category: '统一方程'
  },
  {
    id: 16,
    name: '统一场论能量方程',
    expression: 'e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}',
    description: '能量与质量的等价关系，扩展了爱因斯坦质能方程',
    category: '统一方程'
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    expression: '\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}',
    description: '基于统一场论的光速飞行器原理',
    category: '应用方程'
  },
  {
    id: 18,
    name: '核力场定义方程',
    expression: '\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}',
    description: '核力场的数学表达式',
    category: '场方程'
  },
  {
    id: 19,
    name: '引力光速统一方程',
    expression: 'Z = Gc/2',
    description: '揭示引力常数与光速的内在联系',
    category: '统一方程'
  }
];

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const FormulaVisualizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 缓存公式数据
  const formulaList = useMemo(() => formulas, []);
  
  // 使用useCallback优化导航函数
  const handleFormulaSelect = useCallback((formula: any) => {
    setIsLoading(true);
    setSelectedFormula(formula);
    navigate(`/formulas/${formula.id}`);
  }, [navigate]);

  // 初始化选中的公式
  useEffect(() => {
    if (id) {
      const formula = formulas.find(f => f.id.toString() === id);
      if (formula) {
        setSelectedFormula(formula);
      }
    } else if (formulas.length > 0) {
      setSelectedFormula(formulas[0]);
    }
  }, [id]);

  // 使用自定义渲染函数创建3D可视化
  const createVisualization = useCallback((scene: THREE.Scene) => {
    if (!selectedFormula) return;
    
    // 添加坐标轴
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    
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

  // 格式化数学公式
  const formatFormula = useMemo(() => {
    return (expression: string) => {
      return expression;
    };
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
            variants={itemVariants}
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
              className="bg-[#121228] rounded-xl p-6 border border-blue-900/30 mb-6 shadow-lg shadow-blue-900/5"
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
              <div className="bg-[#0a0a14] p-4 rounded-lg border border-blue-800/30 font-mono text-blue-300 overflow-x-auto shadow-inner shadow-blue-900/10">
                {formatFormula(selectedFormula.expression)}
              </div>
            </motion.div>

            {/* 3D可视化区域 - 使用优化的ThreeJSVisualization组件 */}
            <div className="flex-1 bg-[#121228] rounded-xl border border-blue-900/30 overflow-hidden relative min-h-[400px] lg:min-h-[500px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#121228]/80 z-10">
                  <div className="text-blue-400 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>正在渲染3D可视化...</span>
                  </div>
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
