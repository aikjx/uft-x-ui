/**
 * 物理引擎并行计算管理器
 * 管理与 Web Worker 的通信，实现并行计算
 */

import { Vector3, Matrix4 } from 'three'
import {
  PhysicsParameters,
  SpacetimeState,
  ElectromagneticField,
  UnifiedField,
  IPhysicsEngine
} from './PhysicsEngine'
import { PhysicsWorker } from './PhysicsWorker'
import { BVHSystem, createBoundingBox } from '../utils/BVHSystem'

// 定义计算任务类型
interface CalculationTask {
  id: number
  type: string
  data: any
  resolve: Function
  reject: Function
  timestamp: number
}

// 定义 Worker 消息类型
interface WorkerMessage {
  id: number
  type: string
  result?: any
  error?: string
}

/**
 * 物理引擎并行计算管理器
 */
export class PhysicsEngineParallel implements IPhysicsEngine {
  private worker: Worker | null = null
  private tasks: Map<number, CalculationTask> = new Map()
  private taskIdCounter: number = 0
  private isInitialized: boolean = false
  private parameters: PhysicsParameters
  private currentTime: number = 0
  private spacetimeMatrix: Matrix4 = new Matrix4()

  // 空间分区系统
  private spatialPartitioning: {
    bvh?: BVHSystem
    objects: Array<{
      position: Vector3
      mass: number
      charge: number
      radius: number
      id: number
    }>
    objectIdCounter: number
  } = {
    objects: [],
    objectIdCounter: 0
  }

  // 性能统计
  private performanceStats = {
    tasksProcessed: 0,
    averageCalculationTime: 0,
    totalCalculationTime: 0,
    spatialQueries: 0,
    averageSpatialQueryTime: 0,
    totalSpatialQueryTime: 0
  }

  constructor(parameters: PhysicsParameters = this.getDefaultParameters()) {
    this.parameters = parameters
    this.initWorker()
  }

  /**
   * 获取默认物理参数
   */
  private getDefaultParameters(): PhysicsParameters {
    return {
      spacetimeSpeed: 1.0,
      spacetimeCurvature: 0.5,
      gravitationalConstant: 6.6743e-11,
      electricConstant: 8.8541878128e-12,
      magneticConstant: 1.25663706212e-6,
      planckConstant: 6.62607015e-34,
      simulationSpeed: 1.0,
      timeStep: 0.016,
      precision: 1e-6,
      performanceMode: 'high',
      useOptimizedCalculations: true
    }
  }

