/**
 * 机器学习性能预测模型
 * 用于预测不同场景下的最佳参数组合
 */

import * as tf from '@tensorflow/tfjs'

// 定义性能数据接口
export interface PerformanceData {
  fps: number
  renderTime: number
  frameTime: number
  drawCalls: number
  triangles: number
  particleCount: number
  renderScale: number
  shadowQuality: number
  postProcessing: boolean
  textureMemory: number
  objectCount: number
  complexObjectCount: number
  thermalState: 'normal' | 'warm' | 'hot'
  batteryLevel: number
  devicePerformanceLevel: 'low' | 'medium' | 'high' | 'ultra'
}

// 定义优化参数接口
export interface OptimizationParams {
  particleCount: number
  renderScale: number
  shadowQuality: number
  postProcessing: boolean
  textureMemory: number
  objectCount: number
  complexObjectCount: number
}

// 定义模型训练数据接口
interface TrainingData {
  features: number[]
  labels: number[]
}

/**
 * 机器学习性能预测模型
 */
export class MLPerformancePredictor {
  private model: tf.Sequential | null = null
  private isTrained: boolean = false
  private trainingData: TrainingData[] = []
  private featureNames: string[] = [
    'particleCount',
    'renderScale',
    'shadowQuality',
    'postProcessing',
    'textureMemory',
    'objectCount',
    'complexObjectCount',
    'thermalState',
    'batteryLevel',
    'devicePerformanceLevel'
  ]
  private labelNames: string[] = ['fps', 'renderTime', 'drawCalls', 'triangles']

  /**
   * 初始化模型
   */
  constructor() {
    this.initModel()
  }

