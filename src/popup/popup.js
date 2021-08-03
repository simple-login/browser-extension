import Vue from "vue";
import App from "./App";
import Clipboard from "v-clipboard";
import Toasted from "vue-toasted";
import BootstrapVue from "bootstrap-vue";
import SLStorage from "./SLStorage";

import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";
import VModal from "vue-js-modal";
import VueRouter from "vue-router";
import ToggleButton from "vue-js-toggle-button";
import TextareaAutosize from "vue-textarea-autosize";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faRandom,
  faExternalLinkAlt,
  faTrash,
  faLongArrowAltUp,
  faChevronLeft,
  faCopy,
  faStar,
  faSave,
  faBug,
  faQuestionCircle,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faRandom,
  faExternalLinkAlt,
  faTrash,
  faLongArrowAltUp,
  faChevronLeft,
  faCopy,
  faStar,
  faSave,
  faBug,
  faQuestionCircle,
  faCog
);

global.browser = require("webextension-polyfill");
Vue.prototype.$browser = global.browser;

// async wrapper
async function initApp() {
  const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

  if (
    // only enable Sentry for non self-hosting users
    apiUrl === SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL] &&
    // and not in development mode
    process.env.NODE_ENV !== "development"
  ) {
    Sentry.init({
      dsn: "https://0e2d03e61f194df9ba85a791d364088b@o336535.ingest.sentry.io/5341174",
      integrations: [
        new Integrations.Vue({ Vue, attachProps: true, logErrors: true }),
      ],
      environment: process.env.BETA ? "beta" : "prod",
    });
  }

  Vue.use(Clipboard);
  Vue.use(Toasted, { duration: 1000, position: "bottom-right" });
  Vue.use(BootstrapVue);
  Vue.use(VModal, { dialog: true });
  Vue.use(VueRouter);
  Vue.use(ToggleButton);
  Vue.use(TextareaAutosize);
  Vue.component("font-awesome-icon", FontAwesomeIcon);

  /* eslint-disable no-new */
  new Vue({
    el: "#app",
    render: (h) => h(App),
  });
}

initApp();
