/**
 * 🌟 全息投影风格的性能监控界面
 * 使用Three.js和高级着色器创建沉浸式全息显示效果
 */

import * as THREE from 'three';
import { FieldTheoristPerformanceMonitor } from '../services/fieldTheoryService';

export interface HologramData {
  value: number;
  label: string;
  unit: string;
  type: 'cpu' | 'memory' | 'fps' | 'gpu' | 'network' | 'temperature';
  color: string;
  pulse?: boolean;
  warning?: boolean;
  critical?: boolean;
}

export interface HologramConfig {
  resolution: { width: number; height: number };
  hologramOpacity: number;
  particleDensity: number;
  waveSpeed: number;
  glowIntensity: number;
  scanLines: boolean;
  colorScheme: 'cyan' | 'purple' | 'green' | 'rainbow';
}

export class HolographicPerformanceUI {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private performanceMonitor: FieldTheoristPerformanceMonitor;
  
  // 全息投影对象
  private hologramPanels: Map<string, THREE.Mesh> = new Map();
  private dataParticles: THREE.Points[] = [];
  private hologramLines: THREE.LineSegments[] = [];
  private scanBeams: THREE.LineSegments[] = [];
  private warningBeams: THREE.LineSegments[] = [];
  
  // 全息投影效果
  private hologramMaterial: THREE.ShaderMaterial;
  private particleMaterial: THREE.PointsMaterial;
  private scanMaterial: THREE.LineBasicMaterial;
  private warningMaterial: THREE.LineBasicMaterial;
  
  // 数据流
  private dataStream: HologramData[] = [];
  private animationTime = 0;
  
  // 配置
  private config: HologramConfig = {
    resolution: { width: 1920, height: 1080 },
    hologramOpacity: 0.8,
    particleDensity: 1000,
    waveSpeed: 2.0,
    glowIntensity: 1.5,
    scanLines: true,
    colorScheme: 'cyan'
  };

  constructor(container: HTMLElement, performanceMonitor: FieldTheoristPerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
    
    // 初始化Three.js场景
    this.initThreeJS(container);
    
    // 创建全息材质
    this.createHologramMaterials();
    
    // 创建全息投影界面
    this.createHolographicPanels();
    
    // 启动数据流
    this.startDataStream();
    
    // 启动全息扫描
    this.startHologramScanning();
  }

