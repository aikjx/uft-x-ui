import * as THREE from 'three'

/**
 * 场景图节点
 */
export class SceneNode {
  private object: THREE.Object3D
  private children: SceneNode[] = []
  private parent: SceneNode | null = null
  private updateCallback: ((deltaTime: number) => void) | null = null

  /**
   * 构造函数
   * @param object Three.js对象
   */
  constructor(object: THREE.Object3D) {
    this.object = object
  }

  /**
   * 获取Three.js对象
   */
  getObject(): THREE.Object3D {
    return this.object
  }

  /**
   * 添加子节点
   * @param child 子节点
   */
  addChild(child: SceneNode): void {
    this.children.push(child)
    this.object.add(child.getObject())
    child.parent = this
  }

  /**
   * 移除子节点
   * @param child 子节点
   */
  removeChild(child: SceneNode): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      this.object.remove(child.getObject())
      child.parent = null
    }
  }

  /**
   * 获取子节点
   */
  getChildren(): SceneNode[] {
    return [...this.children]
  }

  /**
   * 获取父节点
   */
  getParent(): SceneNode | null {
    return this.parent
  }

  /**
   * 设置位置
   * @param x X坐标
   * @param y Y坐标
   * @param z Z坐标
   */
  setPosition(x: number, y: number, z: number): void {
    this.object.position.set(x, y, z)
  }

  /**
   * 设置旋转
   * @param x X轴旋转
   * @param y Y轴旋转
   * @param z Z轴旋转
   */
  setRotation(x: number, y: number, z: number): void {
    this.object.rotation.set(x, y, z)
  }

  /**
   * 设置缩放
   * @param x X轴缩放
   * @param y Y轴缩放
   * @param z Z轴缩放
   */
  setScale(x: number, y: number, z: number): void {
    this.object.scale.set(x, y, z)
  }

  /**
   * 设置更新回调
   * @param callback 更新回调函数
   */
  setUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback
  }

  /**
   * 更新节点
   * @param deltaTime 时间增量
   */
  update(deltaTime: number): void {
    // 调用更新回调
    if (this.updateCallback) {
      this.updateCallback(deltaTime)
    }

    // 更新子节点
    this.children.forEach(child => {
      child.update(deltaTime)
    })
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理子节点
    this.children.forEach(child => {
      child.dispose()
    })
    this.children = []

    // 清理Three.js对象
    const mesh = this.object as THREE.Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      } else {
        mesh.material.dispose()
      }
    }
  }
}

/**
 * 场景图管理类
 */
export class SceneGraph {
  private root: SceneNode
  private nodes: Map<string, SceneNode> = new Map()

  /**
   * 构造函数
   */
  constructor() {
    // 创建根场景节点
    const scene = new THREE.Scene()
    this.root = new SceneNode(scene)
  }

  /**
   * 获取根节点
   */
  getRoot(): THREE.Object3D {
    return this.root.getObject()
  }

  /**
   * 获取根场景节点
   */
  getRootNode(): SceneNode {
    return this.root
  }

  /**
   * 添加节点
   * @param id 节点ID
   * @param object Three.js对象
   * @param parentId 父节点ID
   */
  addNode(id: string, object: THREE.Object3D, parentId?: string): SceneNode {
    // 创建场景节点
    const node = new SceneNode(object)

    // 添加到节点映射
    this.nodes.set(id, node)

    // 添加到父节点
    if (parentId) {
      const parent = this.nodes.get(parentId)
      if (parent) {
        parent.addChild(node)
      } else {
        // 如果父节点不存在，添加到根节点
        this.root.addChild(node)
      }
    } else {
      // 默认添加到根节点
      this.root.addChild(node)
    }

    return node
  }

  /**
   * 获取节点
   * @param id 节点ID
   */
  getNode(id: string): SceneNode | undefined {
    return this.nodes.get(id)
  }

  /**
   * 移除节点
   * @param id 节点ID
   */
  removeNode(id: string): void {
    const node = this.nodes.get(id)
    if (node) {
      // 从父节点移除
      const parent = node.getParent()
      if (parent) {
        parent.removeChild(node)
      }

      // 从节点映射移除
      this.nodes.delete(id)

      // 清理节点
      node.dispose()
    }
  }

  /**
   * 查找节点
   * @param predicate 查找条件
   */
  findNode(predicate: (node: SceneNode) => boolean): SceneNode | undefined {
    // 深度优先搜索
    const search = (node: SceneNode): SceneNode | undefined => {
      if (predicate(node)) {
        return node
      }

      for (const child of node.getChildren()) {
        const result = search(child)
        if (result) {
          return result
        }
      }

      return undefined
    }

    return search(this.root)
  }

  /**
   * 更新场景图
   * @param deltaTime 时间增量
   */
  update(deltaTime: number): void {
    this.root.update(deltaTime)
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.root.dispose()
    this.nodes.clear()
  }
}
