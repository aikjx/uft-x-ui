// 能量动量方程可视化模块
// 功能: 实现能量动量方程的高级可视化，包括能量动量守恒、相对论效应等

class EnergyMomentumEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      c: 299792458, // 光速
      k: 1, // 耦合常数
      scale: 1,
      showEnergyMomentumConservation: true,
      showRelativisticEffects: true,
      show4DMomentum: true,
      showMassShell: true,
      particles: [],
      energyDistribution: [],
      momentumVectors: [],
      animationSpeed: 1,
      totalEnergy: 0,
      totalMomentum: { x: 0, y: 0, z: 0 }
    };
    this.init();
  }

  init() {
    console.log('⚡ 能量动量方程可视化初始化');
    this.createParticles();
    this.createEnergyDistribution();
    this.createMomentumVectors();
  }

  createParticles() {
    // 创建测试粒子
    for (let i = 0; i < 8; i++) {
      const particle = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          z: 0
        },
        velocity: {
          x: (Math.random() - 0.5) * 0.2 * this.state.c,
          y: (Math.random() - 0.5) * 0.2 * this.state.c,
          z: 0
        },
        mass: 1 + i * 0.3,
        restMass: 1 + i * 0.3,
        energy: 0,
        momentum: { x: 0, y: 0, z: 0 },
        gamma: 1,
        color: this.getParticleColor(i),
        charge: i % 2 === 0 ? 1 : -1
      };
      this.state.particles.push(particle);
    }
  }

  createEnergyDistribution() {
    // 创建能量分布数据
    for (let i = 0; i < 15; i++) {
      const distance = i * 8;
      const energy = this.calculateEnergy(distance);
      this.state.energyDistribution.push({
        id: i,
        distance,
        energy,
        color: this.getEnergyColor(energy)
      });
    }
  }

  createMomentumVectors() {
    // 创建动量矢量数据
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const momentum = {
        x: Math.cos(angle) * 50,
        y: Math.sin(angle) * 50,
        z: 0
      };
      this.state.momentumVectors.push({
        id: i,
        angle,
        momentum,
        color: this.getMomentumColor(i)
      });
    }
  }

  calculateEnergy(distance) {
    // 能量随距离的分布
    const sigma = 30;
    return Math.exp(-(distance * distance) / (2 * sigma * sigma)) * 100;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新粒子
    this.state.particles.forEach(particle => {
      this.updateParticle(particle, deltaTime);
    });
    
    // 更新能量分布
    this.updateEnergyDistribution();
    
    // 更新动量矢量
    this.updateMomentumVectors();
    
    // 计算总能量和动量
    this.calculateTotalEnergyMomentum();
  }

  updateParticle(particle, deltaTime) {
    // 计算相对论因子
    const v2 = particle.velocity.x * particle.velocity.x + 
               particle.velocity.y * particle.velocity.y + 
               particle.velocity.z * particle.velocity.z;
    particle.gamma = 1 / Math.sqrt(1 - v2 / (this.state.c * this.state.c));
    
    // 相对论质量
    particle.mass = particle.restMass * particle.gamma;
    
    // 能量
    particle.energy = particle.mass * this.state.c * this.state.c;
    
    // 动量
    particle.momentum.x = particle.mass * particle.velocity.x;
    particle.momentum.y = particle.mass * particle.velocity.y;
    particle.momentum.z = particle.mass * particle.velocity.z;
    
    // 更新位置
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.position.z += particle.velocity.z * deltaTime;
    
    // 边界检查
    this.checkBoundary(particle);
  }

  checkBoundary(particle) {
    const bounds = 150;
    if (Math.abs(particle.position.x) > bounds) {
      particle.velocity.x *= -0.8;
    }
    if (Math.abs(particle.position.y) > bounds) {
      particle.velocity.y *= -0.8;
    }
  }

  updateEnergyDistribution() {
    this.state.energyDistribution.forEach(data => {
      const oscillation = Math.sin(this.state.time + data.id * 0.3) * 0.1;
      data.energy = this.calculateEnergy(data.distance) * (1 + oscillation);
      data.color = this.getEnergyColor(data.energy);
    });
  }

  updateMomentumVectors() {
    this.state.momentumVectors.forEach(data => {
      const time = this.state.time + data.id * 0.2;
      data.angle = (data.id / 6) * Math.PI * 2 + time * 0.3;
      data.momentum.x = Math.cos(data.angle) * 60;
      data.momentum.y = Math.sin(data.angle) * 60;
    });
  }

  calculateTotalEnergyMomentum() {
    this.state.totalEnergy = 0;
    this.state.totalMomentum = { x: 0, y: 0, z: 0 };
    
    this.state.particles.forEach(particle => {
      this.state.totalEnergy += particle.energy;
      this.state.totalMomentum.x += particle.momentum.x;
      this.state.totalMomentum.y += particle.momentum.y;
      this.state.totalMomentum.z += particle.momentum.z;
    });
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制能量分布
    if (this.state.showEnergyMomentumConservation) {
      this.renderEnergyDistribution(ctx, width, height);
    }

    // 绘制质量壳
    if (this.state.showMassShell) {
      this.renderMassShell(ctx, width, height);
    }

    // 绘制4D动量
    if (this.state.show4DMomentum) {
      this.render4DMomentum(ctx, width, height);
    }

    // 绘制动量矢量
    if (this.state.showRelativisticEffects) {
      this.renderMomentumVectors(ctx, width, height);
    }

    // 绘制粒子
    this.renderParticles(ctx, width, height);

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderEnergyDistribution(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制能量同心圆环
    this.state.energyDistribution.forEach(data => {
      const radius = data.distance;
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  renderMassShell(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const shellRadius = 120;
    
    // 绘制质量壳（双曲线）
    ctx.strokeStyle = 'rgba(68, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // 绘制双曲线的两个分支
    for (let i = 0; i < 2; i++) {
      const sign = i === 0 ? 1 : -1;
      ctx.beginPath();
      for (let angle = -Math.PI / 2 + 0.1; angle < Math.PI / 2 - 0.1; angle += 0.1) {
        const x = centerX + shellRadius * Math.cos(angle) * sign;
        const y = centerY + shellRadius * Math.sin(angle);
        if (angle === -Math.PI / 2 + 0.1) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }

  render4DMomentum(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制4D动量矢量
    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * 0.8;
      const y = centerY + particle.position.y * 0.8;
      const momentumScale = 0.0000000001;
      
      const mx = x + particle.momentum.x * momentumScale;
      const my = y + particle.momentum.y * momentumScale;
      
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(mx, my);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(my - y, mx - x);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 6 * Math.cos(angle - 0.3), my - 6 * Math.sin(angle - 0.3));
      ctx.lineTo(mx - 6 * Math.cos(angle + 0.3), my - 6 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderMomentumVectors(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制动量矢量
    this.state.momentumVectors.forEach(data => {
      const x = centerX + data.momentum.x * 0.5;
      const y = centerY + data.momentum.y * 0.5;
      
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(y - centerY, x - centerX);
      ctx.fillStyle = data.color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6 * Math.cos(angle - 0.3), y - 6 * Math.sin(angle - 0.3));
      ctx.lineTo(x - 6 * Math.cos(angle + 0.3), y - 6 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderParticles(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * 0.8;
      const y = centerY + particle.position.y * 0.8;
      
      // 绘制粒子光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, particle.color.replace('1)', '0.5)'));
      gradient.addColorStop(1, particle.color.replace('1)', '0)'));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制粒子核心
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '能量动量方程: E² = (pc)² + (mc²)²';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`总能量: ${(this.state.totalEnergy / 1e16).toFixed(2)} × 10¹⁶ J`, 20, 70);
    ctx.fillText(`总动量: (${(this.state.totalMomentum.x / 1e8).toFixed(2)}, ${(this.state.totalMomentum.y / 1e8).toFixed(2)}) × 10⁸ kg·m/s`, 20, 90);
    ctx.fillText(`粒子数: ${this.state.particles.length}`, 20, 110);
  }

  getParticleColor(index) {
    const colors = [
      'rgba(102, 126, 234, 1)',
      'rgba(118, 75, 162, 1)',
      'rgba(255, 102, 0, 1)',
      'rgba(68, 255, 68, 1)',
      'rgba(255, 68, 68, 1)',
      'rgba(255, 255, 68, 1)',
      'rgba(68, 255, 255, 1)',
      'rgba(255, 68, 255, 1)'
    ];
    return colors[index % colors.length];
  }

  getEnergyColor(energy) {
    const intensity = Math.min(energy / 100, 1);
    const r = Math.floor(255 * (1 - intensity));
    const g = Math.floor(255 * intensity);
    const b = Math.floor(100 + 155 * intensity);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  getMomentumColor(index) {
    const colors = [
      'rgba(255, 102, 102, 0.8)',
      'rgba(102, 255, 102, 0.8)',
      'rgba(102, 102, 255, 0.8)',
      'rgba(255, 255, 102, 0.8)',
      'rgba(255, 102, 255, 0.8)',
      'rgba(102, 255, 255, 0.8)'
    ];
    return colors[index % colors.length];
  }

  setParameter(name, value) {
    if (this.state.hasOwnProperty(name)) {
      this.state[name] = value;
    }
  }

  getParameter(name) {
    return this.state[name];
  }
}

// 导出模块
window.EnergyMomentumEquation = EnergyMomentumEquation;
console.log('⚡ 能量动量方程可视化模块加载完成');
