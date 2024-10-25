import { createApp, inject, ref } from 'vue'
import router from './router'
import { init } from '@sentry/vue'

import App from './App.vue'
import { createBootstrap } from 'bootstrap-vue-next'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import './assets/main.scss'
import { hasMovedRouterKey } from './utils/keys'
import SLStorage from './utils/SLStorage'

const app = createApp(App).use(router).provide(hasMovedRouterKey, ref(false))
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

router.beforeEach((to, from) => {
  if (to.fullPath !== from.fullPath) {
    const val = inject(hasMovedRouterKey)
    if (val) {
      val.value = true
    }
  }
})

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
