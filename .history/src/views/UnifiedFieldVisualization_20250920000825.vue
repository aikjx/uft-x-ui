<template>
  <div class="unified-field-container">
    <iframe
      ref="visualizationFrame"
      :src="iframeSrc"
      class="visualization-frame"
      frameborder="0"
      @load="onIframeLoad"
    ></iframe>
    
    <div class="controls-overlay">
      <button @click="toggleFullscreen" class="control-btn">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
      <button @click="reloadVisualization" class="control-btn">
        重新加载
      </button>
      <button @click="openInNewTab" class="control-btn">
        新标签页打开
      </button>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载统一场论可视化系统...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnifiedFieldVisualization',
  
  data() {
    return {
      iframeSrc: './unified-field.html',
      isFullscreen: false,
      loading: true,
      iframeKey: Date.now()
    }
  },
  
  mounted() {
    this.setupEventListeners();
  },
  
  beforeUnmount() {
    this.cleanupEventListeners();
  },
  
  methods: {
    onIframeLoad() {
      this.loading = false;
      console.log('可视化系统加载完成');
    },
    
    toggleFullscreen() {
      const container = this.$el;
      
      if (!this.isFullscreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    },
    
    reloadVisualization() {
      this.loading = true;
      this.iframeKey = Date.now();
    },
    
    openInNewTab() {
      window.open(this.iframeSrc, '_blank');
    },
    
    setupEventListeners() {
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('msfullscreenchange', this.handleFullscreenChange);
    },
    
    cleanupEventListeners() {
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', this.handleFullscreenChange);
    },
    
    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    }
  }
}
</script>

<style scoped>
.unified-field-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #0c0c1d;
}

.visualization-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.controls-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.control-btn {
  background: rgba(13, 17, 28, 0.9);
  color: #4fc3f7;
  border: 1px solid rgba(79, 195, 247, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(79, 195, 247, 0.2);
  transform: translateY(-2px);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(12, 12, 29, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(79, 195, 247, 0.3);
  border-top: 3px solid #4fc3f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #4fc3f7;
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-overlay {
    top: 10px;
    right: 10px;
    flex-direction: column;
  }
  
  .control-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 全屏样式 */
:fullscreen .unified-field-container {
  width: 100vw;
  height: 100vh;
}

:-webkit-full-screen .unified-field-container {
  width: 100vw;
  height: 100vh;
}

:-ms-fullscreen .unified-field-container {
  width: 100vw;
  height: 100vh;
}
</style>