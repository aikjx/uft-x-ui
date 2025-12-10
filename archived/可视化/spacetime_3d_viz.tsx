import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CylindricalSpiralField = () => {
  const containerRef = useRef(null);
  const [config, setConfig] = useState({
    spiralCount: 24,
    radius: 3,
    length: 30,
    rotations: 8,
    angularSpeed: 1.0,
    particleDensity: 150,
    fieldIntensity: 5,
    helixTightness: 1.0
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);
  const spiralDataRef = useRef([]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: Number(value) }));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000208);
    scene.fog = new THREE.FogExp2(0x000208, 0.008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(45, 30, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffaa00, 3, 100);
    pointLight1.position.set(0, 0, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1.5, 100);
    pointLight2.position.set(0, 20, 0);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff00ff, 1.5, 100);
    pointLight3.position.set(0, -20, 0);
    scene.add(pointLight3);

    const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xff6600,
      emissiveIntensity: 3,
      transparent: true,
      opacity: 0.95
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    for (let i = 1; i <= 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.5 * i, 0.1, 16, 100);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0xff8800,
        emissive: 0xff4400,
        emissiveIntensity: 2 / i,
        transparent: true,
        opacity: 0.3 / i,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotSpeed = 0.01 * i;
      scene.add(ring);
      spiralDataRef.current.push({ ring, isRing: true });
    }

    const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec3 vNormal;
        
        void main() {
          float pulse = 0.7 + 0.3 * sin(time * 3.0);
          float glow = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 color = vec3(1.0, 0.5, 0.1) * glow * intensity * pulse;
          gl_FragColor = vec4(color, glow * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    const axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);

    const gridXZ = new THREE.GridHelper(80, 40, 0x00ffff, 0x002244);
    gridXZ.material.opacity = 0.1;
    gridXZ.material.transparent = true;
    scene.add(gridXZ);

    const createCylindricalSpiralField = () => {
      spiralDataRef.current.forEach(data => {
        if (!data.isRing && data.line) {
          scene.remove(data.line);
          scene.remove(data.tube);
          scene.remove(data.particles);
          data.line?.geometry.dispose();
          data.line?.material.dispose();
          data.tube?.geometry.dispose();
          data.tube?.material.dispose();
          data.particles?.geometry.dispose();
          data.particles?.material.dispose();
        }
      });
      spiralDataRef.current = spiralDataRef.current.filter(d => d.isRing);

      const directions = [];
      
      const phi_count = Math.ceil(Math.sqrt(config.spiralCount));
      const theta_count = Math.ceil(config.spiralCount / phi_count);
      
      for (let i = 0; i < phi_count; i++) {
 (let j = 0; j < theta_count; j++) {
          if (directions.length >= config.spiralCount) break;
          
          const phi = Math.acos(1 - 2 * (i + 0.5) / phi_count);
          const theta = 2 * Math.PI * (j / theta_count);
          
          const x = Math.sin(phi) * Math.cos(theta);
          const y = Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(theta);
          
          directions.push([x, y, z]);
        }
      }

      directions.forEach((dir, spiralIdx) => {
        const [dx, dy, dz] = dir;
        
        const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const ndx = dx / mag;
        const ndy = dy / mag;
        const ndz = dz / mag;

        let perpX, perpY, perpZ;
        if (Math.abs(ndy) < 0.9) {
          perpX = 0;
          perpY = 1;
          perpZ = 0;
        } else {
          perpX = 1;
          perpY = 0;
          perpZ = 0;
        }
        
        const temp1X = ndy * perpZ - ndz * perpY;
        const temp1Y = ndz * perpX - ndx * perpZ;
        const temp1Z = ndx * perpY - ndy * perpX;
        const temp1Mag = Math.sqrt(temp1X * temp1X + temp1Y * temp1Y + temp1Z * temp1Z);
        const perp1X = temp1X / temp1Mag;
        const perp1Y = temp1Y / temp1Mag;
        const perp1Z = temp1Z / temp1Mag;
        
        const perp2X = ndy * perp1Z - ndz * perp1Y;
        const perp2Y = ndz * perp1X - ndx * perp1Z;
        const perp2Z = ndx * perp1Y - ndy * perp1X;

        const points = [];
        const colors = [];
        const particlePositions = [];
        const particleColors = [];
        const particleSizes = [];

        for (let i = 0; i <= config.particleDensity; i++) {
          const t = i / config.particleDensity;
          
          const distance = t * config.length;
          
          const angle = t * config.rotations * Math.PI * 2 * config.angularSpeed * config.helixTightness;
          
          const circleX = config.radius * Math.cos(angle);
          const circleY = config.radius * Math.sin(angle);
          
          const x = distance * ndx + circleX * perp1X + circleY * perp2X;
          const y = distance * ndy + circleX * perp1Y + circleY * perp2Y;
          const z = distance * ndz + circleX * perp1Z + circleY * perp2Z;

          points.push(new THREE.Vector3(x, y, z));

          const hue = 0.05 + t * 0.5;
          const sat = 1.0 - t * 0.2;
          const light = 0.6 - t * 0.2;
          const color = new THREE.Color().setHSL(hue, sat, light);
          colors.push(color.r, color.g, color.b);

          if (i % 2 === 0) {
            particlePositions.push(x, y, z);
            particleColors.push(color.r, color.g, color.b);
            particleSizes.push(0.25 + Math.random() * 0.35);
          }
        }

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, config.particleDensity, 0.12, 8, false);
        const tubeMaterial = new THREE.MeshPhongMaterial({
          color: 0x00aaff,
          transparent: true,
          opacity: 0.25,
          emissive: 0x0066ff,
          emissiveIntensity: 0.6,
          side: THREE.DoubleSide
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              float dist = length(position);
              float pulse = 1.0 + 0.4 * sin(time * 2.5 + dist * 0.3);
              gl_PointSize = size * pulse * (350.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              vec2 center = gl_PointCoord - vec2(0.5);
              float dist = length(center);
              if (dist > 0.5) discard;
              float alpha = 1.0 - smoothstep(0.25, 0.5, dist);
              gl_FragColor = vec4(vColor, alpha * 0.9);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);

        scene.add(line);
        scene.add(tube);
        scene.add(particles);

        spiralDataRef.current.push({
          line,
          tube,
          particles,
          points,
          direction: dir,
          colors,
          spiralIdx
        });
      });
    };

    createCylindricalSpiralField();

    let time = 0;
    const animate = () => {
      if (!isPlaying) return;
      
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      core.rotation.y += 0.02;
      core.rotation.x += 0.01;
      coreMaterial.emissiveIntensity = 2.5 + Math.sin(time * 4) * 1.5;

      glow.material.uniforms.time.value = time;
      glow.material.uniforms.intensity.value = config.fieldIntensity / 5;

      spiralDataRef.current.forEach((data) => {
        if (data.isRing) {
          data.ring.rotation.z += data.ring.userData.rotSpeed;
          return;
        }

        const pulsePhase = time * 2 + data.spiralIdx * 0.3;
        const scale = 1 + Math.sin(pulsePhase) * 0.08;
        data.line.scale.setScalar(scale);
        data.tube.scale.setScalar(scale);
        data.particles.scale.setScalar(scale);

        if (data.particles.material.uniforms) {
          data.particles.material.uniforms.time.value = time;
        }

        const positions = data.line.geometry.attributes.position.array;
        for (let i = 0; i < data.points.length; i++) {
          const t = i / data.points.length;
          const wave = Math.sin(time * 4 + t * Math.PI * 6) * 0.15;
          
          positions[i * 3] = data.points[i].x * (1 + wave);
          positions[i * 3 + 1] = data.points[i].y * (1 + wave);
          positions[i * 3 + 2] = data.points[i].z * (1 + wave);
        }
        data.line.geometry.attributes.position.needsUpdate = true;
      });

      const radius = 60;
      camera.position.x = Math.cos(time * 0.1) * radius;
      camera.position.z = Math.sin(time * 0.1) * radius;
      camera.position.y = 30 + Math.sin(time * 0.06) * 15;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    if (isPlaying) animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      spiralDataRef.current.forEach(data => {
        if (data.line) scene.remove(data.line);
        if (data.tube) scene.remove(data.tube);
        if (data.particles) scene.remove(data.particles);
        if (data.ring) scene.remove(data.ring);
      });
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, config]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-black via-slate-950 to-blue-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + 0.5 + 'px',
              height: Math.random() * 2 + 0.5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `pulse ${Math.random() * 4 + 2}s infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-6">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-cyan-400 mb-2">
          统一场论·圆柱螺旋发散
        </h1>
        <p className="text-cyan-300/90 text-lg mb-1">Unified Field - Cylindrical Spiral Divergence from Origin</p>
        <p className="text-blue-300/70 text-sm">从原点(0,0,0)向空间四面八方发散，每个方向保持恒定半径的圆柱螺旋运动</p>
      </div>

      <div ref={containerRef} className="flex-1 relative z-5" />

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 max-h-[45vh] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 border-2 border-orange-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-orange-300 font-bold text-xs block mb-2">🌐 发散方向数</label>
              <input
                type="range"
                min="8"
                max="64"
                step="4"
                value={config.spiralCount}
                onChange={(e) => updateConfig('spiralCount', e.target.value)}
                className="w-full h-2 bg-orange-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-orange-200/70">8</span>
                <span className="text-orange-100 font-bold text-sm">{config.spiralCount}</span>
                <span className="text-orange-200/70">64</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border-2 border-cyan-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-cyan-300 font-bold text-xs block mb-2">⭕ 圆柱半径</label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={config.radius}
                onChange={(e) => updateConfig('radius', e.target.value)}
                className="w-full h-2 bg-cyan-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-cyan-200/70">1</span>
                <span className="text-cyan-100 font-bold text-sm">{config.radius}</span>
                <span className="text-cyan-200/70">8</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-2 border-purple-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-purple-300 font-bold text-xs block mb-2">📏 发散长度</label>
              <input
                type="range"
                min="15"
                max="50"
                step="5"
                value={config.length}
                onChange={(e) => updateConfig('length', e.target.value)}
                className="w-full h-2 bg-purple-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-purple-200/70">15</span>
                <span className="text-purple-100 font-bold text-sm">{config.length}</span>
                <span className="text-purple-200/70">50</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/60 to-amber-900/60 border-2 border-yellow-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-yellow-300 font-bold text-xs block mb-2">🌀 旋转圈数</label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={config.rotations}
                onChange={(e) => updateConfig('rotations', e.target.value)}
                className="w-full h-2 bg-yellow-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-yellow-200/70">2</span>
                <span className="text-yellow-100 font-bold text-sm">{config.rotations}</span>
                <span className="text-yellow-200/70">20</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 border-2 border-green-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-green-300 font-bold text-xs block mb-2">⚡ 角速度 ω</label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.2"
                value={config.angularSpeed}
                onChange={(e) => updateConfig('angularSpeed', e.target.value)}
                className="w-full h-2 bg-green-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-green-200/70">0.2</span>
                <span className="text-green-100 font-bold text-sm">{config.angularSpeed.toFixed(1)}</span>
                <span className="text-green-200/70">3.0</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-900/60 to-cyan-900/60 border-2 border-teal-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-teal-300 font-bold text-xs block mb-2">🔧 螺旋紧密度</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={config.helixTightness}
                onChange={(e) => updateConfig('helixTightness', e.target.value)}
                className="w-full h-2 bg-teal-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-teal-200/70">0.5</span>
                <span className="text-teal-100 font-bold text-sm">{config.helixTightness.toFixed(1)}</span>
                <span className="text-teal-200/70">2.0</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border-2 border-blue-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-blue-300 font-bold text-xs block mb-2">✨ 粒子密度</label>
              <input
                type="range"
                min="50"
                max="250"
                step="25"
                value={config.particleDensity}
                onChange={(e) => updateConfig('particleDensity', e.target.value)}
                className="w-full h-2 bg-blue-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-blue-200/70">50</span>
                <span className="text-blue-100 font-bold text-sm">{config.particleDensity}</span>
                <span className="text-blue-200/70">250</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/60 to-rose-900/60 border-2 border-red-500/70 rounded-lg p-3 backdrop-blur-md">
              <label className="text-red-300 font-bold text-xs block mb-2">🔥 场强度</label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.fieldIntensity}
                onChange={(e) => updateConfig('fieldIntensity', e.target.value)}
                className="w-full h-2 bg-red-700/50 rounded-lg appearance-none cursor-pointer mb-1"
              />
              <div className="flex justify-between text-xs">
                <span className="text-red-200/70">1</span>
                <span className="text-red-100 font-bold text-sm">{config.fieldIntensity}</span>
                <span className="text-red-200/70">10</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/80 rounded-xl p-4 backdrop-blur-md border-2 border-cyan-500/50">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-10 py-3 bg-gradient-to-r from-orange-500 via-yellow-500 to-cyan-500 rounded-xl font-bold text-white text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-105 border-2 border-white/30"
            >
              {isPlaying ? '⏸ 暂停' : '▶ 播放'}
            </button>

            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-orange-300 font-bold text-lg">{config.spiralCount}</div>
                <div className="text-white/60 text-xs">螺旋方向</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-300 font-bold text-lg">r = {config.radius}</div>
                <div className="text-white/60 text-xs">恒定半径</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-300 font-bold text-lg">{config.rotations}圈</div>
                <div className="text-white/60 text-xs">螺旋旋转</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-cyan-300/90 text-sm font-mono mb-1">
                Three.js + WebGL Shaders
              </div>
              <div className="text-white/50 text-xs">
                从原点(0,0,0)球面发散 | 圆柱螺旋轨迹
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CylindricalSpiralField;