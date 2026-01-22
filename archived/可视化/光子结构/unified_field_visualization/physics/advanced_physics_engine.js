// 统一场论可视化系统 - 高级物理引擎
// 版本: v2.0
// 功能: 实现更复杂的统一场论模拟，包括量子场论、相对论效应、黑洞模拟等

class AdvancedPhysicsEngine {
  constructor() {
    this.particles = new Set();
    this.fields = new Map();
    this.constants = {
      c: 299792458, // 光速 m/s
      G: 6.67430e-11, // 万有引力常数
      epsilon0: 8.8541878128e-12, // 真空介电常数
      mu0: 1.25663706212e-6, // 真空磁导率
      hbar: 1.054571817e-34, // 约化普朗克常数
      k: 1.380649e-23, // 玻尔兹曼常数
      e: 1.602176634e-19 // 电子电荷
    };
    this.simulationTime = 0;
    this.timeStep = 0.01;
    this.enabledForces = {
      gravity: true,
      electromagnetism: true,
      nuclear: false,
      quantum: false,
      darkEnergy: false
    };
    this.advancedFeatures = {
      relativity: true,
      quantumEffects: false,
      blackHolePhysics: false,
      cosmology: false,
      multiBody: true
    };
    this.parallelComputing = false;
    this.init();
  }

  init() {
    console.log('⚡ 高级物理引擎初始化');
    this.initConstants();
    this.initFields();
    this.initAdvancedFeatures();
  }

  initConstants() {
    // 计算派生常数
    this.constants.Z = this.constants.G * this.constants.c / 2; // 引力光速统一方程
    this.constants.ZPrime = this.constants.c / (8 * Math.PI * this.constants.epsilon0); // 电磁耦合常数
    this.constants.alpha = this.constants.e * this.constants.e / (4 * Math.PI * this.constants.epsilon0 * this.constants.hbar * this.constants.c); // 精细结构常数
    this.constants.PlanckLength = Math.sqrt(this.constants.hbar * this.constants.G / (this.constants.c * this.constants.c * this.constants.c)); // 普朗克长度
    this.constants.SchwarzschildRadius = 2 * this.constants.G / (this.constants.c * this.constants.c); // 史瓦西半径常数
    console.log('📊 高级物理常数初始化完成');
  }

  initFields() {
    // 创建高级场
    this.createGravitationalField();
    this.createElectromagneticField();
    this.createNuclearField();
    this.createQuantumField();
    this.createDarkEnergyField();
  }

  initAdvancedFeatures() {
    // 初始化高级功能
    this.initRelativity();
    this.initQuantumEffects();
    this.initBlackHolePhysics();
    this.initCosmology();
    console.log('🚀 高级物理功能初始化完成');
  }

  createGravitationalField() {
    const gravitationalField = {
      type: 'gravitational',
      strength: 0,
      sources: new Set(),
      calculate: (position) => {
        let field = { x: 0, y: 0, z: 0 };
        this.particles.forEach(particle => {
          if (particle.mass > 0) {
            const distance = this.calculateDistance(position, particle.position);
            if (distance > 0) {
              const forceMagnitude = this.constants.G * particle.mass / (distance * distance);
              const direction = this.calculateDirection(position, particle.position);
              field.x += forceMagnitude * direction.x;
              field.y += forceMagnitude * direction.y;
              field.z += forceMagnitude * direction.z;
            }
          }
        });
        return field;
      },
      calculateSpacetimeCurvature: (position) => {
        let curvature = 0;
        this.particles.forEach(particle => {
          if (particle.mass > 0) {
            const distance = this.calculateDistance(position, particle.position);
            if (distance > 0) {
              curvature += particle.mass / (distance * distance);
            }
          }
        });
        return curvature * this.constants.G / (this.constants.c * this.constants.c);
      }
    };
    this.fields.set('gravitational', gravitationalField);
  }

