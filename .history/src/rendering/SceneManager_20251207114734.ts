import * as THREE from 'three';
import { VISUALIZATION_CONFIG } from '../constants';

interface SceneManagerConfig {
  autoUpdate?: boolean;
  backgroundColor?: THREE.Color;
  enableMatrixAutoUpdate?: boolean;
}

export class SceneManager {
  private scene: THREE.Scene;
  private config: SceneManagerConfig;

  constructor(config: SceneManagerConfig = {}) {
    this.config = {
      autoUpdate: true,
      backgroundColor: new THREE.Color(VISUALIZATION_CONFIG.backgroundColor),
      enableMatrixAutoUpdate: false,
      ...config
    };

    this.scene = this.createScene();
  }

  /**
   * 创建并配置场景
   */
  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    (scene as any).autoUpdate = this.config.autoUpdate;
    scene.background = this.config.backgroundColor || null;
    scene.matrixAutoUpdate = this.config.enableMatrixAutoUpdate || false;

    return scene;
  }

  /**
   * 获取场景实例
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * 添加对象到场景
   */
  addObject(object: THREE.Object3D): void {
    if (!this.scene.children.includes(object)) {
      this.scene.add(object);
    }
  }

  /**
   * 从场景移除对象
   */
  removeObject(object: THREE.Object3D): void {
    if (this.scene.children.includes(object)) {
      this.scene.remove(object);
    }
  }

  /**
   * 清理场景
   */
  clear(): void {
    // 清理所有子对象
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.removeObject(child);
      this.disposeObject(child);
    }
  }

  /**
   * 递归释放对象资源
   */
  private disposeObject(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach(material => this.disposeMaterial(material));
      } else if (object.material) {
        this.disposeMaterial(object.material);
      }
    } else if (object instanceof THREE.Line || object instanceof THREE.Points) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) this.disposeMaterial(object.material);
    } else if (object instanceof THREE.SkinnedMesh) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) this.disposeMaterial(object.material);
      if (object.skeleton) object.skeleton.dispose();
    } else if (object instanceof THREE.Group || object instanceof THREE.Object3D) {
      // 递归处理子对象
      for (let i = object.children.length - 1; i >= 0; i--) {
        const child = object.children[i];
        this.disposeObject(child);
      }
    }
  }

  /**
   * 释放材质资源
   */
  private disposeMaterial(material: THREE.Material): void {
    // 使用类型断言处理不同材质类型的属性
    const typedMaterial = material as any;
    
    if (typedMaterial.map) typedMaterial.map.dispose();
    if (typedMaterial.lightMap) typedMaterial.lightMap.dispose();
    if (typedMaterial.normalMap) typedMaterial.normalMap.dispose();
    if (typedMaterial.specularMap) typedMaterial.specularMap.dispose();
    if (typedMaterial.envMap) typedMaterial.envMap.dispose();
    
    material.dispose();
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    // 执行用户定义的更新函数
    if (this.scene.userData && typeof this.scene.userData.update === 'function') {
      this.scene.userData.update(deltaTime);
    }

    // 自动更新场景中的动画对象
    if (this.scene.animations && this.scene.animations.length > 0) {
      this.scene.animations.forEach(animation => {
        if ('tracks' in animation && animation.tracks && animation.tracks.length > 0) {
          // 动画更新逻辑可以在这里添加
        }
      });
    }
  }

  /**
   * 设置场景更新函数
   */
  setUpdateFunction(updateFn: (deltaTime: number) => void): void {
    if (!this.scene.userData) {
      this.scene.userData = {};
    }
    this.scene.userData.update = updateFn;
  }

  /**
   * 重置场景
   */
  reset(): void {
    this.clear();
    this.scene = this.createScene();
  }
}