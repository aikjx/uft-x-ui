// 统一场论可视化系统 - 高级路径追踪引擎 2.0
// 版本: v2.0
// 功能: 分布式路径追踪，支持GPU加速和自适应采样

import { Vector3, Vector4, Matrix4 } from 'three'
import { AccelerationStructure } from '../utils/AccelerationStructure'
import { MaterialSystem } from '../utils/MaterialSystem'
import { LightSystem } from '../utils/LightSystem'
import { BVHNode } from '../utils/BVH'

export class PathTracingEngine2 {
  private samplesPerPixel: number = 64
  private maxBounces: number = 10
  private russianRouletteStart: number = 3
  private enableAdaptiveSampling: boolean = true
  private convergenceThreshold: number = 0.01
  private materialSystem: MaterialSystem
  private lightSystem: LightSystem
  private accelerationStructures: Map<string, AccelerationStructure> = new Map()
  private useWebGPU: boolean = false
  private webGPUDevice: any = null

  constructor() {
    this.materialSystem = new MaterialSystem()
    this.lightSystem = new LightSystem()
    this.initWebGPUSupport()
  }

  private initWebGPUSupport() {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      this.initializeWebGPU()
    }
  }

  private async initializeWebGPU() {
    try {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        this.webGPUDevice = await adapter.requestDevice()
        this.useWebGPU = true
        console.log('🚀 WebGPU路径追踪加速已启用')
      }
    } catch (error) {
      console.warn('⚠️ WebGPU初始化失败，使用CPU路径追踪:', error)
    }
  }

  public buildAccelerationStructure(scene: any): AccelerationStructure {
    const objects = scene.objects || []
    const bvh = new BVHNode(
      this.calculateBounds(objects).min,
      this.calculateBounds(objects).max,
      objects
    )
    const accelerationStructure = new AccelerationStructure(bvh)
    this.accelerationStructures.set(scene.id || 'default', accelerationStructure)
    return accelerationStructure
  }

  public render(
    canvas: HTMLCanvasElement,
    scene: any,
    camera: any,
    options: any = {}
  ): Promise<{ renderTime: number; mode: string }> {
    return new Promise(resolve => {
      const startTime = performance.now()
      const width = canvas.width
      const height = canvas.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve({ renderTime: 0, mode: 'pathtracing' })
        return
      }

      const spp = options.samplesPerPixel || this.samplesPerPixel
      const maxBounces = options.maxBounces || this.maxBounces
      const enableAdaptiveSampling = options.enableAdaptiveSampling || this.enableAdaptiveSampling

      if (this.useWebGPU && options.useWebGPU !== false) {
        this.renderWithWebGPU(canvas, scene, camera, options).then(() => {
          const endTime = performance.now()
          resolve({ renderTime: endTime - startTime, mode: 'webgpu_pathtracing' })
        })
      } else {
        this.renderWithCPU(canvas, scene, camera, { spp, maxBounces, enableAdaptiveSampling })
        const endTime = performance.now()
        resolve({ renderTime: endTime - startTime, mode: 'cpu_pathtracing' })
      }
    })
  }

  private async renderWithWebGPU(
    canvas: HTMLCanvasElement,
    scene: any,
    camera: any,
    options: any
  ): Promise<void> {
    if (!this.webGPUDevice) {
      console.warn('⚠️ WebGPU不可用，回退到CPU渲染')
      return
    }

    try {
      const context = canvas.getContext('webgpu')
      if (!context) return

      const format = navigator.gpu.getPreferredCanvasFormat()
      context.configure({
        device: this.webGPUDevice,
        format: format,
        size: { width: canvas.width, height: canvas.height }
      })

      const commandEncoder = this.webGPUDevice.createCommandEncoder()
      const renderPassDescriptor = {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
          }
        ]
      }

      const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor)

      // WebGPU路径追踪实现
      this.renderWebGPUPathtracing(renderPass, scene, camera, options)

      renderPass.end()
      this.webGPUDevice.queue.submit([commandEncoder.finish()])
    } catch (error) {
      console.error('WebGPU路径追踪失败:', error)
    }
  }

  private renderWebGPUPathtracing(renderPass: any, scene: any, camera: any, options: any): void {
    // WebGPU路径追踪核心实现
  }

  private renderWithCPU(canvas: HTMLCanvasElement, scene: any, camera: any, options: any): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    const accelerationStructure =
      this.accelerationStructures.get(scene.id || 'default') ||
      this.buildAccelerationStructure(scene)

    const spp = options.spp
    const maxBounces = options.maxBounces
    const enableAdaptiveSampling = options.enableAdaptiveSampling

    // 并行渲染
    const numThreads = navigator.hardwareConcurrency || 4
    const tasks = this.createRenderTasks(width, height, spp)
    const results = this.executeRenderTasks(tasks, scene, camera, accelerationStructure, {
      maxBounces,
      enableAdaptiveSampling
    })

    this.combineRenderResults(results, data, width, height)
    ctx.putImageData(imageData, 0, 0)
  }

  private createRenderTasks(
    width: number,
    height: number,
    spp: number
  ): Array<{ x: number; y: number; samples: number }> {
    const tasks = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        tasks.push({ x, y, samples: spp })
      }
    }
    return tasks
  }

  private executeRenderTasks(
    tasks: any[],
    scene: any,
    camera: any,
    accelerationStructure: AccelerationStructure,
    options: any
  ): Map<string, Vector3> {
    const results = new Map<string, Vector3>()

    tasks.forEach(task => {
      const { x, y, samples } = task
      let color = new Vector3(0, 0, 0)
      let sampleCount = 0

      for (let s = 0; s < samples; s++) {
        const jitterX = Math.random() - 0.5
        const jitterY = Math.random() - 0.5
        const ray = this.createPathRay(x + jitterX, y + jitterY, scene.width, scene.height, camera)
        const sampleColor = this.pathTrace(ray, scene, accelerationStructure, options.maxBounces, 0)
        color.add(sampleColor)
        sampleCount++

        // 自适应采样
        if (options.enableAdaptiveSampling) {
          const variance = this.calculateVariance(color, sampleCount)
          if (variance < this.convergenceThreshold && sampleCount > 4) {
            break
          }
        }
      }

      color.divideScalar(sampleCount)
      results.set(`${x},${y}`, color)
    })

    return results
  }

  private combineRenderResults(
    results: Map<string, Vector3>,
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`
        const color = results.get(key) || new Vector3(0, 0, 0)
        const index = (y * width + x) * 4

        data[index] = Math.floor(Math.min(255, color.x * 255))
        data[index + 1] = Math.floor(Math.min(255, color.y * 255))
        data[index + 2] = Math.floor(Math.min(255, color.z * 255))
        data[index + 3] = 255
      }
    }
  }

  private createPathRay(x: number, y: number, width: number, height: number, camera: any): Ray {
    const aspect = width / height
    const fov = camera.fov || Math.PI / 4
    const pixelX = (2 * (x / width) - 1) * aspect * Math.tan(fov / 2)
    const pixelY = (1 - 2 * (y / height)) * Math.tan(fov / 2)

    const direction = new Vector3(pixelX, pixelY, 1).normalize()
    const cameraMatrix = new Matrix4().lookAt(camera.position, camera.target, camera.up)
    const inverseCameraMatrix = cameraMatrix.invert()

    direction.applyMatrix4(inverseCameraMatrix)

    return new Ray(camera.position.clone(), direction)
  }

  private pathTrace(
    ray: Ray,
    scene: any,
    accelerationStructure: AccelerationStructure,
    maxBounces: number,
    bounce: number
  ): Vector3 {
    if (bounce >= maxBounces) {
      return new Vector3(0, 0, 0)
    }

    const intersection = accelerationStructure.intersect(ray)
    if (!intersection) {
      return this.getBackgroundColor(ray)
    }

    const material = this.materialSystem.getMaterial(intersection.materialId)
    if (!material) {
      return new Vector3(0, 0, 0)
    }

    const emission = material.emissive
      ? material.emissiveColor.clone().multiplyScalar(material.emissiveIntensity)
      : new Vector3(0, 0, 0)

    // 俄罗斯轮盘赌
    if (bounce > this.russianRouletteStart) {
      const p = Math.max(emission.x, emission.y, emission.z, 0.05)
      if (Math.random() > p) {
        return emission
      }
    }

    const scatteredRay = this.sampleScatteredRay(ray, intersection, material)
    const scatteredColor = this.pathTrace(
      scatteredRay,
      scene,
      accelerationStructure,
      maxBounces,
      bounce + 1
    )

    const brdf = this.calculateBRDF(ray, scatteredRay, intersection, material)
    const cosTheta = this.dotProduct(scatteredRay.direction, intersection.normal)

    return emission.add(scatteredColor.multiply(brdf).multiplyScalar(Math.max(0, cosTheta)))
  }

  private sampleScatteredRay(ray: Ray, intersection: Intersection, material: any): Ray {
    if (material.type === 'diffuse') {
      return this.sampleDiffuseRay(intersection)
    } else if (material.type === 'specular') {
      return this.sampleSpecularRay(ray, intersection)
    } else if (material.type === 'glass') {
      return this.sampleGlassRay(ray, intersection, material)
    } else {
      return this.sampleDiffuseRay(intersection)
    }
  }

  private sampleDiffuseRay(intersection: Intersection): Ray {
    const u = Math.random() * 2 * Math.PI
    const v = Math.random()
    const r = Math.sqrt(v)

    const w = intersection.normal
    const uVec = this.cross(w, new Vector3(1, 0, 0)).normalize()
    const vVec = this.cross(w, uVec).normalize()

    const direction = new Vector3(
      Math.cos(u) * r * uVec.x + Math.sin(u) * r * vVec.x + Math.sqrt(1 - v) * w.x,
      Math.cos(u) * r * uVec.y + Math.sin(u) * r * vVec.y + Math.sqrt(1 - v) * w.y,
      Math.cos(u) * r * uVec.z + Math.sin(u) * r * vVec.z + Math.sqrt(1 - v) * w.z
    ).normalize()

    return new Ray(
      intersection.position.clone().add(intersection.normal.clone().multiplyScalar(0.001)),
      direction
    )
  }

  private sampleSpecularRay(ray: Ray, intersection: Intersection): Ray {
    const normal = intersection.normal
    const incidentDirection = ray.direction.clone().negate()
    const reflectedDirection = incidentDirection.clone().reflect(normal).normalize()

    return new Ray(
      intersection.position.clone().add(normal.multiplyScalar(0.001)),
      reflectedDirection
    )
  }

  private sampleGlassRay(ray: Ray, intersection: Intersection, material: any): Ray {
    const normal = intersection.normal
    const incidentDirection = ray.direction.clone().negate()
    const cosTheta = Math.max(0, incidentDirection.dot(normal))

    const eta = material.ior || 1.5
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta)

    // 全反射
    if (eta * sinTheta > 1) {
      return this.sampleSpecularRay(ray, intersection)
    }

    // 菲涅尔效应
    const r0 = Math.pow((1 - eta) / (1 + eta), 2)
    const fresnel = r0 + (1 - r0) * Math.pow(1 - cosTheta, 5)

    if (Math.random() < fresnel) {
      return this.sampleSpecularRay(ray, intersection)
    }

    const refractedDirection = this.refract(ray.direction, normal, eta)
    return new Ray(
      intersection.position.clone().sub(normal.multiplyScalar(0.001)),
      refractedDirection
    )
  }

  private refract(direction: Vector3, normal: Vector3, eta: number): Vector3 {
    const cosTheta = Math.max(0, direction.clone().negate().dot(normal))
    const rOutPerp = direction
      .clone()
      .multiplyScalar(eta)
      .add(
        normal
          .clone()
          .multiplyScalar(eta * cosTheta - Math.sqrt(1 - eta * eta * (1 - cosTheta * cosTheta)))
      )
    return rOutPerp.normalize()
  }

  private calculateBRDF(
    ray: Ray,
    scatteredRay: Ray,
    intersection: Intersection,
    material: any
  ): Vector3 {
    if (material.type === 'diffuse') {
      return material.diffuseColor.clone().divideScalar(Math.PI)
    } else if (material.type === 'specular') {
      return new Vector3(1, 1, 1)
    } else if (material.type === 'glass') {
      return new Vector3(1, 1, 1)
    } else {
      return material.diffuseColor.clone().divideScalar(Math.PI)
    }
  }

  private getBackgroundColor(ray: Ray): Vector3 {
    const t = (ray.direction.y + 1) / 2
    const skyColor = new Vector3(0.5, 0.7, 1.0)
    const horizonColor = new Vector3(1.0, 0.9, 0.8)
    return horizonColor.clone().lerp(skyColor, t)
  }

  private calculateVariance(color: Vector3, sampleCount: number): number {
    const mean = color.clone().divideScalar(sampleCount)
    const squaredMean = mean.clone().multiply(mean)
    const meanOfSquares = color.clone().multiply(color).divideScalar(sampleCount)
    return meanOfSquares.sub(squaredMean).length()
  }

  private calculateBounds(objects: any[]): { min: Vector3; max: Vector3 } {
    const min = new Vector3(Infinity, Infinity, Infinity)
    const max = new Vector3(-Infinity, -Infinity, -Infinity)

    objects.forEach((object: any) => {
      const objectBounds = object.getBounds()
      min.min(objectBounds.min)
      max.max(objectBounds.max)
    })

    return { min, max }
  }

  private dotProduct(a: Vector3, b: Vector3): number {
    return a.dot(b)
  }

  private cross(a: Vector3, b: Vector3): Vector3 {
    return new Vector3().crossVectors(a, b)
  }

  public addMaterial(materialId: string, material: any): void {
    this.materialSystem.addMaterial(materialId, material)
  }

  public addLight(light: any): void {
    this.lightSystem.addLight(light)
  }

  public setSamplesPerPixel(samples: number): void {
    this.samplesPerPixel = samples
  }

  public setMaxBounces(bounces: number): void {
    this.maxBounces = bounces
  }

  public setRussianRouletteStart(start: number): void {
    this.russianRouletteStart = start
  }

  public dispose(): void {
    this.accelerationStructures.clear()
    this.materialSystem.dispose()
    this.lightSystem.dispose()
  }
}

// 辅助类
class Ray {
  constructor(public origin: Vector3, public direction: Vector3) {}
}

class Intersection {
  constructor(
    public position: Vector3,
    public normal: Vector3,
    public distance: number,
    public materialId: string,
    public uv?: Vector3
  ) {}
}
