import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const UnifiedFieldVisualization = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  
  // Physical constants
  const h_bar = 1.0545718e-34; // J·s
  const c = 299792458; // m/s  
  const G_actual = 6.67430e-11; // m³/kg·s²
  
  // State for interactive parameters
  const [kMultiplier, setKMultiplier] = useState(1.0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [time, setTime] = useState(0);
  
  // Calculate derived values
  const m_p = Math.sqrt(h_bar * c / G_actual); // Planck mass
  const k_base = 4 * Math.PI * m_p;
  const k = k_base * kMultiplier;
  const G_calculated = (16 * Math.PI * Math.PI * h_bar * c) / (k * k);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create coordinate system
    const axesHelper = new THREE.AxesHelper(8);
    scene.add(axesHelper);
    
    // Create surface representing G as function of parameters
    const createSurface = () => {
      const geometry = new THREE.PlaneGeometry(10, 10, 50, 50);
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Map x,y to k and another parameter
        const k_val = k_base * (1 + x * 0.5);
        const h_val = h_bar * (1 + y * 0.1);
        
        // Calculate G based on the formula
        const G_val = (16 * Math.PI * Math.PI * h_val * c) / (k_val * k_val);
        
        // Scale for visualization
        positions[i + 2] = (G_val / G_actual - 1) * 50;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshPhongMaterial({
        color: 0x4fc3f7,
        wireframe: false,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      return new THREE.Mesh(geometry, material);
    };
    
    const surface = createSurface();
    scene.add(surface);
    
    // Create particles representing physical constants
    const createConstantSphere = (color, position, scale = 1) => {
      const geometry = new THREE.SphereGeometry(0.3 * scale, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      return sphere;
    };
    
    // Constants visualization
    const hBarSphere = createConstantSphere(0xff6b6b, new THREE.Vector3(-6, 0, 2));
    const cSphere = createConstantSphere(0x4ecdc4, new THREE.Vector3(0, 6, 2));
    const GSphere = createConstantSphere(0xffe66d, new THREE.Vector3(6, 0, 2));
    const kSphere = createConstantSphere(0xc44569, new THREE.Vector3(0, -6, 2));
    
    scene.add(hBarSphere, cSphere, GSphere, kSphere);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (showAnimation) {
        setTime(prev => prev + 0.02);
        
        // Rotate the surface
        surface.rotation.z = time * 0.5;
        
        // Animate constant spheres
        hBarSphere.position.y = 2 * Math.sin(time);
        cSphere.position.x = 2 * Math.cos(time);
        GSphere.position.y = -2 * Math.sin(time * 1.2);
        kSphere.position.x = -2 * Math.cos(time * 0.8);
        
        // Update camera orbit
        const radius = 15;
        camera.position.x = radius * Math.cos(time * 0.3);
        camera.position.z = radius * Math.sin(time * 0.3);
        camera.lookAt(0, 0, 0);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [kMultiplier, showAnimation, time]);
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        统一场论公式可视化分析
      </h2>
      
      <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded">
        <h3 className="font-bold text-red-300 mb-2">⚠️ 数学分析警告</h3>
        <p className="text-red-200 text-sm">
          此公式存在循环论证：使用普朗克质量定义k，然后用k验证G，实际上只是在验证G=G的恒等式。
          这不是真正的统一场论，而是数学恒等式的包装。
        </p>
      </div>
      
      <div ref={mountRef} className="mb-6 flex justify-center" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold mb-3">交互控制</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                k 参数倍数: {kMultiplier.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={kMultiplier}
                onChange={(e) => setKMultiplier(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className={`w-full py-2 px-4 rounded ${
                showAnimation 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors`}
            >
              {showAnimation ? '停止动画' : '开始动画'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold mb-3">计算结果</h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span>普朗克质量 m_p:</span>
              <span>{m_p.toExponential(3)} kg</span>
            </div>
            <div className="flex justify-between">
              <span>基础常数 k:</span>
              <span>{k_base.toExponential(3)} kg</span>
            </div>
            <div className="flex justify-between">
              <span>当前 k 值:</span>
              <span>{k.toExponential(3)} kg</span>
            </div>
            <div className="flex justify-between">
              <span>计算的 G:</span>
              <span className={G_calculated === G_actual ? 'text-green-400' : 'text-yellow-400'}>
                {G_calculated.toExponential(3)} m³/kg·s²
              </span>
            </div>
            <div className="flex justify-between">
              <span>实际 G:</span>
              <span>{G_actual.toExponential(3)} m³/kg·s²</span>
            </div>
            <div className="flex justify-between">
              <span>相对误差:</span>
              <span className="text-blue-400">
                {(Math.abs(G_calculated - G_actual) / G_actual * 100).toFixed(6)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h3 className="font-bold mb-3">公式分析</h3>
        <div className="space-y-2 text-sm">
          <p><strong>原公式：</strong> G = 16π²ℏc/k²</p>
          <p><strong>问题：</strong> k = 4πm_p = 4π√(ℏc/G)</p>
          <p><strong>代入后：</strong> G = 16π²ℏc/(16π²ℏc/G) = G</p>
          <p className="text-yellow-300">
            <strong>结论：</strong> 这是数学恒等式，不是物理定律。真正的统一场论需要独立的物理原理，
            而不是从已知常数的定义中推导出恒等式。
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>🔴 红球: ℏ (约化普朗克常数) | 🟢 绿球: c (光速)</p>
        <p>🟡 黄球: G (万有引力常数) | 🟣 紫球: k (比例常数)</p>
        <p>蓝色曲面: G 作为参数的函数关系</p>
      </div>
    </div>
  );
};

export default UnifiedFieldVisualization;