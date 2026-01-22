// 电荷方程可视化模块
// 功能: 实现电荷方程的高级可视化，包括电荷分布、电场强度等

class ChargeEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      k: 8.9875e9, // 库仑常数
      scale: 1,
      showChargeDistribution: true,
      showElectricField: true,
      showFieldLines: true,
      showPotential: true,
      charges: [],
      fieldLines: [],
      potentialGrid: [],
      animationSpeed: 1,
      totalCharge: 0
    };
    this.init();
  }

  init() {
    console.log('⚡ 电荷方程可视化初始化');
    this.createCharges();
    this.createFieldLines();
    this.createPotentialGrid();
  }

  createCharges() {
    // 创建测试电荷
    for (let i = 0; i < 6; i++) {
      const charge = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 150,
          y: (Math.random() - 0.5) * 150,
          z: 0
        },
        value: (i % 2 === 0 ? 1 : -1) * (1 + i * 0.5),
        mass: 1,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 0
        },
        color: this.getChargeColor(i),
        fieldStrength: 0
      };
      this.state.charges.push(charge);
    }
  }

  createFieldLines() {
    // 创电场线
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.state.fieldLines.push({
        id: i,
        angle,
        points: [],
        color: this.getFieldLineColor(i)
      });
    }
  }

  createPotentialGrid() {
    // 创建电势网格
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

  calculateElectricField(x, y) {
    let field = { x: 0, y: 0 };
    
    this.state.charges.forEach(charge => {
      const dx = x - charge.position.x;
      const dy = y - charge.position.y;
      const distance2 = dx * dx + dy * dy;
      
      if (distance2 > 0) {
        const distance = Math.sqrt(distance2);
        const fieldStrength = this.state.k * charge.value / distance2;
        field.x += fieldStrength * dx / distance;
        field.y += fieldStrength * dy / distance;
      }
    });
    
    return field;
  }

  calculatePotential(x, y) {
    let potential = 0;
    
    this.state.charges.forEach(charge => {
      const dx = x - charge.position.x;
      const dy = y - charge.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        potential += this.state.k * charge.value / distance;
      }
    });
    
    return potential;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新电荷
    this.state.charges.forEach(charge => {
      this.updateCharge(charge, deltaTime);
    });
    
    // 更新电场线
    this.updateFieldLines();
    
    // 更新电势网格
    this.updatePotentialGrid();
    
    // 计算总电荷
    this.calculateTotalCharge();
  }

  updateCharge(charge, deltaTime) {
    // 更新位置
    charge.position.x += charge.velocity.x * deltaTime * 30;
    charge.position.y += charge.velocity.y * deltaTime * 30;
    
    // 计算电场强度
    charge.fieldStrength = this.calculateFieldStrength(charge.position.x, charge.position.y);
    
    // 边界检查
    this.checkBoundary(charge);
  }

  checkBoundary(charge) {
    const bounds = 180;
    if (Math.abs(charge.position.x) > bounds) {
      charge.velocity.x *= -1;
    }
    if (Math.abs(charge.position.y) > bounds) {
      charge.velocity.y *= -1;
    }
  }

  calculateFieldStrength(x, y) {
    let totalField = 0;
    
    this.state.charges.forEach(charge => {
      const dx = x - charge.position.x;
      const dy = y - charge.position.y;
      const distance2 = dx * dx + dy * dy;
      
      if (distance2 > 0) {
        totalField += this.state.k * Math.abs(charge.value) / distance2;
      }
    });
    
    return totalField;
  }

  updateFieldLines() {
    this.state.fieldLines.forEach(line => {
      line.points = [];
      const startCharge = this.state.charges[Math.floor(line.id / 4)];
      const startX = startCharge.position.x + Math.cos(line.angle) * 10;
      const startY = startCharge.position.y + Math.sin(line.angle) * 10;
      
      let x = startX;
      let y = startY;
      
      for (let i = 0; i < 50; i++) {
        const field = this.calculateElectricField(x, y);
        const fieldMagnitude = Math.sqrt(field.x * field.x + field.y * field.y);
        
        if (fieldMagnitude > 0) {
          const stepSize = 5 / fieldMagnitude;
          x += field.x * stepSize;
          y += field.y * stepSize;
          line.points.push({ x, y });
        }
      }
    });
  }

  updatePotentialGrid() {
    this.state.potentialGrid.forEach(point => {
      point.potential = this.calculatePotential(point.position.x, point.position.y);
      point.color = this.getPotentialColor(point.potential);
    });
  }

  calculateTotalCharge() {
    this.state.totalCharge = this.state.charges.reduce((sum, charge) => sum + charge.value, 0);
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制电势
    if (this.state.showPotential) {
      this.renderPotential(ctx, width, height);
    }

    // 绘制电场
    if (this.state.showElectricField) {
      this.renderElectricField(ctx, width, height);
    }

    // 绘制电场线
    if (this.state.showFieldLines) {
      this.renderFieldLines(ctx, width, height);
    }

    // 绘制电荷
    if (this.state.showChargeDistribution) {
      this.renderCharges(ctx, width, height);
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderCharges(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.charges.forEach(charge => {
      const x = centerX + charge.position.x;
      const y = centerY + charge.position.y;
      const radius = 10 + Math.abs(charge.value) * 2;
      
      // 绘制电荷光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, charge.color);
      gradient.addColorStop(0.5, charge.color.replace('1)', '0.3)'));
      gradient.addColorStop(1, charge.color.replace('1)', '0)'));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制电荷核心
      ctx.fillStyle = charge.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制电荷符号
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charge.value > 0 ? '+' : '-', x, y);
    });
  }

  renderFieldLines(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.fieldLines.forEach(line => {
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

  renderElectricField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制电场矢量
    this.state.potentialGrid.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const field = this.calculateElectricField(point.position.x, point.position.y);
      const fieldMagnitude = Math.sqrt(field.x * field.x + field.y * field.y);
      
      if (fieldMagnitude > 0) {
        const scale = 0.0000001;
        const fx = x + field.x * scale;
        const fy = y + field.y * scale;
        
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(fx, fy);
        ctx.stroke();
      }
    });
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

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '电荷方程: F = k·q₁q₂/r²';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`总电荷: ${this.state.totalCharge.toFixed(2)} C`, 20, 70);
    ctx.fillText(`电荷数: ${this.state.charges.length}`, 20, 90);
    ctx.fillText(`库仑常数: ${(this.state.k / 1e9).toFixed(2)} × 10⁹ N·m²/C²`, 20, 110);
  }

  getChargeColor(index) {
    const colors = [
      'rgba(255, 68, 68, 1)',
      'rgba(68, 68, 255, 1)',
      'rgba(255, 102, 0, 1)',
      'rgba(68, 255, 68, 1)',
      'rgba(255, 255, 68, 1)',
      'rgba(68, 255, 255, 1)'
    ];
    return colors[index % colors.length];
  }

  getFieldLineColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.6)',
      'rgba(118, 75, 162, 0.6)',
      'rgba(255, 102, 0, 0.6)',
      'rgba(68, 255, 68, 0.6)'
    ];
    return colors[index % colors.length];
  }

  getPotentialColor(potential) {
    const intensity = Math.min(Math.abs(potential) / 1e11, 1);
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
window.ChargeEquation = ChargeEquation;
console.log('⚡ 电荷方程可视化模块加载完成');
