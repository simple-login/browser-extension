<template>
  <div class="content">
    <div class="p-2 container">
      <div class="text-center">
        <p class="font-weight-bold">Alias is created</p>
        <span class="text-info">{{ newAlias }}</span>
        <button
          v-if="newAlias"
          v-clipboard="() => newAlias"
          v-clipboard:success="clipboardSuccessHandler"
          v-clipboard:error="clipboardErrorHandler"
          class="btn btn-success btn-sm"
        >
          Copy
        </button>

        <br />

        <button @click="backToMainPage" class="btn btn-secondary mt-3">
          &lt; Back
        </button>

        <div
          class="mt-5 mx-auto bg-light p-3"
          v-if="showVoteScreen"
          style="max-width: 80%;"
        >
          If you are happy with SimpleLogin, please support us by rating the
          extension on the store. Thanks!

          <br />

          <a :href="extensionUrl" target="_blank" class="btn btn-primary mt-3">
            Rate Us</a
          >

          <br />

          <button
            @click="doNotAskRateAgain"
            class="btn btn-sm btn-link text-secondary mt-3"
          >
            Do not ask again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SLStorage from "../SLStorage";
import Navigation from "../Navigation";
import EventManager from "../EventManager";
import Utils from "../Utils";

export default {
  data() {
    return {
      newAlias: "",
      showVoteScreen: false,
      extensionUrl: Utils.getExtensionURL(),
    };
  },
  async mounted() {
    this.newAlias = this.$route.params.email;
    let notAskingRate = await SLStorage.get(SLStorage.SETTINGS.NOT_ASKING_RATE);
    if (!!notAskingRate) this.showVoteScreen = false;
    // TODO showVoteScreen 1 day after user installed plugin
    else this.showVoteScreen = Utils.getRandomIntBetween(0, 10) % 2 == 0;
  },
  methods: {
    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      Utils.showSuccess(this, value + " copied to clipboard");
    },

    clipboardErrorHandler({ value, event }) {
      console.error("error", value);
    },

    backToMainPage() {
      this.$router.go(-1);
    },

    doNotAskRateAgain() {
      this.showVoteScreen = false;
      SLStorage.set(SLStorage.SETTINGS.NOT_ASKING_RATE, true);
    },
  },
  computed: {},
};
</script>
