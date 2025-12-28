import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class RestMomentumStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建静止质量
    const massGeometry = new THREE.SphereGeometry(1, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const restMass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(restMass);

    // 创建光速矢量C0
    const c0Vector = new THREE.Vector3(0, 2, 0);
    const c0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      c0Vector
    ]);
    const c0Material = new THREE.LineBasicMaterial({ color: 0xff6348 });
    const c0Line = new THREE.Line(c0Geometry, c0Material);
    scene.add(c0Line);

    // 添加箭头
    const c0Arrow = new THREE.ArrowHelper(c0Vector.clone().normalize(), c0Vector, 0.2, 0xff6348);
    scene.add(c0Arrow);

    // 创建动量矢量p0 = m0*C0
    const p0Vector = c0Vector.clone().multiplyScalar(1);
    const p0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      p0Vector
    ]);
    const p0Material = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 });
    const p0Line = new THREE.Line(p0Geometry, p0Material);
    scene.add(p0Line);

    const p0Arrow = new THREE.ArrowHelper(p0Vector.clone().normalize(), p0Vector, 0.2, 0x1dd1a1);
    scene.add(p0Arrow);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
