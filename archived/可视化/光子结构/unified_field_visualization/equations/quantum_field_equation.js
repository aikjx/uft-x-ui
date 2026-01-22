// 量子场方程可视化模块
// 功能: 实现量子场方程的高级可视化，包括量子场涨落、真空态等

class QuantumFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      quantumFields: [],
      vacuumFluctuations: [],
      particleCreation: [],
      showQuantumFields: true,
      showVacuumFluctuations: true,
      showParticleCreation: true,
      showEnergySpectrum: true,
      animationSpeed: 1,
      scale: 1,
      temperature: 1,
      chemicalPotential: 0,
      totalEnergy: 0,
      particleCount: 0,
      vacuumEnergy: 0
    };
    this.init();
  }

  init() {
    console.log('⚫ 量子场方程可视化初始化');
    this.createQuantumFields();
    this.createVacuumFluctuations();
    this.createParticleCreation();
  }

  createQuantumFields() {
    for (let i = 0; i < 4; i++) {
      const field = {
        id: i,
        type: ['scalar', 'vector', 'spinor', 'tensor'][i],
        amplitude: Math.random(),
        frequency: 0.5 + i * 0.3,
        phase: Math.random() * Math.PI * 2,
        color: this.getQuantumFieldColor(i)
      };
      this.state.quantumFields.push(field);
    }
  }

  createVacuumFluctuations() {
    for (let i = 0; i < 100; i++) {
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
      this.state.vacuumFluctuations.push(fluctuation);
    }
  }

  createParticleCreation() {
    for (let i = 0; i < 20; i++) {
      const creation = {
        id: i,
        position: {
          x: 0,
          y: 0
        },
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        energy: Math.random() * 10,
        lifetime: Math.random() * 3,
        color: this.getParticleCreationColor(i)
      };
      this.state.particleCreation.push(creation);
    }
  }

  calculateQuantumField(x, y, t, field) {
    const kx = field.frequency * 0.1;
    const ky = field.frequency * 0.1;
    const omega = Math.sqrt(kx * kx + ky * ky);
    return field.amplitude * Math.sin(kx * x + ky * y - omega * t + field.phase);
  }

  calculateVacuumFluctuation(fluctuation, t) {
    const age = t - fluctuation.id * 0.1;
    if (age < 0) return 0;
    if (age > fluctuation.lifetime) return 0;
    return fluctuation.amplitude * Math.exp(-age / fluctuation.lifetime) * Math.sin(age * 10);
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新量子场
    this.updateQuantumFields();
    
    // 更新真空涨落
    this.updateVacuumFluctuations();
    
    // 更新粒子产生
    this.updateParticleCreation();
    
    // 计算统计特性
    this.calculateStatistics();
  }

  updateQuantumFields() {
    this.state.quantumFields.forEach(field => {
      field.phase += field.frequency * deltaTime * 60;
    });
  }

  updateVacuumFluctuations() {
    this.state.vacuumFluctuations.forEach(fluctuation => {
      const strength = this.calculateVacuumFluctuation(fluctuation, this.state.time);
      fluctuation.amplitude = strength;
      fluctuation.color = this.getFluctuationColor(strength);
    });
  }

  updateParticleCreation() {
    this.state.particleCreation.forEach(creation => {
      // 粒子运动
      creation.position.x += creation.velocity.x * deltaTime * 60;
      creation.position.y += creation.velocity.y * deltaTime * 60;
      
      // 能量衰减
      creation.energy *= 0.99;
      
      // 生命周期
      creation.lifetime -= deltaTime;
      if (creation.lifetime < 0) {
        // 重置粒子
        creation.position = { x: 0, y: 0 };
        creation.velocity = {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        };
        creation.energy = Math.random() * 10;
        creation.lifetime = Math.random() * 3;
      }
    });
  }

  calculateStatistics() {
    // 计算总能量
    let energy = 0;
    this.state.quantumFields.forEach(field => {
      energy += field.amplitude * field.amplitude;
    });
    this.state.totalEnergy = energy;
    
    // 计算粒子数
    this.state.particleCount = this.state.particleCreation.filter(p => p.lifetime > 0).length;
    
    // 计算真空能量
    let vacuumEnergy = 0;
    this.state.vacuumFluctuations.forEach(fluctuation => {
      vacuumEnergy += fluctuation.amplitude * fluctuation.amplitude;
    });
    this.state.vacuumEnergy = vacuumEnergy;
  }

  getQuantumFieldColor(index) {
    const colors = ['rgba(255, 102, 102, 0.8)', 'rgba(102, 255, 102, 0.8)', 'rgba(102, 102, 255, 0.8)', 'rgba(255, 255, 102, 0.8)'];
    return colors[index % colors.length];
  }

  getFluctuationColor(strength) {
    const intensity = Math.floor(strength * 255);
    return `rgba(${intensity}, ${intensity}, ${intensity}, ${strength})`;
  }

  getParticleCreationColor(index) {
    const hue = (index * 13) % 360;
    return `hsla(${hue}, 100%, 70%, 0.8)`;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制量子场
    if (this.state.showQuantumFields) {
      this.renderQuantumFields(ctx, centerX, centerY);
    }
    
    // 绘制真空涨落
    if (this.state.showVacuumFluctuations) {
      this.renderVacuumFluctuations(ctx, centerX, centerY);
    }
    
    // 绘制粒子产生
    if (this.state.showParticleCreation) {
      this.renderParticleCreation(ctx, centerX, centerY);
    }
    
    // 绘制能谱
    if (this.state.showEnergySpectrum) {
      this.renderEnergySpectrum(ctx, centerX, centerY);
    }
    
    // 绘制信息
    this.renderInfo(ctx, width, height);
  }

  renderQuantumFields(ctx, centerX, centerY) {
    this.state.quantumFields.forEach(field => {
      ctx.strokeStyle = field.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = -100; x <= 100; x++) {
        const realX = centerX + x * 2;
        const value = this.calculateQuantumField(x, 0, this.state.time, field);
        const realY = centerY - value * 50 * this.state.scale;
        
        if (x === -100) {
          ctx.moveTo(realX, realY);
        } else {
          ctx.lineTo(realX, realY);
        }
      }
      
      ctx.stroke();
    });
  }

  renderVacuumFluctuations(ctx, centerX, centerY) {
    this.state.vacuumFluctuations.forEach(fluctuation => {
      const strength = this.calculateVacuumFluctuation(fluctuation, this.state.time);
      if (strength > 0.1) {
        ctx.fillStyle = fluctuation.color;
        const size = strength * 10 * this.state.scale;
        ctx.beginPath();
        ctx.arc(centerX + fluctuation.position.x * this.state.scale, centerY + fluctuation.position.y * this.state.scale, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  renderParticleCreation(ctx, centerX, centerY) {
    this.state.particleCreation.forEach(creation => {
      if (creation.lifetime > 0) {
        ctx.fillStyle = creation.color;
        const size = creation.energy * 0.5 * this.state.scale;
        ctx.beginPath();
        ctx.arc(centerX + creation.position.x * this.state.scale, centerY + creation.position.y * this.state.scale, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制粒子轨迹
        ctx.strokeStyle = creation.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + creation.position.x * this.state.scale, centerY + creation.position.y * this.state.scale);
        ctx.lineTo(centerX + (creation.position.x - creation.velocity.x * 2) * this.state.scale, centerY + (creation.position.y - creation.velocity.y * 2) * this.state.scale);
        ctx.stroke();
      }
    });
  }

  renderEnergySpectrum(ctx, centerX, centerY) {
    ctx.fillStyle = 'rgba(255, 102, 255, 0.3)';
    ctx.strokeStyle = 'rgba(255, 102, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 50; i++) {
      const energy = i * 0.2;
      const occupation = 1 / (Math.exp((energy - this.state.chemicalPotential) / this.state.temperature) + 1);
      const x = centerX + (i - 25) * 10;
      const y = centerY - occupation * 80 * this.state.scale;
      
      if (i === 0) {
        ctx.moveTo(x, centerY);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.lineTo(centerX + 25 * 10, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `总能量: ${this.state.totalEnergy.toFixed(2)}`,
      `粒子数: ${this.state.particleCount}`,
      `真空能量: ${this.state.vacuumEnergy.toFixed(2)}`,
      `温度: ${this.state.temperature.toFixed(2)}`,
      `化学势: ${this.state.chemicalPotential.toFixed(2)}`,
      `量子场: ${this.state.showQuantumFields ? '显示' : '隐藏'}`,
      `真空涨落: ${this.state.showVacuumFluctuations ? '显示' : '隐藏'}`,
      `粒子产生: ${this.state.showParticleCreation ? '显示' : '隐藏'}`,
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

  setTemperature(temperature) {
    this.state.temperature = temperature;
  }

  setChemicalPotential(mu) {
    this.state.chemicalPotential = mu;
  }

  toggleQuantumFields() {
    this.state.showQuantumFields = !this.state.showQuantumFields;
  }

  toggleVacuumFluctuations() {
    this.state.showVacuumFluctuations = !this.state.showVacuumFluctuations;
  }

  toggleParticleCreation() {
    this.state.showParticleCreation = !this.state.showParticleCreation;
  }

  toggleEnergySpectrum() {
    this.state.showEnergySpectrum = !this.state.showEnergySpectrum;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumFieldEquation;
} else if (typeof window !== 'undefined') {
  window.QuantumFieldEquation = QuantumFieldEquation;
}
