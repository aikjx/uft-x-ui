import { createRouter, createWebHistory } from 'vue-router'
import FormulasView from '../views/FormulasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'formulas',
      component: FormulasView
    },
    {
      path: '/formula/:id',
      name: 'formula-detail',
      component: () => import('../views/FormulaDetailView.vue')
    }
  ]
})

export default router