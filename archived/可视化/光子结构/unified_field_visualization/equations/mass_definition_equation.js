// 质量定义方程可视化模块
// 功能: 实现质量定义方程的高级可视化，包括密度分布、立体角动画、质量-空间关系图等

class MassDefinitionEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      k: 1, // 空间-质量耦合常数
      scale: 1,
      showDensityDistribution: true,
      showSolidAngle: true,
      showMassSpaceRelation: true,
      showDensityGradient: true,
      densityDistribution: [],
      solidAngleData: [],
      massSpaceRelation: [],
      animationSpeed: 1,
      maxDensity: 10
    }
    this.init()
  }

  init() {
    console.log('⚖️ 质量定义方程可视化初始化')
    this.createDensityDistribution()
    this.createSolidAngleData()
    this.createMassSpaceRelation()
  }

  createDensityDistribution() {
    // 创建密度分布数据
    for (let i = 0; i < 30; i++) {
      const distance = i * 1.5
      const density = this.calculateDensity(distance)
      this.state.densityDistribution.push({
        id: i,
        distance,
        density,
        color: this.getDensityColor(density)
      })
    }
  }

  createSolidAngleData() {
    // 创建立体角数据
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const solidAngle = 2 * Math.PI * (1 - Math.cos(angle))
      this.state.solidAngleData.push({
        id: i,
        angle,
        solidAngle,
        position: {
          x: Math.cos(angle) * 60,
          y: Math.sin(angle) * 60,
          z: 0
        },
        color: this.getSolidAngleColor(i)
      })
    }
  }

  createMassSpaceRelation() {
    // 创建质量-空间关系数据
    for (let i = 0; i < 20; i++) {
      const space = i * 0.4
      const mass = this.calculateMass(space)
      const energy = this.calculateMassEnergyRelation(mass)
      this.state.massSpaceRelation.push({
        id: i,
        space,
        mass,
        energy,
        color: this.getMassColor(mass)
      })
    }
  }

  calculateDensity(distance) {
    // 密度随距离的分布（高斯分布）
    const sigma = 5
    return this.state.maxDensity * Math.exp(-(distance * distance) / (2 * sigma * sigma))
  }

  calculateMassEnergyRelation(mass) {
    // 质能关系 E=mc²
    return mass * this.state.c * this.state.c
  }

  calculateGravitationalField(distance) {
    // 引力场强度
    return (this.state.G * this.state.k) / (distance * distance)
  }

  calculateDensityGradient(density, distance) {
    // 密度梯度
    const sigma = 5
    return (-density * distance) / (sigma * sigma)
  }

  calculateMass(space) {
    // 质量-空间关系（改进的模型）
    return this.state.k * space * Math.exp(-space * 0.1)
  }

  getDensityColor(density) {
    const intensity = density / this.state.maxDensity
    const r = Math.floor(255 * (1 - intensity))
    const g = Math.floor(255 * intensity)
    const b = Math.floor(100 + 155 * intensity)
    return `rgba(${r}, ${g}, ${b}, 0.8)`
  }

  getMassColor(mass) {
    const intensity = Math.min(mass / 5, 1)
    const r = Math.floor(200 + 55 * intensity)
    const g = Math.floor(100 + 155 * (1 - intensity))
    const b = Math.floor(50 + 205 * intensity)
    return `rgba(${r}, ${g}, ${b}, 0.8)`
  }

  getSolidAngleColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(255, 102, 0, 0.8)',
      'rgba(68, 255, 68, 0.8)',
      'rgba(255, 68, 68, 0.8)',
      'rgba(255, 255, 68, 0.8)',
      'rgba(68, 255, 255, 0.8)',
      'rgba(255, 68, 255, 0.8)',
      'rgba(162, 255, 68, 0.8)',
      'rgba(68, 68, 255, 0.8)',
      'rgba(255, 162, 68, 0.8)',
      'rgba(68, 162, 255, 0.8)'
    ]
    return colors[index % colors.length]
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed

    // 更新密度分布
    this.updateDensityDistribution()

    // 更新立体角数据
    this.updateSolidAngleData()

    // 更新质量-空间关系
    this.updateMassSpaceRelation()
  }

  updateDensityDistribution() {
    this.state.densityDistribution.forEach((data, index) => {
      const oscillation = Math.sin(this.state.time + index) * 0.1
      data.density = this.calculateDensity(data.distance) * (1 + oscillation)
      data.color = this.getDensityColor(data.density)
    })
  }

  updateSolidAngleData() {
    this.state.solidAngleData.forEach((data, index) => {
      const timeOffset = index * 0.3
      data.angle = (index / 8) * Math.PI * 2 + this.state.time * 0.5 + timeOffset
      data.solidAngle = 2 * Math.PI * (1 - Math.cos(data.angle))
      data.position = {
        x: Math.cos(data.angle) * 50,
        y: Math.sin(data.angle) * 50,
        z: Math.sin(this.state.time + index) * 20
      }
    })
  }

  updateMassSpaceRelation() {
    this.state.massSpaceRelation.forEach((data, index) => {
      const oscillation = Math.sin(this.state.time * 0.3 + index) * 0.05
      data.mass = this.calculateMass(data.space) * (1 + oscillation)
      data.color = this.getMassColor(data.mass)
    })
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制密度分布
    if (this.state.showDensityDistribution) {
      this.renderDensityDistribution(ctx, width, height)
    }

    // 绘制立体角
    if (this.state.showSolidAngle) {
      this.renderSolidAngle(ctx, width, height)
    }

    // 绘制质量-空间关系
    if (this.state.showMassSpaceRelation) {
      this.renderMassSpaceRelation(ctx, width, height)
    }

    // 绘制密度梯度
    if (this.state.showDensityGradient) {
      this.renderDensityGradient(ctx, width, height)
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height)
  }

  renderDensityDistribution(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = 100

    // 绘制密度同心圆环
    this.state.densityDistribution.forEach(data => {
      const radius = (data.distance / 40) * maxRadius
      ctx.strokeStyle = data.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    })

    // 绘制密度中心点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  renderSolidAngle(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2

    // 绘制立体角扇形
    this.state.solidAngleData.forEach(data => {
      const x = centerX + data.position.x
      const y = centerY + data.position.y

      // 绘制连接线
      ctx.strokeStyle = 'rgba(255, 204, 0, 0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // 绘制立体角点
      const size = Math.sqrt(data.solidAngle) * 5
      ctx.fillStyle = 'rgba(255, 204, 0, 0.6)'
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  renderMassSpaceRelation(ctx, width, height) {
    const startX = 50
    const startY = height - 50
    const widthRange = width - 100
    const heightRange = height - 150

    // 绘制质量-空间关系曲线
    ctx.strokeStyle = '#44ff44'
    ctx.lineWidth = 2
    ctx.beginPath()

    this.state.massSpaceRelation.forEach((data, index) => {
      const x = startX + (data.space / 7) * widthRange
      const y = startY - (data.mass / 5) * heightRange

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制数据点
    this.state.massSpaceRelation.forEach(data => {
      const x = startX + (data.space / 7) * widthRange
      const y = startY - (data.mass / 5) * heightRange

      ctx.fillStyle = data.color
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  renderDensityGradient(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const size = 150

    // 创建密度梯度背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.5, 'rgba(102, 126, 234, 0.2)')
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2)
    ctx.fill()
  }

  renderMassEnergyRelation(ctx, width, height) {
    const startX = width - 250;
    const startY = 100;
    const widthRange = 200;
    const heightRange = 150;

    // 绘制质能关系曲线
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.massEnergyRelation.forEach((data, index) => {
      const x = startX + (data.mass / 3) * widthRange;
      const y = startY + heightRange - (data.energy / 1e17) * heightRange;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // 绘制数据点
    this.state.massEnergyRelation.forEach(data => {
      const x = startX + (data.mass / 3) * widthRange;
      const y = startY + heightRange - (data.energy / 1e17) * heightRange;
      
      ctx.fillStyle = data.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderGravitationalField(ctx, width, height) {
    const startX = 50;
    const startY = 30;
    const widthRange = width - 100;
    const heightRange = 100;

    // 绘制引力场曲线
    ctx.strokeStyle = '#4444ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.gravitationalField.forEach((data, index) => {
      const x = startX + (data.distance / 18) * widthRange;
      const y = startY + heightRange - (data.field / 0.1) * heightRange;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // 绘制数据点
    this.state.gravitationalField.forEach(data => {
      const x = startX + (data.distance / 18) * widthRange;
      const y = startY + heightRange - (data.field / 0.1) * heightRange;
      
      ctx.fillStyle = data.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  getGravitationalFieldColor(field) {
    const intensity = Math.min(field * 10, 1);
    const r = Math.floor(100 + 155 * (1 - intensity));
    const g = Math.floor(100 + 155 * (1 - intensity));
    const b = Math.floor(200 + 55 * intensity);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '质量定义方程: m = k · (dn/dΩ)';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText('质量 = 空间密度对立体角的变化率', 20, 50);
    ctx.fillText('k = 空间-质量耦合常数', 20, 70);
    ctx.fillText('dn/dΩ = 空间密度梯度', 20, 90);
    ctx.fillText('质能关系: E = mc²', 20, 110);
    ctx.fillText('质量的几何本质: 空间几何属性的体现', 20, 130);
  }

  setParameter(name, value) {
    if (this.state.hasOwnProperty(name)) {
      this.state[name] = value
    }
  }

  getParameter(name) {
    return this.state[name]
  }
}

// 导出模块
window.MassDefinitionEquation = MassDefinitionEquation
console.log('⚖️ 质量定义方程可视化模块加载完成')
