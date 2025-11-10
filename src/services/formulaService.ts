import { Formula } from '../types';

// 公式服务类
export class FormulaService {
  private static instance: FormulaService;
  
  private constructor() {}
  
  /**
   * 获取FormulaService单例实例
   */
  public static getInstance(): FormulaService {
    if (!FormulaService.instance) {
      FormulaService.instance = new FormulaService();
    }
    return FormulaService.instance;
  }
  // 获取所有公式
  static getAllFormulas(): Formula[] {
    return [...FORMULAS];
  }

  // 根据ID获取公式
  static getFormulaById(id: string | number): Formula | undefined {
    const formulaId = typeof id === 'string' ? parseInt(id, 10) : id;
    return FORMULAS.find(formula => formula.id === formulaId);
  }

  // 根据类别获取公式
  static getFormulasByCategory(category: string): Formula[] {
    return FORMULAS.filter(formula => formula.category === category);
  }

  // 获取所有类别
  static getAllCategories(): string[] {
    const categories = new Set<string>();
    FORMULAS.forEach(formula => categories.add(formula.category));
    return Array.from(categories).sort();
  }

  // 搜索公式
  static searchFormulas(query: string): Formula[] {
    const lowercaseQuery = query.toLowerCase();
    return FORMULAS.filter(formula => 
      formula.name.toLowerCase().includes(lowercaseQuery) ||
      formula.description.toLowerCase().includes(lowercaseQuery) ||
      formula.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // 获取相关公式（基于类别）
  static getRelatedFormulas(formula: Formula, limit: number = 3): Formula[] {
    return FORMULAS
      .filter(f => f.category === formula.category && f.id !== formula.id)
      .slice(0, limit);
  }

  // 格式化公式表达式用于显示
  static formatFormulaExpression(expression: string): string {
    // 这里可以添加更复杂的公式格式化逻辑
    return expression
      .replace(/\\/g, '\\')
      .trim();
  }
  
  /**
   * 格式化LaTeX公式
   * @param formula LaTeX公式字符串
   * @returns 格式化后的公式字符串
   */
  public formatFormula(formula: string): string {
    if (!formula || typeof formula !== 'string') {
      return '';
    }
    
    // 移除首尾空白字符
    let formatted = formula.trim();
    
    // 移除公式环境标记
    formatted = formatted.replace(/^\\\(/, '').replace(/\\\)$/, '');
    formatted = formatted.replace(/^\\\[/, '').replace(/\\\]$/, '');
    formatted = formatted.replace(/^\$/, '').replace(/\$$/, '');
    formatted = formatted.replace(/^\$\$/, '').replace(/\$\$$/, '');
    
    // 规范化空格
    formatted = formatted.replace(/\s+/g, ' ').trim();
    
    return formatted;
  }
  
  /**
   * 验证LaTeX公式是否有效
   * @param formula LaTeX公式字符串
   * @returns 是否为有效公式
   */
  public validateFormula(formula: string): boolean {
    if (!formula || typeof formula !== 'string') {
      return false;
    }
    
    const trimmed = formula.trim();
    if (trimmed === '') {
      return false;
    }
    
    // 检查括号匹配
    const bracketPairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '\\left': '\\right',
      '\\begin': '\\end'
    };
    
    const stack: string[] = [];
    const words = trimmed.split(/(\\[a-zA-Z]+|[\(\)\[\]\{\}])/).filter(w => w !== '');
    
    for (const word of words) {
      if (bracketPairs[word]) {
        stack.push(bracketPairs[word]);
      } else if (Object.values(bracketPairs).includes(word)) {
        if (stack.pop() !== word) {
          return false;
        }
      }
    }
    
    return stack.length === 0;
  }
  
  /**
   * 获取公式的简化版本
   * @param formula LaTeX公式字符串
   * @returns 简化后的公式字符串
   */
  public simplifyFormula(formula: string): string {
    let simplified = this.formatFormula(formula);
    
    // 移除不必要的空格
    simplified = simplified.replace(/\s+/g, '');
    
    // 简化常见表达式
    simplified = simplified.replace(/\\cdot/g, '');
    simplified = simplified.replace(/\\times/g, '\\times');
    simplified = simplified.replace(/\\div/g, '/');
    
    return simplified;
  }
  
  /**
   * 提取公式中的变量名
   * @param formula LaTeX公式字符串
   * @returns 变量名数组
   */
  public extractVariables(formula: string): string[] {
    const formatted = this.formatFormula(formula);
    const variables = new Set<string>();
    
    // 匹配单个字母变量（不包括命令和数字）
    const variableRegex = /(?![\\a-zA-Z]+)([a-zA-Z])(?![a-zA-Z]|_)/g;
    let match;
    
    while ((match = variableRegex.exec(formatted)) !== null) {
      variables.add(match[1]);
    }
    
    // 匹配带下标的变量
    const subscriptRegex = /([a-zA-Z])_(\{[^{}]+\}|[a-zA-Z0-9])/g;
    
    while ((match = subscriptRegex.exec(formatted)) !== null) {
      variables.add(match[0]);
    }
    
    return Array.from(variables).sort();
  }
  
  /**
   * 获取常用物理公式库
   * @returns 公式库对象
   */
  public getFormulaLibrary(): { [key: string]: string } {
    return {
      // 运动学公式
      velocity: 'v = \\frac{\\Delta x}{\\Delta t}',
      acceleration: 'a = \\frac{\\Delta v}{\\Delta t}',
      position: 'x = x_0 + v_0t + \\frac{1}{2}at^2',
      
      // 统一场论相关公式
      unified_field: 'F = \\frac{dP}{dt} = C \\cdot \\frac{dm}{dt} - V \\cdot \\frac{dm}{dt} + m \\cdot \\frac{dC}{dt} - m \\cdot \\frac{dV}{dt}',
      space_time_unity: '\\vec{r}(t) = \\vec{C}t',
      energy_equation: 'e = m_0c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}'
    };
  }

  // 解析公式中的符号
  static parseFormulaSymbols(expression: string): string[] {
    // 简单的符号提取逻辑，可以根据需要扩展
    const symbols = new Set<string>();
    const symbolRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    let match;
    
    while ((match = symbolRegex.exec(expression)) !== null) {
      // 过滤掉常见的LaTeX命令
      if (!match[0].startsWith('\\')) {
        symbols.add(match[0]);
      }
    }
    
    return Array.from(symbols).sort();
  }
}

// 创建并导出单例实例
export const formulaService = FormulaService.getInstance();

// 默认导出
export default FormulaService;