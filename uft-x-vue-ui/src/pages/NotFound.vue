<template>
  <div class="not-found">
    <div class="not-found-content">
      <motion.div 
        class="error-number"
        :initial="{ opacity: 0, scale: 0.5 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.6, type: 'spring' }"
      >
        404
      </motion.div>
      
      <motion.h1 
        class="error-title"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.3, duration: 0.5 }"
      >
        页面未找到
      </motion.h1>
      
      <motion.p 
        class="error-description"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.4, duration: 0.5 }"
      >
        您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
      </motion.p>
      
      <motion.div 
        class="action-buttons"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.5, duration: 0.5 }"
      >
        <router-link to="/" class="btn btn-primary">
          返回首页
        </router-link>
        <router-link to="/knowledge" class="btn btn-secondary">
          浏览知识库
        </router-link>
      </motion.div>
      
      <motion.div 
        class="search-suggestion"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ delay: 0.7, duration: 0.5 }"
      >
        <p class="suggestion-text">或者尝试搜索相关内容：</p>
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="搜索内容..." 
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decorative-elements">
      <motion.div 
        class="element element-1"
        :animate="{ 
          x: [0, 10, 0], 
          y: [0, -10, 0],
          rotate: [0, 5, 0]
        }"
        :transition="{ repeat: Infinity, duration: 10, ease: 'easeInOut' }"
      ></motion.div>
      <motion.div 
        class="element element-2"
        :animate="{ 
          x: [0, -15, 0], 
          y: [0, 15, 0],
          rotate: [0, -10, 0]
        }"
        :transition="{ repeat: Infinity, duration: 15, ease: 'easeInOut' }"
      ></motion.div>
      <motion.div 
        class="element element-3"
        :animate="{ 
          x: [0, 20, 0], 
          y: [0, 20, 0],
          rotate: [0, 15, 0]
        }"
        :transition="{ repeat: Infinity, duration: 12, ease: 'easeInOut' }"
      ></motion.div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router' // 注释掉未使用的导入
import { motion } from 'framer-motion'

// const router = useRouter() // 暂时注释未使用的router
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    // 这里可以实现搜索逻辑
    alert(`搜索: ${searchQuery.value}`)
    // 实际项目中可能会跳转到搜索结果页
    // router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  z-index: 1;
  position: relative;
}

.error-number {
  font-size: 12rem;
  font-weight: 900;
  background: linear-gradient(135deg, #4DBA87, #2A9D8F, #1E90FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  line-height: 1;
  text-shadow: 0 0 50px rgba(77, 186, 135, 0.3);
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
}

.error-description {
  font-size: 1.1rem;
  color: #999;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 140px;
}

.btn-primary {
  background-color: #4DBA87;
  color: #000;
}

.btn-primary:hover {
  background-color: #43b77d;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(77, 186, 135, 0.2);
}

.btn-secondary {
  background-color: transparent;
  color: #4DBA87;
  border: 2px solid #4DBA87;
}

.btn-secondary:hover {
  background-color: rgba(77, 186, 135, 0.1);
  transform: translateY(-3px);
}

.search-suggestion {
  background-color: #1a1a1a;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #2d2d2d;
}

.suggestion-text {
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  gap: 0;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  background-color: #0a0a0a;
  border: 1px solid #3d3d3d;
  border-radius: 6px 0 0 6px;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4DBA87;
}

.search-input::placeholder {
  color: #666;
}

.search-btn {
  padding: 0 1.25rem;
  background-color: #4DBA87;
  color: #000;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #43b77d;
}

/* 装饰元素 */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.element {
  position: absolute;
  background: linear-gradient(135deg, rgba(77, 186, 135, 0.1), rgba(30, 144, 255, 0.05));
  border-radius: 50%;
  filter: blur(50px);
}

.element-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
}

.element-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  right: -200px;
}

.element-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: 10%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-number {
    font-size: 8rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
  }
  
  .element-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    left: -100px;
  }
  
  .element-2 {
    width: 300px;
    height: 300px;
    bottom: -150px;
    right: -150px;
  }
  
  .element-3 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 5%;
  }
}

@media (max-width: 480px) {
  .not-found {
    padding: 1rem;
  }
  
  .error-number {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-description {
    font-size: 1rem;
  }
  
  .search-suggestion {
    padding: 1rem;
  }
}
</style>