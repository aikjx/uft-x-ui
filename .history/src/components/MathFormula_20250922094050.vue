<template>
  <div 
    ref="formulaContainer" 
    class="math-formula"
    :class="{ 
      'loading': isLoading, 
      'error': hasError,
      'inline': inline,
      'display': !inline,
      [size]: true
    }"
    :style="{ '--formula-color': color }"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="formula-loading" aria-label="公式加载中">
      <div class="loading-spinner" role="status"></div>
      <span class="loading-text">渲染中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="formula-error" aria-label="公式渲染错误">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <span class="error-text">公式渲染失败</span>
      <button @click="retry" class="retry-btn" aria-label="重试渲染">
        重试
      </button>
    </div>
    
    <!-- 成功状态 -->
    <div 
      v-else 
      class="formula-content"
      :class="{ 'tex2jax_process': true }"
      aria-label="数学公式"
    >
      <span v-if="inline" ref="formulaElement"></span>
      <div v-else ref="formulaElement"></div>
    </div>
  </div>
</template>

<script>
import { useMathJax } from '../composables/useMathJax'

export default {
  name: 'MathFormula',
  
  props: {
    formula: {
      type: String,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#00f5ff'
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
    },
    renderDelay: {
      type: Number,
      default: 100
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  },
  
  setup() {
    const { renderMath, checkMathJax } = useMathJax()
    return { renderMath, checkMathJax }
  },
  
  data() {
    return {
      isLoading: true,
      hasError: false,
      retryCount: 0,
      renderTimeout: null,
      retryTimeout: null
    }
  },
  
  computed: {
    formattedFormula() {
      if (!this.formula.trim()) return ''
      const cleanFormula = this.formula.trim()
      
      // 如果公式已经有分隔符，直接返回
      if (cleanFormula.startsWith('$$') || cleanFormula.startsWith('\\[') || 
          cleanFormula.startsWith('\\(') || cleanFormula.startsWith('$')) {
        return cleanFormula
      }
      
      // 根据 inline 属性添加适当的分隔符
      if (this.inline) {
        return `\\(${cleanFormula}\\)`
      } else {
        return `$$${cleanFormula}$$`
      }
    },
    
    sanitizedFormula() {
      if (!this.formattedFormula) return ''
      
      // 创建一个新的处理后的公式文本
      let result = this.formattedFormula
      
      // 1. 直接将向量符号转换为粗体，避免乱码
      result = result.replace(/\\vec\{([^}]+)\}/g, '\\boldsymbol{$1}')
      
      // 2. 处理所有数学函数，确保它们后面有空格
      const mathFunctions = [
        'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
        'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
        'log', 'ln', 'exp', 'lim', 'sup', 'inf', 'max', 'min',
        'det', 'dim', 'mod', 'gcd', 'lcm', 'sum', 'prod',
        'Delta', 'Gamma', 'Lambda', 'Omega', 'Phi', 'Pi', 'Psi', 'Sigma', 'Theta', 'Xi',
        'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa',
        'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi',
        'chi', 'psi', 'omega'
      ]
      
      // 为所有数学函数添加空格
      mathFunctions.forEach(func => {
        const pattern = new RegExp(`\\\\${func}`, 'g')
        result = result.replace(pattern, `\\${func} `)
      })
      
      // 3. 处理分数，确保分数后有空格
      result = result.replace(/(\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$1 ')
      
      // 4. 处理运算符，确保它们周围有空格
      result = result.replace(/([^\\])([+\-*=])/g, '$1 $2 ')
      
      // 5. 处理特殊情况
      result = result
        .replace(/\\\\/g, '\\\\ ') // 换行符后添加空格
        .replace(/\\cdot/g, '\\cdot ') // 点乘符号后添加空格
        .replace(/\\times/g, '\\times ') // 乘号后添加空格
        .replace(/\\div/g, '\\div ') // 除号后添加空格
        .replace(/\\pm/g, '\\pm ') // 加减号后添加空格
        .replace(/\\mp/g, '\\mp ') // 减加号后添加空格
        .replace(/\\infty/g, '\\infty ') // 无穷符号后添加空格
        
      return result
    }
  },
  
  watch: {
    formula: {
      handler: 'debouncedRenderFormula',
      immediate: true
    },
    inline() {
      if (this.formula) {
        this.renderFormula(true)
      }
    }
  },
  
  mounted() {
    this.renderFormula()
  },
  
  beforeUnmount() {
    this.clearTimeouts()
  },
  
  methods: {
    async renderFormula(immediate = false) {
      await this.$nextTick()
      
      if (!this.$refs.formulaContainer || !this.formula.trim()) {
        this.isLoading = false
        return
      }
      
      this.clearRenderTimeout()
      
      if (immediate) {
        await this.executeRender()
      } else {
        this.renderTimeout = setTimeout(() => {
          this.executeRender()
        }, this.renderDelay)
      }
    },
    
    debouncedRenderFormula() {
      this.renderFormula()
    },
    
    async executeRender() {
      try {
        this.isLoading = true
        this.hasError = false
        
        await this.$nextTick()
        
        if (!this.$refs.formulaContainer || !this.$refs.formulaElement) {
          throw new Error('公式容器未找到')
        }
        
        // 处理向量符号
        let processedFormula = this.formula
          // 确保向量符号正确显示
          .replace(/\\vec\{([^}]+)\}/g, '\\overrightarrow{$1}');
        
        // 直接设置公式内容到DOM元素
        const formulaContent = this.inline ? 
          `\\(${processedFormula}\\)` : 
          `\\[${processedFormula}\\]`;
        
        this.$refs.formulaElement.textContent = formulaContent;
        
        // 检查MathJax是否可用
        if (!this.checkMathJax()) {
          throw new Error('MathJax未加载，请检查index.html配置')
        }
        
        // 使用MathJax渲染公式
        await this.renderMath(this.$refs.formulaContainer)
        
        this.isLoading = false
        this.retryCount = 0
        
      } catch (error) {
        console.error('公式渲染错误:', error)
        this.handleRenderError(error)
      }
    },
    
    handleRenderError(error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        const delay = 1000 * this.retryCount
        
        this.retryTimeout = setTimeout(() => {
          this.renderFormula(true)
        }, delay)
      } else {
        this.hasError = true
        this.isLoading = false
        console.error(`公式渲染失败，已重试 ${this.maxRetries} 次:`, error)
      }
    },
    
    retry() {
      this.clearRetryTimeout()
      this.retryCount = 0
      this.renderFormula(true)
    },
    
    clearTimeouts() {
      this.clearRenderTimeout()
      this.clearRetryTimeout()
    },
    
    clearRenderTimeout() {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout)
        this.renderTimeout = null
      }
    },
    
    clearRetryTimeout() {
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout)
        this.retryTimeout = null
      }
    }
  }
}
</script>

