<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 性能监控浮窗 (开发模式) -->
    <div v-if="showPerformanceMonitor" class="performance-monitor">
      <div class="monitor-header">
        <span>📊 性能监控</span>
        <button @click="togglePerformanceMonitor">×</button>
      </div>
      <div class="monitor-content">
        <div class="metric">
          <span>内存: {{ formatBytes(performanceStats.averageMemoryUsage) }}</span>
        </div>
        <div class="metric">
          <span>CPU: {{ performanceStats.averageCPUUsage }}%</span>
        </div>
        <div class="metric">
          <span>操作: {{ performanceStats.totalOperations }}</span>
        </div>
        <div class="metric">
          <span>运行: {{ formatUptime(performanceStats.uptime) }}</span>
        </div>
      </div>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="globalError" class="global-error">
      <div class="error-content">
        <h3>⚠️ 系统错误</h3>
        <p>{{ globalError }}</p>
        <button @click="dismissGlobalError">确定</button>
      </div>
    </div>

    <!-- 主路由视图 -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <span>系统处理中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useCodeOptimizationStore } from '@/stores/code-optimization'
import type { PerformanceMonitor } from '@/services/performance-monitor'

// 响应式状态
const isDarkTheme = ref(false)
const showPerformanceMonitor = ref(false)
const globalError = ref<string | null>(null)

// 注入依赖
const performanceMonitor = inject<PerformanceMonitor>('performanceMonitor')
const codeOptimizationStore = useCodeOptimizationStore()

// 计算属性
const isLoading = computed(() => 
  codeOptimizationStore.isAnalyzing || 
  codeOptimizationStore.isOptimizing
)

const performanceStats = computed(() => {
  if (!performanceMonitor) {
    return {
      averageMemoryUsage: 0,
      averageCPUUsage: 0,
      totalOperations: 0,
      uptime: 0
    }
  }
  return performanceMonitor.getStatistics()
})

// 方法
function togglePerformanceMonitor() {
  showPerformanceMonitor.value = !showPerformanceMonitor.value
}

function dismissGlobalError() {
  globalError.value = null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// 监听全局错误 - 使用节流优化
const handleError = (() => {
  let lastErrorTime = 0
  const throttleTime = 1000 // 1秒内只显示一个错误
  
  return (message: string) => {
    const now = Date.now()
    if (now - lastErrorTime > throttleTime) {
      globalError.value = message
      lastErrorTime = now
    }
  }
})()

window.addEventListener('error', (event) => {
  handleError(`应用错误: ${event.message}`)
})

window.addEventListener('unhandledrejection', (event) => {
  handleError(`Promise错误: ${event.reason}`)
})

// 键盘快捷键 - 优化事件处理
const handleKeyboardShortcuts = (() => {
  const keyMap = {
    'P': togglePerformanceMonitor,
    'D': () => { isDarkTheme.value = !isDarkTheme.value }
  }
  
  return (event: KeyboardEvent) => {
    // 优化键盘事件检查
    if (event.ctrlKey && event.shiftKey) {
      const handler = keyMap[event.key as keyof typeof keyMap]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }
  }
})()

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcuts)
  
  // 恢复主题设置
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'dark') {
    isDarkTheme.value = true
  }
  
  // 开发模式显示性能监控
  if (import.meta.env.DEV) {
    showPerformanceMonitor.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
  
  // 保存主题设置
  localStorage.setItem('app-theme', isDarkTheme.value ? 'dark' : 'light')
})

// 监听主题变化
watch(isDarkTheme, (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
}, { immediate: true })
</script>

<style scoped>
#app {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}

/* 性能监控样式 */
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 250px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}

.monitor-header button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-content .metric {
  margin: 4px 0;
  display: flex;
  justify-content: space-between;
}

/* 全局错误提示 */
.global-error {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid #ff4444;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  max-width: 400px;
}

.error-content h3 {
  color: #ff4444;
  margin: 0 0 10px 0;
}

.error-content p {
  margin: 0 0 15px 0;
  color: #666;
}

.error-content button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

/* 全局加载指示器 */
.global-loading {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9998;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    top: 10px;
    right: 10px;
    width: 200px;
    font-size: 11px;
  }
  
  .global-error {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .global-loading {
    top: 10px;
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>