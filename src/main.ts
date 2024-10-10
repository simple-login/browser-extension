import { createApp, inject, ref } from 'vue'
import router from './router'

import App from './App.vue'
import { createBootstrap } from 'bootstrap-vue-next'

import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import './assets/main.scss'
import { hasMovedRouterKey } from './utils/keys'

const app = createApp(App)

app.provide(hasMovedRouterKey, ref(false))

app.use(router)

router.beforeEach((to, from) => {
  if (to.fullPath !== from.fullPath) {
    const val = inject(hasMovedRouterKey)
    if (val) {
      val.value = true
    }
  }
})

app.use(createBootstrap()).mount('#app')

// import Vue from "vue";
// import App from "./App";
// import Toasted from "vue-toasted";
// import BootstrapVue from "bootstrap-vue";
// import SLStorage from "./SLStorage";

// import * as Sentry from "@sentry/browser";
// import * as Integrations from "@sentry/integrations";
// // import VModal from "vue-js-modal";
// // import VueRouter from "vue-router";
// // import ToggleButton from "vue-js-toggle-button";

// import { library } from "@fortawesome/fontawesome-svg-core";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// import {
//   faRandom,
//   faExternalLinkAlt,
//   faTrash,
//   faLongArrowAltUp,
//   faChevronLeft,
//   faCopy,
//   faStar,
//   faSave,
//   faBug,
//   faQuestionCircle,
//   faCog,
//   faPaperPlane,
//   faArrowLeft,
// } from "@fortawesome/free-solid-svg-icons";

// library.add(
//   faRandom,
//   faExternalLinkAlt,
//   faTrash,
//   faLongArrowAltUp,
//   faChevronLeft,
//   faCopy,
//   faStar,
//   faSave,
//   faBug,
//   faQuestionCircle,
//   faCog,
//   faPaperPlane,
//   faArrowLeft
// );

// global.browser = require("webextension-polyfill");
// Vue.prototype.$browser = global.browser;

// // async wrapper
// async function initApp() {
//   const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

//   if (
//     // only enable Sentry for non self-hosting users
//     apiUrl === SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL] &&
//     // and not in development mode
//     process.env.NODE_ENV !== "development"
//   ) {
//     Sentry.init({
//       dsn: "https://6990c2b0a6e94b57a2b80587efcb4354@api.protonmail.ch/core/v4/reports/sentry/51",
//       integrations: [
//         new Integrations.Vue({ Vue, attachProps: true, logErrors: true }),
//       ],
//       environment: process.env.BETA ? "beta" : "prod",
//     });
//   }

//   Vue.use(Clipboard);
//   Vue.use(Toasted, { duration: 1000, position: "bottom-right" });
//   Vue.use(BootstrapVue);
//   Vue.use(VModal, { dialog: true });
//   Vue.use(VueRouter);
//   Vue.use(ToggleButton);
//   Vue.component("font-awesome-icon", FontAwesomeIcon);

//   /* eslint-disable no-new */
//   new Vue({
//     el: "#app",
//     render: (h) => h(App),
//   });
// }

// initApp();
