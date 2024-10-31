import { createApp } from 'vue'
import router from './router'
import { init } from '@sentry/vue'

import App from './App.vue'
import { createBootstrap } from 'bootstrap-vue-next'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import './assets/main.scss'
import SLStorage from './utils/SLStorage'

const app = createApp(App).use(router)

const initApp = async () => {
  const apiUrl = await SLStorage.getItem(SLStorage.SETTINGS.API_URL)

  if (
    // only enable Sentry for non self-hosting users
    apiUrl === SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL] &&
    // and not in development mode
    import.meta.env.PROD
  ) {
    init({
      app,
      dsn: 'https://6990c2b0a6e94b57a2b80587efcb4354@api.protonmail.ch/core/v4/reports/sentry/51',
      integrations: [],
      environment: import.meta.env.VITE_BETA ? 'beta' : 'prod'
    })
  }
}

app.use(createBootstrap()).mount('#app')

initApp()
