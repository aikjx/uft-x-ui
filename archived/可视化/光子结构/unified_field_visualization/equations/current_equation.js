// 电流方程可视化模块
// 功能: 实现电流方程的高级可视化，包括电流密度、磁场效应等

class CurrentEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      μ0: 4 * Math.PI * 1e-7, // 真空磁导率
      scale: 1,
      showCurrentDistribution: true,
      showMagneticField: true,
      showFieldLines: true,
      showAmpereLaw: true,
      currents: [],
      magneticField: [],
      fieldLines: [],
      animationSpeed: 1,
      totalCurrent: 0
    };
    this.init();
  }

  init() {
    console.log('⚡ 电流方程可视化初始化');
    this.createCurrents();
    this.createMagneticField();
    this.createFieldLines();
  }

  createCurrents() {
    // 创建测试电流
    for (let i = 0; i < 4; i++) {
      const current = {
        id: i,
        position: {
          x: (i - 1.5) * 80,
          y: 0,
          z: 0
        },
        value: (i % 2 === 0 ? 1 : -1) * (5 + i * 2),
        direction: i % 2 === 0 ? 1 : -1,
        radius: 15,
        color: this.getCurrentColor(i),
        magneticStrength: 0
      };
      this.state.currents.push(current);
    }
  }

  createMagneticField() {
    // 创建磁场数据
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      this.state.magneticField.push({
        id: i,
        angle,
        strength: 0,
        position: {
          x: Math.cos(angle) * 100,
          y: Math.sin(angle) * 100,
          z: 0
        }
      });
    }
  }

  createFieldLines() {
    // 创磁场线
    for (let i = 0; i < 16; i++) {
      const radius = 30 + i * 20;
      this.state.fieldLines.push({
        id: i,
        radius,
        points: [],
        color: this.getFieldLineColor(i)
      });
    }
  }

  calculateMagneticField(x, y) {
    let field = 0;
    
    this.state.currents.forEach(current => {
      const dx = x - current.position.x;
      const dy = y - current.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > current.radius) {
        field += (this.state.μ0 * current.value) / (2 * Math.PI * distance);
      }
    });
    
    return field;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新磁场
    this.updateMagneticField();
    
    // 更新磁场线
    this.updateFieldLines();
    
    // 计算总电流
    this.calculateTotalCurrent();
  }

  updateMagneticField() {
    this.state.magneticField.forEach(point => {
      point.strength = this.calculateMagneticField(point.position.x, point.position.y);
      point.position.x = Math.cos(point.angle + this.state.time * 0.1) * 100;
      point.position.y = Math.sin(point.angle + this.state.time * 0.1) * 100;
    });
  }

  updateFieldLines() {
    this.state.fieldLines.forEach(line => {
      line.points = [];
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2;
        const x = Math.cos(angle) * line.radius;
        const y = Math.sin(angle) * line.radius;
        line.points.push({ x, y });
      }
    });
  }

  calculateTotalCurrent() {
    this.state.totalCurrent = this.state.currents.reduce((sum, current) => sum + current.value, 0);
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制安培环路
    if (this.state.showAmpereLaw) {
      this.renderAmpereLaw(ctx, width, height);
    }

    // 绘制磁场
    if (this.state.showMagneticField) {
      this.renderMagneticField(ctx, width, height);
    }

    // 绘制磁场线
    if (this.state.showFieldLines) {
      this.renderFieldLines(ctx, width, height);
    }

    // 绘制电流
    if (this.state.showCurrentDistribution) {
      this.renderCurrents(ctx, width, height);
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderCurrents(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.currents.forEach(current => {
      const x = centerX + current.position.x;
      const y = centerY + current.position.y;
      
      // 绘制电流圆柱
      ctx.fillStyle = current.color;
      ctx.beginPath();
      ctx.arc(x, y, current.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制电流方向
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.direction > 0 ? '⊙' : '⊗', x, y);
      
      // 绘制电流值
      ctx.font = '12px Arial';
      ctx.fillText(`${Math.abs(current.value)} A`, x, y + 25);
    });
  }

  renderFieldLines(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.fieldLines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      
      line.points.forEach((point, index) => {
        const x = centerX + point.x;
        const y = centerY + point.y;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  renderMagneticField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制磁场矢量
    this.state.magneticField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const fieldDirection = {
        x: -point.position.y / 100,
        y: point.position.x / 100
      };
      
      const fx = x + fieldDirection.x * 20;
      const fy = y + fieldDirection.y * 20;
      
      ctx.strokeStyle = 'rgba(68, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(fx, fy);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(fy - y, fx - x);
      ctx.fillStyle = 'rgba(68, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 4 * Math.cos(angle - 0.3), fy - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(fx - 4 * Math.cos(angle + 0.3), fy - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderAmpereLaw(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制安培环路
    ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.setLineDash([]);
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '电流方程: ∮B·dl = μ₀I';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`总电流: ${this.state.totalCurrent.toFixed(2)} A`, 20, 70);
    ctx.fillText(`电流数: ${this.state.currents.length}`, 20, 90);
    ctx.fillText(`真空磁导率: ${this.state.μ0.toExponential(4)} H/m`, 20, 110);
  }

  getCurrentColor(index) {
    const colors = [
      'rgba(68, 255, 255, 1)',
      'rgba(255, 68, 255, 1)',
      'rgba(255, 255, 68, 1)',
      'rgba(68, 255, 68, 1)'
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
window.CurrentEquation = CurrentEquation;
console.log('⚡ 电流方程可视化模块加载完成');
