import { VISUALIZATION_CONFIG } from '../constants';

/**
 * 性能监控和优化工具类
 */
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsHistory: number[] = [];
  private readonly fpsHistorySize: number = 10;
  private currentFPS: number = 60;
  private isPerformanceMode: boolean = false;
  private memoryUsageHistory: number[] = [];
  private readonly memoryHistorySize: number = 20;
  private lastDrawCallCount: number = 0;

  /**
   * 更新FPS计数
   */
  updateFPS(): number {
    const now = performance.now();
    this.frameCount++;

    // 每秒钟计算一次FPS
    if (now - this.lastTime >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;

      // 维护FPS历史记录
      this.fpsHistory.push(this.currentFPS);
      if (this.fpsHistory.length > this.fpsHistorySize) {
        this.fpsHistory.shift();
      }

      // 根据FPS自动切换性能模式
      this.updatePerformanceMode();
    }

    return this.currentFPS;
  }

  /**
   * 更新性能模式
   */
  private updatePerformanceMode(): void {
    const avgFPS = this.getAverageFPS();
    
    if (avgFPS < VISUALIZATION_CONFIG.performance.performanceModeThresholdFPS && !this.isPerformanceMode) {
      this.isPerformanceMode = true;
      console.log('切换到性能模式，当前平均FPS:', avgFPS);
    } else if (avgFPS > VISUALIZATION_CONFIG.performance.qualityThresholdFPS && this.isPerformanceMode) {
      this.isPerformanceMode = false;
      console.log('切换到质量模式，当前平均FPS:', avgFPS);
    }
  }

  /**
   * 获取平均FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * 获取当前性能模式
   */
  getPerformanceMode(): boolean {
    return this.isPerformanceMode;
  }

  /**
   * 估算内存使用情况
   */
  estimateMemoryUsage(geometries: number, textures: number, shaders: number): number {
    // 简单估算：每个几何体1KB，每个纹理根据分辨率，每个着色器5KB
    const geometryMemory = geometries * 1; // KB
    const textureMemory = textures * 2; // KB
    const shaderMemory = shaders * 5; // KB
    
    const totalMemoryKB = geometryMemory + textureMemory + shaderMemory;
    const totalMemoryMB = totalMemoryKB / 1024;
    
    // 维护内存使用历史
    this.memoryUsageHistory.push(totalMemoryMB);
    if (this.memoryUsageHistory.length > this.memoryHistorySize) {
      this.memoryUsageHistory.shift();
    }
    
    return totalMemoryMB;
  }

  /**
   * 获取平均内存使用情况
   */
  getAverageMemoryUsage(): number {
    if (this.memoryUsageHistory.length === 0) return 0;
    const sum = this.memoryUsageHistory.reduce((acc, usage) => acc + usage, 0);
    return sum / this.memoryUsageHistory.length;
  }

  /**
   * 检查是否超出最大内存限制
   */
  isMemoryExceeded(): boolean {
    return this.getAverageMemoryUsage() > VISUALIZATION_CONFIG.performance.maxMemoryUsageMB;
  }

  /**
   * 更新绘制调用计数
   */
  updateDrawCallCount(count: number): void {
    this.lastDrawCallCount = count;
  }

  /**
   * 获取绘制调用计数
   */
  getDrawCallCount(): number {
    return this.lastDrawCallCount;
  }

  /**
   * 检查是否超出最大绘制调用限制
   */
  isDrawCallsExceeded(): boolean {
    return this.lastDrawCallCount > VISUALIZATION_CONFIG.performance.maxDrawCalls;
  }

  /**
   * 获取性能优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.getAverageFPS() < VISUALIZATION_CONFIG.performance.qualityThresholdFPS) {
      suggestions.push('当前FPS低于质量阈值，建议降低粒子数量或场景复杂度');
    }
    
    if (this.isMemoryExceeded()) {
      suggestions.push('内存使用过高，建议释放未使用的资源');
    }
    
    if (this.isDrawCallsExceeded()) {
      suggestions.push('绘制调用过多，建议合并几何体或使用实例化渲染');
    }
    
    return suggestions;
  }
}

/**
 * 粒子系统优化器
 */
