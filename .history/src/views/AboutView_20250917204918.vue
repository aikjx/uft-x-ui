<template>
  <div class="about-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title gradient-text">关于项目</h1>
        <p class="page-description">
          了解统一场论可视化项目的背景、目标和技术实现
        </p>
      </div>
      
      <div class="about-content">
        <section class="project-intro">
          <h2>项目简介</h2>
          <p>
            本项目致力于通过现代化的Web技术，为张祥前统一场论的核心公式提供直观、
            交互式的可视化体验。我们相信，通过3D渲染、实时参数控制和数学公式同步显示，
            能够帮助学习者更好地理解这一革命性的物理理论。
          </p>
        </section>
        
        <section class="theory-background">
          <h2>理论背景</h2>
          <div class="theory-grid">
            <div class="theory-card">
              <div class="theory-icon">🌌</div>
              <h3>统一场论</h3>
              <p>
                张祥前统一场论是一个试图统一描述引力、电磁力等基本相互作用的理论框架，
                为理解宇宙的基本结构提供了新的视角。
              </p>
            </div>
            
            <div class="theory-card">
              <div class="theory-icon">⚖️</div>
              <h3>核心公式</h3>
              <p>
                理论包含19个核心公式，涵盖时空理论、力学基础、统一理论、
                电磁理论和应用理论等多个方面。
              </p>
            </div>
            
            <div class="theory-card">
              <div class="theory-icon">🔬</div>
              <h3>科学价值</h3>
              <p>
                通过数学公式的可视化展示，帮助研究者和学习者从直观的角度
                理解复杂的物理概念和数学关系。
              </p>
            </div>
          </div>
        </section>
        
        <section class="tech-stack">
          <h2>技术架构</h2>
          <div class="tech-categories">
            <div class="tech-category">
              <h3>前端框架</h3>
              <div class="tech-items">
                <div class="tech-item">
                  <span class="tech-name">Vue 3</span>
                  <span class="tech-desc">现代化的渐进式框架</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">TypeScript</span>
                  <span class="tech-desc">类型安全的JavaScript</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Vite</span>
                  <span class="tech-desc">快速的构建工具</span>
                </div>
              </div>
            </div>
            
            <div class="tech-category">
              <h3>可视化技术</h3>
              <div class="tech-items">
                <div class="tech-item">
                  <span class="tech-name">Three.js</span>
                  <span class="tech-desc">3D图形渲染引擎</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">WebGL 2.0</span>
                  <span class="tech-desc">硬件加速的图形API</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">D3.js</span>
                  <span class="tech-desc">数据驱动的可视化</span>
                </div>
              </div>
            </div>
            
            <div class="tech-category">
              <h3>UI组件</h3>
              <div class="tech-items">
                <div class="tech-item">
                  <span class="tech-name">Naive UI</span>
                  <span class="tech-desc">Vue 3组件库</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Tailwind CSS</span>
                  <span class="tech-desc">实用优先的CSS框架</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">GSAP</span>
                  <span class="tech-desc">高性能动画库</span>
                </div>
              </div>
            </div>
            
            <div class="tech-category">
              <h3>数学渲染</h3>
              <div class="tech-items">
                <div class="tech-item">
                  <span class="tech-name">MathJax 3.0</span>
                  <span class="tech-desc">数学公式渲染引擎</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">VueUse</span>
                  <span class="tech-desc">Vue组合式API工具集</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Pinia</span>
                  <span class="tech-desc">Vue状态管理库</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section class="features">
          <h2>核心特性</h2>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">🎮</div>
              <h3>交互式体验</h3>
              <p>实时调节参数，观察公式行为变化，支持多种交互方式</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <h3>响应式设计</h3>
              <p>完美适配桌面、平板和手机设备，随时随地学习</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <h3>高性能渲染</h3>
              <p>基于WebGL的GPU加速，流畅的3D动画和实时渲染</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <h3>现代化UI</h3>
              <p>精美的界面设计，直观的用户体验，支持明暗主题</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <h3>渐进式学习</h3>
              <p>科学的学习路径设计，从基础到高级的完整体系</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🔗</div>
              <h3>关系图谱</h3>
              <p>可视化公式间的逻辑关系，理解理论的整体架构</p>
            </div>
          </div>
        </section>
        
        <section class="team">
          <h2>开发团队</h2>
          <div class="team-info">
            <div class="team-card">
              <h3>UTF Star Team</h3>
              <p>
                我们是一支专注于科学可视化的技术团队，致力于用现代化的Web技术
                让复杂的科学理论变得更加直观和易于理解。
              </p>
              
              <div class="team-values">
                <div class="value-item">
                  <strong>科学严谨</strong>
                  <span>确保每个公式和可视化的准确性</span>
                </div>
                <div class="value-item">
                  <strong>技术创新</strong>
                  <span>采用最新的Web技术和最佳实践</span>
                </div>
                <div class="value-item">
                  <strong>用户体验</strong>
                  <span>以用户为中心的设计理念</span>
                </div>
                <div class="value-item">
                  <strong>开源精神</strong>
                  <span>推动科学教育的普及和发展</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section class="contact">
          <h2>联系我们</h2>
          <div class="contact-info">
            <p>
              如果您对项目有任何建议、问题或合作意向，欢迎与我们联系：
            </p>
            
            <div class="contact-methods">
              <div class="contact-item">
                <span class="contact-label">项目地址:</span>
                <a href="#" class="contact-link">GitHub Repository</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">技术文档:</span>
                <a href="#" class="contact-link">Documentation</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">问题反馈:</span>
                <a href="#" class="contact-link">Issue Tracker</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑可以在这里添加
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.about-content {
  max-width: 1000px;
  margin: 0 auto;
}

section {
  margin-bottom: 4rem;
  padding: 2rem;
  background: var(--glass-effect);
  border-radius: 1rem;
}

section h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.project-intro p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.theory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.theory-card {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
}

.theory-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.theory-card h3 {
  color: var(--color-accent);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.theory-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.tech-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.tech-category h3 {
  color: var(--color-accent);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.tech-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.tech-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.tech-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-item h3 {
  color: var(--color-accent);
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.feature-item p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.team-card {
  text-align: center;
}

.team-card h3 {
  color: var(--color-primary);
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.team-card > p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.team-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.value-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.value-item strong {
  color: var(--color-accent);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.value-item span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.contact-info {
  text-align: center;
}

.contact-info > p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.contact-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.contact-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--color-accent);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  section {
    padding: 1.5rem;
  }
  
  .theory-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-categories {
    grid-template-columns: 1fr;
  }
  
  .team-values {
    grid-template-columns: 1fr;
  }
}
</style>