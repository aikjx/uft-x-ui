// 概率场方程可视化模块
// 功能: 实现概率场方程的高级可视化，包括概率分布、统计特性等

class ProbabilityFieldEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      probabilityField: [],
      particles: [],
      probabilityDensity: [],
      cumulativeProbability: [],
      showProbabilityField: true,
      showParticles: true,
      showProbabilityDensity: true,
      showCumulativeProbability: true,
      animationSpeed: 1,
      scale: 1,
      temperature: 1,
      pressure: 1,
      totalProbability: 0,
      averagePosition: { x: 0, y: 0 }
    }
    this.init()
  }

  init() {
    console.log('🎲 概率场方程可视化初始化')
    this.createProbabilityField()
    this.createParticles()
    this.createProbabilityDensity()
    this.createCumulativeProbability()
  }

  createProbabilityField() {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const field = {
          x: i - 10,
          y: j - 10,
          probability: Math.random(),
          color: this.getProbabilityColor(Math.random())
        }
        this.state.probabilityField.push(field)
      }
    }
  }

  createParticles() {
    for (let i = 0; i < 50; i++) {
      const particle = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        color: this.getParticleColor(i),
        radius: 2 + Math.random() * 2
      }
      this.state.particles.push(particle)
    }
  }

  createProbabilityDensity() {
    for (let i = 0; i < 100; i++) {
      this.state.probabilityDensity.push({
        x: (i - 50) / 5,
        y: 0,
        color: 'rgba(102, 255, 255, 0.6)'
      })
    }
  }

  createCumulativeProbability() {
    for (let i = 0; i < 100; i++) {
      this.state.cumulativeProbability.push({
        x: (i - 50) / 5,
        y: 0,
        color: 'rgba(255, 255, 102, 0.6)'
      })
    }
  }

  calculateProbability(x, y, t) {
    const sigma = 2 + Math.sin(t * 0.1) * 0.5
    const muX = Math.sin(t * 0.2) * 5
    const muY = Math.cos(t * 0.2) * 5
    const exponent = -((x - muX) ** 2 + (y - muY) ** 2) / (2 * sigma ** 2)
    return Math.exp(exponent) / (2 * Math.PI * sigma ** 2)
  }

  calculateCumulativeProbability(x, t) {
    const sigma = 2 + Math.sin(t * 0.1) * 0.5
    const mu = Math.sin(t * 0.2) * 5
    return 0.5 * (1 + Math.erf((x - mu) / (sigma * Math.sqrt(2))))
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed

    // 更新概率场
    this.updateProbabilityField()

    // 更新粒子
    this.updateParticles(deltaTime)

    // 更新概率密度
    this.updateProbabilityDensity()

    // 更新累积概率
    this.updateCumulativeProbability()

    // 计算统计特性
    this.calculateStatistics()
  }

  updateProbabilityField() {
    this.state.probabilityField.forEach(field => {
      field.probability = this.calculateProbability(field.x, field.y, this.state.time)
      field.color = this.getProbabilityColor(field.probability)
    })
  }

  updateParticles(deltaTime) {
    this.state.particles.forEach(particle => {
      // 粒子运动
      particle.position.x += particle.velocity.x * deltaTime * 60
      particle.position.y += particle.velocity.y * deltaTime * 60

      // 边界碰撞
      if (Math.abs(particle.position.x) > 10) {
        particle.velocity.x *= -0.8
        particle.position.x = Math.sign(particle.position.x) * 10
      }
      if (Math.abs(particle.position.y) > 10) {
        particle.velocity.y *= -0.8
        particle.position.y = Math.sign(particle.position.y) * 10
      }

      // 概率场影响
      const fieldProbability = this.calculateProbability(
        particle.position.x,
        particle.position.y,
        this.state.time
      )
      if (fieldProbability < 0.1) {
        particle.velocity.x *= 0.9
        particle.velocity.y *= 0.9
      }
    })
  }

  updateProbabilityDensity() {
    this.state.probabilityDensity.forEach((point, index) => {
      const x = (index - 50) / 5
      point.y = this.calculateProbability(x, 0, this.state.time)
    })
  }

  updateCumulativeProbability() {
    this.state.cumulativeProbability.forEach((point, index) => {
      const x = (index - 50) / 5
      point.y = this.calculateCumulativeProbability(x, this.state.time)
    })
  }

  calculateStatistics() {
    // 计算总概率
    let totalProbability = 0
    this.state.probabilityField.forEach(field => {
      totalProbability += field.probability
    })
    this.state.totalProbability = totalProbability

    // 计算平均位置
    let sumX = 0,
      sumY = 0
    this.state.particles.forEach(particle => {
      sumX += particle.position.x
      sumY += particle.position.y
    })
    this.state.averagePosition = {
      x: sumX / this.state.particles.length,
      y: sumY / this.state.particles.length
    }
  }

  getProbabilityColor(probability) {
    const intensity = Math.floor(probability * 255)
    return `rgba(${intensity}, ${intensity}, 255, ${probability})`
  }

  getParticleColor(index) {
    const hue = (index * 7) % 360
    return `hsla(${hue}, 100%, 70%, 0.8)`
  }

  render(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制概率场
    if (this.state.showProbabilityField) {
      this.renderProbabilityField(ctx, centerX, centerY)
    }

    // 绘制粒子
    if (this.state.showParticles) {
      this.renderParticles(ctx, centerX, centerY)
    }

    // 绘制概率密度
    if (this.state.showProbabilityDensity) {
      this.renderProbabilityDensity(ctx, centerX, centerY)
    }

    // 绘制累积概率
    if (this.state.showCumulativeProbability) {
      this.renderCumulativeProbability(ctx, centerX, centerY)
    }

    // 绘制信息
    this.renderInfo(ctx, width, height)
  }

  renderProbabilityField(ctx, centerX, centerY) {
    this.state.probabilityField.forEach(field => {
      ctx.fillStyle = field.color
      const size = 15 * this.state.scale
      const x = centerX + field.x * size
      const y = centerY + field.y * size
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    })
  }

  renderParticles(ctx, centerX, centerY) {
    this.state.particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.beginPath()
      const x = centerX + particle.position.x * 20 * this.state.scale
      const y = centerY + particle.position.y * 20 * this.state.scale
      ctx.arc(x, y, particle.radius * this.state.scale, 0, Math.PI * 2)
      ctx.fill()

      // 绘制速度向量
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(
        x + particle.velocity.x * 5 * this.state.scale,
        y + particle.velocity.y * 5 * this.state.scale
      )
      ctx.stroke()
    })
  }

  renderProbabilityDensity(ctx, centerX, centerY) {
    ctx.fillStyle = 'rgba(102, 255, 255, 0.3)'
    ctx.beginPath()

    this.state.probabilityDensity.forEach((point, index) => {
      const realX = centerX + point.x * 20
      const realY = centerY - point.y * 200

      if (index === 0) {
        ctx.moveTo(realX, centerY)
        ctx.lineTo(realX, realY)
      } else {
        ctx.lineTo(realX, realY)
      }
    })

    ctx.lineTo(centerX + 100 * 20, centerY)
    ctx.closePath()
    ctx.fill()

    // 绘制概率密度曲线
    ctx.strokeStyle = 'rgba(102, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()

    this.state.probabilityDensity.forEach((point, index) => {
      const realX = centerX + point.x * 20
      const realY = centerY - point.y * 200

      if (index === 0) {
        ctx.moveTo(realX, realY)
      } else {
        ctx.lineTo(realX, realY)
      }
    })

    ctx.stroke()
  }

  renderCumulativeProbability(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 255, 102, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()

    this.state.cumulativeProbability.forEach((point, index) => {
      const realX = centerX + point.x * 20
      const realY = centerY - point.y * 100

      if (index === 0) {
        ctx.moveTo(realX, realY)
      } else {
        ctx.lineTo(realX, realY)
      }
    })

    ctx.stroke()
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const info = [
      `总概率: ${this.state.totalProbability.toFixed(2)}`,
      `平均位置: (${this.state.averagePosition.x.toFixed(
        2
      )}, ${this.state.averagePosition.y.toFixed(2)})`,
      `温度: ${this.state.temperature.toFixed(2)}`,
      `压力: ${this.state.pressure.toFixed(2)}`,
      `概率场: ${this.state.showProbabilityField ? '显示' : '隐藏'}`,
      `粒子: ${this.state.showParticles ? '显示' : '隐藏'}`,
      `概率密度: ${this.state.showProbabilityDensity ? '显示' : '隐藏'}`,
      `累积概率: ${this.state.showCumulativeProbability ? '显示' : '隐藏'}`,
      `动画速度: ${this.state.animationSpeed.toFixed(1)}`
    ]

    info.forEach((line, index) => {
      ctx.fillText(line, 10, 10 + index * 20)
    })
  }

  setAnimationSpeed(speed) {
    this.state.animationSpeed = speed
  }

  setScale(scale) {
    this.state.scale = scale
  }

  setTemperature(temperature) {
    this.state.temperature = temperature
  }

  setPressure(pressure) {
    this.state.pressure = pressure
  }

  toggleProbabilityField() {
    this.state.showProbabilityField = !this.state.showProbabilityField
  }

  toggleParticles() {
    this.state.showParticles = !this.state.showParticles
  }

  toggleProbabilityDensity() {
    this.state.showProbabilityDensity = !this.state.showProbabilityDensity
  }

  toggleCumulativeProbability() {
    this.state.showCumulativeProbability = !this.state.showCumulativeProbability
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProbabilityFieldEquation
} else if (typeof window !== 'undefined') {
  window.ProbabilityFieldEquation = ProbabilityFieldEquation
}