  createElectromagneticField() {
    const electromagneticField = {
      type: 'electromagnetic',
      electric: { x: 0, y: 0, z: 0 },
      magnetic: { x: 0, y: 0, z: 0 },
      sources: new Set(),
      calculateElectric: (position) => {
        let field = { x: 0, y: 0, z: 0 };
        this.particles.forEach(particle => {
          if (particle.charge !== 0) {
            const distance = this.calculateDistance(position, particle.position);
            if (distance > 0) {
              const forceMagnitude = particle.charge / (4 * Math.PI * this.constants.epsilon0 * distance * distance);
              const direction = this.calculateDirection(position, particle.position);
              field.x += forceMagnitude * direction.x;
              field.y += forceMagnitude * direction.y;
              field.z += forceMagnitude * direction.z;
            }
          }
        });
        return field;
      },
      calculateMagnetic: (position, velocity) => {
        let field = { x: 0, y: 0, z: 0 };
        this.particles.forEach(particle => {
          if (particle.charge !== 0 && (particle.velocity.x !== 0 || particle.velocity.y !== 0 || particle.velocity.z !== 0)) {
            const distance = this.calculateDistance(position, particle.position);
            if (distance > 0) {
              const direction = this.calculateDirection(position, particle.position);
              const current = {
                x: particle.charge * particle.velocity.x,
                y: particle.charge * particle.velocity.y,
                z: particle.charge * particle.velocity.z
              };
              const crossProduct = this.crossProduct(current, direction);
              const forceMagnitude = this.constants.mu0 / (4 * Math.PI) * particle.charge / (distance * distance);
              field.x += forceMagnitude * crossProduct.x;
              field.y += forceMagnitude * crossProduct.y;
              field.z += forceMagnitude * crossProduct.z;
            }
          }
        });
        return field;
      }
    };
    this.fields.set('electromagnetic', electromagneticField);
  }

  createNuclearField() {
    const nuclearField = {
      type: 'nuclear',
      strength: 0,
      range: 1e-15, // 核力范围 ~1fm
      sources: new Set(),
      calculate: (position) => {
        let field = { x: 0, y: 0, z: 0 };
        this.particles.forEach(particle => {
          if (particle.hasNuclearCharge) {
            const distance = this.calculateDistance(position, particle.position);
            if (distance < this.range) {
              const strength = this.calculateNuclearStrength(distance);
              const direction = this.calculateDirection(position, particle.position);
              field.x += strength * direction.x;
              field.y += strength * direction.y;
              field.z += strength * direction.z;
            }
          }
        });
        return field;
      },
      calculateNuclearStrength: (distance) => {
        const alphaS = 0.118; // 强耦合常数
        const lambdaQCD = 217e-9; // QCD特征尺度
        return alphaS * Math.exp(-distance / lambdaQCD) / distance;
      }
    };
    this.fields.set('nuclear', nuclearField);
  }

  createQuantumField() {
    const quantumField = {
      type: 'quantum',
      waveFunction: null,
      sources: new Set(),
      calculate: (position, time) => {
        let field = { x: 0, y: 0, z: 0 };
        this.particles.forEach(particle => {
          if (particle.isQuantum) {
            const waveFunction = this.calculateWaveFunction(particle, position, time);
            field.x += waveFunction.amplitude * Math.cos(waveFunction.phase);
            field.y += waveFunction.amplitude * Math.sin(waveFunction.phase);
          }
        });
        return field;
      },
      calculateWaveFunction: (particle, position, time) => {
        const distance = this.calculateDistance(position, particle.position);
        const k = particle.momentum / this.constants.hbar; // 波数
        const omega = particle.energy / this.constants.hbar; // 角频率
        const amplitude = Math.exp(-distance * distance / (2 * particle.wavePacketWidth * particle.wavePacketWidth));
        const phase = k * distance - omega * time;
        return { amplitude, phase };
      }
    };
    this.fields.set('quantum', quantumField);
  }

