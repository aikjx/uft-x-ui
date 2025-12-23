/**
 * 统一场论核心类型定义
 * Unified Field Theory Core Type Definitions
 */

import * as THREE from 'three'

// ==================== 核心公式类型 ====================

/**
 * 统一场论19个核心公式枚举
 */
export enum FormulaType {
  SPACETIME_UNITY = 1, // 时空同一化方程
  SPIRAL_SPACETIME = 2, // 三维螺旋时空方程
  MASS_DEFINITION = 3, // 质量定义方程
  GRAVITY_FIELD = 4, // 引力场定义方程
  STATIC_MOMENTUM = 5, // 静止动量方程
  MOTION_MOMENTUM = 6, // 运动动量方程
  UNIFIED_FORCE = 7, // 宇宙大统一方程
  SPACE_WAVE = 8, // 空间波动方程
  CHARGE_DEFINITION = 9, // 电荷定义方程
  ELECTRIC_FIELD = 10, // 电场定义方程
  MAGNETIC_FIELD = 11, // 磁场定义方程
  GRAVITY_TO_EM = 12, // 变化的引力场产生电磁场
  MAGNETIC_VECTOR = 13, // 磁矢势方程
  GRAVITY_TO_E = 14, // 变化的引力场产生电场
  MAGNETIC_TO_FIELDS = 15, // 变化的磁场产生引力场和电场
  ENERGY_EQUATION = 16, // 统一场论能量方程
  LIGHTSPEED_DYNAMICS = 17, // 光速飞行器动力学方程
  NUCLEAR_FORCE = 18, // 核力场定义方程
  GRAVITY_LIGHTSPEED = 19 // 引力光速统一方程
}

/**
 * 公式参数接口
 */
export interface FormulaParameters {
  // 时空参数
  c?: number // 光速
  t?: number // 时间
  r?: number // 半径
  omega?: number // 角速度
  h?: number // 螺旋高度参数

  // 质量与密度参数
  m?: number // 质量
  m0?: number // 静止质量
  k?: number // 比例常数
  n?: number // 空间位移条数
  Omega?: number // 立体角

  // 场参数
  G?: number // 引力常数
  A?: THREE.Vector3 // 引力场/磁矢势
  E?: THREE.Vector3 // 电场
  B?: THREE.Vector3 // 磁场

  // 电磁参数
  q?: number // 电荷
  epsilon0?: number // 真空介电常数
  mu0?: number // 真空磁导率

  // 运动参数
  v?: number // 速度
  V?: THREE.Vector3 // 速度矢量
  C?: THREE.Vector3 // 光速矢量

  // 其他参数
  gamma?: number // 洛伦兹因子
  f?: number // 频率/因子
  Z?: number // 引力光速统一常数
}

/**
 * 公式元数据
 */
export interface FormulaMetadata {
  id: FormulaType
  name: string
  nameEn: string
  latex: string
  description: string
  category: 'spacetime' | 'dynamics' | 'field' | 'unified'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  relatedFormulas: FormulaType[]
  physicalMeaning: string
  applications: string[]
}

// ==================== 3D可视化类型 ====================

/**
 * 可视化场景配置
 */
export interface VisualizationConfig {
  formulaType: FormulaType
  parameters: FormulaParameters
  renderMode: 'field' | 'particle' | 'wave' | 'trajectory' | 'hybrid'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  particleCount?: number
  fieldResolution?: number
  timeScale?: number
  colorScheme?: ColorScheme
  effects?: VisualEffects
}

/**
 * 色彩方案
 */
export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  gradient?: string[]
  fieldColors?: {
    gravity: string
    electric: string
    magnetic: string
    quantum: string
  }
}

/**
 * 视觉效果配置
 */
export interface VisualEffects {
  bloom?: boolean
  glow?: boolean
  trails?: boolean
  distortion?: boolean
  holographic?: boolean
  quantumRipple?: boolean
  gravityLens?: boolean
}

/**
 * 场数据结构
 */
export interface FieldData {
  type: 'gravity' | 'electric' | 'magnetic' | 'quantum'
  points: THREE.Vector3[]
  values: number[]
  vectors?: THREE.Vector3[]
  intensity: number[]
  timestamp: number
}

/**
 * 粒子系统数据
 */
export interface ParticleSystemData {
  positions: Float32Array
  velocities: Float32Array
  colors: Float32Array
  sizes: Float32Array
  lifetimes: Float32Array
  count: number
}

// ==================== 交互系统类型 ====================

/**
 * 交互模式
 */
export enum InteractionMode {
  ORBIT = 'orbit', // 轨道控制
  FLY = 'fly', // 飞行控制
  GRAVITY = 'gravity', // 引力交互
  QUANTUM = 'quantum', // 量子交互
  SPACETIME = 'spacetime' // 时空扭曲
}

/**
 * 手势类型
 */
export interface GestureEvent {
  type: 'tap' | 'drag' | 'pinch' | 'rotate' | 'swipe'
  position: THREE.Vector2
  delta?: THREE.Vector2
  scale?: number
  rotation?: number
  velocity?: THREE.Vector2
}

/**
 * 量子交互状态
 */
