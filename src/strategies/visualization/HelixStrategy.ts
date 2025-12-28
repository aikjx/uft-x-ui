import * as THREE from 'three'
import { VisualizationStrategy } from './VisualizationStrategy'

interface HelixParams {
  radius: number
  pitch: number
  speed: number
  count: number
  showCylinder: boolean
  showParticles: boolean
  showCore: boolean
  autoRotate: boolean
}

export default class HelixStrategy implements VisualizationStrategy {
  private params: HelixParams = {
    radius: 5.0,
    pitch: 2.0,
    speed: 1.0,
    count: 8,
    showCylinder: true,
    showParticles: true,
    showCore: true,
    autoRotate: true
  }

  private helixLines: THREE.Line[] = []
  private helixParticles: THREE.Points[] = []
  private rings: THREE.Mesh[] = []
  private cylinder: THREE.Mesh | null = null
  private wireframe: THREE.LineSegments | null = null
  private core: THREE.Group | null = null
  private stars: THREE.Points | null = null

  private time: number = 0

  createVisualization(scene: THREE.Scene, params?: any): void {
    // 合并默认参数和用户参数
    this.params = { ...this.params, ...params }

    // 创建星空背景
    this.createStars(scene)

    // 创建圆柱骨架
    this.createCylinder(scene)

    // 创建螺旋线
    this.createHelix(scene)

    // 创建粒子
    this.createParticles(scene)

    // 创建核心
    this.createCore(scene)
  }

  updateVisualization(deltaTime: number, animationSpeed: number = 1.0): void {
    this.time += 0.01 * this.params.speed * animationSpeed

    // 更新核心
    if (this.core && this.params.showCore) {
      this.updateCore()
    }

    // 更新圆柱
    this.updateCylinder()

    // 更新螺旋线
    this.updateHelix()

    // 更新粒子
    this.updateParticles()

    // 更新星空 - 添加闪烁效果
    if (this.stars) {
      this.stars.rotation.y += 0.0002
      this.stars.rotation.x += 0.0001

      // 星星闪烁效果
      const positions = this.stars.geometry.attributes.position.array as Float32Array
      const sizes = this.stars.geometry.attributes.size.array as Float32Array
      const twinkles = this.stars.geometry.attributes.twinkle.array as Float32Array

      for (let i = 0; i < sizes.length; i++) {
        // 基于正弦函数实现闪烁效果
        const twinkleFactor = Math.sin(this.time * twinkles[i]) * 0.5 + 0.5
        sizes[i] = twinkleFactor * (Math.random() * 2 + 0.5)
      }

      this.stars.geometry.attributes.size.needsUpdate = true
    }
  }

