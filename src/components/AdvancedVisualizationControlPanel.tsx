import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 高级可视化功能配置接口
export interface AdvancedVisualizationConfig {
  rayTracing: boolean
  globalIllumination: boolean
  volumetricLight: boolean
  nebulaEffect: boolean
  advancedParticles: boolean
  depthOfField: boolean
  bloomEffect: boolean
  afterimageEffect: boolean
  highQualityAA: boolean
  outline: boolean
}

// 组件属性接口
export interface AdvancedVisualizationControlPanelProps {
  // 功能状态
  features: AdvancedVisualizationConfig
  // 功能切换回调
  onToggleFeature: (feature: keyof AdvancedVisualizationConfig, enabled: boolean) => void
  // 自定义CSS类名
  className?: string
}

const AdvancedVisualizationControlPanel: React.FC<AdvancedVisualizationControlPanelProps> = React.memo(
  ({ features, onToggleFeature, className = '' }) => {
    // 添加折叠状态
    const [isCollapsed, setIsCollapsed] = useState(false)

    // 切换面板折叠状态
    const toggleCollapse = useCallback(() => {
      setIsCollapsed(!isCollapsed)
    }, [isCollapsed])

    // 切换特定功能
    const handleToggleFeature = useCallback((feature: keyof AdvancedVisualizationConfig) => {
      onToggleFeature(feature, !features[feature])
    }, [features, onToggleFeature])

    // 功能项配置
    const featureItems = [
      {
        key: 'rayTracing' as keyof AdvancedVisualizationConfig,
        icon: '🔍',
        label: '光线追踪',
        description: '真实的光线追踪效果'
      },
      {
        key: 'globalIllumination' as keyof AdvancedVisualizationConfig,
        icon: '💡',
        label: '全局光照',
        description: '逼真的环境光照'
      },
      {
        key: 'volumetricLight' as keyof AdvancedVisualizationConfig,
        icon: '🌫️',
        label: '体积光',
        description: '光线散射和尘埃效果'
      },
      {
        key: 'nebulaEffect' as keyof AdvancedVisualizationConfig,
        icon: '🌌',
        label: '星云效果',
        description: '星空云雾渲染'
      },
      {
        key: 'advancedParticles' as keyof AdvancedVisualizationConfig,
        icon: '✨',
        label: '高级粒子',
        description: '复杂粒子系统'
      },
      {
        key: 'depthOfField' as keyof AdvancedVisualizationConfig,
        icon: '📷',
        label: '景深',
        description: '相机景深效果'
      },
      {
        key: 'bloomEffect' as keyof AdvancedVisualizationConfig,
        icon: '🌟',
        label: '泛光',
        description: '光线溢色效果'
      },
      {
        key: 'afterimageEffect' as keyof AdvancedVisualizationConfig,
        icon: '💫',
        label: '残影',
        description: '运动轨迹残影'
      },
      {
        key: 'highQualityAA' as keyof AdvancedVisualizationConfig,
        icon: '🎨',
        label: '高质量抗锯齿',
        description: '更平滑的边缘'
      },
      {
        key: 'outline' as keyof AdvancedVisualizationConfig,
        icon: '📐',
        label: '边缘轮廓',
        description: '高亮显示边缘'
      }
    ]

    return (
      <AnimatePresence>
        <motion.div
          className={`absolute right-4 top-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 p-3 text-xs text-white shadow-lg shadow-blue-500/10 backdrop-blur-md ${className}`}
          initial={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* 控制面板标题栏 */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/20">
            <motion.h3 
              className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              🎭 高级可视化
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
            </div>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* 渲染管线优化提示 */}
                <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/20 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">💡</span>
                    <span className="text-blue-300">提示：启用多个高级效果可能影响性能</span>
                  </div>
                </div>

                {/* 功能项 */}
                {featureItems.map(item => (
                  <AdvancedFeatureItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    isChecked={features[item.key]}
                    onToggle={() => handleToggleFeature(item.key)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    )
  }
)

// 功能项子组件
interface AdvancedFeatureItemProps {
  icon: string
  label: string
  description: string
  isChecked: boolean
  onToggle: () => void
}

const AdvancedFeatureItem: React.FC<AdvancedFeatureItemProps> = React.memo(
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
              onClick={onToggle}
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
            
            {/* 切换状态文本 */}
            <span className="ml-2 text-xs font-medium">
              {isChecked ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>
        
        {/* 描述文本 */}
        <motion.p 
          className="text-xs text-gray-400 ml-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>
      </motion.div>
    )
  }
)

export default AdvancedVisualizationControlPanel