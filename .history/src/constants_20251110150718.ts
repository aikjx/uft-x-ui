

// 统一场论核心公式数据
export const FORMULAS = [
  {
    id: 1,
    name: '时空同一化方程',
    expression: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    description: '描述空间点的运动轨迹，揭示时间与空间的统一关系',
    category: '时空方程'
  },
  {
    id: 2,
    name: '三维螺旋时空方程',
    expression: '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
    description: '描述空间的螺旋运动，展示时空的动态特性',
    category: '时空方程'
  },
  {
    id: 3,
    name: '质量定义方程',
    expression: 'm = k \\cdot \\frac{dn}{d\\Omega}',
    description: '定义质量与空间运动之间的关系',
    category: '基础定义'
  },
  {
    id: 4,
    name: '引力场定义方程',
    expression: '\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}',
    description: '定义引力场与空间运动的关系',
    category: '场方程'
  },
  {
    id: 5,
    name: '静止动量方程',
    expression: '\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}',
    description: '描述物体静止状态下的动量',
    category: '动量方程'
  },
  {
    id: 6,
    name: '运动动量方程',
    expression: '\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})',
    description: '描述物体运动状态下的动量',
    category: '动量方程'
  },
  {
    id: 7,
    name: '宇宙大统一方程（力方程）',
    expression: 'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
    description: '统一描述自然界所有力的方程',
    category: '统一方程'
  },
  {
    id: 8,
    name: '空间波动方程',
    expression: '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
    description: '描述空间波动的传播规律',
    category: '波动方程'
  },
  {
    id: 9,
    name: '电荷定义方程',
    expression: 'q = k\'k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}',
    description: '定义电荷与空间运动的关系',
    category: '基础定义'
  },
  {
    id: 10,
    name: '电场定义方程',
    expression: '\\vec{E} = -\\frac{kk\'}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
    description: '定义电场与电荷运动的关系',
    category: '场方程'
  },
  {
    id: 11,
    name: '磁场定义方程',
    expression: '\\vec{B} = \\frac{\\mu_{0} \\gamma k k\'}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
    description: '定义磁场与运动电荷的关系',
    category: '场方程'
  },
  {
    id: 12,
    name: '变化的引力场产生电磁场',
    expression: '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})',
    description: '描述引力场变化如何产生电磁场',
    category: '场方程'
  },
  {
    id: 13,
    name: '磁矢势方程',
    expression: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
    description: '描述磁矢势与磁场的关系',
    category: '场方程'
  },
  {
    id: 14,
    name: '变化的引力场产生电场',
    expression: '\\vec{E} = -f\\frac{d\\vec{A}}{dt}',
    description: '描述引力场变化如何产生电场',
    category: '场方程'
  },
  {
    id: 15,
    name: '变化的磁场产生引力场和电场',
    expression: '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}',
    description: '描述磁场变化如何产生引力场和电场',
    category: '场方程'
  },
  {
    id: 16,
    name: '统一场论能量方程',
    expression: 'e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}',
    description: '描述能量与质量的等价关系',
    category: '能量方程'
  },
  {
    id: 17,
    name: '光速飞行器动力学方程',
    expression: '\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}',
    description: '描述光速飞行器的动力学原理',
    category: '动力学方程'
  },
  {
    id: 18,
    name: '核力场定义方程',
    expression: '\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}',
    description: '定义核力场与空间运动的关系',
    category: '场方程'
  },
  {
    id: 19,
    name: '引力光速统一方程',
    expression: 'Z = Gc/2',
    description: '统一描述引力常数与光速的关系',
    category: '统一方程'
  }
];

/**
 * 全局动画变体常量
 */
