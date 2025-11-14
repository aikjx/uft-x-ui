import * as THREE from 'three';
import { PerformanceOptimizationManager, OptimizationStrategy, PerformanceMode } from './performanceOptimizationManager';
import { performanceDataCollector } from './performanceDataCollector';
import { VISUALIZATION_CONFIG } from '../constants';

// 场景复杂度级别
export type SceneComplexityLevel = 'low' | 'medium' | 'high' | 'very_high';

// 复杂度因素权重
export interface ComplexityWeights {
  particleCount: number;
  fieldResolution: number;
  triangleCount: number;
  drawCalls: number;
  lights: number;
  shadows: number;
  textureSize: number;
  postProcessing: number;
}

// 场景复杂度分析结果
export interface ComplexityAnalysis {
  level: SceneComplexityLevel;
  score: number;
  breakdown: {
    particleScore: number;
    fieldScore: number;
    geometryScore: number;
    renderStateScore: number;
    effectScore: number;
  };
  contributingFactors: string[];
  recommendations: string[];
}

// 动态调整策略
export interface DynamicAdjustmentStrategy {
  complexityThresholds: {
    lowToMedium: number;
    mediumToHigh: number;
    highToVeryHigh: number;
  };
  adaptationSpeed: number; // 0-1，调整速度
  cooldownPeriod: number; // 冷却时间（毫秒）
  minAdjustmentInterval: number; // 最小调整间隔（毫秒）
  enableGradualAdjustment: boolean; // 是否启用渐进式调整
  targetPerformance: {
    targetFPS: number;
    acceptableFrameTime: number;
  };
}

// 场景复杂度分析器类
export class SceneComplexityAnalyzer {
  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private performanceOptimizer: PerformanceOptimizationManager | null = null;
  private isActive: boolean = false;
  private lastAdjustmentTime: number = 0;
  private lastComplexityLevel: SceneComplexityLevel = 'medium';
  private adjustmentHistory: { time: number; from: SceneComplexityLevel; to: SceneComplexityLevel }[] = [];
  
  // 复杂度权重配置
  private weights: ComplexityWeights = {
    particleCount: 0.3,    // 粒子数量权重
    fieldResolution: 0.25, // 场分辨率权重
    triangleCount: 0.2,    // 三角形数量权重
    drawCalls: 0.15,       // 绘制调用权重
    lights: 0.05,          // 光源权重
    shadows: 0.03,         // 阴影权重
    textureSize: 0.01,     // 纹理大小权重
    postProcessing: 0.01   // 后处理权重
  };
  
  // 动态调整策略
  private adjustmentStrategy: DynamicAdjustmentStrategy = {
    complexityThresholds: {
      lowToMedium: 30,
      mediumToHigh: 60,
      highToVeryHigh: 85
    },
    adaptationSpeed: 0.5,
    cooldownPeriod: 5000,   // 5秒冷却期
    minAdjustmentInterval: 2000, // 2秒最小间隔
    enableGradualAdjustment: true,
    targetPerformance: {
      targetFPS: 45,
      acceptableFrameTime: 33 // 约30FPS
    }
  };
  
