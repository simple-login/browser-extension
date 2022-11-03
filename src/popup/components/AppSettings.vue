<template>
  <div class="content">
    <div class="p-3 container">
      <p class="font-weight-bold align-self-center">
        App Settings ({{ userEmail }})
      </p>

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
              If enabled, you can quickly create a random alias by clicking on
              the SimpleLogin button placed next to the email field.
              <a
                :href="reportURISLButton"
                v-show="showSLButton"
                target="_blank"
              >
                <br />
                <font-awesome-icon icon="bug" />
                Report an issue
              </a>
            </small>
          </td>
        </tr>

        <tr v-show="showSLButton">
          <td>
            <toggle-button
              :value="positionSLButton === 'right-outside'"
              :sync="true"
              color="#b02a8f"
              :width="30"
              :height="18"
              @change="handleToggleSLButtonOutside()"
            />
          </td>
          <td>
            Place SimpleLogin button outside the input<br />
            <small>
              Display the SimpleLogin button next to the email field instead of
              inside the field. This can avoid having overlapping buttons with
              other extensions like Dashlane, LastPass, etc
            </small>
          </td>
        </tr>

        <tr>
          <td></td>
          <td>
            SimpleLogin extension Theme<br />
            <small>
              System theme automatically switches between Light and Dark -
              according to system preference.
            </small>
            <div
              class="input-group-sm w-50"
              style="padding-top: 6px; padding-bottom: 6px"
            >
              <select v-model="theme" class="form-control">
                <option
                  v-for="themeOption in THEMES"
                  :key="themeOption"
                  :value="themeOption"
                >
                  {{ THEME_LABELS[themeOption] }}
                </option>
              </select>
            </div>
          </td>
        </tr>
      </table>

      <button
        @click="handleLogout"
        class="btn btn-outline-primary btn-block mt-2"
      >
        Logout
      </button>

      <div
        class="font-weight-light"
        style="position: fixed; bottom: 0; right: 2px; font-size: 0.8rem"
      >
        Version: {{ extension_version }}
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import Utils from "../Utils";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";
import { setThemeClass, THEME_LABELS, THEMES, getSavedTheme } from "../Theme";

export default {
  data() {
    return {
      showSLButton: false,
      positionSLButton: "right-inside",
      reportURISLButton: "",
      extension_version: "development",
      userEmail: "",
      theme: "",
      THEMES,
      THEME_LABELS,
    };
  },
  async mounted() {
    this.showSLButton = await SLStorage.get(SLStorage.SETTINGS.SHOW_SL_BUTTON);
    this.positionSLButton = await SLStorage.get(
      SLStorage.SETTINGS.SL_BUTTON_POSITION
    );
    this.theme = await getSavedTheme();

    await this.setMailToUri();
    this.extension_version = browser.runtime.getManifest().version;

    // check api key
    let userInfo = await callAPI(
      API_ROUTE.GET_USER_INFO,
      {},
      {},
      API_ON_ERR.TOAST
    );
    this.userEmail = userInfo.data.email;
  },
  methods: {
    async handleToggleSLButton() {
      this.showSLButton = !this.showSLButton;
      await SLStorage.set(SLStorage.SETTINGS.SHOW_SL_BUTTON, this.showSLButton);
      this.showSavedSettingsToast();
    },

    async handleToggleSLButtonOutside() {
      this.positionSLButton =
        this.positionSLButton === "right-outside"
          ? "right-inside"
          : "right-outside";
      await SLStorage.set(
        SLStorage.SETTINGS.SL_BUTTON_POSITION,
        this.positionSLButton
      );
      this.showSavedSettingsToast();
    },

    showSavedSettingsToast() {
      Utils.showSuccess("Settings saved");
    },

    async handleLogout() {
      await callAPI(API_ROUTE.LOGOUT, {}, {}, API_ON_ERR.IGNORE);
      await SLStorage.remove(SLStorage.SETTINGS.API_KEY);
      EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
      Navigation.clearHistoryAndNavigateTo(Navigation.PATH.LOGIN);

      try {
        console.log("send log out event to host app");
        let r = await browser.runtime.sendNativeMessage("application.id", {
          message: {
            logged_out: {},
          },
        });
      } catch (error) {
        console.info("can't send data to native app", error);
      }
    },

    async setMailToUri() {
      const subject = encodeURIComponent("Problem with SLButton feature");
      const hostname = await Utils.getHostName();
      const body = encodeURIComponent(
        "(Optional) Affected website: " + hostname
      );
      this.reportURISLButton = `mailto:extension@simplelogin.io?subject=${subject}&body=${body}`;
    },
  },
  computed: {},
  watch: {
    theme: async function (nextTheme, prevTheme) {
      if (!prevTheme) {
        return;
      }

      setThemeClass(nextTheme, prevTheme);
      this.showSavedSettingsToast();
    },
  },
};
</script>
