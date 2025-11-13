<template>
  <div class="knowledge-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">统一场论知识库</h1>
        <p class="page-description">探索引力场与电磁场统一理论的核心概念、历史发展和最新研究</p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <main class="container">
      <!-- 搜索和筛选 -->
      <div class="search-filter-section">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索知识库内容..."
            class="search-input"
          />
          <button class="search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div class="filter-tabs">
          <button 
            v-for="category in categories" 
            :key="category.value"
            :class="['filter-tab', { active: selectedCategory === category.value }]"
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- 内容布局 -->
      <div class="content-layout">
        <!-- 左侧目录 -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">知识分类</h3>
            <nav class="category-nav">
              <ul class="category-list">
                <li 
                  v-for="item in navigationItems" 
                  :key="item.id"
                  :class="['category-item', { active: activeSection === item.id }]"
                  @click="scrollToSection(item.id)"
                >
                  {{ item.title }}
                </li>
              </ul>
            </nav>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">推荐资源</h3>
            <div class="resource-list">
              <a 
                v-for="resource in recommendedResources" 
                :key="resource.id"
                :href="resource.url" 
                target="_blank" 
                class="resource-item"
              >
                <div class="resource-icon">{{ resource.icon }}</div>
                <div class="resource-info">
                  <div class="resource-title">{{ resource.title }}</div>
                  <div class="resource-type">{{ resource.type }}</div>
                </div>
              </a>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">快速导航</h3>
            <div class="quick-links">
              <router-link to="/formula-visualization" class="quick-link">
                <span class="link-icon">📊</span>
                <span class="link-text">公式可视化</span>
              </router-link>
              <router-link to="/interactive-exploration" class="quick-link">
                <span class="link-icon">🔬</span>
                <span class="link-text">交互式探索</span>
              </router-link>
            </div>
          </div>
        </aside>

        <!-- 右侧主要内容 -->
        <div class="main-content">
          <!-- 核心概念部分 -->
          <section id="core-concepts" class="knowledge-section">
            <h2 class="section-title">核心概念</h2>
            <div class="section-content">
              <div class="concept-card">
                <h3 class="concept-title">统一场论概述</h3>
                <p class="concept-description">
                  统一场论试图将自然界的基本力（引力、电磁力、强核力和弱核力）统一成单一的基本相互作用。
                  在本平台中，我们主要关注引力场与电磁场的统一。
                </p>
                <div class="formula-block">
                  <MathJax :formula="coreFormulas.unifiedField" />
                </div>
              </div>

              <div class="concept-card">
                <h3 class="concept-title">引力场</h3>
                <p class="concept-description">
                  引力场是物体间相互吸引的力场，由爱因斯坦的广义相对论描述为时空的弯曲。质量和能量会导致时空曲率，
                  从而产生引力效应。
                </p>
                <div class="formula-block">
                  <MathJax :formula="coreFormulas.gravityField" />
                </div>
              </div>

              <div class="concept-card">
                <h3 class="concept-title">电磁场</h3>
                <p class="concept-description">
                  电磁场是由带电粒子产生的物理场，包含电场和磁场的统一描述。麦克斯韦方程组精确地描述了电磁场的行为和传播。
                </p>
                <div class="formula-block">
                  <MathJax :formula="coreFormulas.electroMagnetic" />
                </div>
              </div>

              <div class="concept-card">
                <h3 class="concept-title">场的耦合</h3>
                <p class="concept-description">
                  在统一场论中，场的耦合是指不同类型的场之间的相互作用。耦合常数决定了这种相互作用的强度，
                  是统一理论中的关键参数。
                </p>
                <div class="formula-block">
                  <MathJax :formula="coreFormulas.coupling" />
                </div>
              </div>
            </div>
          </section>

          <!-- 历史发展部分 -->
          <section id="history" class="knowledge-section">
            <h2 class="section-title">历史发展</h2>
            <div class="section-content">
              <div class="timeline">
                <div v-for="event in timelineEvents" :key="event.year" class="timeline-item">
                  <div class="timeline-year">{{ event.year }}</div>
                  <div class="timeline-content">
                    <h3 class="timeline-title">{{ event.title }}</h3>
                    <p class="timeline-description">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 数学基础部分 -->
          <section id="mathematical-foundation" class="knowledge-section">
            <h2 class="section-title">数学基础</h2>
            <div class="section-content">
              <div class="math-topic">
                <h3 class="math-topic-title">张量分析</h3>
                <p class="math-topic-description">
                  张量分析是描述引力场的数学工具，允许我们在弯曲时空中表达物理定律。爱因斯坦场方程就是用张量形式表示的。
                </p>
                <div class="formula-block">
                  <MathJax :formula="mathFormulas.tensor" />
                </div>
              </div>

              <div class="math-topic">
                <h3 class="math-topic-title">微分几何</h3>
                <p class="math-topic-description">
                  微分几何研究曲线、曲面和更高维空间的几何性质，是广义相对论的数学基础，用于描述时空的弯曲。
                </p>
                <div class="formula-block">
                  <MathJax :formula="mathFormulas.riemann" />
                </div>
              </div>

              <div class="math-topic">
                <h3 class="math-topic-title">纤维丛理论</h3>
                <p class="math-topic-description">
                  纤维丛理论是现代场论的数学框架，特别适用于描述规范场（如电磁场）。它提供了统一描述各种相互作用的数学语言。
                </p>
                <div class="formula-block">
                  <MathJax :formula="mathFormulas.fiberBundle" />
                </div>
              </div>

              <div class="math-topic">
                <h3 class="math-topic-title">群论</h3>
                <p class="math-topic-description">
                  群论在粒子物理学中扮演重要角色，用于描述对称性和守恒定律。统一场论中的规范群决定了基本相互作用的性质。
                </p>
                <div class="formula-block">
                  <MathJax :formula="mathFormulas.groupTheory" />
                </div>
              </div>
            </div>
          </section>

          <!-- 现代理论部分 -->
          <section id="modern-theories" class="knowledge-section">
            <h2 class="section-title">现代理论</h2>
            <div class="section-content">
              <div class="theory-card">
                <div class="theory-header">
                  <h3 class="theory-title">弦理论</h3>
                  <div class="theory-badge">主流理论</div>
                </div>
                <p class="theory-description">
                  弦理论认为基本粒子不是点粒子，而是一维的"弦"的振动模式。这种理论有可能统一所有基本力，包括引力，
                  但需要额外的空间维度。
                </p>
                <div class="theory-details">
                  <div class="detail-item">
                    <span class="detail-label">维度需求:</span>
                    <span class="detail-value">10或11维</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">预言粒子:</span>
                    <span class="detail-value">引力子</span>
                  </div>
                </div>
              </div>

              <div class="theory-card">
                <div class="theory-header">
                  <h3 class="theory-title">环量子引力</h3>
                  <div class="theory-badge">量子引力</div>
                </div>
                <p class="theory-description">
                  环量子引力是一种尝试量子化引力的理论，不需要额外维度。它将时空描述为量子化的"环"网络，
                  提供了离散的时空结构。
                </p>
                <div class="theory-details">
                  <div class="detail-item">
                    <span class="detail-label">时空性质:</span>
                    <span class="detail-value">离散的</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">适用范围:</span>
                    <span class="detail-value">普朗克尺度</span>
                  </div>
                </div>
              </div>

              <div class="theory-card">
                <div class="theory-header">
                  <h3 class="theory-title">量子场论</h3>
                  <div class="theory-badge">成熟理论</div>
                </div>
                <p class="theory-description">
                  量子场论成功地统一了电磁力和弱核力，描述了除引力外的所有基本相互作用。
                  标准模型就是基于量子场论构建的。
                </p>
                <div class="theory-details">
                  <div class="detail-item">
                    <span class="detail-label">统一力:</span>
                    <span class="detail-value">电磁力、弱力、强力</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">未包含:</span>
                    <span class="detail-value">引力</span>
                  </div>
                </div>
              </div>

              <div class="theory-card">
                <div class="theory-header">
                  <h3 class="theory-title">M理论</h3>
                  <div class="theory-badge">扩展理论</div>
                </div>
                <p class="theory-description">
                  M理论是弦理论的扩展，认为所有不同的弦理论都是同一个11维理论的不同表现形式。
                  它引入了膜的概念，可能为宇宙的起源提供解释。
                </p>
                <div class="theory-details">
                  <div class="detail-item">
                    <span class="detail-label">维度:</span>
                    <span class="detail-value">11维</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">核心概念:</span>
                    <span class="detail-value">膜(Membrane)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 实验与观测部分 -->
          <section id="experiments" class="knowledge-section">
            <h2 class="section-title">实验与观测</h2>
            <div class="section-content">
              <div class="experiment-grid">
                <div class="experiment-card">
                  <div class="experiment-thumbnail">
                    <!-- 这里可以放置实验图片 -->
                    <div class="thumbnail-placeholder">引力波探测</div>
                  </div>
                  <h3 class="experiment-title">引力波探测</h3>
                  <p class="experiment-description">
                    LIGO和Virgo实验直接探测到了引力波，证实了爱因斯坦的预言，为统一场论提供了重要的观测证据。
                  </p>
                  <div class="experiment-date">首次探测: 2015年</div>
                </div>

                <div class="experiment-card">
                  <div class="experiment-thumbnail">
                    <div class="thumbnail-placeholder">大型强子对撞机</div>
                  </div>
                  <h3 class="experiment-title">大型强子对撞机</h3>
                  <p class="experiment-description">
                    LHC的高能实验帮助我们测试基本粒子的行为，寻找新物理现象，为统一场论提供实验约束。
                  </p>
                  <div class="experiment-date">运行时间: 2008年至今</div>
                </div>

                <div class="experiment-card">
                  <div class="experiment-thumbnail">
                    <div class="thumbnail-placeholder">宇宙微波背景</div>
                  </div>
                  <h3 class="experiment-title">宇宙微波背景</h3>
                  <p class="experiment-description">
                    宇宙微波背景辐射的精确测量为早期宇宙的物理条件提供了线索，帮助我们理解大统一理论。
                  </p>
                  <div class="experiment-date">关键实验: WMAP, Planck</div>
                </div>

                <div class="experiment-card">
                  <div class="experiment-thumbnail">
                    <div class="thumbnail-placeholder">量子引力实验</div>
                  </div>
                  <h3 class="experiment-title">量子引力实验</h3>
                  <p class="experiment-description">
                    正在发展中的实验尝试直接探测量子引力效应，如引力子探测和时空非对易性测量。
                  </p>
                  <div class="experiment-date">状态: 实验设计阶段</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 未来展望部分 -->
          <section id="future" class="knowledge-section">
            <h2 class="section-title">未来展望</h2>
            <div class="section-content">
              <div class="future-section">
                <h3 class="future-title">理论发展方向</h3>
                <ul class="future-list">
                  <li class="future-item">
                    <span class="future-icon">🔍</span>
                    <div class="future-text">
                      <strong>量子引力统一</strong>
                      <p>发展能够一致描述量子力学和引力的理论框架</p>
                    </div>
                  </li>
                  <li class="future-item">
                    <span class="future-icon">🌌</span>
                    <div class="future-text">
                      <strong>宇宙学应用</strong>
                      <p>将统一场论应用于解释宇宙起源、暗物质和暗能量</p>
                    </div>
                  </li>
                  <li class="future-item">
                    <span class="future-icon">⚛️</span>
                    <div class="future-text">
                      <strong>量子计算模拟</strong>
                      <p>利用量子计算机模拟复杂的场论系统</p>
                    </div>
                  </li>
                  <li class="future-item">
                    <span class="future-icon">🛰️</span>
                    <div class="future-text">
                      <strong>空间实验</strong>
                      <p>设计太空实验以测试统一场论的预言</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="challenges-section">
                <h3 class="challenges-title">主要挑战</h3>
                <div class="challenges-grid">
                  <div class="challenge-card">
                    <h4 class="challenge-title">实验验证</h4>
                    <p class="challenge-description">
                      统一场论预测的效应通常发生在极高能量或极小尺度，难以通过现有技术直接观测。
                    </p>
                  </div>
                  <div class="challenge-card">
                    <h4 class="challenge-title">数学复杂性</h4>
                    <p class="challenge-description">
                      统一理论的数学框架极其复杂，需要发展新的数学工具和计算方法。
                    </p>
                  </div>
                  <div class="challenge-card">
                    <h4 class="challenge-title">概念整合</h4>
                    <p class="challenge-description">
                      量子力学和广义相对论的基本概念存在根本冲突，需要全新的物理观念。
                    </p>
                  </div>
                  <div class="challenge-card">
                    <h4 class="challenge-title">理论选择</h4>
                    <p class="challenge-description">
                      存在多种可能的统一理论，需要找到区分它们的关键实验预言。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 互动讨论部分 -->
      <div class="discussion-section">
        <h2 class="section-title">学术讨论</h2>
        <div class="discussion-content">
          <div class="discussion-header">
            <p class="discussion-description">
              参与统一场论相关话题的讨论，分享您的见解和问题。
            </p>
            <button class="start-discussion-btn">发起新讨论</button>
          </div>
          <div class="recent-discussions">
            <div v-for="discussion in recentDiscussions" :key="discussion.id" class="discussion-item">
              <h3 class="discussion-title">{{ discussion.title }}</h3>
              <p class="discussion-excerpt">{{ discussion.excerpt }}</p>
              <div class="discussion-meta">
                <span class="discussion-author">{{ discussion.author }}</span>
                <span class="discussion-date">{{ discussion.date }}</span>
                <span class="discussion-comments">{{ discussion.comments }} 评论</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MathJax from '../components/MathJax.vue'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')
