import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SpiralDivergenceVisualization = () => {
  const mountRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showCylinders, setShowCylinders] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 1.5, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5, 100);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);

    // 中心物体
    const centralGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const centralMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6,
      shininess: 100
    });
    const centralSphere = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralSphere);

    // 发光环
    const glowGeometry = new THREE.SphereGeometry(1.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.15
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowSphere);

    // 12个方向的圆柱体和螺旋系统
    const directions = [];
    const cylinders = [];
    const spiralSystems = [];
    
    // 定义12个均匀分布的方向（类似时钟的12个方向）
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      
      // 方向向量（水平面上的12个方向）
      const direction = new THREE.Vector3(
        Math.cos(angle),
        0,
        Math.sin(angle)
      );
      
      directions.push({
        angle: angle,
        direction: direction,
        color: new THREE.Color().setHSL(i / 12, 1, 0.6)
      });

      // 创建圆柱体框架
      const cylinderRadius = 1.5;
      const cylinderHeight = 15;
      const cylinderGeometry = new THREE.CylinderGeometry(
        cylinderRadius, 
        cylinderRadius, 
        cylinderHeight, 
        16, 
        1, 
        true
      );
      const cylinderMaterial = new THREE.MeshBasicMaterial({
        color: directions[i].color,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        wireframe: true
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      
      // 旋转并定位圆柱体
      cylinder.rotation.z = Math.PI / 2;
      cylinder.position.x = direction.x * (cylinderHeight / 2 + 1.2);
      cylinder.position.z = direction.z * (cylinderHeight / 2 + 1.2);
      
      cylinders.push(cylinder);
      scene.add(cylinder);

      // 为每个方向创建螺旋粒子系统 - 优化：使用 BufferGeometry 和 Points
      const spiralParticles = [];
      const particleCount = 60;
      
      // 存储粒子数据用于更新
      for (let j = 0; j < particleCount; j++) {
        spiralParticles.push({
          phase: j * 0.1,
          index: j,
          position: new THREE.Vector3()
        });
      }
      
      // 创建 BufferGeometry 用于 Points
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // 初始化位置和颜色
      for (let j = 0; j < particleCount; j++) {
        const color = directions[i].color;
        colors[j * 3] = color.r;
        colors[j * 3 + 1] = color.g;
        colors[j * 3 + 2] = color.b;
        sizes[j] = 0.3 + Math.random() * 0.2;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // 使用 PointsMaterial 而非 MeshPhongMaterial
      const particleMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.3,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
      
      spiralSystems.push({
        particles: spiralParticles,
        pointsObject: particles,
        geometry: particleGeometry,
        direction: direction,
        angle: angle,
        color: directions[i].color
      });
    }

    // 坐标轴
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // 地面网格
    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // 添加方向标签
    const createLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      context.fillStyle = color;
      context.font = 'Bold 48px Arial';
      context.textAlign = 'center';
      context.fillText(text, 128, 80);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(2, 1, 1);
      return sprite;
    };

    directions.forEach((dir, i) => {
      const labelPos = dir.direction.clone().multiplyScalar(18);
      labelPos.y = 0;
      const label = createLabel(`方向${i + 1}`, labelPos, '#ffffff');
      scene.add(label);
    });

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      if (isAnimating) {
        time += 0.015 * speed;

        // 中心球体动画
        centralSphere.rotation.y += 0.02;
        centralSphere.rotation.x += 0.01;
        
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        glowSphere.scale.set(pulse, pulse, pulse);
        glowSphere.rotation.y -= 0.015;

        // 更新圆柱体透明度
        cylinders.forEach((cylinder, i) => {
          if (showCylinders) {
            cylinder.material.opacity = 0.1 + Math.sin(time * 2 + i * 0.5) * 0.05;
          } else {
            cylinder.material.opacity = 0;
          }
        });

        // 更新每个方向的螺旋粒子 - 圆柱状螺旋发散
        spiralSystems.forEach((system, sysIndex) => {
          const positions = system.geometry.attributes.position.array;
          
          system.particles.forEach((particle, particleIndex) => {
            const t = (time + particle.phase) % 8;
            
            // 圆柱参数
            const cylinderRadius = 1.5;
            const omega = 3; // 螺旋角速度
            const h = 1.8; // 向外发散速度
            
            // 圆柱坐标系中的螺旋运动
            // 局部坐标：x为沿圆柱轴向，y和z在圆柱截面上
            const axialDistance = h * t; // 沿圆柱轴向的距离
            const localX = cylinderRadius * Math.cos(omega * t);
            const localY = cylinderRadius * Math.sin(omega * t);
            
            // 转换到全局坐标系
            const baseDistance = 1.2; // 从中心物体表面开始
            const globalDistance = baseDistance + axialDistance;
            
            // 沿着该方向的向量
            const mainDirection = system.direction.clone().multiplyScalar(globalDistance);
            
            // 垂直于主方向的两个正交向量（构建圆柱截面）
            const perpendicular1 = new THREE.Vector3();
            const perpendicular2 = new THREE.Vector3();
            
            if (Math.abs(system.direction.y) < 0.9) {
              perpendicular1.crossVectors(system.direction, new THREE.Vector3(0, 1, 0)).normalize();
            } else {
              perpendicular1.crossVectors(system.direction, new THREE.Vector3(1, 0, 0)).normalize();
            }
            perpendicular2.crossVectors(system.direction, perpendicular1).normalize();
            
            // 计算粒子在圆柱截面上的位置
            const radialOffset = perpendicular1.clone().multiplyScalar(localX)
              .add(perpendicular2.clone().multiplyScalar(localY));
            
            // 最终位置 = 主方向位置 + 径向偏移
            const finalPosition = mainDirection.clone().add(radialOffset);
            
            // 更新 BufferGeometry 中的位置数据
            positions[particleIndex * 3] = finalPosition.x;
            positions[particleIndex * 3 + 1] = finalPosition.y;
            positions[particleIndex * 3 + 2] = finalPosition.z;
            
            // 存储位置用于其他计算
            particle.position.copy(finalPosition);
          });
          
          // 标记位置属性需要更新
          system.geometry.attributes.position.needsUpdate = true;
        });
      }

      // 相机环绕
      const camRadius = 25;
      camera.position.x = camRadius * Math.cos(time * 0.05);
      camera.position.z = camRadius * Math.sin(time * 0.05);
      camera.position.y = 15 + Math.sin(time * 0.03) * 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [isAnimating, speed, showCylinders]);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900">
      <div className="p-6 text-white bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <h1 className="mb-3 text-3xl font-bold">物体12方向圆柱状螺旋发散运动</h1>
        <div className="grid grid-cols-1 gap-2 text-sm opacity-90 md:grid-cols-3">
          <p>• 时空同一化: <span className="font-mono">r⃗(t) = C⃗t</span></p>
          <p>• 三维螺旋: <span className="font-mono">r⃗(t) = r·cos(ωt)i⃗ + r·sin(ωt)j⃗ + ht·k⃗</span></p>
          <p>• 质量定义: <span className="font-mono">m = k·(dn/dΩ)</span></p>
        </div>
      </div>
      
      <div className="relative flex-1" ref={mountRef}>
        <div className="absolute top-4 right-4 z-10 p-4 space-y-3 max-w-xs text-white bg-black bg-opacity-80 rounded-lg">
          <h3 className="pb-2 text-lg font-bold border-b border-gray-600">控制面板</h3>
          
          <div>
            <label className="block mb-1 text-sm">运动速度: {speed.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cylinders"
              checked={showCylinders}
              onChange={(e) => setShowCylinders(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="cylinders" className="text-sm">显示圆柱体框架</label>
          </div>
          
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-4 py-2 w-full font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all hover:from-blue-700 hover:to-purple-700"
          >
            {isAnimating ? '⏸ 暂停' : '▶ 播放'}
          </button>
          
          <div className="pt-3 mt-4 space-y-2 text-xs border-t border-gray-600">
            <p className="font-semibold">可视化说明:</p>
            <p>🟡 中心物体发出</p>
            <p>🌈 12个方向圆柱体</p>
            <p>✨ 螺旋粒子发散</p>
            <p>📐 圆柱状轨迹</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-10 p-3 text-xs text-white bg-black bg-opacity-80 rounded-lg">
          <p className="mb-1 font-semibold">圆柱状螺旋运动特征：</p>
          <p>• 12个均匀分布方向</p>
          <p>• 每个方向为独立圆柱体</p>
          <p>• 粒子在圆柱内螺旋前进</p>
          <p>• 半径固定，沿轴向发散</p>
        </div>
      </div>
    </div>
  );
};

export default SpiralDivergenceVisualization;