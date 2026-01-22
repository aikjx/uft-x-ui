// 统一场论可视化系统 - 物理引擎
// 版本: v1.0
// 功能: 实现基于统一场论的物理模拟，包括时空、质量、场的计算

class PhysicsEngine {
  constructor() {
    this.particles = new Set();
    this.fields = new Map();
    this.constants = {
      c: 299792458, // 光速 m/s
      G: 6.67430e-11, // 万有引力常数
      epsilon0: 8.8541878128e-12, // 真空介电常数
      mu0: 1.25663706212e-6, // 真空磁导率
      hbar: 1.054571817e-34 // 约化普朗克常数
    };
    this.simulationTime = 0;
    this.timeStep = 0.01;
    this.gravityEnabled = true;
    this.electromagnetismEnabled = true;
    this.nuclearForcesEnabled = false;
    this.init();
  }

  init() {
    console.log('⚡ 物理引擎初始化');
    this.initConstants();
    this.initFields();
  }

  initConstants() {
    // 计算派生常数
    this.constants.Z = this.constants.G * this.constants.c / 2; // 引力光速统一方程
    this.constants.ZPrime = this.constants.c / (8 * Math.PI * this.constants.epsilon0); // 电磁耦合常数
    console.log('📊 物理常数初始化完成');
  }

  initFields() {
    // 创建基础场
    this.createGravitationalField();
    this.createElectromagneticField();
    this.createNuclearField();
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
        // 简化的磁场计算
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
        // 核力场计算
        return field;
      }
    };
    this.fields.set('nuclear', nuclearField);
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
  }

  removeParticle(particle) {
    this.particles.delete(particle);
    this.fields.get('gravitational').sources.delete(particle);
    this.fields.get('electromagnetic').sources.delete(particle);
  }

  update(deltaTime) {
    this.simulationTime += deltaTime;
    
    // 更新粒子状态
    this.particles.forEach(particle => {
      this.updateParticle(particle, deltaTime);
    });

    // 更新场
    this.updateFields();
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

    // 更新位置
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.position.z += particle.velocity.z * deltaTime;

    // 应用相对论效应
    this.applyRelativisticEffects(particle);
  }

  calculateForces(particle) {
    let forces = { x: 0, y: 0, z: 0 };

    // 引力
    if (this.gravityEnabled) {
      const gravitationalField = this.fields.get('gravitational');
      const gravityForce = gravitationalField.calculate(particle.position);
      forces.x += gravityForce.x;
      forces.y += gravityForce.y;
      forces.z += gravityForce.z;
    }

    // 电磁力
    if (this.electromagnetismEnabled && particle.charge !== 0) {
      const electromagneticField = this.fields.get('electromagnetic');
      const electricForce = electromagneticField.calculateElectric(particle.position);
      forces.x += particle.charge * electricForce.x;
      forces.y += particle.charge * electricForce.y;
      forces.z += particle.charge * electricForce.z;
    }

    // 核力
    if (this.nuclearForcesEnabled) {
      const nuclearField = this.fields.get('nuclear');
      const nuclearForce = nuclearField.calculate(particle.position);
      forces.x += nuclearForce.x;
      forces.y += nuclearForce.y;
      forces.z += nuclearForce.z;
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

  applyRelativisticEffects(particle) {
    const speed = Math.sqrt(
      particle.velocity.x * particle.velocity.x +
      particle.velocity.y * particle.velocity.y +
      particle.velocity.z * particle.velocity.z
    );
    
    if (speed > 0.1 * this.constants.c) {
      const gamma = 1 / Math.sqrt(1 - (speed * speed) / (this.constants.c * this.constants.c));
      particle.mass = particle.restMass * gamma;
      // 这里可以添加更多相对论效应
    }
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

  // 统一场论特定计算
  calculateSpacetimeCurvature(position) {
    // 计算时空曲率
    let curvature = 0;
    this.particles.forEach(particle => {
      const distance = this.calculateDistance(position, particle.position);
      if (distance > 0) {
        curvature += particle.mass / (distance * distance);
      }
    });
    return curvature * this.constants.G / (this.constants.c * this.constants.c);
  }

  calculateFieldTransformation(gravitationalField, electromagneticField) {
    // 计算场转化
    const transformation = {
      electric: { x: 0, y: 0, z: 0 },
      magnetic: { x: 0, y: 0, z: 0 }
    };
    
    // 简化的场转化计算
    return transformation;
  }

  // 工具方法
  createParticle(position, velocity, mass, charge = 0) {
    return {
      id: Date.now() + Math.random(),
      position: { ...position },
      velocity: { ...velocity },
      mass,
      restMass: mass,
      charge,
      lifetime: Infinity,
      age: 0
    };
  }

  getStats() {
    return {
      particles: this.particles.size,
      simulationTime: this.simulationTime,
      fields: this.fields.size
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
  }
}

// 导出物理引擎实例
const physicsEngine = new PhysicsEngine();
window.PhysicsEngine = PhysicsEngine;
window.physicsEngine = physicsEngine;

console.log('🔬 物理引擎初始化完成');
