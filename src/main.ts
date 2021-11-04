import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueGtag from 'vue-gtag-next'
import '@/assets/index.css'

const app = createApp(App)

app.use(router)

app.use(VueGtag, {
  isEnabled: process.env.NODE_ENV === 'development',
  property: {
    // id: 'G-253BBQQJER', // local
    id: 'G-71G27SVGCV', // prod
  },
})

app.mount('#app')
