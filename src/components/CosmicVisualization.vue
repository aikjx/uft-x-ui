<template>
  <div class="relative w-full h-full cosmic-bg">
    <!-- 3D渲染画布 -->
    <canvas ref="canvas" class="absolute inset-0" />
    
    <!-- 全息控制面板 -->
    <div class="absolute top-6 right-6 glass-effect p-6 rounded-2xl border border-cyan-500/30 shadow-2xl">
      <h3 class="text-white font-bold text-lg mb-4 text-center">🌌 宇宙控制台</h3>
      <div class="space-y-4">
        <!-- 场景模式 -->
        <div>
          <label class="text-cyan-300 text-sm font-semibold block mb-2">⚡ 宇宙场景</label>
          <select v-model="visualizationMode" class="w-full bg-black/70 text-white rounded-lg px-4 py-3 border border-cyan-500/30 focus:border-cyan-400 transition-all">
            <option value="spacetime">🌌 时空同一化</option>
            <option value="spiral">🌀 螺旋时空</option>
            <option value="gravity">🌍 引力场</option>
            <option value="electromagnetic">⚡ 电磁场</option>
            <option value="unified">🌟 统一场</option>
            <option value="quantum">🔬 量子场</option>
            <option value="cosmic">🌠 宇宙场</option>
          </select>
        </div>
        
        <!-- 时间参数 -->
        <div>
          <label class="text-cyan-300 text-sm font-semibold block mb-2">⏰ 时间流 {{ timeParameter }}</label>
          <input 
            v-model="timeParameter" 
            type="range" 
            min="0" 
            max="100" 
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-gradient"
          />
        </div>
        
        <!-- 场强度 -->
        <div>
          <label class="text-cyan-300 text-sm font-semibold block mb-2">💫 场强度 {{ fieldStrength }}</label>
          <input 
            v-model="fieldStrength" 
            type="range" 
            min="0" 
            max="100" 
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-gradient"
          />
        </div>
        
        <!-- 粒子密度 -->
        <div>
          <label class="text-cyan-300 text-sm font-semibold block mb-2">✨ 粒子密度 {{ particleDensity }}</label>
          <input 
            v-model="particleDensity" 
            type="range" 
            min="100" 
            max="10000" 
            step="100"
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-gradient"
          />
        </div>
      </div>
    </div>

    <!-- 公式信息面板 -->
    <div class="absolute bottom-6 left-6 glass-effect p-6 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md">
      <h3 class="text-white font-bold text-lg mb-3">📊 当前公式</h3>
      <div v-if="currentFormula" class="space-y-3">
        <div class="text-cyan-300 font-semibold">{{ currentFormula.name }}</div>
        <div class="text-gray-300 text-sm">{{ currentFormula.description }}</div>
        <div class="bg-black/50 p-3 rounded-lg">
          <div class="text-purple-300 font-mono text-sm">{{ currentFormula.latex }}</div>
        </div>
        <div class="flex space-x-2">
          <span class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">难度: {{ currentFormula.difficulty }}</span>
          <span class="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">分类: {{ currentFormula.category }}</span>
        </div>
      </div>
      <div v-else class="text-gray-400 text-center py-4">
        <div class="text-4xl mb-2">🔭</div>
        <div>选择场景查看对应公式</div>
      </div>
    </div>

    <!-- 性能监控 -->
    <div class="absolute top-6 left-6 glass-effect p-4 rounded-lg text-xs">
      <div class="text-green-400">FPS: {{ fps.toFixed(1) }}</div>
      <div class="text-yellow-400">粒子: {{ activeParticles }}</div>
      <div class="text-blue-400">内存: {{ memoryUsage }}MB</div>
      <div class="text-purple-400">渲染质量: {{ renderQuality }}</div>
    </div>

    <!-- 高级控制面板 -->
    <div class="absolute top-6 left-1/2 transform -translate-x-1/2 glass-effect p-4 rounded-lg text-xs">
      <div class="flex space-x-4">
        <button @click="toggleAutoRotation" class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/40 transition">
          {{ universeState.isRotating ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        <button @click="resetCamera" class="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/40 transition">
          🔄 重置视角
        </button>
        <button @click="togglePerformanceMode" class="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition">
          {{ performanceMode ? '⚡ 性能模式' : '🌟 质量模式' }}
        </button>
      </div>
    </div>

    <!-- 交互提示 -->
    <div class="absolute bottom-6 right-6 text-center text-gray-400 text-sm">
      <div>🖱️ 鼠标拖拽旋转 | 🔍 滚轮缩放</div>
      <div>⌨️ WASD移动 | 空格重置视角</div>
    </div>

    <!-- 全息效果层 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="cosmic-hologram"></div>
    </div>

    <!-- 全息效果层 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="cosmic-hologram"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import * as THREE from 'three'
import type { Formula } from '../types/formula'

const canvas = ref<HTMLCanvasElement>()
const visualizationMode = ref('spacetime')
const timeParameter = ref(50)
const fieldStrength = ref(50)
const particleDensity = ref(1000)
const currentFormula = ref<Formula | null>(null)
const fps = ref(60)
const activeParticles = ref(0)
const memoryUsage = ref(0)
const renderQuality = ref('高')
const performanceMode = ref(false)

// 宇宙场景状态
const universeState = reactive({
  isRotating: true,
  cameraSpeed: 0.5,
  fieldIntensity: 1.0,
  timeScale: 1.0,
  particleSize: 0.1,
  originalCameraPosition: new THREE.Vector3(0, 5, 15)
})

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let clock: THREE.Clock

// 宇宙场景对象
let particleSystem: THREE.Points
let fieldLines: THREE.LineSegments
let spacetimeGrid: THREE.GridHelper
let gravitationalField: THREE.Mesh
let electromagneticField: THREE.Group
let unifiedField: THREE.Group

// 物理参数
const physicsParams = {
  gravitationalConstant: 6.67430e-11,
  speedOfLight: 299792458,
  planckConstant: 6.62607015e-34,
  electronCharge: 1.602176634e-19
}

// 公式数据
const formulas = {
  spacetime: {
    name: '时空同一化方程',
    description: '光速矢量与时空的统一描述',
    latex: 'c = \\sqrt{\\frac{1}{\\mu_0\\epsilon_0}}',
    difficulty: '中级',
    category: '时空理论'
  },
  spiral: {
    name: '螺旋时空方程',
    description: '粒子在螺旋时空中的运动轨迹',
    latex: 'r = r_0 e^{i\\omega t}',
    difficulty: '高级',
    category: '时空理论'
  },
  gravity: {
    name: '引力场方程',
    description: '空间密度梯度与引力场的关系',
    latex: '\\nabla^2 \\phi = 4\\pi G\\rho',
    difficulty: '中级',
    category: '引力理论'
  },
  electromagnetic: {
    name: '电磁场统一方程',
    description: '电场与磁场的统一描述',
    latex: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}',
    difficulty: '高级',
    category: '电磁理论'
  },
  unified: {
    name: '统一场方程',
    description: '引力与电磁的耦合方程',
    latex: 'R_{\\mu\\nu} - \\frac{1}{2}g_{\\mu\\nu}R = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}',
    difficulty: '专家',
    category: '统一理论'
  },
  quantum: {
    name: '量子场方程',
    description: '量子力学与场论的统一',
    latex: 'i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi',
    difficulty: '专家',
    category: '量子理论'
  },
  cosmic: {
    name: '宇宙场方程',
    description: '宇宙尺度下的统一场描述',
    latex: '\\Lambda g_{\\mu\\nu} + R_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}',
    difficulty: '大师',
    category: '宇宙理论'
  }
}

// 初始化宇宙级Three.js场景
const initScene = () => {
  if (!canvas.value) return

  // 创建宇宙场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)
  scene.fog = new THREE.Fog(0x000033, 10, 100)

  // 创建高级相机
  camera = new THREE.PerspectiveCamera(
    60, 
    canvas.value.clientWidth / canvas.value.clientHeight, 
    0.1, 
    2000
  )
  camera.position.set(0, 5, 15)
  camera.lookAt(0, 0, 0)

  // 创建高性能渲染器
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas.value, 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  })
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  // 创建高级光照系统
  createAdvancedLighting()
  
  // 创建宇宙背景
  createCosmicBackground()
  
  // 创建交互控制系统
  initControls()
  
  // 创建物理场可视化
  createFieldVisualizations()
  
  // 创建粒子系统
  createParticleSystem()

  // 初始化时钟
  clock = new THREE.Clock()
  
  // 开始宇宙级动画循环
  animate()
}

