/**
 * 🚀 统一性能管理器
 * 整合所有性能管理功能，包括性能监控、优化策略和AI驱动的自适应优化
 */

import * as THREE from 'three';
import { PerformanceOptimizer, OptimizationStrategy, PerformanceOptimizationConfig } from './PerformanceOptimizer';
import { PerformanceMonitor, ParticleOptimizer, RenderOptimizer } from './performanceUtils';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

// 统一性能指标类型
export interface UnifiedPerformanceMetrics {
  // 核心性能指标
  fps: number;
  frameTime: number;
  memoryUsage: number;
  gpuUsage: number;
  drawCalls: number;
  triangleCount: number;
  vertexCount: number;
  textureMemory: number;
  shaderCount: number;
  activeObjects: number;
  particleCount: number;
  
  // 设备状态指标
  deviceScore: number;
  thermalState: 'cool' | 'warm' | 'hot';
  batteryLevel?: number;
  networkLatency?: number;
  
  // 场景复杂度指标
  sceneComplexity: number;
  particleDensity: number;
  shadowQuality: number;
  renderScale: number;
}

// 统一性能配置类型
export interface UnifiedPerformanceConfig extends PerformanceOptimizationConfig {
  // AI优化配置
  enableAIOptimization: boolean;
  aiAdaptationRate: number;
  aiLearningRate: number;
  
  // 监控配置
  enablePerformanceMonitoring: boolean;
  monitorUpdateInterval: number;
  
  // 日志配置
  enablePerformanceLogging: boolean;
  loggingLevel: 'info' | 'warn' | 'error' | 'debug';
}

// 性能事件数据类型
export interface PerformanceEventData {
  metrics: UnifiedPerformanceMetrics;
  timestamp: number;
  action?: string;
  confidence?: number;
  expectedGain?: number;
}

/**
 * 统一性能管理器类
 * 整合所有性能管理功能，提供统一的性能优化接口
 */
export class UnifiedPerformanceManager {
  private static instance: UnifiedPerformanceManager;
  
  // 核心组件
  private performanceOptimizer: PerformanceOptimizer;
  private performanceMonitor: PerformanceMonitor;
  private particleOptimizer: ParticleOptimizer;
  private renderOptimizer: RenderOptimizer;
  
  // 场景和渲染器引用
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  
  // 配置和状态
  private config: UnifiedPerformanceConfig;
  private metrics: UnifiedPerformanceMetrics;
  private isInitialized: boolean = false;
  private isPerformanceMode: boolean = false;
  private lastMonitorUpdate: number = 0;
  
  // 单例模式构造函数
  private constructor(config: Partial<UnifiedPerformanceConfig> = {}) {
    // 合并默认配置
    this.config = {
      // 基础优化配置
      strategy: OptimizationStrategy.ADAPTIVE,
      targetFPS: 60,
      maxMemoryUsageMB: 512,
      maxDrawCalls: 1000,
      enableAutoOptimization: true,
      enableLOD: true,
      enableCulling: true,
      enableFrameSkipping: true,
      enableDynamicResolution: true,
      enableParticleOptimization: true,
      enableShadowOptimization: true,
      
      // AI优化配置
      enableAIOptimization: true,
      aiAdaptationRate: 0.1,
      aiLearningRate: 0.01,
      
      // 监控配置
      enablePerformanceMonitoring: true,
      monitorUpdateInterval: 1000,
      
      // 日志配置
      enablePerformanceLogging: process.env.NODE_ENV === 'development',
      loggingLevel: 'info',
      
      ...config
    };
    
    // 初始化性能指标
    this.metrics = this.createInitialMetrics();
    
    // 初始化核心组件
    this.performanceMonitor = new PerformanceMonitor();
    this.particleOptimizer = new ParticleOptimizer();
    this.renderOptimizer = new RenderOptimizer();
    
    // 初始化事件监听
    this.initializeEventListeners();
    
    // 初始化日志
    this.log('Unified Performance Manager initialized with config:', this.config, 'debug');
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<UnifiedPerformanceConfig>): UnifiedPerformanceManager {
    if (!UnifiedPerformanceManager.instance) {
      UnifiedPerformanceManager.instance = new UnifiedPerformanceManager(config);
    }
    return UnifiedPerformanceManager.instance;
  }
  
