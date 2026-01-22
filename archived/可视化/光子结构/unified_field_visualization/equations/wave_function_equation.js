// 波函数方程可视化模块
// 功能: 实现波函数方程的高级可视化，包括波函数演化、概率密度等

class WaveFunctionEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      waveFunctions: [],
      probabilityDensity: [],
      potential: [],
      showWaveFunction: true,
      showProbabilityDensity: true,
      showPotential: true,
      showPhase: true,
      animationSpeed: 1,
      scale: 1,
      quantumNumber: 1,
      potentialType: 'harmonic', // harmonic, square, delta
      totalEnergy: 0
    };
    this.init();
  }

  init() {
    console.log('🌊 波函数方程可视化初始化');
    this.createWaveFunctions();
    this.createProbabilityDensity();
    this.createPotential();
  }

  createWaveFunctions() {
    for (let i = 0; i < 3; i++) {
      const waveFunction = {
        id: i,
        amplitude: 1,
        frequency: 0.5 + i * 0.2,
        phase: Math.random() * Math.PI * 2,
        type: ['real', 'imaginary', 'probability'][i],
        color: this.getWaveFunctionColor(i)
      };
      this.state.waveFunctions.push(waveFunction);
    }
  }

  createProbabilityDensity() {
    for (let i = 0; i < 100; i++) {
      this.state.probabilityDensity.push({
        x: (i - 50) / 5,
        y: 0,
        color: 'rgba(0, 255, 102, 0.6)'
      });
    }
  }

  createPotential() {
    for (let i = 0; i < 100; i++) {
      const x = (i - 50) / 5;
      this.state.potential.push({
        x: x,
        y: this.calculatePotential(x),
        color: 'rgba(255, 102, 102, 0.6)'
      });
    }
  }

  calculatePotential(x) {
    switch (this.state.potentialType) {
      case 'harmonic':
        return 0.1 * x * x;
      case 'square':
        return Math.abs(x) < 5 ? 0 : 1;
      case 'delta':
        return Math.abs(x) < 0.1 ? 5 : 0;
      default:
        return 0;
    }
  }

  calculateWaveFunction(x, t, quantumNumber) {
    // 一维薛定谔方程的解
    const k = quantumNumber * 0.1;
    const omega = k * k / 2;
    return Math.sin(k * x - omega * t) * Math.exp(-0.01 * x * x);
  }

  calculateProbabilityDensity(x, t, quantumNumber) {
    const wave = this.calculateWaveFunction(x, t, quantumNumber);
    return wave * wave;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新波函数
    this.updateWaveFunctions();
    
    // 更新概率密度
    this.updateProbabilityDensity();
    
    // 更新势能
    this.updatePotential();
    
    // 计算总能量
    this.calculateTotalEnergy();
  }

  updateWaveFunctions() {
    this.state.waveFunctions.forEach((wave, index) => {
      wave.phase = this.state.time * wave.frequency + index;
    });
  }

  updateProbabilityDensity() {
    this.state.probabilityDensity.forEach((point, index) => {
      const x = (index - 50) / 5;
      point.y = this.calculateProbabilityDensity(x, this.state.time, this.state.quantumNumber);
    });
  }

  updatePotential() {
    this.state.potential.forEach((point, index) => {
      const x = (index - 50) / 5;
      point.y = this.calculatePotential(x);
    });
  }

  calculateTotalEnergy() {
    let energy = 0;
    this.state.probabilityDensity.forEach(point => {
      energy += point.y;
    });
    this.state.totalEnergy = energy;
  }

  getWaveFunctionColor(index) {
    const colors = ['rgba(102, 102, 255, 0.8)', 'rgba(255, 102, 255, 0.8)', 'rgba(0, 255, 102, 0.8)'];
    return colors[index % colors.length];
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制坐标轴
    this.renderAxes(ctx, width, height);
    
    // 绘制势能
    if (this.state.showPotential) {
      this.renderPotential(ctx, centerX, centerY);
    }
    
    // 绘制波函数
    if (this.state.showWaveFunction) {
      this.renderWaveFunctions(ctx, centerX, centerY);
    }
    
    // 绘制概率密度
    if (this.state.showProbabilityDensity) {
      this.renderProbabilityDensity(ctx, centerX, centerY);
    }
    
    // 绘制信息
    this.renderInfo(ctx, width, height);
  }

  renderAxes(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // X轴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // 刻度
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = -10; i <= 10; i++) {
      const x = centerX + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
      ctx.fillText(i.toString(), x, centerY + 15);
    }
  }

  renderWaveFunctions(ctx, centerX, centerY) {
    this.state.waveFunctions.forEach((wave, index) => {
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = -100; x <= 100; x++) {
        const realX = centerX + x * 2;
        const waveValue = this.calculateWaveFunction(x / 10, this.state.time, this.state.quantumNumber + index);
        const realY = centerY - waveValue * 50;
        
        if (x === -100) {
          ctx.moveTo(realX, realY);
        } else {
          ctx.lineTo(realX, realY);
        }
      }
      
      ctx.stroke();
    });
  }

  renderProbabilityDensity(ctx, centerX, centerY) {
    ctx.fillStyle = 'rgba(0, 255, 102, 0.3)';
    ctx.beginPath();
    
    this.state.probabilityDensity.forEach((point, index) => {
      const realX = centerX + point.x * 20;
      const realY = centerY - point.y * 200;
      
      if (index === 0) {
        ctx.moveTo(realX, centerY);
        ctx.lineTo(realX, realY);
      } else {
        ctx.lineTo(realX, realY);
      }
    });
    
    ctx.lineTo(centerX + 100 * 20, centerY);
    ctx.closePath();
    ctx.fill();
    
    // 绘制概率密度曲线
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.probabilityDensity.forEach((point, index) => {
      const realX = centerX + point.x * 20;
      const realY = centerY - point.y * 200;
      
      if (index === 0) {
        ctx.moveTo(realX, realY);
      } else {
        ctx.lineTo(realX, realY);
      }
    });
    
    ctx.stroke();
  }

  renderPotential(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 102, 102, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.potential.forEach((point, index) => {
      const realX = centerX + point.x * 20;
      const realY = centerY - point.y * 50;
      
      if (index === 0) {
        ctx.moveTo(realX, realY);
      } else {
        ctx.lineTo(realX, realY);
      }
    });
    
    ctx.stroke();
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `量子数: ${this.state.quantumNumber}`,
      `势能类型: ${this.getPotentialTypeName()}`,
      `总能量: ${this.state.totalEnergy.toFixed(2)}`,
      `波函数: ${this.state.showWaveFunction ? '显示' : '隐藏'}`,
      `概率密度: ${this.state.showProbabilityDensity ? '显示' : '隐藏'}`,
      `势能: ${this.state.showPotential ? '显示' : '隐藏'}`,
      `相位: ${this.state.showPhase ? '显示' : '隐藏'}`,
      `动画速度: ${this.state.animationSpeed.toFixed(1)}`
    ];
    
    info.forEach((line, index) => {
      ctx.fillText(line, 10, 10 + index * 20);
    });
  }

  getPotentialTypeName() {
    const types = {
      'harmonic': '谐振子',
      'square': '方势阱',
      'delta': 'δ势垒'
    };
    return types[this.state.potentialType] || this.state.potentialType;
  }

  setAnimationSpeed(speed) {
    this.state.animationSpeed = speed;
  }

  setScale(scale) {
    this.state.scale = scale;
  }

  setQuantumNumber(n) {
    this.state.quantumNumber = n;
  }

  setPotentialType(type) {
    this.state.potentialType = type;
    this.createPotential();
  }

  toggleWaveFunction() {
    this.state.showWaveFunction = !this.state.showWaveFunction;
  }

  toggleProbabilityDensity() {
    this.state.showProbabilityDensity = !this.state.showProbabilityDensity;
  }

  togglePotential() {
    this.state.showPotential = !this.state.showPotential;
  }

  togglePhase() {
    this.state.showPhase = !this.state.showPhase;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaveFunctionEquation;
} else if (typeof window !== 'undefined') {
  window.WaveFunctionEquation = WaveFunctionEquation;
}
