<template>
  <div class="content">
    <div class="p-3 container">
      <p class="font-weight-bold align-self-center">App Settings</p>

      <table class="settings-list">
        <tr>
          <td>
            <toggle-button
              :value="showSLButton"
              :sync="true"
              color="#b02a8f"
              :width="30"
              :height="18"
              @change="handleToggleSLButton()"
            />
          </td>
          <td>
            Show SimpleLogin button on email input fields<br />
            <small>
              SimpleLogin button allows you to quickly create random alias
              without having to navigating to SimpleLogin application.
              <a :href="SLButtonReport" v-show="showSLButton" target="_blank">
                <br/><font-awesome-icon icon="bug" /> Report a problem with this feature
              </a>
            </small>
          </td>
        </tr>

        <tr v-show="showSLButton">
          <td>
            <toggle-button
              :value="SLButtonPosition === 'right-outside'"
              :sync="true"
              color="#b02a8f"
              :width="30"
              :height="18"
              @change="handleToggleSLButtonOutside()"
            />
          </td>
          <td>
            Place SimpleLogin button outside the input<br />
            <small
              >This will prevent SimpleLogin button from overlapping buttons of
              other extensions (LastPass, Dashlane,...)</small
            >
          </td>
        </tr>
      </table>

      <button
        @click="handleLogout"
        class="btn btn-outline-primary btn-block mt-2"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import Utils from "../Utils";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

export default {
  data() {
    return {
      showSLButton: false,
      SLButtonPosition: "right-inside",
      SLButtonReport: '',
    };
  },
  async mounted() {
    this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      this.showSLButton = await SLStorage.get(
        SLStorage.SETTINGS.SHOW_SL_BUTTON
      );
      this.SLButtonPosition = await SLStorage.get(
        SLStorage.SETTINGS.SL_BUTTON_POSITION
      );
      this.setMailToUri();
    },

    async handleToggleSLButton() {
      this.showSLButton = !this.showSLButton;
      await SLStorage.set(SLStorage.SETTINGS.SHOW_SL_BUTTON, this.showSLButton);
      this.fetchSettings();
      this.showSavedSettingsToast();
    },

    async handleToggleSLButtonOutside() {
      this.SLButtonPosition =
        this.SLButtonPosition === "right-outside"
          ? "right-inside"
          : "right-outside";
      await SLStorage.set(
        SLStorage.SETTINGS.SL_BUTTON_POSITION,
        this.SLButtonPosition
      );
      this.fetchSettings();
      this.showSavedSettingsToast();
    },

    showSavedSettingsToast() {
      Utils.showSuccess("Settings saved");
    },

    async handleLogout() {
      await callAPI(API_ROUTE.LOGOUT, {}, {}, API_ON_ERR.IGNORE);
      await SLStorage.remove(SLStorage.SETTINGS.API_KEY);
      EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
      Navigation.clearHistory();
      Navigation.navigateTo(Navigation.PATH.LOGIN);
    },

    async setMailToUri() {
      const subject = encodeURIComponent('Problem with SLButton feature');
      const hostname = await Utils.getHostName();
      const body = encodeURIComponent('(Optional) Affected website: ' + hostname);
      this.SLButtonReport = `mailto:hi@simplelogin.io?subject=${subject}&body=${body}`;
    }
  },
  computed: {},
};
</script>
