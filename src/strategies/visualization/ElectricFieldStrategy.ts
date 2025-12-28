import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

interface FieldLine {
  line: THREE.Line;
  originalPoints: THREE.Vector3[];
  phase: number;
}

interface FieldParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  phase: number;
  lifetime: number;
  maxLifetime: number;
}

export default class ElectricFieldStrategy implements VisualizationStrategy {
  private fieldLines: FieldLine[] = [];
  private fieldParticles: FieldParticle[] = [];
  private charge: THREE.Mesh | null = null;
  private time: number = 0;
  private params = {
    numLines: 32,
    numPointsPerLine: 30,
    numParticles: 200,
    fieldStrength: 1.0,
    animationSpeed: 1.0
  };

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 合并参数
    this.params = { ...this.params, ...params };

    // 创建电荷中心
    this.createCharge(scene);

    // 创建电场线
    this.createFieldLines(scene);

    // 创建场粒子
    this.createFieldParticles(scene);
  }

  private createCharge(scene: THREE.Scene): void {
    // 创建电荷核心
    const chargeGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const chargeMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6348,
      emissive: 0xff6348,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.95,
      shininess: 100,
      specular: 0xffffff
    });
    
    this.charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(this.charge);
    
    // 添加电荷发光效果
    const chargeGlowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const chargeGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6348,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const chargeGlow = new THREE.Mesh(chargeGlowGeometry, chargeGlowMaterial);
    this.charge.add(chargeGlow);
  }

  private createFieldLines(scene: THREE.Scene): void {
    const { numLines, numPointsPerLine } = this.params;
    
    // 创建球体分布的电场线
    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2;
      
      // 不同纬度的电场线
      for (let j = 0; j <= 8; j++) {
        const theta = (j / 8) * Math.PI;
        
        const lineGeometry = new THREE.BufferGeometry();
        const points: THREE.Vector3[] = [];
        const originalPoints: THREE.Vector3[] = [];
        
        for (let k = 0; k <= numPointsPerLine; k++) {
          const r = 0.7 + k * 0.3;
          const x = r * Math.sin(theta) * Math.cos(phi);
          const y = r * Math.cos(theta);
          const z = r * Math.sin(theta) * Math.sin(phi);
          
          const point = new THREE.Vector3(x, y, z);
          points.push(point.clone());
          originalPoints.push(point.clone());
        }
        
        lineGeometry.setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(0.65, 1, 0.5),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          linewidth: 1.5
        });
        
        const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(fieldLine);
        
        this.fieldLines.push({
          line,
          originalPoints,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  private createFieldParticles(scene: THREE.Scene): void {
    const { numParticles } = this.params;
    
    for (let i = 0; i < numParticles; i++) {
      // 随机位置分布
      const r = Math.random() * 5 + 1;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);
      
      const particleGeometry = new THREE.SphereGeometry(Math.random() * 0.1 + 0.05, 16, 16);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.65, 1, 0.7),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);
      scene.add(particle);
      
      // 粒子速度沿电场线方向
      const velocity = new THREE.Vector3(x, y, z).normalize().multiplyScalar(Math.random() * 0.5 + 0.2);
      
      this.fieldParticles.push({
        mesh: particle,
        velocity,
        phase: Math.random() * Math.PI * 2,
        lifetime: Math.random() * 5 + 2,
        maxLifetime: Math.random() * 5 + 2
      });
    }
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01 * this.params.animationSpeed * animationSpeed;
    
    // 更新电荷
    this.updateCharge();
    
    // 更新电场线
    this.updateFieldLines();
    
    // 更新场粒子
    this.updateFieldParticles();
  }

  private updateCharge(): void {
    if (!this.charge) return;
    
    // 电荷脉动效果
    const pulseScale = 1 + Math.sin(this.time * 5) * 0.1;
    this.charge.scale.set(pulseScale, pulseScale, pulseScale);
    
    // 电荷旋转
    this.charge.rotation.y += 0.01;
    this.charge.rotation.x += 0.005;
    
    // 电荷发光强度变化
    const glow = this.charge.children[0] as THREE.Mesh;
    glow.material.opacity = 0.3 + Math.sin(this.time * 3) * 0.1;
  }

  private updateFieldLines(): void {
    this.fieldLines.forEach((fieldLine, index) => {
      const { line, originalPoints, phase } = fieldLine;
      const geometry = line.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < originalPoints.length; i++) {
        const originalPoint = originalPoints[i];
        const distance = originalPoint.length();
        
        // 电场线波动效果
        const waveAmp = Math.sin(this.time * 2 + phase + distance * 0.5) * 0.1 * Math.exp(-distance * 0.1);
        const waveDir = new THREE.Vector3(
          Math.sin(this.time + phase + i),
          Math.cos(this.time + phase + i * 2),
          Math.sin(this.time * 1.5 + phase + i * 3)
        ).normalize();
        
        const newPoint = originalPoint.clone().add(waveDir.multiplyScalar(waveAmp));
        
        positions[i * 3] = newPoint.x;
        positions[i * 3 + 1] = newPoint.y;
        positions[i * 3 + 2] = newPoint.z;
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      // 电场线颜色变化
      const hue = (0.65 + Math.sin(this.time + phase) * 0.1) % 1;
      (line.material as THREE.LineBasicMaterial).color.setHSL(hue, 1, 0.5);
      (line.material as THREE.LineBasicMaterial).opacity = 0.7 + Math.sin(this.time * 3 + phase) * 0.2;
    });
  }

  private updateFieldParticles(): void {
    this.fieldParticles.forEach((particle, index) => {
      const { mesh, velocity, phase, lifetime, maxLifetime } = particle;
      
      // 更新粒子位置
      mesh.position.add(velocity.clone().multiplyScalar(0.1));
      
      // 粒子围绕电场线波动
      const waveOffset = new THREE.Vector3(
        Math.sin(this.time * 3 + phase) * 0.1,
        Math.cos(this.time * 2 + phase) * 0.1,
        Math.sin(this.time * 4 + phase) * 0.1
      );
      mesh.position.add(waveOffset);
      
      // 粒子生命周期管理
      particle.lifetime -= 0.01;
      if (particle.lifetime <= 0) {
        // 重置粒子
        const r = Math.random() * 5 + 1;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        mesh.position.set(
          r * Math.sin(theta) * Math.cos(phi),
          r * Math.cos(theta),
          r * Math.sin(theta) * Math.sin(phi)
        );
        
        particle.velocity = new THREE.Vector3(
          mesh.position.x,
          mesh.position.y,
          mesh.position.z
        ).normalize().multiplyScalar(Math.random() * 0.5 + 0.2);
        
        particle.lifetime = particle.maxLifetime;
        particle.phase = Math.random() * Math.PI * 2;
      }
      
      // 粒子透明度变化
      const lifeRatio = particle.lifetime / particle.maxLifetime;
      mesh.material.opacity = lifeRatio * 0.8;
      
      // 粒子大小变化
      const size = (Math.random() * 0.1 + 0.05) * (0.8 + Math.sin(this.time * 5 + phase) * 0.3);
      mesh.scale.set(size, size, size);
      
      // 粒子颜色变化
      const hue = (0.65 + Math.sin(this.time + phase) * 0.15) % 1;
      (mesh.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.7);
    });
  }
}

