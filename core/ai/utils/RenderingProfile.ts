// 统一场论可视化系统 - 渲染配置文件
// 版本: v1.0
// 功能: 管理渲染配置文件

export class RenderingProfile {
  private settings: any;

  constructor(settings: any) {
    this.settings = {
      raytracing: {
        enabled: false,
        quality: 'low',
        maxBounces: 2,
        samplesPerPixel: 4
      },
      pathTracing: {
        enabled: false,
        quality: 'low',
        samplesPerPixel: 8
      },
      volumeRendering: {
        enabled: false,
        quality: 'low',
        raySteps: 50
      },
      antialiasing: 'fxaa',
      shadowQuality: 'low',
      textureQuality: 'medium',
      maxFrameTime: 100,
      ...settings
    };
  }

  public getSettings(): any {
    return this.settings;
  }

  public getRaytracingSettings(): any {
    return this.settings.raytracing;
  }

  public getPathTracingSettings(): any {
    return this.settings.pathTracing;
  }

  public getVolumeRenderingSettings(): any {
    return this.settings.volumeRendering;
  }

  public getAntialiasing(): string {
    return this.settings.antialiasing;
  }

  public getShadowQuality(): string {
    return this.settings.shadowQuality;
  }

  public getTextureQuality(): string {
    return this.settings.textureQuality;
  }

  public getMaxFrameTime(): number {
    return this.settings.maxFrameTime;
  }

  public setSetting(key: string, value: any): void {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value;
    }
  }

  public setRaytracingSetting(key: string, value: any): void {
    if (this.settings.raytracing.hasOwnProperty(key)) {
      this.settings.raytracing[key] = value;
    }
  }

  public setPathTracingSetting(key: string, value: any): void {
    if (this.settings.pathTracing.hasOwnProperty(key)) {
      this.settings.pathTracing[key] = value;
    }
  }

  public setVolumeRenderingSetting(key: string, value: any): void {
    if (this.settings.volumeRendering.hasOwnProperty(key)) {
      this.settings.volumeRendering[key] = value;
    }
  }

  public setAntialiasing(value: string): void {
    this.settings.antialiasing = value;
  }

  public setShadowQuality(value: string): void {
    this.settings.shadowQuality = value;
  }

  public setTextureQuality(value: string): void {
    this.settings.textureQuality = value;
  }

  public setMaxFrameTime(value: number): void {
    this.settings.maxFrameTime = value;
  }

  public clone(): RenderingProfile {
    return new RenderingProfile({ ...this.settings });
  }

  public validate(): boolean {
    // 验证配置是否有效
    if (this.settings.raytracing.samplesPerPixel < 1) return false;
    if (this.settings.pathTracing.samplesPerPixel < 1) return false;
    if (this.settings.volumeRendering.raySteps < 10) return false;
    if (this.settings.maxFrameTime < 1) return false;
    return true;
  }

  public toJSON(): string {
    return JSON.stringify(this.settings);
  }

  public static fromJSON(json: string): RenderingProfile {
    return new RenderingProfile(JSON.parse(json));
  }
}