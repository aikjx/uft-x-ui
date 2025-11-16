import * as THREE from 'three';
import { Formula } from '../types';

export class VisualizationService {
  private static instance: VisualizationService;

  public static getInstance(): VisualizationService {
    if (!VisualizationService.instance) {
      VisualizationService.instance = new VisualizationService();
    }
    return VisualizationService.instance;
  }

  public createGridHelper(size: number = 10, divisions: number = 10): THREE.GridHelper {
    const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
    gridHelper.position.y = -0.01; // 稍微抬高避免z-fighting
    return gridHelper;
  }

  public createAxesHelper(size: number = 5): THREE.AxesHelper {
    return new THREE.AxesHelper(size);
  }

  public createSpacetimeVisualization(scene: THREE.Scene, parameters: any): void {
    // 创建时空网格
    const gridSize = 20;
    const gridDivisions = 20;
    const gridHelper = this.createGridHelper(gridSize, gridDivisions);
    scene.add(gridHelper);

    // 创建时空扭曲效果
    this.createSpacetimeDistortion(scene, parameters);
  }

  public createSpiralVisualization(scene: THREE.Scene, parameters: any): void {
    const { radius = 3, angularVelocity = 1, height = 2 } = parameters;
    
    // 创建螺旋轨迹
    const points = [];
    const curve = new THREE.CatmullRomCurve3();
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 8; // 4圈螺旋
      const x = radius * Math.cos(angle * angularVelocity);
      const y = height * t - height / 2;
      const z = radius * Math.sin(angle * angularVelocity);
      points.push(new THREE.Vector3(x, y, z));
    }
    
    curve.points = points;
    
    const geometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const spiral = new THREE.Mesh(geometry, material);
    scene.add(spiral);

    // 添加粒子沿螺旋运动
    this.createSpiralParticles(scene, parameters);
  }

  public createGravityVisualization(scene: THREE.Scene, parameters: any): void {
    const { mass = 1, distance = 2, fieldStrength = 0.8 } = parameters;
    
    // 创建引力中心
    const centerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6b6b,
      emissive: 0xff4444,
      emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(center);

    // 创建引力场线
    this.createGravityFieldLines(scene, center.position, fieldStrength);
  }

  public createElectromagneticVisualization(scene: THREE.Scene, parameters: any): void {
    const { charge = 1, fieldStrength = 1, frequency = 1 } = parameters;
    
    // 创建电磁场效果
    this.createElectricField(scene, charge, fieldStrength);
    this.createMagneticField(scene, frequency);
  }

  public createUnifiedFieldVisualization(scene: THREE.Scene, parameters: any): void {
    // 统一场可视化 - 结合引力场和电磁场
    this.createGravityVisualization(scene, parameters);
    this.createElectromagneticVisualization(scene, parameters);
    
    // 添加场相互作用效果
    this.createFieldInteractions(scene, parameters);
  }

  private createSpacetimeDistortion(scene: THREE.Scene, parameters: any): void {
    const { curvature = 0.5, time = 0 } = parameters;
    
    // 创建时空扭曲网格
    const gridSize = 10;
    const divisions = 20;
    
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    const material = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // 应用时空扭曲
    this.applySpacetimeDistortion(plane, curvature, time);
  }

  private createSpiralParticles(scene: THREE.Scene, parameters: any): void {
    const { particleCount = 100 } = parameters;
    
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 8;
      const radius = 3;
      const height = 2;
      
      positions[i * 3] = radius * Math.cos(angle);
      positions[i * 3 + 1] = height * t - height / 2;
      positions[i * 3 + 2] = radius * Math.sin(angle);
      
      // 渐变色
      colors[i * 3] = t; // R
      colors[i * 3 + 1] = 1 - t; // G
      colors[i * 3 + 2] = 0.5; // B
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  }

  private createGravityFieldLines(scene: THREE.Scene, center: THREE.Vector3, strength: number): void {
    const lineCount = 12;
    const radius = 3;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const points = [];
      
      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const curveRadius = radius * t;
        const curveStrength = strength * (1 - t);
        
        const x = center.x + curveRadius * Math.cos(angle) * (1 + curveStrength);
        const y = center.y;
        const z = center.z + curveRadius * Math.sin(angle) * (1 + curveStrength);
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.6
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  }

  private createElectricField(scene: THREE.Scene, charge: number, strength: number): void {
    // 创建电场线
    const fieldLineCount = 16;
    const maxDistance = 4;
    
    for (let i = 0; i < fieldLineCount; i++) {
      const angle = (i / fieldLineCount) * Math.PI * 2;
      const points = [];
      
      for (let j = 0; j <= 20; j++) {
        const distance = (j / 20) * maxDistance;
        const fieldIntensity = strength * charge / (distance * distance + 0.1);
        
        const x = distance * Math.cos(angle) * (1 + fieldIntensity);
        const y = 0;
        const z = distance * Math.sin(angle) * (1 + fieldIntensity);
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: charge > 0 ? 0xff4444 : 0x4444ff,
        transparent: true,
        opacity: 0.7
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  }

  private createMagneticField(scene: THREE.Scene, frequency: number): void {
    // 创建磁场环
    const ringCount = 5;
    const maxRadius = 3;
    
    for (let i = 0; i < ringCount; i++) {
      const radius = (i + 1) / ringCount * maxRadius;
      const points = [];
      
      for (let j = 0; j <= 32; j++) {
        const angle = (j / 32) * Math.PI * 2;
        const wave = Math.sin(angle * frequency) * 0.2;
        
        const x = radius * Math.cos(angle);
        const y = wave;
        const z = radius * Math.sin(angle);
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x44ff44,
        transparent: true,
        opacity: 0.6
      });
      
      const ring = new THREE.Line(geometry, material);
      scene.add(ring);
    }
  }

  private createFieldInteractions(scene: THREE.Scene, parameters: any): void {
    // 创建场相互作用效果
    const interactionParticles = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(interactionParticles * 3);
    
    for (let i = 0; i < interactionParticles; i++) {
      const angle = (i / interactionParticles) * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      
      positions[i * 3] = radius * Math.cos(angle);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = radius * Math.sin(angle);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  private applySpacetimeDistortion(mesh: THREE.Mesh, curvature: number, time: number): void {
    const positions = mesh.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // 简单的时空扭曲效果
      const distance = Math.sqrt(x * x + z * z);
      const wave = Math.sin(distance * 2 + time) * curvature;
      
      positions[i + 1] = wave;
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  public updateVisualization(scene: THREE.Scene, deltaTime: number, parameters: any): void {
    // 更新场景中的动态元素
    scene.traverse((object) => {
      if (object instanceof THREE.Points) {
        // 粒子动画
        this.animateParticles(object, deltaTime);
      } else if (object instanceof THREE.Line) {
        // 场线动画
        this.animateFieldLines(object, deltaTime);
      }
    });
  }

  private animateParticles(particles: THREE.Points, deltaTime: number): void {
    const positions = particles.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // 简单的粒子运动
      positions[i + 1] += (Math.random() - 0.5) * 0.1 * deltaTime;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
  }

  private animateFieldLines(line: THREE.Line, deltaTime: number): void {
    // 场线波动效果
    const positions = line.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const wave = Math.sin(positions[i] + Date.now() * 0.001) * 0.1;
      positions[i + 1] = wave;
    }
    
    line.geometry.attributes.position.needsUpdate = true;
  }

  public clearScene(scene: THREE.Scene): void {
    while (scene.children.length > 0) {
      const object = scene.children[0];
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
      scene.remove(object);
    }
  }
}

export const visualizationService = VisualizationService.getInstance();