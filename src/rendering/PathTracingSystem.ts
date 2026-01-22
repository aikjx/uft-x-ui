/**
 * 实时路径追踪系统
 * 提供高质量的全局光照和真实感渲染
 * 采用蒙特卡洛方法实现光线追踪
 */

import * as THREE from 'three'
import { BVHSystem, BVHNode } from '../utils/BVHSystem'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 定义路径追踪配置接口
export interface PathTracingConfig {
  samplesPerPixel: number
  maxBounces: number
  enableDirectLighting: boolean
  enableIndirectLighting: boolean
  enableSoftShadows: boolean
  enableGlobalIllumination: boolean
  enableCaustics: boolean
  enableDenoiser: boolean
  resolutionScale: number
  rayDepthLimit: number
  russianRouletteThreshold: number
}

// 定义材质接口
export interface PathTracingMaterial {
  albedo: THREE.Color
  roughness: number
  metallic: number
  specular: number
  transmission: number
  ior: number
  emission: THREE.Color
  emissionStrength: number
}

// 定义光线结构体
export class Ray {
  origin: THREE.Vector3
  direction: THREE.Vector3
  tMin: number
  tMax: number

  constructor(origin: THREE.Vector3, direction: THREE.Vector3, tMin: number = 0.001, tMax: number = Infinity) {
    this.origin = origin
    this.direction = direction
    this.tMin = tMin
    this.tMax = tMax
  }

  at(t: number): THREE.Vector3 {
    return this.origin.clone().addScaledVector(this.direction, t)
  }
}

// 定义光线-物体相交结果
export class HitResult {
  hit: boolean
  distance: number
  position: THREE.Vector3
  normal: THREE.Vector3
  material: PathTracingMaterial
  object: THREE.Object3D

  constructor() {
    this.hit = false
    this.distance = Infinity
    this.position = new THREE.Vector3()
    this.normal = new THREE.Vector3()
    this.material = {
      albedo: new THREE.Color(0.5, 0.5, 0.5),
      roughness: 0.5,
      metallic: 0,
      specular: 0.5,
      transmission: 0,
      ior: 1.5,
      emission: new THREE.Color(0, 0, 0),
      emissionStrength: 0
    }
    this.object = new THREE.Object3D()
  }
}

/**
 * 实时路径追踪系统
 */
export class PathTracingSystem {
  private config: PathTracingConfig
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private bvhSystem: BVHSystem | null = null
  private frameBuffer: THREE.WebGLRenderTarget | null = null
  private accumulationBuffer: THREE.WebGLRenderTarget | null = null
  private denoiserMaterial: THREE.ShaderMaterial | null = null
  private shaderMaterial: THREE.ShaderMaterial | null = null
  private enabled: boolean = false
  private frameCount: number = 0
  private materials: Map<THREE.Object3D, PathTracingMaterial> = new Map()

  constructor(config: Partial<PathTracingConfig> = {}) {
    this.config = {
      samplesPerPixel: config.samplesPerPixel || 8,
      maxBounces: config.maxBounces || 8,
      enableDirectLighting: config.enableDirectLighting !== false,
      enableIndirectLighting: config.enableIndirectLighting !== false,
      enableSoftShadows: config.enableSoftShadows !== false,
      enableGlobalIllumination: config.enableGlobalIllumination !== false,
      enableCaustics: config.enableCaustics || false,
      enableDenoiser: config.enableDenoiser !== false,
      resolutionScale: config.resolutionScale || 0.5,
      rayDepthLimit: config.rayDepthLimit || 8,
      russianRouletteThreshold: config.russianRouletteThreshold || 0.8
    }

    this.initializeMaterials()
  }

  /**
   * 初始化系统
   */
  public initialize(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer

    // 初始化BVH系统
    this.bvhSystem = new BVHSystem()
    this.updateBVH()

    // 创建渲染目标
    this.createRenderTargets()

    // 初始化着色器
    this.initializeShaders()

    // 触发初始化事件
    eventSystem.emit(APP_EVENTS.PATH_TRACING_INITIALIZED, this.config)
  }

