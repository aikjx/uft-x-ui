import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class MagneticVectorPotentialStrategy implements VisualizationStrategy {
  private vectorPotentialRings: THREE.Mesh[] = [];
  private magneticFieldLines: THREE.Line[] = [];
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建中心源
    const sourceGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    scene.add(source);

    // 创建磁矢势A的环
    const numRings = 8;

    for (let i = 0; i < numRings; i++) {
      const radius = 1.2 + i * 0.3;
      const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.5, 0.2), i / numRings)
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);
      this.vectorPotentialRings.push(ring);
    }

    // 创建磁场B（A的旋度）
    const numFieldLines = 6;

    for (let i = 0; i < numFieldLines; i++) {
      const height = -1.5 + i * 0.6;
      const radius = 1.5 + Math.abs(height) * 0.2;

      const fieldLineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = height;
        const z = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      fieldLineGeometry.setFromPoints(points);
      const fieldLineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 });
      const fieldLine = new THREE.Line(fieldLineGeometry, fieldLineMaterial);
      scene.add(fieldLine);
      this.magneticFieldLines.push(fieldLine);
    }

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;

    // 旋转磁矢势环
    this.vectorPotentialRings.forEach((ring, index) => {
      ring.rotation.x = Math.sin(this.time * 0.5 + index * 0.2) * 0.1;
      ring.rotation.y = this.time * 0.3;
    });

    // 磁场线动画
    this.magneticFieldLines.forEach((line, index) => {
      line.rotation.z = this.time * 0.2 + index * 0.1;
    });
  }

  cleanup(): void {
    this.vectorPotentialRings = [];
    this.magneticFieldLines = [];
    this.time = 0;
  }
}
