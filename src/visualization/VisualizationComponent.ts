/**
 * 可视化组件基类
 * 定义可视化组件的统一接口
 */

export abstract class VisualizationComponent {
  /**
   * 初始化组件
   */
  public abstract initialize(): void

  /**
   * 更新组件
   * @param deltaTime 时间增量（秒）
   */
  public abstract update(deltaTime: number): void

  /**
   * 销毁组件，释放资源
   */
  public abstract dispose(): void

  /**
   * 暂停组件
   */
  public abstract pause(): void

  /**
   * 恢复组件
   */
  public abstract resume(): void

  /**
   * 检查组件是否暂停
   */
  public abstract isPaused(): boolean

  /**
   * 获取组件ID
   */
  public abstract getId(): string

  /**
   * 获取组件类型
   */
  public abstract getType(): string
}
