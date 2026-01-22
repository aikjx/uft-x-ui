import * as THREE from 'three'

/**
 * 高级纹理压缩系统
 * 提供纹理压缩、内存管理和优化功能
 */

// 纹理压缩格式
export enum TextureCompressionFormat {
  AUTO = 'auto',
  WEBGL1 = 'webgl1',
  WEBGL2 = 'webgl2',
  ASTC = 'astc',
  BC = 'bc',
  ETC2 = 'etc2',
  PVRTC = 'pvrtc'
}

// 纹理质量设置
export enum TextureQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

// 纹理压缩配置
export interface TextureCompressionConfig {
  format: TextureCompressionFormat
  quality: TextureQuality
  maxTextureSize: number
  enableMipmaps: boolean
  enableAnisotropy: boolean
  maxAnisotropy: number
  memoryBudget: number // 纹理内存预算（字节）
}

// 纹理压缩系统
export class TextureCompressionSystem {
  private static instance: TextureCompressionSystem
  private textureCache: Map<string, THREE.Texture> = new Map()
  private memoryUsage: number = 0
  private memoryBudget: number = 1024 * 1024 * 1024 // 默认1GB
  private compressionConfig: TextureCompressionConfig
  private deviceCapabilities: {
    supportsWebGL2: boolean
    supportsCompressedTextures: boolean
    supportedFormats: string[]
    maxTextureSize: number
    maxAnisotropy: number
  }

  private constructor() {
    this.compressionConfig = {
      format: TextureCompressionFormat.AUTO,
      quality: TextureQuality.MEDIUM,
      maxTextureSize: 4096,
      enableMipmaps: true,
      enableAnisotropy: true,
      maxAnisotropy: 16,
      memoryBudget: this.memoryBudget
    }

    this.deviceCapabilities = this.detectDeviceCapabilities()
  }

  static getInstance(): TextureCompressionSystem {
    if (!TextureCompressionSystem.instance) {
      TextureCompressionSystem.instance = new TextureCompressionSystem()
    }
    return TextureCompressionSystem.instance
  }

  // 检测设备能力
  private detectDeviceCapabilities(): any {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      return {
        supportsWebGL2: false,
        supportsCompressedTextures: false,
        supportedFormats: [],
        maxTextureSize: 1024,
        maxAnisotropy: 1
      }
    }

    const extensions = gl.getSupportedExtensions() || []
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    const maxAnisotropy = gl.getExtension('EXT_texture_filter_anisotropic') 
      ? gl.getParameter((gl.getExtension('EXT_texture_filter_anisotropic') as any).MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 1

    return {
      supportsWebGL2: !!canvas.getContext('webgl2'),
      supportsCompressedTextures: extensions.some(ext => 
        ext.includes('compressed')
      ),
      supportedFormats: extensions,
      maxTextureSize,
      maxAnisotropy
    }
  }

  // 配置压缩系统
  setConfig(config: Partial<TextureCompressionConfig>): void {
    this.compressionConfig = {
      ...this.compressionConfig,
      ...config
    }
    this.memoryBudget = config.memoryBudget || this.memoryBudget
  }

  // 压缩纹理
  async compressTexture(url: string, options: {
    format?: TextureCompressionFormat
    quality?: TextureQuality
    generateMipmaps?: boolean
    anisotropy?: number
    cacheKey?: string
  } = {}): Promise<THREE.Texture> {
    const cacheKey = options.cacheKey || url
    
    // 检查缓存
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!
    }

