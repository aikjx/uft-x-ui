import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class MassDefinitionStrategy implements VisualizationStrategy {
  private particles: THREE.Points | null = null;
  private massSphere: THREE.Mesh | null = null;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建粒子系统表示空间运动
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 6;
      positions[i3 + 1] = (Math.random() - 0.5) * 6;
      positions[i3 + 2] = (Math.random() - 0.5) * 6;

      // 红色系，密度越高越红
      const distance = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      const intensity = Math.max(0, 1 - distance / 3);
      colors[i3] = 1.0;
      colors[i3 + 1] = intensity * 0.3;
      colors[i3 + 2] = intensity * 0.1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(this.particles);

    // 添加质量球体
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const massMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4757,
      wireframe: true
    });
    this.massSphere = new THREE.Mesh(massGeometry, massMaterial);
    scene.add(this.massSphere);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    if (this.particles) {
      this.particles.rotation.y += 0.005 * animationSpeed;
    }
  }

  cleanup(): void {
    this.particles = null;
    this.massSphere = null;
  }
}
