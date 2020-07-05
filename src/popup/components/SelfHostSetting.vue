<template>
  <div class="content">
    <div class="p-3">
      <div class="mb-2">
        If you self-host SimpleLogin, you can change the API URL to your
        server address.
      </div>
      <div class="mb-2">
        The default API URL is https://app.simplelogin.io
      </div>

      <div style="margin: auto;">
        <input
          v-model="apiUrl"
          v-on:keyup.enter="saveApiUrl"
          placeholder="https://app.simplelogin.io"
          autofocus
          class="form-control mt-3 w-100"
        />
        <button @click="saveApiUrl" class="btn btn-primary btn-block mt-2">
          Set API URL
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";

export default {
  data() {
    return {
      apiUrl: '',
    };
  },
  async mounted() {
    this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
  },
  methods: {
    async saveApiUrl() {
      await SLStorage.set(SLStorage.SETTINGS.API_URL, this.apiUrl);
      EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);

      EventManager.broadcast(
        EventManager.EVENT.SHOW_MESSAGE,
        "API URL saved successfully"
      );
    },
  },
  computed: {},
};
</script>
