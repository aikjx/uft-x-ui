import * as THREE from 'three'

/**
 * 材质配置
 */
export interface MaterialConfig {
  type:
    | 'basic'
    | 'phong'
    | 'lambert'
    | 'standard'
    | 'physical'
    | 'points'
    | 'line'
    | 'shadow'
    | 'toon'
    | 'meshDistance'
  color?: number | string
  transparent?: boolean
  opacity?: number
  blending?: THREE.Blending
  depthTest?: boolean
  depthWrite?: boolean
  side?: THREE.Side
  wireframe?: boolean
  shininess?: number
  emissive?: number | string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  // PBR高级特性
  clearcoat?: number
  clearcoatRoughness?: number
  normalScale?: THREE.Vector2
  displacementScale?: number
  displacementBias?: number
  envMapIntensity?: number
  // 动态纹理
  useDynamicTexture?: boolean
  dynamicTextureSize?: number
  dynamicTexturePattern?: 'grid' | 'noise' | 'gradient' | 'checkerboard' | 'wave'
  // 纹理贴图
  map?: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  metalnessMap?: THREE.Texture
  emissiveMap?: THREE.Texture
  aoMap?: THREE.Texture
  displacementMap?: THREE.Texture
  clearcoatMap?: THREE.Texture
  clearcoatRoughnessMap?: THREE.Texture
  // 自发光动画
  animateEmissive?: boolean
  emissiveAnimationSpeed?: number
  // 渐变颜色
  gradientColors?: number[]
  gradientPositions?: number[]
}

/**
 * 材质系统
 */
export class MaterialSystem {
  private materials: Map<string, THREE.Material> = new Map()
  private materialConfigs: Map<string, MaterialConfig> = new Map()
  private defaultConfig: MaterialConfig = {
    type: 'standard',
    color: 0xffffff,
    transparent: false,
    opacity: 1,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
    side: THREE.FrontSide,
    wireframe: false,
    shininess: 30,
    emissive: 0x000000,
    emissiveIntensity: 1,
    metalness: 0.5,
    roughness: 0.5
  }

  /**
   * 创建或获取材质
   * @param id 材质ID
   * @param config 材质配置
   */
  getMaterial(id: string, config: Partial<MaterialConfig> = {}): THREE.Material {
    // 检查是否已有材质
    if (this.materials.has(id)) {
      return this.materials.get(id)!
    }

    // 合并配置
    const materialConfig: MaterialConfig = {
      ...this.defaultConfig,
      ...config
    }

    // 保存配置
    this.materialConfigs.set(id, materialConfig)

    // 创建材质
    const material = this.createMaterial(materialConfig)

    // 保存材质
    this.materials.set(id, material)

    return material
  }

  /**
   * 创建动态纹理
   * @param config 材质配置
   */
  private createDynamicTexture(config: MaterialConfig): THREE.Texture {
    const size = config.dynamicTextureSize || 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!

    // 创建动态纹理图案
    switch (config.dynamicTexturePattern) {
      case 'grid':
        // 网格图案
        context.fillStyle = '#000000'
        context.fillRect(0, 0, size, size)
        context.strokeStyle = '#00ffff'
        context.lineWidth = 1
        for (let i = 0; i <= size; i += size / 16) {
          context.beginPath()
          context.moveTo(i, 0)
          context.lineTo(i, size)
          context.stroke()
          context.beginPath()
          context.moveTo(0, i)
          context.lineTo(size, i)
          context.stroke()
        }
        break

      case 'noise':
        // 噪声图案
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            const noise = Math.random()
            context.fillStyle = `rgb(${Math.floor(noise * 255)}, ${Math.floor(noise * 255)}, ${Math.floor(noise * 255)})`
            context.fillRect(x, y, 1, 1)
          }
        }
        break

      case 'gradient':
        // 渐变图案
        const gradient = context.createLinearGradient(0, 0, size, size)
        gradient.addColorStop(0, '#00ffff')
        gradient.addColorStop(0.5, '#ff00ff')
        gradient.addColorStop(1, '#00ffff')
        context.fillStyle = gradient
        context.fillRect(0, 0, size, size)
        break

