<template>
  <div class="test-formula-view">
    <div class="container">
      <h1 class="title">公式渲染测试页面</h1>
      <p class="subtitle">验证 MathJax 公式可视化功能</p>

      <!-- 基本公式测试 -->
      <section class="test-section">
        <h2>基本公式测试</h2>
        
        <div class="formula-test">
          <h3>内联公式</h3>
          <p>这是一个内联公式：<MathFormula formula="E = mc^2" :inline="true" /></p>
          <p>另一个内联公式：<MathFormula formula="\sqrt{a^2 + b^2}" :inline="true" /></p>
        </div>

        <div class="formula-test">
          <h3>块级公式</h3>
          <MathFormula formula="E = mc^2" :inline="false" size="large" />
          <MathFormula formula="\frac{d}{dx}\int_a^x f(t)dt = f(x)" :inline="false" />
          <MathFormula formula="\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}" :inline="false" />
        </div>
      </section>

      <!-- 统一场论公式测试 -->
      <section class="test-section">
        <h2>统一场论公式测试</h2>
        
        <div class="formula-test">
          <h3>时空同一化方程</h3>
          <MathFormula 
            formula="\vec{r}(t) = \vec{C}t = x\vec{i} + y\vec{j} + z\vec{k}" 
            :inline="false" 
            size="large"
            color="#00f5ff"
          />
        </div>

        <div class="formula-test">
          <h3>三维螺旋时空方程</h3>
          <MathFormula 
            formula="\vec{r}(t) = r\cos\omega t \cdot \vec{i} + r\sin\omega t \cdot \vec{j} + ht \cdot \vec{k}" 
            :inline="false"
            color="#64ffda"
          />
        </div>

        <div class="formula-test">
          <h3>质量定义方程</h3>
          <MathFormula 
            formula="m = k \cdot \frac{dn}{d\Omega}" 
            :inline="false"
            color="#ff6b6b"
          />
        </div>

        <div class="formula-test">
          <h3>宇宙大统一方程</h3>
          <MathFormula 
            formula="F = \frac{d\vec{P}}{dt} = \vec{C}\frac{dm}{dt} - \vec{V}\frac{dm}{dt} + m\frac{d\vec{C}}{dt} - m\frac{d\vec{V}}{dt}" 
            :inline="false"
            size="xl"
            color="#9c27b0"
          />
        </div>
      </section>

      <!-- 复杂公式测试 -->
      <section class="test-section">
        <h2>复杂公式测试</h2>
        
        <div class="formula-test">
          <h3>矩阵和积分</h3>
          <MathFormula 
            formula="\begin{pmatrix} a & b \\ c & d \end{pmatrix} \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" 
            :inline="false"
          />
        </div>

        <div class="formula-test">
          <h3>求和和极限</h3>
          <MathFormula 
            formula="\lim_{n \to \infty} \sum_{k=1}^{n} \frac{1}{k} = \infty" 
            :inline="false"
          />
        </div>
      </section>

      <!-- 状态显示 -->
      <section class="test-section">
        <h2>MathJax 状态</h2>
        <div class="status-info">
          <div class="status-item">
            <span class="status-label">MathJax 加载状态:</span>
            <span class="status-value" :class="{ loaded: mathJaxLoaded, loading: mathJaxLoading }">
              {{ mathJaxLoaded ? '已加载' : mathJaxLoading ? '加载中...' : '未加载' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">MathJax 可用性:</span>
            <span class="status-value" :class="{ available: mathJaxAvailable }">
              {{ mathJaxAvailable ? '可用' : '不可用' }}
            </span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="testRender" class="test-btn">测试渲染</button>
          <button @click="rerenderAll" class="test-btn">重新渲染所有</button>
          <button @click="checkStatus" class="test-btn">检查状态</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MathFormula from '../components/MathFormula.vue'
import { useMathJax } from '../composables/useMathJax'

const mathJaxLoaded = ref(false)
const mathJaxLoading = ref(false)
const mathJaxAvailable = ref(false)

const { isLoaded, isLoading, checkMathJax, initMathJax, rerenderAll: rerenderAllFormulas } = useMathJax()

const checkStatus = () => {
  mathJaxLoaded.value = isLoaded.value
  mathJaxLoading.value = isLoading.value
  mathJaxAvailable.value = checkMathJax()
  
  console.log('MathJax 状态检查:', {
    loaded: mathJaxLoaded.value,
    loading: mathJaxLoading.value,
    available: mathJaxAvailable.value,
    window: !!window.MathJax,
    typesetPromise: !!(window.MathJax && window.MathJax.typesetPromise),
    startup: !!(window.MathJax && window.MathJax.startup)
  })
}

const testRender = async () => {
  try {
    await initMathJax()
    checkStatus()
    console.log('测试渲染完成')
  } catch (error) {
    console.error('测试渲染失败:', error)
  }
}

const rerenderAll = async () => {
  try {
    await rerenderAllFormulas()
    console.log('重新渲染完成')
  } catch (error) {
    console.error('重新渲染失败:', error)
  }
}

onMounted(() => {
  // 初始状态检查
  setTimeout(() => {
    checkStatus()
  }, 1000)
  
  // 定期检查状态
  const interval = setInterval(() => {
    checkStatus()
  }, 2000)
  
  // 10秒后停止检查
  setTimeout(() => {
    clearInterval(interval)
  }, 10000)
})
</script>

<style scoped>
.test-formula-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.2rem;
  text-align: center;
  color: rgba(255,255,255,0.9);
  margin-bottom: 3rem;
}

.test-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.test-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.formula-test {
  margin-bottom: 2rem;
}

.formula-test h3 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 1rem;
}

.formula-test p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.status-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.status-label {
  font-weight: 500;
  color: #333;
}

.status-value {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #e9ecef;
  color: #6c757d;
}

.status-value.loaded,
.status-value.available {
  background: #d4edda;
  color: #155724;
}

.status-value.loading {
  background: #fff3cd;
  color: #856404;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .test-section {
    padding: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>