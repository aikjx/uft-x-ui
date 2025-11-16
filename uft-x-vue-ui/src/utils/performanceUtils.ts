// 性能监控和优化工具

export class PerformanceMonitor {
  private memoryHistory: number[] = [];
  private drawCallHistory: number[] = [];
  private maxHistoryLength = 60;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;

  estimateMemoryUsage(geometriesCount: number, texturesCount: number, shadersCount: number): number {
    // 简化的内存估算
    const baseMemory = geometriesCount * 0.1 + texturesCount * 2 + shadersCount * 0.05;
    return Math.max(baseMemory, 10);
  }

  updateDrawCallCount(calls: number) {
    this.drawCallHistory.push(calls);
    if (this.drawCallHistory.length > this.maxHistoryLength) {
      this.drawCallHistory.shift();
    }
  }

  getDrawCallCount(): number {
    const calls = this.drawCallHistory;
    return calls.length > 0 ? calls[calls.length - 1] : 0;
  }

  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const avgDrawCalls = this.getAverageDrawCalls();
    
    if (avgDrawCalls > 100) {
      suggestions.push('考虑降低粒子密度以减少绘制调用');
    }
    
    const memoryUsage = this.getCurrentMemoryUsage();
    if (memoryUsage > 100) {
      suggestions.push('内存使用较高，建议降低渲染质量');
    }
    
    return suggestions;
  }

  updateFPS(): number {
    const now = performance.now();
    const fps = 1000 / (now - (this.getLastFrameTime() || now));
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }
    
    this.setLastFrameTime(now);
    return fps;
  }

  private getLastFrameTime(): number {
    return this.lastFrameTime;
  }

  private setLastFrameTime(time: number) {
    this.lastFrameTime = time;
  }

  getPerformanceMode(): 'high' | 'medium' | 'low' {
    const avgFPS = this.getAverageFPS();
    if (avgFPS > 50) return 'high';
    if (avgFPS > 30) return 'medium';
    return 'low';
  }

  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  private getAverageDrawCalls(): number {
    if (this.drawCallHistory.length === 0) return 0;
    const sum = this.drawCallHistory.reduce((a, b) => a + b, 0);
    return sum / this.drawCallHistory.length;
  }

  private getCurrentMemoryUsage(): number {
    return this.memoryHistory.length > 0 ? this.memoryHistory[this.memoryHistory.length - 1] : 0;
  }
}

export class ParticleOptimizer {
  private maxParticles = 1000;

  getLODLevel(cameraDistance: number): number {
    if (cameraDistance > 20) return 3;
    if (cameraDistance > 10) return 2;
    if (cameraDistance > 5) return 1;
    return 1;
  }

  getOptimalParticleCount(baseCount: number, performanceMode: string, cameraDistance: number): number {
    let multiplier = 1;
    
    switch (performanceMode) {
      case 'high':
        multiplier = 1.0;
        break;
      case 'medium':
        multiplier = 0.7;
        break;
      case 'low':
        multiplier = 0.4;
        break;
    }
    
    // 根据相机距离调整
    if (cameraDistance > 15) {
      multiplier *= 0.8;
    }
    
    return Math.min(Math.floor(baseCount * multiplier), this.maxParticles);
  }

  setMaxParticles(max: number) {
    this.maxParticles = max;
  }
}

export class RenderOptimizer {
  private frameSkipThreshold = 16;

  // 设置阴影质量
  setShadowQuality(quality: 'high' | 'medium' | 'low') {
    // 简化实现，目前没有实际功能
    // 在实际应用中，这里会根据质量等级调整渲染器设置
    console.log(`设置阴影质量: ${quality}`);
  }

  // 设置跳帧阈值
  setFrameSkipThreshold(threshold: number) {
    this.frameSkipThreshold = Math.max(1, Math.floor(threshold));
  }

  calculateRenderScale(currentFps: number, currentScale: number, isLowPerformance: boolean): number {
    let targetScale = currentScale;
    
    if (currentFps < 30 && isLowPerformance) {
      targetScale = Math.max(0.5, currentScale * 0.8);
    } else if (currentFps > 50) {
      targetScale = Math.min(1.0, currentScale * 1.1);
    }
    
    return targetScale;
  }

  shouldSkipFrame(frameIndex: number, fps: number): boolean {
    if (fps < 30) {
      // 使用 frameSkipThreshold 来决定是否跳过帧
      return frameIndex % this.frameSkipThreshold === 0;
    }
    return false;
  }

  isObjectVisible(position: any, radius: number, _camera: any): boolean {
    // 简化的可见性检查
    const distance = position.length();
    return distance < 20 && radius > 0.1;
  }

  sortObjectsByPriority(objects: any[], _camera: any, _isLowPerformance: boolean): any[] {
    // 简化的优先级排序
    return objects.sort((a, b) => {
      const distanceA = a.position.length();
      const distanceB = b.position.length();
      return distanceA - distanceB;
    });
  }


}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();
export const particleOptimizer = new ParticleOptimizer();
export const renderOptimizer = new RenderOptimizer();