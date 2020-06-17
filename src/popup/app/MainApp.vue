<template>
  <div class style="width: 450px">
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
