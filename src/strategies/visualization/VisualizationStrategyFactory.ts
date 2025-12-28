import { VisualizationStrategy, VisualizationStrategyConstructor } from './VisualizationStrategy';

// 延迟导入各个可视化策略，提高初始加载性能
const lazyImports = {
  1: () => import('./SpaceTimeStrategy'),
  2: () => import('./HelixStrategy'),
  3: () => import('./MassDefinitionStrategy'),
  4: () => import('./GravitationalFieldStrategy'),
  5: () => import('./RestMomentumStrategy'),
  6: () => import('./MovingMomentumStrategy'),
  7: () => import('./UnifiedForceStrategy'),
  8: () => import('./WaveEquationStrategy'),
  9: () => import('./ChargeDefinitionStrategy'),
  10: () => import('./ElectricFieldStrategy'),
  11: () => import('./MagneticFieldStrategy'),
  12: () => import('./GravityToElectroStrategy'),
  13: () => import('./MagneticVectorPotentialStrategy'),
  14: () => import('./GravityToElectricFieldStrategy'),
  15: () => import('./MagneticToGravityStrategy'),
  16: () => import('./EnergyEquationStrategy'),
  17: () => import('./LightSpeedCraftStrategy'),
  18: () => import('./NuclearForceStrategy'),
  19: () => import('./GravityLightSpeedStrategy'),
  20: () => import('./ElectricMagneticCouplingStrategy')
};

export class VisualizationStrategyFactory {
  private static strategyCache: Map<number, Promise<VisualizationStrategyConstructor>> = new Map();

  /**
   * 根据公式ID获取可视化策略实例
   * @param formulaId 公式ID
   * @returns Promise<VisualizationStrategy> 可视化策略实例
   */
  public static async getStrategy(formulaId: number): Promise<VisualizationStrategy> {
    // 检查缓存中是否已有该策略的Promise
    if (!this.strategyCache.has(formulaId)) {
      // 如果不在缓存中，创建新的Promise
      const importFunc = lazyImports[formulaId as keyof typeof lazyImports];
      if (!importFunc) {
        throw new Error(`Visualization strategy for formula ${formulaId} not found`);
      }

      const strategyPromise = importFunc()
        .then(module => {
          // 假设每个模块都导出一个名为 Strategy 的默认类
          const StrategyClass = module.default;
          return StrategyClass as VisualizationStrategyConstructor;
        })
        .catch(error => {
          console.error(`Failed to load strategy for formula ${formulaId}:`, error);
          throw error;
        });

      this.strategyCache.set(formulaId, strategyPromise);
    }

    // 等待Promise解析并创建实例
    const StrategyClass = await this.strategyCache.get(formulaId)!;
    return new StrategyClass();
  }

  /**
   * 清理指定公式ID的策略缓存
   * @param formulaId 公式ID
   */
  public static clearStrategyCache(formulaId?: number): void {
    if (formulaId) {
      this.strategyCache.delete(formulaId);
    } else {
      this.strategyCache.clear();
    }
  }
}