  // 设置Three.js场景引用
  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  // 设置渲染器引用
  public setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }
  
  // 设置性能优化管理器引用
  public setPerformanceOptimizer(optimizer: PerformanceOptimizationManager): void {
    this.performanceOptimizer = optimizer;
  }
  
  // 开始分析和动态调整
  public startAnalysis(): void {
    if (this.isActive) {
      console.warn('场景复杂度分析已在运行中');
      return;
    }
    
    this.isActive = true;
    this.lastAdjustmentTime = performance.now();
    
    // 启动分析循环
    this.analyzeAndAdjust();
    
    console.log('场景复杂度分析和动态调整已启动');
  }
  
  // 停止分析和动态调整
  public stopAnalysis(): void {
    this.isActive = false;
    console.log('场景复杂度分析和动态调整已停止');
  }
  
  // 分析循环
  private analyzeAndAdjust(): void {
    if (!this.isActive) return;
    
    // 执行分析
    const analysis = this.analyzeScene();
    
    // 执行调整
    this.adjustBasedOnAnalysis(analysis);
    
    // 调度下一次分析
    requestAnimationFrame(() => {
      setTimeout(() => this.analyzeAndAdjust(), 1000); // 每秒分析一次
    });
  }
  
  // 分析场景复杂度
  public analyzeScene(): ComplexityAnalysis {
    if (!this.scene || !this.performanceOptimizer) {
      return this.createDefaultAnalysis();
    }
    
    // 获取当前策略
    const strategy = this.performanceOptimizer.getCurrentStrategy();
    
    // 计算各部分分数
    const particleScore = this.calculateParticleScore(strategy.particleCount || 200);
    const fieldScore = this.calculateFieldScore(strategy.fieldResolution || 20);
    const geometryScore = this.calculateGeometryScore();
    const renderStateScore = this.calculateRenderStateScore();
    const effectScore = this.calculateEffectScore();
    
    // 计算加权总分
    const totalScore = 
      particleScore * this.weights.particleCount +
      fieldScore * this.weights.fieldResolution +
      geometryScore * this.weights.triangleCount +
      renderStateScore * this.weights.drawCalls +
      effectScore * (this.weights.lights + this.weights.shadows + this.weights.postProcessing);
    
    // 确定复杂度级别
    const level = this.determineComplexityLevel(totalScore);
    
    // 确定主要贡献因素
    const contributingFactors = this.identifyContributingFactors({
      particleScore,
      fieldScore,
      geometryScore,
      renderStateScore,
      effectScore
    });
    
    // 生成建议
    const recommendations = this.generateRecommendations(level, contributingFactors);
    
    return {
      level,
      score: Math.round(totalScore * 100) / 100,
      breakdown: {
        particleScore: Math.round(particleScore * 100) / 100,
        fieldScore: Math.round(fieldScore * 100) / 100,
        geometryScore: Math.round(geometryScore * 100) / 100,
        renderStateScore: Math.round(renderStateScore * 100) / 100,
        effectScore: Math.round(effectScore * 100) / 100
      },
      contributingFactors,
      recommendations
    };
  }
  
  // 计算粒子复杂度分数
  private calculateParticleScore(particleCount: number): number {
    // 假设1000个粒子为满分100
    const normalizedScore = Math.min(100, (particleCount / 1000) * 100);
    return normalizedScore;
  }
  
  // 计算场复杂度分数
  private calculateFieldScore(fieldResolution: number): number {
    // 假设50x50的场为满分100
    const normalizedScore = Math.min(100, (fieldResolution / 50) * 100);
    return normalizedScore;
  }
  
  // 计算几何体复杂度分数
  private calculateGeometryScore(): number {
    if (!this.scene) return 0;
    
    let totalTriangles = 0;
    let meshCount = 0;
    
    // 遍历场景计算三角形数量
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshCount++;
        const geometry = object.geometry;
        if (geometry.isBufferGeometry) {
          // 对于BufferGeometry，估算三角形数量
          const positionAttribute = geometry.attributes.position;
          if (positionAttribute) {
            const vertexCount = positionAttribute.count;
            totalTriangles += vertexCount / 3; // 假设每个三角形3个顶点
          }
        } else if (geometry.isGeometry) {
          // 对于旧版Geometry
          totalTriangles += geometry.faces?.length || 0;
        }
      } else if (object instanceof THREE.Points) {
        const geometry = object.geometry;
        if (geometry.isBufferGeometry) {
          const positionAttribute = geometry.attributes.position;
          if (positionAttribute) {
            meshCount++;
            // 点也计入复杂度，但权重较低
            totalTriangles += positionAttribute.count * 0.1;
          }
        }
      }
    });
    
    // 假设100,000个三角形为满分100
    const normalizedScore = Math.min(100, (totalTriangles / 100000) * 100);
    return normalizedScore;
  }
  
  // 计算渲染状态复杂度分数
  private calculateRenderStateScore(): number {
    if (!this.renderer) return 0;
    
    let drawCalls = 0;
    let materialCount = new Set<string>();
    
    // 遍历场景统计材质数量（作为绘制调用的近似）
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => materialCount.add(mat.uuid));
          } else if (object.material) {
            materialCount.add(object.material.uuid);
          }
          drawCalls++;
        }
      });
    }
    
    // 假设500个绘制调用为满分100
    const drawCallScore = Math.min(100, (drawCalls / 500) * 100);
    
    // 材质数量也是影响因素
    const materialScore = Math.min(100, (materialCount.size / 200) * 100);
    
    // 综合分数
    return (drawCallScore * 0.7) + (materialScore * 0.3);
  }
  
  // 计算效果复杂度分数
  private calculateEffectScore(): number {
    if (!this.scene) return 0;
    
    let lightScore = 0;
    let shadowScore = 0;
    
    // 统计光源数量和阴影质量
    let lightCount = 0;
    let shadowCasters = 0;
    
    this.scene.traverse((object) => {
      // 统计光源
      if (object instanceof THREE.Light) {
        lightCount++;
        
        // 点光源和聚光灯更消耗性能
        if (object instanceof THREE.PointLight || object instanceof THREE.SpotLight) {
          lightScore += 30;
        } else if (object instanceof THREE.DirectionalLight) {
          lightScore += 20;
        } else {
          lightScore += 10;
        }
        
        // 检查是否启用阴影
        if (object.castShadow) {
          shadowCasters++;
        }
      }
      
      // 统计投射阴影的物体
      if ('castShadow' in object && object.castShadow) {
        shadowCasters++;
      }
    });
    
    // 阴影复杂度
    if (shadowCasters > 0) {
      // 每个阴影投射器增加复杂度
      shadowScore = Math.min(100, shadowCasters * 10);
    }
    
    // 综合效果分数
    const totalEffectScore = Math.min(100, (lightScore + shadowScore) / 2);
    return totalEffectScore;
  }
  
  // 确定复杂度级别
  private determineComplexityLevel(score: number): SceneComplexityLevel {
    const thresholds = this.adjustmentStrategy.complexityThresholds;
    
    if (score >= thresholds.highToVeryHigh) {
      return 'very_high';
    } else if (score >= thresholds.mediumToHigh) {
      return 'high';
    } else if (score >= thresholds.lowToMedium) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  // 识别主要贡献因素
  private identifyContributingFactors(breakdown: ComplexityAnalysis['breakdown']): string[] {
    const factors: string[] = [];
    const threshold = 50; // 超过50分的因素被认为是主要贡献者
    
    if (breakdown.particleScore > threshold) {
      factors.push('粒子数量过多');
    }
    
    if (breakdown.fieldScore > threshold) {
      factors.push('场分辨率过高');
    }
    
    if (breakdown.geometryScore > threshold) {
      factors.push('几何体过于复杂');
    }
    
    if (breakdown.renderStateScore > threshold) {
      factors.push('绘制调用过多');
    }
    
    if (breakdown.effectScore > threshold) {
      factors.push('特效过于复杂');
    }
    
    return factors;
  }
  
  // 生成优化建议
  private generateRecommendations(level: SceneComplexityLevel, factors: string[]): string[] {
    const recommendations: string[] = [];
    
    switch (level) {
      case 'very_high':
        recommendations.push('场景极为复杂，强烈建议降低性能设置');
        recommendations.push('考虑关闭阴影和高级特效');
        break;
      case 'high':
        recommendations.push('场景复杂度高，建议降低性能设置');
        recommendations.push('考虑减少粒子数量或降低场分辨率');
        break;
      case 'medium':
        recommendations.push('场景复杂度中等，当前设置较为合理');
        break;
      case 'low':
        recommendations.push('场景复杂度低，可以考虑提高视觉质量');
        break;
    }
    
    // 基于具体因素的建议
    if (factors.includes('粒子数量过多')) {
      recommendations.push('建议减少50%的粒子数量');
    }
    
    if (factors.includes('场分辨率过高')) {
      recommendations.push('建议降低场分辨率至少20%');
    }
    
    if (factors.includes('绘制调用过多')) {
      recommendations.push('建议合并材质或使用实例化渲染');
    }
    
    if (factors.includes('特效过于复杂')) {
      recommendations.push('建议减少光源数量或禁用阴影');
    }
    
    return recommendations;
  }
  
  // 基于分析结果进行调整
  private adjustBasedOnAnalysis(analysis: ComplexityAnalysis): void {
    if (!this.performanceOptimizer) return;
    
    const currentTime = performance.now();
    
    // 检查是否在冷却期或最小间隔内
    if (currentTime - this.lastAdjustmentTime < this.adjustmentStrategy.minAdjustmentInterval) {
      return;
    }
    
    // 获取当前性能状态
    const performanceStatus = performanceDataCollector.getRealtimeStatus();
    
    // 决定是否需要调整
    const needsAdjustment = this.shouldAdjust(analysis, performanceStatus);
    
    if (needsAdjustment) {
      // 根据复杂度和性能状态确定新的性能模式
      const newMode = this.determineOptimalPerformanceMode(analysis, performanceStatus);
      
      if (newMode !== this.performanceOptimizer.getCurrentMode()) {
        // 记录调整历史
        this.adjustmentHistory.push({
          time: currentTime,
          from: this.performanceOptimizer.getCurrentMode(),
          to: newMode
        });
        
        // 限制历史记录数量
        if (this.adjustmentHistory.length > 20) {
          this.adjustmentHistory.shift();
        }
        
        // 应用新的性能模式
        if (this.adjustmentStrategy.enableGradualAdjustment) {
          this.applyGradualAdjustment(newMode);
        } else {
          this.performanceOptimizer.setPerformanceMode(newMode);
        }
        
        this.lastAdjustmentTime = currentTime;
        this.lastComplexityLevel = analysis.level;
        
        console.log(`场景复杂度调整: ${this.performanceOptimizer.getCurrentMode()} -> ${newMode}, 原因: ${analysis.contributingFactors.join(', ')}`);
      }
    }
  }
  
  // 判断是否需要调整
  private shouldAdjust(analysis: ComplexityAnalysis, performanceStatus: any): boolean {
    const targetFPS = this.adjustmentStrategy.targetPerformance.targetFPS;
    
    // 性能低于目标时总是调整
    if (performanceStatus.currentFPS < targetFPS * 0.8) {
      return true;
    }
    
    // 复杂度变化时调整
    if (this.lastComplexityLevel !== analysis.level) {
      // 如果从低复杂度变为高复杂度，立即调整
      if ((this.lastComplexityLevel === 'low' && analysis.level === 'medium') ||
          (this.lastComplexityLevel === 'medium' && analysis.level === 'high') ||
          (this.lastComplexityLevel === 'high' && analysis.level === 'very_high')) {
        return true;
      }
      
      // 如果从高复杂度变为低复杂度，在性能允许的情况下调整
      if (performanceStatus.currentFPS > targetFPS * 1.2) {
        return true;
      }
    }
    
    return false;
  }
  
  // 确定最佳性能模式
  private determineOptimalPerformanceMode(analysis: ComplexityAnalysis, performanceStatus: any): PerformanceMode {
    const currentMode = this.performanceOptimizer?.getCurrentMode() || 'medium';
    
    // 如果性能很差，直接降到最低
    if (performanceStatus.currentFPS < 20) {
      return 'low';
    }
    
    // 根据复杂度和性能状态确定模式
    switch (analysis.level) {
      case 'very_high':
        return 'low';
      case 'high':
        return performanceStatus.currentFPS > 40 ? 'medium' : 'low';
      case 'medium':
        // 性能很好时可以尝试高性能
        if (performanceStatus.currentFPS > 55) {
          return 'high';
        }
        return 'medium';
      case 'low':
        // 性能优秀时可以使用高性能
        if (performanceStatus.currentFPS > 50) {
          return 'high';
        } else if (performanceStatus.currentFPS > 30) {
          return 'medium';
        }
        return 'low';
      default:
        return currentMode;
    }
  }
  
  // 应用渐进式调整
  private applyGradualAdjustment(targetMode: PerformanceMode): void {
    if (!this.performanceOptimizer) return;
    
    const currentMode = this.performanceOptimizer.getCurrentMode();
    const adaptationSpeed = this.adjustmentStrategy.adaptationSpeed;
    
    // 计算需要调整的步骤
    const currentStrategy = this.performanceOptimizer.getCurrentStrategy();
    let targetStrategy: OptimizationStrategy;
    
    // 获取目标性能模式的策略
    switch (targetMode) {
      case 'high':
        targetStrategy = VISUALIZATION_CONFIG.performanceModes.high;
        break;
      case 'medium':
        targetStrategy = VISUALIZATION_CONFIG.performanceModes.medium;
        break;
      case 'low':
        targetStrategy = VISUALIZATION_CONFIG.performanceModes.low;
        break;
      default:
        targetStrategy = VISUALIZATION_CONFIG.performanceModes.medium;
    }
    
    // 渐进式调整关键参数
    const newStrategy: OptimizationStrategy = {
      ...currentStrategy,
      particleCount: this.lerp(currentStrategy.particleCount || 0, targetStrategy.particleCount || 0, adaptationSpeed),
      fieldResolution: this.lerp(currentStrategy.fieldResolution || 0, targetStrategy.fieldResolution || 0, adaptationSpeed),
      renderScale: this.lerp(currentStrategy.renderScale || 1, targetStrategy.renderScale || 1, adaptationSpeed)
    };
    
    // 对于布尔值和质量设置，当接近目标时直接切换
    if (Math.abs(newStrategy.particleCount - (targetStrategy.particleCount || 0)) < 5) {
      newStrategy.particleCount = targetStrategy.particleCount;
    }
    
    if (Math.abs(newStrategy.fieldResolution - (targetStrategy.fieldResolution || 0)) < 2) {
      newStrategy.fieldResolution = targetStrategy.fieldResolution;
    }
    
    if (Math.abs(newStrategy.renderScale - (targetStrategy.renderScale || 1)) < 0.05) {
      newStrategy.renderScale = targetStrategy.renderScale;
      // 当关键参数接近目标时，应用所有目标设置
      this.performanceOptimizer.setPerformanceMode(targetMode);
    } else {
      // 否则只应用渐进式调整的参数
      this.performanceOptimizer.applyStrategy(newStrategy);
      
      // 继续渐进式调整
      setTimeout(() => {
        this.applyGradualAdjustment(targetMode);
      }, 100);
    }
  }
  
  // 线性插值
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.min(1, Math.max(0, t));
  }
  
  // 创建默认分析结果
  private createDefaultAnalysis(): ComplexityAnalysis {
    return {
      level: 'medium',
      score: 50,
      breakdown: {
        particleScore: 50,
        fieldScore: 50,
        geometryScore: 50,
        renderStateScore: 50,
        effectScore: 50
      },
      contributingFactors: ['未知'],
      recommendations: ['无法分析场景，请确保正确设置场景引用']
    };
  }
  
  // 设置复杂度权重
  public setWeights(weights: Partial<ComplexityWeights>): void {
    this.weights = {
      ...this.weights,
      ...weights
    };
    console.log('场景复杂度权重已更新:', this.weights);
  }
  
  // 设置动态调整策略
  public setAdjustmentStrategy(strategy: Partial<DynamicAdjustmentStrategy>): void {
    this.adjustmentStrategy = {
      ...this.adjustmentStrategy,
      ...strategy
    };
    console.log('动态调整策略已更新:', this.adjustmentStrategy);
  }
  
  // 获取当前分析状态
  public getAnalysisStatus(): {
    isActive: boolean;
    lastComplexityLevel: SceneComplexityLevel;
    lastAdjustmentTime: number;
    adjustmentCount: number;
  } {
    return {
      isActive: this.isActive,
      lastComplexityLevel: this.lastComplexityLevel,
      lastAdjustmentTime: this.lastAdjustmentTime,
      adjustmentCount: this.adjustmentHistory.length
    };
  }
  
  // 获取调整历史
  public getAdjustmentHistory(): typeof this.adjustmentHistory {
    return [...this.adjustmentHistory];
  }
  
  // 重置分析器
  public reset(): void {
    this.lastAdjustmentTime = 0;
    this.lastComplexityLevel = 'medium';
    this.adjustmentHistory = [];
    console.log('场景复杂度分析器已重置');
  }
  
  // 手动触发分析和调整
  public triggerAnalysis(): ComplexityAnalysis {
    const analysis = this.analyzeScene();
    this.adjustBasedOnAnalysis(analysis);
    return analysis;
  }
}

// 导出单例实例
export const sceneComplexityAnalyzer = new SceneComplexityAnalyzer();
