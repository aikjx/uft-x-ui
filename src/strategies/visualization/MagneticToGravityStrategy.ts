import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class MagneticToGravityStrategy implements VisualizationStrategy {
  private magneticSource: THREE.Mesh | null = null;
  private magneticFieldLines: THREE.Line[] = [];
  private gravityFieldGroup: THREE.Group | null = null;
  private electricFieldLines: THREE.Line[] = [];
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建磁场源
    const magneticSourceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
    const magneticSourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    this.magneticSource = new THREE.Mesh(magneticSourceGeometry, magneticSourceMaterial);
    scene.add(this.magneticSource);

    // 创建磁场线B
    const numBLines = 8;

    for (let i = 0; i < numBLines; i++) {
      const radius = 1.0 + (i % 4) * 0.3;
      const height = -1.5 + Math.floor(i / 4) * 3.0;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = height;
        const z = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      this.magneticFieldLines.push(fieldLine);
    }

    // 创建产生的引力场A
    this.gravityFieldGroup = new THREE.Group();
    scene.add(this.gravityFieldGroup);

    const numGravityRings = 5;
    for (let i = 0; i < numGravityRings; i++) {
      const radius = 2 + i * 0.4;
      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3742fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.z = Math.PI / 2;
      this.gravityFieldGroup.add(ring);
    }

    // 创建产生的电场E
    const numELines = 6;

    for (let i = 0; i < numELines; i++) {
      const angle = (i / numELines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 32; j++) {
        const r = 2.5 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = Math.sin(j * 0.5) * 0.5;
        const z = r * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      this.electricFieldLines.push(fieldLine);
    }

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;

    // 磁场变化
    if (this.magneticSource) {
      this.magneticSource.scale.y = 0.3 + Math.sin(this.time * 3) * 0.1;
    }

    // 磁场线动画
    this.magneticFieldLines.forEach((line, index) => {
      const intensity = Math.sin(this.time * 2 + index * 0.3);
      line.scale.x = 1 + intensity * 0.1;
      line.scale.z = 1 + intensity * 0.1;
      line.rotation.y = this.time * 0.1;
    });

    // 引力场响应
    if (this.gravityFieldGroup) {
      this.gravityFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(this.time * 2 + index * 0.2);
        const mesh = ring as THREE.Mesh;
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.1 + intensity * 0.2);
        ring.rotation.x = this.time * 0.1 + intensity * 0.1;
      });
    }

    // 电场响应
    this.electricFieldLines.forEach((line, index) => {
      const offset = Math.sin(this.time * 2 + index * 0.4);
      line.position.y = offset * 0.3;
      line.rotation.x = offset * 0.1;
    });
  }

  cleanup(): void {
    this.magneticSource = null;
    this.magneticFieldLines = [];
    this.gravityFieldGroup = null;
    this.electricFieldLines = [];
    this.time = 0;
  }
}
