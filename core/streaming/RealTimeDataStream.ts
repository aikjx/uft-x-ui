// 统一场论可视化系统 - 实时数据流处理
// 版本: v2.0
// 功能: 处理实时数据流和网络可视化

import { Vector3, Vector4, Matrix4, Quaternion } from 'three';
import { DataCompressor } from './compression/DataCompressor';
import { NetworkProtocol } from './network/NetworkProtocol';
import { DataBuffer } from './buffers/DataBuffer';

export class RealTimeDataStream {
  private streamSources: Map<string, any> = new Map();
  private dataCompressor: DataCompressor;
  private networkProtocol: NetworkProtocol;
  private dataBuffers: Map<string, DataBuffer> = new Map();
  private useCompression: boolean = true;
  private enableNetworkStreaming: boolean = false;
  private maxBufferSize: number = 10000;
  private frameRate: number = 60;
  private lastFrameTime: number = 0;
  private isProcessing: boolean = false;
  private processingInterval: number | null = null;

  constructor() {
    this.dataCompressor = new DataCompressor();
    this.networkProtocol = new NetworkProtocol();
    console.log('🚀 实时数据流系统初始化');
  }

  public start(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.lastFrameTime = Date.now();
    
    console.log('▶️  实时数据流处理启动');
    
    // 开始处理循环
    this.processingInterval = setInterval(() => {
      this.processFrame();
    }, 1000 / this.frameRate) as unknown as number;
  }

  public stop(): void {
    if (!this.isProcessing) return;

    this.isProcessing = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    console.log('⏹️  实时数据流处理停止');
  }

  public addDataSource(name: string, source: any): void {
    this.streamSources.set(name, source);
    this.dataBuffers.set(name, new DataBuffer(this.maxBufferSize));
    console.log(`📡 添加数据源: ${name}`);
  }

  public removeDataSource(name: string): void {
    this.streamSources.delete(name);
    this.dataBuffers.delete(name);
    console.log(`📡 移除数据源: ${name}`);
  }

  public getDataSource(name: string): any {
    return this.streamSources.get(name) || null;
  }

  public getAvailableSources(): string[] {
    return Array.from(this.streamSources.keys());
  }

  public setFrameRate(rate: number): void {
    this.frameRate = rate;
    
    if (this.isProcessing && this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = setInterval(() => {
        this.processFrame();
      }, 1000 / this.frameRate) as unknown as number;
    }
    
    console.log(`🎚️  帧率设置为: ${rate} FPS`);
  }

  public enableCompression(enabled: boolean): void {
    this.useCompression = enabled;
    console.log(`📦 数据压缩 ${enabled ? '启用' : '禁用'}`);
  }

  public enableNetworkStreaming(enabled: boolean): void {
    this.enableNetworkStreaming = enabled;
    console.log(`🌐 网络流 ${enabled ? '启用' : '禁用'}`);
  }

  public setMaxBufferSize(size: number): void {
    this.maxBufferSize = size;
    
    // 更新所有缓冲区大小
    this.dataBuffers.forEach((buffer) => {
      buffer.setMaxSize(size);
    });
    
    console.log(`📊 最大缓冲区大小设置为: ${size}`);
  }

  private processFrame(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 性能限制：如果上一帧处理时间超过阈值，跳过本帧
    if (deltaTime > 100) { // 100ms 阈值
      console.warn('⚠️  数据流处理延迟过高，跳过本帧');
      return;
    }

    // 处理每个数据源
    this.streamSources.forEach((source, name) => {
      this.processDataSource(name, source, deltaTime);
    });

    // 处理网络流
    if (this.enableNetworkStreaming) {
      // 限制网络流处理频率，每3帧处理一次
      if (Date.now() % 3 === 0) {
        this.processNetworkStreaming();
      }
    }
  }

  private processDataSource(name: string, source: any, deltaTime: number): void {
    try {
      // 性能监控
      const processStart = performance.now();
      
      // 从数据源获取数据
      const rawData = source.getData(deltaTime);
      
      if (rawData) {
        // 压缩数据
        let processedData = rawData;
        
        if (this.useCompression) {
          processedData = this.dataCompressor.compress(rawData);
        }
        
        // 存储到缓冲区
        const buffer = this.dataBuffers.get(name);
        if (buffer) {
          // 限制缓冲区写入频率
          if (Date.now() % 2 === 0) {
            buffer.addData(processedData);
          }
        }
        
        // 触发数据更新事件
        this.emitDataUpdate(name, processedData);
      }
      
      // 性能监控
      const processEnd = performance.now();
      const processTime = processEnd - processStart;
      
      // 如果处理时间过长，降低该数据源的处理频率
      if (processTime > 50) {
        console.warn(`⚠️  数据源 ${name} 处理时间过长: ${processTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      console.error(`❌ 处理数据源 ${name} 时出错:`, error);
    }
  }

  private processNetworkStreaming(): void {
    // 处理网络数据传输
    // 这里可以实现数据的发送和接收逻辑
  }

  private emitDataUpdate(sourceName: string, data: any): void {
    // 触发数据更新事件
    // 这里可以实现事件触发逻辑
    console.log(`📈 数据源 ${sourceName} 数据更新`);
  }

  public getBufferData(sourceName: string, count: number = 1): any[] {
    const buffer = this.dataBuffers.get(sourceName);
    if (buffer) {
      return buffer.getRecentData(count);
    }
    return [];
  }

  public clearBuffer(sourceName: string): void {
    const buffer = this.dataBuffers.get(sourceName);
    if (buffer) {
      buffer.clear();
    }
  }

  public getBufferSize(sourceName: string): number {
    const buffer = this.dataBuffers.get(sourceName);
    if (buffer) {
      return buffer.getSize();
    }
    return 0;
  }

  public isRunning(): boolean {
    return this.isProcessing;
  }

  public getStats(): any {
    const stats = {
      isRunning: this.isProcessing,
      frameRate: this.frameRate,
      sources: this.streamSources.size,
      compressionEnabled: this.useCompression,
      networkStreamingEnabled: this.enableNetworkStreaming,
      buffers: {}
    };

    // 添加每个缓冲区的状态
    this.dataBuffers.forEach((buffer, name) => {
      stats.buffers[name] = {
        size: buffer.getSize(),
        maxSize: buffer.getMaxSize()
      };
    });

    return stats;
  }

  public dispose(): void {
    this.stop();
    this.streamSources.clear();
    this.dataBuffers.clear();
    this.dataCompressor.dispose();
    this.networkProtocol.dispose();
    console.log('🧹 实时数据流系统资源清理完成');
  }
}
