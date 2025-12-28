import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class GravitationalFieldStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 中心质点
    const centralGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const centralMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const centralMass = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralMass);

    // 场线
    const fieldLines = [];
    const numLines = 12;
    const numPointsPerLine = 20;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= numPointsPerLine; j++) {
        const r = 0.7 + j * 0.3;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4facfe,
        linewidth: 2
      });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      fieldLines.push(fieldLine);
    }
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
