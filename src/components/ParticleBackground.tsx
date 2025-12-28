import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PointsMaterial, Vector3, Color } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ParticleBackgroundProps {
  className?: string
  particleCount?: number
  particleSize?: number
  particleColor?: number
  particleOpacity?: number
  enableMouseInteraction?: boolean
  enableAutoRotation?: boolean
  autoRotationSpeed?: number
  isActive?: boolean // 控制背景是否激活
  maxParticleCount?: number // 最大粒子数量
  minParticleCount?: number // 最小粒子数量
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  particleCount = 200, // 默认粒子数量
  particleSize = 1.2,
  particleColor = 0x4a6cf7,
  particleOpacity = 0.3,
  enableMouseInteraction = true,
  enableAutoRotation = true,
  autoRotationSpeed = 0.0003,
  isActive = true,
  maxParticleCount = 500, // 最大粒子数量
  minParticleCount = 50 // 最小粒子数量
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesCountRef = useRef(0)
  const particlePositionsRef = useRef<Float32Array>()
  const lastUpdateRef = useRef(Date.now())
  const [isMobile, setIsMobile] = useState(false)
  const fpsRef = useRef<number[]>([])
  const fpsUpdateTimeRef = useRef(Date.now())
  const performanceLevelRef = useRef(1) // 1-5，5为最高性能
  const spreadRef = useRef(0)

  // 检查是否为移动设备
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 鼠标移动处理 - 使用useCallback优化性能
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enableMouseInteraction) return

      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      mouseRef.current.x = (clientX / innerWidth) * 2 - 1
      mouseRef.current.y = -(clientY / innerHeight) * 2 + 1
    },
    [enableMouseInteraction]
  )

  // 窗口大小调整处理
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return

    const { innerWidth, innerHeight } = window
    cameraRef.current.aspect = innerWidth / innerHeight
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(innerWidth, innerHeight)
  }, [])

  // 计算设备性能等级
  const calculatePerformanceLevel = useCallback(() => {
    // 基础性能检测
    const isLowEndDevice =
      isMobile ||
      !('requestAnimationFrame' in window) ||
      typeof navigator === 'undefined' ||
      navigator.hardwareConcurrency < 4

    if (isLowEndDevice) {
      return 2
    }

    // 高级性能检测
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    let performanceLevel = 3

    if (gl) {
      // 检查WebGL扩展支持
      const extensions = gl.getSupportedExtensions()
      if (
        extensions?.includes('OES_texture_float') &&
        extensions?.includes('EXT_shader_texture_lod')
      ) {
        performanceLevel = 4
      }

      // 检查设备像素比
      if (window.devicePixelRatio <= 1) {
        performanceLevel++
      }
    }

    return Math.min(Math.max(performanceLevel, 1), 5)
  }, [isMobile])

  // 根据性能等级调整粒子数量
  const adjustParticleCount = useCallback(
    (performanceLevel: number) => {
      const baseCount = particleCount
      const multiplier = performanceLevel / 3

      let newCount = Math.floor(baseCount * multiplier)
      newCount = Math.max(minParticleCount, Math.min(maxParticleCount, newCount))

      // 移动设备进一步减少
      if (isMobile) {
        newCount = Math.floor(newCount * 0.5)
      }

      return newCount
    },
    [particleCount, minParticleCount, maxParticleCount, isMobile]
  )

  // 更新FPS统计
  const updateFPS = useCallback((deltaTime: number) => {
    fpsRef.current.push(1000 / deltaTime)

    // 只保留最近10个帧的数据
    if (fpsRef.current.length > 10) {
      fpsRef.current.shift()
    }

    // 每1秒重新计算性能等级
    const currentTime = Date.now()
    if (currentTime - fpsUpdateTimeRef.current > 1000) {
      const avgFPS = fpsRef.current.reduce((sum, fps) => sum + fps, 0) / fpsRef.current.length

      // 根据FPS调整性能等级
      if (avgFPS < 30 && performanceLevelRef.current > 1) {
        performanceLevelRef.current--
      } else if (avgFPS > 50 && performanceLevelRef.current < 5) {
        performanceLevelRef.current++
      }

      fpsUpdateTimeRef.current = currentTime
    }
  }, [])

  // 初始化场景
  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    // 计算性能等级和粒子数量
    const performanceLevel = calculatePerformanceLevel()
    performanceLevelRef.current = performanceLevel
    const actualParticleCount = adjustParticleCount(performanceLevel)
    const actualParticleSize = isMobile ? Math.max(1.5, particleSize * 0.8) : particleSize
    spreadRef.current = isMobile ? 800 : 1000

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 100)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: performanceLevel > 3, // 根据性能等级决定是否启用抗锯齿
      powerPreference: 'high-performance', // 优先考虑性能
      premultipliedAlpha: true // 优化透明度渲染
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceLevel > 3 ? 2 : 1.5)) // 根据性能等级调整像素比
    renderer.setClearColor(0x000000, 0) // 透明背景
    rendererRef.current = renderer

    // 优化渲染器性能
    renderer.shadowMap.enabled = false
    renderer.autoClear = false
    renderer.info.autoReset = false

    // 创建粒子几何体
    particlesCountRef.current = actualParticleCount
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(actualParticleCount * 3)
    const velocities = new Float32Array(actualParticleCount * 3)
    particlePositionsRef.current = positions

    // 初始化粒子位置和速度 - 使用更高效的分布算法
    for (let i = 0; i < actualParticleCount * 3; i += 3) {
      // 使用球面分布创建更均匀的粒子场
      const radius = Math.random() * spreadRef.current
      const theta = Math.random() * Math.PI * 2 // 方位角
      const phi = Math.random() * Math.PI // 极角

      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)

      // 初始化粒子速度，使用较小的随机值
      velocities[i] = (Math.random() - 0.5) * 0.01
      velocities[i + 1] = (Math.random() - 0.5) * 0.01
      velocities[i + 2] = (Math.random() - 0.5) * 0.01
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: actualParticleSize,
      color: particleColor,
      transparent: true,
      opacity: particleOpacity,
      sizeAttenuation: true,
      depthWrite: false, // 提高性能，减少深度测试
      blending: THREE.AdditiveBlending, // 更漂亮的发光效果
      vertexColors: false, // 禁用顶点颜色，提高性能
      fog: false // 禁用雾效，提高性能
    })

    // 创建粒子系统
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    particlesRef.current = particles

    // 添加轨道控制器
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enablePan = false
    controlsRef.current = controls

    // 鼠标交互
    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    // 动画循环 - 使用更高效的时间控制
    let lastRenderTime = 0
    let lastParticleUpdateTime = 0
    let lastStatsUpdateTime = 0
    
    // 根据性能等级调整更新频率
    const PARTICLE_UPDATE_RATE = performanceLevel > 3 ? 16 : performanceLevel > 2 ? 32 : 64 // 毫秒
    const STATS_UPDATE_RATE = 1000 // 每秒更新一次统计
    
    // 视锥体剔除优化：预计算相机视锥体边界
    const frustum = new THREE.Frustum()
    const cameraMatrix = new THREE.Matrix4()
    
    // 优化：使用相机视锥体剔除不可见粒子
    const isParticleInView = (particleIndex: number, positions: Float32Array): boolean => {
      if (!cameraRef.current) return true
      
      // 简单的视锥体剔除：检查粒子是否在相机视野范围内
      const x = positions[particleIndex * 3]
      const y = positions[particleIndex * 3 + 1]
      const z = positions[particleIndex * 3 + 2]
      
      // 快速检查：粒子距离相机的距离
      const distanceSquared = x * x + y * y + z * z
      if (distanceSquared > 2000000) return false // 距离太远，不可见
      
      // 更新视锥体
      cameraMatrix.multiplyMatrices(cameraRef.current.projectionMatrix, cameraRef.current.matrixWorldInverse)
      frustum.setFromProjectionMatrix(cameraMatrix)
      
      // 创建粒子位置向量（复用，避免垃圾回收）
      const particlePos = new THREE.Vector3(x, y, z)
      return frustum.containsPoint(particlePos)
    }
    
    // 优化：批量更新粒子位置
    const updateParticles = (positions: Float32Array, velocities: Float32Array, deltaTime: number) => {
      const particlesCount = particlesCountRef.current
      const spread = spreadRef.current * 0.5
      
      // 根据性能等级调整更新比例
      const updateRatio = performanceLevel > 3 ? 1.0 : performanceLevel > 2 ? 0.6 : 0.3
      const particlesToUpdate = Math.floor(particlesCount * updateRatio)
      
      // 优化：只更新视锥体内的粒子
      let updatedParticles = 0
      let particleIndex = 0
      
      while (updatedParticles < particlesToUpdate && particleIndex < particlesCount) {
        // 检查粒子是否在视野内
        if (isParticleInView(particleIndex, positions)) {
          const i = particleIndex * 3
          
          // 更新位置
          positions[i] += velocities[i] * deltaTime * 60
          positions[i + 1] += velocities[i + 1] * deltaTime * 60
          positions[i + 2] += velocities[i + 2] * deltaTime * 60
          
          // 边界检查和反弹
          if (Math.abs(positions[i]) > spread) {
            positions[i] *= -0.99
            velocities[i] *= -0.5
          }
          if (Math.abs(positions[i + 1]) > spread) {
            positions[i + 1] *= -0.99
            velocities[i + 1] *= -0.5
          }
          if (Math.abs(positions[i + 2]) > spread) {
            positions[i + 2] *= -0.99
            velocities[i + 2] *= -0.5
          }
          
          updatedParticles++
        }
        
        particleIndex++
      }
    }

    const animate = (timestamp: number) => {
      // 计算时间增量（秒）
      const deltaTime = (timestamp - lastRenderTime) / 1000
      lastRenderTime = timestamp
      
      // 只在必要时更新控制器
      if (controlsRef.current && controlsRef.current.enableDamping) {
        controlsRef.current.update()
      }

      // 自动旋转
      if (enableAutoRotation && particlesRef.current) {
        particlesRef.current.rotation.y += autoRotationSpeed * deltaTime * 60
      }

      // 鼠标交互效果
      if (enableMouseInteraction && particlesRef.current) {
        particlesRef.current.rotation.x += mouseRef.current.y * 0.0005 * deltaTime * 60
        particlesRef.current.rotation.y += mouseRef.current.x * 0.0005 * deltaTime * 60
      }

      // 更新粒子位置 - 基于时间间隔而非帧数
      if (timestamp - lastParticleUpdateTime >= PARTICLE_UPDATE_RATE) {
        if (particlesRef.current && particlePositionsRef.current) {
          const positions = particlePositionsRef.current
          
          // 批量更新粒子
          updateParticles(positions, velocities, deltaTime)
          
          // 标记位置需要更新
          particlesRef.current.geometry.attributes.position.needsUpdate = true
        }
        
        lastParticleUpdateTime = timestamp
      }

      // 更新FPS统计 - 每秒更新一次
      if (timestamp - lastStatsUpdateTime >= STATS_UPDATE_RATE) {
        updateFPS(deltaTime * 1000)
        lastStatsUpdateTime = timestamp
      }

      // 渲染场景
      if (rendererRef.current && cameraRef.current) {
        try {
          rendererRef.current.clear()
          rendererRef.current.render(scene, cameraRef.current)
        } catch (error) {
          console.error('ParticleBackground render error:', error)
        }
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('resize', handleResize)

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }

      // 资源释放
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose()
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach(mat => mat.dispose())
        } else {
          particlesRef.current.material.dispose()
        }
      }

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      // 清空引用
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      particlesRef.current = null
      controlsRef.current = null
    }
  }, [
    handleMouseMove,
    handleResize,
    isActive,
    particleCount,
    particleSize,
    particleColor,
    particleOpacity,
    enableMouseInteraction,
    enableAutoRotation,
    autoRotationSpeed,
    isMobile,
    calculatePerformanceLevel,
    adjustParticleCount,
    updateFPS
  ])

  // 如果不激活，不渲染canvas
  if (!isActive) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed left-0 top-0 -z-10 h-full w-full ${className}`}
      aria-hidden="true" // 提高可访问性
      // 添加性能优化属性
      data-performance="optimized"
      data-particle-system="advanced"
    />
  )
}

export default ParticleBackground
