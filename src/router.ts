import { createRouter, createWebHistory } from 'vue-router'

import PassLayout from './pages/PassLayout.vue'

import SheetIndex from './pages/sheets/Index.vue'
import SuperAutoPets from './pages/sheets/SuperAutoPets.vue'

export default createRouter({
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
