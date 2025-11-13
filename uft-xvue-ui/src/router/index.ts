import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由懒加载
const HomePage = () => import('@/pages/HomePage.vue')
const FormulaVisualizationPage = () => import('@/pages/FormulaVisualizationPage.vue')
const InteractiveExplorationPage = () => import('@/pages/InteractiveExplorationPage.vue')
const KnowledgePage = () => import('@/pages/KnowledgePage.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: '首页 - 统一场论可视化'
    }
  },
  {
    path: '/formula-visualization',
    name: 'formulaVisualization',
    component: FormulaVisualizationPage,
    meta: {
      title: '公式可视化 - 统一场论'
    }
  },
  {
    path: '/interactive-exploration',
    name: 'interactiveExploration',
    component: InteractiveExplorationPage,
    meta: {
      title: '交互式探索 - 统一场论'
    }
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: KnowledgePage,
    meta: {
      title: '知识库 - 统一场论'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFoundPage,
    meta: {
      title: '页面未找到'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 保存滚动位置
    if (savedPosition) {
      return savedPosition
    }
    // 默认滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title as string || 'UFT-X - 统一场论可视化'
  next()
})

export default router