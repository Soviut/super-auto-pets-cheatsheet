import { createRouter, createWebHistory } from 'vue-router'

import PassLayout from './pages/PassLayout.vue'

import SuperAutoPets from './pages/sheets/SuperAutoPets.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: { name: 'super-auto-pets' },
      name: 'home',
    },

    {
      path: '/sheets',
      component: PassLayout,
      children: [
        {
          path: '',
          redirect: { name: 'super-auto-pets' },
          name: 'sheets',
        },
        {
          path: 'super-auto-pets',
          component: PassLayout,
          children: [
            {
              path: '',
              component: SuperAutoPets,
              name: 'super-auto-pets'
            },
            {
              path: ':id',
              component: SuperAutoPets,
              name: 'super-auto-pets-view'
            },
          ],
        },
      ],
    },
  ],
})
