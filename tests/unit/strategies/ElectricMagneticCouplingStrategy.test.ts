import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import ElectricMagneticCouplingStrategy from '../../../src/strategies/visualization/ElectricMagneticCouplingStrategy'

describe('ElectricMagneticCouplingStrategy', () => {
  let strategy: ElectricMagneticCouplingStrategy
  let mockScene: THREE.Object3D

  beforeEach(() => {
    strategy = new ElectricMagneticCouplingStrategy()
    mockScene = new THREE.Object3D()
    // Ensure mockScene.add is a spy
    mockScene.add = vi.fn()
    // Reset userData
    mockScene.userData = {}
  })

  it('should create visualization objects', () => {
    strategy.createVisualization(mockScene)

    // Check if objects were added to the scene
    expect(mockScene.add).toHaveBeenCalled()

    // In our mock, we can check calls to see what was added
    // The strategy adds: centralSphere, glowSprite, rings (3), particleSystem
    // Total calls should be 1 + 1 + 3 + 1 = 6
    expect(mockScene.add).toHaveBeenCalledTimes(6)
  })

  it('should set update function on scene.userData', () => {
    strategy.createVisualization(mockScene)
    expect(typeof mockScene.userData.update).toBe('function')
  })

  it('should update visualization without errors', () => {
    strategy.createVisualization(mockScene)

    // Call the update function
    const updateFn = mockScene.userData.update
    expect(() => updateFn(0.016)).not.toThrow()
  })

  it('should cleanup resources', () => {
    strategy.createVisualization(mockScene)
    expect(() => strategy.cleanup()).not.toThrow()
  })
})