const activeSection = ref('core-concepts')

// 分类
const categories = [
  { value: 'all', label: '全部' },
  { value: 'concepts', label: '概念' },
  { value: 'history', label: '历史' },
  { value: 'mathematics', label: '数学' },
  { value: 'theories', label: '理论' },
  { value: 'experiments', label: '实验' }
]

// 导航项
const navigationItems = [
  { id: 'core-concepts', title: '核心概念' },
  { id: 'history', title: '历史发展' },
  { id: 'mathematical-foundation', title: '数学基础' },
  { id: 'modern-theories', title: '现代理论' },
  { id: 'experiments', title: '实验与观测' },
  { id: 'future', title: '未来展望' }
]

// 推荐资源
const recommendedResources = [
  { id: 1, title: '广义相对论导论', type: '电子书', icon: '📚', url: '#' },
  { id: 2, title: '统一场论讲座系列', type: '视频课程', icon: '🎓', url: '#' },
  { id: 3, title: '弦理论最新进展', type: '研究论文', icon: '📄', url: '#' },
  { id: 4, title: '量子引力模拟工具', type: '软件', icon: '💻', url: '#' }
]

// 核心公式
const coreFormulas = {
  unifiedField: '\\mathcal{U} = \\alpha \\mathcal{G} + \\beta \\mathcal{E} + \\gamma \\mathcal{G}\\mathcal{E}',
  gravityField: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
  electroMagnetic: 'F_{\\mu\\nu} = \\partial_{\\mu} A_{\\nu} - \\partial_{\\nu} A_{\\mu}',
  coupling: '\\mathcal{L}_{int} = g \\bar{\\psi} \\gamma^{\\mu} A_{\\mu} \\psi'
}

