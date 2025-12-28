import { Vector3, Matrix4 } from 'three'

// 对象池 - 减少垃圾回收
const vectorPool: Vector3[] = []
const matrixPool: Matrix4[] = []

// 从对象池获取Vector3
const getVector3 = (): Vector3 => {
  return vectorPool.pop() || new Vector3()
}

// 释放Vector3到对象池
const releaseVector3 = (vector: Vector3): void => {
  vector.set(0, 0, 0)
  vectorPool.push(vector)
}

// 从对象池获取Matrix4
const getMatrix4 = (): Matrix4 => {
  return matrixPool.pop() || new Matrix4()
}

// 释放Matrix4到对象池
const releaseMatrix4 = (matrix: Matrix4): void => {
  matrix.identity()
  matrixPool.push(matrix)
}

// 时空状态接口
export interface SpacetimeState {
  position: Vector3
  time: number
  curvature: number
  energyDensity: number
  momentum: Vector3
}

// 电磁场接口
export interface ElectromagneticField {
  electric: Vector3
  magnetic: Vector3
}

// 统一场接口
export interface UnifiedField {
  spacetime: SpacetimeState
  gravitational: Vector3
  electromagnetic: ElectromagneticField
  strongForce: Vector3
  weakForce: Vector3
}

// 物理参数接口
export interface PhysicsParameters {
  // 时空参数
  spacetimeSpeed: number
  spacetimeCurvature: number

  // 引力参数
  gravitationalConstant: number

  // 电磁参数
  electricConstant: number
  magneticConstant: number

  // 量子参数
  planckConstant: number

  // 模拟参数
  simulationSpeed: number
  timeStep: number
  precision: number

  // 性能参数
  performanceMode: 'high' | 'medium' | 'low'
  useOptimizedCalculations: boolean
}

// 时空状态计算器
export class SpacetimeStateCalculator {
  constructor(private parameters: PhysicsParameters) {}

  calculateSpacetimeState(
    position: Vector3,
    time: number,
    cache: Map<string, number>
  ): SpacetimeState {
    // 生成缓存键 - 使用更高效的字符串生成方式
    const cacheKey = `${position.x.toFixed(3)},${position.y.toFixed(3)},${position.z.toFixed(3)},${time.toFixed(2)}`

    // 检查缓存
    if (this.parameters.useOptimizedCalculations && cache.has(cacheKey)) {
      const curvature = cache.get(cacheKey)!
      const energyDensity = curvature * curvature * this.parameters.spacetimeSpeed

      // 使用对象池
      const momentum = getVector3()
      momentum.set(position.x * curvature, position.y * curvature, position.z * curvature)

      return {
        position: position.clone(),
        time,
        curvature,
        energyDensity,
        momentum
      }
    }

    // 计算时空曲率 - 优化计算，避免重复计算length()
    const x = position.x,
      y = position.y,
      z = position.z
    const distanceSquared = x * x + y * y + z * z
    const curvature = this.parameters.spacetimeCurvature / (1 + distanceSquared)

    // 计算能量密度
    const energyDensity = curvature * curvature * this.parameters.spacetimeSpeed

    // 计算动量 - 使用对象池
    const momentum = getVector3()
    momentum.set(x * curvature, y * curvature, z * curvature)

    // 缓存结果
    if (this.parameters.useOptimizedCalculations) {
      cache.set(cacheKey, curvature)

      // 限制缓存大小 - 使用LRU策略，而不是清空整个缓存
      if (cache.size > 2000) {
        // 删除最早的100个条目
        const keys = Array.from(cache.keys())
        for (let i = 0; i < 100; i++) {
          cache.delete(keys[i])
        }
      }
    }

    return {
      position: position.clone(),
      time,
      curvature,
      energyDensity,
      momentum
    }
  }
}

// 重力场计算器
export class GravitationalFieldCalculator {
  constructor(private parameters: PhysicsParameters) {}

  calculateField(position: Vector3, mass: number): Vector3 {
    // 使用对象池
    const result = getVector3()

    // 优化计算：直接计算距离平方，避免开方
    const x = position.x,
      y = position.y,
      z = position.z
    const distanceSquared = x * x + y * y + z * z

    if (distanceSquared < this.parameters.precision * this.parameters.precision) {
      return result
    }

    // 计算力的大小
    const forceMagnitude = (this.parameters.gravitationalConstant * mass) / distanceSquared

    // 计算归一化因子
    const invDistance = 1 / Math.sqrt(distanceSquared)

    // 优化方向计算：直接使用分量计算，避免normalize()调用
    result.set(
      -x * invDistance * forceMagnitude,
      -y * invDistance * forceMagnitude,
      -z * invDistance * forceMagnitude
    )

    return result
  }
}

