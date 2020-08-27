import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import Onboarding from "./Onboarding";
import "./styles.scss";

Vue.use(BootstrapVue);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(Onboarding),
});
