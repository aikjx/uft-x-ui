import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVisualizationState, useVisualizationActions } from '../state/VisualizationState'

// 组件属性接口
export interface HelixControlPanelProps {
  /** 自定义CSS类名 */
  className?: string
}

const HelixControlPanel: React.FC<HelixControlPanelProps> = React.memo(
  ({ className = '' }) => {
    // 添加折叠状态
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [allPanelsHidden, setAllPanelsHidden] = useState(false)
    
    // 获取可视化状态和操作
    const { state } = useVisualizationState()
    const actions = useVisualizationActions()

    // 切换控制面板折叠状态
    const toggleCollapse = useCallback(() => {
      setIsCollapsed(!isCollapsed)
    }, [isCollapsed])

    // 重置参数
    const handleReset = useCallback(() => {
      actions.setHelixRadius(5.0)
      actions.setHelixPitch(2.0)
      actions.setHelixSpeed(1.0)
      actions.setHelixCount(8)
      actions.setShowHelixCylinder(true)
      actions.setShowHelixParticles(true)
      actions.setShowHelixCore(true)
    }, [actions])

    // 随机化参数
    const handleRandomize = useCallback(() => {
      actions.setHelixRadius(3 + Math.random() * 8)
      actions.setHelixPitch(0.8 + Math.random() * 3)
      actions.setHelixSpeed(0.5 + Math.random() * 2)
      actions.setHelixCount(Math.floor(4 + Math.random() * 12))
    }, [actions])

    // 切换暂停/继续
    const togglePause = useCallback(() => {
      setIsPaused(!isPaused)
    }, [isPaused])

    // 切换所有面板显示
    const toggleAllPanels = useCallback(() => {
      setAllPanelsHidden(!allPanelsHidden)
    }, [allPanelsHidden])

    // 设置预设视角
    const setView = useCallback((type: number) => {
      // 这里可以添加视角预设逻辑，通过actions更新相机位置
      // 例如：actions.setCameraPosition({ x: 25, y: 15, z: 25 })
      // 实际实现需要根据项目的相机控制系统来调整
    }, [actions])

    return (
      <AnimatePresence>
        {!allPanelsHidden && (
          <motion.div
            className={`absolute top-110 left-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-black/92 via-gray-900/85 to-black/92 p-4 text-xs text-white shadow-lg shadow-cyan-500/10 backdrop-blur-md ${className}`}
            initial={{ opacity: 0, x: -20, y: 0, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, y: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ width: '360px', maxHeight: '70vh', overflowY: 'auto' }}
          >
            {/* 控制面板标题栏 */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
              <motion.h3 
                className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🌀 螺旋运动控制
              </motion.h3>
              <div className="flex space-x-2">
                <motion.button
                  className="p-1 rounded-full hover:bg-cyan-500/20 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleCollapse}
                  aria-label={isCollapsed ? "展开" : "折叠"}
                >
                  <span>{isCollapsed ? "📤" : "📥"}</span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 控制参数 */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-cyan-400">⚙️ 控制参数</h4>
                    
                    {/* 圆柱半径 */}
                    <SliderControl
                      label="圆柱半径"
                      value={state.helixRadius}
                      min={2}
                      max={12}
                      step={0.1}
                      onValueChange={actions.setHelixRadius}
                      unit=""
                    />
                    
                    {/* 螺旋节距 */}
                    <SliderControl
                      label="螺旋节距"
                      value={state.helixPitch}
                      min={0.5}
                      max={5}
                      step={0.1}
                      onValueChange={actions.setHelixPitch}
                      unit=""
                    />
                    
                    {/* 旋转速度 */}
                    <SliderControl
                      label="旋转速度"
                      value={state.helixSpeed}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onValueChange={actions.setHelixSpeed}
                      unit=""
                    />
                    
                    {/* 螺旋数量 */}
                    <SliderControl
                      label="螺旋数量"
                      value={state.helixCount}
                      min={4}
                      max={16}
                      step={1}
                      onValueChange={actions.setHelixCount}
                      unit=""
                    />
                  </div>
                  
                  {/* 显示选项 */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-cyan-400">👁️ 显示选项</h4>
                    
                    <div className="space-y-2">
                      <CheckboxControl
                        label="圆柱骨架"
                        checked={state.showHelixCylinder}
                        onCheckedChange={actions.setShowHelixCylinder}
                      />
                      
                      <CheckboxControl
                        label="运动粒子"
                        checked={state.showHelixParticles}
                        onCheckedChange={actions.setShowHelixParticles}
                      />
                      
                      <CheckboxControl
                        label="核心"
                        checked={state.showHelixCore}
                        onCheckedChange={actions.setShowHelixCore}
                      />
                    </div>
                  </div>
                  
                  {/* 视角预设 */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-cyan-400">🎥 视角预设</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <PresetButton
                        label="正视图"
                        onClick={() => setView(0)}
                      />
                      <PresetButton
                        label="俯视图"
                        onClick={() => setView(1)}
                      />
                      <PresetButton
                        label="侧视图"
                        onClick={() => setView(2)}
                      />
                      <PresetButton
                        label="斜视图"
                        onClick={() => setView(3)}
                      />
                    </div>
                  </div>
                  
                  {/* 控制按钮 */}
                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                    >
                      🔄 重置
                    </motion.button>
                    
                    <motion.button
                      className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-purple-500/20 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRandomize}
                    >
                      🎲 随机
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* 工具栏 */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-black/92 via-gray-900/85 to-black/92 px-4 py-3 text-xs text-white shadow-lg shadow-cyan-500/10 backdrop-blur-md"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex gap-3">
            <motion.button
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-cyan-500/20 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePause}
            >
              <span>{isPaused ? "▶️ 继续" : "⏸️ 暂停"}</span>
            </motion.button>
            
            <motion.button
              className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-purple-500/20 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleAllPanels}
            >
              <span>{allPanelsHidden ? "👁️ 显示面板" : "👁️ 隐藏面板"}</span>
            </motion.button>
            
            <motion.button
              className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-yellow-500/20 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAllPanels()}
            >
              🖥️ 全屏
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }
)

// 滑块控制组件
interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onValueChange: (value: number) => void
  unit?: string
}

const SliderControl: React.FC<SliderControlProps> = React.memo(
  ({ label, value, min, max, step, onValueChange, unit = '' }) => {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-cyan-300">{label}</label>
          <span className="text-sm text-cyan-400">{value.toFixed(1)}{unit}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 appearance-none cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            '&::-webkit-slider-thumb': {
              WebkitAppearance: 'none',
              width: '18px',
              height: '18px',
              backgroundColor: '#00ffff',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
              transition: 'all 0.3s ease'
            },
            '&::-moz-range-thumb': {
              width: '18px',
              height: '18px',
              backgroundColor: '#00ffff',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
              border: 'none',
              transition: 'all 0.3s ease'
            },
            '&::-webkit-slider-thumb:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 1)'
            },
            '&::-moz-range-thumb:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 1)'
            }
          } as React.CSSProperties}
        />
      </div>
    )
  }
)

// 复选框控制组件
interface CheckboxControlProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const CheckboxControl: React.FC<CheckboxControlProps> = React.memo(
  ({ label, checked, onCheckedChange }) => {
    return (
      <motion.div
        className="flex items-center justify-between p-2 rounded-lg bg-cyan-900/10 hover:bg-cyan-800/20 transition-colors"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-sm text-cyan-300">{label}</span>
        </label>
      </motion.div>
    )
  }
)

// 预设按钮组件
interface PresetButtonProps {
  label: string
  onClick: () => void
}

const PresetButton: React.FC<PresetButtonProps> = React.memo(
  ({ label, onClick }) => {
    return (
      <motion.button
        className="rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30 px-3 py-2 text-sm font-medium text-cyan-300 border border-cyan-500/20 hover:bg-gradient-to-r from-blue-500/50 to-cyan-500/50 transition-all duration-300"
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {label}
      </motion.button>
    )
  }
)

export default React.memo(HelixControlPanel)
