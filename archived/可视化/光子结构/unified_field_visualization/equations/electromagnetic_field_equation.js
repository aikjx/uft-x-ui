// 电磁场方程可视化模块
// 功能: 实现电磁场方程的高级可视化，包括电场磁场耦合、电磁波等

class ElectromagneticFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      μ0: 4 * Math.PI * 1e-7, // 真空磁导率
      ε0: 8.854187817e-12, // 真空介电常数
      c: 299792458, // 光速
      scale: 1,
      showElectricField: true,
      showMagneticField: true,
      showElectromagneticWaves: true,
      showPoyntingVector: true,
      electricField: [],
      magneticField: [],
      charges: [],
      currents: [],
      waves: [],
      poyntingVectors: [],
      animationSpeed: 1,
      totalCharge: 0,
      totalCurrent: 0
    };
    this.init();
  }

  init() {
    console.log('⚡ 电磁场方程可视化初始化');
    this.createCharges();
    this.createCurrents();
    this.createElectricField();
    this.createMagneticField();
    this.createWaves();
    this.createPoyntingVectors();
  }

  createCharges() {
    // 创建测试电荷
    for (let i = 0; i < 4; i++) {
      const charge = {
        id: i,
        position: {
          x: (i - 1.5) * 80,
          y: 0,
          z: 0
        },
        value: (i % 2 === 0 ? 1 : -1) * (2 + i),
        color: this.getChargeColor(i),
        fieldStrength: 0
      };
      this.state.charges.push(charge);
    }
  }

  createCurrents() {
    // 创建测试电流
    for (let i = 0; i < 2; i++) {
      const current = {
        id: i,
        position: {
          x: 0,
          y: (i - 0.5) * 100,
          z: 0
        },
        value: (i === 0 ? 1 : -1) * 5,
        direction: i === 0 ? 1 : -1,
        color: 'rgba(68, 255, 255, 1)',
        magneticStrength: 0
      };
      this.state.currents.push(current);
    }
  }

  createElectricField() {
    // 创建电场数据
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.state.electricField.push({
        id: i,
        angle,
        strength: 0,
        direction: { x: 0, y: 0 },
        position: {
          x: Math.cos(angle) * 80,
          y: Math.sin(angle) * 80,
          z: 0
        },
        color: 'rgba(255, 68, 68, 0.6)'
      });
    }
  }

  createMagneticField() {
    // 创建磁场数据
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.state.magneticField.push({
        id: i,
        angle,
        strength: 0,
        direction: { x: 0, y: 0 },
        position: {
          x: Math.cos(angle) * 80,
          y: Math.sin(angle) * 80,
          z: 0
        },
        color: 'rgba(68, 68, 255, 0.6)'
      });
    }
  }

  createWaves() {
    // 创电磁波
    for (let i = 0; i < 8; i++) {
      this.state.waves.push({
        id: i,
        frequency: 0.5 + i * 0.1,
        amplitude: 20 + i * 5,
        points: [],
        color: this.getWaveColor(i)
      });
    }
  }

  createPoyntingVectors() {
    // 创建坡印廷矢量
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      this.state.poyntingVectors.push({
        id: i,
        angle,
        magnitude: 0,
        direction: { x: 0, y: 0 },
        position: {
          x: Math.cos(angle) * 120,
          y: Math.sin(angle) * 120,
          z: 0
        },
        color: 'rgba(255, 255, 68, 0.6)'
      });
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
        const strength = charge.value / distance2;
        field.x += strength * dx / distance;
        field.y += strength * dy / distance;
      }
    });
    
    return field;
  }

  calculateMagneticField(x, y) {
    let field = { x: 0, y: 0 };
    
    this.state.currents.forEach(current => {
      const dx = x - current.position.x;
      const dy = y - current.position.y;
      const distance2 = dx * dx + dy * dy;
      
      if (distance2 > 0) {
        const distance = Math.sqrt(distance2);
        const strength = current.value / distance2;
        field.x += strength * dy / distance;
        field.y -= strength * dx / distance;
      }
    });
    
    return field;
  }

  calculatePoyntingVector(electric, magnetic) {
    // 计算坡印廷矢量
    return {
      x: electric.y * magnetic.x - electric.x * magnetic.y,
      y: electric.x * magnetic.y - electric.y * magnetic.x
    };
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新电场
    this.updateElectricField();
    
    // 更新磁场
    this.updateMagneticField();
    
    // 更新电荷
    this.updateCharges();
    
    // 更新电流
    this.updateCurrents();
    
    // 更新电磁波
    this.updateWaves();
    
    // 更新坡印廷矢量
    this.updatePoyntingVectors();
    
    // 计算总电荷和电流
    this.calculateTotalChargeCurrent();
  }

  updateElectricField() {
    this.state.electricField.forEach(point => {
      const field = this.calculateElectricField(point.position.x, point.position.y);
      point.strength = Math.sqrt(field.x * field.x + field.y * field.y);
      point.direction = field;
      point.color = this.getElectricFieldColor(point.strength);
    });
  }

  updateMagneticField() {
    this.state.magneticField.forEach(point => {
      const field = this.calculateMagneticField(point.position.x, point.position.y);
      point.strength = Math.sqrt(field.x * field.x + field.y * field.y);
      point.direction = field;
      point.color = this.getMagneticFieldColor(point.strength);
    });
  }

  updateCharges() {
    this.state.charges.forEach(charge => {
      // 简单的电荷振荡
      charge.position.y = 20 * Math.sin(this.state.time * 0.5 + charge.id);
      charge.fieldStrength = this.calculateElectricField(charge.position.x, charge.position.y).strength || 0;
    });
  }

  updateCurrents() {
    this.state.currents.forEach(current => {
      // 电流强度随时间变化
      current.value = (current.direction) * 5 * (1 + 0.5 * Math.sin(this.state.time * 0.8 + current.id));
      current.magneticStrength = this.calculateMagneticField(current.position.x, current.position.y).strength || 0;
    });
  }

  updateWaves() {
    this.state.waves.forEach(wave => {
      wave.points = [];
      for (let i = 0; i < 100; i++) {
        const x = (i - 50) * 3;
        const y = wave.amplitude * Math.sin(wave.frequency * x - this.state.time * 2);
        wave.points.push({ x, y });
      }
    });
  }

  updatePoyntingVectors() {
    this.state.poyntingVectors.forEach(vector => {
      vector.position.x = Math.cos(vector.angle + this.state.time * 0.1) * 120;
      vector.position.y = Math.sin(vector.angle + this.state.time * 0.1) * 120;
      
      const electric = this.calculateElectricField(vector.position.x, vector.position.y);
      const magnetic = this.calculateMagneticField(vector.position.x, vector.position.y);
      const poynting = this.calculatePoyntingVector(electric, magnetic);
      
      vector.magnitude = Math.sqrt(poynting.x * poynting.x + poynting.y * poynting.y);
      vector.direction = poynting;
      vector.color = this.getPoyntingVectorColor(vector.magnitude);
    });
  }

  calculateTotalChargeCurrent() {
    this.state.totalCharge = this.state.charges.reduce((sum, charge) => sum + charge.value, 0);
    this.state.totalCurrent = this.state.currents.reduce((sum, current) => sum + current.value, 0);
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 绘制电磁波
    if (this.state.showElectromagneticWaves) {
      this.renderWaves(ctx, width, height);
    }

    // 绘制电场
    if (this.state.showElectricField) {
      this.renderElectricField(ctx, width, height);
    }

    // 绘制磁场
    if (this.state.showMagneticField) {
      this.renderMagneticField(ctx, width, height);
    }

    // 绘制坡印廷矢量
    if (this.state.showPoyntingVector) {
      this.renderPoyntingVectors(ctx, width, height);
    }

    // 绘制电荷
    this.renderCharges(ctx, width, height);

    // 绘制电流
    this.renderCurrents(ctx, width, height);

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height);
  }

  renderCharges(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.charges.forEach(charge => {
      const x = centerX + charge.position.x;
      const y = centerY + charge.position.y;
      const radius = 10 + Math.abs(charge.value) * 0.5;
      
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
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charge.value > 0 ? '+' : '-', x, y);
    });
  }

  renderCurrents(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.currents.forEach(current => {
      const x = centerX + current.position.x;
      const y = centerY + current.position.y;
      
      // 绘制电流线
      ctx.strokeStyle = current.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 50, y);
      ctx.lineTo(x + 50, y);
      ctx.stroke();
      
      // 绘制电流方向
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.direction > 0 ? '→' : '←', x, y);
    });
  }

  renderElectricField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制电场矢量
    this.state.electricField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const scale = 5;
      
      const ex = x + point.direction.x * scale;
      const ey = y + point.direction.y * scale;
      
      ctx.strokeStyle = point.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(ey - y, ex - x);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 4 * Math.cos(angle - 0.3), ey - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(ex - 4 * Math.cos(angle + 0.3), ey - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderMagneticField(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制磁场矢量
    this.state.magneticField.forEach(point => {
      const x = centerX + point.position.x;
      const y = centerY + point.position.y;
      const scale = 5;
      
      const mx = x + point.direction.x * scale;
      const my = y + point.direction.y * scale;
      
      ctx.strokeStyle = point.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(mx, my);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(my - y, mx - x);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 4 * Math.cos(angle - 0.3), my - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(mx - 4 * Math.cos(angle + 0.3), my - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderWaves(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.waves.forEach(wave => {
      if (wave.points.length > 1) {
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX + wave.points[0].x, centerY + wave.points[0].y);
        
        for (let i = 1; i < wave.points.length; i++) {
          ctx.lineTo(centerX + wave.points[i].x, centerY + wave.points[i].y);
        }
        
        ctx.stroke();
      }
    });
  }

  renderPoyntingVectors(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制坡印廷矢量
    this.state.poyntingVectors.forEach(vector => {
      const x = centerX + vector.position.x;
      const y = centerY + vector.position.y;
      const scale = 20;
      
      const px = x + vector.direction.x * scale;
      const py = y + vector.direction.y * scale;
      
      ctx.strokeStyle = vector.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(px, py);
      ctx.stroke();
      
      // 绘制箭头
      const angle = Math.atan2(py - y, px - x);
      ctx.fillStyle = vector.color;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 4 * Math.cos(angle - 0.3), py - 4 * Math.sin(angle - 0.3));
      ctx.lineTo(px - 4 * Math.cos(angle + 0.3), py - 4 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
    });
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '电磁场方程: ∇×E = -∂B/∂t, ∇×B = μ₀J + μ₀ε₀∂E/∂t';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`总电荷: ${this.state.totalCharge.toFixed(2)} C`, 20, 70);
    ctx.fillText(`总电流: ${this.state.totalCurrent.toFixed(2)} A`, 20, 90);
    ctx.fillText(`光速: ${(this.state.c / 1000).toFixed(0)} km/s`, 20, 110);
  }

  getChargeColor(index) {
    const colors = [
      'rgba(255, 68, 68, 1)',
      'rgba(68, 68, 255, 1)',
      'rgba(255, 255, 68, 1)',
      'rgba(68, 255, 68, 1)'
    ];
    return colors[index % colors.length];
  }

  getElectricFieldColor(strength) {
    const intensity = Math.min(strength * 0.5, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }

  getMagneticFieldColor(strength) {
    const intensity = Math.min(strength * 0.5, 1);
    const r = Math.floor(100 + 155 * (1 - intensity));
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(255 * intensity);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }

  getWaveColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(255, 102, 0, 0.8)',
      'rgba(68, 255, 68, 0.8)',
      'rgba(255, 68, 68, 0.8)',
      'rgba(255, 255, 68, 0.8)',
      'rgba(68, 255, 255, 0.8)',
      'rgba(255, 68, 255, 0.8)'
    ];
    return colors[index % colors.length];
  }

  getPoyntingVectorColor(magnitude) {
    const intensity = Math.min(magnitude * 2, 1);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(255 * intensity);
    const b = Math.floor(100 + 155 * (1 - intensity));
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
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
window.ElectromagneticFieldEquation = ElectromagneticFieldEquation;
console.log('⚡ 电磁场方程可视化模块加载完成');