// 创建高级光照系统
const createAdvancedLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x4040ff, 0.1)
  scene.add(ambientLight)

  // 主方向光
  const mainLight = new THREE.DirectionalLight(0xffffff, 1)
  mainLight.position.set(10, 10, 10)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  scene.add(mainLight)

  // 补光
  const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)

  // 点光源 - 代表宇宙中的恒星
  const starLight = new THREE.PointLight(0x00ffff, 0.5, 100)
  starLight.position.set(0, 0, 0)
  scene.add(starLight)
}

// 创建宇宙背景
const createCosmicBackground = () => {
  // 创建星空背景
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 5000
  const starPositions = new Float32Array(starCount * 3)
  
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 2000
    starPositions[i + 1] = (Math.random() - 0.5) * 2000
    starPositions[i + 2] = (Math.random() - 0.5) * 2000
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true
  })
  
  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
}

// 初始化交互控制
const initControls = () => {
  // 鼠标交互
  mouse = new THREE.Vector2()
  raycaster = new THREE.Raycaster()
  
  // 键盘控制
  const keys: Record<string, boolean> = {}
  
  window.addEventListener('keydown', (event) => {
    keys[event.code] = true
    
    // 空格键重置视角
    if (event.code === 'Space') {
      camera.position.set(0, 5, 15)
      camera.lookAt(0, 0, 0)
    }
  })
  
  window.addEventListener('keyup', (event) => {
    keys[event.code] = false
  })
  
  // 鼠标控制
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  
  canvas.value?.addEventListener('mousedown', (event) => {
    isDragging = true
    previousMousePosition = { x: event.clientX, y: event.clientY }
  })
  
  canvas.value?.addEventListener('mousemove', (event) => {
    if (!isDragging) return
    
    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y
    
    camera.rotation.y += deltaX * 0.01
    camera.rotation.x += deltaY * 0.01
    
    previousMousePosition = { x: event.clientX, y: event.clientY }
  })
  
  canvas.value?.addEventListener('mouseup', () => {
    isDragging = false
  })
  
  // 滚轮缩放
  canvas.value?.addEventListener('wheel', (event) => {
    event.preventDefault()
    camera.position.z += event.deltaY * 0.01
  })
}

