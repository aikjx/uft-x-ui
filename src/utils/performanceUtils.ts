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
  private lastFrameTime: number = 0;
  private frameTimeHistory: number[] = [];
  private readonly frameTimeHistorySize: number = 10;
  private adaptiveTargetFPS: number = 60;
  private lastResolutionUpdate: number = 0;
  private readonly resolutionUpdateInterval: number = 3000; // 3秒更新一次分辨率

  /**
   * 计算应该使用的像素比率
   */
  calculateOptimalPixelRatio(isPerformanceMode: boolean): number {
    const devicePixelRatio = window.devicePixelRatio;
    
    if (isPerformanceMode) {
      // 性能模式下使用较低的像素比率
      return Math.min(1.0, devicePixelRatio * 0.5);
    }
    
    // 质量模式下根据设备性能调整
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency <= 4) {
        return Math.min(1.5, devicePixelRatio);
      }
    }
    
    // 根据可用内存调整（如果浏览器支持）
    const memoryInfo = (window as any).performance?.memory;
    if (memoryInfo && memoryInfo.totalJSHeapSize > 1.5 * 1024 * 1024 * 1024) { // 1.5GB
      return Math.min(2, devicePixelRatio);
    }
    
    return Math.min(3, devicePixelRatio); // 最大3倍
  }

  /**
   * 检查是否应该启用阴影
   */
  shouldEnableShadows(isPerformanceMode: boolean, objectCount: number): boolean {
    if (isPerformanceMode) {
      return false;
    }
    
    // 对象数量过多时禁用阴影
    if (objectCount > 30) {
      return false;
    }
    
    // 低性能设备禁用阴影
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
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
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency < 4) return 256;
      if (navigator.hardwareConcurrency < 8) return 512;
    }
    
    return VISUALIZATION_CONFIG.performance.shadowMapResolution;
  }

  /**
   * 计算是否应该跳过当前动画帧（用于帧率控制）
   */
  shouldSkipFrame(frameIndex: number, fps: number): boolean {
    // 更新自适应目标FPS
    this.updateAdaptiveTargetFPS(fps);
    
    if (fps > this.adaptiveTargetFPS) {
      return false;
    }
    
    // 根据当前FPS和目标FPS计算应该跳过的帧数
    const skipFactor = Math.max(1, Math.floor(this.adaptiveTargetFPS / fps));
    
    // 平滑过渡：避免跳跃式帧率变化
    const currentSkipFactor = Math.min(3, skipFactor); // 最多跳过2帧
    
    return currentSkipFactor > 1 && frameIndex % currentSkipFactor !== 0;
  }

  /**
   * 更新自适应目标FPS
   */
  private updateAdaptiveTargetFPS(currentFPS: number): void {
    // 维护帧时间历史
    const currentTime = performance.now();
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimeHistory.push(frameTime);
      if (this.frameTimeHistory.length > this.frameTimeHistorySize) {
        this.frameTimeHistory.shift();
      }
    }
    this.lastFrameTime = currentTime;
    
    // 根据当前性能和历史数据动态调整目标FPS
    if (currentFPS < 30) {
      // 性能较差时降低目标帧率
      this.adaptiveTargetFPS = Math.max(20, currentFPS * 1.1);
    } else if (currentFPS > 50) {
      // 性能良好时逐渐恢复目标帧率
      this.adaptiveTargetFPS = Math.min(60, this.adaptiveTargetFPS + 2);
    }
  }

  /**
   * 计算当前的渲染分辨率缩放因子
   */
  calculateRenderScale(fps: number, currentScale: number, isPerformanceMode: boolean): number {
    const now = Date.now();
    
    // 限制更新频率，避免频繁切换
    if (now - this.lastResolutionUpdate < this.resolutionUpdateInterval) {
      return currentScale;
    }
    
    this.lastResolutionUpdate = now;
    let newScale = currentScale;
    
    if (isPerformanceMode) {
      // 性能模式下使用较低的缩放
      newScale = 0.6;
    } else {
      // 根据FPS动态调整缩放
      if (fps < 20) {
        newScale = Math.max(0.5, currentScale * 0.8);
      } else if (fps > 45) {
        newScale = Math.min(1.0, currentScale * 1.1);
      }
    }
    
    return newScale;
  }

  /**
   * 计算对象是否在视锥体内
   * 使用简化的AABB检查来确定对象是否可见
   */
  isObjectVisible(
    position: { x: number; y: number; z: number },
    size: number,
    camera: any
  ): boolean {
    // 快速检查：如果对象离相机太远，直接判定为不可见
    const distance = Math.sqrt(
      position.x * position.x + position.y * position.y + position.z * position.z
    );
    
    if (distance > camera.far) {
      return false;
    }
    
    // 简化的视锥体检查（实际项目中可以使用Three.js的Frustum类）
    // 这里使用距离和方向简单判断
    if (camera.matrixWorldInverse) {
      const frustumSensitivity = 1.5; // 略微扩大视锥范围，避免边缘物体闪烁
      const viewDirection = camera.getWorldDirection(new THREE.Vector3());
      const objectDirection = new THREE.Vector3(position.x, position.y, position.z)
        .normalize();
      
      const dotProduct = viewDirection.dot(objectDirection);
      // 只渲染在相机前方一定角度范围内的物体
      return dotProduct > -frustumSensitivity * Math.sin(camera.fov * Math.PI / 360);
    }
    
    return true;
  }

  /**
   * 获取渲染优先级
   * 根据对象的重要性、可见性和性能成本返回优先级分数
   */
  getRenderPriority(
    object: any,
    camera: any,
    isPerformanceMode: boolean
  ): number {
    // 基础优先级
    let priority = 100;
    
    // 计算距离因子
    const distance = object.position.distanceTo(camera.position);
    const distanceFactor = Math.max(0.1, 1 - distance / camera.far);
    
    // 距离越近，优先级越高
    priority *= (0.5 + distanceFactor * 0.5);
    
    // 在性能模式下，提高距离因子的权重
    if (isPerformanceMode) {
      priority *= (0.3 + distanceFactor * 0.7);
    }
    
    // 检查是否可见
    if (!this.isObjectVisible(object.position, object.geometry?.boundingSphere?.radius || 1, camera)) {
      priority = 0; // 不可见物体优先级为0
    }
    
    // 对于高复杂度对象（如大量面的网格）降低优先级
    if (object.geometry && object.geometry.attributes && object.geometry.attributes.position) {
      const vertexCount = object.geometry.attributes.position.count;
      if (vertexCount > 1000) {
        priority *= 0.8;
      }
    }
    
    return priority;
  }

  /**
   * 根据优先级对场景对象进行排序
   */
  sortObjectsByPriority(
    objects: any[],
    camera: any,
    isPerformanceMode: boolean
  ): any[] {
    return [...objects].sort((a, b) => {
      const priorityA = this.getRenderPriority(a, camera, isPerformanceMode);
      const priorityB = this.getRenderPriority(b, camera, isPerformanceMode);
      return priorityB - priorityA; // 降序排列，优先级高的在前
    });
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