<template>
  <div class="header">
    <!-- TODO: make beta version header compatible with Firefox Overflow Menu -->
    <div class="row mt-2 pb-2" style="border-bottom: 1px #eee solid;">
      <div class="col ml-3">
        <div
          v-on:click="navigateBack()"
          v-bind:class="{ back: canBack }"
          style="display: inline-block;"
        >
          <img
            v-if="canBack"
            src="/images/back-button.svg"
            style="height: 20px;"
          />
          <img
            class="sl-logo"
            src="/images/horizontal-logo.svg"
            style="height: 18px;"
          />
        </div>
        <div class="beta-badge" v-if="isBeta">BETA</div>
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
        <span
          class="settings-button float-right"
          @click="onClickSettingButton"
          v-show="canShowSettingsButton"
          title="Settings"
          v-b-tooltip.hover
        >
          <font-awesome-icon icon="cog" />
        </span>

        <a
          :href="reportBugUri"
          target="_blank"
          class="bug-button float-right"
          title="Report an issue"
          v-if="isBeta"
          v-b-tooltip.hover
        >
          <font-awesome-icon icon="bug" />
        </a>

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
import Utils from "../Utils";

export default {
  name: "sl-header",
  data() {
    return {
      apiKey: "",
      apiUrl: "",
      canBack: false,
      showDropdownMenu: false,
      isBeta: process.env.BETA,
      canShowSettingsButton: true,
      reportBugUri: "",
    };
  },
  async mounted() {
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
    this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

    EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, async () => {
      this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
      this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
    });

    this.setReportBugUri();
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

    async setReportBugUri() {
      const subject = encodeURIComponent("Report an issue on SimpleLogin");
      const hostname = await Utils.getHostName();
      const body = encodeURIComponent(
        "(Optional) Affected website: " +
          hostname +
          "\n" +
          "(Optional) Browser info: " +
          navigator.vendor +
          "; " +
          navigator.userAgent
      );
      this.reportBugUri = `mailto:extension@simplelogin.io?subject=${subject}&body=${body}`;
    },
  },
  computed: {},
};
</script>
