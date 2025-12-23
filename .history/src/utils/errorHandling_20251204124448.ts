/**
 * 增强的错误处理和恢复机制
 */

import { eventSystem, APP_EVENTS } from './eventSystem';
import { useVisualizationActions } from '../state/VisualizationState';

// 错误类型定义
export enum ErrorType {
  RENDER_ERROR = 'render_error',
  RESOURCE_LOAD_ERROR = 'resource_load_error',
  PERFORMANCE_ERROR = 'performance_error',
  CONFIG_ERROR = 'config_error',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误上下文
export interface ErrorContext {
  componentName?: string;
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  stackTrace?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    performanceScore: number;
  };
  additionalData?: Record<string, any>;
}

// 错误信息
export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  context: ErrorContext;
  isRecovered: boolean;
  recoveryAttempts: number;
  recoveryStrategy?: string;
  recoveryTime?: number;
}

// 错误恢复策略类型
export type RecoveryStrategy = 'reload' | 'reset' | 'fallback' | 'ignore' | 'custom';

// 错误处理配置
export interface ErrorHandlingConfig {
  enableErrorLogging: boolean;
  enableErrorReporting: boolean;
  enableAutoRecovery: boolean;
  maxRecoveryAttempts: number;
  recoveryDelay: number;
  errorReportUrl?: string;
  ignoredErrorPatterns: RegExp[];
  severityThreshold: ErrorSeverity;
}

// 错误处理器类型
export type ErrorHandler = (error: Error, errorInfo: Partial<ErrorInfo>) => void;

/**
 * 错误处理管理器
 */
export class ErrorHandlingManager {
  private static instance: ErrorHandlingManager;
  private config: ErrorHandlingConfig;
  private errorHandlers: Map<ErrorType, ErrorHandler[]> = new Map();
  private globalErrorHandler: ErrorHandler | null = null;
  private errorHistory: ErrorInfo[] = [];
  private recoveryAttempts: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();

  private constructor(config: ErrorHandlingConfig = {}) {
    this.config = {
      enableErrorLogging: true,
      enableErrorReporting: true,
      enableAutoRecovery: true,
      maxRecoveryAttempts: 3,
      recoveryDelay: 1000,
      ignoredErrorPatterns: [
        /THREE\.Object3D\.add: object not an instance of THREE\.Object3D/,
        /WebGL: INVALID_ENUM/,
        /WebGL: INVALID_OPERATION/,
        /WebGL: OUT_OF_MEMORY/,
        /ResizeObserver loop completed with undelivered notifications/,
        /Script error\./
      ],
      severityThreshold: ErrorSeverity.MEDIUM,
      ...config
    };

    this.setupGlobalErrorHandlers();
    this.setupEventListeners();
  }

