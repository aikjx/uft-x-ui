import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// 性能指标接口
export interface PerformanceMetrics {
  /** 帧率 */
  fps: number;
  /** 渲染时间（毫秒） */
  renderTime: number;
  /** 每帧时间（毫秒） */
  frameTime: number;
  /** 内存使用情况（MB） */
  memoryUsage: number;
  /** 绘制调用次数 */
  drawCalls: number;
  /** 三角形数量 */
  triangles: number;
  /** 顶点数量 */
  vertices: number;
  /** GPU内存使用情况（MB） */
  gpuMemory: number;
}

// 渲染状态接口
export interface RenderState {
  /** 是否正在渲染 */
  isRendering: boolean;
  /** 是否暂停 */
  isPaused: boolean;
  /** 是否正在进行性能优化 */
  isOptimizing: boolean;
  /** 优化级别（0-5） */
  optimizationLevel: number;
  /** 是否正在初始化 */
  isInitializing: boolean;
}

// UI状态接口
export interface UIState {
  /** 是否显示性能监控面板 */
  showPerformancePanel: boolean;
  /** 是否显示统计信息 */
  showStats: boolean;
  /** 是否启用自动优化模式 */
  autoModeEnabled: boolean;
}

// 组件属性接口
export interface PerformanceMonitorProps {
  /** 性能指标数据 */
  metrics: PerformanceMetrics;
  /** 渲染状态 */
  renderState: RenderState;
  /** UI状态 */
  uiState: UIState;
  /** 更新UI状态的回调 */
  onUpdateUIState: (updates: Partial<UIState>) => void;
  /** 自定义CSS类名 */
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = React.memo(({
  metrics,
  renderState,
  uiState,
  onUpdateUIState,
  className = ''
}) => {
  // 切换性能面板显示
  const togglePerformancePanel = useCallback(() => {
    onUpdateUIState({ showPerformancePanel: !uiState.showPerformancePanel });
  }, [uiState.showPerformancePanel, onUpdateUIState]);

  // 切换自动优化模式
  const toggleAutoMode = useCallback(() => {
    onUpdateUIState({ autoModeEnabled: !uiState.autoModeEnabled });
  }, [uiState.autoModeEnabled, onUpdateUIState]);

  // 切换统计信息显示
  const toggleStats = useCallback(() => {
    onUpdateUIState({ showStats: !uiState.showStats });
  }, [uiState.showStats, onUpdateUIState]);

  // 如果不显示性能面板，直接返回null
  if (!uiState.showPerformancePanel) {
    return null;
  }

  return (
    <>
      {/* 性能监控面板 */}
      <motion.div
        className={`absolute top-4 right-4 p-4 text-xs text-white rounded-xl border shadow-lg backdrop-blur-lg bg-black/85 border-blue-500/30 shadow-blue-500/15 ${className}`}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(59, 130, 246, 0.2)" }}
      >
        {/* 面板标题和控制 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <motion.span
              className="text-blue-400"
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              📊
            </motion.span>
            <h4 className="font-semibold text-transparent text-blue-300 bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">性能监控</h4>
          </div>
          <motion.button
            onClick={togglePerformancePanel}
            className="p-1 text-gray-400 rounded-full transition-colors hover:text-white hover:bg-blue-500/20"
            aria-label="关闭性能面板"
            whileHover={{ scale: 1.2, rotate: 90, color: '#60a5fa' }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            ✕
          </motion.button>
        </div>

        {/* 性能指标网格 */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-3">
          {/* FPS指标 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">帧率</span>
            <div className="flex gap-1 items-baseline">
              <motion.span
                className={`font-mono text-lg ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}
                animate={{ scale: metrics.fps < 30 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: metrics.fps < 30 ? Infinity : 0 }}
              >
                {metrics.fps}
              </motion.span>
              <span className="text-gray-500">FPS</span>
            </div>
          </motion.div>

          {/* 优化级别 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">优化级别</span>
            <span className="font-mono text-lg text-purple-400">{renderState.optimizationLevel}</span>
          </motion.div>

          {/* 渲染时间 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">渲染时间</span>
            <div className="flex gap-1 items-baseline">
              <span className="font-mono text-lg text-cyan-400">{metrics.renderTime}</span>
              <span className="text-gray-500">ms</span>
            </div>
          </motion.div>

          {/* 内存使用 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">内存使用</span>
            <div className="flex gap-1 items-baseline">
              <span className="font-mono text-lg text-orange-400">{metrics.memoryUsage.toFixed(0)}</span>
              <span className="text-gray-500">MB</span>
            </div>
          </motion.div>

          {/* 绘制调用 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">绘制调用</span>
            <span className="font-mono text-lg text-green-400">{metrics.drawCalls}</span>
          </motion.div>

          {/* 三角形数量 */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">三角形</span>
            <span className="font-mono text-lg text-yellow-400">{metrics.triangles.toLocaleString()}</span>
          </motion.div>
        </div>

        {/* 渲染状态标签 */}
        <div className="flex flex-wrap gap-2 pt-3 mt-4 border-t border-blue-500/20">
          <motion.span
            className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isRendering ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}
            whileHover={{ scale: 1.1 }}
          >
            {renderState.isRendering ? '🟢 渲染中' : '⏸️ 已暂停'}
          </motion.span>
          <motion.span
            className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isOptimizing ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-500/30 text-gray-300'}`}
            whileHover={{ scale: 1.1 }}
          >
            {renderState.isOptimizing ? '🔮 优化中' : '✅ 已优化'}
          </motion.span>
          <motion.span
            className={`px-2 py-1 rounded-full text-[10px] font-medium ${renderState.isInitializing ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-500/30 text-gray-300'}`}
            whileHover={{ scale: 1.1 }}
          >
            {renderState.isInitializing ? '🔄 初始化' : '✅ 就绪'}
          </motion.span>
        </div>

        {/* 性能优化提示 */}
        {renderState.optimizationLevel > 3 && (
          <motion.div
            className="pt-3 mt-3 text-xs italic border-t border-blue-500/20 text-blue-300/80"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            💡 当前已启用高级优化，可获得最佳性能体验
          </motion.div>
        )}
      </motion.div>
    </>
  );
});

export default React.memo(PerformanceMonitor);
