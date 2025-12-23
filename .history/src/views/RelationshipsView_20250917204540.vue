<template>
  <div class="relationships-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title gradient-text">公式关联关系</h1>
        <p class="page-description">
          探索统一场论公式间的内在联系，理解理论的整体架构
        </p>
      </div>
      
      <div class="relationships-content">
        <div class="relationship-graph">
          <div class="graph-container" ref="graphContainer">
            <div class="graph-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">🔗</div>
                <p>公式关系图</p>
                <small>展示公式间的逻辑关系</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="relationship-details">
          <h3>关系类型说明</h3>
          <div class="relationship-types">
            <div class="type-item">
              <div class="type-indicator derives"></div>
              <div class="type-info">
                <h4>推导关系</h4>
                <p>一个公式可以从另一个公式推导得出</p>
              </div>
            </div>
            
            <div class="type-item">
              <div class="type-indicator related"></div>
              <div class="type-info">
                <h4>相关关系</h4>
                <p>公式在理论上相互关联或补充</p>
              </div>
            </div>
            
            <div class="type-item">
              <div class="type-indicator prerequisite"></div>
              <div class="type-info">
                <h4>前置关系</h4>
                <p>理解某公式需要先掌握的基础公式</p>
              </div>
            </div>
            
            <div class="type-item">
              <div class="type-indicator application"></div>
              <div class="type-info">
                <h4>应用关系</h4>
                <p>公式在实际应用中的相互依赖</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const graphContainer = ref<HTMLElement>()

onMounted(() => {
  // TODO: 初始化D3.js关系图
})
</script>

<style scoped>
.relationships-view {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-space) 0%, var(--color-field) 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.relationships-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.relationship-graph {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
}

.graph-container {
  height: 600px;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.graph-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.relationship-details {
  background: var(--glass-effect);
  border-radius: 1rem;
  padding: 1.5rem;
}

.relationship-details h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.relationship-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.type-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-indicator.derives {
  background: var(--color-primary);
}

.type-indicator.related {
  background: var(--color-accent);
}

.type-indicator.prerequisite {
  background: var(--color-matter);
}

.type-indicator.application {
  background: var(--color-energy);
}

.type-info h4 {
  color: white;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.type-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .relationships-content {
    grid-template-columns: 1fr;
  }
}
</style>