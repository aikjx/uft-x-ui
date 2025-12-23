import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 控制面板配置项
 */
export interface ControlPanelConfig {
  enabled: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  width: number;
  height: number;
  backgroundColor: string;
  opacity: number;
  draggable: boolean;
}

/**
 * 控制面板数据项
 */
export interface ControlItem {
  id: string;
  label: string;
  type: 'slider' | 'checkbox' | 'select' | 'color' | 'number';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: any; label: string }>;
  onChange: (value: any) => void;
}

/**
 * 控制面板组件
 */
const ControlPanel: React.FC<{
  title: string;
  items: ControlItem[];
  config?: Partial<ControlPanelConfig>;
  onClose?: () => void;
  isOpen?: boolean;
}> = ({
  title,
  items,
  config = {},
  onClose,
  isOpen = true
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [localItems, setLocalItems] = useState(items);

  // 合并默认配置
  const panelConfig: ControlPanelConfig = {
    enabled: true,
    position: 'right',
    width: 300,
    height: 500,
    backgroundColor: '#1e1b4b',
    opacity: 0.95,
    draggable: false,
    ...config
  };

  // 更新本地状态当外部items变化时
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // 处理配置项变化
  const handleItemChange = (id: string, value: any) => {
    const item = localItems.find(item => item.id === id);
    if (item) {
      item.onChange(value);
      setLocalItems(prev => prev.map(item => item.id === id ? { ...item, value } : item));
    }
  };

  // 渲染配置项
  const renderControlItem = (item: ControlItem) => {
    switch (item.type) {
      case 'slider':
        return (
          <div key={item.id} className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">{item.label}</label>
              <span className="text-sm text-gray-400">{item.value.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={item.min || 0}
              max={item.max || 100}
              step={item.step || 1}
              value={item.value}
              onChange={(e) => handleItemChange(item.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={item.id} className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{item.label}</label>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => handleItemChange(item.id, e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-700 rounded focus:ring-indigo-500"
            />
          </div>
        );

      case 'select':
        return (
          <div key={item.id} className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">{item.label}</label>
            <select
              value={item.value}
              onChange={(e) => handleItemChange(item.id, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {item.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'color':
        return (
          <div key={item.id} className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">{item.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={item.value}
                onChange={(e) => handleItemChange(item.id, e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border border-gray-600"
              />
              <span className="text-sm text-gray-400">{item.value}</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={item.id} className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">{item.label}</label>
            <input
              type="number"
              min={item.min}
              max={item.max}
              step={item.step}
              value={item.value}
              onChange={(e) => handleItemChange(item.id, parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className={`fixed z-50 overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm ${panelConfig.position}-0 transform transition-all duration-300 ease-in-out`}
          style={{
            width: panelConfig.width,
            height: panelConfig.height,
            backgroundColor: panelConfig.backgroundColor,
            opacity: panelConfig.opacity
          }}
          initial={{ [panelConfig.position === 'left' || panelConfig.position === 'right' ? 'x' : 'y']: panelConfig.position === 'left' || panelConfig.position === 'top' ? '-100%' : '100%' }}
          animate={{ [panelConfig.position === 'left' || panelConfig.position === 'right' ? 'x' : 'y']: 0 }}
          exit={{ [panelConfig.position === 'left' || panelConfig.position === 'right' ? 'x' : 'y']: panelConfig.position === 'left' || panelConfig.position === 'top' ? '-100%' : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* 面板标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="flex items-center gap-2">
              {/* 最小化按钮 */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* 关闭按钮 */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 面板内容 */}
          <div className="overflow-y-auto px-4 py-6 max-h-[calc(100%-60px)]">
            {localItems.map(renderControlItem)}
          </div>
        </motion.div>
      )}

      {/* 展开按钮 */}
      {!isExpanded && (
        <motion.button
          className={`fixed z-50 p-2 rounded-lg shadow-lg backdrop-blur-sm ${panelConfig.position}-4 bottom-4 bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300`}
          onClick={() => setIsExpanded(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ControlPanel;
