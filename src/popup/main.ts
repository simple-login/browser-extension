import {createApp} from 'vue'
import App from './App.vue'
// import Toasted from "vue-toasted";
// import BootstrapVue from "bootstrap-vue";
import {SLStorage} from './utils'
import './assets/styles/App.scss'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import * as Sentry from '@sentry/vue'
// import VModal from "vue-js-modal";
// import VueRouter from "vue-router";
// import ToggleButton from "vue-js-toggle-button";

const app = createApp(App).use(router)

// async wrapper
const initApp = async () => {
  const apiUrl = await SLStorage.get(SLStorage.settings.apiUrl)

  if (
    // only enable Sentry for non self-hosting users
    apiUrl === SLStorage.defaultSettings[SLStorage.settings.apiUrl] &&
    // and not in development mode
    import.meta.env.NODE_ENV !== 'development'
  ) {
    Sentry.init({
      app,
      dsn: 'https://6990c2b0a6e94b57a2b80587efcb4354@api.protonmail.ch/core/v4/reports/sentry/51',
      environment: import.meta.env.BETA ? 'beta' : 'prod',
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
      ],
    })
  }

  // Vue.use(Toasted, { duration: 1000, position: "bottom-right" });
  // Vue.use(BootstrapVue);
  // Vue.use(VModal, { dialog: true });
  // Vue.use(VueRouter);
  // Vue.use(ToggleButton);

  app.mount('#app')
}

initApp()
