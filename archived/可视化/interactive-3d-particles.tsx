import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const ParticleSystem = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isHandDetectionActive, setIsHandDetectionActive] = useState(false)
  const [selectedShape, setSelectedShape] = useState('sphere')
  const [color1, setColor1] = useState('#ff6b9d')
  const [color2, setColor2] = useState('#4ecdc4')
  const [useGradient, setUseGradient] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [handDistance, setHandDistance] = useState(1)
  const [cameraError, setCameraError] = useState('')
  const [cameraStatus, setCameraStatus] = useState('未启动')

  const sceneRef = useRef(null)
  const particlesRef = useRef(null)
  const animationIdRef = useRef(null)

  // 生成不同形状的粒子位置
  const generateParticlePositions = (shape, count = 5000) => {
    const positions = []

    switch (shape) {
      case 'heart':
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 2
          const x = 16 * Math.pow(Math.sin(t), 3)
          const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
          const z = (Math.random() - 0.5) * 5
          positions.push(new THREE.Vector3(x * 0.3, y * 0.3, z))
        }
        break

      case 'saturn':
        // 球体
        for (let i = 0; i < count * 0.6; i++) {
          const phi = Math.acos(2 * Math.random() - 1)
          const theta = Math.random() * Math.PI * 2
          const r = 5
          positions.push(
            new THREE.Vector3(
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi)
            )
          )
        }
        // 光环
        for (let i = 0; i < count * 0.4; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = 7 + Math.random() * 2
          positions.push(
            new THREE.Vector3(
              radius * Math.cos(angle),
              (Math.random() - 0.5) * 0.5,
              radius * Math.sin(angle) * 0.3
            )
          )
        }
        break

      case 'sphere':
      default:
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(2 * Math.random() - 1)
          const theta = Math.random() * Math.PI * 2
          const r = 8
          positions.push(
            new THREE.Vector3(
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi)
            )
          )
        }
        break
    }

    return positions
  }

  // 初始化Three.js场景
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // 创建粒子系统
    const particleCount = 5000
    const geometry = new THREE.BufferGeometry()
    const positions = generateParticlePositions(selectedShape, particleCount)
    const positionArray = new Float32Array(particleCount * 3)
    const colorArray = new Float32Array(particleCount * 3)
    const targetPositions = new Float32Array(particleCount * 3)

    positions.forEach((pos, i) => {
      positionArray[i * 3] = pos.x
      positionArray[i * 3 + 1] = pos.y
      positionArray[i * 3 + 2] = pos.z
      targetPositions[i * 3] = pos.x
      targetPositions[i * 3 + 1] = pos.y
      targetPositions[i * 3 + 2] = pos.z
    })

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    particlesRef.current = {
      particles,
      geometry,
      targetPositions,
      basePositions: positionArray.slice()
    }

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    // 动画循环
    let scale = 1
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      // 根据手势距离调整粒子缩放
      const targetScale = 0.5 + handDistance * 1.5
      scale += (targetScale - scale) * 0.05

      const positions = geometry.attributes.position.array
      const colors = geometry.attributes.color.array
      const { targetPositions, basePositions } = particlesRef.current

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // 平滑过渡到目标位置
        positions[i3] += (targetPositions[i3] * scale - positions[i3]) * 0.05
        positions[i3 + 1] += (targetPositions[i3 + 1] * scale - positions[i3 + 1]) * 0.05
        positions[i3 + 2] += (targetPositions[i3 + 2] * scale - positions[i3 + 2]) * 0.05

        // 添加微小的波动
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.02
        positions[i3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.02

        // 颜色渐变
        if (useGradient) {
          const c1 = new THREE.Color(color1)
          const c2 = new THREE.Color(color2)
          const t = i / particleCount
          colors[i3] = c1.r + (c2.r - c1.r) * t
          colors[i3 + 1] = c1.g + (c2.g - c1.g) * t
          colors[i3 + 2] = c1.b + (c2.b - c1.b) * t
        } else {
          const c = new THREE.Color(color1)
          colors[i3] = c.r
          colors[i3 + 1] = c.g
          colors[i3 + 2] = c.b
        }
      }

      geometry.attributes.position.needsUpdate = true
      geometry.attributes.color.needsUpdate = true

      particles.rotation.y += 0.001
      particles.rotation.x += 0.0005

      renderer.render(scene, camera)
    }

    animate()

    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // 更新粒子形状
  useEffect(() => {
    if (!particlesRef.current) return

    const newPositions = generateParticlePositions(selectedShape, 5000)
    newPositions.forEach((pos, i) => {
      particlesRef.current.targetPositions[i * 3] = pos.x
      particlesRef.current.targetPositions[i * 3 + 1] = pos.y
      particlesRef.current.targetPositions[i * 3 + 2] = pos.z
    })
  }, [selectedShape])

  // 手势检测
  useEffect(() => {
    if (!isHandDetectionActive) {
      setCameraStatus('未启动')
      setCameraError('')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let detectionInterval

    setCameraStatus('正在请求权限...')
    setCameraError('')

    // 首先检查是否支持摄像头
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('您的浏览器不支持摄像头访问')
      setCameraStatus('不支持')
      setIsHandDetectionActive(false)
      return
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      .then(stream => {
        setCameraStatus('摄像头已启动')
        video.srcObject = stream

        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              setCameraStatus('检测中...')
            })
            .catch(err => {
              setCameraError('视频播放失败: ' + err.message)
              setCameraStatus('错误')
            })
        }

        // 等待视频加载
        video.onloadeddata = () => {
          const detectHands = () => {
            if (!isHandDetectionActive || !video.srcObject) return

            try {
              // 确保视频正在播放
              if (video.readyState === video.HAVE_ENOUGH_DATA) {
                ctx.drawImage(video, 0, 0, 640, 480)
                const imageData = ctx.getImageData(0, 0, 640, 480)
                const data = imageData.data

                // 改进的肤色检测算法
                let skinPixels = []
                const step = 8 // 采样步长，提高性能

                for (let y = 0; y < 480; y += step) {
                  for (let x = 0; x < 640; x += step) {
                    const i = (y * 640 + x) * 4
                    const r = data[i]
                    const g = data[i + 1]
                    const b = data[i + 2]

                    // 更宽松的肤色检测范围
                    if (
                      r > 85 &&
                      g > 40 &&
                      b > 20 &&
                      r > g &&
                      r > b &&
                      Math.abs(r - g) > 10 &&
                      r - b > 10
                    ) {
                      skinPixels.push({ x, y })
                    }
                  }
                }

                if (skinPixels.length > 50) {
                  // 使用中线分离左右手
                  skinPixels.sort((a, b) => a.x - b.x)

                  const midX = 320
                  const leftHandPixels = skinPixels.filter(p => p.x < midX)
                  const rightHandPixels = skinPixels.filter(p => p.x >= midX)

                  if (leftHandPixels.length > 20 && rightHandPixels.length > 20) {
                    setCameraStatus('检测到双手 ✓')

                    // 计算每只手的中心点
                    const leftCenter = leftHandPixels.reduce(
                      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
                      { x: 0, y: 0 }
                    )
                    leftCenter.x /= leftHandPixels.length
                    leftCenter.y /= leftHandPixels.length

                    const rightCenter = rightHandPixels.reduce(
                      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
                      { x: 0, y: 0 }
                    )
                    rightCenter.x /= rightHandPixels.length
                    rightCenter.y /= rightHandPixels.length

                    // 计算距离并归一化
                    const distance = Math.sqrt(
                      Math.pow(rightCenter.x - leftCenter.x, 2) +
                        Math.pow(rightCenter.y - leftCenter.y, 2)
                    )

                    // 归一化距离 (200-600像素映射到0.3-2.0)
                    const normalizedDistance = Math.max(
                      0.3,
                      Math.min(2.0, (distance - 200) / 200 + 0.5)
                    )
                    setHandDistance(normalizedDistance)

                    // 在canvas上绘制检测结果
                    ctx.clearRect(0, 0, 640, 480)
                    ctx.drawImage(video, 0, 0, 640, 480)

                    // 绘制左手中心
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'
                    ctx.beginPath()
                    ctx.arc(leftCenter.x, leftCenter.y, 15, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.fillStyle = 'white'
                    ctx.font = '12px Arial'
                    ctx.fillText('左手', leftCenter.x - 15, leftCenter.y - 20)

                    // 绘制右手中心
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
                    ctx.beginPath()
                    ctx.arc(rightCenter.x, rightCenter.y, 15, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.fillStyle = 'white'
                    ctx.fillText('右手', rightCenter.x - 15, rightCenter.y - 20)

                    // 绘制连接线
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'
                    ctx.lineWidth = 3
                    ctx.beginPath()
                    ctx.moveTo(leftCenter.x, leftCenter.y)
                    ctx.lineTo(rightCenter.x, rightCenter.y)
                    ctx.stroke()

                    // 显示距离信息
                    const midX = (leftCenter.x + rightCenter.x) / 2
                    const midY = (leftCenter.y + rightCenter.y) / 2
                    ctx.fillStyle = 'yellow'
                    ctx.font = 'bold 16px Arial'
                    ctx.fillText(`${distance.toFixed(0)}px`, midX, midY)
                  } else {
                    setCameraStatus('请将双手分别放在画面左右两侧')
                  }
                } else {
                  setCameraStatus('未检测到手部，请靠近摄像头')
                }
              }
            } catch (err) {
              console.error('手势检测错误:', err)
              setCameraError('检测错误: ' + err.message)
            }
          }

          // 使用setInterval代替requestAnimationFrame，降低检测频率
          detectionInterval = setInterval(detectHands, 100)
        }

        // 添加错误处理
        video.onerror = err => {
          setCameraError('视频加载错误')
          setCameraStatus('错误')
        }
      })
      .catch(err => {
        console.error('摄像头访问失败:', err)
        let errorMessage = '无法访问摄像头'

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问'
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = '未检测到摄像头设备，请确保摄像头已连接'
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = '摄像头正被其他应用占用，请关闭其他使用摄像头的程序'
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = '摄像头不支持请求的参数'
        } else if (err.name === 'TypeError') {
          errorMessage = '请使用HTTPS连接或localhost访问'
        }

        setCameraError(errorMessage)
        setCameraStatus('启动失败')
        setIsHandDetectionActive(false)
      })

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval)
      }
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop())
      }
      setCameraStatus('已停止')
    }
  }, [isHandDetectionActive])

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // 处理图片上传
  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 100
        canvas.height = 100
        ctx.drawImage(img, 0, 0, 100, 100)

        const imageData = ctx.getImageData(0, 0, 100, 100)
        const positions = []

        for (let y = 0; y < 100; y += 2) {
          for (let x = 0; x < 100; x += 2) {
            const i = (y * 100 + x) * 4
            const brightness =
              (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3

            if (brightness > 128) {
              positions.push(
                new THREE.Vector3((x - 50) * 0.3, (50 - y) * 0.3, (Math.random() - 0.5) * 2)
              )
            }
          }
        }

        if (particlesRef.current && positions.length > 0) {
          const targetPositions = particlesRef.current.targetPositions
          positions.forEach((pos, i) => {
            if (i < targetPositions.length / 3) {
              targetPositions[i * 3] = pos.x
              targetPositions[i * 3 + 1] = pos.y
              targetPositions[i * 3 + 2] = pos.z
            }
          })
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {/* 隐藏的视频和canvas用于手势检测 */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      {/* 调试视图：显示摄像头画面 */}
      {isHandDetectionActive && (
        <div className="absolute right-4 top-4 z-20 rounded-lg bg-black/80 p-2">
          <canvas
            ref={canvasRef}
            width="320"
            height="240"
            className="rounded border-2 border-cyan-400"
          />
          <p className="mt-1 text-center text-xs text-white">手势检测预览</p>
        </div>
      )}

      {/* 控制面板切换按钮 */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute left-4 top-4 z-20 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        {showControls ? '隐藏控制' : '显示控制'}
      </button>

      {/* 控制面板 */}
      {showControls && (
        <div className="absolute left-20 top-4 z-10 max-w-sm rounded-2xl bg-black/70 p-6 text-white shadow-2xl backdrop-blur-md">
          <h2 className="mb-4 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
            粒子系统控制
          </h2>

          {/* 手势控制 */}
          <div className="mb-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isHandDetectionActive}
                onChange={e => setIsHandDetectionActive(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">启用手势控制（双手张合）</span>
            </label>

            {/* 摄像头状态显示 */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`h-2 w-2 rounded-full ${
                    cameraStatus === '检测到双手 ✓'
                      ? 'bg-green-400'
                      : cameraStatus === '检测中...' || cameraStatus === '摄像头已启动'
                        ? 'bg-yellow-400'
                        : cameraStatus === '启动失败' || cameraStatus === '错误'
                          ? 'bg-red-400'
                          : 'bg-gray-400'
                  }`}
                />
                <span className="text-cyan-400">{cameraStatus}</span>
              </div>

              {isHandDetectionActive && (
                <div className="text-xs text-cyan-400">
                  手势距离: {(handDistance * 100).toFixed(0)}%
                </div>
              )}

              {cameraError && (
                <div className="mt-2 rounded bg-red-900/20 p-2 text-xs text-red-400">
                  ⚠️ {cameraError}
                </div>
              )}
            </div>
          </div>

          {/* 形状选择 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm">形状选择</label>
            <div className="flex gap-2">
              {['sphere', 'heart', 'saturn'].map(shape => (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`rounded-lg px-4 py-2 text-sm transition-all ${
                    selectedShape === shape
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {shape === 'sphere' ? '球体' : shape === 'heart' ? '爱心' : '土星'}
                </button>
              ))}
            </div>
          </div>

          {/* 图片上传 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm">上传图片生成形状</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-cyan-500 file:px-4 file:py-2 file:text-white hover:file:opacity-80"
            />
          </div>

          {/* 颜色选择 */}
          <div className="mb-4">
            <label className="mb-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={useGradient}
                onChange={e => setUseGradient(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">启用颜色渐变</span>
            </label>

            <div className="flex items-center gap-2">
              <div>
                <label className="mb-1 block text-xs">{useGradient ? '起始' : '颜色'}</label>
                <input
                  type="color"
                  value={color1}
                  onChange={e => setColor1(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded"
                />
              </div>

              {useGradient && (
                <>
                  <span className="mt-4 text-xl">→</span>
                  <div>
                    <label className="mb-1 block text-xs">结束</label>
                    <input
                      type="color"
                      value={color2}
                      onChange={e => setColor2(e.target.value)}
                      className="h-10 w-16 cursor-pointer rounded"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 全屏按钮 */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 z-20 rounded-full bg-white/10 px-6 py-3 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20"
      >
        {isFullscreen ? '退出全屏' : '全屏模式'}
      </button>

      {/* 提示信息 */}
      {isHandDetectionActive && !cameraError && (
        <div className="absolute bottom-20 left-4 z-20 rounded-lg bg-cyan-500/20 px-4 py-2 text-sm text-cyan-400 backdrop-blur-md">
          💡 将双手分别放在画面左右两侧，张开或合拢控制粒子
        </div>
      )}

      {/* 摄像头故障排除提示 */}
      {cameraError && (
        <div className="absolute bottom-20 left-4 z-20 max-w-md rounded-lg bg-red-500/20 px-4 py-3 text-sm text-white backdrop-blur-md">
          <div className="mb-2 font-bold">📷 摄像头故障排除：</div>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>确保浏览器地址栏显示🔒或显示"安全"</li>
            <li>点击地址栏的摄像头图标，允许访问</li>
            <li>检查是否有其他程序正在使用摄像头</li>
            <li>尝试刷新页面重新授权</li>
            <li>Windows用户：检查设置 → 隐私 → 摄像头</li>
            <li>Mac用户：检查系统偏好设置 → 安全与隐私 → 摄像头</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ParticleSystem
