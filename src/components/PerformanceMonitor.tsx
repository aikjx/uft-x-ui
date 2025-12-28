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
  /** 活动对象数量 */
  activeObjects: number;
  /** 阴影绘制调用 */
  shadowDrawCalls: number;
  /** 渲染分辨率 */
  renderResolution: number;
  /** 优化级别 */
  optimizationLevel: number;
  /** CPU使用率（%） */
  cpuUsage: number;
  /** 网络延迟（毫秒） */
  networkLatency: number;
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
        className={`absolute top-4 right-4 p-4 text-xs text-white rounded-xl border shadow-xl backdrop-blur-lg bg-gradient-to-br from-slate-900/90 to-indigo-900/60 border-indigo-500/40 shadow-indigo-500/20 glow-border ${className}`}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)" }}
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
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">帧率</span>
            <div className="flex gap-1 items-baseline">
              <motion.span
                className={`font-mono text-lg ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}
                animate={{
                  scale: metrics.fps < 30 ? [1, 1.1, 1] : 1,
                  color: metrics.fps < 30 ? ['#ef4444', '#f87171', '#ef4444'] : 
                         metrics.fps < 50 ? ['#eab308', '#facc15', '#eab308'] : 
                         ['#22c55e', '#4ade80', '#22c55e']
                }}
                transition={{
                  duration: metrics.fps < 30 ? 0.5 : 1,
                  repeat: metrics.fps < 30 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.fps.toFixed(1)}
              </motion.span>
              <span className="text-gray-500">FPS</span>
            </div>
            {/* 增强的迷你趋势图 */}
            <div className="overflow-hidden mt-1 h-2.5 rounded-full bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-500/20">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${metrics.fps < 30 ? 'from-red-500 to-red-400' : metrics.fps < 50 ? 'from-yellow-500 to-yellow-400' : 'from-green-500 to-green-400'}`}
                style={{ width: `${Math.min(100, (metrics.fps / 60) * 100)}%` }}
                animate={{
                  width: `${Math.min(100, (metrics.fps / 60) * 100)}%`,
                  boxShadow: `0 0 8px ${metrics.fps < 30 ? 'rgba(239, 68, 68, 0.5)' : metrics.fps < 50 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* 优化级别 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">优化级别</span>
            <div className="flex gap-1 items-baseline">
              <motion.span
                className="font-mono text-lg text-purple-400"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [`0 0 ${(metrics.optimizationLevel || renderState.optimizationLevel) * 2}px rgba(168, 85, 247, 0.5)`, `0 0 ${((metrics.optimizationLevel || renderState.optimizationLevel) * 2) + 2}px rgba(168, 85, 247, 0.7)`, `0 0 ${(metrics.optimizationLevel || renderState.optimizationLevel) * 2}px rgba(168, 85, 247, 0.5)`]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {metrics.optimizationLevel || renderState.optimizationLevel}
              </motion.span>
            </div>
            {/* 优化级别指示器 */}
            <div className="overflow-hidden mt-1 h-2.5 rounded-full bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-500/20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                style={{ width: `${((metrics.optimizationLevel || renderState.optimizationLevel) / 5) * 100}%` }}
                animate={{
                  width: `${((metrics.optimizationLevel || renderState.optimizationLevel) / 5) * 100}%`,
                  boxShadow: `0 0 10px rgba(168, 85, 247, ${0.3 + ((metrics.optimizationLevel || renderState.optimizationLevel) / 10)})`
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* 渲染时间 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">渲染时间</span>
            <div className="flex gap-1 items-baseline">
              <motion.span
                className={`font-mono text-lg ${metrics.renderTime > 50 ? 'text-red-400' : metrics.renderTime > 20 ? 'text-yellow-400' : 'text-cyan-400'}`}
                animate={{
                  scale: metrics.renderTime > 50 ? [1, 1.08, 1] : 1,
                  color: metrics.renderTime > 50 ? ['#ef4444', '#f87171', '#ef4444'] : 
                         metrics.renderTime > 20 ? ['#eab308', '#facc15', '#eab308'] : 
                         ['#06b6d4', '#22d3ee', '#06b6d4']
                }}
                transition={{
                  duration: metrics.renderTime > 50 ? 0.4 : 1.5,
                  repeat: metrics.renderTime > 50 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.renderTime.toFixed(1)}
              </motion.span>
              <span className="text-gray-500">ms</span>
            </div>
          </motion.div>

          {/* 内存使用 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">内存使用</span>
            <div className="flex gap-1 items-baseline">
              <motion.span
                className={`font-mono text-lg ${metrics.memoryUsage > 800 ? 'text-red-400' : metrics.memoryUsage > 500 ? 'text-yellow-400' : 'text-orange-400'}`}
                animate={{
                  scale: metrics.memoryUsage > 800 ? [1, 1.05, 1] : 1,
                  textShadow: metrics.memoryUsage > 800 ? `0 0 8px rgba(239, 68, 68, 0.6)` : ''
                }}
                transition={{
                  duration: metrics.memoryUsage > 800 ? 0.5 : 1.5,
                  repeat: metrics.memoryUsage > 800 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.memoryUsage.toFixed(0)}
              </motion.span>
              <span className="text-gray-500">MB</span>
            </div>
          </motion.div>

          {/* 绘制调用 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">绘制调用</span>
            <motion.span
              className={`font-mono text-lg ${metrics.drawCalls > 500 ? 'text-red-400' : metrics.drawCalls > 200 ? 'text-yellow-400' : 'text-green-400'}`}
              animate={{
                scale: metrics.drawCalls > 500 ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: metrics.drawCalls > 500 ? 0.5 : 1.5,
                repeat: metrics.drawCalls > 500 ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              {metrics.drawCalls}
            </motion.span>
          </motion.div>

          {/* 三角形数量 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">三角形</span>
            <motion.span
              className={`font-mono text-lg ${metrics.triangles > 1000000 ? 'text-red-400' : metrics.triangles > 500000 ? 'text-yellow-400' : 'text-yellow-400'}`}
              animate={{
                scale: metrics.triangles > 1000000 ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: metrics.triangles > 1000000 ? 0.5 : 1.5,
                repeat: metrics.triangles > 1000000 ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              {metrics.triangles.toLocaleString()}
            </motion.span>
          </motion.div>

          {/* 活动对象 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">活动对象</span>
            <motion.span
              className={`font-mono text-lg ${metrics.activeObjects > 200 ? 'text-red-400' : metrics.activeObjects > 100 ? 'text-yellow-400' : 'text-blue-400'}`}
              animate={{
                scale: metrics.activeObjects > 200 ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: metrics.activeObjects > 200 ? 0.5 : 1.5,
                repeat: metrics.activeObjects > 200 ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              {metrics.activeObjects || 0}
            </motion.span>
          </motion.div>

          {/* 阴影绘制调用 */}
          <motion.div
            className="flex flex-col p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
          >
            <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">阴影绘制</span>
            <motion.span
              className={`font-mono text-lg ${metrics.shadowDrawCalls > 100 ? 'text-red-400' : metrics.shadowDrawCalls > 50 ? 'text-yellow-400' : 'text-pink-400'}`}
              animate={{
                scale: metrics.shadowDrawCalls > 100 ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: metrics.shadowDrawCalls > 100 ? 0.5 : 1.5,
                repeat: metrics.shadowDrawCalls > 100 ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              {metrics.shadowDrawCalls || 0}
            </motion.span>
          </motion.div>
        </div>

        {/* 详细性能指标展开区 */}
        <motion.div
          className="pt-3 mt-3 text-xs text-gray-300 border-t border-indigo-500/20 bg-slate-800/30 rounded-lg p-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <h5 className="text-indigo-300 font-medium mb-2 text-[10px] uppercase tracking-wider">详细指标</h5>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.3 }}
            >
              <span className="text-gray-400">CPU使用率:</span>
              <motion.span 
                className={`font-mono ${metrics.cpuUsage > 80 ? 'text-red-400' : metrics.cpuUsage > 60 ? 'text-yellow-400' : 'text-green-400'}`}
                animate={{
                  scale: metrics.cpuUsage > 80 ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: metrics.cpuUsage > 80 ? 0.5 : 1.5,
                  repeat: metrics.cpuUsage > 80 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.cpuUsage.toFixed(1)}%
              </motion.span>
            </motion.div>
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <span className="text-gray-400">GPU内存:</span>
              <span className="font-mono text-cyan-400">{metrics.gpuMemory.toFixed(0)}MB</span>
            </motion.div>
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, duration: 0.3 }}
            >
              <span className="text-gray-400">顶点数量:</span>
              <span className="font-mono text-yellow-400">{metrics.vertices.toLocaleString()}</span>
            </motion.div>
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <span className="text-gray-400">渲染分辨率:</span>
              <span className="font-mono text-green-400">{metrics.renderResolution.toFixed(1)}x</span>
            </motion.div>
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.3 }}
            >
              <span className="text-gray-400">网络延迟:</span>
              <motion.span 
                className={`font-mono ${metrics.networkLatency > 200 ? 'text-red-400' : metrics.networkLatency > 100 ? 'text-yellow-400' : 'text-green-400'}`}
                animate={{
                  scale: metrics.networkLatency > 200 ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: metrics.networkLatency > 200 ? 0.5 : 1.5,
                  repeat: metrics.networkLatency > 200 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.networkLatency.toFixed(0)}ms
              </motion.span>
            </motion.div>
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <span className="text-gray-400">每帧时间:</span>
              <motion.span 
                className={`font-mono ${metrics.frameTime > 33 ? 'text-red-400' : metrics.frameTime > 16 ? 'text-yellow-400' : 'text-green-400'}`}
                animate={{
                  scale: metrics.frameTime > 33 ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: metrics.frameTime > 33 ? 0.5 : 1.5,
                  repeat: metrics.frameTime > 33 ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {metrics.frameTime.toFixed(1)}ms
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* 渲染状态标签 */}
        <div className="flex flex-wrap gap-2 pt-3 mt-4 border-t border-indigo-500/20">
          <motion.span
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium border ${renderState.isRendering ? 'bg-green-500/30 text-green-300 border-green-500/40' : 'bg-gray-500/30 text-gray-300 border-gray-500/40'}`}
            whileHover={{ scale: 1.1, boxShadow: `0 4px 12px ${renderState.isRendering ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)'}` }}
            animate={{
              scale: renderState.isRendering ? [1, 1.05, 1] : 1,
              boxShadow: renderState.isRendering ? `0 0 10px rgba(34, 197, 94, 0.3)` : ''
            }}
            transition={{
              duration: renderState.isRendering ? 1.5 : 0.3,
              repeat: renderState.isRendering ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            {renderState.isRendering ? '🟢 渲染中' : '⏸️ 已暂停'}
          </motion.span>
          <motion.span
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium border ${renderState.isOptimizing ? 'bg-purple-500/30 text-purple-300 border-purple-500/40' : 'bg-gray-500/30 text-gray-300 border-gray-500/40'}`}
            whileHover={{ scale: 1.1, boxShadow: `0 4px 12px ${renderState.isOptimizing ? 'rgba(168, 85, 247, 0.2)' : 'rgba(107, 114, 128, 0.2)'}` }}
            animate={{
              scale: renderState.isOptimizing ? [1, 1.05, 1] : 1,
              boxShadow: renderState.isOptimizing ? `0 0 10px rgba(168, 85, 247, 0.3)` : ''
            }}
            transition={{
              duration: renderState.isOptimizing ? 1.5 : 0.3,
              repeat: renderState.isOptimizing ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            {renderState.isOptimizing ? '🔮 优化中' : '✅ 已优化'}
          </motion.span>
          <motion.span
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium border ${renderState.isInitializing ? 'bg-blue-500/30 text-blue-300 border-blue-500/40' : 'bg-gray-500/30 text-gray-300 border-gray-500/40'}`}
            whileHover={{ scale: 1.1, boxShadow: `0 4px 12px ${renderState.isInitializing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)'}` }}
            animate={{
              scale: renderState.isInitializing ? [1, 1.05, 1] : 1,
              boxShadow: renderState.isInitializing ? `0 0 10px rgba(59, 130, 246, 0.3)` : ''
            }}
            transition={{
              duration: renderState.isInitializing ? 1.5 : 0.3,
              repeat: renderState.isInitializing ? Infinity : 0,
              repeatType: "reverse"
            }}
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