// 数学公式
const mathFormulas = {
  tensor: 'T^{\\mu\\nu} = \\rho u^{\\mu} u^{\\nu} + p (g^{\\mu\\nu} + u^{\\mu} u^{\\nu})',
  riemann: 'R^\\rho_{\\sigma \\mu\\nu} = \\partial_\\mu \\Gamma^\\rho_{\\nu\\sigma} - \\partial_\\nu \\Gamma^\\rho_{\\mu\\sigma} + \\Gamma^\\rho_{\\mu\\lambda} \\Gamma^\\lambda_{\\nu\\sigma} - \\Gamma^\\rho_{\\nu\\lambda} \\Gamma^\\lambda_{\\mu\\sigma}',
  fiberBundle: 'P(M, G) \\text{ where } \\pi: P \\to M',
  groupTheory: '\\text{SU}(3) \\times \\text{SU}(2) \\times \\text{U}(1)'
}

// 时间线事件
const timelineEvents = [
  {
    year: '1915',
    title: '爱因斯坦提出广义相对论',
    description: '爱因斯坦发表广义相对论，将引力描述为时空的弯曲，为统一场论奠定了基础。'
  },
  {
    year: '1920s',
    title: '爱因斯坦的统一场论尝试',
    description: '爱因斯坦开始尝试将引力和电磁力统一，但未能取得成功。'
  },
  {
    year: '1967',
    title: '电弱统一理论',
    description: '温伯格和萨拉姆提出电弱统一理论，成功统一了电磁力和弱核力。'
  },
  {
    year: '1970s',
    title: '标准模型的建立',
    description: '粒子物理标准模型完成，统一了电磁力、弱核力和强核力，但不包括引力。'
  },
  {
    year: '1980s',
    title: '超弦理论兴起',
    description: '超弦理论作为统一所有力的候选理论开始受到广泛关注。'
  },
  {
    year: '1995',
    title: 'M理论提出',
    description: '威滕提出M理论，统一了五种不同的超弦理论。'
  },
  {
    year: '2015',
    title: '引力波探测',
    description: 'LIGO首次直接探测到引力波，为引力的量子化研究提供了新的观测窗口。'
  }
]

