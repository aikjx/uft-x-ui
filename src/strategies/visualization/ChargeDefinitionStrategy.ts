import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class ChargeDefinitionStrategy implements VisualizationStrategy {
  private ring: THREE.Mesh | null = null;
  private charge: THREE.Mesh | null = null;
  private angle: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建旋转的环形结构表示空间旋转
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(this.ring);

    // 创建电荷粒子
    const chargeGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    this.charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    scene.add(this.charge);

    // 创建粒子轨迹
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
      pathPoints.push(new THREE.Vector3(Math.cos(t) * 1.5, 0, Math.sin(t) * 1.5));
    }
    pathGeometry.setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0xff6348,
      transparent: true,
      opacity: 0.5
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.angle += 0.02;
    
    if (this.ring) {
      this.ring.rotation.x = Math.sin(this.angle * 0.5) * 0.3;
      this.ring.rotation.y = this.angle;
    }

    // 移动电荷粒子沿环形轨迹
    if (this.charge) {
      this.charge.position.x = Math.cos(this.angle) * 1.5;
      this.charge.position.z = Math.sin(this.angle) * 1.5;
    }
  }

  cleanup(): void {
    this.ring = null;
    this.charge = null;
    this.angle = 0;
  }
}
