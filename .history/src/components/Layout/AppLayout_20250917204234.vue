<template>
  <n-layout class="app-layout">
    <!-- 顶部导航 -->
    <n-layout-header class="app-header" bordered>
      <div class="header-content">
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <div class="logo">
              <span class="logo-icon">🌌</span>
              <span class="logo-text">UTF Star</span>
            </div>
          </router-link>
        </div>
        
        <nav class="main-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </nav>
        
        <div class="header-actions">
          <n-button 
            quaternary 
            circle 
            @click="themeStore.toggleTheme()"
            class="theme-toggle"
          >
            <template #icon>
              <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
            </template>
          </n-button>
          
          <n-button 
            quaternary 
            circle 
            @click="showMobileMenu = true"
            class="mobile-menu-btn"
          >
            <template #icon>
              <span>☰</span>
            </template>
          </n-button>
        </div>
      </div>
    </n-layout-header>
    
    <!-- 主要内容区域 -->
    <n-layout-content class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </n-layout-content>
    
    <!-- 底部 -->
    <n-layout-footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>统一场论可视化</h4>
          <p>探索宇宙的统一理论</p>
        </div>
        
        <div class="footer-section">
          <h4>快速链接</h4>
          <ul class="footer-links">
            <li><router-link to="/formulas">公式列表</router-link></li>
            <li><router-link to="/learning-path">学习路径</router-link></li>
            <li><router-link to="/relationships">公式关系</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>关于项目</h4>
          <ul class="footer-links">
            <li><router-link to="/about">项目介绍</router-link></li>
            <li><a href="#" @click.prevent>技术文档</a></li>
            <li><a href="#" @click.prevent>开源代码</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>联系我们</h4>
          <p>UTF Star Team</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </n-layout-footer>
    
    <!-- 移动端菜单抽屉 -->
    <n-drawer 
      v-model:show="showMobileMenu" 
      :width="280"
      placement="right"
    >
      <n-drawer-content title="导航菜单">
        <div class="mobile-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="mobile-nav-item"
            @click="showMobileMenu = false"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>
        
        <div class="mobile-actions">
          <n-button 
            block 
            @click="themeStore.toggleTheme()"
            class="theme-toggle-mobile"
          >
            <template #icon>
              <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
            </template>
            {{ themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式' }}
          </n-button>
        </div>
      </n-drawer-content>
    </n-drawer>
  </n-layout>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const route = useRoute()

// 移动端菜单状态
const showMobileMenu = ref(false)

// 导航项目
const navItems = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/formulas', name: '公式', icon: '📐' },
  { path: '/relationships', name: '关系', icon: '🔗' },
  { path: '/learning-path', name: '学习', icon: '📚' },
  { path: '/about', name: '关于', icon: 'ℹ️' }
]

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
  themeStore.watchSystemTheme()
})

// 监听路由变化，关闭移动端菜单
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

/* 头部样式 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(15, 15, 35, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 64px;
}

.logo-section {
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.logo-icon {
  font-size: 2rem;
}

.main-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
}

.nav-icon {
  font-size: 1.2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle {
  font-size: 1.2rem;
}

.mobile-menu-btn {
  display: none;
  font-size: 1.2rem;
}

/* 内容区域 */
.app-content {
  flex: 1;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 底部样式 */
.app-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 0 1rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-section p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--color-primary);
}

/* 移动端菜单 */
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-weight: 500;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.mobile-actions {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-toggle-mobile {
  justify-content: flex-start;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .nav-text {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 1024px) {
  .nav-text {
    display: none;
  }
}
</style>