// 创建物理场可视化系统
const createFieldVisualizations = () => {
  // 创建时空网格
  spacetimeGrid = new THREE.GridHelper(50, 50, 0x00ffff, 0x004444)
  spacetimeGrid.rotation.x = Math.PI / 2
  scene.add(spacetimeGrid)

  // 创建引力场可视化
  createGravitationalField()
  
  // 创建电磁场可视化
  createElectromagneticField()
  
  // 创建统一场可视化
  createUnifiedField()
}

// 创建引力场可视化
const createGravitationalField = () => {
  const geometry = new THREE.SphereGeometry(3, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.3,
    wireframe: true
  })
  
  gravitationalField = new THREE.Mesh(geometry, material)
  scene.add(gravitationalField)
  
  // 创建引力场线
  createGravityFieldLines()
}

// 创建引力场线
const createGravityFieldLines = () => {
  const lineCount = 12
  const radius = 8
  const lineGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(lineCount * 6)
  
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    
    positions[i * 6] = x
    positions[i * 6 + 1] = 0
    positions[i * 6 + 2] = z
    positions[i * 6 + 3] = 0
    positions[i * 6 + 4] = -radius
    positions[i * 6 + 5] = 0
  }
  
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5
  })
  
  fieldLines = new THREE.LineSegments(lineGeometry, lineMaterial)
  scene.add(fieldLines)
}

