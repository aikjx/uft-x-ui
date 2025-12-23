import * as THREE from 'three';
import { PerformanceMonitor, ParticleOptimizer, RenderOptimizer } from './performanceUtils';
import { PerformanceMetrics } from '../components/PerformanceMonitor';

/**
 * 性能优化策略类型
 */
export enum OptimizationStrategy {
  CONSERVATIVE = 'conservative',  // 保守策略，优先保证稳定性
  BALANCED = 'balanced',          // 平衡策略，兼顾性能和质量
  AGGRESSIVE = 'aggressive',      // 激进策略，优先保证性能
  ADAPTIVE = 'adaptive'           // 自适应策略，根据实时性能自动调整
}

/**
 * 性能优化配置
 */
export interface PerformanceOptimizationConfig {
  strategy: OptimizationStrategy;
  targetFPS: number;
  maxMemoryUsageMB: number;
  maxDrawCalls: number;
  enableAutoOptimization: boolean;
  enableLOD: boolean;
  enableCulling: boolean;
  enableFrameSkipping: boolean;
  enableDynamicResolution: boolean;
  enableParticleOptimization: boolean;
  enableShadowOptimization: boolean;
}

/**
 * 性能优化器
 */
export class PerformanceOptimizer {
  private config: PerformanceOptimizationConfig;
  private performanceMonitor: PerformanceMonitor;
  private particleOptimizer: ParticleOptimizer;
  private renderOptimizer: RenderOptimizer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private metrics: PerformanceMetrics;
  private frameIndex: number = 0;
  private currentScale: number = 1.0;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    config: Partial<PerformanceOptimizationConfig> = {}
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // 合并默认配置
    this.config = {
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
      ...config
    };
    
    // 初始化优化器
    this.performanceMonitor = new PerformanceMonitor();
    this.particleOptimizer = new ParticleOptimizer();
    this.renderOptimizer = new RenderOptimizer();
    
