// 统一场论应用的类型定义
import { Vector3, Color } from 'three';

// 公式类型
export interface Formula {
  id: string;
  name: string;
  category: FormulaCategory;
  description: string;
  formula: string; // MathJax格式的公式字符串
  variables: FormulaVariable[];
  applications: string[];
  isFeatured?: boolean;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  history?: FormulaHistory;
  source?: string;
}

// 公式分类
export type FormulaCategory = 
  | 'gravity' // 引力相关
  | 'electromagnetism' // 电磁相关
  | 'unified' // 统一场论
  | 'quantum' // 量子相关
  | 'classical'; // 经典物理

// 公式变量
export interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
  description: string;
}

// 公式历史信息
export interface FormulaHistory {
  origin: string;
  discoverer?: string;
  year?: number;
  significance: string;
}

// 可视化配置
export interface VisualizationConfig {
  fieldType: 'gravity' | 'electromagnetic' | 'unified';
  parameters: {
    gravity?: GravityParameters;
    electromagnetic?: ElectromagneticParameters;
    unified?: UnifiedParameters;
  };
  visualOptions: VisualOptions;
}

// 引力场参数
export interface GravityParameters {
  mass: number;
  gConstantRatio: number;
  fieldStrength: number;
}

// 电磁场参数
export interface ElectromagneticParameters {
  charge: number;
  current: number;
  fieldStrength: number;
}

// 统一场参数
export interface UnifiedParameters {
  couplingConstant: number;
  spacetimeCurvature: number;
}

// 可视化选项
export interface VisualOptions {
  showFieldLines: boolean;
  showParticles: boolean;
  showGrid: boolean;
  quality: 'low' | 'medium' | 'high';
}

// 模拟参数
export interface SimulationParams {
  timeStep: number;
  duration: number;
  particleCount: number;
  isPaused: boolean;
}

// 渲染性能指标
export interface RenderPerformance {
  fps: number;
  renderTime: number;
  memoryUsage: string;
  frameCount: number;
}

// 导航项
export interface NavItem {
  name: string;
  path: string;
  label: string;
  icon?: string;
}

// 用户配置
export interface UserConfig {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  animationEnabled: boolean;
  autoPlayAnimations: boolean;
  highQualityRendering: boolean;
}

// 实验数据
export interface ExperimentData {
  id: string;
  title: string;
  description: string;
  date: string;
  dataPoints: number[][];
  conclusion?: string;
  relatedFormulas?: string[];
}

// 理论模型
export interface TheoryModel {
  id: string;
  name: string;
  type: 'string' | 'loopQuantumGravity' | 'mTheory' | 'other';
  description: string;
  keyPrinciples: string[];
  mathematicalFramework: string;
  status: 'hypothetical' | 'supported' | 'verified';
  predictions: string[];
  challenges: string[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 事件类型
export type EventType = 
  | 'formulaSelected'
  | 'parameterChanged'
  | 'simulationStarted'
  | 'simulationPaused'
  | 'visualizationUpdated'
  | 'configSaved'
  | 'themeChanged';

// 事件处理器
export interface EventHandler<T = any> {
  (data: T): void;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  timestamp: Date;
  action: string;
  details: any;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// 粒子类型定义
export interface Particle {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  mass?: number;
  charge?: number;
}