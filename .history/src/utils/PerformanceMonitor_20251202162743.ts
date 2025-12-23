/**
 * 性能监控配置选项
 */
export interface PerformanceMonitorConfig {
  /** 采样间隔（毫秒） */
  sampleInterval?: number;
  /** 是否启用FPS监控 */
  enableFPS?: boolean;
  /** 是否启用内存监控 */
  enableMemory?: boolean;
  /** 是否启用GPU监控 */
  enableGPU?: boolean;
  /** 是否启用网络监控 */
  enableNetwork?: boolean;
  /** 是否启用资源监控 */
  enableResource?: boolean;
  /** 最大历史数据点数量 */
  maxHistoryPoints?: number;
  /** 是否在控制台输出性能数据 */
  logToConsole?: boolean;
}

/**
 * FPS数据点
 */
export interface FPSDataPoint {
  /** 时间戳 */
  timestamp: number;
  /** 当前FPS值 */
  fps: number;
  /** 帧率平均值 */
  avgFPS: number;
  /** 帧率最小值 */
  minFPS: number;
  /** 帧率最大值 */
  maxFPS: number;
  /** 丢帧率 */
  droppedFrames: number;
}

/**
 * 内存数据点
 */
export interface MemoryDataPoint {
  /** 时间戳 */
  timestamp: number;
  /** 已使用内存（字节） */
  used: number;
  /** 总内存（字节） */
  total: number;
  /** 使用率（百分比） */
  usage: number;
  /** JS堆大小（字节） */
  jsHeapSizeUsed: number;
  /** 总JS堆大小（字节） */
  jsHeapSizeTotal: number;
  /** 最大JS堆大小（字节） */
  jsHeapSizeLimit: number;
}

/**
 * GPU数据点
 */
export interface GPUDataPoint {
  /** 时间戳 */
  timestamp: number;
  /** GPU使用率（百分比） */
  usage: number;
  /** GPU内存使用（字节） */
  memoryUsed: number;
}

/**
 * 网络数据点
 */
export interface NetworkDataPoint {
  /** 时间戳 */
  timestamp: number;
  /** 下载速度（字节/秒） */
  downloadSpeed: number;
  /** 上传速度（字节/秒） */
  uploadSpeed: number;
  /** 当前连接数量 */
  connections: number;
}

/**
 * 资源数据点
 */
export interface ResourceDataPoint {
  /** 时间戳 */
  timestamp: number;
  /** 已加载资源数量 */
  loaded: number;
  /** 加载中资源数量 */
  loading: number;
  /** 加载失败资源数量 */
  failed: number;
  /** 总资源数量 */
  total: number;
  /** 资源加载成功率 */
  successRate: number;
}

/**
 * 性能数据聚合
 */
export interface PerformanceData {
  /** FPS数据 */
  fps: FPSDataPoint;
  /** 内存数据 */
  memory?: MemoryDataPoint;
  /** GPU数据 */
  gpu?: GPUDataPoint;
  /** 网络数据 */
  network?: NetworkDataPoint;
  /** 资源数据 */
  resource?: ResourceDataPoint;
}

