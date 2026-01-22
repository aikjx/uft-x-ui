// 统一场论可视化系统 - 数据压缩器
// 版本: v2.0
// 功能: 压缩和解压实时数据流数据

export class DataCompressor {
  private compressionLevel: number = 5; // 1-9
  private useLosslessCompression: boolean = true;
  private enableDeltaCompression: boolean = true;
  private lastData: Map<string, any> = new Map();

  constructor() {
    console.log('📦 数据压缩器初始化');
  }

  public compress(data: any, key: string = 'default'): any {
    // 应用多种压缩技术
    let compressedData = data;

    // 1. 增量压缩
    if (this.enableDeltaCompression) {
      compressedData = this.applyDeltaCompression(compressedData, key);
    }

    // 2. 数据类型优化
    compressedData = this.optimizeDataTypes(compressedData);

    // 3. 结构化压缩
    compressedData = this.structureCompression(compressedData);

    // 4. 无损压缩
    if (this.useLosslessCompression) {
      compressedData = this.losslessCompress(compressedData);
    }

    return compressedData;
  }

  public decompress(compressedData: any, key: string = 'default'): any {
    // 解压缩数据
    let decompressedData = compressedData;

    // 1. 无损解压
    if (this.useLosslessCompression) {
      decompressedData = this.losslessDecompress(decompressedData);
    }

    // 2. 结构化解压
    decompressedData = this.structureDecompression(decompressedData);

    // 3. 数据类型恢复
    decompressedData = this.restoreDataTypes(decompressedData);

    // 4. 增量解压
    if (this.enableDeltaCompression) {
      decompressedData = this.applyDeltaDecompression(decompressedData, key);
    }

    return decompressedData;
  }

  private applyDeltaCompression(data: any, key: string): any {
    // 增量压缩 - 只存储与上次数据的差异
    const lastData = this.lastData.get(key);
    
    if (!lastData) {
      // 第一次压缩，直接存储
      this.lastData.set(key, data);
      return data;
    }

    // 计算差异
    const delta = this.calculateDelta(lastData, data);
    
    // 存储当前数据作为下次的基准
    this.lastData.set(key, data);
    
    return delta;
  }

  private applyDeltaDecompression(delta: any, key: string): any {
    // 增量解压 - 基于上次数据恢复完整数据
    const lastData = this.lastData.get(key);
    
    if (!lastData) {
      // 第一次解压，直接返回
      this.lastData.set(key, delta);
      return delta;
    }

    // 应用差异
    const decompressed = this.applyDelta(lastData, delta);
    
    // 存储恢复后的数据作为下次的基准
    this.lastData.set(key, decompressed);
    
    return decompressed;
  }

  private calculateDelta(oldData: any, newData: any): any {
    // 计算数据差异
    if (typeof oldData !== typeof newData) {
      return newData;
    }

    if (Array.isArray(oldData) && Array.isArray(newData)) {
      return this.calculateArrayDelta(oldData, newData);
    }

    if (typeof oldData === 'object' && oldData !== null && typeof newData === 'object' && newData !== null) {
      return this.calculateObjectDelta(oldData, newData);
    }

    if (oldData !== newData) {
      return newData;
    }

    return null;
  }

  private calculateArrayDelta(oldArray: any[], newArray: any[]): any {
    // 计算数组差异
    const delta = {
      type: 'array',
      changes: []
    };

    // 处理新增元素
    for (let i = 0; i < newArray.length; i++) {
      if (i >= oldArray.length) {
        delta.changes.push({
          index: i,
          type: 'add',
          value: newArray[i]
        });
      } else if (oldArray[i] !== newArray[i]) {
        delta.changes.push({
          index: i,
          type: 'update',
          value: this.calculateDelta(oldArray[i], newArray[i])
        });
      }
    }

    // 处理删除元素
    if (newArray.length < oldArray.length) {
      delta.changes.push({
        type: 'truncate',
        length: newArray.length
      });
    }

    return delta;
  }

