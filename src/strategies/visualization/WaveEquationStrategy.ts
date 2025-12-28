import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class WaveEquationStrategy implements VisualizationStrategy {
  private waveMesh: THREE.Mesh | null = null;
  private time: number = 0;

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建波动表面
    const waveGeometry = new THREE.PlaneGeometry(8, 8, 100, 100);
    const positions = waveGeometry.attributes.position.array;
    const colors = new Float32Array((positions.length * 3) / 3);

    // 初始化颜色属性
    for (let i = 0; i < positions.length; i += 3) {
      colors[i] = 0.2;
      colors[i + 1] = 0.5;
      colors[i + 2] = 1.0;
    }

    waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const waveMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true
    });

    this.waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    this.waveMesh.rotation.x = -Math.PI / 2;
    scene.add(this.waveMesh);

    // 保存更新函数到场景
    scene.userData.update = () => this.updateVisualization(0.01, scene.userData.animationSpeed || 1.0);
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    if (this.waveMesh) {
      this.time += 0.01 * animationSpeed;
      const positions = this.waveMesh.geometry.attributes.position.array;
      const colors = this.waveMesh.geometry.attributes.color.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const distance = Math.sqrt(x * x + z * z);
        positions[i + 1] = Math.sin(distance - this.time * 2) * 0.5 * Math.exp(-distance * 0.1);

        // 根据振幅设置颜色
        const intensity = (positions[i + 1] + 0.5) / 1.0;
        colors[i] = 0.2 + intensity * 0.3;
        colors[i + 1] = 0.5 + intensity * 0.3;
        colors[i + 2] = 1.0;
      }

      this.waveMesh.geometry.attributes.position.needsUpdate = true;
      this.waveMesh.geometry.attributes.color.needsUpdate = true;
    }
  }

  cleanup(): void {
    this.waveMesh = null;
    this.time = 0;
  }
}
