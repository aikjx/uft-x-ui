import React, { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, easeOut } from 'framer-motion';
import * as THREE from 'three';
import { CatmullRomCurve3 } from 'three';
import ThreeJSVisualization from '../components/ThreeJSVisualization';
import { MathJax } from '../components/MathJax';
import { useFormula } from '../hooks/useFormula';
import { useThreeScene } from '../hooks/useThreeScene';
import { ANIMATION_VARIANTS, FORMULAS } from '../constants/index';
import { cn, showNotification } from '../utils';
import { FormulaService, formulaService } from '../services/formulaService';
import { VisualizationService, visualizationService } from '../services/visualizationService';

const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS;

const FormulaVisualizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedFormula, isLoading, selectFormula, formulas, formulasByCategory } = useFormula();
  // 使用ref存储当前场景引用
  const currentSceneRef = useRef<THREE.Scene | null>(null);

  // 使用useCallback优化导航函数
  const handleFormulaSelect = useCallback((formula: any) => {
    selectFormula(formula);
    navigate(`/formulas/${formula.id}`);
    showNotification.success(`已选择公式：${formula.name}`);
  }, [navigate, selectFormula, showNotification]);

  // ThreeJSVisualization组件会自动处理场景清理，不需要额外的清理逻辑

  // 使用自定义渲染函数创建3D可视化
  const createVisualization = useCallback(({ scene, camera, renderer, controls }: {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    controls: any;
  }) => {
    // 保存场景引用以供update使用
    currentSceneRef.current = scene;

    if (!selectedFormula) return;

    // 清理场景中除了基础元素外的所有对象
    scene.children.forEach(child => {
      if (!(child instanceof THREE.AmbientLight || 
            child instanceof THREE.DirectionalLight || 
            child instanceof THREE.GridHelper || 
            child instanceof THREE.AxesHelper)) {
        scene.remove(child);
      }
    });

    // 只在场景中没有坐标轴和网格时添加
    const hasAxesHelper = scene.children.some(child => child instanceof THREE.AxesHelper);
    if (!hasAxesHelper) {
      const axesHelper = visualizationService.createAxesHelper(5);
      scene.add(axesHelper);
    }

    const hasGridHelper = scene.children.some(child => child instanceof THREE.GridHelper);
    if (!hasGridHelper) {
      const gridHelper = visualizationService.createGridHelper(10, 10);
      scene.add(gridHelper);
    }

    // 只在场景中没有光照时添加
    const hasAmbientLight = scene.children.some(child => child instanceof THREE.AmbientLight);
    if (!hasAmbientLight) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
    }

    const hasDirectionalLight = scene.children.some(child => child instanceof THREE.DirectionalLight);
    if (!hasDirectionalLight) {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);
    }

    // 根据公式ID创建不同的可视化
    switch (selectedFormula.id) {
      case 1: // 时空同一化方程
        createSpaceTimeVisualization(scene);
        break;
      case 2: // 三维螺旋时空方程
        createHelixVisualization(scene);
        break;
      case 3: // 质量定义方程
        createMassDefinitionVisualization(scene);
        break;
      case 4: // 引力场定义方程
        createGravitationalFieldVisualization(scene);
        break;
      case 5: // 静止动量方程
        createRestMomentumVisualization(scene);
        break;
      case 6: // 运动动量方程
        createMovingMomentumVisualization(scene);
        break;
      case 7: // 宇宙大统一方程
        createUnifiedForceVisualization(scene);
        break;
      case 8: // 空间波动方程
        createWaveEquationVisualization(scene);
        break;
      case 9: // 电荷定义方程
        createChargeDefinitionVisualization(scene);
        break;
      case 10: // 电场定义方程
        createElectricFieldVisualization(scene);
        break;
      case 11: // 磁场定义方程
        createMagneticFieldVisualization(scene);
        break;
      case 12: // 变化的引力场产生电磁场
        createGravityToElectroVisualization(scene);
        break;
      case 13: // 磁矢势方程
        createMagneticVectorPotentialVisualization(scene);
        break;
      case 14: // 变化的引力场产生电场
        createGravityToElectricFieldVisualization(scene);
        break;
      case 15: // 变化的磁场产生引力场和电场
        createMagneticToGravityVisualization(scene);
        break;
      case 16: // 统一场论能量方程
        createEnergyEquationVisualization(scene);
        break;
      case 17: // 光速飞行器动力学方程
        createLightSpeedCraftVisualization(scene);
        break;
      case 18: // 核力场定义方程
        createNuclearForceVisualization(scene);
        break;
      case 19: // 引力光速统一方程
        createGravityLightSpeedVisualization(scene);
        break;
    }
  }, [selectedFormula]);

  // 更新可视化的动画函数 - 只接收deltaTime参数
  const updateVisualization = useCallback((deltaTime: number) => {
    try {
      // 使用保存的场景引用
      const scene = currentSceneRef.current;
      if (scene && scene.userData && typeof scene.userData.update === 'function') {
        try {
          // 检查update方法是否接受参数
          if (scene.userData.update.length > 0) {
            scene.userData.update(deltaTime);
          } else {
            scene.userData.update();
          }
        } catch (updateError) {
          console.error('Error in scene update function:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in visualization update:', error);
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

  // 质量定义方程可视化
  const createMassDefinitionVisualization = (scene: THREE.Scene) => {
    // 创建粒子系统表示空间运动
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 6;
      positions[i3 + 1] = (Math.random() - 0.5) * 6;
      positions[i3 + 2] = (Math.random() - 0.5) * 6;

      // 红色系，密度越高越红
      const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
      const intensity = Math.max(0, 1 - distance / 3);
      colors[i3] = 1.0;
      colors[i3 + 1] = intensity * 0.3;
      colors[i3 + 2] = intensity * 0.1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 添加质量球体
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4757,
      wireframe: true
    });
    const massSphere = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(massSphere);

    // 动画更新
    scene.userData.update = () => {
      particles.rotation.y += 0.005;
    };
  };

  // 静止动量方程可视化
  const createRestMomentumVisualization = (scene: THREE.Scene) => {
    // 创建静止质量
    const massGeometry = new THREE.SphereGeometry(1, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const restMass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(restMass);

    // 创建光速矢量C0
    const c0Vector = new THREE.Vector3(0, 2, 0);
    const c0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      c0Vector
    ]);
    const c0Material = new THREE.LineBasicMaterial({ color: 0xff6348 });
    const c0Line = new THREE.Line(c0Geometry, c0Material);
    scene.add(c0Line);

    // 添加箭头
    const c0Arrow = new THREE.ArrowHelper(
      c0Vector.clone().normalize(),
      c0Vector,
      0.2,
      0xff6348
    );
    scene.add(c0Arrow);

    // 创建动量矢量p0 = m0*C0
    const p0Vector = c0Vector.clone().multiplyScalar(1);
    const p0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      p0Vector
    ]);
    const p0Material = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 });
    const p0Line = new THREE.Line(p0Geometry, p0Material);
    scene.add(p0Line);

    const p0Arrow = new THREE.ArrowHelper(
      p0Vector.clone().normalize(),
      p0Vector,
      0.2,
      0x1dd1a1
    );
    scene.add(p0Arrow);
  };

  // 运动动量方程可视化
  const createMovingMomentumVisualization = (scene: THREE.Scene) => {
    // 创建质量体
    const massGeometry = new THREE.SphereGeometry(1, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const mass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(mass);

    // 创建光速矢量C
    const cVector = new THREE.Vector3(0, 3, 0);
    const cGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      cVector
    ]);
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 });
    const cLine = new THREE.Line(cGeometry, cMaterial);
    scene.add(cLine);

    // 创建速度矢量V
    const vVector = new THREE.Vector3(1.5, 0, 0);
    const vGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      vVector
    ]);
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 });
    const vLine = new THREE.Line(vGeometry, vMaterial);
    scene.add(vLine);

    // 计算动量矢量P = m(C - V)
    const cvVector = cVector.clone().sub(vVector);
    const pVector = cvVector.clone().multiplyScalar(1);
    const pGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      pVector
    ]);
    const pMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 });
    const pLine = new THREE.Line(pGeometry, pMaterial);
    scene.add(pLine);

    // 添加箭头
    const cArrow = new THREE.ArrowHelper(cVector.clone().normalize(), cVector, 0.2, 0xff6348);
    const vArrow = new THREE.ArrowHelper(vVector.clone().normalize(), vVector, 0.2, 0xffa502);
    const pArrow = new THREE.ArrowHelper(pVector.clone().normalize(), pVector, 0.2, 0x1dd1a1);

    scene.add(cArrow, vArrow, pArrow);
  };

  // 空间波动方程可视化
  const createWaveEquationVisualization = (scene: THREE.Scene) => {
    // 创建波动表面
    const waveGeometry = new THREE.PlaneGeometry(8, 8, 100, 100);
    const positions = waveGeometry.attributes.position.array;
    const colors = new Float32Array(positions.length * 3 / 3);

    // 初始化颜色属性
    for (let i = 0; i < positions.length; i += 3) {
      colors[i] = 0.2;
      colors[i + 1] = 0.5;
      colors[i + 2] = 1.0;
    }

    waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const waveMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true
    });

    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.rotation.x = -Math.PI / 2;
    scene.add(waveMesh);

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;
      const positions = waveMesh.geometry.attributes.position.array;
      const colors = waveMesh.geometry.attributes.color.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const distance = Math.sqrt(x * x + z * z);
        positions[i + 1] = Math.sin(distance - time * 2) * 0.5 * Math.exp(-distance * 0.1);

        // 根据振幅设置颜色
        const intensity = (positions[i + 1] + 0.5) / 1.0;
        colors[i] = 0.2 + intensity * 0.3;
        colors[i + 1] = 0.5 + intensity * 0.3;
        colors[i + 2] = 1.0;
      }

      waveMesh.geometry.attributes.position.needsUpdate = true;
      waveMesh.geometry.attributes.color.needsUpdate = true;
    };
  };

  // 电荷定义方程可视化
  const createChargeDefinitionVisualization = (scene: THREE.Scene) => {
    // 创建旋转的环形结构表示空间旋转
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    // 创建电荷粒子
    const chargeGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(charge);

    // 创建粒子轨迹
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
      pathPoints.push(new THREE.Vector3(Math.cos(t) * 1.5, 0, Math.sin(t) * 1.5));
    }
    pathGeometry.setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff6348, transparent: true, opacity: 0.5 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);

    // 动画更新
    let angle = 0;
    scene.userData.update = () => {
      angle += 0.02;
      ring.rotation.x = Math.sin(angle * 0.5) * 0.3;
      ring.rotation.y = angle;

      // 移动电荷粒子沿环形轨迹
      charge.position.x = Math.cos(angle) * 1.5;
      charge.position.z = Math.sin(angle) * 1.5;
    };
  };

  // 电场定义方程可视化
  const createElectricFieldVisualization = (scene: THREE.Scene) => {
    // 创建电荷中心
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(charge);

    // 创建电场线（径向）
    const fieldLines = [];
    const numLines = 16;
    const numPointsPerLine = 15;

    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2;
      const theta = Math.PI / 2; // 赤道平面

      for (let j = 0; j < 2; j++) { // 正负两个方向
        const sign = j === 0 ? 1 : -1;
        const lineGeometry = new THREE.BufferGeometry();
        const points = [];

        for (let k = 1; k <= numPointsPerLine; k++) {
          const r = 0.7 + k * 0.2;
          const x = r * Math.sin(theta) * Math.cos(phi) * sign;
          const y = r * Math.cos(theta) * sign;
          const z = r * Math.sin(theta) * Math.sin(phi) * sign;
          points.push(new THREE.Vector3(x, y, z));
        }

        lineGeometry.setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
        const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(fieldLine);
        fieldLines.push(fieldLine);
      }
    }

    // 创建垂直平面的电场线
    for (let i = 0; i < numLines / 2; i++) {
      const phi = 0;
      const theta = (i / (numLines / 2)) * Math.PI / 2;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let k = 1; k <= numPointsPerLine; k++) {
        const r = 0.7 + k * 0.2;
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(phi);
        points.push(new THREE.Vector3(x, y, z));
        points.push(new THREE.Vector3(-x, y, -z)); // 对称点
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      fieldLines.push(fieldLine);
    }
  };

  // 磁场定义方程可视化
  const createMagneticFieldVisualization = (scene: THREE.Scene) => {
    // 创建运动电荷
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(charge);

    // 创建速度方向
    const velocityVector = new THREE.Vector3(0, 0, 1);
    const velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      velocityVector.clone().multiplyScalar(3)
    ]);
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
    const velocityLine = new THREE.Line(velocityGeometry, velocityMaterial);
    scene.add(velocityLine);

    // 创建磁场线（环形围绕速度方向）
    const fieldLines: THREE.Line[] = [];
    const numRings = 5;
    const pointsPerRing = 64;

    for (let i = 0; i < numRings; i++) {
      const radius = 0.8 + i * 0.4;
      const height = -1.5 + i * 0.8;

      const ringGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= pointsPerRing; j++) {
        const angle = (j / pointsPerRing) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = height;
        const y = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      ringGeometry.setFromPoints(points);
      const intensity = 1 - (i / numRings);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.2, 0.2), intensity)
      });
      const fieldLine = new THREE.Line(ringGeometry, lineMaterial);
      scene.add(fieldLine);
      fieldLines.push(fieldLine);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 移动电荷
      charge.position.z = Math.sin(time * 2) * 1.5;

      // 旋转磁场线
      fieldLines.forEach((line, index) => {
        line.rotation.z = time * 0.5 + index * 0.1;
      });
    };
  };

  // 变化的引力场产生电磁场可视化
  const createGravityToElectroVisualization = (scene: THREE.Scene) => {
    // 创建中心质量
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const centralMass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(centralMass);

    // 创建引力场线
    const gravityFieldLines: THREE.Line[] = [];
    const numGravityLines = 8;

    for (let i = 0; i < numGravityLines; i++) {
      const angle = (i / numGravityLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 20; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa, transparent: true, opacity: 0.5 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      gravityFieldLines.push(fieldLine);
    }

    // 创建产生的电磁场
    const emFieldGroup = new THREE.Group();
    scene.add(emFieldGroup);

    const numEmRings = 6;
    for (let i = 0; i < numEmRings; i++) {
      const radius = 3 + i * 0.5;
      const height = -2.5 + i * 1.0;

      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = height;
      emFieldGroup.add(ring);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 引力场脉动
      centralMass.scale.x = 0.8 + Math.sin(time * 2) * 0.2;
      centralMass.scale.y = 0.8 + Math.sin(time * 2) * 0.2;
      centralMass.scale.z = 0.8 + Math.sin(time * 2) * 0.2;

      // 引力场线运动
      gravityFieldLines.forEach((line, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.5) * 0.2;
        line.scale.x = scale;
        line.scale.y = scale;
      });

      // 电磁场响应
      emFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(time * 2 + index * 0.3);
        ((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.1 + intensity * 0.4);
        ring.rotation.y = time * 0.2;
      });
    };
  };

  // 磁矢势方程可视化
  const createMagneticVectorPotentialVisualization = (scene: THREE.Scene) => {
    // 创建中心源
    const sourceGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    scene.add(source);

    // 创建磁矢势A的环
    const vectorPotentialRings: THREE.Mesh[] = [];
    const numRings = 8;

    for (let i = 0; i < numRings; i++) {
      const radius = 1.2 + i * 0.3;
      const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.5, 0.2), i / numRings)
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);
      vectorPotentialRings.push(ring);
    }

    // 创建磁场B（A的旋度）
    const magneticFieldLines: THREE.Line[] = [];
    const numFieldLines = 6;

    for (let i = 0; i < numFieldLines; i++) {
      const height = -1.5 + i * 0.6;
      const radius = 1.5 + Math.abs(height) * 0.2;

      const fieldLineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = height;
        const z = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      fieldLineGeometry.setFromPoints(points);
      const fieldLineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 });
      const fieldLine = new THREE.Line(fieldLineGeometry, fieldLineMaterial);
      scene.add(fieldLine);
      magneticFieldLines.push(fieldLine);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 旋转磁矢势环
      vectorPotentialRings.forEach((ring, index) => {
        ring.rotation.x = Math.sin(time * 0.5 + index * 0.2) * 0.1;
        ring.rotation.y = time * 0.3;
      });

      // 磁场线动画
      magneticFieldLines.forEach((line, index) => {
        line.rotation.z = time * 0.2 + index * 0.1;
      });
    };
  };

  // 变化的引力场产生电场可视化
  const createGravityToElectricFieldVisualization = (scene: THREE.Scene) => {
    // 创建中心引力源
    const gravitySourceGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const gravitySourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const gravitySource = new THREE.Mesh(gravitySourceGeometry, gravitySourceMaterial);
    scene.add(gravitySource);

    // 创建引力场A
    const aFieldLines: THREE.Line[] = [];
    const numALines = 8;

    for (let i = 0; i < numALines; i++) {
      const angle = (i / numALines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      aFieldLines.push(fieldLine);
    }

    // 创建产生的电场E
    const electricFieldLines: THREE.Line[] = [];
    const numELines = 6;

    for (let i = 0; i < numELines; i++) {
      const height = -1 + i * 0.4;
      const angle = (i / numELines) * Math.PI * 2;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) + height;
        const z = Math.sin(j * 0.3) * 0.5;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      electricFieldLines.push(fieldLine);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 引力场脉动
      gravitySource.scale.x = 0.7 + Math.sin(time * 2) * 0.2;
      gravitySource.scale.y = 0.7 + Math.sin(time * 2) * 0.2;
      gravitySource.scale.z = 0.7 + Math.sin(time * 2) * 0.2;

      // 引力场A变化
      aFieldLines.forEach((line, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.3) * 0.2;
        line.scale.x = scale;
        line.scale.y = scale;
      });

      // 电场E响应
      electricFieldLines.forEach((line, index) => {
        const offset = Math.sin(time * 2 + index * 0.3);
        line.position.z = offset * 0.3;
        line.rotation.y = offset * 0.2;
      });
    };
  };

  // 变化的磁场产生引力场和电场可视化
  const createMagneticToGravityVisualization = (scene: THREE.Scene) => {
    // 创建磁场源
    const magneticSourceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
    const magneticSourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const magneticSource = new THREE.Mesh(magneticSourceGeometry, magneticSourceMaterial);
    scene.add(magneticSource);

    // 创建磁场线B
    const magneticFieldLines: THREE.Line[] = [];
    const numBLines = 8;

    for (let i = 0; i < numBLines; i++) {
      const radius = 1.0 + (i % 4) * 0.3;
      const height = -1.5 + Math.floor(i / 4) * 3.0;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = height;
        const z = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      magneticFieldLines.push(fieldLine);
    }

    // 创建产生的引力场A
    const gravityFieldGroup = new THREE.Group();
    scene.add(gravityFieldGroup);

    const numGravityRings = 5;
    for (let i = 0; i < numGravityRings; i++) {
      const radius = 2 + i * 0.4;
      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3742fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.z = Math.PI / 2;
      gravityFieldGroup.add(ring);
    }

    // 创建产生的电场E
    const electricFieldLines: THREE.Line[] = [];
    const numELines = 6;

    for (let i = 0; i < numELines; i++) {
      const angle = (i / numELines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 32; j++) {
        const r = 2.5 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = Math.sin(j * 0.5) * 0.5;
        const z = r * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      electricFieldLines.push(fieldLine);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 磁场变化
      magneticSource.scale.y = 0.3 + Math.sin(time * 3) * 0.1;

      // 磁场线动画
      magneticFieldLines.forEach((line, index) => {
        const intensity = Math.sin(time * 2 + index * 0.3);
        line.scale.x = 1 + intensity * 0.1;
        line.scale.z = 1 + intensity * 0.1;
        line.rotation.y = time * 0.1;
      });

      // 引力场响应
      gravityFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(time * 2 + index * 0.2);
        const mesh = ring as THREE.Mesh;
        (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.1 + intensity * 0.2);
        ring.rotation.x = time * 0.1 + intensity * 0.1;
      });

      // 电场响应
      electricFieldLines.forEach((line, index) => {
        const offset = Math.sin(time * 2 + index * 0.4);
        line.position.y = offset * 0.3;
        line.rotation.x = offset * 0.1;
      });
    };
  };

  // 统一场论能量方程可视化
  const createEnergyEquationVisualization = (scene: THREE.Scene) => {
    // 创建静止质量
    const restMassGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const restMassMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const restMass = new THREE.Mesh(restMassGeometry, restMassMaterial);
    restMass.position.x = -2;
    scene.add(restMass);

    // 创建运动质量
    const movingMassGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const movingMassMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const movingMass = new THREE.Mesh(movingMassGeometry, movingMassMaterial);
    movingMass.position.x = 2;
    scene.add(movingMass);

    // 创建能量场
    const energyFieldGeometry = new THREE.SphereGeometry(3, 32, 32);
    const energyFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
    scene.add(energyField);

    // 创建速度向量
    const velocityVector = new THREE.Vector3(0, 0, 1.5);
    const velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      movingMass.position,
      movingMass.position.clone().add(velocityVector)
    ]);
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
    const velocityLine = new THREE.Line(velocityGeometry, velocityMaterial);
    scene.add(velocityLine);

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 运动质量速度变化
      const speed = Math.sin(time * 0.5) * 0.8 + 0.2;
      movingMass.scale.x = 1 / Math.sqrt(1 - speed * speed); // 相对论质量增加
      movingMass.scale.y = 1 / Math.sqrt(1 - speed * speed);
      movingMass.scale.z = 1 / Math.sqrt(1 - speed * speed);

      // 更新速度向量
      const newVelocity = new THREE.Vector3(0, 0, 1.5 * speed);
      velocityGeometry.setFromPoints([
        movingMass.position,
        movingMass.position.clone().add(newVelocity)
      ]);
      velocityGeometry.attributes.position.needsUpdate = true;

      // 能量场脉动
      energyField.scale.x = 3 + Math.sin(time * 2) * 0.3;
      energyField.scale.y = 3 + Math.sin(time * 2) * 0.3;
      energyField.scale.z = 3 + Math.sin(time * 2) * 0.3;
      (energyField.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.abs(Math.sin(time * 2)) * 0.2;
    };
  };

  // 光速飞行器动力学方程可视化
  const createLightSpeedCraftVisualization = (scene: THREE.Scene) => {
    // 创建飞行器
    const craftGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const craftMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const craft = new THREE.Mesh(craftGeometry, craftMaterial);
    craft.rotation.x = Math.PI / 2;
    scene.add(craft);

    // 创建光速向量C
    const cVector = new THREE.Vector3(0, 0, 3);
    const cGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().add(cVector)
    ]);
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 });
    const cLine = new THREE.Line(cGeometry, cMaterial);
    scene.add(cLine);

    // 创建速度向量V
    const vVector = new THREE.Vector3(0, 0, 1.5);
    const vGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().add(vVector)
    ]);
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 });
    const vLine = new THREE.Line(vGeometry, vMaterial);
    scene.add(vLine);

    // 创建推力向量F
    const fVector = cVector.clone().sub(vVector).multiplyScalar(0.5);
    const fGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().sub(fVector) // 推力方向与加速度相反
    ]);
    const fMaterial = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });
    const fLine = new THREE.Line(fGeometry, fMaterial);
    scene.add(fLine);

    // 创建推进粒子效果
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7; // 粒子从尾部喷出
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff6348,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    craft.add(particles);

    // 动画更新
    let time = 0;
    let position = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 更新飞行器位置
      position += 0.02;
      craft.position.z = position;

      // 更新向量位置
      cGeometry.setFromPoints([
        craft.position,
        craft.position.clone().add(cVector)
      ]);
      vGeometry.setFromPoints([
        craft.position,
        craft.position.clone().add(vVector)
      ]);
      fGeometry.setFromPoints([
        craft.position,
        craft.position.clone().sub(fVector)
      ]);

      cGeometry.attributes.position.needsUpdate = true;
      vGeometry.attributes.position.needsUpdate = true;
      fGeometry.attributes.position.needsUpdate = true;

      // 更新粒子位置
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] -= 0.02; // 粒子向后移动

        // 重置远离的粒子
        if (positions[i3 + 2] < -2) {
          positions[i3] = (Math.random() - 0.5) * 0.5;
          positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    };
  };

  // 核力场定义方程可视化
  const createNuclearForceVisualization = (scene: THREE.Scene) => {
    // 创建原子核
    const nucleusGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // 创建核子（质子/中子）
    const nucleons: THREE.Mesh[] = [];
    const numNucleons = 8;

    for (let i = 0; i < numNucleons; i++) {
      const angle = (i / numNucleons) * Math.PI * 2;
      const distance = 1.2 + (i % 2) * 0.3;
      const x = distance * Math.cos(angle);
      const z = distance * Math.sin(angle);

      const nucleonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const nucleonMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x3742fa : 0x1dd1a1
      });
      const nucleon = new THREE.Mesh(nucleonGeometry, nucleonMaterial);
      nucleon.position.set(x, 0, z);
      scene.add(nucleon);
      nucleons.push(nucleon);
    }

    // 创建核力场线
    const nuclearFieldLines: THREE.Line[] = [];
    const numFieldLines = 12;

    for (let i = 0; i < numFieldLines; i++) {
      const angle = (i / numFieldLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 20; j++) {
        const r = 0.8 + j * 0.1;
        // 核力的短程特性，距离增加时力迅速减小
        const forceStrength = Math.exp(-r * 0.5) * 2;
        const x = r * Math.cos(angle) * forceStrength;
        const y = r * Math.sin(angle * 2) * 0.3;
        const z = r * Math.sin(angle) * forceStrength;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      nuclearFieldLines.push(fieldLine);
    }

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 核子振动
      nucleons.forEach((nucleon, index) => {
        const basePosition = nucleon.position.clone();
        const originalDistance = Math.sqrt(basePosition.x ** 2 + basePosition.z ** 2);
        const oscillation = Math.sin(time * 3 + index * 0.5) * 0.1;

        const angle = Math.atan2(basePosition.z, basePosition.x);
        nucleon.position.x = Math.cos(angle) * (originalDistance + oscillation);
        nucleon.position.z = Math.sin(angle) * (originalDistance + oscillation);
      });

      // 核力场波动
      nuclearFieldLines.forEach((line, index) => {
        const points = line.geometry.attributes.position.array;
        for (let i = 0; i < points.length; i += 3) {
          const r = Math.sqrt(points[i] ** 2 + points[i + 2] ** 2);
          const angle = Math.atan2(points[i + 2], points[i]);
          const oscillation = Math.sin(time * 2 + r * 2 + index * 0.2) * 0.1;

          points[i] = Math.cos(angle) * (r + oscillation);
          points[i + 2] = Math.sin(angle) * (r + oscillation);
        }
        line.geometry.attributes.position.needsUpdate = true;
      });
    };
  };

  // 引力光速统一方程可视化
  const createGravityLightSpeedVisualization = (scene: THREE.Scene) => {
    // 创建中央统一点
    const centerGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(center);

    // 创建引力场表示
    const gravityFieldGeometry = new THREE.SphereGeometry(2, 32, 32);
    const gravityFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x3742fa,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const gravityField = new THREE.Mesh(gravityFieldGeometry, gravityFieldMaterial);
    scene.add(gravityField);

    // 创建光速表示
    const lightRays: THREE.Line[] = [];
    const numRays = 16;

    for (let i = 0; i < numRays; i++) {
      const phi = (i / numRays) * Math.PI * 2;
      const theta = Math.PI / 2;

      const rayGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 20; j++) {
        const r = 0.8 + j * 0.2;
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(phi);
        points.push(new THREE.Vector3(x, y, z));
      }

      rayGeometry.setFromPoints(points);
      const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 });
      const ray = new THREE.Line(rayGeometry, rayMaterial);
      scene.add(ray);
      lightRays.push(ray);
    }

    // 创建统一常数Z的表示
    const zRingGeometry = new THREE.RingGeometry(1.2, 1.4, 64);
    const zRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x1dd1a1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const zRing = new THREE.Mesh(zRingGeometry, zRingMaterial);
    zRing.rotation.x = Math.PI / 2;
    scene.add(zRing);

    // 动画更新
    let time = 0;
    scene.userData.update = () => {
      time += 0.01;

      // 中央统一点脉动
      center.scale.x = 0.8 + Math.sin(time * 2) * 0.1;
      center.scale.y = 0.8 + Math.sin(time * 2) * 0.1;
      center.scale.z = 0.8 + Math.sin(time * 2) * 0.1;

      // 引力场脉动
      gravityField.scale.x = 2 + Math.sin(time * 1.5) * 0.2;
      gravityField.scale.y = 2 + Math.sin(time * 1.5) * 0.2;
      gravityField.scale.z = 2 + Math.sin(time * 1.5) * 0.2;
      (gravityField.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.abs(Math.sin(time * 1.5)) * 0.2;

      // 光速射线动画
      lightRays.forEach((ray, index) => {
        const points = ray.geometry.attributes.position.array;
        for (let i = 0; i < points.length; i += 3) {
          const baseR = Math.sqrt(points[i] ** 2 + points[i + 1] ** 2 + points[i + 2] ** 2);
          const phase = time * 3 + index * 0.2;
          const intensity = 1 + Math.sin(phase - baseR * 0.5) * 0.2;

          const direction = new THREE.Vector3(points[i], points[i + 1], points[i + 2]).normalize();
          points[i] = direction.x * baseR * intensity;
          points[i + 1] = direction.y * baseR * intensity;
          points[i + 2] = direction.z * baseR * intensity;
        }
        ray.geometry.attributes.position.needsUpdate = true;
      });

      // 统一常数环旋转
      zRing.rotation.y = time * 0.3;
      zRing.rotation.z = Math.sin(time * 0.5) * 0.1;
    };
  };

  // 使用服务层的公式格式化方法
  const formatFormula = useCallback((expression: string) => {
    return FormulaService.formatFormulaExpression(expression);
  }, []);

  // 添加显示求导公式的状态
  const [showDerivative, setShowDerivative] = useState(false);

  if (!selectedFormula) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a14]">
        <div className="text-blue-400">加载中...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative w-full min-h-[100vh] flex flex-col bg-[#0a0a14] p-0 m-0 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
        <div className="flex flex-col gap-0 px-0 mx-0 lg:flex-row lg:gap-0 w-full h-full">
          {/* 左侧公式列表 - 优化响应式布局，最小化占据空间 */}
          <motion.div
            className="lg:w-60 bg-gradient-to-br from-[#121228] to-[#0f0f20] rounded-r-2xl p-2 border border-blue-900/30 h-fit sticky top-0 lg:max-h-[100vh] overflow-hidden flex flex-col shadow-xl shadow-blue-900/5 transition-all duration-300 z-10"
            variants={formulaVariants}
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">统一场论核心公式</h2>
              <p className="text-sm text-blue-200/60 mt-1">19个核心公式的3D可视化</p>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-900/30 scrollbar-track-transparent">
              {formulas.map((formula) => (
                <motion.button
                  key={formula.id}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 backdrop-blur-sm ${selectedFormula.id === formula.id ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 text-blue-300 shadow-lg shadow-blue-900/10' : 'hover:bg-blue-900/20 text-blue-100/70 hover:shadow-lg hover:shadow-blue-900/10'}`}
                  onClick={() => handleFormulaSelect(formula)}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`选择公式：${formula.name}`}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="mb-1 font-medium flex items-center gap-2">
                    <span className="text-xs w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400">{formula.id}</span>
                    {formula.name}
                  </div>
                  <div className="text-xs text-blue-200/60 ml-8">{formula.category}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 右侧可视化和详情 - 最大化可视化区域，精简详情部分 */}
          <motion.div
            className="flex flex-col flex-1 p-1"
            variants={itemVariants}
          >
            {/* 公式详情 - 极度精简，突出核心信息 */}
            <motion.div
              className="bg-gradient-to-br from-[#121228] to-[#0f0f20] rounded-xl p-3 border border-blue-900/30 mb-2 shadow-lg shadow-blue-900/10 transition-all duration-300"
              key={selectedFormula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                <h3 className="flex gap-2 items-center text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  <span className="text-blue-500">{selectedFormula.id}.</span>
                  {selectedFormula.name}
                </h3>

                {/* 求导切换按钮 - 精简样式 */}
                <motion.button
                  onClick={() => setShowDerivative(!showDerivative)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-md transition-all duration-300 shadow-md shadow-indigo-900/20"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {showDerivative ? '显示原公式' : '显示求导'}
                </motion.button>
              </div>

              <div className="mb-3 text-sm leading-relaxed text-blue-100/80 bg-[#0a0a14]/50 p-2 rounded-md border border-blue-900/20">
                {selectedFormula.description}
              </div>

              <div className="bg-[#0a0a14] p-3 rounded-md border border-blue-800/30 overflow-x-auto shadow-inner shadow-blue-900/10 backdrop-blur-sm">
                {showDerivative ? (
                  <>
                    <div className="text-blue-300 mb-2 text-xs font-medium">原公式:</div>
                    <div className="mb-3">
                      <MathJax formula={formatFormula(selectedFormula.expression)} />
                    </div>
                    <div className="border-t border-blue-800/30 my-3"></div>
                    <div className="text-blue-300 mb-2 text-xs font-medium">求导结果:</div>
                    {formulaService.deriveFormula(selectedFormula.id) ? (
                      <div className="min-h-[50px]">
                        <MathJax formula={formulaService.deriveFormula(selectedFormula.id) || ''} />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-blue-200/60 italic bg-blue-900/10 rounded-md text-sm">
                        <div className="text-2xl mb-1">🔄</div>
                        该公式暂不支持求导验证
                      </div>
                    )}
                  </>
                ) : (
                  <div className="min-h-[50px]">
                    <MathJax formula={formatFormula(selectedFormula.expression)} />
                  </div>
                )}
              </div>
            </motion.div>

            {/* 3D可视化区域 - 全屏显示，突出可视化效果 */}
            <div className="flex-1 bg-[#0a0a14] rounded-2xl border border-blue-900/30 overflow-hidden relative min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-9rem)] md:min-h-[calc(100vh-10rem)] shadow-xl shadow-blue-900/10 transition-all duration-300">
              {/* 加载覆盖层 */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a14]/90 backdrop-blur-sm z-10">
                  <motion.div
                    className="flex flex-col gap-4 items-center text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <div className="text-blue-300 font-medium">正在渲染3D可视化...</div>
                    <div className="text-sm text-blue-200/60 max-w-xs">
                      基于统一场论的精确物理模拟
                    </div>
                  </motion.div>
                </div>
              )}
              
              {/* 全屏可视化舞台 - 移除边框和圆角，最大化显示区域 */}
              <ThreeJSVisualization
                children={createVisualization}
                onAnimationFrame={updateVisualization}
                cameraConfig={{ position: { x: 0, y: 0, z: 5 } }}
                sceneConfig={{ backgroundColor: 0x0a0a14 }}
                controlsConfig={{
                  enableDamping: true,
                  dampingFactor: 0.05,
                  rotateSpeed: 0.7,
                  zoomSpeed: 0.9
                }}
                performanceOptions={{
                  enableBatchRendering: true,
                  dynamicPixelRatio: true,
                  usePerformanceMonitoring: true
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
};

export default FormulaVisualizationPage;