// 电磁场计算器
export class ElectromagneticFieldCalculator {
  constructor(private parameters: PhysicsParameters) {}

  calculateField(position: Vector3, charge: number, velocity: Vector3): ElectromagneticField {
    // 优化计算：直接计算距离平方，避免开方
    const x = position.x,
      y = position.y,
      z = position.z
    const distanceSquared = x * x + y * y + z * z

    if (distanceSquared < this.parameters.precision * this.parameters.precision) {
      // 使用对象池
      const electric = getVector3()
      const magnetic = getVector3()

      return {
        electric,
        magnetic
      }
    }

    // 计算归一化因子
    const invDistance = 1 / Math.sqrt(distanceSquared)
    const invDistanceCubed = invDistance * invDistance * invDistance

    // 计算电场（库仑定律）
    const electric = getVector3()
    const electricMagnitude =
      (charge * invDistanceCubed) / (4 * Math.PI * this.parameters.electricConstant)
    const chargeSign = charge > 0 ? 1 : -1

    // 直接计算电场分量
    electric.set(
      x * chargeSign * electricMagnitude,
      y * chargeSign * electricMagnitude,
      z * chargeSign * electricMagnitude
    )

    // 计算磁场（毕奥-萨伐尔定律）
    const magnetic = getVector3()
    const velocityLengthSq =
      velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z

    if (velocityLengthSq > 0) {
      const velocityLength = Math.sqrt(velocityLengthSq)
      const magneticMagnitude =
        (this.parameters.magneticConstant * charge * velocityLength * invDistanceCubed) /
        (4 * Math.PI)

      // 计算叉积：v × r
      const vx = velocity.x,
        vy = velocity.y,
        vz = velocity.z
      const crossX = vy * z - vz * y
      const crossY = vz * x - vx * z
      const crossZ = vx * y - vy * x

      // 直接设置磁场分量
      magnetic.set(
        crossX * chargeSign * magneticMagnitude,
        crossY * chargeSign * magneticMagnitude,
        crossZ * chargeSign * magneticMagnitude
      )
    }

    return {
      electric,
      magnetic
    }
  }
}

// 统一场计算器
export class UnifiedFieldCalculator {
  // 修复：正确的静态变量声明
  private static zeroVelocity: Vector3 = new Vector3(0, 0, 0)

  // 优化：添加统一场缓存，避免重复计算
  private unifiedFieldCache: Map<string, UnifiedField> = new Map()

  // 缓存清理计时器
  private cacheCleanupTimer: NodeJS.Timeout | null = null

  constructor(
    private parameters: PhysicsParameters,
    private spacetimeCalculator: SpacetimeStateCalculator,
    private gravitationalCalculator: GravitationalFieldCalculator,
    private electromagneticCalculator: ElectromagneticFieldCalculator,
    private curvatureCache: Map<string, number>
  ) {
    // 启动定期缓存清理
    this.startCacheCleanup()
  }

  // 优化：定期清理过期缓存
  private startCacheCleanup(): void {
    this.cacheCleanupTimer = setInterval(() => {
      if (this.unifiedFieldCache.size > 5000) {
        // 保留最近的2000个缓存项
        const keys = Array.from(this.unifiedFieldCache.keys())
        for (let i = 0; i < keys.length - 2000; i++) {
          this.unifiedFieldCache.delete(keys[i])
        }
      }
    }, 10000) // 每10秒清理一次
  }

  // 优化：生成高效的缓存键
  private generateCacheKey(position: Vector3, time: number, mass: number, charge: number): string {
    // 使用更高效的字符串生成方式，避免模板字符串的性能开销
    return `${position.x.toFixed(3)},${position.y.toFixed(3)},${position.z.toFixed(3)},${time.toFixed(2)},${mass.toFixed(4)},${charge.toFixed(4)}`
  }

  calculateField(position: Vector3, time: number, mass: number, charge: number): UnifiedField {
    // 优化：检查缓存
    const cacheKey = this.generateCacheKey(position, time, mass, charge)
    if (this.parameters.useOptimizedCalculations && this.unifiedFieldCache.has(cacheKey)) {
      return this.unifiedFieldCache.get(cacheKey)!
    }

    // 计算时空状态
    const spacetime = this.spacetimeCalculator.calculateSpacetimeState(
      position,
      time,
      this.curvatureCache
    )

    // 计算引力场
    const gravitational = this.gravitationalCalculator.calculateField(position, mass)

    // 计算电磁场
    const electromagnetic = this.electromagneticCalculator.calculateField(
      position,
      charge,
      UnifiedFieldCalculator.zeroVelocity
    )

    // 计算强核力（简化模型）
    const strongForce = getVector3()

    // 计算弱核力（简化模型）
    const weakForce = getVector3()

    // 构建统一场
    const unifiedField: UnifiedField = {
      spacetime,
      gravitational,
      electromagnetic,
      strongForce,
      weakForce
    }

    // 缓存结果
    if (this.parameters.useOptimizedCalculations) {
      this.unifiedFieldCache.set(cacheKey, unifiedField)
    }

    return unifiedField
  }

