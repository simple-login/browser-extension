<template>
  <div>
    <modal name="setting-modal" :adaptive="true" width="80%" height="auto">
      <div slot="top-right">
        <button @click="$modal.hide('setting-modal')">❌</button>
      </div>

      <div class="p-3">
        <div class="mb-2">
          If you self-host SimpleLogin, you can change the API URL to your
          server address.
        </div>
        <div class="mb-2">
          The default API URL is https://app.simplelogin.io
        </div>

        <div style="margin: auto">
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
    </modal>

    <div v-if="apiKey == ''" class="p-2 container">
      <h1 class="h5">
        Welcome to
        <a href="https://simplelogin.io" target="_blank">SimpleLogin ↗</a>, the
        most powerful email alias solution!
      </h1>

      <p>To get started, please follow these 3 simple steps:</p>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">1</span>
        Create your SimpleLogin account
        <a :href="apiUrl + '/auth/register'" target="_blank">here</a>
        if this is not already done.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">2</span>
        Create and copy your
        <em>API Key</em>
        <a :href="apiUrl + '/dashboard/api_key'" target="_blank">here</a>.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">3</span>
        Paste the
        <em>API Key</em> here 👇🏽
      </div>

      <input
        v-model="apiInput"
        v-on:keyup.enter="save"
        placeholder="API Key"
        autofocus
        class="form-control mt-3 w-100"
      />

      <button @click="save" class="btn btn-primary btn-block mt-2">
        Set API Key
      </button>

      <button
        @click="gotoSetting"
        class="mt-2 mb-2 btn btn-sm btn-outline-info float-right"
      >
        Settings
      </button>
    </div>
  </div>
</template>

<script>
  import Utils from './utils';

  export default {
    data() {
      return Utils.getInitialData();
    },
    async mounted() {
      await Utils.loadSavedSettings(this);
    },
    methods: {
      async save() {
        let that = this;
        if (this.apiInput === "") {
          that.showError("API Key cannot be empty");
          return;
        }
  
        chrome.storage.sync.set({ apiKey: this.apiInput }, function() {
          /*chrome.storage.sync.get("apiKey", function(data) {
            that.$toasted.show("API Key set successfully", { type: "success" });
            that.apiKey = data.apiKey;
          });*/
          Utils.broadcastSettingsChanged();
        });
      },
      showError(msg) {
        this.$toasted.show(msg, {
          type: "error",
          duration: 3000,
          action: {
            text: "x",
            onClick: (e, toastObject) => {
              toastObject.goAway(0);
            }
          }
        });
      },
      gotoSetting() {
        this.$modal.show("setting-modal");
      },
      async saveApiUrl() {
        let that = this;
        chrome.storage.sync.set({ apiUrl: that.apiUrl }, async function() {
          chrome.storage.sync.get("apiUrl", function(data) {
            that.$toasted.show("API URL saved successfully", { type: "success" });
            that.$modal.hide("setting-modal");
            that.apiUrl = data.apiUrl;

            Utils.broadcastSettingsChanged();
          });
        });
      },
    },
    computed: {}
  };
</script>