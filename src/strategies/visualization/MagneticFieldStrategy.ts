import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class MagneticFieldStrategy implements VisualizationStrategy {
  private charge: THREE.Mesh | null = null;
  private fieldLines: THREE.Line[] = [];
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建运动电荷
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(this.charge);

    // 创建速度方向
    const velocityVector = new THREE.Vector3(0, 0, 1);
    const velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      velocityVector.clone().multiplyScalar(3)
    ]);
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
    const velocityLine = new THREE.Line(velocityGeometry, velocityMaterial);
    scene.add(velocityLine);

    // 创建磁场线（环形围绕速度方向）
    const numRings = 5;
    const pointsPerRing = 64;

    for (let i = 0; i < numRings; i++) {
      const radius = 0.8 + i * 0.4;
      const height = -1.5 + i * 0.8;

      const ringGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 0; j <= pointsPerRing; j++) {
        const angle = (j / pointsPerRing) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = height;
        const y = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }

      ringGeometry.setFromPoints(points);
      const intensity = 1 - i / numRings;
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.2, 0.2), intensity)
      });
      const fieldLine = new THREE.Line(ringGeometry, lineMaterial);
      scene.add(fieldLine);
      this.fieldLines.push(fieldLine);
    }

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;

    // 移动电荷
    if (this.charge) {
      this.charge.position.z = Math.sin(this.time * 2) * 1.5;
    }

    // 旋转磁场线
    this.fieldLines.forEach((line, index) => {
      line.rotation.z = this.time * 0.5 + index * 0.1;
    });
  }

  cleanup(): void {
    this.charge = null;
    this.fieldLines = [];
    this.time = 0;
  }
}