  createDarkEnergyField() {
    const darkEnergyField = {
      type: 'darkEnergy',
      cosmologicalConstant: 1e-52, // 宇宙学常数
      calculate: (position, time) => {
        return {
          x: 0,
          y: 0,
          z: this.cosmologicalConstant
        };
      }
    };
    this.fields.set('darkEnergy', darkEnergyField);
  }

  initRelativity() {
    // 初始化相对论效应
    this.relativity = {
      timeDilation: true,
      lengthContraction: true,
      massIncrease: true,
      gravitationalRedshift: true
    };
  }

  initQuantumEffects() {
    // 初始化量子效应
    this.quantumEffects = {
      waveParticleDuality: true,
      quantumTunneling: true,
      entanglement: false,
      uncertaintyPrinciple: true
    };
  }

  initBlackHolePhysics() {
    // 初始化黑洞物理
    this.blackHolePhysics = {
      eventHorizon: true,
      singularity: false,
      accretionDisk: true,
      gravitationalLensing: true,
      HawkingRadiation: false
    };
  }

  initCosmology() {
    // 初始化宇宙学
    this.cosmology = {
      expansion: true,
      darkEnergy: true,
      cosmicMicrowaveBackground: false,
      structureFormation: false
    };
  }

  addParticle(particle) {
    this.particles.add(particle);
    // 更新场源
    if (particle.mass > 0) {
      this.fields.get('gravitational').sources.add(particle);
    }
    if (particle.charge !== 0) {
      this.fields.get('electromagnetic').sources.add(particle);
    }
    if (particle.hasNuclearCharge) {
      this.fields.get('nuclear').sources.add(particle);
    }
    if (particle.isQuantum) {
      this.fields.get('quantum').sources.add(particle);
    }
  }

  removeParticle(particle) {
    this.particles.delete(particle);
    this.fields.get('gravitational').sources.delete(particle);
    this.fields.get('electromagnetic').sources.delete(particle);
    this.fields.get('nuclear').sources.delete(particle);
    this.fields.get('quantum').sources.delete(particle);
  }

  update(deltaTime) {
    this.simulationTime += deltaTime;
    
    // 并行计算优化
    if (this.parallelComputing && this.particles.size > 1000) {
      this.updateParticlesParallel(deltaTime);
    } else {
      this.updateParticles(deltaTime);
    }

    // 更新场
    this.updateFields();
  }

  updateParticles(deltaTime) {
    this.particles.forEach(particle => {
      this.updateParticle(particle, deltaTime);
    });
  }

  updateParticlesParallel(deltaTime) {
    // 简单的并行计算模拟
    const particlesArray = Array.from(this.particles);
    const batchSize = Math.max(1, Math.floor(particlesArray.length / navigator.hardwareConcurrency));
    
    for (let i = 0; i < particlesArray.length; i += batchSize) {
      const batch = particlesArray.slice(i, i + batchSize);
      batch.forEach(particle => {
        this.updateParticle(particle, deltaTime);
      });
    }
  }

  updateParticle(particle, deltaTime) {
    // 计算合力
    const forces = this.calculateForces(particle);
    
    // 计算加速度 (F = ma)
    const acceleration = {
      x: forces.x / particle.mass,
      y: forces.y / particle.mass,
      z: forces.z / particle.mass
    };

    // 更新速度
    particle.velocity.x += acceleration.x * deltaTime;
    particle.velocity.y += acceleration.y * deltaTime;
    particle.velocity.z += acceleration.z * deltaTime;

    // 应用光速限制
    this.applyLightSpeedLimit(particle);

    // 更新位置
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.position.z += particle.velocity.z * deltaTime;

    // 应用高级物理效应
    if (this.advancedFeatures.relativity) {
      this.applyRelativisticEffects(particle);
    }
    
    if (this.advancedFeatures.quantumEffects && particle.isQuantum) {
      this.applyQuantumEffects(particle, deltaTime);
    }
    
    if (this.advancedFeatures.blackHolePhysics) {
      this.applyBlackHoleEffects(particle);
    }
    
    if (this.advancedFeatures.cosmology) {
      this.applyCosmologicalEffects(particle, deltaTime);
    }
  }

