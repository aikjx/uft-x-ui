import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class UnifiedForceStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建四个分力向量
    const forces = [
      { color: 0xff6b6b, vector: new THREE.Vector3(1, 0, 0), label: 'dP/dt' },
      { color: 0x4ecdc4, vector: new THREE.Vector3(0, 1, 0), label: 'C·dm/dt' },
      { color: 0x45b7d1, vector: new THREE.Vector3(-0.5, 0, 0), label: '-V·dm/dt' },
      { color: 0x96ceb4, vector: new THREE.Vector3(0, -0.5, 0), label: 'm·dC/dt - m·dV/dt' }
    ];

    forces.forEach((force, index) => {
      const { color, vector, label } = force;

      // 向量线
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        vector
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // 箭头
      const arrowHelper = new THREE.ArrowHelper(vector.clone().normalize(), vector, 0.1, color);
      scene.add(arrowHelper);
    });

    // 合力
    const resultant = forces.reduce((sum, force) => sum.add(force.vector), new THREE.Vector3());
    const resultantGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      resultant
    ]);
    const resultantMaterial = new THREE.LineBasicMaterial({
      color: 0xffd93d,
      linewidth: 3
    });
    const resultantLine = new THREE.Line(resultantGeometry, resultantMaterial);
    scene.add(resultantLine);

    const resultantArrow = new THREE.ArrowHelper(
      resultant.clone().normalize(),
      resultant,
      0.1,
      0xffd93d
    );
    scene.add(resultantArrow);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
