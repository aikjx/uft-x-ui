/**
 * 🤖 自动化性能优化器
 * 实现智能性能监控和自动优化策略，根据设备性能和实时指标动态调整可视化参数
 */

import { UnifiedPerformanceManager, UnifiedPerformanceMetrics, UnifiedPerformanceConfig } from './UnifiedPerformanceManager';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';
import { PerformanceOptimizer, OptimizationStrategy } from './PerformanceOptimizer';
import { VISUALIZATION_CONFIG } from '../constants';

// 自动化优化模式
export enum AutomatedOptimizationMode {
  OFF = 'off',
  CONSERVATIVE = 'conservative', // 保守模式：优先保证稳定运行
  BALANCED = 'balanced', // 平衡模式：平衡性能和视觉效果
  PERFORMANCE = 'performance', // 性能模式：优先保证流畅度
  QUALITY = 'quality', // 质量模式：优先保证视觉质量
  AGGRESSIVE = 'aggressive', // 激进模式：动态优化到极限
  AUTO = 'auto' // 自动模式：根据设备性能智能调整
}

// 自动化优化配置
interface AutomatedOptimizationConfig {
  mode: AutomatedOptimizationMode;
  targetFPS: number;
  maxMemoryUsageMB: number;
  maxDrawCalls: number;
  autoAdjustParticleCount: boolean;
  autoAdjustRenderScale: boolean;
  autoAdjustShadowQuality: boolean;
  autoAdjustPostProcessing: boolean;
  enableAIOptimization: boolean;
  optimizationInterval: number;
  minOptimizationGain: number;
}

// 设备性能等级
enum DevicePerformanceLevel {
  LOW = 'low', // 低端设备
  MEDIUM = 'medium', // 中端设备
  HIGH = 'high', // 高端设备
  ULTRA = 'ultra' // 超高端设备
}

/**
 * 自动化性能优化控制器
 * 实现智能性能监控和自动优化策略
 */
export class AutomatedPerformanceOptimizer {
  private static instance: AutomatedPerformanceOptimizer;
  private performanceManager: UnifiedPerformanceManager;
  private config: AutomatedOptimizationConfig;
  private isInitialized: boolean = false;
  private optimizationTimer: number | null = null;
  private devicePerformanceLevel: DevicePerformanceLevel = DevicePerformanceLevel.MEDIUM;
  private currentMetrics: UnifiedPerformanceMetrics | null = null;
  private optimizationHistory: Array<{
    timestamp: number;
    metrics: UnifiedPerformanceMetrics;
    actions: Array<{ type: string; value: any; expectedGain: number }>;
  }> = [];

  private constructor() {
    this.performanceManager = UnifiedPerformanceManager.getInstance();
    
    // 默认配置
    this.config = {
      mode: AutomatedOptimizationMode.AUTO,
      targetFPS: 60,
      maxMemoryUsageMB: 512,
      maxDrawCalls: 1000,
      autoAdjustParticleCount: true,
      autoAdjustRenderScale: true,
      autoAdjustShadowQuality: true,
      autoAdjustPostProcessing: true,
      enableAIOptimization: true,
      optimizationInterval: 2000,
      minOptimizationGain: 0.05
    };
    
    this.initialize();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AutomatedPerformanceOptimizer {
    if (!AutomatedPerformanceOptimizer.instance) {
      AutomatedPerformanceOptimizer.instance = new AutomatedPerformanceOptimizer();
    }
    return AutomatedPerformanceOptimizer.instance;
  }

  /**
   * 初始化自动化性能优化器
   */
  private initialize(): void {
    // 监听性能指标更新事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, (data: any) => {
      this.currentMetrics = data.performanceData;
      this.optimize();
    });