// 创建电磁场可视化
const createElectromagneticField = () => {
  electromagneticField = new THREE.Group()
  
  // 电场线
  const electricFieldGeometry = new THREE.TorusGeometry(4, 0.1, 8, 24)
  const electricFieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.6
  })
  
  const electricField = new THREE.Mesh(electricFieldGeometry, electricFieldMaterial)
  electricField.rotation.x = Math.PI / 2
  electromagneticField.add(electricField)
  
  // 磁场线
  const magneticFieldGeometry = new THREE.TorusGeometry(6, 0.1, 8, 24)
  const magneticFieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.6
  })
  
  const magneticField = new THREE.Mesh(magneticFieldGeometry, magneticFieldMaterial)
  magneticField.rotation.z = Math.PI / 2
  electromagneticField.add(magneticField)
  
  scene.add(electromagneticField)
}

// 创建统一场可视化
const createUnifiedField = () => {
  unifiedField = new THREE.Group()
  
  // 统一场核心
  const coreGeometry = new THREE.IcosahedronGeometry(2, 2)
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    emissive: 0x444400,
    transparent: true,
    opacity: 0.8
  })
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  unifiedField.add(core)
  
  // 统一场光环
  const haloGeometry = new THREE.RingGeometry(3, 5, 32)
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  })
  
  const halo = new THREE.Mesh(haloGeometry, haloMaterial)
  halo.rotation.x = Math.PI / 2
  unifiedField.add(halo)
  
  scene.add(unifiedField)
}

// 创建高级粒子系统
const createParticleSystem = () => {
  const particleCount = particleDensity.value
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  
  // 初始化粒子位置、颜色和速度
  for (let i = 0; i < particleCount * 3; i += 3) {
    // 随机位置
    positions[i] = (Math.random() - 0.5) * 40
    positions[i + 1] = (Math.random() - 0.5) * 40
    positions[i + 2] = (Math.random() - 0.5) * 40
    
    // 随机颜色（基于位置）
    colors[i] = Math.sin(positions[i] * 0.1) * 0.5 + 0.5
    colors[i + 1] = Math.cos(positions[i + 1] * 0.1) * 0.5 + 0.5
    colors[i + 2] = Math.sin(positions[i + 2] * 0.1) * 0.5 + 0.5
    
    // 随机速度
    velocities[i] = (Math.random() - 0.5) * 0.02
    velocities[i + 1] = (Math.random() - 0.5) * 0.02
    velocities[i + 2] = (Math.random() - 0.5) * 0.02
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })
  
  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
  
  // 保存速度数据
  particleSystem.userData.velocities = velocities
  activeParticles.value = particleCount
}

// 宇宙级动画循环（性能优化版）
const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const deltaTime = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()
  
  // 性能优化：如果FPS过低，跳过一些帧
  if (fps.value < 30 && deltaTime > 0.033) {
    return
  }
  
  // 更新性能监控
  updatePerformanceMetrics(deltaTime)
  
  // 根据可视化模式更新场景
  updateVisualization(elapsedTime, deltaTime)
  
  // 更新粒子系统（性能优化：根据粒子密度调整更新频率）
  if (particleDensity.value <= 2000 || elapsedTime % 0.1 < deltaTime) {
    updateParticleSystem(deltaTime)
  }
  
  // 更新物理场动画
  updateFieldAnimations(elapsedTime)
  
  // 自动旋转场景
  if (universeState.isRotating) {
    scene.rotation.y += deltaTime * universeState.cameraSpeed
  }
  
  renderer.render(scene, camera)
}

// 更新性能监控
const updatePerformanceMetrics = (deltaTime: number) => {
  // 计算FPS
  fps.value = 1 / deltaTime
  
  // 估算内存使用
  if (renderer.info) {
    memoryUsage.value = Math.round(renderer.info.memory.geometries / 1024)
  }
}

// 更新粒子系统
const updateParticleSystem = (deltaTime: number) => {
  if (!particleSystem) return
  
  const positions = particleSystem.geometry.attributes.position.array as Float32Array
  const velocities = particleSystem.userData.velocities as Float32Array
  
  for (let i = 0; i < positions.length; i += 3) {
    // 应用速度
    positions[i] += velocities[i] * deltaTime * 60
    positions[i + 1] += velocities[i + 1] * deltaTime * 60
    positions[i + 2] += velocities[i + 2] * deltaTime * 60
    
    // 边界检查
    if (Math.abs(positions[i]) > 20) velocities[i] *= -1
    if (Math.abs(positions[i + 1]) > 20) velocities[i + 1] *= -1
    if (Math.abs(positions[i + 2]) > 20) velocities[i + 2] *= -1
    
    // 根据可视化模式应用不同的物理效果
    applyPhysicalEffects(positions, velocities, i, deltaTime)
  }
  
  particleSystem.geometry.attributes.position.needsUpdate = true
}

