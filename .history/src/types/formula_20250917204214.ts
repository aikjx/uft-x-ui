export interface Formula {
  id: string
  name: string
  description: string
  equation: string
  categoryId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  keywords: string[]
  relatedFormulas?: string[]
  parameters: FormulaParameter[]
  visualization: VisualizationConfig
  theory: {
    background: string
    significance: string
    applications: string[]
  }
  examples: FormulaExample[]
  references: Reference[]
}

export interface FormulaParameter {
  name: string
  symbol: string
  description: string
  unit?: string
  defaultValue: number
  min: number
  max: number
  step: number
  type: 'slider' | 'input' | 'select'
  options?: { label: string; value: number }[]
}

export interface VisualizationConfig {
  type: '3d' | '2d' | 'graph' | 'animation'
  renderer: 'three' | 'canvas' | 'd3' | 'svg'
  dimensions: {
    width: number
    height: number
  }
  camera?: {
    position: [number, number, number]
    target: [number, number, number]
    fov: number
  }
  lighting?: {
    ambient: number
    directional: {
      color: string
      intensity: number
      position: [number, number, number]
    }[]
  }
  materials?: {
    [key: string]: {
      color: string
      opacity: number
      metalness?: number
      roughness?: number
    }
  }
  animations?: {
    name: string
    duration: number
    loop: boolean
    autoplay: boolean
  }[]
}

export interface FormulaExample {
  title: string
  description: string
  parameters: { [key: string]: number }
  expectedResult: string
  explanation: string
}

export interface Reference {
  title: string
  author: string
  year: number
  url?: string
  type: 'paper' | 'book' | 'website' | 'video'
}

export interface FormulaCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  order: number
}

export interface VisualizationState {
  isPlaying: boolean
  currentTime: number
  parameters: { [key: string]: number }
  viewMode: 'default' | 'wireframe' | 'points'
  showAxes: boolean
  showGrid: boolean
  showLabels: boolean
}

export interface FormulaRelationship {
  fromId: string
  toId: string
  type: 'derives' | 'related' | 'prerequisite' | 'application'
  description: string
  strength: number // 0-1, 关系强度
}