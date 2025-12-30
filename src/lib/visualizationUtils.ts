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

  // 添加多条交叉线，形成复杂的数学符号
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
