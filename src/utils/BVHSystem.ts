import * as THREE from 'three'

interface BoundingBox {
  min: THREE.Vector3
  max: THREE.Vector3
}

interface BVHNode {
  box: BoundingBox
  left?: BVHNode
  right?: BVHNode
  object?: THREE.Object3D
  depth: number
}

interface Ray {
  origin: THREE.Vector3
  direction: THREE.Vector3
  tMin: number
  tMax: number
}

interface IntersectionResult {
  hit: boolean
  distance: number
  object?: THREE.Object3D
  point?: THREE.Vector3
  normal?: THREE.Vector3
}

/**
 * BVH (Bounding Volume Hierarchy) system for optimized ray tracing and collision detection
 */
export class BVHSystem {
  private root: BVHNode | null = null
  private objects: THREE.Object3D[] = []
  private maxDepth: number = 20
  private maxObjectsPerNode: number = 4

  /**
   * Build BVH from scene objects
   */
  buildFromScene(scene: THREE.Scene): void {
    this.objects = []
    this.collectObjects(scene)
    this.root = this.build(this.objects, 0)
  }

  /**
   * Collect all mesh objects from scene
   */
  private collectObjects(scene: THREE.Object3D): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry && object.material) {
        this.objects.push(object)
      }
    })
  }

  /**
   * Build BVH recursively
   */
  private build(objects: THREE.Object3D[], depth: number): BVHNode {
    if (depth > this.maxDepth || objects.length <= this.maxObjectsPerNode) {
      return this.createLeafNode(objects, depth)
    }

    const axis = this.selectSplitAxis(objects)
    const sortedObjects = this.sortObjectsByAxis(objects, axis)
    const { left, right } = this.splitObjects(sortedObjects)

    const leftNode = this.build(left, depth + 1)
    const rightNode = this.build(right, depth + 1)
    const boundingBox = this.combineBoundingBoxes(leftNode.box, rightNode.box)

    return {
      box: boundingBox,
      left: leftNode,
      right: rightNode,
      depth
    }
  }

  /**
   * Create leaf node
   */
  private createLeafNode(objects: THREE.Object3D[], depth: number): BVHNode {
    if (objects.length === 0) {
      return {
        box: this.createEmptyBoundingBox(),
        depth
      }
    }

    if (objects.length === 1) {
      const object = objects[0]
      return {
        box: this.getObjectBoundingBox(object),
        object,
        depth
      }
    }

    const boundingBox = this.calculateBoundingBox(objects)
    return {
      box: boundingBox,
      depth
    }
  }

  /**
   * Select best split axis using surface area heuristic
   */
  private selectSplitAxis(objects: THREE.Object3D[]): 'x' | 'y' | 'z' {
    const box = this.calculateBoundingBox(objects)
    const extents = box.max.clone().sub(box.min)
    
    if (extents.x >= extents.y && extents.x >= extents.z) {
      return 'x'
    } else if (extents.y >= extents.x && extents.y >= extents.z) {
      return 'y'
    } else {
      return 'z'
    }
  }

  /**
   * Sort objects by axis
   */
  private sortObjectsByAxis(objects: THREE.Object3D[], axis: 'x' | 'y' | 'z'): THREE.Object3D[] {
    return [...objects].sort((a, b) => {
      const aBox = this.getObjectBoundingBox(a)
      const bBox = this.getObjectBoundingBox(b)
      const aCenter = aBox.min[axis] + (aBox.max[axis] - aBox.min[axis]) * 0.5
      const bCenter = bBox.min[axis] + (bBox.max[axis] - bBox.min[axis]) * 0.5
      return aCenter - bCenter
    })
  }

  /**
   * Split objects into left and right groups
   */
  private splitObjects(objects: THREE.Object3D[]): { left: THREE.Object3D[]; right: THREE.Object3D[] } {
    const mid = Math.floor(objects.length * 0.5)
    return {
      left: objects.slice(0, mid),
      right: objects.slice(mid)
    }
  }

  /**
   * Get bounding box for object
   */
  private getObjectBoundingBox(object: THREE.Object3D): BoundingBox {
    object.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(object)
    return {
      min: box.min.clone(),
      max: box.max.clone()
    }
  }

  /**
   * Calculate bounding box for multiple objects
   */
  private calculateBoundingBox(objects: THREE.Object3D[]): BoundingBox {
    const box = new THREE.Box3()
    objects.forEach(object => {
      box.expandByObject(object)
    })
    return {
      min: box.min.clone(),
      max: box.max.clone()
    }
  }

  /**
   * Create empty bounding box
   */
  private createEmptyBoundingBox(): BoundingBox {
    return {
      min: new THREE.Vector3(Infinity, Infinity, Infinity),
      max: new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    }
  }

  /**
   * Combine two bounding boxes
   */
  private combineBoundingBoxes(a: BoundingBox, b: BoundingBox): BoundingBox {
    return {
      min: new THREE.Vector3(
        Math.min(a.min.x, b.min.x),
        Math.min(a.min.y, b.min.y),
        Math.min(a.min.z, b.min.z)
      ),
      max: new THREE.Vector3(
        Math.max(a.max.x, b.max.x),
        Math.max(a.max.y, b.max.y),
        Math.max(a.max.z, b.max.z)
      )
    }
  }

  /**
   * Ray-box intersection test
   */
  private rayBoxIntersect(ray: Ray, box: BoundingBox): boolean {
    const { origin, direction, tMin, tMax } = ray
    let t0 = tMin
    let t1 = tMax

    for (let i = 0; i < 3; i++) {
      const invD = 1.0 / direction.getComponent(i)
      let tNear = (box.min.getComponent(i) - origin.getComponent(i)) * invD
      let tFar = (box.max.getComponent(i) - origin.getComponent(i)) * invD

      if (invD < 0) {
        [tNear, tFar] = [tFar, tNear]
      }

      t0 = tNear > t0 ? tNear : t0
      t1 = tFar < t1 ? tFar : t1

      if (t0 > t1) return false
    }

    return true
  }

  /**
   * Ray-object intersection test
   */
  private rayObjectIntersect(ray: Ray, object: THREE.Object3D): IntersectionResult {
    if (!(object instanceof THREE.Mesh)) {
      return { hit: false, distance: Infinity }
    }

    const raycaster = new THREE.Raycaster(ray.origin, ray.direction, ray.tMin, ray.tMax)
    const intersects = raycaster.intersectObject(object, false)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      return {
        hit: true,
        distance: intersection.distance,
        object,
        point: intersection.point,
        normal: intersection.face?.normal || new THREE.Vector3()
      }
    }

    return { hit: false, distance: Infinity }
  }

  /**
   * Trace ray through BVH
   */
  traceRay(ray: Ray): IntersectionResult {
    if (!this.root) {
      return { hit: false, distance: Infinity }
    }

    return this.traverse(this.root, ray)
  }

  /**
   * Traverse BVH recursively
   */
  private traverse(node: BVHNode, ray: Ray): IntersectionResult {
    if (!this.rayBoxIntersect(ray, node.box)) {
      return { hit: false, distance: Infinity }
    }

    if (node.object) {
      return this.rayObjectIntersect(ray, node.object)
    }

    if (!node.left || !node.right) {
      return { hit: false, distance: Infinity }
    }

    const leftResult = this.traverse(node.left, ray)
    const rightResult = this.traverse(node.right, ray)

    if (!leftResult.hit) return rightResult
    if (!rightResult.hit) return leftResult

    return leftResult.distance < rightResult.distance ? leftResult : rightResult
  }

  /**
   * Check if point is inside any object
   */
  pointInObject(point: THREE.Vector3): THREE.Object3D | null {
    if (!this.root) return null
    return this.checkPointInNode(this.root, point)
  }

  /**
   * Check if point is inside node
   */
  private checkPointInNode(node: BVHNode, point: THREE.Vector3): THREE.Object3D | null {
    if (!this.pointInBox(point, node.box)) {
      return null
    }

    if (node.object) {
      return this.pointInMesh(point, node.object) ? node.object : null
    }

    if (node.left) {
      const leftResult = this.checkPointInNode(node.left, point)
      if (leftResult) return leftResult
    }

    if (node.right) {
      return this.checkPointInNode(node.right, point)
    }

    return null
  }

  /**
   * Check if point is inside bounding box
   */
  private pointInBox(point: THREE.Vector3, box: BoundingBox): boolean {
    return (
      point.x >= box.min.x &&
      point.x <= box.max.x &&
      point.y >= box.min.y &&
      point.y <= box.max.y &&
      point.z >= box.min.z &&
      point.z <= box.max.z
    )
  }

  /**
   * Check if point is inside mesh
   */
  private pointInMesh(point: THREE.Vector3, mesh: THREE.Mesh): boolean {
    if (!(mesh.geometry instanceof THREE.BufferGeometry)) return false

    const geometry = mesh.geometry
    const positionAttribute = geometry.getAttribute('position')
    
    if (!positionAttribute) return false

    mesh.updateMatrixWorld(true)
    const inverseMatrix = new THREE.Matrix4().getInverse(mesh.matrixWorld)
    const localPoint = point.clone().applyMatrix4(inverseMatrix)

    let inside = false
    const position = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(positionAttribute, i)
      const b = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1)
      const c = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2)

      if (this.pointInTriangle(localPoint, a, b, c)) {
        inside = true
        break
      }
    }

    return inside
  }

  /**
   * Check if point is inside triangle
   */
  private pointInTriangle(point: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): boolean {
    const v0 = c.clone().sub(a)
    const v1 = b.clone().sub(a)
    const v2 = point.clone().sub(a)

    const dot00 = v0.dot(v0)
    const dot01 = v0.dot(v1)
    const dot02 = v0.dot(v2)
    const dot11 = v1.dot(v1)
    const dot12 = v1.dot(v2)

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom

    return (u >= 0) && (v >= 0) && (u + v < 1)
  }

  /**
   * Get objects within bounding box
   */
  getObjectsInBox(box: BoundingBox): THREE.Object3D[] {
    const result: THREE.Object3D[] = []
    if (this.root) {
      this.collectObjectsInNode(this.root, box, result)
    }
    return result
  }

  /**
   * Collect objects in node
   */
  private collectObjectsInNode(node: BVHNode, box: BoundingBox, result: THREE.Object3D[]): void {
    if (!this.boxesIntersect(node.box, box)) {
      return
    }

    if (node.object) {
      result.push(node.object)
    }

    if (node.left) {
      this.collectObjectsInNode(node.left, box, result)
    }

    if (node.right) {
      this.collectObjectsInNode(node.right, box, result)
    }
  }

  /**
   * Check if two boxes intersect
   */
  private boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
    return (
      a.min.x <= b.max.x &&
      a.max.x >= b.min.x &&
      a.min.y <= b.max.y &&
      a.max.y >= b.min.y &&
      a.min.z <= b.max.z &&
      a.max.z >= b.min.z
    )
  }

  /**
   * Update BVH when objects change
   */
  update(scene: THREE.Scene): void {
    this.buildFromScene(scene)
  }

  /**
   * Get BVH statistics
   */
  getStats(): {
    nodeCount: number
    leafCount: number
    maxDepth: number
    avgObjectsPerLeaf: number
  } {
    let nodeCount = 0
    let leafCount = 0
    let maxDepth = 0
    let totalObjectsInLeaves = 0

    const traverseStats = (node: BVHNode) => {
      nodeCount++
      maxDepth = Math.max(maxDepth, node.depth)

      if (node.object) {
        leafCount++
        totalObjectsInLeaves++
      } else if (!node.left && !node.right) {
        leafCount++
      } else {
        if (node.left) traverseStats(node.left)
        if (node.right) traverseStats(node.right)
      }
    }

    if (this.root) {
      traverseStats(this.root)
    }

    return {
      nodeCount,
      leafCount,
      maxDepth,
      avgObjectsPerLeaf: leafCount > 0 ? totalObjectsInLeaves / leafCount : 0
    }
  }

  /**
   * Clear BVH
   */
  clear(): void {
    this.root = null
    this.objects = []
  }
}

/**
 * Create ray from origin and direction
 */
export function createRay(origin: THREE.Vector3, direction: THREE.Vector3, tMin: number = 0, tMax: number = Infinity): Ray {
  return {
    origin,
    direction,
    tMin,
    tMax
  }
}

/**
 * Create bounding box from min and max vectors
 */
export function createBoundingBox(min: THREE.Vector3, max: THREE.Vector3): BoundingBox {
  return { min, max }
}
