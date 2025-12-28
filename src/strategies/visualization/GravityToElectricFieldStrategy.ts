import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class GravityToElectricFieldStrategy implements VisualizationStrategy {
  private gravitySource: THREE.Mesh | null = null;
  private aFieldLines: THREE.Line[] = [];
  private electricFieldLines: THREE.Line[] = [];
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建中心引力源
    const gravitySourceGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const gravitySourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.gravitySource = new THREE.Mesh(gravitySourceGeometry, gravitySourceMaterial);
    scene.add(this.gravitySource);

    // 创建引力场A
    const numALines = 8;

    for (let i = 0; i < numALines; i++) {
      const angle = (i / numALines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      this.aFieldLines.push(fieldLine);
    }

    // 创建产生的电场E
    const numELines = 6;

    for (let i = 0; i < numELines; i++) {
      const height = -1 + i * 0.4;
      const angle = (i / numELines) * Math.PI * 2;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) + height;
        const z = Math.sin(j * 0.3) * 0.5;
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

    // 引力场脉动
    if (this.gravitySource) {
      this.gravitySource.scale.x = 0.7 + Math.sin(this.time * 2) * 0.2;
      this.gravitySource.scale.y = 0.7 + Math.sin(this.time * 2) * 0.2;
      this.gravitySource.scale.z = 0.7 + Math.sin(this.time * 2) * 0.2;
    }

    // 引力场A变化
    this.aFieldLines.forEach((line, index) => {
      const scale = 1 + Math.sin(this.time * 2 + index * 0.3) * 0.2;
      line.scale.x = scale;
      line.scale.y = scale;
    });

    // 电场E响应
    this.electricFieldLines.forEach((line, index) => {
      const offset = Math.sin(this.time * 2 + index * 0.3);
      line.position.z = offset * 0.3;
      line.rotation.y = offset * 0.2;
    });
  }

  cleanup(): void {
    this.gravitySource = null;
    this.aFieldLines = [];
    this.electricFieldLines = [];
    this.time = 0;
  }
}