export class ParticleOptimizer {
  /**
   * 根据性能模式和相机距离优化粒子数量
   */
  optimizeParticleCount(baseCount: number, distance: number, isPerformanceMode: boolean): number {
    if (isPerformanceMode) {
      // 性能模式下减少粒子数量
      const reducedCount = Math.max(
        VISUALIZATION_CONFIG.performance.minParticles,
        baseCount * 0.5
      );
      return Math.floor(reducedCount);
    }
    
    // 根据距离调整粒子数量
    const distanceFactor = Math.max(0.1, 1 - distance * VISUALIZATION_CONFIG.performance.particleDistanceFactor);
    const adjustedCount = baseCount * distanceFactor;
    
    return Math.floor(
      Math.min(
        VISUALIZATION_CONFIG.performance.maxParticles,
        Math.max(
          VISUALIZATION_CONFIG.performance.minParticles,
          adjustedCount
        )
      )
    );
  }

  /**
   * 根据LOD级别优化粒子大小和细节
   */
  getParticleLODLevel(distance: number): number {
    const maxDistance = VISUALIZATION_CONFIG.maxCameraDistance;
    const lodRange = maxDistance / VISUALIZATION_CONFIG.performance.particleLODLevels;
    
    return Math.min(
      VISUALIZATION_CONFIG.performance.particleLODLevels - 1,
      Math.floor(distance / lodRange)
    );
  }

  /**
   * 根据LOD级别获取粒子大小缩放因子
   */
  getParticleSizeScale(lodLevel: number): number {
    const scales = [1.0, 0.8, 0.6, 0.4];
    return scales[Math.min(lodLevel, scales.length - 1)];
  }
}

/**
 * 渲染优化器
 */
export class RenderOptimizer {
  /**
   * 计算应该使用的像素比率
   */
  calculateOptimalPixelRatio(isPerformanceMode: boolean): number {
    const devicePixelRatio = window.devicePixelRatio;
    
    if (isPerformanceMode) {
      // 性能模式下使用较低的像素比率
      return Math.min(1.5, devicePixelRatio * 0.75);
    }
    
    // 质量模式下根据设备性能调整
    if (devicePixelRatio > 2) {
      return 2;
    }
    
    return devicePixelRatio;
  }

  /**
   * 检查是否应该启用阴影
   */
  shouldEnableShadows(isPerformanceMode: boolean, objectCount: number): boolean {
    if (isPerformanceMode) {
      return false;
    }
    
    // 对象数量过多时禁用阴影
    if (objectCount > 50) {
      return false;
    }
    
    return VISUALIZATION_CONFIG.performance.enableShadows;
  }

  /**
   * 获取优化的阴影贴图分辨率
   */
  getOptimalShadowMapResolution(isPerformanceMode: boolean): number {
    if (isPerformanceMode) {
      return 256;
    }
    
    // 根据设备性能调整阴影分辨率
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return 256;
    }
    
    return VISUALIZATION_CONFIG.performance.shadowMapResolution;
  }

  /**
   * 计算是否应该跳过当前动画帧（用于帧率控制）
   */
  shouldSkipFrame(frameIndex: number, fps: number): boolean {
    if (fps > VISUALIZATION_CONFIG.performance.maxFPS) {
      return false;
    }
    
    // 根据当前FPS和目标FPS计算应该跳过的帧数
    const targetFPS = VISUALIZATION_CONFIG.performance.maxFPS;
    const skipFactor = Math.floor(targetFPS / fps);
    
    return skipFactor > 1 && frameIndex % skipFactor !== 0;
  }
}

// 创建单例实例
export const performanceMonitor = new PerformanceMonitor();
export const particleOptimizer = new ParticleOptimizer();
export const renderOptimizer = new RenderOptimizer();

/**
 * 计算FPS的工具函数
 */
export const calculateFPS = (deltaTime: number): number => {
  return deltaTime > 0 ? 1 / deltaTime : 0;
};

/**
 * 估算内存使用量
 */
export const estimateMemoryUsage = (geometries: number): number => {
  return Math.floor(geometries / 1024); // 转换为 MB
};

/**
 * 性能模式切换逻辑
 */
export const shouldSwitchToPerformanceMode = (fps: number, currentMode: boolean): boolean => {
  return fps < VISUALIZATION_CONFIG.performance.performanceModeThresholdFPS && !currentMode;
};

export const shouldSwitchToQualityMode = (fps: number, currentMode: boolean): boolean => {
  return fps > VISUALIZATION_CONFIG.performance.qualityThresholdFPS && currentMode;
};