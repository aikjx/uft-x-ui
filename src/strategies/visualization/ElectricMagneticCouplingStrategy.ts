import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class ElectricMagneticCouplingStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建电场可视化
    const electricGeometry = new THREE.SphereGeometry(1, 32, 32);
    const electricMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true 
    });
    const electricSphere = new THREE.Mesh(electricGeometry, electricMaterial);
    scene.add(electricSphere);

    // 创建磁场可视化
    const magneticGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
    const magneticMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const magneticTorus = new THREE.Mesh(magneticGeometry, magneticMaterial);
    scene.add(magneticTorus);

    // 创建耦合常数Z的可视化
    const zGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const zMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00, 
      wireframe: true 
    });
    const zSphere = new THREE.Mesh(zGeometry, zMaterial);
    scene.add(zSphere);

    // 添加标签
    const epsilonLabel = this.createLabel('ε₀', 0xff6348);
    epsilonLabel.position.set(-2, 0, 0);
    scene.add(epsilonLabel);

    const cLabel = this.createLabel('c', 0x00ffff);
    cLabel.position.set(0, 2, 0);
    scene.add(cLabel);

    const zLabel = this.createLabel('Z = c/(8πε₀)', 0xffff00);
    zLabel.position.set(0, -2.5, 0);
    scene.add(zLabel);
  }

  private createLabel(text: string, color: number): THREE.Group {
    // 使用Canvas纹理创建文本标签
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `rgb(${(color >> 16) & 0xff}, ${(color >> 8) & 0xff}, ${color & 0xff})`;
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 16);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);

    const group = new THREE.Group();
    group.add(sprite);
    return group;
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    // 该可视化不需要动画更新
  }
}
