<template>
  <n-config-provider :theme="isDark ? darkTheme : lightTheme">
    <div id="app" :class="{ 'dark': isDark }">
      <AppLayout />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, lightTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import AppLayout from '@/components/Layout/AppLayout.vue'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
</script>

<style>
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>