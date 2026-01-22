// 宇宙学方程可视化模块
// 功能: 实现宇宙学方程的高级可视化，包括宇宙膨胀、暗能量等

class CosmologicalEquation {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.state = {
      time: 0,
      universeExpansion: [],
      cosmicMicrowaveBackground: [],
      darkEnergy: [],
      showUniverseExpansion: true,
      showCosmicMicrowaveBackground: true,
      showDarkEnergy: true,
      showGalaxyDistribution: true,
      animationSpeed: 1,
      scale: 1,
      hubbleConstant: 70,
      darkEnergyDensity: 0.7,
      matterDensity: 0.3,
      cosmicTime: 0,
      redshift: 0,
      universeSize: 0
    };
    this.init();
  }

  init() {
    console.log('🌌 宇宙学方程可视化初始化');
    this.createUniverseExpansion();
    this.createCosmicMicrowaveBackground();
    this.createDarkEnergy();
  }

  createUniverseExpansion() {
    for (let i = 0; i < 100; i++) {
      const expansion = {
        time: i * 0.1,
        scaleFactor: 0,
        color: 'rgba(102, 102, 255, 0.6)'
      };
      this.state.universeExpansion.push(expansion);
    }
  }

  createCosmicMicrowaveBackground() {
    for (let i = 0; i < 50; i++) {
      const cmb = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        temperature: 2.725 + (Math.random() - 0.5) * 0.001,
        polarization: Math.random() * Math.PI * 2,
        color: this.getCMBColor(2.725)
      };
      this.state.cosmicMicrowaveBackground.push(cmb);
    }
  }

  createDarkEnergy() {
    for (let i = 0; i < 40; i++) {
      const energy = {
        id: i,
        position: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        density: Math.random(),
        pressure: -Math.random(),
        color: 'rgba(255, 102, 255, 0.6)'
      };
      this.state.darkEnergy.push(energy);
    }
  }

  calculateScaleFactor(time) {
    const H0 = this.state.hubbleConstant / 1000;
    const OmegaM = this.state.matterDensity;
    const OmegaLambda = this.state.darkEnergyDensity;
    const OmegaK = 1 - OmegaM - OmegaLambda;
    
    if (OmegaK === 0) {
      return Math.pow((3 * H0 * Math.sqrt(OmegaLambda) * time / 2 + 1), 2/3);
    } else if (OmegaK > 0) {
      const sinhArg = Math.sqrt(3 * OmegaLambda / OmegaK) * H0 * time;
      return Math.sinh(sinhArg) / Math.pow(OmegaK, 1/2);
    } else {
      const sinArg = Math.sqrt(-3 * OmegaLambda / OmegaK) * H0 * time;
      return Math.sin(sinArg) / Math.pow(-OmegaK, 1/2);
    }
  }

  calculateRedshift(time) {
    const scaleFactor = this.calculateScaleFactor(time);
    return 1 / scaleFactor - 1;
  }

  update(deltaTime) {
    this.state.time += deltaTime * this.state.animationSpeed;
    this.state.cosmicTime = this.state.time * 10;
    
    // 更新宇宙膨胀
    this.updateUniverseExpansion();
    
    // 更新宇宙微波背景
    this.updateCosmicMicrowaveBackground();
    
    // 更新暗能量
    this.updateDarkEnergy();
    
    // 计算红移和宇宙大小
    this.calculateCosmologicalParameters();
  }

  updateUniverseExpansion() {
    this.state.universeExpansion.forEach(expansion => {
      expansion.scaleFactor = this.calculateScaleFactor(expansion.time);
    });
  }

  updateCosmicMicrowaveBackground() {
    this.state.cosmicMicrowaveBackground.forEach(cmb => {
      const redshift = this.calculateRedshift(this.state.cosmicTime);
      cmb.temperature = 2.725 * (1 + redshift);
      cmb.color = this.getCMBColor(cmb.temperature);
      cmb.position.x *= 1.001;
      cmb.position.y *= 1.001;
    });
  }

  updateDarkEnergy() {
    this.state.darkEnergy.forEach(energy => {
      energy.density = this.state.darkEnergyDensity * (1 + Math.sin(this.state.time * 0.1 + energy.id) * 0.1);
      energy.pressure = -energy.density;
    });
  }

  calculateCosmologicalParameters() {
    this.state.redshift = this.calculateRedshift(this.state.cosmicTime);
    this.state.universeSize = this.calculateScaleFactor(this.state.cosmicTime) * 100;
  }

  getCMBColor(temperature) {
    const normalizedTemp = (temperature - 2.72) / 0.01;
    const r = Math.max(0, Math.min(255, Math.floor(255 * (1 - normalizedTemp))));
    const b = Math.max(0, Math.min(255, Math.floor(255 * (1 + normalizedTemp))));
    return `rgba(${r}, ${r}, ${b}, 0.8)`;
  }

  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制宇宙膨胀
    if (this.state.showUniverseExpansion) {
      this.renderUniverseExpansion(ctx, centerX, centerY);
    }
    
    // 绘制宇宙微波背景
    if (this.state.showCosmicMicrowaveBackground) {
      this.renderCosmicMicrowaveBackground(ctx, centerX, centerY);
    }
    
    // 绘制暗能量
    if (this.state.showDarkEnergy) {
      this.renderDarkEnergy(ctx, centerX, centerY);
    }
    
    // 绘制星系分布
    if (this.state.showGalaxyDistribution) {
      this.renderGalaxyDistribution(ctx, centerX, centerY);
    }
    
    // 绘制信息
    this.renderInfo(ctx, width, height);
  }

  renderUniverseExpansion(ctx, centerX, centerY) {
    ctx.strokeStyle = 'rgba(102, 102, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.state.universeExpansion.forEach((expansion, index) => {
      const x = centerX + (index - 50) * 6;
      const y = centerY - expansion.scaleFactor * 50 * this.state.scale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  renderCosmicMicrowaveBackground(ctx, centerX, centerY) {
    this.state.cosmicMicrowaveBackground.forEach(cmb => {
      ctx.fillStyle = cmb.color;
      ctx.beginPath();
      const size = 3 * this.state.scale;
      ctx.arc(centerX + cmb.position.x * this.state.scale, centerY + cmb.position.y * this.state.scale, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderDarkEnergy(ctx, centerX, centerY) {
    this.state.darkEnergy.forEach(energy => {
      ctx.fillStyle = energy.color;
      ctx.beginPath();
      const size = energy.density * 10 * this.state.scale;
      ctx.arc(centerX + energy.position.x * this.state.scale, centerY + energy.position.y * this.state.scale, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderGalaxyDistribution(ctx, centerX, centerY) {
    ctx.fillStyle = 'rgba(255, 255, 102, 0.8)';
    
    for (let i = 0; i < 30; i++) {
      const angle = (i * 12) * Math.PI / 180;
      const radius = 100 * this.state.scale * Math.sqrt(this.calculateScaleFactor(this.state.cosmicTime));
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 2 * this.state.scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const info = [
      `宇宙时间: ${this.state.cosmicTime.toFixed(2)} Gyr`,
      `红移: ${this.state.redshift.toFixed(2)}`,
      `宇宙大小: ${this.state.universeSize.toFixed(2)} Mpc`,
      `哈勃常数: ${this.state.hubbleConstant} km/s/Mpc`,
      `暗能量密度: ${this.state.darkEnergyDensity.toFixed(2)}`,
      `物质密度: ${this.state.matterDensity.toFixed(2)}`,
      `宇宙膨胀: ${this.state.showUniverseExpansion ? '显示' : '隐藏'}`,
      `宇宙微波背景: ${this.state.showCosmicMicrowaveBackground ? '显示' : '隐藏'}`,
      `暗能量: ${this.state.showDarkEnergy ? '显示' : '隐藏'}`,
      `星系分布: ${this.state.showGalaxyDistribution ? '显示' : '隐藏'}`,
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

  setHubbleConstant(constant) {
    this.state.hubbleConstant = constant;
  }

  setDarkEnergyDensity(density) {
    this.state.darkEnergyDensity = density;
    this.state.matterDensity = 1 - density;
  }

  toggleUniverseExpansion() {
    this.state.showUniverseExpansion = !this.state.showUniverseExpansion;
  }

  toggleCosmicMicrowaveBackground() {
    this.state.showCosmicMicrowaveBackground = !this.state.showCosmicMicrowaveBackground;
  }

  toggleDarkEnergy() {
    this.state.showDarkEnergy = !this.state.showDarkEnergy;
  }

  toggleGalaxyDistribution() {
    this.state.showGalaxyDistribution = !this.state.showGalaxyDistribution;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmologicalEquation;
} else if (typeof window !== 'undefined') {
  window.CosmologicalEquation = CosmologicalEquation;
}
