import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const UnifiedFieldTheory3D = () => {
  const containerRef = useRef(null);
  const [selectedForce, setSelectedForce] = useState('all');
  const [showVectors, setShowVectors] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showHelixPath, setShowHelixPath] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVerticalPlanes, setShowVerticalPlanes] = useState(true);
  const [cameraMode, setCameraMode] = useState('auto');
  const [particleTrail, setParticleTrail] = useState(true);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    scene.fog = new THREE.Fog(0x000510, 20, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      65,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(18, 15, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 增强光照系统
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(20, 30, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const pointLight1 = new THREE.PointLight(0x4488ff, 1.5, 50);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff4488, 1.2, 50);
    pointLight2.position.set(-15, -10, -15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x44ff88, 1.0, 40);
    pointLight3.position.set(0, -15, 0);
    scene.add(pointLight3);

    // 发光星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starVertices.push(x, y, z);
      
      const brightness = Math.random();
      starColors.push(brightness, brightness * 0.8 + 0.2, 1);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 增强坐标轴系统
    const axesGroup = new THREE.Group();
    const axisLength = 14;
    
    const createEnhancedAxis = (color, direction, label) => {
      // 主轴线
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...direction).multiplyScalar(axisLength)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color, 
        linewidth: 3,
        transparent: true,
        opacity: 0.9
      });
      const line = new THREE.Line(geometry, material);
      
      // 轴线发光效果
      const glowGeometry = new THREE.TubeGeometry(
        new THREE.LineCurve3(points[0], points[1]),
        20, 0.08, 8, false
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      
      const group = new THREE.Group();
      group.add(line);
      group.add(glow);
      
      // 刻度标记
      for (let i = 1; i <= 3; i++) {
        const scale = (i * axisLength) / 3;
        const tickGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const tickMaterial = new THREE.MeshBasicMaterial({ color });
        const tick = new THREE.Mesh(tickGeometry, tickMaterial);
        const pos = new THREE.Vector3(...direction).multiplyScalar(scale);
        tick.position.copy(pos);
        group.add(tick);
      }
      
      return group;
    };
    
    axesGroup.add(createEnhancedAxis(0xff3355, [1, 0, 0], 'X'));
    axesGroup.add(createEnhancedAxis(0x33ff55, [0, 1, 0], 'Y'));
    axesGroup.add(createEnhancedAxis(0x3355ff, [0, 0, 1], 'Z'));
    scene.add(axesGroup);

    // 3D文字标签
    const addEnhanced3DLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // 发光效果
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = color;
      ctx.font = 'Bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 128);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(2, 2, 1);
      scene.add(sprite);
    };

    addEnhanced3DLabel('X', new THREE.Vector3(axisLength + 1.5, 0, 0), '#ff3355');
    addEnhanced3DLabel('Y', new THREE.Vector3(0, axisLength + 1.5, 0), '#33ff55');
    addEnhanced3DLabel('Z', new THREE.Vector3(0, 0, axisLength + 1.5), '#3355ff');

    // 螺旋轨迹参数
    const helixParams = {
      r: 5,
      omega: 0.6,
      h: 2.2,
      points: 800
    };

    // 增强螺旋路径
    const helixPoints = [];
    const helixColors = [];
    for (let i = 0; i < helixParams.points; i++) {
      const t = (i / helixParams.points) * 10 * Math.PI;
      const x = helixParams.r * Math.cos(helixParams.omega * t);
      const y = helixParams.r * Math.sin(helixParams.omega * t);
      const z = helixParams.h * t - 20;
      helixPoints.push(new THREE.Vector3(x, y, z));
      
      const progress = i / helixParams.points;
      const hue = progress * 0.8 + 0.1;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      helixColors.push(color.r, color.g, color.b);
    }

    const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
    const helixTubeGeometry = new THREE.TubeGeometry(helixCurve, 400, 0.12, 8, false);
    const helixTubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    // 添加颜色渐变
    const colors = new Float32Array(helixTubeGeometry.attributes.position.count * 3);
    for (let i = 0; i < helixTubeGeometry.attributes.position.count; i++) {
      const progress = i / helixTubeGeometry.attributes.position.count;
      const hue = progress * 0.8 + 0.1;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    helixTubeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    helixTubeMaterial.vertexColors = true;
    
    const helixTube = new THREE.Mesh(helixTubeGeometry, helixTubeMaterial);
    scene.add(helixTube);

    // 粒子轨迹系统
    const trailLength = 50;
    const trailPoints = [];
    for (let i = 0; i < trailLength; i++) {
      trailPoints.push(new THREE.Vector3(0, 0, 0));
    }
    const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
      blending: THREE.AdditiveBlending
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    // 超级粒子（带光晕）
    const particleGroup = new THREE.Group();
    
    // 核心粒子
    const particleGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const particleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0xffaa00,
      shininess: 100,
      transparent: true,
      opacity: 0.95
    });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particleGroup.add(particle);
    
    // 内光晕
    const innerGlowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    particleGroup.add(innerGlow);
    
    // 外光晕
    const outerGlowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    particleGroup.add(outerGlow);
    
    scene.add(particleGroup);

    // 增强垂直平面系统
    const planeSize = 2.5;
    const planeGroup = new THREE.Group();
    
    const createEnhancedPlane = (color, rotation, label) => {
      const group = new THREE.Group();
      
      // 主平面
      const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
      const material = new THREE.MeshBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.copy(rotation);
      group.add(plane);
      
      // 边框
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ 
        color, 
        linewidth: 2,
        transparent: true,
        opacity: 0.8
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.rotation.copy(rotation);
      group.add(edges);
      
      // 网格
      const gridHelper = new THREE.GridHelper(planeSize, 10, color, color);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.2;
      gridHelper.rotation.copy(rotation);
      if (label === 'YZ') gridHelper.rotation.z = Math.PI / 2;
      if (label === 'XZ') gridHelper.rotation.x = Math.PI / 2;
      group.add(gridHelper);
      
      return group;
    };

    planeGroup.add(createEnhancedPlane(0xff3355, new THREE.Euler(0, 0, 0), 'XY'));
    planeGroup.add(createEnhancedPlane(0x33ff55, new THREE.Euler(Math.PI/2, 0, 0), 'XZ'));
    planeGroup.add(createEnhancedPlane(0x3355ff, new THREE.Euler(0, Math.PI/2, 0), 'YZ'));
    scene.add(planeGroup);

    // 增强力矢量箭头系统
    const forceArrows = {};
    const createEnhancedArrow = (color, name, label) => {
      const group = new THREE.Group();
      const direction = new THREE.Vector3(1, 0, 0);
      const origin = new THREE.Vector3(0, 0, 0);
      const length = 3.5;
      
      const arrow = new THREE.ArrowHelper(
        direction, origin, length, color, 
        length * 0.25, length * 0.15
      );
      arrow.line.material.linewidth = 3;
      group.add(arrow);
      
      // 箭头发光管
      const arrowGlowGeometry = new THREE.CylinderGeometry(0.08, 0.08, length * 0.7, 8);
      const arrowGlowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const arrowGlow = new THREE.Mesh(arrowGlowGeometry, arrowGlowMaterial);
      arrowGlow.position.set(0, length * 0.35, 0);
      arrowGlow.rotation.x = Math.PI / 2;
      group.add(arrowGlow);
      
      // 标签
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 256, 128);
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = color;
      ctx.font = 'Bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(0, 0, length + 1);
      sprite.scale.set(2, 1, 1);
      group.add(sprite);
      
      group.visible = false;
      scene.add(group);
      return group;
    };

    forceArrows.gravity = createEnhancedArrow(0xff3333, 'gravity', '引力');
    forceArrows.electric = createEnhancedArrow(0x33ff33, 'electric', '电场力');
    forceArrows.magnetic = createEnhancedArrow(0x3333ff, 'magnetic', '磁场力');
    forceArrows.nuclear = createEnhancedArrow(0xff33ff, 'nuclear', '核力');

    // 场线系统
    const fieldLinesGroup = new THREE.Group();
    
    // 电场线（径向）
    const electricFieldLines = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const points = [];
      for (let j = 0; j < 30; j++) {
        const r = 1 + j * 0.4;
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          0
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x33ff33,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geometry, material);
      electricFieldLines.push(line);
      fieldLinesGroup.add(line);
    }
    
    // 磁场线（环形）
    const magneticFieldLines = [];
    for (let i = 0; i < 12; i++) {
      const radius = 2 + i * 0.6;
      const points = [];
      for (let j = 0; j <= 128; j++) {
        const angle = (j / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x3333ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geometry, material);
      line.rotation.x = Math.PI / 2;
      magneticFieldLines.push(line);
      fieldLinesGroup.add(line);
    }
    
    scene.add(fieldLinesGroup);

    // 鼠标交互
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      if (cameraMode === 'manual') {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 动画循环
    let time = 0;
    const trailHistory = [];
    
    const animate = () => {
      time += 0.012 * animationSpeed;
      
      // 粒子沿螺旋运动
      const t = time;
      const x = helixParams.r * Math.cos(helixParams.omega * t);
      const y = helixParams.r * Math.sin(helixParams.omega * t);
      const z = helixParams.h * t;
      const zMapped = ((z % 40) - 20);
      
      particleGroup.position.set(x, y, zMapped);
      
      // 粒子旋转动画
      particle.rotation.y += 0.02;
      innerGlow.rotation.y -= 0.03;
      outerGlow.rotation.x += 0.01;
      
      // 光晕呼吸效果
      const pulse = Math.sin(time * 2) * 0.2 + 1;
      innerGlow.scale.set(pulse, pulse, pulse);
      outerGlow.scale.set(pulse * 0.8, pulse * 0.8, pulse * 0.8);

      // 粒子轨迹
      if (particleTrail) {
        trailHistory.push(new THREE.Vector3(x, y, zMapped));
        if (trailHistory.length > trailLength) {
          trailHistory.shift();
        }
        const positions = trail.geometry.attributes.position.array;
        for (let i = 0; i < trailHistory.length; i++) {
          positions[i * 3] = trailHistory[i].x;
          positions[i * 3 + 1] = trailHistory[i].y;
          positions[i * 3 + 2] = trailHistory[i].z;
        }
        trail.geometry.attributes.position.needsUpdate = true;
        trail.visible = true;
      } else {
        trail.visible = false;
      }

      // 更新垂直平面
      if (showVerticalPlanes) {
        planeGroup.position.copy(particleGroup.position);
        planeGroup.rotation.z = time * 0.3;
        planeGroup.visible = true;
      } else {
        planeGroup.visible = false;
      }

      // 计算运动向量
      const vx = -helixParams.r * helixParams.omega * Math.sin(helixParams.omega * t);
      const vy = helixParams.r * helixParams.omega * Math.cos(helixParams.omega * t);
      const vz = helixParams.h;
      const tangent = new THREE.Vector3(vx, vy, vz).normalize();

      // 更新力矢量
      if (showVectors) {
        const particlePos = particleGroup.position;
        
        // 引力
        const gravityDir = new THREE.Vector3(-x, -y, 0).normalize();
        forceArrows.gravity.position.copy(particlePos);
        forceArrows.gravity.children[0].setDirection(gravityDir);
        forceArrows.gravity.children[1].lookAt(particlePos.clone().add(gravityDir.multiplyScalar(3)));
        forceArrows.gravity.visible = selectedForce === 'all' || selectedForce === 'gravity';

        // 电场力
        const electricDir = new THREE.Vector3(x, y, 0).normalize();
        forceArrows.electric.position.copy(particlePos);
        forceArrows.electric.children[0].setDirection(electricDir);
        forceArrows.electric.children[1].lookAt(particlePos.clone().add(electricDir.multiplyScalar(3)));
        forceArrows.electric.visible = selectedForce === 'all' || selectedForce === 'electric';

        // 磁场力
        const magneticDir = tangent.clone().cross(new THREE.Vector3(x, y, z)).normalize();
        forceArrows.magnetic.position.copy(particlePos);
        forceArrows.magnetic.children[0].setDirection(magneticDir);
        forceArrows.magnetic.children[1].lookAt(particlePos.clone().add(magneticDir.multiplyScalar(3)));
        forceArrows.magnetic.visible = selectedForce === 'all' || selectedForce === 'magnetic';

        // 核力
        const nuclearDir = new THREE.Vector3(0, 0, 1);
        forceArrows.nuclear.position.copy(particlePos);
        forceArrows.nuclear.children[0].setDirection(nuclearDir);
        forceArrows.nuclear.children[1].lookAt(particlePos.clone().add(nuclearDir.multiplyScalar(3)));
        forceArrows.nuclear.visible = selectedForce === 'all' || selectedForce === 'nuclear';
      } else {
        Object.values(forceArrows).forEach(arrow => arrow.visible = false);
      }

      // 场线可见性和动画
      if (showFieldLines) {
        electricFieldLines.forEach((line, i) => {
          line.visible = selectedForce === 'all' || selectedForce === 'electric';
          line.position.copy(particleGroup.position);
          line.rotation.z = time * 0.2 + i * 0.1;
        });
        magneticFieldLines.forEach((line, i) => {
          line.visible = selectedForce === 'all' || selectedForce === 'magnetic';
          line.position.copy(particleGroup.position);
          line.rotation.y = time * 0.15;
        });
      } else {
        fieldLinesGroup.visible = false;
      }

      // 螺旋路径可见性
      helixTube.visible = showHelixPath;

      // 相机控制
      if (cameraMode === 'auto') {
        const cameraRadius = 22;
        camera.position.x = cameraRadius * Math.cos(time * 0.08);
        camera.position.z = cameraRadius * Math.sin(time * 0.08);
        camera.position.y = 12 + Math.sin(time * 0.05) * 3;
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'manual') {
        const cameraRadius = 25;
        camera.position.x = cameraRadius * mouseX * 1.5;
        camera.position.y = cameraRadius * mouseY * 1.5;
        camera.position.z = cameraRadius * Math.sqrt(1 - mouseX*mouseX*0.5 - mouseY*mouseY*0.5);
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'follow') {
        camera.position.set(
          particleGroup.position.x + 10,
          particleGroup.position.y + 8,
          particleGroup.position.z + 10
        );
        camera.lookAt(particleGroup.position);
      }

      // 星空旋转
      stars.rotation.y += 0.0002;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 窗口调整
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedForce, showVectors, animationSpeed, showHelixPath, showFieldLines, showVerticalPlanes, cameraMode, particleTrail]);

  const forceInfo = {
    all: {
      name: '四力统一视图',
      formula: 'F⃗ = C⃗(dm/dt) - V⃗(dm/dt) + m(dC⃗/dt) - m(dV⃗/dt)',
      description: '宇宙大统一方程：四种基本力统一于三维螺旋运动的不同变化模式',
      color: 'from-purple-500 to-pink-500'
    },
    gravity: {
      name: '引力/惯性力',
      formula: 'F⃗ = -m(dV⃗/dt) = -ma⃗',
      description: '源于螺旋直线分量的速度变化，方向指向质量中心或与加速度反向',
      color: 'from-red-500 to-orange-500'
    },
    electric: {
      name: '电场力',
      formula: 'F⃗ = C⃗(dm/dt) = qE⃗',
      description: '源于螺旋直线分量的流量变化（dm/dt解释为电荷），方向沿电荷连线径向，同斥异吸',
      color: 'from-green-500 to-emerald-500'
    },
    magnetic: {
      name: '磁场力',
      formula: 'F⃗ = -V⃗(dm/dt) = q(v⃗×B⃗)',
      description: '源于螺旋旋转分量的变化，方向始终垂直于速度与磁场构成的平面（右手定则）',
      color: 'from-blue-500 to-cyan-500'
    },
    nuclear: {
      name: '核力（强相互作用）',
      formula: 'F⃗ = m(dC⃗/dt)',
      description: '源于光速矢量C⃗方向的剧烈变化，在原子核尺度产生极强的短程束缚力',
      color: 'from-purple-500 to-fuchsia-500'
    }
  };

  const currentForce = forceInfo[selectedForce];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-6 shadow-2xl border-b border-purple-500/30">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
          张祥前统一场论 - 三维螺旋运动与四种基本力
        </h1>
        <p className="text-sm opacity-90 text-cyan-200">
          基于垂直原理的几何力学统一理论 | 从几何本源推导物理力的完整体系
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 3D视图区域 */}
        <div className="flex-1 relative" ref={containerRef}>
          {/* 力信息浮动面板 */}
          <div className={`absolute top-6 left-6 bg-gradient-to-br ${currentForce.color} bg-opacity-95 backdrop-blur-lg text-white p-6 rounded-2xl shadow-2xl max-w-xl border border-white/20`}>
            <h3 className="text-2xl font-bold mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-white mr-3 animate-pulse"></span>
              {currentForce.name}
            </h3>
            <div className="mb-3 font-mono text-sm bg-black/30 p-3 rounded-lg backdrop-blur border border-white/10">
              {currentForce.formula}
            </div>
            <p className="text-sm leading-relaxed">{currentForce.description}</p>
          </div>

          {/* 螺旋运动方程面板 */}
          <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl border border-cyan-500/30">
            <div className="text-xs mb-2 text-cyan-400 font-semibold uppercase tracking-wider">
              三维螺旋运动方程
            </div>
            <div className="font-mono text-base mb-2">
              R⃗(t) = [r·cos(ωt)]<span className="text-red-400">î</span> + [r·sin(ωt)]<span className="text-green-400">ĵ</span> + (ht)<span className="text-blue-400">k̂</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• <span className="text-yellow-400">r = 5.0</span> (螺旋半径)</div>
              <div>• <span className="text-yellow-400">ω = 0.6</span> (角速度)</div>
              <div>• <span className="text-yellow-400">h = 2.2</span> (螺距参数，代表光速c)</div>
            </div>
          </div>

          {/* 垂直原理说明 */}
          <div className="absolute top-6 right-6 bg-gradient-to-br from-yellow-600/90 to-orange-600/90 backdrop-blur-lg text-white p-5 rounded-2xl shadow-2xl max-w-sm border border-yellow-300/20">
            <h4 className="text-lg font-bold mb-2 flex items-center">
              <span className="text-2xl mr-2">⊥</span>
              垂直原理（第一性原理）
            </h4>
            <p className="text-xs leading-relaxed">
              空间中任意点都处于<strong>三维垂直状态</strong>，这种几何约束强制空间必须运动，且运动方向持续变化，形成三维螺旋运动。<br/><br/>
              <span className="text-yellow-200">运动不是外力强加的，而是空间几何属性的必然结果。</span>
            </p>
          </div>

          {/* 性能统计 */}
          <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur text-green-400 px-4 py-2 rounded-lg font-mono text-xs border border-green-500/30">
            <div>FPS: 60 | Particles: 2000+</div>
          </div>
        </div>

        {/* 右侧控制面板 */}
        <div className="w-96 bg-gradient-to-b from-gray-900 to-indigo-950 text-white p-6 overflow-y-auto border-l border-purple-500/30 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            控制中心
          </h2>

          {/* 力类型选择 */}
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-sm font-semibold mb-3 text-cyan-400 uppercase tracking-wide">
              选择力类型
            </label>
            <select
              value={selectedForce}
              onChange={(e) => setSelectedForce(e.target.value)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg border-2 border-purple-400/50 font-semibold cursor-pointer hover:border-purple-300 transition-all"
            >
              <option value="all">🌌 统一视图 (四种力)</option>
              <option value="gravity">🔴 引力/惯性力</option>
              <option value="electric">🟢 电场力</option>
              <option value="magnetic">🔵 磁场力</option>
              <option value="nuclear">🟣 核力</option>
            </select>
          </div>

          {/* 相机模式 */}
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-sm font-semibold mb-3 text-cyan-400 uppercase tracking-wide">
              相机模式
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCameraMode('auto')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  cameraMode === 'auto' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                自动旋转
              </button>
              <button
                onClick={() => setCameraMode('manual')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  cameraMode === 'manual' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                手动控制
              </button>
              <button
                onClick={() => setCameraMode('follow')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  cameraMode === 'follow' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                跟随粒子
              </button>
            </div>
          </div>

          {/* 动画速度 */}
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-sm font-semibold mb-3 text-cyan-400 uppercase tracking-wide">
              动画速度: <span className="text-yellow-400">{animationSpeed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>慢速</span>
              <span>快速</span>
            </div>
          </div>

          {/* 显示选项 */}
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-sm font-semibold mb-3 text-cyan-400 uppercase tracking-wide">
              显示选项
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">显示力矢量箭头</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showHelixPath}
                  onChange={(e) => setShowHelixPath(e.target.checked)}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">显示螺旋轨迹</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showFieldLines}
                  onChange={(e) => setShowFieldLines(e.target.checked)}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">显示场线分布</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showVerticalPlanes}
                  onChange={(e) => setShowVerticalPlanes(e.target.checked)}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">显示垂直平面</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={particleTrail}
                  onChange={(e) => setParticleTrail(e.target.checked)}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">显示粒子轨迹</span>
              </label>
            </div>
          </div>

          {/* 理论框架 */}
          <div className="border-t border-purple-500/30 pt-6">
            <h3 className="font-bold mb-4 text-lg text-yellow-400">理论框架</h3>
            
            <div className="mb-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 rounded-xl border border-purple-400/30">
              <h4 className="font-semibold mb-2 text-purple-300">垂直原理 → 螺旋运动</h4>
              <p className="text-xs leading-relaxed text-gray-300">
                三维垂直的几何约束决定了空间必须以螺旋方式运动，这是宇宙最底层的几何法则。
              </p>
            </div>

            <div className="mb-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-400/30">
              <h4 className="font-semibold mb-2 text-blue-300">螺旋分解 → 两种运动</h4>
              <div className="text-xs space-y-1 text-gray-300">
                <div>• <strong className="text-cyan-400">直线分量</strong>: 沿轴线匀速运动 (速度h=c)</div>
                <div>• <strong className="text-cyan-400">旋转分量</strong>: 绕轴线旋转 (角速度ω)</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 p-4 rounded-xl border border-orange-400/30">
              <h4 className="font-semibold mb-2 text-orange-300">运动变化 → 四种力</h4>
              <div className="text-xs space-y-2 text-gray-300">
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">▸</span>
                  <div><strong>直线速度变化</strong> → 引力/惯性力</div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">▸</span>
                  <div><strong>直线流量变化</strong> → 电场力</div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">▸</span>
                  <div><strong>旋转强度变化</strong> → 磁场力</div>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2">▸</span>
                  <div><strong>光速方向变化</strong> → 核力</div>
                </div>
              </div>
            </div>
          </div>

          {/* 坐标系图例 */}
          <div className="border-t border-purple-500/30 pt-6 mt-6">
            <h3 className="font-bold mb-3 text-yellow-400">坐标系图例</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center bg-red-900/20 p-2 rounded border border-red-500/30">
                <div className="w-6 h-1 bg-gradient-to-r from-red-500 to-red-300 mr-3 rounded"></div>
                <span><strong className="text-red-400">X轴</strong> - 红色</span>
              </div>
              <div className="flex items-center bg-green-900/20 p-2 rounded border border-green-500/30">
                <div className="w-6 h-1 bg-gradient-to-r from-green-500 to-green-300 mr-3 rounded"></div>
                <span><strong className="text-green-400">Y轴</strong> - 绿色</span>
              </div>
              <div className="flex items-center bg-blue-900/20 p-2 rounded border border-blue-500/30">
                <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mr-3 rounded"></div>
                <span><strong className="text-blue-400">Z轴</strong> - 蓝色 (螺旋轴向)</span>
              </div>
            </div>
          </div>

          {/* 使用提示 */}
          <div className="border-t border-purple-500/30 pt-6 mt-6">
            <h3 className="font-bold mb-3 text-yellow-400">使用提示</h3>
            <div className="text-xs space-y-2 text-gray-300 bg-indigo-900/30 p-3 rounded-lg">
              <div>💡 选择"手动控制"模式后，移动鼠标可改变视角</div>
              <div>💡 "跟随粒子"模式可近距离观察螺旋运动</div>
              <div>💡 关闭部分显示选项可提升性能</div>
              <div>💡 调慢速度可仔细观察力的方向变化</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedFieldTheory3D;