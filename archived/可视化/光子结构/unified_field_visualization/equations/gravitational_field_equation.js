// 引力场方程可视化模块
// 功能: 实现引力场方程的高级可视化，包括引力场分布、引力透镜效应等

class GravitationalFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      G: 6.67430e-11, // 万有引力常数
      scale: 1,
      showGravitationalField: true,
      showGravitationalLensing: true,
      showOrbits: true,
      showPotential: true,
      gravitationalField: [],
      masses: [],
      orbits: [],
      potentialGrid: [],
      animationSpeed: 1,
      totalMass: 0
    };
    this.init();
  }

  init() {
    console.log('🌍 引力场方程可视化初始化');
    this.createMasses();
    this.createGravitationalField();
    this.createOrbits();
    this.createPotentialGrid();
  }

  createMasses() {
    // 创建测试质量
    for (let i = 0; i < 5; i++) {
      const mass = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 150,
          y: (Math.random() - 0.5) * 150,
          z: 0
        },
        value: 10 + i * 5,
        radius: 10 + i * 2,
        color: this.getMassColor(i),
        gravitationalStrength: 0
      };
      this.state.masses.push(mass);
    }
  }

  createGravitationalField() {
    // 创建引力场数据
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      this.state.gravitationalField.push({
        id: i,
        angle,
        strength: 0,
        direction: { x: 0, y: 0 },
        position: {
          x: Math.cos(angle) * 100,
          y: Math.sin(angle) * 100,
          z: 0
        },
        color: 'rgba(102, 126, 234, 0.6)'
      });
    }
  }

  createOrbits() {
    // 创轨道
    for (let i = 0; i < 12; i++) {
      const radius = 40 + i * 15;
      this.state.orbits.push({
        id: i,
        radius,
        points: [],
        color: this.getOrbitColor(i),
        period: Math.sqrt(radius * radius * radius)
      });
    }
  }

  createPotentialGrid() {
    // 创建引力势网格
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        const x = (i - 5) * 30;
        const y = (j - 5) * 30;
        this.state.potentialGrid.push({
          id: i * 11 + j,
          position: { x, y, z: 0 },
          potential: 0,
          color: 'rgba(102, 126, 234, 0.3)'
        });
      }
    }
  }

  calculateGravitationalField(x, y) {
    let field = { x: 0, y: 0 };
    
    this.state.masses.forEach(mass => {
      const dx = x - mass.position.x;
      const dy = y - mass.position.y;
      const distance2 = dx * dx + dy * dy;
      
      if (distance2 > mass.radius * mass.radius) {
        const distance = Math.sqrt(distance2);
        const strength = this.state.G * mass.value / distance2;
        field.x += strength * dx / distance;
        field.y += strength * dy / distance;
      }
    });
    
    return field;
  }

  calculateGravitationalPotential(x, y) {
    let potential = 0;
    
    this.state.masses.forEach(mass => {
      const dx = x - mass.position.x;
      const dy = y - mass.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > mass.radius) {
        potential -= this.state.G * mass.value / distance;
      }
    });
    
    return potential;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新引力场
    this.updateGravitationalField();
    
    // 更新质量
    this.updateMasses();
    
    // 更新轨道
    this.updateOrbits();
    
    // 更新引力势
    this.updatePotentialGrid();
    
    // 计算总质量
    this.calculateTotalMass();
  }

  updateGravitationalField() {
    this.state.gravitationalField.forEach(point => {
      point.position.x = Math.cos(point.angle + this.state.time * 0.1) * 100;
      point.position.y = Math.sin(point.angle + this.state.time * 0.1) * 100;
      
      const field = this.calculateGravitationalField(point.position.x, point.position.y);
      point.strength = Math.sqrt(field.x * field.x + field.y * field.y);
      point.direction = field;
      point.color = this.getFieldColor(point.strength);
    });
  }

  updateMasses() {
    this.state.masses.forEach(mass => {
      // 简单的质量运动
      mass.position.x += Math.sin(this.state.time * 0.2 + mass.id) * 0.5;
      mass.position.y += Math.cos(this.state.time * 0.2 + mass.id) * 0.5;
      
      mass.gravitationalStrength = this.calculateGravitationalField(mass.position.x, mass.position.y).strength || 0;
    });
  }

  updateOrbits() {
    this.state.orbits.forEach(orbit => {
      orbit.points = [];
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2 + this.state.time / orbit.period;
        const x = Math.cos(angle) * orbit.radius;
        const y = Math.sin(angle) * orbit.radius;
        orbit.points.push({ x, y });
      }
    });
  }

  updatePotentialGrid() {
    this.state.potentialGrid.forEach(point => {
      point.potential = this.calculateGravitationalPotential(point.position.x, point.position.y);
      point.color = this.getPotentialColor(point.potential);
    });
  }

  calculateTotalMass() {
    this.state.totalMass = this.state.masses.reduce((sum, mass) => sum + mass.value, 0);
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制引力势
    if (this.state.showPotential) {
      this.renderPotential(ctx, width, height);
    }

    // 绘制引力场
    if (this.state.showGravitationalField) {
      this.renderGravitationalField(ctx, width, height);
    }

    // 绘制轨道
    if (this.state.showOrbits) {
      this.renderOrbits(ctx, width, height);
    }

    // 绘制引力透镜效应
    if (this.state.showGravitationalLensing) {
      this.renderGravitationalLensing(ctx, width, height);
    }

    // 绘制质量
    if (this.state.showGravitationalField) {
      this.renderMasses(ctx, width, height);
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderMasses(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.masses.forEach(mass => {
      const x = centerX + mass.position.x;
      const y = centerY + mass.position.y;
      
      // 绘制质量光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, mass.radius * 2);
      gradient.addColorStop(0, mass.color);
      gradient.addColorStop(0.5, mass.color.replace('1)', '0.3)'));
      gradient.addColorStop(1, mass.color.replace('1)', '0)'));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, mass.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制质量核心
      ctx.fillStyle = mass.color;
      ctx.beginPath();
      ctx.arc(x, y, mass.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制质量值
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${mass.value} M☉`, x, y);
    });
  }

  renderGravitationalField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制引力场矢量
    this.state.gravitationalField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const scale = 5000000000000000000000;
      
      const fx = x + point.direction.x * scale;
      const fy = y + point.direction.y * scale;
      
      ctx.strokeStyle = point.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(fx, fy);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(fy - y, fx - x);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 4 * Math.cos(angle - 0.3), fy - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(fx - 4 * Math.cos(angle + 0.3), fy - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderOrbits(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.orbits.forEach(orbit => {
      if (orbit.points.length > 1) {
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX + orbit.points[0].x, centerY + orbit.points[0].y);
        
        for (let i = 1; i < orbit.points.length; i++) {
          ctx.lineTo(centerX + orbit.points[i].x, centerY + orbit.points[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  renderGravitationalLensing(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制引力透镜效应
    ctx.strokeStyle = 'rgba(68, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 150;
      const y = centerY + Math.sin(angle) * 150;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }

  renderPotential(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制等势面
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    for (let radius = 50; radius <= 200; radius += 30) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }

  updatePotentialGrid() {
    this.state.potentialGrid.forEach(point => {
      point.potential = this.calculateGravitationalPotential(point.position.x, point.position.y);
      point.color = this.getPotentialColor(point.potential);
    });
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '引力场方程: F = G·m₁m₂/r²';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`总质量: ${this.state.totalMass.toFixed(2)} M☉`, 20, 70);
    ctx.fillText(`质量数: ${this.state.masses.length}`, 20, 90);
    ctx.fillText(`万有引力常数: ${this.state.G.toExponential(4)} m³/kg·s²`, 20, 110);
  }

  getMassColor(index) {
    const colors = [
      'rgba(255, 68, 68, 1)',
      'rgba(68, 255, 68, 1)',
      'rgba(68, 68, 255, 1)',
      'rgba(255, 255, 68, 1)',
      'rgba(255, 68, 255, 1)'
    ];
    return colors[index % colors.length];
  }

  getFieldColor(strength) {
    const intensity = Math.min(strength * 100000000000000000000, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }

  getOrbitColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.6)',
      'rgba(118, 75, 162, 0.6)',
      'rgba(255, 102, 0, 0.6)',
      'rgba(68, 255, 68, 0.6)',
      'rgba(255, 68, 68, 0.6)',
      'rgba(255, 255, 68, 0.6)',
      'rgba(68, 255, 255, 0.6)',
      'rgba(255, 68, 255, 0.6)',
      'rgba(162, 255, 68, 0.6)',
      'rgba(68, 68, 255, 0.6)',
      'rgba(255, 162, 68, 0.6)',
      'rgba(68, 162, 255, 0.6)'
    ];
    return colors[index % colors.length];
  }

  getPotentialColor(potential) {
    const intensity = Math.min(Math.abs(potential) * 0.001, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
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
window.GravitationalFieldEquation = GravitationalFieldEquation;
console.log('🌍 引力场方程可视化模块加载完成');
