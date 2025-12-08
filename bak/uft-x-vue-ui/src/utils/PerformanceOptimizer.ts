/**
 * 性能优化工具
 * Performance Optimization Utilities
 */

import * as THREE from 'three'

/**
 * 性能级别
 */
export enum PerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * 设备性能检测
 */
export class DevicePerformanceDetector {
  private static instance: DevicePerformanceDetector
  private performanceLevel: PerformanceLevel = PerformanceLevel.MEDIUM
  private gpuTier: number = 2

  private constructor() {
    this.detectPerformance()
  }

  public static getInstance(): DevicePerformanceDetector {
    if (!DevicePerformanceDetector.instance) {
      DevicePerformanceDetector.instance = new DevicePerformanceDetector()
    }
    return DevicePerformanceDetector.instance
  }

  /**
   * 检测设备性能
   */
  private detectPerformance(): void {
    // 检测GPU
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

    if (!gl) {
      this.performanceLevel = PerformanceLevel.LOW
      this.gpuTier = 1
      return
    }

    // 获取GPU信息
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    let renderer = 'Unknown'

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    }

    // 检测内存
    const memory = (navigator as any).deviceMemory || 4

    // 检测CPU核心数
    const cores = navigator.hardwareConcurrency || 4

    // 综合评分
    let score = 0

    // GPU评分
    if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Radeon')) {
      score += 3
    } else if (renderer.includes('Intel')) {
      score += 1
    }

    // 内存评分
    if (memory >= 8) score += 2
    else if (memory >= 4) score += 1

    // CPU评分
    if (cores >= 8) score += 2
    else if (cores >= 4) score += 1

    // 确定性能级别
    if (score >= 7) {
      this.performanceLevel = PerformanceLevel.ULTRA
      this.gpuTier = 3
    } else if (score >= 5) {
      this.performanceLevel = PerformanceLevel.HIGH
      this.gpuTier = 3
    } else if (score >= 3) {
      this.performanceLevel = PerformanceLevel.MEDIUM
      this.gpuTier = 2
    } else {
      this.performanceLevel = PerformanceLevel.LOW
      this.gpuTier = 1
    }

    console.log(`🎮 设备性能检测: ${this.performanceLevel} (GPU Tier: ${this.gpuTier})`)
    console.log(`   GPU: ${renderer}`)
    console.log(`   内存: ${memory}GB`)
    console.log(`   CPU核心: ${cores}`)
  }

  /**
   * 获取性能级别
   */
  public getPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel
  }

  /**
   * 获取GPU层级
   */
  public getGPUTier(): number {
    return this.gpuTier
  }

  /**
   * 获取推荐配置
   */
  public getRecommendedConfig() {
    switch (this.performanceLevel) {
      case PerformanceLevel.ULTRA:
        return {
          particleCount: 500000,
          fieldResolution: 128,
          shadowQuality: 'high',
          antialiasing: true,
          postProcessing: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          maxLights: 8
        }
      case PerformanceLevel.HIGH:
        return {
          particleCount: 200000,
          fieldResolution: 64,
          shadowQuality: 'medium',
          antialiasing: true,
          postProcessing: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          maxLights: 6
        }
      case PerformanceLevel.MEDIUM:
        return {
          particleCount: 50000,
          fieldResolution: 32,
          shadowQuality: 'low',
          antialiasing: true,
          postProcessing: false,
          pixelRatio: 1,
          maxLights: 4
        }
      case PerformanceLevel.LOW:
        return {
          particleCount: 10000,
          fieldResolution: 16,
          shadowQuality: 'none',
          antialiasing: false,
          postProcessing: false,
          pixelRatio: 1,
          maxLights: 2
        }
    }
  }
}

/**
 * 几何体优化器
 */
export class GeometryOptimizer {
  /**
   * 合并几何体
   */
  public static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    return THREE.BufferGeometryUtils.mergeGeometries(geometries)
  }

  /**
   * 简化几何体
   */
  public static simplifyGeometry(
    geometry: THREE.BufferGeometry,
    targetRatio: number = 0.5
  ): THREE.BufferGeometry {
    // 简化算法（这里使用基础实现）
    const positions = geometry.attributes.position.array
    const simplified = new Float32Array(Math.floor(positions.length * targetRatio))

    for (let i = 0; i < simplified.length; i++) {
      simplified[i] = positions[Math.floor(i / targetRatio)]
    }

    const newGeometry = new THREE.BufferGeometry()
    newGeometry.setAttribute('position', new THREE.BufferAttribute(simplified, 3))

    return newGeometry
  }

  /**
   * 计算LOD级别
   */
  public static createLODLevels(
    geometry: THREE.BufferGeometry,
    levels: number = 3
  ): THREE.BufferGeometry[] {
    const lods: THREE.BufferGeometry[] = [geometry]

    for (let i = 1; i < levels; i++) {
      const ratio = 1 - (i / levels) * 0.7
      lods.push(this.simplifyGeometry(geometry, ratio))
    }

    return lods
  }
}

/**
 * 纹理优化器
 */
