import * as THREE from 'three';

/**
 * 材质配置
 */
export interface MaterialConfig {
  type: 'basic' | 'phong' | 'lambert' | 'standard' | 'physical' | 'points' | 'line' | 'shadow';
  color?: number | string;
  transparent?: boolean;
  opacity?: number;
  blending?: THREE.Blending;
  depthTest?: boolean;
  depthWrite?: boolean;
  side?: THREE.Side;
  wireframe?: boolean;
  shininess?: number;
  emissive?: number | string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
}

/**
 * 材质系统
 */
export class MaterialSystem {
  private materials: Map<string, THREE.Material> = new Map();
  private materialConfigs: Map<string, MaterialConfig> = new Map();
  private defaultConfig: MaterialConfig = {
    type: 'standard',
    color: 0xffffff,
    transparent: false,
    opacity: 1,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
    side: THREE.FrontSide,
    wireframe: false,
    shininess: 30,
    emissive: 0x000000,
    emissiveIntensity: 1,
    metalness: 0.5,
    roughness: 0.5
  };

  /**
   * 创建或获取材质
   * @param id 材质ID
   * @param config 材质配置
   */
  getMaterial(id: string, config: Partial<MaterialConfig> = {}): THREE.Material {
    // 检查是否已有材质
    if (this.materials.has(id)) {
      return this.materials.get(id)!;
    }

    // 合并配置
    const materialConfig: MaterialConfig = {
      ...this.defaultConfig,
      ...config
    };

    // 保存配置
    this.materialConfigs.set(id, materialConfig);

    // 创建材质
    const material = this.createMaterial(materialConfig);
    
    // 保存材质
    this.materials.set(id, material);
    
    return material;
  }

  /**
   * 创建材质
   * @param config 材质配置
   */
  private createMaterial(config: MaterialConfig): THREE.Material {
    switch (config.type) {
      case 'basic':
        return new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          side: config.side,
          wireframe: config.wireframe
        });
      
      case 'phong':
        return new THREE.MeshPhongMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          side: config.side,
          wireframe: config.wireframe,
          shininess: config.shininess,
          emissive: config.emissive,
          emissiveIntensity: config.emissiveIntensity
        });
      
      case 'lambert':
        return new THREE.MeshLambertMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          side: config.side,
          wireframe: config.wireframe,
          emissive: config.emissive,
          emissiveIntensity: config.emissiveIntensity
        });
      
      case 'standard':
        return new THREE.MeshStandardMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          side: config.side,
          wireframe: config.wireframe,
          emissive: config.emissive,
          emissiveIntensity: config.emissiveIntensity,
          metalness: config.metalness,
          roughness: config.roughness
        });
      
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          side: config.side,
          wireframe: config.wireframe,
          emissive: config.emissive,
          emissiveIntensity: config.emissiveIntensity,
          metalness: config.metalness,
          roughness: config.roughness
        });
      
      case 'points':
        return new THREE.PointsMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          size: 1,
          sizeAttenuation: true,
          vertexColors: false
        });
      
      case 'line':
        return new THREE.LineBasicMaterial({
          color: config.color,
          transparent: config.transparent,
          opacity: config.opacity,
          blending: config.blending,
          depthTest: config.depthTest,
          depthWrite: config.depthWrite,
          linewidth: 1
        });
      
      case 'shadow':
        return new THREE.ShadowMaterial({
          transparent: true,
          opacity: 0.5
        });
      
      default:
        return new THREE.MeshStandardMaterial({
          color: config.color
        });
    }
  }

  /**
   * 更新材质
   * @param id 材质ID
   * @param config 材质配置
   */
  updateMaterial(id: string, config: Partial<MaterialConfig>): void {
    const material = this.materials.get(id);
    if (!material) return;

    const currentConfig = this.materialConfigs.get(id);
    if (!currentConfig) return;

    // 合并配置
    const newConfig: MaterialConfig = {
      ...currentConfig,
      ...config
    };

    // 更新配置
    this.materialConfigs.set(id, newConfig);

    // 更新材质属性
    this.updateMaterialProperties(material, newConfig);
  }

  /**
   * 更新材质属性
   * @param material 材质
   * @param config 材质配置
   */
  private updateMaterialProperties(material: THREE.Material, config: MaterialConfig): void {
    if ('color' in material && config.color) {
      (material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.MeshPhongMaterial).color.set(config.color);
    }

    if ('transparent' in material) {
      material.transparent = config.transparent!;
    }

    if ('opacity' in material) {
      material.opacity = config.opacity!;
    }

    material.blending = config.blending!;
    material.depthTest = config.depthTest!;
    material.depthWrite = config.depthWrite!;

    if ('side' in material) {
      material.side = config.side!;
    }

    if ('wireframe' in material) {
      material.wireframe = config.wireframe!;
    }

    // 更新特定材质类型的属性
    if (material instanceof THREE.MeshPhongMaterial) {
      if (config.shininess) material.shininess = config.shininess;
      if (config.emissive) material.emissive.set(config.emissive);
      if (config.emissiveIntensity !== undefined) material.emissiveIntensity = config.emissiveIntensity;
    }

    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
      if (config.emissive) material.emissive.set(config.emissive);
      if (config.emissiveIntensity !== undefined) material.emissiveIntensity = config.emissiveIntensity;
      if (config.metalness !== undefined) material.metalness = config.metalness;
      if (config.roughness !== undefined) material.roughness = config.roughness;
    }

    // 设置材质需要更新
    material.needsUpdate = true;
  }

  /**
   * 获取材质
   * @param id 材质ID
   */
  get(id: string): THREE.Material | undefined {
    return this.materials.get(id);
  }

  /**
   * 移除材质
   * @param id 材质ID
   */
  remove(id: string): void {
    const material = this.materials.get(id);
    if (material) {
      material.dispose();
      this.materials.delete(id);
      this.materialConfigs.delete(id);
    }
  }

  /**
   * 清理所有材质
   */
  dispose(): void {
    this.materials.forEach(material => {
      material.dispose();
    });
    this.materials.clear();
    this.materialConfigs.clear();
  }

  /**
   * 批量创建材质
   * @param materialsConfig 材质配置映射
   */
  batchCreate(materialsConfig: Record<string, MaterialConfig>): void {
    for (const [id, config] of Object.entries(materialsConfig)) {
      this.getMaterial(id, config);
    }
  }

  /**
   * 获取所有材质
   */
  getAll(): Map<string, THREE.Material> {
    return new Map(this.materials);
  }

  /**
   * 获取材质数量
   */
  getCount(): number {
    return this.materials.size;
  }
}
