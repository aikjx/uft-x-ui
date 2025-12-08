/**
 * 量子级3D渲染引擎
 * Quantum-Level 3D Rendering Engine
 */

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import {
  VisualizationConfig,
  FieldData,
  ParticleSystemData,
  PerformanceMetrics
} from '@/types/unified-field-theory'

/**
 * 量子渲染器核心类
 */
export class QuantumRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private composer?: EffectComposer
  private animationId?: number
  private clock: THREE.Clock
  private stats: PerformanceMetrics

  // 粒子系统
  private particleSystems: Map<string, THREE.Points> = new Map()

  // 场可视化
  private fieldMeshes: Map<string, THREE.Mesh> = new Map()

  // 后处理效果
  private bloomPass?: UnrealBloomPass

  constructor(private container: HTMLElement) {
    this.clock = new THREE.Clock()
    this.stats = this.initStats()

    // 初始化场景
    this.scene = this.createScene()
    this.camera = this.createCamera()
    this.renderer = this.createRenderer()

    // 设置后处理
    this.setupPostProcessing()

    // 添加基础光照
    this.setupLighting()

    // 启动渲染循环
    this.animate()
  }

  /**
   * 创建场景
   */
  private createScene(): THREE.Scene {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x000000, 0.002)

    return scene
  }

  /**
   * 创建相机
   */
  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      10000
    )
    camera.position.set(0, 0, 50)
    return camera
  }

  /**
   * 创建渲染器
   */
  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })

    renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    this.container.appendChild(renderer.domElement)

    return renderer
  }

  /**
   * 设置后处理效果
   */
  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer)

    // 渲染通道
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    // 辉光效果
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      1.5,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    )
    this.composer.addPass(this.bloomPass)
  }

  /**
   * 设置光照
   */
  private setupLighting(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    this.scene.add(ambientLight)

    // 点光源
    const pointLight = new THREE.PointLight(0x00d4ff, 1, 100)
    pointLight.position.set(10, 10, 10)
    this.scene.add(pointLight)

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(-5, 5, 5)
    this.scene.add(directionalLight)
  }

  /**
   * 创建粒子系统
   */
  public createParticleSystem(
    id: string,
    data: ParticleSystemData,
    config: VisualizationConfig
  ): void {
    const geometry = new THREE.BufferGeometry()

    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1))

    // 自定义粒子材质
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })

    const particles = new THREE.Points(geometry, material)
    this.particleSystems.set(id, particles)
    this.scene.add(particles)
  }

  /**
   * 更新粒子系统
   */
  public updateParticleSystem(id: string, data: Partial<ParticleSystemData>): void {
    const system = this.particleSystems.get(id)
    if (!system) return

    const geometry = system.geometry as THREE.BufferGeometry

    if (data.positions) {
      geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    }
    if (data.colors) {
      geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
    }
    if (data.sizes) {
      geometry.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1))
    }

    geometry.attributes.position.needsUpdate = true
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true
    if (geometry.attributes.size) geometry.attributes.size.needsUpdate = true
  }

  /**
   * 可视化场数据
   */
  public visualizeField(id: string, fieldData: FieldData, config: VisualizationConfig): void {
    // 移除旧的场网格
    const oldMesh = this.fieldMeshes.get(id)
    if (oldMesh) {
      this.scene.remove(oldMesh)
      oldMesh.geometry.dispose()
      if (Array.isArray(oldMesh.material)) {
        oldMesh.material.forEach(m => m.dispose())
      } else {
        oldMesh.material.dispose()
      }
    }

    // 创建场线可视化
    const fieldLines = this.createFieldLines(fieldData, config)
    this.fieldMeshes.set(id, fieldLines)
    this.scene.add(fieldLines)
  }

  /**
   * 创建场线
   */
  private createFieldLines(fieldData: FieldData, config: VisualizationConfig): THREE.Mesh {
    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []

    // 根据场类型选择颜色
    const color = new THREE.Color(
      config.colorScheme?.fieldColors?.[fieldData.type] || '#00d4ff'
    )

    // 生成场线
    for (let i = 0; i < fieldData.points.length; i++) {
      const point = fieldData.points[i]
      const vector = fieldData.vectors?.[i]

      if (vector && vector.length() > 0.01) {
        positions.push(point.x, point.y, point.z)
        const endPoint = point.clone().add(vector.clone().normalize().multiplyScalar(0.5))
        positions.push(endPoint.x, endPoint.y, endPoint.z)

        // 根据强度调整颜色
        const intensity = fieldData.intensity[i]
        const normalizedIntensity = Math.min(Math.abs(intensity) * 10, 1)
        colors.push(color.r * normalizedIntensity, color.g * normalizedIntensity, color.b * normalizedIntensity)
        colors.push(color.r * normalizedIntensity, color.g * normalizedIntensity, color.b * normalizedIntensity)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6
    })

    return new THREE.LineSegments(geometry, material)
  }

  /**
   * 添加网格对象
   */
  public addMesh(id: string, mesh: THREE.Mesh): void {
    this.scene.add(mesh)
    this.fieldMeshes.set(id, mesh)
  }

  /**
   * 移除对象
   */
  public remove(id: string): void {
    const particle = this.particleSystems.get(id)
    if (particle) {
      this.scene.remove(particle)
      particle.geometry.dispose()
      if (Array.isArray(particle.material)) {
        particle.material.forEach(m => m.dispose())
      } else {
        particle.material.dispose()
      }
      this.particleSystems.delete(id)
    }

    const mesh = this.fieldMeshes.get(id)
    if (mesh) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material.dispose()
      }
      this.fieldMeshes.delete(id)
    }
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()

    // 更新粒子系统动画
    this.particleSystems.forEach((system) => {
      system.rotation.y += delta * 0.1
    })

    // 更新场可视化动画
    this.fieldMeshes.forEach((mesh) => {
      if (mesh.material && 'opacity' in mesh.material) {
        const material = mesh.material as THREE.Material & { opacity: number }
        material.opacity = 0.6 + Math.sin(elapsed * 2) * 0.2
      }
    })

    // 渲染
    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }

    // 更新性能统计
    this.updateStats()
  }

  /**
   * 初始化性能统计
   */
  private initStats(): PerformanceMetrics {
    return {
      fps: 60,
      drawCalls: 0,
      triangles: 0,
      memory: 0,
      cpuUsage: 0,
      gpuUsage: 0,
      timestamp: Date.now()
    }
  }

  /**
   * 更新性能统计
   */
  private updateStats(): void {
    this.stats.fps = 1 / this.clock.getDelta()
    this.stats.drawCalls = this.renderer.info.render.calls
    this.stats.triangles = this.renderer.info.render.triangles
    this.stats.timestamp = Date.now()
  }

  /**
   * 获取性能统计
   */
  public getStats(): PerformanceMetrics {
    return { ...this.stats }
  }

  /**
   * 调整大小
   */
  public resize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)

    if (this.composer) {
      this.composer.setSize(width, height)
    }
  }

  /**
   * 设置相机位置
   */
  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z)
  }

  /**
   * 相机看向目标
   */
  public lookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z)
  }

  /**
   * 获取场景
   */
  public getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * 获取相机
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * 获取渲染器
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // 清理粒子系统
    this.particleSystems.forEach((system) => {
      system.geometry.dispose()
      if (Array.isArray(system.material)) {
        system.material.forEach(m => m.dispose())
      } else {
        system.material.dispose()
      }
    })
    this.particleSystems.clear()

    // 清理场网格
    this.fieldMeshes.forEach((mesh) => {
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material.dispose()
      }
    })
    this.fieldMeshes.clear()

    // 清理渲染器
    this.renderer.dispose()

    // 移除DOM元素
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement)
    }
  }
}
