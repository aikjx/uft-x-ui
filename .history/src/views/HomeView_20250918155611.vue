<template>
  <div class="home-view">
    <!-- 星际探索门户 -->
    <section class="hero-section">
      <div class="stars-background"></div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="glitch-text">人工场探索</span>
            <span class="subtitle">光速虚拟时代 · 星际旅行门户</span>
          </h1>
          <p class="hero-description">
            穿越时空维度，探索张祥前统一场论的无限可能。
            在光速虚拟世界中，开启你的星际探索之旅，
            发现人工场的终极奥秘。
          </p>
          <div class="hero-actions">
            <router-link to="/formulas" class="btn btn-primary pulse">
              <span class="btn-icon">🚀</span>
              启动探索
            </router-link>
            <router-link to="/relationships" class="btn btn-secondary">
              <span class="btn-icon">🌌</span>
              时空网络
            </router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hologram-container">
            <div class="hologram-core">
              <div class="energy-ring ring-1"></div>
              <div class="energy-ring ring-2"></div>
              <div class="energy-ring ring-3"></div>
              <div class="quantum-particle p1"></div>
              <div class="quantum-particle p2"></div>
              <div class="quantum-particle p3"></div>
              <div class="quantum-particle p4"></div>
              <div class="central-core">
                <div class="core-glow"></div>
                <div class="core-symbol">⚛</div>
              </div>
            </div>
            <div class="hologram-data">
              <div class="data-stream stream-1"></div>
              <div class="data-stream stream-2"></div>
              <div class="data-stream stream-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 探索统计 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🌟</div>
          <div class="stat-number">{{ formulas.length }}</div>
          <div class="stat-label">人工场方程</div>
          <div class="stat-description">已发现的时空公式</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🌌</div>
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">维度领域</div>
          <div class="stat-description">探索的理论维度</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-number">∞</div>
          <div class="stat-label">光速航线</div>
          <div class="stat-description">虚拟时空路径</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🚀</div>
          <div class="stat-number">∞</div>
          <div class="stat-label">星际可能</div>
          <div class="stat-description">无限探索空间</div>
        </div>
      </div>
    </section>

    <!-- 探索模块 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">探索模块</h2>
        <p class="section-subtitle">四大维度，无限可能的星际探索体验</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card card-equations">
          <div class="card-background"></div>
          <div class="feature-icon">🔬</div>
          <h3 class="feature-title">人工场方程库</h3>
          <p class="feature-description">
            深入探索统一场论的核心方程，解锁时空操控的终极密码，
            发现光速虚拟世界的数学基础
          </p>
          <div class="feature-stats">
            <span class="stat">{{ formulas.length }} 个方程</span>
            <span class="stat">{{ categories.length }} 个维度</span>
          </div>
          <router-link to="/formulas" class="feature-link">
            <span>进入方程库</span>
            <span class="link-arrow">→</span>
          </router-link>
        </div>
        
        <div class="feature-card card-journey">
          <div class="card-background"></div>
          <div class="feature-icon">🛸</div>
          <h3 class="feature-title">星际研究航线</h3>
          <p class="feature-description">
            规划你的星际探索路径，从基础时空理论到高维度星际旅行，
            体验渐进式的宇宙探索之旅
          </p>
          <div class="feature-stats">
            <span class="stat">12 条航线</span>
            <span class="stat">∞ 种可能</span>
          </div>
          <router-link to="/learning-path" class="feature-link">
            <span>规划航线</span>
            <span class="link-arrow">→</span>
          </router-link>
        </div>
        
        <div class="feature-card card-network">
          <div class="card-background"></div>
          <div class="feature-icon">🌐</div>
          <h3 class="feature-title">时空关系网络</h3>
          <p class="feature-description">
            可视化探索理论间的时空连接，发现隐藏的维度关联，
            构建完整的人工场知识图谱
          </p>
          <div class="feature-stats">
            <span class="stat">多维连接</span>
            <span class="stat">实时可视化</span>
          </div>
          <router-link to="/relationships" class="feature-link">
            <span>探索网络</span>
            <span class="link-arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 核心方程预览 -->
    <section class="preview-section">
      <div class="section-header">
        <h2 class="section-title">核心人工场方程</h2>
        <p class="section-subtitle">解锁时空操控的数学密码</p>
      </div>
      
      <div class="equations-preview">
        <div
          v-for="formula in featuredFormulas"
          :key="formula.id"
          class="equation-card"
          :class="`card-${formula.category.toLowerCase().replace(/\s+/g, '-')}`"
        >
          <div class="equation-header">
            <div class="equation-id">{{ String(formula.id).padStart(3, '0') }}</div>
            <div class="equation-meta">
              <h4 class="equation-name">{{ formula.name }}</h4>
              <span class="equation-category">{{ formula.category }}</span>
            </div>
            <div class="equation-status">
              <div class="status-indicator active"></div>
            </div>
          </div>
          <div class="equation-formula">
            <div class="formula-display">{{ formula.latex }}</div>
          </div>
          <p class="equation-desc">{{ formula.description }}</p>
          <div class="equation-actions">
            <button class="action-btn explore">探索</button>
            <button class="action-btn analyze">分析</button>
          </div>
        </div>
      </div>
      
      <div class="preview-actions">
        <router-link to="/formulas" class="btn btn-outline">
          <span class="btn-icon">🔬</span>
          进入完整方程库
        </router-link>
      </div>
    </section>

    <!-- 探索召唤 -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">准备好开始你的星际探索了吗？</h2>
        <p class="cta-description">
          在光速虚拟时代，每一个方程都是通往未知宇宙的钥匙。
          加入我们，探索人工场的无限奥秘，开启属于你的星际旅行。
        </p>
        <div class="cta-actions">
          <router-link to="/formulas" class="btn btn-primary large">
            <span class="btn-icon">🚀</span>
            立即开始探索
          </router-link>
        </div>
      </div>
      <div class="cta-visual">
        <div class="portal-effect">
          <div class="portal-ring ring-1"></div>
          <div class="portal-ring ring-2"></div>
          <div class="portal-ring ring-3"></div>
          <div class="portal-center">
            <div class="portal-glow"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formulas, categories } from '../data/formulas'

