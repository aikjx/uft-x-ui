import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '统一场论 - 人工场探索网' }
  },
  {
    path: '/formulas',
    name: 'Formulas',
    component: () => import('../views/FormulasView.vue'),
    meta: { title: '核心公式' }
  },
  {
    path: '/formula/:id',
    name: 'FormulaDetail',
    component: () => import('../views/FormulaDetailView.vue'),
    meta: { title: '公式详情' }
  },
  {
    path: '/visualization',
    name: 'Visualization',
    component: () => import('../views/VisualizationView.vue'),
    meta: { title: '3D可视化' }
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('../views/LearnView.vue'),
    meta: { title: '学习路径' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: { title: '关于理论' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, _, next) => {
  const title = to.meta.title as string || '统一场论'
  document.title = `${title} - UTF Star`
  next()
})

export default router
