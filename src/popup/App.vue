<template>
  <div style="width: 300px">
    <div v-if="apiKey == ''">
      <textarea v-model="apiInput" placeholder="API Key" style="width: 100%"></textarea>
      <br />
      <button @click="save">Save</button>
    </div>
    <div v-else>
      <button @click="getAlias" style="margin-top: 10px">Create Alias</button>
      <br />
      <input v-model="alias" disabled style="width: 100%" />
      <button
        v-if="alias != ''"
        v-clipboard="() => alias"
        v-clipboard:success="clipboardSuccessHandler"
        v-clipboard:error="clipboardErrorHandler"
      >Copy to clipboard</button>

      <hr style="margin-top: 30px"/>
      <button @click="reset" >Logout</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiKey: "",
      apiInput: "",
      alias: "",
      hostName: ""
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

      if (res.ok) {
        let json = await res.json();
        that.alias = json.alias;
      }
    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      this.$toasted.show("Copied to clipboard", { theme: "bubble" });
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
