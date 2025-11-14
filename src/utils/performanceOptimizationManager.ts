import * as THREE from 'three';
import { PerformanceMonitor, ParticleOptimizer, RenderOptimizer, performanceMonitor, particleOptimizer, renderOptimizer } from './performanceUtils';
import { VISUALIZATION_CONFIG } from '../constants';

// 优化策略类型定义
export type PerformanceMode = 'high' | 'medium' | 'low' | 'auto';
export type OptimizationStrategy = {
  performanceMode: PerformanceMode;
  particleCount: number;
  fieldResolution: number;
  renderScale: number;
  shadowQuality: 'high' | 'medium' | 'low';
  frameSkipThreshold: number;
  enableLOD: boolean;
  enableCulling: boolean;
  enableShadows: boolean;
  pixelRatio: number;
};

export interface PerformanceStats {
  fps: number;
  avgFPS: number;
  memoryUsage: number;
  avgMemoryUsage: number;
  drawCallCount: number;
  isPerformanceMode: boolean;
  optimizationSuggestions: string[];
  particleCount: number;
  fieldResolution: number;
  renderScale: number;
}

// 性能优化管理器类
export class PerformanceOptimizationManager {
  private performanceMonitor: PerformanceMonitor;
  private particleOptimizer: ParticleOptimizer;
  private renderOptimizer: RenderOptimizer;
  
  private currentStrategy: OptimizationStrategy;
  private isAutoOptimizing: boolean = true;
  private lastOptimizationTime: number = 0;
  private optimizationInterval: number = 5000; // 5秒优化一次
  
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private container: HTMLElement | null = null;
  
  // 统计数据
  private frameIndex: number = 0;
  private currentParticleCount: number = 0;
  private currentFieldResolution: number = 0;
  private currentRenderScale: number = 1.0;
  
  // 事件回调
  private onPerformanceChangeCallback?: (stats: PerformanceStats) => void;
  private onOptimizationAppliedCallback?: (strategy: OptimizationStrategy) => void;
  
  constructor() {
    // 使用现有的单例实例
    this.performanceMonitor = performanceMonitor;
    this.particleOptimizer = particleOptimizer;
    this.renderOptimizer = renderOptimizer;
    
    // 设置默认策略
    this.currentStrategy = {
      performanceMode: 'auto',
      particleCount: VISUALIZATION_CONFIG.performance.defaultParticleCount || 200,
      fieldResolution: 20,
      renderScale: 1.0,
      shadowQuality: 'medium',
      frameSkipThreshold: 16,
      enableLOD: true,
      enableCulling: true,
      enableShadows: VISUALIZATION_CONFIG.performance.enableShadows || true,
      pixelRatio: this.renderOptimizer.calculateOptimalPixelRatio(false)
    };
    
    this.currentParticleCount = this.currentStrategy.particleCount;
    this.currentFieldResolution = this.currentStrategy.fieldResolution;
    this.currentRenderScale = this.currentStrategy.renderScale;
    
    console.log('性能优化管理器已初始化');
  }
  
  // 初始化管理器，连接Three.js组件
  public initialize(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, container: HTMLElement): void {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.container = container;
    
    // 应用初始设置
    this.applyStrategy(this.currentStrategy);
    
    console.log('性能优化管理器已连接到Three.js场景');
  }
  
