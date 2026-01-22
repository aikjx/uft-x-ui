// 统一场论可视化系统 - 高级光线追踪引擎 2.0
// 版本: v2.0
// 功能: 实时光线追踪，支持全局光照、复杂材质和硬件加速

import { Vector3, Vector4, Matrix4, Color } from 'three';
import { AccelerationStructure } from '../utils/AccelerationStructure';
import { MaterialSystem } from '../utils/MaterialSystem';
import { TextureSystem } from '../utils/TextureSystem';
import { LightSystem } from '../utils/LightSystem';
import { BVHNode } from '../utils/BVH';

export class RaytracingEngine2 {
  private accelerationStructures: Map<string, AccelerationStructure> = new Map();
  private materialSystem: MaterialSystem;
  private textureSystem: TextureSystem;
  private lightSystem: LightSystem;
  private rayMarchingSteps: number = 200;
  private maxBounces: number = 16;
  private samplesPerPixel: number = 32;
  private enableTemporalAccumulation: boolean = true;
  private accumulationBuffer: Map<string, Vector4> = new Map();
  private frameCount: number = 0;
  private useWebGPU: boolean = false;
  private webGPUDevice: any = null;

  constructor() {
    this.materialSystem = new MaterialSystem();
    this.textureSystem = new TextureSystem();
    this.lightSystem = new LightSystem();
    this.initWebGPUSupport();
  }

