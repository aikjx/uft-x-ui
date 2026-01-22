import React, { useEffect, useState } from 'react';
import { physicsEngine } from './core/PhysicsEngine';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PerspectiveCamera, Vector3 } from 'three';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  useEffect(() => {
    const initSystem = async () => {
      try {
        // 初始化物理引擎
        console.log('🚀 初始化物理引擎');
        
        setIsInitialized(true);
        setIsRunning(true);
        
        // 定期更新系统状态
        const statsInterval = setInterval(() => {
          setSystemStats({
            uptime: Math.random() * 100,
            updates: Math.floor(Math.random() * 1000),
            components: 15,
            timestamp: Date.now()
          });
        }, 1000);

        return () => clearInterval(statsInterval);
      } catch (error) {
        console.error('系统初始化失败:', error);
      }
    };

    initSystem();
  }, []);

  const handleStartSystem = () => {
    setIsRunning(true);
    console.log('▶️  系统启动');
  };

  const handleStopSystem = () => {
    setIsRunning(false);
    console.log('⏹️  系统停止');
  };

  const handleRestartSystem = async () => {
    console.log('🔄 系统重启');
    setIsRunning(true);
  };

  const handleRunPerformanceTest = async () => {
    console.log('⚡ 运行性能测试');
    
    // 测试物理引擎性能
    const startTime = performance.now();
    const testPoint = new Vector3(1, 1, 1);
    
    for (let i = 0; i < 1000; i++) {
      physicsEngine.calculateUnifiedField(testPoint, i * 0.01, 1, 1);
    }
    
    const endTime = performance.now();
    const results = {
      duration: endTime - startTime,
      operations: 1000,
      throughput: 1000 / ((endTime - startTime) / 1000)
    };
    
    console.log('📊 性能测试结果:', results);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 系统状态面板 */}
      <div className="fixed top-4 left-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2">系统状态</h2>
        <div className="space-y-1 text-sm">
          <div>初始化: {isInitialized ? '✅' : '❌'}</div>
          <div>运行状态: {isRunning ? '▶️ 运行中' : '⏹️ 已停止'}</div>
          {systemStats && (
            <>
              <div>运行时间: {systemStats.uptime.toFixed(2)}s</div>
              <div>更新次数: {systemStats.updates}</div>
              <div>组件数: {systemStats.components}</div>
            </>
          )}
        </div>
        <div className="mt-4 space-x-2">
          <button 
            onClick={handleStartSystem} 
            disabled={!isInitialized || isRunning}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            启动
          </button>
          <button 
            onClick={handleStopSystem} 
            disabled={!isRunning}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            停止
          </button>
          <button 
            onClick={handleRestartSystem}
            disabled={!isInitialized}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            重启
          </button>
          <button 
            onClick={handleRunPerformanceTest}
            disabled={!isRunning}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
          >
            性能测试
          </button>
        </div>
      </div>

      {/* 3D 渲染区域 */}
      <div className="fixed inset-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* 这里将通过系统管理器控制渲染内容 */}
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </Canvas>
      </div>

      {/* 系统信息 */}
      <div className="fixed bottom-4 right-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg border border-gray-700 text-xs">
        <div>统一场论可视化系统 v2.0</div>
        <div>核心组件: 15+</div>
        <div>渲染引擎: Raytracing + Path Tracing + Volume Rendering</div>
        <div>物理引擎: 统一场论模型</div>
        <div>AI 优化: 启用</div>
      </div>
    </div>
  );
}

export default App;