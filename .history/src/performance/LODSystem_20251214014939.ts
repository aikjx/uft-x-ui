/**
 * 📊 LOD（Level of Detail）系统
 * 实现多级细节管理，根据距离和性能自动调整对象的复杂度
 */

import * as THREE from 'three';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';
import { VISUALIZATION_CONFIG } from '../constants';

/**
 * LOD级别配置
 */
export interface LODLevel {
  distance: number;    // 触发距离
  quality: number;     // 质量级别 (0-1)
  geometry?: THREE.BufferGeometry | null; // 可选的低分辨率几何体
  material?: THREE.Material | null;       // 可选的低分辨率材质
  particleCount?: number;  // 粒子数量
  shadowQuality?: number;  // 阴影质量
  textureResolution?: number;  // 纹理分辨率
  renderScale?: number;  // 渲染缩放
}

/**
 * LOD对象配置
 */
export interface LODObjectConfig {
  baseGeometry: THREE.BufferGeometry | THREE.Geometry;
  baseMaterial: THREE.Material | THREE.Material[];
  levels: LODLevel[];
  name?: string;
  autoGenerateLevels?: boolean;
  maxLODLevels?: number;
}

/**
 * LOD对象
 */
export class LODObject {
  private object: THREE.Group;
  private baseGeometry: THREE.BufferGeometry | THREE.Geometry;
  private baseMaterial: THREE.Material | THREE.Material[];
  private lodLevels: LODLevel[];
  private instances: Map<number, THREE.Mesh | THREE.Points> = new Map();
  private currentLevel: number = 0;
  private isVisible: boolean = true;
  private name: string;

  constructor(config: LODObjectConfig) {
    this.name = config.name || `lod-object-${Math.random().toString(36).substr(2, 9)}`;
    this.baseGeometry = config.baseGeometry;
    this.baseMaterial = config.baseMaterial;
    
    // 如果需要自动生成LOD级别
    if (config.autoGenerateLevels) {
      this.lodLevels = this.generateAutoLevels(config);
    } else {
      this.lodLevels = config.levels.sort((a, b) => a.distance - b.distance);
    }

    // 创建基础组
    this.object = new THREE.Group();
    this.object.name = this.name;
    
    // 创建不同LOD级别的实例
    this.createLODInstances();
  }

  /**
   * 自动生成LOD级别
   */
  private generateAutoLevels(config: LODObjectConfig): LODLevel[] {
    const levels: LODLevel[] = [];
    const maxLevels = config.maxLODLevels || VISUALIZATION_CONFIG.performance.lodLevels;
    const maxDistance = VISUALIZATION_CONFIG.maxCameraDistance;
    const distanceStep = maxDistance / maxLevels;

    for (let i = 0; i < maxLevels; i++) {
      const distance = i * distanceStep;
      const quality = 1 - (i / maxLevels);
      
      levels.push({
        distance,
        quality,
        particleCount: Math.max(100, Math.floor(10000 * quality)),
        shadowQuality: Math.max(0, Math.floor(100 * quality)),
        textureResolution: Math.max(512, Math.floor(4096 * quality)),
        renderScale: Math.max(0.5, quality)
      });
    }

    return levels;
  }

  /**
   * 创建不同LOD级别的实例
   */
  private createLODInstances(): void {
    this.lodLevels.forEach((level, index) => {
      let instance: THREE.Mesh | THREE.Points;
      
      // 如果有自定义几何体和材质，使用它们
      if (level.geometry && level.material) {
        instance = new THREE.Mesh(level.geometry, level.material);
      } else {
        // 否则创建简化版本
        instance = this.createSimplifiedInstance(level.quality);
      }
      
      instance.visible = index === 0; // 只显示最高质量的实例
      this.instances.set(index, instance);
      this.object.add(instance);
    });
  }