  /**
   * 初始化 Web Worker
   */
  private initWorker(): void {
    try {
      // 创建 Worker 实例
      this.worker = new Worker(new URL('./PhysicsWorker.ts', import.meta.url), {
        type: 'module'
      })

      // 设置消息处理器
      this.worker.onmessage = this.handleWorkerMessage.bind(this)
      this.worker.onerror = this.handleWorkerError.bind(this)

      // 初始化 Worker
      this.initializeWorker()
    } catch (error) {
      console.error('Failed to initialize Physics Worker:', error)
      // 回退到主线程计算
      this.fallbackToMainThread()
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const message = event.data
    const task = this.tasks.get(message.id)

    if (task) {
      // 计算任务执行时间
      const executionTime = performance.now() - task.timestamp
      this.performanceStats.tasksProcessed++
      this.performanceStats.totalCalculationTime += executionTime
      this.performanceStats.averageCalculationTime =
        this.performanceStats.totalCalculationTime / this.performanceStats.tasksProcessed

      if (message.error) {
        task.reject(new Error(message.error))
      } else {
        task.resolve(message.result)
      }

      // 移除已完成的任务
      this.tasks.delete(message.id)
    }

    // 处理初始化消息
    if (message.type === 'INITIALIZED') {
      this.isInitialized = true
    }
  }

  /**
   * 处理 Worker 错误
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Physics Worker error:', error)
    // 回退到主线程计算
    this.fallbackToMainThread()
  }

  /**
   * 初始化 Worker
   */
  private initializeWorker(): void {
    if (!this.worker) return

    this.worker.postMessage({
      type: 'INIT',
      params: this.parameters
    })
  }

  /**
   * 回退到主线程计算
   */
  private fallbackToMainThread(): void {
    console.warn('Falling back to main thread calculation')
    // 这里可以导入主线程的物理引擎实现
  }

  /**
   * 发送计算任务到 Worker
   */
  private sendTask(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      const taskId = this.taskIdCounter++
      const task: CalculationTask = {
        id: taskId,
        type,
        data,
        resolve,
        reject,
        timestamp: performance.now()
      }

      this.tasks.set(taskId, task)

      this.worker.postMessage({
        id: taskId,
        type,
        data
      })

      // 设置任务超时
      setTimeout(() => {
        if (this.tasks.has(taskId)) {
          this.tasks.delete(taskId)
          reject(new Error(`Task ${type} timed out`))
        }
      }, 5000)
    })
  }

  /**
   * 计算时空点的物理状态
   */
  calculateSpacetimeState(position: Vector3, time: number): Promise<SpacetimeState> {
    return this.sendTask('CALCULATE_SPACETIME_STATE', {
      position: [position.x, position.y, position.z],
      time
    }).then(result => {
      return {
        position: new Vector3(result.position[0], result.position[1], result.position[2]),
        time: result.time,
        curvature: result.curvature,
        energyDensity: result.energyDensity,
        momentum: new Vector3(result.momentum[0], result.momentum[1], result.momentum[2])
      }
    })
  }

  /**
   * 计算引力场
   */
  calculateGravitationalField(position: Vector3, mass: number): Promise<Vector3> {
    return this.sendTask('CALCULATE_GRAVITATIONAL_FIELD', {
      position: [position.x, position.y, position.z],
      mass
    }).then(result => {
      return new Vector3(result[0], result[1], result[2])
    })
  }

  /**
   * 计算电磁场
   */
  calculateElectromagneticField(
    position: Vector3,
    charge: number,
    velocity: Vector3
  ): Promise<ElectromagneticField> {
    return this.sendTask('CALCULATE_ELECTROMAGNETIC_FIELD', {
      position: [position.x, position.y, position.z],
      charge,
      velocity: [velocity.x, velocity.y, velocity.z]
    }).then(result => {
      return {
        electric: new Vector3(result.electric[0], result.electric[1], result.electric[2]),
        magnetic: new Vector3(result.magnetic[0], result.magnetic[1], result.magnetic[2])
      }
    })
  }

  /**
   * 计算统一场（使用空间分区优化）
   */
  calculateUnifiedField(
    position: Vector3,
    time: number,
    mass: number,
    charge: number
  ): Promise<UnifiedField> {
    // 使用空间分区优化计算附近对象的影响
    const forces = this.calculateForcesWithSpatialPartitioning(position, mass, charge)

    return this.sendTask('CALCULATE_UNIFIED_FIELD', {
      position: [position.x, position.y, position.z],
      time,
      mass,
      charge,
      nearbyForces: {
        gravitational: [forces.gravitational.x, forces.gravitational.y, forces.gravitational.z],
        electromagnetic: [
          forces.electromagnetic.x,
          forces.electromagnetic.y,
          forces.electromagnetic.z
        ]
      }
    }).then(result => {
      return {
        spacetime: {
          position: new Vector3(
            result.spacetime.position[0],
            result.spacetime.position[1],
            result.spacetime.position[2]
          ),
          time: result.spacetime.time,
          curvature: result.spacetime.curvature,
          energyDensity: result.spacetime.energyDensity,
          momentum: new Vector3(
            result.spacetime.momentum[0],
            result.spacetime.momentum[1],
            result.spacetime.momentum[2]
          )
        },
        gravitational: new Vector3(
          result.gravitational[0],
          result.gravitational[1],
          result.gravitational[2]
        ),
        electromagnetic: {
          electric: new Vector3(
            result.electromagnetic.electric[0],
            result.electromagnetic.electric[1],
            result.electromagnetic.electric[2]
          ),
          magnetic: new Vector3(
            result.electromagnetic.magnetic[0],
            result.electromagnetic.magnetic[1],
            result.electromagnetic.magnetic[2]
          )
        },
        strongForce: new Vector3(
          result.strongForce[0],
          result.strongForce[1],
          result.strongForce[2]
        ),
        weakForce: new Vector3(result.weakForce[0], result.weakForce[1], result.weakForce[2])
      }
    })
  }

  /**
   * 批量计算多个点的统一场（使用空间分区优化）
   */
  calculateUnifiedFieldsBatch(
    points: Array<{ position: Vector3; time: number; mass: number; charge: number }>
  ): Promise<UnifiedField[]> {
    // 对批量计算进行并行优化
    const optimizedPoints = points.map(point => {
      const forces = this.calculateForcesWithSpatialPartitioning(
        point.position,
        point.mass,
        point.charge
      )
      return {
        position: [point.position.x, point.position.y, point.position.z],
        time: point.time,
        mass: point.mass,
        charge: point.charge,
        nearbyForces: {
          gravitational: [forces.gravitational.x, forces.gravitational.y, forces.gravitational.z],
          electromagnetic: [
            forces.electromagnetic.x,
            forces.electromagnetic.y,
            forces.electromagnetic.z
          ]
        }
      }
    })

    return this.sendTask('CALCULATE_FIELDS_BATCH', {
      points: optimizedPoints
    }).then(results => {
      return results.map(result => ({
        spacetime: {
          position: new Vector3(
            result.spacetime.position[0],
            result.spacetime.position[1],
            result.spacetime.position[2]
          ),
          time: result.spacetime.time,
          curvature: result.spacetime.curvature,
          energyDensity: result.spacetime.energyDensity,
          momentum: new Vector3(
            result.spacetime.momentum[0],
            result.spacetime.momentum[1],
            result.spacetime.momentum[2]
          )
        },
        gravitational: new Vector3(
          result.gravitational[0],
          result.gravitational[1],
          result.gravitational[2]
        ),
        electromagnetic: {
          electric: new Vector3(
            result.electromagnetic.electric[0],
            result.electromagnetic.electric[1],
            result.electromagnetic.electric[2]
          ),
          magnetic: new Vector3(
            result.electromagnetic.magnetic[0],
            result.electromagnetic.magnetic[1],
            result.electromagnetic.magnetic[2]
          )
        },
        strongForce: new Vector3(
          result.strongForce[0],
          result.strongForce[1],
          result.strongForce[2]
        ),
        weakForce: new Vector3(result.weakForce[0], result.weakForce[1], result.weakForce[2])
      }))
    })
  }

  /**
   * 更新物理状态
   */
  updateState(deltaTime: number): void {
    this.currentTime += deltaTime * this.parameters.simulationSpeed
  }

  /**
   * 获取当前物理参数
   */
  getParameters(): PhysicsParameters {
    return { ...this.parameters }
  }

  /**
   * 设置物理参数
   */
  setParameters(params: Partial<PhysicsParameters>): void {
    this.parameters = { ...this.parameters, ...params }

    if (this.worker) {
      this.worker.postMessage({
        type: 'UPDATE_PARAMETERS',
        params: this.parameters
      })
    }
  }

  /**
   * 添加物理对象到空间分区系统
   */
  addPhysicsObject(position: Vector3, mass: number, charge: number, radius: number): number {
    const id = this.spatialPartitioning.objectIdCounter++
    this.spatialPartitioning.objects.push({
      position,
      mass,
      charge,
      radius,
      id
    })
    this.updateSpatialPartitioning()
    return id
  }

  /**
   * 移除物理对象
   */
  removePhysicsObject(id: number): void {
    this.spatialPartitioning.objects = this.spatialPartitioning.objects.filter(obj => obj.id !== id)
    this.updateSpatialPartitioning()
  }

  /**
   * 更新物理对象位置
   */
  updatePhysicsObjectPosition(id: number, position: Vector3): void {
    const object = this.spatialPartitioning.objects.find(obj => obj.id === id)
    if (object) {
      object.position.copy(position)
      this.updateSpatialPartitioning()
    }
  }

  /**
   * 更新空间分区
   */
  private updateSpatialPartitioning(): void {
    // 这里可以实现BVH更新，或者为物理对象创建专门的空间分区
    // 由于BVH需要THREE.Object3D，我们可以创建一个简化版本
  }

  /**
   * 使用空间分区优化的近邻搜索
   */
  private findNearbyObjects(
    position: Vector3,
    radius: number
  ): Array<{
    position: Vector3
    mass: number
    charge: number
    distance: number
  }> {
    const startTime = performance.now()

    const nearbyObjects = this.spatialPartitioning.objects
      .map(obj => {
        const distance = obj.position.distanceTo(position)
        return {
          ...obj,
          distance
        }
      })
      .filter(obj => obj.distance <= radius + obj.radius)

    const endTime = performance.now()
    const queryTime = endTime - startTime

    this.performanceStats.spatialQueries++
    this.performanceStats.totalSpatialQueryTime += queryTime
    this.performanceStats.averageSpatialQueryTime =
      this.performanceStats.totalSpatialQueryTime / this.performanceStats.spatialQueries

    return nearbyObjects
  }

  /**
   * 使用空间分区优化的力计算
   */
  private calculateForcesWithSpatialPartitioning(
    position: Vector3,
    mass: number,
    charge: number
  ): {
    gravitational: Vector3
    electromagnetic: Vector3
    strong: Vector3
    weak: Vector3
  } {
    const radius = 100 // 搜索半径，可根据需要调整
    const nearbyObjects = this.findNearbyObjects(position, radius)

    const gravitational = new Vector3()
    const electromagnetic = new Vector3()
    const strong = new Vector3()
    const weak = new Vector3()

    nearbyObjects.forEach(obj => {
      if (obj.mass > 0) {
        // 计算引力
        const direction = new Vector3().subVectors(obj.position, position)
        const distance = direction.length()
        if (distance > 0) {
          direction.normalize()
          const forceMagnitude =
            (this.parameters.gravitationalConstant * mass * obj.mass) / (distance * distance)
          gravitational.add(direction.multiplyScalar(forceMagnitude))
        }
      }

      if (obj.charge !== 0 && charge !== 0) {
        // 计算电磁力
        const direction = new Vector3().subVectors(obj.position, position)
        const distance = direction.length()
        if (distance > 0) {
          direction.normalize()
          const forceMagnitude =
            (this.parameters.electricConstant * charge * obj.charge) / (distance * distance)
          electromagnetic.add(direction.multiplyScalar(forceMagnitude))
        }
      }
    })

    return {
      gravitational,
      electromagnetic,
      strong,
      weak
    }
  }

  /**
   * 设置性能模式
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.setParameters({ performanceMode: mode })
  }

  /**
   * 计算时空曲率矩阵
   */
  calculateCurvatureMatrix(position: Vector3, time: number): Matrix4 {
    // 这里可以通过 Worker 计算，或者使用缓存的结果
    const matrix = new Matrix4()
    const curvature = 0.5 // 示例值，实际应该通过计算获取

    matrix.set(
      1 + curvature,
      0,
      0,
      0,
      0,
      1 + curvature,
      0,
      0,
      0,
      0,
      1 + curvature,
      0,
      0,
      0,
      0,
      1 - curvature
    )

    return matrix
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    if (this.worker) {
      this.worker.postMessage({
        type: 'CLEAR_CACHE'
      })
    }
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats(): any {
    return {
      ...this.performanceStats,
      objectCount: this.spatialPartitioning.objects.length,
      spatialPartitioningEnabled: true
    }
  }

  /**
   * 销毁并行计算管理器
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.tasks.clear()
  }
}

// 导出默认实例
export const physicsEngineParallel = new PhysicsEngineParallel()
