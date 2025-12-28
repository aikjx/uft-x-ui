import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class MovingMomentumStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建质量体
    const massGeometry = new THREE.SphereGeometry(1, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    const mass = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(mass);

    // 创建光速矢量C
    const cVector = new THREE.Vector3(0, 3, 0);
    const cGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      cVector
    ]);
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 });
    const cLine = new THREE.Line(cGeometry, cMaterial);
    scene.add(cLine);

    // 创建速度矢量V
    const vVector = new THREE.Vector3(1.5, 0, 0);
    const vGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      vVector
    ]);
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 });
    const vLine = new THREE.Line(vGeometry, vMaterial);
    scene.add(vLine);

    // 计算动量矢量P = m(C - V)
    const cvVector = cVector.clone().sub(vVector);
    const pVector = cvVector.clone().multiplyScalar(1);
    const pGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      pVector
    ]);
    const pMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 });
    const pLine = new THREE.Line(pGeometry, pMaterial);
    scene.add(pLine);

    // 添加箭头
    const cArrow = new THREE.ArrowHelper(cVector.clone().normalize(), cVector, 0.2, 0xff6348);
    const vArrow = new THREE.ArrowHelper(vVector.clone().normalize(), vVector, 0.2, 0xffa502);
    const pArrow = new THREE.ArrowHelper(pVector.clone().normalize(), pVector, 0.2, 0x1dd1a1);

    scene.add(cArrow, vArrow, pArrow);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