  /**
   * 创建简化的实例
   */
  private createSimplifiedInstance(quality: number): THREE.Mesh {
    // 这里可以根据quality参数创建简化版本
    // 例如：简化几何体、减少纹理分辨率、简化材质等
    const geometry = this.baseGeometry.clone();
    const material = Array.isArray(this.baseMaterial) 
      ? this.baseMaterial.map(m => m.clone()) 
      : (this.baseMaterial as THREE.Material).clone();
    
    // 根据质量调整几何体
    if (geometry instanceof THREE.BufferGeometry) {
      // 可以在这里实现几何体简化算法
      // 例如：减少顶点数量、简化UV等
    }
    
    // 根据质量调整材质
    if (Array.isArray(material)) {
      material.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.metalnessMap = quality > 0.5 ? (m as any).metalnessMap : null;
          m.roughnessMap = quality > 0.5 ? (m as any).roughnessMap : null;
          m.normalMap = quality > 0.5 ? (m as any).normalMap : null;
          m.displacementMap = quality > 0.7 ? (m as any).displacementMap : null;
        }
      });
    } else {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.metalnessMap = quality > 0.5 ? (material as any).metalnessMap : null;
        material.roughnessMap = quality > 0.5 ? (material as any).roughnessMap : null;
        material.normalMap = quality > 0.5 ? (material as any).normalMap : null;
        material.displacementMap = quality > 0.7 ? (material as any).displacementMap : null;
      }
    }
    
    return new THREE.Mesh(geometry, material);
  }

  /**
   * 更新LOD级别
   */
  public updateLOD(distance: number): void {
    let newLevel = 0;
    
    // 找到合适的LOD级别
    for (let i = 0; i < this.lodLevels.length; i++) {
      if (distance > this.lodLevels[i].distance) {
        newLevel = i;
      } else {
        break;
      }
    }
    
    // 如果级别变化，切换实例
    if (newLevel !== this.currentLevel) {
      // 隐藏当前实例
      const currentInstance = this.instances.get(this.currentLevel);
      if (currentInstance) {
        currentInstance.visible = false;
      }
      
      // 显示新实例
      const newInstance = this.instances.get(newLevel);
      if (newInstance) {
        newInstance.visible = true;
      }
      
      this.currentLevel = newLevel;
      
      // 发布LOD级别变化事件
      eventSystem.emit(APP_EVENTS.LOD_LEVEL_CHANGED, {
        objectName: this.name,
        oldLevel: this.currentLevel,
        newLevel: newLevel,
        quality: this.lodLevels[newLevel].quality
      });
    }
  }

  /**
   * 获取当前LOD级别
   */
  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * 获取当前LOD质量
   */
  public getCurrentQuality(): number {
    return this.lodLevels[this.currentLevel].quality;
  }

  /**
   * 获取THREE对象
   */
  public getObject(): THREE.Group {
    return this.object;
  }

  /**
   * 设置可见性
   */
  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.object.visible = visible;
  }

  /**
   * 获取可见性
   */
  public isObjectVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 更新位置
   */
  public setPosition(x: number, y: number, z: number): void {
    this.object.position.set(x, y, z);
  }

  /**
   * 更新旋转
   */
  public setRotation(x: number, y: number, z: number): void {
    this.object.rotation.set(x, y, z);
  }

  /**
   * 更新缩放
   */
  public setScale(x: number, y: number, z: number): void {
    this.object.scale.set(x, y, z);
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    // 清理所有实例
    this.instances.forEach(instance => {
      instance.geometry.dispose();
      if (Array.isArray(instance.material)) {
        instance.material.forEach(m => m.dispose());
      } else {
        instance.material.dispose();
      }
    });
    this.instances.clear();
    
    // 清理基础资源
    this.baseGeometry.dispose();
    if (Array.isArray(this.baseMaterial)) {
      this.baseMaterial.forEach(m => m.dispose());
    } else {
      this.baseMaterial.dispose();
    }
  }
}

/**
 * LOD系统管理器
 */
export class LODSystem {
  private lodObjects: Map<string, LODObject> = new Map();
  private camera: THREE.Camera | null = null;
  private isEnabled: boolean = true;
  private updateInterval: number = 100; // 更新间隔（毫秒）
  private lastUpdateTime: number = 0;

