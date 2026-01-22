// 统一场论可视化系统 - 系统管理器
// 版本: v2.0
// 功能: 整合和管理所有系统组件

import { MultiScaleVisualizationManager } from './visualization/MultiScaleVisualizationManager';
import { RealTimeDataStream } from './streaming/RealTimeDataStream';
import { NetworkVisualization } from './network/NetworkVisualization';
import { PerformanceManager } from './performance/PerformanceManager';
import { ParallelComputing } from './parallel/ParallelComputing';
import { UnifiedFieldPhysicsEngine } from './physics/engines/UnifiedFieldPhysicsEngine';
import { RaytracingEngine2 } from './rendering/engines/RaytracingEngine2';
import { VolumeRenderingEngine2 } from './rendering/engines/VolumeRenderingEngine2';
import { PathTracingEngine2 } from './rendering/engines/PathTracingEngine2';
import { AIOptimizer } from './ai/engines/AIOptimizer';
import { SmartRenderManager } from './ai/engines/SmartRenderManager';

export class SystemManager {
  private components: Map<string, any> = new Map();
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 16; // ~60 FPS
  private updateTimeout: number | null = null;
  private useAdvancedOptimization: boolean = true;
  private enableRealTimeMonitoring: boolean = true;
  private systemStats: any = {
    uptime: 0,
    updates: 0,
    components: 0,
    lastUpdate: 0
  };

  constructor() {
    console.log('🎛️  系统管理器初始化');
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('⚠️  系统已经初始化');
      return true;
    }

    console.log('🚀 系统初始化开始');