    // 初始化性能指标
    this.metrics = {
      fps: 60,
      cpuUsage: 0,
      memoryUsage: 0,
      renderTime: 0,
      frameTime: 0,
      drawCalls: 0,
      triangleCount: 0,
      vertexCount: 0,
      textureMemory: 0,
      shaderCount: 0,
      activeObjects: 0
    };
  }

  /**
   * 更新性能指标
   */
  updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PerformanceOptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): PerformanceOptimizationConfig {
    return { ...this.config };
  }

  /**
   * 优化粒子数量
   */
  optimizeParticleCount(baseCount: number, distance: number): number {
    if (!this.config.enableParticleOptimization) {
      return baseCount;
    }
    
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    return this.particleOptimizer.optimizeParticleCount(baseCount, distance, isPerformanceMode);
  }

  /**
   * 计算最佳像素比率
   */
  calculateOptimalPixelRatio(): number {
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    return this.renderOptimizer.calculateOptimalPixelRatio(isPerformanceMode);
  }

  /**
   * 计算是否应该跳过当前帧
   */
  shouldSkipFrame(): boolean {
    if (!this.config.enableFrameSkipping) {
      return false;
    }
    
    this.frameIndex++;
    return this.renderOptimizer.shouldSkipFrame(this.frameIndex, this.metrics.fps);
  }

  /**
   * 计算渲染分辨率缩放因子
   */
  calculateRenderScale(): number {
    if (!this.config.enableDynamicResolution) {
      return 1.0;
    }
    
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    this.currentScale = this.renderOptimizer.calculateRenderScale(
      this.metrics.fps,
      this.currentScale,
      isPerformanceMode
    );
    return this.currentScale;
  }

  /**
   * 检查对象是否可见（视锥体剔除）
   */
  isObjectVisible(object: THREE.Object3D): boolean {
    if (!this.config.enableCulling) {
      return true;
    }
    
    const position = object.position;
    const size = object.geometry instanceof THREE.BufferGeometry ? 
      (object.geometry.boundingSphere?.radius || 1) : 1;
    
    return this.renderOptimizer.isObjectVisible(
      { x: position.x, y: position.y, z: position.z },
      size,
      this.camera
    );
  }

  /**
   * 根据优先级对对象进行排序
   */
  sortObjectsByPriority(objects: THREE.Object3D[]): THREE.Object3D[] {
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    return this.renderOptimizer.sortObjectsByPriority(
      objects,
      this.camera,
      isPerformanceMode
    );
  }

  /**
   * 应用优化策略
   */
  applyOptimizations(deltaTime: number): void {
    if (!this.config.enableAutoOptimization) {
      return;
    }
    
    // 更新FPS
    const fps = this.performanceMonitor.updateFPS();
    this.metrics.fps = fps;
    
    // 根据策略应用不同的优化
    switch (this.config.strategy) {
      case OptimizationStrategy.CONSERVATIVE:
        this.applyConservativeOptimization();
        break;
      case OptimizationStrategy.BALANCED:
        this.applyBalancedOptimization();
        break;
      case OptimizationStrategy.AGGRESSIVE:
        this.applyAggressiveOptimization();
        break;
      case OptimizationStrategy.ADAPTIVE:
        this.applyAdaptiveOptimization();
        break;
    }
    
    // 更新渲染器设置
    this.updateRendererSettings();
  }

  /**
   * 应用保守优化策略
   */
  private applyConservativeOptimization(): void {
    // 仅在性能严重下降时应用优化
    if (this.metrics.fps < this.config.targetFPS * 0.6) {
      this.enablePerformanceMode();
    }
  }

  /**
   * 应用平衡优化策略
   */
  private applyBalancedOptimization(): void {
    // 当性能低于目标FPS的80%时应用优化
    if (this.metrics.fps < this.config.targetFPS * 0.8) {
      this.enableBalancedOptimization();
    } else if (this.metrics.fps > this.config.targetFPS * 1.2) {
      this.restoreQuality();
    }
  }

  /**
   * 应用激进优化策略
   */
  private applyAggressiveOptimization(): void {
    // 始终保持高性能
    this.enablePerformanceMode();
    
    // 当性能良好时可以略微提升质量
    if (this.metrics.fps > this.config.targetFPS * 1.5) {
      this.restoreSomeQuality();
    }
  }

  /**
   * 应用自适应优化策略
   */
  private applyAdaptiveOptimization(): void {
    // 根据实时性能动态调整优化强度
    const fpsRatio = this.metrics.fps / this.config.targetFPS;
    
    // 只在必要时应用优化，避免频繁切换状态
    if (fpsRatio < 0.5) {
      // 性能严重不足，应用最大优化
      this.enablePerformanceMode();
    } else if (fpsRatio < 0.8) {
      // 性能不足，应用平衡优化
      this.enableBalancedOptimization();
    } else if (fpsRatio > 1.5) {
      // 性能优秀，可以提升质量
      this.restoreQuality();
    }
    // 性能良好，保持当前设置
  }

  // 存储当前优化状态，避免不必要的状态切换
  private currentOptimizationLevel: 'high' | 'medium' | 'low' = 'high';
  private lastViewOffset: { scale: number } | null = null;
  private lastPixelRatio: number = window.devicePixelRatio;
  private lastShadowEnabled: boolean = true;

  /**
   * 启用性能模式
   */
  private enablePerformanceMode(): void {
    // 只在当前不是低性能模式时应用更改
    if (this.currentOptimizationLevel !== 'low') {
      // 设置低分辨率
      const scale = 0.6;
      this.camera.setViewOffset(
        window.innerWidth,
        window.innerHeight,
        0,
        0,
        Math.floor(window.innerWidth * scale),
        Math.floor(window.innerHeight * scale)
      );
      this.lastViewOffset = { scale };
      
      // 禁用阴影
      if (this.renderer.shadowMap.enabled) {
        this.renderer.shadowMap.enabled = false;
        this.lastShadowEnabled = false;
      }
      
      // 降低抗锯齿
      const newPixelRatio = Math.min(1.0, window.devicePixelRatio);
      if (this.renderer.getPixelRatio() !== newPixelRatio) {
        this.renderer.setPixelRatio(newPixelRatio);
        this.lastPixelRatio = newPixelRatio;
      }
      
      this.currentOptimizationLevel = 'low';
    }
  }

  /**
   * 启用平衡优化
   */
  private enableBalancedOptimization(): void {
    // 只在当前不是中性能模式时应用更改
    if (this.currentOptimizationLevel !== 'medium') {
      // 适度降低分辨率
      const scale = Math.max(0.7, this.calculateRenderScale());
      this.camera.setViewOffset(
        window.innerWidth,
        window.innerHeight,
        0,
        0,
        Math.floor(window.innerWidth * scale),
        Math.floor(window.innerHeight * scale)
      );
      this.lastViewOffset = { scale };
      
      // 根据性能调整阴影
      const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
      const shouldEnableShadows = this.renderOptimizer.shouldEnableShadows(
        isPerformanceMode,
        this.metrics.activeObjects
      );
      if (this.renderer.shadowMap.enabled !== shouldEnableShadows) {
        this.renderer.shadowMap.enabled = shouldEnableShadows;
        this.lastShadowEnabled = shouldEnableShadows;
      }
      
      // 调整像素比率
      const newPixelRatio = this.calculateOptimalPixelRatio();
      if (this.renderer.getPixelRatio() !== newPixelRatio) {
        this.renderer.setPixelRatio(newPixelRatio);
        this.lastPixelRatio = newPixelRatio;
      }
      
      this.currentOptimizationLevel = 'medium';
    }
  }

  /**
   * 恢复质量
   */
  private restoreQuality(): void {
    // 只在当前不是高性能模式时应用更改
    if (this.currentOptimizationLevel !== 'high') {
      // 恢复原始分辨率
      this.camera.clearViewOffset();
      this.lastViewOffset = null;
      
      // 启用阴影
      if (!this.renderer.shadowMap.enabled) {
        this.renderer.shadowMap.enabled = true;
        this.lastShadowEnabled = true;
      }
      
      // 恢复高像素比率
      if (this.renderer.getPixelRatio() !== window.devicePixelRatio) {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.lastPixelRatio = window.devicePixelRatio;
      }
      
      this.currentOptimizationLevel = 'high';
    }
  }

  /**
   * 恢复部分质量
   */
  private restoreSomeQuality(): void {
    // 略微提高分辨率
    const scale = Math.min(1.0, this.currentScale + 0.1);
    this.camera.setViewOffset(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      Math.floor(window.innerWidth * scale),
      Math.floor(window.innerHeight * scale)
    );
    this.lastViewOffset = { scale };
    
    // 可以选择性启用阴影
    if (this.metrics.activeObjects < 30 && !this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = true;
      this.lastShadowEnabled = true;
    }
  }

  /**
   * 更新渲染器设置
   */
  private updateRendererSettings(): void {
    // 更新阴影质量
    const isPerformanceMode = this.metrics.fps < this.config.targetFPS * 0.8;
    const shadowResolution = this.renderOptimizer.getOptimalShadowMapResolution(isPerformanceMode);
    
    // 更新阴影贴图分辨率
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.mapSize.width = shadowResolution;
      this.renderer.shadowMap.mapSize.height = shadowResolution;
    }
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // FPS建议
    if (this.metrics.fps < this.config.targetFPS * 0.8) {
      suggestions.push(`当前FPS (${this.metrics.fps.toFixed(1)}) 低于目标FPS (${this.config.targetFPS})，建议降低场景复杂度或启用更激进的优化策略`);
    }
    
    // 内存建议
    if (this.metrics.memoryUsage > this.config.maxMemoryUsageMB * 0.8) {
      suggestions.push(`当前内存使用 (${this.metrics.memoryUsage.toFixed(0)}MB) 接近上限 (${this.config.maxMemoryUsageMB}MB)，建议释放未使用的资源`);
    }
    
    // 绘制调用建议
    if (this.metrics.drawCalls > this.config.maxDrawCalls * 0.8) {
      suggestions.push(`当前绘制调用 (${this.metrics.drawCalls}) 接近上限 (${this.config.maxDrawCalls})，建议合并几何体或使用实例化渲染`);
    }
    
    // 粒子优化建议
    if (this.config.enableParticleOptimization && this.metrics.activeObjects > 1000) {
      suggestions.push(`当前活跃对象数量 (${this.metrics.activeObjects}) 较多，建议启用更激进的粒子优化`);
    }
    
    return suggestions;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理视图偏移
    this.camera.clearViewOffset();
    
    // 恢复默认设置
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }
}

/**
 * 性能优化器工厂
 */
export class PerformanceOptimizerFactory {
  /**
   * 创建性能优化器实例
   */
  static create(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    config?: Partial<PerformanceOptimizationConfig>
  ): PerformanceOptimizer {
    return new PerformanceOptimizer(scene, camera, renderer, config);
  }
}
