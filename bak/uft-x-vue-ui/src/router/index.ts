import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由懒加载 - 添加魔法注释优化预加载
const HomePage = () => import(/* webpackChunkName: "home" */ '@/pages/HomePage.vue')
const UnifiedFieldVisualization = () => import(/* webpackChunkName: "unified-field" */ '@/pages/UnifiedFieldVisualization.vue')
const FormulaVisualizationPage = () => import(/* webpackChunkName: "formula" */ '@/pages/FormulaVisualizationPage.vue')
const InteractiveExplorationPage = () => import(/* webpackChunkName: "interactive" */ '@/pages/InteractiveExplorationPage.vue')
const KnowledgePage = () => import(/* webpackChunkName: "knowledge" */ '@/pages/KnowledgePage.vue')
const CodeOptimizerPage = () => import(/* webpackChunkName: "optimizer" */ '@/pages/CodeOptimizerPage.vue')
const NotFoundPage = () => import(/* webpackChunkName: "404" */ '@/pages/NotFound.vue')

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
    path: '/unified-field',
    name: 'unifiedField',
    component: UnifiedFieldVisualization,
    meta: {
      title: '统一场论3D可视化 - 量子级渲染引擎',
      description: '探索宇宙的本质规律，体验革命性的物理可视化'
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
    path: '/code-optimizer',
    name: 'codeOptimizer',
    component: CodeOptimizerPage,
    meta: {
      title: '代码优化器 - UFT-X'
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
  history: createWebHistory((import.meta as any).env?.BASE_URL || '/'),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // 保存滚动位置
    if (savedPosition) {
      return savedPosition
    }
    // 默认滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = to.meta.title as string || 'UFT-X - 统一场论可视化'
  next()
})

export default router