export const ANIMATION_VARIANTS = {
  // 容器动画变体
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  // 项目动画变体
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  },

  // 公式动画变体
  formulaVariants: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  },

  // 卡片动画变体
  cardVariants: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      y: -8,
      boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.2)',
      transition: {
        duration: 0.3
      }
    }
  },

  // 按钮动画变体
  buttonVariants: {
    hover: {
      scale: 1.03,
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.97,
      transition: {
        duration: 0.1
      }
    }
  },

  // 淡入动画变体
  fadeInVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8
      }
    }
  },

  // 滑入动画变体
  slideInVariants: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  }
};

/**
 * 主题颜色常量
 */
export const THEME_COLORS = {
  primary: {
    DEFAULT: '#3b82f6', // 主蓝色
    light: '#60a5fa',
    dark: '#2563eb'
  },
  secondary: {
    DEFAULT: '#8b5cf6', // 紫色
    light: '#a78bfa',
    dark: '#7c3aed'
  },
  accent: {
    DEFAULT: '#06b6d4', // 青色
    light: '#22d3ee',
    dark: '#0891b2'
  },
  background: {
    DEFAULT: '#0f172a', // 深蓝黑色背景
    surface: '#1e293b', // 卡片背景
    elevated: '#334155' // 高亮背景
  },
  text: {
    DEFAULT: '#f8fafc', // 主文本
    muted: '#cbd5e1', // 次要文本
    disabled: '#94a3b8' // 禁用文本
  }
};

/**
 * 布局常量
 */
export const LAYOUT = {
  headerHeight: '64px',
  footerHeight: '72px',
  sidebarWidth: '240px',
  contentMaxWidth: '1200px',
  gutter: '24px',
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    full: '9999px'
  }
};

/**
 * 动画配置常量
 */
export const ANIMATION_CONFIG = {
  defaultDuration: 0.5,
  fastDuration: 0.3,
  slowDuration: 0.8,
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    cubicBezier: [0.22, 1, 0.36, 1]
  }
};

/**
 * 响应式断点
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

/**
 * 粒子背景配置
 */
export const PARTICLE_CONFIG = {
  count: 50,
  minSize: 1,
  maxSize: 3,
  minSpeed: 0.1,
  maxSpeed: 0.5,
  color: '#3b82f6',
  opacity: 0.5,
  connectDistance: 150
};

/**
 * 3D可视化配置
 */
export const VISUALIZATION_CONFIG = {
  // 场景配置
  backgroundColor: 0x0a0a14,
  clearColor: 0x0a0a14,
  clearAlpha: 1,
  
  // 相机配置
  fov: 60,
  near: 0.1,
  far: 1000,
  maxCameraDistance: 100,
  minCameraDistance: 5,
  
  // 辅助线配置
  showGrid: true,
  gridSize: 20,
  gridDivisions: 20,
  showAxes: true,
  axesSize: 10,
  
  // 光照配置
  defaultAmbientLightIntensity: 0.6,
  defaultDirectionalLightIntensity: 0.8,
  
  // 粒子系统配置
  particles: {
    count: 1000,
    size: 0.02,
    color: 0x00ffff,
    velocity: 0.01,
    maxAge: 3000
  },
  
  // 场配置
  field: {
    resolution: 20,
    range: 10,
    arrowSize: 0.5
  },
  
  // 动画配置
  animation: {
    duration: 10000,
    easing: 'easeInOutSine'
  },
  
  // 性能配置
  performance: {
    antialiasing: true,
    autoPixelRatio: true,
    maxFPS: 60,
    // 新增性能优化配置
    adaptiveQuality: true,
    minParticles: 500,
    maxParticles: 2000,
    qualityThresholdFPS: 30,
    performanceModeThresholdFPS: 20,
    maxDrawCalls: 100,
    enableOcclusionCulling: true,
    enableLevelOfDetail: true,
    textureCompression: true,
    // 渲染优化
    enableShadowMap: false,
    shadowMapResolution: 512,
    enableShadows: false,
    // 内存优化
    maxMemoryUsageMB: 512,
    // 动画优化
    animationFrameSkip: 0,
    // 粒子系统优化
    particleLODLevels: 3,
    particleDistanceFactor: 0.05
  }
};