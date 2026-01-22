// 垂直原理可视化模块
// 功能: 实现垂直原理的高级可视化，包括动态垂直坐标系、几何变换动画等

class PerpendicularPrincipleEquation {
  constructor(canvasId) {
    this.canvasId = canvasId
    this.state = {
      time: 0,
      scale: 1,
      showCoordinateSystem: true,
      showPerpendicularVectors: true,
      showGeometricTransforms: true,
      showTensorVisualization: true,
      showDynamicEquilibrium: true,
      showVectorField: true,
      showDualVectors: true,
      showOrthogonalBasis: true,
      coordinateSystem: {
        x: { vector: { x: 1, y: 0, z: 0 }, color: '#ff4444', phase: 0 },
        y: { vector: { x: 0, y: 1, z: 0 }, color: '#44ff44', phase: 0 },
        z: { vector: { x: 0, y: 0, z: 1 }, color: '#4444ff', phase: 0 }
      },
      perpendicularVectors: [],
      tensorData: [],
      vectorField: [],
      orthogonalBasis: [],
      dualVectors: [],
      animationSpeed: 1,
      equilibriumState: 0
    }
    this.init()
  }

  init() {
    console.log('📐 垂直原理可视化初始化')
    this.createPerpendicularVectors()
    this.createTensorData()
    this.createVectorField()
    this.createOrthogonalBasis()
    this.createDualVectors()
  }

  createVectorField() {
    // 创建矢量场
    for (let i = 0; i < 25; i++) {
      const x = ((i % 5) - 2) * 40
      const y = (Math.floor(i / 5) - 2) * 40
      const vector = this.generateRandomVector()
      this.state.vectorField.push({
        id: i,
        position: { x, y, z: 0 },
        vector: this.normalizeVector(vector),
        color: this.getVectorFieldColor(i),
        strength: Math.random() * 0.8 + 0.2
      })
    }
  }

  createOrthogonalBasis() {
    // 创建正交基
    for (let i = 0; i < 3; i++) {
      const vectors = this.generateOrthogonalBasis()
      this.state.orthogonalBasis.push({
        id: i,
        vectors,
        position: {
          x: (i - 1) * 80,
          y: 0,
          z: 0
        },
        color: this.getBasisColor(i)
      })
    }
  }

  createDualVectors() {
    // 创建对偶矢量
    for (let i = 0; i < 6; i++) {
      const primary = this.generateRandomVector()
      const dual = this.calculateDualVector(primary)
      this.state.dualVectors.push({
        id: i,
        primary: this.normalizeVector(primary),
        dual: this.normalizeVector(dual),
        position: {
          x: (i - 2.5) * 60,
          y: -80,
          z: 0
        },
        color: this.getDualVectorColor(i)
      })
    }
  }

  createPerpendicularVectors() {
    // 创建相互垂直的矢量组
    for (let i = 0; i < 6; i++) {
      const vectors = this.generatePerpendicularVectors()
      this.state.perpendicularVectors.push({
        id: i,
        vectors,
        position: {
          x: (Math.random() - 0.5) * 150,
          y: (Math.random() - 0.5) * 150,
          z: 0
        },
        rotation: {
          x: Math.random() * Math.PI,
          y: Math.random() * Math.PI,
          z: Math.random() * Math.PI
        }
      })
    }
  }

  createTensorData() {
    // 创建张量可视化数据
    for (let i = 0; i < 9; i++) {
      this.state.tensorData.push({
        id: i,
        value: Math.random() * 2 - 1,
        position: {
          x: ((i % 3) - 1) * 10,
          y: (Math.floor(i / 3) - 1) * 10,
          z: 0
        }
      })
    }
  }

  generatePerpendicularVectors() {
    // 生成三个相互垂直的矢量
    const v1 = {
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5
    }

    const v2 = {
      x: -v1.y,
      y: v1.x,
      z: 0
    }

    const v3 = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    }

