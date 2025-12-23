import { Formula } from '../types';

// 数据提供者接口
export interface IDataProvider {
  // 获取所有公式数据
  getFormulas(): Promise<Formula[]>;
  
  // 根据ID获取公式
  getFormulaById(id: number): Promise<Formula | undefined>;
  
  // 根据类别获取公式
  getFormulasByCategory(category: string): Promise<Formula[]>;
  
  // 获取物理参数
  getPhysicsParameters(): Promise<Record<string, any>>;
  
  // 更新物理参数
  updatePhysicsParameters(params: Record<string, any>): Promise<void>;
  
  // 获取模拟结果
  getSimulationResults(runId: string): Promise<any>;
  
  // 保存模拟结果
  saveSimulationResults(runId: string, data: any): Promise<void>;
}

// 数据提供者基类
export abstract class DataProvider implements IDataProvider {
  protected cache: Map<string, any> = new Map();
  protected cacheExpiry: Map<string, number> = new Map();
  protected cacheDuration: number = 30000; // 缓存持续时间：30秒
  
  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或undefined
   */
  protected getCache(key: string): any {
    const data = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (data && expiry && Date.now() < expiry) {
      return data;
    }
    
    // 清除过期缓存
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return undefined;
  }
  
  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   */
  protected setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.cacheDuration);
  }
  
  /**
   * 清除缓存
   * @param key 可选，特定键的缓存
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
  
  // 实现IDataProvider接口的抽象方法
  abstract getFormulas(): Promise<Formula[]>;
  abstract getFormulaById(id: number): Promise<Formula | undefined>;
  abstract getFormulasByCategory(category: string): Promise<Formula[]>;
  abstract getPhysicsParameters(): Promise<Record<string, any>>;
  abstract updatePhysicsParameters(params: Record<string, any>): Promise<void>;
  abstract getSimulationResults(runId: string): Promise<any>;
  abstract saveSimulationResults(runId: string, data: any): Promise<void>;
}