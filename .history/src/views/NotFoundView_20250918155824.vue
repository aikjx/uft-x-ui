<template>
  <div class="not-found-view">
    <div class="container">
      <div class="not-found-content">
        <div class="error-animation">
          <div class="error-number">404</div>
          <div class="error-particles">
            <div class="particle" v-for="i in 20" :key="i"></div>
          </div>
        </div>
        
        <div class="error-message">
          <h1>页面未找到</h1>
          <p>抱歉，您访问的页面似乎迷失在了时空的某个角落...</p>
          <p class="error-description">
            也许这个页面正在经历量子隧穿效应，或者被黑洞吞噬了。
            不过别担心，我们可以帮您找到回家的路。
          </p>
        </div>
        
        <div class="error-actions">
          <n-button 
            type="primary" 
            size="large"
            @click="goHome"
            class="action-button"
          >
            返回首页
          </n-button>
          
          <n-button 
            quaternary 
            size="large"
            @click="goBack"
            class="action-button"
          >
            返回上页
          </n-button>
          
          <n-button 
            quaternary 
            size="large"
            @click="goToFormulas"
            class="action-button"
          >
            浏览公式
          </n-button>
        </div>
        
        <div class="helpful-links">
          <h3>您可能在寻找：</h3>
          <div class="links-grid">
            <router-link to="/formulas" class="helpful-link">
              <div class="link-icon">📐</div>
              <div class="link-content">
                <h4>公式列表</h4>
                <p>浏览所有统一场论公式</p>
              </div>
            </router-link>
            
            <router-link to="/learning-path" class="helpful-link">
              <div class="link-icon">📚</div>
              <div class="link-content">
                <h4>探索路径</h4>
                <p>按顺序研究理论知识</p>
              </div>
            </router-link>
            
            <router-link to="/relationships" class="helpful-link">
              <div class="link-icon">🔗</div>
              <div class="link-content">
                <h4>公式关系</h4>
                <p>探索公式间的联系</p>
              </div>
            </router-link>
            
            <router-link to="/about" class="helpful-link">
              <div class="link-icon">ℹ️</div>
              <div class="link-content">
                <h4>关于项目</h4>
                <p>了解项目背景和技术</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goToFormulas = () => {
  router.push('/formulas')
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
  padding: 2rem 0;
}

.not-found-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.error-animation {
  position: relative;
  margin-bottom: 3rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.error-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: particle-float 4s ease-in-out infinite;
}

.particle:nth-child(odd) {
  background: var(--color-accent);
  animation-delay: -2s;
}

.particle:nth-child(3n) {
  background: var(--color-matter);
  animation-delay: -1s;
}

.error-message {
  margin-bottom: 3rem;
}

.error-message h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.error-message p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1rem !important;
  color: rgba(255, 255, 255, 0.6) !important;
  font-style: italic;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 4rem;
  flex-wrap: wrap;
}

.action-button {
  min-width: 120px;
}

.helpful-links {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 2rem;
}

.helpful-links h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.3rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.helpful-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.helpful-link:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.link-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.link-content {
  text-align: left;
}

.link-content h4 {
  color: white;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.link-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

/* 动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes particle-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
  50% {
    transform: translate(var(--random-x, 50px), var(--random-y, -50px)) scale(1.5);
    opacity: 0.8;
  }
}

/* 为每个粒子设置随机位置 */
.particle:nth-child(1) { --random-x: 30px; --random-y: -40px; }
.particle:nth-child(2) { --random-x: -25px; --random-y: -35px; }
.particle:nth-child(3) { --random-x: 45px; --random-y: 20px; }
.particle:nth-child(4) { --random-x: -40px; --random-y: 30px; }
.particle:nth-child(5) { --random-x: 20px; --random-y: -60px; }
.particle:nth-child(6) { --random-x: -30px; --random-y: -20px; }
.particle:nth-child(7) { --random-x: 50px; --random-y: -10px; }
.particle:nth-child(8) { --random-x: -45px; --random-y: 40px; }
.particle:nth-child(9) { --random-x: 35px; --random-y: 45px; }
.particle:nth-child(10) { --random-x: -20px; --random-y: -45px; }
.particle:nth-child(11) { --random-x: 40px; --random-y: -30px; }
.particle:nth-child(12) { --random-x: -35px; --random-y: 25px; }
.particle:nth-child(13) { --random-x: 25px; --random-y: 35px; }
.particle:nth-child(14) { --random-x: -50px; --random-y: -15px; }
.particle:nth-child(15) { --random-x: 45px; --random-y: -45px; }
.particle:nth-child(16) { --random-x: -25px; --random-y: 50px; }
.particle:nth-child(17) { --random-x: 30px; --random-y: -25px; }
.particle:nth-child(18) { --random-x: -40px; --random-y: -40px; }
.particle:nth-child(19) { --random-x: 50px; --random-y: 30px; }
.particle:nth-child(20) { --random-x: -30px; --random-y: -50px; }

/* 响应式设计 */
@media (max-width: 768px) {
  .error-number {
    font-size: 6rem;
  }
  
  .error-message h1 {
    font-size: 2rem;
  }
  
  .error-message p {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 200px;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .helpful-link {
    flex-direction: column;
    text-align: center;
  }
  
  .link-content {
    text-align: center;
  }
}
</style>