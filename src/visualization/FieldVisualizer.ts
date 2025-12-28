import * as THREE from 'three'
import { PhysicsEngine } from '../core/PhysicsEngine'

/**
 * 场可视化配置
 */
export interface FieldVisualizerConfig {
  fieldType: 'gravitational' | 'electromagnetic' | 'unified'
  gridSize: number
  gridResolution: number
  vectorLength: number
  colorScheme: 'default' | 'heatmap' | 'binary'
  showFieldLines: boolean
  showVectorField: boolean
  maxFieldLines: number
  animationSpeed: number
}

/**
 * 场可视化组件
 */
export class FieldVisualizer {
  private scene: THREE.Scene
  private physicsEngine: PhysicsEngine
  private config: FieldVisualizerConfig
  private fieldLines: THREE.Line[] = []
  private vectorField: THREE.Line[] = []
  private gridHelper: THREE.GridHelper | null = null
  private animationTime: number = 0

  constructor(
    scene: THREE.Scene,
    physicsEngine: PhysicsEngine,
    config: Partial<FieldVisualizerConfig> = {}
  ) {
    this.scene = scene
    this.physicsEngine = physicsEngine
    this.config = {
      fieldType: 'unified',
      gridSize: 10,
      gridResolution: 5,
      vectorLength: 0.5,
      colorScheme: 'default',
      showFieldLines: true,
      showVectorField: true,
      maxFieldLines: 100,
      animationSpeed: 1,
      ...config
    }

    this.initialize()
  }

  /**
   * 初始化场可视化
   */
  private initialize(): void {
    // 创建网格辅助线
    this.createGrid()

    // 初始化场可视化
    this.updateVisualization()
  }

