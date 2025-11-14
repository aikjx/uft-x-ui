import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const UnifiedFieldVisualization = () => {
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 创建三条相互垂直的线（加粗加长）
    const lineLength = 12;
    const createAxisLine = (start, end, color) => {
      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: color, 
        linewidth: 10,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(geometry, material);
      
      // 使用圆柱体代替线条以获得更好的视觉效果
      const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, lineLength, 16);
      const cylinderMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      });
      return { line, cylinderGeometry, cylinderMaterial };
    };

    // X轴 - 红色
    const xAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, lineLength, 16),
      new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      })
    );
    xAxis.rotation.z = Math.PI / 2;
    scene.add(xAxis);

    // Y轴 - 绿色
    const yAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, lineLength, 16),
      new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      })
    );
    scene.add(yAxis);

    // Z轴 - 蓝色
    const zAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, lineLength, 16),
      new THREE.MeshPhongMaterial({ 
        color: 0x0000ff,
        emissive: 0x0000ff,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      })
    );
    zAxis.rotation.x = Math.PI / 2;
    scene.add(zAxis);

    // 创建三个运动的点（发光球体）
    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    
    const pointX = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,
        shininess: 100
      })
    );
    scene.add(pointX);

    const pointY = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1,
        shininess: 100
      })
    );
    scene.add(pointY);

    const pointZ = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshPhongMaterial({ 
        color: 0x0000ff,
        emissive: 0x0000ff,
        emissiveIntensity: 1,
        shininess: 100
      })
    );
    scene.add(pointZ);

    // 为每个点添加发光效果
    const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    const glowX = new THREE.Mesh(
      glowGeometry,
      new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      })
    );
    pointX.add(glowX);

    const glowY = new THREE.Mesh(
      glowGeometry,
      new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      })
    );
    pointY.add(glowY);

    const glowZ = new THREE.Mesh(
      glowGeometry,
      new THREE.MeshBasicMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      })
    );
    pointZ.add(glowZ);

    // 创建轨迹线
    const trailLength = 200;
    const trailPositionsX = [];
    const trailPositionsY = [];
    const trailPositionsZ = [];
    
    for (let i = 0; i < trailLength; i++) {
      trailPositionsX.push(new THREE.Vector3(0, 0, 0));
      trailPositionsY.push(new THREE.Vector3(0, 0, 0));
      trailPositionsZ.push(new THREE.Vector3(0, 0, 0));
    }

    const createTrail = (positions, color) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(positions);
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      return new THREE.Line(geometry, material);
    };

    const trailX = createTrail(trailPositionsX, 0xff0000);
    const trailY = createTrail(trailPositionsY, 0x00ff00);
    const trailZ = createTrail(trailPositionsZ, 0x0000ff);
    
    scene.add(trailX);
    scene.add(trailY);
    scene.add(trailZ);

    // 添加标签强调垂直关系
    const createLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 256;
      context.fillStyle = color;
      context.font = 'Bold 80px Arial';
      context.textAlign = 'center';
      context.fillText(text, 256, 150);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(3, 1.5, 1);
      return sprite;
    };

    const labelX = createLabel('X轴 ⊥', new THREE.Vector3(7, 0, 0), '#ff0000');
    const labelY = createLabel('Y轴 ⊥', new THREE.Vector3(0, 7, 0), '#00ff00');
    const labelZ = createLabel('Z轴 ⊥', new THREE.Vector3(0, 0, 7), '#0000ff');
    
    scene.add(labelX);
    scene.add(labelY);
    scene.add(labelZ);

    // 添加垂直符号
    const createPerpendicularMarker = (pos1, pos2, color) => {
      const size = 0.5;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        0, 0, 0,
        size, 0, 0,
        size, 0, 0,
        size, size, 0,
        size, size, 0,
        0, size, 0
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
      const marker = new THREE.LineSegments(geometry, material);
      marker.position.copy(pos1);
      return marker;
    };

    // 动画
    let animationId;
    let time = 0;
    const radius = 5;
    const speed = 2; // 光速的模拟速度
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (isAnimating) {
        time += 0.02 * speed;

        // 三个点沿各自垂直轴做圆周运动
        pointX.position.set(
          0,
          radius * Math.sin(time),
          radius * Math.cos(time)
        );

        pointY.position.set(
          radius * Math.cos(time + Math.PI * 2/3),
          0,
          radius * Math.sin(time + Math.PI * 2/3)
        );

        pointZ.position.set(
          radius * Math.cos(time + Math.PI * 4/3),
          radius * Math.sin(time + Math.PI * 4/3),
          0
        );

        // 更新轨迹
        trailPositionsX.push(pointX.position.clone());
        trailPositionsX.shift();
        trailX.geometry.setFromPoints(trailPositionsX);

        trailPositionsY.push(pointY.position.clone());
        trailPositionsY.shift();
        trailY.geometry.setFromPoints(trailPositionsY);

        trailPositionsZ.push(pointZ.position.clone());
        trailPositionsZ.shift();
        trailZ.geometry.setFromPoints(trailPositionsZ);

        // 发光脉冲效果
        const pulse = Math.sin(time * 3) * 0.5 + 1;
        pointX.material.emissiveIntensity = pulse;
        pointY.material.emissiveIntensity = pulse;
        pointZ.material.emissiveIntensity = pulse;

        // 轴线发光效果
        xAxis.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
        yAxis.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + Math.PI * 2/3) * 0.2;
        zAxis.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + Math.PI * 4/3) * 0.2;
      }

      // 缓慢旋转整个场景
      scene.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 轨迹可见性控制
    trailX.visible = showTrails;
    trailY.visible = showTrails;
    trailZ.visible = showTrails;

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 鼠标交互
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAnimating, showTrails]);

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      <div className="bg-gradient-to-r from-red-900 via-green-900 to-blue-900 p-6 shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-3 text-center">
          张祥前统一场论 - 垂直原理核心演示
        </h1>
        <p className="text-white text-lg text-center font-medium">
          三个运动点 · 三条相互垂直的线 · 证明宇宙是三维的
        </p>
      </div>
      
      <div className="flex-1 relative" ref={containerRef} />
      
      <div className="bg-gray-900 p-6 border-t-4 border-red-500">
        <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all font-bold text-lg shadow-lg"
          >
            {isAnimating ? '⏸ 暂停运动' : '▶ 开始运动'}
          </button>
          
          <button
            onClick={() => setShowTrails(!showTrails)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-bold text-lg shadow-lg"
          >
            {showTrails ? '隐藏轨迹' : '显示轨迹'}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border-2 border-red-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-bold text-xl">X轴运动点</span>
            </div>
            <p className="text-red-200 text-sm">在YZ平面做圆周运动</p>
          </div>
          
          <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border-2 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-bold text-xl">Y轴运动点</span>
            </div>
            <p className="text-green-200 text-sm">在XZ平面做圆周运动</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border-2 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-white font-bold text-xl">Z轴运动点</span>
            </div>
            <p className="text-blue-200 text-sm">在XY平面做圆周运动</p>
          </div>
        </div>
      </div>
      
      <div className="bg-black p-4 text-center border-t border-gray-700">
        <p className="text-yellow-400 font-bold text-lg mb-2">
          ⊥ 三条相互垂直的线 = 三维空间的本质证明 ⊥
        </p>
        <p className="text-gray-400 text-sm">
          拖动鼠标旋转视角 | 三个发光点以光速沿各自垂直方向运动
        </p>
      </div>
    </div>
  );
};

export default UnifiedFieldVisualization;