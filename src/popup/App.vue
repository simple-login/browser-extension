<template>
  <div class="app">
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
import Utils from "./Utils";
import APIService from "./APIService";

const components = {
  "sl-header": Header,
  SplashScreen,
  Login,
  SelfHostSetting,
  ApiKeySetting,
  Main,
  NewAliasResult,
};

const routes = Navigation.getRoutes(components);

const router = new VueRouter({
  mode: "abstract",
  routes,
});

export default {
  router,
  components,
  async mounted() {
    await APIService.initService();
    Utils.setToasted(this.$toasted);
    Navigation.setRouter(this.$router);
    Navigation.navigateTo(Navigation.PATH.ROOT);
  },
};
</script>
