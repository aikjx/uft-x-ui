import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class EnergyEquationStrategy implements VisualizationStrategy {
  private restMass: THREE.Mesh | null = null;
  private movingMass: THREE.Mesh | null = null;
  private energyField: THREE.Mesh | null = null;
  private velocityLine: THREE.Line | null = null;
  private velocityGeometry: THREE.BufferGeometry | null = null;
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建静止质量
    const restMassGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const restMassMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    this.restMass = new THREE.Mesh(restMassGeometry, restMassMaterial);
    this.restMass.position.x = -2;
    scene.add(this.restMass);

    // 创建运动质量
    const movingMassGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const movingMassMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.movingMass = new THREE.Mesh(movingMassGeometry, movingMassMaterial);
    this.movingMass.position.x = 2;
    scene.add(this.movingMass);

    // 创建能量场
    const energyFieldGeometry = new THREE.SphereGeometry(3, 32, 32);
    const energyFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
    scene.add(this.energyField);

    // 创建速度向量
    const velocityVector = new THREE.Vector3(0, 0, 1.5);
    this.velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      this.movingMass.position,
      this.movingMass.position.clone().add(velocityVector)
    ]);
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 });
    this.velocityLine = new THREE.Line(this.velocityGeometry, velocityMaterial);
    scene.add(this.velocityLine);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;

    // 运动质量速度变化
    if (this.movingMass) {
      const speed = Math.sin(this.time * 0.5) * 0.8 + 0.2;
      this.movingMass.scale.x = 1 / Math.sqrt(1 - speed * speed); // 相对论质量增加
      this.movingMass.scale.y = 1 / Math.sqrt(1 - speed * speed);
      this.movingMass.scale.z = 1 / Math.sqrt(1 - speed * speed);

      // 更新速度向量
      if (this.velocityGeometry && this.velocityLine) {
        const newVelocity = new THREE.Vector3(0, 0, 1.5 * speed);
        this.velocityGeometry.setFromPoints([
          this.movingMass.position,
          this.movingMass.position.clone().add(newVelocity)
        ]);
        this.velocityGeometry.attributes.position.needsUpdate = true;
      }
    }

    // 能量场脉动
    if (this.energyField) {
      this.energyField.scale.x = 3 + Math.sin(this.time * 2) * 0.3;
      this.energyField.scale.y = 3 + Math.sin(this.time * 2) * 0.3;
      this.energyField.scale.z = 3 + Math.sin(this.time * 2) * 0.3;
      ;(this.energyField.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.abs(Math.sin(this.time * 2)) * 0.2;
    }
  }

  cleanup(): void {
    this.restMass = null;
    this.movingMass = null;
    this.energyField = null;
    this.velocityLine = null;
    this.velocityGeometry = null;
    this.time = 0;
  }
}