  // 更新性能数据并执行优化
  public update(deltaTime: number): void {
    this.frameIndex++;
    
    // 更新FPS
    const currentFPS = this.performanceMonitor.updateFPS();
    
    // 更新渲染调用计数
    if (this.renderer) {
      this.performanceMonitor.updateDrawCallCount(
        this.renderer.info.render.calls || 0
      );
    }
    
    // 更新内存使用情况
    const geometryCount = this.scene ? this.countSceneObjects('Geometry') : 0;
    const textureCount = this.scene ? this.countSceneObjects('Texture') : 0;
    const shaderCount = this.scene ? this.countSceneObjects('Shader') : 0;
    this.performanceMonitor.estimateMemoryUsage(geometryCount, textureCount, shaderCount);
    
    // 在自动优化模式下，定期执行优化
    if (this.isAutoOptimizing && Date.now() - this.lastOptimizationTime > this.optimizationInterval) {
      this.autoOptimize();
      this.lastOptimizationTime = Date.now();
    }
    
    // 触发性能变化回调
    if (this.onPerformanceChangeCallback) {
      this.onPerformanceChangeCallback(this.getPerformanceStats());
    }
  }
  
  // 自动优化策略
  private autoOptimize(): void {
    const avgFPS = this.performanceMonitor.getAverageFPS();
    const isPerformanceMode = this.performanceMonitor.getPerformanceMode();
    const newStrategy = { ...this.currentStrategy };
    
    // 基于FPS调整策略
    if (avgFPS < 30) {
      // 性能较差，降低质量
      if (newStrategy.particleCount > VISUALIZATION_CONFIG.performance.minParticles || 100) {
        newStrategy.particleCount = Math.max(
          VISUALIZATION_CONFIG.performance.minParticles || 50,
          Math.floor(newStrategy.particleCount * 0.8)
        );
      }
      if (newStrategy.fieldResolution > 15) {
        newStrategy.fieldResolution = Math.max(10, Math.floor(newStrategy.fieldResolution * 0.8));
      }
      if (newStrategy.renderScale > 0.6) {
        newStrategy.renderScale = Math.max(0.4, newStrategy.renderScale - 0.1);
      }
      if (newStrategy.shadowQuality === 'high') {
        newStrategy.shadowQuality = 'medium';
      } else if (newStrategy.shadowQuality === 'medium') {
        newStrategy.shadowQuality = 'low';
      }
      if (newStrategy.enableShadows && this.scene && this.countSceneObjects() > 20) {
        newStrategy.enableShadows = false;
      }
    } else if (avgFPS > 55 && Date.now() - this.lastOptimizationTime > 10000) {
      // 性能良好，尝试提高质量（但不要太频繁）
      const maxParticles = VISUALIZATION_CONFIG.performance.maxParticles || 500;
      if (newStrategy.particleCount < maxParticles) {
        newStrategy.particleCount = Math.min(maxParticles, Math.floor(newStrategy.particleCount * 1.1));
      }
      if (newStrategy.fieldResolution < 30) {
        newStrategy.fieldResolution = Math.min(30, Math.floor(newStrategy.fieldResolution * 1.1));
      }
      if (newStrategy.renderScale < 1.0) {
        newStrategy.renderScale = Math.min(1.0, newStrategy.renderScale + 0.1);
      }
      if (newStrategy.shadowQuality === 'low' && !newStrategy.enableShadows) {
        newStrategy.shadowQuality = 'medium';
        newStrategy.enableShadows = true;
      }
    }
    
    // 检查内存使用
    const avgMemoryUsage = this.performanceMonitor.getAverageMemoryUsage();
    if (avgMemoryUsage > 500) { // 500MB
      newStrategy.enableLOD = true;
      newStrategy.enableCulling = true;
      if (newStrategy.particleCount > 150) {
        newStrategy.particleCount = Math.max(100, Math.floor(newStrategy.particleCount * 0.9));
      }
    }
    
    // 更新像素比率
    newStrategy.pixelRatio = this.renderOptimizer.calculateOptimalPixelRatio(isPerformanceMode);
    
    // 应用新策略（如果有变化）
    if (!this.areStrategiesEqual(this.currentStrategy, newStrategy)) {
      this.applyStrategy(newStrategy);
    }
  }
  
