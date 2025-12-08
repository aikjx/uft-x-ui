import { Vector3, Matrix4 } from 'three';

// 对象池 - 减少垃圾回收
const vectorPool: Vector3[] = [];
const matrixPool: Matrix4[] = [];

// 从对象池获取Vector3
const getVector3 = (): Vector3 => {
  return vectorPool.pop() || new Vector3();
};

// 释放Vector3到对象池
const releaseVector3 = (vector: Vector3): void => {
  vector.set(0, 0, 0);
  vectorPool.push(vector);
};

// 从对象池获取Matrix4
const getMatrix4 = (): Matrix4 => {
  return matrixPool.pop() || new Matrix4();
};

// 释放Matrix4到对象池
const releaseMatrix4 = (matrix: Matrix4): void => {
  matrix.identity();
  matrixPool.push(matrix);
};

// 时空状态接口
export interface SpacetimeState {
  position: Vector3;
  time: number;
  curvature: number;
  energyDensity: number;
  momentum: Vector3;
}

// 电磁场接口
export interface ElectromagneticField {
  electric: Vector3;
  magnetic: Vector3;
}

// 统一场接口
export interface UnifiedField {
  spacetime: SpacetimeState;
  gravitational: Vector3;
  electromagnetic: ElectromagneticField;
  strongForce: Vector3;
  weakForce: Vector3;
}

// 物理参数接口
export interface PhysicsParameters {
  // 时空参数
  spacetimeSpeed: number;
  spacetimeCurvature: number;
  
  // 引力参数
  gravitationalConstant: number;
  
  // 电磁参数
  electricConstant: number;
  magneticConstant: number;
  
  // 量子参数
  planckConstant: number;
  
  // 模拟参数
  simulationSpeed: number;
  timeStep: number;
  precision: number;
  
  // 性能参数
  performanceMode: 'high' | 'medium' | 'low';
  useOptimizedCalculations: boolean;
}

// 时空状态计算器
export class SpacetimeStateCalculator {
  constructor(private parameters: PhysicsParameters) {}
  
  calculateSpacetimeState(position: Vector3, time: number, cache: Map<string, number>): SpacetimeState {
    // 生成缓存键
    const cacheKey = `${position.x},${position.y},${position.z},${time}`;
    
    // 检查缓存
    if (this.parameters.useOptimizedCalculations && cache.has(cacheKey)) {
      const curvature = cache.get(cacheKey)!;
      const energyDensity = curvature * curvature * this.parameters.spacetimeSpeed;
      
      // 使用对象池
      const momentum = getVector3();
      momentum.set(
        position.x * curvature,
        position.y * curvature,
        position.z * curvature
      );
      
      return {
        position: position.clone(),
        time,
        curvature,
        energyDensity,
        momentum
      };
    }
    
    // 计算时空曲率
    const distance = position.length();
    const curvature = this.parameters.spacetimeCurvature / (1 + distance * distance);
    
    // 计算能量密度
    const energyDensity = curvature * curvature * this.parameters.spacetimeSpeed;
    
    // 计算动量 - 使用对象池
    const momentum = getVector3();
    momentum.set(
      position.x * curvature,
      position.y * curvature,
      position.z * curvature
    );
    
    // 缓存结果
    if (this.parameters.useOptimizedCalculations) {
      cache.set(cacheKey, curvature);
      
      // 限制缓存大小
      if (cache.size > 1000) {
        cache.clear();
      }
    }
    
    return {
      position: position.clone(),
      time,
      curvature,
      energyDensity,
      momentum
    };
  }
}

// 重力场计算器
export class GravitationalFieldCalculator {
  constructor(private parameters: PhysicsParameters) {}
  
  calculateField(position: Vector3, mass: number): Vector3 {
    // 使用对象池
    const result = getVector3();
    
    const distance = position.length();
    if (distance < this.parameters.precision) {
      return result;
    }
    
    // 优化计算：使用平方距离，避免开方
    const distanceSquared = distance * distance;
    const forceMagnitude = this.parameters.gravitationalConstant * mass / distanceSquared;
    
    // 优化方向计算
    result.copy(position).normalize().multiplyScalar(-forceMagnitude);
    
    return result;
  }
}

// 电磁场计算器
export class ElectromagneticFieldCalculator {
  constructor(private parameters: PhysicsParameters) {}
  
