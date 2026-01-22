// 统一场论可视化系统 - AI驱动的性能优化器
// 版本: v1.0
// 功能: 实现AI驱动的性能优化和智能渲染

class AIOptimizer {
  constructor() {
    this.performanceData = new Map();
    this.renderingProfiles = new Map();
    this.learningModel = new LearningModel();
    this.optimizationHistory = [];
    this.currentProfile = null;
    this.init();
  }

  init() {
    console.log('🤖 AI优化器初始化');
    this.initPerformanceData();
    this.initRenderingProfiles();
    this.initLearningModel();
  }

  initPerformanceData() {
    // 初始化性能数据收集
    this.performanceData.set('device', this.detectDevice());
    this.performanceData.set('browser', this.detectBrowser());
    this.performanceData.set('hardware', this.detectHardware());
    console.log('📊 性能数据初始化完成');
  }

  initRenderingProfiles() {
    // 创建预定义渲染配置文件
    this.createRenderingProfiles();
    console.log('🎨 渲染配置文件初始化完成');
  }

  initLearningModel() {
    // 初始化学习模型
    this.learningModel.init();
    console.log('🧠 学习模型初始化完成');
  }

  detectDevice() {
    return {
      type: this.getDeviceType(),
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio
    };
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    return {
      name: this.getBrowserName(userAgent),
      version: this.getBrowserVersion(userAgent),
      userAgent: userAgent
    };
  }

  detectHardware() {
    return {
      cpuCores: navigator.hardwareConcurrency || 4,
      memory: this.estimateMemory(),
      gpu: this.detectGPU()
    };
  }

  getDeviceType() {
    const width = window.screen.width;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'other';
  }

  getBrowserVersion(userAgent) {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'unknown';
  }

  estimateMemory() {
    if (navigator.deviceMemory) {
      return navigator.deviceMemory;
    }
    return 4; // 默认估计
  }

  detectGPU() {
    if (navigator.gpu) {
      return 'webgpu_supported';
    }
    return 'webgpu_not_supported';
  }

  createRenderingProfiles() {
    // 高性能配置
    this.renderingProfiles.set('high_performance', {
      raytracing: {
        enabled: true,
        quality: 'high',
        maxBounces: 8,
        samplesPerPixel: 16
      },
      pathTracing: {
        enabled: true,
        quality: 'high',
        samplesPerPixel: 32
      },
      volumeRendering: {
        enabled: true,
        quality: 'high',
        raySteps: 200
      },
      antialiasing: 'msaa_8x',
      shadowQuality: 'high',
      textureQuality: 'ultra'
    });

    // 平衡配置
    this.renderingProfiles.set('balanced', {
      raytracing: {
        enabled: true,
        quality: 'medium',
        maxBounces: 4,
        samplesPerPixel: 8
      },
      pathTracing: {
        enabled: false,
        quality: 'medium',
        samplesPerPixel: 16
      },
      volumeRendering: {
        enabled: true,
        quality: 'medium',
        raySteps: 100
      },
      antialiasing: 'msaa_4x',
      shadowQuality: 'medium',
      textureQuality: 'high'
    });

    // 低性能配置
    this.renderingProfiles.set('low_performance', {
      raytracing: {
        enabled: false,
        quality: 'low',
        maxBounces: 2,
        samplesPerPixel: 4
      },
      pathTracing: {
        enabled: false,
        quality: 'low',
        samplesPerPixel: 8
      },
      volumeRendering: {
        enabled: false,
        quality: 'low',
        raySteps: 50
      },
      antialiasing: 'fxaa',
      shadowQuality: 'low',
      textureQuality: 'medium'
    });

    // 移动设备配置
    this.renderingProfiles.set('mobile', {
      raytracing: {
        enabled: false,
        quality: 'low',
        maxBounces: 1,
        samplesPerPixel: 2
      },
      pathTracing: {
        enabled: false,
        quality: 'low',
        samplesPerPixel: 4
      },
      volumeRendering: {
        enabled: false,
        quality: 'low',
        raySteps: 30
      },
      antialiasing: 'fxaa',
      shadowQuality: 'low',
      textureQuality: 'low'
    });
  }

  getOptimalRenderingProfile(scene) {
    // 分析场景复杂度
    const complexity = this.analyzeSceneComplexity(scene);
    const deviceScore = this.calculateDeviceScore();
    const performanceScore = this.calculatePerformanceScore(complexity, deviceScore);

    // 基于性能分数选择最佳配置
    if (performanceScore >= 80) {
      this.currentProfile = this.renderingProfiles.get('high_performance');
    } else if (performanceScore >= 60) {
      this.currentProfile = this.renderingProfiles.get('balanced');
    } else if (performanceScore >= 30) {
      this.currentProfile = this.renderingProfiles.get('low_performance');
    } else {
      this.currentProfile = this.renderingProfiles.get('mobile');
    }

    // 使用学习模型优化配置
    this.currentProfile = this.learningModel.optimizeProfile(this.currentProfile, scene);

    return this.currentProfile;
  }

