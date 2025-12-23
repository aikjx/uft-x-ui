// MathFormula 组件性能测试脚本
import { createApp } from 'vue'
import MathFormula from './src/components/MathFormula.vue'

// 创建测试应用
const app = createApp({
  components: { MathFormula },
  template: `
    <div id="test-app">
      <h2>MathFormula 组件性能测试</h2>
      
      <div class="test-section">
        <h3>内联公式测试</h3>
        <MathFormula formula="E = mc^2" inline />
        <MathFormula formula="a^2 + b^2 = c^2" inline />
      </div>
      
      <div class="test-section">
        <h3>块级公式测试</h3>
        <MathFormula formula="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" />
        <MathFormula formula="\\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}" />
      </div>
      
      <div class="test-section">
        <h3>错误处理测试</h3>
        <MathFormula formula="" />
        <MathFormula formula="invalid { latex }" />
      </div>
    </div>
  `
})

// 挂载测试应用
app.mount('#test-app')

console.log('MathFormula 组件测试应用已创建')