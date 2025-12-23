import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhysicsEngine } from '@/core/PhysicsEngine';
import { Vector3 } from '@/core/Vector3';
import { Matrix4 } from '@/core/Matrix4';

describe('PhysicsEngine', () => {
  let physicsEngine: PhysicsEngine;
  let vector3: Vector3;
  let matrix4: Matrix4;

  beforeEach(() => {
    physicsEngine = new PhysicsEngine();
    vector3 = new Vector3(1, 2, 3);
    matrix4 = new Matrix4();
  });

  it('should initialize with default configuration', () => {
    expect(physicsEngine).toBeDefined();
    expect(physicsEngine.getConfig()).toBeDefined();
    expect(typeof physicsEngine.calculateSpacetimeState).toBe('function');
    expect(typeof physicsEngine.calculateGravitationalField).toBe('function');
    expect(typeof physicsEngine.calculateElectromagneticField).toBe('function');
    expect(typeof physicsEngine.calculateUnifiedField).toBe('function');
  });

  it('should calculate spacetime state correctly', () => {
    const spacetimeState = physicsEngine.calculateSpacetimeState(vector3, matrix4);
    
    expect(spacetimeState).toBeDefined();
    expect(spacetimeState.time).toBeDefined();
    expect(spacetimeState.position).toBeDefined();
    expect(spacetimeState.velocity).toBeDefined();
    expect(spacetimeState.acceleration).toBeDefined();
    expect(spacetimeState.curvature).toBeDefined();
  });

  it('should calculate gravitational field correctly', () => {
    const gravitationalField = physicsEngine.calculateGravitationalField(vector3, matrix4);
    
    expect(gravitationalField).toBeDefined();
    expect(gravitationalField.x).toBeDefined();
    expect(gravitationalField.y).toBeDefined();
    expect(gravitationalField.z).toBeDefined();
  });

  it('should calculate electromagnetic field correctly', () => {
    const electromagneticField = physicsEngine.calculateElectromagneticField(vector3, matrix4);
    
    expect(electromagneticField).toBeDefined();
    expect(electromagneticField.x).toBeDefined();
    expect(electromagneticField.y).toBeDefined();
    expect(electromagneticField.z).toBeDefined();
  });

  it('should calculate unified field correctly', () => {
    const unifiedField = physicsEngine.calculateUnifiedField(vector3, matrix4);
    
    expect(unifiedField).toBeDefined();
    expect(unifiedField.x).toBeDefined();
    expect(unifiedField.y).toBeDefined();
    expect(unifiedField.z).toBeDefined();
  });

  it('should update configuration correctly', () => {
    const newConfig = {
      gravitationalConstant: 6.7e-11,
      speedOfLight: 3e8,
      vacuumPermeability: 4e-7 * Math.PI,
      vacuumPermittivity: 8.85e-12,
      planckConstant: 6.63e-34
    };
    
    physicsEngine.updateConfig(newConfig);
    const updatedConfig = physicsEngine.getConfig();
    
    expect(updatedConfig.gravitationalConstant).toBe(newConfig.gravitationalConstant);
    expect(updatedConfig.speedOfLight).toBe(newConfig.speedOfLight);
    expect(updatedConfig.vacuumPermeability).toBe(newConfig.vacuumPermeability);
    expect(updatedConfig.vacuumPermittivity).toBe(newConfig.vacuumPermittivity);
    expect(updatedConfig.planckConstant).toBe(newConfig.planckConstant);
  });

  it('should reset configuration correctly', () => {
    const originalConfig = { ...physicsEngine.getConfig() };
    
    // 更新配置
    physicsEngine.updateConfig({
      gravitationalConstant: 6.7e-11,
      speedOfLight: 3e8
    });
    
    // 重置配置
    physicsEngine.resetConfig();
    const resetConfig = physicsEngine.getConfig();
    
    expect(resetConfig.gravitationalConstant).toBe(originalConfig.gravitationalConstant);
    expect(resetConfig.speedOfLight).toBe(originalConfig.speedOfLight);
  });

  it('should handle different input vectors correctly', () => {
    // 测试不同的向量输入
    const vectors = [
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1),
      new Vector3(1, 1, 1),
      new Vector3(-1, -1, -1)
    ];
    
    vectors.forEach(vector => {
      const result = physicsEngine.calculateUnifiedField(vector, matrix4);
      expect(result).toBeDefined();
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(typeof result.z).toBe('number');
      expect(!isNaN(result.x)).toBe(true);
      expect(!isNaN(result.y)).toBe(true);
      expect(!isNaN(result.z)).toBe(true);
    });
  });
});
