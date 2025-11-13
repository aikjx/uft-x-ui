import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // 状态
  const count = ref(0)
  const name = ref('UFT-X')

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
  const greeting = computed(() => `Welcome to ${name.value}!`)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return {
    count,
    name,
    doubleCount,
    greeting,
    increment,
    decrement,
    reset
  }
}, {
  // 持久化配置
  persist: {
    key: 'counter',
    storage: localStorage,
    paths: ['count']
  }
})