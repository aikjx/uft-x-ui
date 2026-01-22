// 统一场论可视化系统 - BVH加速结构
// 版本: v1.0
// 功能: 实现边界体积层次结构，加速光线追踪的相交测试

import { Vector3 } from 'three';
import { Ray } from '../engines/RaytracingEngine2';
import { Intersection } from '../engines/RaytracingEngine2';

export class BVHNode {
  public bounds: { min: Vector3; max: Vector3 };
  public objects: any[] = [];
  public left: BVHNode | null = null;
  public right: BVHNode | null = null;

  constructor(min: Vector3, max: Vector3, objects: any[], left?: BVHNode, right?: BVHNode) {
    this.bounds = { min, max };
    this.objects = objects;
    this.left = left || null;
    this.right = right || null;
  }

  public isLeaf(): boolean {
    return this.left === null && this.right === null;
  }

  public intersect(ray: Ray): Intersection | null {
    if (!this.intersectBounds(ray)) {
      return null;
    }

    if (this.isLeaf()) {
      return this.intersectObjects(ray);
    }

    const leftIntersection = this.left?.intersect(ray);
    const rightIntersection = this.right?.intersect(ray);

    if (!leftIntersection) return rightIntersection;
    if (!rightIntersection) return leftIntersection;

    return leftIntersection.distance < rightIntersection.distance ? leftIntersection : rightIntersection;
  }

  private intersectBounds(ray: Ray): boolean {
    const { min, max } = this.bounds;
    const origin = ray.origin;
    const direction = ray.direction;

    let tMin = (min.x - origin.x) / direction.x;
    let tMax = (max.x - origin.x) / direction.x;

    if (tMin > tMax) [tMin, tMax] = [tMax, tMin];

    let tyMin = (min.y - origin.y) / direction.y;
    let tyMax = (max.y - origin.y) / direction.y;

    if (tyMin > tyMax) [tyMin, tyMax] = [tyMax, tyMin];

    if (tMin > tyMax || tyMin > tMax) {
      return false;
    }

    if (tyMin > tMin) tMin = tyMin;
    if (tyMax < tMax) tMax = tyMax;

    let tzMin = (min.z - origin.z) / direction.z;
    let tzMax = (max.z - origin.z) / direction.z;

    if (tzMin > tzMax) [tzMin, tzMax] = [tzMax, tzMin];

    if (tMin > tzMax || tzMin > tMax) {
      return false;
    }

    if (tzMin > tMin) tMin = tzMin;
    if (tzMax < tMax) tMax = tzMax;

    return tMax > 0;
  }

  private intersectObjects(ray: Ray): Intersection | null {
    let closestIntersection: Intersection | null = null;
    let minDistance = Infinity;

    for (const object of this.objects) {
      const intersection = this.intersectObject(ray, object);
      if (intersection && intersection.distance < minDistance) {
        closestIntersection = intersection;
        minDistance = intersection.distance;
      }
    }

    return closestIntersection;
  }

  private intersectObject(ray: Ray, object: any): Intersection | null {
    switch (object.type) {
      case 'sphere':
        return this.intersectSphere(ray, object);
      case 'plane':
        return this.intersectPlane(ray, object);
      case 'triangle':
        return this.intersectTriangle(ray, object);
      case 'box':
        return this.intersectBox(ray, object);
      default:
        return null;
    }
  }

