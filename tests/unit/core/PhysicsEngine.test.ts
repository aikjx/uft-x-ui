import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PhysicsEngine } from '@/core/PhysicsEngine'
import * as THREE from 'three'

describe('PhysicsEngine', () => {
  let physicsEngine: PhysicsEngine
  let vector3: THREE.Vector3

  beforeEach(() => {
    physicsEngine = new PhysicsEngine()
    vector3 = new THREE.Vector3(1, 2, 3)
  })

  it('should initialize with default configuration', () => {
    expect(physicsEngine).toBeDefined()
    expect(physicsEngine.getParameters()).toBeDefined()
    expect(typeof physicsEngine.calculateSpacetimeState).toBe('function')
    expect(typeof physicsEngine.calculateGravitationalField).toBe('function')
    expect(typeof physicsEngine.calculateElectromagneticField).toBe('function')
    expect(typeof physicsEngine.calculateUnifiedField).toBe('function')
  })

  it('should calculate spacetime state correctly', () => {
    const spacetimeState = physicsEngine.calculateSpacetimeState(vector3, 1)

    expect(spacetimeState).toBeDefined()
    expect(spacetimeState.time).toBeDefined()
    expect(spacetimeState.position).toBeDefined()
    expect(spacetimeState.curvature).toBeDefined()
    expect(spacetimeState.energyDensity).toBeDefined()
    expect(spacetimeState.momentum).toBeDefined()
  })

  it('should calculate gravitational field correctly', () => {
    const gravitationalField = physicsEngine.calculateGravitationalField(vector3, 1)

    expect(gravitationalField).toBeDefined()
    expect(gravitationalField.x).toBeDefined()
    expect(gravitationalField.y).toBeDefined()
    expect(gravitationalField.z).toBeDefined()
  })

  it('should calculate electromagnetic field correctly', () => {
    const electromagneticField = physicsEngine.calculateElectromagneticField(
      vector3,
      1,
      new THREE.Vector3(0, 0, 0)
    )

    expect(electromagneticField).toBeDefined()
    expect(electromagneticField.electric).toBeDefined()
    expect(electromagneticField.magnetic).toBeDefined()
  })

  it('should calculate unified field correctly', () => {
    const unifiedField = physicsEngine.calculateUnifiedField(vector3, 1, 1, 1)

    expect(unifiedField).toBeDefined()
    expect(unifiedField.spacetime).toBeDefined()
    expect(unifiedField.gravitational).toBeDefined()
    expect(unifiedField.electromagnetic).toBeDefined()
    expect(unifiedField.strongForce).toBeDefined()
    expect(unifiedField.weakForce).toBeDefined()
  })

  it('should update parameters correctly', () => {
    const newParams = {
      gravitationalConstant: 6.7e-11,
      spacetimeSpeed: 3e8
    }

    physicsEngine.setParameters(newParams)
    const updatedParams = physicsEngine.getParameters()

    expect(updatedParams.gravitationalConstant).toBe(newParams.gravitationalConstant)
    expect(updatedParams.spacetimeSpeed).toBe(newParams.spacetimeSpeed)
  })

  it('should handle different input vectors correctly', () => {
    // 测试不同的向量输入
    const vectors = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(-1, -1, -1)
    ]

    vectors.forEach(vector => {
      const result = physicsEngine.calculateUnifiedField(vector, 1, 1, 1)
      expect(result).toBeDefined()
      expect(result.spacetime).toBeDefined()
      expect(result.gravitational).toBeDefined()
      expect(result.electromagnetic).toBeDefined()
    })
  })
})
