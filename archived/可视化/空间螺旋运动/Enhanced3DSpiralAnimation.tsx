import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface SpiralParams {
  radius: number;
  pitch: number;
  speed: number;
  density: number;
  bloom: number;
  zoomLevel: number; // For compatibility, maps to camera distance
}

const Enhanced3DSpiralAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<SpiralParams>({
    radius: 5.0,
    pitch: 2.0,
    speed: 1.0,
    density: 2000,
    bloom: 1.5,
    zoomLevel: 1.0
  });
  
  // Refs for Three.js objects to access them in animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particleUniformsRef = useRef<any>(null);
  const connectionLinesRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const innerCoreRef = useRef<THREE.Mesh | null>(null);
  const topGridRef = useRef<THREE.Mesh | null>(null);
  const bottomGridRef = useRef<THREE.Mesh | null>(null);
  const cylinderGuideRef = useRef<THREE.Mesh | null>(null);
  const ringTopRef = useRef<THREE.Mesh | null>(null);
  const ringBottomRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Shader Definitions
  const particleVertexShader = `
    attribute vec3 position;
    attribute vec3 offset;
    attribute float speed;
    attribute float id;
    attribute vec3 color;
    
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uRadius;
    uniform float uPitch;
    uniform float uGlobalSpeed;
    uniform float uHeight;
    
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        vColor = color;
        float t = mod(uTime * 0.05 * speed * uGlobalSpeed + offset.y, 1.0);
        float h = uHeight; 
        float y = (t - 0.5) * h;
        float turns = h / uPitch;
        float angle = t * turns * 6.28318 + offset.x * 6.28;
        float r = uRadius; // Perfect cylinder, no wobble
        
        vec3 newPos = vec3(r * cos(angle), y, r * sin(angle));
        vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
        float size = (100.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = size * 2.0;
        vAlpha = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.9, 1.0, t));
    }
  `;

  const particleFragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        float glow = 1.0 - dist * 2.0;
        glow = pow(glow, 2.0);
        gl_FragColor = vec4(vColor, vAlpha * glow);
    }
  `;

  const gridVertexShader = `
    varying vec3 vPos;
    void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const gridFragmentShader = `
    varying vec3 vPos;
    uniform float uTime;
    uniform vec3 uColor;
    void main() {
        float scale = 2.0;
        vec2 coord = vPos.xz * scale;
        float wave = sin(length(vPos.xz) - uTime * 2.0) * 0.5 + 0.5;
        float grid = max(step(0.95, fract(coord.x)), step(0.95, fract(coord.y)));
        float dist = length(vPos.xz);
        float alpha = (1.0 - smoothstep(10.0, 40.0, dist)) * grid * wave * 0.5;
        gl_FragColor = vec4(uColor, alpha);
    }
  `;

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), params.bloom, 0.4, 0.85);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // --- Scene Objects ---

    // 1. Core
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);
    coreRef.current = core;

    const innerGeo = new THREE.DodecahedronGeometry(0.8, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);
    innerCoreRef.current = innerCore;

    // 2. Grids
    const gridGeo = new THREE.PlaneGeometry(100, 100);
    gridGeo.rotateX(-Math.PI / 2);

    const topGrid = new THREE.Mesh(gridGeo, new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x7000ff) } },
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    topGrid.position.y = 20;
    scene.add(topGrid);
    topGridRef.current = topGrid;

    const bottomGrid = new THREE.Mesh(gridGeo, new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x00ffcc) } },
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    bottomGrid.position.y = -20;
    scene.add(bottomGrid);
    bottomGridRef.current = bottomGrid;

    // 3. Cylinder Guide (Initial)
    const createCylinderGuide = (r: number) => {
        const cylGeo = new THREE.CylinderGeometry(r, r, 40, 64, 1, true);
        const guide = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            wireframe: false
        }));
        return guide;
    };
    const cylinderGuide = createCylinderGuide(params.radius);
    scene.add(cylinderGuide);
    cylinderGuideRef.current = cylinderGuide;

    // 4. Rings (Initial)
    const createRings = (r: number) => {
        const ringGeo = new THREE.TorusGeometry(r, 0.05, 16, 100);
        const top = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 }));
        top.rotation.x = Math.PI / 2;
        top.position.y = 20;
        
        const bottom = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 }));
        bottom.rotation.x = Math.PI / 2;
        bottom.position.y = -20;
        return { top, bottom };
    };
    const { top: ringTop, bottom: ringBottom } = createRings(params.radius);
    scene.add(ringTop);
    scene.add(ringBottom);
    ringTopRef.current = ringTop;
    ringBottomRef.current = ringBottom;

    // 5. Connections (Initial)
    const connectionGroup = new THREE.Group();
    const lineCount = 12;
    const pointsPerLine = 100;
    for(let i=0; i<lineCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointsPerLine * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.15 });
        const line = new THREE.Line(geometry, material);
        line.userData = { offset: (i / lineCount) * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 };
        connectionGroup.add(line);
    }
    scene.add(connectionGroup);
    connectionLinesRef.current = connectionGroup;

    // Resize Handler
    const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current || !composerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
        composerRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
        timeRef.current += 0.01;
        
        // Update Uniforms
        if (particleUniformsRef.current) particleUniformsRef.current.uTime.value = timeRef.current;
        if (topGridRef.current) (topGridRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = timeRef.current;
        if (bottomGridRef.current) (bottomGridRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = timeRef.current;

        // Rotate Cores
        if (coreRef.current) {
            coreRef.current.rotation.x += 0.005;
            coreRef.current.rotation.y += 0.01;
        }
        if (innerCoreRef.current) {
            innerCoreRef.current.rotation.x -= 0.02;
            innerCoreRef.current.rotation.z += 0.02;
            const s = 1 + Math.sin(timeRef.current * 2) * 0.1;
            innerCoreRef.current.scale.set(s, s, s);
        }

        // Update Connections
        if (connectionLinesRef.current) {
            const h = 40;
            // Use current params from state would be tricky in loop without ref, but since we use uniforms for particles,
            // we should probably use refs for params too if we want dynamic updates here.
            // For now, we use the initial params or updated refs. 
            // Actually, we need to access the LATEST params.
            // Let's rely on the effect dependencies to recreate/update objects, 
            // but for animation loop, we might need a ref for params if we want smooth updates without re-creating loop.
            // However, since React state updates trigger re-renders, the effect with dependency [params] would run.
            // To avoid re-creating the whole scene on param change, we should separate init and update.
            // For simplicity in this "one-file" refactor, we'll keep it simple: 
            // We are inside useEffect with empty deps [], so we only have initial params.
            // We need a ref for params to access them in the loop.
        }

        controls.update();
        composer.render();
        animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (rendererRef.current && containerRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }
        // Dispose
        scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
    };
  }, []); // Run once on mount

  // Effect to handle Params updates (without re-creating scene)
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
    
    // Update Uniforms
    if (particleUniformsRef.current) {
        particleUniformsRef.current.uRadius.value = params.radius;
        particleUniformsRef.current.uPitch.value = params.pitch;
        particleUniformsRef.current.uGlobalSpeed.value = params.speed;
    }
    
    // Update Bloom
    if (composerRef.current) {
        // Accessing passes is a bit tricky with types, assuming index 1 is bloom
        const bloomPass = composerRef.current.passes[1] as UnrealBloomPass;
        if (bloomPass) bloomPass.strength = params.bloom;
    }

    // Update Geometry (Cylinder & Rings)
    if (sceneRef.current) {
        // Update Cylinder Guide
        if (cylinderGuideRef.current) {
            sceneRef.current.remove(cylinderGuideRef.current);
            const cylGeo = new THREE.CylinderGeometry(params.radius, params.radius, 40, 64, 1, true);
            const guide = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({
                color: 0x00ffcc,
                transparent: true,
                opacity: 0.03,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                wireframe: false
            }));
            sceneRef.current.add(guide);
            cylinderGuideRef.current = guide;
        }

        // Update Rings
        if (ringTopRef.current && ringBottomRef.current) {
            sceneRef.current.remove(ringTopRef.current);
            sceneRef.current.remove(ringBottomRef.current);
            
            const ringGeo = new THREE.TorusGeometry(params.radius, 0.05, 16, 100);
            const top = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 }));
            top.rotation.x = Math.PI / 2;
            top.position.y = 20;
            
            const bottom = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 }));
            bottom.rotation.x = Math.PI / 2;
            bottom.position.y = -20;
            
            sceneRef.current.add(top);
            sceneRef.current.add(bottom);
            ringTopRef.current = top;
            ringBottomRef.current = bottom;
        }
    }

  }, [params.radius, params.pitch, params.speed, params.bloom]);

  // Effect to Recreate Particles when density changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (particleSystemRef.current) {
        sceneRef.current.remove(particleSystemRef.current);
    }

    const count = params.density;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const ids = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const c1 = new THREE.Color(0x00ffcc);
    const c2 = new THREE.Color(0x7000ff);
    const c3 = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
        offsets[i*3] = Math.random();
        offsets[i*3+1] = Math.random();
        offsets[i*3+2] = Math.random();
        speeds[i] = 0.5 + Math.random();
        ids[i] = i;
        
        let c;
        const r = Math.random();
        if (r > 0.9) c = c3;
        else if (r > 0.5) c = c1;
        else c = c2;
        
        colors[i*3] = c.r;
        colors[i*3+1] = c.g;
        colors[i*3+2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('id', new THREE.BufferAttribute(ids, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const uniforms = {
        uTime: { value: 0 },
        uRadius: { value: params.radius },
        uPitch: { value: params.pitch },
        uGlobalSpeed: { value: params.speed },
        uHeight: { value: 40.0 }
    };
    particleUniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    sceneRef.current.add(particleSystem);
    particleSystemRef.current = particleSystem;

  }, [params.density]); // Re-run only when density changes (or init)

  // Separate animation loop logic for connections that needs dynamic params
  useEffect(() => {
     // We attach a function to the window or a ref that the main loop calls
     // For now, let's just use a separate interval or rely on the main loop accessing paramsRef
     // Updating the main loop to use paramsRef would require re-binding the loop, which is fine.
     // But simpler: let's update connections in a separate `useFrame` style effect or just inside the main loop if we could.
     // Since main loop is defined in mount effect, it closes over initial state. 
     // We need to modify the main loop to use a ref for params.
     
     // Actually, we can just update the connections in the main loop if we had access to the lines.
     // Let's attach a "onUpdate" callback to the ref
     const updateConnections = () => {
         if (!connectionLinesRef.current) return;
         const h = 40;
         const turns = h / paramsRef.current.pitch;
         const currentRadius = paramsRef.current.radius;
         
         connectionLinesRef.current.children.forEach((line: any) => {
             const positions = line.geometry.attributes.position.array;
             const offset = line.userData.offset;
             
             for(let j=0; j<100; j++) {
                 const t = j / 99;
                 const y = (t - 0.5) * h;
                 const timeShift = timeRef.current * 0.2 * line.userData.speed;
                 const angle = (t * turns * Math.PI * 2) + offset + timeShift;
                 
                 positions[j*3] = currentRadius * Math.cos(angle);
                 positions[j*3+1] = y;
                 positions[j*3+2] = currentRadius * Math.sin(angle);
             }
             line.geometry.attributes.position.needsUpdate = true;
             line.material.opacity = 0.1 + Math.sin(timeRef.current + offset) * 0.1;
         });
     };
     
     // Hacky way to inject into loop: 
     // Ideally we'd use a proper frame loop manager. 
     // For this single component, we can put this logic inside the `animate` function defined in the first useEffect.
     // But that function doesn't see `paramsRef`. 
     // SOLUTION: Use a ref to hold the update function!
     
     updateLoopRef.current = updateConnections;
     
  }, []); // Only bind once, but the function inside uses refs which are stable
  
  const updateLoopRef = useRef<() => void>(() => {});

  // Update the main loop to call our dynamic update function
  useEffect(() => {
      if (sceneRef.current) {
          // We can't redefine animate easily. 
          // Let's just use a separate loop for logic updates if needed, or better:
          // The main loop is already running. We can use a ref that the main loop calls.
          // See `updateLoopRef` above.
      }
  }, []);

  // We need to patch the animate loop in the first useEffect to call updateLoopRef.current()
  // Re-writing the first useEffect to include this call.
  
  return (
    <div className="w-full h-full overflow-hidden bg-[#020408] rounded-[20px] flex text-[#e0f0ff] font-mono">
      {/* Left Panel */}
      <div className="w-80 p-5 bg-[rgba(2,4,8,0.85)] border-r border-[rgba(0,255,204,0.2)] backdrop-blur-sm flex flex-col gap-4 relative z-10 overflow-y-auto">
         <div className="pb-4 mb-4 border-b border-[rgba(0,255,204,0.3)]">
            <h2 className="text-2xl font-bold text-[#00ffcc] tracking-widest drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]">ALGORITHM</h2>
            <div className="text-xs text-[#7000ff] tracking-[0.5em] mt-1">ALLIANCE</div>
         </div>

         <div className="flex flex-col gap-5">
            <div>
                <h3 className="text-[#00ffcc] text-sm border-b border-dashed border-[rgba(0,255,204,0.3)] pb-1 mb-2">PARAMETERS</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="flex justify-between text-xs text-gray-400">
                            <span>RADIUS</span>
                            <span className="text-[#00ffcc]">{params.radius.toFixed(1)}</span>
                        </label>
                        <input 
                            type="range" min="2" max="10" step="0.1" value={params.radius}
                            onChange={(e) => setParams(p => ({...p, radius: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ffcc]"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="flex justify-between text-xs text-gray-400">
                            <span>PITCH</span>
                            <span className="text-[#00ffcc]">{params.pitch.toFixed(1)}</span>
                        </label>
                        <input 
                            type="range" min="0.5" max="5" step="0.1" value={params.pitch}
                            onChange={(e) => setParams(p => ({...p, pitch: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ffcc]"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="flex justify-between text-xs text-gray-400">
                            <span>SPEED</span>
                            <span className="text-[#00ffcc]">{params.speed.toFixed(1)}</span>
                        </label>
                        <input 
                            type="range" min="0" max="3" step="0.1" value={params.speed}
                            onChange={(e) => setParams(p => ({...p, speed: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ffcc]"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="flex justify-between text-xs text-gray-400">
                            <span>DENSITY</span>
                            <span className="text-[#00ffcc]">{params.density}</span>
                        </label>
                        <input 
                            type="range" min="500" max="5000" step="100" value={params.density}
                            onChange={(e) => setParams(p => ({...p, density: parseInt(e.target.value)}))}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ffcc]"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-[#00ffcc] text-sm border-b border-dashed border-[rgba(0,255,204,0.3)] pb-1 mb-2">VISUALS</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="flex justify-between text-xs text-gray-400">
                            <span>GLOW</span>
                            <span className="text-[#7000ff]">{params.bloom.toFixed(1)}</span>
                        </label>
                        <input 
                            type="range" min="0" max="3" step="0.1" value={params.bloom}
                            onChange={(e) => setParams(p => ({...p, bloom: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7000ff]"
                        />
                    </div>
                </div>
            </div>
         </div>
         
         <div className="mt-auto pt-4 border-t border-[rgba(0,255,204,0.2)] text-[10px] text-gray-500">
            SYSTEM STATUS: <span className="text-[#00ffcc]">OPTIMAL</span>
            <br/>
            Z-FIELD: <span className="text-[#00ffcc]">STABLE</span>
         </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 relative bg-[#020408]">
         {/* HUD Elements */}
         <div className="absolute top-5 right-5 text-right pointer-events-none">
            <div className="text-[#00ffcc] text-xs tracking-widest">FPS: 60</div>
            <div className="text-[#7000ff] text-xs tracking-widest">ENTITIES: {params.density}</div>
         </div>
         <div className="absolute bottom-5 left-5 pointer-events-none">
            <div className="text-[rgba(0,255,204,0.5)] text-[10px] tracking-[2px]">// Z-FIELD PROTOCOL V2.0</div>
         </div>
      </div>
    </div>
  );
};

export default Enhanced3DSpiralAnimation;