  /**
   * 初始化场景和渲染器引用
   */
  public initialize(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): void {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // 初始化性能优化器
    this.performanceOptimizer = new PerformanceOptimizer(scene, camera, renderer, {
      strategy: this.config.strategy,
      targetFPS: this.config.targetFPS,
      maxMemoryUsageMB: this.config.maxMemoryUsageMB,
      maxDrawCalls: this.config.maxDrawCalls,
      enableAutoOptimization: this.config.enableAutoOptimization,
      enableLOD: this.config.enableLOD,
      enableCulling: this.config.enableCulling,
      enableFrameSkipping: this.config.enableFrameSkipping,
      enableDynamicResolution: this.config.enableDynamicResolution,
      enableParticleOptimization: this.config.enableParticleOptimization,
      enableShadowOptimization: this.config.enableShadowOptimization
    });
    
    this.isInitialized = true;
    this.log('Unified Performance Manager initialized with scene, camera, and renderer', null, 'info');
    
    // 发布初始化完成事件
    eventSystem.emit(APP_EVENTS.PERFORMANCE_MANAGER_INIT, {
      metrics: this.metrics,
      config: this.config
    });
  }
  
  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 监听性能相关事件
    eventSystem.on(APP_EVENTS.FRAME_RATE_CHANGE, (data) => {
      this.updateMetrics({ fps: data.fps, frameTime: data.frameTime });
    });
    
    eventSystem.on(APP_EVENTS.MEMORY_WARNING, (data) => {
      this.updateMetrics({ memoryUsage: data.memoryUsage });
      this.applyMemoryOptimizations(data.memoryUsage);
    });
    
