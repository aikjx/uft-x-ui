import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class ElectricFieldStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建电荷中心
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(charge);

    // 创建电场线（径向）
    const fieldLines = [];
    const numLines = 16;
    const numPointsPerLine = 15;

    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2;
      const theta = Math.PI / 2; // 赤道平面

      for (let j = 0; j < 2; j++) {
        // 正负两个方向
        const sign = j === 0 ? 1 : -1;
        const lineGeometry = new THREE.BufferGeometry();
        const points = [];

        for (let k = 1; k <= numPointsPerLine; k++) {
          const r = 0.7 + k * 0.2;
          const x = r * Math.sin(theta) * Math.cos(phi) * sign;
          const y = r * Math.cos(theta) * sign;
          const z = r * Math.sin(theta) * Math.sin(phi) * sign;
          points.push(new THREE.Vector3(x, y, z));
        }

        lineGeometry.setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
        const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(fieldLine);
        fieldLines.push(fieldLine);
      }
    }

    // 创建垂直平面的电场线
    for (let i = 0; i < numLines / 2; i++) {
      const phi = 0;
      const theta = ((i / (numLines / 2)) * Math.PI) / 2;

      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let k = 1; k <= numPointsPerLine; k++) {
        const r = 0.7 + k * 0.2;
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(phi);
        points.push(new THREE.Vector3(x, y, z));
        points.push(new THREE.Vector3(-x, y, -z)); // 对称点
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      fieldLines.push(fieldLine);
    }
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
