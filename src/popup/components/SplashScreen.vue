<template>
  <div v-if="isShow" class="splash overlay">
    <div class="overlay-content">
      <img class="logo" src="/images/horizontal-logo.svg" /><br />
      <img class="loading" src="/images/loading.svg" />
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import Utils from "../Utils";
import axios from "axios";

export default {
  name: "sl-loading",
  data() {
    return {
      apiKey: "",
      isShow: true,
    };
  },
  async mounted() {
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);

    if (this.apiKey !== "") {
      Navigation.navigateTo(Navigation.PATH.MAIN, true);
    } else {
      // try to get api key when user is already logged in
      var apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
      axios
        .post(apiUrl + "/api/api_key", {
          device: Utils.getDeviceName(),
        })
        .then(async (res) => {
          this.apiKey = res.data.api_key || "";
          if (this.apiKey) {
            await SLStorage.set(SLStorage.SETTINGS.API_KEY, this.apiKey);
            EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);

            Navigation.navigateTo(Navigation.PATH.MAIN, true);
          } else {
            Navigation.navigateTo(Navigation.PATH.LOGIN, true);
          }
        })
        .catch((err) => {
          // user is probably not logged in
          Navigation.navigateTo(Navigation.PATH.LOGIN, true);
        });
    }

    EventManager.addListener(EventManager.EVENT.APP_LOADED, () => {
      this.isShow = false;
    });
  },
  methods: {},
  computed: {},
};
</script>
