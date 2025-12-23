<template>
  <div class="formula-detail">
    <div class="detail-header">
      <div class="formula-id">
        <span class="id-number">{{ String(formula.id).padStart(3, '0') }}</span>
      </div>
      <div class="formula-meta">
        <h2 class="formula-title">{{ formula.name }}</h2>
        <div class="formula-category" :style="{ color: formula.color }">
          {{ formula.category }}
        </div>
      </div>
    </div>
    
    <div class="formula-display-section">
      <div class="display-container">
        <MathFormula 
          :formula="formula.latex" 
          :color="formula.color"
          size="xl"
          class="main-formula"
        />
      </div>
    </div>
    
    <div class="formula-description">
      <h3>公式描述</h3>
      <p>{{ formula.description }}</p>
    </div>
    
    <div class="formula-actions">
      <button class="action-btn primary" @click="$emit('analyze')">
        <span class="btn-icon">🔬</span>
        <span class="btn-text">深度分析</span>
      </button>
      <button class="action-btn secondary" @click="$emit('simulate')">
        <span class="btn-icon">🌌</span>
        <span class="btn-text">时空模拟</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SimpleFormula } from '../types/simple-formula'
import MathFormula from './MathFormula.vue'

interface Props {
  formula: SimpleFormula
}

defineProps<Props>()

defineEmits<{
  analyze: []
  simulate: []
}>()
</script>

<style scoped>
.formula-detail {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.formula-id {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-number {
  font-weight: bold;
  color: #0a0a0f;
  font-size: 1.25rem;
}

.formula-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.formula-category {
  font-size: 1rem;
  padding: 0.25rem 0.75rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 12px;
  display: inline-block;
}

.formula-display-section {
  margin-bottom: 2rem;
}

.display-container {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.display-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0, 245, 255, 0.1), transparent);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.formula-description {
  margin-bottom: 2rem;
}

.formula-description h3 {
  color: #64ffda;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.formula-description p {
  color: #b0bec5;
  line-height: 1.6;
  font-size: 1rem;
}

.formula-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
}

.action-btn.primary {
  background: linear-gradient(45deg, #00f5ff, #64ffda);
  color: #0a0a0f;
}

.action-btn.primary:hover {
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: transparent;
  color: #64ffda;
  border: 2px solid rgba(100, 255, 218, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.5);
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-text {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
  
  .formula-actions {
    flex-direction: column;
  }
  
  .display-container {
    padding: 2rem 1rem;
  }
}
</style>