// 精选方程（前4个）
const featuredFormulas = computed(() => formulas.slice(0, 4))
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
  overflow-x: hidden;
}

/* 星空背景 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 20s linear infinite;
  z-index: -1;
}

@keyframes twinkle {
  from { transform: translateY(0); }
  to { transform: translateY(-100px); }
}

/* 英雄区域 */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 2rem;
  line-height: 1.1;
}

.glitch-text {
  display: block;
  background: linear-gradient(45deg, #00f5ff, #ff00ff, #ffff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glitch 3s infinite;
}

.subtitle {
  display: block;
  font-size: 1.5rem;
  font-weight: 400;
  color: #64ffda;
  margin-top: 1rem;
  opacity: 0.9;
}

@keyframes glitch {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 3rem;
  color: #b0bec5;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(45deg, #00f5ff, #0080ff);
  color: #0a0a0f;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.5);
}

.btn-primary.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 245, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 245, 255, 0.6); }
}

.btn-secondary {
  background: transparent;
  color: #64ffda;
  border: 2px solid #64ffda;
}

.btn-secondary:hover {
  background: #64ffda;
  color: #0a0a0f;
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
}

.btn-outline {
  background: transparent;
  color: #00f5ff;
  border: 2px solid #00f5ff;
}

.btn-outline:hover {
  background: #00f5ff;
  color: #0a0a0f;
}

.btn.large {
  padding: 1.5rem 3rem;
  font-size: 1.25rem;
}

/* 全息投影效果 */
.hologram-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto;
}