  constructor() {
    // 监听相机变化事件
    eventSystem.on(APP_EVENTS.CAMERA_POSITION_CHANGED, (data) => {
      this.updateLOD();
    });
  }

  /**
   * 添加LOD对象
   */
  public addObject(config: LODObjectConfig): LODObject {
    const lodObject = new LODObject(config);
    this.lodObjects.set(lodObject.getObject().uuid, lodObject);
    return lodObject;
  }

  /**
   * 移除LOD对象
   */
  public removeObject(uuid: string): void {
    const lodObject = this.lodObjects.get(uuid);
    if (lodObject) {
      lodObject.dispose();
      this.lodObjects.delete(uuid);
    }
  }

  /**
   * 设置相机
   */
  public setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /**
   * 更新所有LOD对象
   */
  public updateLOD(): void {
    if (!this.camera || !this.isEnabled) return;
    
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return; // 限制更新频率
    }
    this.lastUpdateTime = now;
    
    // 更新所有LOD对象
    this.lodObjects.forEach(lodObject => {
      const object = lodObject.getObject();
      const distance = this.camera!.position.distanceTo(object.position);
      lodObject.updateLOD(distance);
    });
  }

  /**
   * 启用/禁用LOD系统
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 获取LOD系统状态
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 设置更新间隔
   */
  public setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }

  /**
   * 获取LOD对象数量
   */
  public getObjectCount(): number {
    return this.lodObjects.size;
  }

  /**
   * 清理所有资源
   */
  public dispose(): void {
    this.lodObjects.forEach(lodObject => {
      lodObject.dispose();
    });
    this.lodObjects.clear();
  }

  /**
   * 批量生成LOD对象
   */
  public batchGenerateLODObjects(
    baseGeometry: THREE.BufferGeometry | THREE.Geometry,
    baseMaterial: THREE.Material | THREE.Material[],
    positions: Array<{ x: number; y: number; z: number }>,
    autoGenerateLevels: boolean = true
  ): LODObject[] {
    const lodObjects: LODObject[] = [];
    
    positions.forEach((position, index) => {
      const lodObject = this.addObject({
        baseGeometry,
        baseMaterial,
        levels: [],
        autoGenerateLevels,
        name: `batch-object-${index}`
      });
      lodObject.setPosition(position.x, position.y, position.z);
      lodObjects.push(lodObject);
    });
    
    return lodObjects;
  }
}

/**
 * 自动生成LOD几何体
 * @param geometry 原始几何体
 * @param quality 质量级别 (0-1)
 * @returns 简化后的几何体
 */
export function generateLODGeometry(
  geometry: THREE.BufferGeometry | THREE.Geometry,
  quality: number
): THREE.BufferGeometry {
  let simplifiedGeometry: THREE.BufferGeometry;
  
  if (geometry instanceof THREE.Geometry) {
    simplifiedGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
  } else {
    simplifiedGeometry = geometry.clone();
  }
  
  // 根据质量级别简化几何体
  // 这里可以实现更复杂的简化算法，如边折叠、顶点聚类等
  if (quality < 0.5) {
    // 低质量：减少顶点数量
    // 注意：这里只是示例，实际项目中需要实现更复杂的简化算法
    const positionAttribute = simplifiedGeometry.attributes.position;
    if (positionAttribute) {
      const originalCount = positionAttribute.count;
      const targetCount = Math.floor(originalCount * quality);
      
      if (targetCount < originalCount) {
        // 这里应该实现顶点简化
        // 例如：每N个顶点保留一个
        const step = Math.ceil(originalCount / targetCount);
        const newPositions = [];
        
        for (let i = 0; i < originalCount; i += step) {
          newPositions.push(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          );
        }
        
        simplifiedGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(newPositions, 3)
        );
      }
    }
  }
  
  simplifiedGeometry.computeVertexNormals();
  simplifiedGeometry.computeBoundingSphere();
  simplifiedGeometry.computeBoundingBox();
  
  return simplifiedGeometry;
}

// 创建LOD系统单例
export const lodSystem = new LODSystem();
