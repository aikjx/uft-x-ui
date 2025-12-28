import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// UI状态接口
export interface UIState {
  /** 是否显示性能监控面板 */
  showPerformancePanel: boolean
  /** 是否显示统计信息 */
  showStats: boolean
  /** 是否启用自动优化模式 */
  autoModeEnabled: boolean
  /** 是否显示控制面板 */
  showControlPanel?: boolean
}

// 组件属性接口
export interface ControlPanelProps {
  /** UI状态 */
  uiState: UIState
  /** 更新UI状态的回调 */
  onUpdateUIState: (updates: Partial<UIState>) => void
  /** 自定义CSS类名 */
  className?: string
}

const ControlPanel: React.FC<ControlPanelProps> = React.memo(
  ({ uiState, onUpdateUIState, className = '' }) => {
    // 添加折叠状态
    const [isCollapsed, setIsCollapsed] = useState(false)

    // 切换自动优化模式
    const toggleAutoMode = useCallback(() => {
      onUpdateUIState({ autoModeEnabled: !uiState.autoModeEnabled })
    }, [uiState.autoModeEnabled, onUpdateUIState])

    // 切换性能面板显示
    const togglePerformancePanel = useCallback(() => {
      onUpdateUIState({ showPerformancePanel: !uiState.showPerformancePanel })
    }, [uiState.showPerformancePanel, onUpdateUIState])

    // 切换统计信息显示
    const toggleStats = useCallback(() => {
      onUpdateUIState({ showStats: !uiState.showStats })
    }, [uiState.showStats, onUpdateUIState])

    // 切换控制面板折叠状态
    const toggleCollapse = useCallback(() => {
      setIsCollapsed(!isCollapsed)
    }, [isCollapsed])

    // 切换控制面板显示
    const togglePanelVisibility = useCallback(() => {
      onUpdateUIState({ showControlPanel: !uiState.showControlPanel })
    }, [uiState.showControlPanel, onUpdateUIState])

    return (
      <AnimatePresence>
        {!uiState.showControlPanel && (
          <motion.button
            className="absolute left-4 top-4 rounded-full border border-blue-500/30 bg-black/80 p-3 text-white shadow-lg shadow-blue-500/10 backdrop-blur-md hover:bg-black/90 hover:shadow-xl hover:shadow-blue-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePanelVisibility}
            aria-label="打开控制面板"
          >
            <span className="text-sm">⚙️</span>
          </motion.button>
        )}

        {uiState.showControlPanel && (
          <motion.div
            className={`absolute left-4 top-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 p-3 text-xs text-white shadow-lg shadow-blue-500/10 backdrop-blur-md ${className}`}
            initial={{ opacity: 0, x: -20, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* 控制面板标题栏 */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/20">
              <motion.h3 
                className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ⚙️ 控制面板
              </motion.h3>
              <div className="flex space-x-2">
                <motion.button
                  className="p-1 rounded-full hover:bg-blue-500/20 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleCollapse}
                  aria-label={isCollapsed ? "展开" : "折叠"}
                >
                  <span>{isCollapsed ? "📤" : "📥"}</span>
                </motion.button>
                <motion.button
                  className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePanelVisibility}
                  aria-label="关闭"
                >
                  <span>✕</span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 性能设置 */}
                  <ControlItem
                    icon="⚡"
                    label="自动优化"
                    description="根据性能动态调整渲染参数"
                    isChecked={uiState.autoModeEnabled}
                    onToggle={toggleAutoMode}
                  />

                  {/* 性能面板开关 */}
                  <ControlItem
                    icon="📊"
                    label="性能面板"
                    description="显示实时性能监控数据"
                    isChecked={uiState.showPerformancePanel}
                    onToggle={togglePerformancePanel}
                  />

                  {/* 统计信息开关 */}
                  <ControlItem
                    icon="📈"
                    label="统计信息"
                    description="显示渲染统计数据"
                    isChecked={uiState.showStats}
                    onToggle={toggleStats}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

// 控制项子组件
interface ControlItemProps {
  icon: string
  label: string
  description: string
  isChecked: boolean
  onToggle: () => void
}

const ControlItem: React.FC<ControlItemProps> = React.memo(
  ({ icon, label, description, isChecked, onToggle }) => {
    return (
      <motion.div 
        className="flex flex-col gap-1"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-300">{icon}</span>
            <span className="font-medium text-gray-200">{label}</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center group">
            {/* 自定义开关 */}
            <motion.div
              className={`relative h-6 w-11 rounded-full transition-all duration-300 ease-in-out ${isChecked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 开关滑块 */}
              <motion.div
                className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-gray-300 bg-white shadow-sm transition-all duration-300 ease-in-out"
                animate={{ x: isChecked ? 20 : 0 }}
              />
              
              {/* 开关光晕效果 */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300"
                style={{ 
                  background: isChecked ? 'rgba(99, 102, 241, 0.6)' : 'rgba(156, 163, 175, 0.3)',
                  scale: 1.5
                }}
                animate={{ opacity: isChecked ? 0.6 : 0 }}
              />
            </motion.div>
            
            {/* 隐藏的原生checkbox */}
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggle}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
        
        {/* 描述文本 */}
        <motion.p 
          className="ml-6 text-xs text-gray-400"
          initial={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {description}
        </motion.p>
      </motion.div>
    )
  }
)

export default React.memo(ControlPanel)
