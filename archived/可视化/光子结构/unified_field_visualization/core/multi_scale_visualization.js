// 统一场论可视化系统 - 多尺度可视化系统
// 版本: v1.0
// 功能: 实现从量子到宇宙的全尺度可视化

class MultiScaleVisualization {
  constructor() {
    this.scales = new Map();
    this.currentScale = null;
    this.scaleTransitions = new Map();
    this.visualizationEngines = new Map();
    this.scaleData = new Map();
    this.init();
  }

  init() {
    console.log('🌌 多尺度可视化系统初始化');
    this.initScales();
    this.initScaleTransitions();
    this.initVisualizationEngines();
    console.log('🔭 多尺度可视化系统初始化完成');
  }

  initScales() {
    // 初始化不同尺度
    this.createQuantumScale();
    this.createAtomicScale();
    this.createMolecularScale();
    this.createMacroscopicScale();
    this.createCelestialScale();
    this.createCosmicScale();
    this.createUniversalScale();
    
    // 设置默认尺度
    this.currentScale = 'macroscopic';
    console.log('📏 尺度系统初始化完成');
  }

  createQuantumScale() {
    const quantumScale = {
      name: 'quantum',
      label: '量子尺度',
      range: { min: 1e-18, max: 1e-10 },
      unit: '米',
      description: '处理亚原子粒子、量子场和基本相互作用',
      physicsModel: 'quantum_field_theory',
      renderingEngine: 'quantum_renderer',
      features: [
        'wave_function_visualization',
        'quantum_tunneling',
        'entanglement_visualization',
        'uncertainty_principle',
        'particle_interactions'
      ],
      resolution: 1e-12,
      timeScale: 1e-12
    };
    this.scales.set('quantum', quantumScale);
  }

  createAtomicScale() {
    const atomicScale = {
      name: 'atomic',
      label: '原子尺度',
      range: { min: 1e-10, max: 1e-6 },
      unit: '米',
      description: '处理原子、分子和化学键',
      physicsModel: 'quantum_mechanics',
      renderingEngine: 'atomic_renderer',
      features: [
        'atomic_orbitals',
        'electron_configurations',
        'molecular_bonds',
        'atomic_forces',
        'spectroscopy'
      ],
      resolution: 1e-10,
      timeScale: 1e-9
    };
    this.scales.set('atomic', atomicScale);
  }

  createMolecularScale() {
    const molecularScale = {
      name: 'molecular',
      label: '分子尺度',
      range: { min: 1e-9, max: 1e-3 },
      unit: '米',
      description: '处理分子、蛋白质和纳米结构',
      physicsModel: 'molecular_dynamics',
      renderingEngine: 'molecular_renderer',
      features: [
        'molecular_structures',
        'protein_folding',
        'chemical_reactions',
        'nanomaterials',
        'fluid_dynamics'
      ],
      resolution: 1e-9,
      timeScale: 1e-6
    };
    this.scales.set('molecular', molecularScale);
  }

  createMacroscopicScale() {
    const macroscopicScale = {
      name: 'macroscopic',
      label: '宏观尺度',
      range: { min: 1e-3, max: 1e3 },
      unit: '米',
      description: '处理日常物体和人类尺度的现象',
      physicsModel: 'classical_physics',
      renderingEngine: 'standard_renderer',
      features: [
        'classical_mechanics',
        'thermodynamics',
        'fluid_dynamics',
        'electromagnetism',
        'optics'
      ],
      resolution: 1e-3,
      timeScale: 1e-3
    };
    this.scales.set('macroscopic', macroscopicScale);
  }

  createCelestialScale() {
    const celestialScale = {
      name: 'celestial',
      label: '天体尺度',
      range: { min: 1e3, max: 1e12 },
      unit: '米',
      description: '处理行星、恒星和太阳系',
      physicsModel: 'celestial_mechanics',
      renderingEngine: 'celestial_renderer',
      features: [
        'orbital_motion',
        'gravitational_fields',
        'stellar_evolution',
        'planetary_systems',
        'tidal_forces'
      ],
      resolution: 1e3,
      timeScale: 1e3
    };
    this.scales.set('celestial', celestialScale);
  }