  calculateForces(particle) {
    let forces = { x: 0, y: 0, z: 0 };

    // 引力
    if (this.enabledForces.gravity) {
      const gravitationalField = this.fields.get('gravitational');
      const gravityForce = gravitationalField.calculate(particle.position);
      forces.x += gravityForce.x;
      forces.y += gravityForce.y;
      forces.z += gravityForce.z;
    }

    // 电磁力
    if (this.enabledForces.electromagnetism && particle.charge !== 0) {
      const electromagneticField = this.fields.get('electromagnetic');
      const electricForce = electromagneticField.calculateElectric(particle.position);
      const magneticForce = electromagneticField.calculateMagnetic(particle.position, particle.velocity);
      
      forces.x += particle.charge * (electricForce.x + magneticForce.x);
      forces.y += particle.charge * (electricForce.y + magneticForce.y);
      forces.z += particle.charge * (electricForce.z + magneticForce.z);
    }

    // 核力
    if (this.enabledForces.nuclear && particle.hasNuclearCharge) {
      const nuclearField = this.fields.get('nuclear');
      const nuclearForce = nuclearField.calculate(particle.position);
      forces.x += nuclearForce.x;
      forces.y += nuclearForce.y;
      forces.z += nuclearForce.z;
    }

    // 量子力
    if (this.enabledForces.quantum && particle.isQuantum) {
      const quantumField = this.fields.get('quantum');
      const quantumForce = quantumField.calculate(particle.position, this.simulationTime);
      forces.x += quantumForce.x;
      forces.y += quantumForce.y;
      forces.z += quantumForce.z;
    }

    // 暗能量
    if (this.enabledForces.darkEnergy) {
      const darkEnergyField = this.fields.get('darkEnergy');
      const darkEnergyForce = darkEnergyField.calculate(particle.position, this.simulationTime);
      forces.x += darkEnergyForce.x;
      forces.y += darkEnergyForce.y;
      forces.z += darkEnergyForce.z;
    }

    return forces;
  }

  updateFields() {
    // 更新所有场的状态
    this.fields.forEach(field => {
      if (field.update) {
        field.update(this.simulationTime);
      }
    });
  }

  applyLightSpeedLimit(particle) {
    const speed = Math.sqrt(
      particle.velocity.x * particle.velocity.x +
      particle.velocity.y * particle.velocity.y +
      particle.velocity.z * particle.velocity.z
    );
    
    if (speed > this.constants.c) {
      const ratio = this.constants.c / speed;
      particle.velocity.x *= ratio;
      particle.velocity.y *= ratio;
      particle.velocity.z *= ratio;
    }
  }

  applyRelativisticEffects(particle) {
    const speed = Math.sqrt(
      particle.velocity.x * particle.velocity.x +
      particle.velocity.y * particle.velocity.y +
      particle.velocity.z * particle.velocity.z
    );
    
    if (speed > 0.1 * this.constants.c) {
      const gamma = 1 / Math.sqrt(1 - (speed * speed) / (this.constants.c * this.constants.c));
      
      // 质量增加
      if (this.relativity.massIncrease) {
        particle.mass = particle.restMass * gamma;
      }
      
      // 时间 dilation
      if (this.relativity.timeDilation) {
        particle.timeDilation = gamma;
      }
      
      // 长度收缩
      if (this.relativity.lengthContraction) {
        particle.lengthContraction = 1 / gamma;
      }
    }
  }

