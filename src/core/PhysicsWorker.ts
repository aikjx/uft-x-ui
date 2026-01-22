/**
 * 物理计算 Web Worker
 * 处理并行的物理场计算任务
 */

// 导入所需的类型和工具函数
import {
  PhysicsParameters,
  SpacetimeState,
  ElectromagneticField,
  UnifiedField,
  SpacetimeStateCalculator,
  GravitationalFieldCalculator,
  ElectromagneticFieldCalculator,
  UnifiedFieldCalculator
} from '../core/PhysicsEngine'

// 定义 Worker 消息类型
interface WorkerMessage {
  type: string
  id?: number
  data?: any
  params?: PhysicsParameters
}

// 定义 Worker 响应类型
interface WorkerResponse {
  id: number
  type: string
  result?: any
  error?: string
}

// 物理计算引擎实例
let spacetimeCalculator: SpacetimeStateCalculator | null = null
let gravitationalCalculator: GravitationalFieldCalculator | null = null
let electromagneticCalculator: ElectromagneticFieldCalculator | null = null
let unifiedFieldCalculator: UnifiedFieldCalculator | null = null
let curvatureCache: Map<string, number> = new Map()

// 处理消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  const id = message.id || 0

  try {
    switch (message.type) {
      case 'INIT':
        handleInit(message.params)
        break
      case 'CALCULATE_SPACETIME_STATE':
        handleCalculateSpacetimeState(id, message.data)
        break
      case 'CALCULATE_GRAVITATIONAL_FIELD':
        handleCalculateGravitationalField(id, message.data)
        break
      case 'CALCULATE_ELECTROMAGNETIC_FIELD':
        handleCalculateElectromagneticField(id, message.data)
        break
      case 'CALCULATE_UNIFIED_FIELD':
        handleCalculateUnifiedField(id, message.data)
        break
      case 'CALCULATE_FIELDS_BATCH':
        handleCalculateFieldsBatch(id, message.data)
        break
      case 'CLEAR_CACHE':
        handleClearCache()
        break
      case 'UPDATE_PARAMETERS':
        handleUpdateParameters(message.params)
        break
      default:
        sendResponse(id, 'ERROR', { error: `Unknown message type: ${message.type}` })
    }
  } catch (error) {
    sendResponse(id, 'ERROR', { error: (error as Error).message })
  }
}

// 初始化计算引擎
function handleInit(params: PhysicsParameters) {
  if (!params) {
    throw new Error('Missing physics parameters')
  }

  // 初始化计算器实例
  spacetimeCalculator = new SpacetimeStateCalculator(params)
  gravitationalCalculator = new GravitationalFieldCalculator(params)
  electromagneticCalculator = new ElectromagneticFieldCalculator(params)
  unifiedFieldCalculator = new UnifiedFieldCalculator(
    params,
    spacetimeCalculator,
    gravitationalCalculator,
    electromagneticCalculator,
    curvatureCache
  )

  sendResponse(0, 'INITIALIZED', { success: true })
}

// 计算时空状态
function handleCalculateSpacetimeState(id: number, data: { position: number[]; time: number }) {
  if (!spacetimeCalculator) {
    throw new Error('Calculator not initialized')
  }

  const position = { x: data.position[0], y: data.position[1], z: data.position[2] }
  const result = spacetimeCalculator.calculateSpacetimeState(position, data.time, curvatureCache)

  sendResponse(id, 'SPACETIME_STATE_CALCULATED', {
    result: {
      position: [result.position.x, result.position.y, result.position.z],
      time: result.time,
      curvature: result.curvature,
      energyDensity: result.energyDensity,
      momentum: [result.momentum.x, result.momentum.y, result.momentum.z]
    }
  })
}

// 计算引力场
function handleCalculateGravitationalField(id: number, data: { position: number[]; mass: number }) {
  if (!gravitationalCalculator) {
    throw new Error('Calculator not initialized')
  }

  const position = { x: data.position[0], y: data.position[1], z: data.position[2] }
  const result = gravitationalCalculator.calculateField(position, data.mass)

  sendResponse(id, 'GRAVITATIONAL_FIELD_CALCULATED', {
    result: [result.x, result.y, result.z]
  })
}

