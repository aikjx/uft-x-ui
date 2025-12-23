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
    // 优化：直接添加对象，避免O(n)的includes检查
    // THREE.Scene.add() 方法内部会处理重复添加的情况
    this.scene.add(object);
  }

  /**
   * 从场景移除对象
   */
  removeObject(object: THREE.Object3D): void {
    // 优化：直接移除对象，避免O(n)的includes检查
    // THREE.Scene.remove() 方法内部会处理不存在的情况
    this.scene.remove(object);
  }

  /**
   * 清理场景
   */
  clear(): void {
    // 优化：直接获取children数组的副本，避免while循环的性能问题
    const children = [...this.scene.children];
    for (const child of children) {
      this.scene.remove(child);
      this.disposeObject(child);
    }
  }

  /**
   * 递归释放对象资源
   */
  private disposeObject(object: THREE.Object3D): void {
    // 优化：先处理子对象，再处理当前对象
    // 遍历子对象，使用for循环替代递归，避免栈溢出
    const objectsToDispose: THREE.Object3D[] = [object];
    
    while (objectsToDispose.length > 0) {
      const currentObject = objectsToDispose.pop()!;
      
      // 先将子对象添加到处理队列
      for (let i = currentObject.children.length - 1; i >= 0; i--) {
        objectsToDispose.push(currentObject.children[i]);
      }
      
      // 处理当前对象
      if (currentObject instanceof THREE.Mesh || 
          currentObject instanceof THREE.Line || 
          currentObject instanceof THREE.Points) {
        
        // 释放几何体
        if (currentObject.geometry) {
          currentObject.geometry.dispose();
        }
        
        // 释放材质
        if (Array.isArray(currentObject.material)) {
          currentObject.material.forEach(material => this.disposeMaterial(material));
        } else if (currentObject.material) {
          this.disposeMaterial(currentObject.material);
        }
      } 
      
      // 处理骨骼网格
      if (currentObject instanceof THREE.SkinnedMesh) {
        if (currentObject.skeleton) {
          currentObject.skeleton.dispose();
        }
      }
    }
  }

  /**
   * 释放材质资源
   */
  private disposeMaterial(material: THREE.Material): void {
    // 优化：处理更多材质属性，确保资源完全释放
    const typedMaterial = material as any;
    
    // 基础贴图
    if (typedMaterial.map) { typedMaterial.map.dispose(); typedMaterial.map = null; }
    if (typedMaterial.lightMap) { typedMaterial.lightMap.dispose(); typedMaterial.lightMap = null; }
    if (typedMaterial.normalMap) { typedMaterial.normalMap.dispose(); typedMaterial.normalMap = null; }
    if (typedMaterial.specularMap) { typedMaterial.specularMap.dispose(); typedMaterial.specularMap = null; }
    if (typedMaterial.envMap) { typedMaterial.envMap.dispose(); typedMaterial.envMap = null; }
    
    // 高级贴图
    if (typedMaterial.aoMap) { typedMaterial.aoMap.dispose(); typedMaterial.aoMap = null; }
    if (typedMaterial.displacementMap) { typedMaterial.displacementMap.dispose(); typedMaterial.displacementMap = null; }
    if (typedMaterial.roughnessMap) { typedMaterial.roughnessMap.dispose(); typedMaterial.roughnessMap = null; }
    if (typedMaterial.metalnessMap) { typedMaterial.metalnessMap.dispose(); typedMaterial.metalnessMap = null; }
    if (typedMaterial.alphaMap) { typedMaterial.alphaMap.dispose(); typedMaterial.alphaMap = null; }
    if (typedMaterial.emissiveMap) { typedMaterial.emissiveMap.dispose(); typedMaterial.emissiveMap = null; }
    if (typedMaterial.bumpMap) { typedMaterial.bumpMap.dispose(); typedMaterial.bumpMap = null; }
    if (typedMaterial.gradientMap) { typedMaterial.gradientMap.dispose(); typedMaterial.gradientMap = null; }
    
    // 释放材质
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