<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/Layout/AppLayout.vue'
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

/* MathJax 样式优化 */
.MathJax {
  outline: none;
}

.MathJax_Display {
  text-align: center !important;
  margin: 1em 0 !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色模式滚动条 */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-track {
    background: #2d3748;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4a5568;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }
}
</style>