/**
 * 性能监控器类
 * 用于实时监控应用的性能指标
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private lastSampleTime: number = 0;
  private frameCount: number = 0;
  private droppedFrameCount: number = 0;
  private fpsHistory: FPSDataPoint[] = [];
  private memoryHistory: MemoryDataPoint[] = [];
  private gpuHistory: GPUDataPoint[] = [];
  private networkHistory: NetworkDataPoint[] = [];
  private resourceHistory: ResourceDataPoint[] = [];
  private eventListeners: Map<string, Array<(data: PerformanceData) => void>> = new Map();

  /**
   * 构造函数
   */
  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.config = {
      sampleInterval: 1000,
      enableFPS: true,
      enableMemory: true,
      enableGPU: true,
      enableNetwork: false,
      enableResource: true,
      maxHistoryPoints: 60,
      logToConsole: false,
      ...config
    };

    // 初始化事件监听器
    this.eventListeners.set('update', []);
    this.eventListeners.set('fps-drop', []);
    this.eventListeners.set('high-memory', []);
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.lastSampleTime = this.startTime;
    this.frameCount = 0;
    this.droppedFrameCount = 0;

    this.monitorLoop();
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.gpuHistory = [];
    this.networkHistory = [];
    this.resourceHistory = [];
    this.startTime = performance.now();
    this.lastSampleTime = this.startTime;
    this.frameCount = 0;
    this.droppedFrameCount = 0;
  }

  /**
   * 监控循环
   */
  private monitorLoop(): void {
    if (!this.isMonitoring) {
      return;
    }

    const currentTime = performance.now();
    this.frameCount++;

    // 计算帧率
    if (currentTime - this.lastSampleTime >= this.config.sampleInterval!) {
      const elapsedTime = currentTime - this.lastSampleTime;
      const fps = Math.round((this.frameCount * 1000) / elapsedTime);

      // 收集性能数据
      const performanceData = this.collectPerformanceData(fps);

      // 触发更新事件
      this.triggerEvent('update', performanceData);

      // 检查性能警告
      this.checkPerformanceWarnings(performanceData);

      // 输出到控制台
      if (this.config.logToConsole) {
        this.logPerformanceData(performanceData);
      }

      // 重置计数器
      this.frameCount = 0;
      this.lastSampleTime = currentTime;
    }

    this.animationFrameId = requestAnimationFrame(() => this.monitorLoop());
  }

  /**
   * 收集性能数据
   * @param currentFPS 当前FPS值
   */
  private collectPerformanceData(currentFPS: number): PerformanceData {
    const data: PerformanceData = {
      fps: this.collectFPSData(currentFPS)
    };

    if (this.config.enableMemory) {
      data.memory = this.collectMemoryData();
    }

    if (this.config.enableGPU) {
      data.gpu = this.collectGPUData();
    }

    if (this.config.enableNetwork) {
      data.network = this.collectNetworkData();
    }

    if (this.config.enableResource) {
      data.resource = this.collectResourceData();
    }

    return data;
  }

  /**
   * 收集FPS数据
   * @param currentFPS 当前FPS值
   */
  private collectFPSData(currentFPS: number): FPSDataPoint {
    // 计算历史数据的统计值
    const allFPS = [...this.fpsHistory.map(d => d.fps), currentFPS];
    const avgFPS = Math.round(allFPS.reduce((sum, fps) => sum + fps, 0) / allFPS.length);
    const minFPS = Math.min(...allFPS);
    const maxFPS = Math.max(...allFPS);

    // 计算丢帧率
    const droppedFrames = currentFPS < 30 ? Math.round((30 - currentFPS) / 30 * 100) : 0;

    const fpsData: FPSDataPoint = {
      timestamp: Date.now(),
      fps: currentFPS,
      avgFPS,
      minFPS,
      maxFPS,
      droppedFrames
    };

    // 更新历史数据
    this.fpsHistory.push(fpsData);
    if (this.fpsHistory.length > this.config.maxHistoryPoints!) {
      this.fpsHistory.shift();
    }

    return fpsData;
  }

  /**
   * 收集内存数据
   */
  private collectMemoryData(): MemoryDataPoint | undefined {
    if (typeof performance === 'undefined' || !('memory' in performance)) {
      return undefined;
    }

    const memory = (performance as any).memory;
    const navigatorMemory = navigator.deviceMemory || 0;
    const totalMemory = navigatorMemory * 1024 * 1024 * 1024; // 转换为字节

    const memoryData: MemoryDataPoint = {
      timestamp: Date.now(),
      used: memory.usedJSHeapSize,
      total: totalMemory,
      usage: totalMemory > 0 ? Math.round((memory.usedJSHeapSize / totalMemory) * 100) : 0,
      jsHeapSizeUsed: memory.usedJSHeapSize,
      jsHeapSizeTotal: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };

    // 更新历史数据
    this.memoryHistory.push(memoryData);
    if (this.memoryHistory.length > this.config.maxHistoryPoints!) {
      this.memoryHistory.shift();
    }

    return memoryData;
  }

  /**
   * 收集GPU数据
   */
  private collectGPUData(): GPUDataPoint | undefined {
    // 检查是否支持GPU监控
    if (typeof (navigator as any).gpu === 'undefined') {
      return undefined;
    }

    // 目前WebGPU API还在发展中，这里使用模拟数据
    const gpuData: GPUDataPoint = {
      timestamp: Date.now(),
      usage: Math.round(Math.random() * 50), // 模拟GPU使用率
      memoryUsed: Math.round(Math.random() * 1024 * 1024 * 100) // 模拟GPU内存使用
    };

    // 更新历史数据
    this.gpuHistory.push(gpuData);
    if (this.gpuHistory.length > this.config.maxHistoryPoints!) {
      this.gpuHistory.shift();
    }

    return gpuData;
  }

  /**
   * 收集网络数据
   */
  private collectNetworkData(): NetworkDataPoint | undefined {
    // 这里使用模拟数据，实际应用中可以通过navigator.connection获取
    const networkData: NetworkDataPoint = {
      timestamp: Date.now(),
      downloadSpeed: Math.round(Math.random() * 100 * 1024 * 1024), // 模拟下载速度
      uploadSpeed: Math.round(Math.random() * 50 * 1024 * 1024), // 模拟上传速度
      connections: Math.round(Math.random() * 10) // 模拟连接数量
    };

    // 更新历史数据
    this.networkHistory.push(networkData);
    if (this.networkHistory.length > this.config.maxHistoryPoints!) {
      this.networkHistory.shift();
    }

    return networkData;
  }

  /**
   * 收集资源数据
   */
  private collectResourceData(): ResourceDataPoint | undefined {
    // 从资源管理器获取数据
    // 这里使用模拟数据，实际应用中可以集成ResourceManager
    const resourceData: ResourceDataPoint = {
      timestamp: Date.now(),
      loaded: Math.round(Math.random() * 100),
      loading: Math.round(Math.random() * 10),
      failed: Math.round(Math.random() * 5),
      total: Math.round(Math.random() * 115),
      successRate: Math.round(Math.random() * 20 + 80)
    };

    // 更新历史数据
    this.resourceHistory.push(resourceData);
    if (this.resourceHistory.length > this.config.maxHistoryPoints!) {
      this.resourceHistory.shift();
    }

    return resourceData;
  }

  /**
   * 检查性能警告
   * @param data 性能数据
   */
  private checkPerformanceWarnings(data: PerformanceData): void {
    // 检查低帧率
    if (data.fps.fps < 30) {
      this.triggerEvent('fps-drop', data);
    }

    // 检查高内存使用率
    if (data.memory && data.memory.usage > 80) {
      this.triggerEvent('high-memory', data);
    }
  }

  /**
   * 输出性能数据到控制台
   * @param data 性能数据
   */
  private logPerformanceData(data: PerformanceData): void {
    console.groupCollapsed(`Performance Update (${new Date().toLocaleTimeString()})`);
    console.log('FPS:', `${data.fps.fps} (avg: ${data.fps.avgFPS}, min: ${data.fps.minFPS}, max: ${data.fps.maxFPS})`);
    
    if (data.memory) {
      console.log('Memory:', `${this.formatBytes(data.memory.used)} / ${this.formatBytes(data.memory.total)} (${data.memory.usage}%)`);
    }
    
    if (data.gpu) {
      console.log('GPU:', `${data.gpu.usage}% usage, ${this.formatBytes(data.gpu.memoryUsed)} memory`);
    }
    
    if (data.network) {
      console.log('Network:', `${this.formatBytes(data.network.downloadSpeed)}/s down, ${this.formatBytes(data.network.uploadSpeed)}/s up`);
    }
    
    if (data.resource) {
      console.log('Resources:', `${data.resource.loaded}/${data.resource.total} loaded, ${data.resource.successRate}% success`);
    }
    
    console.groupEnd();
  }

  /**
   * 格式化字节数为可读格式
   * @param bytes 字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  private triggerEvent(eventName: string, data: PerformanceData): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * 添加事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: (data: PerformanceData) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback: (data: PerformanceData) => void): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      this.eventListeners.set(
        eventName,
        listeners.filter(listener => listener !== callback)
      );
    }
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.stop();
  }

  /**
   * 获取历史性能数据
   */
  getHistory() {
    return {
      fps: [...this.fpsHistory],
      memory: [...this.memoryHistory],
      gpu: [...this.gpuHistory],
      network: [...this.networkHistory],
      resource: [...this.resourceHistory]
    };
  }

  /**
   * 获取当前性能状态
   */
  getCurrentStatus(): PerformanceData | null {
    if (this.fpsHistory.length === 0) {
      return null;
    }

    return this.collectPerformanceData(this.fpsHistory[this.fpsHistory.length - 1].fps);
  }

  /**
   * 清空历史数据
   */
  clearHistory(): void {
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.gpuHistory = [];
    this.networkHistory = [];
    this.resourceHistory = [];
  }

  /**
   * 获取性能评分（0-100）
   */
  getPerformanceScore(): number {
    let score = 100;
    const currentData = this.getCurrentStatus();

    if (!currentData) {
      return 0;
    }

    // 根据FPS评分
    if (currentData.fps.fps < 30) {
      score -= 50;
    } else if (currentData.fps.fps < 50) {
      score -= 20;
    }

    // 根据内存评分
    if (currentData.memory && currentData.memory.usage > 80) {
      score -= 30;
    } else if (currentData.memory && currentData.memory.usage > 60) {
      score -= 10;
    }

    // 根据资源加载评分
    if (currentData.resource && currentData.resource.successRate < 90) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 销毁性能监控器
   */
  dispose(): void {
    this.stop();
    this.eventListeners.clear();
    this.clearHistory();
  }
}

/**
 * 创建性能监控器实例
 */
export const createPerformanceMonitor = (config?: Partial<PerformanceMonitorConfig>) => {
  return new PerformanceMonitor(config);
};

/**
 * 全局性能监控器实例
 */
export const performanceMonitor = new PerformanceMonitor();
