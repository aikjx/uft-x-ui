import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import * as THREE from 'three';

const UnifiedFieldVisualization = () => {
  const mountRef = useRef(null);
  const [selectedFormula, setSelectedFormula] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  const formulas = [
    { id: 0, name: '时空同一化', desc: '空间与时间的统一', viz: 'spacetime' },
    { id: 1, name: '三维螺旋时空', desc: '螺旋运动轨迹', viz: 'helix' },
    { id: 2, name: '引力场', desc: '引力场分布', viz: 'gravity' },
    { id: 3, name: '电磁场', desc: '电场与磁场', viz: 'electromagnetic' },
    { id: 4, name: '空间波动', desc: '场的波动传播', viz: 'wave' },
    { id: 5, name: '统一场', desc: '引力与电磁统一', viz: 'unified' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4488ff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4488, 0.8, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create visualization objects
    const createSpaceTimeGrid = () => {
      const group = new THREE.Group();
      const size = 20;
      const divisions = 20;
      
      // Grid plane
      const gridHelper = new THREE.GridHelper(size, divisions, 0x00ffff, 0x004488);
      gridHelper.rotation.x = Math.PI / 2;
      group.add(gridHelper);

      // Time axis
      const timeMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
      const timePoints = [];
      for (let i = 0; i < 50; i++) {
        timePoints.push(new THREE.Vector3(0, 0, i * 0.3 - 7.5));
      }
      const timeGeometry = new THREE.BufferGeometry().setFromPoints(timePoints);
      const timeLine = new THREE.Line(timeGeometry, timeMaterial);
      group.add(timeLine);

      return group;
    };

    const createHelixPath = () => {
      const group = new THREE.Group();
      const points = [];
      const r = 3;
      const h = 0.1;
      
      for (let t = 0; t < 100; t += 0.1) {
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        const z = h * t - 5;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 2
      });
      const helix = new THREE.Line(geometry, material);
      group.add(helix);

      // Add moving particle
      const particleGeom = new THREE.SphereGeometry(0.2, 16, 16);
      const particleMat = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffaa00
      });
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.userData.path = points;
      particle.userData.index = 0;
      group.add(particle);

      return group;
    };

    const createGravityField = () => {
      const group = new THREE.Group();
      
      // Central mass
      const massGeom = new THREE.SphereGeometry(0.5, 32, 32);
      const massMat = new THREE.MeshPhongMaterial({ 
        color: 0xff4400,
        emissive: 0xff2200
      });
      const mass = new THREE.Mesh(massGeom, massMat);
      group.add(mass);

      // Field lines
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const points = [];
        for (let r = 1; r < 8; r += 0.2) {
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          points.push(new THREE.Vector3(x, y, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
          color: 0xff6600,
          transparent: true,
          opacity: 0.6
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
      }

      return group;
    };

    const createElectromagneticField = () => {
      const group = new THREE.Group();
      
      // Electric field (blue arrows)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 3;
        const origin = new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle), 0);
        const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
        const arrow = new THREE.ArrowHelper(
          direction, origin, 2, 0x0088ff, 0.5, 0.3
        );
        group.add(arrow);
      }

      // Magnetic field (circular, red)
      for (let z = -3; z <= 3; z += 2) {
        const points = [];
        const r = 2;
        for (let t = 0; t <= Math.PI * 2; t += 0.1) {
          points.push(new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0088 });
        const circle = new THREE.Line(geometry, material);
        group.add(circle);
      }

      return group;
    };

    const createWaveField = () => {
      const group = new THREE.Group();
      const size = 10;
      const segments = 30;
      
      const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00aaff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      
      const wave = new THREE.Mesh(geometry, material);
      wave.userData.isWave = true;
      group.add(wave);

      return group;
    };

    const createUnifiedField = () => {
      const group = new THREE.Group();
      
      // Combined field representation
      const torusGeom = new THREE.TorusGeometry(3, 0.5, 16, 100);
      const torusMat = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
      });
      const torus = new THREE.Mesh(torusGeom, torusMat);
      group.add(torus);

      // Energy sphere
      const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        transparent: true,
        opacity: 0.7
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      group.add(sphere);

      return group;
    };

    // Store all visualizations
    const visualizations = {
      spacetime: createSpaceTimeGrid(),
      helix: createHelixPath(),
      gravity: createGravityField(),
      electromagnetic: createElectromagneticField(),
      wave: createWaveField(),
      unified: createUnifiedField()
    };

    // Add initial visualization
    let currentViz = visualizations[formulas[selectedFormula].viz];
    scene.add(currentViz);

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      if (isRotating && currentViz) {
        currentViz.rotation.y += 0.005;
      }

      // Update wave animation
      currentViz.traverse((child) => {
        if (child.userData.isWave && child.geometry) {
          const positions = child.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
            positions.setZ(i, z);
          }
          positions.needsUpdate = true;
        }

        // Animate particle on helix
        if (child.userData.path) {
          child.userData.index = (child.userData.index + 1) % child.userData.path.length;
          const pos = child.userData.path[child.userData.index];
          child.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Store visualizations for formula changes
      mountRef.current.userData = { visualizations, currentViz };
    };
  }, []);

  // Handle formula changes
  useEffect(() => {
    if (!sceneRef.current || !mountRef.current.userData) return;

    const { visualizations, currentViz } = mountRef.current.userData;
    
    // Remove current visualization
    if (currentViz) {
      sceneRef.current.remove(currentViz);
    }

    // Add new visualization
    const newViz = visualizations[formulas[selectedFormula].viz];
    sceneRef.current.add(newViz);
    mountRef.current.userData.currentViz = newViz;
  }, [selectedFormula]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            张祥前统一场论 3D可视化系统
          </h1>
          <p className="text-gray-300 text-sm">
            Unified Field Theory Interactive Visualization
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 3D Visualization */}
          <div className="lg:col-span-3">
            <Card className="h-full bg-black/40 backdrop-blur border-cyan-500/30">
              <CardContent className="p-0 h-full">
                <div ref={mountRef} className="w-full h-full rounded-lg" />
                
                {/* Controls Overlay */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <button
                    onClick={() => setIsRotating(!isRotating)}
                    className="px-4 py-2 bg-cyan-500/80 hover:bg-cyan-400 text-white rounded-lg backdrop-blur transition"
                  >
                    {isRotating ? '⏸ 暂停' : '▶ 旋转'}
                  </button>
                  <button
                    onClick={() => setShowVectors(!showVectors)}
                    className="px-4 py-2 bg-purple-500/80 hover:bg-purple-400 text-white rounded-lg backdrop-blur transition"
                  >
                    {showVectors ? '隐藏' : '显示'} 矢量
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formula Panel */}
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {formulas.map((formula) => (
              <Card
                key={formula.id}
                className={`cursor-pointer transition-all transform hover:scale-105 ${
                  selectedFormula === formula.id
                    ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400 shadow-lg shadow-cyan-500/50'
                    : 'bg-black/40 border-gray-700 hover:border-cyan-500/50'
                } backdrop-blur`}
                onClick={() => setSelectedFormula(formula.id)}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-cyan-300 mb-1">
                    {formula.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formula.desc}
                  </p>
                  {selectedFormula === formula.id && (
                    <div className="mt-2 pt-2 border-t border-cyan-500/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="text-xs text-cyan-300">正在显示</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 backdrop-blur">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-amber-300 mb-2">
                  💡 交互提示
                </h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• 点击公式切换可视化</li>
                  <li>• 鼠标拖拽旋转视角</li>
                  <li>• 滚轮缩放场景</li>
                  <li>• 观察场的动态演化</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedFieldVisualization;