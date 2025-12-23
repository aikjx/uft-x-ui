/**
 * 可视化状态管理
 * 使用Zustand管理应用的可视化状态
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// 可视化配置接口
export interface VisualizationConfig {
  /** 粒子数量 */
  particleCount: number
  /** 螺旋数量 */
  spiralCount: number
  /** 螺旋半径 */
  spiralRadius: number
  /** 螺旋长度 */
  spiralLength: number
  /** 旋转圈数 */
  rotations: number
  /** 角速度 */
  angularSpeed: number
  /** 场强度 */
  fieldIntensity: number
  /** 显示圆柱体框架 */
  showCylinders: boolean
  /** 显示坐标轴 */
  showAxes: boolean
  /** 显示网格 */
  showGrid: boolean
  /** 动画速度 */
  animationSpeed: number
  /** 相机距离 */
  cameraDistance: number
  /** 旋转速度 */
  rotationSpeed: number
  /** 脉动强度 */
  pulsationIntensity: number
}

// 可视化状态接口
export interface VisualizationState {
  /** 可视化配置 */
  config: VisualizationConfig
  /** 是否正在播放动画 */
  isPlaying: boolean
  /** 当前选中的可视化类型 */
  selectedVisualization: 'spiral' | 'cylindrical' | 'impedance' | 'quantum' | 'theory'
  /** 性能指标 */
  performance: {
    fps: number
    frameTime: number
    memoryUsage: number
  }
  /** 更新配置 */
  updateConfig: (updates: Partial<VisualizationConfig>) => void
  /** 切换播放状态 */
  togglePlay: () => void
  /** 设置播放状态 */
  setPlay: (playing: boolean) => void
  /** 设置选中的可视化类型 */
  setSelectedVisualization: (
    visualization: 'spiral' | 'cylindrical' | 'impedance' | 'quantum' | 'theory'
  ) => void
  /** 更新性能指标 */
  updatePerformance: (updates: Partial<VisualizationState['performance']>) => void
  /** 重置配置到默认值 */
  resetConfig: () => void
  /** 加载预设配置 */
  loadPreset: (preset: 'default' | 'high-performance' | 'high-quality') => void
}

// 默认配置
const DEFAULT_CONFIG: VisualizationConfig = {
  particleCount: 150,
  spiralCount: 24,
  spiralRadius: 3,
  spiralLength: 30,
  rotations: 8,
  angularSpeed: 1.0,
  fieldIntensity: 5,
  showCylinders: true,
  showAxes: false,
  showGrid: false,
  animationSpeed: 1,
  cameraDistance: 60,
  rotationSpeed: 0.03,
  pulsationIntensity: 0.15
}

// 预设配置
const PRESETS = {
  default: DEFAULT_CONFIG,
  'high-performance': {
    ...DEFAULT_CONFIG,
    particleCount: 50,
    spiralCount: 16,
    fieldIntensity: 3
  },
  'high-quality': {
    ...DEFAULT_CONFIG,
    particleCount: 250,
    spiralCount: 32,
    fieldIntensity: 7
  }
}

// 创建状态存储
export const useVisualizationState = create<VisualizationState>()(
  persist(
    immer(set => ({
      config: DEFAULT_CONFIG,
      isPlaying: true,
      selectedVisualization: 'spiral',
      performance: {
        fps: 60,
        frameTime: 16.67,
        memoryUsage: 0
      },

      updateConfig: updates =>
        set(state => {
          state.config = { ...state.config, ...updates }
        }),

      togglePlay: () =>
        set(state => {
          state.isPlaying = !state.isPlaying
        }),

      setPlay: playing =>
        set(state => {
          state.isPlaying = playing
        }),

      setSelectedVisualization: visualization =>
        set(state => {
          state.selectedVisualization = visualization
        }),

      updatePerformance: updates =>
        set(state => {
          state.performance = { ...state.performance, ...updates }
        }),

      resetConfig: () =>
        set(state => {
          state.config = DEFAULT_CONFIG
        }),

      loadPreset: preset =>
        set(state => {
          state.config = PRESETS[preset] as VisualizationConfig
        })
    })),
    {
      name: 'visualization-state',
      version: 1,
      storage: {
        getItem: name => {
          const item = localStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: name => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)