// 计算电磁场
function handleCalculateElectromagneticField(id: number, data: { position: number[]; charge: number; velocity: number[] }) {
  if (!electromagneticCalculator) {
    throw new Error('Calculator not initialized')
  }

  const position = { x: data.position[0], y: data.position[1], z: data.position[2] }
  const velocity = { x: data.velocity[0], y: data.velocity[1], z: data.velocity[2] }
  const result = electromagneticCalculator.calculateField(position, data.charge, velocity)

  sendResponse(id, 'ELECTROMAGNETIC_FIELD_CALCULATED', {
    result: {
      electric: [result.electric.x, result.electric.y, result.electric.z],
      magnetic: [result.magnetic.x, result.magnetic.y, result.magnetic.z]
    }
  })
}

// 计算统一场
function handleCalculateUnifiedField(id: number, data: { position: number[]; time: number; mass: number; charge: number }) {
  if (!unifiedFieldCalculator) {
    throw new Error('Calculator not initialized')
  }

  const position = { x: data.position[0], y: data.position[1], z: data.position[2] }
  const result = unifiedFieldCalculator.calculateField(position, data.time, data.mass, data.charge)

  sendResponse(id, 'UNIFIED_FIELD_CALCULATED', {
    result: {
      spacetime: {
        position: [result.spacetime.position.x, result.spacetime.position.y, result.spacetime.position.z],
        time: result.spacetime.time,
        curvature: result.spacetime.curvature,
        energyDensity: result.spacetime.energyDensity,
        momentum: [result.spacetime.momentum.x, result.spacetime.momentum.y, result.spacetime.momentum.z]
      },
      gravitational: [result.gravitational.x, result.gravitational.y, result.gravitational.z],
      electromagnetic: {
        electric: [result.electromagnetic.electric.x, result.electromagnetic.electric.y, result.electromagnetic.electric.z],
        magnetic: [result.electromagnetic.magnetic.x, result.electromagnetic.magnetic.y, result.electromagnetic.magnetic.z]
      },
      strongForce: [result.strongForce.x, result.strongForce.y, result.strongForce.z],
      weakForce: [result.weakForce.x, result.weakForce.y, result.weakForce.z]
    }
  })
}

// 批量计算多个点的场
function handleCalculateFieldsBatch(id: number, data: { points: Array<{ position: number[]; time: number; mass: number; charge: number }> }) {
  if (!unifiedFieldCalculator) {
    throw new Error('Calculator not initialized')
  }

  const results = data.points.map(point => {
    const position = { x: point.position[0], y: point.position[1], z: point.position[2] }
    const field = unifiedFieldCalculator!.calculateField(position, point.time, point.mass, point.charge)
    
    return {
      spacetime: {
        position: [field.spacetime.position.x, field.spacetime.position.y, field.spacetime.position.z],
        time: field.spacetime.time,
        curvature: field.spacetime.curvature,
        energyDensity: field.spacetime.energyDensity,
        momentum: [field.spacetime.momentum.x, field.spacetime.momentum.y, field.spacetime.momentum.z]
      },
      gravitational: [field.gravitational.x, field.gravitational.y, field.gravitational.z],
      electromagnetic: {
        electric: [field.electromagnetic.electric.x, field.electromagnetic.electric.y, field.electromagnetic.electric.z],
        magnetic: [field.electromagnetic.magnetic.x, field.electromagnetic.magnetic.y, field.electromagnetic.magnetic.z]
      },
      strongForce: [field.strongForce.x, field.strongForce.y, field.strongForce.z],
      weakForce: [field.weakForce.x, field.weakForce.y, field.weakForce.z]
    }
  })

  sendResponse(id, 'FIELDS_BATCH_CALCULATED', { results })
}

// 清理缓存
function handleClearCache() {
  curvatureCache.clear()
  sendResponse(0, 'CACHE_CLEARED', { success: true })
}

// 更新参数
function handleUpdateParameters(params: PhysicsParameters) {
  if (!params) {
    throw new Error('Missing physics parameters')
  }

  // 重新初始化计算器实例
  spacetimeCalculator = new SpacetimeStateCalculator(params)
  gravitationalCalculator = new GravitationalFieldCalculator(params)
  electromagneticCalculator = new ElectromagneticFieldCalculator(params)
  unifiedFieldCalculator = new UnifiedFieldCalculator(
    params,
    spacetimeCalculator,
    gravitationalCalculator,
    electromagneticCalculator,
    curvatureCache
  )

  sendResponse(0, 'PARAMETERS_UPDATED', { success: true })
}

// 发送响应
function sendResponse(id: number, type: string, data?: any) {
  const response: WorkerResponse = {
    id,
    type,
    ...data
  }
  self.postMessage(response)
}

// 导出 Worker 类型
export default {} as typeof Worker & (new () => Worker)