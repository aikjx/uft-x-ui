// 通用类型定义
export interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
  category: string;
  parameters?: string[]; // 添加parameters属性
  visualizationType?: string; // 添加可视化类型属性
  complexity?: number; // 添加复杂度属性
}

export interface SimulationParameters {
  spacetime: {
    speed: number;
    curvature: number;
    particleCount: number;
  };
  gravity: {
    mass: number;
    distance: number;
    fieldStrength: number;
  };
  electromagnetic: {
    charge: number;
    fieldStrength: number;
    frequency: number;
  };
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface SimulationDataPoint {
  value: number;
  index: number;
}

// 路由参数类型
export interface RouteParams {
  id?: string;
  simulationType?: string;
}

// Three.js相关类型
export interface ThreeJSVisualizationProps {
  createScene: (scene: THREE.Scene) => void;
  updateScene?: (scene: THREE.Scene, deltaTime: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

// 错误处理相关类型

export enum ErrorCategory {
  RENDER = 'render',
  THREEJS = 'threejs',
  API = 'api',
  STATE = 'state',
  PERFORMANCE = 'performance',
  OTHER = 'other'
}

export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ExtendedErrorInfo {
  category: ErrorCategory;
  level: ErrorLevel;
  timestamp: number;
  userAgent: string;
  url: string;
  componentName: string;
  stack: string;
  context?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  errorInfo: React.ErrorInfo;
  extendedInfo: ExtendedErrorInfo;
}

export interface ErrorMonitoringConfig {
  enableConsoleLogging: boolean;
  enableRemoteReporting: boolean;
  remoteReportingURL?: string;
  sampleRate: number;
  maxErrorsPerMinute: number;
  ignoreErrors: string[];
}

export interface ErrorStats {
  totalErrors: number;
  errorsPerCategory: Record<ErrorCategory, number>;
  errorsPerLevel: Record<ErrorLevel, number>;
  errorsInLastMinute: number;
  lastErrorTimestamp: number;
}

// 性能监控相关类型
export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  frameTime: number;
  memoryUsageMB: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  optimizationLevel: number;
  pixelRatio: number;
}

export interface PerformanceMonitorConfig {
  enablePerformanceMonitoring: boolean;
  monitorUpdateInterval: number;
  enablePerformanceLogging: boolean;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 服务相关类型
export interface Service {
  initialize?(): Promise<void> | void;
  dispose?(): void;
  readonly serviceName: string;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  name: string;
  priority?: number;
  layout?: React.ComponentType<any>;
  requiresAuth?: boolean;
}

// 通知相关类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface NotificationConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration: number;
  showCloseButton: boolean;
  enableAnimations: boolean;
}