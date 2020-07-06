<template>
  <div class="header">
    <div class="row mt-2 pb-2" style="border-bottom: 1px #eee solid;">
      <div class="col ml-3">
        <a href="https://www.simplelogin.io" target="_blank">
          <img
            src="/images/horizontal-logo.svg"
            class="mx-auto"
            style="max-width: 100px;"
          />
        </a>
      </div>

      <div v-if="apiKey === ''" class="col mr-2">
        <button
          @click="gotoSetting"
          class="btn btn-sm btn-outline-success float-right"
        >
          Settings
        </button>
      </div>

      <div v-if="apiKey !== ''" class="col mr-2">
        <a
          :href="apiUrl + '/dashboard/'"
          target="_blank"
          class="btn btn-sm btn-outline-success float-right"
        >
          Dashboard ↗
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
  methods: {
    gotoSetting: function () {
      Navigation.navigateTo(Navigation.PATH.SELF_HOST_SETTING);
    },
  },
  computed: {},
};
</script>
