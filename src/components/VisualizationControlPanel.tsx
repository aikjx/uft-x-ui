import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VisualizationControlPanelProps {
  onParticleCountChange: (count: number) => void;
  onParticleColorChange: (color: string) => void;
  onParticleOpacityChange: (opacity: number) => void;
  onAutoRotateChange: (autoRotate: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
  particleCount: number;
  particleColor: string;
  particleOpacity: number;
  isAutoRotate: boolean;
  speed: number;
  size: number;
}

const VisualizationControlPanel = ({
  onParticleCountChange,
  onParticleColorChange,
  onParticleOpacityChange,
  onAutoRotateChange,
  onSpeedChange,
  onSizeChange,
  particleCount,
  particleColor,
  particleOpacity,
  isAutoRotate,
  speed,
  size
}: VisualizationControlPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 预设颜色方案
  const colorSchemes = [
    { name: 'Blue', color: '#0070f3' },
    { name: 'Pink', color: '#ff0080' },
    { name: 'Green', color: '#00ff88' },
    { name: 'Orange', color: '#ffaa00' },
    { name: 'Purple', color: '#8800ff' },
    { name: 'White', color: '#ffffff' },
    { name: 'Cyan', color: '#00ffff' },
    { name: 'Magenta', color: '#ff00ff' }
  ];
  
  return (
    <div className="relative">
      {/* 控制面板切换按钮 */}
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-30 bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all text-white"
        aria-label="Toggle Controls"
      >
        <i className={`fa ${isOpen ? 'fa-times' : 'fa-sliders'} text-xl`}></i>
      </motion.button>
      
      {/* 控制面板内容 */}
      <motion.div
        initial={{ x: 400, opacity: 0, scale: 0.95 }}
        animate={{ 
          x: isOpen ? 0 : 400, 
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.95
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-20 z-30 bg-gray-900/95 backdrop-blur-md p-6 rounded-xl shadow-2xl w-96 max-h-[85vh] overflow-y-auto border border-indigo-500/20 text-white"
      >
        {/* 面板标题 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center">
            <i className="fa fa-sliders mr-2"></i>
            可视化控制面板
          </h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded-full transition-colors"
            aria-label="Close"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
        
        {/* 粒子数量控制 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-indigo-300">
              粒子数量
            </label>
            <span className="text-xs text-gray-400">{particleCount}</span>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={particleCount}
            onChange={(e) => onParticleCountChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100</span>
            <span>5000</span>
          </div>
        </div>
        
        {/* 粒子大小控制 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-indigo-300">
              粒子大小
            </label>
            <span className="text-xs text-gray-400">{size.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={size}
            onChange={(e) => onSizeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>小</span>
            <span>大</span>
          </div>
        </div>
        
        {/* 粒子颜色控制 */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-indigo-300 mb-3">
            粒子颜色
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.color}
                onClick={() => onParticleColorChange(scheme.color)}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110',
                  particleColor === scheme.color 
                    ? 'border-indigo-400 ring-2 ring-offset-2 ring-indigo-500' 
                    : 'border-gray-700 hover:border-gray-500'
                )}
                style={{ backgroundColor: scheme.color }}
                aria-label={`Set color to ${scheme.name}`}
              />
            ))}
          </div>
        </div>
        
        {/* 粒子透明度控制 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-indigo-300">
              粒子透明度
            </label>
            <span className="text-xs text-gray-400">{particleOpacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={particleOpacity}
            onChange={(e) => onParticleOpacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>透明</span>
            <span>不透明</span>
          </div>
        </div>
        
        {/* 自动旋转控制 */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoRotate}
                onChange={(e) => onAutoRotateChange(e.target.checked)}
                className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-300">自动旋转</span>
            </label>
            <button 
              onClick={() => onAutoRotateChange(!isAutoRotate)}
              className="text-xs px-3 py-1 bg-indigo-500/20 rounded-full hover:bg-indigo-500/30 transition-colors"
            >
              {isAutoRotate ? '暂停' : '开始'}
            </button>
          </div>
          
          {/* 旋转速度控制 */}
          {isAutoRotate && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">
                  旋转速度
                </label>
                <span className="text-xs text-gray-400">{speed.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>
        
        {/* 高级选项切换 */}
        <div className="mb-5">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>{showAdvanced ? '收起' : '展开'}高级选项</span>
            <i className={`fa fa-chevron-${showAdvanced ? 'up' : 'down'} ml-2`}></i>
          </button>
          
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* 重置按钮 */}
              <div>
                <button
                  onClick={() => {
                    onParticleCountChange(1000);
                    onParticleColorChange('#0070f3');
                    onParticleOpacityChange(0.8);
                    onAutoRotateChange(false);
                    onSpeedChange(1.0);
                    onSizeChange(1.0);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all font-medium text-sm"
                >
                  <i className="fa fa-refresh mr-2"></i> 重置所有设置
                </button>
              </div>
              
              {/* 性能提示 */}
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-xs font-semibold text-indigo-300 mb-2 flex items-center">
                  <i className="fa fa-info-circle mr-1"></i> 性能提示
                </h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 减少粒子数量可提高帧率</li>
                  <li>• 降低粒子大小可减少渲染负担</li>
                  <li>• 禁用自动旋转可节省资源</li>
                  <li>• 降低透明度可减少混合计算</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* 快捷操作提示 */}
        <div className="mt-6 pt-5 border-t border-indigo-500/20">
          <h4 className="text-xs font-semibold text-indigo-300 uppercase mb-3 flex items-center">
            <i className="fa fa-keyboard mr-2"></i> 快捷键
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">I</kbd>
              <span className="text-gray-400">切换信息面板</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">F</kbd>
              <span className="text-gray-400">全屏模式</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">R</kbd>
              <span className="text-gray-400">重置相机</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Space</kbd>
              <span className="text-gray-400">暂停旋转</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">+</kbd>
              <span className="text-gray-400">放大</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">-</kbd>
              <span className="text-gray-400">缩小</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VisualizationControlPanel;