// 加速度场方程可视化模块
// 功能: 实现加速度场方程的高级可视化，包括加速度场分布、力场效应等

class AccelerationFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      scale: 1,
      showAccelerationField: true,
      showForceVectors: true,
      showTrajectories: true,
      showPhaseSpace: true,
      accelerationField: [],
      particles: [],
      trajectories: [],
      phaseSpace: [],
      animationSpeed: 1,
      maxAcceleration: 0
    };
    this.init();
  }

  init() {
    console.log('🚀 加速度场方程可视化初始化');
    this.createAccelerationField();
    this.createParticles();
    this.createTrajectories();
    this.createPhaseSpace();
  }

  createAccelerationField() {
    // 创建加速度场
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const x = (i - 5.5) * 25;
        const y = (j - 5.5) * 25;
        this.state.accelerationField.push({
          id: i * 12 + j,
          position: { x, y, z: 0 },
          acceleration: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: 0
          },
          color: this.getFieldColor(i + j),
          magnitude: 0
        });
      }
    }
  }

  createParticles() {
    // 创建测试粒子
    for (let i = 0; i < 15; i++) {
      const particle = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          z: 0
        },
        velocity: {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5,
          z: 0
        },
        acceleration: { x: 0, y: 0, z: 0 },
        mass: 1 + Math.random() * 2,
        charge: Math.random() > 0.5 ? 1 : -1,
        color: this.getParticleColor(i),
        trail: []
      };
      this.state.particles.push(particle);
    }
  }

  createTrajectories() {
    // 创轨迹
    for (let i = 0; i < 8; i++) {
      this.state.trajectories.push({
        id: i,
        points: [],
        color: this.getTrajectoryColor(i)
      });
    }
  }

  createPhaseSpace() {
    // 创建相空间数据
    for (let i = 0; i < 100; i++) {
      this.state.phaseSpace.push({
        id: i,
        position: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        },
        color: 'rgba(102, 126, 234, 0.6)'
      });
    }
  }

  calculateAcceleration(x, y) {
    // 计算加速度场
    const centerX = 0;
    const centerY = 0;
    const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
    
    if (distance < 60) {
      // 中心区域的加速度场
      return {
        x: -0.01 * (x - centerX),
        y: -0.01 * (y - centerY)
      };
    } else {
      // 外部区域的加速度场
      return {
        x: 0.5 * Math.sin(this.state.time * 0.3),
        y: 0.5 * Math.cos(this.state.time * 0.3)
      };
    }
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新加速度场
    this.updateAccelerationField();
    
    // 更新粒子
    this.updateParticles(deltaTime);
    
    // 更新轨迹
    this.updateTrajectories();
    
    // 更新相空间
    this.updatePhaseSpace();
    
    // 计算最大加速度
    this.calculateMaxAcceleration();
  }

  updateAccelerationField() {
    this.state.accelerationField.forEach(point => {
      const acceleration = this.calculateAcceleration(point.position.x, point.position.y);
      point.acceleration = acceleration;
      point.magnitude = Math.sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y);
      point.color = this.getFieldColor(point.magnitude);
    });
  }

  updateParticles(deltaTime) {
    this.state.particles.forEach(particle => {
      // 计算加速度
      const acceleration = this.calculateAcceleration(particle.position.x, particle.position.y);
      particle.acceleration = acceleration;
      
      // 更新速度
      particle.velocity.x += acceleration.x * deltaTime * 10;
      particle.velocity.y += acceleration.y * deltaTime * 10;
      
      // 更新位置
      particle.position.x += particle.velocity.x * deltaTime * 10;
      particle.position.y += particle.velocity.y * deltaTime * 10;
      
      // 更新轨迹
      particle.trail.push({ ...particle.position });
      if (particle.trail.length > 30) {
        particle.trail.shift();
      }
      
      // 边界检查
      this.checkBoundary(particle);
    });
  }

  checkBoundary(particle) {
    const bounds = 180;
    if (Math.abs(particle.position.x) > bounds) {
      particle.velocity.x *= -0.8;
    }
    if (Math.abs(particle.position.y) > bounds) {
      particle.velocity.y *= -0.8;
    }
  }

  updateTrajectories() {
    this.state.trajectories.forEach(trajectory => {
      trajectory.points = [];
      const startParticle = this.state.particles[trajectory.id % this.state.particles.length];
      
      let x = startParticle.position.x;
      let y = startParticle.position.y;
      let vx = startParticle.velocity.x;
      let vy = startParticle.velocity.y;
      
      for (let i = 0; i < 50; i++) {
        const acceleration = this.calculateAcceleration(x, y);
        vx += acceleration.x * 0.1;
        vy += acceleration.y * 0.1;
        x += vx * 0.1;
        y += vy * 0.1;
        trajectory.points.push({ x, y });
      }
    });
  }

  updatePhaseSpace() {
    this.state.phaseSpace.forEach(point => {
      point.position.x = Math.sin(this.state.time * 0.2 + point.id * 0.01) * 5;
      point.position.y = Math.cos(this.state.time * 0.3 + point.id * 0.01) * 5;
    });
  }

  calculateMaxAcceleration() {
    this.state.maxAcceleration = Math.max(...this.state.accelerationField.map(point => point.magnitude));
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制相空间
    if (this.state.showPhaseSpace) {
      this.renderPhaseSpace(ctx, width, height);
    }

    // 绘制加速度场
    if (this.state.showAccelerationField) {
      this.renderAccelerationField(ctx, width, height);
    }

    // 绘制轨迹
    if (this.state.showTrajectories) {
      this.renderTrajectories(ctx, width, height);
    }

    // 绘制力矢量
    if (this.state.showForceVectors) {
      this.renderForceVectors(ctx, width, height);
    }

    // 绘制粒子
    this.renderParticles(ctx, width, height);

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderAccelerationField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制加速度矢量
    this.state.accelerationField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const scale = 5;
      
      const ax = x + point.acceleration.x * scale;
      const ay = y + point.acceleration.y * scale;
      
      ctx.strokeStyle = point.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(ay - y, ax - x);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 3 * Math.cos(angle - 0.3), ay - 3 * Math.sin(angle - 0.3));
      ctx.lineTo(ax - 3 * Math.cos(angle + 0.3), ay - 3 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderParticles(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x;
      const y = centerY + particle.position.y;
      
      // 绘制粒子轨迹
      if (particle.trail.length > 1) {
        ctx.strokeStyle = particle.color.replace('1)', '0.5)');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + particle.trail[0].x, centerY + particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(centerX + particle.trail[i].x, centerY + particle.trail[i].y);
        }
        
        ctx.stroke();
      }
      
      // 绘制粒子
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderTrajectories(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.trajectories.forEach(trajectory => {
      if (trajectory.points.length > 1) {
        ctx.strokeStyle = trajectory.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX + trajectory.points[0].x, centerY + trajectory.points[0].y);
        
        for (let i = 1; i < trajectory.points.length; i++) {
          ctx.lineTo(centerX + trajectory.points[i].x, centerY + trajectory.points[i].y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  renderForceVectors(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x;
      const y = centerY + particle.position.y;
      const forceScale = 2;
      
      const fx = x + particle.acceleration.x * particle.mass * forceScale;
      const fy = y + particle.acceleration.y * particle.mass * forceScale;
      
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(fx, fy);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(fy - y, fx - x);
      ctx.fillStyle = 'rgba(255, 102, 0, 0.6)';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 4 * Math.cos(angle - 0.3), fy - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(fx - 4 * Math.cos(angle + 0.3), fy - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderPhaseSpace(ctx, width, height) {
    const centerX = width - 200;
    const centerY = 150;
    const size = 100;
    
    // 绘制相空间
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
    ctx.stroke();
    
    // 绘制相空间点
    this.state.phaseSpace.forEach(point => {
      const x = centerX + point.position.x * 10;
      const y = centerY + point.position.y * 10;
      
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '加速度场方程: F = ma';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`最大加速度: ${this.state.maxAcceleration.toFixed(2)} m/s²`, 20, 70);
    ctx.fillText(`粒子数: ${this.state.particles.length}`, 20, 90);
    ctx.fillText(`加速度场分辨率: 12×12`, 20, 110);
  }

  getFieldColor(magnitude) {
    const intensity = Math.min(magnitude / 2, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
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
      'rgba(255, 68, 255, 1)',
      'rgba(162, 255, 68, 1)',
      'rgba(68, 68, 255, 1)',
      'rgba(255, 162, 68, 1)',
      'rgba(68, 162, 255, 1)',
      'rgba(162, 68, 255, 1)',
      'rgba(255, 162, 255, 1)',
      'rgba(68, 162, 162, 1)'
    ];
    return colors[index % colors.length];
  }

  getTrajectoryColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.6)',
      'rgba(118, 75, 162, 0.6)',
      'rgba(255, 102, 0, 0.6)',
      'rgba(68, 255, 68, 0.6)',
      'rgba(255, 68, 68, 0.6)',
      'rgba(255, 255, 68, 0.6)',
      'rgba(68, 255, 255, 0.6)',
      'rgba(255, 68, 255, 0.6)'
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
window.AccelerationFieldEquation = AccelerationFieldEquation;
console.log('🚀 加速度场方程可视化模块加载完成');
