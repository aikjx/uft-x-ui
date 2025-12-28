import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class NuclearForceStrategy implements VisualizationStrategy {
  private nucleus: THREE.Mesh | null = null;
  private nucleons: THREE.Mesh[] = [];
  private nuclearFieldLines: THREE.Line[] = [];

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建原子核
    const nucleusGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 });
    this.nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(this.nucleus);

    // 创建核子（质子/中子）
    const numNucleons = 8;

    for (let i = 0; i < numNucleons; i++) {
      const angle = (i / numNucleons) * Math.PI * 2;
      const distance = 1.2 + (i % 2) * 0.3;
      const x = distance * Math.cos(angle);
      const z = distance * Math.sin(angle);

      const nucleonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const nucleonMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x3742fa : 0x1dd1a1
      });
      const nucleon = new THREE.Mesh(nucleonGeometry, nucleonMaterial);
      nucleon.position.set(x, 0, z);
      scene.add(nucleon);
      this.nucleons.push(nucleon);
    }

    // 创建核力场线
    const numFieldLines = 12;

    for (let i = 0; i < numFieldLines; i++) {
      const angle = (i / numFieldLines) * Math.PI * 2;
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];

      for (let j = 1; j <= 20; j++) {
        const r = 0.8 + j * 0.1;
        // 核力的短程特性，距离增加时力迅速减小
        const forceStrength = Math.exp(-r * 0.5) * 2;
        const x = r * Math.cos(angle) * forceStrength;
        const y = r * Math.sin(angle * 2) * 0.3;
        const z = r * Math.sin(angle) * forceStrength;
        points.push(new THREE.Vector3(x, y, z));
      }

      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(fieldLine);
      this.nuclearFieldLines.push(fieldLine);
    }
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }

  cleanup(): void {
    this.nucleus = null;
    this.nucleons = [];
    this.nuclearFieldLines = [];
  }
}