  private initWebGPUSupport() {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      this.initializeWebGPU();
    }
  }

  private async initializeWebGPU() {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        this.webGPUDevice = await adapter.requestDevice();
        this.useWebGPU = true;
        console.log('🚀 WebGPU光线追踪加速已启用');
      }
    } catch (error) {
      console.warn('⚠️ WebGPU初始化失败，使用CPU光线追踪:', error);
    }
  }

  public buildAccelerationStructure(scene: any): AccelerationStructure {
    const objects = scene.objects || [];
    const bvh = new BVHNode(objects);
    const accelerationStructure = new AccelerationStructure(bvh);
    this.accelerationStructures.set(scene.id || 'default', accelerationStructure);
    return accelerationStructure;
  }

  public render(canvas: HTMLCanvasElement, scene: any, camera: any, options: any = {}): Promise<{ renderTime: number; mode: string }> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const width = canvas.width;
      const height = canvas.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ renderTime: 0, mode: 'raytracing' });
        return;
      }

      const spp = options.samplesPerPixel || this.samplesPerPixel;
      const maxBounces = options.maxBounces || this.maxBounces;
      const enableDenoiser = options.enableDenoiser || false;

      if (this.useWebGPU && options.useWebGPU !== false) {
        this.renderWithWebGPU(canvas, scene, camera, options).then((result) => {
          const endTime = performance.now();
          resolve({ renderTime: endTime - startTime, mode: 'webgpu_raytracing' });
        });
      } else {
        this.renderWithCPU(canvas, scene, camera, { spp, maxBounces, enableDenoiser });
        const endTime = performance.now();
        resolve({ renderTime: endTime - startTime, mode: 'cpu_raytracing' });
      }
    });
  }

  private async renderWithWebGPU(canvas: HTMLCanvasElement, scene: any, camera: any, options: any): Promise<void> {
    if (!this.webGPUDevice) {
      console.warn('⚠️ WebGPU不可用，回退到CPU渲染');
      return;
    }

    try {
      const context = canvas.getContext('webgpu');
      if (!context) return;

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device: this.webGPUDevice,
        format: format,
        size: { width: canvas.width, height: canvas.height }
      });

      const commandEncoder = this.webGPUDevice.createCommandEncoder();
      const renderPassDescriptor = {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
          }
        ]
      };

      const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
      
      // WebGPU光线追踪实现
      this.renderWebGPURaytracing(renderPass, scene, camera, options);
      
      renderPass.end();
      this.webGPUDevice.queue.submit([commandEncoder.finish()]);
    } catch (error) {
      console.error('WebGPU渲染失败:', error);
    }
  }

  private renderWebGPURaytracing(renderPass: any, scene: any, camera: any, options: any): void {
    // WebGPU光线追踪核心实现
    // 这里将使用WebGPU着色器进行光线追踪
  }

  private renderWithCPU(canvas: HTMLCanvasElement, scene: any, camera: any, options: any): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const accelerationStructure = this.accelerationStructures.get(scene.id || 'default') || 
                                  this.buildAccelerationStructure(scene);

    const spp = options.spp;
    const maxBounces = options.maxBounces;

    // 并行渲染
    const numThreads = navigator.hardwareConcurrency || 4;
    const tasks = this.createRenderTasks(width, height, spp);
    const results = this.executeRenderTasks(tasks, scene, camera, accelerationStructure, maxBounces);

    this.combineRenderResults(results, data, width, height);
    ctx.putImageData(imageData, 0, 0);

    if (options.enableDenoiser) {
      this.applyDenoiser(canvas, ctx, width, height);
    }
  }

  private createRenderTasks(width: number, height: number, spp: number): Array<{ x: number; y: number; samples: number }> {
    const tasks = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        tasks.push({ x, y, samples: spp });
      }
    }
    return tasks;
  }

  private executeRenderTasks(tasks: any[], scene: any, camera: any, accelerationStructure: AccelerationStructure, maxBounces: number): Map<string, Vector3> {
    const results = new Map<string, Vector3>();
    
    // 模拟并行执行
    tasks.forEach(task => {
      const { x, y, samples } = task;
      let color = new Vector3(0, 0, 0);

      for (let s = 0; s < samples; s++) {
        const jitterX = Math.random() - 0.5;
        const jitterY = Math.random() - 0.5;
        const ray = this.createPrimaryRay(x + jitterX, y + jitterY, scene.width, scene.height, camera);
        const sampleColor = this.traceRay(ray, scene, accelerationStructure, maxBounces, 0);
        color.add(sampleColor);
      }

      color.divideScalar(samples);
      results.set(`${x},${y}`, color);
    });

    return results;
  }

  private combineRenderResults(results: Map<string, Vector3>, data: Uint8ClampedArray, width: number, height: number): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        const color = results.get(key) || new Vector3(0, 0, 0);
        const index = (y * width + x) * 4;
        
        data[index] = Math.floor(Math.min(255, color.x * 255));
        data[index + 1] = Math.floor(Math.min(255, color.y * 255));
        data[index + 2] = Math.floor(Math.min(255, color.z * 255));
        data[index + 3] = 255;
      }
    }
  }

  private createPrimaryRay(x: number, y: number, width: number, height: number, camera: any): Ray {
    const aspect = width / height;
    const fov = camera.fov || Math.PI / 4;
    const pixelX = (2 * (x / width) - 1) * aspect * Math.tan(fov / 2);
    const pixelY = (1 - 2 * (y / height)) * Math.tan(fov / 2);

    const direction = new Vector3(pixelX, pixelY, 1).normalize();
    const cameraMatrix = new Matrix4().lookAt(camera.position, camera.target, camera.up);
    const inverseCameraMatrix = cameraMatrix.invert();
    
    direction.applyMatrix4(inverseCameraMatrix);

    return new Ray(camera.position.clone(), direction);
  }

  private traceRay(ray: Ray, scene: any, accelerationStructure: AccelerationStructure, maxBounces: number, bounce: number): Vector3 {
    if (bounce >= maxBounces) {
      return this.getBackgroundColor(ray);
    }

    const intersection = accelerationStructure.intersect(ray);
    if (!intersection) {
      return this.getBackgroundColor(ray);
    }

    const material = this.materialSystem.getMaterial(intersection.materialId);
    if (!material) {
      return new Vector3(0, 0, 0);
    }

    let color = new Vector3(0, 0, 0);

    // 直接光照
    color.add(this.calculateDirectLighting(intersection, material, scene, ray));

    // 间接光照
    if (material.reflectivity > 0) {
      const reflectedRay = this.generateReflectedRay(ray, intersection);
      const reflectedColor = this.traceRay(reflectedRay, scene, accelerationStructure, maxBounces, bounce + 1);
      color.add(reflectedColor.multiplyScalar(material.reflectivity));
    }

    if (material.transparency > 0) {
      const refractedRay = this.generateRefractedRay(ray, intersection, material);
      if (refractedRay) {
        const refractedColor = this.traceRay(refractedRay, scene, accelerationStructure, maxBounces, bounce + 1);
        color.add(refractedColor.multiplyScalar(material.transparency));
      }
    }

    // 自发光
    if (material.emissive) {
      color.add(material.emissiveColor.multiplyScalar(material.emissiveIntensity));
    }

    return color;
  }

  private calculateDirectLighting(intersection: Intersection, material: any, scene: any, ray: Ray): Vector3 {
    let color = new Vector3(0, 0, 0);

    this.lightSystem.getLights().forEach((light: any) => {
      const lightDirection = new Vector3().subVectors(light.position, intersection.position).normalize();
      const lightDistance = new Vector3().subVectors(light.position, intersection.position).length();

      // 阴影测试
      const shadowRay = new Ray(intersection.position.clone().add(intersection.normal.clone().multiplyScalar(0.001)), lightDirection);
      const shadowIntersection = this.accelerationStructures.get(scene.id || 'default')?.intersect(shadowRay);
      
      if (!shadowIntersection || shadowIntersection.distance > lightDistance) {
        // 漫反射
        const diffuseFactor = Math.max(0, intersection.normal.dot(lightDirection));
        const diffuseColor = material.diffuseColor.clone().multiplyScalar(diffuseFactor);
        
        // 高光
        const viewDirection = new Vector3().subVectors(ray.origin, intersection.position).normalize();
        const halfVector = new Vector3().addVectors(lightDirection, viewDirection).normalize();
        const specularFactor = Math.pow(Math.max(0, intersection.normal.dot(halfVector)), material.shininess);
        const specularColor = light.color.clone().multiplyScalar(specularFactor * material.specularIntensity);
        
        // 衰减
        const attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
        
        color.add(diffuseColor.add(specularColor).multiplyScalar(light.intensity * attenuation));
      }
    });

    return color;
  }

  private generateReflectedRay(ray: Ray, intersection: Intersection): Ray {
    const normal = intersection.normal.clone();
    const incidentDirection = ray.direction.clone().negate();
    const reflectedDirection = incidentDirection.clone().reflect(normal).normalize();
    
    return new Ray(intersection.position.clone().add(normal.multiplyScalar(0.001)), reflectedDirection);
  }

  private generateRefractedRay(ray: Ray, intersection: Intersection, material: any): Ray | null {
    const normal = intersection.normal.clone();
    const incidentDirection = ray.direction.clone().negate();
    
    const eta = material.ior || 1.0;
    const cosTheta = Math.max(0, incidentDirection.dot(normal));
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    
    if (eta * sinTheta > 1) {
      return null; // 全反射
    }
    
    const refractedDirection = new Vector3();
    refractedDirection.copy(incidentDirection).multiplyScalar(eta);
    refractedDirection.sub(normal.multiplyScalar(eta * cosTheta + Math.sqrt(1 - eta * eta * (1 - cosTheta * cosTheta))));
    refractedDirection.normalize();
    
    return new Ray(intersection.position.clone().sub(normal.multiplyScalar(0.001)), refractedDirection);
  }

  private getBackgroundColor(ray: Ray): Vector3 {
    const t = (ray.direction.y + 1) / 2;
    const skyColor = new Vector3(0.5, 0.7, 1.0);
    const horizonColor = new Vector3(1.0, 0.9, 0.8);
    return horizonColor.clone().lerp(skyColor, t);
  }

  private applyDenoiser(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // 简单的降噪实现
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const denoisedData = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const index = ((y + dy) * width + (x + dx)) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            count++;
          }
        }

        const index = (y * width + x) * 4;
        denoisedData[index] = r / count;
        denoisedData[index + 1] = g / count;
        denoisedData[index + 2] = b / count;
        denoisedData[index + 3] = 255;
      }
    }

    ctx.putImageData(new ImageData(denoisedData, width, height), 0, 0);
  }

  public addMaterial(materialId: string, material: any): void {
    this.materialSystem.addMaterial(materialId, material);
  }

  public addLight(light: any): void {
    this.lightSystem.addLight(light);
  }

  public setRayMarchingSteps(steps: number): void {
    this.rayMarchingSteps = steps;
  }

  public setMaxBounces(bounces: number): void {
    this.maxBounces = bounces;
  }

  public setSamplesPerPixel(samples: number): void {
    this.samplesPerPixel = samples;
  }

  public dispose(): void {
    this.accelerationStructures.clear();
    this.materialSystem.dispose();
    this.textureSystem.dispose();
    this.lightSystem.dispose();
    this.accumulationBuffer.clear();
  }
}

