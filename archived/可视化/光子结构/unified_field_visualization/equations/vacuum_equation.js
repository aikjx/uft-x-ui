// 真空方程可视化模块
// 功能: 实现真空方程的高级可视化，包括真空能量、量子涨落等

class VacuumEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      vacuumEnergy: [],
      quantumFluctuations: [],
      showVacuumEnergy: true,
      showQuantumFluctuations: true,
      showVirtualParticles: true,
      showEnergySpectrum: true,
      animationSpeed: 1,
      scale: 1,
      vacuumEnergyDensity: 1,
      cosmologicalConstant: 1,
      totalVacuumEnergy: 0,
      quantumTemperature: 0,
      fluctuationAmplitude: 0
    };
    this.init();
  }

  init() {
    console.log('⚪ 真空方程可视化初始化');
    this.createVacuumEnergy();
    this.createQuantumFluctuations();
  }

  createVacuumEnergy() {
    for (let i = 0; i < 50; i++) {
      const energy = {
        frequency: i * 0.1,
        energyDensity: 0,
        color: 'rgba(102, 102, 255, 0.6)'
      };
      this.state.vacuumEnergy.push(energy);
    }
  }

  createQuantumFluctuations() {
    for (let i = 0; i < 80; i++) {
      const fluctuation = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        amplitude: Math.random(),
        lifetime: Math.random() * 2,
        color: this.getFluctuationColor(Math.random())
      };
      this.state.quantumFluctuations.push(fluctuation);
    }
  }

  calculateVacuumEnergyDensity(frequency) {
    return this.state.vacuumEnergyDensity * (1 + Math.sin(frequency * 0.5));
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    this.updateVacuumEnergy();
    this.updateQuantumFluctuations();
    this.calculateVacuumParameters();
  }

  updateVacuumEnergy() {
    this.state.vacuumEnergy.forEach(energy => {
      energy.energyDensity = this.calculateVacuumEnergyDensity(energy.frequency);
    });
  }

  updateQuantumFluctuations() {
    this.state.quantumFluctuations.forEach(fluctuation => {
      fluctuation.amplitude = Math.sin(this.state.time * 0.5 + fluctuation.id) * 0.5 + 0.5;
    });
  }

  calculateVacuumParameters() {
    this.state.totalVacuumEnergy = this.state.vacuumEnergyDensity * 100;
    this.state.quantumTemperature = this.state.vacuumEnergyDensity * 10;
    this.state.fluctuationAmplitude = Math.sin(this.state.time * 0.2) * 0.5 + 0.5;
  }

  getFluctuationColor(amplitude) {
    const intensity = Math.floor(amplitude * 255);
    return `rgba(${intensity}, ${intensity}, 255, 0.8)`;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    if (this.state.showVacuumEnergy) {
      this.renderVacuumEnergy(ctx, centerX, centerY);
    }
    
    if (this.state.showQuantumFluctuations) {
      this.renderQuantumFluctuations(ctx, centerX, centerY);
    }
    
    if (this.state.showVirtualParticles) {
      this.renderVirtualParticles(ctx, centerX, centerY);
    }
    
    if (this.state.showEnergySpectrum) {
      this.renderEnergySpectrum(ctx, centerX, centerY);
    }
    
    this.renderInfo(ctx, width, height);
  }

  renderVacuumEnergy(ctx, centerX, centerY) {
    this.state.vacuumEnergy.forEach((energy, index) => {
      ctx.strokeStyle = energy.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const x = centerX + (index - 25) * 10;
      const y = centerY - energy.energyDensity * 50;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  renderQuantumFluctuations(ctx, centerX, centerY) {
    this.state.quantumFluctuations.forEach(fluctuation => {
      ctx.fillStyle = fluctuation.color;
      ctx.beginPath();
      const x = centerX + fluctuation.position.x * this.state.scale;
      const y = centerY + fluctuation.position.y * this.state.scale;
      const size = fluctuation.amplitude * 5;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderVirtualParticles(ctx, centerX, centerY) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 100 + Math.sin(this.state.time * 0.1) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.fillStyle = 'rgba(255, 102, 102, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderEnergySpectrum(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(102, 255, 102, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 30; i++) {
      const energy = i * 0.2;
      const intensity = 1 / (1 + energy * energy);
      const x = centerX + (i - 15) * 10;
      const y = centerY - intensity * 80;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `真空能量密度: ${this.state.vacuumEnergyDensity.toFixed(2)}`,
      `宇宙常数: ${this.state.cosmologicalConstant.toFixed(2)}`,
      `总真空能量: ${this.state.totalVacuumEnergy.toFixed(2)}`,
      `量子温度: ${this.state.quantumTemperature.toFixed(2)} K`,
      `涨落幅度: ${this.state.fluctuationAmplitude.toFixed(2)}`,
      `真空能量: ${this.state.showVacuumEnergy ? '显示' : '隐藏'}`,
      `量子涨落: ${this.state.showQuantumFluctuations ? '显示' : '隐藏'}`,
      `虚粒子: ${this.state.showVirtualParticles ? '显示' : '隐藏'}`,
      `能谱: ${this.state.showEnergySpectrum ? '显示' : '隐藏'}`,
      `动画速度: ${this.state.animationSpeed.toFixed(1)}`
    ];
    
    info.forEach((line, index) => {
      ctx.fillText(line, 10, 10 + index * 20);
    });
  }

  setAnimationSpeed(speed) {
    this.state.animationSpeed = speed;
  }

  setScale(scale) {
    this.state.scale = scale;
  }

  setVacuumEnergyDensity(density) {
    this.state.vacuumEnergyDensity = density;
  }

  toggleVacuumEnergy() {
    this.state.showVacuumEnergy = !this.state.showVacuumEnergy;
  }

  toggleQuantumFluctuations() {
    this.state.showQuantumFluctuations = !this.state.showQuantumFluctuations;
  }

  toggleVirtualParticles() {
    this.state.showVirtualParticles = !this.state.showVirtualParticles;
  }

  toggleEnergySpectrum() {
    this.state.showEnergySpectrum = !this.state.showEnergySpectrum;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VacuumEquation;
} else if (typeof window !== 'undefined') {
  window.VacuumEquation = VacuumEquation;
}
