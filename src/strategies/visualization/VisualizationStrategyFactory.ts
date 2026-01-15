import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';
import ElectricMagneticCouplingStrategy from './ElectricMagneticCouplingStrategy';
import SpaceTimeStrategy from './SpaceTimeStrategy';

/**
 * Factory class for creating visualization strategies.
 */
export class VisualizationStrategyFactory {
  /**
   * Get the visualization strategy for a specific formula ID.
   * @param formulaId The numerical ID of the formula.
   * @returns A promise that resolves to the visualization strategy instance.
   */
  static async getStrategy(formulaId: number): Promise<VisualizationStrategy> {
    console.log(`Getting strategy for formula ID: ${formulaId}`);

    switch (formulaId) {
      case 1:
        return new SpaceTimeStrategy();
      // Case 2-19: To be migrated. Returning Placeholder for now.
      case 20:
        return new ElectricMagneticCouplingStrategy();
      default:
        console.warn(`No strategy found for formula ${formulaId}, using placeholder.`);
        return new PlaceholderStrategy();
    }
  }
}

/**
 * Placeholder strategy for formulas that haven't been migrated yet.
 */
class PlaceholderStrategy implements VisualizationStrategy {
  createVisualization(group: THREE.Object3D, config?: any): void {
    // Create a simple text or object to indicate work in progress
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x444444, 
      wireframe: true 
    });
    const cube = new THREE.Mesh(geometry, material);
    group.add(cube);

    // Add some particles to make it look less broken
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 100;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.05
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    group.add(particles);

    // Attach update function to group userData so the main loop can call it
    // The main loop in FormulaVisualizationPage expects scene.userData.update or group.userData.update
    group.userData.update = (dt: number) => {
      cube.rotation.x += dt;
      cube.rotation.y += dt;
      particles.rotation.y -= dt * 0.5;
    };
  }
}