    // 监听设备性能变化事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_MODE_CHANGE, (data: any) => {
      this.updatePerformanceMode(data.isPerformanceMode);
    });

    // 监听资源释放事件
    eventSystem.on(APP_EVENTS.RELEASE_UNUSED_RESOURCES, () => {
      this.releaseUnusedResources();
    });

    this.isInitialized = true;
    this.detectDevicePerformanceLevel();
    this.startOptimizationLoop();
  }

  /**
   * 检测设备性能等级
   */
  private detectDevicePerformanceLevel(): void {
    // 基于硬件特性和浏览器支持检测设备性能
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    let score = 1.0;
    
    // 检查WebGL支持
    if (!gl) {
      this.devicePerformanceLevel = DevicePerformanceLevel.LOW;
      return;
    }
    
    // 检查设备像素比
    const pixelRatio = window.devicePixelRatio;
    if (pixelRatio < 1.5) {
      score *= 0.7;
    } else if (pixelRatio > 2.5) {
      score *= 1.3;
    }
    
    // 检查内存大小
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory < 4) {
        score *= 0.6;
      } else if (deviceMemory >= 8) {
        score *= 1.4;
      }
    }
    
    // 检查CPU核心数
    if ('hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency;
      if (cores < 4) {
        score *= 0.7;
      } else if (cores >= 8) {
        score *= 1.3;
      }
    }
    
    // 确定设备性能等级
    if (score < 0.7) {
      this.devicePerformanceLevel = DevicePerformanceLevel.LOW;
    } else if (score < 1.0) {
      this.devicePerformanceLevel = DevicePerformanceLevel.MEDIUM;
    } else if (score < 1.3) {
      this.devicePerformanceLevel = DevicePerformanceLevel.HIGH;
    } else {
      this.devicePerformanceLevel = DevicePerformanceLevel.ULTRA;
    }
    
    // 输出设备性能等级
    console.log(`🎮 设备性能等级: ${this.devicePerformanceLevel}`);
  }

  /**
   * 启动优化循环
   */
  private startOptimizationLoop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
    
    this.optimizationTimer = window.setInterval(() => {
      this.optimize();
    }, this.config.optimizationInterval) as unknown as number;
  }

  /**
   * 停止优化循环
   */
  public stop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }
  }

  /**
   * 更新优化配置
   */
  public updateConfig(config: Partial<AutomatedOptimizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.startOptimizationLoop();
  }

  /**
   * 获取当前优化配置
   */
  public getConfig(): AutomatedOptimizationConfig {
    return { ...this.config };
  }

  /**
   * 执行自动化优化
   */
  public optimize(): void {
    if (!this.currentMetrics) return;

    const metrics = this.currentMetrics;
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];

    // 根据当前模式执行不同的优化策略
    switch (this.config.mode) {
      case AutomatedOptimizationMode.CONSERVATIVE:
        actions.push(...this.performConservativeOptimization(metrics));
        break;
      case AutomatedOptimizationMode.BALANCED:
        actions.push(...this.performBalancedOptimization(metrics));
        break;
      case AutomatedOptimizationMode.PERFORMANCE:
        actions.push(...this.performPerformanceOptimization(metrics));
        break;
      case AutomatedOptimizationMode.QUALITY:
        actions.push(...this.performQualityOptimization(metrics));
        break;
      case AutomatedOptimizationMode.AGGRESSIVE:
        actions.push(...this.performAggressiveOptimization(metrics));
        break;
      case AutomatedOptimizationMode.AUTO:
      default:
        actions.push(...this.performAutoOptimization(metrics));
        break;
    }

    // 记录优化历史
    if (actions.length > 0) {
      this.optimizationHistory.push({
        timestamp: Date.now(),
        metrics: { ...metrics },
        actions
      });
      
      // 限制历史记录长度
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory.shift();
      }
    }
  }

  /**
   * 保守模式优化
   */
  private performConservativeOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 确保帧率至少达到30fps
    if (metrics.fps < 30) {
      // 减少粒子数量
      actions.push({ type: 'particleCount', value: Math.max(100, metrics.particleCount * 0.7), expectedGain: 15 });
      
      // 降低渲染分辨率
      actions.push({ type: 'renderScale', value: Math.max(0.5, metrics.renderScale * 0.8), expectedGain: 20 });
      
      // 关闭阴影
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 });
      
      // 关闭后处理
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 });
    }
    
    return actions;
  }

  /**
   * 平衡模式优化
   */
  private performBalancedOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 目标帧率：45-60fps
    if (metrics.fps < 45) {
      // 适当减少粒子数量
      actions.push({ type: 'particleCount', value: Math.max(500, metrics.particleCount * 0.85), expectedGain: 10 });
      
      // 适当降低渲染分辨率
      actions.push({ type: 'renderScale', value: Math.max(0.7, metrics.renderScale * 0.9), expectedGain: 15 });
    }
    
    // 确保内存使用不超过限制
    if (metrics.memoryUsage > this.config.maxMemoryUsageMB) {
      actions.push({ type: 'memoryLimit', value: this.config.maxMemoryUsageMB, expectedGain: 5 });
    }
    
    return actions;
  }

  /**
   * 性能模式优化
   */
  private performPerformanceOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 优先保证60fps
    if (metrics.fps < this.config.targetFPS) {
      // 大幅减少粒子数量
      actions.push({ type: 'particleCount', value: Math.max(50, metrics.particleCount * 0.5), expectedGain: 25 });
      
      // 降低渲染分辨率
      actions.push({ type: 'renderScale', value: Math.max(0.5, metrics.renderScale * 0.7), expectedGain: 20 });
      
      // 关闭阴影
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 });
      
      // 简化后处理
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 });
    }
    
    return actions;
  }

  /**
   * 质量模式优化
   */
  private performQualityOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 在保证30fps的前提下最大化视觉效果
    if (metrics.fps >= 30) {
      // 增加粒子数量
      actions.push({ type: 'particleCount', value: Math.min(20000, metrics.particleCount * 1.2), expectedGain: -10 });
      
      // 提高渲染分辨率
      actions.push({ type: 'renderScale', value: Math.min(1.0, metrics.renderScale * 1.1), expectedGain: -15 });
      
      // 提高阴影质量
      actions.push({ type: 'shadowQuality', value: Math.min(1.0, metrics.shadowQuality * 1.2), expectedGain: -10 });
      
      // 启用完整后处理
      actions.push({ type: 'postProcessing', value: true, expectedGain: -15 });
    }
    
    return actions;
  }

  /**
   * 激进模式优化
   */
  private performAggressiveOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 动态调整到极限
    if (metrics.fps < this.config.targetFPS) {
      // 减少粒子数量到最小
      actions.push({ type: 'particleCount', value: Math.max(10, metrics.particleCount * 0.3), expectedGain: 30 });
      
      // 降低渲染分辨率到最低
      actions.push({ type: 'renderScale', value: Math.max(0.3, metrics.renderScale * 0.5), expectedGain: 25 });
      
      // 关闭所有消耗性能的功能
      actions.push({ type: 'shadowQuality', value: 0, expectedGain: 10 });
      actions.push({ type: 'postProcessing', value: false, expectedGain: 15 });
      actions.push({ type: 'particleDensity', value: 0.5, expectedGain: 10 });
    }
    
    return actions;
  }

  /**
   * 自动模式优化
   */
  private performAutoOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 根据设备性能等级调整优化策略
    switch (this.devicePerformanceLevel) {
      case DevicePerformanceLevel.LOW:
        actions.push(...this.performConservativeOptimization(metrics));
        break;
      case DevicePerformanceLevel.MEDIUM:
        actions.push(...this.performBalancedOptimization(metrics));
        break;
      case DevicePerformanceLevel.HIGH:
        actions.push(...this.performQualityOptimization(metrics));
        break;
      case DevicePerformanceLevel.ULTRA:
        // 超高端设备可以使用激进的质量设置
        actions.push({ type: 'particleCount', value: Math.min(50000, metrics.particleCount * 1.5), expectedGain: -5 });
        actions.push({ type: 'renderScale', value: 1.0, expectedGain: -10 });
        actions.push({ type: 'shadowQuality', value: 1.0, expectedGain: -5 });
        actions.push({ type: 'postProcessing', value: true, expectedGain: -10 });
        break;
    }
    
    // 执行智能优化
    if (this.config.enableAIOptimization) {
      actions.push(...this.performAIOptimization(metrics));
    }
    
    return actions;
  }

  /**
   * AI优化（基于历史数据和机器学习模型）
   */
  private performAIOptimization(metrics: UnifiedPerformanceMetrics): Array<{ type: string; value: any; expectedGain: number }> {
    const actions: Array<{ type: string; value: any; expectedGain: number }> = [];
    
    // 简单的AI优化逻辑：基于历史数据预测最优参数
    // 这里使用简化的逻辑，实际可以替换为更复杂的机器学习模型
    
    // 基于历史性能数据预测最优粒子数量
    if (this.optimizationHistory.length > 10) {
      // 计算历史平均FPS增益
      const avgGain = this.optimizationHistory
        .slice(-10)
        .reduce((sum, entry) => sum + entry.actions.reduce((a, b) => a + b.expectedGain, 0), 0) / 10;
      
      // 如果平均增益大于阈值，继续优化
      if (avgGain > this.config.minOptimizationGain) {
        actions.push({ type: 'aiOptimization', value: 'auto', expectedGain: avgGain });
      }
    }
    
    return actions;
  }

  /**
   * 更新性能模式
   */
  private updatePerformanceMode(isPerformanceMode: boolean): void {
    this.config.mode = isPerformanceMode ? AutomatedOptimizationMode.PERFORMANCE : AutomatedOptimizationMode.BALANCED;
  }

  /**
   * 释放未使用的资源
   */
  private releaseUnusedResources(): void {
    // 释放未使用的纹理和模型
    eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, {});
  }

  /**
   * 开始优化循环
   */
  private startOptimizationLoop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
    
    this.optimizationTimer = window.setInterval(() => {
      this.optimize();
    }, this.config.optimizationInterval) as unknown as number;
  }

  /**
   * 执行优化操作
   */
  private executeOptimizationAction(action: { type: string; value: any; expectedGain: number }): void {
    switch (action.type) {
      case 'particleCount':
        eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, { density: action.value });
        eventSystem.emit(APP_EVENTS.MAX_PARTICLES_CHANGE, { maxParticles: action.value });
        break;
      case 'renderScale':
        // 更新渲染缩放
        break;
      case 'shadowQuality':
        // 更新阴影质量
        break;
      case 'postProcessing':
        // 更新后处理设置
        break;
      case 'memoryLimit':
        // 更新内存限制
        break;
      case 'aiOptimization':
        // 执行AI优化
        break;
    }
  }

  /**
   * 获取优化历史
   */
  public getOptimizationHistory(): Array<{
    timestamp: number;
    metrics: UnifiedPerformanceMetrics;
    actions: Array<{ type: string; value: any; expectedGain: number }>;
  }> {
    return [...this.optimizationHistory];
  }

  /**
   * 获取设备性能等级
   */
  public getDevicePerformanceLevel(): DevicePerformanceLevel {
    return this.devicePerformanceLevel;
  }

  /**
   * 重置优化器
   */
  public reset(): void {
    this.optimizationHistory = [];
    this.devicePerformanceLevel = DevicePerformanceLevel.MEDIUM;
    this.detectDevicePerformanceLevel();
  }

  /**
   * 销毁优化器
   */
  public dispose(): void {
    this.stop();
    this.optimizationHistory = [];
    this.isInitialized = false;
  }
}

// 导出单例实例
export const automatedPerformanceOptimizer = AutomatedPerformanceOptimizer.getInstance();

// 导出便捷函数
export const startAutomatedOptimization = (config?: Partial<AutomatedOptimizationConfig>) => {
  automatedPerformanceOptimizer.updateConfig(config || {});
};

export const stopAutomatedOptimization = () => {
  automatedPerformanceOptimizer.stop();
};

export const getDevicePerformanceLevel = () => {
  return automatedPerformanceOptimizer.getDevicePerformanceLevel();
};

export const getOptimizationHistory = () => {
  return automatedPerformanceOptimizer.getOptimizationHistory();
};
