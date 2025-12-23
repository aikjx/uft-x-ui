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
    const drawCalls = this.performanceMonitor.getDrawCallCount();
    const avgMemoryUsage = this.performanceMonitor.getAverageMemoryUsage();
    const objectCount = this.scene ? this.countSceneObjects() : 0;
    const newStrategy = { ...this.currentStrategy };
    
    // 动态调整优化力度
    let adjustmentFactor = 1.0;
    if (avgFPS < 20) adjustmentFactor = 1.5; // 严重性能问题，加大调整力度
    else if (avgFPS < 30) adjustmentFactor = 1.2;
    else if (avgFPS > 55) adjustmentFactor = 0.8; // 性能良好，微调
    
    // 基于FPS调整策略
    if (avgFPS < 30) {
      // 性能较差，降低质量
      // 分阶段调整粒子数量
      if (newStrategy.particleCount > VISUALIZATION_CONFIG.performance.minParticles || 100) {
        const particleReduction = Math.max(
          20, // 最少减少20个
          Math.floor(newStrategy.particleCount * 0.2 * adjustmentFactor)
        );
        newStrategy.particleCount = Math.max(
          VISUALIZATION_CONFIG.performance.minParticles || 50,
          newStrategy.particleCount - particleReduction
        );
      }
      
      // 调整场分辨率
      if (newStrategy.fieldResolution > 10) {
        const resolutionReduction = Math.max(
          2, // 最少减少2
          Math.floor(newStrategy.fieldResolution * 0.2 * adjustmentFactor)
        );
        newStrategy.fieldResolution = Math.max(8, newStrategy.fieldResolution - resolutionReduction);
      }
      
      // 调整渲染缩放
      if (newStrategy.renderScale > 0.4) {
        const scaleReduction = Math.max(
          0.05, // 最少减少0.05
          0.1 * adjustmentFactor
        );
        newStrategy.renderScale = Math.max(0.3, newStrategy.renderScale - scaleReduction);
      }
      
      // 调整阴影质量
      if (newStrategy.shadowQuality === 'high') {
        newStrategy.shadowQuality = 'medium';
      } else if (newStrategy.shadowQuality === 'medium') {
        newStrategy.shadowQuality = 'low';
      }
      
      // 根据对象数量调整阴影
      if (newStrategy.enableShadows) {
        const maxObjectsWithShadows = avgFPS < 20 ? 10 : avgFPS < 30 ? 20 : 30;
        if (objectCount > maxObjectsWithShadows) {
          newStrategy.enableShadows = false;
        }
      }
      
      // 启用更多优化
      newStrategy.enableLOD = true;
      newStrategy.enableCulling = true;
    } else if (avgFPS > 55 && Date.now() - this.lastOptimizationTime > 10000) {
      // 性能良好，尝试提高质量（但不要太频繁）
      const maxParticles = VISUALIZATION_CONFIG.performance.maxParticles || 500;
      
      // 分阶段增加粒子数量
      if (newStrategy.particleCount < maxParticles) {
        const particleIncrease = Math.min(
          30, // 最多增加30个
          Math.floor((maxParticles - newStrategy.particleCount) * 0.2)
        );
        newStrategy.particleCount = Math.min(maxParticles, newStrategy.particleCount + particleIncrease);
      }
      
      // 增加场分辨率
      const maxResolution = 40;
      if (newStrategy.fieldResolution < maxResolution) {
        const resolutionIncrease = Math.min(
          3, // 最多增加3
          Math.floor((maxResolution - newStrategy.fieldResolution) * 0.2)
        );
        newStrategy.fieldResolution = Math.min(maxResolution, newStrategy.fieldResolution + resolutionIncrease);
      }
      
      // 增加渲染缩放
      if (newStrategy.renderScale < 1.0) {
        const scaleIncrease = Math.min(
          0.1, // 最多增加0.1
          (1.0 - newStrategy.renderScale) * 0.2
        );
        newStrategy.renderScale = Math.min(1.0, newStrategy.renderScale + scaleIncrease);
      }
      
      // 提高阴影质量
      if (newStrategy.shadowQuality === 'low') {
        newStrategy.shadowQuality = 'medium';
      } else if (newStrategy.shadowQuality === 'medium' && avgFPS > 60 && objectCount < 20) {
        newStrategy.shadowQuality = 'high';
      }
      
      // 选择性启用阴影
      if (!newStrategy.enableShadows && objectCount < 20) {
        newStrategy.enableShadows = true;
      }
    }
    
    // 基于内存使用调整
    if (avgMemoryUsage > 400) { // 400MB
      newStrategy.enableLOD = true;
      newStrategy.enableCulling = true;
      if (newStrategy.particleCount > 150) {
        newStrategy.particleCount = Math.max(100, Math.floor(newStrategy.particleCount * 0.9));
      }
    } else if (avgMemoryUsage < 200 && avgFPS > 50) {
      // 内存充足且性能良好，可以适当增加复杂度
      newStrategy.enableLOD = false; // 禁用LOD以提高质量
    }
    
    // 基于绘制调用调整
    if (drawCalls > 200) {
      // 绘制调用过多，启用更多优化
      newStrategy.enableLOD = true;
      newStrategy.enableCulling = true;
      if (newStrategy.particleCount > 200) {
        newStrategy.particleCount = Math.max(150, Math.floor(newStrategy.particleCount * 0.85));
      }
    }
    
    // 基于对象数量调整
    if (objectCount > 50) {
      // 场景复杂，降低质量
      if (newStrategy.particleCount > 150) {
        newStrategy.particleCount = Math.max(100, Math.floor(newStrategy.particleCount * 0.9));
      }
      newStrategy.enableShadows = false;
    }
    
    // 智能调整像素比率
    const devicePixelRatio = window.devicePixelRatio;
    if (avgFPS < 25) {
      // 性能严重不足，强制降低像素比率
      newStrategy.pixelRatio = Math.min(1.0, devicePixelRatio * 0.5);
    } else if (avgFPS < 40) {
      // 性能一般，适度降低像素比率
      newStrategy.pixelRatio = Math.min(1.5, devicePixelRatio * 0.75);
    } else {
      // 性能良好，使用合适的像素比率
      newStrategy.pixelRatio = Math.min(2.0, devicePixelRatio);
    }
    
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
  
  // 获取当前性能模式
  public getCurrentMode(): PerformanceMode {
    return this.currentStrategy.performanceMode;
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
  public shouldSkipFrame(additionalFactors?: {
    sceneComplexity?: number;
    hasUserInteraction?: boolean;
    isImportantFrame?: boolean;
    frameTimeHistory?: number[];
  }): boolean {
    return this.renderOptimizer.shouldSkipFrame(
      this.frameIndex,
      this.performanceMonitor.getAverageFPS(),
      additionalFactors
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
