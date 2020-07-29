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
          @click="onClickSettingButton"
          v-show="canShowSettingsButton"
        />
        <a
          :href="apiUrl + '/dashboard/'"
          target="_blank"
          class="float-right"
          style="padding: 0.25rem 0.5rem; font-size: 0.875rem;"
        >
          Dashboard <font-awesome-icon icon="external-link-alt" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";

export default {
  name: "sl-header",
  data() {
    return {
      apiKey: "",
      apiUrl: "",
      canBack: false,
      canShowSettingsButton: true,
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
      this.canShowSettingsButton = to.path !== Navigation.PATH.APP_SETTINGS;
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

    onClickSettingButton: function () {
      Navigation.navigateTo(Navigation.PATH.APP_SETTINGS, true);
    },
  },
  computed: {},
};
</script>
