import * as THREE from 'three';

export interface VisualizationStrategy {
  /**
   * 创建可视化对象
   * @param scene THREE.Scene 实例
   * @param params 可视化参数
   */
  createVisualization(scene: THREE.Scene, params?: any): void;
  
  /**
   * 更新可视化动画
   * @param deltaTime 时间增量
   * @param animationSpeed 动画速度
   */
  updateVisualization?(deltaTime: number, animationSpeed?: number): void;
  
  /**
   * 清理可视化资源
   */
  cleanup?(): void;
}

export interface VisualizationStrategyConstructor {
  new(): VisualizationStrategy;
}
