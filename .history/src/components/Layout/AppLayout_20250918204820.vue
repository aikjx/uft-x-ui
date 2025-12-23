<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <nav class="navbar animate-slide-down">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <div class="logo-content hover-scale">
            <span class="logo-icon">🌌</span>
            <span class="logo-text">UTF Star</span>
          </div>
        </router-link>

        <div class="nav-links">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            :class="{ active: $route.path === link.path }"
          >
            <div class="hover-scale">
              {{ link.name }}
            </div>
          </router-link>
        </div>

        <div class="nav-actions">
          <button
            @click="toggleTheme"
            class="theme-toggle hover-scale"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer animate-fade-in-delayed">
      <div class="footer-content">
        <p>&copy; 2024 UTF Star - 张祥前统一场论可视化平台</p>
        <p class="footer-subtitle">探索宇宙的统一理论</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDark = ref(false)

const navLinks = [
  { name: '首页', path: '/' },
  { name: '公式总览', path: '/formulas' },
  { name: '探索路径', path: '/learning-path' },
  { name: '关系图谱', path: '/relationships' }
]

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
}

.navbar {
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between;
}

.nav-logo {
  @apply flex items-center space-x-2 no-underline;
}

.logo-content {
  @apply flex items-center space-x-2;
}

.logo-icon {
  @apply text-2xl;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.nav-links {
  @apply hidden md:flex items-center space-x-8;
}

.nav-link {
  color: #b0bec5;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;
}

.nav-link:hover {
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
}

.nav-link.active {
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
}

.nav-actions {
  @apply flex items-center space-x-4;
}

.theme-toggle {
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  color: #64ffda;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: 0 0 15px rgba(100, 255, 218, 0.2);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 0;
}

.footer {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  color: #b0bec5;
}

.footer-subtitle {
  font-size: 0.875rem;
  color: #64ffda;
  margin-top: 0.5rem;
}

/* 动画类 */
.animate-slide-down {
  animation: slideDown 0.6s ease-out;
}

.animate-fade-in-delayed {
  animation: fadeIn 0.6s ease-out 1s both;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>