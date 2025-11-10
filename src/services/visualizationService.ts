import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VISUALIZATION_CONFIG } from '../constants';

// 可视化服务类
export class VisualizationService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private animationId: number | null = null;
  private objects: THREE.Object3D[] = [];
  private lights: THREE.Light[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private onAnimationFrame: ((deltaTime: number) => void) | null = null;
  
  /**
   * 初始化3D场景
   */
  public initializeScene(container: HTMLElement): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(VISUALIZATION_CONFIG.backgroundColor);
    
    // 创建相机
    const { width, height } = container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(
      VISUALIZATION_CONFIG.defaultFOV,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(
      VISUALIZATION_CONFIG.defaultCameraPosition.x,
      VISUALIZATION_CONFIG.defaultCameraPosition.y,
      VISUALIZATION_CONFIG.defaultCameraPosition.z
    );
    this.camera.lookAt(
      VISUALIZATION_CONFIG.defaultCameraTarget.x,
      VISUALIZATION_CONFIG.defaultCameraTarget.y,
      VISUALIZATION_CONFIG.defaultCameraTarget.z
    );
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 添加渲染器到容器
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);
    
    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 0.5;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.5;
    
    // 设置默认光照
    this.setupDefaultLights();
    
    // 添加窗口大小变化监听
    this.setupResizeHandling(container);
  }
  
  /**
   * 设置默认光照
   */
  private setupDefaultLights(): void {
    if (!this.scene) return;
    
    // 环境光
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      VISUALIZATION_CONFIG.ambientLightIntensity
    );
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // 方向光
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      VISUALIZATION_CONFIG.directionalLightIntensity
    );
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
    
    // 辅助光
    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    fillLight.position.set(-10, 5, -5);
    this.scene.add(fillLight);
    this.lights.push(fillLight);
  }
  
  /**
   * 设置窗口大小变化处理
   */
  private setupResizeHandling(container: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.handleResize(width, height);
      }
    });
    
    this.resizeObserver.observe(container);
  }
  
  /**
   * 处理窗口大小变化
   */
  private handleResize(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * 添加自定义对象到场景
   */
  public addObject(object: THREE.Object3D): void {
    this.scene?.add(object);
    this.objects.push(object);
  }
  
  /**
   * 从场景中移除对象
   */
  public removeObject(object: THREE.Object3D): void {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.scene?.remove(object);
      VisualizationService.cleanupObject(object);
    }
  }
  
  /**
   * 清空场景
   */
  public clearScene(): void {
    // 移除所有对象
    while (this.objects.length > 0) {
      this.removeObject(this.objects[0]);
    }
    
    // 移除所有光源
    while (this.lights.length > 0) {
      const light = this.lights.pop();
      if (light) {
        this.scene?.remove(light);
      }
    }
    
    // 重新设置默认光源
    this.setupDefaultLights();
  }
  
  /**
   * 设置动画帧回调
   */
  public setAnimationCallback(callback: (deltaTime: number) => void): void {
    this.onAnimationFrame = callback;
  }
  
  /**
   * 开始渲染循环
   */
  public startRenderLoop(): void {
    if (this.animationId !== null) return;
    
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // 更新控制器
      this.controls?.update();
      
      // 执行自定义动画回调
      this.onAnimationFrame?.(deltaTime);
      
      // 渲染场景
      this.renderer?.render(this.scene!, this.camera!);
      
      // 继续动画循环
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate(0);
  }
  
  /**
   * 停止渲染循环
   */
  public stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * 获取场景对象
   */
  public getScene(): THREE.Scene | null {
    return this.scene;
  }
  
  /**
   * 获取相机对象
   */
  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }
  
  /**
   * 获取渲染器对象
   */
  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    // 停止渲染循环
    this.stopRenderLoop();
    
    // 移除窗口大小变化监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // 清空场景
    this.clearScene();
    
    // 释放控制器
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    // 释放渲染器
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // 重置引用
    this.scene = null;
    this.camera = null;
    this.onAnimationFrame = null;
  }
  
  // 静态方法保持不变，用于创建各种3D对象
  // 创建坐标轴辅助
  static createAxesHelper(size: number = 5): THREE.AxesHelper {
    return new THREE.AxesHelper(size);
  }

  // 创建网格辅助
  static createGridHelper(size: number = 10, divisions: number = 10, color1?: number, color2?: number): THREE.GridHelper {
    return new THREE.GridHelper(size, divisions, color1 || 0x444444, color2 || 0x222222);
  }

  // 创建公式文本占位符
  static createFormulaText(options: {
    text: string;
    position: THREE.Vector3;
    size?: number;
    color?: number;
  }): THREE.Mesh {
    const { text, position, size = 0.3, color = 0x88ccff } = options;
    
    const geometry = new THREE.PlaneGeometry(1.5 * text.length * size, 2 * size);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    return mesh;
  }

  // 创建粒子系统
  static createParticleSystem(options: {
    count: number;
    size?: number;
    color?: THREE.Color;
    spread?: number;
  }): THREE.Points {
    const { count, size = 0.01, color = new THREE.Color(0x0088ff), spread = 5 } = options;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * spread * 2;
      positions[i + 1] = (Math.random() - 0.5) * spread * 2;
      positions[i + 2] = (Math.random() - 0.5) * spread * 2;
      
      // 添加颜色变化
      const r = color.r + (Math.random() - 0.5) * 0.3;
      const g = color.g + (Math.random() - 0.5) * 0.3;
      const b = color.b + (Math.random() - 0.5) * 0.3;
      
      colors[i] = Math.max(0, Math.min(1, r));
      colors[i + 1] = Math.max(0, Math.min(1, g));
      colors[i + 2] = Math.max(0, Math.min(1, b));
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Points(geometry, material);
  }

  // 创建螺旋线
  static createHelix(options: {
    radius?: number;
    height?: number;
    turns?: number;
    color?: number;
    points?: number;
    thickness?: number;
  }): THREE.Mesh | THREE.Line {
    const { radius = 1, height = 3, turns = 2, color = 0x95e1d3, points = 100, thickness = 0.05 } = options;
    
    const helixPoints: THREE.Vector3[] = [];
    
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = 2 * Math.PI * turns * t;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = height * (t - 0.5);
      
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    
    if (thickness > 0) {
      // 创建管道
      const curve = new THREE.CatmullRomCurve3(helixPoints);
      const geometry = new THREE.TubeGeometry(curve, points * 2, thickness, 8, false);
      const material = new THREE.MeshBasicMaterial({ 
        color, 
        transparent: true,
        opacity: 0.7
      });
      return new THREE.Mesh(geometry, material);
    } else {
      // 创建线
      const geometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
      const material = new THREE.LineBasicMaterial({ color });
      return new THREE.Line(geometry, material);
    }
  }

  // 创建引力场可视化
  static createGravitationalField(options: {
    mass?: number;
    position?: THREE.Vector3;
    radius?: number;
    rings?: number;
    color?: number;
  }): THREE.Group {
    const { mass = 1, position = new THREE.Vector3(), radius = 3, rings = 5, color = 0x60a5fa } = options;
    
    const group = new THREE.Group();
    group.position.copy(position);
    
    // 创建中心质量点
    const massGeometry = new THREE.SphereGeometry(Math.max(0.2, mass * 0.3), 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const massSphere = new THREE.Mesh(massGeometry, massMaterial);
    group.add(massSphere);
    
    // 创建引力场环
    for (let i = 1; i <= rings; i++) {
      const ringRadius = (i / rings) * radius;
      const ringGeometry = new THREE.RingGeometry(ringRadius - 0.05, ringRadius + 0.05, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: Math.max(0.1, 1 - i / rings),
        side: THREE.DoubleSide
      });
      
      // 创建三个垂直的环
      const ringX = new THREE.Mesh(ringGeometry, ringMaterial);
      ringX.rotation.x = Math.PI / 2;
      group.add(ringX);
      
      const ringY = new THREE.Mesh(ringGeometry, ringMaterial);
      ringY.rotation.y = Math.PI / 2;
      group.add(ringY);
      
      const ringZ = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ringZ);
    }
    
    return group;
  }

  // 创建电磁场可视化
  static createElectromagneticField(options: {
    charge?: number;
    position?: THREE.Vector3;
    radius?: number;
    fieldLines?: number;
    color?: number;
  }): THREE.Group {
    const { charge = 1, position = new THREE.Vector3(), radius = 3, fieldLines = 8, color = 0xfacc15 } = options;
    
    const group = new THREE.Group();
    group.position.copy(position);
    
    // 创建电荷点
    const chargeGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: charge > 0 ? 0xef4444 : 0x3b82f6 });
    const chargeSphere = new THREE.Mesh(chargeGeometry, chargeMaterial);
    group.add(chargeSphere);
    
    // 创建电磁场线
    for (let i = 0; i < fieldLines; i++) {
      const angle = (i / fieldLines) * Math.PI * 2;
      const linePoints: THREE.Vector3[] = [];
      
      for (let t = 0; t <= 1; t += 0.01) {
        const r = radius * t;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        // 螺旋状的电磁场线
        const z = Math.sin(r * 2) * 0.5 * t;
        
        linePoints.push(new THREE.Vector3(x, y, z));
      }
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
      
      // 添加反向的线
      const reverseLinePoints = linePoints.map(point => new THREE.Vector3(point.x, point.y, -point.z));
      const reverseLineGeometry = new THREE.BufferGeometry().setFromPoints(reverseLinePoints);
      const reverseLine = new THREE.Line(reverseLineGeometry, lineMaterial);
      group.add(reverseLine);
    }
    
    return group;
  }

  // 清理THREE对象
  static cleanupObject(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material instanceof THREE.Material) {
        object.material.dispose();
      } else if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      }
    } else if (object instanceof THREE.Line || object instanceof THREE.Points) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material instanceof THREE.Material) {
        object.material.dispose();
      } else if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      }
    } else if (object instanceof THREE.Sprite) {
      if (object.material) {
        object.material.dispose();
      }
    } else if (object instanceof THREE.Group || object instanceof THREE.Scene) {
      object.children.forEach(child => this.cleanupObject(child));
    }
  }
  
  /**
   * 设置场景照明
   * @param scene Three.js场景
   * @param options 光照配置选项
   */
  setupLighting(scene: THREE.Scene, options: {
    ambientLightIntensity?: number;
    directionalLightIntensity?: number;
  }) {
    const { 
      ambientLightIntensity = VISUALIZATION_CONFIG.defaultAmbientLightIntensity || 0.5,
      directionalLightIntensity = VISUALIZATION_CONFIG.defaultDirectionalLightIntensity || 1.0
    } = options;
    
    // 移除现有灯光
    scene.children = scene.children.filter(child => 
      !(child instanceof THREE.Light)
    );
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);
    
    // 添加方向光
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity * 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity * 0.4);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);
    
    // 添加半球光（可选）
    const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff0000, 0.2);
    scene.add(hemisphereLight);
  }
  
  /**
   * 创建新场景
   * @returns Three.js场景实例
   */
  createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(VISUALIZATION_CONFIG.backgroundColor);
    return scene;
  }
  
  /**
   * 清理整个场景
   * @param scene Three.js场景
   */
  cleanupScene(scene: THREE.Scene) {
    // 清理所有子对象
    while (scene.children.length > 0) {
      const child = scene.children[0];
      scene.remove(child);
      this.cleanupObject(child);
    }
  }
}

// 创建并导出单例实例
export const visualizationService = new VisualizationService();

// 默认导出
export default VisualizationService;