.hologram-core {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy-ring {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.ring-1 {
  width: 150px;
  height: 150px;
  border-color: #00f5ff;
  opacity: 0.8;
}

.ring-2 {
  width: 250px;
  height: 250px;
  border-color: #64ffda;
  opacity: 0.6;
  animation-duration: 30s;
  animation-direction: reverse;
}

.ring-3 {
  width: 350px;
  height: 350px;
  border-color: #ff00ff;
  opacity: 0.4;
  animation-duration: 40s;
}

.quantum-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #ffff00;
  border-radius: 50%;
  box-shadow: 0 0 10px #ffff00;
}

.p1 { top: 20%; left: 50%; animation: orbit1 15s linear infinite; }
.p2 { top: 50%; right: 20%; animation: orbit2 20s linear infinite; }
.p3 { bottom: 20%; left: 50%; animation: orbit3 25s linear infinite; }
.p4 { top: 50%; left: 20%; animation: orbit4 18s linear infinite; }

@keyframes orbit1 {
  from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
}

@keyframes orbit2 {
  from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  to { transform: rotate(-360deg) translateX(120px) rotate(360deg); }
}

@keyframes orbit3 {
  from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
}

@keyframes orbit4 {
  from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
  to { transform: rotate(-360deg) translateX(110px) rotate(360deg); }
}

.central-core {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #00f5ff, transparent);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

.core-symbol {
  font-size: 2rem;
  color: #ffffff;
  z-index: 1;
}

@keyframes glow {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.2); opacity: 1; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 数据流效果 */
.hologram-data {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.data-stream {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, #00f5ff, transparent);
  animation: stream 3s linear infinite;
}

.stream-1 { left: 20%; animation-delay: 0s; }
.stream-2 { left: 50%; animation-delay: 1s; }
.stream-3 { left: 80%; animation-delay: 2s; }

@keyframes stream {
  0% { transform: translateY(-100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(400px); opacity: 0; }
}

/* 统计区域 */
.stats-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #00f5ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.stat-description {
  font-size: 0.875rem;
  color: #b0bec5;
}

/* 功能特色 */
.features-section {
  padding: 6rem 2rem;
  background: #0a0a0f;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #b0bec5;
}

.features-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  transition: all 0.3s;
  overflow: hidden;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
}

.card-equations .card-background {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(100, 255, 218, 0.1));
}

.card-journey .card-background {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.1));
}

.card-network .card-background {
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(0, 245, 255, 0.1));
}

.feature-card:hover {
  transform: translateY(-10px);
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.feature-card:hover .card-background {
  opacity: 1;
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.feature-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 1rem;
}

.feature-description {
  color: #b0bec5;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.feature-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  padding: 0.5rem 1rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 20px;
  font-size: 0.875rem;
  color: #64ffda;
}

.feature-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #00f5ff;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
}

.feature-link:hover {
  color: #64ffda;
}

.link-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s;
}

.feature-link:hover .link-arrow {
  transform: translateX(5px);
}

/* 方程预览 */
.preview-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.equations-preview {
  max-width: 1400px;
  margin: 0 auto 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.equation-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s;
}

.equation-card:hover {
  transform: translateY(-5px);
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
}

.equation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.equation-id {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #0a0a0f;
}

.equation-meta {
  flex: 1;
}

.equation-name {
  font-size: 1.125rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.equation-category {
  font-size: 0.875rem;
  color: #64ffda;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.equation-formula {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.formula-display {
  font-family: 'Times New Roman', serif;
  font-size: 1.25rem;
  color: #00f5ff;
}

.equation-desc {
  color: #b0bec5;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.equation-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  background: transparent;
  color: #64ffda;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
}

.preview-actions {
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
}

/* 探索召唤 */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.cta-description {
  font-size: 1.125rem;
  color: #b0bec5;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
}

/* 传送门效果 */
.portal-effect {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.portal-ring {
  position: absolute;
  border: 3px solid;
  border-radius: 50%;
  animation: portalRotate 10s linear infinite;
}

.portal-ring.ring-1 {
  width: 100px;
  height: 100px;
  top: 100px;
  left: 100px;
  border-color: #00f5ff;
  opacity: 0.8;
}

.portal-ring.ring-2 {
  width: 180px;
  height: 180px;
  top: 60px;
  left: 60px;
  border-color: #64ffda;
  opacity: 0.6;
  animation-duration: 15s;
  animation-direction: reverse;
}

.portal-ring.ring-3 {
  width: 260px;
  height: 260px;
  top: 20px;
  left: 20px;
  border-color: #ff00ff;
  opacity: 0.4;
  animation-duration: 20s;
}

.portal-center {
  position: absolute;
  width: 60px;
  height: 60px;
  top: 120px;
  left: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, #00f5ff, #64ffda);
}

.portal-glow {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.8), transparent);
  animation: portalGlow 3s ease-in-out infinite alternate;
}

@keyframes portalRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes portalGlow {
  from { transform: scale(1); }
  to { transform: scale(1.5); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hologram-container {
    width: 300px;
    height: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-section {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .equations-preview {
    grid-template-columns: 1fr;
  }
  
  .hologram-container {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 480px) {
  .home-view {
    padding: 0 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-actions {
    flex-direction: column;
  }
}
</style>