    try {
      // 确定压缩格式
      const format = options.format || this.compressionConfig.format
      const quality = options.quality || this.compressionConfig.quality
      
      // 加载纹理
      const loader = new THREE.TextureLoader()
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          url,
          resolve,
          undefined,
          reject
        )
      })

      // 应用压缩和优化
      this.optimizeTexture(texture, {
        format,
        quality,
        generateMipmaps: options.generateMipmaps ?? this.compressionConfig.enableMipmaps,
        anisotropy: options.anisotropy ?? (this.compressionConfig.enableAnisotropy ? this.deviceCapabilities.maxAnisotropy : 1)
      })

      // 计算内存使用
      const textureMemory = this.calculateTextureMemory(texture)
      this.memoryUsage += textureMemory

      // 检查内存预算
      this.enforceMemoryBudget()

      // 缓存纹理
      this.textureCache.set(cacheKey, texture)

      return texture
    } catch (error) {
      console.error('Texture compression failed:', error)
      throw error
    }
  }

  // 优化纹理
  private optimizeTexture(texture: THREE.Texture, options: {
    format: TextureCompressionFormat
    quality: TextureQuality
    generateMipmaps: boolean
    anisotropy: number
  }): void {
    // 设置纹理参数
    texture.minFilter = options.generateMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    // 应用各向异性过滤
    if (options.anisotropy > 1) {
      texture.anisotropy = options.anisotropy
    }

    // 压缩纹理（根据设备能力）
    this.applyTextureCompression(texture, options.format, options.quality)

    // 生成mipmaps
    if (options.generateMipmaps) {
      texture.generateMipmaps()
    }

    // 优化纹理大小
    this.optimizeTextureSize(texture, options.quality)
  }

  // 应用纹理压缩
  private applyTextureCompression(texture: THREE.Texture, format: TextureCompressionFormat, quality: TextureQuality): void {
    // 根据设备能力选择最佳压缩格式
    if (format === TextureCompressionFormat.AUTO) {
      // 自动选择格式
      if (this.deviceCapabilities.supportsWebGL2) {
        // WebGL2 支持 ETC2
        this.applyETC2Compression(texture, quality)
      } else {
        // WebGL1 回退到基本格式
        this.applyBasicCompression(texture, quality)
      }
    } else if (format === TextureCompressionFormat.ETC2 && this.deviceCapabilities.supportsWebGL2) {
      this.applyETC2Compression(texture, quality)
    } else {
      this.applyBasicCompression(texture, quality)
    }
  }

  // 应用ETC2压缩
  private applyETC2Compression(texture: THREE.Texture, quality: TextureQuality): void {
    // ETC2 压缩设置
    switch (quality) {
      case TextureQuality.LOW:
        texture.format = THREE.RGBFormat
        texture.type = THREE.UnsignedByteType
        break
      case TextureQuality.MEDIUM:
        texture.format = THREE.RGBFormat
        texture.type = THREE.UnsignedByteType
        break
      case TextureQuality.HIGH:
      case TextureQuality.ULTRA:
        texture.format = THREE.RGBAFormat
        texture.type = THREE.UnsignedByteType
        break
    }
  }

  // 应用基本压缩
  private applyBasicCompression(texture: THREE.Texture, quality: TextureQuality): void {
    switch (quality) {
      case TextureQuality.LOW:
        texture.format = THREE.RGBFormat
        texture.type = THREE.UnsignedByteType
        break
      case TextureQuality.MEDIUM:
        texture.format = THREE.RGBFormat
        texture.type = THREE.UnsignedByteType
        break
      case TextureQuality.HIGH:
      case TextureQuality.ULTRA:
        texture.format = THREE.RGBAFormat
        texture.type = THREE.UnsignedByteType
        break
    }
  }

  // 优化纹理大小
  private optimizeTextureSize(texture: THREE.Texture, quality: TextureQuality): void {
    // 根据质量设置最大纹理大小
    let maxSize: number
    
    switch (quality) {
      case TextureQuality.LOW:
        maxSize = 512
        break
      case TextureQuality.MEDIUM:
        maxSize = 1024
        break
      case TextureQuality.HIGH:
        maxSize = 2048
        break
      case TextureQuality.ULTRA:
        maxSize = Math.min(4096, this.deviceCapabilities.maxTextureSize)
        break
    }

    maxSize = Math.min(maxSize, this.compressionConfig.maxTextureSize)

    // 这里可以添加纹理重采样逻辑
    // 实际项目中可能需要使用Canvas API或WebGL进行纹理缩放
  }

  // 计算纹理内存使用
  private calculateTextureMemory(texture: THREE.Texture): number {
    if (!texture.image) return 0

    const width = texture.image.width || 0
    const height = texture.image.height || 0
    const hasAlpha = texture.format === THREE.RGBAFormat
    const bytesPerPixel = hasAlpha ? 4 : 3
    const mipmapFactor = texture.generateMipmaps ? 1.333 : 1

    return width * height * bytesPerPixel * mipmapFactor
  }

  // 强制内存预算
  private enforceMemoryBudget(): void {
    if (this.memoryUsage > this.memoryBudget) {
      // 清理最不常用的纹理
      this.cleanupUnusedTextures()
    }
  }

  // 清理未使用的纹理
  private cleanupUnusedTextures(): void {
    const texturesToRemove: string[] = []
    
    // 简单策略：移除最早添加的纹理
    // 实际项目中应该使用LRU或其他更智能的策略
    for (const [key, texture] of this.textureCache) {
      texturesToRemove.push(key)
      if (this.memoryUsage <= this.memoryBudget * 0.8) {
        break
      }
    }

    texturesToRemove.forEach(key => {
      const texture = this.textureCache.get(key)
      if (texture) {
        this.memoryUsage -= this.calculateTextureMemory(texture)
        texture.dispose()
        this.textureCache.delete(key)
      }
    })
  }

  // 加载并压缩纹理
  async loadTexture(url: string, options?: Partial<TextureCompressionConfig>): Promise<THREE.Texture> {
    const config = { ...this.compressionConfig, ...options }
    return this.compressTexture(url, {
      format: config.format,
      quality: config.quality,
      generateMipmaps: config.enableMipmaps,
      anisotropy: config.enableAnisotropy ? config.maxAnisotropy : 1,
      cacheKey: url
    })
  }

  // 从缓存获取纹理
  getTexture(key: string): THREE.Texture | null {
    return this.textureCache.get(key) || null
  }

  // 移除纹理
  removeTexture(key: string): void {
    const texture = this.textureCache.get(key)
    if (texture) {
      this.memoryUsage -= this.calculateTextureMemory(texture)
      texture.dispose()
      this.textureCache.delete(key)
    }
  }

  // 清理所有纹理
  cleanup(): void {
    this.textureCache.forEach(texture => {
      texture.dispose()
    })
    this.textureCache.clear()
    this.memoryUsage = 0
  }

  // 获取内存使用情况
  getMemoryUsage(): {
    used: number
    budget: number
    percentage: number
  } {
    return {
      used: this.memoryUsage,
      budget: this.memoryBudget,
      percentage: (this.memoryUsage / this.memoryBudget) * 100
    }
  }

  // 获取缓存状态
  getCacheStatus(): {
    size: number
    textures: string[]
  } {
    return {
      size: this.textureCache.size,
      textures: Array.from(this.textureCache.keys())
    }
  }

  // 获取设备能力
  getDeviceCapabilities(): typeof this.deviceCapabilities {
    return this.deviceCapabilities
  }
}

