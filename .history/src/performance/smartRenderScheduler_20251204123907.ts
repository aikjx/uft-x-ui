/**
 * 智能渲染调度器 - 实现自适应渲染设置和智能帧管理
 */

import * as THREE from 'three';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

// 渲染质量级别
export enum RenderQualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
  AUTO = 'auto'
}

// 渲染优先级
export enum RenderPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

// 渲染调度配置
export interface SmartRenderSchedulerConfig {
  targetFPS: number; // 目标帧率
  maxFrameTime: number; // 最大帧时间（毫秒）
  qualityLevel: RenderQualityLevel; // 渲染质量级别
  enableAdaptiveResolution: boolean; // 是否启用自适应分辨率
  enableSmartFrameSkipping: boolean; // 是否启用智能帧跳过
  enablePerformanceMonitoring: boolean; // 是否启用性能监控
  resolutionScaleRange: [number, number]; // 分辨率缩放范围 [min, max]
  qualityAdjustmentThreshold: number; // 质量调整阈值（FPS变化百分比）
  interactionBoostDuration: number; // 交互后性能提升持续时间（毫秒）
}

// 帧信息
export interface FrameInfo {
  frameIndex: number;
  timestamp: number;
  deltaTime: number;
  frameTime: number;
  fps: number;
  isVisible: boolean;
  hasInteraction: boolean;
  sceneComplexity: number;
  priority: RenderPriority;
}

// 渲染统计信息
export interface RenderStats {
  averageFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  droppedFrames: number;
  totalFrames: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  materials: number;
  geometries: number;
}

/**
 * 智能渲染调度器类
 */
export class SmartRenderScheduler {
  private static instance: SmartRenderScheduler;
  private config: SmartRenderSchedulerConfig;
  private frameHistory: FrameInfo[] = [];
  private performanceHistory: number[] = [];
  private lastInteractionTime: number = 0;
  private currentQualityLevel: RenderQualityLevel;
  private currentResolutionScale: number = 1.0;
  private droppedFrames: number = 0;
  private totalFrames: number = 0;
  private isPaused: boolean = false;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.Camera | null = null;

  private constructor(config: SmartRenderSchedulerConfig = {}) {
    this.config = {
      targetFPS: 60,
      maxFrameTime: 1000 / 30, // 33.33ms
      qualityLevel: RenderQualityLevel.AUTO,
      enableAdaptiveResolution: true,
      enableSmartFrameSkipping: true,
      enablePerformanceMonitoring: true,
      resolutionScaleRange: [0.5, 1.0],
      qualityAdjustmentThreshold: 0.15, // 15%
      interactionBoostDuration: 2000, // 2秒
      ...config
    };

    this.currentQualityLevel = this.config.qualityLevel;
    this.setupEventListeners();
  }

  /**
   * 获取智能渲染调度器实例
   */
  public static getInstance(config?: SmartRenderSchedulerConfig): SmartRenderScheduler {
    if (!SmartRenderScheduler.instance) {
      SmartRenderScheduler.instance = new SmartRenderScheduler(config);
    }
    return SmartRenderScheduler.instance;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听用户交互事件
    eventSystem.on(APP_EVENTS.USER_INTERACTION, () => {
      this.lastInteractionTime = Date.now();
    });

    // 监听帧率变化事件
    eventSystem.on(APP_EVENTS.FRAME_RATE_CHANGE, (data: { fps: number }) => {
      this.performanceHistory.push(data.fps);
      if (this.performanceHistory.length > 60) {
        this.performanceHistory.shift();
      }
    });
  }

  /**
   * 设置渲染器和相机
   */
  public setRendererAndCamera(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    this.renderer = renderer;
    this.camera = camera;
    
    // 初始化分辨率
    this.updateResolutionScale(this.currentResolutionScale);
  }

