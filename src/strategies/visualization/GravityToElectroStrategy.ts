import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class GravityToElectroStrategy implements VisualizationStrategy {
  private centralMass: THREE.Mesh | null = null;
  private gravityFieldLines: THREE.Line[] = [];
  private emFieldGroup: THREE.Group | null = null;
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建中心质量
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.centralMass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(this.centralMass);

    // 创建引力场线
    const numGravityLines = 8;

    for (let i = 0; i < numGravityLines; i++) {
      const angle = (i / numGravityLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 20; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3742fa,
        transparent: true,
        opacity: 0.5
      });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      this.gravityFieldLines.push(fieldLine);
    }

    // 创建产生的电磁场
    this.emFieldGroup = new THREE.Group();
    scene.add(this.emFieldGroup);

    const numEmRings = 6;
    for (let i = 0; i < numEmRings; i++) {
      const radius = 3 + i * 0.5;
      const height = -2.5 + i * 1.0;

      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = height;
      this.emFieldGroup.add(ring);
    }

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;

    // 引力场脉动
    if (this.centralMass) {
      this.centralMass.scale.x = 0.8 + Math.sin(this.time * 2) * 0.2;
      this.centralMass.scale.y = 0.8 + Math.sin(this.time * 2) * 0.2;
      this.centralMass.scale.z = 0.8 + Math.sin(this.time * 2) * 0.2;
    }

    // 引力场线运动
    this.gravityFieldLines.forEach((line, index) => {
      const scale = 1 + Math.sin(this.time * 2 + index * 0.5) * 0.2;
      line.scale.x = scale;
      line.scale.y = scale;
    });

    // 电磁场响应
    if (this.emFieldGroup) {
      this.emFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(this.time * 2 + index * 0.3);
        ;((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          0.1 + intensity * 0.4
        );
        ring.rotation.y = this.time * 0.2;
      });
    }
  }

  cleanup(): void {
    this.centralMass = null;
    this.gravityFieldLines = [];
    this.emFieldGroup = null;
    this.time = 0;
  }
}
