import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

// -----------------------------------------------------------------------------
// 🌟 Custom Shaders (GLSL)
// -----------------------------------------------------------------------------

/**
 * 核心等离子体着色器 - 模拟高能耦合核心的动态表面
 * 优化：增加多层噪声，模拟更真实的太阳/恒星表面
 */
const PLASMA_VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // 复杂的顶点脉动效果
  float pulse1 = sin(uTime * 1.5 + position.x * 3.0) * 0.03;
  float pulse2 = cos(uTime * 2.0 + position.y * 4.0) * 0.03;
  vec3 newPosition = position + normal * (pulse1 + pulse2);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const PLASMA_FRAGMENT_SHADER = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;

// 简单的伪随机噪声函数
float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  // 基础颜色：金色/橙色核心，更丰富的层次
  vec3 colorDeep = vec3(0.8, 0.4, 0.0);   // 深层能量
  vec3 colorMid = vec3(1.0, 0.6, 0.1);    // 中层
  vec3 colorBright = vec3(1.0, 0.9, 0.5); // 高亮
  
  // 菲涅尔效应 (Fresnel Effect)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
  
  // 多层动态噪声模拟
  float noise1 = sin(vPosition.x * 8.0 + uTime) * cos(vPosition.y * 8.0 + uTime);
  float noise2 = sin(vPosition.z * 15.0 - uTime * 2.0) * 0.5;
  float noiseCombined = noise1 + noise2;
  
  // 颜色混合
  vec3 finalColor = mix(colorDeep, colorMid, noiseCombined * 0.5 + 0.5);
  finalColor = mix(finalColor, colorBright, fresnel);
  
  // 添加微小的表面颗粒感
  float grain = random(vec3(12.9898, 78.233, 151.7182), uTime * 0.01) * 0.1;
  finalColor += grain;
  
  gl_FragColor = vec4(finalColor, 0.95);
}
`;

// -----------------------------------------------------------------------------
// ⚙️ Constants
// -----------------------------------------------------------------------------

const LORENZ_PARAMS = {
  SIGMA: 10,
  RHO: 28,
  BETA: 8 / 3,
  DT: 0.01
};

const VISUAL_PARAMS = {
  PARTICLE_COUNT: 2000,
  CORE_RADIUS: 1.2,
  RING_RADIUS_BASE: 3.5,
  RING_RADIUS_STEP: 1.2,
  RING_TUBE_RADIUS: 0.02,
  LORENZ_SCALE: 0.15,
  LORENZ_Z_OFFSET: -25
};

export default class ElectricMagneticCouplingStrategy implements VisualizationStrategy {
  private particleSystem: THREE.Points | null = null;
  private rings: THREE.Mesh[] = [];
  private centralSphere: THREE.Mesh | null = null;
  private glowSprite: THREE.Sprite | null = null;
  
  // 粒子状态存储
  private particlePositions: Float32Array | null = null;
  private particleStates: Float32Array | null = null; // 存储每个粒子的(x,y,z)真实坐标，用于计算

  /**
   * 生成粒子辉光纹理
   */
  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      // 径向渐变，中心亮，边缘透明
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * 生成核心光晕纹理
   */
  private createGlowTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }

  createVisualization(scene: THREE.Object3D, params?: any): void {
    this.cleanup(); // 确保清理旧资源

    // 1. 创建核心等离子体球体 (Singularity Core)
    const geometry = new THREE.SphereGeometry(VISUAL_PARAMS.CORE_RADIUS, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: PLASMA_VERTEX_SHADER,
      fragmentShader: PLASMA_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.centralSphere = new THREE.Mesh(geometry, material);
    scene.add(this.centralSphere);

    // 2. 添加核心光晕 (Glow Sprite)
    const glowTexture = this.createGlowTexture();
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: glowTexture, 
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8
    });
    this.glowSprite = new THREE.Sprite(spriteMaterial);
    this.glowSprite.scale.set(6, 6, 1);
    scene.add(this.glowSprite);

    // 3. 创建量子能级环 (Quantum Rings)
    const ringColors = [0x00ffff, 0xff00ff, 0x00ff00]; // 青(电), 洋红(磁), 绿(耦合)
    const numRings = 3;
    
    for (let i = 0; i < numRings; i++) {
      const radius = VISUAL_PARAMS.RING_RADIUS_BASE + i * VISUAL_PARAMS.RING_RADIUS_STEP;
      // 使用 TorusGeometry 模拟能量环
      const ringGeometry = new THREE.TorusGeometry(radius, VISUAL_PARAMS.RING_TUBE_RADIUS, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // 随机初始旋转
      ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      // 添加到场景
      scene.add(ring);
      this.rings.push(ring);
    }

    // 4. 创建洛伦兹吸引子粒子系统 (Lorenz Attractor Particles)
    const particleCount = VISUAL_PARAMS.PARTICLE_COUNT;
    const particlesGeometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);
    this.particleStates = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x00ffff); // 电场色
    const color2 = new THREE.Color(0xff00ff); // 磁场色
    const particleTexture = this.createParticleTexture();

    for (let i = 0; i < particleCount; i++) {
      // 随机初始化位置
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20 + 20;
      
      this.particleStates[i * 3] = x;
      this.particleStates[i * 3 + 1] = y;
      this.particleStates[i * 3 + 2] = z;
      
      this.particlePositions[i * 3] = x * VISUAL_PARAMS.LORENZ_SCALE;
      this.particlePositions[i * 3 + 1] = y * VISUAL_PARAMS.LORENZ_SCALE;
      this.particlePositions[i * 3 + 2] = z * VISUAL_PARAMS.LORENZ_SCALE;
      
      // 混合颜色
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3, // 稍微调大一点，因为现在是纹理
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false, // 优化：粒子不遮挡
      sizeAttenuation: true
    });
    
    this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(this.particleSystem);

    // 5. 挂载更新函数
    scene.userData.update = (dt: number) => this.updateVisualization(dt, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    const t = Date.now() * 0.001 * animationSpeed;

    // 1. 更新核心 Shader Uniforms
    if (this.centralSphere && this.centralSphere.material instanceof THREE.ShaderMaterial) {
      this.centralSphere.material.uniforms.uTime.value = t;
      this.centralSphere.rotation.y += 0.2 * deltaTime;
    }

    // 2. 更新环的旋转
    this.rings.forEach((ring, index) => {
      // 多轴旋转
      ring.rotation.x += 0.3 * deltaTime * (index % 2 === 0 ? 1 : -1);
      ring.rotation.y += 0.2 * deltaTime;
      ring.rotation.z += 0.1 * deltaTime;
      
      // 脉动缩放
      const scale = 1 + Math.sin(t * 2 + index) * 0.05;
      ring.scale.setScalar(scale);
    });

    // 3. 更新洛伦兹粒子
    if (this.particleSystem && this.particlePositions && this.particleStates) {
      const positions = this.particlePositions;
      const states = this.particleStates;
      const { SIGMA, RHO, BETA, DT } = LORENZ_PARAMS;
      const speedFactor = 2.0 * animationSpeed;
      
      for (let i = 0; i < positions.length / 3; i++) {
        let x = states[i * 3];
        let y = states[i * 3 + 1];
        let z = states[i * 3 + 2];
        
        // 洛伦兹方程
        const dx = SIGMA * (y - x);
        const dy = x * (RHO - z) - y;
        const dz = x * y - BETA * z;
        
        // 欧拉积分更新
        x += dx * DT * speedFactor;
        y += dy * DT * speedFactor;
        z += dz * DT * speedFactor;
        
        // 更新状态
        states[i * 3] = x;
        states[i * 3 + 1] = y;
        states[i * 3 + 2] = z;
        
        // 更新显示位置
        positions[i * 3] = x * VISUAL_PARAMS.LORENZ_SCALE;
        positions[i * 3 + 1] = y * VISUAL_PARAMS.LORENZ_SCALE;
        positions[i * 3 + 2] = (z + VISUAL_PARAMS.LORENZ_Z_OFFSET) * VISUAL_PARAMS.LORENZ_SCALE;
        
        // 重置机制
        if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100 || isNaN(x)) {
          states[i * 3] = (Math.random() - 0.5) * 2;
          states[i * 3 + 1] = (Math.random() - 0.5) * 2;
          states[i * 3 + 2] = 20 + (Math.random() - 0.5) * 2;
        }
      }
      
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.rotation.z += 0.1 * deltaTime;
    }
  }

  cleanup(): void {
    // 资源清理
    const disposeMaterial = (mat: THREE.Material | THREE.Material[]) => {
      if (Array.isArray(mat)) {
        mat.forEach(m => disposeMaterial(m));
      } else {
        if ((mat as any).map) (mat as any).map.dispose();
        mat.dispose();
      }
    };

    if (this.centralSphere) {
      if (this.centralSphere.geometry) this.centralSphere.geometry.dispose();
      if (this.centralSphere.material) disposeMaterial(this.centralSphere.material as THREE.Material);
      this.centralSphere = null;
    }
    
    this.rings.forEach(ring => {
      if (ring.geometry) ring.geometry.dispose();
      if (ring.material) disposeMaterial(ring.material as THREE.Material);
    });
    this.rings = [];
    
    if (this.particleSystem) {
      if (this.particleSystem.geometry) this.particleSystem.geometry.dispose();
      if (this.particleSystem.material) disposeMaterial(this.particleSystem.material as THREE.Material);
      this.particleSystem = null;
    }
    
    if (this.glowSprite) {
      if (this.glowSprite.material) disposeMaterial(this.glowSprite.material);
      this.glowSprite = null;
    }
    
    this.particlePositions = null;
    this.particleStates = null;
  }
}
