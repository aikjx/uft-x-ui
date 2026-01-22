// 核力场方程可视化模块
// 功能: 实现核力场方程的高级可视化，包括强核力、弱核力等

class NuclearForceEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      g: 1, // 强相互作用耦合常数
      G_F: 1.1663787e-5, // 费米常数
      scale: 1,
      showStrongNuclearForce: true,
      showWeakNuclearForce: true,
      showQuarkDistribution: true,
      showGluonField: true,
      strongForce: [],
      weakForce: [],
      nucleons: [],
      quarks: [],
      gluons: [],
      mesonExchange: [],
      animationSpeed: 1,
      totalNucleons: 0
    }
    this.init()
  }

  init() {
    console.log('⚛️ 核力场方程可视化初始化')
    this.createNucleons()
    this.createQuarks()
    this.createStrongForce()
    this.createWeakForce()
    this.createGluons()
    this.createMesonExchange()
  }

  createNucleons() {
    // 创建测试核子
    for (let i = 0; i < 6; i++) {
      const nucleon = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          z: 0
        },
        type: i % 2 === 0 ? 'proton' : 'neutron',
        color: this.getNucleonColor(i),
        radius: 8,
        bindingEnergy: 0
      }
      this.state.nucleons.push(nucleon)
    }
  }

  createQuarks() {
    // 创建测试夸克
    for (let i = 0; i < 18; i++) {
      const quark = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 40,
          z: 0
        },
        flavor: ['up', 'down', 'strange'][i % 3],
        color: this.getQuarkColor(i),
        charge: [2 / 3, -1 / 3, -1 / 3][i % 3],
        radius: 3
      }
      this.state.quarks.push(quark)
    }
  }

  createStrongForce() {
    // 创建强核力数据
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      this.state.strongForce.push({
        id: i,
        angle,
        strength: 0,
        position: {
          x: Math.cos(angle) * 50,
          y: Math.sin(angle) * 50,
          z: 0
        },
        color: 'rgba(255, 102, 0, 0.6)'
      })
    }
  }

  createWeakForce() {
    // 创建弱核力数据
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      this.state.weakForce.push({
        id: i,
        angle,
        strength: 0,
        position: {
          x: Math.cos(angle) * 30,
          y: Math.sin(angle) * 30,
          z: 0
        },
        color: 'rgba(68, 255, 255, 0.6)'
      })
    }
  }

  createGluons() {
    // 创建胶子
    for (let i = 0; i < 12; i++) {
      this.state.gluons.push({
        id: i,
        path: [],
        color: this.getGluonColor(i)
      })
    }
  }

  createMesonExchange() {
    // 创介子交换
    for (let i = 0; i < 8; i++) {
      this.state.mesonExchange.push({
        id: i,
        path: [],
        color: 'rgba(255, 255, 68, 0.6)'
      })
    }
  }

  calculateStrongForce(r) {
    // 强核力势函数
    const a = 1
    const b = 0.1
    return (this.state.g * Math.exp(-b * r)) / r
  }

  calculateWeakForce(r) {
    // 弱核力势函数
    const M_W = 80.379 // W玻色子质量
    const r0 = 0.1 // 弱力作用范围
    return (this.state.G_F * Math.exp(-r / r0)) / (r * r)
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed

    // 更新核子
    this.updateNucleons()

    // 更新夸克
    this.updateQuarks()

    // 更新强核力
    this.updateStrongForce()

    // 更新弱核力
    this.updateWeakForce()

    // 更新胶子
    this.updateGluons()

    // 更新介子交换
    this.updateMesonExchange()

    // 计算总核子数
    this.calculateTotalNucleons()
  }

  updateNucleons() {
    this.state.nucleons.forEach(nucleon => {
      // 核子振动
      nucleon.position.x += Math.sin(this.state.time * 0.3 + nucleon.id) * 0.3
      nucleon.position.y += Math.cos(this.state.time * 0.3 + nucleon.id) * 0.3

      // 核子间相互作用
      this.state.nucleons.forEach(other => {
        if (nucleon.id !== other.id) {
          const dx = other.position.x - nucleon.position.x
          const dy = other.position.y - nucleon.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 20) {
            const force = this.calculateStrongForce(distance)
            const fx = (force * dx) / distance
            const fy = (force * dy) / distance
            nucleon.position.x -= fx * 0.01
            nucleon.position.y -= fy * 0.01
          }
        }
      })
    })
  }

  updateQuarks() {
    this.state.quarks.forEach(quark => {
      // 夸克在核子内的运动
      const angle = this.state.time * 0.5 + quark.id
      const radius = 10 + Math.sin(this.state.time * 0.3 + quark.id) * 2
      quark.position.x = Math.cos(angle) * radius
      quark.position.y = Math.sin(angle) * radius
    })
  }

  updateStrongForce() {
    this.state.strongForce.forEach((force, index) => {
      force.strength = Math.sin(this.state.time * 0.4 + index) * 0.5 + 0.5
      force.position.x = Math.cos(force.angle + this.state.time * 0.1) * (50 + force.strength * 10)
      force.position.y = Math.sin(force.angle + this.state.time * 0.1) * (50 + force.strength * 10)
    })
  }

  updateWeakForce() {
    this.state.weakForce.forEach((force, index) => {
      force.strength = Math.sin(this.state.time * 0.2 + index) * 0.3 + 0.3
      force.position.x = Math.cos(force.angle + this.state.time * 0.05) * (30 + force.strength * 5)
      force.position.y = Math.sin(force.angle + this.state.time * 0.05) * (30 + force.strength * 5)
    })
  }

  updateGluons() {
    this.state.gluons.forEach(gluon => {
      gluon.path = []
      const startAngle = this.state.time * 0.6 + gluon.id
      const endAngle = startAngle + Math.PI * 1.5

      for (let i = 0; i < 20; i++) {
        const angle = startAngle + ((endAngle - startAngle) * i) / 19
        const radius = 20 + Math.sin(this.state.time * 0.4 + gluon.id) * 5
        gluon.path.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        })
      }
    })
  }

  updateMesonExchange() {
    this.state.mesonExchange.forEach((meson, index) => {
      meson.path = []
      const startNucleon = this.state.nucleons[index % this.state.nucleons.length]
      const endNucleon = this.state.nucleons[(index + 1) % this.state.nucleons.length]

      for (let i = 0; i < 10; i++) {
        const t = i / 9
        const x = startNucleon.position.x + (endNucleon.position.x - startNucleon.position.x) * t
        const y = startNucleon.position.y + (endNucleon.position.y - startNucleon.position.y) * t
        const offset = Math.sin(this.state.time * 2 + index) * 5
        meson.path.push({
          x: x + Math.sin(t * Math.PI) * offset,
          y: y + Math.cos(t * Math.PI) * offset
        })
      }
    })
  }

  calculateTotalNucleons() {
    this.state.totalNucleons = this.state.nucleons.length
  }

  getNucleonColor(index) {
    const colors = ['rgba(255, 102, 0, 0.8)', 'rgba(68, 102, 255, 0.8)']
    return colors[index % colors.length]
  }

  getQuarkColor(index) {
    const colors = ['rgba(255, 0, 0, 0.8)', 'rgba(0, 255, 0, 0.8)', 'rgba(0, 0, 255, 0.8)']
    return colors[index % colors.length]
  }

  getGluonColor(index) {
    const colors = ['rgba(255, 255, 0, 0.6)', 'rgba(255, 0, 255, 0.6)', 'rgba(0, 255, 255, 0.6)']
    return colors[index % colors.length]
  }

  render(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制强核力场
    if (this.state.showStrongNuclearForce) {
      this.renderStrongForce(ctx, centerX, centerY)
    }

    // 绘制弱核力场
    if (this.state.showWeakNuclearForce) {
      this.renderWeakForce(ctx, centerX, centerY)
    }

    // 绘制介子交换
    this.renderMesonExchange(ctx, centerX, centerY)

    // 绘制胶子场
    if (this.state.showGluonField) {
      this.renderGluons(ctx, centerX, centerY)
    }

    // 绘制夸克分布
    if (this.state.showQuarkDistribution) {
      this.renderQuarks(ctx, centerX, centerY)
    }

    // 绘制核子
    this.renderNucleons(ctx, centerX, centerY)

    // 绘制信息
    this.renderInfo(ctx, width, height)
  }

  renderStrongForce(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)'
    ctx.lineWidth = 1

    this.state.strongForce.forEach(force => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + force.position.x * this.state.scale,
        centerY + force.position.y * this.state.scale
      )
      ctx.stroke()
    })
  }

  renderWeakForce(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(68, 255, 255, 0.3)'
    ctx.lineWidth = 1

    this.state.weakForce.forEach(force => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + force.position.x * this.state.scale,
        centerY + force.position.y * this.state.scale
      )
      ctx.stroke()
    })
  }

  renderGluons(ctx, centerX, centerY) {
    this.state.gluons.forEach(gluon => {
      ctx.strokeStyle = gluon.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      gluon.path.forEach((point, index) => {
        const x = centerX + point.x * this.state.scale
        const y = centerY + point.y * this.state.scale
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    })
  }

  renderMesonExchange(ctx, centerX, centerY) {
    this.state.mesonExchange.forEach(meson => {
      ctx.strokeStyle = meson.color
      ctx.lineWidth = 2
      ctx.beginPath()
      meson.path.forEach((point, index) => {
        const x = centerX + point.x * this.state.scale
        const y = centerY + point.y * this.state.scale
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    })
  }

  renderQuarks(ctx, centerX, centerY) {
    this.state.quarks.forEach(quark => {
      ctx.fillStyle = quark.color
      ctx.beginPath()
      ctx.arc(
        centerX + quark.position.x * this.state.scale,
        centerY + quark.position.y * this.state.scale,
        quark.radius * this.state.scale,
        0,
        Math.PI * 2
      )
      ctx.fill()
    })
  }

  renderNucleons(ctx, centerX, centerY) {
    this.state.nucleons.forEach(nucleon => {
      ctx.fillStyle = nucleon.color
      ctx.beginPath()
      ctx.arc(
        centerX + nucleon.position.x * this.state.scale,
        centerY + nucleon.position.y * this.state.scale,
        nucleon.radius * this.state.scale,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // 绘制核子类型标签
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        nucleon.type.charAt(0).toUpperCase(),
        centerX + nucleon.position.x * this.state.scale,
        centerY + nucleon.position.y * this.state.scale
      )
    })
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const info = [
      `核子数: ${this.state.totalNucleons}`,
      `强核力: ${this.state.showStrongNuclearForce ? '显示' : '隐藏'}`,
      `弱核力: ${this.state.showWeakNuclearForce ? '显示' : '隐藏'}`,
      `夸克分布: ${this.state.showQuarkDistribution ? '显示' : '隐藏'}`,
      `胶子场: ${this.state.showGluonField ? '显示' : '隐藏'}`,
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

  toggleStrongNuclearForce() {
    this.state.showStrongNuclearForce = !this.state.showStrongNuclearForce
  }

  toggleWeakNuclearForce() {
    this.state.showWeakNuclearForce = !this.state.showWeakNuclearForce
  }

  toggleQuarkDistribution() {
    this.state.showQuarkDistribution = !this.state.showQuarkDistribution
  }

  toggleGluonField() {
    this.state.showGluonField = !this.state.showGluonField
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NuclearForceEquation
} else if (typeof window !== 'undefined') {
  window.NuclearForceEquation = NuclearForceEquation
}