  // 优化：批量计算多个点的物理场
  calculateFields(
    points: Array<{ position: Vector3; time: number; mass: number; charge: number }>
  ): UnifiedField[] {
    const results: UnifiedField[] = []

    for (const point of points) {
      results.push(this.calculateField(point.position, point.time, point.mass, point.charge))
    }

    return results
  }

  // 清理资源
  dispose(): void {
    if (this.cacheCleanupTimer) {
      clearInterval(this.cacheCleanupTimer)
      this.cacheCleanupTimer = null
    }
    this.unifiedFieldCache.clear()
  }
}

// 物理引擎接口
export interface IPhysicsEngine {
  // 计算时空点的物理状态
  calculateSpacetimeState(position: Vector3, time: number): SpacetimeState

  // 计算引力场
  calculateGravitationalField(position: Vector3, mass: number): Vector3

  // 计算电磁场
  calculateElectromagneticField(
    position: Vector3,
    charge: number,
    velocity: Vector3
  ): ElectromagneticField

  // 计算统一场
  calculateUnifiedField(position: Vector3, time: number, mass: number, charge: number): UnifiedField

  // 更新物理状态
  updateState(deltaTime: number): void

  // 获取当前物理参数
  getParameters(): PhysicsParameters

  // 设置物理参数
  setParameters(params: Partial<PhysicsParameters>): void

  // 设置性能模式
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void
}

// 物理引擎实现
export class PhysicsEngine implements IPhysicsEngine {
  private parameters: PhysicsParameters = {
    // 时空参数
    spacetimeSpeed: 1.0, // 光速
    spacetimeCurvature: 0.5,

    // 引力参数
    gravitationalConstant: 6.6743e-11,

    // 电磁参数
    electricConstant: 8.8541878128e-12,
    magneticConstant: 1.25663706212e-6,

    // 量子参数
    planckConstant: 6.62607015e-34,

    // 模拟参数
    simulationSpeed: 1.0,
    timeStep: 0.016, // 约60 FPS
    precision: 1e-6,

    // 性能参数
    performanceMode: 'high',
    useOptimizedCalculations: true
  }

  private currentTime: number = 0
  private spacetimeMatrix: Matrix4 = new Matrix4()

  // 缓存计算结果
  private curvatureCache: Map<string, number> = new Map()

  // 物理场计算器实例
  private spacetimeCalculator: SpacetimeStateCalculator
  private gravitationalCalculator: GravitationalFieldCalculator
  private electromagneticCalculator: ElectromagneticFieldCalculator
  private unifiedFieldCalculator: UnifiedFieldCalculator

