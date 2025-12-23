/**
 * 📤 导出和分享服务
 * 提供多种格式的可视化内容导出和分享功能
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';

/**
 * 导出格式类型
 */
export enum ExportFormat {
  PNG = 'png',
  JPG = 'jpg',
  GIF = 'gif',
  MP4 = 'mp4',
  WEBP = 'webp',
  GLTF = 'gltf',
  GLB = 'glb',
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf'
}

/**
 * 导出配置
 */
export interface ExportConfig {
  format: ExportFormat;
  quality?: number; // 0-1
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string | number;
  includeScene?: boolean;
  includeCamera?: boolean;
  includeLighting?: boolean;
  includeMetadata?: boolean;
  animationDuration?: number; // 仅视频格式
  fps?: number; // 仅视频格式
  fileName?: string;
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean;
  data?: Blob | string;
  url?: string;
  fileName?: string;
  format: ExportFormat;
  error?: string;
}

/**
 * 分享配置
 */
export interface ShareConfig {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * 导出和分享服务
 */
export class ExportService {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private recording: boolean = false;
  private recordFrames: ImageData[] = [];
  private recordStartTime: number = 0;
  private gltfExporter: GLTFExporter = new GLTFExporter();

  /**
   * 设置渲染器、场景和相机
   */
  public setContext(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * 导出可视化内容
   */
  public async export(config: ExportConfig): Promise<ExportResult> {
    if (!this.renderer || !this.scene || !this.camera) {
      return {
        success: false,
        format: config.format,
        error: '渲染上下文未初始化'
      };
    }

    try {
      eventSystem.emit(APP_EVENTS.EXPORT_STARTED, { config });

      const result = await this.performExport(config);
      
      eventSystem.emit(APP_EVENTS.EXPORT_COMPLETED, { result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出失败';
      eventSystem.emit(APP_EVENTS.EXPORT_FAILED, { config, error: errorMessage });
      return {
        success: false,
        format: config.format,
        error: errorMessage
      };
    }
  }

  /**
   * 执行具体的导出操作
   */
  private async performExport(config: ExportConfig): Promise<ExportResult> {
    switch (config.format) {
      case ExportFormat.PNG:
      case ExportFormat.JPG:
      case ExportFormat.WEBP:
        return this.exportImage(config);
      
      case ExportFormat.GIF:
      case ExportFormat.MP4:
        return this.exportVideo(config);
      
      case ExportFormat.GLTF:
      case ExportFormat.GLB:
        return this.export3DModel(config);
      
      case ExportFormat.JSON:
        return this.exportJSON(config);
      
      default:
        return {
          success: false,
          format: config.format,
          error: '不支持的导出格式'
        };
    }
  }

  /**
   * 导出为图片
   */
  private exportImage(config: ExportConfig): ExportResult {
    if (!this.renderer || !this.scene || !this.camera) {
      throw new Error('渲染上下文未初始化');
    }

    // 保存原始设置
    const originalSize = {
      width: this.renderer.domElement.width,
      height: this.renderer.domElement.height
    };

    // 设置导出尺寸
    const width = config.width || originalSize.width;
    const height = config.height || originalSize.height;
    this.renderer.setSize(width, height);

    // 渲染场景
    this.renderer.render(this.scene, this.camera);

    // 生成图片数据URL
    const format = config.format;
    const quality = config.quality || 0.95;
    const dataURL = this.renderer.domElement.toDataURL(`image/${format}`, quality);

    // 恢复原始尺寸
    this.renderer.setSize(originalSize.width, originalSize.height);

    // 转换为Blob
    const blob = this.dataURLToBlob(dataURL);
    const url = URL.createObjectURL(blob);
    const fileName = config.fileName || `visualization-${Date.now()}.${format}`;

    return {
      success: true,
      data: blob,
      url,
      fileName,
      format
    };
  }

  /**
   * 导出为视频
   */
  private async exportVideo(config: ExportConfig): Promise<ExportResult> {
    // 视频导出实现
    // 注意：这里只提供基础框架，完整的视频导出可能需要使用WebGLRecorder或其他库
    return {
      success: false,
      format: config.format,
      error: '视频导出功能正在开发中'
    };
  }

  /**
   * 导出为3D模型
   */
  private export3DModel(config: ExportConfig): Promise<ExportResult> {
    if (!this.scene) {
      return Promise.resolve({
        success: false,
        format: config.format,
        error: '场景未初始化'
      });
    }

    return new Promise((resolve) => {
      const options = {
        binary: config.format === ExportFormat.GLB,
        includeScene: config.includeScene !== false,
        includeCamera: config.includeCamera || false,
        includeLights: config.includeLighting || false,
        includeMetadata: config.includeMetadata !== false
      };

      this.gltfExporter.parse(
        this.scene,
        (gltf) => {
          let blob: Blob;
          if (config.format === ExportFormat.GLB) {
            blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          } else {
            const json = JSON.stringify(gltf);
            blob = new Blob([json], { type: 'application/json' });
          }

          const url = URL.createObjectURL(blob);
          const fileName = config.fileName || `model-${Date.now()}.${config.format}`;

          resolve({
            success: true,
            data: blob,
            url,
            fileName,
            format: config.format
          });
        },
        (error) => {
          resolve({
            success: false,
            format: config.format,
            error: error instanceof Error ? error.message : 'GLTF导出失败'
          });
        },
        options
      );
    });
  }

  /**
   * 导出为JSON
   */
  private exportJSON(config: ExportConfig): ExportResult {
    if (!this.scene) {
      return {
        success: false,
        format: config.format,
        error: '场景未初始化'
      };
    }

    // 导出场景数据
    const sceneData = {
      version: '1.0',
      timestamp: Date.now(),
      format: config.format,
      metadata: {
        title: '统一场论可视化',
        author: 'UTF-X UI',
        description: '统一场论可视化导出数据'
      },
      objects: this.scene.children.map(child => this.serializeObject(child)),
      camera: this.camera ? this.serializeCamera(this.camera) : undefined,
      format: config.format
    };

    const jsonString = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = config.fileName || `visualization-${Date.now()}.json`;

    return {
      success: true,
      data: blob,
      url,
      fileName,
      format: config.format
    };
  }

  /**
   * 序列化THREE对象
   */
  private serializeObject(object: THREE.Object3D): any {
    const data: any = {
      type: object.type,
      name: object.name,
      uuid: object.uuid,
      position: object.position.toArray(),
      rotation: object.rotation.toArray(),
      scale: object.scale.toArray(),
      visible: object.visible
    };

    if (object instanceof THREE.Mesh) {
      data.geometry = this.serializeGeometry(object.geometry);
      data.material = this.serializeMaterial(object.material);
    }

    if (object.children.length > 0) {
      data.children = object.children.map(child => this.serializeObject(child));
    }

    return data;
  }

  /**
   * 序列化几何体
   */
  private serializeGeometry(geometry: THREE.BufferGeometry | THREE.Geometry): any {
    // 简化实现，仅导出基础信息
    return {
      type: geometry.type,
      vertices: geometry.attributes.position ? geometry.attributes.position.count : 0,
      faces: geometry instanceof THREE.Geometry ? geometry.faces.length : 0
    };
  }

  /**
   * 序列化材质
   */
  private serializeMaterial(material: THREE.Material | THREE.Material[]): any {
    if (Array.isArray(material)) {
      return material.map(m => this.serializeMaterial(m));
    }

    return {
      type: material.type,
      color: material instanceof THREE.MeshBasicMaterial ? material.color.getHex() : undefined,
      transparent: material.transparent,
      opacity: material.opacity,
      wireframe: material.wireframe
    };
  }

  /**
   * 序列化相机
   */
  private serializeCamera(camera: THREE.Camera): any {
    return {
      type: camera.type,
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray(),
      fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : undefined,
      aspect: camera instanceof THREE.PerspectiveCamera ? camera.aspect : undefined,
      near: camera.near,
      far: camera.far
    };
  }

  /**
   * 数据URL转Blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * 下载文件
   */
  public download(result: ExportResult): void {
    if (!result.success || !result.url) {
      console.error('下载失败:', result.error);
      return;
    }

    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.fileName || `export.${result.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    setTimeout(() => {
      URL.revokeObjectURL(result.url);
    }, 1000);
  }

  /**
   * 复制到剪贴板
   */
  public async copyToClipboard(data: string | Blob): Promise<boolean> {
    try {
      if (typeof data === 'string') {
        await navigator.clipboard.writeText(data);
      } else {
        const text = await this.blobToText(data);
        await navigator.clipboard.writeText(text);
      }
      return true;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      return false;
    }
  }

  /**
   * 分享内容
   */
  public async share(config: ShareConfig): Promise<boolean> {
    try {
      if (navigator.share) {
        await navigator.share({
          title: config.title,
          text: config.text,
          url: config.url
        });
        return true;
      } else {
        // 回退方案：复制到剪贴板
        const shareText = `${config.title || ''}\n${config.text || ''}\n${config.url || ''}`;
        return await this.copyToClipboard(shareText);
      }
    } catch (error) {
      console.error('分享失败:', error);
      return false;
    }
  }

  /**
   * 开始录制
   */
  public startRecording(): void {
    this.recording = true;
    this.recordFrames = [];
    this.recordStartTime = Date.now();
    eventSystem.emit(APP_EVENTS.RECORDING_STARTED);
  }

  /**
   * 停止录制
   */
  public stopRecording(): ImageData[] {
    this.recording = false;
    eventSystem.emit(APP_EVENTS.RECORDING_STOPPED, { frames: this.recordFrames });
    return this.recordFrames;
  }

  /**
   * 录制单帧
   */
  public captureFrame(): void {
    if (this.recording && this.renderer) {
      const frame = this.renderer.domElement.getContext('2d')?.getImageData(0, 0, this.renderer.domElement.width, this.renderer.domElement.height);
      if (frame) {
        this.recordFrames.push(frame);
      }
    }
  }

  /**
   * Blob转文本
   */
  private async blobToText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.recordFrames = [];
  }
}

// 创建导出服务单例
export const exportService =