    return [this.normalizeVector(v1), this.normalizeVector(v2), this.normalizeVector(v3)]
  }

  normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
    if (length === 0) return { x: 0, y: 0, z: 0 }
    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length
    }
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed

    // 更新坐标系
    this.updateCoordinateSystem()

    // 更新垂直矢量
    this.updatePerpendicularVectors()

    // 更新张量数据
    this.updateTensorData()
  }

  updateCoordinateSystem() {
    const time = this.state.time

    // 更新X轴
    this.state.coordinateSystem.x.vector.x = Math.cos(time * 1.2)
    this.state.coordinateSystem.x.vector.y = Math.sin(time * 0.8)
    this.state.coordinateSystem.x.vector.z = Math.sin(time * 0.6)
    this.state.coordinateSystem.x.phase = time * 1.5

    // 更新Y轴（保持与X轴垂直）
    this.state.coordinateSystem.y.vector.x = -this.state.coordinateSystem.x.vector.y
    this.state.coordinateSystem.y.vector.y = this.state.coordinateSystem.x.vector.x
    this.state.coordinateSystem.y.vector.z = 0
    this.state.coordinateSystem.y.phase = time * 1.2

    // 更新Z轴（保持与X和Y轴垂直）
    this.state.coordinateSystem.z.vector.x =
      this.state.coordinateSystem.x.vector.y * this.state.coordinateSystem.y.vector.z -
      this.state.coordinateSystem.x.vector.z * this.state.coordinateSystem.y.vector.y
    this.state.coordinateSystem.z.vector.y =
      this.state.coordinateSystem.x.vector.z * this.state.coordinateSystem.y.vector.x -
      this.state.coordinateSystem.x.vector.x * this.state.coordinateSystem.y.vector.z
    this.state.coordinateSystem.z.vector.z =
      this.state.coordinateSystem.x.vector.x * this.state.coordinateSystem.y.vector.y -
      this.state.coordinateSystem.x.vector.y * this.state.coordinateSystem.y.vector.x
    this.state.coordinateSystem.z.phase = time * 0.9

    // 归一化
    this.state.coordinateSystem.x.vector = this.normalizeVector(
      this.state.coordinateSystem.x.vector
    )
    this.state.coordinateSystem.y.vector = this.normalizeVector(
      this.state.coordinateSystem.y.vector
    )
    this.state.coordinateSystem.z.vector = this.normalizeVector(
      this.state.coordinateSystem.z.vector
    )
  }

  updatePerpendicularVectors() {
    this.state.perpendicularVectors.forEach((group, index) => {
      group.rotation.x += 0.01 * this.state.animationSpeed
      group.rotation.y += 0.015 * this.state.animationSpeed
      group.rotation.z += 0.008 * this.state.animationSpeed
    })
  }

  updateTensorData() {
    this.state.tensorData.forEach((tensor, index) => {
      tensor.value = Math.sin(this.state.time + index) * 0.8 + 0.2
    })
  }

  render(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制动态平衡
    if (this.state.showDynamicEquilibrium) {
      this.renderDynamicEquilibrium(ctx, width, height)
    }

    // 绘制矢量场
    if (this.state.showVectorField) {
      this.renderVectorField(ctx, width, height)
    }

    // 绘制坐标系
    if (this.state.showCoordinateSystem) {
      this.renderCoordinateSystem(ctx, width, height)
    }

    // 绘制垂直矢量
    if (this.state.showPerpendicularVectors) {
      this.renderPerpendicularVectors(ctx, width, height)
    }

    // 绘制正交基
    if (this.state.showOrthogonalBasis) {
      this.renderOrthogonalBasis(ctx, width, height)
    }

    // 绘制对偶矢量
    if (this.state.showDualVectors) {
      this.renderDualVectors(ctx, width, height)
    }

    // 绘制几何变换
    if (this.state.showGeometricTransforms) {
      this.renderGeometricTransforms(ctx, width, height)
    }

    // 绘制张量可视化
    if (this.state.showTensorVisualization) {
      this.renderTensorVisualization(ctx, width, height)
    }

    // 绘制方程信息
    this.renderEquationInfo(ctx, width, height)
  }

  renderCoordinateSystem(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 50

    Object.values(this.state.coordinateSystem).forEach(axis => {
      const { vector, color, phase } = axis
      const pulse = 1 + Math.sin(phase) * 0.1

      const x = centerX + vector.x * scale * pulse
      const y = centerY + vector.y * scale * pulse

      // 绘制轴线
      ctx.strokeStyle = color
      ctx.lineWidth = 2 * pulse
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // 绘制箭头
      const angle = Math.atan2(y - centerY, x - centerX)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 8 * Math.cos(angle - 0.3), y - 8 * Math.sin(angle - 0.3))
      ctx.lineTo(x - 8 * Math.cos(angle + 0.3), y - 8 * Math.sin(angle + 0.3))
      ctx.closePath()
      ctx.fill()
    })
  }

  renderPerpendicularVectors(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 30

    this.state.perpendicularVectors.forEach((group, index) => {
      group.vectors.forEach((vector, vecIndex) => {
        const color = ['#ff4444', '#44ff44', '#4444ff'][vecIndex]
        const x = centerX + vector.x * scale + group.position.x
        const y = centerY + vector.y * scale + group.position.y

        // 绘制矢量
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(centerX + group.position.x, centerY + group.position.y)
        ctx.lineTo(x, y)
        ctx.stroke()

        // 绘制箭头
        const angle = Math.atan2(y - (centerY + group.position.y), x - (centerX + group.position.x))
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 6 * Math.cos(angle - 0.3), y - 6 * Math.sin(angle - 0.3))
        ctx.lineTo(x - 6 * Math.cos(angle + 0.3), y - 6 * Math.sin(angle + 0.3))
        ctx.closePath()
        ctx.fill()
      })
    })
  }

  renderGeometricTransforms(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const size = 80
    const time = this.state.time

    // 绘制旋转正方形
    ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + time
      const x = centerX + size * Math.cos(angle)
      const y = centerY + size * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
  }

  renderTensorVisualization(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const size = 20

    this.state.tensorData.forEach((tensor, index) => {
      const x = centerX + tensor.position.x
      const y = centerY + tensor.position.y
      const radius = Math.abs(tensor.value) * size
      const color = tensor.value >= 0 ? 'rgba(68, 255, 68, 0.6)' : 'rgba(255, 68, 68, 0.6)'

      // 绘制张量元素
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // 绘制数值
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(tensor.value.toFixed(1), x, y)
    })
  }

  renderDynamicEquilibrium(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const size = 100
    const time = this.state.time

    // 绘制平衡环
    ctx.strokeStyle = 'rgba(68, 255, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, size * (0.8 + 0.2 * this.state.equilibriumState), 0, Math.PI * 2)
    ctx.stroke()

    // 绘制平衡中心
    ctx.fillStyle = 'rgba(255, 255, 68, 0.8)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  renderVectorField(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 20

    this.state.vectorField.forEach(data => {
      const x = centerX + data.position.x
      const y = centerY + data.position.y
      const endX = x + data.vector.x * scale * data.strength
      const endY = y + data.vector.y * scale * data.strength

      ctx.strokeStyle = data.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      // 绘制箭头
      const angle = Math.atan2(endY - y, endX - x)
      ctx.fillStyle = data.color
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - 4 * Math.cos(angle - 0.3), endY - 4 * Math.sin(angle - 0.3))
      ctx.lineTo(endX - 4 * Math.cos(angle + 0.3), endY - 4 * Math.sin(angle + 0.3))
      ctx.closePath()
      ctx.fill()
    })
  }

  renderOrthogonalBasis(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 30

    this.state.orthogonalBasis.forEach(data => {
      const x = centerX + data.position.x
      const y = centerY + data.position.y

      data.vectors.forEach((vector, index) => {
        const color = ['#ff4444', '#44ff44', '#4444ff'][index]
        const endX = x + vector.x * scale
        const endY = y + vector.y * scale

        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        // 绘制箭头
        const angle = Math.atan2(endY - y, endX - x)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - 6 * Math.cos(angle - 0.3), endY - 6 * Math.sin(angle - 0.3))
        ctx.lineTo(endX - 6 * Math.cos(angle + 0.3), endY - 6 * Math.sin(angle + 0.3))
        ctx.closePath()
        ctx.fill()
      })
    })
  }

  renderDualVectors(ctx, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const scale = 25

    this.state.dualVectors.forEach(data => {
      const x = centerX + data.position.x
      const y = centerY + data.position.y

      // 绘制原始矢量
      const pX = x + data.primary.x * scale
      const pY = y + data.primary.y * scale
      ctx.strokeStyle = data.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(pX, pY)
      ctx.stroke()

      // 绘制对偶矢量
      const dX = x + data.dual.x * scale
      const dY = y + data.dual.y * scale
      ctx.strokeStyle = data.color.replace('1)', '0.5)')
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(dX, dY)
      ctx.stroke()
      ctx.setLineDash([])
    })
  }

  getVectorFieldColor(index) {
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(255, 102, 0, 0.8)',
      'rgba(68, 255, 68, 0.8)',
      'rgba(255, 68, 68, 0.8)'
    ]
    return colors[index % colors.length]
  }

  getBasisColor(index) {
    const colors = ['rgba(255, 102, 0, 0.8)', 'rgba(68, 255, 68, 0.8)', 'rgba(68, 68, 255, 0.8)']
    return colors[index % colors.length]
  }

  getDualVectorColor(index) {
    const colors = [
      'rgba(255, 102, 204, 0.8)',
      'rgba(102, 255, 204, 0.8)',
      'rgba(204, 102, 255, 0.8)',
      'rgba(255, 204, 102, 0.8)',
      'rgba(102, 204, 255, 0.8)',
      'rgba(204, 255, 102, 0.8)'
    ]
    return colors[index % colors.length]
  }

  renderEquationInfo(ctx, width, height) {
    ctx.fillStyle = '#ff6600'
    ctx.font = 'bold 16px Arial'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'
    ctx.lineWidth = 2

    const equation = '垂直原理核心: 几何垂直 ↔ 物理运动'
    ctx.strokeText(equation, 20, 30)
    ctx.fillText(equation, 20, 30)

    ctx.font = '12px Arial'
    ctx.fillStyle = '#e0e6ff'
    ctx.fillText('v旋² + v直² = c² (合速度恒为光速)', 20, 50)
    ctx.fillText('空间因垂直属性而以光速作螺旋运动', 20, 70)
    ctx.fillText('几何垂直状态等价于物理运动状态', 20, 90)
    ctx.fillText('正交性是自然界的基本对称性', 20, 110)
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
window.PerpendicularPrincipleEquation = PerpendicularPrincipleEquation
console.log('📐 垂直原理可视化模块加载完成')