// 应用物理效果
const applyPhysicalEffects = (positions: Float32Array, velocities: Float32Array, index: number, deltaTime: number) => {
  const x = positions[index]
  const y = positions[index + 1]
  const z = positions[index + 2]
  
  const distance = Math.sqrt(x * x + y * y + z * z)
  const fieldIntensity = fieldStrength.value / 100
  
  switch (visualizationMode.value) {
    case 'gravity':
      // 引力场效果
      const gravityForce = -0.1 / (distance * distance + 0.1)
      velocities[index] += (gravityForce * x / distance) * deltaTime
      velocities[index + 1] += (gravityForce * y / distance) * deltaTime
      velocities[index + 2] += (gravityForce * z / distance) * deltaTime
      break
      
    case 'electromagnetic':
      // 电磁场效果
      const emForce = Math.sin(distance * 2) * 0.05 * fieldIntensity
      velocities[index] += emForce * Math.cos(y) * deltaTime
      velocities[index + 1] += emForce * Math.sin(z) * deltaTime
      velocities[index + 2] += emForce * Math.cos(x) * deltaTime
      break
      
    case 'unified':
      // 统一场效果
      const unifiedForce = Math.sin(distance * 3 + clock.getElapsedTime()) * 0.1 * fieldIntensity
      velocities[index] += unifiedForce * Math.sin(y) * deltaTime
      velocities[index + 1] += unifiedForce * Math.cos(z) * deltaTime
      velocities[index + 2] += unifiedForce * Math.sin(x) * deltaTime
      break
  }
}

// 更新物理场动画
const updateFieldAnimations = (elapsedTime: number) => {
  const timeScale = timeParameter.value / 50
  
  if (gravitationalField) {
    gravitationalField.scale.setScalar(1 + Math.sin(elapsedTime) * 0.1 * timeScale)
    gravitationalField.rotation.y += 0.01 * timeScale
  }
  
  if (electromagneticField) {
    electromagneticField.rotation.y += 0.02 * timeScale
    electromagneticField.children[0].scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.1)
    electromagneticField.children[1].scale.setScalar(1 + Math.cos(elapsedTime * 2) * 0.1)
  }
  
  if (unifiedField) {
    unifiedField.rotation.x += 0.015 * timeScale
    unifiedField.rotation.y += 0.02 * timeScale
    unifiedField.children[1].rotation.z += 0.03 * timeScale
  }
}

// 宇宙级可视化效果更新
const updateVisualization = (elapsedTime: number, deltaTime: number) => {
  const time = timeParameter.value / 100
  const fieldIntensity = fieldStrength.value / 100
  
  // 根据模式显示对应的公式
  const formulaData = formulas[visualizationMode.value as keyof typeof formulas]
  if (formulaData) {
    currentFormula.value = {
      id: Date.now(),
      name: formulaData.name,
      latex: formulaData.latex,
      description: formulaData.description,
      category: formulaData.category as any,
      difficulty: formulaData.difficulty as any,
      variables: [],
      applications: [],
      relatedFormulas: []
    }
  } else {
    currentFormula.value = null
  }
  
  // 实现不同的宇宙级可视化效果
  switch (visualizationMode.value) {
    case 'spacetime':
      updateSpacetimeVisualization(elapsedTime, fieldIntensity)
      break
    case 'spiral':
      updateSpiralVisualization(elapsedTime, fieldIntensity)
      break
    case 'gravity':
      updateGravityVisualization(elapsedTime, fieldIntensity)
      break
    case 'electromagnetic':
      updateElectromagneticVisualization(elapsedTime, fieldIntensity)
      break
    case 'unified':
      updateUnifiedVisualization(elapsedTime, fieldIntensity)
      break
    case 'quantum':
      updateQuantumVisualization(elapsedTime, fieldIntensity)
      break
    case 'cosmic':
      updateCosmicVisualization(elapsedTime, fieldIntensity)
      break
  }
}

