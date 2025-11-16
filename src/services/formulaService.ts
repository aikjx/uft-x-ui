import { Formula } from '../types';

export class FormulaService {
  private static instance: FormulaService;
  private formulas: Map<number, Formula> = new Map();

  public static getInstance(): FormulaService {
    if (!FormulaService.instance) {
      FormulaService.instance = new FormulaService();
    }
    return FormulaService.instance;
  }

  constructor() {
    this.initializeFormulas();
  }

  private initializeFormulas(): void {
    const formulas: Formula[] = [
      {
        id: 1,
        name: '时空同一化方程',
        expression: '\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}',
        description: '揭示时间和空间的本质联系，时间是空间本身的运动',
        category: '时空方程',
        parameters: ['time', 'space_coordinates'],
        visualizationType: 'spacetime',
        complexity: 3
      },
      {
        id: 2,
        name: '三维螺旋时空方程',
        expression: '\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}',
        description: '描述物质点在三维空间中的螺旋运动轨迹',
        category: '时空方程',
        parameters: ['radius', 'angular_velocity', 'height'],
        visualizationType: 'spiral',
        complexity: 4
      },
      {
        id: 3,
        name: '质量定义方程',
        expression: 'm = k \\cdot \\frac{dn}{d\\Omega}',
        description: '质量本质是物体周围空间运动的运动量',
        category: '动力学方程',
        parameters: ['constant_k', 'space_density'],
        visualizationType: 'mass',
        complexity: 2
      },
      {
        id: 4,
        name: '引力场定义方程',
        expression: '\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}',
        description: '引力场是空间的加速运动效应',
        category: '场方程',
        parameters: ['gravitational_constant', 'mass_density'],
        visualizationType: 'gravity',
        complexity: 5
      },
      {
        id: 5,
        name: '静止动量方程',
        expression: '\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}',
        description: '静止物体的动量与静止质量和光速有关',
        category: '动力学方程',
        parameters: ['rest_mass', 'lightspeed'],
        visualizationType: 'momentum',
        complexity: 3
      },
      {
        id: 6,
        name: '运动动量方程',
        expression: '\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})',
        description: '运动物体的动量表达式，包含了相对论效应',
        category: '动力学方程',
        parameters: ['mass', 'velocity', 'lightspeed'],
        visualizationType: 'momentum',
        complexity: 4
      },
      {
        id: 7,
        name: '宇宙大统一方程（力方程）',
        expression: 'F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}',
        description: '统一四种基本力的核心方程，揭示力的本质',
        category: '统一方程',
        parameters: ['mass_change', 'velocity_change'],
        visualizationType: 'unified',
        complexity: 5
      },
      {
        id: 8,
        name: '空间波动方程',
        expression: '\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}',
        description: '描述空间波动的传播规律',
        category: '场方程',
        parameters: ['wave_amplitude', 'frequency'],
        visualizationType: 'wave',
        complexity: 4
      },
      {
        id: 9,
        name: '电荷定义方程',
        expression: 'q = k^{\\prime}k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}',
        description: '电荷本质是空间角动量的变化率',
        category: '场方程',
        parameters: ['constants', 'angular_momentum_change'],
        visualizationType: 'charge',
        complexity: 4
      },
      {
        id: 10,
        name: '电场定义方程',
        expression: '\\vec{E} = -\\frac{kk^{\\prime}}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}',
        description: '电场是空间角动量变化产生的效应',
        category: '场方程',
        parameters: ['charge', 'distance'],
        visualizationType: 'electric',
        complexity: 5
      },
      {
        id: 11,
        name: '磁场定义方程',
        expression: '\\vec{B} = \\frac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}',
        description: '磁场是运动电荷产生的相对论效应',
        category: '场方程',
        parameters: ['moving_charge', 'velocity'],
        visualizationType: 'magnetic',
        complexity: 5
      },
      {
        id: 12,
        name: '变化的引力场产生电磁场',
        expression: '\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})',
        description: '引力场与电磁场的相互转化关系',
        category: '统一方程',
        parameters: ['gravitational_field_change'],
        visualizationType: 'unified',
        complexity: 5
      },
      {
        id: 13,
        name: '磁矢势方程',
        expression: '\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}',
        description: '磁矢势与磁场的关系',
        category: '场方程',
        parameters: ['magnetic_potential'],
        visualizationType: 'magnetic',
        complexity: 3
      },
      {
        id: 14,
        name: '变化的引力场产生电场',
        expression: '\\vec{E} = -f\\frac{d\\vec{A}}{dt}',
        description: '引力场变化如何产生电场',
        category: '统一方程',
        parameters: ['gravitational_potential_change'],
        visualizationType: 'unified',
        complexity: 4
      },
      {
        id: 15,
        name: '变化的磁场产生引力场和电场',
        expression: '\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}',
        description: '磁场变化如何影响引力场和电场',
        category: '统一方程',
        parameters: ['magnetic_field_change'],
        visualizationType: 'unified',
        complexity: 5
      },
      {
        id: 16,
        name: '统一场论能量方程',
        expression: 'e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}',
        description: '能量与质量的等价关系，扩展了爱因斯坦质能方程',
        category: '统一方程',
        parameters: ['mass', 'velocity'],
        visualizationType: 'energy',
        complexity: 3
      },
      {
        id: 17,
        name: '光速飞行器动力学方程',
        expression: '\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}',
        description: '基于统一场论的光速飞行器原理',
        category: '应用方程',
        parameters: ['mass_change_rate'],
        visualizationType: 'spaceship',
        complexity: 4
      },
      {
        id: 18,
        name: '核力场定义方程',
        expression: '\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}',
        description: '核力场的数学表达式',
        category: '场方程',
        parameters: ['nuclear_constant', 'distance'],
        visualizationType: 'nuclear',
        complexity: 5
      },
      {
        id: 19,
        name: '引力光速统一方程',
        expression: 'Z = Gc/2',
        description: '揭示引力常数与光速的内在联系',
        category: '统一方程',
        parameters: ['gravitational_constant', 'lightspeed'],
        visualizationType: 'fundamental',
        complexity: 2
      }
    ];

    formulas.forEach(formula => {
      this.formulas.set(formula.id, formula);
    });
  }

