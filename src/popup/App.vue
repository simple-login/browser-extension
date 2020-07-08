<template>
  <div class="app">
    <sl-splash></sl-splash>
    <sl-header></sl-header>
    <router-view></router-view>
  </div>
</template>

<script>
import VueRouter from "vue-router";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Navigation from "./Navigation";
import EventManager from "./EventManager";

import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import Login from "./components/Login";
import SelfHostSetting from "./components/SelfHostSetting";
import ApiKeySetting from "./components/ApiKeySetting";
import Main from "./components/Main";
import NewAliasResult from "./components/NewAliasResult";

const components = {
  "sl-header": Header,
  "sl-splash": SplashScreen,
  Login,
  SelfHostSetting,
  ApiKeySetting,
  Main,
  NewAliasResult,
};

const routes = Navigation.getRoutes(components);

const router = new VueRouter({
  routes,
});

export default {
  router,
  components,
  mounted() {
    Navigation.setRouter(this.$router);
    EventManager.addListener(EventManager.EVENT.SHOW_MESSAGE, (message) => {
      this.$toasted.show(message, {
        type: "success",
        duration: 2500,
      });
    });

    EventManager.addListener(EventManager.EVENT.SHOW_ERROR, (message) => {
      this.$toasted.show(message, {
        type: "error",
        duration: 3000,
        action: {
          text: "x",
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          },
        },
      });
    });
  },
};
</script>
