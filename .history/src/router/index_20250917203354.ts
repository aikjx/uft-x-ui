import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '统一场论可视化首页',
      description: '探索张祥前统一场论的核心公式'
    }
  },
  {
    path: '/formulas',
    name: 'Formulas',
    component: () => import('@/views/FormulasView.vue'),
    meta: {
      title: '公式列表',
      description: '浏览所有统一场论核心公式'
    }
  },
  {
    path: '/formula/:id',
    name: 'FormulaDetail',
    component: () => import('@/views/FormulaDetailView.vue'),
    meta: {
      title: '公式详情',
      description: '深入了解特定公式的可视化'
    }
  },
  {
    path: '/relationships',
    name: 'Relationships',
    component: () => import('@/views/RelationshipsView.vue'),
    meta: {
      title: '公式关联关系',
      description: '探索公式间的内在联系'
    }
  },
  {
    path: '/learning-path',
    name: 'LearningPath',
    component: () => import('@/views/LearningPathView.vue'),
    meta: {
      title: '学习路径',
      description: '渐进式学习统一场论'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: '关于项目',
      description: '了解统一场论可视化项目'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      description: '您访问的页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} | UTF Star`
  }
  
  // 设置页面描述
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }
  
  next()
})

export default router