  /**
   * 获取错误处理管理器实例
   */
  public static getInstance(config?: ErrorHandlingConfig): ErrorHandlingManager {
    if (!ErrorHandlingManager.instance) {
      ErrorHandlingManager.instance = new ErrorHandlingManager(config);
    }
    return ErrorHandlingManager.instance;
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    // 监听未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // 监听资源加载错误
    window.addEventListener('load', () => {
      // 监听图片加载错误
      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', (event) => {
          this.handleResourceError(event as unknown as Error, ErrorType.RESOURCE_LOAD_ERROR, {
            resourceUrl: (event.target as HTMLImageElement).src
          });
        });
      });
    });

    // 监听Canvas错误
    if (typeof HTMLCanvasElement !== 'undefined') {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(...args) {
        const context = originalGetContext.apply(this, args);
        if (context) {
          // 保存原始的错误回调
          const originalError = context.onerror;
          context.onerror = (error: any) => {
            this.handleCanvasError(error);
            if (originalError) {
              originalError.call(context, error);
            }
          };
        }
        return context;
      };
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听渲染错误事件
    eventSystem.on(APP_EVENTS.RENDER_ERROR, (data: any) => {
      this.handleError(
        data.error || new Error('Render error'),
        ErrorType.RENDER_ERROR,
        ErrorSeverity.HIGH,
        {
          componentName: 'ThreeJSVisualization',
          additionalData: data
        }
      );
    });

    // 监听资源加载错误事件
    eventSystem.on(APP_EVENTS.RESOURCE_ERROR, (data: any) => {
      this.handleError(
        data.error || new Error('Resource load error'),
        ErrorType.RESOURCE_LOAD_ERROR,
        ErrorSeverity.MEDIUM,
        {
          componentName: 'ResourceManager',
          additionalData: data
        }
      );
    });

    // 监听性能下降事件
    eventSystem.on(APP_EVENTS.PERFORMANCE_DROP, (data: any) => {
      this.handleError(
        new Error('Performance dropped below threshold'),
        ErrorType.PERFORMANCE_ERROR,
        ErrorSeverity.LOW,
        {
          componentName: 'PerformanceMonitor',
          additionalData: data
        }
      );
    });
  }

  /**
   * 处理全局错误
   */
  private handleGlobalError(event: ErrorEvent): void {
    // 检查是否应该忽略该错误
    if (this.shouldIgnoreError(event.message)) {
      return;
    }

    const errorInfo: Partial<ErrorInfo> = {
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.HIGH,
      context: {
        fileName: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        stackTrace: event.error?.stack || '',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          type: this.getDeviceType(),
          performanceScore: this.getPerformanceScore()
        }
      }
    };

    this.handleError(event.error || new Error(event.message), errorInfo);
  }

  /**
   * 处理未捕获的Promise错误
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    // 检查是否应该忽略该错误
    if (this.shouldIgnoreError(event.reason?.message || '')) {
      return;
    }

    const errorInfo: Partial<ErrorInfo> = {
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          type: this.getDeviceType(),
          performanceScore: this.getPerformanceScore()
        }
      }
    };

    this.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      errorInfo
    );
  }

  /**
   * 处理资源加载错误
   */
  private handleResourceError(error: Error, type: ErrorType, additionalData: Record<string, any>): void {
    const errorInfo: Partial<ErrorInfo> = {
      type,
      severity: ErrorSeverity.MEDIUM,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          type: this.getDeviceType(),
          performanceScore: this.getPerformanceScore()
        },
        additionalData
      }
    };

    this.handleError(error, errorInfo);
  }

  /**
   * 处理Canvas错误
   */
  private handleCanvasError(error: any): void {
    const errorInfo: Partial<ErrorInfo> = {
      type: ErrorType.RENDER_ERROR,
      severity: ErrorSeverity.HIGH,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          type: this.getDeviceType(),
          performanceScore: this.getPerformanceScore()
        }
      }
    };

    this.handleError(
      error instanceof Error ? error : new Error(String(error)),
      errorInfo
    );
  }

  /**
   * 处理错误
   */
  public handleError(
    error: Error,
    errorInfo: Partial<ErrorInfo>
  ): ErrorInfo {
    // 生成唯一错误ID
    const errorId = this.generateErrorId();
    
    // 确定错误类型
    const type = errorInfo.type || this.determineErrorType(error.message);
    
    // 确定错误严重程度
    const severity = errorInfo.severity || this.determineSeverity(error);
    
    // 创建完整的错误上下文
    const context: ErrorContext = {
      componentName: errorInfo.context?.componentName,
      functionName: errorInfo.context?.functionName,
      fileName: errorInfo.context?.fileName,
      lineNumber: errorInfo.context?.lineNumber,
      columnNumber: errorInfo.context?.columnNumber,
      stackTrace: error.stack || errorInfo.context?.stackTrace || '',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      deviceInfo: {
        type: this.getDeviceType(),
        performanceScore: this.getPerformanceScore()
      },
      additionalData: errorInfo.context?.additionalData
    };

    // 创建完整的错误信息
    const fullErrorInfo: ErrorInfo = {
      id: errorId,
      type,
      severity,
      message: error.message,
      context,
      isRecovered: false,
      recoveryAttempts: 0,
      recoveryStrategy: errorInfo.recoveryStrategy
    };

    // 检查是否应该忽略该错误
    if (this.shouldIgnoreError(fullErrorInfo.message)) {
      return fullErrorInfo;
    }

    // 更新错误计数
    const errorKey = `${type}:${fullErrorInfo.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // 添加到错误历史
    this.errorHistory.push(fullErrorInfo);
    // 只保留最近100个错误
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift();
    }

    // 触发全局错误事件
    eventSystem.emit(APP_EVENTS.APP_ERROR, fullErrorInfo);

    // 调用类型特定的错误处理器
    const typeHandlers = this.errorHandlers.get(type) || [];
    typeHandlers.forEach(handler => {
      try {
        handler(error, fullErrorInfo);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });

    // 调用全局错误处理器
    if (this.globalErrorHandler) {
      try {
        this.globalErrorHandler(error, fullErrorInfo);
      } catch (handlerError) {
        console.error('Error in global error handler:', handlerError);
      }
    }

    // 自动恢复
    if (this.config.enableAutoRecovery) {
      this.attemptAutoRecovery(fullErrorInfo);
    }

    // 记录错误
    if (this.config.enableErrorLogging) {
      this.logError(fullErrorInfo);
    }

    // 报告错误
    if (this.config.enableErrorReporting && this.shouldReportError(fullErrorInfo)) {
      this.reportError(fullErrorInfo);
    }

    return fullErrorInfo;
  }

  /**
   * 注册特定类型的错误处理器
   */
  public registerErrorHandler(type: ErrorType, handler: ErrorHandler): void {
    if (!this.errorHandlers.has(type)) {
      this.errorHandlers.set(type, []);
    }
    this.errorHandlers.get(type)?.push(handler);
  }

  /**
   * 注册全局错误处理器
   */
  public registerGlobalErrorHandler(handler: ErrorHandler): void {
    this.globalErrorHandler = handler;
  }

  /**
   * 移除特定类型的错误处理器
   */
  public removeErrorHandler(type: ErrorType, handler: ErrorHandler): void {
    const handlers = this.errorHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 移除全局错误处理器
   */
  public removeGlobalErrorHandler(): void {
    this.globalErrorHandler = null;
  }

  /**
   * 尝试自动恢复
   */
  private attemptAutoRecovery(errorInfo: ErrorInfo): void {
    // 检查是否已超过最大恢复尝试次数
    const attemptCount = this.recoveryAttempts.get(errorInfo.id) || 0;
    if (attemptCount >= this.config.maxRecoveryAttempts) {
      return;
    }

    // 增加恢复尝试次数
    this.recoveryAttempts.set(errorInfo.id, attemptCount + 1);

    // 根据错误类型选择恢复策略
    const strategy = this.getRecoveryStrategy(errorInfo);
    errorInfo.recoveryStrategy = strategy;

    // 延迟执行恢复策略
    setTimeout(() => {
      this.executeRecoveryStrategy(strategy, errorInfo);
    }, this.config.recoveryDelay);
  }

  /**
   * 获取恢复策略
   */
  private getRecoveryStrategy(errorInfo: ErrorInfo): RecoveryStrategy {
    switch (errorInfo.type) {
      case ErrorType.RENDER_ERROR:
        return 'reset';
      case ErrorType.RESOURCE_LOAD_ERROR:
        return 'reload';
      case ErrorType.PERFORMANCE_ERROR:
        return 'fallback';
      case ErrorType.CONFIG_ERROR:
        return 'reset';
      case ErrorType.API_ERROR:
        return 'reload';
      case ErrorType.NETWORK_ERROR:
        return 'ignore';
      default:
        return 'fallback';
    }
  }

  /**
   * 执行恢复策略
   */
  private executeRecoveryStrategy(strategy: RecoveryStrategy, errorInfo: ErrorInfo): void {
    try {
      switch (strategy) {
        case 'reload':
          // 重新加载资源或组件
          this.handleReloadRecovery(errorInfo);
          break;
        case 'reset':
          // 重置状态或组件
          this.handleResetRecovery(errorInfo);
          break;
        case 'fallback':
          // 使用降级方案
          this.handleFallbackRecovery(errorInfo);
          break;
        case 'ignore':
          // 忽略错误，继续执行
          this.handleIgnoreRecovery(errorInfo);
          break;
        case 'custom':
          // 自定义恢复策略
          this.handleCustomRecovery(errorInfo);
          break;
      }

      // 更新错误状态
      errorInfo.isRecovered = true;
      errorInfo.recoveryTime = Date.now();

      // 触发恢复事件
      eventSystem.emit(APP_EVENTS.PERFORMANCE_RECOVER, {
        error: errorInfo,
        strategy
      });

    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      errorInfo.isRecovered = false;
    }
  }

  /**
   * 处理重新加载恢复策略
   */
  private handleReloadRecovery(errorInfo: ErrorInfo): void {
    // 重新加载资源或组件
    eventSystem.emit(APP_EVENTS.RESOURCE_LOAD, {
      id: errorInfo.context.additionalData?.id,
      url: errorInfo.context.additionalData?.url,
      type: errorInfo.context.additionalData?.type
    });
  }

  /**
   * 处理重置恢复策略
   */
  private handleResetRecovery(errorInfo: ErrorInfo): void {
    // 重置状态或组件
    eventSystem.emit(APP_EVENTS.SCENE_CLEAR, {
      reason: 'error_recovery',
      errorId: errorInfo.id
    });

    // 重置可视化状态
    const visualizationActions = useVisualizationActions();
    visualizationActions.resetState();
  }

  /**
   * 处理降级恢复策略
   */
  private handleFallbackRecovery(errorInfo: ErrorInfo): void {
    // 使用降级方案，如降低渲染质量
    eventSystem.emit(APP_EVENTS.PERFORMANCE_DROP, {
      type: 'fallback_mode',
      error: errorInfo
    });
  }

  /**
   * 处理忽略恢复策略
   */
  private handleIgnoreRecovery(errorInfo: ErrorInfo): void {
    // 忽略错误，继续执行
    console.warn('Ignoring error:', errorInfo.message);
  }

  /**
   * 处理自定义恢复策略
   */
  private handleCustomRecovery(errorInfo: ErrorInfo): void {
    // 触发自定义恢复事件，由应用程序处理
    eventSystem.emit(APP_EVENTS.APP_ERROR, {
      ...errorInfo,
      action: 'recover'
    });
  }

  /**
   * 记录错误
   */
  private logError(errorInfo: ErrorInfo): void {
    const logMessage = `[${errorInfo.type.toUpperCase()}] ${errorInfo.severity.toUpperCase()}: ${errorInfo.message}`;
    
    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(logMessage, errorInfo);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, errorInfo);
        break;
      case ErrorSeverity.LOW:
        console.info(logMessage, errorInfo);
        break;
    }
  }

  /**
   * 报告错误
   */
  private reportError(errorInfo: ErrorInfo): void {
    // 如果配置了错误报告URL，则发送错误报告
    if (this.config.errorReportUrl) {
      try {
        fetch(this.config.errorReportUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorInfo),
          keepalive: true
        }).catch(reportError => {
          console.error('Failed to report error:', reportError);
        });
      } catch (reportError) {
        console.error('Failed to report error:', reportError);
      }
    }
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(message: string): ErrorType {
    if (message.includes('render')) {
      return ErrorType.RENDER_ERROR;
    } else if (message.includes('load') || message.includes('resource')) {
      return ErrorType.RESOURCE_LOAD_ERROR;
    } else if (message.includes('performance') || message.includes('fps')) {
      return ErrorType.PERFORMANCE_ERROR;
    } else if (message.includes('config')) {
      return ErrorType.CONFIG_ERROR;
    } else if (message.includes('api')) {
      return ErrorType.API_ERROR;
    } else if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return ErrorType.NETWORK_ERROR;
    } else {
      return ErrorType.UNKNOWN_ERROR;
    }
  }

  /**
   * 确定错误严重程度
   */
  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('fatal') || message.includes('critical') || message.includes('out of memory')) {
      return ErrorSeverity.CRITICAL;
    } else if (message.includes('error') || message.includes('failed') || message.includes('cannot')) {
      return ErrorSeverity.HIGH;
    } else if (message.includes('warning') || message.includes('deprecated') || message.includes('obsolete')) {
      return ErrorSeverity.MEDIUM;
    } else {
      return ErrorSeverity.LOW;
    }
  }

  /**
   * 检查是否应该忽略该错误
   */
  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoredErrorPatterns.some(pattern => pattern.test(message));
  }

  /**
   * 检查是否应该报告该错误
   */
  private shouldReportError(errorInfo: ErrorInfo): boolean {
    const severityOrder = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 1,
      [ErrorSeverity.HIGH]: 2,
      [ErrorSeverity.CRITICAL]: 3
    };
    
    const thresholdOrder = severityOrder[this.config.severityThreshold];
    const errorOrder = severityOrder[errorInfo.severity];
    
    return errorOrder >= thresholdOrder;
  }

  /**
   * 生成唯一错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 获取设备类型
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad/i.test(userAgent)) {
        return 'tablet';
      }
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * 获取设备性能分数
   */
  private getPerformanceScore(): number {
    try {
      if (typeof performance !== 'undefined' && performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        return Math.max(0, Math.min(100, 100 - loadTime / 10));
      }
    } catch (error) {
      console.error('Failed to get performance score:', error);
    }
    return 50; // 默认分数
  }

  /**
   * 获取错误历史
   */
  public getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory];
  }

  /**
   * 获取错误统计信息
   */
  public getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      byType: this.errorHistory.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<ErrorType, number>),
      bySeverity: this.errorHistory.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<ErrorSeverity, number>),
      recoveredErrors: this.errorHistory.filter(error => error.isRecovered).length,
      unrecoveredErrors: this.errorHistory.filter(error => !error.isRecovered).length,
      errorCounts: this.errorCounts
    };
  }

  /**
   * 清空错误历史
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
    this.recoveryAttempts.clear();
    this.errorCounts.clear();
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): ErrorHandlingConfig {
    return { ...this.config };
  }
}

// 导出错误处理管理器实例
export const errorHandlingManager = ErrorHandlingManager.getInstance({
  enableErrorLogging: process.env.NODE_ENV === 'development',
  enableErrorReporting: process.env.NODE_ENV === 'production',
  enableAutoRecovery: true,
  maxRecoveryAttempts: 3,
  recoveryDelay: 1000,
  ignoredErrorPatterns: [
    /THREE\.Object3D\.add: object not an instance of THREE\.Object3D/,
    /ResizeObserver loop completed with undelivered notifications/,
    /Script error\./
  ],
  severityThreshold: ErrorSeverity.MEDIUM
});

/**
 * React错误边界工具函数
 */
export const handleReactError = (error: Error, errorInfo: React.ErrorInfo): ErrorInfo => {
  const errorContext: ErrorContext = {
    componentName: errorInfo.componentStack?.split('\n')[1]?.trim() || '',
    stackTrace: errorInfo.componentStack || '',
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    deviceInfo: {
      type: errorHandlingManager['getDeviceType'](),
      performanceScore: errorHandlingManager['getPerformanceScore']()
    }
  };

  return errorHandlingManager.handleError(error, {
    type: ErrorType.RENDER_ERROR,
    severity: ErrorSeverity.HIGH,
    context: errorContext
  });
};

/**
 * 错误捕获装饰器
 */
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    componentName?: string;
    fallbackValue?: ReturnType<T>;
  }
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      const errorInfo: Partial<ErrorInfo> = {
        type: options?.type || ErrorType.UNKNOWN_ERROR,
        severity: options?.severity || ErrorSeverity.MEDIUM,
        context: {
          componentName: options?.componentName,
          functionName: fn.name,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          deviceInfo: {
            type: errorHandlingManager['getDeviceType'](),
            performanceScore: errorHandlingManager['getPerformanceScore']()
          }
        }
      };

      errorHandlingManager.handleError(error instanceof Error ? error : new Error(String(error)), errorInfo);
      return options?.fallbackValue as ReturnType<T>;
    }
  }) as T;
};

/**
 * 异步错误捕获函数
 */
export const catchAsyncError = async <T>(
  promise: Promise<T>,
  options?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    componentName?: string;
    fallbackValue?: T;
  }
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    const errorInfo: Partial<ErrorInfo> = {
      type: options?.type || ErrorType.UNKNOWN_ERROR,
      severity: options?.severity || ErrorSeverity.MEDIUM,
      context: {
        componentName: options?.componentName,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          type: errorHandlingManager['getDeviceType'](),
          performanceScore: errorHandlingManager['getPerformanceScore']()
        }
      }
    };

    errorHandlingManager.handleError(error instanceof Error ? error : new Error(String(error)), errorInfo);
    return options?.fallbackValue as T;
  }
};
