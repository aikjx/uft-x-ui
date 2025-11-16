<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-content">
          <span class="logo-text">UFT-X</span>
          <span class="logo-subtitle">统一场论可视化</span>
        </div>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="desktop-nav">
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          class="nav-link"
          :class="{ active: currentRoute === item.path }"
        >
          {{ item.label }}
        </router-link>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>

      <!-- Mobile Navigation Toggle -->
      <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="菜单">
        <div class="menu-icon">
          <span class="bar" :class="{ active: mobileMenuOpen }" style="--i: 0"></span>
          <span class="bar" :class="{ active: mobileMenuOpen }" style="--i: 1"></span>
          <span class="bar" :class="{ active: mobileMenuOpen }" style="--i: 2"></span>
        </div>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <motion.div 
      class="mobile-nav"
      :class="{ open: mobileMenuOpen }"
      :initial="{ opacity: 0, height: 0 }"
        :animate="{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : '0px' }"
        :transition="{ duration: 0.3 }"
    >
      <div class="mobile-nav-content">
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          class="mobile-nav-link"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
        <div class="mobile-theme-toggle">
          <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
          <button @click="toggleTheme" class="theme-btn">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </motion.div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'framer-motion'
import { useVisualizationStore } from '@/stores/visualization'

// 使用Store
const visualizationStore = useVisualizationStore()

// 路由
const route = useRoute()

// 响应式数据
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

// 导航项
const navItems = [
  { name: 'home', path: '/', label: '首页' },
  { name: 'formulaVisualization', path: '/formula-visualization', label: '公式可视化' },
  { name: 'interactiveExploration', path: '/interactive-exploration', label: '交互式探索' },
  { name: 'knowledge', path: '/knowledge', label: '知识库' }
]

// 计算属性
const currentRoute = computed(() => route.path)
const isDark = computed(() => visualizationStore.config.theme === 'dark')

// 方法
function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'
  visualizationStore.updateConfig({ theme: newTheme })
  document.documentElement.setAttribute('data-theme', newTheme)
}

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 设置初始主题
  document.documentElement.setAttribute('data-theme', visualizationStore.config.theme)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background-color: rgba(10, 10, 10, 0.98);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 6rem;
}

/* Logo */
.logo {
  text-decoration: none;
}

.logo-content {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4DBA87;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #999;
  line-height: 1.2;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #4DBA87;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4DBA87;
  transition: all 0.3s ease;
}

/* Theme Toggle */
.theme-toggle {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #fff;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: rotate(15deg);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  position: relative;
}

.bar {
  width: 100%;
  height: 2px;
  background-color: #fff;
  transition: all 0.3s ease;
  position: absolute;
}

.bar:nth-child(1) {
  top: 0.5rem;
}

.bar:nth-child(2) {
  top: 1rem;
}

.bar:nth-child(3) {
  top: 1.5rem;
}

.bar.active:nth-child(1) {
  transform: rotate(45deg);
  top: 1rem;
  background-color: #4DBA87;
}

.bar.active:nth-child(2) {
  opacity: 0;
}

.bar.active:nth-child(3) {
  transform: rotate(-45deg);
  top: 1rem;
  background-color: #4DBA87;
}

/* Mobile Navigation */
.mobile-nav {
  overflow: hidden;
  background-color: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-nav-link {
  color: #fff;
  text-decoration: none;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background-color: rgba(77, 186, 135, 0.1);
  color: #4DBA87;
}

.mobile-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  margin-top: 1rem;
}

.theme-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .desktop-nav {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
    height: 5rem;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .logo-subtitle {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .mobile-nav-content {
    padding: 1rem;
  }
}
</style>