import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const VacuumImpedanceViz = () => {
  const mountRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(true);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Constants (normalized for visualization)
    const c = 1; // speed of light (normalized)
    const alpha = 1/137; // fine structure constant
    const hbar = 1; // reduced Planck constant (normalized)
    const e = 1; // elementary charge (normalized)
    
    // Central sphere representing Z'
    const centralGeometry = new THREE.SphereGeometry(1, 32, 32);
    const centralMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x004444,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const centralSphere = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralSphere);

    // Create orbiting particles for fundamental constants
    const createOrbitingSystem = (radius, count, color, speed) => {
      const group = new THREE.Group();
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.5
        });
        const particle = new THREE.Mesh(geometry, material);
        
        const angle = (i / count) * Math.PI * 2;
        particle.userData = { angle, radius, speed };
        group.add(particle);
      }
      return group;
    };

    // Different orbital systems for different constants
    const cOrbit = createOrbitingSystem(3, 8, 0xff6b6b, 0.01); // c (red)
    const alphaOrbit = createOrbitingSystem(4, 5, 0x4ecdc4, 0.008); // α (cyan)
    const hbarOrbit = createOrbitingSystem(5, 6, 0xffe66d, 0.006); // ℏ (yellow)
    const eOrbit = createOrbitingSystem(3.5, 7, 0x95e1d3, 0.009); // e (green)
    
    scene.add(cOrbit, alphaOrbit, hbarOrbit, eOrbit);

    // Create connecting lines
    const createConnections = () => {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
      });
      
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * 3,
          Math.sin(angle) * 3,
          0
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, lineMaterial);
    };

    const connections = [
      createConnections(),
    ];
    connections.forEach(conn => scene.add(conn));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate central sphere
      centralSphere.rotation.y += 0.005;

      // Update orbiting particles
      const updateOrbit = (orbit) => {
        orbit.children.forEach(particle => {
          particle.userData.angle += particle.userData.speed;
          particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
          particle.position.y = Math.sin(particle.userData.angle) * particle.userData.radius;
          particle.position.z = Math.sin(particle.userData.angle * 2) * 0.5;
        });
      };

      updateOrbit(cOrbit);
      updateOrbit(alphaOrbit);
      updateOrbit(hbarOrbit);
      updateOrbit(eOrbit);

      // Apply user rotation
      scene.rotation.x = rotation.x;
      scene.rotation.y = rotation.y;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [rotation]);

  return (
    <div className="w-full h-screen bg-black relative">
      <div ref={mountRef} className="w-full h-full" />
      
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-4 right-4 bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        {showInfo ? 'Hide' : 'Show'} Info
      </button>

      {showInfo && (
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 p-6 rounded-lg text-white max-w-md backdrop-blur-sm border border-cyan-500">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Vacuum Impedance Z'</h2>
          
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-cyan-500 pl-3">
              <p className="font-mono text-cyan-300">Z' = c/(8πε₀)</p>
              <p className="font-mono text-cyan-300">Z' = αℏc²/(2e²)</p>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span className="text-red-300">c - Speed of light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
                <span className="text-cyan-300">α - Fine structure constant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span className="text-yellow-300">ℏ - Reduced Planck constant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-300"></div>
                <span className="text-green-300">e - Elementary charge</span>
              </div>
            </div>

            <p className="text-gray-300 mt-4 text-xs">
              Z' ≈ 29.98 Ω (approximately 30 ohms)
            </p>
            
            <p className="text-gray-400 mt-3 text-xs italic">
              Drag to rotate • Central sphere represents the impedance constant
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacuumImpedanceViz;