import * as THREE from 'three'

/**
 * 创建背景网格效果
 * @param scene Three.js场景
 */
export const createBackgroundGrid = (scene: THREE.Scene) => {
  // 网格配置
  const gridSize = 10
  const gridDivisions = 10
  const gridColor = 0x222233
  const gridLineColor = 0x111122

  // 创建主网格
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridLineColor)
  scene.add(gridHelper)

  // 创建辅助网格（X轴旋转）
  const gridHelperX = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridLineColor)
  gridHelperX.rotation.x = Math.PI / 2
  scene.add(gridHelperX)

  // 创建辅助网格（Y轴旋转）
  const gridHelperY = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridLineColor)
  gridHelperY.rotation.y = Math.PI / 2
  scene.add(gridHelperY)
}

/**
 * 添加粒子系统
 * @param scene Three.js场景
 * @param count 粒子数量
 * @param color 粒子颜色
 */
export const addParticles = (scene: THREE.Scene, count: number, color: number) => {
  // 根据设备性能和屏幕大小动态调整粒子数量
  const isMobile =
    window.innerWidth < 768 ||
    navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)
  const screenSize = window.innerWidth * window.innerHeight
  const performanceFactor = isMobile ? 0.2 : screenSize < 1000000 ? 0.5 : 1.0
  const adjustedCount = Math.floor(count * performanceFactor)

  // 限制最大粒子数量
  const maxParticles = isMobile ? 300 : 800
  const finalParticleCount = Math.min(adjustedCount, maxParticles)

  // 如果粒子数量为0，直接返回
  if (finalParticleCount <= 0) return

  // 尝试使用GPU粒子系统，如果可用
  try {
    // 动态导入GPU粒子系统
    import('@/visualization/GPUParticleSystem').then(({ GPUParticleSystem }) => {
      // 创建GPU粒子系统
      const particleSystem = new GPUParticleSystem({
        particleCount: finalParticleCount,
        color: new THREE.Color(color),
        opacity: 0.6,
        size: isMobile ? 0.02 : 0.04
      })
      
      // 添加到场景中
      scene.add(particleSystem.getMesh())
    }).catch((error) => {
      console.error('Failed to load GPU particle system, falling back to default:', error)
      // 如果GPU粒子系统加载失败，使用默认粒子系统
      createDefaultParticles(scene, finalParticleCount, color, isMobile)
    })
  } catch (error) {
    console.error('Failed to use GPU particle system, falling back to default:', error)
    // 如果GPU粒子系统不可用，使用默认粒子系统
    createDefaultParticles(scene, finalParticleCount, color, isMobile)
  }
}

/**
 * 创建默认粒子系统（用于不支持GPU粒子系统的情况）
 */
const createDefaultParticles = (scene: THREE.Scene, count: number, color: number, isMobile: boolean) => {
  const particleGeometry = new THREE.BufferGeometry()
  const posArray = new Float32Array(count * 3)
  const colorArray = new Float32Array(count * 3)
  
  // 生成粒子位置和颜色
  const colorObj = new THREE.Color(color)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    
    // 使用更高效的随机数生成
    posArray[i3] = (Math.random() - 0.5) * 10
    posArray[i3 + 1] = (Math.random() - 0.5) * 10
    posArray[i3 + 2] = (Math.random() - 0.5) * 10
    
    // 为每个粒子分配颜色
    colorArray[i3] = colorObj.r
    colorArray[i3 + 1] = colorObj.g
    colorArray[i3 + 2] = colorObj.b
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
  
  // 优化粒子材质
  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.02 : 0.04, // 移动设备上使用更小的粒子
    vertexColors: true, // 使用顶点颜色
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending, // 使用加法混合，提高视觉效果
    depthWrite: false, // 禁用深度写入，提高性能
    sizeAttenuation: true, // 启用大小衰减，提高视觉效果
    fog: true, // 启用雾化，提高视觉效果
    alphaTest: 0.1, // 启用alpha测试，减少过度绘制
    map: new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    ), // 使用简单的圆形纹理
    anisotropy: 1 // 使用默认各向异性过滤
  })
  
  const particlesMesh = new THREE.Points(particleGeometry, particleMaterial)
  particlesMesh.frustumCulled = false // 禁用视锥体剔除，确保粒子始终可见
  
  // 添加粒子动画
  particlesMesh.userData = {
    animate: (deltaTime: number) => {
      const positions = particleGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // 为粒子添加简单的波动动画
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i * 0.1) * 0.005
      }
      particleGeometry.attributes.position.needsUpdate = true
    }
  }
  
  scene.add(particlesMesh)
}

/**
 * 创建光锥
 * @param scene Three.js场景
 */
export const createLightCone = (scene: THREE.Scene) => {
  const geometry = new THREE.ConeGeometry(2, 4, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.3,
    wireframe: true
  })
  const cone = new THREE.Mesh(geometry, material)
  cone.position.z = 2
  scene.add(cone)

  const invertedCone = new THREE.Mesh(geometry, material)
  invertedCone.position.z = -2
  invertedCone.rotation.z = Math.PI
  scene.add(invertedCone)
}

/**
 * 创建时间箭头
 * @param scene Three.js场景
 */
export const createTimeArrow = (scene: THREE.Scene) => {
  const arrowGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8)
  const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff })
  const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
  arrow.position.z = 2
  scene.add(arrow)
}

/**
 * 创建螺旋线
 * @param scene Three.js场景
 */
export const createHelixVisualization = (scene: THREE.Scene) => {
  // 创建主螺旋线
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(0, 2, 2),
    new THREE.Vector3(-1, 1, 3),
    new THREE.Vector3(0, 0, 4),
    new THREE.Vector3(1, -1, 5),
    new THREE.Vector3(0, -2, 6),
    new THREE.Vector3(-1, -1, 7),
    new THREE.Vector3(0, 0, 8)
  ])

  const points = curve.getPoints(200)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  // 创建顶点颜色数组
  const colors = new Float32Array(points.length * 3)
  for (let i = 0; i < points.length; i++) {
    const color = new THREE.Color(`hsl(${(i / points.length) * 360}, 70%, 60%)`)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // 使用LineBasicMaterial创建主螺旋线
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  })

  const curveObject = new THREE.Line(geometry, material)

  // 添加螺旋线动画
  curveObject.userData = {
    animate: (deltaTime: number) => {
      curveObject.rotation.y += deltaTime * 0.0005
      curveObject.rotation.z += deltaTime * 0.0003
    }
  }

  scene.add(curveObject)

  // 创建多个辅助螺旋线，增强视觉效果
  for (let i = 1; i < 4; i++) {
    const scale = 0.3 * i
    const auxiliaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1 * scale, 1 * scale, 1),
      new THREE.Vector3(0, 2 * scale, 2),
      new THREE.Vector3(-1 * scale, 1 * scale, 3),
      new THREE.Vector3(0, 0, 4),
      new THREE.Vector3(1 * scale, -1 * scale, 5),
      new THREE.Vector3(0, -2 * scale, 6),
      new THREE.Vector3(-1 * scale, -1 * scale, 7),
      new THREE.Vector3(0, 0, 8)
    ])

    const auxiliaryPoints = auxiliaryCurve.getPoints(100)
    const auxiliaryGeometry = new THREE.BufferGeometry().setFromPoints(auxiliaryPoints)

    const auxiliaryMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xffffff),
      linewidth: 1,
      transparent: true,
      opacity: 0.3
    })

    const auxiliaryCurveObject = new THREE.Line(auxiliaryGeometry, auxiliaryMaterial)
    auxiliaryCurveObject.userData = {
      animate: (deltaTime: number) => {
        auxiliaryCurveObject.rotation.y += deltaTime * 0.0005
        auxiliaryCurveObject.rotation.z += deltaTime * 0.0003
        auxiliaryCurveObject.position.y = Math.sin(Date.now() * 0.001 + i) * 0.2
      }
    }

    scene.add(auxiliaryCurveObject)
  }

  // 添加中心发光点
  const glowGeometry = new THREE.SphereGeometry(0.2, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
    emissive: 0x00ffff
  })
  const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
  glowSphere.userData = {
    animate: (deltaTime: number) => {
      glowSphere.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.2)
      glowMaterial.opacity = 0.6 + Math.sin(Date.now() * 0.002) * 0.3
    }
  }
  scene.add(glowSphere)
}

/**
 * 创建场线可视化
 * @param scene Three.js场景
 */
export const createFieldLinesVisualization = (scene: THREE.Scene) => {
  const fieldLinesCount = 20

  for (let i = 0; i < fieldLinesCount; i++) {
    // 随机角度和半径
    const angle = (i / fieldLinesCount) * Math.PI * 2
    const radius = 1 + Math.random() * 2
    const zPosition = (Math.random() - 0.5) * 3

    // 创建圆形场线
    const curve = new THREE.EllipseCurve(
      0,
      0, // 中心
      radius,
      radius, // x, y半径
      0,
      Math.PI * 2, // 起始角度，终止角度
      false, // 顺时针方向
      angle // 旋转角度
    )

    const points = curve.getPoints(100)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    // 创建顶点颜色数组，实现渐变效果
    const colors = new Float32Array(points.length * 3)
    const baseColor = new THREE.Color(`hsl(${(angle / (Math.PI * 2)) * 360}, 70%, 60%)`)
    for (let j = 0; j < points.length; j++) {
      colors[j * 3] = baseColor.r
      colors[j * 3 + 1] = baseColor.g
      colors[j * 3 + 2] = baseColor.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 1,
      transparent: true,
      opacity: 0.8
    })

    const line = new THREE.Line(geometry, material)
    line.position.z = zPosition

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        // 旋转场线
        line.rotation.z += deltaTime * 0.0003 * (radius / 3)
        line.rotation.x += deltaTime * 0.0001 * (radius / 3)

        // 添加场线的呼吸效果
        const scale = 1 + Math.sin(Date.now() * 0.001 + i) * 0.1
        line.scale.setScalar(scale)

        // 添加透明度变化
        material.opacity = 0.6 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }

    scene.add(line)
  }

  // 添加中心球体
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
    emissive: 0xff00ff,
    emissiveIntensity: 0.5,
    specular: 0xffffff,
    shininess: 100
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

  // 添加球体动画
  sphere.userData = {
    animate: (deltaTime: number) => {
      sphere.rotation.y += deltaTime * 0.001
      sphere.rotation.x += deltaTime * 0.0005

      // 添加球体的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      sphere.scale.setScalar(scale)

      // 添加透明度变化
      sphereMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  scene.add(sphere)

  // 添加球体周围的发光效果
  const glowGeometry = new THREE.SphereGeometry(0.8, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })
  const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
  sphere.add(glowSphere)

  // 添加发光效果动画
  glowSphere.userData = {
    animate: (deltaTime: number) => {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.3
      glowSphere.scale.setScalar(scale)
      glowMaterial.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.2
    }
  }
}

/**
 * 创建数学符号可视化
 * @param scene Three.js场景
 */