  /**
   * 初始化Three.js场景
   */
  private initThreeJS(container: HTMLElement): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000510, 0.1);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000510, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // 添加点光源模拟全息投影
    const hologramLight = new THREE.PointLight(0x00ffff, 2, 10);
    hologramLight.position.set(0, 3, 2);
    this.scene.add(hologramLight);

    // 添加边框光
    const rimLight = new THREE.DirectionalLight(0x00ffff, 1);
    rimLight.position.set(-5, 5, 5);
    this.scene.add(rimLight);

    // 创建粒子系统背景
    this.createParticleBackground();

    // 添加用户交互
    this.setupUserInteraction(container);
  }

  /**
   * 创建全息材质
   */
  private createHologramMaterials(): void {
    // 全息投影着色器
    this.hologramMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(this.config.resolution.width, this.config.resolution.height) },
        hologramOpacity: { value: this.config.hologramOpacity },
        glowIntensity: { value: this.config.glowIntensity },
        scanLines: { value: this.config.scanLines },
        colorScheme: { value: 0 } // 0: cyan, 1: purple, 2: green, 3: rainbow
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float hologramOpacity;
        uniform float glowIntensity;
        uniform bool scanLines;
        uniform float colorScheme;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Hologram color schemes
        vec3 getHologramColor(float scheme) {
          if (scheme < 0.5) return vec3(0.0, 1.0, 1.0);        // Cyan
          if (scheme < 1.5) return vec3(0.8, 0.0, 1.0);        // Purple
          if (scheme < 2.5) return vec3(0.0, 1.0, 0.0);        // Green
          return vec3(sin(time), cos(time), sin(time * 1.5));  // Rainbow
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Hologram wave effect
          float wave = sin(uv.y * 10.0 + time * 2.0) * 0.1;
          wave += sin(uv.x * 15.0 - time * 1.5) * 0.05;
          
          // Scan lines effect
          float scanLine = 0.0;
          if (scanLines) {
            scanLine = sin(uv.y * 50.0 + time * 5.0) * 0.1;
          }
          
          // Fresnel effect for holographic edge glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, normalize(vNormal)), 2.0);
          
          // Glitch effect
          float glitch = 0.0;
          if (sin(time * 10.0) > 0.98) {
            glitch = (random(uv + time) > 0.5) ? 1.0 : 0.0;
          }
          
          // Final hologram color
          vec3 hologramColor = getHologramColor(colorScheme);
          float alpha = (0.3 + wave + fresnel * 0.5 + scanLine) * hologramOpacity;
          
          // Warning effect
          float warning = 0.0;
          if (glitch > 0.5) {
            warning = sin(time * 20.0) * 0.3 + 0.7;
            hologramColor = vec3(1.0, 0.0, 0.0); // Red for warnings
          }
          
          gl_FragColor = vec4(hologramColor * glowIntensity, alpha + warning * 0.2);
        }
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // 粒子材质
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    // 扫描线材质
    this.scanMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    // 警告材质
    this.warningMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
  }

  /**
   * 创建粒子背景
   */
  private createParticleBackground(): void {
    const particleCount = this.config.particleDensity;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 随机位置
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      // 随机颜色
      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(particles);
    this.dataParticles.push(particles);
  }

  /**
   * 创建全息投影面板
   */
  private createHolographicPanels(): void {
    const panelTypes: Array<HologramData['type']> = ['cpu', 'memory', 'fps', 'gpu', 'network', 'temperature'];
    
    panelTypes.forEach((type, index) => {
      const panel = this.createHologramPanel(type, index);
      this.hologramPanels.set(type, panel);
      this.scene.add(panel);
    });
  }

  /**
   * 创建单个全息投影面板
   */
  private createHologramPanel(type: HologramData['type'], index: number): THREE.Mesh {
    // 面板几何体
    const geometry = new THREE.PlaneGeometry(1.5, 0.8, 32, 32);
    
    // 创建面板
    const panel = new THREE.Mesh(geometry, this.hologramMaterial.clone());
    
    // 定位面板
    const angle = (index / 6) * Math.PI * 2;
    const radius = 3;
    panel.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    
    // 面板朝向中心
    panel.lookAt(new THREE.Vector3(0, 0, 0));
    
    // 添加边框光效
    this.addPanelBorder(panel, type);
    
    // 添加数据连接线
    this.addDataConnectionLines(panel, type);
    
    return panel;
  }

  /**
   * 添加面板边框
   */
  private addPanelBorder(panel: THREE.Mesh, type: HologramData['type']): void {
    // 创建边框线
    const borderGeometry = new THREE.EdgesGeometry(panel.geometry as THREE.PlaneGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: this.getTypeColor(type),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    panel.add(border);
  }

  /**
   * 添加数据连接线
   */
  private addDataConnectionLines(panel: THREE.Mesh, type: HologramData['type']): void {
    const connectionCount = 8;
    
    for (let i = 0; i < connectionCount; i++) {
      const startAngle = (i / connectionCount) * Math.PI * 2;
      const endAngle = startAngle + Math.PI / 4;
      
      const startRadius = 1.0;
      const endRadius = 2.5;
      
      const start = new THREE.Vector3(
        Math.cos(startAngle) * startRadius,
        (Math.random() - 0.5) * 0.2,
        Math.sin(startAngle) * startRadius
      );
      
      const end = new THREE.Vector3(
        Math.cos(endAngle) * endRadius,
        (Math.random() - 0.5) * 0.5,
        Math.sin(endAngle) * endRadius
      );
      
      const curve = new THREE.QuadraticBezierCurve3(start, start.clone().add(end).multiplyScalar(0.5), end);
      const points = curve.getPoints(32);
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: this.getTypeColor(type),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const line = new THREE.Line(geometry, material);
      panel.add(line);
    }
  }

  /**
   * 获取类型颜色
   */
  private getTypeColor(type: HologramData['type']): number {
    const colorMap = {
      cpu: 0x00ff00,        // 绿色
      memory: 0x0080ff,     // 蓝色
      fps: 0xffff00,        // 黄色
      gpu: 0xff8000,        // 橙色
      network: 0xff00ff,    // 紫色
      temperature: 0xff0040 // 红色
    };
    
    return colorMap[type] || 0x00ffff;
  }

  /**
   * 启动数据流
   */
  private startDataStream(): void {
    setInterval(() => {
      this.updateHologramData();
    }, 100); // 10FPS更新率
  }

  /**
   * 更新全息数据
   */
  private updateHologramData(): void {
    const performanceData = this.performanceMonitor.getCurrentPerformance();
    
    // 更新各个面板数据
    this.updatePanelData('cpu', performanceData);
    this.updatePanelData('memory', performanceData);
    this.updatePanelData('fps', performanceData);
    this.updatePanelData('gpu', performanceData);
    
    // 模拟其他数据
    this.updateNetworkData();
    this.updateTemperatureData();
  }

  /**
   * 更新面板数据
   */
  private updatePanelData(type: HologramData['type'], performanceData: any): void {
    const panel = this.hologramPanels.get(type);
    if (!panel) return;
    
    const data = this.generateHologramData(type, performanceData);
    
    // 添加数据流效果
    this.addDataStreamEffect(panel, data);
    
    // 添加警告效果
    if (data.warning || data.critical) {
      this.addWarningEffect(panel, data.critical ? 'critical' : 'warning');
    }
  }

  /**
   * 生成全息数据
   */
  private generateHologramData(type: HologramData['type'], performanceData: any): HologramData {
    const valueMap = {
      cpu: performanceData.cpuUsage || Math.random() * 100,
      memory: performanceData.memoryUsage || Math.random() * 100,
      fps: performanceData.frameRate || Math.random() * 60,
      gpu: performanceData.gpuUsage || Math.random() * 100,
      network: performanceData.networkUsage || Math.random() * 1000,
      temperature: performanceData.temperature || Math.random() * 100
    };
    
    const labelMap = {
      cpu: 'CPU Usage',
      memory: 'Memory',
      fps: 'Frame Rate',
      gpu: 'GPU Load',
      network: 'Network I/O',
      temperature: 'Temperature'
    };
    
    const unitMap = {
      cpu: '%',
      memory: 'MB',
      fps: 'FPS',
      gpu: '%',
      network: 'MB/s',
      temperature: '°C'
    };
    
    const value = valueMap[type];
    const warning = value > 80;
    const critical = value > 95;
    
    return {
      value,
      label: labelMap[type],
      unit: unitMap[type],
      type,
      color: `#${this.getTypeColor(type).toString(16).padStart(6, '0')}`,
      warning,
      critical,
      pulse: value > 70
    };
  }

  /**
   * 添加数据流效果
   */
  private addDataStreamEffect(panel: THREE.Mesh, data: HologramData): void {
    // 创建数据粒子流
    const particleCount = Math.floor(data.value / 10);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 8, 8),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(data.color),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        })
      );
      
      // 粒子从面板中心向外发射
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.2 + Math.random() * 0.5;
      particle.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 0.3,
        Math.sin(angle) * distance
      );
      
      panel.add(particle);
      
      // 动画粒子
      this.animateParticle(particle, angle, distance);
    }
  }

  /**
   * 动画粒子
   */
  private animateParticle(particle: THREE.Mesh, angle: number, distance: number): void {
    const startTime = performance.now();
    const duration = 2000;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const newDistance = distance + progress * 2;
        particle.position.set(
          Math.cos(angle) * newDistance,
          particle.position.y,
          Math.sin(angle) * newDistance
        );
        
        particle.material.opacity = 0.8 * (1 - progress);
        
        requestAnimationFrame(animate);
      } else {
        panel.remove(particle);
      }
    };
    
    animate();
  }

  /**
   * 添加警告效果
   */
  private addWarningEffect(panel: THREE.Mesh, severity: 'warning' | 'critical'): void {
    const isCritical = severity === 'critical';
    
    // 创建警告光束
    const warningGeometry = new THREE.RingGeometry(1.2, 1.3, 32);
    const warningMaterial = new THREE.MeshBasicMaterial({
      color: isCritical ? 0xff0000 : 0xffff00,
      transparent: true,
      opacity: isCritical ? 0.8 : 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    const warningRing = new THREE.Mesh(warningGeometry, warningMaterial);
    panel.add(warningRing);
    
    // 警告动画
    const animateWarning = () => {
      const scale = 1 + Math.sin(performance.now() * 0.01) * 0.1;
      warningRing.scale.set(scale, scale, scale);
      warningRing.material.opacity = (isCritical ? 0.8 : 0.4) * (0.5 + 0.5 * Math.sin(performance.now() * 0.005));
      
      if (warningRing.parent) {
        requestAnimationFrame(animateWarning);
      }
    };
    
    animateWarning();
  }

  /**
   * 启动全息扫描
   */
  private startHologramScanning(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 更新动画时间
      this.animationTime += 0.016; // 约60FPS
      
      // 更新着色器时间
      this.hologramMaterial.uniforms.time.value = this.animationTime;
      
      // 更新粒子系统
      this.updateParticleSystems();
      
      // 扫描线效果
      this.updateScanLines();
      
      // 全息投影浮动效果
      this.updateHologramFloat();
      
      // 渲染场景
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  /**
   * 更新粒子系统
   */
  private updateParticleSystems(): void {
    this.dataParticles.forEach((particles, index) => {
      // 粒子旋转
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;
      
      // 粒子脉冲效果
      const pulse = 1 + Math.sin(this.animationTime * 2 + index) * 0.1;
      particles.scale.setScalar(pulse);
    });
  }

  /**
   * 更新扫描线
   */
  private updateScanLines(): void {
    if (!this.config.scanLines) return;
    
    // 创建水平扫描线
    const scanY = (this.animationTime * 2) % 10 - 5;
    
    if (this.scanBeams.length === 0) {
      for (let i = 0; i < 6; i++) {
        const points = [
          new THREE.Vector3(-5, scanY, -5),
          new THREE.Vector3(5, scanY, -5)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const scanBeam = new THREE.LineSegments(geometry, this.scanMaterial.clone());
        this.scene.add(scanBeam);
        this.scanBeams.push(scanBeam);
      }
    }
    
    // 更新扫描线位置
    this.scanBeams.forEach((beam, index) => {
      const yOffset = index * 0.5;
      beam.position.y = scanY + yOffset;
      beam.material.opacity = 0.3 + Math.sin(this.animationTime * 3 + index) * 0.2;
    });
  }

  /**
   * 更新全息投影浮动效果
   */
  private updateHologramFloat(): void {
    this.hologramPanels.forEach((panel, type) => {
      const floatOffset = Math.sin(this.animationTime * 1.5 + type.length) * 0.05;
      panel.position.y = floatOffset;
      
      // 面板轻微旋转
      panel.rotation.y = Math.sin(this.animationTime * 0.5) * 0.1;
      panel.rotation.x = Math.cos(this.animationTime * 0.3) * 0.05;
    });
  }

  /**
   * 更新网络数据
   */
  private updateNetworkData(): void {
    // 模拟网络流量数据
    const networkData = {
      download: Math.random() * 100,
      upload: Math.random() * 50,
      latency: Math.random() * 50
    };
    
    this.updatePanelData('network', networkData);
  }

  /**
   * 更新温度数据
   */
  private updateTemperatureData(): void {
    // 模拟温度数据
    const temperatureData = {
      cpuTemp: Math.random() * 80 + 20,
      gpuTemp: Math.random() * 85 + 15,
      ambient: Math.random() * 30 + 15
    };
    
    this.updatePanelData('temperature', temperatureData);
  }

  /**
   * 设置用户交互
   */
  private setupUserInteraction(container: HTMLElement): void {
    // 鼠标控制
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    
    container.addEventListener('mousemove', onMouseMove);
    
    // 触摸控制
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = container.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    
    container.addEventListener('touchmove', onTouchMove);
    
    // 相机动画循环
    const animateCamera = () => {
      targetRotationX = mouseY * 0.1;
      targetRotationY = mouseX * 0.1;
      
      this.camera.rotation.x += (targetRotationX - this.camera.rotation.x) * 0.05;
      this.camera.rotation.y += (targetRotationY - this.camera.rotation.y) * 0.05;
      
      requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
  }

  /**
   * 销毁全息投影界面
   */
  dispose(): void {
    // 清理Three.js对象
    this.scene.clear();
    this.renderer.dispose();
    
    // 清理材质
    this.hologramMaterial.dispose();
    this.particleMaterial.dispose();
    this.scanMaterial.dispose();
    this.warningMaterial.dispose();
    
    // 清理DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<HologramConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新着色器统一变量
    this.hologramMaterial.uniforms.hologramOpacity.value = this.config.hologramOpacity;
    this.hologramMaterial.uniforms.glowIntensity.value = this.config.glowIntensity;
    this.hologramMaterial.uniforms.scanLines.value = this.config.scanLines;
  }

  /**
   * 设置颜色方案
   */
  setColorScheme(scheme: HologramConfig['colorScheme']): void {
    this.config.colorScheme = scheme;
    
    const schemeMap = { cyan: 0, purple: 1, green: 2, rainbow: 3 };
    this.hologramMaterial.uniforms.colorScheme.value = schemeMap[scheme];
  }
}

export default HolographicPerformanceUI;