<template>
  <div class="app" :class="{ 'ff-overflow-menu': isInsideOverflowMenu }">
    <v-dialog />
    <sl-header :useCompactLayout="isInsideOverflowMenu" />
    <router-view />
  </div>
</template>

<script>
import "./App.scss";
import VueRouter from "vue-router";
import Navigation from "./Navigation";

import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import Login from "./components/Login";
import SelfHostSetting from "./components/SelfHostSetting";
import ApiKeySetting from "./components/ApiKeySetting";
import Main from "./components/Main";
import NewAliasResult from "./components/NewAliasResult";
import AppSettings from "./components/AppSettings";
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
  AppSettings,
};

const routes = Navigation.getRoutes(components);

const router = new VueRouter({
  mode: "abstract",
  routes,
});

export default {
  router,
  components,
  data() {
    return {
      isInsideOverflowMenu: false,
      appScale: 1,
    };
  },
  async mounted() {
    await APIService.initService();
    Utils.setToasted(this.$toasted);
    Navigation.setRouter(this.$router);
    Navigation.navigateTo(Navigation.PATH.ROOT);
    this.detectOverflowMenu();
  },
  methods: {
    detectOverflowMenu() {
      const appElem = document.querySelector(".app");
      const appWidth = +getComputedStyle(appElem).width.replace("px", "");
      const windowWidth = window.innerWidth;
      if (windowWidth < appWidth) {
        this.isInsideOverflowMenu = true;
      }
    },
  },
};
</script>
