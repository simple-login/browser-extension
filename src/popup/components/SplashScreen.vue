<template>
  <div v-if="show" style="height: 400px">
    <div class="splash overlay">
      <div class="overlay-content">
        <img class="logo" src="/images/horizontal-logo.svg" /><br />
        <img class="loading" src="/images/loading.svg" />
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import Utils from "../Utils";
import { API_ROUTE } from "../APIService";

export default {
  name: "sl-loading",
  data() {
    return {
      apiKey: "",
      show: false,
    };
  },
  async mounted() {
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);

    // only show after waiting for more than 500ms
    this.timeoutId = setTimeout(() => {
      this.show = true;
    }, 500);

    if (this.apiKey !== "") {
      Navigation.navigateTo(Navigation.PATH.MAIN, true);
    } else {
      // try to get api key when user is already logged in
      const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

      const res = await fetch(apiUrl + API_ROUTE.GET_API_KEY_FROM_COOKIE.path, {
        method: "POST",
        body: JSON.stringify({
          device: Utils.getDeviceName(),
        }),
        headers: {
          "X-Sl-Allowcookies": true,
        },
      });

      if (res.ok) {
        let apiRes = await res.json();
        this.apiKey = apiRes.api_key || "";
        if (this.apiKey) {
          await SLStorage.set(SLStorage.SETTINGS.API_KEY, this.apiKey);
          EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);

          Navigation.navigateTo(Navigation.PATH.MAIN, true);
        } else {
          Navigation.navigateTo(Navigation.PATH.LOGIN, true);
        }
      } else {
        // user is probably not logged in
        Navigation.navigateTo(Navigation.PATH.LOGIN, true);
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeoutId);
  },
  methods: {},
  computed: {},
};
</script>