export const createMathSymbolVisualization = (scene: THREE.Scene) => {
  // 创建粒子云 - 优化性能
  const isMobile =
    window.innerWidth < 768 ||
    navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)
  const particleCount = isMobile ? 300 : 600

  const particleGeometry = new THREE.BufferGeometry()
  const posArray = new Float32Array(particleCount * 3)
  const colorArray = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    // 创建更有规律的粒子分布，形成球体效果
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    const r = Math.random() * 6 + 2 // 半径在2-8之间

    posArray[i3] = r * Math.sin(phi) * Math.cos(theta)
    posArray[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    posArray[i3 + 2] = r * Math.cos(phi)

    // 为每个粒子分配随机颜色，形成彩虹效果
    const color = new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`)
    colorArray[i3] = color.r
    colorArray[i3 + 1] = color.g
    colorArray[i3 + 2] = color.b
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.03 : 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.1,
    map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
  })

  const particlesMesh = new THREE.Points(particleGeometry, particleMaterial)
  particlesMesh.frustumCulled = false

  // 添加粒子动画
  particlesMesh.userData = {
    animate: (deltaTime: number) => {
      const positions = particleGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // 为粒子添加轻微的波动效果
        positions[i] += Math.sin(Date.now() * 0.0001 + i) * 0.003
        positions[i + 1] += Math.cos(Date.now() * 0.0001 + i) * 0.003
        positions[i + 2] += Math.sin(Date.now() * 0.0002 + i) * 0.003
      }
      particleGeometry.attributes.position.needsUpdate = true

      // 旋转粒子云
      particlesMesh.rotation.y += deltaTime * 0.0002
      particlesMesh.rotation.x += deltaTime * 0.0001
    }
  }

  scene.add(particlesMesh)

  // 添加数学符号表示（使用简单的几何体组合表示）
  const symbolGroup = new THREE.Group()

  // 创建一个更复杂的"∇"符号表示，带有发光效果
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff00ff,
    linewidth: 3,
    transparent: true,
    opacity: 0.9,
    emissive: 0xff00ff,
    emissiveIntensity: 0.5
  })

  // 创建一个更复杂的符号，包含多条交叉线
  const createSymbolLine = (start: THREE.Vector3, end: THREE.Vector3) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const line = new THREE.Line(geometry, lineMaterial)
    return line
  }

  // 创建多条交叉线，形成复杂的数学符号
  symbolGroup.add(
    createSymbolLine(new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, -1, 0)),
    createSymbolLine(new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, -1, 0)),
    createSymbolLine(new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0, -1.5, 0)),
    createSymbolLine(new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(1.5, 0, 0))
  )

  // 添加中心球体
  const centerSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32)
  const centerSphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.8,
    emissive: 0xff00ff,
    emissiveIntensity: 0.8,
    specular: 0xffffff,
    shininess: 100
  })
  const centerSphere = new THREE.Mesh(centerSphereGeometry, centerSphereMaterial)
  symbolGroup.add(centerSphere)

  // 添加符号组动画
  symbolGroup.userData = {
    animate: (deltaTime: number) => {
      // 旋转符号组
      symbolGroup.rotation.y += deltaTime * 0.0005
      symbolGroup.rotation.z += deltaTime * 0.0003

      // 添加符号组的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.15
      symbolGroup.scale.setScalar(scale)

      // 调整中心球体的发光强度
      centerSphereMaterial.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.4
    }
  }

  symbolGroup.position.set(0, 0, 0)
  scene.add(symbolGroup)

  // 添加环绕符号的光效
  const ringGeometry = new THREE.RingGeometry(2, 2.2, 64)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI / 2 // 水平放置
  symbolGroup.add(ring)

  // 添加另一个垂直的环绕光效
  const ring2 = ring.clone()
  ring2.rotation.z = Math.PI / 2
  symbolGroup.add(ring2)

  // 添加环形光效动画
  ring.userData = {
    animate: (deltaTime: number) => {
      ring.rotation.z += deltaTime * 0.0005
      ringMaterial.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.3
    }
  }

  ring2.userData = {
    animate: (deltaTime: number) => {
      ring2.rotation.y += deltaTime * 0.0005
      ringMaterial.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.3
    }
  }
}

/**
 * 创建时空可视化
 * @param scene Three.js场景
 */
export const createSpaceTimeVisualization = (scene: THREE.Scene) => {
  // 创建坐标轴
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // 创建光锥
  createLightCone(scene)

  // 创建时间箭头
  createTimeArrow(scene)

  // 添加粒子点
  addParticles(scene, 300, 0x00ffff)
}

/**
 * 创建质量定义方程可视化
 * @param scene Three.js场景
 */
export const createMassDefinitionVisualization = (scene: THREE.Scene) => {
  // 创建质量几何化表示
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffcc,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.6,
    specular: 0xffffff,
    shininess: 100
  })
  const massSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(massSphere)

  // 添加质量动画
  massSphere.userData = {
    animate: (deltaTime: number) => {
      massSphere.rotation.y += deltaTime * 0.001
      massSphere.rotation.x += deltaTime * 0.0005

      // 添加质量球体的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      massSphere.scale.setScalar(scale)

      // 添加透明度变化
      sphereMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  // 添加质量周围的几何线条，表示空间几何变化
  const geometryLinesCount = 12
  for (let i = 0; i < geometryLinesCount; i++) {
    const angle = (i / geometryLinesCount) * Math.PI * 2
    const radius = 1.5
    const height = 2

    // 创建螺旋线表示空间几何变化
    const points = []
    for (let j = 0; j < 50; j++) {
      const t = j / 49
      const y = (t - 0.5) * height
      const r = radius + Math.sin(t * Math.PI * 2) * 0.3
      const x = r * Math.cos(angle + t * Math.PI * 2)
      const z = r * Math.sin(angle + t * Math.PI * 2)
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7000ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加线条动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.y += deltaTime * 0.0003
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0x00ffcc)
}

/**
 * 创建引力场定义方程可视化
 * @param scene Three.js场景
 */
export const createGravitationalFieldVisualization = (scene: THREE.Scene) => {
  // 创建引力场源
  const sourceGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const sourceMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffcc,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.7,
    specular: 0xffffff,
    shininess: 100
  })
  const sourceSphere = new THREE.Mesh(sourceGeometry, sourceMaterial)
  scene.add(sourceSphere)

  // 添加源球体动画
  sourceSphere.userData = {
    animate: (deltaTime: number) => {
      sourceSphere.rotation.y += deltaTime * 0.001
      sourceSphere.rotation.x += deltaTime * 0.0005

      // 添加球体的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      sourceSphere.scale.setScalar(scale)

      // 添加透明度变化
      sourceMaterial.opacity = 0.8 + Math.sin(Date.now() * 0.003) * 0.2
    }
  }

  // 创建引力场线
  const fieldLinesCount = 16
  for (let i = 0; i < fieldLinesCount; i++) {
    const angle = (i / fieldLinesCount) * Math.PI * 2
    const length = 4

    // 创建引力场线
    const points = []
    for (let j = 0; j < 100; j++) {
      const t = j / 99
      const r = 0.5 + t * length
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      const z = Math.sin(t * Math.PI * 2) * 0.5
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7000ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.z += deltaTime * 0.0002
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 300, 0x00ffcc)
}

/**
 * 创建电荷定义方程可视化
 * @param scene Three.js场景
 */
export const createChargeDefinitionVisualization = (scene: THREE.Scene) => {
  // 创建电荷旋转表示
  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 32, 100)
  const torusMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
    emissive: 0xff00ff,
    emissiveIntensity: 0.6,
    specular: 0xffffff,
    shininess: 100
  })
  const chargeTorus = new THREE.Mesh(torusGeometry, torusMaterial)
  scene.add(chargeTorus)

  // 添加电荷动画
  chargeTorus.userData = {
    animate: (deltaTime: number) => {
      chargeTorus.rotation.y += deltaTime * 0.002
      chargeTorus.rotation.x += deltaTime * 0.001

      // 添加电荷环的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      chargeTorus.scale.setScalar(scale)

      // 添加透明度变化
      torusMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  // 添加旋转电场线
  const fieldLinesCount = 8
  for (let i = 0; i < fieldLinesCount; i++) {
    const angle = (i / fieldLinesCount) * Math.PI * 2
    const radius = 1.5

    // 创建旋转电场线
    const points = []
    for (let j = 0; j < 50; j++) {
      const t = j / 49
      const r = radius + t * 2
      const x = r * Math.cos(angle + t * Math.PI * 4)
      const y = r * Math.sin(angle + t * Math.PI * 4)
      const z = Math.sin(t * Math.PI * 2) * 0.5
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.y += deltaTime * 0.0005
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0xff00ff)
}

/**
 * 创建电场定义方程可视化
 * @param scene Three.js场景
 */
export const createElectricFieldVisualization = (scene: THREE.Scene) => {
  // 创建电场源
  const sourceGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const sourceMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
    emissive: 0xff00ff,
    emissiveIntensity: 0.7,
    specular: 0xffffff,
    shininess: 100
  })
  const sourceSphere = new THREE.Mesh(sourceGeometry, sourceMaterial)
  scene.add(sourceSphere)

  // 添加源球体动画
  sourceSphere.userData = {
    animate: (deltaTime: number) => {
      sourceSphere.rotation.y += deltaTime * 0.001
      sourceSphere.rotation.x += deltaTime * 0.0005

      // 添加球体的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      sourceSphere.scale.setScalar(scale)

      // 添加透明度变化
      sourceMaterial.opacity = 0.8 + Math.sin(Date.now() * 0.003) * 0.2
    }
  }

  // 创建电场线
  const fieldLinesCount = 16
  for (let i = 0; i < fieldLinesCount; i++) {
    const angle = (i / fieldLinesCount) * Math.PI * 2

    // 创建径向电场线
    const points = []
    for (let j = 0; j < 100; j++) {
      const t = j / 99
      const r = 0.5 + t * 3
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      const z = Math.sin(t * Math.PI * 4) * 0.3
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.z += deltaTime * 0.0002
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 300, 0x00ffff)
}

/**
 * 创建磁场定义方程可视化
 * @param scene Three.js场景
 */
export const createMagneticFieldVisualization = (scene: THREE.Scene) => {
  // 创建磁场源
  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 32, 100)
  const torusMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffcc,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.6,
    specular: 0xffffff,
    shininess: 100
  })
  const magneticTorus = new THREE.Mesh(torusGeometry, torusMaterial)
  magneticTorus.rotation.x = Math.PI / 2
  scene.add(magneticTorus)

  // 添加磁场动画
  magneticTorus.userData = {
    animate: (deltaTime: number) => {
      magneticTorus.rotation.y += deltaTime * 0.002
      magneticTorus.rotation.x += deltaTime * 0.0005

      // 添加磁场环的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      magneticTorus.scale.setScalar(scale)

      // 添加透明度变化
      torusMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  // 创建磁场线
  const fieldLinesCount = 8
  for (let i = 0; i < fieldLinesCount; i++) {
    const angle = (i / fieldLinesCount) * Math.PI * 2
    const radius = 1.5

    // 创建环绕磁场线
    const points = []
    for (let j = 0; j < 100; j++) {
      const t = j / 99
      const r = radius + Math.sin(t * Math.PI * 2) * 0.5
      const x = r * Math.cos(angle + t * Math.PI * 4)
      const y = r * Math.sin(angle + t * Math.PI * 4)
      const z = (t - 0.5) * 3
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7000ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.y += deltaTime * 0.0005
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0x7000ff)
}

/**
 * 创建空间波动方程可视化
 * @param scene Three.js场景
 */
export const createSpaceWaveVisualization = (scene: THREE.Scene) => {
  // 创建波动网格
  const waveGeometry = new THREE.PlaneGeometry(5, 5, 50, 50)
  const waveMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
    emissive: 0x00ffff,
    emissiveIntensity: 0.5,
    specular: 0xffffff,
    shininess: 100
  })
  const wavePlane = new THREE.Mesh(waveGeometry, waveMaterial)
  wavePlane.rotation.x = -Math.PI / 2
  scene.add(wavePlane)

  // 添加波动动画
  wavePlane.userData = {
    animate: (deltaTime: number) => {
      const positions = waveGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // 为波动网格添加波动效果
        positions[i + 2] = Math.sin(Date.now() * 0.001 + positions[i] * 0.5 + positions[i + 1] * 0.5) * 0.3
      }
      waveGeometry.attributes.position.needsUpdate = true

      // 旋转波动平面
      wavePlane.rotation.y += deltaTime * 0.0002
    }
  }

  // 添加多个波动平面
  for (let i = 1; i < 3; i++) {
    const scale = 0.7 * i
    const wavePlaneClone = wavePlane.clone()
    wavePlaneClone.scale.setScalar(scale)
    wavePlaneClone.position.y = i * 1.5
    scene.add(wavePlaneClone)

    // 添加克隆波动平面动画
    wavePlaneClone.userData = {
      animate: (deltaTime: number) => {
        const cloneGeometry = wavePlaneClone.geometry as THREE.PlaneGeometry
        const positions = cloneGeometry.attributes.position.array as Float32Array
        for (let j = 0; j < positions.length; j += 3) {
          // 为克隆波动网格添加波动效果，相位不同
          positions[j + 2] = Math.sin(Date.now() * 0.001 + j * 0.1 + i) * 0.3
        }
        cloneGeometry.attributes.position.needsUpdate = true

        // 旋转克隆波动平面
        wavePlaneClone.rotation.y += deltaTime * 0.0002 + i * 0.0001
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 300, 0x00ffff)
}

/**
 * 创建能量方程可视化
 * @param scene Three.js场景
 */
export const createEnergyEquationVisualization = (scene: THREE.Scene) => {
  // 创建能量球体
  const energyGeometry = new THREE.SphereGeometry(1, 32, 32)
  const energyMaterial = new THREE.MeshPhongMaterial({
    color: 0x7000ff,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
    emissive: 0x7000ff,
    emissiveIntensity: 0.6,
    specular: 0xffffff,
    shininess: 100
  })
  const energySphere = new THREE.Mesh(energyGeometry, energyMaterial)
  scene.add(energySphere)

  // 添加能量动画
  energySphere.userData = {
    animate: (deltaTime: number) => {
      energySphere.rotation.y += deltaTime * 0.001
      energySphere.rotation.x += deltaTime * 0.0005

      // 添加能量球体的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      energySphere.scale.setScalar(scale)

      // 添加透明度变化
      energyMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  // 添加能量环绕光效
  const ringGeometry = new THREE.RingGeometry(2, 2.2, 64)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  const energyRing = new THREE.Mesh(ringGeometry, ringMaterial)
  energyRing.rotation.x = Math.PI / 2
  scene.add(energyRing)

  // 添加能量环动画
  energyRing.userData = {
    animate: (deltaTime: number) => {
      energyRing.rotation.z += deltaTime * 0.0005
      ringMaterial.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.3
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0x7000ff)
}

/**
 * 创建光速飞行器动力学方程可视化
 * @param scene Three.js场景
 */
export const createLightSpeedCraftVisualization = (scene: THREE.Scene) => {
  // 创建飞行器表示
  const craftGeometry = new THREE.ConeGeometry(0.5, 1.5, 32)
  const craftMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffcc,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.7,
    specular: 0xffffff,
    shininess: 100
  })
  const craft = new THREE.Mesh(craftGeometry, craftMaterial)
  craft.rotation.x = Math.PI
  scene.add(craft)

  // 添加飞行器动画
  craft.userData = {
    animate: (deltaTime: number) => {
      craft.rotation.y += deltaTime * 0.001
      craft.rotation.z += deltaTime * 0.0005

      // 添加飞行器的推进效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05
      craft.scale.setScalar(scale)
    }
  }

  // 创建推进效果
  const thrustGeometry = new THREE.ConeGeometry(0.8, 2, 32)
  const thrustMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.6,
    wireframe: true
  })
  const thrust = new THREE.Mesh(thrustGeometry, thrustMaterial)
  thrust.position.z = -1
  thrust.rotation.x = Math.PI
  craft.add(thrust)

  // 添加推进效果动画
  thrust.userData = {
    animate: (deltaTime: number) => {
      // 添加推进效果的脉动
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.3
      thrust.scale.setScalar(scale)

      // 添加透明度变化
      thrustMaterial.opacity = 0.4 + Math.sin(Date.now() * 0.01) * 0.4
    }
  }

  // 创建光速轨迹
  const trailGeometry = new THREE.BufferGeometry()
  const trailPoints = []
  for (let i = 0; i < 50; i++) {
    const t = i / 49
    const x = Math.sin(t * Math.PI * 2) * 0.2
    const y = Math.cos(t * Math.PI * 2) * 0.2
    const z = -t * 5
    trailPoints.push(new THREE.Vector3(x, y, z))
  }
  trailGeometry.setFromPoints(trailPoints)
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 2,
    transparent: true,
    opacity: 0.6
  })
  const trail = new THREE.Line(trailGeometry, trailMaterial)
  scene.add(trail)

  // 添加轨迹动画
  trail.userData = {
    animate: (deltaTime: number) => {
      trail.rotation.y += deltaTime * 0.0005
      trailMaterial.opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.4
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0x00ffcc)
}

/**
 * 创建核力场定义方程可视化
 * @param scene Three.js场景
 */
export const createNuclearForceVisualization = (scene: THREE.Scene) => {
  // 创建核力场源
  const nucleusGeometry = new THREE.SphereGeometry(0.8, 32, 32)
  const nucleusMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
    emissive: 0xff00ff,
    emissiveIntensity: 0.7,
    specular: 0xffffff,
    shininess: 100
  })
  const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
  scene.add(nucleus)

  // 添加核力场源动画
  nucleus.userData = {
    animate: (deltaTime: number) => {
      nucleus.rotation.y += deltaTime * 0.001
      nucleus.rotation.x += deltaTime * 0.0005

      // 添加核力场源的呼吸效果
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15
      nucleus.scale.setScalar(scale)

      // 添加透明度变化
      nucleusMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3
    }
  }

  // 创建核力场线
  const fieldLinesCount = 12
  for (let i = 0; i < fieldLinesCount; i++) {
    const angle = (i / fieldLinesCount) * Math.PI * 2
    const radius = 1.2

    // 创建核力场线
    const points = []
    for (let j = 0; j < 100; j++) {
      const t = j / 49
      const r = radius + Math.sin(t * Math.PI * 4) * 0.3
      const x = r * Math.cos(angle + t * Math.PI * 2)
      const y = r * Math.sin(angle + t * Math.PI * 2)
      const z = Math.sin(t * Math.PI * 2) * 0.5
      points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // 添加场线动画
    line.userData = {
      animate: (deltaTime: number) => {
        line.rotation.y += deltaTime * 0.0005
        line.rotation.x += deltaTime * 0.0002
        lineMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
      }
    }
  }

  // 添加粒子效果
  addParticles(scene, 400, 0x00ffcc)
}