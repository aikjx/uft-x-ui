<template>
  <footer class="footer">
    <div class="container">
      <!-- 主页脚内容 -->
      <div class="footer-main">
        <!-- 关于我们 -->
        <div class="footer-section">
          <div class="section-title">关于UFT-X</div>
          <div class="logo">UFT-X</div>
          <p class="description">
            统一场论可视化平台致力于通过先进的3D可视化技术，
            帮助用户直观理解引力场与电磁场的统一理论，探索宇宙的奥秘。
          </p>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <div class="section-title">快速链接</div>
          <ul class="link-list">
            <li v-for="item in navItems" :key="item.name">
              <router-link :to="item.path" class="footer-link">
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 联系我们 -->
        <div class="footer-section">
          <div class="section-title">联系我们</div>
          <div class="contact-info">
            <p class="contact-item">
              <span class="contact-label">研究团队：</span>
              <span class="contact-value">统一场论可视化小组</span>
            </p>
            <p class="contact-item">
              <span class="contact-label">版本：</span>
              <span class="contact-value">v0.0.1</span>
            </p>
            <p class="contact-item">
              <span class="contact-label">技术支持：</span>
              <span class="contact-value">support@uft-x.com</span>
            </p>
          </div>
        </div>

        <!-- 订阅 -->
        <div class="footer-section">
          <div class="section-title">订阅更新</div>
          <p class="subscription-desc">
            获取最新的统一场论研究进展和可视化技术更新
          </p>
          <form class="subscription-form" @submit.prevent="handleSubscribe">
            <input 
              type="email" 
              placeholder="输入您的邮箱地址" 
              class="email-input"
              v-model="email"
              required
            />
            <button type="submit" class="subscribe-btn">订阅</button>
          </form>
        </div>
      </div>

      <!-- 页脚底部 -->
      <div class="footer-bottom">
        <div class="footer-left">
          <p class="copyright">
            &copy; {{ currentYear }} UFT-X 统一场论可视化平台. 保留所有权利。
          </p>
        </div>
        <div class="footer-right">
          <div class="social-links">
            <a href="#" class="social-link" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
          <div class="legal-links">
            <a href="#" class="legal-link">隐私政策</a>
            <a href="#" class="legal-link">使用条款</a>
            <a href="#" class="legal-link">Cookie政策</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 响应式数据
const email = ref('')

// 导航项
const navItems = [
  { name: 'home', path: '/', label: '首页' },
  { name: 'formulaVisualization', path: '/formula-visualization', label: '公式可视化' },
  { name: 'interactiveExploration', path: '/interactive-exploration', label: '交互式探索' },
  { name: 'knowledge', path: '/knowledge', label: '知识库' }
]

// 计算属性
const currentYear = computed(() => new Date().getFullYear())

// 方法
function handleSubscribe() {
  console.log('订阅邮箱:', email.value)
  // 这里可以添加订阅逻辑
  alert(`感谢订阅！我们会将最新更新发送到 ${email.value}`)
  email.value = ''
}
</script>

<style scoped>
.footer {
  background-color: #0a0a0a;
  color: #fff;
  padding: 3rem 0 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 主页脚内容 */
.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 0.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #4DBA87;
}

/* Logo */
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4DBA87;
  margin-bottom: 0.5rem;
}

.description {
  color: #999;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 链接列表 */
.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link {
  color: #999;
  text-decoration: none;
  padding: 0.5rem 0;
  display: inline-block;
  transition: color 0.3s ease;
  position: relative;
  font-size: 0.95rem;
}

.footer-link:hover {
  color: #4DBA87;
  transform: translateX(3px);
}

.footer-link::before {
  content: '→';
  position: absolute;
  left: -15px;
  opacity: 0;
  transition: opacity 0.3s ease, left 0.3s ease;
}

.footer-link:hover::before {
  opacity: 1;
  left: -10px;
}

/* 联系信息 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  color: #999;
  font-size: 0.9rem;
}

.contact-value {
  color: #fff;
  font-weight: 500;
}

/* 订阅表单 */
.subscription-desc {
  color: #999;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.subscription-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.email-input {
  padding: 0.75rem 1rem;
  border: 1px solid #2d2d2d;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.email-input:focus {
  outline: none;
  border-color: #4DBA87;
  box-shadow: 0 0 0 2px rgba(77, 186, 135, 0.2);
}

.email-input::placeholder {
  color: #666;
}

.subscribe-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4DBA87;
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.subscribe-btn:hover {
  background-color: #43b77d;
  transform: translateY(-2px);
}

/* 页脚底部 */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.copyright {
  color: #999;
  font-size: 0.9rem;
}

/* 社交媒体链接 */
.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1a1a1a;
  color: #999;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #4DBA87;
  color: #000;
  transform: translateY(-3px);
}

/* 法律链接 */
.legal-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legal-link {
  color: #999;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #4DBA87;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1rem;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .social-links {
    margin-bottom: 0.5rem;
  }
  
  .legal-links {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .footer-main {
    gap: 1.5rem;
  }
}
</style>