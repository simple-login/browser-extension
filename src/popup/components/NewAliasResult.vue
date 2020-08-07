<template>
  <div class="content">
    <div class="p-2 container">
      <div class="m-2 p-2">
        <p class="font-weight-bold">Alias is created</p>
        <p>
          <a
            v-clipboard="() => newAliasData.alias"
            v-clipboard:success="clipboardSuccessHandler"
            v-clipboard:error="clipboardErrorHandler"
            v-b-tooltip.hover
            title="Click to Copy"
            class="cursor"
          >
            <span class="text-success">
              {{ newAliasData.alias }}
            </span>
          </a>
        </p>

        <alias-more-options
          :alias="newAliasData"
          :index="0"
          :show="true"
          :mailboxes="mailboxes"
          :prefillNote="prefillNote"
          btnSaveLabel="Save &amp; Back"
          @changed="backToMainPage"
          @deleted="backToMainPage"
        />

        <div
          class="mt-5 mx-auto bg-light p-3"
          v-if="showVoteScreen"
          style="max-width: 90%;"
        >
          If you are happy with SimpleLogin, please support us by rating the
          extension on the store. Thanks!

          <br />

          <a :href="extensionUrl" target="_blank" class="btn btn-primary mt-3">
            <font-awesome-icon icon="star" /> Rate Us
          </a>

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
import AliasMoreOptions from "./AliasMoreOptions";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

export default {
  components: {
    "alias-more-options": AliasMoreOptions,
  },
  data() {
    return {
      mailboxes: SLStorage.getTemporary("userMailboxes"),
      newAliasData: SLStorage.getTemporary("newAliasData"),
      showVoteScreen: false,
      extensionUrl: Utils.getExtensionURL(),
      prefillNote: "",
    };
  },
  async mounted() {
    this.newAlias = this.$route.params.email;
    this.prefillNote = `Used on ${await Utils.getHostName()}`;
    let notAskingRate = await SLStorage.get(SLStorage.SETTINGS.NOT_ASKING_RATE);
    if (!!notAskingRate) this.showVoteScreen = false;
    // TODO showVoteScreen 1 day after user installed plugin
    else this.showVoteScreen = Utils.getRandomIntBetween(0, 10) % 2 === 0;
  },
  methods: {
    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      Utils.showSuccess(value + " copied to clipboard");
    },

    clipboardErrorHandler({ value, event }) {
      console.error("error", value);
    },

    async backToMainPage() {
      Navigation.navigateTo(Navigation.PATH.MAIN);
    },

    doNotAskRateAgain() {
      this.showVoteScreen = false;
      SLStorage.set(SLStorage.SETTINGS.NOT_ASKING_RATE, true);
    },
  },
  computed: {},
};
</script>