// 最近讨论
const recentDiscussions = [
  {
    id: 1,
    title: '量子纠缠与引力的关系探讨',
    excerpt: '量子纠缠现象是否可以解释引力的本质？本文探讨了ER=EPR猜想及其意义...',
    author: '李教授',
    date: '2024-01-15',
    comments: 28
  },
  {
    id: 2,
    title: '环量子引力的最新实验检验方案',
    excerpt: '提出了一种通过高精度原子干涉仪检验环量子引力效应的新实验方案...',
    author: '王博士',
    date: '2024-01-10',
    comments: 15
  },
  {
    id: 3,
    title: '统一场论中的暗能量问题',
    excerpt: '探讨了如何在统一场论框架下解释宇宙加速膨胀和暗能量的本质...',
    author: '张研究员',
    date: '2024-01-05',
    comments: 32
  }
]

// 计算属性
const filteredItems = computed(() => {
  // 根据搜索和筛选条件过滤内容
  return navigationItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
function scrollToSection(sectionId: string) {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 监听滚动，更新当前激活的章节
function handleScroll() {
  const scrollPosition = window.scrollY + 100
  
  for (const item of navigationItems) {
    const element = document.getElementById(item.id)
    if (element) {
      const offsetTop = element.offsetTop
      const offsetBottom = offsetTop + element.offsetHeight
      
      if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
        activeSection.value = item.id
        break
      }
    }
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.knowledge-page {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #fff;
  padding-bottom: 3rem;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
  padding: 3rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(77, 186, 135, 0.2);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #4DBA87, #2A9D8F);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-description {
  font-size: 1.1rem;
  color: #999;
  max-width: 800px;
}

/* 容器 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 搜索和筛选 */
.search-filter-section {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  max-width: 600px;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  background-color: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 8px 0 0 8px;
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
  padding: 0 1.5rem;
  background-color: #4DBA87;
  color: #000;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #43b77d;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1.25rem;
  background-color: #1a1a1a;
  color: #999;
  border: 1px solid #2d2d2d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.filter-tab:hover {
  background-color: #2d2d2d;
  color: #fff;
}

.filter-tab.active {
  background-color: #4DBA87;
  color: #000;
  border-color: #4DBA87;
}

/* 内容布局 */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 侧边栏 */
.sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.sidebar-section {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #2d2d2d;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #2d2d2d;
}

/* 目录导航 */
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 0.75rem;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.category-item:hover {
  background-color: #2d2d2d;
  color: #fff;
  transform: translateX(3px);
}

.category-item.active {
  background-color: #4DBA87;
  color: #000;
  font-weight: 500;
}

/* 推荐资源 */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #2d2d2d;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.resource-item:hover {
  background-color: #3d3d3d;
  transform: translateX(3px);
}

.resource-icon {
  font-size: 1.5rem;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.resource-type {
  font-size: 0.8rem;
  color: #4DBA87;
}

/* 快速链接 */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.quick-link:hover {
  background-color: #2d2d2d;
  border-color: #4DBA87;
  transform: translateY(-2px);
}

.link-icon {
  font-size: 1.2rem;
}

.link-text {
  font-weight: 500;
}

/* 主内容 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.knowledge-section {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #2d2d2d;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4DBA87;
  margin-bottom: 1.5rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 概念卡片 */
.concept-card {
  background-color: #151515;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #252525;
  transition: transform 0.3s ease;
}

.concept-card:hover {
  transform: translateY(-5px);
}

.concept-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.concept-description {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.formula-block {
  background-color: #0d0d0d;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #252525;
  overflow-x: auto;
}

/* 时间线 */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #4DBA87;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  background-color: #4DBA87;
  border-radius: 50%;
  border: 2px solid #0a0a0a;
}

.timeline-year {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 0.5rem;
}

.timeline-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.timeline-description {
  color: #ccc;
  line-height: 1.6;
}

/* 数学主题 */
.math-topic {
  background-color: #151515;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #252525;
}

.math-topic-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.math-topic-description {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* 理论卡片 */
.theory-card {
  background-color: #151515;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #252525;
  transition: all 0.3s ease;
}

.theory-card:hover {
  border-color: #4DBA87;
  transform: translateY(-3px);
}

.theory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.theory-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
}

.theory-badge {
  padding: 0.25rem 0.75rem;
  background-color: #4DBA87;
  color: #000;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.theory-description {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.theory-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #999;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4DBA87;
}

/* 实验网格 */
.experiment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.experiment-card {
  background-color: #151515;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #252525;
  transition: all 0.3s ease;
}

.experiment-card:hover {
  transform: translateY(-5px);
  border-color: #4DBA87;
}

.experiment-thumbnail {
  height: 150px;
  background-color: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 0.9rem;
}

.experiment-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 1rem;
}

.experiment-description {
  color: #ccc;
  line-height: 1.6;
  margin: 0 1rem 1rem;
  font-size: 0.95rem;
}

.experiment-date {
  background-color: #2d2d2d;
  color: #4DBA87;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 未来展望 */
.future-section {
  margin-bottom: 2rem;
}

.future-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1.5rem;
}

.future-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.future-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background-color: #151515;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #252525;
}

.future-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.future-text strong {
  color: #4DBA87;
  display: block;
  margin-bottom: 0.5rem;
}

.future-text p {
  color: #ccc;
  margin: 0;
  line-height: 1.6;
}

/* 挑战部分 */
.challenges-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1.5rem;
}

.challenges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.challenge-card {
  background-color: #151515;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #252525;
}

.challenge-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4DBA87;
  margin-bottom: 0.75rem;
}

.challenge-description {
  color: #ccc;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 讨论部分 */
.discussion-section {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #2d2d2d;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.discussion-description {
  color: #ccc;
  font-size: 1.05rem;
}

.start-discussion-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4DBA87;
  color: #000;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-discussion-btn:hover {
  background-color: #43b77d;
  transform: translateY(-2px);
}

.recent-discussions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.discussion-item {
  background-color: #151515;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #252525;
  transition: all 0.3s ease;
}

.discussion-item:hover {
  border-color: #4DBA87;
  transform: translateY(-3px);
}

.discussion-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
}

.discussion-excerpt {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.discussion-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #999;
}

.discussion-author {
  color: #4DBA87;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: relative;
    top: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }
  
  .sidebar-section {
    margin-bottom: 0;
  }
}

@media (max-width: 992px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
  
  .theory-details {
    grid-template-columns: 1fr;
  }
  
  .experiment-grid,
  .challenges-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .knowledge-section,
  .discussion-section {
    padding: 1.5rem 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .discussion-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .experiment-grid,
  .challenges-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 0;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .filter-tabs {
    gap: 0.25rem;
  }
  
  .filter-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>