  private calculateObjectDelta(oldObj: any, newObj: any): any {
    // 计算对象差异
    const delta = {
      type: 'object',
      changes: {}
    };

    // 处理新增和更新的属性
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        if (!Object.prototype.hasOwnProperty.call(oldObj, key)) {
          delta.changes[key] = {
            type: 'add',
            value: newObj[key]
          };
        } else if (oldObj[key] !== newObj[key]) {
          delta.changes[key] = {
            type: 'update',
            value: this.calculateDelta(oldObj[key], newObj[key])
          };
        }
      }
    }

    // 处理删除的属性
    for (const key in oldObj) {
      if (Object.prototype.hasOwnProperty.call(oldObj, key) && !Object.prototype.hasOwnProperty.call(newObj, key)) {
        delta.changes[key] = {
          type: 'delete'
        };
      }
    }

    return delta;
  }

  private applyDelta(baseData: any, delta: any): any {
    // 应用差异到基准数据
    if (delta === null) {
      return baseData;
    }

    if (delta.type === 'array') {
      return this.applyArrayDelta(baseData, delta);
    }

    if (delta.type === 'object') {
      return this.applyObjectDelta(baseData, delta);
    }

    return delta;
  }

  private applyArrayDelta(baseArray: any[], delta: any): any[] {
    // 应用数组差异
    const result = [...baseArray];

    delta.changes.forEach((change: any) => {
      switch (change.type) {
        case 'add':
          result[change.index] = change.value;
          break;
        case 'update':
          if (result[change.index] !== undefined) {
            result[change.index] = this.applyDelta(result[change.index], change.value);
          }
          break;
        case 'truncate':
          result.length = change.length;
          break;
      }
    });

    return result;
  }

  private applyObjectDelta(baseObj: any, delta: any): any {
    // 应用对象差异
    const result = { ...baseObj };

    for (const key in delta.changes) {
      if (Object.prototype.hasOwnProperty.call(delta.changes, key)) {
        const change = delta.changes[key];
        
        switch (change.type) {
          case 'add':
            result[key] = change.value;
            break;
          case 'update':
            if (result[key] !== undefined) {
              result[key] = this.applyDelta(result[key], change.value);
            }
            break;
          case 'delete':
            delete result[key];
            break;
        }
      }
    }

    return result;
  }

  private optimizeDataTypes(data: any): any {
    // 优化数据类型以减少存储空间
    if (typeof data === 'number') {
      // 数值优化
      if (data === Math.floor(data)) {
        return data; // 整数保持不变
      }
      // 浮点数精度优化
      return Number(data.toFixed(6));
    }

    if (Array.isArray(data)) {
      return data.map(item => this.optimizeDataTypes(item));
    }

    if (typeof data === 'object' && data !== null) {
      const optimized = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          optimized[key] = this.optimizeDataTypes(data[key]);
        }
      }
      return optimized;
    }

    return data;
  }

  private restoreDataTypes(data: any): any {
    // 恢复数据类型
    return data;
  }

  private structureCompression(data: any): any {
    // 结构化压缩 - 优化数据结构
    if (Array.isArray(data)) {
      // 数组压缩
      if (data.length > 0 && typeof data[0] === 'number') {
        // 数值数组压缩
        return {
          type: 'number_array',
          data: data
        };
      }
      return data.map(item => this.structureCompression(item));
    }

    if (typeof data === 'object' && data !== null) {
      // 对象压缩
      const compressed = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          compressed[key] = this.structureCompression(data[key]);
        }
      }
      return compressed;
    }

    return data;
  }

  private structureDecompression(data: any): any {
    // 结构化解压
    if (data.type === 'number_array') {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.structureDecompression(item));
    }

    if (typeof data === 'object' && data !== null) {
      const decompressed = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          decompressed[key] = this.structureDecompression(data[key]);
        }
      }
      return decompressed;
    }

    return data;
  }

  private losslessCompress(data: any): any {
    // 无损压缩
    // 这里可以实现更复杂的压缩算法
    return data;
  }

  private losslessDecompress(data: any): any {
    // 无损解压
    return data;
  }

  public setCompressionLevel(level: number): void {
    this.compressionLevel = Math.max(1, Math.min(9, level));
    console.log(`📊 压缩级别设置为: ${this.compressionLevel}`);
  }

  public enableLosslessCompression(enabled: boolean): void {
    this.useLosslessCompression = enabled;
    console.log(`🔄 无损压缩 ${enabled ? '启用' : '禁用'}`);
  }

  public enableDeltaCompression(enabled: boolean): void {
    this.enableDeltaCompression = enabled;
    console.log(`🔄 增量压缩 ${enabled ? '启用' : '禁用'}`);
  }

  public clearHistory(): void {
    this.lastData.clear();
    console.log('🧹 压缩历史已清理');
  }

  public getCompressionRatio(original: any, compressed: any): number {
    // 计算压缩率
    const originalSize = this.calculateSize(original);
    const compressedSize = this.calculateSize(compressed);
    
    if (originalSize === 0) return 0;
    return compressedSize / originalSize;
  }

  private calculateSize(data: any): number {
    // 估算数据大小
    if (typeof data === 'string') {
      return data.length;
    }
    if (typeof data === 'number') {
      return 8; // 8 bytes for number
    }
    if (Array.isArray(data)) {
      return data.reduce((sum, item) => sum + this.calculateSize(item), 0);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).reduce((sum, value) => sum + this.calculateSize(value), 0);
    }
    return 0;
  }

  public dispose(): void {
    this.lastData.clear();
    console.log('🧹 数据压缩器资源清理完成');
  }
}
