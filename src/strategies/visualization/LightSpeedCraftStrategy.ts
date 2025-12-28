import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class LightSpeedCraftStrategy implements VisualizationStrategy {
  private craft: THREE.Mesh | null = null;
  private cLine: THREE.Line | null = null;
  private vLine: THREE.Line | null = null;
  private fLine: THREE.Line | null = null;
  private cGeometry: THREE.BufferGeometry | null = null;
  private vGeometry: THREE.BufferGeometry | null = null;
  private fGeometry: THREE.BufferGeometry | null = null;
  private time: number = 0;
  private position: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建飞行器
    const craftGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const craftMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa });
    this.craft = new THREE.Mesh(craftGeometry, craftMaterial);
    this.craft.rotation.x = Math.PI / 2;
    scene.add(this.craft);

    // 创建光速矢量C
    const cVector = new THREE.Vector3(0, 0, 3);
    this.cGeometry = new THREE.BufferGeometry().setFromPoints([
      this.craft.position,
      this.craft.position.clone().add(cVector)
    ]);
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 });
    this.cLine = new THREE.Line(this.cGeometry, cMaterial);
    scene.add(this.cLine);

    // 创建速度矢量V
    const vVector = new THREE.Vector3(0, 0, 1.5);
    this.vGeometry = new THREE.BufferGeometry().setFromPoints([
      this.craft.position,
      this.craft.position.clone().add(vVector)
    ]);
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 });
    this.vLine = new THREE.Line(this.vGeometry, vMaterial);
    scene.add(this.vLine);

    // 创建推力矢量F
    const fVector = cVector.clone().sub(vVector).multiplyScalar(0.5);
    this.fGeometry = new THREE.BufferGeometry().setFromPoints([
      this.craft.position,
      this.craft.position.clone().sub(fVector) // 推力方向与加速度相反
    ]);
    const fMaterial = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });
    this.fLine = new THREE.Line(this.fGeometry, fMaterial);
    scene.add(this.fLine);

    // 创建推进粒子效果
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7; // 粒子从尾部喷出
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff6348,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.craft.add(particles);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01;
    this.position += 0.02;

    // 更新飞行器位置
    if (this.craft) {
      this.craft.position.z = this.position;

      // 更新向量位置
      const cVector = new THREE.Vector3(0, 0, 3);
      const vVector = new THREE.Vector3(0, 0, 1.5);
      const fVector = cVector.clone().sub(vVector).multiplyScalar(0.5);

      if (this.cGeometry && this.cLine) {
        this.cGeometry.setFromPoints([this.craft.position, this.craft.position.clone().add(cVector)]);
        this.cGeometry.attributes.position.needsUpdate = true;
      }

      if (this.vGeometry && this.vLine) {
        this.vGeometry.setFromPoints([this.craft.position, this.craft.position.clone().add(vVector)]);
        this.vGeometry.attributes.position.needsUpdate = true;
      }

      if (this.fGeometry && this.fLine) {
        this.fGeometry.setFromPoints([this.craft.position, this.craft.position.clone().sub(fVector)]);
        this.fGeometry.attributes.position.needsUpdate = true;
      }

      // 更新粒子位置
      this.craft.children.forEach(child => {
        if (child instanceof THREE.Points) {
          const particles = child;
          const positions = particles.geometry.attributes.position.array;
          const particlesCount = positions.length / 3;

          for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            positions[i3 + 2] -= 0.02; // 粒子向后移动

            // 重置远离的粒子
            if (positions[i3 + 2] < -2) {
              positions[i3] = (Math.random() - 0.5) * 0.5;
              positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
              positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7;
            }
          }

          particles.geometry.attributes.position.needsUpdate = true;
        }
      });
    }
  }

  cleanup(): void {
    this.craft = null;
    this.cLine = null;
    this.vLine = null;
    this.fLine = null;
    this.cGeometry = null;
    this.vGeometry = null;
    this.fGeometry = null;
    this.time = 0;
    this.position = 0;
  }
}