  // 应用优化策略
  public applyStrategy(strategy: OptimizationStrategy): void {
    this.currentStrategy = { ...strategy };
    
    // 更新当前状态
    this.currentParticleCount = strategy.particleCount;
    this.currentFieldResolution = strategy.fieldResolution;
    this.currentRenderScale = strategy.renderScale;
    
    // 应用渲染优化设置
    if (this.renderer) {
      // 设置像素比率
      this.renderer.setPixelRatio(strategy.pixelRatio);
      
      // 应用渲染分辨率
      if (this.container) {
        const width = this.container.clientWidth * strategy.renderScale;
        const height = this.container.clientHeight * strategy.renderScale;
        this.renderer.setSize(width, height, false);
        if (this.camera instanceof THREE.PerspectiveCamera) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
      }
      
      // 设置阴影质量
      if (strategy.enableShadows) {
        let shadowMapResolution: number;
        switch (strategy.shadowQuality) {
          case 'high':
            shadowMapResolution = 1024;
            break;
          case 'medium':
            shadowMapResolution = 512;
            break;
          case 'low':
            shadowMapResolution = 256;
            break;
        }
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // 更新所有灯光的阴影贴图分辨率
        if (this.scene) {
          this.scene.traverse((object) => {
            if (object instanceof THREE.Light && object.castShadow) {
              if (object.shadow) {
                object.shadow.mapSize.width = shadowMapResolution;
                object.shadow.mapSize.height = shadowMapResolution;
              }
            }
          });
        }
      } else {
        this.renderer.shadowMap.enabled = false;
      }
      
      // 启用/禁用视锥剔除
      this.renderer.localClippingEnabled = strategy.enableCulling;
    }
    
    // 触发优化应用回调
    if (this.onOptimizationAppliedCallback) {
      this.onOptimizationAppliedCallback(this.currentStrategy);
    }
    
    console.log('应用优化策略:', this.currentStrategy);
  }
  
  // 设置性能模式
  public setPerformanceMode(mode: PerformanceMode): void {
    this.currentStrategy.performanceMode = mode;
    
    // 根据模式预设策略
    switch (mode) {
      case 'high':
        this.applyStrategy({
          ...this.currentStrategy,
          particleCount: 300,
          fieldResolution: 30,
          renderScale: 1.0,
          shadowQuality: 'high',
          enableShadows: true,
          frameSkipThreshold: 16,
          enableLOD: false,
          enableCulling: true,
          pixelRatio: this.renderOptimizer.calculateOptimalPixelRatio(false)
        });
        this.isAutoOptimizing = false;
        break;
      case 'medium':
        this.applyStrategy({
          ...this.currentStrategy,
          particleCount: 200,
          fieldResolution: 20,
          renderScale: 0.8,
          shadowQuality: 'medium',
          enableShadows: true,
          frameSkipThreshold: 16,
          enableLOD: true,
          enableCulling: true,
          pixelRatio: this.renderOptimizer.calculateOptimalPixelRatio(false)
        });
        this.isAutoOptimizing = false;
        break;
      case 'low':
        this.applyStrategy({
          ...this.currentStrategy,
          particleCount: 100,
          fieldResolution: 15,
          renderScale: 0.6,
          shadowQuality: 'low',
          enableShadows: false,
          frameSkipThreshold: 20,
          enableLOD: true,
          enableCulling: true,
          pixelRatio: 1.0
        });
        this.isAutoOptimizing = false;
        break;
      case 'auto':
        this.isAutoOptimizing = true;
        break;
    }
  }
  
  // 启用/禁用自动优化
  public setAutoOptimize(enabled: boolean): void {
    this.isAutoOptimizing = enabled;
    if (enabled) {
      this.currentStrategy.performanceMode = 'auto';
    }
  }
  
