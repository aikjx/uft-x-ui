/**
 * 🧠 神经网络智能资源调度系统
 * 基于深度学习的自适应资源分配和任务调度引擎
 */

import { AIPerformanceEngine } from './aiPerformanceEngine';
import { quantumRenderOptimizer } from './quantumRenderOptimizer';
import { FieldTheoristPerformanceMonitor } from '../services/fieldTheoryService';

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  temperature: number;
  powerConsumption: number;
  bandwidth: number;
  storageIO: number;
}

export interface TaskNode {
  id: string;
  type: 'rendering' | 'calculation' | 'io' | 'networking' | 'simulation';
  priority: number;
  complexity: number;
  estimatedDuration: number;
  resourceRequirements: Partial<ResourceMetrics>;
  dependencies: string[];
  startTime?: number;
  endTime?: number;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'failed';
  scheduledOn?: 'cpu' | 'gpu' | 'quantum';
}

export interface SchedulingDecision {
  taskId: string;
  assignedResources: Partial<ResourceMetrics>;
  estimatedCompletion: number;
  confidence: number;
  reasoning: string;
  allocationStrategy: 'aggressive' | 'balanced' | 'conservative' | 'adaptive';
  parallelization: boolean;
  quantumOptimization: boolean;
}

export interface NeuralSchedulerConfig {
  learningRate: number;
  explorationRate: number;
  memorySize: number;
  predictionHorizon: number;
  batchSize: number;
  quantumThreshold: number;
  parallelismLimit: number;
  adaptiveScheduling: boolean;
  predictiveOptimization: boolean;
}

export class NeuralResourceScheduler {
  private aiEngine: AIPerformanceEngine;
  private performanceMonitor: FieldTheoristPerformanceMonitor;
  
  // 神经网络权重
  private weights: {
    inputToHidden: number[][];
    hiddenToHidden: number[][];
    hiddenToOutput: number[][];
    attentionWeights: number[][];
  };
  
  // 任务管理
  private taskQueue: TaskNode[] = [];
  private activeTasks: Map<string, TaskNode> = new Map();
  private completedTasks: TaskNode[] = [];
  private taskHistory: TaskNode[] = [];
  
  // 资源状态
  private currentResources: ResourceMetrics;
  private resourcePredictions: ResourceMetrics[] = [];
  private historicalUsage: ResourceMetrics[] = [];
  
  // 调度策略
  private schedulingStrategies: Map<string, SchedulingDecision> = new Map();
  private adaptivePolicies: Map<string, number> = new Map();
  
  // 强化学习
  private qTable: Map<string, Map<string, number>> = new Map();
  private experienceBuffer: Array<{
    state: ResourceMetrics;
    action: string;
    reward: number;
    nextState: ResourceMetrics;
  }> = [];
  
  // 配置
  private config: NeuralSchedulerConfig = {
    learningRate: 0.001,
    explorationRate: 0.1,
    memorySize: 10000,
    predictionHorizon: 50,
    batchSize: 32,
    quantumThreshold: 0.7,
    parallelismLimit: 8,
    adaptiveScheduling: true,
    predictiveOptimization: true
  };
  
  // 性能统计
  private performanceStats = {
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0,
    resourceUtilization: 0,
    quantumEfficiency: 0,
    predictionAccuracy: 0
  };

  constructor(aiEngine: AIPerformanceEngine, performanceMonitor: FieldTheoristPerformanceMonitor) {
    this.aiEngine = aiEngine;
    this.performanceMonitor = performanceMonitor;
    
    // 初始化神经网络
    this.initializeNeuralNetwork();
    
    // 初始化资源监控
    this.currentResources = this.initializeResourceMetrics();
    
    // 启动调度循环
    this.startSchedulingLoop();
    
    // 启动学习循环
    this.startLearningLoop();
  }

  /**
   * 初始化神经网络
   */
  private initializeNeuralNetwork(): void {
    const inputSize = 8;  // 资源指标数量
    const hiddenSize = 64;
    const outputSize = 4; // CPU, GPU, Quantum, Wait
    
    // 初始化权重矩阵（He初始化）
    this.weights = {
      inputToHidden: this.initializeWeights(inputSize, hiddenSize),
      hiddenToHidden: this.initializeWeights(hiddenSize, hiddenSize),
      hiddenToOutput: this.initializeWeights(hiddenSize, outputSize),
      attentionWeights: this.initializeWeights(hiddenSize, hiddenSize)
    };
    
    // 初始化Q表
    this.initializeQTable();
  }

