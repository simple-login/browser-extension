<template>
  <div class="header">
    <div class="row mt-2 pb-2" style="border-bottom: 1px #eee solid;">
      <div class="col ml-3">
        <div v-on:click="navigateBack()" v-bind:class="{ back: canBack }">
          <img
            v-if="canBack"
            src="/images/back-button.svg"
            style="height: 20px;"
          />
          <img src="/images/horizontal-logo.svg" style="height: 18px;" />
        </div>
      </div>

      <div v-if="apiKey === ''" class="col mr-2">
        <button
          @click="goToSelfHostSetting"
          class="btn btn-sm btn-outline-success float-right"
        >
          Settings
        </button>
      </div>

      <div v-if="apiKey !== ''" class="col mr-2">
        <img
          src="/images/icon-settings.svg"
          class="settings-button float-right"
          @click="toggleDropdownMenu"
        />
        <a
          :href="apiUrl + '/dashboard/'"
          target="_blank"
          class="btn btn-sm btn-outline-success float-right"
        >
          Dashboard ↗
        </a>

        <div
          class="dropdown-menu app-header-menu"
          v-bind:class="{ show: showDropdownMenu }"
        >
          <a class="dropdown-item" @click="handleLogout">Logout</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import { callAPI, ROUTE, API_ON_ERR } from "../APIService";

export default {
  name: "sl-header",
  data() {
    return {
      apiKey: "",
      apiUrl: "",
      canBack: false,
      showDropdownMenu: false,
    };
  },
  async mounted() {
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
    this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

    EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, async () => {
      this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
      this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
    });
  },
  watch: {
    $route(to, from) {
      this.canBack = Navigation.canGoBack();
      this.showDropdownMenu = false;
    },
  },
  methods: {
    goToSelfHostSetting: function () {
      Navigation.navigateTo(Navigation.PATH.SELF_HOST_SETTING, true);
    },

    navigateBack: function () {
      if (this.canBack) {
        Navigation.navigateBack();
      }
    },

    toggleDropdownMenu: function () {
      this.showDropdownMenu = !this.showDropdownMenu;
    },

    handleLogout: async function () {
      await callAPI(API_ROUTE.LOGOUT, {}, {}, API_ON_ERR.IGNORE);
      await SLStorage.remove(SLStorage.SETTINGS.API_KEY);
      EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
      Navigation.navigateTo(Navigation.PATH.LOGIN);
    },
  },
  computed: {},
};
</script>
