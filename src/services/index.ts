/**
 * 服务层入口文件
 * 统一管理所有服务的注册和初始化
 */

import { serviceManager } from './ServiceManager';
import { FormulaService, formulaService } from './formulaService';
import { VisualizationService, visualizationService } from './visualizationService';
import { FieldTheoristPerformanceMonitor } from './fieldTheoryService';

/**
 * 注册所有服务
 */
export const registerAllServices = (): void => {
  // 创建服务实例
  const performanceMonitor = new FieldTheoristPerformanceMonitor();
  
  // 注册服务
  serviceManager.register(formulaService);
  serviceManager.register(visualizationService, ['FormulaService']);
  serviceManager.register(performanceMonitor, ['FormulaService']);
  
  console.log('📋 All services registered successfully');
};

/**
 * 初始化所有服务
 */
export const initializeAllServices = async (): Promise<void> => {
  try {
    await serviceManager.initializeAllServices();
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
};

/**
 * 销毁所有服务
 */
export const disposeAllServices = (): void => {
  serviceManager.disposeAllServices();
  console.log('💥 All services disposed successfully');
};

/**
 * 导出服务管理器和服务实例
 */
export { serviceManager };
export { formulaService };
export { visualizationService };
export { FieldTheoristPerformanceMonitor };
export type { PerformanceData } from './fieldTheoryService';
