import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * 性能监控指标类型
 */
export interface PerformanceMetrics {
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  renderTime: number;
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
  vertexCount: number;
  textureMemory: number;
  shaderCount: number;
  activeObjects: number;
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  refreshRate: number;
  showFPS: boolean;
  showCPU: boolean;
  showMemory: boolean;
  showRenderTime: boolean;
  showFrameTime: boolean;
  showDrawCalls: boolean;
  showTriangleCount: boolean;
  showVertexCount: boolean;
  showTextureMemory: boolean;
  showShaderCount: boolean;
  showActiveObjects: boolean;
  theme: 'dark' | 'light' | 'minimal';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoHide: boolean;
  autoHideDelay: number;
  showLabels: boolean;
  compactMode: boolean;
}

/**
 * 性能等级
 */
export enum PerformanceLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * 性能监控组件
 */
const PerformanceMonitor: React.FC<{
  metrics: PerformanceMetrics;
  config?: Partial<PerformanceMonitorConfig>;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}> = ({
  metrics,
  config = {},
  onMetricsUpdate
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [localMetrics, setLocalMetrics] = useState(metrics);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 合并默认配置
  const monitorConfig: PerformanceMonitorConfig = {
    enabled: true,
    refreshRate: 1000,
    showFPS: true,
    showCPU: true,
    showMemory: true,
    showRenderTime: true,
    showFrameTime: false,
    showDrawCalls: false,
    showTriangleCount: false,
    showVertexCount: false,
    showTextureMemory: false,
    showShaderCount: false,
    showActiveObjects: false,
    theme: 'dark',
    position: 'top-left',
    autoHide: false,
    autoHideDelay: 3000,
    showLabels: true,
    compactMode: false,
    ...config
  };

  // 更新本地指标
  useEffect(() => {
    setLocalMetrics(metrics);
    onMetricsUpdate?.(metrics);
  }, [metrics, onMetricsUpdate]);

  // 自动隐藏逻辑
  useEffect(() => {
    if (monitorConfig.autoHide) {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
      
      setIsVisible(true);
      autoHideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, monitorConfig.autoHideDelay);
    }
  }, [localMetrics, monitorConfig.autoHide, monitorConfig.autoHideDelay]);

  // 清除定时器
  useEffect(() => {
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  // 根据FPS获取性能等级
  const getPerformanceLevel = (fps: number): PerformanceLevel => {
    if (fps >= 60) return PerformanceLevel.EXCELLENT;
    if (fps >= 45) return PerformanceLevel.GOOD;
    if (fps >= 30) return PerformanceLevel.FAIR;
    if (fps >= 15) return PerformanceLevel.POOR;
    return PerformanceLevel.CRITICAL;
  };

  // 根据性能等级获取颜色
  const getPerformanceColor = (level: PerformanceLevel): string => {
    switch (level) {
      case PerformanceLevel.EXCELLENT:
        return '#10b981'; // 绿色
      case PerformanceLevel.GOOD:
        return '#3b82f6'; // 蓝色
      case PerformanceLevel.FAIR:
        return '#f59e0b'; // 黄色
      case PerformanceLevel.POOR:
        return '#f97316'; // 橙色
      case PerformanceLevel.CRITICAL:
        return '#ef4444'; // 红色
      default:
        return '#6b7280'; // 灰色
    }
  };

  // 主题样式
  const themeStyles = {
    dark: {
      background: 'rgba(0, 0, 0, 0.8)',
      border: '#4b5563',
      text: '#e5e7eb',
      label: '#9ca3af',
      metric: '#ffffff'
    },
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '#e5e7eb',
      text: '#111827',
      label: '#6b7280',
      metric: '#1f2937'
    },
    minimal: {
      background: 'transparent',
      border: 'transparent',
      text: '#ffffff',
      label: '#ffffff',
      metric: '#ffffff'
    }
  };

  const styles = themeStyles[monitorConfig.theme];
  const performanceLevel = getPerformanceLevel(localMetrics.fps);
  const performanceColor = getPerformanceColor(performanceLevel);

  // 位置样式
  const positionStyles = {
    'top-left': {
      top: '10px',
      left: '10px'
    },
    'top-right': {
      top: '10px',
      right: '10px'
    },
    'bottom-left': {
      bottom: '10px',
      left: '10px'
    },
    'bottom-right': {
      bottom: '10px',
      right: '10px'
    }
  };

  // 渲染性能指标项
  const renderMetricItem = (label: string, value: number, unit: string, show: boolean, key: keyof PerformanceMetrics) => {
    if (!show) return null;

    return (
      <motion.div
        key={key}
        className={`flex items-center gap-2 ${monitorConfig.showLabels ? 'flex-col items-start' : 'flex-row items-center'}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {monitorConfig.showLabels && (
          <span className="text-xs font-medium opacity-80" style={{ color: styles.label }}>
            {label}
          </span>
        )}
        <span className="text-sm font-bold" style={{ color: styles.metric }}>
          {value.toFixed(unit === '%' ? 1 : 0)}{unit}
        </span>
      </motion.div>
    );
  };

  // 渲染指标组
  const renderMetrics = () => {
    const metrics = [
      renderMetricItem('FPS', localMetrics.fps, '', monitorConfig.showFPS, 'fps'),
      renderMetricItem('CPU', localMetrics.cpuUsage, '%', monitorConfig.showCPU, 'cpuUsage'),
      renderMetricItem('内存', localMetrics.memoryUsage, 'MB', monitorConfig.showMemory, 'memoryUsage'),
      renderMetricItem('渲染时间', localMetrics.renderTime, 'ms', monitorConfig.showRenderTime, 'renderTime'),
      renderMetricItem('帧时间', localMetrics.frameTime, 'ms', monitorConfig.showFrameTime, 'frameTime'),
      renderMetricItem('绘制调用', localMetrics.drawCalls, '', monitorConfig.showDrawCalls, 'drawCalls'),
      renderMetricItem('三角形数', localMetrics.triangleCount, 'K', monitorConfig.showTriangleCount, 'triangleCount'),
      renderMetricItem('顶点数', localMetrics.vertexCount, 'K', monitorConfig.showVertexCount, 'vertexCount'),
      renderMetricItem('纹理内存', localMetrics.textureMemory, 'MB', monitorConfig.showTextureMemory, 'textureMemory'),
      renderMetricItem('着色器数', localMetrics.shaderCount, '', monitorConfig.showShaderCount, 'shaderCount'),
      renderMetricItem('活跃对象', localMetrics.activeObjects, '', monitorConfig.showActiveObjects, 'activeObjects')
    ].filter(Boolean);

    if (monitorConfig.compactMode) {
      return (
        <div className="flex flex-wrap gap-3">
          {metrics}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        {metrics}
      </div>
    );
  };

  // 渲染性能等级指示器
  const renderPerformanceIndicator = () => {
    if (monitorConfig.compactMode) return null;

    return (
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: performanceColor }}
        />
        <span className="text-xs font-medium capitalize" style={{ color: performanceColor }}>
          {performanceLevel}
        </span>
      </div>
    );
  };

  if (!monitorConfig.enabled || (monitorConfig.autoHide && !isVisible)) {
    return null;
  }

  return (
    <motion.div
      className={`fixed z-50 p-3 rounded-lg shadow-lg transition-all duration-300 transform backdrop-blur-sm border`}
      style={{
        ...positionStyles[monitorConfig.position],
        backgroundColor: styles.background,
        borderColor: styles.border,
        color: styles.text,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => {
        if (monitorConfig.autoHide) {
          setIsVisible(true);
          if (autoHideTimeoutRef.current) {
            clearTimeout(autoHideTimeoutRef.current);
          }
        }
      }}
      onMouseLeave={() => {
        if (monitorConfig.autoHide) {
          autoHideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
          }, monitorConfig.autoHideDelay);
        }
      }}
    >
      {/* 性能等级指示器 */}
      {renderPerformanceIndicator()}

      {/* 性能指标 */}
      {renderMetrics()}

      {/* 最小化/展开按钮（如果需要） */}
      {!monitorConfig.compactMode && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t opacity-70" style={{ borderColor: styles.border }}>
          <span className="text-xs" style={{ color: styles.label }}>
            性能监控
          </span>
          <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20" style={{ color: styles.text }}>
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default PerformanceMonitor;
