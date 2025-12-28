import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class SpaceTimeStrategy implements VisualizationStrategy {
  private movingPoint: THREE.Mesh | null = null;
  private t: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建时间轴
    const timeLineGeometry = new THREE.BufferGeometry();
    const timeLinePoints = [];
    for (let i = -5; i <= 5; i += 0.1) {
      timeLinePoints.push(new THREE.Vector3(i, 0, 0));
    }
    timeLineGeometry.setFromPoints(timeLinePoints);
    const timeLineMaterial = new THREE.LineBasicMaterial({ color: 0xff6b6b });
    const timeLine = new THREE.Line(timeLineGeometry, timeLineMaterial);
    scene.add(timeLine);

    // 创建空间点运动轨迹
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = [];
    for (let t = 0; t <= 10; t += 0.1) {
      // C = (1, 1, 1) 简化示例
      pathPoints.push(new THREE.Vector3(t * 0.3, t * 0.3, t * 0.3));
    }
    pathGeometry.setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x4ecdc4 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);

    // 添加动态点
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x45b7d1 });
    this.movingPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    scene.add(this.movingPoint);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    if (this.movingPoint) {
      this.t += 0.01 * animationSpeed;
      this.movingPoint.position.set(this.t * 0.3, this.t * 0.3, this.t * 0.3);
      if (this.t > 10) this.t = 0;
    }
  }

  cleanup(): void {
    this.movingPoint = null;
    this.t = 0;
  }
}