  private intersectSphere(ray: Ray, sphere: any): Intersection | null {
    const oc = new Vector3().subVectors(ray.origin, sphere.position);
    const a = ray.direction.dot(ray.direction);
    const b = 2 * oc.dot(ray.direction);
    const c = oc.dot(oc) - sphere.radius * sphere.radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return null;
    }

    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t < 0) {
      return null;
    }

    const position = new Vector3().addVectors(ray.origin, ray.direction.clone().multiplyScalar(t));
    const normal = new Vector3().subVectors(position, sphere.position).normalize();

    return new Intersection(position, normal, t, sphere.materialId);
  }

  private intersectPlane(ray: Ray, plane: any): Intersection | null {
    const denom = plane.normal.dot(ray.direction);
    if (Math.abs(denom) < 1e-6) {
      return null;
    }

    const t = new Vector3().subVectors(plane.position, ray.origin).dot(plane.normal) / denom;
    if (t < 0) {
      return null;
    }

    const position = new Vector3().addVectors(ray.origin, ray.direction.clone().multiplyScalar(t));

    return new Intersection(position, plane.normal.clone(), t, plane.materialId);
  }

  private intersectTriangle(ray: Ray, triangle: any): Intersection | null {
    const { v0, v1, v2 } = triangle;
    const edge1 = new Vector3().subVectors(v1, v0);
    const edge2 = new Vector3().subVectors(v2, v0);
    const h = new Vector3().crossVectors(ray.direction, edge2);
    const a = edge1.dot(h);

    if (a > -1e-6 && a < 1e-6) {
      return null;
    }

    const f = 1 / a;
    const s = new Vector3().subVectors(ray.origin, v0);
    const u = f * s.dot(h);

    if (u < 0 || u > 1) {
      return null;
    }

    const q = new Vector3().crossVectors(s, edge1);
    const v = f * ray.direction.dot(q);

    if (v < 0 || u + v > 1) {
      return null;
    }

    const t = f * edge2.dot(q);
    if (t < 0) {
      return null;
    }

    const position = new Vector3().addVectors(ray.origin, ray.direction.clone().multiplyScalar(t));
    const normal = new Vector3().crossVectors(edge1, edge2).normalize();

    return new Intersection(position, normal, t, triangle.materialId);
  }

  private intersectBox(ray: Ray, box: any): Intersection | null {
    const { min, max } = box.bounds;
    const origin = ray.origin;
    const direction = ray.direction;

    let tMin = (min.x - origin.x) / direction.x;
    let tMax = (max.x - origin.x) / direction.x;

    if (tMin > tMax) [tMin, tMax] = [tMax, tMin];

    let tyMin = (min.y - origin.y) / direction.y;
    let tyMax = (max.y - origin.y) / direction.y;

    if (tyMin > tyMax) [tyMin, tyMax] = [tyMax, tyMin];

    if (tMin > tyMax || tyMin > tMax) {
      return null;
    }

    if (tyMin > tMin) tMin = tyMin;
    if (tyMax < tMax) tMax = tyMax;

    let tzMin = (min.z - origin.z) / direction.z;
    let tzMax = (max.z - origin.z) / direction.z;

    if (tzMin > tzMax) [tzMin, tzMax] = [tzMax, tzMin];

    if (tMin > tzMax || tzMin > tMax) {
      return null;
    }

    if (tzMin > tMin) tMin = tzMin;
    if (tzMax < tMax) tMax = tzMax;

    if (tMin < 0) {
      return null;
    }

    const position = new Vector3().addVectors(ray.origin, ray.direction.clone().multiplyScalar(tMin));
    const normal = this.calculateBoxNormal(position, box.bounds);

    return new Intersection(position, normal, tMin, box.materialId);
  }

  private calculateBoxNormal(position: Vector3, bounds: { min: Vector3; max: Vector3 }): Vector3 {
    const { min, max } = bounds;
    const eps = 1e-4;

    if (Math.abs(position.x - min.x) < eps) return new Vector3(-1, 0, 0);
    if (Math.abs(position.x - max.x) < eps) return new Vector3(1, 0, 0);
    if (Math.abs(position.y - min.y) < eps) return new Vector3(0, -1, 0);
    if (Math.abs(position.y - max.y) < eps) return new Vector3(0, 1, 0);
    if (Math.abs(position.z - min.z) < eps) return new Vector3(0, 0, -1);
    if (Math.abs(position.z - max.z) < eps) return new Vector3(0, 0, 1);

    return new Vector3(0, 1, 0);
  }
}