// 时空同一化可视化
const updateSpacetimeVisualization = (elapsedTime: number, intensity: number) => {
  if (spacetimeGrid) {
    spacetimeGrid.material.opacity = 0.3 + Math.sin(elapsedTime) * 0.2 * intensity
  }
  
  // 创建时空扭曲效果
  scene.traverse((object) => {
    if (object instanceof THREE.Points) {
      const positions = object.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        const z = positions[i + 2]
        
        // 时空扭曲效果
        const distance = Math.sqrt(x * x + y * y + z * z)
        const wave = Math.sin(distance * 0.5 + elapsedTime * 2) * 0.5 * intensity
        
        positions[i + 2] = z + wave
      }
      
      object.geometry.attributes.position.needsUpdate = true
    }
  })
}

// 螺旋时空可视化
const updateSpiralVisualization = (elapsedTime: number, intensity: number) => {
  // 创建螺旋运动效果
  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array
    const velocities = particleSystem.userData.velocities as Float32Array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      // 螺旋运动方程
      const radius = Math.sqrt(x * x + z * z)
      const angle = Math.atan2(z, x)
      const spiralForce = 0.1 * intensity
      
      velocities[i] = -spiralForce * Math.sin(angle + elapsedTime) * radius
      velocities[i + 2] = spiralForce * Math.cos(angle + elapsedTime) * radius
      velocities[i + 1] = Math.sin(elapsedTime + radius) * 0.02 * intensity
    }
  }
}

// 引力场可视化
const updateGravityVisualization = (elapsedTime: number, intensity: number) => {
  if (gravitationalField) {
    gravitationalField.material.opacity = 0.3 + Math.sin(elapsedTime) * 0.2 * intensity
    gravitationalField.scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.2 * intensity)
  }
}

// 电磁场可视化
const updateElectromagneticVisualization = (elapsedTime: number, intensity: number) => {
  if (electromagneticField) {
    electromagneticField.children.forEach((child, index) => {
      child.material.opacity = 0.4 + Math.sin(elapsedTime + index * Math.PI) * 0.3 * intensity
    })
  }
}

// 统一场可视化
const updateUnifiedVisualization = (elapsedTime: number, intensity: number) => {
  if (unifiedField) {
    unifiedField.children[0].material.emissiveIntensity = 0.5 + Math.sin(elapsedTime) * 0.5 * intensity
    unifiedField.children[1].material.opacity = 0.2 + Math.sin(elapsedTime * 3) * 0.2 * intensity
  }
}

// 量子场可视化
const updateQuantumVisualization = (elapsedTime: number, intensity: number) => {
  // 量子波动效果
  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      // 量子波动方程
      const quantumWave = Math.sin(x * 2 + elapsedTime * 3) * 
                         Math.cos(y * 2 + elapsedTime * 2) * 
                         Math.sin(z * 2 + elapsedTime) * 0.5 * intensity
      
      positions[i + 1] = y + quantumWave
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true
  }
}

// 宇宙场可视化
const updateCosmicVisualization = (elapsedTime: number, intensity: number) => {
  // 宇宙尺度效果
  scene.traverse((object) => {
    if (object instanceof THREE.Points) {
      object.material.size = 0.1 + Math.sin(elapsedTime) * 0.05 * intensity
    }
  })
  
  // 宇宙膨胀效果
  if (spacetimeGrid) {
    spacetimeGrid.scale.setScalar(1 + Math.sin(elapsedTime * 0.5) * 0.1 * intensity)
  }
}

