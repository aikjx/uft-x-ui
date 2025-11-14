import React, { useState, useEffect, useCallback } from 'react';
import {
  performanceOptimizationManager
} from '../utils/performanceOptimizationManager';
import {
  devicePerformanceAnalyzer
} from '../utils/devicePerformanceAnalyzer';
import {
  performanceDataCollector
} from '../utils/performanceDataCollector';
import {
  sceneComplexityAnalyzer
} from '../utils/sceneComplexityAnalyzer';

interface AdvancedPerformancePanelProps {
  onClose: () => void;
  onSettingsChanged: (settings: Record<string, any>) => void;
}

export const AdvancedPerformancePanel: React.FC<AdvancedPerformancePanelProps> = ({
  onClose,
  onSettingsChanged
}) => {
  // 性能模式状态
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low' | 'auto'>('auto');
  
  // 高级设置
  const [advancedSettings, setAdvancedSettings] = useState({
    pixelRatio: 'auto',
    shadowQuality: 'medium',
    renderDistance: 'medium',
    antiAliasing: true,
    frameSkipEnabled: true,
    maxFPS: 60
  });
  
  // 性能测试状态
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  
  // 实时性能数据
  const [performanceData, setPerformanceData] = useState({
    currentFPS: 0,
    memoryUsage: 0,
    drawCalls: 0,
    sceneComplexity: 'low',
    optimizationLevel: 'normal'
  });
  
  // 加载当前设置
  useEffect(() => {
    // 初始化性能模式
    const currentMode = performanceOptimizationManager.getCurrentMode();
    setPerformanceMode(currentMode as 'high' | 'medium' | 'low' | 'auto');
    
    // 加载高级设置
    const renderer = performanceOptimizationManager.getRenderer();
    if (renderer) {
      setAdvancedSettings(prev => ({
        ...prev,
        pixelRatio: renderer.getPixelRatio() === window.devicePixelRatio ? 'auto' : renderer.getPixelRatio()
      }));
    }
    
    // 检查自动模式状态
    setAutoModeEnabled(performanceOptimizationManager.isAutoModeEnabled());
  }, []);
  
  // 更新性能数据
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const stats = performanceDataCollector.getPerformanceStats();
      setPerformanceData({
        currentFPS: stats.currentFPS,
        memoryUsage: stats.memoryUsage,
        drawCalls: stats.drawCalls,
        sceneComplexity: sceneComplexityAnalyzer.getCurrentComplexity().level,
        optimizationLevel: performanceOptimizationManager.getCurrentOptimizationLevel()
      });
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, []);
  
  // 处理性能模式变更
  const handleModeChange = useCallback((mode: 'high' | 'medium' | 'low' | 'auto') => {
    setPerformanceMode(mode);
    performanceOptimizationManager.setPerformanceMode(mode);
    
    // 通知父组件设置变更
    onSettingsChanged({
      performanceMode: mode,
      autoMode: mode === 'auto'
    });
  }, [onSettingsChanged]);
  
  // 处理高级设置变更
  const handleAdvancedSettingChange = useCallback((key: string, value: any) => {
    setAdvancedSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // 应用设置到优化管理器
      if (key === 'pixelRatio') {
        performanceOptimizationManager.updatePixelRatio(value === 'auto' ? window.devicePixelRatio : value);
      } else if (key === 'shadowQuality') {
        performanceOptimizationManager.updateShadowQuality(value);
      } else if (key === 'renderDistance') {
        performanceOptimizationManager.updateRenderDistance(value);
      } else if (key === 'antiAliasing') {
        performanceOptimizationManager.toggleAntiAliasing(value);
      } else if (key === 'frameSkipEnabled') {
        performanceOptimizationManager.toggleFrameSkip(value);
      } else if (key === 'maxFPS') {
        performanceOptimizationManager.setMaxFPS(value);
      }
      
      // 通知父组件设置变更
      onSettingsChanged(newSettings);
      
      return newSettings;
    });
  }, [onSettingsChanged]);
  
  // 运行性能测试
  const runPerformanceTest = useCallback(async () => {
    setIsRunningTest(true);
    
    try {
      // 运行完整的性能测试
      const results = await devicePerformanceAnalyzer.runFullPerformanceTest();
      setTestResults(results);
      
      // 推荐最佳设置
      const recommended = devicePerformanceAnalyzer.getRecommendedSettings(results);
      if (recommended.mode) {
        handleModeChange(recommended.mode as 'high' | 'medium' | 'low' | 'auto');
      }
      
      console.log('性能测试结果:', results);
      console.log('推荐设置:', recommended);
    } catch (error) {
      console.error('性能测试失败:', error);
    } finally {
      setIsRunningTest(false);
    }
  }, [handleModeChange]);
  
  // 导出性能报告
  const exportPerformanceReport = useCallback(() => {
    const report = performanceDataCollector.generatePerformanceReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);
  
  // 重置为默认设置
  const resetToDefaults = useCallback(() => {
    performanceOptimizationManager.resetToDefaults();
    
    // 重置UI状态
    setPerformanceMode('auto');
    setAdvancedSettings({
      pixelRatio: 'auto',
      shadowQuality: 'medium',
      renderDistance: 'medium',
      antiAliasing: true,
      frameSkipEnabled: true,
      maxFPS: 60
    });
    setAutoModeEnabled(true);
    
    onSettingsChanged({
      performanceMode: 'auto',
      autoMode: true,
      ...{
        pixelRatio: 'auto',
        shadowQuality: 'medium',
        renderDistance: 'medium',
        antiAliasing: true,
        frameSkipEnabled: true,
        maxFPS: 60
      }
    });
  }, [onSettingsChanged]);
  
  // 切换自动模式
  const toggleAutoMode = useCallback(() => {
    const newAutoMode = !autoModeEnabled;
    setAutoModeEnabled(newAutoMode);
    performanceOptimizationManager.setAutoMode(newAutoMode);
    
    onSettingsChanged({ autoMode: newAutoMode });
  }, [autoModeEnabled, onSettingsChanged]);

  return (
    <div className="text-white">
      {/* 面板头部 */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium">高级性能控制面板</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* 性能概览 */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <h4 className="text-md font-medium mb-3 text-gray-300">性能概览</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400">当前 FPS</p>
            <p className="text-xl font-bold text-green-400">{performanceData.currentFPS.toFixed(1)}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400">内存使用</p>
            <p className="text-xl font-bold text-blue-400">{performanceData.memoryUsage.toFixed(0)} MB</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400">绘制调用</p>
            <p className="text-xl font-bold text-yellow-400">{performanceData.drawCalls}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400">场景复杂度</p>
            <p className={`text-xl font-bold ${getComplexityColor(performanceData.sceneComplexity)}`}>
              {getComplexityText(performanceData.sceneComplexity)}
            </p>
          </div>
        </div>
      </div>
      
      {/* 性能模式选择 */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-md font-medium mb-3 text-gray-300">性能模式</h4>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { value: 'high', label: '高质量' },
            { value: 'medium', label: '平衡' },
            { value: 'low', label: '性能' },
            { value: 'auto', label: '自动' }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value as 'high' | 'medium' | 'low' | 'auto')}
              className={`px-3 py-2 rounded-lg text-sm ${performanceMode === mode.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        
        {/* 自动模式开关 */}
        <div className="flex items-center justify-between mt-4">
          <label className="text-sm text-gray-300">自动性能优化</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoModeEnabled}
              onChange={toggleAutoMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
      
      {/* 高级设置 */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-md font-medium mb-3 text-gray-300">高级设置</h4>
        
        {/* 像素比率 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">像素比率</label>
          <select
            value={advancedSettings.pixelRatio}
            onChange={(e) => handleAdvancedSettingChange('pixelRatio', e.target.value === 'auto' ? 'auto' : parseFloat(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          >
            <option value="auto">自动 (系统默认)</option>
            <option value="1">1.0</option>
            <option value="1.5">1.5</option>
            <option value="2">2.0</option>
          </select>
        </div>
        
        {/* 阴影质量 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">阴影质量</label>
          <select
            value={advancedSettings.shadowQuality}
            onChange={(e) => handleAdvancedSettingChange('shadowQuality', e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          >
            <option value="high">高质量</option>
            <option value="medium">中等</option>
            <option value="low">低质量</option>
            <option value="none">关闭</option>
          </select>
        </div>
        
        {/* 渲染距离 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">渲染距离</label>
          <select
            value={advancedSettings.renderDistance}
            onChange={(e) => handleAdvancedSettingChange('renderDistance', e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          >
            <option value="high">远</option>
            <option value="medium">中等</option>
            <option value="low">近</option>
          </select>
        </div>
        
        {/* 反锯齿 */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-300">反锯齿</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={advancedSettings.antiAliasing}
              onChange={(e) => handleAdvancedSettingChange('antiAliasing', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        {/* 帧跳过 */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-300">动态帧跳过</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={advancedSettings.frameSkipEnabled}
              onChange={(e) => handleAdvancedSettingChange('frameSkipEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        {/* 最大FPS */}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">最大FPS: {advancedSettings.maxFPS}</label>
          <input
            type="range"
            min="30"
            max="144"
            step="5"
            value={advancedSettings.maxFPS}
            onChange={(e) => handleAdvancedSettingChange('maxFPS', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* 性能测试和操作 */}
      <div className="p-4">
        <h4 className="text-md font-medium mb-3 text-gray-300">性能测试</h4>
        
        <button
          onClick={runPerformanceTest}
          disabled={isRunningTest}
          className={`w-full py-3 rounded-lg text-white font-medium ${isRunningTest 
            ? 'bg-gray-700 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {isRunningTest ? '测试中...' : '运行性能测试'}
        </button>
        
        {testResults && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg">
            <h5 className="text-sm font-medium text-gray-300 mb-2">测试结果</h5>
            <p className="text-xs text-gray-400 mb-1">GPU 分数: {testResults.gpuScore}</p>
            <p className="text-xs text-gray-400 mb-1">CPU 分数: {testResults.cpuScore}</p>
            <p className="text-xs text-gray-400 mb-1">内存性能: {testResults.memoryScore}</p>
            <p className="text-xs text-gray-400">推荐模式: {testResults.recommendedMode}</p>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={exportPerformanceReport}
            className="py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
          >
            导出报告
          </button>
          <button
            onClick={resetToDefaults}
            className="py-2 rounded-lg bg-yellow-600 text-white font-medium text-sm hover:bg-yellow-700"
          >
            重置设置
          </button>
        </div>
      </div>
    </div>
  );
};

// 辅助函数
function getComplexityColor(level: string): string {
  switch (level) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-orange-400';
    case 'very_high': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

function getComplexityText(level: string): string {
  switch (level) {
    case 'low': return '低';
    case 'medium': return '中';
    case 'high': return '高';
    case 'very_high': return '极高';
    default: return level;
  }
}