  applyQuantumEffects(particle, deltaTime) {
    // 量子隧穿效应
    if (this.quantumEffects.quantumTunneling) {
      this.applyQuantumTunneling(particle);
    }
    
    // 波函数坍缩
    if (this.quantumEffects.waveParticleDuality) {
      this.updateWaveFunction(particle, deltaTime);
    }
  }

  applyQuantumTunneling(particle) {
    const tunnelingProbability = Math.exp(-2 * particle.barrierHeight * particle.barrierWidth / this.constants.hbar);
    if (Math.random() < tunnelingProbability) {
      // 隧穿效应：随机改变粒子位置
      const tunnelDistance = particle.barrierWidth * (Math.random() - 0.5);
      particle.position.x += tunnelDistance;
    }
  }

  updateWaveFunction(particle, deltaTime) {
    // 更新波函数
    particle.waveFunctionPhase += (particle.energy / this.constants.hbar) * deltaTime;
  }

  applyBlackHoleEffects(particle) {
    // 检查是否在黑洞事件视界内
    this.particles.forEach(otherParticle => {
      if (otherParticle.isBlackHole) {
        const distance = this.calculateDistance(particle.position, otherParticle.position);
        const schwarzschildRadius = this.constants.SchwarzschildRadius * otherParticle.mass;
        
        if (distance < schwarzschildRadius) {
          // 粒子被黑洞吸收
          particle.isAbsorbed = true;
          otherParticle.mass += particle.mass;
        } else if (distance < 3 * schwarzschildRadius) {
          // 引力透镜效应
          this.applyGravitationalLensing(particle, otherParticle);
        }
      }
    });
  }

  applyGravitationalLensing(particle, blackHole) {
    const distance = this.calculateDistance(particle.position, blackHole.position);
    const direction = this.calculateDirection(particle.position, blackHole.position);
    const deflectionAngle = 4 * this.constants.G * blackHole.mass / (distance * this.constants.c * this.constants.c);
    
    // 应用引力偏转
    const perpendicularDirection = {
      x: -direction.y,
      y: direction.x,
      z: 0
    };
    
    particle.velocity.x += deflectionAngle * perpendicularDirection.x;
    particle.velocity.y += deflectionAngle * perpendicularDirection.y;
  }

  applyCosmologicalEffects(particle, deltaTime) {
    // 宇宙膨胀效应
    const expansionRate = 70; // 哈勃常数 km/s/Mpc
    const expansionFactor = 1 + expansionRate * deltaTime / 3.086e19; // 转换为适当的单位
    
    particle.position.x *= expansionFactor;
    particle.position.y *= expansionFactor;
    particle.position.z *= expansionFactor;
  }

  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  calculateDirection(pos1, pos2) {
    const distance = this.calculateDistance(pos1, pos2);
    if (distance === 0) return { x: 0, y: 0, z: 0 };
    
    return {
      x: (pos2.x - pos1.x) / distance,
      y: (pos2.y - pos1.y) / distance,
      z: (pos2.z - pos1.z) / distance
    };
  }

