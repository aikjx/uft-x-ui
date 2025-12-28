import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

export default class GravityLightSpeedStrategy implements VisualizationStrategy {
  createVisualization(scene: THREE.Scene, params?: any): void {
    // 创建引力场可视化
    const gravityGeometry = new THREE.SphereGeometry(1, 32, 32);
    const gravityMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0000ff, 
      wireframe: true 
    });
    const gravitySphere = new THREE.Mesh(gravityGeometry, gravityMaterial);
    scene.add(gravitySphere);

    // 创建光速可视化
    const lightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 32);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const lightCylinder = new THREE.Mesh(lightGeometry, lightMaterial);
    lightCylinder.rotation.z = Math.PI / 2;
    scene.add(lightCylinder);

    // 创建统一常数Z的可视化
    const zGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const zTorus = new THREE.Mesh(zGeometry, zMaterial);
    scene.add(zTorus);

    // 添加标签
    const gravityLabel = this.createLabel('G', 0xff6348);
    gravityLabel.position.set(-1.5, 0, 0);
    scene.add(gravityLabel);

    const lightLabel = this.createLabel('c', 0x00ffff);
    lightLabel.position.set(0, 1.5, 0);
    scene.add(lightLabel);

    const zLabel = this.createLabel('Z = Gc/2', 0xffffff);
    zLabel.position.set(0, -2, 0);
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
