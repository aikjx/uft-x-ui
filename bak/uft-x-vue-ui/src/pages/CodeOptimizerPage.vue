<template>
  <div class="code-optimizer-page">
    <CodeOptimizer />
  </div>
</template>

<script setup lang="ts">
import CodeOptimizer from '@/components/CodeOptimizerSimple.vue'
</script>

<style scoped>
.code-optimizer-page {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>