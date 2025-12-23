<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <motion.nav
      :initial="{ y: -100, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :transition="{ duration: 0.6, ease: 'easeOut' }"
      class="navbar"
    >
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <motion.div
            :whileHover="{ scale: 1.05, rotate: 5 }"
            :whileTap="{ scale: 0.95 }"
            class="logo-content"
          >
            <span class="logo-icon">🌌</span>
            <span class="logo-text">UTF Star</span>
          </motion.div>
        </router-link>

        <div class="nav-links">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            :class="{ active: $route.path === link.path }"
          >
            <motion.div
              :whileHover="{ scale: 1.05 }"
              :whileTap="{ scale: 0.95 }"
            >
              {{ link.name }}
            </motion.div>
          </router-link>
        </div>

        <div class="nav-actions">
          <motion.button
            :whileHover="{ scale: 1.1 }"
            :whileTap="{ scale: 0.9 }"
            @click="toggleTheme"
            class="theme-toggle"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </motion.button>
        </div>
      </div>
    </motion.nav>

    <!-- 主要内容 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-4 opacity-0"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <motion.footer
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 1, duration: 0.6 }"
      class="footer"
    >
      <div class="footer-content">
        <p>&copy; 2024 UTF Star - 张祥前统一场论可视化平台</p>
        <p class="footer-subtitle">探索宇宙的统一理论，让科学之美触手可及</p>
      </div>
    </motion.footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'framer-motion'

const route = useRoute()
const isDark = ref(false)

const navLinks = [
  { name: '公式总览', path: '/' },
  { name: '学习路径', path: '/learning' },
  { name: '公式关系', path: '/relationships' },
  { name: '关于项目', path: '/about' }
]

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<style scoped>
.app-layout {
  @apply min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 
         dark:from-gray-900 dark:to-gray-800;
}

.navbar {
  @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 
         dark:border-gray-700/50 sticky top-0 z-50;
}

.nav-container {
  @apply max-w-7xl mx-auto px-4 py-4 flex items-center justify-between;
}

.nav-logo {
  @apply flex items-center gap-3 no-underline;
}

.logo-content {
  @apply flex items-center gap-3;
}

.logo-icon {
  @apply text-2xl;
}

.logo-text {
  @apply text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
         bg-clip-text text-transparent;
}

.nav-links {
  @apply hidden md:flex items-center gap-6;
}

.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 
         font-medium transition-colors no-underline;
}

.nav-link.active {
  @apply text-blue-600 dark:text-blue-400;
}

.nav-actions {
  @apply flex items-center gap-3;
}

.theme-toggle {
  @apply w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg;
}

.main-content {
  @apply flex-1;
}

.footer {
  @apply bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-t border-gray-200/50 
         dark:border-gray-700/50 py-8;
}

.footer-content {
  @apply max-w-7xl mx-auto px-4 text-center;
}

.footer-content p {
  @apply text-gray-600 dark:text-gray-400;
}

.footer-subtitle {
  @apply text-sm mt-2;
}
</style>