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
    scene.background = new THREE.Color(0x050510);
    
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ddff, 2, 100);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-15, 15, -15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 1.5, 100);
    pointLight3.position.set(0, 20, 0);
    scene.add(pointLight3);

    // Central object
    const centralGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const centralMaterial = new THREE.MeshPhongMaterial({
      color: 0xffdd00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      shininess: 100
    });
    const centralSphere = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralSphere);

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.2
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowSphere);

    // Generate 3D isotropic directions using fibonacci sphere algorithm
    const generateIsotropicDirections = (count) => {
      const directions = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
      
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        
        directions.push(new THREE.Vector3(x, y, z).normalize());
      }
      
      return directions;
    };

    // Create spiral systems in all 3D directions
    const directionCount = 20;
    const directions = generateIsotropicDirections(directionCount);
    const cylinders = [];
    const spiralSystems = [];

    directions.forEach((direction, index) => {
      const color = new THREE.Color().setHSL(index / directionCount, 0.9, 0.6);
      
      // Create cylinder wireframe
      const cylinderRadius = 1.2;
      const cylinderHeight = 18;
      const cylinderGeometry = new THREE.CylinderGeometry(
        cylinderRadius, 
        cylinderRadius, 
        cylinderHeight, 
        16, 
        1, 
        true
      );
      const cylinderMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        wireframe: true
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      
      // Align cylinder with direction vector
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, direction);
      cylinder.quaternion.copy(quaternion);
      
      // Position cylinder
      const offset = direction.clone().multiplyScalar(cylinderHeight / 2 + 1.5);
      cylinder.position.copy(offset);
      
      cylinders.push(cylinder);
      scene.add(cylinder);

      // Create spiral particles for this direction
      const spiralParticles = [];
      const particleCount = 50;
      
      for (let j = 0; j < particleCount; j++) {
        const geometry = new THREE.SphereGeometry(0.18, 12, 12);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.95
        });
        const particle = new THREE.Mesh(geometry, material);
        
        spiralParticles.push({
          mesh: particle,
          phase: j * 0.12,
          index: j
        });
        scene.add(particle);
      }
      
      spiralSystems.push({
        particles: spiralParticles,
        direction: direction,
        color: color
      });
    });

    // Axes helper
    const axesHelper = new THREE.AxesHelper(12);
    scene.add(axesHelper);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x111111);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Reference sphere to show isotropic distribution
    const referenceGeometry = new THREE.SphereGeometry(22, 32, 32);
    const referenceMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.03,
      wireframe: true
    });
    const referenceSphere = new THREE.Mesh(referenceGeometry, referenceMaterial);
    scene.add(referenceSphere);

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      if (isAnimating) {
        time += 0.012 * speed;

        // Animate central sphere
        centralSphere.rotation.y += 0.015;
        centralSphere.rotation.x += 0.008;
        
        const pulse = 1 + Math.sin(time * 3.5) * 0.12;
        glowSphere.scale.set(pulse, pulse, pulse);
        glowSphere.rotation.y -= 0.01;

        // Update cylinder visibility
        cylinders.forEach((cylinder, i) => {
          if (showCylinders) {
            cylinder.material.opacity = 0.08 + Math.sin(time * 2.5 + i * 0.3) * 0.04;
          } else {
            cylinder.material.opacity = 0;
          }
        });

        // Update spiral particles with cylindrical helical motion
        spiralSystems.forEach((system) => {
          system.particles.forEach((particle) => {
            const t = (time + particle.phase) % 7;
            
            // Cylindrical helix parameters
            const r = 1.2; // Fixed cylinder radius
            const omega = 4; // Angular velocity
            const h = 2.2; // Axial velocity
            
            // Helix in local cylindrical coordinates
            const axialDist = h * t;
            const theta = omega * t;
            const localX = r * Math.cos(theta);
            const localY = r * Math.sin(theta);
            const localZ = axialDist;
            
            // Build local coordinate system aligned with direction
            const dir = system.direction.clone();
            const perpA = new THREE.Vector3();
            const perpB = new THREE.Vector3();
            
            if (Math.abs(dir.y) < 0.9) {
              perpA.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
            } else {
              perpA.crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
            }
            perpB.crossVectors(dir, perpA).normalize();
            
            // Transform to global coordinates
            const basePos = dir.clone().multiplyScalar(1.5);
            const axialComponent = dir.clone().multiplyScalar(localZ);
            const radialComponent = perpA.clone().multiplyScalar(localX)
              .add(perpB.clone().multiplyScalar(localY));
            
            const finalPos = basePos.clone().add(axialComponent).add(radialComponent);
            particle.mesh.position.copy(finalPos);
            
            // Fade based on distance
            const dist = finalPos.length();
            particle.mesh.material.opacity = Math.max(0.15, 1 - dist / 25);
            
            const scale = 1 + (dist / 40);
            particle.mesh.scale.set(scale, scale, scale);
          });
        });

        // Rotate reference sphere
        referenceSphere.rotation.y += 0.001;
        referenceSphere.rotation.x += 0.0005;
      }

      // Camera orbit
      const camRadius = 30;
      camera.position.x = camRadius * Math.cos(time * 0.08);
      camera.position.z = camRadius * Math.sin(time * 0.08);
      camera.position.y = 20 + Math.sin(time * 0.05) * 8;
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
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 p-5 text-white">
        <h1 className="text-3xl font-bold mb-3">3D Isotropic Cylindrical Spiral Divergence</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <span className="font-semibold">Spacetime Unity:</span> r(t) = Ct = xi + yj + zk
          </div>
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <span className="font-semibold">3D Helix:</span> r(t) = r*cos(wt)i + r*sin(wt)j + ht*k
          </div>
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <span className="font-semibold">Mass Definition:</span> m = k * dn/dOmega
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative" ref={mountRef}>
        <div className="absolute top-4 right-4 bg-black bg-opacity-85 text-white p-5 rounded-xl space-y-4 z-10 w-72 shadow-2xl">
          <h3 className="font-bold text-xl border-b border-blue-500 pb-2">Control Panel</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">
              Motion Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg">
            <input
              type="checkbox"
              id="cylinders"
              checked={showCylinders}
              onChange={(e) => setShowCylinders(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <label htmlFor="cylinders" className="text-sm cursor-pointer">
              Show Cylinder Frames
            </label>
          </div>
          
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-3 rounded-lg transition-all font-bold text-lg shadow-lg"
          >
            {isAnimating ? 'PAUSE' : 'PLAY'}
          </button>
          
          <div className="text-xs space-y-2 border-t border-gray-700 pt-3 bg-gray-800 p-3 rounded-lg">
            <p className="font-bold text-sm text-blue-300 mb-2">Visualization Features:</p>
            <p>• Central emitting object</p>
            <p>• 20 isotropic directions in 3D space</p>
            <p>• Cylindrical spiral motion</p>
            <p>• Fixed radius, axial divergence</p>
            <p>• Fibonacci sphere distribution</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-black bg-opacity-85 text-white p-4 rounded-xl text-xs z-10 shadow-2xl">
          <p className="font-bold mb-2 text-sm text-yellow-300">Cylindrical Helix Characteristics:</p>
          <p className="mb-1">• Uniform 3D space distribution</p>
          <p className="mb-1">• Independent cylindrical channels</p>
          <p className="mb-1">• Particles spiral along cylinder axis</p>
          <p>• Constant radius, linear divergence</p>
        </div>
      </div>
    </div>
  );
};

export default SpiralDivergenceVisualization;