  /**
   * 更新渲染调度配置
   */
  public updateConfig(config: Partial<SmartRenderSchedulerConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.qualityLevel !== undefined) {
      this.currentQualityLevel = config.qualityLevel;
    }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): SmartRenderSchedulerConfig {
    return { ...this.config };
  }

  /**
   * 设置渲染质量级别
   */
  public setQualityLevel(qualityLevel: RenderQualityLevel): void {
    this.currentQualityLevel = qualityLevel;
    this.applyQualitySettings();
  }

  /**
   * 获取当前渲染质量级别
   */
  public getQualityLevel(): RenderQualityLevel {
    return this.currentQualityLevel;
  }

  /**
   * 计算当前渲染优先级
   */
  public calculateRenderPriority(frameInfo: FrameInfo): RenderPriority {
    // 如果有交互，提升优先级
    if (frameInfo.hasInteraction) {
      return RenderPriority.CRITICAL;
    }

    // 如果最近有交互，保持高优先级
    if (Date.now() - this.lastInteractionTime < this.config.interactionBoostDuration) {
      return RenderPriority.HIGH;
    }

    // 根据可见性调整优先级
    if (!frameInfo.isVisible) {
      return RenderPriority.LOW;
    }

    // 根据场景复杂度调整优先级
    if (frameInfo.sceneComplexity > 1000) {
      return RenderPriority.MEDIUM;
    }

    return RenderPriority.MEDIUM;
  }

  /**
   * 决定是否跳过当前帧
   */
  public shouldSkipFrame(frameInfo: FrameInfo): boolean {
    if (!this.config.enableSmartFrameSkipping) {
      return false;
    }

    // 关键帧不跳过
    if (frameInfo.priority === RenderPriority.CRITICAL) {
      return false;
    }

    // 可见时不跳过
    if (frameInfo.isVisible) {
      return false;
    }

    // 最近有交互不跳过
    if (Date.now() - this.lastInteractionTime < this.config.interactionBoostDuration) {
      return false;
    }

    // 根据场景复杂度和帧率决定是否跳过
    const averageFPS = this.calculateAverageFPS();
    if (averageFPS < this.config.targetFPS * 0.5) {
      // 帧率太低，跳过一些非关键帧
      return frameInfo.priority === RenderPriority.LOW || 
             (frameInfo.priority === RenderPriority.MEDIUM && frameInfo.frameIndex % 2 === 0);
    }

    return false;
  }

  /**
   * 计算平均帧率
   */
  private calculateAverageFPS(): number {
    if (this.performanceHistory.length === 0) {
      return this.config.targetFPS;
    }
    
    const recentHistory = this.performanceHistory.slice(-30); // 最近30帧
    return recentHistory.reduce((sum, fps) => sum + fps, 0) / recentHistory.length;
  }

  /**
   * 更新渲染统计信息
   */
  public updateRenderStats(renderer: THREE.WebGLRenderer): RenderStats {
    const frameHistory = this.frameHistory.slice(-60); // 最近60帧
    const totalFrameTime = frameHistory.reduce((sum, frame) => sum + frame.frameTime, 0);
    const averageFrameTime = totalFrameTime / frameHistory.length || 0;
    const minFrameTime = Math.min(...frameHistory.map(frame => frame.frameTime)) || 0;
    const maxFrameTime = Math.max(...frameHistory.map(frame => frame.frameTime)) || 0;
    
    const fpsValues = frameHistory.map(frame => frame.fps);
    const averageFPS = fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length || 0;
    const minFPS = Math.min(...fpsValues) || 0;
    const maxFPS = Math.max(...fpsValues) || 0;

    return {
      averageFrameTime,
      minFrameTime,
      maxFrameTime,
      averageFPS,
      minFPS,
      maxFPS,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      vertices: renderer.info.render.vertices,
      textures: renderer.info.memory.textures,
      materials: renderer.info.memory.materials,
      geometries: renderer.info.memory.geometries
    };
  }

  /**
   * 应用质量设置
   */
  private applyQualitySettings(): void {
    if (!this.renderer) return;

    // 根据质量级别调整渲染设置
    switch (this.currentQualityLevel) {
      case RenderQualityLevel.LOW:
        this.applyLowQualitySettings();
        break;
      case RenderQualityLevel.MEDIUM:
        this.applyMediumQualitySettings();
        break;
      case RenderQualityLevel.HIGH:
        this.applyHighQualitySettings();
        break;
      case RenderQualityLevel.ULTRA:
        this.applyUltraQualitySettings();
        break;
      case RenderQualityLevel.AUTO:
        this.adjustQualityAutomatically();
        break;
    }
  }

  /**
   * 应用低质量设置
   */
  private applyLowQualitySettings(): void {
    if (!this.renderer) return;
    
    this.updateResolutionScale(0.5);
    this.renderer.shadowMap.enabled = false;
    this.renderer.antialias = false;
    this.renderer.setPixelRatio(1);
  }

  /**
   * 应用中等质量设置
   */
  private applyMediumQualitySettings(): void {
    if (!this.renderer) return;
    
    this.updateResolutionScale(0.75);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.antialias = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  /**
   * 应用高质量设置
   */
  private applyHighQualitySettings(): void {
    if (!this.renderer) return;
    
    this.updateResolutionScale(1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.antialias = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * 应用超高质量设置
   */
  private applyUltraQualitySettings(): void {
    if (!this.renderer) return;
    
    this.updateResolutionScale(1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.antialias = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  /**
   * 自动调整渲染质量
   */
  private adjustQualityAutomatically(): void {
    const averageFPS = this.calculateAverageFPS();
    const fpsRatio = averageFPS / this.config.targetFPS;
    
    // 根据FPS比例调整质量
    if (fpsRatio < 0.6) {
      // FPS低于60%，降低质量
      this.applyLowQualitySettings();
    } else if (fpsRatio < 0.8) {
      // FPS低于80%，使用中等质量
      this.applyMediumQualitySettings();
    } else if (fpsRatio < 1.0) {
      // FPS接近目标，使用高质量
      this.applyHighQualitySettings();
    } else {
      // FPS高于目标，使用超高质量
      this.applyUltraQualitySettings();
    }
  }

  /**
   * 更新分辨率缩放
   */
  private updateResolutionScale(scale: number): void {
    if (!this.renderer || !this.camera) return;
    
    // 限制缩放范围
    this.currentResolutionScale = Math.max(
      this.config.resolutionScaleRange[0],
      Math.min(this.config.resolutionScaleRange[1], scale)
    );
    
    // 更新渲染器分辨率
    const width = window.innerWidth * this.currentResolutionScale;
    const height = window.innerHeight * this.currentResolutionScale;
    
    this.renderer.setSize(width, height);
    
    // 更新相机宽高比
    if (this.camera instanceof THREE.PerspectiveCamera || this.camera instanceof THREE.OrthographicCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    
    // 发布分辨率变化事件
    eventSystem.emit(APP_EVENTS.PERFORMANCE_DROP, {
      type: 'resolution_change',
      resolutionScale: this.currentResolutionScale,
      width,
      height
    });
  }

  /**
   * 自适应调整分辨率
   */
  public adjustResolutionAutomatically(): void {
    if (!this.config.enableAdaptiveResolution || !this.renderer) {
      return;
    }
    
    const averageFPS = this.calculateAverageFPS();
    const targetFPS = this.config.targetFPS;
    
    // 根据帧率调整分辨率
    if (averageFPS < targetFPS * 0.6) {
      // 帧率太低，降低分辨率
      this.updateResolutionScale(this.currentResolutionScale * 0.9);
    } else if (averageFPS > targetFPS * 0.95) {
      // 帧率很好，提高分辨率
      this.updateResolutionScale(Math.min(this.config.resolutionScaleRange[1], this.currentResolutionScale * 1.1));
    }
  }

  /**
   * 处理渲染前的准备工作
   */
  public preRender(frameInfo: FrameInfo): void {
    this.totalFrames++;
    
    // 添加到帧历史
    this.frameHistory.push(frameInfo);
    if (this.frameHistory.length > 120) {
      this.frameHistory.shift(); // 保持最多120帧历史
    }
    
    // 自动调整质量
    if (this.currentQualityLevel === RenderQualityLevel.AUTO && this.totalFrames % 30 === 0) {
      this.adjustQualityAutomatically();
      this.adjustResolutionAutomatically();
    }
    
    // 调整分辨率
    if (this.config.enableAdaptiveResolution && this.totalFrames % 60 === 0) {
      this.adjustResolutionAutomatically();
    }
  }

  /**
   * 处理渲染后的清理工作
   */
  public postRender(frameInfo: FrameInfo, renderer: THREE.WebGLRenderer): void {
    // 更新性能历史
    this.performanceHistory.push(frameInfo.fps);
    if (this.performanceHistory.length > 120) {
      this.performanceHistory.shift();
    }
    
    // 检查是否丢帧
    if (frameInfo.frameTime > this.config.maxFrameTime) {
      this.droppedFrames++;
    }
    
    // 发布渲染完成事件
    eventSystem.emit(APP_EVENTS.RENDER_END, {
      frameIndex: frameInfo.frameIndex,
      frameTime: frameInfo.frameTime,
      fps: frameInfo.fps,
      qualityLevel: this.currentQualityLevel,
      resolutionScale: this.currentResolutionScale
    });
  }

  /**
   * 通知用户交互
   */
  public notifyInteraction(): void {
    this.lastInteractionTime = Date.now();
    
    // 发布交互事件
    eventSystem.emit(APP_EVENTS.USER_INTERACTION, {
      timestamp: this.lastInteractionTime
    });
  }

  /**
   * 设置暂停状态
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * 获取暂停状态
   */
  public isRenderingPaused(): boolean {
    return this.isPaused;
  }

  /**
   * 获取当前分辨率缩放
   */
  public getCurrentResolutionScale(): number {
    return this.currentResolutionScale;
  }

  /**
   * 重置渲染调度器
   */
  public reset(): void {
    this.frameHistory = [];
    this.performanceHistory = [];
    this.lastInteractionTime = 0;
    this.droppedFrames = 0;
    this.totalFrames = 0;
    this.currentResolutionScale = 1.0;
  }

  /**
   * 销毁渲染调度器
   */
  public dispose(): void {
    this.reset();
    SmartRenderScheduler.instance = null!;
  }
}

// 导出渲染调度器实例
export const smartRenderScheduler = SmartRenderScheduler.getInstance({
  targetFPS: 60,
  maxFrameTime: 16.67, // 60fps
  qualityLevel: RenderQualityLevel.AUTO,
  enableAdaptiveResolution: true,
  enableSmartFrameSkipping: true,
  enablePerformanceMonitoring: true,
  resolutionScaleRange: [0.5, 1.0],
  qualityAdjustmentThreshold: 0.15,
  interactionBoostDuration: 2000
});