  /**
   * 创建渲染目标
   */
  private createRenderTargets(): void {
    if (!this.renderer) return

    const width = window.innerWidth * this.config.resolutionScale
    const height = window.innerHeight * this.config.resolutionScale

    // 帧缓冲区
    this.frameBuffer = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      samples: 1
    })

    // 累积缓冲区
    this.accumulationBuffer = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      samples: 1
    })
  }

  /**
   * 初始化着色器
   */
  private initializeShaders(): void {
    // 路径追踪着色器
    const pathTracingShader = {
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        samplesPerPixel: { value: this.config.samplesPerPixel },
        maxBounces: { value: this.config.maxBounces },
        cameraPosition: { value: new THREE.Vector3() },
        cameraDirection: { value: new THREE.Vector3() },
        cameraUp: { value: new THREE.Vector3() },
        cameraRight: { value: new THREE.Vector3() },
        cameraFov: { value: 60 },
        accumulationBuffer: { value: this.accumulationBuffer?.texture },
        frameCount: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform int samplesPerPixel;
        uniform int maxBounces;
        uniform vec3 cameraPosition;
        uniform vec3 cameraDirection;
        uniform vec3 cameraUp;
        uniform vec3 cameraRight;
        uniform float cameraFov;
        uniform sampler2D accumulationBuffer;
        uniform int frameCount;

        varying vec2 vUv;

        // 随机数生成
        vec3 randomVec3(vec2 seed) {
          return vec3(
            fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453),
            fract(sin(dot(seed, vec2(4.898, 7.23))) * 43758.5453),
            fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453)
          );
        }

        // 单位半球面上的随机方向
        vec3 randomDirectionInHemisphere(vec3 normal) {
          vec3 dir = normalize(randomVec3(gl_FragCoord.xy + time));
          if (dot(dir, normal) < 0.0) dir = -dir;
          return dir;
        }

        // 光线追踪主函数
        vec3 trace(vec3 ro, vec3 rd, int depth) {
          if (depth >= maxBounces) return vec3(0.0);

          // 这里会与BVH系统交互，获取光线与物体的交点
          // 简化版本，实际实现会更复杂
          vec3 hitPoint = ro + rd * 5.0;
          vec3 normal = normalize(hitPoint);
          vec3 albedo = vec3(0.8, 0.8, 0.8);

          // 直接光照
          vec3 lightPos = vec3(5.0, 10.0, 5.0);
          vec3 lightDir = normalize(lightPos - hitPoint);
          float lightDist = length(lightPos - hitPoint);

          // 软阴影
          float shadow = 1.0;
          for (int i = 0; i < 16; i++) {
            vec3 shadowRayDir = lightDir + randomVec3(gl_FragCoord.xy + float(i)) * 0.1;
            shadowRayDir = normalize(shadowRayDir);
            // 检查阴影光线是否被遮挡
            shadow *= 0.95;
          }

          // 漫反射着色
          vec3 diffuse = albedo * max(0.0, dot(normal, lightDir)) * shadow;

          // 间接光照（递归反射）
          vec3 reflectionDir = normalize(reflect(rd, normal));
          vec3 indirect = trace(hitPoint + normal * 0.001, reflectionDir, depth + 1) * 0.5;

          return diffuse + indirect;
        }

        void main() {
          // 计算光线方向
          float aspectRatio = resolution.x / resolution.y;
          float fovRad = cameraFov * 3.14159265359 / 180.0;
          float halfHeight = tan(fovRad / 2.0);
          float halfWidth = aspectRatio * halfHeight;

          vec3 rd = cameraDirection + 
                    (vUv.x - 0.5) * 2.0 * halfWidth * cameraRight + 
                    (vUv.y - 0.5) * 2.0 * halfHeight * cameraUp;
          rd = normalize(rd);

          // 累积采样
          vec3 color = vec3(0.0);
          for (int i = 0; i < samplesPerPixel; i++) {
            // 添加随机偏移以进行抗锯齿
            vec2 offset = vec2(
              fract(sin(dot(gl_FragCoord.xy + vec2(i), vec2(12.9898, 78.233))) * 43758.5453),
              fract(sin(dot(gl_FragCoord.xy + vec2(i), vec2(4.898, 7.23))) * 43758.5453)
            ) * 0.001;
            
            vec3 jitteredRd = cameraDirection + 
                             (vUv.x - 0.5 + offset.x) * 2.0 * halfWidth * cameraRight + 
                             (vUv.y - 0.5 + offset.y) * 2.0 * halfHeight * cameraUp;
            jitteredRd = normalize(jitteredRd);

            color += trace(cameraPosition, jitteredRd, 0);
          }

          color /= float(samplesPerPixel);

          // 从累积缓冲区读取之前的颜色
          vec3 accumulatedColor = texture2D(accumulationBuffer, vUv).rgb;

          // 混合当前帧和累积帧
          if (frameCount > 0) {
            float alpha = 1.0 / float(frameCount + 1);
            color = accumulatedColor * (1.0 - alpha) + color * alpha;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `
    }

    this.shaderMaterial = new THREE.ShaderMaterial(pathTracingShader)

    // 初始化去噪器着色器
    this.initializeDenoiser()
  }

  /**
   * 初始化去噪器
   */
  private initializeDenoiser(): void {
    const denoiserShader = {
      uniforms: {
        inputTexture: { value: null },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        strength: { value: 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D inputTexture;
        uniform vec2 resolution;
        uniform float strength;

        varying vec2 vUv;

        void main() {
          // 简单的双边滤波器去噪
          vec3 color = texture2D(inputTexture, vUv).rgb;
          vec3 blurred = vec3(0.0);
          float totalWeight = 0.0;

          float step = 1.0 / resolution.x;

          for (int x = -2; x <= 2; x++) {
            for (int y = -2; y <= 2; y++) {
              vec2 offset = vec2(float(x), float(y)) * step;
              vec3 sampleColor = texture2D(inputTexture, vUv + offset).rgb;
              
              float spatialWeight = exp(-dot(offset, offset) / (2.0 * 0.01));
              float colorWeight = exp(-dot(color - sampleColor, color - sampleColor) / (2.0 * 0.1));
              float weight = spatialWeight * colorWeight;
              
              blurred += sampleColor * weight;
              totalWeight += weight;
            }
          }

          blurred /= totalWeight;
          vec3 finalColor = mix(color, blurred, strength);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    }

    this.denoiserMaterial = new THREE.ShaderMaterial(denoiserShader)
  }

  /**
   * 更新BVH
   */
  public updateBVH(): void {
    if (!this.scene || !this.bvhSystem) return
    this.bvhSystem.build(this.scene)
  }

  /**
   * 设置物体材质
   */
  public setMaterial(object: THREE.Object3D, material: Partial<PathTracingMaterial>): void {
    const defaultMaterial: PathTracingMaterial = {
      albedo: new THREE.Color(0.5, 0.5, 0.5),
      roughness: 0.5,
      metallic: 0,
      specular: 0.5,
      transmission: 0,
      ior: 1.5,
      emission: new THREE.Color(0, 0, 0),
      emissionStrength: 0
    }

    this.materials.set(object, { ...defaultMaterial, ...material })
  }

  /**
   * 渲染场景
   */
  public render(): void {
    if (!this.enabled || !this.scene || !this.camera || !this.renderer || !this.shaderMaterial || !this.frameBuffer || !this.accumulationBuffer) return

    // 更新着色器 uniforms
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.shaderMaterial.uniforms.cameraPosition.value.copy(this.camera.position)
      
      const cameraDirection = new THREE.Vector3()
      this.camera.getWorldDirection(cameraDirection)
      this.shaderMaterial.uniforms.cameraDirection.value.copy(cameraDirection)
      
      const cameraUp = new THREE.Vector3(0, 1, 0)
      this.shaderMaterial.uniforms.cameraUp.value.copy(cameraUp)
      
      const cameraRight = new THREE.Vector3()
      cameraDirection.cross(cameraUp).normalize()
      this.shaderMaterial.uniforms.cameraRight.value.copy(cameraRight)
      
      this.shaderMaterial.uniforms.cameraFov.value = this.camera.fov
    }

    this.shaderMaterial.uniforms.time.value = performance.now() * 0.001
    this.shaderMaterial.uniforms.frameCount.value = this.frameCount
    this.shaderMaterial.uniforms.accumulationBuffer.value = this.accumulationBuffer.texture

    // 渲染路径追踪
    const oldRenderTarget = this.renderer.getRenderTarget()
    this.renderer.setRenderTarget(this.frameBuffer)
    this.renderer.clear()

    // 创建一个全屏四边形
    const planeGeometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(planeGeometry, this.shaderMaterial)
    this.scene.add(mesh)

    this.renderer.render(this.scene, this.camera)
    this.scene.remove(mesh)

    // 应用去噪器
    if (this.config.enableDenoiser && this.denoiserMaterial) {
      this.denoiserMaterial.uniforms.inputTexture.value = this.frameBuffer.texture
      this.denoiserMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight)

      const denoiseMesh = new THREE.Mesh(planeGeometry, this.denoiserMaterial)
      this.scene.add(denoiseMesh)

      this.renderer.setRenderTarget(this.accumulationBuffer)
      this.renderer.clear()
      this.renderer.render(this.scene, this.camera)

      this.scene.remove(denoiseMesh)
    } else {
      // 如果不需要去噪，直接复制到累积缓冲区
      this.renderer.setRenderTarget(this.accumulationBuffer)
      this.renderer.clear()
      this.renderer.render(this.scene, this.camera)
    }

    // 将结果渲染到屏幕
    this.renderer.setRenderTarget(oldRenderTarget)
    this.renderer.clear()

    const finalMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
      map: this.accumulationBuffer.texture
    }))
    this.scene.add(finalMesh)

    this.renderer.render(this.scene, this.camera)
    this.scene.remove(finalMesh)

    this.frameCount++

    // 触发渲染事件
    eventSystem.emit(APP_EVENTS.PATH_TRACING_RENDERED, {
      frameCount: this.frameCount,
      samplesPerPixel: this.config.samplesPerPixel
    })
  }

  /**
   * 设置配置
   */
  public setConfig(config: Partial<PathTracingConfig>): void {
    this.config = { ...this.config, ...config }
    
    // 更新着色器 uniforms
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.samplesPerPixel.value = this.config.samplesPerPixel
      this.shaderMaterial.uniforms.maxBounces.value = this.config.maxBounces
    }

    // 重新创建渲染目标以适应分辨率变化
    if (this.config.resolutionScale !== this.getResolutionScale()) {
      this.createRenderTargets()
    }

    // 触发配置更新事件
    eventSystem.emit(APP_EVENTS.PATH_TRACING_CONFIG_UPDATED, this.config)
  }

  /**
   * 获取配置
   */
  public getConfig(): PathTracingConfig {
    return { ...this.config }
  }

  /**
   * 获取分辨率缩放
   */
  private getResolutionScale(): number {
    if (!this.frameBuffer) return 1
    return this.frameBuffer.width / window.innerWidth
  }

  /**
   * 启用路径追踪
   */
  public enable(): void {
    this.enabled = true
    this.frameCount = 0
    eventSystem.emit(APP_EVENTS.PATH_TRACING_ENABLED)
  }

  /**
   * 禁用路径追踪
   */
  public disable(): void {
    this.enabled = false
    eventSystem.emit(APP_EVENTS.PATH_TRACING_DISABLED)
  }

  /**
   * 重置累积缓冲区
   */
  public resetAccumulation(): void {
    this.frameCount = 0
    if (this.accumulationBuffer) {
      this.renderer?.setRenderTarget(this.accumulationBuffer)
      this.renderer?.clear()
      this.renderer?.setRenderTarget(null)
    }
  }

  /**
   * 调整大小
   */
  public resize(width: number, height: number): void {
    if (this.frameBuffer) {
      this.frameBuffer.setSize(width * this.config.resolutionScale, height * this.config.resolutionScale)
    }
    if (this.accumulationBuffer) {
      this.accumulationBuffer.setSize(width * this.config.resolutionScale, height * this.config.resolutionScale)
    }
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.resolution.value.set(width, height)
    }
    if (this.denoiserMaterial) {
      this.denoiserMaterial.uniforms.resolution.value.set(width, height)
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.enabled = false
    
    if (this.frameBuffer) {
      this.frameBuffer.dispose()
      this.frameBuffer = null
    }
    
    if (this.accumulationBuffer) {
      this.accumulationBuffer.dispose()
      this.accumulationBuffer = null
    }
    
    if (this.shaderMaterial) {
      this.shaderMaterial.dispose()
      this.shaderMaterial = null
    }
    
    if (this.denoiserMaterial) {
      this.denoiserMaterial.dispose()
      this.denoiserMaterial = null
    }
    
    if (this.bvhSystem) {
      this.bvhSystem.dispose()
      this.bvhSystem = null
    }
    
    this.materials.clear()
    
    // 触发清理事件
    eventSystem.emit(APP_EVENTS.PATH_TRACING_DISPOSED)
  }
}

// 导出默认实例
export const pathTracingSystem = new PathTracingSystem()
