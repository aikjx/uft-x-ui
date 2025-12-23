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
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800;
}

.navbar {
  @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50;
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
  @apply text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}

.nav-links {
  @apply hidden md:flex items-center space-x-8;
}

.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium no-underline transition-colors;
}

.nav-link.active {
  @apply text-blue-600 dark:text-blue-400;
}

.nav-actions {
  @apply flex items-center space-x-4;
}

.theme-toggle {
  @apply p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl;
}

.main-content {
  @apply flex-1 container mx-auto px-4 sm:px-6 lg:px-8;
}

.footer {
  @apply bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-8 mt-16;
}

.footer-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center;
}

.footer-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-2;
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