  public getAllFormulas(): Formula[] {
    return Array.from(this.formulas.values());
  }

  public getFormulaById(id: number): Formula | undefined {
    return this.formulas.get(id);
  }

  public getFormulasByCategory(category: string): Formula[] {
    return this.getAllFormulas().filter(formula => formula.category === category);
  }

  public getFormulasByVisualizationType(type: string): Formula[] {
    return this.getAllFormulas().filter(formula => formula.visualizationType === type);
  }

  public getCategories(): string[] {
    const categories = new Set(this.getAllFormulas().map(formula => formula.category));
    return Array.from(categories);
  }

  public searchFormulas(query: string): Formula[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllFormulas().filter(formula => 
      formula.name.toLowerCase().includes(lowerQuery) ||
      formula.description.toLowerCase().includes(lowerQuery) ||
      formula.expression.toLowerCase().includes(lowerQuery)
    );
  }

  public getRelatedFormulas(formulaId: number, limit: number = 3): Formula[] {
    const currentFormula = this.getFormulaById(formulaId);
    if (!currentFormula) return [];

    return this.getAllFormulas()
      .filter(formula => 
        formula.id !== formulaId && 
        (formula.category === currentFormula.category || 
         formula.visualizationType === currentFormula.visualizationType)
      )
      .slice(0, limit);
  }

  public validateFormulaParameters(formulaId: number, parameters: Record<string, any>): boolean {
    const formula = this.getFormulaById(formulaId);
    if (!formula || !formula.parameters) return false;

    return formula.parameters.every(param => parameters.hasOwnProperty(param));
  }

  public calculateFormula(formulaId: number, parameters: Record<string, number>): number {
    // 简化的公式计算实现
    // 在实际应用中，这里应该实现具体的数学计算逻辑
    const formula = this.getFormulaById(formulaId);
    if (!formula) return 0;

    // 基础计算示例
    switch (formulaId) {
      case 1: // 时空同一化方程
        return parameters.time || 0;
      case 2: // 三维螺旋时空方程
        return (parameters.radius || 1) * (parameters.angular_velocity || 1);
      case 16: // 质能方程
        return (parameters.mass || 0) * Math.pow(299792458, 2);
      default:
        return Math.random() * 100;
    }
  }
}

export const formulaService = FormulaService.getInstance();