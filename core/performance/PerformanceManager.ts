// 统一场论可视化系统 - 性能管理器
// 版本: v2.0
// 功能: 管理系统性能和资源使用

export class PerformanceManager {
  private frameRates: number[] = [];
  private maxFrameRateSamples: number = 60;
  private lastFrameTime: number = 0;
  private currentFrameRate: number = 0;
  private averageFrameRate: number = 0;
  private minimumFrameRate: number = 60;
  private maximumFrameRate: number = 0;
  private memoryUsage: number = 0;
  private cpuUsage: number = 0;
  private gpuUsage: number = 0;
  private drawCalls: number = 0;
  private triangles: number = 0;
  private vertices: number = 0;
  private textureMemory: number = 0;
  private enablePerformanceMonitoring: boolean = true;
  private enableAutoOptimization: boolean = true;
  private performanceThreshold: number = 30; // FPS
  private optimizationHandlers: Function[] = [];
  private lastOptimizationTime: number = 0;
  private optimizationInterval: number = 5000; // 5秒

  constructor() {
    console.log('⚡ 性能管理器初始化');
    this.startMonitoring();
  }

  private startMonitoring(): void {
    if (this.enablePerformanceMonitoring) {
      console.log('📊 性能监控启动');
      // 这里可以启动性能监控
    }
  }

  public update(deltaTime: number): void {
    // 计算帧率
    this.calculateFrameRate(deltaTime);

    // 监控资源使用
    this.monitorResources();

    // 自动优化
    if (this.enableAutoOptimization) {
      this.autoOptimize();
    }
  }

  private calculateFrameRate(deltaTime: number): void {
    if (deltaTime > 0) {
      this.currentFrameRate = 1000 / deltaTime;
      
      // 添加到样本
      this.frameRates.push(this.currentFrameRate);
      
      // 限制样本数量
      if (this.frameRates.length > this.maxFrameRateSamples) {
        this.frameRates.shift();
      }
      
      // 计算统计数据
      this.calculateFrameRateStats();
    }
  }

  private calculateFrameRateStats(): void {
    if (this.frameRates.length === 0) return;

    // 平均值
    this.averageFrameRate = this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length;

    // 最小值
    this.minimumFrameRate = Math.min(...this.frameRates);

    // 最大值
    this.maximumFrameRate = Math.max(...this.frameRates);
  }

  private monitorResources(): void {
    // 监控内存使用
    if (performance && (performance as any).memory) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // 监控CPU使用
    // 这里可以实现CPU使用监控

    // 监控GPU使用
    // 这里可以实现GPU使用监控
  }

  private autoOptimize(): void {
    const currentTime = Date.now();
    
    if (currentTime - this.lastOptimizationTime > this.optimizationInterval) {
      this.lastOptimizationTime = currentTime;

      // 检查性能是否低于阈值
      if (this.averageFrameRate < this.performanceThreshold) {
        console.warn(`⚠️  性能低于阈值 (${this.averageFrameRate.toFixed(2)} FPS < ${this.performanceThreshold} FPS)`);
        this.triggerOptimization();
      }
    }
  }

  private triggerOptimization(): void {
    // 触发优化处理
    this.optimizationHandlers.forEach(handler => {
      try {
        handler(this.getStats());
      } catch (error) {
        console.error('❌ 优化处理出错:', error);
      }
    });
  }

  public registerOptimizationHandler(handler: Function): void {
    this.optimizationHandlers.push(handler);
    console.log('🔧 注册优化处理程序');
  }

  public unregisterOptimizationHandler(handler: Function): void {
    const index = this.optimizationHandlers.indexOf(handler);
    if (index > -1) {
      this.optimizationHandlers.splice(index, 1);
      console.log('🔧 注销优化处理程序');
    }
  }

  public getFrameRate(): number {
    return this.currentFrameRate;
  }

  public getAverageFrameRate(): number {
    return this.averageFrameRate;
  }

  public getMinimumFrameRate(): number {
    return this.minimumFrameRate;
  }

  public getMaximumFrameRate(): number {
    return this.maximumFrameRate;
  }

  public getMemoryUsage(): number {
    return this.memoryUsage;
  }

  public getCpuUsage(): number {
    return this.cpuUsage;
  }

  public getGpuUsage(): number {
    return this.gpuUsage;
  }

  public getDrawCalls(): number {
    return this.drawCalls;
  }

  public getTriangles(): number {
    return this.triangles;
  }

  public getVertices(): number {
    return this.vertices;
  }

  public getTextureMemory(): number {
    return this.textureMemory;
  }

  public setDrawCalls(count: number): void {
    this.drawCalls = count;
  }

  public setTriangles(count: number): void {
    this.triangles = count;
  }

  public setVertices(count: number): void {
    this.vertices = count;
  }

  public setTextureMemory(memory: number): void {
    this.textureMemory = memory;
  }

  public setPerformanceThreshold(threshold: number): void {
    this.performanceThreshold = threshold;
    console.log(`📏 性能阈值设置为: ${threshold} FPS`);
  }

  public setOptimizationInterval(interval: number): void {
    this.optimizationInterval = interval;
    console.log(`⏰ 优化间隔设置为: ${interval}ms`);
  }

  public enablePerformanceMonitoring(enabled: boolean): void {
    this.enablePerformanceMonitoring = enabled;
    console.log(`📊 性能监控 ${enabled ? '启用' : '禁用'}`);
  }

  public enableAutoOptimization(enabled: boolean): void {
    this.enableAutoOptimization = enabled;
    console.log(`🔧 自动优化 ${enabled ? '启用' : '禁用'}`);
  }

  public getStats(): any {
    return {
      frameRate: this.currentFrameRate,
      averageFrameRate: this.averageFrameRate,
      minimumFrameRate: this.minimumFrameRate,
      maximumFrameRate: this.maximumFrameRate,
      memoryUsage: this.memoryUsage,
      cpuUsage: this.cpuUsage,
      gpuUsage: this.gpuUsage,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      vertices: this.vertices,
      textureMemory: this.textureMemory,
      timestamp: Date.now()
    };
  }

  public logStats(): void {
    const stats = this.getStats();
    console.log('📊 性能统计:', {
      FPS: stats.frameRate.toFixed(2),
      AvgFPS: stats.averageFrameRate.toFixed(2),
      MinFPS: stats.minimumFrameRate.toFixed(2),
      MaxFPS: stats.maximumFrameRate.toFixed(2),
      Memory: stats.memoryUsage.toFixed(2) + ' MB',
      DrawCalls: stats.drawCalls,
      Triangles: stats.triangles,
      Vertices: stats.vertices
    });
  }

  public resetStats(): void {
    this.frameRates = [];
    this.currentFrameRate = 0;
    this.averageFrameRate = 0;
    this.minimumFrameRate = 60;
    this.maximumFrameRate = 0;
    console.log('🧹 性能统计已重置');
  }

  public getPerformanceGrade(): string {
    const fps = this.averageFrameRate;
    
    if (fps >= 60) return 'Excellent 🎉';
    if (fps >= 45) return 'Good 👍';
    if (fps >= 30) return 'Fair ⚠️';
    if (fps >= 20) return 'Poor 🚨';
    return 'Critical 💥';
  }

  public dispose(): void {
    this.resetStats();
    this.optimizationHandlers = [];
    console.log('🧹 性能管理器资源清理完成');
  }
}
