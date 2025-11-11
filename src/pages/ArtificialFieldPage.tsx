import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import ThreeJSVisualization from '../components/ThreeJSVisualization';
import { MathJax } from '../components/MathJax';
import { useThreeScene } from '../hooks/useThreeScene';
import { ANIMATION_VARIANTS } from '../constants/index';
const { tabVariants } = ANIMATION_VARIANTS;
import { cn } from '../utils';
import { VisualizationService } from '../services/visualizationService';

// 定义标签页类型
type TabId = 'principles' | 'applications' | 'time';

// 标签页配置
interface TabConfig {
  id: TabId;
  label: string;
  title: string;
}

const ArtificialFieldPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('principles');
  const [isLoading, setIsLoading] = useState(true);
  const timeRef = useRef<number>(0);
  const sceneRef = useRef<any>(null); // 添加sceneRef引用
  
  // 标签页配置常量
  const tabs: TabConfig[] = [
    { id: 'principles', label: '基础原理', title: '人工场基础原理' },
    { id: 'applications', label: '应用场景', title: '光速飞行器动力学' },
    { id: 'time', label: '时间势差效应', title: '时间势差效应' }
  ];

  // 创建可视化场景
  const createVisualization = useCallback(({ scene }: { scene: THREE.Scene }) => {
      // 不需要设置scene引用，因为ThreeJSVisualization组件会处理
    // 根据当前标签创建不同的可视化
    switch (activeTab) {
      case 'principles':
        createMassReductionVisualization(scene);
        break;
      case 'applications':
        createLightSpeedCraftVisualization(scene);
        break;
      case 'time':
        createTimePotentialVisualization(scene);
        break;
      default:
        createMassReductionVisualization(scene);
    }
    
    setIsLoading(false);
  }, [activeTab]);

  // 更新可视化场景
  const updateVisualization = useCallback((deltaTime: number) => {
    // 这将通过scene.userData.update在ThreeJSVisualization组件内部处理
    timeRef.current += deltaTime;
  }, []);
  
  // 处理标签切换
  const handleTabChange = (tabId: TabId) => {
    setIsLoading(true);
    setActiveTab(tabId);
  };



  // 质量归零技术可视化
  const createMassReductionVisualization = (scene: THREE.Scene) => {
    // 创建中心物体
    const objectGeometry = new THREE.BoxGeometry(2, 2, 2);
    const objectMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.8
    });
    const centralObject = new THREE.Mesh(objectGeometry, objectMaterial);
    scene.add(centralObject);

    // 创建人工场效果
    const fieldGeometry = new THREE.SphereGeometry(4, 32, 32);
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        center: { value: new THREE.Vector3(0, 0, 0) },
        radius: { value: 4 }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 center;
        uniform float radius;
        varying vec3 vPosition;
        
        void main() {
          float dist = distance(vPosition, center);
          float normalizedDist = dist / radius;
          
          // 创建波动效果
          float pulse = sin(time * 2.0 + normalizedDist * 5.0) * 0.5 + 0.5;
          
          // 越靠近中心，场越强
          float strength = 1.0 - normalizedDist;
          strength = smoothstep(0.0, 1.0, strength);
          
          vec3 color = mix(vec3(0.0, 0.3, 0.5), vec3(0.0, 0.8, 1.0), strength * pulse);
          gl_FragColor = vec4(color, strength * 0.3);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const fieldSphere = new THREE.Mesh(fieldGeometry, fieldMaterial);
    scene.add(fieldSphere);

    // 添加场线
    const fieldLinesGroup = new THREE.Group();
    const numLines = 12;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];
      
      for (let r = 2.5; r <= 6; r += 0.1) {
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = Math.sin(r * 2.0) * 0.5; // 螺旋效果
        points.push(new THREE.Vector3(x, y, z));
      }
      
      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x45b7d1,
        transparent: true,
        opacity: 0.6
      });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      fieldLinesGroup.add(fieldLine);
    }
    
    scene.add(fieldLinesGroup);

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;
      
      // 更新场效果
      if (fieldMaterial.uniforms.time) {
        fieldMaterial.uniforms.time.value = time;
      }
      
      // 物体脉动效果（表示质量变化）
      const scale = 1.0 + Math.sin(time * 2.0) * 0.1;
      centralObject.scale.set(scale, scale, scale);
      
      // 透明度变化表示质量减少
      const opacity = 0.5 + Math.sin(time * 1.5) * 0.3;
      objectMaterial.opacity = opacity;
    };
  };

  // 光速飞行器动力学模拟
  const createLightSpeedCraftVisualization = (scene: THREE.Scene) => {
    // 创建飞行器模型（简化版）
    const craftGroup = new THREE.Group();
    
    // 主体
    const bodyGeometry = new THREE.ConeGeometry(1, 3, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x60a5fa });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    craftGroup.add(body);
    
    // 引擎部分
    const engineGeometry = new THREE.CylinderGeometry(0.5, 1, 1, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x457b9d });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    craftGroup.add(engine);
    
    scene.add(craftGroup);

    // 创建场效应
    const fieldGeometry = new THREE.CylinderGeometry(1, 4, 5, 16);
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
          float intensity = 1.0 - abs(vPosition.y) / 2.5;
          float pulse = sin(time * 3.0 + vPosition.y * 2.0) * 0.5 + 0.5;
          
          vec3 color = mix(vec3(0.1, 0.1, 0.5), vec3(0.3, 0.5, 1.0), intensity * pulse);
          gl_FragColor = vec4(color, intensity * 0.3);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const fieldCylinder = new THREE.Mesh(fieldGeometry, fieldMaterial);
    scene.add(fieldCylinder);

    // 添加尾焰效果
    const exhaustGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const exhaustMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
          float intensity = 1.0 + vPosition.y / 3.0;
          float flicker = sin(time * 10.0 + vPosition.x * vPosition.z) * 0.2 + 0.8;
          
          vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), intensity);
          gl_FragColor = vec4(color, intensity * flicker * 0.6);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.rotation.x = Math.PI;
    exhaust.position.y = -3;
    scene.add(exhaust);

    // 动画更新
    let time = 0;
    let distance = 0;
    scene.userData.update = () => {
      time += 0.01;
      distance += 0.02;
      
      // 更新场效果
      fieldMaterial.uniforms.time.value = time;
      exhaustMaterial.uniforms.time.value = time;
      
      // 飞行器轻微旋转
      craftGroup.rotation.z = Math.sin(time * 0.5) * 0.1;
      
      // 飞行器缓慢前进
      craftGroup.position.y = distance;
      fieldCylinder.position.y = distance;
      exhaust.position.y = distance - 3;
      
      // 视角跟随 - 修复sceneRef引用问题
      if (scene.userData.camera) {
        scene.userData.camera.position.y = distance + 5;
        scene.userData.camera.lookAt(craftGroup.position);
      }
    };
  };

  // 时间势差效应可视化
  const createTimePotentialVisualization = (scene: THREE.Scene) => {
    // 创建时空网格
    const gridGroup = new THREE.Group();
    const size = 10;
    const divisions = 10;
    
    // 水平网格
    const horizontalGrid = new THREE.GridHelper(
      size,
      divisions,
      0x1a1a3a,
      0x333366
    );
    gridGroup.add(horizontalGrid);
    
    // 垂直网格
    const verticalGrid = new THREE.GridHelper(
      size,
      divisions,
      0x1a1a3a,
      0x333366
    );
    verticalGrid.rotation.x = Math.PI / 2;
    gridGroup.add(verticalGrid);
    
    scene.add(gridGroup);

    // 创建质量源（产生时间势差）
    const massGeometry = new THREE.SphereGeometry(1, 32, 32);
    const massMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const massSource = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(massSource);

    // 创建时间势差可视化效果
    const potentialGeometry = new THREE.SphereGeometry(5, 32, 32);
    const potentialMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        massPosition: { value: new THREE.Vector3(0, 0, 0) }
      },
      vertexShader: `
        uniform vec3 massPosition;
        varying vec3 vPosition;
        varying float vDistance;
        
        void main() {
          vPosition = position;
          vDistance = distance(position, massPosition);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        varying float vDistance;
        
        void main() {
          // 时间膨胀效应随距离的变化
          float timeDilation = 1.0 / sqrt(1.0 - 1.0 / max(vDistance, 1.0));
          
          // 颜色映射：红色表示时间变慢，蓝色表示时间变快
          vec3 color = mix(vec3(0.0, 0.3, 0.8), vec3(0.8, 0.1, 0.1), 1.0 - 1.0 / max(vDistance, 1.0));
          
          gl_FragColor = vec4(color, 0.2);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const potentialSphere = new THREE.Mesh(potentialGeometry, potentialMaterial);
    scene.add(potentialSphere);

    // 添加时钟表示不同位置的时间流逝
    const createClock = (position: THREE.Vector3) => {
      const clockGroup = new THREE.Group();
      clockGroup.position.copy(position);
      
      // 时钟表盘
      const dialGeometry = new THREE.CircleGeometry(0.3, 16);
      const dialMaterial = new THREE.MeshBasicMaterial({ color: 0x333366 });
      const dial = new THREE.Mesh(dialGeometry, dialMaterial);
      dial.lookAt(0, 0, 0);
      clockGroup.add(dial);
      
      // 时针
      const hourHandGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.01);
      const hourHandMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial);
      hourHand.position.y = 0.1;
      clockGroup.add(hourHand);
      
      // 保存引用以便动画更新
      clockGroup.userData.hourHand = hourHand;
      clockGroup.userData.position = position;
      
      return clockGroup;
    };

    // 创建多个时钟
    const clocks = [
      createClock(new THREE.Vector3(2, 0, 0)),  // 近质量源
      createClock(new THREE.Vector3(4, 0, 0))   // 远质量源
    ];
    
    clocks.forEach(clock => scene.add(clock));

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;
      potentialMaterial.uniforms.time.value = time;
      
      // 更新各个时钟的时针（模拟不同的时间流逝速率）
      clocks.forEach(clock => {
        const distance = clock.userData.position.distanceTo(new THREE.Vector3(0, 0, 0));
        // 距离越近，时间流逝越慢
        const timeSpeed = 1.0 / distance;
        clock.userData.hourHand.rotation.z = time * timeSpeed;
      });
    };
  };

  // 使用全局动画变体常量
  const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS;

  return (
    <div className="page-container">
      <motion.div
        className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col bg-[#0a0a14] py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      <div className="container mx-auto px-4">
        <motion.h1
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
          人工场技术可视化
        </motion.h1>

        {/* 标签页切换 - 改进样式和交互 */}
        <motion.div
          className="flex justify-center mb-8 border-b border-blue-900/30 overflow-x-auto max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 text-lg font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'text-blue-300 border-b-2 border-blue-500 shadow-lg shadow-blue-900/10' : 'text-blue-100/70 hover:text-blue-200'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variants={tabVariants}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* 3D可视化区域 - 增强视觉效果 */}
        <motion.div
          className="bg-[#121228] rounded-xl border border-blue-900/30 overflow-hidden relative mb-8 shadow-lg shadow-blue-900/5"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}
        >
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-[#121228]/80 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-blue-400 flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>正在渲染3D可视化...</span>
              </div>
            </motion.div>
          )}
          
          <ThreeJSVisualization
            className={cn("w-full h-[60vh] min-h-[400px] sm:min-h-[500px]")}
            onInit={createVisualization}
            onAnimationFrame={updateVisualization}
            cameraConfig={{
              position: { x: 0, y: 0, z: 10 },
              fov: 75
            }}
            controlsConfig={{
              enableDamping: true,
              dampingFactor: 0.05
            }}
            sceneConfig={{
              backgroundColor: 0x0a0a14
            }}
          />
        </motion.div>

        {/* 详细说明 - 增强视觉深度和响应式 */}
        <motion.div
          className="bg-[#121228] rounded-xl p-6 md:p-8 border border-blue-900/30 shadow-lg shadow-blue-900/5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
          layout
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-blue-300 mb-6 border-l-4 border-blue-500 pl-4"
            variants={itemVariants}
          >
            {tabs.find(t => t.id === activeTab)?.title}
          </motion.h2>
          
          {activeTab === 'principles' && (
            <motion.div variants={containerVariants}>
              <motion.p 
                className="text-blue-100/80 mb-4 leading-relaxed"
                variants={itemVariants}
              >
                根据统一场论，人工场本质上是对空间的扰动和控制。通过改变空间的运动状态，可以产生强大的物理效应，包括质量归零、空间扭曲等。
              </motion.p>
              <motion.p 
                className="text-blue-100/80 mb-6 leading-relaxed"
                variants={itemVariants}
              >
                质量归零技术是人工场最核心的应用之一，它通过特定的场配置，使物体周围的空间运动状态发生变化，从而降低或消除物体的质量。
              </motion.p>
              <motion.div 
                className={cn("bg-[#0a0a14] p-4 rounded-lg border border-blue-800/30 shadow-inner relative overflow-hidden")}
                variants={formulaVariants}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>
                <div className="relative z-10 text-blue-300">
                  质量与空间运动的关系: 
                  <MathJax formula="m = k \\cdot \\frac{dn}{d\\Omega}" className="inline" />
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'applications' && (
            <motion.div variants={containerVariants}>
              <motion.p 
                className="text-blue-100/80 mb-4 leading-relaxed"
                variants={itemVariants}
              >
                基于统一场论的光速飞行器利用人工场技术，通过控制质量和利用空间本身的运动来实现超高速飞行。
              </motion.p>
              <motion.p 
                className="text-blue-100/80 mb-6 leading-relaxed"
                variants={itemVariants}
              >
                飞行器的动力来自于质量的变化，根据公式 F = (C - V)·dm/dt，当飞行器周围的人工场使质量发生变化时，就会产生巨大的推力。
              </motion.p>
              <motion.div 
                className={cn("bg-[#0a0a14] p-4 rounded-lg border border-blue-800/30 shadow-inner relative overflow-hidden")}
                variants={formulaVariants}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>
                <div className="relative z-10 text-blue-300">
                  光速飞行器动力学方程: 
                  <MathJax formula="F = (C - V) \\cdot \\frac{dm}{dt}" className="inline" />
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'time' && (
            <motion.div variants={containerVariants}>
              <motion.p 
                className="text-blue-100/80 mb-4 leading-relaxed"
                variants={itemVariants}
              >
                人工场能够产生时间势差，使得不同位置的时间流逝速率不同。这种效应可以用于时间旅行、延长寿命等领域。
              </motion.p>
              <motion.p 
                className="text-blue-100/80 mb-6 leading-relaxed"
                variants={itemVariants}
              >
                时间势差的本质是空间运动的不均匀性，通过控制空间的运动状态，可以创造出可控的时间流逝差异。
              </motion.p>
              <motion.div 
                className={cn("bg-[#0a0a14] p-4 rounded-lg border border-blue-800/30 shadow-inner relative overflow-hidden")}
                variants={formulaVariants}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>
                <div className="relative z-10 text-blue-300">
                  时间膨胀效应: 
                  <MathJax formula="\\Delta t' = \\frac{\\Delta t}{\\sqrt{1 - \\frac{v^2}{c^2}}}" className="inline" />
                </div>
              </motion.div>
            </motion.div>
          )}</motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ArtificialFieldPage;
