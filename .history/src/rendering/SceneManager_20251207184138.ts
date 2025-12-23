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
    try {
      this.config = {
        autoUpdate: true,
        backgroundColor: new THREE.Color(VISUALIZATION_CONFIG.backgroundColor),
        enableMatrixAutoUpdate: false,
        ...config
      };

      this.scene = this.createScene();
    } catch (error) {
      console.error('SceneManager: Failed to initialize scene manager:', error);
      // 创建一个默认场景，确保实例仍然可用
      this.config = {
        autoUpdate: true,
        backgroundColor: new THREE.Color(0x000000),
        enableMatrixAutoUpdate: false
      };
      this.scene = new THREE.Scene();
    }
  }

  /**
   * 创建并配置场景
   */
  private createScene(): THREE.Scene {
    try {
      const scene = new THREE.Scene();
      (scene as any).autoUpdate = this.config.autoUpdate;
      scene.background = this.config.backgroundColor || null;
      scene.matrixAutoUpdate = this.config.enableMatrixAutoUpdate || false;

      return scene;
    } catch (error) {
      console.error('SceneManager: Failed to create scene:', error);
      // 返回一个默认场景，确保方法不会失败
      return new THREE.Scene();
    }
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
    try {
      // 输入验证
      if (!object || !(object instanceof THREE.Object3D)) {
        throw new Error('Invalid object: must be a THREE.Object3D instance');
      }
      
      // 优化：直接添加对象，避免O(n)的includes检查
      // THREE.Scene.add() 方法内部会处理重复添加的情况
      this.scene.add(object);
    } catch (error) {
      console.error('SceneManager: Failed to add object to scene:', error);
      // 可以选择重新抛出异常，让调用者处理
      // throw error;
    }
  }

  /**
   * 从场景移除对象
   */
  removeObject(object: THREE.Object3D): void {
    try {
      // 输入验证
      if (!object || !(object instanceof THREE.Object3D)) {
        throw new Error('Invalid object: must be a THREE.Object3D instance');
      }
      
      // 优化：直接移除对象，避免O(n)的includes检查
      // THREE.Scene.remove() 方法内部会处理不存在的情况
      this.scene.remove(object);
    } catch (error) {
      console.error('SceneManager: Failed to remove object from scene:', error);
    }
  }

  /**
   * 清理场景
   */
  clear(): void {
    try {
      // 优化：直接获取children数组的副本，避免while循环的性能问题
      const children = [...this.scene.children];
      for (const child of children) {
        this.scene.remove(child);
        this.disposeObject(child);
      }
    } catch (error) {
      console.error('SceneManager: Failed to clear scene:', error);
    }
  }

  /**
   * 递归释放对象资源
   */
  private disposeObject(object: THREE.Object3D): void {
    try {
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
    } catch (error) {
      console.error('SceneManager: Failed to dispose object:', error);
    }
  }

  /**
   * 释放材质资源
   */
  private disposeMaterial(material: THREE.Material): void {
    try {
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
    } catch (error) {
      console.error('SceneManager: Failed to dispose material:', error);
    }
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    try {
      // 输入验证
      if (typeof deltaTime !== 'number' || isNaN(deltaTime) || deltaTime < 0) {
        console.warn('SceneManager: Invalid deltaTime provided:', deltaTime);
        deltaTime = 0;
      }
      
      // 执行用户定义的更新函数
      if (this.scene.userData && typeof this.scene.userData.update === 'function') {
        this.scene.userData.update(deltaTime);
      }
    } catch (error) {
      console.error('SceneManager: Failed to update scene:', error);
    }
  }

  /**
   * 设置场景更新函数
   */
  setUpdateFunction(updateFn: (deltaTime: number) => void): void {
    try {
      // 输入验证
      if (typeof updateFn !== 'function') {
        throw new Error('Invalid update function: must be a function');
      }
      
      if (!this.scene.userData) {
        this.scene.userData = {};
      }
      this.scene.userData.update = updateFn;
    } catch (error) {
      console.error('SceneManager: Failed to set update function:', error);
    }
  }

  /**
   * 重置场景
   */
  reset(): void {
    try {
      this.clear();
      this.scene = this.createScene();
    } catch (error) {
      console.error('SceneManager: Failed to reset scene:', error);
    }
  }
}