// 宇宙级响应式调整
const handleResize = () => {
  if (!canvas.value) return
  
  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  
  // 更新渲染质量
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

// 监听参数变化
watch([visualizationMode, fieldStrength, particleDensity], () => {
  // 根据模式显示对应的公式
  const formulaData = formulas[visualizationMode.value as keyof typeof formulas]
  if (formulaData) {
    currentFormula.value = {
      id: Date.now(),
      name: formulaData.name,
      latex: formulaData.latex,
      description: formulaData.description,
      category: formulaData.category as any,
      difficulty: formulaData.difficulty as any,
      variables: [],
      applications: [],
      relatedFormulas: []
    }
  } else {
    currentFormula.value = null
  }
  
  // 更新粒子密度
  if (particleSystem) {
    scene.remove(particleSystem)
    createParticleSystem()
  }
})

// 高级控制函数
const toggleAutoRotation = () => {
  universeState.isRotating = !universeState.isRotating
}

const resetCamera = () => {
  camera.position.copy(universeState.originalCameraPosition)
  camera.lookAt(0, 0, 0)
}

const togglePerformanceMode = () => {
  performanceMode.value = !performanceMode.value
  
  if (performanceMode.value) {
    // 性能模式：降低渲染质量
    renderer.setPixelRatio(1)
    renderer.shadowMap.enabled = false
    renderQuality.value = '中'
    
    // 减少粒子数量
    if (particleDensity.value > 2000) {
      particleDensity.value = 2000
    }
  } else {
    // 质量模式：提高渲染质量
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderQuality.value = '高'
  }
}

// 性能优化：动态调整渲染质量
watch(fps, (newFps) => {
  if (newFps < 30 && !performanceMode.value) {
    // 自动切换到性能模式
    performanceMode.value = true
    renderer.setPixelRatio(1)
    renderer.shadowMap.enabled = false
    renderQuality.value = '自动优化'
  } else if (newFps > 50 && performanceMode.value) {
    // 恢复质量模式
    performanceMode.value = false
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderQuality.value = '高'
  }
})

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
  
  // 初始显示公式
  currentFormula.value = formulas[visualizationMode.value as keyof typeof formulas]
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  
  // 清理Three.js资源
  if (scene) {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
  
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.cosmic-bg {
  background: radial-gradient(ellipse at center, #0f172a 0%, #000011 70%, #000000 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-text {
  background: linear-gradient(135deg, #00f5ff 0%, #00bfff 50%, #0066ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

canvas {
  display: block;
  outline: none;
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.slider-gradient {
  background: linear-gradient(to right, #00f5ff, #00bfff, #0066ff);
}

.slider-gradient::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00f5ff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

.slider-gradient::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00f5ff;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .glass-effect {
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .absolute {
    position: relative !important;
    margin: 0.5rem;
  }
  
  .top-6 {
    top: 1rem !important;
  }
  
  .bottom-6 {
    bottom: 1rem !important;
  }
  
  .left-6 {
    left: 1rem !important;
  }
  
  .right-6 {
    right: 1rem !important;
  }
}

/* 动画效果 */
@keyframes cosmicPulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(0, 245, 255, 0.6);
  }
}

@keyframes hologramScan {
  0% { 
    transform: translateY(-100%);
    opacity: 0;
  }
  50% { 
    opacity: 0.3;
  }
  100% { 
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes particleGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(0, 245, 255, 0.5));
  }
  50% { 
    filter: drop-shadow(0 0 15px rgba(0, 245, 255, 0.8));
  }
}

.glass-effect {
  animation: cosmicPulse 3s ease-in-out infinite;
}

.cosmic-hologram {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 245, 255, 0.1) 50%,
    transparent 100%
  );
  animation: hologramScan 4s linear infinite;
  pointer-events: none;
}

canvas {
  animation: particleGlow 2s ease-in-out infinite;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00f5ff, #00bfff);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #00bfff, #0066ff);
}

/* 选择框样式 */
select {
  background: rgba(0, 0, 0, 0.7) !important;
  border: 1px solid rgba(0, 245, 255, 0.3) !important;
  color: white !important;
  transition: all 0.3s ease;
}

select:focus {
  border-color: #00f5ff !important;
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.3) !important;
}

select option {
  background: #0f172a;
  color: white;
}

/* 输入框样式 */
input[type="range"] {
  background: transparent;
  height: 6px;
  border-radius: 3px;
}

input[type="range"]:focus {
  outline: none;
}

/* 性能监控样式 */
.text-xs {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

/* 交互提示样式 */
.text-gray-400 {
  font-size: 0.875rem;
  line-height: 1.25;
}
</style>