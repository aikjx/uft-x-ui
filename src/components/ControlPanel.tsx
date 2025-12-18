import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

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
export interface ControlPanelProps {
  /** UI状态 */
  uiState: UIState;
  /** 更新UI状态的回调 */
  onUpdateUIState: (updates: Partial<UIState>) => void;
  /** 自定义CSS类名 */
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = React.memo(({
  uiState,
  onUpdateUIState,
  className = ''
}) => {
  // 切换自动优化模式
  const toggleAutoMode = useCallback(() => {
    onUpdateUIState({ autoModeEnabled: !uiState.autoModeEnabled });
  }, [uiState.autoModeEnabled, onUpdateUIState]);

  // 切换性能面板显示
  const togglePerformancePanel = useCallback(() => {
    onUpdateUIState({ showPerformancePanel: !uiState.showPerformancePanel });
  }, [uiState.showPerformancePanel, onUpdateUIState]);

  // 切换统计信息显示
  const toggleStats = useCallback(() => {
    onUpdateUIState({ showStats: !uiState.showStats });
  }, [uiState.showStats, onUpdateUIState]);

  return (
    <motion.div
      className={`absolute top-4 left-4 p-3 text-xs text-white rounded-xl border shadow-lg backdrop-blur-md bg-black/80 border-blue-500/30 shadow-blue-500/10 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex flex-col gap-2">
        {/* 性能设置 */}
        <div className="flex justify-between items-center">
          <span className="text-blue-300">⚡ 自动优化</span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={uiState.autoModeEnabled}
              onChange={toggleAutoMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 性能面板开关 */}
        <div className="flex justify-between items-center">
          <span className="text-blue-300">📊 性能面板</span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={uiState.showPerformancePanel}
              onChange={togglePerformancePanel}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 统计信息开关 */}
        <div className="flex justify-between items-center">
          <span className="text-blue-300">📈 统计信息</span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={uiState.showStats}
              onChange={toggleStats}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </motion.div>
  );
});

export default React.memo(ControlPanel);
