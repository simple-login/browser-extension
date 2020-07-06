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

    if (this.apiKey) {
      //Navigation.navigateTo(Navigation.PATH.MAIN);
    } else {
      Navigation.navigateTo(Navigation.PATH.LOGIN);
    }

    EventManager.addListener(EventManager.EVENT.APP_LOADED, () => {
      this.isShow = false;
    });

    EventManager.addListener(EventManager.EVENT.LOADING_OVERLAY, (show) => {
      this.isShow = show;
    });
  },
  methods: {},
  computed: {},
};
</script>
