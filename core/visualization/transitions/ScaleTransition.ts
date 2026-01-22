// 统一场论可视化系统 - 尺度转换类
// 版本: v2.0
// 功能: 实现不同尺度之间的平滑过渡

import { Vector3, Vector4, Matrix4, Quaternion } from 'three';

export class ScaleTransition {
  private currentScale: any;
  private targetScale: any;
  private camera: any;
  private scene: any;
  private startTime: number = 0;
  private duration: number = 2000; // 2秒
  private progress: number = 0;
  private currentCameraPosition: Vector3 = new Vector3();
  private targetCameraPosition: Vector3 = new Vector3();
  private currentCameraRotation: Quaternion = new Quaternion();
  private targetCameraRotation: Quaternion = new Quaternion();
  private useEasing: boolean = true;
  private completed: boolean = false;

  constructor(currentScale: any, targetScale: any, camera: any, scene: any) {
    this.currentScale = currentScale;
    this.targetScale = targetScale;
    this.camera = camera;
    this.scene = scene;
    this.startTime = Date.now();
    this.initTransition();
  }

  private initTransition(): void {
    console.log('🔄 初始化尺度转换');
    
    // 记录当前相机状态
    if (this.camera) {
      this.currentCameraPosition.copy(this.camera.position);
      this.currentCameraRotation.copy(this.camera.quaternion);
    }

    // 计算目标相机状态
    this.calculateTargetState();
  }

  private calculateTargetState(): void {
    // 根据目标尺度计算相机位置
    const scaleName = this.targetScale.constructor.name.toLowerCase();
    
    switch (scaleName) {
      case 'quantumscale':
        this.targetCameraPosition.set(0, 0, 1e-15);
        break;
      case 'atomicscale':
        this.targetCameraPosition.set(0, 0, 1e-9);
        break;
      case 'molecularscale':
        this.targetCameraPosition.set(0, 0, 1e-6);
        break;
      case 'macroscopicscale':
        this.targetCameraPosition.set(0, 0, 10);
        break;
      case 'astronomicalscale':
        this.targetCameraPosition.set(0, 0, 1e8);
        break;
      case 'cosmicscale':
        this.targetCameraPosition.set(0, 0, 1e18);
        break;
      default:
        this.targetCameraPosition.set(0, 0, 10);
    }

    // 重置旋转
    this.targetCameraRotation.set(0, 0, 0, 1);
  }

  public update(deltaTime: number): void {
    if (this.completed) return;

    this.progress = Math.min((Date.now() - this.startTime) / this.duration, 1);

    // 使用缓动函数
    const easedProgress = this.useEasing ? this.easeInOutCubic(this.progress) : this.progress;

    // 相机位置过渡
    if (this.camera) {
      this.camera.position.lerpVectors(
        this.currentCameraPosition,
        this.targetCameraPosition,
        easedProgress
      );

      // 相机旋转过渡
      this.camera.quaternion.slerpQuaternions(
        this.currentCameraRotation,
        this.targetCameraRotation,
        easedProgress
      );
    }

    // 尺度视觉效果过渡
    this.updateScaleVisuals(easedProgress);

    // 检查是否完成
    if (this.progress >= 1) {
      this.completed = true;
      console.log('✅ 尺度转换完成');
    }
  }

  private updateScaleVisuals(progress: number): void {
    // 这里可以添加尺度转换的视觉效果
    // 例如：渐入渐出、扭曲效果等
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public isComplete(): boolean {
    return this.completed;
  }

  public getProgress(): number {
    return this.progress;
  }
}
