import { createRouter, createWebHistory } from 'vue-router'
import { trackRouter } from 'vue-gtag-next'

import PassLayout from './pages/PassLayout.vue'

import SheetIndex from './pages/sheets/Index.vue'
import SuperAutoPets from './pages/sheets/SuperAutoPets.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: { name: 'sheets' },
      name: 'home',
    },

    {
      path: '/sheets',
      component: PassLayout,
      children: [
        {
          path: '',
          component: SheetIndex,
          name: 'sheets',
        },
        {
          path: ':sheetid',
          component: SuperAutoPets,
          name: 'sheet',
        },
      ],
    },
  ],
})

trackRouter(router)

export default router