  calculateField(position: Vector3, charge: number, velocity: Vector3): ElectromagneticField {
    const distance = position.length();
    if (distance < this.parameters.precision) {
      // 使用对象池
      const electric = getVector3();
      const magnetic = getVector3();
      
      return {
        electric,
        magnetic
      };
    }
    
    // 优化计算：使用平方距离，避免开方
    const distanceSquared = distance * distance;
    
    // 计算电场（库仑定律）
    const electricMagnitude = charge / (4 * Math.PI * this.parameters.electricConstant * distanceSquared);
    const electricDirection = getVector3();
    electricDirection.copy(position).normalize().multiplyScalar(charge > 0 ? 1 : -1);
    electricDirection.multiplyScalar(electricMagnitude);
    
    // 计算磁场（毕奥-萨伐尔定律）
    const magnetic = getVector3();
    const velocityLengthSq = velocity.length() * velocity.length();
    if (velocityLengthSq > 0) {
      const magneticMagnitude = (this.parameters.magneticConstant * charge * velocity.length()) / (4 * Math.PI * distanceSquared);
      const magneticDirection = getVector3();
      
      // 使用cross()方法而不是crossVectors()，兼容不同的Vector3实现
      magneticDirection.copy(velocity).cross(position).normalize().multiplyScalar(charge > 0 ? 1 : -1);
      magneticDirection.multiplyScalar(magneticMagnitude);
      magnetic.copy(magneticDirection);
      releaseVector3(magneticDirection);
    }
    
    return {
      electric: electricDirection,
      magnetic
    };
  }
}

// 统一场计算器
export class UnifiedFieldCalculator {
  constructor(
    private parameters: PhysicsParameters,
    private spacetimeCalculator: SpacetimeStateCalculator,
    private gravitationalCalculator: GravitationalFieldCalculator,
    private electromagneticCalculator: ElectromagneticFieldCalculator,
    private curvatureCache: Map<string, number>
  ) {}
  
  calculateField(position: Vector3, time: number, mass: number, charge: number): UnifiedField {
    // 计算时空状态
    const spacetime = this.spacetimeCalculator.calculateSpacetimeState(position, time, this.curvatureCache);
    
    // 计算引力场
    const gravitational = this.gravitationalCalculator.calculateField(position, mass);
    
    // 计算电磁场
    const zeroVelocity = getVector3(); // 使用对象池
    const electromagnetic = this.electromagneticCalculator.calculateField(position, charge, zeroVelocity);
    releaseVector3(zeroVelocity); // 释放对象
    
    // 计算强核力（简化模型）
    const strongForce = getVector3();
    
    // 计算弱核力（简化模型）
    const weakForce = getVector3();
    
    return {
      spacetime,
      gravitational,
      electromagnetic,
      strongForce,
      weakForce
    };
  }
}

// 物理引擎接口
export interface IPhysicsEngine {
  // 计算时空点的物理状态
  calculateSpacetimeState(position: Vector3, time: number): SpacetimeState;
  
  // 计算引力场
  calculateGravitationalField(position: Vector3, mass: number): Vector3;
  
  // 计算电磁场
  calculateElectromagneticField(position: Vector3, charge: number, velocity: Vector3): ElectromagneticField;
  
  // 计算统一场
  calculateUnifiedField(position: Vector3, time: number, mass: number, charge: number): UnifiedField;
  
  // 更新物理状态
  updateState(deltaTime: number): void;
  
  // 获取当前物理参数
  getParameters(): PhysicsParameters;
  
  // 设置物理参数
  setParameters(params: Partial<PhysicsParameters>): void;
  
  // 设置性能模式
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void;
}

// 物理引擎实现
export class PhysicsEngine implements IPhysicsEngine {
  private parameters: PhysicsParameters = {
    // 时空参数
    spacetimeSpeed: 1.0, // 光速
    spacetimeCurvature: 0.5,
    
    // 引力参数
    gravitationalConstant: 6.67430e-11,
    
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
  };
  
  private currentTime: number = 0;
  private spacetimeMatrix: Matrix4 = new Matrix4();
  
  // 缓存计算结果
  private curvatureCache: Map<string, number> = new Map();
  
  // 物理场计算器实例
  private spacetimeCalculator: SpacetimeStateCalculator;
  private gravitationalCalculator: GravitationalFieldCalculator;
  private electromagneticCalculator: ElectromagneticFieldCalculator;
  private unifiedFieldCalculator: UnifiedFieldCalculator;
  
