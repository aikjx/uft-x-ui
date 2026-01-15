import * as THREE from 'three';

/**
 * Visualization Strategy Interface
 * Defines the common interface for all formula visualization strategies.
 */
export interface VisualizationStrategy {
  /**
   * Creates the visualization in the given scene or group.
   * @param group The THREE.Group or Scene to add objects to.
   * @param config Optional configuration parameters for the visualization.
   */
  createVisualization(group: THREE.Object3D, config?: any): Promise<void> | void;

  /**
   * Optional update method called on every frame.
   * @param deltaTime Time since last frame in seconds.
   * @param animationSpeed Speed multiplier for the animation.
   */
  updateVisualization?(deltaTime: number, animationSpeed?: number): void;

  /**
   * Cleans up resources (geometries, materials, textures) when the visualization is destroyed.
   */
  cleanup?(): void;
}
