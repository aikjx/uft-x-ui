import { DataProvider } from './DataProvider';
import { FORMULAS, DEFAULT_SIMULATION_PARAMETERS } from '../constants';
import { Formula } from '../types';

// 公式数据提供者实现
export class FormulaDataProvider extends DataProvider {
  private formulas: Formula[] = FORMULAS;
  private physicsParams: Record<string, any> = { ...DEFAULT_SIMULATION_PARAMETERS };
  private simulationResults: Map<string, any> = new Map();
  
  /**
   * 获取所有公式数据
   * @returns 公式数组
   */
  async getFormulas(): Promise<Formula[]> {
    const cacheKey = 'formulas:all';
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // 模拟异步请求
    await this.delay(100);
    
    const result = [...this.formulas];
    this.setCache(cacheKey, result);
    return result;
  }
  
  /**
   * 根据ID获取公式
   * @param id 公式ID
   * @returns 公式或undefined
   */
  async getFormulaById(id: number): Promise<Formula | undefined> {
    const cacheKey = `formulas:${id}`;
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // 模拟异步请求
    await this.delay(50);
    
    const result = this.formulas.find(formula => formula.id === id);
    if (result) {
      this.setCache(cacheKey, result);
    }
    return result;
  }
  
  /**
   * 根据类别获取公式
   * @param category 公式类别
   * @returns 公式数组
   */
  async getFormulasByCategory(category: string): Promise<Formula[]> {
    const cacheKey = `formulas:category:${category}`;
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // 模拟异步请求
    await this.delay(75);
    
    const result = this.formulas.filter(formula => formula.category === category);
    this.setCache(cacheKey, result);
    return result;
  }
  
  /**
   * 获取物理参数
   * @returns 物理参数对象
   */
  async getPhysicsParameters(): Promise<Record<string, any>> {
    const cacheKey = 'physics:params';
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // 模拟异步请求
    await this.delay(50);
    
    const result = { ...this.physicsParams };
    this.setCache(cacheKey, result);
    return result;
  }
  
  /**
   * 更新物理参数
   * @param params 新的物理参数
   */
  async updatePhysicsParameters(params: Record<string, any>): Promise<void> {
    // 模拟异步请求
    await this.delay(100);
    
    this.physicsParams = { ...this.physicsParams, ...params };
    
    // 清除相关缓存
    this.clearCache('physics:params');
  }
  
  /**
   * 获取模拟结果
   * @param runId 模拟运行ID
   * @returns 模拟结果
   */
  async getSimulationResults(runId: string): Promise<any> {
    const cacheKey = `simulation:${runId}`;
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // 模拟异步请求
    await this.delay(150);
    
    const result = this.simulationResults.get(runId);
    if (result) {
      this.setCache(cacheKey, result);
    }
    return result;
  }
  
  /**
   * 保存模拟结果
   * @param runId 模拟运行ID
   * @param data 模拟结果数据
   */
  async saveSimulationResults(runId: string, data: any): Promise<void> {
    // 模拟异步请求
    await this.delay(200);
    
    this.simulationResults.set(runId, data);
    
    // 设置缓存
    this.setCache(`simulation:${runId}`, data);
  }
  
  /**
   * 模拟延迟
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建单例实例
export const formulaDataProvider = new FormulaDataProvider();