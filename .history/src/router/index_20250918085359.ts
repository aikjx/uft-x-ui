import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/formulas',
      name: 'formulas',
      component: () => import('../views/FormulasView.vue')
    },
    {
      path: '/learning-path',
      name: 'learning-path',
      component: () => import('../views/LearningPathView.vue')
    },
    {
      path: '/relationships',
      name: 'relationships',
      component: () => import('../views/RelationshipsView.vue')
    },
    {
      path: '/formula/:id',
      name: 'formula-detail',
      component: () => import('../views/FormulaDetailView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

export default router