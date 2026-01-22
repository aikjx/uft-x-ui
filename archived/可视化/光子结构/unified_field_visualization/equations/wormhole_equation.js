// 虫洞方程可视化模块
// 功能: 实现虫洞方程的高级可视化，包括爱因斯坦-罗森桥、虫洞稳定性等

class WormholeEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      wormholes: [],
      spacetimeCurvature: [],
      lightRays: [],
      showWormholes: true,
      showSpacetimeCurvature: true,
      showLightRays: true,
      showGravitationalEffects: true,
      animationSpeed: 1,
      scale: 1,
      mass: 1,
      charge: 0,
      spin: 0,
      throatRadius: 10,
      length: 50,
      gravitationalPotential: 0,
      spacetimeCurvature: 0,
      stabilityIndex: 0
    };
    this.init();
  }

  init() {
    console.log('🌀 虫洞方程可视化初始化');
    this.createWormholes();
    this.createSpacetimeCurvature();
    this.createLightRays();
  }

  createWormholes() {
    const wormhole = {
      id: 0,
      position: {
        x: 0,
        y: 0
      },
      throatRadius: this.state.throatRadius,
      length: this.state.length,
      mass: this.state.mass,
      charge: this.state.charge,
      spin: this.state.spin,
      color: 'rgba(255, 102, 255, 0.8)',
      stability: 0.8
    };
    this.state.wormholes.push(wormhole);
  }

  createSpacetimeCurvature() {
    for (let i = 0; i < 60; i++) {
      const curvature = {
        distance: i * 2,
        curvature: 0,
        color: 'rgba(102, 255, 255, 0.6)'
      };
      this.state.spacetimeCurvature.push(curvature);
    }
  }

  createLightRays() {
    for (let i = 0; i < 20; i++) {
      const ray = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300
        },
        direction: Math.random() * Math.PI * 2,
        color: 'rgba(255, 255, 102, 0.6)',
        deflection: 0
      };
      this.state.lightRays.push(ray);
    }
  }

  calculateGravitationalPotential(distance) {
    if (distance < this.state.throatRadius) {
      return -this.state.mass / this.state.throatRadius;
    }
    return -this.state.mass / distance;
  }

  calculateSpacetimeCurvature(distance) {
    if (distance < this.state.throatRadius) {
      return (this.state.mass * 2) / (this.state.throatRadius * this.state.throatRadius);
    }
    return (this.state.mass * 2) / (distance * distance);
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    this.updateWormholes();
    this.updateSpacetimeCurvature();
    this.updateLightRays();
    this.calculateWormholeParameters();
  }

  updateWormholes() {
    this.state.wormholes.forEach(wormhole => {
      wormhole.stability = 0.8 + 0.2 * Math.sin(this.state.time * 0.1);
    });
  }

  updateSpacetimeCurvature() {
    this.state.spacetimeCurvature.forEach(curvature => {
      curvature.curvature = this.calculateSpacetimeCurvature(curvature.distance);
    });
  }

  updateLightRays() {
    this.state.lightRays.forEach(ray => {
      const distance = Math.sqrt(ray.position.x * ray.position.x + ray.position.y * ray.position.y);
      if (distance > this.state.throatRadius * 2) {
        const curvature = this.calculateSpacetimeCurvature(distance);
        ray.deflection = curvature * 0.1;
        ray.direction += ray.deflection;
        ray.position.x += Math.cos(ray.direction) * 2;
        ray.position.y += Math.sin(ray.direction) * 2;
      }
    });
  }

  calculateWormholeParameters() {
    this.state.gravitationalPotential = this.calculateGravitationalPotential(this.state.throatRadius);
    this.state.spacetimeCurvature = this.calculateSpacetimeCurvature(this.state.throatRadius);
    this.state.stabilityIndex = this.state.wormholes[0].stability;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    if (this.state.showSpacetimeCurvature) {
      this.renderSpacetimeCurvature(ctx, centerX, centerY);
    }
    
    if (this.state.showLightRays) {
      this.renderLightRays(ctx, centerX, centerY);
    }
    
    if (this.state.showWormholes) {
      this.renderWormholes(ctx, centerX, centerY);
    }
    
    if (this.state.showGravitationalEffects) {
      this.renderGravitationalEffects(ctx, centerX, centerY);
    }
    
    this.renderInfo(ctx, width, height);
  }

  renderWormholes(ctx, centerX, centerY) {
    this.state.wormholes.forEach(wormhole => {
      ctx.strokeStyle = wormhole.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const radius = this.state.throatRadius * 20 * this.state.scale;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  renderSpacetimeCurvature(ctx, centerX, centerY) {
    this.state.spacetimeCurvature.forEach((curvature, index) => {
      const angle = (index / this.state.spacetimeCurvature.length) * Math.PI * 2;
      const radius = 50 + curvature.distance * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.fillStyle = curvature.color;
      ctx.beginPath();
      ctx.arc(x, y, curvature.curvature * 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderLightRays(ctx, centerX, centerY) {
    this.state.lightRays.forEach(ray => {
      ctx.strokeStyle = ray.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX + ray.position.x * this.state.scale, centerY + ray.position.y * this.state.scale);
      const endX = ray.position.x + Math.cos(ray.direction) * 50;
      const endY = ray.position.y + Math.sin(ray.direction) * 50;
      ctx.lineTo(centerX + endX * this.state.scale, centerY + endY * this.state.scale);
      ctx.stroke();
    });
  }

  renderGravitationalEffects(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, i * 40 * this.state.scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `虫洞质量: ${this.state.mass.toFixed(2)} M☉`,
      `喉半径: ${this.state.throatRadius.toFixed(2)} km`,
      `长度: ${this.state.length.toFixed(2)} km`,
      `电荷: ${this.state.charge.toFixed(2)} e`,
      `自旋: ${this.state.spin.toFixed(2)}`,
      `稳定性: ${this.state.wormholes[0].stability.toFixed(2)}`,
      `引力势: ${this.state.gravitationalPotential.toFixed(2)}`,
      `时空曲率: ${this.state.spacetimeCurvature.toFixed(2)}`,
      `虫洞: ${this.state.showWormholes ? '显示' : '隐藏'}`,
      `时空曲率: ${this.state.showSpacetimeCurvature ? '显示' : '隐藏'}`,
      `光线: ${this.state.showLightRays ? '显示' : '隐藏'}`,
      `引力效应: ${this.state.showGravitationalEffects ? '显示' : '隐藏'}`,
      `动画速度: ${this.state.animationSpeed.toFixed(1)}`
    ];
    
    info.forEach((line, index) => {
      ctx.fillText(line, 10, 10 + index * 20);
    });
  }

  setAnimationSpeed(speed) {
    this.state.animationSpeed = speed;
  }

  setScale(scale) {
    this.state.scale = scale;
  }

  setMass(mass) {
    this.state.mass = mass;
  }

  setThroatRadius(radius) {
    this.state.throatRadius = radius;
  }

  toggleWormholes() {
    this.state.showWormholes = !this.state.showWormholes;
  }

  toggleSpacetimeCurvature() {
    this.state.showSpacetimeCurvature = !this.state.showSpacetimeCurvature;
  }

  toggleLightRays() {
    this.state.showLightRays = !this.state.showLightRays;
  }

  toggleGravitationalEffects() {
    this.state.showGravitationalEffects = !this.state.showGravitationalEffects;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WormholeEquation;
} else if (typeof window !== 'undefined') {
  window.WormholeEquation = WormholeEquation;
}