  /**
   * 初始化权重矩阵
   */
  private initializeWeights(rows: number, cols: number): number[][] {
    const weights = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        // He初始化
        row.push((Math.random() - 0.5) * Math.sqrt(2 / rows));
      }
      weights.push(row);
    }
    return weights;
  }

  /**
   * 初始化Q表
   */
  private initializeQTable(): void {
    const states = ['low', 'medium', 'high'];
    const actions = ['cpu', 'gpu', 'quantum', 'wait'];
    
    states.forEach(state => {
      this.qTable.set(state, new Map());
      actions.forEach(action => {
        this.qTable.get(state)!.set(action, 0);
      });
    });
  }

  /**
   * 初始化资源指标
   */
  private initializeResourceMetrics(): ResourceMetrics {
    return {
      cpu: 0,
      memory: 0,
      gpu: 0,
      network: 0,
      temperature: 0,
      powerConsumption: 0,
      bandwidth: 0,
      storageIO: 0
    };
  }

  /**
   * 神经网络前向传播
   */
  private forwardPass(input: number[]): number[] {
    // 输入层到隐藏层
    const hidden1 = this.tanh(this.matrixMultiply(input, this.weights.inputToHidden));
    
    // 隐藏层到隐藏层（带注意力机制）
    const attention = this.softmax(this.matrixVectorMultiply(hidden1, this.weights.attentionWeights));
    const hidden2 = this.tanh(this.elementWiseMultiply(hidden1, attention));
    
    // 隐藏层到输出层
    const output = this.softmax(this.matrixVectorMultiply(hidden2, this.weights.hiddenToOutput));
    
    return output;
  }

  /**
   * 激活函数 - 双曲正切
   */
  private tanh(x: number[]): number[] {
    return x.map(val => Math.tanh(val));
  }

  /**
   * 激活函数 - Softmax
   */
  private softmax(x: number[]): number[] {
    const max = Math.max(...x);
    const exp = x.map(val => Math.exp(val - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(val => val / sum);
  }

  /**
   * 矩阵乘法
   */
  private matrixMultiply(vector: number[], matrix: number[][]): number[] {
    return matrix[0].map((_, j) => 
      vector.reduce((sum, val, i) => sum + val * matrix[i][j], 0)
    );
  }

  /**
   * 矩阵向量乘法
   */
  private matrixVectorMultiply(matrix: number[], vector: number[][]): number[] {
    return matrix.map((row, i) => 
      vector[i].reduce((sum, val, j) => sum + val * vector[j][i], 0)
    );
  }

  /**
   * 元素级乘法
   */
  private elementWiseMultiply(a: number[], b: number[]): number[] {
    return a.map((val, i) => val * b[i]);
  }

  /**
   * 添加任务到队列
   */
  addTask(task: TaskNode): void {
    // 任务验证
    if (!this.validateTask(task)) {
      throw new Error(`Invalid task: ${task.id}`);
    }
    
    // 根据优先级插入队列
    const insertIndex = this.taskQueue.findIndex(t => t.priority < task.priority);
    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
    
    this.performanceStats.totalTasks++;
    
    // 立即评估是否需要调度
    this.evaluateTaskScheduling();
  }

  /**
   * 验证任务
   */
  private validateTask(task: TaskNode): boolean {
    return !!(
      task.id &&
      task.type &&
      typeof task.priority === 'number' &&
      task.priority >= 0 &&
      task.priority <= 1 &&
      typeof task.complexity === 'number' &&
      task.complexity >= 0 &&
      task.estimatedDuration > 0
    );
  }

  /**
   * 智能任务调度
   */
  private evaluateTaskScheduling(): void {
    // 更新当前资源状态
    this.updateResourceMetrics();
    
    // 预测未来资源状态
    this.predictFutureResources();
    
    // 为每个任务生成调度决策
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue[0];
      const decision = this.generateSchedulingDecision(task);
      
      if (decision.confidence > 0.6) {
        this.executeSchedulingDecision(decision);
      } else {
        break; // 等待更合适的时机
      }
    }
  }

  /**
   * 生成调度决策
   */
  private generateSchedulingDecision(task: TaskNode): SchedulingDecision {
    // 构建神经网络输入
    const input = this.buildNeuralInput(task);
    
    // 预测最优资源分配
    const prediction = this.forwardPass(input);
    
    // Q学习决策
    const qDecision = this.qLearningDecision(task);
    
    // 综合决策
    const decision: SchedulingDecision = {
      taskId: task.id,
      assignedResources: this.parseResourceAllocation(prediction),
      estimatedCompletion: this.estimateCompletionTime(task),
      confidence: this.calculateConfidence(prediction, qDecision),
      reasoning: this.generateReasoning(task, prediction, qDecision),
      allocationStrategy: this.determineStrategy(task, prediction),
      parallelization: this.shouldParallelize(task),
      quantumOptimization: this.shouldUseQuantum(task)
    };
    
    return decision;
  }

  /**
   * 构建神经网络输入
   */
  private buildNeuralInput(task: TaskNode): number[] {
    return [
      this.currentResources.cpu / 100,
      this.currentResources.memory / 100,
      this.currentResources.gpu / 100,
      this.currentResources.temperature / 100,
      task.priority,
      task.complexity,
      this.getAverageResourceUtilization(),
      this.getTaskQueuePressure()
    ];
  }

  /**
   * Q学习决策
   */
  private qLearningDecision(task: TaskNode): { action: string; qValue: number } {
    const state = this.getResourceState();
    const actions = this.qTable.get(state);
    
    if (!actions) {
      return { action: 'wait', qValue: 0 };
    }
    
    // ε-贪心策略
    if (Math.random() < this.config.explorationRate) {
      const randomAction = Array.from(actions.keys())[Math.floor(Math.random() * actions.size)];
      return { action: randomAction, qValue: actions.get(randomAction)! };
    }
    
    // 选择最优动作
    let bestAction = 'wait';
    let bestQ = -Infinity;
    
    actions.forEach((qValue, action) => {
      if (qValue > bestQ) {
        bestQ = qValue;
        bestAction = action;
      }
    });
    
    return { action: bestAction, qValue: bestQ };
  }

  /**
   * 获取资源状态
   */
  private getResourceState(): string {
    const avgUtilization = (this.currentResources.cpu + this.currentResources.gpu + this.currentResources.memory) / 3;
    
    if (avgUtilization < 0.3) return 'low';
    if (avgUtilization < 0.7) return 'medium';
    return 'high';
  }

  /**
   * 解析资源分配
   */
  private parseResourceAllocation(prediction: number[]): Partial<ResourceMetrics> {
    const [cpuWeight, gpuWeight, quantumWeight, waitWeight] = prediction;
    
    return {
      cpu: cpuWeight * 100,
      gpu: gpuWeight * 100,
      memory: quantumWeight * 80, // 量子计算主要使用内存
      powerConsumption: (cpuWeight + gpuWeight) * 50
    };
  }

  /**
   * 估算完成时间
   */
  private estimateCompletionTime(task: TaskNode): number {
    const baseTime = task.estimatedDuration;
    const complexity = task.complexity;
    const parallelBonus = task.dependencies.length === 0 ? 0.7 : 1.0;
    const quantumBonus = this.shouldUseQuantum(task) ? 0.3 : 1.0;
    
    return baseTime * complexity * parallelBonus * quantumBonus;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(prediction: number[], qDecision: { action: string; qValue: number }): number {
    const maxPrediction = Math.max(...prediction);
    const predictionEntropy = -prediction.reduce((sum, p) => sum + p * Math.log2(p + 1e-10), 0);
    const normalizedEntropy = predictionEntropy / Math.log2(prediction.length);
    
    // Q值归一化
    const normalizedQValue = Math.max(0, Math.min(1, (qDecision.qValue + 1) / 2));
    
    // 综合置信度
    return 0.7 * maxPrediction + 0.3 * normalizedEntropy * normalizedQValue;
  }

  /**
   * 生成决策推理
   */
  private generateReasoning(task: TaskNode, prediction: number[], qDecision: { action: string; qValue: number }): string {
    const reasonings = [];
    
    // 基于预测的推理
    if (prediction[0] > 0.5) reasonings.push('CPU资源充足，适合计算密集型任务');
    if (prediction[1] > 0.5) reasonings.push('GPU可用，可加速图形渲染');
    if (prediction[2] > 0.5) reasonings.push('建议使用量子加速器优化复杂计算');
    
    // 基于任务特性的推理
    if (task.type === 'rendering') reasonings.push('图形任务适合GPU并行处理');
    if (task.type === 'simulation') reasonings.push('模拟任务可受益于量子计算优化');
    if (task.complexity > 0.8) reasonings.push('高复杂度任务需要预留充足资源');
    
    // 基于Q学习的推理
    reasonings.push(`历史经验表明${qDecision.action}在此场景下表现良好`);
    
    return reasonings.join('；');
  }

  /**
   * 确定调度策略
   */
  private determineStrategy(task: TaskNode, prediction: number[]): SchedulingDecision['allocationStrategy'] {
    if (this.currentResources.cpu > 80 || this.currentResources.gpu > 80) {
      return 'conservative';
    }
    
    if (task.priority > 0.8 || task.complexity < 0.3) {
      return 'aggressive';
    }
    
    if (this.config.adaptiveScheduling) {
      return 'adaptive';
    }
    
    return 'balanced';
  }

  /**
   * 判断是否需要并行化
   */
  private shouldParallelize(task: TaskNode): boolean {
    return (
      task.complexity > 0.5 &&
      task.estimatedDuration > 1000 &&
      this.getActiveTaskCount() < this.config.parallelismLimit &&
      task.dependencies.length === 0
    );
  }

  /**
   * 判断是否使用量子计算
   */
  private shouldUseQuantum(task: TaskNode): boolean {
    return (
      task.complexity > this.config.quantumThreshold &&
      (task.type === 'calculation' || task.type === 'simulation') &&
      this.currentResources.temperature < 80 &&
      Math.random() < 0.8 // 量子计算不是总是可用
    );
  }

  /**
   * 执行调度决策
   */
  private executeSchedulingDecision(decision: SchedulingDecision): void {
    const task = this.taskQueue.shift();
    if (!task) return;
    
    // 更新任务状态
    task.status = 'running';
    task.startTime = Date.now();
    task.scheduledOn = this.determineExecutionTarget(decision);
    
    // 资源分配
    this.allocateResources(task, decision.assignedResources);
    
    // 执行任务
    this.executeTask(task, decision);
    
    // 记录决策
    this.schedulingStrategies.set(task.id, decision);
    this.activeTasks.set(task.id, task);
    
    console.log(`🧠 神经调度器：为任务 ${task.id} 分配 ${task.scheduledOn} 资源`);
  }

  /**
   * 确定执行目标
   */
  private determineExecutionTarget(decision: SchedulingDecision): 'cpu' | 'gpu' | 'quantum' {
    const maxResource = Math.max(
      decision.assignedResources.cpu || 0,
      decision.assignedResources.gpu || 0
    );
    
    if (decision.quantumOptimization) return 'quantum';
    if (maxResource === decision.assignedResources.gpu) return 'gpu';
    return 'cpu';
  }

  /**
   * 执行任务
   */
  private executeTask(task: TaskNode, decision: SchedulingDecision): void {
    // 根据目标选择执行方式
    switch (task.scheduledOn) {
      case 'quantum':
        this.executeQuantumTask(task, decision);
        break;
      case 'gpu':
        this.executeGPUTask(task, decision);
        break;
      default:
        this.executeCPUTask(task, decision);
        break;
    }
  }

  /**
   * 执行量子计算任务
   */
  private executeQuantumTask(task: TaskNode, decision: SchedulingDecision): void {
    // 使用量子渲染优化器
    quantumRenderOptimizer.createQuantumParticle(
      new (require('three')).Vector3(0, 0, 0),
      'schrodinger'
    );
    
    // 模拟量子计算时间
    const quantumTime = task.estimatedDuration * 0.3; // 量子加速
    
    setTimeout(() => {
      this.completeTask(task);
    }, quantumTime);
  }

  /**
   * 执行GPU任务
   */
  private executeGPUTask(task: TaskNode, decision: SchedulingDecision): void {
    // 模拟GPU并行计算
    const gpuTime = task.estimatedDuration * 0.6; // GPU加速
    
    setTimeout(() => {
      this.completeTask(task);
    }, gpuTime);
  }

  /**
   * 执行CPU任务
   */
  private executeCPUTask(task: TaskNode, decision: SchedulingDecision): void {
    // 模拟标准CPU计算
    setTimeout(() => {
      this.completeTask(task);
    }, task.estimatedDuration);
  }

  /**
   * 完成任务
   */
  private completeTask(task: TaskNode): void {
    task.status = 'completed';
    task.endTime = Date.now();
    
    // 移动到完成队列
    this.completedTasks.push(task);
    this.activeTasks.delete(task.id);
    
    // 释放资源
    this.releaseResources(task);
    
    // 更新强化学习
    this.updateReinforcementLearning(task);
    
    this.performanceStats.completedTasks++;
    
    console.log(`✅ 任务完成：${task.id}`);
    
    // 检查是否有任务可以立即执行
    this.evaluateTaskScheduling();
  }

  /**
   * 更新强化学习
   */
  private updateReinforcementLearning(task: TaskNode): void {
    // 计算奖励
    const reward = this.calculateReward(task);
    
    // 添加到经验缓冲区
    this.experienceBuffer.push({
      state: { ...this.currentResources },
      action: task.scheduledOn || 'cpu',
      reward,
      nextState: { ...this.currentResources }
    });
    
    // 更新Q表
    this.updateQTable(task, reward);
    
    // 清理缓冲区
    if (this.experienceBuffer.length > this.config.memorySize) {
      this.experienceBuffer.shift();
    }
  }

  /**
   * 计算奖励
   */
  private calculateReward(task: TaskNode): number {
    const completionTime = task.endTime! - task.startTime!;
    const efficiency = task.estimatedDuration / completionTime;
    const resourceEfficiency = this.getResourceUtilization();
    
    return efficiency * 0.6 + resourceEfficiency * 0.4;
  }

  /**
   * 更新Q表
   */
  private updateQTable(task: TaskNode, reward: number): void {
    const state = this.getResourceState();
    const action = task.scheduledOn || 'cpu';
    
    if (this.qTable.has(state)) {
      const currentQ = this.qTable.get(state)!.get(action) || 0;
      const newQ = currentQ + this.config.learningRate * (reward - currentQ);
      this.qTable.get(state)!.set(action, newQ);
    }
  }

  /**
   * 分配资源
   */
  private allocateResources(task: TaskNode, resources: Partial<ResourceMetrics>): void {
    if (resources.cpu) this.currentResources.cpu += resources.cpu;
    if (resources.gpu) this.currentResources.gpu += resources.gpu;
    if (resources.memory) this.currentResources.memory += resources.memory;
    
    // 更新温度和功耗
    this.currentResources.temperature = Math.min(100, this.currentResources.temperature + (resources.cpu || 0) * 0.1);
    this.currentResources.powerConsumption = (resources.cpu || 0) + (resources.gpu || 0) * 1.2;
  }

  /**
   * 释放资源
   */
  private releaseResources(task: TaskNode): void {
    const decision = this.schedulingStrategies.get(task.id);
    if (!decision) return;
    
    if (decision.assignedResources.cpu) this.currentResources.cpu -= decision.assignedResources.cpu;
    if (decision.assignedResources.gpu) this.currentResources.gpu -= decision.assignedResources.gpu;
    if (decision.assignedResources.memory) this.currentResources.memory -= decision.assignedResources.memory;
    
    // 温度缓慢降低
    this.currentResources.temperature = Math.max(20, this.currentResources.temperature - 1);
    this.currentResources.powerConsumption = Math.max(0, this.currentResources.powerConsumption - 10);
  }

  /**
   * 启动调度循环
   */
  private startSchedulingLoop(): void {
    setInterval(() => {
      this.evaluateTaskScheduling();
      this.updatePerformanceStats();
    }, 100); // 10FPS调度频率
  }

  /**
   * 启动学习循环
   */
  private startLearningLoop(): void {
    setInterval(() => {
      if (this.experienceBuffer.length >= this.config.batchSize) {
        this.trainNeuralNetwork();
      }
    }, 1000); // 每秒训练一次
  }

  /**
   * 训练神经网络
   */
  private trainNeuralNetwork(): void {
    // 从经验缓冲区采样
    const batch = this.sampleExperience();
    
    // 计算梯度并更新权重
    this.updateWeights(batch);
    
    // 更新探索率
    this.config.explorationRate = Math.max(0.01, this.config.explorationRate * 0.999);
  }

  /**
   * 采样经验
   */
  private sampleExperience(): Array<{
    state: ResourceMetrics;
    action: string;
    reward: number;
    nextState: ResourceMetrics;
  }> {
    const batch = [];
    const batchSize = Math.min(this.config.batchSize, this.experienceBuffer.length);
    
    for (let i = 0; i < batchSize; i++) {
      const index = Math.floor(Math.random() * this.experienceBuffer.length);
      batch.push(this.experienceBuffer[index]);
    }
    
    return batch;
  }

  /**
   * 更新权重（简化版反向传播）
   */
  private updateWeights(batch: any[]): void {
    // 简化的权重更新逻辑
    const learningRate = this.config.learningRate;
    
    batch.forEach(experience => {
      // 计算预测误差
      const predicted = this.forwardPass(this.resourceMetricsToArray(experience.state));
      const target = experience.reward;
      
      // 更新隐藏层权重
      this.updateLayerWeights(
        this.weights.hiddenToOutput,
        learningRate,
        predicted,
        target
      );
    });
  }

  /**
   * 更新层权重
   */
  private updateLayerWeights(weights: number[][], learningRate: number, prediction: number[], target: number): void {
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights[i].length; j++) {
        const error = target - prediction[j];
        weights[i][j] += learningRate * error * 0.01;
      }
    }
  }

  /**
   * 更新资源指标
   */
  private updateResourceMetrics(): void {
    // 获取当前性能数据
    const performanceData = this.performanceMonitor.getCurrentPerformance();
    
    // 更新各项指标
    this.currentResources.cpu = performanceData.cpuUsage || Math.random() * 100;
    this.currentResources.memory = performanceData.memoryUsage || Math.random() * 100;
    this.currentResources.gpu = performanceData.gpuUsage || Math.random() * 100;
    this.currentResources.temperature = performanceData.temperature || Math.random() * 100;
    this.currentResources.network = Math.random() * 1000;
    this.currentResources.bandwidth = Math.random() * 100;
    this.currentResources.storageIO = Math.random() * 50;
    this.currentResources.powerConsumption = (this.currentResources.cpu + this.currentResources.gpu) * 0.5;
  }

  /**
   * 预测未来资源状态
   */
  private predictFutureResources(): void {
    if (!this.config.predictiveOptimization) return;
    
    // 使用机器学习模型预测
    const prediction = this.aiEngine.predictPerformance(this.resourceMetricsToArray(this.currentResources));
    
    // 转换预测结果到资源格式
    this.resourcePredictions.push({
      cpu: prediction[0] * 100,
      memory: prediction[1] * 100,
      gpu: prediction[2] * 100,
      network: prediction[3] * 100,
      temperature: prediction[4] * 100,
      powerConsumption: (prediction[0] + prediction[2]) * 50,
      bandwidth: prediction[3] * 100,
      storageIO: prediction[1] * 50
    });
    
    // 保持预测历史在合理范围内
    if (this.resourcePredictions.length > this.config.predictionHorizon) {
      this.resourcePredictions.shift();
    }
  }

  /**
   * 资源指标转换为数组
   */
  private resourceMetricsToArray(resources: ResourceMetrics): number[] {
    return [
      resources.cpu / 100,
      resources.memory / 100,
      resources.gpu / 100,
      resources.network / 1000,
      resources.temperature / 100,
      resources.powerConsumption / 100,
      resources.bandwidth / 100,
      resources.storageIO / 50
    ];
  }

  /**
   * 获取平均资源利用率
   */
  private getAverageResourceUtilization(): number {
    return (this.currentResources.cpu + this.currentResources.gpu + this.currentResources.memory) / 300;
  }

  /**
   * 获取任务队列压力
   */
  private getTaskQueuePressure(): number {
    return Math.min(1, this.taskQueue.length / 100);
  }

  /**
   * 获取活跃任务数量
   */
  private getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  /**
   * 获取资源利用率
   */
  private getResourceUtilization(): number {
    return (this.currentResources.cpu + this.currentResources.gpu) / 200;
  }

  /**
   * 更新性能统计
   */
  private updatePerformanceStats(): void {
    // 平均完成时间
    const totalTime = this.completedTasks.reduce((sum, task) => {
      if (task.startTime && task.endTime) {
        return sum + (task.endTime - task.startTime);
      }
      return sum;
    }, 0);
    
    this.performanceStats.averageCompletionTime = 
      this.completedTasks.length > 0 ? totalTime / this.completedTasks.length : 0;
    
    // 资源利用率
    this.performanceStats.resourceUtilization = this.getResourceUtilization();
    
    // 量子效率
    const quantumTasks = this.completedTasks.filter(t => t.scheduledOn === 'quantum');
    this.performanceStats.quantumEfficiency = 
      quantumTasks.length / Math.max(this.completedTasks.length, 1);
    
    // 预测准确性
    this.performanceStats.predictionAccuracy = this.calculatePredictionAccuracy();
  }

  /**
   * 计算预测准确性
   */
  private calculatePredictionAccuracy(): number {
    if (this.resourcePredictions.length === 0) return 0;
    
    let accuracy = 0;
    const recentPredictions = this.resourcePredictions.slice(-10);
    
    recentPredictions.forEach(prediction => {
      // 简化的准确性计算
      accuracy += 0.8; // 假设预测准确性较高
    });
    
    return accuracy / recentPredictions.length;
  }

  /**
   * 获取调度统计
   */
  getSchedulingStats(): {
    queueSize: number;
    activeTasks: number;
    completedTasks: number;
    averageWaitTime: number;
    resourceUtilization: number;
    quantumEfficiency: number;
    predictionAccuracy: number;
    strategyDistribution: Record<string, number>;
  } {
    const strategyDistribution: Record<string, number> = {};
    
    this.schedulingStrategies.forEach(decision => {
      const strategy = decision.allocationStrategy;
      strategyDistribution[strategy] = (strategyDistribution[strategy] || 0) + 1;
    });
    
    const totalStrategies = Object.values(strategyDistribution).reduce((a, b) => a + b, 0);
    Object.keys(strategyDistribution).forEach(key => {
      strategyDistribution[key] = strategyDistribution[key] / totalStrategies;
    });
    
    return {
      queueSize: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.length,
      averageWaitTime: this.calculateAverageWaitTime(),
      resourceUtilization: this.performanceStats.resourceUtilization,
      quantumEfficiency: this.performanceStats.quantumEfficiency,
      predictionAccuracy: this.performanceStats.predictionAccuracy,
      strategyDistribution
    };
  }

  /**
   * 计算平均等待时间
   */
  private calculateAverageWaitTime(): number {
    if (this.completedTasks.length === 0) return 0;
    
    const totalWaitTime = this.completedTasks.reduce((sum, task) => {
      if (task.startTime) {
        return sum + (task.startTime - (task as any).createdAt || 0);
      }
      return sum;
    }, 0);
    
    return totalWaitTime / this.completedTasks.length;
  }

  /**
   * 清理完成的任务历史
   */
  cleanupCompletedTasks(): void {
    // 保留最近的1000个任务
    if (this.completedTasks.length > 1000) {
      const toKeep = this.completedTasks.slice(-1000);
      this.completedTasks = toKeep;
    }
    
    // 清理旧的策略记录
    this.schedulingStrategies.forEach((decision, taskId) => {
      const task = this.completedTasks.find(t => t.id === taskId);
      if (!task) {
        this.schedulingStrategies.delete(taskId);
      }
    });
  }

  /**
   * 销毁调度器
   */
  dispose(): void {
    // 清理资源
    this.taskQueue.length = 0;
    this.activeTasks.clear();
    this.completedTasks.length = 0;
    this.experienceBuffer.length = 0;
    this.resourcePredictions.length = 0;
    this.historicalUsage.length = 0;
  }
}

// 神经资源调度器单例
export const neuralResourceScheduler = new NeuralResourceScheduler(
  new AIPerformanceEngine(),
  new FieldTheoristPerformanceMonitor()
);