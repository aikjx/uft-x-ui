/**
 * 服务层入口文件
 * 统一管理所有服务的注册和初始化
 */

import { serviceContainer, Injectable, ServiceLifetime } from './ServiceContainer';
import { FormulaService } from './formulaService';
import { VisualizationService } from './visualizationService';
import { FieldTheoristPerformanceMonitor } from './fieldTheoryService';
import { ErrorMonitoringService } from './ErrorMonitoringService';

/**
 * 注册所有服务
 */
export const registerAllServices = (): void => {
  // 注册服务
  serviceContainer.register(FormulaService, FormulaService, {
    lifetime: ServiceLifetime.SINGLETON
  });
  
  serviceContainer.register(VisualizationService, VisualizationService, {
    lifetime: ServiceLifetime.SINGLETON
  });
  
  serviceContainer.register(FieldTheoristPerformanceMonitor, FieldTheoristPerformanceMonitor, {
    lifetime: ServiceLifetime.SINGLETON
  });
  
  serviceContainer.register(ErrorMonitoringService, ErrorMonitoringService, {
    lifetime: ServiceLifetime.SINGLETON
  }); // 错误监控服务，无需依赖
  
  console.log('📋 All services registered successfully');
};

/**
 * 初始化所有服务
 */
export const initializeAllServices = async (): Promise<void> => {
  try {
    await serviceContainer.initializeAllServices();
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
  serviceContainer.disposeAllServices();
  console.log('💥 All services disposed successfully');
};

/**
 * 导出服务容器
 */
export { serviceContainer };
export type { PerformanceData } from './fieldTheoryService';