  // 获取当前性能统计
  public getPerformanceStats(): PerformanceStats {
    return {
      fps: this.performanceMonitor.updateFPS(),
      avgFPS: this.performanceMonitor.getAverageFPS(),
      memoryUsage: this.performanceMonitor.getAverageMemoryUsage(),
      avgMemoryUsage: this.performanceMonitor.getAverageMemoryUsage(),
      drawCallCount: this.performanceMonitor.getDrawCallCount(),
      isPerformanceMode: this.performanceMonitor.getPerformanceMode(),
      optimizationSuggestions: this.performanceMonitor.getOptimizationSuggestions(),
      particleCount: this.currentParticleCount,
      fieldResolution: this.currentFieldResolution,
      renderScale: this.currentRenderScale
    };
  }
  
  // 获取当前优化策略
  public getCurrentStrategy(): OptimizationStrategy {
    return { ...this.currentStrategy };
  }
  
  // 获取优化后的粒子数量（考虑LOD）
  public getOptimizedParticleCount(baseCount: number, cameraDistance?: number): number {
    const distance = cameraDistance || (this.camera && this.scene?.position ? 
      this.camera.position.distanceTo(this.scene.position) : 0);
    
    return this.particleOptimizer.optimizeParticleCount(
      baseCount,
      distance,
      this.performanceMonitor.getPerformanceMode()
    );
  }
  
  // 检查是否应该跳过当前帧
  public shouldSkipFrame(): boolean {
    return this.renderOptimizer.shouldSkipFrame(
      this.frameIndex,
      this.performanceMonitor.getAverageFPS()
    );
  }
  
  // 排序场景对象以优化渲染
  public sortSceneObjectsByPriority(objects: THREE.Object3D[]): THREE.Object3D[] {
    if (!this.camera) return objects;
    
    return this.renderOptimizer.sortObjectsByPriority(
      objects,
      this.camera,
      this.performanceMonitor.getPerformanceMode()
    );
  }
  
  // 清理资源
  public cleanMemory(): void {
    // 清理渲染器信息
    if (this.renderer) {
      this.renderer.info.reset();
    }
    
    // 触发垃圾回收
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        console.warn('无法触发垃圾回收:', e);
      }
    }
    
    console.log('执行内存清理');
  }
  
  // 设置回调函数
  public onPerformanceChange(callback: (stats: PerformanceStats) => void): void {
    this.onPerformanceChangeCallback = callback;
  }
  
  public onOptimizationApplied(callback: (strategy: OptimizationStrategy) => void): void {
    this.onOptimizationAppliedCallback = callback;
  }
  
  // 工具方法：比较两个策略是否相等
  private areStrategiesEqual(strategy1: OptimizationStrategy, strategy2: OptimizationStrategy): boolean {
    return (
      strategy1.particleCount === strategy2.particleCount &&
      strategy1.fieldResolution === strategy2.fieldResolution &&
      Math.abs(strategy1.renderScale - strategy2.renderScale) < 0.01 &&
      strategy1.shadowQuality === strategy2.shadowQuality &&
      strategy1.frameSkipThreshold === strategy2.frameSkipThreshold &&
      strategy1.enableLOD === strategy2.enableLOD &&
      strategy1.enableCulling === strategy2.enableCulling &&
      strategy1.enableShadows === strategy2.enableShadows &&
      Math.abs(strategy1.pixelRatio - strategy2.pixelRatio) < 0.01
    );
  }
  
  // 统计场景中的对象数量
  private countSceneObjects(type?: string): number {
    if (!this.scene) return 0;
    
    let count = 0;
    this.scene.traverse((object) => {
      if (!type || 
          (type === 'Geometry' && object.geometry) ||
          (type === 'Texture' && object.material && 
           ((object.material as THREE.Material).map || 
            (object.material as THREE.Material).emissiveMap ||
            (object.material as THREE.Material).normalMap)) ||
          (type === 'Shader' && object.material && 
           (object.material as THREE.ShaderMaterial).isShaderMaterial)) {
        count++;
      }
    });
    
    return count;
  }
}

// 导出单例实例
export const performanceOptimizationManager = new PerformanceOptimizationManager();