<style scoped>
.math-formula {
  position: relative;
  transition: all 0.3s ease;
}

.math-formula.inline {
  display: inline-block;
  vertical-align: middle;
}

.math-formula.display {
  display: block;
  text-align: center;
  margin: 1rem 0;
}

.formula-content {
  color: var(--formula-color);
  transition: color 0.3s ease;
}

/* 尺寸样式 */
.math-formula.display .formula-content {
  font-size: 1.2rem;
}

.math-formula.display.small .formula-content {
  font-size: 1rem;
}

.math-formula.display.large .formula-content {
  font-size: 1.5rem;
}

.math-formula.display.xl .formula-content {
  font-size: 2rem;
}

.math-formula.inline .formula-content {
  font-size: 1rem;
}

.math-formula.inline.small .formula-content {
  font-size: 0.875rem;
}

.math-formula.inline.large .formula-content {
  font-size: 1.25rem;
}

/* 加载状态 */
.formula-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #64ffda;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-top: 2px solid #64ffda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
}

/* 错误状态 */
.formula-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.25rem;
}

.error-text {
  font-size: 0.875rem;
}

.retry-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 4px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

/* 悬停效果 */
.math-formula:hover .formula-content {
  filter: brightness(1.2);
  text-shadow: 0 0 10px currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .math-formula.display.xl .formula-content {
    font-size: 1.5rem;
  }
  
  .math-formula.display.large .formula-content {
    font-size: 1.25rem;
  }
  
  .math-formula.display .formula-content {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .math-formula.display.xl .formula-content {
    font-size: 1.25rem;
  }
  
  .math-formula.display.large .formula-content {
    font-size: 1.1rem;
  }
  
  .math-formula.display .formula-content {
    font-size: 0.9rem;
  }
}
</style>