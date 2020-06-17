<template>
  <div class style="width: 450px">
    <!-- App bar -->
    <div class="row mt-2 pb-2" style="border-bottom: 1px #eee solid">
      <div class="col ml-3">
        <a href="https://www.simplelogin.io" target="_blank">
          <img
            src="/images/horizontal-logo.svg"
            class="mx-auto"
            style="max-width: 100px"
          />
        </a>
      </div>
      <div class="col text-center">
        <b-spinner
          v-if="loading"
          class="text-center"
          type="grow"
          variant="primary"
          label="Spinning"
        ></b-spinner>
      </div>

      <div class="col mr-2">
        <a
          :href="apiUrl + '/dashboard/'"
          target="_blank"
          class="btn btn-sm btn-outline-success float-right"
          >Dashboard ↗</a
        >
      </div>
    </div>

    <!-- No API Key set: Setup screen -->
    <setup-wizard v-if="!apiKey"></setup-wizard>

    <!-- API Key is set -->
    <simple-login v-else></simple-login>
  </div>
</template>

<script>
  import Vue from 'vue';
  import 'bootstrap/dist/css/bootstrap.css';
  import 'bootstrap-vue/dist/bootstrap-vue.css';
  import './styles.scss';
  import Utils from './utils';
  import SimpleLogin from './SimpleLogin';
  import SetupWizard from './SetupWizard';

  Vue.component('simple-login', SimpleLogin);
  Vue.component('setup-wizard', SetupWizard);

  export default {
    data() {
      return Utils.getInitialData();
    },
    async mounted() {
      Utils.loadSavedSettings(this);

      Utils.listenSettingsChanged(() => {
        Utils.loadSavedSettings(this);
      });
    },
    methods: {
      async saveApiUrl() {
        let that = this;
        chrome.storage.sync.set({ apiUrl: that.apiUrl }, async function() {
          chrome.storage.sync.get("apiUrl", function(data) {
            that.$toasted.show("API URL saved successfully", { type: "success" });
            that.$modal.hide("setting-modal");
            that.apiUrl = data.apiUrl;
          });
        });
      },
    },
  };
</script>