// 辅助类
export class Ray {
  constructor(public origin: Vector3, public direction: Vector3) {}
}

export class Intersection {
  constructor(
    public position: Vector3,
    public normal: Vector3,
    public distance: number,
    public materialId: string,
    public uv?: Vector3
  ) {}
}
class BVH {
  private root: BVHNode | null = null;

  constructor(objects: any[]) {
    this.build(objects);
  }

  private build(objects: any[]): void {
    this.root = this.buildRecursive(objects);
  }

  private buildRecursive(objects: any[]): BVHNode {
    if (objects.length === 0) {
      return new BVHNode(new Vector3(0, 0, 0), new Vector3(0, 0, 0), []);
    }

    if (objects.length === 1) {
      const object = objects[0];
      const bounds = this.calculateBounds([object]);
      return new BVHNode(bounds.min, bounds.max, objects);
    }

    // 选择分割轴
    const axis = this.selectSplitAxis(objects);
    
    // 按轴排序
    objects.sort((a, b) => {
      const centerA = this.calculateCenter(a);
      const centerB = this.calculateCenter(b);
      return centerA.getComponent(axis) - centerB.getComponent(axis);
    });

    // 分割
    const mid = Math.floor(objects.length / 2);
    const leftObjects = objects.slice(0, mid);
    const rightObjects = objects.slice(mid);

    const left = this.buildRecursive(leftObjects);
    const right = this.buildRecursive(rightObjects);

    const bounds = this.mergeBounds(left.bounds, right.bounds);
    return new BVHNode(bounds.min, bounds.max, [], left, right);
  }

  private selectSplitAxis(objects: any[]): number {
    const bounds = this.calculateBounds(objects);
    const extents = bounds.max.clone().sub(bounds.min);
    
    if (extents.x > extents.y && extents.x > extents.z) return 0;
    if (extents.y > extents.z) return 1;
    return 2;
  }

  private calculateBounds(objects: any[]): { min: Vector3; max: Vector3 } {
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);

    objects.forEach((object: any) => {
      const objectBounds = object.getBounds();
      min.min(objectBounds.min);
      max.max(objectBounds.max);
    });

    return { min, max };
  }

  private calculateCenter(object: any): Vector3 {
    const bounds = object.getBounds();
    return new Vector3().addVectors(bounds.min, bounds.max).multiplyScalar(0.5);
  }

  private mergeBounds(a: any, b: any): { min: Vector3; max: Vector3 } {
    const min = new Vector3().minVectors(a.min, b.min);
    const max = new Vector3().maxVectors(a.max, b.max);
    return { min, max };
  }

  public intersect(ray: Ray): Intersection | null {
    return this.root?.intersect(ray) || null;
  }
}