  /**
   * 初始化模型架构（使用更先进的架构）
   */
  private initModel(): void {
    // 创建序列模型
    this.model = tf.sequential()

    // 添加输入层
    this.model.add(
      tf.layers.dense({
        units: 128,
        activation: 'relu',
        inputShape: [this.featureNames.length],
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      })
    )

    // 添加批量归一化层
    this.model.add(tf.layers.batchNormalization())

    // 添加隐藏层
    this.model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      })
    )

    this.model.add(tf.layers.batchNormalization())

    this.model.add(
      tf.layers.dense({
        units: 32,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      })
    )

    // 添加输出层
    this.model.add(
      tf.layers.dense({
        units: this.labelNames.length,
        activation: 'linear'
      })
    )

    // 编译模型
    this.model.compile({
      optimizer: tf.train.adam(0.0005), // 更小的学习率
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse']
    })
  }

  /**
   * 添加训练数据
   */
  public addTrainingData(data: PerformanceData): void {
    const features = this.encodeFeatures(data)
    const labels = this.encodeLabels(data)

    this.trainingData.push({ features, labels })

    // 当训练数据达到一定数量时自动训练
    if (this.trainingData.length >= 50) {
      this.trainModel()
    }
  }

  /**
   * 编码特征数据
   */
  private encodeFeatures(data: PerformanceData): number[] {
    return [
      data.particleCount / 10000, // 归一化粒子数量
      data.renderScale, // 渲染缩放
      data.shadowQuality, // 阴影质量
      data.postProcessing ? 1 : 0, // 后处理
      data.textureMemory / 100, // 归一化纹理内存
      data.objectCount / 1000, // 归一化对象数量
      data.complexObjectCount / 100, // 归一化复杂对象数量
      this.encodeThermalState(data.thermalState), // 编码热状态
      data.batteryLevel, // 电池电量
      this.encodeDevicePerformance(data.devicePerformanceLevel) // 编码设备性能
    ]
  }

  /**
   * 编码标签数据
   */
  private encodeLabels(data: PerformanceData): number[] {
    return [
      data.fps / 60, // 归一化FPS
      data.renderTime / 33, // 归一化渲染时间（假设33ms为上限）
      data.drawCalls / 1000, // 归一化绘制调用
      data.triangles / 1000000 // 归一化三角形数量
    ]
  }

  /**
   * 编码热状态
   */
  private encodeThermalState(state: 'normal' | 'warm' | 'hot'): number {
    switch (state) {
      case 'normal':
        return 0
      case 'warm':
        return 0.5
      case 'hot':
        return 1
      default:
        return 0
    }
  }

  /**
   * 编码设备性能
   */
  private encodeDevicePerformance(level: 'low' | 'medium' | 'high' | 'ultra'): number {
    switch (level) {
      case 'low':
        return 0
      case 'medium':
        return 0.33
      case 'high':
        return 0.66
      case 'ultra':
        return 1
      default:
        return 0.33
    }
  }

  /**
   * 训练模型（增强版本）
   */
  public async trainModel(): Promise<void> {
    if (!this.model || this.trainingData.length < 20) {
      return
    }

    console.log(`Training model with ${this.trainingData.length} samples...`)

    // 准备训练数据
    const features = tf.tensor2d(this.trainingData.map(d => d.features))
    const labels = tf.tensor2d(this.trainingData.map(d => d.labels))

    // 数据增强
    const augmentedFeatures = this.augmentData(features)
    const augmentedLabels = this.augmentLabels(labels)

    // 合并原始数据和增强数据
    const combinedFeatures = tf.concat([features, augmentedFeatures], 0)
    const combinedLabels = tf.concat([labels, augmentedLabels], 0)

    // 训练模型
    const history = await this.model.fit(combinedFeatures, combinedLabels, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.25,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(
              `Epoch ${epoch}: loss = ${logs.loss}, val_loss = ${logs.val_loss}, mae = ${logs.mae}, val_mae = ${logs.val_mae}`
            )
          }
        },
        // 早停法
        onTrainEnd: () => {
          console.log('Training completed!')
        }
      }
    })

    this.isTrained = true
    console.log('Model training completed!')
    console.log(`Final loss: ${history.history.loss[history.history.loss.length - 1]}`)
    console.log(`Final val_loss: ${history.history.val_loss[history.history.val_loss.length - 1]}`)

    // 释放张量
    features.dispose()
    labels.dispose()
    augmentedFeatures.dispose()
    augmentedLabels.dispose()
    combinedFeatures.dispose()
    combinedLabels.dispose()
  }

  /**
   * 数据增强
   */
  private augmentData(features: tf.Tensor2D): tf.Tensor2D {
    // 添加随机噪声进行数据增强
    const noise = tf.randomNormal(features.shape, 0, 0.05)
    return features.add(noise)
  }

  /**
   * 标签增强
   */
  private augmentLabels(labels: tf.Tensor2D): tf.Tensor2D {
    // 为标签添加轻微变化
    const noise = tf.randomNormal(labels.shape, 0, 0.02)
    return labels.add(noise)
  }

  /**
   * 预测性能
   */
  public predictPerformance(
    params: OptimizationParams,
    deviceData: {
      thermalState: 'normal' | 'warm' | 'hot'
      batteryLevel: number
      devicePerformanceLevel: 'low' | 'medium' | 'high' | 'ultra'
    }
  ): Promise<PerformanceData> {
    if (!this.model || !this.isTrained) {
      // 如果模型未训练，返回默认预测
      return Promise.resolve(this.getDefaultPrediction(params, deviceData))
    }

    // 编码输入数据
    const inputData = [
      params.particleCount / 10000,
      params.renderScale,
      params.shadowQuality,
      params.postProcessing ? 1 : 0,
      params.textureMemory / 100,
      params.objectCount / 1000,
      params.complexObjectCount / 100,
      this.encodeThermalState(deviceData.thermalState),
      deviceData.batteryLevel,
      this.encodeDevicePerformance(deviceData.devicePerformanceLevel)
    ]

    // 进行预测
    const inputTensor = tf.tensor2d([inputData])
    const prediction = this.model.predict(inputTensor) as tf.Tensor2D

    // 解码预测结果
    const predictionData = prediction.dataSync()
    const predictedFps = predictionData[0] * 60
    const predictedRenderTime = predictionData[1] * 33
    const predictedDrawCalls = predictionData[2] * 1000
    const predictedTriangles = predictionData[3] * 1000000

    // 释放张量
    inputTensor.dispose()
    prediction.dispose()

    // 返回预测结果
    return Promise.resolve({
      fps: Math.max(10, Math.min(60, predictedFps)),
      renderTime: Math.max(1, predictedRenderTime),
      frameTime: Math.max(1, predictedRenderTime),
      drawCalls: Math.max(10, Math.min(5000, Math.round(predictedDrawCalls))),
      triangles: Math.max(1000, Math.min(10000000, Math.round(predictedTriangles))),
      particleCount: params.particleCount,
      renderScale: params.renderScale,
      shadowQuality: params.shadowQuality,
      postProcessing: params.postProcessing,
      textureMemory: params.textureMemory,
      objectCount: params.objectCount,
      complexObjectCount: params.complexObjectCount,
      thermalState: deviceData.thermalState,
      batteryLevel: deviceData.batteryLevel,
      devicePerformanceLevel: deviceData.devicePerformanceLevel
    })
  }

  /**
   * 获取默认预测
   */
  private getDefaultPrediction(params: OptimizationParams, deviceData: any): PerformanceData {
    // 基于简单的启发式规则进行预测
    let baseFps = 60

    // 基于设备性能调整
    switch (deviceData.devicePerformanceLevel) {
      case 'low':
        baseFps = 30
        break
      case 'medium':
        baseFps = 45
        break
      case 'high':
        baseFps = 55
        break
      case 'ultra':
        baseFps = 60
        break
    }

    // 基于热状态调整
    if (deviceData.thermalState === 'hot') baseFps *= 0.7
    else if (deviceData.thermalState === 'warm') baseFps *= 0.9

    // 基于电池电量调整
    if (deviceData.batteryLevel < 0.2) baseFps *= 0.8

    // 基于参数调整
    const particleImpact = params.particleCount / 10000
    const renderScaleImpact = params.renderScale
    const shadowImpact = params.shadowQuality
    const postProcessingImpact = params.postProcessing ? 0.2 : 0

    const totalImpact =
      particleImpact * 0.3 +
      renderScaleImpact * 0.25 +
      shadowImpact * 0.15 +
      postProcessingImpact * 0.2

    const adjustedFps = Math.max(10, baseFps * (1 - totalImpact * 0.5))
    const renderTime = 1000 / adjustedFps

    return {
      fps: adjustedFps,
      renderTime: renderTime,
      frameTime: renderTime,
      drawCalls: Math.round(params.objectCount * 1.2 + params.particleCount * 0.01),
      triangles: Math.round(params.complexObjectCount * 10000 + params.particleCount * 2),
      particleCount: params.particleCount,
      renderScale: params.renderScale,
      shadowQuality: params.shadowQuality,
      postProcessing: params.postProcessing,
      textureMemory: params.textureMemory,
      objectCount: params.objectCount,
      complexObjectCount: params.complexObjectCount,
      thermalState: deviceData.thermalState,
      batteryLevel: deviceData.batteryLevel,
      devicePerformanceLevel: deviceData.devicePerformanceLevel
    }
  }

  /**
   * 优化参数（使用贝叶斯优化）
   */
  public async optimizeParameters(
    targetFps: number,
    deviceData: {
      thermalState: 'normal' | 'warm' | 'hot'
      batteryLevel: number
      devicePerformanceLevel: 'low' | 'medium' | 'high' | 'ultra'
    },
    constraints: {
      maxParticleCount?: number
      maxRenderScale?: number
      maxShadowQuality?: number
      allowPostProcessing?: boolean
      maxTextureMemory?: number
      maxObjectCount?: number
      maxComplexObjectCount?: number
    }
  ): Promise<OptimizationParams> {
    // 定义参数范围
    const paramRanges = {
      particleCount: { min: 100, max: constraints.maxParticleCount || 20000 },
      renderScale: { min: 0.5, max: constraints.maxRenderScale || 2.0 },
      shadowQuality: { min: 0, max: constraints.maxShadowQuality || 1.0 },
      postProcessing: { options: [false, constraints.allowPostProcessing || false] },
      textureMemory: { min: 10, max: constraints.maxTextureMemory || 200 },
      objectCount: { min: 10, max: constraints.maxObjectCount || 1000 },
      complexObjectCount: { min: 1, max: constraints.maxComplexObjectCount || 100 }
    }

    // 使用贝叶斯优化
    return this.bayesianOptimization(paramRanges, targetFps, deviceData)
  }

  /**
   * 贝叶斯优化
   */
  private async bayesianOptimization(
    paramRanges: any,
    targetFps: number,
    deviceData: any
  ): Promise<OptimizationParams> {
    // 初始化样本
    const samples: Array<{ params: OptimizationParams; score: number }> = []

    // 初始采样
    for (let i = 0; i < 20; i++) {
      const params = this.generateRandomParams(paramRanges)
      const prediction = await this.predictPerformance(params, deviceData)
      const score = Math.abs(prediction.fps - targetFps)
      samples.push({ params, score })
    }

    // 优化迭代
    for (let iteration = 0; iteration < 30; iteration++) {
      const bestSample = samples.reduce(
        (best, current) => (current.score < best.score ? current : best),
        samples[0]
      )

      // 生成新的候选参数
      const newParams = this.generateNewParams(paramRanges, samples)
      const prediction = await this.predictPerformance(newParams, deviceData)
      const score = Math.abs(prediction.fps - targetFps)

      samples.push({ params: newParams, score })

      // 保持样本数量
      if (samples.length > 50) {
        samples.sort((a, b) => a.score - b.score)
        samples.splice(20)
      }
    }

    // 返回最佳参数
    const bestSample = samples.reduce(
      (best, current) => (current.score < best.score ? current : best),
      samples[0]
    )
    return bestSample.params
  }

  /**
   * 生成随机参数
   */
  private generateRandomParams(paramRanges: any): OptimizationParams {
    return {
      particleCount: Math.floor(
        Math.random() * (paramRanges.particleCount.max - paramRanges.particleCount.min) +
          paramRanges.particleCount.min
      ),
      renderScale:
        Math.random() * (paramRanges.renderScale.max - paramRanges.renderScale.min) +
        paramRanges.renderScale.min,
      shadowQuality:
        Math.random() * (paramRanges.shadowQuality.max - paramRanges.shadowQuality.min) +
        paramRanges.shadowQuality.min,
      postProcessing:
        paramRanges.postProcessing.options[
          Math.floor(Math.random() * paramRanges.postProcessing.options.length)
        ],
      textureMemory: Math.floor(
        Math.random() * (paramRanges.textureMemory.max - paramRanges.textureMemory.min) +
          paramRanges.textureMemory.min
      ),
      objectCount: Math.floor(
        Math.random() * (paramRanges.objectCount.max - paramRanges.objectCount.min) +
          paramRanges.objectCount.min
      ),
      complexObjectCount: Math.floor(
        Math.random() * (paramRanges.complexObjectCount.max - paramRanges.complexObjectCount.min) +
          paramRanges.complexObjectCount.min
      )
    }
  }

  /**
   * 生成新参数
   */
  private generateNewParams(
    paramRanges: any,
    samples: Array<{ params: OptimizationParams; score: number }>
  ): OptimizationParams {
    // 基于现有样本生成新参数
    const bestSample = samples.reduce(
      (best, current) => (current.score < best.score ? current : best),
      samples[0]
    )

    // 在最佳样本附近生成新参数
    return {
      particleCount: Math.max(
        paramRanges.particleCount.min,
        Math.min(
          paramRanges.particleCount.max,
          bestSample.params.particleCount + (Math.random() - 0.5) * 2000
        )
      ),
      renderScale: Math.max(
        paramRanges.renderScale.min,
        Math.min(
          paramRanges.renderScale.max,
          bestSample.params.renderScale + (Math.random() - 0.5) * 0.2
        )
      ),
      shadowQuality: Math.max(
        paramRanges.shadowQuality.min,
        Math.min(
          paramRanges.shadowQuality.max,
          bestSample.params.shadowQuality + (Math.random() - 0.5) * 0.2
        )
      ),
      postProcessing: bestSample.params.postProcessing,
      textureMemory: Math.max(
        paramRanges.textureMemory.min,
        Math.min(
          paramRanges.textureMemory.max,
          bestSample.params.textureMemory + (Math.random() - 0.5) * 20
        )
      ),
      objectCount: Math.max(
        paramRanges.objectCount.min,
        Math.min(
          paramRanges.objectCount.max,
          bestSample.params.objectCount + (Math.random() - 0.5) * 100
        )
      ),
      complexObjectCount: Math.max(
        paramRanges.complexObjectCount.min,
        Math.min(
          paramRanges.complexObjectCount.max,
          bestSample.params.complexObjectCount + Math.floor((Math.random() - 0.5) * 10)
        )
      )
    }
  }

  /**
   * 生成候选参数组合
   */
  private generateCandidateParameters(searchSpace: any, count: number): OptimizationParams[] {
    const candidates: OptimizationParams[] = []

    for (let i = 0; i < count; i++) {
      const candidate: OptimizationParams = {
        particleCount: this.randomInRange(searchSpace.particleCount),
        renderScale: this.randomInRange(searchSpace.renderScale),
        shadowQuality: this.randomInRange(searchSpace.shadowQuality),
        postProcessing: this.randomFromOptions(searchSpace.postProcessing.options),
        textureMemory: this.randomInRange(searchSpace.textureMemory),
        objectCount: this.randomInRange(searchSpace.objectCount),
        complexObjectCount: this.randomInRange(searchSpace.complexObjectCount)
      }

      candidates.push(candidate)
    }

    return candidates
  }

  /**
   * 在范围内随机生成数值
   */
  private randomInRange(range: { min: number; max: number; step: number }): number {
    const steps = Math.floor((range.max - range.min) / range.step)
    const randomStep = Math.floor(Math.random() * (steps + 1))
    return range.min + randomStep * range.step
  }

  /**
   * 从选项中随机选择
   */
  private randomFromOptions(options: any[]): any {
    return options[Math.floor(Math.random() * options.length)]
  }

  /**
   * 获取默认参数
   */
  private getDefaultParameters(): OptimizationParams {
    return {
      particleCount: 5000,
      renderScale: 1.0,
      shadowQuality: 0.5,
      postProcessing: false,
      textureMemory: 50,
      objectCount: 200,
      complexObjectCount: 20
    }
  }

  /**
   * 保存模型
   */
  public async saveModel(): Promise<void> {
    if (!this.model) return

    try {
      await this.model.save('localstorage://performance-predictor-model')
      console.log('Model saved to localStorage!')
    } catch (error) {
      console.error('Failed to save model:', error)
    }
  }

  /**
   * 加载模型
   */
  public async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel('localstorage://performance-predictor-model')
      this.isTrained = true
      console.log('Model loaded from localStorage!')
    } catch (error) {
      console.warn('Failed to load model, creating new model:', error)
      this.initModel()
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
  }
}

// 导出单例实例
export const mlPerformancePredictor = new MLPerformancePredictor()
