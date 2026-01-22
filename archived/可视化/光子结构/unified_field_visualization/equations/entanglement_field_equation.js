// 纠缠场方程可视化模块
// 功能: 实现纠缠场方程的高级可视化，包括量子纠缠、Bell不等式等

class EntanglementFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      entangledPairs: [],
      entanglementStrength: [],
      bellInequality: [],
      showEntangledPairs: true,
      showEntanglementStrength: true,
      showBellInequality: true,
      showCorrelation: true,
      animationSpeed: 1,
      scale: 1,
      entanglementDegree: 1,
      measurementAngle: 0,
      totalEntangledPairs: 0,
      correlationCoefficient: 0
    };
    this.init();
  }

  init() {
    console.log('🔗 纠缠场方程可视化初始化');
    this.createEntangledPairs();
    this.createEntanglementStrength();
    this.createBellInequality();
  }

  createEntangledPairs() {
    for (let i = 0; i < 10; i++) {
      const pair = {
        id: i,
        particle1: {
          position: {
            x: -30 + Math.random() * 20,
            y: (Math.random() - 0.5) * 60
          },
          spin: Math.random() > 0.5 ? 1 : -1,
          color: 'rgba(255, 102, 102, 0.8)'
        },
        particle2: {
          position: {
            x: 30 - Math.random() * 20,
            y: (Math.random() - 0.5) * 60
          },
          spin: Math.random() > 0.5 ? 1 : -1,
          color: 'rgba(102, 102, 255, 0.8)'
        },
        entanglementStrength: Math.random(),
        correlation: Math.random()
      };
      this.state.entangledPairs.push(pair);
    }
  }

  createEntanglementStrength() {
    for (let i = 0; i < 36; i++) {
      const strength = {
        angle: (i / 36) * Math.PI * 2,
        value: Math.random(),
        color: this.getEntanglementColor(Math.random())
      };
      this.state.entanglementStrength.push(strength);
    }
  }

  createBellInequality() {
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      this.state.bellInequality.push({
        angle: angle,
        value: 0,
        color: 'rgba(102, 255, 102, 0.6)'
      });
    }
  }

  calculateEntanglementStrength(pair, t) {
    const distance = Math.sqrt(
      Math.pow(pair.particle1.position.x - pair.particle2.position.x, 2) +
      Math.pow(pair.particle1.position.y - pair.particle2.position.y, 2)
    );
    const decay = Math.exp(-distance / 50);
    const oscillation = Math.sin(t * 0.3 + pair.id);
    return this.state.entanglementDegree * decay * (0.5 + 0.5 * oscillation);
  }

  calculateBellInequality(angle, t) {
    const theta = angle;
    const phi = angle + Math.PI / 2;
    return Math.abs(Math.cos(theta) - Math.cos(phi)) - 2;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    
    // 更新纠缠对
    this.updateEntangledPairs();
    
    // 更新纠缠强度
    this.updateEntanglementStrength();
    
    // 更新Bell不等式
    this.updateBellInequality();
    
    // 计算统计特性
    this.calculateStatistics();
  }

  updateEntangledPairs() {
    this.state.entangledPairs.forEach(pair => {
      // 粒子运动
      pair.particle1.position.x -= Math.sin(this.state.time * 0.2 + pair.id) * 0.5;
      pair.particle2.position.x += Math.sin(this.state.time * 0.2 + pair.id) * 0.5;
      
      // 自旋关联
      if (Math.random() < 0.01) {
        pair.particle1.spin *= -1;
        pair.particle2.spin = -pair.particle1.spin; // 纠缠导致的自旋关联
      }
      
      // 纠缠强度
      pair.entanglementStrength = this.calculateEntanglementStrength(pair, this.state.time);
    });
  }

  updateEntanglementStrength() {
    this.state.entanglementStrength.forEach((strength, index) => {
      strength.value = Math.sin(this.state.time * 0.4 + index) * 0.5 + 0.5;
      strength.color = this.getEntanglementColor(strength.value);
    });
  }

  updateBellInequality() {
    this.state.bellInequality.forEach((point, index) => {
      point.value = this.calculateBellInequality(point.angle, this.state.time);
    });
  }

  calculateStatistics() {
    // 计算总纠缠对
    this.state.totalEntangledPairs = this.state.entangledPairs.length;
    
    // 计算相关系数
    let correlation = 0;
    this.state.entangledPairs.forEach(pair => {
      correlation += pair.particle1.spin * pair.particle2.spin;
    });
    this.state.correlationCoefficient = correlation / this.state.totalEntangledPairs;
  }

  getEntanglementColor(strength) {
    const intensity = Math.floor(strength * 255);
    return `rgba(${intensity}, 0, ${intensity}, ${strength})`;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制纠缠强度场
    if (this.state.showEntanglementStrength) {
      this.renderEntanglementStrength(ctx, centerX, centerY);
    }
    
    // 绘制纠缠对
    if (this.state.showEntangledPairs) {
      this.renderEntangledPairs(ctx, centerX, centerY);
    }
    
    // 绘制Bell不等式
    if (this.state.showBellInequality) {
      this.renderBellInequality(ctx, centerX, centerY);
    }
    
    // 绘制相关性
    if (this.state.showCorrelation) {
      this.renderCorrelation(ctx, centerX, centerY);
    }
    
    // 绘制信息
    this.renderInfo(ctx, width, height);
  }

  renderEntanglementStrength(ctx, centerX, centerY) {
    this.state.entanglementStrength.forEach(strength => {
      ctx.strokeStyle = strength.color;
      ctx.lineWidth = 2;
      const radius = 80 * this.state.scale;
      const endRadius = radius * (1 + strength.value);
      const x1 = centerX + Math.cos(strength.angle) * radius;
      const y1 = centerY + Math.sin(strength.angle) * radius;
      const x2 = centerX + Math.cos(strength.angle) * endRadius;
      const y2 = centerY + Math.sin(strength.angle) * endRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  renderEntangledPairs(ctx, centerX, centerY) {
    this.state.entangledPairs.forEach(pair => {
      // 绘制纠缠连接
      ctx.strokeStyle = `rgba(255, 255, 255, ${pair.entanglementStrength})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + pair.particle1.position.x * this.state.scale, centerY + pair.particle1.position.y * this.state.scale);
      ctx.lineTo(centerX + pair.particle2.position.x * this.state.scale, centerY + pair.particle2.position.y * this.state.scale);
      ctx.stroke();
      
      // 绘制粒子1
      ctx.fillStyle = pair.particle1.color;
      ctx.beginPath();
      ctx.arc(centerX + pair.particle1.position.x * this.state.scale, centerY + pair.particle1.position.y * this.state.scale, 6 * this.state.scale, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制粒子2
      ctx.fillStyle = pair.particle2.color;
      ctx.beginPath();
      ctx.arc(centerX + pair.particle2.position.x * this.state.scale, centerY + pair.particle2.position.y * this.state.scale, 6 * this.state.scale, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制自旋方向
      this.renderSpinDirection(ctx, centerX, centerY, pair.particle1, 1);
      this.renderSpinDirection(ctx, centerX, centerY, pair.particle2, -1);
    });
  }

  renderSpinDirection(ctx, centerX, centerY, particle, direction) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    const length = 10 * this.state.scale;
    const angle = particle.spin > 0 ? 0 : Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX + particle.position.x * this.state.scale, centerY + particle.position.y * this.state.scale);
    ctx.lineTo(
      centerX + particle.position.x * this.state.scale + Math.cos(angle) * length,
      centerY + particle.position.y * this.state.scale + Math.sin(angle) * length * direction
    );
    ctx.stroke();
  }

  renderBellInequality(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(102, 255, 102, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.bellInequality.forEach((point, index) => {
      const radius = 60 * this.state.scale;
      const x = centerX + Math.cos(point.angle) * (radius + point.value * 20);
      const y = centerY + Math.sin(point.angle) * (radius + point.value * 20);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
  }

  renderCorrelation(ctx, centerX, centerY) {
    ctx.fillStyle = 'rgba(255, 255, 102, 0.3)';
    const radius = Math.abs(this.state.correlationCoefficient) * 50 * this.state.scale;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制相关系数文本
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`r = ${this.state.correlationCoefficient.toFixed(2)}`, centerX, centerY);
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `纠缠对数量: ${this.state.totalEntangledPairs}`,
      `相关系数: ${this.state.correlationCoefficient.toFixed(2)}`,
      `纠缠度: ${this.state.entanglementDegree.toFixed(2)}`,
      `测量角度: ${(this.state.measurementAngle * 180 / Math.PI).toFixed(0)}°`,
      `纠缠对: ${this.state.showEntangledPairs ? '显示' : '隐藏'}`,
      `纠缠强度: ${this.state.showEntanglementStrength ? '显示' : '隐藏'}`,
      `Bell不等式: ${this.state.showBellInequality ? '显示' : '隐藏'}`,
      `相关性: ${this.state.showCorrelation ? '显示' : '隐藏'}`,
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

  setEntanglementDegree(degree) {
    this.state.entanglementDegree = degree;
  }

  setMeasurementAngle(angle) {
    this.state.measurementAngle = angle;
  }

  toggleEntangledPairs() {
    this.state.showEntangledPairs = !this.state.showEntangledPairs;
  }

  toggleEntanglementStrength() {
    this.state.showEntanglementStrength = !this.state.showEntanglementStrength;
  }

  toggleBellInequality() {
    this.state.showBellInequality = !this.state.showBellInequality;
  }

  toggleCorrelation() {
    this.state.showCorrelation = !this.state.showCorrelation;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EntanglementFieldEquation;
} else if (typeof window !== 'undefined') {
  window.EntanglementFieldEquation = EntanglementFieldEquation;
}