    eventSystem.on(APP_EVENTS.PARTICLE_SYSTEM_UPDATE, (data) => {
      this.updateMetrics({ particleCount: data.particleCount });
    });
  }
  
  /**
   * 创建初始性能指标
   */
  private createInitialMetrics(): UnifiedPerformanceMetrics {
    return {
      // 核心性能指标
      fps: 60,
      frameTime: 16.67, // 60fps
      memoryUsage: 0,
      gpuUsage: 0,
      drawCalls: 0,
      triangleCount: 0,
      vertexCount: 0,
      textureMemory: 0,
      shaderCount: 0,
      activeObjects: 0,
      particleCount: 0,
      
      // 设备状态指标
      deviceScore: 0.5,
      thermalState: 'cool',
      
      // 场景复杂度指标
      sceneComplexity: 0,
      particleDensity: 1.0,
      shadowQuality: 1.0,
      renderScale: 1.0
    };
  }
  
  /**
   * 更新性能指标
   */
  public updateMetrics(metrics: Partial<UnifiedPerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
    
    // 确保指标在合理范围内
    this.metrics.fps = Math.max(0, Math.min(120, this.metrics.fps));
    this.metrics.frameTime = Math.max(0, this.metrics.frameTime);
    this.metrics.memoryUsage = Math.max(0, this.metrics.memoryUsage);
    this.metrics.gpuUsage = Math.max(0, Math.min(100, this.metrics.gpuUsage));
    this.metrics.drawCalls = Math.max(0, this.metrics.drawCalls);
    this.metrics.triangleCount = Math.max(0, this.metrics.triangleCount);
    this.metrics.vertexCount = Math.max(0, this.metrics.vertexCount);
    
    // 更新性能模式
    this.updatePerformanceMode();
    
    // 定期发布性能指标事件
    const now = Date.now();
    if (now - this.lastMonitorUpdate > this.config.monitorUpdateInterval) {
      this.lastMonitorUpdate = now;
      eventSystem.emit(APP_EVENTS.PERFORMANCE_METRICS_UPDATE, {
        metrics: this.metrics,
        timestamp: now
      });
      
      // 应用AI优化
      if (this.config.enableAIOptimization) {
        this.applyAIOptimizations();
      }
    }
  }
  
  /**
   * 更新性能模式
   */
  private updatePerformanceMode(): void {
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    
    if (isPerformanceMode !== this.isPerformanceMode) {
      this.isPerformanceMode = isPerformanceMode;
      eventSystem.emit(APP_EVENTS.PERFORMANCE_MODE_CHANGE, {
        isPerformanceMode,
        metrics: this.metrics
      });
      
      this.log(`Performance mode changed to: ${isPerformanceMode ? 'PERFORMANCE' : 'QUALITY'}`, null, 'info');
    }
  }
  
  /**
   * 应用AI优化
   */
  private applyAIOptimizations(): void {
    if (!this.isInitialized) return;
    
    // 转换为AI性能引擎所需的指标格式
    const aiMetrics: AIPerformanceMetrics = {
      fps: this.metrics.fps,
      frameTime: this.metrics.frameTime,
      memoryUsage: this.metrics.memoryUsage,
      gpuUsage: this.metrics.gpuUsage,
      drawCalls: this.metrics.drawCalls,
      triangles: this.metrics.triangleCount,
      particles: this.metrics.particleCount,
      complexity: this.metrics.sceneComplexity,
      deviceScore: this.metrics.deviceScore,
      thermalState: this.metrics.thermalState,
      batteryLevel: this.metrics.batteryLevel,
      networkLatency: this.metrics.networkLatency
    };
    
    // 获取AI优化建议
    const aiPrediction = this.aiPerformanceEngine.analyzePerformance(aiMetrics);
    
    // 应用AI优化建议
    aiPrediction.recommendedActions.forEach(action => {
      switch (action.parameter) {
        case 'renderScale':
          this.metrics.renderScale = action.value;
          if (this.renderer) {
            this.renderer.setPixelRatio(window.devicePixelRatio * action.value);
          }
          break;
        case 'particleDensity':
          this.metrics.particleDensity = action.value;
          eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, {
            density: action.value
          });
          break;
        case 'shadowQuality':
          this.metrics.shadowQuality = action.value;
          if (this.renderer) {
            this.renderer.shadowMap.enabled = action.value > 0;
          }
          break;
        case 'maxParticles':
          eventSystem.emit(APP_EVENTS.MAX_PARTICLES_CHANGE, {
            maxParticles: Math.floor(action.value)
          });
          break;
        case 'textureQuality':
          eventSystem.emit(APP_EVENTS.TEXTURE_QUALITY_CHANGE, {
            quality: action.value
          });
          break;
      }
      
      this.log(`Applied AI optimization: ${action.parameter} = ${action.value} (confidence: ${action.confidence})`, null, 'debug');
    });
  }
  
  /**
   * 应用内存优化
   */
  private applyMemoryOptimizations(memoryUsage: number): void {
    if (!this.isInitialized) return;
    
    // 释放未使用的资源
    eventSystem.emit(APP_EVENTS.RELEASE_UNUSED_RESOURCES, {
      memoryUsage,
      force: memoryUsage > this.config.maxMemoryUsageMB * 0.9
    });
    
    // 降低纹理质量
    if (memoryUsage > this.config.maxMemoryUsageMB * 0.8) {
      this.metrics.textureMemory = this.metrics.textureMemory * 0.8;
      eventSystem.emit(APP_EVENTS.TEXTURE_QUALITY_CHANGE, {
        quality: 0.8
      });
    }
    
    // 降低粒子密度
    if (memoryUsage > this.config.maxMemoryUsageMB * 0.9) {
      this.metrics.particleDensity = 0.6;
      eventSystem.emit(APP_EVENTS.PARTICLE_DENSITY_CHANGE, {
        density: 0.6
      });
    }
  }
  
  /**
   * 优化粒子数量
   */
  public optimizeParticleCount(baseCount: number, distance: number): number {
    return this.performanceOptimizer.optimizeParticleCount(baseCount, distance);
  }
  
  /**
   * 计算最佳像素比率
   */
  public calculateOptimalPixelRatio(): number {
    return this.performanceOptimizer.calculateOptimalPixelRatio();
  }
  
  /**
   * 计算是否应该跳过当前帧
   */
  public shouldSkipFrame(): boolean {
    return this.performanceOptimizer.shouldSkipFrame();
  }
  
  /**
   * 计算渲染分辨率缩放因子
   */
  public calculateRenderScale(): number {
    return this.performanceOptimizer.calculateRenderScale();
  }
  
  /**
   * 检查对象是否可见
   */
  public isObjectVisible(object: THREE.Object3D): boolean {
    if (!this.camera) return true;
    return this.performanceOptimizer.isObjectVisible(object);
  }
  
  /**
   * 根据优先级对对象进行排序
   */
  public sortObjectsByPriority(objects: THREE.Object3D[]): THREE.Object3D[] {
    if (!this.camera) return objects;
    return this.performanceOptimizer.sortObjectsByPriority(objects);
  }
  
  /**
   * 应用优化策略
   */
  public applyOptimizations(deltaTime: number): void {
    if (!this.isInitialized) return;
    
    // 更新FPS
    const fps = this.performanceMonitor.updateFPS();
    this.metrics.fps = fps;
    this.metrics.frameTime = 1000 / fps;
    
    // 应用性能优化器的优化策略
    this.performanceOptimizer.applyOptimizations(deltaTime);
    
    // 更新性能指标
    this.updateMetrics(this.performanceOptimizer.getMetrics());
  }
  
  /**
   * 获取优化建议
   */
  public getOptimizationSuggestions(): string[] {
    if (!this.isInitialized) return [];
    return this.performanceOptimizer.getOptimizationSuggestions();
  }
  
  /**
   * 更新配置
   */
  public updateConfig(config: Partial<UnifiedPerformanceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新性能优化器配置
    if (this.isInitialized) {
      this.performanceOptimizer.updateConfig({
        strategy: this.config.strategy,
        targetFPS: this.config.targetFPS,
        maxMemoryUsageMB: this.config.maxMemoryUsageMB,
        maxDrawCalls: this.config.maxDrawCalls,
        enableAutoOptimization: this.config.enableAutoOptimization,
        enableLOD: this.config.enableLOD,
        enableCulling: this.config.enableCulling,
        enableFrameSkipping: this.config.enableFrameSkipping,
        enableDynamicResolution: this.config.enableDynamicResolution,
        enableParticleOptimization: this.config.enableParticleOptimization,
        enableShadowOptimization: this.config.enableShadowOptimization
      });
    }
    
    this.log('Performance config updated:', config, 'info');
  }
  
  /**
   * 获取当前配置
   */
  public getConfig(): UnifiedPerformanceConfig {
    return { ...this.config };
  }
  
  /**
   * 获取当前性能指标
   */
  public getMetrics(): UnifiedPerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * 检查是否处于性能模式
   */
  public isInPerformanceMode(): boolean {
    return this.isPerformanceMode;
  }
  
  /**
   * 获取AI学习状态
   */
  public getAILearningStatus(): { accuracy: number; patterns: number; confidence: number } {
    return this.aiPerformanceEngine.getLearningStatus();
  }
  
  /**
   * 获取设备性能等级
   */
  public getDevicePerformanceLevel(): 'low' | 'medium' | 'high' | 'ultra' {
    return this.aiPerformanceEngine.getDevicePerformanceLevel();
  }
  
  /**
   * 日志工具
   */
  private log(message: string, data?: any, level: 'info' | 'warn' | 'error' | 'debug' = 'info'): void {
    if (!this.config.enablePerformanceLogging) return;
    
    const levels = { info: 0, warn: 1, error: 2, debug: 3 };
    const currentLevel = levels[this.config.loggingLevel];
    const messageLevel = levels[level];
    
    if (messageLevel <= currentLevel) {
      const prefix = `[${new Date().toISOString()}] [UNIFIED_PERFORMANCE]`;
      if (level === 'error') {
        console.error(`${prefix} ERROR: ${message}`, data);
      } else if (level === 'warn') {
        console.warn(`${prefix} WARN: ${message}`, data);
      } else if (level === 'debug') {
        console.debug(`${prefix} DEBUG: ${message}`, data);
      } else {
        console.info(`${prefix} INFO: ${message}`, data);
      }
    }
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.isInitialized && this.performanceOptimizer) {
      this.performanceOptimizer.dispose();
    }
    
    // 移除事件监听器
    eventSystem.offAll();
    
    // 重置状态
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isInitialized = false;
    
    this.log('Unified Performance Manager disposed', null, 'info');
  }
}

// 导出单例实例
export const unifiedPerformanceManager = UnifiedPerformanceManager.getInstance();