  analyzeSceneComplexity(scene) {
    let complexity = 0;

    // 基于对象数量的复杂度
    complexity += scene.objects.length * 0.5;

    // 基于光源数量的复杂度
    complexity += scene.lights.length * 0.3;

    // 基于材质复杂度
    complexity += Object.keys(scene.materials).length * 0.1;

    // 基于体积数据的复杂度
    if (scene.hasVolumeData) {
      complexity += 50;
    }

    // 基于体素数据的复杂度
    if (scene.hasVoxelData) {
      complexity += 30;
    }

    return Math.min(100, complexity);
  }

  calculateDeviceScore() {
    const hardware = this.performanceData.get('hardware');
    const device = this.performanceData.get('device');
    const browser = this.performanceData.get('browser');

    let score = 0;

    // CPU分数
    score += hardware.cpuCores * 5;

    // 内存分数
    score += hardware.memory * 10;

    // GPU分数
    if (hardware.gpu === 'webgpu_supported') {
      score += 50;
    } else {
      score += 20;
    }

    // 设备类型分数
    if (device.type === 'desktop') {
      score += 30;
    } else if (device.type === 'tablet') {
      score += 15;
    } else {
      score += 5;
    }

    // 浏览器分数
    if (browser.name === 'chrome' || browser.name === 'edge') {
      score += 20;
    } else if (browser.name === 'firefox') {
      score += 15;
    } else {
      score += 10;
    }

    return Math.min(100, score);
  }

  calculatePerformanceScore(complexity, deviceScore) {
    // 基于场景复杂度和设备性能计算综合分数
    const baseScore = deviceScore - (complexity * 0.3);
    return Math.max(0, Math.min(100, baseScore));
  }

  optimizeRendering(scene, camera, options = {}) {
    const startTime = performance.now();
    
    // 获取最佳渲染配置
    const profile = this.getOptimalRenderingProfile(scene);
    
    // 应用配置到场景
    this.applyProfileToScene(scene, profile);
    
    // 智能渲染路径选择
    const renderPath = this.selectRenderPath(scene, profile);
    
    // 记录优化结果
    const endTime = performance.now();
    this.recordOptimization({
      sceneComplexity: this.analyzeSceneComplexity(scene),
      deviceScore: this.calculateDeviceScore(),
      renderPath: renderPath,
      optimizationTime: endTime - startTime,
      profile: profile
    });
    
    return {
      profile: profile,
      renderPath: renderPath,
      optimizedScene: scene
    };
  }

  applyProfileToScene(scene, profile) {
    // 应用渲染配置到场景
    scene.renderingSettings = {
      ...scene.renderingSettings,
      ...profile
    };
  }

  selectRenderPath(scene, profile) {
    const deviceScore = this.calculateDeviceScore();
    const complexity = this.analyzeSceneComplexity(scene);
    
    if (deviceScore >= 80 && complexity >= 70) {
      return 'webgpu';
    } else if (deviceScore >= 70 && complexity >= 50) {
      return 'photon_mapping';
    } else if (deviceScore >= 60 && complexity >= 30) {
      return 'realtime_raytracing';
    } else if (complexity >= 20) {
      return 'path_tracing';
    } else {
      return 'raytracing';
    }
  }

  recordOptimization(data) {
    this.optimizationHistory.push(data);
    
    // 限制历史记录大小
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory.shift();
    }
    
    // 训练学习模型
    this.learningModel.train(this.optimizationHistory);
  }

  getPerformanceStatistics() {
    if (this.optimizationHistory.length === 0) {
      return null;
    }
    
    const avgOptimizationTime = this.optimizationHistory.reduce((sum, item) => sum + item.optimizationTime, 0) / this.optimizationHistory.length;
    const avgSceneComplexity = this.optimizationHistory.reduce((sum, item) => sum + item.sceneComplexity, 0) / this.optimizationHistory.length;
    const avgDeviceScore = this.optimizationHistory.reduce((sum, item) => sum + item.deviceScore, 0) / this.optimizationHistory.length;
    
    return {
      averageOptimizationTime: avgOptimizationTime,
      averageSceneComplexity: avgSceneComplexity,
      averageDeviceScore: avgDeviceScore,
      totalOptimizations: this.optimizationHistory.length
    };
  }

  dispose() {
    this.performanceData.clear();
    this.renderingProfiles.clear();
    this.optimizationHistory = [];
    this.learningModel.dispose();
    console.log('🧹 AI优化器资源清理完成');
  }
}

