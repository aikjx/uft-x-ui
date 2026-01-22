// 统一场论可视化系统 - 智能渲染管理器
// 版本: v2.0
// 功能: 实现智能渲染路径选择和渲染管理

import { Vector3, Vector4 } from 'three';
import { AIOptimizer } from './AIOptimizer';
import { RenderEngine } from '../../rendering/engines/RenderEngine';
import { RaytracingEngine2 } from '../../rendering/engines/RaytracingEngine2';
import { VolumeRenderingEngine2 } from '../../rendering/engines/VolumeRenderingEngine2';
import { PathTracingEngine2 } from '../../rendering/engines/PathTracingEngine2';

export class SmartRenderManager {
  private aiOptimizer: AIOptimizer;
  private renderEngines: Map<string, RenderEngine> = new Map();
  private currentRenderEngine: RenderEngine | null = null;
  private renderStats: Map<string, any> = new Map();
  private useAdaptiveRendering: boolean = true;
  private enableProgressiveRendering: boolean = true;

  constructor() {
    this.aiOptimizer = new AIOptimizer();
    this.init();
  }

  private init(): void {
    console.log('🎮 智能渲染管理器初始化');
    this.initRenderEngines();
  }

  private initRenderEngines(): void {
    // 初始化渲染引擎
    this.renderEngines.set('raytracing', new RaytracingEngine2());
    this.renderEngines.set('volume', new VolumeRenderingEngine2());
    this.renderEngines.set('pathtracing', new PathTracingEngine2());
    console.log('🔧 渲染引擎初始化完成');
  }

  public async render(canvas: HTMLCanvasElement, scene: any, camera: any, options: any = {}): Promise<any> {
    // 优化渲染配置
    const optimizationResult = this.aiOptimizer.optimizeRendering(scene, camera, options);
    
    // 选择渲染引擎
    this.currentRenderEngine = this.selectRenderEngine(optimizationResult.renderPath);
    
    if (!this.currentRenderEngine) {
      console.error('找不到合适的渲染引擎');
      return null;
    }
    
    // 执行渲染
    const startTime = performance.now();
    const result = await this.currentRenderEngine.render(canvas, scene, camera, {
      ...options,
      ...optimizationResult.profile.getSettings()
    });
    const endTime = performance.now();
    
    // 记录渲染统计数据
    this.recordRenderStats({
      renderPath: optimizationResult.renderPath,
      renderTime: endTime - startTime,
      sceneComplexity: this.aiOptimizer.analyzeSceneComplexity(scene),
      deviceScore: this.aiOptimizer.calculateDeviceScore(),
      profile: optimizationResult.profile.getSettings(),
      timestamp: Date.now()
    });
    
    return {
      ...result,
      optimizationResult: optimizationResult,
      renderTime: endTime - startTime
    };
  }

  private selectRenderEngine(renderPath: string): RenderEngine | null {
    // 根据渲染路径选择渲染引擎
    switch (renderPath) {
      case 'raytracing':
      case 'realtime_raytracing':
        return this.renderEngines.get('raytracing') || null;
      case 'volume':
        return this.renderEngines.get('volume') || null;
      case 'pathtracing':
        return this.renderEngines.get('pathtracing') || null;
      default:
        return this.renderEngines.get('raytracing') || null;
    }
  }

  private recordRenderStats(stats: any): void {
    // 记录渲染统计数据
    this.renderStats.set(Date.now().toString(), stats);
    
    // 限制统计数据大小
    if (this.renderStats.size > 1000) {
      const oldestKey = [...this.renderStats.keys()][0];
      this.renderStats.delete(oldestKey);
    }
  }

  public getRenderStatistics(): any {
    // 获取渲染统计数据
    if (this.renderStats.size === 0) {
      return null;
    }
    
    const stats = Array.from(this.renderStats.values());
    const avgRenderTime = stats.reduce((sum: number, item: any) => sum + item.renderTime, 0) / stats.length;
    const avgSceneComplexity = stats.reduce((sum: number, item: any) => sum + item.sceneComplexity, 0) / stats.length;
    
    return {
      averageRenderTime: avgRenderTime,
      averageSceneComplexity: avgSceneComplexity,
      totalRenders: stats.length,
      renderPaths: [...new Set(stats.map((item: any) => item.renderPath))],
      performanceTrend: this.analyzePerformanceTrend(stats)
    };
  }

  private analyzePerformanceTrend(stats: any[]): string {
    // 分析性能趋势
    if (stats.length < 2) return 'insufficient_data';
    
    const recentStats = stats.slice(-10);
    const firstRenderTime = recentStats[0].renderTime;
    const lastRenderTime = recentStats[recentStats.length - 1].renderTime;
    
    const change = (lastRenderTime - firstRenderTime) / firstRenderTime * 100;
    
    if (change < -10) return 'improving';
    if (change > 10) return 'deteriorating';
    return 'stable';
  }

  public adaptRenderingSettings(): void {
    // 自适应调整渲染设置
    const performanceStats = this.getRenderStatistics();
    if (performanceStats) {
      if (performanceStats.averageRenderTime > 50) {
        console.warn('⚠️ 渲染时间过长，调整渲染设置');
        // 可以在这里实现动态调整逻辑
      }
    }
  }

  public getAIOptimizer(): AIOptimizer {
    return this.aiOptimizer;
  }

  public getRenderEngine(name: string): RenderEngine | null {
    return this.renderEngines.get(name) || null;
  }

  public addRenderEngine(name: string, engine: RenderEngine): void {
    this.renderEngines.set(name, engine);
  }

  public setAdaptiveRendering(enabled: boolean): void {
    this.useAdaptiveRendering = enabled;
  }

  public setProgressiveRendering(enabled: boolean): void {
    this.enableProgressiveRendering = enabled;
  }

  public reset(): void {
    // 重置智能渲染管理器
    this.renderStats.clear();
    this.aiOptimizer.reset();
  }

  public dispose(): void {
    // 清理资源
    this.aiOptimizer.dispose();
    this.renderStats.clear();
    this.renderEngines.forEach((engine) => {
      if (engine.dispose) {
        engine.dispose();
      }
    });
    this.renderEngines.clear();
    console.log('🧹 智能渲染管理器资源清理完成');
  }
}