// 批量纹理加载器
export class BatchTextureLoader {
  private textureSystem: TextureCompressionSystem
  private loadQueue: Array<{
    url: string
    options?: Partial<TextureCompressionConfig>
    resolve: (texture: THREE.Texture) => void
    reject: (error: Error) => void
  }> = []
  private isLoading: boolean = false

  constructor() {
    this.textureSystem = TextureCompressionSystem.getInstance()
  }

  // 添加纹理到加载队列
  load(url: string, options?: Partial<TextureCompressionConfig>): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.loadQueue.push({ url, options, resolve, reject })
      if (!this.isLoading) {
        this.processQueue()
      }
    })
  }

  // 处理加载队列
  private async processQueue(): Promise<void> {
    if (this.loadQueue.length === 0) {
      this.isLoading = false
      return
    }

    this.isLoading = true

    // 批量处理，一次处理最多4个纹理
    const batchSize = 4
    const currentBatch = this.loadQueue.splice(0, batchSize)

    try {
      const texturePromises = currentBatch.map(item => 
        this.textureSystem.loadTexture(item.url, item.options)
      )

      const textures = await Promise.all(texturePromises)

      currentBatch.forEach((item, index) => {
        item.resolve(textures[index])
      })
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error as Error)
      })
    } finally {
      // 继续处理下一批
      this.processQueue()
    }
  }

  // 获取队列状态
  getQueueStatus(): {
    pending: number
    isLoading: boolean
  } {
    return {
      pending: this.loadQueue.length,
      isLoading: this.isLoading
    }
  }
}

// 导出默认实例
export const textureCompressionSystem = TextureCompressionSystem.getInstance()
export const batchTextureLoader = new BatchTextureLoader()
