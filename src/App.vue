<template>
  <div id="app" :class="{ dark: isDark }">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'

const isDark = useDark()
</script>

<style>
#app {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}
</style>
