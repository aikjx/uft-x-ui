import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class HelixStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    const helixGeometry = new THREE.BufferGeometry();
    const helixPoints = [];
    const r = 1; // 半径
    const h = 0.5; // 高度系数
    const omega = 2; // 角速度

    for (let t = 0; t <= 10; t += 0.05) {
      const x = r * Math.cos(omega * t);
      const y = r * Math.sin(omega * t);
      const z = h * t;
      helixPoints.push(new THREE.Vector3(x, y, z));
    }

    helixGeometry.setFromPoints(helixPoints);
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x95e1d3 });
    const helixLine = new THREE.Line(helixGeometry, helixMaterial);
    scene.add(helixLine);

    // 添加螺旋管道效果
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(helixPoints),
      100,
      0.05,
      8,
      false
    );
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x5352ed,
      transparent: true,
      opacity: 0.3
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
