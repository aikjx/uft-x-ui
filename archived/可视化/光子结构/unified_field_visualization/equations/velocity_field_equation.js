// 速度场方程可视化模块
// 功能: 实现速度场方程的高级可视化，包括流体力学效应、速度分布等

class VelocityFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      c: 299792458, // 光速
      scale: 1,
      showVelocityDistribution: true,
      showStreamlines: true,
      showVectorField: true,
      showContinuityEquation: true,
      velocityField: [],
      streamlines: [],
      particles: [],
      animationSpeed: 1,
      maxVelocity: 0
    };
    this.init();
  }

  init() {
    console.log('🌊 速度场方程可视化初始化');
    this.createVelocityField();
    this.createStreamlines();
    this.createParticles();
  }

  createVelocityField() {
    // 创建速度场
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        const x = (i - 7) * 20;
        const y = (j - 7) * 20;
        this.state.velocityField.push({
          id: i * 15 + j,
          position: { x, y, z: 0 },
          velocity: {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10,
            z: 0
          },
          color: this.getVelocityColor(i + j),
          magnitude: 0
        });
      }
    }
  }

  createStreamlines() {
    // 创流线
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const startX = Math.cos(angle) * 150;
      const startY = Math.sin(angle) * 150;
      this.state.streamlines.push({
        id: i,
        start: { x: startX, y: startY },
        points: [],
        color: this.getStreamlineColor(i)
      });
    }
  }

  createParticles() {
    // 创建测试粒子
    for (let i = 0; i < 20; i++) {
      const particle = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: 0
        },
        velocity: { x: 0, y: 0, z: 0 },
        color: this.getParticleColor(i),
        trail: []
      };
      this.state.particles.push(particle);
    }
  }

  calculateVelocity(x, y) {
    // 计算速度场
    const centerX = 0;
    const centerY = 0;
    const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
    
    if (distance < 50) {
      // 中心区域的速度场（漩涡）
      return {
        x: -0.2 * (y - centerY),
        y: 0.2 * (x - centerX)
      };
    } else {
      // 外部区域的速度场
      return {
        x: 5 * Math.cos(this.state.time * 0.5),
        y: 5 * Math.sin(this.state.time * 0.5)
      };
    }
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新速度场
    this.updateVelocityField();
    
    // 更新流线
    this.updateStreamlines();
    
    // 更新粒子
    this.updateParticles(deltaTime);
    
    // 计算最大速度
    this.calculateMaxVelocity();
  }

  updateVelocityField() {
    this.state.velocityField.forEach(point => {
      const velocity = this.calculateVelocity(point.position.x, point.position.y);
      point.velocity = velocity;
      point.magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      point.color = this.getVelocityColor(point.magnitude);
    });
  }

  updateStreamlines() {
    this.state.streamlines.forEach(line => {
      line.points = [];
      let x = line.start.x;
      let y = line.start.y;
      
      for (let i = 0; i < 100; i++) {
        const velocity = this.calculateVelocity(x, y);
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed > 0) {
          const stepSize = 3 / speed;
          x += velocity.x * stepSize;
          y += velocity.y * stepSize;
          line.points.push({ x, y });
        }
      }
    });
  }

  updateParticles(deltaTime) {
    this.state.particles.forEach(particle => {
      const velocity = this.calculateVelocity(particle.position.x, particle.position.y);
      particle.velocity = velocity;
      
      // 更新位置
      particle.position.x += velocity.x * deltaTime * 20;
      particle.position.y += velocity.y * deltaTime * 20;
      
      // 更新轨迹
      particle.trail.push({ ...particle.position });
      if (particle.trail.length > 50) {
        particle.trail.shift();
      }
      
      // 边界检查
      this.checkBoundary(particle);
    });
  }

  checkBoundary(particle) {
    const bounds = 180;
    if (Math.abs(particle.position.x) > bounds) {
      particle.position.x = -Math.sign(particle.position.x) * bounds;
    }
    if (Math.abs(particle.position.y) > bounds) {
      particle.position.y = -Math.sign(particle.position.y) * bounds;
    }
  }

  calculateMaxVelocity() {
    this.state.maxVelocity = Math.max(...this.state.velocityField.map(point => point.magnitude));
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制连续性方程
    if (this.state.showContinuityEquation) {
      this.renderContinuityEquation(ctx, width, height);
    }

    // 绘制速度场
    if (this.state.showVectorField) {
      this.renderVectorField(ctx, width, height);
    }

    // 绘制流线
    if (this.state.showStreamlines) {
      this.renderStreamlines(ctx, width, height);
    }

    // 绘制粒子
    if (this.state.showVelocityDistribution) {
      this.renderParticles(ctx, width, height);
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderVectorField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制速度矢量
    this.state.velocityField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const scale = 2;
      
      const vx = x + point.velocity.x * scale;
      const vy = y + point.velocity.y * scale;
      
      ctx.strokeStyle = point.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(vx, vy);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(vy - y, vx - x);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx - 3 * Math.cos(angle - 0.3), vy - 3 * Math.sin(angle - 0.3));
      ctx.lineTo(vx - 3 * Math.cos(angle + 0.3), vy - 3 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderStreamlines(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.streamlines.forEach(line => {
      if (line.points.length > 1) {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + line.points[0].x, centerY + line.points[0].y);
        
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(centerX + line.points[i].x, centerY + line.points[i].y);
        }
        
        ctx.stroke();
      }
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
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderContinuityEquation(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制连续性方程示意图
    ctx.strokeStyle = 'rgba(68, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // 绘制流入和流出的箭头
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 150;
      const y = centerY + Math.sin(angle) * 150;
      
      const vx = Math.cos(angle) * 20;
      const vy = Math.sin(angle) * 20;
      
      ctx.beginPath();
      ctx.moveTo(x - vx, y - vy);
      ctx.lineTo(x + vx, y + vy);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '速度场方程: ∇·v = 0';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`最大速度: ${this.state.maxVelocity.toFixed(2)} m/s`, 20, 70);
    ctx.fillText(`粒子数: ${this.state.particles.length}`, 20, 90);
    ctx.fillText(`速度场分辨率: 15×15`, 20, 110);
  }

  getVelocityColor(magnitude) {
    const intensity = Math.min(magnitude / 10, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  getStreamlineColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.6)',
      'rgba(118, 75, 162, 0.6)',
      'rgba(255, 102, 0, 0.6)',
      'rgba(68, 255, 68, 0.6)'
    ];
    return colors[index % colors.length];
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
window.VelocityFieldEquation = VelocityFieldEquation;
console.log('🌊 速度场方程可视化模块加载完成');
