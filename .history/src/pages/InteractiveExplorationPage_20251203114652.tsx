import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, easeOut } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'sonner';
import ThreeJSVisualization from '../components/ThreeJSVisualization';

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
          staggerChildren: 0.1,
          duration: 0.7,
          ease: easeOut
        }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
          duration: 0.5,
          ease: easeOut
        }
  }
};

const simulationVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
          duration: 0.6,
          ease: easeOut
        }
  }
};

// 模拟类型配置
const SIMULATION_TYPES = [
  { id: 'spacetime', label: '时空运动' },
  { id: 'gravity', label: '引力场' },
  { id: 'electromagnetic', label: '电磁场' }
] as const;

// 初始参数配置
const DEFAULT_PARAMETERS = {
  spacetime: { speed: 1, c: 1 },
  gravity: { mass: 1, distance: 2 },
  electromagnetic: { charge: 1, strength: 1 }
};

const InteractiveExplorationPage: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<string>('spacetime');
  const [parameters, setParameters] = useState<any>(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  // 使用useCallback优化事件处理函数
  const handleParameterChange = useCallback((simulation: string, paramName: string, value: number) => {
    setParameters((prev: typeof parameters) => ({
      ...prev,
      [simulation]: {
        ...prev[simulation],
        [paramName]: value
      }
    }));
    toast.success(`已更新 ${paramName} 参数为 ${value}`);
  }, []);
  
  // 保存场景函数
  const saveScene = useCallback(() => {
    toast.success('场景已保存');
  }, []);
  
  // 重置参数函数
  const resetParameters = useCallback(() => {
    setParameters(DEFAULT_PARAMETERS);
    toast.success('参数已重置');
  }, []);
  
  // 切换模拟类型函数
  const handleSimulationChange = useCallback((simulationId: string) => {
    setIsLoading(true);
    setActiveSimulation(simulationId);
  }, []);

  // 使用自定义渲染函数创建3D可视化
  const createVisualization = useCallback(({ scene }: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls; }) => {
    // 设置scene引用
    sceneRef.current = scene;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // 添加坐标系
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // 添加网格
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // 根据当前选择的模拟类型创建不同的可视化
    switch (activeSimulation) {
      case 'spacetime':
        createSpacetimeSimulation(scene);
        break;
      case 'gravity':
        createGravitySimulation(scene);
        break;
      case 'electromagnetic':
        createElectromagneticSimulation(scene);
        break;
      default:
        createSpacetimeSimulation(scene);
    }
    
    // 初始化完成，隐藏加载指示器
    setIsLoading(false);
  }, [activeSimulation, parameters]);
  
  // 时空运动模拟
  const createSpacetimeSimulation = (scene: THREE.Scene) => {
    // 创建时空轨迹
    const spacetimeGeometry = new THREE.BufferGeometry();
    const points: THREE.Vector3[] = [];
    
    // 创建螺旋轨迹
    for (let i = 0; i < 500; i++) {
      const angle = i * 0.1;
      const radius = 3 + Math.sin(i * 0.01) * 2;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          i * 0.05
        )
      );
    }
    
    spacetimeGeometry.setFromPoints(points);
    const spacetimeMaterial = new THREE.LineBasicMaterial({ color: 0x45b7d1 });
    const spacetimeLine = new THREE.Line(spacetimeGeometry, spacetimeMaterial);
    scene.add(spacetimeLine);
    
    // 创建运动粒子
    const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    const movingParticle = new THREE.Mesh(particleGeometry, particleMaterial);
    scene.add(movingParticle);
    
    // 动画更新
    let index = 0;
    scene.userData.update = () => {
      index = (index + 0.5 * parameters.spacetime.speed) % points.length;
      movingParticle.position.copy(points[Math.floor(index)]);
    };
    
    // 参数更新
    scene.userData.updateParameters = (newParams: any) => {
      // 参数已在state中更新，这里可以添加额外的逻辑
    };
  };

  // 引力场模拟
  const createGravitySimulation = (scene: THREE.Scene) => {
    // 创建中心质量
    const massGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const massMaterial = new THREE.MeshPhongMaterial({ color: 0xff6348 });
    const centralMass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(centralMass);

    // 创建环绕物体
    const orbiterGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const orbiterMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
    const orbiter = new THREE.Mesh(orbiterGeometry, orbiterMaterial);
    scene.add(orbiter);

    // 创建引力场可视化
    const fieldParticles = new THREE.Group();
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x45b7d1 });
    
    for (let i = 0; i < 100; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 4;
      particle.position.set(
        radius * Math.cos(angle),
        Math.random() * 2 - 1,
        radius * Math.sin(angle)
      );
      particle.userData.angle = angle;
      particle.userData.radius = radius;
      fieldParticles.add(particle);
    }
    
    scene.add(fieldParticles);

    // 动画更新
    let angle = 0;
    scene.userData.update = () => {
      angle += 0.01 * (parameters.gravity.mass / Math.pow(parameters.gravity.distance, 1.5));
      
      // 更新环绕物体位置
      const r = parameters.gravity.distance;
      orbiter.position.set(
        r * Math.cos(angle),
        0,
        r * Math.sin(angle)
      );
      
      // 更新引力场粒子
      fieldParticles.children.forEach((particle: any) => {
        particle.userData.angle += 0.001 * (parameters.gravity.mass / Math.pow(particle.userData.radius, 2));
        particle.position.set(
          particle.userData.radius * Math.cos(particle.userData.angle),
          particle.position.y,
          particle.userData.radius * Math.sin(particle.userData.angle)
        );
        
        // 粒子大小表示场强
        const fieldStrength = parameters.gravity.mass / Math.pow(particle.userData.radius, 2);
        particle.scale.set(fieldStrength * 2, fieldStrength * 2, fieldStrength * 2);
        
        // 粒子颜色深浅表示场强
        const intensity = Math.min(fieldStrength * 10, 1);
        (particle.material as THREE.MeshBasicMaterial).color.setRGB(
          0.27, 0.72, 0.82 * intensity
        );
      });
      
      // 更新中心质量大小
      centralMass.scale.set(
        parameters.gravity.mass,
        parameters.gravity.mass,
        parameters.gravity.mass
      );
    };

    // 参数更新
    scene.userData.updateParameters = (newParams: any) => {
      // 参数已在state中更新，这里可以添加额外的逻辑
    };
  };

  // 电磁场模拟
  const createElectromagneticSimulation = (scene: THREE.Scene) => {
    // 创建电荷
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const chargeMaterial = new THREE.MeshPhongMaterial({ color: 0x9c27b0 });
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(charge);

    // 创建电场线
    const fieldLines = new THREE.Group();
    const numLines = 12;
    
    for (let i = 0; i < numLines; i++) {
      const angle1 = (i / numLines) * Math.PI * 2;
      
      for (let j = 0; j < 6; j++) {
        const angle2 = (j / 6) * Math.PI * 2;
        const lineGeometry = new THREE.BufferGeometry();
        const points: THREE.Vector3[] = [];
        
        for (let r = 0.8; r <= 5; r += 0.1) {
          const x = r * Math.sin(angle1) * Math.cos(angle2);
          const y = r * Math.sin(angle1) * Math.sin(angle2);
          const z = r * Math.cos(angle1);
          points.push(new THREE.Vector3(x, y, z));
        }
        
        lineGeometry.setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffeb3b,
          transparent: true,
          opacity: 0.7
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        fieldLines.add(line);
      }
    }
    
    scene.add(fieldLines);

    // 创建磁场效应（环形）
    const magneticField = new THREE.Group();
    const numRings = 5;
    
    for (let i = 0; i < numRings; i++) {
      const radius = 1 + i * 0.8;
      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          chargeStrength: { value: parameters.electromagnetic.strength }
        },
        vertexShader: `
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float chargeStrength;
          
          void main() {
            float pulse = sin(time * 3.0) * 0.5 + 0.5;
            gl_FragColor = vec4(0.0, 0.5, 1.0, 0.3 * pulse * chargeStrength);
          }
        `,
        transparent: true
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      magneticField.add(ring);
    }
    
    scene.add(magneticField);

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;
      
      // 更新磁场效果
      magneticField.children.forEach((ring: any) => {
        if (ring.material.uniforms) {
          ring.material.uniforms.time.value = time;
          ring.material.uniforms.chargeStrength.value = parameters.electromagnetic.strength;
        }
      });
      
      // 更新电场线强度
      fieldLines.children.forEach((line: any, index: number) => {
        const intensity = parameters.electromagnetic.strength;
        (line.material as THREE.LineBasicMaterial).opacity = 0.3 + intensity * 0.4;
        (line.material as THREE.LineBasicMaterial).color.setRGB(
          1.0,
          0.92, 
          0.15 * (1 + Math.sin(time + index * 0.5) * 0.5)
        );
      });
      
      // 更新电荷大小
      charge.scale.set(
        parameters.electromagnetic.charge,
        parameters.electromagnetic.charge,
        parameters.electromagnetic.charge
      );
    };

    // 参数更新
    scene.userData.updateParameters = (newParams: any) => {
      // 参数已在state中更新，这里可以添加额外的逻辑
    };
  };

  // 使用useCallback优化更新函数
  const updateVisualization = useCallback((deltaTime: number) => {
    if (sceneRef.current && sceneRef.current.userData.update) {
      sceneRef.current.userData.update();
    }
  }, []);

  // 渲染参数控制滑块
  const renderParameterControls = () => {
    const paramConfig = {
      spacetime: [
        { name: 'speed', label: '运动速度', min: 0.1, max: 3, unit: 'x' },
        { name: 'c', label: '光速系数 (c)', min: 0.1, max: 3, unit: '' }
      ],
      gravity: [
        { name: 'mass', label: '质量大小', min: 0.5, max: 3, unit: 'x' },
        { name: 'distance', label: '轨道距离', min: 1, max: 5, unit: '' }
      ],
      electromagnetic: [
        { name: 'charge', label: '电荷大小', min: 0.5, max: 3, unit: 'x' },
        { name: 'strength', label: '场强系数', min: 0.1, max: 3, unit: 'x' }
      ]
    };
    
    return paramConfig[activeSimulation as keyof typeof paramConfig].map(param => (
      <div key={param.name} className="space-y-1">
        <label className="block text-sm text-blue-200">{param.label}</label>
        <input
          type="range"
          min={param.min}
          max={param.max}
          step="0.1"
          value={parameters[activeSimulation][param.name]}
          onChange={(e) => handleParameterChange(activeSimulation, param.name, parseFloat(e.target.value))}
          className="w-full bg-blue-900/30 h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all duration-300 hover:accent-blue-400"
          aria-label={`调整${param.label}`}
        />
        <div className="text-right text-xs text-blue-400">{parameters[activeSimulation][param.name].toFixed(1)}{param.unit}</div>
      </div>
    ));
  };

  // 渲染模拟说明
  const renderSimulationDescription = () => {
    const descriptions = {
      spacetime: {
        title: '时空运动模拟',
        content: [
          '此模拟展示了空间和时间的统一关系。根据统一场论，时间是空间本身的运动，物体在空间中的运动可以用时空同一化方程来描述。',
          '通过调整速度和光速系数，您可以观察不同条件下的时空运动轨迹变化。'
        ],
        formula: '时空同一化方程: r(t) = Ct'
      },
      gravity: {
        title: '引力场模拟',
        content: [
          '此模拟展示了引力场的分布和作用效果。根据统一场论，引力场是空间的加速运动产生的效应。',
          '您可以调整中心质量大小和环绕物体的轨道距离，观察引力场强度和运动轨迹的变化。'
        ],
        formula: '引力场定义: A = -Gk(Δn/Δs)(r/r)'
      },
      electromagnetic: {
        title: '电磁场模拟',
        content: [
          '此模拟展示了电荷产生的电场和磁场分布。根据统一场论，电磁场与引力场存在内在联系，可以相互转化。',
          '通过调整电荷大小和场强系数，您可以观察电磁场分布的变化。'
        ],
        formula: '电场定义: E = -kk\'/4πε₀Ω² (dΩ/dt)(r/r³)'
      }
    };
    
    const desc = descriptions[activeSimulation as keyof typeof descriptions];
    
    return (
      <div>
        <h2 className="text-xl font-bold text-blue-300 mb-2 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
          {desc.title}
        </h2>
        {desc.content.map((paragraph, index) => (
          <p key={index} className="text-blue-100/80 text-sm mb-2 leading-relaxed">
            {paragraph}
          </p>
        ))}
        <div className="bg-[#0a0a14] p-2 rounded-lg border border-blue-800/30 font-mono text-xs text-blue-300 shadow-inner shadow-blue-900/10">
          {desc.formula}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="relative w-full h-full flex flex-col bg-[#0a0a14] p-0 m-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 顶部导航栏 - 固定在顶部，半透明设计 */}
      <div className="bg-gradient-to-b from-[#0a0a14]/80 to-transparent backdrop-blur-md absolute top-0 left-0 right-0 z-50 p-2">
        <motion.h1
            className="text-2xl md:text-3xl font-bold text-center text-blue-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
          交互式探索系统
        </motion.h1>
      </div>
      
      {/* 3D可视化区域 - 全屏显示 */}
      <div className="relative w-full h-full">
        <ThreeJSVisualization
          onInit={createVisualization}
          onAnimationFrame={updateVisualization}
          cameraConfig={{ position: { x: 0, y: 0, z: 10 } }}
          sceneConfig={{ backgroundColor: 0x0a0a14 }}
          controlsConfig={{
              enableDamping: true,
              dampingFactor: 0.05
            }}
            className="w-full h-full"
        />
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a14]/80 z-10">
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
        
        {/* 控制面板切换按钮 */}
        <div className="absolute top-2 left-2 z-40 flex gap-2">
          <motion.button
            onClick={() => setShowControls(!showControls)}
            className="px-3 py-1 bg-blue-900/50 backdrop-blur-sm text-white text-xs rounded-md hover:bg-blue-800/70 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showControls ? '隐藏控制面板' : '显示控制面板'}
          </motion.button>
          <motion.button
            onClick={() => setShowDescription(!showDescription)}
            className="px-3 py-1 bg-blue-900/50 backdrop-blur-sm text-white text-xs rounded-md hover:bg-blue-800/70 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showDescription ? '隐藏说明' : '显示说明'}
          </motion.button>
        </div>
        
        {/* 左侧控制面板 - 可折叠设计 */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute top-16 left-2 bg-gradient-to-r from-[#0a0a14]/95 to-transparent backdrop-blur-md z-40 p-4 rounded-lg max-w-[300px] max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
                <span className="text-blue-500">⚙️</span>
                模拟控制面板
              </h2>
              
              {/* 模拟类型选择 */}
              <div className="mb-4">
                <h3 className="text-base font-medium text-blue-300 mb-2">选择模拟类型</h3>
                <div className="space-y-1">
                  {SIMULATION_TYPES.map(sim => (
                    <motion.button
                      key={sim.id}
                      onClick={() => handleSimulationChange(sim.id)}
                      className={`w-full text-left p-2 rounded-md transition-all duration-300 ${activeSimulation === sim.id ? 'bg-blue-600/20 text-blue-300 border-l-3 border-blue-500' : 'hover:bg-blue-900/20 text-blue-100/70'}`}
                      whileHover={{ x: 3, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`选择${sim.label}模拟`}
                    >
                      {sim.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 参数控制 */}
              <div className="mb-4">
                <h3 className="text-base font-medium text-blue-300 mb-2">参数调整</h3>
                <div className="space-y-3">
                  {renderParameterControls()}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={saveScene}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="保存当前场景"
                >
                  <span className="text-blue-100">💾</span>
                  保存场景
                </motion.button>
                <motion.button
                  onClick={resetParameters}
                  className="flex-1 px-3 py-2 bg-transparent border border-blue-600 text-blue-300 text-sm rounded-md hover:bg-blue-900/20 transition-colors duration-300 flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="重置所有参数"
                >
                  <span className="text-blue-300">🔄</span>
                  重置参数
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 底部说明面板 - 可折叠设计 */}
        <AnimatePresence>
          {showDescription && (
            <motion.div
              className="absolute bottom-2 left-0 right-0 bg-gradient-to-t from-[#0a0a14]/95 to-transparent backdrop-blur-md z-40 p-3 max-h-[30vh] overflow-y-auto"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
            >
              {renderSimulationDescription()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InteractiveExplorationPage;