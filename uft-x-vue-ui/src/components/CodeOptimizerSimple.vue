<template>
  <div class="code-optimizer">
    <h2>代码优化器</h2>
    <div class="input-area">
      <textarea 
        v-model="inputCode" 
        placeholder="输入需要优化的代码..."
        rows="10"
        class="code-input"
      />
      <button @click="optimizeCode" :disabled="!inputCode || loading">
        {{ loading ? '优化中...' : '开始优化' }}
      </button>
    </div>
    
    <div v-if="optimizedCode" class="result-area">
      <h3>优化结果</h3>
      <pre class="code-output">{{ optimizedCode }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputCode = ref('')
const optimizedCode = ref('')
const loading = ref(false)

async function optimizeCode() {
  if (!inputCode.value) return
  
  loading.value = true
  try {
    // 模拟优化过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    optimizedCode.value = `// 优化后的代码\n${inputCode.value.trim()}`
  } catch (error) {
    console.error('优化失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.code-optimizer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-area {
  margin-bottom: 20px;
}

.code-input {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.result-area {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.code-output {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>