  constructor() {
    // 初始化计算器实例
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters)
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters)
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters)
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    )
  }

  /**
   * 计算时空点的物理状态
   * @param position 空间位置
   * @param time 时间
   * @returns 时空状态
   */
  calculateSpacetimeState(position: Vector3, time: number): SpacetimeState {
    return this.spacetimeCalculator.calculateSpacetimeState(position, time, this.curvatureCache)
  }

  /**
   * 计算引力场
   * @param position 空间位置
   * @param mass 质量
   * @returns 引力场向量
   */
  calculateGravitationalField(position: Vector3, mass: number): Vector3 {
    return this.gravitationalCalculator.calculateField(position, mass)
  }

  /**
   * 计算电磁场
   * @param position 空间位置
   * @param charge 电荷
   * @param velocity 速度
   * @returns 电磁场
   */
  calculateElectromagneticField(
    position: Vector3,
    charge: number,
    velocity: Vector3
  ): ElectromagneticField {
    return this.electromagneticCalculator.calculateField(position, charge, velocity)
  }

  /**
   * 计算统一场
   * @param position 空间位置
   * @param time 时间
   * @param mass 质量
   * @param charge 电荷
   * @returns 统一场
   */
  calculateUnifiedField(
    position: Vector3,
    time: number,
    mass: number,
    charge: number
  ): UnifiedField {
    return this.unifiedFieldCalculator.calculateField(position, time, mass, charge)
  }

  /**
   * 更新物理状态
   * @param deltaTime 时间增量
   */
  updateState(deltaTime: number): void {
    this.currentTime += deltaTime * this.parameters.simulationSpeed

    // 定期清理缓存
    if (this.parameters.useOptimizedCalculations && Math.random() < 0.01) {
      this.curvatureCache.clear()
    }
  }

  /**
   * 获取当前物理参数
   * @returns 物理参数
   */
  getParameters(): PhysicsParameters {
    return { ...this.parameters }
  }

  /**
   * 设置物理参数
   * @param params 部分物理参数
   */
  setParameters(params: Partial<PhysicsParameters>): void {
    // 优化：只在参数实际变化时更新
    const hasChanges = Object.keys(params).some(key => {
      return (
        this.parameters[key as keyof PhysicsParameters] !== params[key as keyof PhysicsParameters]
      )
    })

    if (!hasChanges) return

    this.parameters = { ...this.parameters, ...params }

    // 优化：清理旧计算器实例的资源
    if (this.unifiedFieldCalculator && typeof this.unifiedFieldCalculator.dispose === 'function') {
      this.unifiedFieldCalculator.dispose()
    }

    // 更新所有计算器的参数引用 - 优化：使用更高效的方式创建新实例
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters)
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters)
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters)
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    )
  }

  /**
   * 设置性能模式
   * @param mode 性能模式
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    // 优化：只在模式实际变化时更新
    if (this.parameters.performanceMode === mode) return
    
    this.parameters.performanceMode = mode

    // 根据性能模式调整参数
    switch (mode) {
      case 'high':
        this.parameters.precision = 1e-6
        this.parameters.simulationSpeed = 1.0
        this.parameters.useOptimizedCalculations = true
        break
      case 'medium':
        this.parameters.precision = 1e-4
        this.parameters.simulationSpeed = 0.8
        this.parameters.useOptimizedCalculations = true
        break
      case 'low':
        this.parameters.precision = 1e-2
        this.parameters.simulationSpeed = 0.5
        this.parameters.useOptimizedCalculations = false
        // 清理缓存以节省内存
        this.curvatureCache.clear()
        // 清理统一场缓存
        if (this.unifiedFieldCalculator && typeof this.unifiedFieldCalculator.dispose === 'function') {
          this.unifiedFieldCalculator.dispose()
        }
        break
    }

    // 优化：清理旧计算器实例的资源
    if (this.unifiedFieldCalculator && typeof this.unifiedFieldCalculator.dispose === 'function') {
      this.unifiedFieldCalculator.dispose()
    }

    // 更新所有计算器的参数引用
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters)
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters)
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters)
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    )
  }

  /**
   * 计算时空曲率矩阵
   * @param position 空间位置
   * @param time 时间
   * @returns 曲率矩阵
   */
  calculateCurvatureMatrix(position: Vector3, time: number): Matrix4 {
    const state = this.calculateSpacetimeState(position, time)

    // 创建曲率矩阵 - 使用对象池
    const matrix = getMatrix4()
    const curvature = state.curvature

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
}

// 导出默认实现
export { PhysicsEngine }

// 创建默认实例，保持向后兼容
export const physicsEngine = new PhysicsEngine()

// 从依赖注入容器注册和解析
export const registerPhysicsEngine = (container: any) => {
  container.register(container.DEPENDENCY_KEYS.CurvatureCache, () => new Map<string, number>(), {
    singleton: true
  })

  container.register(container.DEPENDENCY_KEYS.SpacetimeStateCalculator, SpacetimeStateCalculator, {
    singleton: true
  })

  container.register(
    container.DEPENDENCY_KEYS.GravitationalFieldCalculator,
    GravitationalFieldCalculator,
    { singleton: true }
  )

  container.register(
    container.DEPENDENCY_KEYS.ElectromagneticFieldCalculator,
    ElectromagneticFieldCalculator,
    { singleton: true }
  )

  container.register(container.DEPENDENCY_KEYS.UnifiedFieldCalculator, UnifiedFieldCalculator, {
    singleton: true,
    dependencies: [
      container.DEPENDENCY_KEYS.SpacetimeStateCalculator,
      container.DEPENDENCY_KEYS.GravitationalFieldCalculator,
      container.DEPENDENCY_KEYS.ElectromagneticFieldCalculator,
      container.DEPENDENCY_KEYS.CurvatureCache
    ]
  })

  container.register(container.DEPENDENCY_KEYS.PhysicsEngine, PhysicsEngine, { singleton: true })
}
