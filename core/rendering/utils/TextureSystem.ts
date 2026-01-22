// 统一场论可视化系统 - 纹理系统
// 版本: v1.0
// 功能: 管理光线追踪的纹理

export class TextureSystem {
  private textures: Map<string, any> = new Map()
  private loadingTextures: Map<string, Promise<any>> = new Map()

  constructor() {}

  public async loadTexture(id: string, url: string): Promise<any> {
    if (this.textures.has(id)) {
      return this.textures.get(id)
    }

    if (this.loadingTextures.has(id)) {
      return this.loadingTextures.get(id)
    }

    const promise = new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        this.textures.set(id, image)
        this.loadingTextures.delete(id)
        resolve(image)
      }
      image.onerror = () => {
        this.loadingTextures.delete(id)
        reject(new Error(`Failed to load texture: ${url}`))
      }
      image.src = url
    })

    this.loadingTextures.set(id, promise)
    return promise
  }

  public getTexture(id: string): any {
    return this.textures.get(id)
  }

  public removeTexture(id: string): void {
    this.textures.delete(id)
  }

  public clear(): void {
    this.textures.clear()
    this.loadingTextures.clear()
  }

  public dispose(): void {
    this.textures.clear()
    this.loadingTextures.clear()
  }
}
