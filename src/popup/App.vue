<template>
  <div class="container" style="width: 400px">
    <div class="text-center mt-3">
      <a href="https://www.simplelogin.io" target="_blank">
        <img src="/images/horizontal-logo.svg" />
      </a>
      <hr>
    </div>

    <!-- No API Key set -->
    <div v-if="apiKey == ''" class="p-2">
      <h1 class="h5">Welcome to the most powerful email alias solution!</h1>

      <p>To get started, please follow these 3 simple steps</p>

      <div>
        <span class="badge badge-primary badge-pill">1</span>
        Create a SimpleLogin account
        <a href="https://app.simplelogin.io/auth/register" target="_blank">here</a>
        if this is not already done.
      </div>

      <div>
        <span class="badge badge-primary badge-pill">2</span>
        Create and copy your <em>API Key</em>
        <a href="https://app.simplelogin.io/dashboard/api_key" target="_blank">here</a>.
      </div>

      <div>
        <span class="badge badge-primary badge-pill">3</span>
        Paste the <em>API Key</em> here 👇🏽
      </div>

      <textarea v-model="apiInput" placeholder="API Key" class="form-control mt-3" style="width: 100%"></textarea>
      <br />
      <button @click="save" class="btn btn-primary">Save</button>
    </div>

    <!-- API Key is set -->
    <div v-else>
      <button @click="getAlias" class="btn btn-primary mb-3">Create Alias</button>
      
      <input v-model="alias" disabled class="form-control mb-3" placeholder="New alias will be created here" />

      <p v-if="error != ''" class="text-danger">{{error}}</p>

      <button
        v-if="alias != ''"
        v-clipboard="() => alias"
        v-clipboard:success="clipboardSuccessHandler"
        v-clipboard:error="clipboardErrorHandler"
        class="btn btn-success"
      >Copy to clipboard</button>

      <hr/>
      <button @click="reset" class="btn btn-sm btn-link float-right">Logout</button>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  data() {
    return {
      apiKey: "",
      apiInput: "",
      alias: "",
      hostName: "",
      error:""
    };
  },
  async mounted() {
    let that = this;
    chrome.storage.sync.get("apiKey", function(data) {
      that.apiKey = data.apiKey;
      that.apiInput = that.apiKey;
    });
    this.hostName = await this.getHostName();
  },
  methods: {
    save() {
      let that = this;
      if (this.apiInput === "") {
        that.$toasted.show("API Key cannot be empty");
        return;
      }

      chrome.storage.sync.set({ apiKey: this.apiInput }, function() {
        chrome.storage.sync.get("apiKey", function(data) {
          that.$toasted.show("API Key saved successfully");
          that.apiKey = data.apiKey;
        });
      });
    },
    reset() {
      let that = this;
      chrome.storage.sync.set({ apiKey: "" }, function() {
        that.apiKey = "";
        that.apiInput = "";
      });
    },
    async getAlias() {
      let that = this;
      
      let res = await fetch("https://app.simplelogin.io/api/alias/new", {
        method: "POST",
        body: JSON.stringify({
          hostname: this.hostName
        }),
        headers: {
          "Content-Type": "application/json",
          Authentication: this.apiKey
        }
      });

      let json = await res.json();
      if (res.status >= 200 && res.status <= 299) {
        that.alias = json.alias;
      } else {
        // error
        if (res.status == 401) { // Wrong api key
          that.error = "Wrong API Key. Please logout and copy/paste the API Key again"
        } else { // Unknown error
          that.error = "Unknown error, very sorry about this! Please logout and redo the setup"
        }
      }

    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      this.$toasted.show("Copied to clipboard", { type: "success" });
    },

    clipboardErrorHandler({ value, event }) {
      console.log("error", value);
    },

    async getHostName() {
      try {
        var result = await this.$browser.tabs.query({
          active: true,
          currentWindow: true
        });
        var url = new URL(result[0].url);
        return url.hostname;
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