  constructor() {
    // 初始化计算器实例
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters);
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters);
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters);
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    );
  }
  
  /**
   * 计算时空点的物理状态
   * @param position 空间位置
   * @param time 时间
   * @returns 时空状态
   */
  calculateSpacetimeState(position: Vector3, time: number): SpacetimeState {
    return this.spacetimeCalculator.calculateSpacetimeState(position, time, this.curvatureCache);
  }
  
  /**
   * 计算引力场
   * @param position 空间位置
   * @param mass 质量
   * @returns 引力场向量
   */
  calculateGravitationalField(position: Vector3, mass: number): Vector3 {
    return this.gravitationalCalculator.calculateField(position, mass);
  }
  
  /**
   * 计算电磁场
   * @param position 空间位置
   * @param charge 电荷
   * @param velocity 速度
   * @returns 电磁场
   */
  calculateElectromagneticField(position: Vector3, charge: number, velocity: Vector3): ElectromagneticField {
    return this.electromagneticCalculator.calculateField(position, charge, velocity);
  }
  
  /**
   * 计算统一场
   * @param position 空间位置
   * @param time 时间
   * @param mass 质量
   * @param charge 电荷
   * @returns 统一场
   */
  calculateUnifiedField(position: Vector3, time: number, mass: number, charge: number): UnifiedField {
    return this.unifiedFieldCalculator.calculateField(position, time, mass, charge);
  }
  
  /**
   * 更新物理状态
   * @param deltaTime 时间增量
   */
  updateState(deltaTime: number): void {
    this.currentTime += deltaTime * this.parameters.simulationSpeed;
    
    // 定期清理缓存
    if (this.parameters.useOptimizedCalculations && Math.random() < 0.01) {
      this.curvatureCache.clear();
    }
  }
  
  /**
   * 获取当前物理参数
   * @returns 物理参数
   */
  getParameters(): PhysicsParameters {
    return { ...this.parameters };
  }
  
  /**
   * 设置物理参数
   * @param params 部分物理参数
   */
  setParameters(params: Partial<PhysicsParameters>): void {
    this.parameters = { ...this.parameters, ...params };
    
    // 更新所有计算器的参数引用
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters);
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters);
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters);
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    );
  }
  
  /**
   * 设置性能模式
   * @param mode 性能模式
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.parameters.performanceMode = mode;
    
    // 根据性能模式调整参数
    switch (mode) {
      case 'high':
        this.parameters.precision = 1e-6;
        this.parameters.simulationSpeed = 1.0;
        this.parameters.useOptimizedCalculations = true;
        break;
      case 'medium':
        this.parameters.precision = 1e-4;
        this.parameters.simulationSpeed = 0.8;
        this.parameters.useOptimizedCalculations = true;
        break;
      case 'low':
        this.parameters.precision = 1e-2;
        this.parameters.simulationSpeed = 0.5;
        this.parameters.useOptimizedCalculations = false;
        // 清理缓存以节省内存
        this.curvatureCache.clear();
        break;
    }
    
    // 更新所有计算器的参数引用
    this.spacetimeCalculator = new SpacetimeStateCalculator(this.parameters);
    this.gravitationalCalculator = new GravitationalFieldCalculator(this.parameters);
    this.electromagneticCalculator = new ElectromagneticFieldCalculator(this.parameters);
    this.unifiedFieldCalculator = new UnifiedFieldCalculator(
      this.parameters,
      this.spacetimeCalculator,
      this.gravitationalCalculator,
      this.electromagneticCalculator,
      this.curvatureCache
    );
  }
  
  /**
   * 计算时空曲率矩阵
   * @param position 空间位置
   * @param time 时间
   * @returns 曲率矩阵
   */
  calculateCurvatureMatrix(position: Vector3, time: number): Matrix4 {
    const state = this.calculateSpacetimeState(position, time);
    
    // 创建曲率矩阵 - 使用对象池
    const matrix = getMatrix4();
    const curvature = state.curvature;
    
    matrix.set(
      1 + curvature, 0, 0, 0,
      0, 1 + curvature, 0, 0,
      0, 0, 1 + curvature, 0,
      0, 0, 0, 1 - curvature
    );
    
    return matrix;
  }
}

// 创建单例实例
export const physicsEngine = new PhysicsEngine();