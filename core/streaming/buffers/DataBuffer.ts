// 统一场论可视化系统 - 数据缓冲区
// 版本: v2.0
// 功能: 管理实时数据流的缓冲区

export class DataBuffer {
  private buffer: any[] = [];
  private maxSize: number;
  private useCircularBuffer: boolean = true;
  private enableDataValidation: boolean = true;
  private lastAccessTime: number = 0;
  private dataRate: number = 0; // 数据率 (items/second)
  private lastDataCount: number = 0;
  private lastRateCalculationTime: number = 0;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
    console.log(`📊 数据缓冲区初始化，最大容量: ${maxSize}`);
  }

  public addData(data: any): void {
    // 数据验证
    if (this.enableDataValidation && !this.validateData(data)) {
      console.warn('⚠️  数据验证失败，跳过添加');
      return;
    }

    // 检查缓冲区大小
    if (this.buffer.length >= this.maxSize) {
      if (this.useCircularBuffer) {
        // 循环缓冲区 - 移除最旧的数据
        this.buffer.shift();
      } else {
        // 固定大小缓冲区 - 拒绝新数据
        console.warn('⚠️  缓冲区已满，跳过添加数据');
        return;
      }
    }

    // 添加数据
    this.buffer.push({
      data,
      timestamp: Date.now()
    });

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    // 更新数据率
    this.updateDataRate();
  }

  public addMultipleData(dataArray: any[]): void {
    dataArray.forEach(data => this.addData(data));
  }

  public getRecentData(count: number = 1): any[] {
    if (count <= 0) return [];
    if (this.buffer.length === 0) return [];

    // 获取最近的数据
    const startIndex = Math.max(0, this.buffer.length - count);
    const recentData = this.buffer.slice(startIndex).map(item => item.data);

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return recentData;
  }

  public getDataAt(index: number): any {
    if (index < 0 || index >= this.buffer.length) {
      return null;
    }

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return this.buffer[index].data;
  }

  public getFirstData(): any {
    if (this.buffer.length === 0) return null;

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return this.buffer[0].data;
  }

  public getLastData(): any {
    if (this.buffer.length === 0) return null;

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return this.buffer[this.buffer.length - 1].data;
  }

  public getDataInTimeRange(startTime: number, endTime: number): any[] {
    const dataInRange = this.buffer
      .filter(item => item.timestamp >= startTime && item.timestamp <= endTime)
      .map(item => item.data);

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return dataInRange;
  }

  public clear(): void {
    this.buffer = [];
    this.lastDataCount = 0;
    this.dataRate = 0;
    console.log('🧹 缓冲区已清空');
  }

  public getSize(): number {
    return this.buffer.length;
  }

  public getMaxSize(): number {
    return this.maxSize;
  }

  public setMaxSize(size: number): void {
    this.maxSize = size;
    
    // 如果新大小小于当前大小，截断缓冲区
    if (size < this.buffer.length) {
      this.buffer = this.buffer.slice(-size);
      console.log(`📏 缓冲区大小已调整为: ${size}，数据已截断`);
    } else {
      console.log(`📏 缓冲区大小已调整为: ${size}`);
    }
  }

  public isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  public isFull(): boolean {
    return this.buffer.length >= this.maxSize;
  }

  public getFillPercentage(): number {
    return (this.buffer.length / this.maxSize) * 100;
  }

  public getLastAccessTime(): number {
    return this.lastAccessTime;
  }

  public getDataRate(): number {
    return this.dataRate;
  }

  public setUseCircularBuffer(enabled: boolean): void {
    this.useCircularBuffer = enabled;
    console.log(`🔄 循环缓冲区 ${enabled ? '启用' : '禁用'}`);
  }

  public setEnableDataValidation(enabled: boolean): void {
    this.enableDataValidation = enabled;
    console.log(`✅ 数据验证 ${enabled ? '启用' : '禁用'}`);
  }

  public getStats(): any {
    return {
      size: this.buffer.length,
      maxSize: this.maxSize,
      fillPercentage: this.getFillPercentage(),
      lastAccessTime: this.lastAccessTime,
      dataRate: this.dataRate,
      useCircularBuffer: this.useCircularBuffer,
      enableDataValidation: this.enableDataValidation
    };
  }

  private validateData(data: any): boolean {
    // 数据验证逻辑
    if (data === null || data === undefined) {
      return false;
    }

    // 检查数据类型
    if (typeof data === 'object') {
      // 检查对象是否有效
      return Object.keys(data).length > 0;
    }

    return true;
  }

  private updateDataRate(): void {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastRateCalculationTime;

    // 每秒钟计算一次数据率
    if (timeDiff >= 1000) {
      const dataCountDiff = this.buffer.length - this.lastDataCount;
      this.dataRate = dataCountDiff / (timeDiff / 1000);
      
      this.lastDataCount = this.buffer.length;
      this.lastRateCalculationTime = currentTime;
    }
  }

  public filterData(predicate: Function): any[] {
    // 过滤数据
    const filtered = this.buffer
      .filter(item => predicate(item.data))
      .map(item => item.data);

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return filtered;
  }

  public mapData(transform: Function): any[] {
    // 转换数据
    const mapped = this.buffer
      .map(item => transform(item.data))
      .filter(result => result !== undefined);

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return mapped;
  }

  public reduceData(reducer: Function, initialValue: any): any {
    // 归约数据
    const reduced = this.buffer.reduce((accumulator, item) => {
      return reducer(accumulator, item.data);
    }, initialValue);

    // 更新最后访问时间
    this.lastAccessTime = Date.now();

    return reduced;
  }

  public dispose(): void {
    this.clear();
    console.log('🧹 数据缓冲区资源清理完成');
  }
}
