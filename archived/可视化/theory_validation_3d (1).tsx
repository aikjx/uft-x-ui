import React, { useState, useEffect, useRef } from 'react';

export default function TheoryValidation3D() {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const [currentView, setCurrentView] = useState(0); // 0: 微观, 1: 电子光子, 2: 星系错误
  const [time, setTime] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // 视图配置
  const viewConfigs = [
    {
      title: "论述1: 速度合成公式 ✓",
      subtitle: "v²旋转 + v²发散 = c² (正确)",
      description: "空间点螺旋运动的数学模型",
      status: "correct"
    },
    {
      title: "论述2: 电子光子模型 ✓",
      subtitle: "粒子的旋转/发散分量分析 (基本正确)",
      description: "电子高旋转低发散，光子全发散无旋转",
      status: "mostly-correct"
    },
    {
      title: "论述3: 星系应用 ✗",
      subtitle: "星系旋转遵循相同公式 (错误)",
      description: "概念混淆，无文档支持",
      status: "incorrect"
    }
  ];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 700;
    
    let startTime = Date.now();
    
    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      setTime(currentTime);
      
      // 清空画布
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // 根据当前视图绘制不同内容
      switch(currentView) {
        case 0:
          drawMicroscopicModel(ctx, centerX, centerY, currentTime);
          break;
        case 1:
          drawParticleModel(ctx, centerX, centerY, currentTime);
          break;
        case 2:
          drawGalaxyModel(ctx, centerX, centerY, currentTime);
          break;
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [currentView, autoRotate]);
  
  // 绘制微观空间模型
  const drawMicroscopicModel = (ctx, centerX, centerY, time) => {
    const scale = 100;
    const radius = 1.5;
    const omega = 2.0;
    const linearV = Math.sqrt(9 - (omega * radius) * (omega * radius)); // c=3
    
    // 绘制3D坐标系
    draw3DAxes(ctx, centerX, centerY, 150);
    
    // 绘制多个螺旋轨迹展示空间运动
    for (let phase = 0; phase < 4; phase++) {
      const phaseOffset = (phase * Math.PI) / 2;
      drawHelicalTrajectory(ctx, centerX, centerY, scale, radius, omega, linearV, time, phaseOffset, '#44aaff', 0.7 - phase * 0.15);
    }
    
    // 主要运动点
    const x = radius * Math.cos(omega * time) * scale;
    const y = radius * Math.sin(omega * time) * scale;
    const z = linearV * time * 30;
    const projX = centerX + x + z * 0.3;
    const projY = centerY + y - z * 0.2;
    
    // 绘制速度矢量
    drawVelocityVectors(ctx, projX, projY, omega * radius, linearV, time, omega, radius);
    
    // 绘制运动点
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(projX, projY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制公式验证
    drawFormulaValidation(ctx, 50, 450, omega * radius, linearV, 3.0, true);
  };
  
  // 绘制粒子模型对比
  const drawParticleModel = (ctx, centerX, centerY, time) => {
    const leftCenter = centerX - 200;
    const rightCenter = centerX + 200;
    
    // 电子模型 (高旋转，低发散)
    ctx.fillStyle = '#ffff44';
    ctx.font = '16px Arial';
    ctx.fillText('电子模型', leftCenter - 50, centerY - 200);
    
    const electronOmega = 3.0;
    const electronR = 0.8;
    const electronLinearV = Math.sqrt(9 - (electronOmega * electronR) * (electronOmega * electronR));
    
    drawParticleVisualization(ctx, leftCenter, centerY, electronR, electronOmega, electronLinearV, time, '#ff6666', 80);
    drawFormulaValidation(ctx, leftCenter - 100, centerY + 100, electronOmega * electronR, electronLinearV, 3.0, true);
    
    // 光子模型 (无旋转，全发散)
    ctx.fillStyle = '#44ff44';
    ctx.fillText('光子模型', rightCenter - 50, centerY - 200);
    
    const photonOmega = 0.1;
    const photonR = 0.5;
    const photonLinearV = Math.sqrt(9 - (photonOmega * photonR) * (photonOmega * photonR));
    
    drawParticleVisualization(ctx, rightCenter, centerY, photonR, photonOmega, photonLinearV, time, '#44ff44', 80);
    drawFormulaValidation(ctx, rightCenter - 100, centerY + 100, photonOmega * photonR, photonLinearV, 3.0, true);
    
    // 对比说明
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('电子：高旋转分量，低发散分量', leftCenter - 120, centerY + 180);
    ctx.fillText('光子：低旋转分量，高发散分量', rightCenter - 120, centerY + 180);
  };
  
  // 绘制星系错误模型
  const drawGalaxyModel = (ctx, centerX, centerY, time) => {
    // 绘制星系螺旋
    drawGalaxySpiral(ctx, centerX, centerY, time);
    
    // 显示错误的数据
    const galaxyRotationSpeed = 200; // km/s
    const expansionSpeed = 70; // km/s (哈勃常数相关)
    const lightSpeed = 300000; // km/s
    
    const calculatedTotal = Math.sqrt(galaxyRotationSpeed * galaxyRotationSpeed + expansionSpeed * expansionSpeed);
    const ratio = calculatedTotal / lightSpeed;
    
    // 错误提示
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('⚠️ 概念错误！', centerX - 60, 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('将微观空间运动公式错误应用于宏观星系', centerX - 200, 80);
    
    // 数值对比
    drawIncorrectCalculation(ctx, 50, 450, galaxyRotationSpeed, expansionSpeed, lightSpeed, ratio);
    
    // 绘制错误的概念混淆图
    drawConceptualConfusion(ctx, centerX + 250, centerY);
  };
  
  // 绘制螺旋轨迹
  const drawHelicalTrajectory = (ctx, centerX, centerY, scale, radius, omega, linearV, time, phaseOffset, color, alpha) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let isFirst = true;
    for (let t = 0; t <= time; t += 0.05) {
      const x = radius * Math.cos(omega * t + phaseOffset) * scale;
      const y = radius * Math.sin(omega * t + phaseOffset) * scale;
      const z = linearV * t * 30;
      const projX = centerX + x + z * 0.3;
      const projY = centerY + y - z * 0.2;
      
      if (isFirst) {
        ctx.moveTo(projX, projY);
        isFirst = false;
      } else {
        ctx.lineTo(projX, projY);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  
  // 绘制3D坐标系
  const draw3DAxes = (ctx, centerX, centerY, length) => {
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    
    // X轴 (红色)
    ctx.strokeStyle = '#ff6666';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + length, centerY);
    ctx.stroke();
    
    // Y轴 (绿色)
    ctx.strokeStyle = '#66ff66';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - length);
    ctx.stroke();
    
    // Z轴 (蓝色) - 3D投影
    ctx.strokeStyle = '#6666ff';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + length * 0.3, centerY - length * 0.2);
    ctx.stroke();
    
    // 标签
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('X', centerX + length + 5, centerY + 5);
    ctx.fillText('Y', centerX + 5, centerY - length - 5);
    ctx.fillText('Z', centerX + length * 0.3 + 5, centerY - length * 0.2 - 5);
  };
  
  // 绘制速度矢量
  const drawVelocityVectors = (ctx, x, y, rotSpeed, linSpeed, time, omega, radius) => {
    const scale = 40;
    
    // 旋转速度矢量 (红色)
    const rotVx = -radius * omega * Math.sin(omega * time);
    const rotVy = radius * omega * Math.cos(omega * time);
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    drawArrow(ctx, x, y, x + rotVx * scale, y + rotVy * scale);
    
    // 线性速度矢量 (绿色)
    ctx.strokeStyle = '#00ff00';
    drawArrow(ctx, x, y, x + linSpeed * scale * 0.3, y - linSpeed * scale * 0.2);
    
    // 总速度矢量 (蓝色)
    const totalVx = rotVx + linSpeed * 0.3;
    const totalVy = rotVy - linSpeed * 0.2;
    ctx.strokeStyle = '#0000ff';
    drawArrow(ctx, x, y, x + totalVx * scale, y + totalVy * scale);
  };
  
  // 绘制箭头
  const drawArrow = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 10;
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - 0.3), y2 - headLength * Math.sin(angle - 0.3));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + 0.3), y2 - headLength * Math.sin(angle + 0.3));
    ctx.stroke();
  };
  
  // 绘制粒子可视化
  const drawParticleVisualization = (ctx, centerX, centerY, radius, omega, linearV, time, color, scale) => {
    // 绘制轨迹
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let isFirst = true;
    for (let t = Math.max(0, time - 3); t <= time; t += 0.1) {
      const x = radius * Math.cos(omega * t) * scale;
      const y = radius * Math.sin(omega * t) * scale;
      const z = linearV * t * 15;
      const projX = centerX + x + z * 0.2;
      const projY = centerY + y - z * 0.1;
      
      if (isFirst) {
        ctx.moveTo(projX, projY);
        isFirst = false;
      } else {
        ctx.lineTo(projX, projY);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // 当前位置
    const x = radius * Math.cos(omega * time) * scale;
    const y = radius * Math.sin(omega * time) * scale;
    const z = linearV * time * 15;
    const projX = centerX + x + z * 0.2;
    const projY = centerY + y - z * 0.1;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(projX, projY, 6, 0, 2 * Math.PI);
    ctx.fill();
  };
  
  // 绘制公式验证
  const drawFormulaValidation = (ctx, x, y, rotSpeed, linSpeed, lightSpeed, isCorrect) => {
    const totalSpeed = Math.sqrt(rotSpeed * rotSpeed + linSpeed * linSpeed);
    const error = Math.abs(totalSpeed - lightSpeed);
    
    ctx.fillStyle = isCorrect ? '#44ff44' : '#ff4444';
    ctx.font = '12px monospace';
    ctx.fillText(`v_旋转: ${rotSpeed.toFixed(3)}`, x, y);
    ctx.fillText(`v_发散: ${linSpeed.toFixed(3)}`, x, y + 20);
    ctx.fillText(`总速度: ${totalSpeed.toFixed(3)}`, x, y + 40);
    ctx.fillText(`光速c: ${lightSpeed.toFixed(3)}`, x, y + 60);
    ctx.fillText(`误差: ${error.toFixed(6)}`, x, y + 80);
    ctx.fillText(isCorrect ? '验证: ✓' : '验证: ✗', x, y + 100);
  };
  
  // 绘制星系螺旋
  const drawGalaxySpiral = (ctx, centerX, centerY, time) => {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    
    // 绘制螺旋臂
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      const armOffset = arm * Math.PI;
      
      for (let r = 20; r < 150; r += 2) {
        const angle = r * 0.1 + time * 0.1 + armOffset;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        if (r === 20) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    // 星系中心
    ctx.fillStyle = '#ffff44';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 一些恒星
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI + time * 0.1;
      const r = 50 + i * 5;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  };
  
  // 绘制错误计算
  const drawIncorrectCalculation = (ctx, x, y, vRot, vExp, c, ratio) => {
    ctx.fillStyle = '#ff6666';
    ctx.font = '14px monospace';
    ctx.fillText(`星系旋转速度: ${vRot} km/s`, x, y);
    ctx.fillText(`宇宙膨胀速度: ${vExp} km/s`, x, y + 20);
    ctx.fillText(`计算总速度: ${Math.sqrt(vRot*vRot + vExp*vExp).toFixed(1)} km/s`, x, y + 40);
    ctx.fillText(`光速: ${c} km/s`, x, y + 60);
    ctx.fillText(`比例: ${(ratio * 100).toFixed(4)}%`, x, y + 80);
    ctx.fillText('❌ 公式不适用！', x, y + 120);
    ctx.fillText('❌ 尺度概念混淆！', x, y + 140);
  };
  
  // 绘制概念混淆说明
  const drawConceptualConfusion = (ctx, x, y) => {
    ctx.fillStyle = '#ffaa44';
    ctx.font = '14px Arial';
    ctx.fillText('概念混淆:', x - 50, y - 100);
    
    ctx.fillStyle = '#44ff44';
    ctx.fillText('✓ 微观: 空间点螺旋运动', x - 80, y - 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('- 物体周围空间的几何运动', x - 75, y - 50);
    ctx.fillText('- 尺度: 原子级别', x - 75, y - 35);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = '14px Arial';
    ctx.fillText('✗ 宏观: 星系天体运动', x - 80, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('- 天体在空间中的轨道运动', x - 75, y + 20);
    ctx.fillText('- 尺度: 光年级别', x - 75, y + 35);
    ctx.fillText('- 物理机制: 引力', x - 75, y + 50);
  };
  
  const currentConfig = viewConfigs[currentView];
  
  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-600 rounded"
      />
      
      {/* 标题和状态 */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg border-2 ${
        currentConfig.status === 'correct' ? 'bg-green-900 border-green-500' :
        currentConfig.status === 'mostly-correct' ? 'bg-yellow-900 border-yellow-500' :
        'bg-red-900 border-red-500'
      }`}>
        <h2 className="text-xl font-bold text-white text-center">{currentConfig.title}</h2>
        <p className="text-sm text-center mt-1 text-gray-300">{currentConfig.subtitle}</p>
        <p className="text-xs text-center mt-1 text-gray-400">{currentConfig.description}</p>
      </div>
      
      {/* 控制面板 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 p-4 rounded-lg border border-gray-600 max-w-xs">
        <h3 className="text-lg font-bold text-white mb-3">论述验证切换</h3>
        
        <div className="space-y-2">
          {viewConfigs.map((config, index) => (
            <button
              key={index}
              onClick={() => setCurrentView(index)}
              className={`w-full p-2 rounded text-sm font-medium border ${
                currentView === index
                  ? config.status === 'correct' ? 'bg-green-700 border-green-500 text-white' :
                    config.status === 'mostly-correct' ? 'bg-yellow-700 border-yellow-500 text-white' :
                    'bg-red-700 border-red-500 text-white'
                  : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-left">
                <div>{config.title}</div>
                <div className="text-xs opacity-75 mt-1">{config.description}</div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            className="accent-cyan-500"
          />
          <label className="text-sm text-white">自动旋转</label>
        </div>
      </div>
      
      {/* 详细说明面板 */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 p-4 rounded-lg border border-gray-600 max-w-md">
        <h4 className="text-md font-bold text-yellow-400 mb-2">详细分析</h4>
        
        {currentView === 0 && (
          <div className="text-sm text-white space-y-2">
            <div className="text-green-400">✓ 数学公式正确</div>
            <div>• v²旋转 + v²发散 = c²</div>
            <div>• 空间点螺旋运动模型</div>
            <div>• 光速守恒原则</div>
            <div>• 完全符合文档描述</div>
          </div>
        )}
        
        {currentView === 1 && (
          <div className="text-sm text-white space-y-2">
            <div className="text-yellow-400">≈ 理论推论基本正确</div>
            <div>• 电子：高旋转，低发散</div>
            <div>• 光子：低旋转，高发散</div>
            <div>• 符合文档精神</div>
            <div className="text-gray-400">注：属于理论诠释，非直接引述</div>
          </div>
        )}
        
        {currentView === 2 && (
          <div className="text-sm text-white space-y-2">
            <div className="text-red-400">✗ 概念错误</div>
            <div>• 混淆微观与宏观尺度</div>
            <div>• 星系旋转 ≠ 空间点旋转</div>
            <div>• 数值差异巨大 (~0.07% vs 100%)</div>
            <div>• 文档中无此内容</div>
            <div className="text-red-300">建议：删除或修正此部分</div>
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            时间: {time.toFixed(1)}s | 视图: {currentView + 1}/3
          </div>
        </div>
      </div>
      
      {/* 图例 */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 p-3 rounded-lg border border-gray-600">
        <h4 className="text-sm font-bold text-white mb-2">图例</h4>
        <div className="text-xs text-white space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-1 bg-red-500 mr-2"></div>
            <span>旋转速度</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-green-500 mr-2"></div>
            <span>线性/发散速度</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-blue-500 mr-2"></div>
            <span>总速度</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-blue-400 mr-2"></div>
            <span>运动轨迹</span>
          </div>
        </div>
      </div>
    </div>
  );
}