export interface QuantumInteractionState {
  superposition: boolean
  entangled: string[]
  measured: boolean
  waveFunction: Complex[]
  probability: number
}

// ==================== 人工场技术类型 ====================

/**
 * 人工场配置
 */
export interface ArtificialFieldConfig {
  type: 'mass_zero' | 'space_wave' | 'time_potential' | 'wormhole'
  strength: number
  radius: number
  position: THREE.Vector3
  active: boolean
  parameters: Record<string, number>
}

/**
 * 飞行器模拟数据
 */
export interface SpacecraftSimulation {
  position: THREE.Vector3
  velocity: THREE.Vector3
  mass: number
  artificialField: ArtificialFieldConfig
  trajectory: THREE.Vector3[]
  energyConsumption: number
}

// ==================== 学习系统类型 ====================

/**
 * 用户学习进度
 */
export interface LearningProgress {
  userId: string
  completedFormulas: FormulaType[]
  currentLevel: number
  achievements: Achievement[]
  explorationPath: ExplorationNode[]
  totalTime: number
  lastActive: Date
}

/**
 * 成就系统
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  progress: number
  maxProgress: number
}

/**
 * 探索节点
 */
export interface ExplorationNode {
  formulaType: FormulaType
  timestamp: Date
  duration: number
  interactions: number
  discoveries: string[]
}

// ==================== 社区系统类型 ====================

/**
 * 用户创建的场景
 */
export interface UserScene {
  id: string
  userId: string
  title: string
  description: string
  config: VisualizationConfig
  thumbnail: string
  likes: number
  views: number
  createdAt: Date
  tags: string[]
  isPublic: boolean
}

/**
 * 协作会话
 */
export interface CollaborationSession {
  id: string
  participants: string[]
  scene: UserScene
  cursor: Map<string, THREE.Vector3>
  annotations: Annotation[]
  startTime: Date
  active: boolean
}

/**
 * 标注数据
 */
export interface Annotation {
  id: string
  userId: string
  position: THREE.Vector3
  content: string
  type: 'note' | 'question' | 'insight'
  timestamp: Date
}

// ==================== 性能优化类型 ====================

/**
 * LOD配置
 */
export interface LODConfig {
  levels: number
  distances: number[]
  geometries: THREE.BufferGeometry[]
  materials: THREE.Material[]
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  fps: number
  drawCalls: number
  triangles: number
  memory: number
  cpuUsage: number
  gpuUsage: number
  timestamp: number
}

// ==================== 数学工具类型 ====================

/**
 * 复数
 */
export interface Complex {
  real: number
  imag: number
}

/**
 * 张量
 */
export interface Tensor {
  rank: number
  dimensions: number[]
  data: number[]
}

/**
 * 矩阵运算结果
 */
export interface MatrixResult {
  matrix: number[][]
  determinant?: number
  eigenvalues?: Complex[]
  eigenvectors?: number[][]
}

// ==================== WebXR类型 ====================

/**
 * XR会话配置
 */
export interface XRSessionConfig {
  mode: 'vr' | 'ar' | 'mr'
  features: string[]
  referenceSpace: 'local' | 'local-floor' | 'bounded-floor' | 'unbounded'
  handTracking: boolean
  eyeTracking: boolean
}

/**
 * XR控制器状态
 */
export interface XRControllerState {
  position: THREE.Vector3
  rotation: THREE.Quaternion
  buttons: boolean[]
  axes: number[]
  hapticActuator?: any
}

// ==================== 导出常量 ====================

/**
 * 物理常数
 */
export const PHYSICS_CONSTANTS = {
  LIGHT_SPEED: 299792458, // 光速 m/s
  GRAVITY_CONSTANT: 6.6743e-11, // 引力常数 m³/(kg·s²)
  PLANCK_CONSTANT: 6.62607015e-34, // 普朗克常数 J·s
  ELECTRON_CHARGE: 1.602176634e-19, // 电子电荷 C
  VACUUM_PERMITTIVITY: 8.854187817e-12, // 真空介电常数 F/m
  VACUUM_PERMEABILITY: 1.25663706212e-6, // 真空磁导率 H/m
  BOLTZMANN_CONSTANT: 1.380649e-23 // 玻尔兹曼常数 J/K
} as const

/**
 * 默认可视化配置
 */
export const DEFAULT_VISUALIZATION_CONFIG: Partial<VisualizationConfig> = {
  renderMode: 'hybrid',
  quality: 'high',
  particleCount: 100000,
  fieldResolution: 64,
  timeScale: 1.0,
  colorScheme: {
    primary: '#00d4ff',
    secondary: '#b400ff',
    accent: '#ff0080',
    background: '#000000',
    gradient: ['#00d4ff', '#b400ff', '#ff0080', '#ffd700'],
    fieldColors: {
      gravity: '#ff0080',
      electric: '#00d4ff',
      magnetic: '#b400ff',
      quantum: '#ffd700'
    }
  },
  effects: {
    bloom: true,
    glow: true,
    trails: true,
    distortion: false,
    holographic: true,
    quantumRipple: true,
    gravityLens: false
  }
}