  /**
   * 创建网格
   */
  private createGrid(): void {
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper)
      this.gridHelper = null
    }

    this.gridHelper = new THREE.GridHelper(
      this.config.gridSize * 2,
      this.config.gridResolution * 2,
      0x444444,
      0x222222
    )
    this.scene.add(this.gridHelper)
  }

  /**
   * 更新场可视化
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime * this.config.animationSpeed
    this.updateVisualization()
  }

  /**
   * 更新可视化效果
   */
  private updateVisualization(): void {
    // 清除旧的场线和矢量场
    this.clearFieldLines()
    this.clearVectorField()

    // 根据配置更新可视化
    if (this.config.showFieldLines) {
      this.createFieldLines()
    }

    if (this.config.showVectorField) {
      this.createVectorField()
    }
  }

  /**
   * 创建场线
   */
  private createFieldLines(): void {
    const { gridSize, gridResolution, maxFieldLines } = this.config
    const step = gridSize / gridResolution
    let fieldLineCount = 0

    // 在网格上生成场线
    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let z = -gridSize; z <= gridSize; z += step) {
        if (fieldLineCount >= maxFieldLines) break

        // 创建场线
        const fieldLine = this.generateFieldLine(new THREE.Vector3(x, 0, z))
        if (fieldLine) {
          this.fieldLines.push(fieldLine)
          this.scene.add(fieldLine)
          fieldLineCount++
        }
      }
      if (fieldLineCount >= maxFieldLines) break
    }
  }

  /**
   * 生成单条场线 - 增强版
   */
  private generateFieldLine(startPosition: THREE.Vector3): THREE.Line | null {
    const points: THREE.Vector3[] = []
    const maxPoints = 30 // 增加点数，使场线更平滑
    const stepSize = 0.08 // 减小步长，使场线更精确

    let currentPosition = startPosition.clone()

    for (let i = 0; i < maxPoints; i++) {
      points.push(currentPosition.clone())

      // 计算当前位置的场强
      const fieldValue = this.calculateFieldValue(currentPosition)

      // 添加动画效果，使场线随时间变化
      const animatedFieldValue = fieldValue.clone().multiplyScalar(
        1 + Math.sin(this.animationTime * 2 + i * 0.5) * 0.1
      )

      // 更新位置
      const nextPosition = currentPosition
        .clone()
        .add(animatedFieldValue.clone().normalize().multiplyScalar(stepSize))

      // 检查是否超出边界
      if (nextPosition.length() > this.config.gridSize * 2) {
        break
      }

      currentPosition = nextPosition
    }

    if (points.length < 2) return null

    // 创建几何体和材质
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    // 增强材质效果
    const material = new THREE.LineBasicMaterial({
      color: this.getFieldColor(points[0]),
      transparent: true,
      opacity: 0.8,
      linewidth: 1.5,
      blending: THREE.AdditiveBlending // 加法混合，增强发光效果
    })

    return new THREE.Line(geometry, material)
  }

  /**
   * 创建矢量场
   */
  private createVectorField(): void {
    const { gridSize, gridResolution, vectorLength } = this.config
    const step = gridSize / gridResolution

    // 在网格上生成矢量
    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let z = -gridSize; z <= gridSize; z += step) {
        const position = new THREE.Vector3(x, 0, z)
        const fieldValue = this.calculateFieldValue(position)

        // 只显示有意义的场强
        if (fieldValue.length() > 0.01) {
          const vectorLine = this.createVectorArrow(position, fieldValue, vectorLength)
          this.vectorField.push(vectorLine)
          this.scene.add(vectorLine)
        }
      }
    }
  }

  /**
   * 创建矢量箭头
   */
  private createVectorArrow(
    position: THREE.Vector3,
    fieldValue: THREE.Vector3,
    length: number
  ): THREE.Line {
    const normalizedField = fieldValue.clone().normalize()
    const endPosition = position.clone().add(normalizedField.multiplyScalar(length))

    const points = [position, endPosition]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({
      color: this.getFieldColor(position),
      linewidth: 2
    })

    return new THREE.Line(geometry, material)
  }

  /**
   * 计算场值
   */
  private calculateFieldValue(position: THREE.Vector3): THREE.Vector3 {
    let fieldValue: THREE.Vector3

    try {
      switch (this.config.fieldType) {
        case 'gravitational':
          fieldValue = this.physicsEngine.calculateGravitationalField(position, 1)
          break
        case 'electromagnetic':
          fieldValue = this.physicsEngine.calculateElectromagneticField(
            position,
            1,
            new THREE.Vector3(0, 0, 0)
          ).electric
          break
        case 'unified':
        default:
          fieldValue = this.physicsEngine.calculateUnifiedField(position, 1, 1, 1).gravitational
          break
      }
    } catch (error) {
      console.error('Field calculation error:', error)
      fieldValue = new THREE.Vector3(0, 0, 0)
    }

    return fieldValue
  }

  /**
   * 获取场颜色
   */
  private getFieldColor(position: THREE.Vector3): number {
    const fieldValue = this.calculateFieldValue(position)
    const magnitude = fieldValue.length()

    switch (this.config.colorScheme) {
      case 'heatmap':
        // 热图颜色方案
        const normalizedMagnitude = Math.min(magnitude / 2, 1)
        return new THREE.Color().setHSL(0.6 - normalizedMagnitude * 0.6, 1, 0.5).getHex()

      case 'binary':
        // 二进制颜色方案
        return magnitude > 0.5 ? 0x00ffff : 0xff00ff

      case 'default':
      default:
        // 默认颜色方案
        return new THREE.Color().setHSL(magnitude * 0.5, 1, 0.5).getHex()
    }
  }

  /**
   * 清除场线
   */
  private clearFieldLines(): void {
    this.fieldLines.forEach(line => {
      this.scene.remove(line)
      line.geometry.dispose()
      if (Array.isArray(line.material)) {
        line.material.forEach(m => m.dispose())
      } else {
        line.material.dispose()
      }
    })
    this.fieldLines = []
  }

  /**
   * 清除矢量场
   */
  private clearVectorField(): void {
    this.vectorField.forEach(line => {
      this.scene.remove(line)
      line.geometry.dispose()
      if (Array.isArray(line.material)) {
        line.material.forEach(m => m.dispose())
      } else {
        line.material.dispose()
      }
    })
    this.vectorField = []
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<FieldVisualizerConfig>): void {
    const oldGridSize = this.config.gridSize
    const oldGridResolution = this.config.gridResolution

    this.config = { ...this.config, ...config }

    // 如果网格大小或分辨率改变，重新创建网格
    if (oldGridSize !== this.config.gridSize || oldGridResolution !== this.config.gridResolution) {
      this.createGrid()
    }

    // 更新可视化
    this.updateVisualization()
  }

  /**
   * 销毁可视化组件
   */
  dispose(): void {
    this.clearFieldLines()
    this.clearVectorField()

    if (this.gridHelper) {
      this.scene.remove(this.gridHelper)
      this.gridHelper = null
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): FieldVisualizerConfig {
    return { ...this.config }
  }
}

/**
 * 场可视化管理器
 */
export class FieldVisualizerManager {
  private visualizers: Map<string, FieldVisualizer> = new Map()
  private scene: THREE.Scene
  private physicsEngine: PhysicsEngine

  constructor(scene: THREE.Scene, physicsEngine: PhysicsEngine) {
    this.scene = scene
    this.physicsEngine = physicsEngine
  }

  /**
   * 添加场可视化器
   */
  addVisualizer(id: string, config: Partial<FieldVisualizerConfig> = {}): FieldVisualizer {
    const visualizer = new FieldVisualizer(this.scene, this.physicsEngine, config)
    this.visualizers.set(id, visualizer)
    return visualizer
  }

  /**
   * 移除场可视化器
   */
  removeVisualizer(id: string): void {
    const visualizer = this.visualizers.get(id)
    if (visualizer) {
      visualizer.dispose()
      this.visualizers.delete(id)
    }
  }

  /**
   * 更新所有可视化器
   */
  update(deltaTime: number): void {
    this.visualizers.forEach(visualizer => {
      visualizer.update(deltaTime)
    })
  }

  /**
   * 获取可视化器
   */
  getVisualizer(id: string): FieldVisualizer | undefined {
    return this.visualizers.get(id)
  }

  /**
   * 清除所有可视化器
   */
  clear(): void {
    this.visualizers.forEach((_, id) => this.removeVisualizer(id))
  }
}
