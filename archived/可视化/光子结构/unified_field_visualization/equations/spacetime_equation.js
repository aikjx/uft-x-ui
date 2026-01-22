// 时空同一化方程可视化模块
// 功能: 实现时空同一化方程的高级可视化，包括4D时空网格、光锥可视化等

class SpacetimeEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      c: 299792458, // 光速
      scale: 1,
      showLightCone: true,
      showSpacetimeGrid: true,
      showWorldLines: true,
      showRelativisticEffects: true,
      showSpacetimeCurvature: true,
      showMultipleFrames: true,
      particles: [],
      trailLength: 100,
      trails: [],
      referenceFrames: [],
      curvature: 0,
      animationSpeed: 1
    }
    this.init()
  }

  init() {
    console.log('🌌 时空同一化方程可视化初始化')
    this.createParticles()
    this.createReferenceFrames()
  }

  createParticles() {
    // 创建测试粒子
    for (let i = 0; i < 10; i++) {
      const particle = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        },
        velocity: {
          x: (Math.random() - 0.5) * 0.1 * this.state.c,
          y: (Math.random() - 0.5) * 0.1 * this.state.c,
          z: (Math.random() - 0.5) * 0.1 * this.state.c
        },
        mass: 1,
        charge: Math.random() > 0.5 ? 1 : -1,
        restMass: 1,
        gamma: 1,
        color: this.getParticleColor(i),
        acceleration: { x: 0, y: 0, z: 0 }
      }
      this.state.particles.push(particle)
      this.state.trails.push([])
    }
  }

  createReferenceFrames() {
    // 创建多个参考系
    for (let i = 0; i < 3; i++) {
      this.state.referenceFrames.push({
        id: i,
        velocity: {
          x: (i - 1) * 0.1 * this.state.c,
          y: 0,
          z: 0
        },
        color: this.getFrameColor(i),
        timeOffset: 0
      })
    }
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed

    // 更新参考系
    this.updateReferenceFrames(deltaTime)

    // 更新粒子
    this.state.particles.forEach((particle, index) => {
      this.updateParticle(particle, deltaTime)
      this.updateTrail(particle, index)
    })

    // 更新时空曲率
    this.updateSpacetimeCurvature()
  }

  updateParticle(particle, deltaTime) {
    // 计算相对论因子
    const vSquared =
      particle.velocity.x * particle.velocity.x +
      particle.velocity.y * particle.velocity.y +
      particle.velocity.z * particle.velocity.z
    particle.gamma = 1 / Math.sqrt(1 - vSquared / (this.state.c * this.state.c))

    // 相对论质量
    particle.mass = particle.restMass * particle.gamma

    // 应用加速度
    particle.velocity.x += particle.acceleration.x * deltaTime
    particle.velocity.y += particle.acceleration.y * deltaTime
    particle.velocity.z += particle.acceleration.z * deltaTime

    // 限制速度不超过光速
    const speed = Math.sqrt(vSquared)
    if (speed > this.state.c) {
      const ratio = this.state.c / speed
      particle.velocity.x *= ratio
      particle.velocity.y *= ratio
      particle.velocity.z *= ratio
    }

    // 更新位置
    particle.position.x += particle.velocity.x * deltaTime
    particle.position.y += particle.velocity.y * deltaTime
    particle.position.z += particle.velocity.z * deltaTime

    // 应用时空同一化方程: r = ct
    const distance = Math.sqrt(
      particle.position.x * particle.position.x +
        particle.position.y * particle.position.y +
        particle.position.z * particle.position.z
    )
    const expectedDistance = this.state.c * this.state.time

    // 调整速度以保持时空同一化
    if (distance > 0) {
      const ratio = expectedDistance / distance
      particle.velocity.x *= ratio
      particle.velocity.y *= ratio
      particle.velocity.z *= ratio
    }

    // 添加随机加速度模拟力场
    particle.acceleration.x = (Math.random() - 0.5) * 0.1 * this.state.c
    particle.acceleration.y = (Math.random() - 0.5) * 0.1 * this.state.c
    particle.acceleration.z = (Math.random() - 0.5) * 0.1 * this.state.c
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

    // 绘制时空网格
    if (this.state.showSpacetimeGrid) {
      this.renderSpacetimeGrid(ctx, width, height)
    }

    // 绘制光锥
    if (this.state.showLightCone) {
      this.renderLightCone(ctx, width, height)
    }

    // 绘制世界线
    if (this.state.showWorldLines) {
      this.renderWorldLines(ctx, width, height)
    }

    // 绘制粒子
    this.renderParticles(ctx, width, height)

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height)
  }

  renderSpacetimeGrid(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const gridSize = 30
    const gridCount = 10

    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)'
    ctx.lineWidth = 1

    // 绘制空间网格
    for (let i = -gridCount; i <= gridCount; i++) {
      ctx.beginPath()
      ctx.moveTo(centerX + i * gridSize, centerY - gridCount * gridSize)
      ctx.lineTo(centerX + i * gridSize, centerY + gridCount * gridSize)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(centerX - gridCount * gridSize, centerY + i * gridSize)
      ctx.lineTo(centerX + gridCount * gridSize, centerY + i * gridSize)
      ctx.stroke()
    }

    // 绘制时间轴
    ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - gridCount * gridSize)
    ctx.lineTo(centerX, centerY + gridCount * gridSize)
    ctx.stroke()
    ctx.setLineDash([])
  }

  renderLightCone(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const coneSize = 150
    const time = this.state.time * 0.1

    // 绘制未来光锥
    ctx.strokeStyle = 'rgba(68, 255, 68, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + coneSize * Math.cos(time), centerY + coneSize * Math.sin(time))
    ctx.lineTo(centerX - coneSize * Math.cos(time), centerY + coneSize * Math.sin(time))
    ctx.closePath()
    ctx.stroke()

    // 绘制过去光锥
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.5)'
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + coneSize * Math.cos(time), centerY - coneSize * Math.sin(time))
    ctx.lineTo(centerX - coneSize * Math.cos(time), centerY - coneSize * Math.sin(time))
    ctx.closePath()
    ctx.stroke()
  }

  renderWorldLines(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 5

    this.state.trails.forEach((trail, index) => {
      if (trail.length < 2) return

      const particle = this.state.particles[index]
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 2
      ctx.beginPath()

      trail.forEach((point, i) => {
        const x = centerX + point.x * scale
        const y = centerY + point.y * scale
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
    const scale = 5

    this.state.particles.forEach(particle => {
      const x = centerX + particle.position.x * scale
      const y = centerY + particle.position.y * scale

      // 绘制粒子光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(0.5, particle.color.replace('1)', '0.5)'))
      gradient.addColorStop(1, particle.color.replace('1)', '0)'))
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()

      // 绘制粒子核心
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  renderSpacetimeCurvature(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 200;
    
    // 绘制曲率波纹
    const rippleCount = 5;
    for (let i = 1; i <= rippleCount; i++) {
      const radius = (i / rippleCount) * maxRadius;
      const opacity = 0.3 * (1 - i / rippleCount);
      const phase = this.state.time * 2 + i;
      const amplitude = Math.sin(phase) * 5;
      
      ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + amplitude, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderMultipleFrames(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.state.referenceFrames.forEach((frame, index) => {
      const offsetX = (index - 1) * 100;
      const frameCenterX = centerX + offsetX;
      
      // 绘制参考系边框
      ctx.strokeStyle = frame.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.rect(frameCenterX - 50, centerY - 50, 100, 100);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 绘制参考系时间
      ctx.fillStyle = frame.color;
      ctx.font = '12px Arial';
      ctx.fillText(`t' = ${frame.timeOffset.toFixed(2)}s`, frameCenterX - 45, centerY - 30);
    });
  }

  renderRelativisticEffects(ctx, width, height) {
    const startX = width - 200;
    const startY = 30;
    
    // 绘制相对论效应信息
    ctx.fillStyle = '#ff6600';
    ctx.font = '14px Arial';
    ctx.fillText('相对论效应:', startX, startY);
    
    this.state.particles.forEach((particle, index) => {
      if (index < 3) {
        const y = startY + (index + 1) * 20;
        const v = Math.sqrt(particle.velocity.x * particle.velocity.x + 
                          particle.velocity.y * particle.velocity.y + 
                          particle.velocity.z * particle.velocity.z);
        const vRatio = v / this.state.c;
        
        ctx.fillStyle = particle.color;
        ctx.fillText(`粒子${index + 1}: γ = ${particle.gamma.toFixed(2)}, v/c = ${vRatio.toFixed(2)}`, startX, y);
      }
    });
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 2;
    
    const equation = '时空同一化方程: r = ct';
    ctx.strokeText(equation, 20, 30);
    ctx.fillText(equation, 20, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e6ff';
    ctx.fillText(`时间: ${this.state.time.toFixed(2)}s`, 20, 50);
    ctx.fillText(`光速: ${(this.state.c / 1000).toFixed(0)} km/s`, 20, 70);
    ctx.fillText(`粒子数: ${this.state.particles.length}`, 20, 90);
    ctx.fillText(`时空曲率: ${this.state.curvature.toFixed(4)}`, 20, 110);
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return `rgba(${r}, ${g}, ${b}, 1)`
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
window.SpacetimeEquation = SpacetimeEquation
console.log('🌌 时空同一化方程可视化模块加载完成')
