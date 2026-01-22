// 统一场论可视化系统 - 网络可视化
// 版本: v2.0
// 功能: 可视化网络数据流和连接

import { Vector3, Vector4, LineBasicMaterial, Geometry, Line, Mesh, MeshBasicMaterial, SphereGeometry, Scene, Camera } from 'three';

export class NetworkVisualization {
  private scene: Scene;
  private camera: Camera;
  private connections: Map<string, any> = new Map();
  private nodes: Map<string, any> = new Map();
  private maxNodes: number = 1000;
  private maxConnections: number = 5000;
  private useDynamicColoring: boolean = true;
  private enableParticleEffects: boolean = true;
  private particleSystem: any = null;
  private connectionGeometry: Geometry = new Geometry();
  private connectionMaterial: LineBasicMaterial = new LineBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5
  });
  private nodeGeometry: SphereGeometry = new SphereGeometry(0.1, 8, 8);
  private nodeMaterial: MeshBasicMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  private connectionLine: Line | null = null;
  private dataFlowSpeed: number = 1.0;
  private connectionLifetime: number = 5000; // 5秒
  private nodeLifetime: number = 10000; // 10秒

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    console.log('🌐 网络可视化系统初始化');
    this.init();
  }

  private init(): void {
    this.initParticleSystem();
    this.initConnectionLine();
  }

  private initParticleSystem(): void {
    // 初始化粒子系统
    if (this.enableParticleEffects) {
      console.log('✨ 粒子系统初始化');
      // 这里可以实现粒子系统
    }
  }

  private initConnectionLine(): void {
    // 初始化连接线条
    this.connectionLine = new Line(this.connectionGeometry, this.connectionMaterial);
    this.scene.add(this.connectionLine);
  }

  public addNode(id: string, position: Vector3, data: any = {}): void {
    if (this.nodes.size >= this.maxNodes) {
      // 移除最旧的节点
      const oldestNode = this.getOldestNode();
      if (oldestNode) {
        this.removeNode(oldestNode);
      }
    }

    // 创建节点
    const node = {
      id,
      position,
      data,
      mesh: null,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    // 创建3D模型
    const mesh = new Mesh(this.nodeGeometry, this.nodeMaterial);
    mesh.position.copy(position);
    mesh.scale.set(0.1, 0.1, 0.1);
    this.scene.add(mesh);
    node.mesh = mesh;

    this.nodes.set(id, node);
    console.log(`📌 添加节点: ${id} at (${position.x}, ${position.y}, ${position.z})`);
  }

  public removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      // 移除3D模型
      if (node.mesh) {
        this.scene.remove(node.mesh);
      }

      // 移除相关连接
      this.removeNodeConnections(id);

      this.nodes.delete(id);
      console.log(`❌ 移除节点: ${id}`);
    }
  }

  public addConnection(sourceId: string, targetId: string, data: any = {}): void {
    if (this.connections.size >= this.maxConnections) {
      // 移除最旧的连接
      const oldestConnection = this.getOldestConnection();
      if (oldestConnection) {
        this.removeConnection(oldestConnection);
      }
    }

    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);

    if (!sourceNode || !targetNode) {
      console.warn('⚠️  源节点或目标节点不存在，跳过添加连接');
      return;
    }

    // 创建连接
    const connectionId = `${sourceId}-${targetId}`;
    const connection = {
      id: connectionId,
      sourceId,
      targetId,
      data,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      strength: 1.0
    };

    this.connections.set(connectionId, connection);
    console.log(`🔗 添加连接: ${sourceId} -> ${targetId}`);

    // 更新连接几何
    this.updateConnectionGeometry();
  }

  public removeConnection(id: string): void {
    this.connections.delete(id);
    console.log(`❌ 移除连接: ${id}`);

    // 更新连接几何
    this.updateConnectionGeometry();
  }

  public updateNode(id: string, position: Vector3, data: any = {}): void {
    const node = this.nodes.get(id);
    if (node) {
      // 更新位置
      node.position.copy(position);
      if (node.mesh) {
        node.mesh.position.copy(position);
      }

      // 更新数据
      node.data = { ...node.data, ...data };
      node.lastUpdated = Date.now();

      console.log(`🔄 更新节点: ${id}`);
    }
  }

  public updateConnection(sourceId: string, targetId: string, data: any = {}): void {
    const connectionId = `${sourceId}-${targetId}`;
    const connection = this.connections.get(connectionId);
    if (connection) {
      // 更新数据
      connection.data = { ...connection.data, ...data };
      connection.lastUpdated = Date.now();
      connection.strength = Math.min(connection.strength + 0.1, 1.0);

      console.log(`🔄 更新连接: ${sourceId} -> ${targetId}`);
    }
  }

  public update(deltaTime: number): void {
    // 更新节点
    this.updateNodes(deltaTime);

    // 更新连接
    this.updateConnections(deltaTime);

    // 更新粒子效果
    if (this.enableParticleEffects) {
      this.updateParticleEffects(deltaTime);
    }

    // 清理过期的节点和连接
    this.cleanupExpiredItems();
  }

  private updateNodes(deltaTime: number): void {
    this.nodes.forEach((node) => {
      // 更新节点视觉效果
      if (node.mesh) {
        // 动态颜色
        if (this.useDynamicColoring) {
          const age = Date.now() - node.createdAt;
          const normalizedAge = Math.min(age / this.nodeLifetime, 1);
          const color = new Vector4(1 - normalizedAge, normalizedAge, 0, 1 - normalizedAge);
          node.mesh.material.color.setRGB(color.x, color.y, color.z);
          node.mesh.material.opacity = 0.8 * (1 - normalizedAge);
        }

        // 轻微动画
        node.mesh.position.y += Math.sin(Date.now() * 0.001) * 0.01;
      }
    });
  }

  private updateConnections(deltaTime: number): void {
    this.connections.forEach((connection) => {
      // 更新连接强度
      connection.strength = Math.max(connection.strength - 0.01, 0.1);

      // 更新连接视觉效果
      if (this.useDynamicColoring) {
        const age = Date.now() - connection.createdAt;
        const normalizedAge = Math.min(age / this.connectionLifetime, 1);
        // 这里可以更新连接的颜色和透明度
      }
    });

    // 更新连接几何
    this.updateConnectionGeometry();
  }

  private updateConnectionGeometry(): void {
    // 清空几何
    this.connectionGeometry.vertices = [];

    // 添加连接顶点
    this.connections.forEach((connection) => {
      const sourceNode = this.nodes.get(connection.sourceId);
      const targetNode = this.nodes.get(connection.targetId);

      if (sourceNode && targetNode) {
        this.connectionGeometry.vertices.push(sourceNode.position);
        this.connectionGeometry.vertices.push(targetNode.position);
      }
    });

    // 更新几何
    this.connectionGeometry.verticesNeedUpdate = true;
  }

  private updateParticleEffects(deltaTime: number): void {
    // 更新粒子效果
    // 这里可以实现粒子效果的更新
  }

  private cleanupExpiredItems(): void {
    const currentTime = Date.now();

    // 清理过期的节点
    this.nodes.forEach((node, id) => {
      if (currentTime - node.createdAt > this.nodeLifetime) {
        this.removeNode(id);
      }
    });

    // 清理过期的连接
    this.connections.forEach((connection, id) => {
      if (currentTime - connection.createdAt > this.connectionLifetime) {
        this.removeConnection(id);
      }
    });
  }

  private getOldestNode(): string | null {
    let oldestNodeId: string | null = null;
    let oldestTime = Date.now();

    this.nodes.forEach((node, id) => {
      if (node.createdAt < oldestTime) {
        oldestTime = node.createdAt;
        oldestNodeId = id;
      }
    });

    return oldestNodeId;
  }

  private getOldestConnection(): string | null {
    let oldestConnectionId: string | null = null;
    let oldestTime = Date.now();

    this.connections.forEach((connection, id) => {
      if (connection.createdAt < oldestTime) {
        oldestTime = connection.createdAt;
        oldestConnectionId = id;
      }
    });

    return oldestConnectionId;
  }

  private removeNodeConnections(nodeId: string): void {
    // 移除与节点相关的所有连接
    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, id) => {
      if (connection.sourceId === nodeId || connection.targetId === nodeId) {
        connectionsToRemove.push(id);
      }
    });

    connectionsToRemove.forEach(id => this.removeConnection(id));
  }

  public getNode(id: string): any {
    return this.nodes.get(id) || null;
  }

  public getConnection(sourceId: string, targetId: string): any {
    return this.connections.get(`${sourceId}-${targetId}`) || null;
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public setMaxNodes(max: number): void {
    this.maxNodes = max;
    console.log(`📏 最大节点数设置为: ${max}`);
  }

  public setMaxConnections(max: number): void {
    this.maxConnections = max;
    console.log(`📏 最大连接数设置为: ${max}`);
  }

  public setDataFlowSpeed(speed: number): void {
    this.dataFlowSpeed = speed;
    console.log(`⚡ 数据流速度设置为: ${speed}`);
  }

  public setConnectionLifetime(lifetime: number): void {
    this.connectionLifetime = lifetime;
    console.log(`⏰ 连接生命周期设置为: ${lifetime}ms`);
  }

  public setNodeLifetime(lifetime: number): void {
    this.nodeLifetime = lifetime;
    console.log(`⏰ 节点生命周期设置为: ${lifetime}ms`);
  }

  public enableDynamicColoring(enabled: boolean): void {
    this.useDynamicColoring = enabled;
    console.log(`🎨 动态着色 ${enabled ? '启用' : '禁用'}`);
  }

  public enableParticleEffects(enabled: boolean): void {
    this.enableParticleEffects = enabled;
    console.log(`✨ 粒子效果 ${enabled ? '启用' : '禁用'}`);
  }

  public clear(): void {
    // 清除所有节点
    this.nodes.forEach((node) => {
      if (node.mesh) {
        this.scene.remove(node.mesh);
      }
    });
    this.nodes.clear();

    // 清除所有连接
    this.connections.clear();

    // 清除连接几何
    this.connectionGeometry.vertices = [];
    this.connectionGeometry.verticesNeedUpdate = true;

    console.log('🧹 网络可视化已清空');
  }

  public getStats(): any {
    return {
      nodes: this.nodes.size,
      connections: this.connections.size,
      maxNodes: this.maxNodes,
      maxConnections: this.maxConnections,
      dataFlowSpeed: this.dataFlowSpeed,
      connectionLifetime: this.connectionLifetime,
      nodeLifetime: this.nodeLifetime,
      useDynamicColoring: this.useDynamicColoring,
      enableParticleEffects: this.enableParticleEffects
    };
  }

  public dispose(): void {
    // 清理资源
    this.clear();

    if (this.connectionLine) {
      this.scene.remove(this.connectionLine);
    }

    // 清理几何和材质
    this.connectionGeometry.dispose();
    this.connectionMaterial.dispose();
    this.nodeGeometry.dispose();
    this.nodeMaterial.dispose();

    console.log('🧹 网络可视化系统资源清理完成');
  }
}
