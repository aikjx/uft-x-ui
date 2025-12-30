import * as THREE from 'three';

interface PerformanceStats {
  fps: number;
  renderTime: number;
  frameCount: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  updateInterval?: number;
  onStatsUpdate?: (stats: PerformanceStats) => void;
}

export class PerformanceMonitor {
  private enabled: boolean;
  private updateInterval: number;
  private onStatsUpdate?: (stats: PerformanceStats) => void;
  private stats: PerformanceStats;
  private lastUpdateTime: number;
  private frameCount: number;
  private renderer?: THREE.WebGLRenderer;
  private animationFrameId?: number;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.enabled = options.enabled ?? false;
    this.updateInterval = options.updateInterval ?? 1000; // 默认1秒更新一次
    this.onStatsUpdate = options.onStatsUpdate;
    
    this.stats = {
      fps: 0,
      renderTime: 0,
      frameCount: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0
    };
    
    this.lastUpdateTime = performance.now();
    this.frameCount = 0;
  }

  /**
   * 设置渲染器
   */
  public setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }

  /**
   * 启用性能监控
   */
  public enable(): void {
    this.enabled = true;
    if (!this.animationFrameId) {
      this.startMonitoring();
    }
  }

  /**
   * 禁用性能监控
   */
  public disable(): void {
    this.enabled = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  /**
   * 切换性能监控状态
   */
  public toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * 获取当前性能统计
   */
  public getStats(): PerformanceStats {
    return { ...this.stats };
  }

  /**
   * 开始监控
   */
  private startMonitoring(): void {
    const updateStats = () => {
      if (!this.enabled) {
        return;
      }

      const now = performance.now();
      const deltaTime = now - this.lastUpdateTime;
      this.frameCount++;

      // 每秒更新一次统计
      if (deltaTime >= this.updateInterval) {
        // 计算FPS
        this.stats.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.stats.frameCount = this.frameCount;

        // 获取内存使用情况
        if (performance.memory) {
          this.stats.memoryUsage = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)); // MB
        }

        // 获取Three.js渲染器统计
        if (this.renderer) {
          this.stats.drawCalls = this.renderer.info.render.calls;
          this.stats.triangles = this.renderer.info.render.triangles;
          this.stats.vertices = this.renderer.info.render.vertices;
        }

        // 调用回调函数
        if (this.onStatsUpdate) {
          this.onStatsUpdate(this.stats);
        }

        // 重置计数
        this.lastUpdateTime = now;
        this.frameCount = 0;
      }

      // 继续监控
      this.animationFrameId = requestAnimationFrame(updateStats);
    };

    this.animationFrameId = requestAnimationFrame(updateStats);
  }

  /**
   * 记录渲染时间
   */
  public recordRenderTime(renderTime: number): void {
    this.stats.renderTime = renderTime;
  }

  /**
   * 重置性能统计
   */
  public reset(): void {
    this.stats = {
      fps: 0,
      renderTime: 0,
      frameCount: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0
    };
    
    this.lastUpdateTime = performance.now();
    this.frameCount = 0;
  }

  /**
   * 销毁性能监控器
   */
  public dispose(): void {
    this.disable();
    this.onStatsUpdate = undefined;
    this.renderer = undefined;
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 导出性能监控工具函数
export const enablePerformanceMonitoring = (renderer: THREE.WebGLRenderer, onStatsUpdate?: (stats: PerformanceStats) => void): void => {
  performanceMonitor.setRenderer(renderer);
  performanceMonitor.enable();
  if (onStatsUpdate) {
    performanceMonitor['onStatsUpdate'] = onStatsUpdate;
  }
};

export const disablePerformanceMonitoring = (): void => {
  performanceMonitor.disable();
};

export const togglePerformanceMonitoring = (): void => {
  performanceMonitor.toggle();
};

export const getCurrentPerformanceStats = (): PerformanceStats => {
  return performanceMonitor.getStats();
};