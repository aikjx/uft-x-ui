<template>
  <div id="app" :class="themeClass">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { default as AppLayout } from './components/Layout/AppLayout.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

const themeClass = computed(() => themeStore.isDark ? 'theme-dark' : 'theme-light')
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 主题样式 */
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
}

.theme-dark {
  --bg-primary: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --text-primary: #ffffff;
  --text-secondary: #b0bec5;
  --border-color: rgba(100, 255, 218, 0.2);
  --accent-color: #00f5ff;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
  opacity: 0.8;
}

/* 通用动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

/* 响应式工具类 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
}

/* 按钮基础样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(45deg, var(--accent-color), #64ffda);
  color: #0a0a0f;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 245, 255, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
}

.btn-secondary:hover {
  background: rgba(0, 245, 255, 0.1);
}

/* 卡片样式 */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.theme-dark .card:hover {
  box-shadow: 0 10px 25px rgba(0, 245, 255, 0.1);
}

/* 文本样式 */
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-accent {
  color: var(--accent-color);
}

/* 背景样式 */
.bg-primary {
  background-color: var(--bg-primary);
}

.bg-secondary {
  background-color: var(--bg-secondary);
}

/* 加载动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* 工具类 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式显示 */
.hidden {
  display: none;
}

@media (min-width: 640px) {
  .sm\:block {
    display: block;
  }
  .sm\:hidden {
    display: none;
  }
}

@media (min-width: 768px) {
  .md\:block {
    display: block;
  }
  .md\:hidden {
    display: none;
  }
}

@media (min-width: 1024px) {
  .lg\:block {
    display: block;
  }
  .lg\:hidden {
    display: none;
  }
}
</style>