export class TextureOptimizer {
  /**
   * 压缩纹理
   */
  public static compressTexture(
    texture: THREE.Texture,
    maxSize: number = 2048
  ): THREE.Texture {
    const image = texture.image

    if (!image || (image.width <= maxSize && image.height <= maxSize)) {
      return texture
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return texture

    const scale = Math.min(maxSize / image.width, maxSize / image.height)
    canvas.width = image.width * scale
    canvas.height = image.height * scale

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const newTexture = new THREE.Texture(canvas)
    newTexture.needsUpdate = true

    return newTexture
  }

  /**
   * 生成Mipmap
   */
  public static generateMipmaps(texture: THREE.Texture): void {
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  private static disposedObjects = new Set<any>()

  /**
   * 释放几何体
   */
  public static disposeGeometry(geometry: THREE.BufferGeometry): void {
    if (this.disposedObjects.has(geometry)) return

    geometry.dispose()
    this.disposedObjects.add(geometry)
  }

  /**
   * 释放材质
   */
  public static disposeMaterial(material: THREE.Material | THREE.Material[]): void {
    const materials = Array.isArray(material) ? material : [material]

    materials.forEach(mat => {
      if (this.disposedObjects.has(mat)) return

      // 释放纹理
      Object.keys(mat).forEach(key => {
        const value = (mat as any)[key]
        if (value && value.isTexture) {
          value.dispose()
        }
      })

      mat.dispose()
      this.disposedObjects.add(mat)
    })
  }

  /**
   * 释放网格
   */
  public static disposeMesh(mesh: THREE.Mesh): void {
    this.disposeGeometry(mesh.geometry)
    this.disposeMaterial(mesh.material)
  }

  /**
   * 释放场景中的所有对象
   */
  public static disposeScene(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        this.disposeMesh(object)
      }
    })
  }

  /**
   * 清理缓存
   */
  public static clearCache(): void {
    this.disposedObjects.clear()
  }
}

/**
 * 帧率监控器
 */
export class FPSMonitor {
  private frames: number[] = []
  private lastTime: number = performance.now()
  private fps: number = 60

  /**
   * 更新帧率
   */
  public update(): number {
    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now

    this.frames.push(1000 / delta)

    if (this.frames.length > 60) {
      this.frames.shift()
    }

    this.fps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length

    return this.fps
  }

  /**
   * 获取当前FPS
   */
  public getFPS(): number {
    return Math.round(this.fps)
  }

  /**
   * 是否需要降级
   */
  public shouldDowngrade(): boolean {
    return this.fps < 30
  }

  /**
   * 是否可以升级
   */
  public shouldUpgrade(): boolean {
    return this.fps > 55
  }
}

/**
 * 自适应质量管理器
 */
export class AdaptiveQualityManager {
  private fpsMonitor = new FPSMonitor()
  private currentQuality: PerformanceLevel
  private adjustmentCooldown = 0
  private readonly COOLDOWN_FRAMES = 120 // 2秒

  constructor(initialQuality: PerformanceLevel) {
    this.currentQuality = initialQuality
  }

  /**
   * 更新并调整质量
   */
  public update(): { quality: PerformanceLevel; changed: boolean } {
    const fps = this.fpsMonitor.update()

    if (this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--
      return { quality: this.currentQuality, changed: false }
    }

    let changed = false

    // 性能不足，降级
    if (this.fpsMonitor.shouldDowngrade()) {
      if (this.currentQuality === PerformanceLevel.ULTRA) {
        this.currentQuality = PerformanceLevel.HIGH
        changed = true
      } else if (this.currentQuality === PerformanceLevel.HIGH) {
        this.currentQuality = PerformanceLevel.MEDIUM
        changed = true
      } else if (this.currentQuality === PerformanceLevel.MEDIUM) {
        this.currentQuality = PerformanceLevel.LOW
        changed = true
      }

      if (changed) {
        console.log(`⬇️ 性能降级至: ${this.currentQuality} (FPS: ${fps.toFixed(1)})`)
        this.adjustmentCooldown = this.COOLDOWN_FRAMES
      }
    }
    // 性能充足，升级
    else if (this.fpsMonitor.shouldUpgrade()) {
      if (this.currentQuality === PerformanceLevel.LOW) {
        this.currentQuality = PerformanceLevel.MEDIUM
        changed = true
      } else if (this.currentQuality === PerformanceLevel.MEDIUM) {
        this.currentQuality = PerformanceLevel.HIGH
        changed = true
      } else if (this.currentQuality === PerformanceLevel.HIGH) {
        this.currentQuality = PerformanceLevel.ULTRA
        changed = true
      }

      if (changed) {
        console.log(`⬆️ 性能升级至: ${this.currentQuality} (FPS: ${fps.toFixed(1)})`)
        this.adjustmentCooldown = this.COOLDOWN_FRAMES
      }
    }

    return { quality: this.currentQuality, changed }
  }

  /**
   * 获取当前FPS
   */
  public getFPS(): number {
    return this.fpsMonitor.getFPS()
  }

  /**
   * 获取当前质量
   */
  public getCurrentQuality(): PerformanceLevel {
    return this.currentQuality
  }
}

/**
 * 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory
    this.reset = reset

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  /**
   * 获取对象
   */
  public acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  /**
   * 归还对象
   */
  public release(obj: T): void {
    this.reset(obj)
    this.pool.push(obj)
  }

  /**
   * 清空池
   */
  public clear(): void {
    this.pool = []
  }

  /**
   * 获取池大小
   */
  public size(): number {
    return this.pool.length
  }
}
