import * as THREE from 'three';
import { SceneGraph } from './SceneGraph';

/**
 * 网格配置
 */
export interface MeshConfig {
  geometry: THREE.BufferGeometry | THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
}

/**
 * 网格管理器
 */
export class MeshManager {
  private meshes: Map<string, THREE.Mesh | THREE.Points | THREE.Line> = new Map();
  private sceneGraph: SceneGraph;

  /**
   * 构造函数
   * @param sceneGraph 场景图
   */
  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }

  /**
   * 创建网格
   * @param id 网格ID
   * @param config 网格配置
   * @param parentId 父节点ID
   */
  createMesh(id: string, config: MeshConfig, parentId?: string): THREE.Mesh | THREE.Points | THREE.Line {
    let mesh: THREE.Mesh | THREE.Points | THREE.Line;

    // 根据材质类型创建不同类型的网格
    if (config.material instanceof THREE.PointsMaterial) {
      mesh = new THREE.Points(config.geometry, config.material);
    } else if (config.material instanceof THREE.LineBasicMaterial || config.material instanceof THREE.LineDashedMaterial) {
      mesh = new THREE.Line(config.geometry, config.material);
    } else {
      mesh = new THREE.Mesh(config.geometry, config.material);
    }

    // 设置网格属性
    this.setMeshProperties(mesh, config);

    // 添加到场景图
    this.sceneGraph.addNode(id, mesh, parentId);

    // 保存网格
    this.meshes.set(id, mesh);

    return mesh;
  }

  /**
   * 设置网格属性
   * @param mesh 网格
   * @param config 网格配置
   */
  private setMeshProperties(mesh: THREE.Mesh | THREE.Points | THREE.Line, config: MeshConfig): void {
    // 设置位置
    if (config.position) {
      mesh.position.copy(config.position);
    }

    // 设置旋转
    if (config.rotation) {
      mesh.rotation.copy(config.rotation);
    }

    // 设置缩放
    if (config.scale) {
      mesh.scale.copy(config.scale);
    }

    // 设置阴影属性
    if ('castShadow' in mesh) {
      mesh.castShadow = config.castShadow !== undefined ? config.castShadow : false;
      mesh.receiveShadow = config.receiveShadow !== undefined ? config.receiveShadow : false;
    }

    // 设置可见性
    mesh.visible = config.visible !== undefined ? config.visible : true;
  }

  /**
   * 获取网格
   * @param id 网格ID
   */
  getMesh(id: string): THREE.Mesh | THREE.Points | THREE.Line | undefined {
    return this.meshes.get(id);
  }

  /**
   * 更新网格
   * @param id 网格ID
   * @param config 网格配置
   */
  updateMesh(id: string, config: Partial<MeshConfig>): void {
    const mesh = this.meshes.get(id);
    if (!mesh) return;

    // 更新位置
    if (config.position) {
      mesh.position.copy(config.position);
    }

    // 更新旋转
    if (config.rotation) {
      mesh.rotation.copy(config.rotation);
    }

    // 更新缩放
    if (config.scale) {
      mesh.scale.copy(config.scale);
    }

    // 更新可见性
    if (config.visible !== undefined) {
      mesh.visible = config.visible;
    }

    // 更新材质
    if (config.material) {
      if ('material' in mesh) {
        mesh.material = config.material;
      }
    }

    // 更新几何体
    if (config.geometry) {
      if ('geometry' in mesh) {
        mesh.geometry = config.geometry;
      }
    }

    // 更新阴影属性
    if ('castShadow' in mesh) {
      if (config.castShadow !== undefined) {
        mesh.castShadow = config.castShadow;
      }
      if (config.receiveShadow !== undefined) {
        mesh.receiveShadow = config.receiveShadow;
      }
    }
  }

  /**
   * 删除网格
   * @param id 网格ID
   */
  removeMesh(id: string): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      // 从场景图移除
      this.sceneGraph.removeNode(id);

      // 清理资源
      this.disposeMesh(mesh);

      // 从映射中移除
      this.meshes.delete(id);
    }
  }

  /**
   * 清理网格资源
   * @param mesh 网格
   */
  private disposeMesh(mesh: THREE.Mesh | THREE.Points | THREE.Line): void {
    // 清理几何体
    if ('geometry' in mesh) {
      mesh.geometry.dispose();
    }

    // 清理材质
    if ('material' in mesh) {
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach(m => m.dispose());
      } else {
        material.dispose();
      }
    }
  }

  /**
   * 批量创建网格
   * @param meshesConfig 网格配置映射
   * @param parentId 父节点ID
   */
  batchCreateMeshes(meshesConfig: Record<string, MeshConfig>, parentId?: string): void {
    for (const [id, config] of Object.entries(meshesConfig)) {
      this.createMesh(id, config, parentId);
    }
  }

  /**
   * 批量删除网格
   * @param ids 网格ID数组
   */
  batchRemoveMeshes(ids: string[]): void {
    ids.forEach(id => {
      this.removeMesh(id);
    });
  }

  /**
   * 获取所有网格
   */
  getAllMeshes(): Map<string, THREE.Mesh | THREE.Points | THREE.Line> {
    return new Map(this.meshes);
  }

  /**
   * 获取网格数量
   */
  getMeshCount(): number {
    return this.meshes.size;
  }

  /**
   * 清理所有网格
   */
  dispose(): void {
    this.meshes.forEach(mesh => {
      this.disposeMesh(mesh);
    });
    this.meshes.clear();
  }

  /**
   * 显示所有网格
   */
  showAllMeshes(): void {
    this.meshes.forEach(mesh => {
      mesh.visible = true;
    });
  }

  /**
   * 隐藏所有网格
   */
  hideAllMeshes(): void {
    this.meshes.forEach(mesh => {
      mesh.visible = false;
    });
  }

  /**
   * 显示特定网格
   * @param id 网格ID
   */
  showMesh(id: string): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      mesh.visible = true;
    }
  }

  /**
   * 隐藏特定网格
   * @param id 网格ID
   */
  hideMesh(id: string): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      mesh.visible = false;
    }
  }

  /**
   * 更新网格材质
   * @param id 网格ID
   * @param material 材质
   */
  updateMeshMaterial(id: string, material: THREE.Material | THREE.Material[]): void {
    const mesh = this.meshes.get(id);
    if (mesh && 'material' in mesh) {
      mesh.material = material;
    }
  }

  /**
   * 更新网格几何体
   * @param id 网格ID
   * @param geometry 几何体
   */
  updateMeshGeometry(id: string, geometry: THREE.BufferGeometry | THREE.BufferGeometry): void {
    const mesh = this.meshes.get(id);
    if (mesh && 'geometry' in mesh) {
      // 先清理旧几何体
      mesh.geometry.dispose();
      mesh.geometry = geometry;
    }
  }

  /**
   * 设置网格位置
   * @param id 网格ID
   * @param position 位置
   */
  setMeshPosition(id: string, position: THREE.Vector3): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      mesh.position.copy(position);
    }
  }

  /**
   * 设置网格旋转
   * @param id 网格ID
   * @param rotation 旋转
   */
  setMeshRotation(id: string, rotation: THREE.Euler): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      mesh.rotation.copy(rotation);
    }
  }

  /**
   * 设置网格缩放
   * @param id 网格ID
   * @param scale 缩放
   */
  setMeshScale(id: string, scale: THREE.Vector3): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      mesh.scale.copy(scale);
    }
  }
}