      case 'checkerboard':
        // 棋盘格图案
        const cellSize = size / 8
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            context.fillStyle = (x + y) % 2 === 0 ? '#000000' : '#00ffff'
            context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        }
        break

      case 'wave':
        // 波浪图案
        context.fillStyle = '#000000'
        context.fillRect(0, 0, size, size)
        context.strokeStyle = '#00ffff'
        context.lineWidth = 2
        context.beginPath()
        for (let x = 0; x < size; x++) {
          const y = size / 2 + (Math.sin(x / 20) * size) / 4
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
        break

      default:
        // 默认网格图案
        context.fillStyle = '#000000'
        context.fillRect(0, 0, size, size)
        context.strokeStyle = '#00ffff'
        context.lineWidth = 1
        for (let i = 0; i <= size; i += size / 16) {
          context.beginPath()
          context.moveTo(i, 0)
          context.lineTo(i, size)
          context.stroke()
          context.beginPath()
          context.moveTo(0, i)
          context.lineTo(size, i)
          context.stroke()
        }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(5, 5)

    return texture
  }

  /**
   * 创建材质
   * @param config 材质配置
   */
  private createMaterial(config: MaterialConfig): THREE.Material {
    const materialOptions: any = {
      color: config.color,
      transparent: config.transparent,
      opacity: config.opacity,
      blending: config.blending,
      depthTest: config.depthTest,
      depthWrite: config.depthWrite,
      side: config.side,
      wireframe: config.wireframe,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity
    }

    // 添加纹理贴图
    if (config.useDynamicTexture) {
      materialOptions.map = this.createDynamicTexture(config)
    } else {
      if (config.map) materialOptions.map = config.map
      if (config.normalMap) materialOptions.normalMap = config.normalMap
      if (config.roughnessMap) materialOptions.roughnessMap = config.roughnessMap
      if (config.metalnessMap) materialOptions.metalnessMap = config.metalnessMap
      if (config.emissiveMap) materialOptions.emissiveMap = config.emissiveMap
      if (config.aoMap) materialOptions.aoMap = config.aoMap
      if (config.displacementMap) materialOptions.displacementMap = config.displacementMap
      if (config.clearcoatMap) materialOptions.clearcoatMap = config.clearcoatMap
      if (config.clearcoatRoughnessMap)
        materialOptions.clearcoatRoughnessMap = config.clearcoatRoughnessMap
    }

    switch (config.type) {
      case 'basic':
        return new THREE.MeshBasicMaterial(materialOptions)

      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...materialOptions,
          shininess: config.shininess
        })

      case 'lambert':
        return new THREE.MeshLambertMaterial(materialOptions)

      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...materialOptions,
          metalness: config.metalness,
          roughness: config.roughness
        })

      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...materialOptions,
          metalness: config.metalness,
          roughness: config.roughness,
          clearcoat: config.clearcoat || 0,
          clearcoatRoughness: config.clearcoatRoughness || 0,
          normalScale: config.normalScale || new THREE.Vector2(1, 1),
          displacementScale: config.displacementScale || 0,
          displacementBias: config.displacementBias || 0,
          envMapIntensity: config.envMapIntensity || 1
        })

      case 'toon':
        return new THREE.MeshToonMaterial(materialOptions)

      case 'meshDistance':
        return new THREE.MeshDistanceMaterial(materialOptions)

      case 'points':
        return new THREE.PointsMaterial({
          ...materialOptions,
          size: 1,
          sizeAttenuation: true,
          vertexColors: false
        })

      case 'line':
        return new THREE.LineBasicMaterial({
          ...materialOptions,
          linewidth: 1
        })

      case 'shadow':
        return new THREE.ShadowMaterial({
          transparent: true,
          opacity: 0.5
        })

      default:
        return new THREE.MeshStandardMaterial(materialOptions)
    }
  }

  /**
   * 更新材质
   * @param id 材质ID
   * @param config 材质配置
   */
  updateMaterial(id: string, config: Partial<MaterialConfig>): void {
    const material = this.materials.get(id)
    if (!material) return

    const currentConfig = this.materialConfigs.get(id)
    if (!currentConfig) return

    // 合并配置
    const newConfig: MaterialConfig = {
      ...currentConfig,
      ...config
    }

    // 更新配置
    this.materialConfigs.set(id, newConfig)

    // 更新材质属性
    this.updateMaterialProperties(material, newConfig)
  }

  /**
   * 更新材质属性
   * @param material 材质
   * @param config 材质配置
   */
  private updateMaterialProperties(material: THREE.Material, config: MaterialConfig): void {
    if ('color' in material && config.color) {
      ;(
        material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.MeshPhongMaterial
      ).color.set(config.color)
    }

    if ('transparent' in material) {
      material.transparent = config.transparent!
    }

    if ('opacity' in material) {
      material.opacity = config.opacity!
    }

    material.blending = config.blending!
    material.depthTest = config.depthTest!
    material.depthWrite = config.depthWrite!

    if ('side' in material) {
      material.side = config.side!
    }

    if ('wireframe' in material) {
      material.wireframe = config.wireframe!
    }

    // 更新纹理属性
    if (config.useDynamicTexture && 'map' in material) {
      ;(material as any).map = this.createDynamicTexture(config)
    }

    // 更新Phong材质属性
    if (material instanceof THREE.MeshPhongMaterial) {
      if (config.shininess) material.shininess = config.shininess
      if (config.emissive) material.emissive.set(config.emissive)
      if (config.emissiveIntensity !== undefined)
        material.emissiveIntensity = config.emissiveIntensity
    }

    // 更新Standard和Physical材质属性
    if (
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshPhysicalMaterial
    ) {
      if (config.emissive) material.emissive.set(config.emissive)
      if (config.emissiveIntensity !== undefined)
        material.emissiveIntensity = config.emissiveIntensity
      if (config.metalness !== undefined) material.metalness = config.metalness
      if (config.roughness !== undefined) material.roughness = config.roughness

      // 更新PBR高级特性
      if (config.clearcoat !== undefined) (material as any).clearcoat = config.clearcoat
      if (config.clearcoatRoughness !== undefined)
        (material as any).clearcoatRoughness = config.clearcoatRoughness
      if (config.normalScale) (material as any).normalScale = config.normalScale
      if (config.displacementScale !== undefined)
        (material as any).displacementScale = config.displacementScale
      if (config.displacementBias !== undefined)
        (material as any).displacementBias = config.displacementBias
      if (config.envMapIntensity !== undefined)
        (material as any).envMapIntensity = config.envMapIntensity
    }

    // 设置材质需要更新
    material.needsUpdate = true
  }

  /**
   * 获取材质
   * @param id 材质ID
   */
  get(id: string): THREE.Material | undefined {
    return this.materials.get(id)
  }

  /**
   * 移除材质
   * @param id 材质ID
   */
  remove(id: string): void {
    const material = this.materials.get(id)
    if (material) {
      material.dispose()
      this.materials.delete(id)
      this.materialConfigs.delete(id)
    }
  }

  /**
   * 清理所有材质
   */
  dispose(): void {
    this.materials.forEach(material => {
      material.dispose()
    })
    this.materials.clear()
    this.materialConfigs.clear()
  }

  /**
   * 批量创建材质
   * @param materialsConfig 材质配置映射
   */
  batchCreate(materialsConfig: Record<string, MaterialConfig>): void {
    for (const [id, config] of Object.entries(materialsConfig)) {
      this.getMaterial(id, config)
    }
  }

  /**
   * 获取所有材质
   */
  getAll(): Map<string, THREE.Material> {
    return new Map(this.materials)
  }

  /**
   * 获取材质数量
   */
  getCount(): number {
    return this.materials.size
  }
}
