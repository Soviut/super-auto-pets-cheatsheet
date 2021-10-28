import { createRouter, createWebHistory } from 'vue-router'

import Home from './pages/Index.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, name: 'home' },
  ],
})
