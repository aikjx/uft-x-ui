<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            张祥前统一场论
            <span class="highlight">学习平台</span>
          </h1>
          <p class="hero-description">
            探索宇宙的终极奥秘，理解时空、物质与能量的统一本质。
            通过系统化的学习路径，掌握前沿物理理论的精髓。
          </p>
          <div class="hero-actions">
            <router-link to="/formulas" class="btn btn-primary">
              开始学习
            </router-link>
            <router-link to="/relationships" class="btn btn-secondary">
              关系图谱
            </router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="cosmic-animation">
            <div class="orbit orbit-1">
              <div class="particle"></div>
            </div>
            <div class="orbit orbit-2">
              <div class="particle"></div>
            </div>
            <div class="orbit orbit-3">
              <div class="particle"></div>
            </div>
            <div class="center-core"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ formulas.length }}</div>
          <div class="stat-label">核心公式</div>
          <div class="stat-icon">⚛️</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">理论分类</div>
          <div class="stat-icon">📚</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">12</div>
          <div class="stat-label">学习章节</div>
          <div class="stat-icon">🎯</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">∞</div>
          <div class="stat-label">探索可能</div>
          <div class="stat-icon">🌌</div>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">平台特色</h2>
        <p class="section-subtitle">全方位的学习体验，深入理解统一场论</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📐</div>
          <h3 class="feature-title">公式总览</h3>
          <p class="feature-description">
            系统整理的核心公式库，包含详细推导过程和物理意义解释
          </p>
          <router-link to="/formulas" class="feature-link">
            探索公式 →
          </router-link>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🛤️</div>
          <h3 class="feature-title">学习路径</h3>
          <p class="feature-description">
            循序渐进的学习计划，从基础概念到高级理论的完整路径
          </p>
          <router-link to="/learning-path" class="feature-link">
            开始学习 →
          </router-link>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🕸️</div>
          <h3 class="feature-title">关系图谱</h3>
          <p class="feature-description">
            可视化的理论关系网络，直观理解各概念间的内在联系
          </p>
          <router-link to="/relationships" class="feature-link">
            查看图谱 →
          </router-link>
        </div>
      </div>
    </section>

    <!-- 最新公式预览 -->
    <section class="preview-section">
      <div class="section-header">
        <h2 class="section-title">核心公式预览</h2>
        <p class="section-subtitle">统一场论的基础方程</p>
      </div>
      
      <div class="formulas-preview">
        <div
          v-for="formula in featuredFormulas"
          :key="formula.id"
          class="formula-preview-card"
        >
          <div class="formula-header">
            <h4 class="formula-name">{{ formula.name }}</h4>
            <span :class="['category-badge', formula.category.toLowerCase()]">
              {{ formula.category }}
            </span>
          </div>
          <div class="formula-latex">{{ formula.latex }}</div>
          <p class="formula-desc">{{ formula.description }}</p>
        </div>
      </div>
      
      <div class="preview-actions">
        <router-link to="/formulas" class="btn btn-outline">
          查看全部公式
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formulas, categories } from '../data/formulas'

// 精选公式（前4个）
const featuredFormulas = computed(() => formulas.slice(0, 4))
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* 英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: #ffd700;
  color: #2d3748;
}

.btn-primary:hover {
  background: #ffed4e;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* 宇宙动画 */
.cosmic-animation {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.orbit {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.orbit-1 {
  width: 100px;
  height: 100px;
  top: 100px;
  left: 100px;
}

.orbit-2 {
  width: 160px;
  height: 160px;
  top: 70px;
  left: 70px;
  animation-duration: 30s;
}

.orbit-3 {
  width: 220px;
  height: 220px;
  top: 40px;
  left: 40px;
  animation-duration: 40s;
}

.particle {
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px #ffd700;
}

.center-core {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #ffd700, #ffed4e);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px #ffd700;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

/* 统计区域 */
.stats-section {
  padding: 4rem 2rem;
  background: #f8fafc;
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

/* 功能特色 */
.features-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #718096;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-link {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.feature-link:hover {
  color: #764ba2;
}

/* 公式预览 */
.preview-section {
  padding: 4rem 2rem;
  background: #f8fafc;
}

.formulas-preview {
  max-width: 1200px;
  margin: 0 auto 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.formula-preview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.formula-name {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.category-badge.基础理论 { background: #e6fffa; color: #234e52; }
.category-badge.电磁学 { background: #fef5e7; color: #744210; }
.category-badge.量子力学 { background: #f0fff4; color: #22543d; }
.category-badge.相对论 { background: #e6f3ff; color: #2a4365; }

.formula-latex {
  font-family: 'Times New Roman', serif;
  font-size: 1.25rem;
  color: #667eea;
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.formula-desc {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.preview-actions {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .cosmic-animation {
    width: 200px;
    height: 200px;
  }
  
  .orbit-1 { width: 80px; height: 80px; top: 60px; left: 60px; }
  .orbit-2 { width: 120px; height: 120px; top: 40px; left: 40px; }
  .orbit-3 { width: 160px; height: 160px; top: 20px; left: 20px; }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>