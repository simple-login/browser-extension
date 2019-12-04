<template>
  <div class="container" style="width: 400px">
    <div class="text-center mt-2" v-if="loading">
      <b-spinner type="grow" label="Spinning"></b-spinner>
    </div>

    <div class="text-center mt-3">
      <a href="https://www.simplelogin.io" target="_blank">
        <img src="/images/horizontal-logo.svg" />
      </a>
      <hr />
    </div>

    <!-- No API Key set: Setup screen -->
    <div v-if="apiKey == ''" class="p-2">
      <h1 class="h5">Welcome to the most powerful email alias solution!</h1>

      <p>To get started, please follow these 3 simple steps</p>

      <div>
        <span class="badge badge-primary badge-pill">1</span>
        Create a SimpleLogin account
        <a
          href="https://app.simplelogin.io/auth/register"
          target="_blank"
        >here</a>
        if this is not already done.
      </div>

      <div>
        <span class="badge badge-primary badge-pill">2</span>
        Create and copy your
        <em>API Key</em>
        <a href="https://app.simplelogin.io/dashboard/api_key" target="_blank">here</a>.
      </div>

      <div>
        <span class="badge badge-primary badge-pill">3</span>
        Paste the
        <em>API Key</em> here 👇🏽
      </div>

      <textarea v-model="apiInput" placeholder="API Key" autofocus class="form-control mt-3 w-100"></textarea>
      <br />
      <button @click="save" class="btn btn-primary">Save</button>
    </div>

    <!-- API Key is set -->
    <div v-else>
      <div v-if="optionsReady && newAlias == ''">
        <div v-if="hasRecommendation">
          {{ recommendation.alias }}
          <br />
          recommended, already used on this website
          {{ recommendation.hostname }}
          <hr />
        </div>

        <div v-if="canCreateCustom">
          <input v-model="aliasPrefix" />
          <br />
          <div>autofilled by the website domain, feel free to change it</div>

          <select v-model="aliasSuffix">
            <option v-for="suffix in custom.suffixes" v-bind:key="suffix">{{ suffix }}</option>
          </select>
          <button @click="createCustomAlias" :disabled="loading">Create custom alias</button>

          <hr />
        </div>
        <div v-else>
          <p class="text-danger">
            you have used all 3 custom aliases in free plan, please upgrade to
            create more
          </p>
          <hr />
        </div>

        <div v-if="canCreateRandom">
          <button @click="createRandomAlias" :disabled="loading">Create random alias</button>
          <hr />
        </div>
        <div v-else>
          <p class="text-danger">
            you have used all 3 random aliases in free plan, please upgrade to
            create more
          </p>
          <hr />
        </div>

        <div v-if="existing.length > 0">
          <div v-for="alias in existing" v-bind:key="alias">{{ alias }}</div>
        </div>
      </div>

      <div v-if="newAlias != ''">
        Alias is created:
        {{ newAlias }}
      </div>

      <!-- Footer -->
      <hr />
      <a
        href="https://app.simplelogin.io/dashboard/"
        target="_blank"
        class="btn btn-sm btn-link float-left"
      >Manage Aliases</a>
      <button @click="reset" class="btn btn-sm btn-link float-right">Logout</button>
      <br />
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// TODO: change API
const API = "http://localhost:7777/api";

function getInitialData() {
  return {
    loading: false,

    // API key
    apiKey: "",
    apiInput: "",

    // hostName obtained from chrome tabs query
    hostName: "",

    // new alias is saved here: a new alias screen will be shown
    newAlias: "",

    // only show options when GET /alias/options returns
    optionsReady: false,

    // for recommendation section
    hasRecommendation: false,
    recommendation: {},

    // for custom
    custom: {},
    aliasPrefix: "",
    aliasSuffix: "",

    canCreateCustom: false,
    canCreateRandom: false,

    existing: []
  };
}

export default {
  data() {
    return getInitialData();
  },
  async mounted() {
    let that = this;
    chrome.storage.sync.get("apiKey", async function(data) {
      that.apiKey = data.apiKey || "";
      that.apiInput = that.apiKey || "";

      that.hostName = await that.getHostName();

      if (that.apiKey != "") that.getAliasOptions();
    });
  },
  methods: {
    async save() {
      let that = this;
      if (this.apiInput === "") {
        that.$toasted.show("API Key cannot be empty");
        return;
      }

      chrome.storage.sync.set({ apiKey: this.apiInput }, function() {
        chrome.storage.sync.get("apiKey", function(data) {
          that.$toasted.show("API Key saved successfully");
          that.apiKey = data.apiKey;

          that.getAliasOptions();
        });
      });
    },
    async reset() {
      let that = this;
      chrome.storage.sync.set({ apiKey: "" }, async function() {
        that.apiKey = "";
        that.apiInput = "";

        Object.assign(that.$data, getInitialData());
        that.hostName = await that.getHostName();
      });
    },
    async getAliasOptions() {
      let that = this;

      let res = await fetch(API + "/alias/options?hostname=" + that.hostName, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authentication: this.apiKey
        }
      });

      let json = await res.json();
      console.log(json);

      if (json.recommendation !== undefined) {
        that.hasRecommendation = true;
        that.recommendation = json.recommendation || {};
      }

      if (json.custom !== undefined) {
        that.custom = json.custom;
        that.aliasPrefix = that.custom.suggestion;
        that.aliasSuffix = that.custom.suffixes[0];
      }

      that.canCreateCustom = json.can_create_custom;
      that.canCreateRandom = json.can_create_random;
      that.existing = json.existing;

      that.optionsReady = true;
    },

    async createCustomAlias() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        API + "/alias/custom/new?hostname=" + that.hostName,
        {
          method: "POST",
          body: JSON.stringify({
            alias_prefix: that.aliasPrefix,
            alias_suffix: that.aliasSuffix
          }),
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        }
      );

      let json = await res.json();
      that.loading = false;
      if (res.status == 201) {
        that.newAlias = json.alias;
      } else {
        that.showError(json.error);
      }
    },

    async createRandomAlias() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        API + "/alias/random/new?hostname=" + that.hostName,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        }
      );

      let json = await res.json();
      that.loading = false;
      if (res.status == 201) {
        that.newAlias = json.alias;
      } else {
        that.showError(json.error);
      }
    },

    showError(msg) {
      this.$toasted.show(msg, {
        type: "error",
        duration: null,
        action: {
          text: "x",
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        }
      });
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

em {
  font-style: normal;
  background-color: #ffff00;
}
</style>
