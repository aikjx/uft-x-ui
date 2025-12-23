

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