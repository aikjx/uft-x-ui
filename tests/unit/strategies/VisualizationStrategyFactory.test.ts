import { describe, it, expect, vi } from 'vitest';
import { VisualizationStrategyFactory } from '../../../src/strategies/visualization/VisualizationStrategyFactory';
import ElectricMagneticCouplingStrategy from '../../../src/strategies/visualization/ElectricMagneticCouplingStrategy';
import SpaceTimeStrategy from '../../../src/strategies/visualization/SpaceTimeStrategy';

// Mock the strategies
vi.mock('../../../src/strategies/visualization/ElectricMagneticCouplingStrategy');
vi.mock('../../../src/strategies/visualization/SpaceTimeStrategy');

describe('VisualizationStrategyFactory', () => {
  it('should return SpaceTimeStrategy for formula ID 1', async () => {
    const strategy = await VisualizationStrategyFactory.getStrategy(1);
    expect(strategy).toBeInstanceOf(SpaceTimeStrategy);
  });

  it('should return ElectricMagneticCouplingStrategy for formula ID 20', async () => {
    const strategy = await VisualizationStrategyFactory.getStrategy(20);
    expect(strategy).toBeInstanceOf(ElectricMagneticCouplingStrategy);
  });

  it('should return a placeholder strategy for unknown IDs', async () => {
    const strategy = await VisualizationStrategyFactory.getStrategy(999);
    // The placeholder is an internal class, but it should be an object (not null/undefined)
    // and should implement createVisualization
    expect(strategy).toBeDefined();
    expect(strategy.createVisualization).toBeDefined();
    expect(strategy).not.toBeInstanceOf(SpaceTimeStrategy);
    expect(strategy).not.toBeInstanceOf(ElectricMagneticCouplingStrategy);
  });
});