  createCosmicScale() {
    const cosmicScale = {
      name: 'cosmic',
      label: '宇宙尺度',
      range: { min: 1e12, max: 1e20 },
      unit: '米',
      description: '处理星系、星系团和宇宙结构',
      physicsModel: 'cosmology',
      renderingEngine: 'cosmic_renderer',
      features: [
        'galaxy_formation',
        'dark_matter',
        'dark_energy',
        'cosmic_expansion',
        'gravitational_lensing'
      ],
      resolution: 1e12,
      timeScale: 1e6
    };
    this.scales.set('cosmic', cosmicScale);
  }

  createUniversalScale() {
    const universalScale = {
      name: 'universal',
      label: '宇宙学尺度',
      range: { min: 1e20, max: Infinity },
      unit: '米',
      description: '处理整个宇宙和宇宙学现象',
      physicsModel: 'cosmological_standard_model',
      renderingEngine: 'universal_renderer',
      features: [
        'big_bang',
        'cosmic_microwave_background',
        'inflation',
        'cosmological_constant',
        'multiverse'
      ],
      resolution: 1e20,
      timeScale: 1e9
    };
    this.scales.set('universal', universalScale);
  }

  initScaleTransitions() {
    // 初始化尺度间过渡
    this.createScaleTransition('quantum', 'atomic');
    this.createScaleTransition('atomic', 'molecular');
    this.createScaleTransition('molecular', 'macroscopic');
    this.createScaleTransition('macroscopic', 'celestial');
    this.createScaleTransition('celestial', 'cosmic');
    this.createScaleTransition('cosmic', 'universal');
    console.log('🔄 尺度过渡系统初始化完成');
  }

  createScaleTransition(fromScale, toScale) {
    const transition = {
      from: fromScale,
      to: toScale,
      duration: 2000, // 过渡时间（毫秒）
      easing: 'ease-in-out',
      interpolation: 'logarithmic',
      dataMapping: this.createDataMapping(fromScale, toScale)
    };
    this.scaleTransitions.set(`${fromScale}_to_${toScale}`, transition);
  }

  createDataMapping(fromScale, toScale) {
    // 创建尺度间的数据映射
    const from = this.scales.get(fromScale);
    const to = this.scales.get(toScale);
    
    return (data) => {
      // 对数尺度映射
      const fromRange = Math.log10(from.range.max) - Math.log10(from.range.min);
      const toRange = Math.log10(to.range.max) - Math.log10(to.range.min);
      const scaleFactor = toRange / fromRange;
      
      // 映射数据
      return {
        ...data,
        scale: {
          ...data.scale,
          size: Math.pow(10, Math.log10(data.scale.size) * scaleFactor),
          distance: Math.pow(10, Math.log10(data.scale.distance) * scaleFactor),
          time: Math.pow(10, Math.log10(data.scale.time) * scaleFactor)
        }
      };
    };
  }

  initVisualizationEngines() {
    // 初始化不同尺度的可视化引擎
    this.createQuantumRenderer();
    this.createAtomicRenderer();
    this.createMolecularRenderer();
    this.createStandardRenderer();
    this.createCelestialRenderer();
    this.createCosmicRenderer();
    this.createUniversalRenderer();
    console.log('🎨 可视化引擎初始化完成');
  }

