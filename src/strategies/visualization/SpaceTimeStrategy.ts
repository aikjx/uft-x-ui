import * as THREE from 'three';
import { VisualizationStrategy } from './VisualizationStrategy';

/**
 * Strategy for Formula 1: Space-Time Identity Equation
 * \vec{r}(t) = \vec{C}t
 */
export default class SpaceTimeStrategy implements VisualizationStrategy {
  private objects: THREE.Object3D[] = [];

  createVisualization(scene: THREE.Object3D, config?: any): void {
    // 1. Time Line (Red)
    const timeLineGeometry = new THREE.BufferGeometry();
    const timeLinePoints = [];
    for (let i = -5; i <= 5; i += 0.1) {
      timeLinePoints.push(new THREE.Vector3(i, 0, 0));
    }
    timeLineGeometry.setFromPoints(timeLinePoints);
    const timeLineMaterial = new THREE.LineBasicMaterial({ color: 0xff6b6b });
    const timeLine = new THREE.Line(timeLineGeometry, timeLineMaterial);
    scene.add(timeLine);
    this.objects.push(timeLine);

    // 2. Space Path (Cyan) - C = (1, 1, 1) simplified
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = [];
    for (let t = 0; t <= 10; t += 0.1) {
      pathPoints.push(new THREE.Vector3(t * 0.3, t * 0.3, t * 0.3));
    }
    pathGeometry.setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x4ecdc4 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);
    this.objects.push(pathLine);

    // 3. Moving Point
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x45b7d1 });
    const movingPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    scene.add(movingPoint);
    this.objects.push(movingPoint);

    // Store state for update
    const state = { t: 0 };

    // 4. Update Function
    // The main page looks for this function on the group or scene userData
    const update = (dt: number) => {
      // Note: The main loop passes deltaTime, but legacy code used a fixed increment.
      // We'll adapt to use deltaTime for smooth framerate independence.
      const speed = 1.0; // Could come from config
      state.t += dt * speed; 
      
      // Reset loop
      if (state.t > 10) state.t = 0;

      const currentT = state.t;
      movingPoint.position.set(currentT * 0.3, currentT * 0.3, currentT * 0.3);
    };

    // Attach to userData for the main loop to find
    if (scene instanceof THREE.Group || scene instanceof THREE.Scene) {
        scene.userData.update = update;
    }
  }

  cleanup(): void {
    this.objects.forEach(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
    });
    this.objects = [];
  }
}