  crossProduct(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  // 高级粒子创建方法
  createParticle(position, velocity, mass, charge = 0, options = {}) {
    const particle = {
      id: Date.now() + Math.random(),
      position: { ...position },
      velocity: { ...velocity },
      mass,
      restMass: mass,
      charge,
      energy: mass * this.constants.c * this.constants.c,
      momentum: {
        x: mass * velocity.x,
        y: mass * velocity.y,
        z: mass * velocity.z
      },
      lifetime: Infinity,
      age: 0,
      isQuantum: options.isQuantum || false,
      hasNuclearCharge: options.hasNuclearCharge || false,
      isBlackHole: options.isBlackHole || false,
      wavePacketWidth: options.wavePacketWidth || 1e-10,
      waveFunctionPhase: 0,
      barrierHeight: options.barrierHeight || 0,
      barrierWidth: options.barrierWidth || 0,
      timeDilation: 1,
      lengthContraction: 1,
      isAbsorbed: false
    };
    
    // 计算能量和动量
    if (particle.isQuantum) {
      particle.energy = this.constants.hbar * particle.frequency || 0;
      particle.momentum = this.constants.hbar * particle.waveNumber || 0;
    }
    
    return particle;
  }

  // 创建黑洞
  createBlackHole(position, mass) {
    const schwarzschildRadius = this.constants.SchwarzschildRadius * mass;
    return this.createParticle(position, { x: 0, y: 0, z: 0 }, mass, 0, {
      isBlackHole: true,
      schwarzschildRadius: schwarzschildRadius,
      eventHorizon: true,
      singularity: true
    });
  }

  // 创建量子粒子
  createQuantumParticle(position, velocity, mass, charge = 0, wavePacketWidth = 1e-10) {
    return this.createParticle(position, velocity, mass, charge, {
      isQuantum: true,
      wavePacketWidth: wavePacketWidth,
      frequency: mass * this.constants.c * this.constants.c / this.constants.hbar,
      waveNumber: mass * Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z) / this.constants.hbar
    });
  }

  // 统一场论特定计算
  calculateUnifiedField(position, time) {
    const gravitationalField = this.fields.get('gravitational').calculate(position);
    const electromagneticField = this.fields.get('electromagnetic').calculateElectric(position);
    const quantumField = this.fields.get('quantum').calculate(position, time);
    
    return {
      gravitational: gravitationalField,
      electromagnetic: electromagneticField,
      quantum: quantumField,
      unified: {
        x: gravitationalField.x + electromagneticField.x + quantumField.x,
        y: gravitationalField.y + electromagneticField.y + quantumField.y,
        z: gravitationalField.z + electromagneticField.z + quantumField.z
      }
    };
  }

  // 计算时空曲率张量
  calculateSpacetimeCurvatureTensor(position) {
    const gravitationalField = this.fields.get('gravitational');
    const curvature = gravitationalField.calculateSpacetimeCurvature(position);
    
    return {
      xx: curvature,
      yy: curvature,
      zz: curvature,
      tt: -curvature / (this.constants.c * this.constants.c)
    };
  }

  // 多体物理模拟
  simulateMultiBodySystem(particles, timeSteps) {
    const results = [];
    
    for (let i = 0; i < timeSteps; i++) {
      this.update(this.timeStep);
      results.push(this.getSystemState());
    }
    
    return results;
  }

  getSystemState() {
    return {
      time: this.simulationTime,
      particles: Array.from(this.particles).map(p => ({
        id: p.id,
        position: { ...p.position },
        velocity: { ...p.velocity },
        mass: p.mass,
        energy: p.energy
      })),
      fields: {
        gravitational: this.fields.get('gravitational').calculate({ x: 0, y: 0, z: 0 }),
        electromagnetic: this.fields.get('electromagnetic').calculateElectric({ x: 0, y: 0, z: 0 })
      }
    };
  }

  getStats() {
    return {
      particles: this.particles.size,
      simulationTime: this.simulationTime,
      fields: this.fields.size,
      enabledForces: Object.entries(this.enabledForces).filter(([_, enabled]) => enabled).map(([force]) => force),
      advancedFeatures: Object.entries(this.advancedFeatures).filter(([_, enabled]) => enabled).map(([feature]) => feature)
    };
  }

  dispose() {
    this.particles.clear();
    this.fields.forEach(field => {
      if (field.sources) {
        field.sources.clear();
      }
    });
    this.fields.clear();
    console.log('🧹 高级物理引擎资源清理完成');
  }
}

// 导出高级物理引擎实例
const advancedPhysicsEngine = new AdvancedPhysicsEngine();
window.AdvancedPhysicsEngine = AdvancedPhysicsEngine;
window.advancedPhysicsEngine = advancedPhysicsEngine;

console.log('🔬 高级物理引擎初始化完成');