  // 创建星空背景
  private createStars(scene: THREE.Scene): void {
    const starsGeometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []
    const twinkles: number[] = []

    // 增加星点数量，分为不同层次
    const totalStars = 5000

    for (let i = 0; i < totalStars; i++) {
      const radius = Math.random() * 800
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      positions.push(x, y, z)

      // 根据距离设置不同的颜色和亮度
      const distanceFactor = radius / 800
      const color = new THREE.Color()

      if (distanceFactor < 0.3) {
        // 近星星更亮，颜色更丰富
        color.setHSL(Math.random() * 0.6, 1, 0.7)
      } else if (distanceFactor < 0.7) {
        // 中距离星星
        color.setHSL(Math.random() * 0.4 + 0.5, 0.9, 0.6)
      } else {
        // 远距离星星更暗
        color.setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.5)
      }

      colors.push(color.r, color.g, color.b)

      // 星星大小变化
      const size = Math.random() * 2 + 0.5 * (1 - distanceFactor)
      sizes.push(size)

      // 闪烁频率
      twinkles.push(Math.random() * 5 + 1)
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    starsGeometry.setAttribute('twinkle', new THREE.Float32BufferAttribute(twinkles, 1))

    const starsMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      // 添加星星纹理
      map: this.createParticleTexture()
    })

    this.stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(this.stars)
  }

  // 创建圆柱骨架
  private createCylinder(scene: THREE.Scene): void {
    // 清理旧对象
    if (this.cylinder) scene.remove(this.cylinder)
    if (this.wireframe) scene.remove(this.wireframe)
    this.rings.forEach(r => scene.remove(r))
    this.rings = []

    const height = 40
    const geometry = new THREE.CylinderGeometry(
      this.params.radius,
      this.params.radius,
      height,
      64,
      20,
      true
    )

    // 创建圆柱
    this.cylinder = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        emissive: 0x00ff88,
        emissiveIntensity: 0.3
      })
    )
    scene.add(this.cylinder)

    // 创建线框
    this.wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7
      })
    )
    scene.add(this.wireframe)

    // 创建环形装饰
    for (let i = -5; i <= 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(this.params.radius - 0.08, this.params.radius + 0.08, 128),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.5 + i * 0.05, 1, 0.5),
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      )
      ring.rotation.x = Math.PI / 2
      ring.position.y = i * 4
      ring.userData = { idx: i }
      this.rings.push(ring)
      scene.add(ring)
    }
  }

  // 创建螺旋线
  private createHelix(scene: THREE.Scene): void {
    // 清理旧对象
    this.helixLines.forEach(h => scene.remove(h))
    this.helixLines = []

    const height = 40
    const turns = height / this.params.pitch

    for (let i = 0; i < this.params.count; i++) {
      const points: THREE.Vector3[] = []
      const angle0 = (i / this.params.count) * Math.PI * 2

      for (let j = 0; j <= 300; j++) {
        const t = j / 300
        const y = (t - 0.5) * height
        const a = angle0 + t * turns * Math.PI * 2
        // 增强螺旋线的动态变化，添加更复杂的半径变化
        const r = this.params.radius + Math.sin(t * 15 + i) * 0.2 + Math.sin(t * 5 + i * 2) * 0.1
        points.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)))
      }

      // 使用LineSegments替代LineBasicMaterial，添加发光效果
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(i / this.params.count, 1, 0.6),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      })

      const line = new THREE.Line(geometry, material)
      line.userData = { idx: i, hue: i / this.params.count }
      this.helixLines.push(line)
      scene.add(line)

      // 添加第二条更细的螺旋线，形成双线效果
      const thinPoints: THREE.Vector3[] = []
      for (let j = 0; j <= 300; j += 5) {
        const t = j / 300
        const y = (t - 0.5) * height
        const a = angle0 + t * turns * Math.PI * 2 + Math.PI / 2
        const r = this.params.radius * 0.9 + Math.sin(t * 12 + i) * 0.15
        thinPoints.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)))
      }

      const thinGeometry = new THREE.BufferGeometry().setFromPoints(thinPoints)
      const thinMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((i / this.params.count + 0.2) % 1, 1, 0.8),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        linewidth: 1
      })

      const thinLine = new THREE.Line(thinGeometry, thinMaterial)
      thinLine.userData = { idx: i, hue: (i / this.params.count + 0.2) % 1, type: 'thin' }
      this.helixLines.push(thinLine)
      scene.add(thinLine)
    }
  }

  // 创建粒子
  private createParticles(scene: THREE.Scene): void {
    // 清理旧对象
    this.helixParticles.forEach(p => scene.remove(p))
    this.helixParticles = []

    const height = 40
    const turns = height / this.params.pitch

    for (let i = 0; i < this.params.count; i++) {
      const particleCount = 100 // 增加粒子数量
      const geometry = new THREE.BufferGeometry()
      const positions: number[] = []
      const colors: number[] = []
      const sizes: number[] = []
      const lifetimes: number[] = [] // 粒子生命周期
      const speeds: number[] = [] // 粒子速度

      const angle0 = (i / this.params.count) * Math.PI * 2
      const color = new THREE.Color().setHSL(i / this.params.count, 1, 0.6)

      for (let j = 0; j < particleCount; j++) {
        const t = j / particleCount
        const y = (t - 0.5) * height
        const a = angle0 + t * turns * Math.PI * 2
        // 添加粒子位置变化
        const r = this.params.radius + Math.sin(t * 8 + i) * 0.3

        positions.push(r * Math.cos(a), y, r * Math.sin(a))
        colors.push(color.r, color.g, color.b)
        sizes.push(Math.random() * 0.5 + 0.3) // 增大粒子尺寸变化范围
        lifetimes.push(Math.random() * 2 + 1) // 1-3秒生命周期
        speeds.push(Math.random() * 0.5 + 0.2) // 粒子速度
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
      geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1))
      geometry.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1))

      const particles = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size: 0.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          // 添加粒子发光效果
          map: this.createParticleTexture()
        })
      )
      particles.userData = {
        angle0,
        idx: i,
        hue: i / this.params.count,
        // 为每个粒子添加随机偏移
        offsets: Array.from({ length: particleCount }, () => Math.random() * Math.PI * 2)
      }
      this.helixParticles.push(particles)
      scene.add(particles)
    }
  }

  // 创建粒子纹理
  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!

    // 创建径向渐变粒子纹理
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  // 创建核心
  private createCore(scene: THREE.Scene): void {
    // 清理旧对象
    if (this.core) scene.remove(this.core)

    this.core = new THREE.Group()

    // 核心球体 - 使用更高精度的几何体
    const coreMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 5), // 增加细分级别
      new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 1.5, // 增强发光强度
        transparent: true,
        opacity: 0.95,
        shininess: 100,
        specular: 0xffffff
      })
    )
    this.core.add(coreMesh)

    // 增强发光层效果
    for (let i = 0; i < 5; i++) {
      // 增加发光层数
      const glow = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5 + i * 0.4, 3),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.15 + i * 0.08, 1, 0.5),
          transparent: true,
          opacity: 0.3 - i * 0.05,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending
        })
      )
      glow.userData = { layer: i }
      this.core.add(glow)
    }

    // 添加能量环效果
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(2.5 + i * 0.8, 2.6 + i * 0.8, 128)
      const ring = new THREE.Mesh(
        ringGeometry,
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.1 + i * 0.1, 1, 0.6),
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      )
      ring.rotation.x = Math.PI / 2 + (i * Math.PI) / 3
      ring.userData = { ring: i }
      this.core.add(ring)
    }

    // 添加动态粒子环
    const particleRingGeometry = new THREE.BufferGeometry()
    const particleCount = 100
    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 3.5
      positions.push(radius * Math.cos(angle), 0, radius * Math.sin(angle))
      const color = new THREE.Color().setHSL(0.1 + Math.random() * 0.2, 1, 0.6)
      colors.push(color.r, color.g, color.b)
      sizes.push(Math.random() * 0.3 + 0.1)
    }

    particleRingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    particleRingGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    particleRingGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    const particleRing = new THREE.Points(
      particleRingGeometry,
      new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: this.createParticleTexture()
      })
    )
    particleRing.userData = {
      type: 'particleRing',
      offsets: Array.from({ length: particleCount }, () => Math.random() * Math.PI * 2)
    }
    this.core.add(particleRing)

    scene.add(this.core)
  }

  // 更新核心
  private updateCore(): void {
    if (!this.core) return

    // 更新核心球体 - 增强动态效果
    const coreMesh = this.core.children[0]
    coreMesh.rotation.x += 0.02
    coreMesh.rotation.y += 0.025
    const scale = 1 + Math.sin(this.time * 3.5) * 0.2 + Math.sin(this.time * 1.5) * 0.1
    coreMesh.scale.set(scale, scale, scale)
    // 添加脉冲效果
    coreMesh.material.opacity = 0.9 + Math.sin(this.time * 5) * 0.1

    // 更新发光层 - 增强动态效果
    for (let i = 1; i <= 5; i++) {
      const glow = this.core.children[i]
      glow.rotation.x -= 0.01 * i
      glow.rotation.y += 0.015 * i
      const glowScale = 1 + Math.sin(this.time * 4 + i * 0.5) * 0.2
      glow.scale.set(glowScale, glowScale, glowScale)
      // 添加呼吸效果
      glow.material.opacity = (0.3 - i * 0.05) * (0.8 + Math.sin(this.time * 3 + i) * 0.3)
      // 动态颜色变化
      glow.material.color.setHSL((0.15 + i * 0.08 + Math.sin(this.time * 2) * 0.1) % 1, 1, 0.5)
    }

    // 更新能量环
    for (let i = 6; i <= 8; i++) {
      const ring = this.core.children[i]
      ring.rotation.z += 0.04 + (i - 6) * 0.02
      const ringScale = 1 + Math.sin(this.time * 5 + i) * 0.15
      ring.scale.set(ringScale, ringScale, ringScale)
      // 能量环颜色变化
      ring.material.color.setHSL((0.1 + (i - 6) * 0.1 + Math.sin(this.time * 3) * 0.15) % 1, 1, 0.6)
      ring.material.opacity = 0.5 + Math.sin(this.time * 4 + (i - 6) * 0.5) * 0.3
    }

    // 更新动态粒子环
    const particleRing = this.core.children[9]
    particleRing.rotation.y += 0.01
    particleRing.rotation.x += 0.005

    const positions = particleRing.geometry.attributes.position.array as Float32Array
    const colors = particleRing.geometry.attributes.color.array as Float32Array
    const sizes = particleRing.geometry.attributes.size.array as Float32Array
    const particleCount = positions.length / 3

    for (let j = 0; j < particleCount; j++) {
      const angle =
        ((j / particleCount + this.time * 0.1 + particleRing.userData.offsets[j]) % 1) * Math.PI * 2
      const radius = 3.5 + Math.sin(this.time * 2 + j) * 0.3

      positions[j * 3] = radius * Math.cos(angle)
      positions[j * 3 + 2] = radius * Math.sin(angle)

      // 粒子上下波动
      positions[j * 3 + 1] = Math.sin(this.time * 3 + j) * 0.2

      // 粒子颜色变化
      const hue = (0.1 + Math.sin(this.time * 2 + j) * 0.2) % 1
      const color = new THREE.Color().setHSL(hue, 1, 0.6)
      colors[j * 3] = color.r
      colors[j * 3 + 1] = color.g
      colors[j * 3 + 2] = color.b

      // 粒子大小变化
      sizes[j] =
        (0.2 + Math.sin(this.time * 4 + j) * 0.2) * (0.8 + Math.sin(this.time * 2 + j) * 0.3)
    }

    particleRing.geometry.attributes.position.needsUpdate = true
    particleRing.geometry.attributes.color.needsUpdate = true
    particleRing.geometry.attributes.size.needsUpdate = true
  }

  // 更新圆柱
  private updateCylinder(): void {
    if (this.cylinder && this.wireframe) {
      this.cylinder.visible = this.params.showCylinder
      this.wireframe.visible = this.params.showCylinder
    }

    this.rings.forEach((ring, i) => {
      ring.visible = this.params.showCylinder
      if (this.params.showCylinder) {
        const scale = 1 + Math.sin(this.time * 3 + i * 0.3) * 0.08
        ring.scale.set(scale, scale, 1)
        const hue = (0.5 + i * 0.05 + this.time * 0.1) % 1
        ring.material.color.setHSL(hue, 1, 0.5)
        ring.material.opacity = 0.5 + Math.sin(this.time * 4 + i * 0.5) * 0.2
        ring.rotation.z += 0.005
      }
    })
  }

  // 更新螺旋线
  private updateHelix(): void {
    this.helixLines.forEach((line, i) => {
      const hue = (i / this.params.count + this.time * 0.15) % 1
      line.material.color.setHSL(hue, 1, 0.6)
      line.material.opacity = 0.85 + Math.sin(this.time * 2.5 + i * 0.5) * 0.15
    })
  }

  // 更新粒子
  private updateParticles(): void {
    this.helixParticles.forEach(p => {
      p.visible = this.params.showParticles
      if (this.params.showParticles) {
        const positions = p.geometry.attributes.position.array as Float32Array
        const colors = p.geometry.attributes.color.array as Float32Array
        const sizes = p.geometry.attributes.size.array as Float32Array
        const lifetimes = p.geometry.attributes.lifetime.array as Float32Array
        const speeds = p.geometry.attributes.speed.array as Float32Array

        const height = 40
        const turns = height / this.params.pitch
        const particleCount = positions.length / 3

        for (let j = 0; j < particleCount; j++) {
          // 粒子生命周期管理
          const particleTime = (this.time * speeds[j] + p.userData.offsets[j]) % 1
          const t = particleTime
          const y = (t - 0.5) * height
          const a = p.userData.angle0 + t * turns * Math.PI * 2

          // 增强粒子的动态运动效果
          const rVariation =
            Math.sin(t * 20 + this.time * 3 + j) * 0.2 + Math.cos(t * 10 + this.time * 2) * 0.1
          const r = this.params.radius + rVariation

          // 添加粒子的上下波动
          const yVariation = Math.sin(t * 5 + this.time * 1.5) * 0.5

          positions[j * 3] = r * Math.cos(a)
          positions[j * 3 + 1] = y + yVariation
          positions[j * 3 + 2] = r * Math.sin(a)

          // 动态颜色变化，增强视觉效果
          const baseHue = (p.userData.idx / this.params.count + this.time * 0.15) % 1
          const colorVariation = Math.sin(t * 8 + this.time * 2) * 0.1
          const hue = (baseHue + colorVariation) % 1
          const brightness = 0.5 + Math.sin(t * 4 + this.time) * 0.3
          const color = new THREE.Color().setHSL(hue, 1, brightness)

          colors[j * 3] = color.r
          colors[j * 3 + 1] = color.g
          colors[j * 3 + 2] = color.b

          // 粒子大小随时间变化
          const sizeVariation = Math.sin(t * 6 + this.time * 1.5) * 0.3
          sizes[j] = (0.4 + sizeVariation) * (0.8 + Math.sin(t * 3) * 0.2)
        }

        p.geometry.attributes.position.needsUpdate = true
        p.geometry.attributes.color.needsUpdate = true
        p.geometry.attributes.size.needsUpdate = true
      }
    })
  }

  // 更新参数
  updateParams(params: Partial<HelixParams>): void {
    this.params = { ...this.params, ...params }
  }

  // 获取当前参数
  getParams(): HelixParams {
    return { ...this.params }
  }

  // 清理资源
  cleanup(): void {
    // 清理星空背景
    if (this.stars) {
      this.stars.geometry.dispose()
      if (Array.isArray(this.stars.material)) {
        this.stars.material.forEach(material => material.dispose())
      } else {
        this.stars.material.dispose()
      }
    }

    // 清理圆柱
    if (this.cylinder) {
      this.cylinder.geometry.dispose()
      if (Array.isArray(this.cylinder.material)) {
        this.cylinder.material.forEach(material => material.dispose())
      } else {
        this.cylinder.material.dispose()
      }
    }

    // 清理线框
    if (this.wireframe) {
      this.wireframe.geometry.dispose()
      if (Array.isArray(this.wireframe.material)) {
        this.wireframe.material.forEach(material => material.dispose())
      } else {
        this.wireframe.material.dispose()
      }
    }

    // 清理环形装饰
    this.rings.forEach(ring => {
      ring.geometry.dispose()
      if (Array.isArray(ring.material)) {
        ring.material.forEach(material => material.dispose())
      } else {
        ring.material.dispose()
      }
    })

    // 清理螺旋线
    this.helixLines.forEach(line => {
      line.geometry.dispose()
      if (Array.isArray(line.material)) {
        line.material.forEach(material => material.dispose())
      } else {
        line.material.dispose()
      }
    })

    // 清理粒子
    this.helixParticles.forEach(particles => {
      particles.geometry.dispose()
      if (Array.isArray(particles.material)) {
        particles.material.forEach(material => material.dispose())
      } else {
        particles.material.dispose()
      }
    })

    // 清理核心
    if (this.core) {
      this.core.traverse((object: THREE.Object3D) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Points
        ) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }

    // 清空数组
    this.helixLines = []
    this.helixParticles = []
    this.rings = []
  }
}
