// 三维螺旋时空方程可视化模块
// 功能: 实现三维螺旋时空方程的高级可视化，包括螺旋动力学、多粒子系统等

class HelixSpacetimeEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      r: 5, // 螺旋半径
      omega: 0.5, // 角速度
      h: 0.3, // 螺距
      c: 299792458, // 光速
      scale: 1,
      showHelix: true,
      showCylinder: true,
      showVelocityVectors: true,
      showAccelerationVectors: true,
      showForceVectors: true,
      showParticles: true,
      show3DEffects: true,
      showEnergyDistribution: true,
      particles: [],
      trailLength: 200,
      trails: [],
      energyDistribution: [],
      animationSpeed: 1,
      gravityStrength: 0,
      electromagneticField: 0
    }
    this.init()
  }

  init() {
    console.log('🔄 三维螺旋时空方程可视化初始化')
    this.createParticles()
    this.createEnergyDistribution()
  }

  createParticles() {
    // 创建测试粒子
    for (let i = 0; i < 6; i++) {
      const particle = {
        id: i,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        force: { x: 0, y: 0, z: 0 },
        r: this.state.r * (0.3 + i * 0.2),
        omega: this.state.omega * (1 + i * 0.15),
        h: this.state.h * (1 + i * 0.08),
        mass: 1 + i * 0.2,
        charge: i % 2 === 0 ? 1 : -1,
        energy: 0,
        momentum: { x: 0, y: 0, z: 0 },
        color: this.getParticleColor(i),
        phase: i * 0.2
      }
      this.state.particles.push(particle)
      this.state.trails.push([])
    }
  }

  update(deltaTime) {
    this.state.time += deltaTime

    // 更新粒子
    this.state.particles.forEach((particle, index) => {
      this.updateParticle(particle, deltaTime)
      this.updateTrail(particle, index)
    })
  }

  updateParticle(particle, deltaTime) {
    // 三维螺旋时空方程: r(t) = r·cos(ωt)·i + r·sin(ωt)·j + ht·k
    // 这里Z轴使用光速作为分量
    const time = this.state.time
    particle.position.x = particle.r * Math.cos(particle.omega * time)
    particle.position.y = particle.r * Math.sin(particle.omega * time)
    particle.position.z = this.state.c * time * 0.00000001 // 缩放光速以适应可视化

    // 计算速度矢量
    particle.velocity.x = -particle.r * particle.omega * Math.sin(particle.omega * time)
    particle.velocity.y = particle.r * particle.omega * Math.cos(particle.omega * time)
    particle.velocity.z = this.state.c * 0.00000001
  }

  updateTrail(particle, index) {
    const trail = this.state.trails[index]
    trail.push({ ...particle.position })
    if (trail.length > this.state.trailLength) {
      trail.shift()
    }
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制圆柱边界
    if (this.state.showCylinder) {
      this.renderCylinder(ctx, width, height)
    }

    // 绘制螺旋轨迹
    if (this.state.showHelix) {
      this.renderHelixTrails(ctx, width, height)
    }

    // 绘制粒子
    if (this.state.showParticles) {
      this.renderParticles(ctx, width, height)
    }

    // 绘制速度矢量
    if (this.state.showVelocityVectors) {
      this.renderVelocityVectors(ctx, width, height)
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height)
  }

  renderCylinder(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const cylinderHeight = 200
    const cylinderRadius = this.state.r * 10

    // 绘制圆柱侧面
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)'
    ctx.lineWidth = 1

    // 绘制垂直线条
    const segments = 16
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = centerX + cylinderRadius * Math.cos(angle)
      ctx.beginPath()
      ctx.moveTo(x, centerY - cylinderHeight / 2)
      ctx.lineTo(x, centerY + cylinderHeight / 2)
      ctx.stroke()
    }

    // 绘制水平圆环
    const rings = 8
    for (let i = 0; i <= rings; i++) {
      const y = centerY - cylinderHeight / 2 + (cylinderHeight * i) / rings
      ctx.beginPath()
      ctx.ellipse(centerX, y, cylinderRadius, cylinderRadius * 0.3, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  renderHelixTrails(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 10

    this.state.trails.forEach((trail, index) => {
      if (trail.length < 2) return

      const particle = this.state.particles[index]
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 2
      ctx.beginPath()

      trail.forEach((point, i) => {
        const x = centerX + point.x * scale
        const y = centerY + point.y * scale * 0.3 + point.z * scale * 0.0000001
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    })
  }

  renderParticles(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 10

    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * scale
      const y =
        centerY + particle.position.y * scale * 0.3 + particle.position.z * scale * 0.0000001

      // 绘制粒子光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(0.5, particle.color.replace('1)', '0.5)'))
      gradient.addColorStop(1, particle.color.replace('1)', '0)'))
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()

      // 绘制粒子核心
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  renderVelocityVectors(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 10
    const vectorScale = 0.1

    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * scale
      const y =
        centerY + particle.position.y * scale * 0.3 + particle.position.z * scale * 0.0000001

      // 计算速度矢量终点
      const vx = x + particle.velocity.x * vectorScale
      const vy =
        y + particle.velocity.y * vectorScale * 0.3 + particle.velocity.z * vectorScale * 0.0000001

      // 绘制速度矢量
      ctx.strokeStyle = '#ffcc00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(vx, vy)
      ctx.stroke()

      // 绘制箭头
      const angle = Math.atan2(vy - y, vx - x)
      ctx.fillStyle = '#ffcc00'
      ctx.beginPath()
      ctx.moveTo(vx, vy)
      ctx.lineTo(vx - 8 * Math.cos(angle - 0.3), vy - 8 * Math.sin(angle - 0.3))
      ctx.lineTo(vx - 8 * Math.cos(angle + 0.3), vy - 8 * Math.sin(angle + 0.3))
      ctx.closePath()
      ctx.fill()
    })
  }

  renderEnergyDistribution(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = 120

    // 绘制能量同心圆环
    this.state.energyDistribution.forEach(data => {
      const radius = (data.distance / 6) * maxRadius
      ctx.strokeStyle = data.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    })
  }

  render3DEffects(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const size = 150

    // 绘制3D网格背景
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    for (let i = -3; i <= 3; i++) {
      const x = centerX + i * 20
      ctx.beginPath()
      ctx.moveTo(x, centerY - size)
      ctx.lineTo(x, centerY + size)
      ctx.stroke()
    }

    for (let i = -3; i <= 3; i++) {
      const y = centerY + i * 20
      ctx.beginPath()
      ctx.moveTo(centerX - size, y)
      ctx.lineTo(centerX + size, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  renderAccelerationVectors(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 10
    const vectorScale = 0.001

    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * scale
      const y =
        centerY + particle.position.y * scale * 0.3 + particle.position.z * scale * 0.0000001

      // 计算加速度矢量终点
      const ax = x + particle.acceleration.x * vectorScale
      const ay =
        y +
        particle.acceleration.y * vectorScale * 0.3 +
        particle.acceleration.z * vectorScale * 0.0000001

      // 绘制加速度矢量
      ctx.strokeStyle = '#ff00ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(ax, ay)
      ctx.stroke()

      // 绘制箭头
      const angle = Math.atan2(ay - y, ax - x)
      ctx.fillStyle = '#ff00ff'
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax - 6 * Math.cos(angle - 0.3), ay - 6 * Math.sin(angle - 0.3))
      ctx.lineTo(ax - 6 * Math.cos(angle + 0.3), ay - 6 * Math.sin(angle + 0.3))
      ctx.closePath()
      ctx.fill()
    })
  }

  renderForceVectors(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 10
    const vectorScale = 0.0001

    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * scale
      const y =
        centerY + particle.position.y * scale * 0.3 + particle.position.z * scale * 0.0000001

      // 计算力矢量终点
      const fx = x + particle.force.x * vectorScale
      const fy =
        y + particle.force.y * vectorScale * 0.3 + particle.force.z * vectorScale * 0.0000001

      // 绘制力矢量
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(fx, fy)
      ctx.stroke()

      // 绘制箭头
      const angle = Math.atan2(fy - y, fx - x)
      ctx.fillStyle = '#00ffff'
      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(fx - 6 * Math.cos(angle - 0.3), fy - 6 * Math.sin(angle - 0.3))
      ctx.lineTo(fx - 6 * Math.cos(angle + 0.3), fy - 6 * Math.sin(angle + 0.3))
      ctx.closePath()
      ctx.fill()
    })
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#4444ff'
    ctx.font = 'bold 16px Arial'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'
    ctx.lineWidth = 2

    const equation = '三维螺旋时空方程: r(t) = r·cos(ωt)·i + r·sin(ωt)·j + ht·k'
    ctx.strokeText(equation, 20, 30)
    ctx.fillText(equation, 20, 30)

    ctx.font = '12px Arial'
    ctx.fillStyle = '#e0e6ff'
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50)
    ctx.fillText(`螺旋半径: ${this.state.r.toFixed(1)}`, 20, 70)
    ctx.fillText(`角速度: ${this.state.omega.toFixed(2)} rad/s`, 20, 90)
    ctx.fillText(`螺距: ${this.state.h.toFixed(2)}`, 20, 110)
    ctx.fillText(`粒子数: ${this.state.particles.length}`, 20, 130)

    // 绘制粒子信息
    const startX = width - 200
    const startY = 30
    ctx.fillStyle = '#4444ff'
    ctx.font = '14px Arial'
    ctx.fillText('粒子信息:', startX, startY)

    this.state.particles.forEach((particle, index) => {
      if (index < 3) {
        const y = startY + (index + 1) * 20
        ctx.fillStyle = particle.color
        ctx.fillText(
          `粒子${index + 1}: E = ${particle.energy.toFixed(2)}, m = ${particle.mass.toFixed(2)}`,
          startX,
          y
        )
      }
    })
  }

  getParticleColor(index) {
    const colors = ['rgba(102, 126, 234, 1)', 'rgba(118, 75, 162, 1)', 'rgba(255, 102, 0, 1)']
    return colors[index % colors.length]
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
window.HelixSpacetimeEquation = HelixSpacetimeEquation
console.log('🔄 三维螺旋时空方程可视化模块加载完成')
