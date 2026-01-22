// 黑洞方程可视化模块
// 功能: 实现黑洞方程的高级可视化，包括视界、引力透镜等

class BlackHoleEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      blackHoles: [],
      eventHorizon: [],
      gravitationalLensing: [],
      accretionDisk: [],
      showBlackHoles: true,
      showEventHorizon: true,
      showGravitationalLensing: true,
      showAccretionDisk: true,
      animationSpeed: 1,
      scale: 1,
      blackHoleMass: 1,
      spinParameter: 0,
      charge: 0,
      eventHorizonRadius: 0,
      ergosphereRadius: 0,
      gravitationalPotential: 0
    };
    this.init();
  }

  init() {
    console.log('🌀 黑洞方程可视化初始化');
    this.createBlackHoles();
    this.createEventHorizon();
    this.createGravitationalLensing();
    this.createAccretionDisk();
  }

  createBlackHoles() {
    const blackHole = {
      id: 0,
      position: {
        x: 0,
        y: 0
      },
      mass: this.state.blackHoleMass,
      spin: this.state.spinParameter,
      charge: this.state.charge,
      color: 'rgba(0, 0, 0, 1)',
      radius: 10
    };
    this.state.blackHoles.push(blackHole);
  }

  createEventHorizon() {
    for (let i = 0; i < 72; i++) {
      const horizon = {
        angle: (i / 72) * Math.PI * 2,
        radius: 0,
        color: 'rgba(255, 102, 102, 0.6)'
      };
      this.state.eventHorizon.push(horizon);
    }
  }

  createGravitationalLensing() {
    for (let i = 0; i < 50; i++) {
      const lensing = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300
        },
        deflectionAngle: 0,
        color: 'rgba(255, 255, 255, 0.4)'
      };
      this.state.gravitationalLensing.push(lensing);
    }
  }

  createAccretionDisk() {
    for (let i = 0; i < 100; i++) {
      const disk = {
        angle: (i / 100) * Math.PI * 2,
        radius: 0,
        velocity: 0,
        temperature: 0,
        color: 'rgba(255, 102, 0, 0.6)'
      };
      this.state.accretionDisk.push(disk);
    }
  }

  calculateEventHorizonRadius(mass, spin, charge) {
    const rs = 2 * mass; // 史瓦西半径
    const a = spin;
    const q = charge;
    return rs / 2 * (1 + Math.sqrt(1 - (a * a + q * q) / (rs * rs / 4)));
  }

  calculateErgosphereRadius(mass, spin) {
    const rs = 2 * mass;
    const a = spin;
    return rs / 2 * (1 + Math.sqrt(1 - (a * a) / (rs * rs / 4)));
  }

  calculateGravitationalDeflection(x, y, mass) {
    const distance = Math.sqrt(x * x + y * y);
    if (distance < 0.1) return 0;
    const deflection = (4 * mass) / distance;
    return deflection;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新黑洞
    this.updateBlackHoles();
    
    // 更新视界
    this.updateEventHorizon();
    
    // 更新引力透镜
    this.updateGravitationalLensing();
    
    // 更新吸积盘
    this.updateAccretionDisk();
    
    // 计算物理参数
    this.calculateBlackHoleParameters();
  }

  updateBlackHoles() {
    this.state.blackHoles.forEach(blackHole => {
      blackHole.mass = this.state.blackHoleMass;
      blackHole.spin = this.state.spinParameter;
      blackHole.charge = this.state.charge;
    });
  }

  updateEventHorizon() {
    const horizonRadius = this.calculateEventHorizonRadius(
      this.state.blackHoleMass,
      this.state.spinParameter,
      this.state.charge
    );
    
    this.state.eventHorizon.forEach(horizon => {
      horizon.radius = horizonRadius;
    });
  }

  updateGravitationalLensing() {
    this.state.gravitationalLensing.forEach(lensing => {
      lensing.deflectionAngle = this.calculateGravitationalDeflection(
        lensing.position.x,
        lensing.position.y,
        this.state.blackHoleMass
      );
    });
  }

  updateAccretionDisk() {
    this.state.accretionDisk.forEach((disk, index) => {
      const baseRadius = this.calculateEventHorizonRadius(
        this.state.blackHoleMass,
        this.state.spinParameter,
        this.state.charge
      ) * 3;
      disk.radius = baseRadius + (index / 100) * 50;
      disk.velocity = Math.sqrt(this.state.blackHoleMass / disk.radius);
      disk.temperature = 10000 / Math.sqrt(disk.radius);
      disk.color = this.getAccretionDiskColor(disk.temperature);
    });
  }

  calculateBlackHoleParameters() {
    this.state.eventHorizonRadius = this.calculateEventHorizonRadius(
      this.state.blackHoleMass,
      this.state.spinParameter,
      this.state.charge
    );
    this.state.ergosphereRadius = this.calculateErgosphereRadius(
      this.state.blackHoleMass,
      this.state.spinParameter
    );
    this.state.gravitationalPotential = -this.state.blackHoleMass / this.state.eventHorizonRadius;
  }

  getAccretionDiskColor(temperature) {
    const normalizedTemp = Math.min(1, temperature / 10000);
    const r = Math.floor(255 * normalizedTemp);
    const g = Math.floor(255 * normalizedTemp * 0.7);
    const b = Math.floor(255 * normalizedTemp * 0.3);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制引力透镜
    if (this.state.showGravitationalLensing) {
      this.renderGravitationalLensing(ctx, centerX, centerY);
    }
    
    // 绘制吸积盘
    if (this.state.showAccretionDisk) {
      this.renderAccretionDisk(ctx, centerX, centerY);
    }
    
    // 绘制视界
    if (this.state.showEventHorizon) {
      this.renderEventHorizon(ctx, centerX, centerY);
    }
    
    // 绘制黑洞
    if (this.state.showBlackHoles) {
      this.renderBlackHoles(ctx, centerX, centerY);
    }
    
    // 绘制信息
    this.renderInfo(ctx, width, height);
  }

  renderBlackHoles(ctx, centerX, centerY) {
    this.state.blackHoles.forEach(blackHole => {
      ctx.fillStyle = blackHole.color;
      ctx.beginPath();
      const x = centerX + blackHole.position.x * 20 * this.state.scale;
      const y = centerY + blackHole.position.y * 20 * this.state.scale;
      const radius = blackHole.radius * this.state.scale;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderEventHorizon(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 102, 102, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.eventHorizon.forEach((horizon, index) => {
      const x = centerX + Math.cos(horizon.angle) * horizon.radius * 20 * this.state.scale;
      const y = centerY + Math.sin(horizon.angle) * horizon.radius * 20 * this.state.scale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
    
    // 绘制能层
    if (this.state.spinParameter > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 102, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const ergosphereRadius = this.state.ergosphereRadius;
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * ergosphereRadius * 20 * this.state.scale;
        const y = centerY + Math.sin(angle) * ergosphereRadius * 20 * this.state.scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.stroke();
    }
  }

  renderGravitationalLensing(ctx, centerX, centerY) {
    this.state.gravitationalLensing.forEach(lensing => {
      const distance = Math.sqrt(lensing.position.x * lensing.position.x + lensing.position.y * lensing.position.y);
      if (distance > 5) {
        ctx.strokeStyle = lensing.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const startX = centerX + lensing.position.x * this.state.scale;
        const startY = centerY + lensing.position.y * this.state.scale;
        
        const angle = Math.atan2(lensing.position.y, lensing.position.x);
        const deflection = lensing.deflectionAngle;
        const endX = centerX + Math.cos(angle + deflection) * distance * this.state.scale;
        const endY = centerY + Math.sin(angle + deflection) * distance * this.state.scale;
        
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });
  }

  renderAccretionDisk(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 102, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    this.state.accretionDisk.forEach((disk, index) => {
      const angle = disk.angle + this.state.time * 0.1;
      const x = centerX + Math.cos(angle) * disk.radius * 20 * this.state.scale;
      const y = centerY + Math.sin(angle) * disk.radius * 20 * this.state.scale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
    
    // 绘制吸积盘内侧
    ctx.strokeStyle = 'rgba(255, 255, 102, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    this.state.accretionDisk.forEach((disk, index) => {
      const angle = disk.angle + this.state.time * 0.1;
      const innerRadius = disk.radius * 0.9;
      const x = centerX + Math.cos(angle) * innerRadius * 20 * this.state.scale;
      const y = centerY + Math.sin(angle) * innerRadius * 20 * this.state.scale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `黑洞质量: ${this.state.blackHoleMass.toFixed(2)} M☉`,
      `自旋参数: ${this.state.spinParameter.toFixed(2)}`,
      `电荷: ${this.state.charge.toFixed(2)}`,
      `视界半径: ${this.state.eventHorizonRadius.toFixed(2)} rs`,
      `能层半径: ${this.state.ergosphereRadius.toFixed(2)} rs`,
      `引力势: ${this.state.gravitationalPotential.toFixed(2)}`,
      `黑洞: ${this.state.showBlackHoles ? '显示' : '隐藏'}`,
      `视界: ${this.state.showEventHorizon ? '显示' : '隐藏'}`,
      `引力透镜: ${this.state.showGravitationalLensing ? '显示' : '隐藏'}`,
      `吸积盘: ${this.state.showAccretionDisk ? '显示' : '隐藏'}`,
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

  setBlackHoleMass(mass) {
    this.state.blackHoleMass = mass;
  }

  setSpinParameter(spin) {
    this.state.spinParameter = spin;
  }

  setCharge(charge) {
    this.state.charge = charge;
  }

  toggleBlackHoles() {
    this.state.showBlackHoles = !this.state.showBlackHoles;
  }

  toggleEventHorizon() {
    this.state.showEventHorizon = !this.state.showEventHorizon;
  }

  toggleGravitationalLensing() {
    this.state.showGravitationalLensing = !this.state.showGravitationalLensing;
  }

  toggleAccretionDisk() {
    this.state.showAccretionDisk = !this.state.showAccretionDisk;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlackHoleEquation;
} else if (typeof window !== 'undefined') {
  window.BlackHoleEquation = BlackHoleEquation;
}