    try {
      // 初始化核心组件
      await this.initCoreComponents();

      // 初始化可视化组件
      await this.initVisualizationComponents();

      // 初始化数据流组件
      await this.initStreamingComponents();

      // 初始化性能组件
      await this.initPerformanceComponents();

      // 初始化AI组件
      await this.initAIComponents();

      // 连接组件
      this.connectComponents();

      this.isInitialized = true;
      this.lastUpdateTime = Date.now();
      this.systemStats.components = this.components.size;

      console.log('✅ 系统初始化完成');
      console.log(`📊 已初始化组件: ${this.components.size}`);

      return true;
    } catch (error) {
      console.error('❌ 系统初始化失败:', error);
      return false;
    }
  }

  private async initCoreComponents(): Promise<void> {
    console.log('🔧 初始化核心组件');

    // 物理引擎
    const physicsEngine = new UnifiedFieldPhysicsEngine();
    this.components.set('physicsEngine', physicsEngine);

    // 渲染引擎
    const raytracingEngine = new RaytracingEngine2();
    const volumeRenderingEngine = new VolumeRenderingEngine2();
    const pathTracingEngine = new PathTracingEngine2();

    this.components.set('raytracingEngine', raytracingEngine);
    this.components.set('volumeRenderingEngine', volumeRenderingEngine);
    this.components.set('pathTracingEngine', pathTracingEngine);

    console.log('✅ 核心组件初始化完成');
  }

  private async initVisualizationComponents(): Promise<void> {
    console.log('🎨 初始化可视化组件');

    // 多尺度可视化管理器
    const visualizationManager = new MultiScaleVisualizationManager();
    this.components.set('visualizationManager', visualizationManager);

    console.log('✅ 可视化组件初始化完成');
  }

  private async initStreamingComponents(): Promise<void> {
    console.log('📡 初始化数据流组件');

    // 实时数据流
    const dataStream = new RealTimeDataStream();
    this.components.set('dataStream', dataStream);

    console.log('✅ 数据流组件初始化完成');
  }

  private async initPerformanceComponents(): Promise<void> {
    console.log('⚡ 初始化性能组件');

    // 性能管理器
    const performanceManager = new PerformanceManager();
    this.components.set('performanceManager', performanceManager);

    // 并行计算
    const parallelComputing = new ParallelComputing();
    this.components.set('parallelComputing', parallelComputing);

    console.log('✅ 性能组件初始化完成');
  }

  private async initAIComponents(): Promise<void> {
    console.log('🤖 初始化AI组件');

    // AI优化器
    const aiOptimizer = new AIOptimizer();
    this.components.set('aiOptimizer', aiOptimizer);

    // 智能渲染管理器
    const smartRenderManager = new SmartRenderManager();
    this.components.set('smartRenderManager', smartRenderManager);

    console.log('✅ AI组件初始化完成');
  }

  private connectComponents(): void {
    console.log('🔗 连接系统组件');

    // 连接物理引擎和渲染引擎
    const physicsEngine = this.components.get('physicsEngine');
    const raytracingEngine = this.components.get('raytracingEngine');
    
    if (physicsEngine && raytracingEngine) {
      raytracingEngine.setPhysicsEngine(physicsEngine);
    }

    // 连接性能管理器和AI优化器
    const performanceManager = this.components.get('performanceManager');
    const aiOptimizer = this.components.get('aiOptimizer');
    
    if (performanceManager && aiOptimizer) {
      performanceManager.registerOptimizationHandler((stats) => {
        aiOptimizer.optimize(stats);
      });
    }

    console.log('✅ 组件连接完成');
  }

  public start(): void {
    if (this.isRunning) {
      console.log('▶️  系统已经在运行');
      return;
    }

    if (!this.isInitialized) {
      console.error('❌ 系统未初始化，无法启动');
      return;
    }

    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    this.systemStats.uptime = 0;
    this.systemStats.updates = 0;

    console.log('▶️  系统启动');

    // 启动各个组件
    this.startComponents();

    // 开始更新循环
    this.startUpdateLoop();
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log('⏹️  系统已经停止');
      return;
    }

    this.isRunning = false;

    // 停止更新循环
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    // 停止各个组件
    this.stopComponents();

    console.log('⏹️  系统停止');
  }

  private startComponents(): void {
    console.log('▶️  启动组件');

    // 启动数据流
    const dataStream = this.components.get('dataStream');
    if (dataStream) {
      dataStream.start();
    }

    // 启动性能监控
    const performanceManager = this.components.get('performanceManager');
    if (performanceManager && this.enableRealTimeMonitoring) {
      // 启动性能监控
    }

    console.log('✅ 组件启动完成');
  }

  private stopComponents(): void {
    console.log('⏹️  停止组件');

    // 停止数据流
    const dataStream = this.components.get('dataStream');
    if (dataStream) {
      dataStream.stop();
    }

    console.log('✅ 组件停止完成');
  }

  private startUpdateLoop(): void {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    // 更新系统
    this.update(deltaTime);

    // 更新统计
    this.systemStats.updates++;
    this.systemStats.uptime = (currentTime - this.lastUpdateTime) / 1000;
    this.systemStats.lastUpdate = currentTime;

    // 继续循环
    this.updateTimeout = setTimeout(() => {
      this.startUpdateLoop();
    }, this.updateInterval) as unknown as number;

    this.lastUpdateTime = currentTime;
  }


  private update(deltaTime: number): void {
    // 性能监控
    const updateStart = performance.now();
    
    // 更新各个组件
    this.updateComponents(deltaTime);

    // 高级优化
    if (this.useAdvancedOptimization) {
      this.advancedOptimization();
    }

    // 实时监控
    if (this.enableRealTimeMonitoring && this.systemStats.updates % 60 === 0) {
      this.logSystemStats();
    }
    
    // 性能统计
    const updateEnd = performance.now();
    this.systemStats.updateTime = updateEnd - updateStart;
  }

  private updateComponents(deltaTime: number): void {
    // 优先级更新：先更新核心组件
    const physicsEngine = this.components.get('physicsEngine');
    if (physicsEngine) {
      physicsEngine.update(deltaTime);
    }

    // 渲染引擎 - 低优先级
    const raytracingEngine = this.components.get('raytracingEngine');
    if (raytracingEngine) {
      raytracingEngine.update(deltaTime);
    }

    // 可视化管理器 - 中优先级
    const visualizationManager = this.components.get('visualizationManager');
    if (visualizationManager) {
      visualizationManager.update(deltaTime);
    }

    // 数据流 - 低优先级
    const dataStream = this.components.get('dataStream');
    if (dataStream) {
      // 限制数据流更新频率，每2帧更新一次
      if (this.systemStats.updates % 2 === 0) {
        dataStream.update(deltaTime);
      }
    }

    // 性能管理器 - 中优先级
    const performanceManager = this.components.get('performanceManager');
    if (performanceManager) {
      performanceManager.update(deltaTime);
    }
  }

  private advancedOptimization(): void {
    // AI驱动的高级优化
    const aiOptimizer = this.components.get('aiOptimizer');
    const performanceManager = this.components.get('performanceManager');
    
    if (aiOptimizer && performanceManager) {
      const stats = performanceManager.getStats();
      aiOptimizer.optimize(stats);
    }

    // 智能渲染管理
    const smartRenderManager = this.components.get('smartRenderManager');
    if (smartRenderManager) {
      smartRenderManager.update();
    }

    // 动态LOD调整
    this.adjustLOD();
  }

  private adjustLOD(): void {
    // 基于性能动态调整LOD
    const performanceManager = this.components.get('performanceManager');
    const visualizationManager = this.components.get('visualizationManager');
    
    if (performanceManager && visualizationManager) {
      const fps = performanceManager.getAverageFrameRate();
      
      // 根据FPS调整LOD
      if (fps < 30) {
        // 降低LOD
        visualizationManager.setLODLevel(0);
      } else if (fps < 45) {
        // 中等LOD
        visualizationManager.setLODLevel(1);
      } else {
        // 高LOD
        visualizationManager.setLODLevel(2);
      }
    }
  }


  public getComponent(name: string): any {
    return this.components.get(name) || null;
  }

  public getAvailableComponents(): string[] {
    return Array.from(this.components.keys());
  }

  public getSystemStats(): any {
    return {
      ...this.systemStats,
      components: this.components.size,
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  public logSystemStats(): void {
    const stats = this.getSystemStats();
    console.log('📊 系统状态:', {
      Uptime: stats.uptime.toFixed(2) + 's',
      Updates: stats.updates,
      Components: stats.components,
      Running: stats.isRunning,
      Initialized: stats.isInitialized
    });

    // 记录性能统计
    const performanceManager = this.components.get('performanceManager');
    if (performanceManager) {
      performanceManager.logStats();
    }

    // 记录并行计算统计
    const parallelComputing = this.components.get('parallelComputing');
    if (parallelComputing) {
      parallelComputing.logStats();
    }
  }

  public enableAdvancedOptimization(enabled: boolean): void {
    this.useAdvancedOptimization = enabled;
    console.log(`🔧 高级优化 ${enabled ? '启用' : '禁用'}`);
  }

  public enableRealTimeMonitoring(enabled: boolean): void {
    this.enableRealTimeMonitoring = enabled;
    console.log(`📊 实时监控 ${enabled ? '启用' : '禁用'}`);
  }

  public setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
    console.log(`⏰ 更新间隔设置为: ${interval}ms`);
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 系统关闭');

    // 停止系统
    this.stop();

    // 清理组件
    this.components.forEach((component, name) => {
      if (component.dispose) {
        try {
          component.dispose();
          console.log(`🧹 清理组件: ${name}`);
        } catch (error) {
          console.error(`❌ 清理组件 ${name} 出错:`, error);
        }
      }
    });

    this.components.clear();
    this.isInitialized = false;

    console.log('✅ 系统已完全关闭');
  }

  public async restart(): Promise<void> {
    console.log('🔄 系统重启');

    await this.shutdown();
    await this.initialize();
    this.start();

    console.log('✅ 系统重启完成');
  }

  public runPerformanceTest(duration: number = 10000): Promise<any> {
    return new Promise((resolve) => {
      console.log(`⚡ 性能测试开始，持续时间: ${duration}ms`);

      const startTime = Date.now();
      const initialStats = this.getSystemStats();

      const testInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        if (elapsed >= duration) {
          clearInterval(testInterval);

          const finalStats = this.getSystemStats();
          const performanceManager = this.components.get('performanceManager');
          const perfStats = performanceManager ? performanceManager.getStats() : null;

          const testResults = {
            duration,
            initialStats,
            finalStats,
            performanceStats: perfStats,
            updatesPerSecond: (finalStats.updates - initialStats.updates) / (duration / 1000),
            timestamp: Date.now()
          };

          console.log('📊 性能测试结果:', testResults);
          resolve(testResults);
        }
      }, 100);
    });
  }
}