// 学习模型
class LearningModel {
  constructor() {
    this.weights = new Map();
    this.biases = new Map();
    this.trainingData = [];
    this.isTrained = false;
  }

  init() {
    // 初始化模型参数
    this.initializeWeights();
  }

  initializeWeights() {
    // 初始化权重
    this.weights.set('complexity', 0.5);
    this.weights.set('device_score', 0.5);
    this.weights.set('memory_usage', 0.3);
  }

  train(data) {
    // 简单的训练逻辑
    this.trainingData = data;
    this.isTrained = true;
  }

  optimizeProfile(profile, scene) {
    if (!this.isTrained) {
      return profile;
    }

    // 基于历史数据优化配置
    const optimizedProfile = { ...profile };
    
    // 示例优化：根据历史性能调整光线追踪质量
    const avgDeviceScore = this.trainingData.reduce((sum, item) => sum + item.deviceScore, 0) / this.trainingData.length;
    
    if (avgDeviceScore > 70) {
      optimizedProfile.raytracing.quality = 'high';
    } else if (avgDeviceScore < 40) {
      optimizedProfile.raytracing.quality = 'low';
    }
    
    return optimizedProfile;
  }

  dispose() {
    this.weights.clear();
    this.biases.clear();
    this.trainingData = [];
  }
}

// 智能渲染管理器
class SmartRenderManager {
  constructor() {
    this.aiOptimizer = new AIOptimizer();
    this.renderEngines = new Map();
    this.currentRenderEngine = null;
    this.renderStats = new Map();
  }

  init(renderEngines) {
    this.renderEngines = renderEngines;
    console.log('🎮 智能渲染管理器初始化');
  }

  async render(canvas, scene, camera, options = {}) {
    // 优化渲染配置
    const optimizationResult = this.aiOptimizer.optimizeRendering(scene, camera, options);
    
    // 选择渲染引擎
    this.currentRenderEngine = this.selectRenderEngine(optimizationResult.renderPath);
    
    if (!this.currentRenderEngine) {
      console.error('找不到合适的渲染引擎');
      return null;
    }
    
    // 执行渲染
    const startTime = performance.now();
    const result = await this.currentRenderEngine.render(canvas, scene, camera, {
      ...options,
      ...optimizationResult.profile
    });
    const endTime = performance.now();
    
    // 记录渲染统计数据
    this.recordRenderStats({
      renderPath: optimizationResult.renderPath,
      renderTime: endTime - startTime,
      sceneComplexity: this.aiOptimizer.analyzeSceneComplexity(scene),
      deviceScore: this.aiOptimizer.calculateDeviceScore()
    });
    
    return {
      ...result,
      optimizationResult: optimizationResult
    };
  }

  selectRenderEngine(renderPath) {
    switch (renderPath) {
      case 'webgpu':
        return this.renderEngines.get('webgpu');
      case 'photon_mapping':
        return this.renderEngines.get('photonMapping');
      case 'realtime_raytracing':
        return this.renderEngines.get('realtimeRaytracing');
      case 'path_tracing':
        return this.renderEngines.get('pathtracing');
      case 'raytracing':
        return this.renderEngines.get('raytracing');
      case 'volume':
        return this.renderEngines.get('volume');
      case 'voxel':
        return this.renderEngines.get('voxel');
      default:
        return this.renderEngines.get('raytracing');
    }
  }

  recordRenderStats(stats) {
    this.renderStats.set(Date.now(), stats);
    
    // 限制统计数据大小
    if (this.renderStats.size > 100) {
      const oldestKey = [...this.renderStats.keys()][0];
      this.renderStats.delete(oldestKey);
    }
  }

  getRenderStatistics() {
    if (this.renderStats.size === 0) {
      return null;
    }
    
    const stats = Array.from(this.renderStats.values());
    const avgRenderTime = stats.reduce((sum, item) => sum + item.renderTime, 0) / stats.length;
    const avgSceneComplexity = stats.reduce((sum, item) => sum + item.sceneComplexity, 0) / stats.length;
    
    return {
      averageRenderTime: avgRenderTime,
      averageSceneComplexity: avgSceneComplexity,
      totalRenders: stats.length,
      renderPaths: [...new Set(stats.map(item => item.renderPath))]
    };
  }

  dispose() {
    this.aiOptimizer.dispose();
    this.renderStats.clear();
    console.log('🧹 智能渲染管理器资源清理完成');
  }
}

// 导出AI优化器实例
const aiOptimizer = new AIOptimizer();
const smartRenderManager = new SmartRenderManager();

window.AIOptimizer = AIOptimizer;
window.SmartRenderManager = SmartRenderManager;
window.aiOptimizer = aiOptimizer;
window.smartRenderManager = smartRenderManager;

console.log('🚀 AI优化器系统初始化完成');
