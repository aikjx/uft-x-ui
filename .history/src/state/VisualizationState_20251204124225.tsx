/**
 * 可视化状态管理 - 集中式状态管理系统
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { eventSystem, APP_EVENTS } from '../utils/eventSystem';
import { RenderQualityLevel } from '../performance/smartRenderScheduler';

// 状态类型定义
export interface VisualizationState {
  // 渲染质量设置
  renderQuality: RenderQualityLevel;
  enablePostProcessing: boolean;
  bloomIntensity: number;
  bloomRadius: number;
  bloomThreshold: number;
  filmNoiseIntensity: number;
  filmScanlineIntensity: number;
  filmScanlineCount: number;
  useSMAA: boolean;
  useFilmPass: boolean;
  useGammaCorrection: boolean;
  chromaticAberration: number;
  vignetteIntensity: number;
  
  // 性能设置
  isPerformanceMode: boolean;
  targetFPS: number;
  autoModeEnabled: boolean;
  pixelRatio: number;
  enableAdaptiveResolution: boolean;
  resolutionScale: number;
  
  // 交互设置
  enableControls: boolean;
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  enablePan: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  
  // 场景设置
  backgroundColor: string;
  showGrid: boolean;
  showAxes: boolean;
  enableShadows: boolean;
  enableFog: boolean;
  fogDensity: number;
  fogColor: string;
  
  // 粒子系统设置
  maxParticles: number;
  emissionRate: number;
  particleLifetime: number;
  particleSize: number;
  
  // 相机设置
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
  
  // 性能监控
  showPerformancePanel: boolean;
  currentFPS: number;
  currentMemory: number;
  currentDrawCalls: number;
  currentTriangles: number;
  
  // 错误状态
  hasError: boolean;
  errorMessage: string;
}

// Action类型定义
type VisualizationAction =
  | { type: 'SET_RENDER_QUALITY'; payload: RenderQualityLevel }
  | { type: 'SET_POST_PROCESSING'; payload: boolean }
  | { type: 'SET_BLOOM_INTENSITY'; payload: number }
  | { type: 'SET_BLOOM_RADIUS'; payload: number }
  | { type: 'SET_BLOOM_THRESHOLD'; payload: number }
  | { type: 'SET_FILM_NOISE_INTENSITY'; payload: number }
  | { type: 'SET_FILM_SCANLINE_INTENSITY'; payload: number }
  | { type: 'SET_FILM_SCANLINE_COUNT'; payload: number }
  | { type: 'SET_USE_SMAA'; payload: boolean }
  | { type: 'SET_USE_FILM_PASS'; payload: boolean }
  | { type: 'SET_USE_GAMMA_CORRECTION'; payload: boolean }
  | { type: 'SET_CHROMATIC_ABERRATION'; payload: number }
  | { type: 'SET_VIGNETTE_INTENSITY'; payload: number }
  | { type: 'SET_PERFORMANCE_MODE'; payload: boolean }
  | { type: 'SET_TARGET_FPS'; payload: number }
  | { type: 'SET_AUTO_MODE'; payload: boolean }
  | { type: 'SET_PIXEL_RATIO'; payload: number }
  | { type: 'SET_ADAPTIVE_RESOLUTION'; payload: boolean }
  | { type: 'SET_RESOLUTION_SCALE'; payload: number }
  | { type: 'SET_ENABLE_CONTROLS'; payload: boolean }
  | { type: 'SET_ENABLE_DAMPING'; payload: boolean }
  | { type: 'SET_DAMPING_FACTOR'; payload: number }
  | { type: 'SET_ROTATE_SPEED'; payload: number }
  | { type: 'SET_ZOOM_SPEED'; payload: number }
  | { type: 'SET_ENABLE_PAN'; payload: boolean }
  | { type: 'SET_AUTO_ROTATE'; payload: boolean }
  | { type: 'SET_AUTO_ROTATE_SPEED'; payload: number }
  | { type: 'SET_BACKGROUND_COLOR'; payload: string }
  | { type: 'SET_SHOW_GRID'; payload: boolean }
  | { type: 'SET_SHOW_AXES'; payload: boolean }
  | { type: 'SET_ENABLE_SHADOWS'; payload: boolean }
  | { type: 'SET_ENABLE_FOG'; payload: boolean }
  | { type: 'SET_FOG_DENSITY'; payload: number }
  | { type: 'SET_FOG_COLOR'; payload: string }
  | { type: 'SET_MAX_PARTICLES'; payload: number }
  | { type: 'SET_EMISSION_RATE'; payload: number }
  | { type: 'SET_PARTICLE_LIFETIME'; payload: number }
  | { type: 'SET_PARTICLE_SIZE'; payload: number }
  | { type: 'SET_CAMERA_POSITION'; payload: { x: number; y: number; z: number } }
  | { type: 'SET_CAMERA_ROTATION'; payload: { x: number; y: number; z: number } }
  | { type: 'SET_CAMERA_FOV'; payload: number }
  | { type: 'SET_CAMERA_NEAR'; payload: number }
  | { type: 'SET_CAMERA_FAR'; payload: number }
  | { type: 'SET_SHOW_PERFORMANCE_PANEL'; payload: boolean }
  | { type: 'UPDATE_PERFORMANCE_STATS'; payload: { fps: number; memory: number; drawCalls: number; triangles: number } }
  | { type: 'SET_ERROR'; payload: { hasError: boolean; errorMessage: string } }
  | { type: 'RESET_STATE' };

// 初始状态
export const initialVisualizationState: VisualizationState = {
  // 渲染质量设置
  renderQuality: RenderQualityLevel.AUTO,
  enablePostProcessing: true,
  bloomIntensity: 1.5,
  bloomRadius: 0.5,
  bloomThreshold: 0.1,
  filmNoiseIntensity: 0.3,
  filmScanlineIntensity: 0.025,
  filmScanlineCount: 256,
  useSMAA: true,
  useFilmPass: true,
  useGammaCorrection: true,
  chromaticAberration: 0.01,
  vignetteIntensity: 0.3,
  
  // 性能设置
  isPerformanceMode: false,
  targetFPS: 60,
  autoModeEnabled: true,
  pixelRatio: window.devicePixelRatio,
  enableAdaptiveResolution: true,
  resolutionScale: 1.0,
  
  // 交互设置
  enableControls: true,
  enableDamping: true,
  dampingFactor: 0.05,
  rotateSpeed: 0.5,
  zoomSpeed: 0.8,
  enablePan: true,
  autoRotate: false,
  autoRotateSpeed: 2.0,
  
  // 场景设置
  backgroundColor: '#000000',
  showGrid: true,
  showAxes: true,
  enableShadows: true,
  enableFog: false,
  fogDensity: 0.05,
  fogColor: '#000000',
  
  // 粒子系统设置
  maxParticles: 100000,
  emissionRate: 500,
  particleLifetime: 5,
  particleSize: 0.5,
  
  // 相机设置
  cameraPosition: { x: 10, y: 10, z: 10 },
  cameraRotation: { x: 0, y: 0, z: 0 },
  cameraFov: 75,
  cameraNear: 0.1,
  cameraFar: 1000,
  
  // 性能监控
  showPerformancePanel: false,
  currentFPS: 60,
  currentMemory: 0,
  currentDrawCalls: 0,
  currentTriangles: 0,
  
  // 错误状态
  hasError: false,
  errorMessage: ''
};

// Reducer函数
const visualizationReducer = (state: VisualizationState, action: VisualizationAction): VisualizationState => {
  switch (action.type) {
    // 渲染质量设置
    case 'SET_RENDER_QUALITY':
      return { ...state, renderQuality: action.payload };
    case 'SET_POST_PROCESSING':
      return { ...state, enablePostProcessing: action.payload };
    case 'SET_BLOOM_INTENSITY':
      return { ...state, bloomIntensity: action.payload };
    case 'SET_BLOOM_RADIUS':
      return { ...state, bloomRadius: action.payload };
    case 'SET_BLOOM_THRESHOLD':
      return { ...state, bloomThreshold: action.payload };
    case 'SET_FILM_NOISE_INTENSITY':
      return { ...state, filmNoiseIntensity: action.payload };
    case 'SET_FILM_SCANLINE_INTENSITY':
      return { ...state, filmScanlineIntensity: action.payload };
    case 'SET_FILM_SCANLINE_COUNT':
      return { ...state, filmScanlineCount: action.payload };
    case 'SET_USE_SMAA':
      return { ...state, useSMAA: action.payload };
    case 'SET_USE_FILM_PASS':
      return { ...state, useFilmPass: action.payload };
    case 'SET_USE_GAMMA_CORRECTION':
      return { ...state, useGammaCorrection: action.payload };
    case 'SET_CHROMATIC_ABERRATION':
      return { ...state, chromaticAberration: action.payload };
    case 'SET_VIGNETTE_INTENSITY':
      return { ...state, vignetteIntensity: action.payload };
    
    // 性能设置
    case 'SET_PERFORMANCE_MODE':
      return { ...state, isPerformanceMode: action.payload };
    case 'SET_TARGET_FPS':
      return { ...state, targetFPS: action.payload };
    case 'SET_AUTO_MODE':
      return { ...state, autoModeEnabled: action.payload };
    case 'SET_PIXEL_RATIO':
      return { ...state, pixelRatio: action.payload };
    case 'SET_ADAPTIVE_RESOLUTION':
      return { ...state, enableAdaptiveResolution: action.payload };
    case 'SET_RESOLUTION_SCALE':
      return { ...state, resolutionScale: action.payload };
    
    // 交互设置
    case 'SET_ENABLE_CONTROLS':
      return { ...state, enableControls: action.payload };
    case 'SET_ENABLE_DAMPING':
      return { ...state, enableDamping: action.payload };
    case 'SET_DAMPING_FACTOR':
      return { ...state, dampingFactor: action.payload };
    case 'SET_ROTATE_SPEED':
      return { ...state, rotateSpeed: action.payload };
    case 'SET_ZOOM_SPEED':
      return { ...state, zoomSpeed: action.payload };
    case 'SET_ENABLE_PAN':
      return { ...state, enablePan: action.payload };
    case 'SET_AUTO_ROTATE':
      return { ...state, autoRotate: action.payload };
    case 'SET_AUTO_ROTATE_SPEED':
      return { ...state, autoRotateSpeed: action.payload };
    
    // 场景设置
    case 'SET_BACKGROUND_COLOR':
      return { ...state, backgroundColor: action.payload };
    case 'SET_SHOW_GRID':
      return { ...state, showGrid: action.payload };
    case 'SET_SHOW_AXES':
      return { ...state, showAxes: action.payload };
    case 'SET_ENABLE_SHADOWS':
      return { ...state, enableShadows: action.payload };
    case 'SET_ENABLE_FOG':
      return { ...state, enableFog: action.payload };
    case 'SET_FOG_DENSITY':
      return { ...state, fogDensity: action.payload };
    case 'SET_FOG_COLOR':
      return { ...state, fogColor: action.payload };
    
    // 粒子系统设置
    case 'SET_MAX_PARTICLES':
      return { ...state, maxParticles: action.payload };
    case 'SET_EMISSION_RATE':
      return { ...state, emissionRate: action.payload };
    case 'SET_PARTICLE_LIFETIME':
      return { ...state, particleLifetime: action.payload };
    case 'SET_PARTICLE_SIZE':
      return { ...state, particleSize: action.payload };
    
    // 相机设置
    case 'SET_CAMERA_POSITION':
      return { ...state, cameraPosition: action.payload };
    case 'SET_CAMERA_ROTATION':
      return { ...state, cameraRotation: action.payload };
    case 'SET_CAMERA_FOV':
      return { ...state, cameraFov: action.payload };
    case 'SET_CAMERA_NEAR':
      return { ...state, cameraNear: action.payload };
    case 'SET_CAMERA_FAR':
      return { ...state, cameraFar: action.payload };
    
    // 性能监控
    case 'SET_SHOW_PERFORMANCE_PANEL':
      return { ...state, showPerformancePanel: action.payload };
    case 'UPDATE_PERFORMANCE_STATS':
      return {
        ...state,
        currentFPS: action.payload.fps,
        currentMemory: action.payload.memory,
        currentDrawCalls: action.payload.drawCalls,
        currentTriangles: action.payload.triangles
      };
    
    // 错误状态
    case 'SET_ERROR':
      return {
        ...state,
        hasError: action.payload.hasError,
        errorMessage: action.payload.errorMessage
      };
    
    // 重置状态
    case 'RESET_STATE':
      return initialVisualizationState;
    
    default:
      return state;
  }
};

// Context定义
interface VisualizationContextType {
  state: VisualizationState;
  dispatch: React.Dispatch<VisualizationAction>;
  updatePerformanceStats: (fps: number, memory: number, drawCalls: number, triangles: number) => void;
  setError: (hasError: boolean, errorMessage?: string) => void;
  resetState: () => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

// Provider组件
export const VisualizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(visualizationReducer, initialVisualizationState);

  // 更新性能统计
  const updatePerformanceStats = (fps: number, memory: number, drawCalls: number, triangles: number) => {
    dispatch({
      type: 'UPDATE_PERFORMANCE_STATS',
      payload: { fps, memory, drawCalls, triangles }
    });
  };

  // 设置错误状态
  const setError = (hasError: boolean, errorMessage: string = '') => {
    dispatch({
      type: 'SET_ERROR',
      payload: { hasError, errorMessage }
    });
  };

  // 重置状态
  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // 监听性能变化事件
  useEffect(() => {
    // 性能下降事件处理
    const handlePerformanceDrop = (data: any) => {
      dispatch({ type: 'SET_PERFORMANCE_MODE', payload: true });
    };

    // 性能恢复事件处理
    const handlePerformanceRecover = (data: any) => {
      dispatch({ type: 'SET_PERFORMANCE_MODE', payload: false });
    };

    // 帧率变化事件处理
    const handleFrameRateChange = (data: { fps: number }) => {
      dispatch({
        type: 'UPDATE_PERFORMANCE_STATS',
        payload: {
          fps: data.fps,
          memory: state.currentMemory,
          drawCalls: state.currentDrawCalls,
          triangles: state.currentTriangles
        }
      });
    };

    // 注册事件监听器
    eventSystem.on(APP_EVENTS.PERFORMANCE_DROP, handlePerformanceDrop);
    eventSystem.on(APP_EVENTS.PERFORMANCE_RECOVER, handlePerformanceRecover);
    eventSystem.on(APP_EVENTS.FRAME_RATE_CHANGE, handleFrameRateChange);

    // 清理事件监听器
    return () => {
      eventSystem.off(APP_EVENTS.PERFORMANCE_DROP, handlePerformanceDrop);
      eventSystem.off(APP_EVENTS.PERFORMANCE_RECOVER, handlePerformanceRecover);
      eventSystem.off(APP_EVENTS.FRAME_RATE_CHANGE, handleFrameRateChange);
    };
  }, [state.currentMemory, state.currentDrawCalls, state.currentTriangles]);

  return (
    <VisualizationContext.Provider
      value={{
        state,
        dispatch,
        updatePerformanceStats,
        setError,
        resetState
      }}
    >
      {children}
    </VisualizationContext.Provider>
  );
};

// 自定义Hook，用于在组件中访问状态
export const useVisualizationState = (): VisualizationContextType => {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualizationState must be used within a VisualizationProvider');
  }
  return context;
};

// 便捷的状态更新Hook
export const useVisualizationActions = () => {
  const { dispatch } = useVisualizationState();
  
  return {
    // 渲染质量设置
    setRenderQuality: (quality: RenderQualityLevel) => {
      dispatch({ type: 'SET_RENDER_QUALITY', payload: quality });
    },
    setEnablePostProcessing: (enabled: boolean) => {
      dispatch({ type: 'SET_POST_PROCESSING', payload: enabled });
    },
    setBloomIntensity: (intensity: number) => {
      dispatch({ type: 'SET_BLOOM_INTENSITY', payload: intensity });
    },
    setBloomRadius: (radius: number) => {
      dispatch({ type: 'SET_BLOOM_RADIUS', payload: radius });
    },
    setBloomThreshold: (threshold: number) => {
      dispatch({ type: 'SET_BLOOM_THRESHOLD', payload: threshold });
    },
    
    // 性能设置
    setAutoModeEnabled: (enabled: boolean) => {
      dispatch({ type: 'SET_AUTO_MODE', payload: enabled });
    },
    setTargetFPS: (fps: number) => {
      dispatch({ type: 'SET_TARGET_FPS', payload: fps });
    },
    
    // 场景设置
    setBackgroundColor: (color: string) => {
      dispatch({ type: 'SET_BACKGROUND_COLOR', payload: color });
    },
    setShowGrid: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_GRID', payload: show });
    },
    setShowAxes: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_AXES', payload: show });
    },
    
    // 性能监控
    setShowPerformancePanel: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_PERFORMANCE_PANEL', payload: show });
    },
    updatePerformanceStats: (fps: number, memory: number, drawCalls: number, triangles: number) => {
      dispatch({
        type: 'UPDATE_PERFORMANCE_STATS',
        payload: { fps, memory, drawCalls, triangles }
      });
    },
    
    // 错误处理
    setError: (hasError: boolean, errorMessage?: string) => {
      dispatch({
        type: 'SET_ERROR',
        payload: { hasError, errorMessage: errorMessage || '' }
      });
    },
    
    // 重置状态
    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    }
  };
};