  createQuantumRenderer() {
    const quantumRenderer = {
      name: 'quantum_renderer',
      type: 'quantum',
      features: [
        'wave_function_visualization',
        'probability_density',
        'quantum_states',
        'entanglement_visualization'
      ],
      render: (data, canvas, options) => {
        this.renderQuantumScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('quantum_renderer', quantumRenderer);
  }

  createAtomicRenderer() {
    const atomicRenderer = {
      name: 'atomic_renderer',
      type: 'atomic',
      features: [
        'atomic_orbitals',
        'electron_configurations',
        'atomic_forces'
      ],
      render: (data, canvas, options) => {
        this.renderAtomicScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('atomic_renderer', atomicRenderer);
  }

  createMolecularRenderer() {
    const molecularRenderer = {
      name: 'molecular_renderer',
      type: 'molecular',
      features: [
        'molecular_structures',
        'chemical_bonds',
        'molecular_dynamics'
      ],
      render: (data, canvas, options) => {
        this.renderMolecularScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('molecular_renderer', molecularRenderer);
  }

  createStandardRenderer() {
    const standardRenderer = {
      name: 'standard_renderer',
      type: 'standard',
      features: [
        'classical_physics',
        'real_time_rendering',
        'interactive_visualization'
      ],
      render: (data, canvas, options) => {
        this.renderMacroscopicScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('standard_renderer', standardRenderer);
  }

  createCelestialRenderer() {
    const celestialRenderer = {
      name: 'celestial_renderer',
      type: 'celestial',
      features: [
        'orbital_visualization',
        'gravitational_fields',
        'stellar_rendering'
      ],
      render: (data, canvas, options) => {
        this.renderCelestialScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('celestial_renderer', celestialRenderer);
  }

  createCosmicRenderer() {
    const cosmicRenderer = {
      name: 'cosmic_renderer',
      type: 'cosmic',
      features: [
        'galaxy_rendering',
        'cosmic_structures',
        'dark_matter_visualization'
      ],
      render: (data, canvas, options) => {
        this.renderCosmicScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('cosmic_renderer', cosmicRenderer);
  }

  createUniversalRenderer() {
    const universalRenderer = {
      name: 'universal_renderer',
      type: 'universal',
      features: [
        'cosmic_expansion',
        'big_bang_visualization',
        'multiverse_concepts'
      ],
      render: (data, canvas, options) => {
        this.renderUniversalScale(data, canvas, options);
      }
    };
    this.visualizationEngines.set('universal_renderer', universalRenderer);
  }

  // 渲染方法
  renderQuantumScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染波函数
    if (data.waveFunction) {
      this.renderWaveFunction(ctx, data.waveFunction, canvas);
    }
    
    // 渲染概率密度
    if (data.probabilityDensity) {
      this.renderProbabilityDensity(ctx, data.probabilityDensity, canvas);
    }
  }

  renderAtomicScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染原子轨道
    if (data.atom) {
      this.renderAtomicOrbitals(ctx, data.atom, canvas);
    }
  }

  renderMolecularScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染分子结构
    if (data.molecule) {
      this.renderMolecularStructure(ctx, data.molecule, canvas);
    }
  }

  renderMacroscopicScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染宏观物体
    if (data.objects) {
      data.objects.forEach(obj => {
        this.renderObject(ctx, obj, canvas);
      });
    }
  }

  renderCelestialScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染天体系统
    if (data.celestialSystem) {
      this.renderCelestialSystem(ctx, data.celestialSystem, canvas);
    }
  }

  renderCosmicScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染宇宙结构
    if (data.cosmicStructure) {
      this.renderCosmicStructure(ctx, data.cosmicStructure, canvas);
    }
  }

  renderUniversalScale(data, canvas, options) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染宇宙学现象
    if (data.universe) {
      this.renderUniverse(ctx, data.universe, canvas);
    }
  }

  // 辅助渲染方法
  renderWaveFunction(ctx, waveFunction, canvas) {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const amplitude = canvas.height / 4;
    const wavelength = canvas.width / 10;
    
    for (let x = 0; x < canvas.width; x++) {
      const t = Date.now() * 0.001;
      const y = centerY + amplitude * Math.sin((x / wavelength) * 2 * Math.PI - t) * 
               Math.exp(-Math.pow((x - centerX) / (canvas.width / 4), 2));
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }

  renderProbabilityDensity(ctx, probabilityDensity, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = canvas.width / 3;
    
    for (let r = 0; r < maxRadius; r += 2) {
      const probability = Math.exp(-Math.pow(r / (maxRadius / 2), 2));
      const alpha = probability * 0.5;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
      ctx.fill();
    }
  }

  renderAtomicOrbitals(ctx, atom, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 渲染原子核
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 0, 1)';
    ctx.fill();
    
    // 渲染电子轨道
    for (let i = 0; i < atom.electronShells; i++) {
      const radius = 30 + i * 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 - i * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 渲染电子
      const electronCount = 2 * (i + 1) * (i + 1);
      for (let j = 0; j < electronCount; j++) {
        const angle = (j / electronCount) * 2 * Math.PI + Date.now() * 0.001;
        const electronX = centerX + radius * Math.cos(angle);
        const electronY = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(electronX, electronY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 255, 255, 1)';
        ctx.fill();
      }
    }
  }

  renderMolecularStructure(ctx, molecule, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 渲染原子
    molecule.atoms.forEach((atom, index) => {
      const x = centerX + atom.position.x * 50;
      const y = centerY + atom.position.y * 50;
      
      ctx.beginPath();
      ctx.arc(x, y, atom.size * 10, 0, 2 * Math.PI);
      ctx.fillStyle = atom.color || 'rgba(0, 255, 0, 1)';
      ctx.fill();
      
      // 渲染化学键
      molecule.bonds.forEach(bond => {
        if (bond.from === index) {
          const toAtom = molecule.atoms[bond.to];
          const toX = centerX + toAtom.position.x * 50;
          const toY = centerY + toAtom.position.y * 50;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
          ctx.lineWidth = bond.strength * 2;
          ctx.stroke();
        }
      });
    });
  }

  renderObject(ctx, obj, canvas) {
    const x = canvas.width / 2 + obj.position.x;
    const y = canvas.height / 2 + obj.position.y;
    
    ctx.fillStyle = obj.color || 'rgba(255, 255, 255, 1)';
    ctx.fillRect(x - obj.size / 2, y - obj.size / 2, obj.size, obj.size);
  }

  renderCelestialSystem(ctx, system, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 渲染中心天体
    ctx.beginPath();
    ctx.arc(centerX, centerY, system.center.size, 0, 2 * Math.PI);
    ctx.fillStyle = system.center.color || 'rgba(255, 255, 0, 1)';
    ctx.fill();
    
    // 渲染轨道天体
    system.bodies.forEach(body => {
      const angle = body.orbitalAngle + Date.now() * body.orbitalSpeed;
      const distance = body.orbitalDistance;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, body.size, 0, 2 * Math.PI);
      ctx.fillStyle = body.color || 'rgba(0, 255, 255, 1)';
      ctx.fill();
      
      // 渲染轨道
      ctx.beginPath();
      ctx.arc(centerX, centerY, distance, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  renderCosmicStructure(ctx, structure, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 渲染星系
    structure.galaxies.forEach(galaxy => {
      const x = centerX + galaxy.position.x;
      const y = centerY + galaxy.position.y;
      
      // 渲染星系旋臂
      for (let i = 0; i < galaxy.arms; i++) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const spiralAngle = angle * galaxy.spiralFactor;
          const radius = galaxy.size * (angle / (Math.PI * 2));
          const spiralX = x + radius * Math.cos(angle + spiralAngle);
          const spiralY = y + radius * Math.sin(angle + spiralAngle);
          
          if (angle === 0) {
            ctx.moveTo(spiralX, spiralY);
          } else {
            ctx.lineTo(spiralX, spiralY);
          }
        }
        ctx.strokeStyle = galaxy.color || 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // 渲染星系中心
      ctx.beginPath();
      ctx.arc(x, y, galaxy.coreSize, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 215, 0, 1)';
      ctx.fill();
    });
  }

  renderUniverse(ctx, universe, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 渲染宇宙背景
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 30, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 渲染宇宙结构
    universe.structures.forEach(structure => {
      const x = centerX + structure.position.x;
      const y = centerY + structure.position.y;
      
      ctx.beginPath();
      ctx.arc(x, y, structure.size, 0, 2 * Math.PI);
      ctx.fillStyle = structure.color || 'rgba(100, 100, 255, 0.5)';
      ctx.fill();
    });
    
    // 渲染宇宙膨胀
    if (universe.expanding) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, universe.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 尺度管理方法
  setScale(scaleName) {
    if (this.scales.has(scaleName)) {
      this.currentScale = scaleName;
      console.log(`🌡️ 切换到尺度: ${this.scales.get(scaleName).label}`);
      return true;
    }
    return false;
  }

  getCurrentScale() {
    return this.scales.get(this.currentScale);
  }

  getScale(scaleName) {
    return this.scales.get(scaleName);
  }

  getAllScales() {
    return Array.from(this.scales.values());
  }

  // 尺度过渡方法
  async transitionToScale(targetScale, duration = 2000) {
    const fromScale = this.currentScale;
    const transition = this.scaleTransitions.get(`${fromScale}_to_${targetScale}`);
    
    if (!transition) {
      console.error(`❌ 无法找到从 ${fromScale} 到 ${targetScale} 的过渡`);
      return false;
    }
    
    console.log(`🔄 开始从 ${this.scales.get(fromScale).label} 过渡到 ${this.scales.get(targetScale).label}`);
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      const progress = (Date.now() - startTime) / duration;
      const easedProgress = this.ease(progress, transition.easing);
      
      // 计算当前状态
      const currentState = this.interpolateScales(fromScale, targetScale, easedProgress);
      
      // 渲染过渡状态
      this.renderTransitionState(currentState);
      
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    // 完成过渡
    this.currentScale = targetScale;
    console.log(`✅ 成功过渡到 ${this.scales.get(targetScale).label}`);
    return true;
  }

  ease(t, type) {
    switch (type) {
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return 1 - (1 - t) * (1 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      default:
        return t;
    }
  }

  interpolateScales(fromScale, toScale, progress) {
    const from = this.scales.get(fromScale);
    const to = this.scales.get(toScale);
    
    // 线性插值
    return {
      name: `${fromScale}_to_${toScale}`,
      label: `${from.label} → ${to.label}`,
      range: {
        min: from.range.min + (to.range.min - from.range.min) * progress,
        max: from.range.max + (to.range.max - from.range.max) * progress
      },
      resolution: from.resolution + (to.resolution - from.resolution) * progress,
      timeScale: from.timeScale + (to.timeScale - from.timeScale) * progress,
      progress: progress
    };
  }

  renderTransitionState(state) {
    // 渲染过渡状态
    console.log(`📊 过渡进度: ${Math.round(state.progress * 100)}%`);
  }

  // 数据管理方法
  setScaleData(scaleName, data) {
    this.scaleData.set(scaleName, data);
  }

  getScaleData(scaleName) {
    return this.scaleData.get(scaleName);
  }

  updateScaleData(scaleName, data) {
    const currentData = this.scaleData.get(scaleName) || {};
    this.scaleData.set(scaleName, { ...currentData, ...data });
  }

  // 渲染方法
  render(canvas, options = {}) {
    const scale = this.getCurrentScale();
    const renderer = this.visualizationEngines.get(scale.renderingEngine);
    const data = this.getScaleData(this.currentScale) || {};
    
    if (renderer) {
      renderer.render(data, canvas, options);
      return true;
    }
    return false;
  }

  // 工具方法
  calculateScaleFactor(fromScale, toScale) {
    const from = this.scales.get(fromScale);
    const to = this.scales.get(toScale);
    return Math.log10(to.range.max / from.range.min);
  }

  getScaleRange(scaleName) {
    const scale = this.scales.get(scaleName);
    return scale.range.max - scale.range.min;
  }

  getRelativeScale(physicalSize) {
    for (const [name, scale] of this.scales) {
      if (physicalSize >= scale.range.min && physicalSize <= scale.range.max) {
        return name;
      }
    }
    return 'universal'; // 默认返回最大尺度
  }

  dispose() {
    this.scales.clear();
    this.scaleTransitions.clear();
    this.visualizationEngines.clear();
    this.scaleData.clear();
    console.log('🧹 多尺度可视化系统资源清理完成');
  }
}

// 导出多尺度可视化系统实例
const multiScaleVisualization = new MultiScaleVisualization();
window.MultiScaleVisualization = MultiScaleVisualization;
window.multiScaleVisualization = multiScaleVisualization;

console.log('🌠 多尺度可视化系统初始化完成');
