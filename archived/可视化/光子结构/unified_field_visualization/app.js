// 统一场论可视化系统主应用程序
// 功能: 集成所有可视化模块，提供完整的用户界面

class UnifiedFieldVisualizationApp {
  constructor() {
    this.state = {
      currentEquation: 'spacetime',
      animationSpeed: 1,
      scale: 1,
      equations: {}
    };
    this.init();
  }

  init() {
    console.log('🚀 统一场论可视化系统初始化');
    this.createEquations();
    this.setupEventListeners();
    this.startAnimation();
  }

  createEquations() {
    const canvasIds = {
      spacetime: 'spacetime-canvas',
      helix: 'helix-canvas',
      perpendicular: 'perpendicular-canvas',
      mass: 'mass-canvas',
      energy: 'energy-canvas',
      charge: 'charge-canvas',
      current: 'current-canvas',
      velocity: 'velocity-canvas',
      acceleration: 'acceleration-canvas',
      gravitational: 'gravitational-canvas',
      electromagnetic: 'electromagnetic-canvas',
      nuclear: 'nuclear-canvas',
      wave: 'wave-canvas',
      probability: 'probability-canvas',
      entanglement: 'entanglement-canvas',
      quantum: 'quantum-canvas',
      cosmological: 'cosmological-canvas',
      blackHole: 'black-hole-canvas',
      wormhole: 'wormhole-canvas',
      vacuum: 'vacuum-canvas'
    };

    // 导入所有方程模块
    this.state.equations = {
      spacetime: new SpacetimeEquation(canvasIds.spacetime),
      helix: new HelixSpacetimeEquation(canvasIds.helix),
      perpendicular: new PerpendicularPrincipleEquation(canvasIds.perpendicular),
      mass: new MassDefinitionEquation(canvasIds.mass),
      energy: new EnergyMomentumEquation(canvasIds.energy),
      charge: new ChargeEquation(canvasIds.charge),
      current: new CurrentEquation(canvasIds.current),
      velocity: new VelocityFieldEquation(canvasIds.velocity),
      acceleration: new AccelerationFieldEquation(canvasIds.acceleration),
      gravitational: new GravitationalFieldEquation(canvasIds.gravitational),
      electromagnetic: new ElectromagneticFieldEquation(canvasIds.electromagnetic),
      nuclear: new NuclearForceEquation(canvasIds.nuclear),
      wave: new WaveFunctionEquation(canvasIds.wave),
      probability: new ProbabilityFieldEquation(canvasIds.probability),
      entanglement: new EntanglementFieldEquation(canvasIds.entanglement),
      quantum: new QuantumFieldEquation(canvasIds.quantum),
      cosmological: new CosmologicalEquation(canvasIds.cosmological),
      blackHole: new BlackHoleEquation(canvasIds.blackHole),
      wormhole: new WormholeEquation(canvasIds.wormhole),
      vacuum: new VacuumEquation(canvasIds.vacuum)
    };
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowUp':
        this.state.animationSpeed += 0.1;
        break;
      case 'ArrowDown':
        this.state.animationSpeed = Math.max(0.1, this.state.animationSpeed - 0.1);
        break;
      case 'ArrowRight':
        this.state.scale *= 1.1;
        break;
      case 'ArrowLeft':
        this.state.scale /= 1.1;
        break;
      case ' ':
        this.toggleEquation();
        break;
    }
  }

  handleMouseMove(e) {
    const canvas = document.getElementById('main-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.updateMousePosition(x, y);
  }

  updateMousePosition(x, y) {
    Object.values(this.state.equations).forEach(equation => {
      if (equation.updateMousePosition) {
        equation.updateMousePosition(x, y);
      }
    });
  }

  toggleEquation() {
    const equations = Object.keys(this.state.equations);
    const currentIndex = equations.indexOf(this.state.currentEquation);
    const nextIndex = (currentIndex + 1) % equations.length;
    this.state.currentEquation = equations[nextIndex];
    console.log(`切换到方程: ${this.state.currentEquation}`);
  }

  startAnimation() {
    let lastTime = 0;
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  update(deltaTime) {
    Object.values(this.state.equations).forEach(equation => {
      equation.update(deltaTime * this.state.animationSpeed);
    });
  }

  render() {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const currentEquation = this.state.equations[this.state.currentEquation];
    if (currentEquation) {
      currentEquation.render(ctx, width, height);
    }

    this.renderUI(ctx, width, height);
  }

  renderUI(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const info = [
      `当前方程: ${this.getEquationName(this.state.currentEquation)}`,
      `动画速度: ${this.state.animationSpeed.toFixed(1)}`,
      `缩放: ${this.state.scale.toFixed(1)}`,
      `按空格键切换方程`,
      `按方向键调整速度和缩放`
    ];

    info.forEach((line, index) => {
      ctx.fillText(line, 10, 10 + index * 25);
    });
  }

  getEquationName(equationKey) {
    const names = {
      spacetime: '时空方程',
      helix: '螺旋时空方程',
      perpendicular: '垂直原理方程',
      mass: '质量定义方程',
      energy: '能量动量方程',
      charge: '电荷方程',
      current: '电流方程',
      velocity: '速度场方程',
      acceleration: '加速度场方程',
      gravitational: '引力场方程',
      electromagnetic: '电磁场方程',
      nuclear: '核力场方程',
      wave: '波函数方程',
      probability: '概率场方程',
      entanglement: '纠缠场方程',
      quantum: '量子场方程',
      cosmological: '宇宙学方程',
      blackHole: '黑洞方程',
      wormhole: '虫洞方程',
      vacuum: '真空方程'
    };
    return names[equationKey] || equationKey;
  }
}

// 启动应用
window.addEventListener('load', () => {
  window.app = new UnifiedFieldVisualizationApp();
});
