import Vue from "vue";
import App from "./App";
import Clipboard from "v-clipboard";
import Toasted from "vue-toasted";
import BootstrapVue from "bootstrap-vue";

import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";
import VModal from "vue-js-modal";
import VueRouter from "vue-router";
import ToggleButton from "vue-js-toggle-button";

global.browser = require("webextension-polyfill");
Vue.prototype.$browser = global.browser;

Vue.use(Clipboard);
Vue.use(Toasted, { duration: 1000, position: "bottom-right" });
Vue.use(BootstrapVue);
Vue.use(VModal, { dialog: true });
Vue.use(VueRouter);
Vue.use(ToggleButton);

Sentry.init({
  dsn: "https://dfc7a7727433452fbe5741b602058cc5@sentry.io/1839562",
  integrations: [
    new Integrations.Vue({ Vue, attachProps: true, logErrors: true }),
  ],
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
});
