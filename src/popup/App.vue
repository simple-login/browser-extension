<template>
  <div class style="width: 470px;">
    <!-- Setting modal -->
    <modal name="setting-modal" :adaptive="true" width="80%" height="auto">
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
    </modal>
    <!-- END Setting modal -->

    <!-- MFA model-->
    <modal name="mfa-modal" :adaptive="true" width="60%" height="auto">
      <div class="p-3">
        <div class="mb-2">
          Your account is protected with Two Factor Authentication. <br />
        </div>

        <div>
          <b>Token</b>
          <p>
            Please enter the 2FA code from your 2FA authenticator
          </p>
        </div>

        <div style="margin: auto;">
          <input
            v-model="mfaCode"
            v-on:keyup.enter="submitMfaCode"
            placeholder="123456"
            autofocus
            class="form-control mt-3 w-100"
          />
          <button @click="submitMfaCode" class="btn btn-primary btn-block mt-2">
            Submit
          </button>
        </div>
      </div>
    </modal>
    <!-- END MFA model-->

    <!-- Header: icon, spinner, dashboard link -->
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
      <div class="col text-center">
        <b-spinner
          v-if="loading"
          class="text-center"
          type="grow"
          variant="primary"
          label="Spinning"
        ></b-spinner>
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
          >Dashboard ↗</a
        >
      </div>
    </div>
    <!-- END  Header: icon, spinner, dashboard link -->

    <!-- API Key Setup screen -->
    <modal name="api-key-modal" :adaptive="true" width="80%" height="auto">
      <div v-if="apiKey === ''" class="p-2 container">
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
      </div>
    </modal>
    <!-- END API Key Setup screen -->

    <!-- Login/register screen -->
    <div v-if="apiKey == ''" class="p-6 container" style="min-height: 350px;">
      <h1 class="h5 mb-3">
        Welcome to
        <a href="https://simplelogin.io" target="_blank">SimpleLogin ↗</a>, the
        most powerful email alias solution!
      </h1>

      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email</label>

          <input
            v-model="email"
            class="form-control"
            type="email"
            placeholder="Email"
            autofocus
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" class="form-control" />
        </div>

        <button class="btn btn-primary btn-block mt-2">
          Login
        </button>
      </form>

      <div class="text-center">
        <a
          href="https://app.simplelogin.io/auth/register"
          target="_blank"
          class="mt-2 btn btn-outline-success btn-block"
        >
          Sign Up ↗
        </a>
      </div>

      <div class="text-center">
        <button @click="showApiKeySetup" class="mt-2 btn btn-link text-center">
          Sign in with API Key
        </button>
      </div>
    </div>
    <!-- END Login/register screen -->

    <!-- API Key is set -->
    <div v-if="apiKey !== ''" class="mt-3">
      <!-- Alias option page -->
      <div v-if="!optionsReady && loading" class="container text-center">
        Please wait ...
      </div>

      <!-- Main Page -->
      <div v-if="optionsReady && newAlias == ''" class="container">
        <div v-if="hasRecommendation" class="text-center">
          <span class="text-success">{{ recommendation.alias }}</span>
          <button
            v-if="recommendation.alias"
            v-clipboard="() => recommendation.alias"
            v-clipboard:success="clipboardSuccessHandler"
            v-clipboard:error="clipboardErrorHandler"
            class="btn btn-success btn-sm"
          >
            Copy
          </button>
          <br />
          <div class="small-text">
            recommended, already used on this website.
          </div>

          <hr />
        </div>

        <p class="font-weight-bold mb-2">Email Alias</p>
        <div>
          <form @submit.prevent="createCustomAlias">
            <div class="row mb-2">
              <div class="col input-group-sm" style="padding-right: 0;">
                <input
                  v-model="aliasPrefix"
                  class="form-control"
                  pattern="[0-9a-z-_]{1,}"
                  title="Only letter, number, dash (-), underscore (_) can be used in alias prefix."
                  placeholder="Alias prefix"
                  autofocus
                  required
                />
              </div>

              <div
                class="col align-self-center input-group-sm"
                style="padding-left: 5px;"
              >
                <select v-model="signedSuffix" class="form-control">
                  <option
                    v-for="suffix in aliasSuffixes"
                    v-bind:key="suffix[0]"
                    :value="suffix[1]"
                  >
                    {{ suffix[0] }}
                  </option>
                </select>
              </div>
            </div>

            <div class="small-text mb-1" v-if="aliasPrefix">
              Alias is autofilled by the current website name, please feel free
              to change it.
            </div>

            <button
              :disabled="loading || !canCreate"
              class="btn btn-primary btn-block mt-2"
            >
              Create Alias
            </button>
          </form>
        </div>

        <div>
          <hr />
          <form @submit.prevent="createRandomAlias">
            <button
              :disabled="loading || !canCreate"
              class="btn btn-success btn-block mt-2"
            >
              Create Random Alias
            </button>
            <div class="small-text mb-1 text-center" v-if="aliasPrefix">
              Generate a totally random alias.
            </div>
          </form>
        </div>

        <div v-if="!canCreate">
          <p class="text-danger" style="font-size: 14px;">
            You have reached limit number of email aliases in free plan, please
            <a :href="apiUrl + '/dashboard/pricing'" target="_blank">upgrade</a>
            or reuse one of the existing aliases.
          </p>
        </div>
        <hr />

        <div v-if="existing.length > 0">
          <div class="mx-auto font-weight-bold text-center">
            Or use an existing alias
          </div>

          <div class="mx-auto" style="max-width: 60%;">
            <input
              v-model="aliasQuery"
              v-on:keyup.enter="loadAlias"
              class="form-control form-control-sm"
              placeholder="Search"
            />

            <div class="small-text mt-1">
              Type enter to search.
              <button
                v-if="aliasQuery"
                @click="resetSearch"
                class="float-right"
                style="color: blue; border: none; padding: 0; background: none;"
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <div v-for="alias in existing" v-bind:key="alias.id">
              <div class="p-2 my-2 border-top">
                <div class="d-flex">
                  <div class="flex-grow-1 mr-2 list-item-email">
                    <a
                      v-clipboard="() => alias.email"
                      v-clipboard:success="clipboardSuccessHandler"
                      v-clipboard:error="clipboardErrorHandler"
                      v-b-tooltip.hover
                      title="Click to Copy"
                      class="cursor"
                    >
                      {{ alias.email }}
                    </a>
                    <div class="list-item-email-fade" />
                  </div>
                  <div>
                    <button
                      v-if="alias"
                      v-clipboard="() => alias.email"
                      v-clipboard:success="clipboardSuccessHandler"
                      v-clipboard:error="clipboardErrorHandler"
                      class="btn btn-success btn-sm copy-btn"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div
                  v-if="alias.note"
                  class="font-weight-light"
                  style="font-size: 12px;"
                >
                  {{ alias.note }}
                </div>

                <div class="font-weight-lighter" style="font-size: 11px;">
                  {{ alias.nb_forward }} forwards, {{ alias.nb_reply }} replies,
                  {{ alias.nb_block }} blocks.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loadMoreAlias" class="text-secondary mx-auto text-center">
          Loading aliases ...
        </div>
      </div>
      <!-- END Main Page -->

      <!-- New Alias Page -->
      <div v-if="newAlias != ''" class="text-center">
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

        <button @click="backToOptionPage" class="btn btn-secondary mt-3">
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
      <!-- END New Alias Page -->

      <!-- Footer -->
      <hr />
      <div class="pt-0">
        <button @click="reset" class="btn btn-sm btn-link float-right">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import axios from "axios";

const DEFAULT_API = "https://app.simplelogin.io";

function getInitialData() {
  const isFirefox = typeof InstallTrigger !== "undefined",
    isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
    firefoxExtensionUrl =
      "https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/",
    chromeExtensionUrl =
      "https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn";
  const extensionUrl = isFirefox ? firefoxExtensionUrl : chromeExtensionUrl;
  return {
    loading: false,
    apiUrl: DEFAULT_API,

    email: "",
    password: "",

    // API key
    apiKey: "",
    apiInput: "",
    mfaKey: "",
    mfaCode: "",

    // hostName obtained from chrome tabs query
    hostName: "",

    // new alias is saved here: a new alias screen will be shown
    newAlias: "",

    // only show options when GET /alias/options returns
    optionsReady: false,

    // for recommendation section
    hasRecommendation: false,
    recommendation: {},

    // alias info
    aliasPrefix: "",
    signedSuffix: "",
    aliasSuffixes: [],
    canCreate: false,

    existing: [],

    aliasQuery: "",
    loadMoreAlias: false,

    extensionUrl: extensionUrl,

    notAskingRate: false,
    showVoteScreen: false,
  };
}

export default {
  data() {
    return getInitialData();
  },
  async mounted() {
    let that = this;
    chrome.storage.sync.get("apiKey", async function (data) {
      that.apiKey = data.apiKey || "";
      that.apiInput = that.apiKey || "";

      that.hostName = await that.getHostName();

      if (that.apiKey != "") that.getAliasOptions();
    });

    chrome.storage.sync.get("apiUrl", function (data) {
      that.apiUrl = data.apiUrl || DEFAULT_API;
    });

    chrome.storage.sync.get("notAskingRate", function (data) {
      that.notAskingRate = data.notAskingRate || false;
    });
  },
  methods: {
    async save() {
      let that = this;
      if (this.apiInput === "") {
        that.showError("API Key cannot be empty");
        return;
      }

      // check api key
      axios
        .get(that.apiUrl + "/api/user_info", {
          headers: { Authentication: that.apiInput },
        })
        .then((res) => {
          const userName = res.data.name || res.data.email;

          this.$toasted.show(`Hi ${userName}!`, {
            type: "success",
            duration: 2500,
          });

          that.setApiKey(that.apiInput);
        })
        .catch((err) => {
          that.showError("Incorrect API Key.");
        });
    },

    async setApiKey(apiKey) {
      const that = this;
      chrome.storage.sync.set({ apiKey: apiKey }, function () {
        chrome.storage.sync.get("apiKey", function (data) {
          that.apiKey = data.apiKey;

          that.getAliasOptions();
        });
      });
    },

    async reset() {
      let that = this;
      chrome.storage.sync.set(
        { apiKey: "", notAskingRate: false },
        async function () {
          that.apiKey = "";
          that.apiInput = "";
          that.notAskingRate = false;

          Object.assign(that.$data, getInitialData());
          that.hostName = await that.getHostName();
          chrome.storage.sync.get("apiUrl", function (data) {
            that.apiUrl = data.apiUrl || DEFAULT_API;
          });
        }
      );
    },
    async backToOptionPage() {
      this.newAlias = "";
      this.optionsReady = false;
      this.getAliasOptions();
    },

    getDeviceName() {
      const isFirefox = typeof InstallTrigger !== "undefined";
      return isFirefox ? "Firefox" : "Chrome";
    },

    async login() {
      axios
        .post(this.apiUrl + "/api/auth/login", {
          email: this.email,
          password: this.password,
          device: this.getDeviceName(),
        })
        .then((res) => {
          if (res.data.api_key) {
            const userName = res.data.name || res.data.email;

            this.$toasted.show(`Hi ${userName}!`, {
              type: "success",
              duration: 2500,
            });

            this.setApiKey(res.data.api_key);
          } else if (res.data.mfa_enabled) {
            this.mfaKey = res.data.mfa_key;
            this.$modal.show("mfa-modal");
          }
        })
        .catch((err) => {
          // FIDO
          if (err.response.status === 403) {
            this.showError(
              "WebAuthn/FIDO is not supported on browser extension yet, please use API Key to login"
            );
          } else {
            this.showError("Email or Password incorrect");
          }
        });
    },

    async submitMfaCode() {
      axios
        .post(this.apiUrl + "/api/auth/mfa", {
          mfa_token: this.mfaCode,
          mfa_key: this.mfaKey,
          device: this.getDeviceName(),
        })
        .then((res) => {
          this.$modal.hide("mfa-modal");

          const userName = res.data.name || res.data.email;
          this.$toasted.show(`Hi ${userName}!`, {
            type: "success",
            duration: 2500,
          });

          this.setApiKey(res.data.api_key);
        })
        .catch((err) => {
          this.showError("Incorrect MFA Code");
        });
    },

    async getAliasOptions() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        that.apiUrl + "/api/v4/alias/options?hostname=" + that.hostName,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey,
          },
        }
      );

      let json = await res.json();

      if (res.status == 401) {
        that.showError(
          "Invalid API Key. Please logout and re-setup the API Key"
        );
        that.loading = false;
        return;
      } else if (res.status >= 500) {
        that.showError("Unknown error. We are sorry for this inconvenience!");
        that.loading = false;
        return;
      }

      if (json.recommendation !== undefined) {
        that.hasRecommendation = true;
        that.recommendation = json.recommendation || {};
      }

      that.aliasSuffixes = json.suffixes;
      that.signedSuffix = that.aliasSuffixes[0][1];
      that.aliasPrefix = json.prefix_suggestion;
      that.canCreate = json.can_create;

      that.optionsReady = true;
      that.loading = false;

      await that.loadAlias();
    },

    async resetSearch() {
      this.aliasQuery = "";
      await this.loadAlias();
    },

    async loadAlias() {
      let that = this;
      that.existing = [];
      that.loadMoreAlias = true;

      let currentPage = 0;
      that.existing = await that.getAliases(currentPage, that.aliasQuery);
      that.loadMoreAlias = false;

      let allAliasesAreLoaded = false;

      window.onscroll = async function () {
        if (allAliasesAreLoaded)
          // nothing to do
          return;

        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight ===
          document.documentElement.offsetHeight;

        if (bottomOfWindow) {
          console.log("reach button, load more alias");
          currentPage += 1;

          that.loadMoreAlias = true;
          let newAliases = await that.getAliases(currentPage, that.aliasQuery);
          that.loadMoreAlias = false;

          allAliasesAreLoaded = newAliases.length === 0;
          that.existing = mergeAliases(that.existing, newAliases);
        }
      };
    },

    async getAliases(page, query) {
      let that = this;

      let res = await fetch(that.apiUrl + `/api/aliases?page_id=${page}`, {
        method: "POST",
        body: JSON.stringify({
          query: query,
        }),
        headers: {
          "Content-Type": "application/json",
          Authentication: this.apiKey,
        },
      });

      let json = await res.json();
      return json.aliases;
    },

    async createCustomAlias() {
      this.loading = true;

      axios
        .post(
          this.apiUrl + "/api/v2/alias/custom/new?hostname=" + this.hostName,
          { alias_prefix: this.aliasPrefix, signed_suffix: this.signedSuffix },
          {
            headers: { Authentication: this.apiKey },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            this.newAlias = res.data.alias;
            this.recomputeShowVoteScreen();
          } else {
            this.showError(res.data.error);
          }
        })
        .catch((err) => {
          // rate limit reached
          if (err.request.status === 429) {
            this.showError(
              "Rate limit exceeded - please wait 60s before creating new alias"
            );
          } else if (err.request.status === 409) {
            this.showError("Alias already chosen, please select another one");
          } else {
            this.showError("Unknown error");
          }
        })
        .then(() => {
          this.loading = false;
        });
    },

    async createRandomAlias() {
      this.loading = true;

      axios
        .post(
          this.apiUrl + "/api/alias/random/new?hostname=" + this.hostName,
          {},
          {
            headers: { Authentication: this.apiKey },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            this.newAlias = res.data.alias;
            this.recomputeShowVoteScreen();
          } else {
            this.showError(res.data.error);
          }
        })
        .catch((err) => {
          // rate limit reached
          if (err.request.status === 429) {
            this.showError(
              "Rate limit exceeded - please wait 60s before creating new alias"
            );
          } else {
            this.showError("Unknown error");
          }
        })
        .then(() => {
          this.loading = false;
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
          },
        },
      });
    },

    gotoSetting() {
      this.$modal.show("setting-modal");
    },

    showApiKeySetup() {
      this.$modal.show("api-key-modal");
    },

    async saveApiUrl() {
      let that = this;
      chrome.storage.sync.set({ apiUrl: that.apiUrl }, async function () {
        chrome.storage.sync.get("apiUrl", function (data) {
          that.$toasted.show("API URL saved successfully", { type: "success" });
          that.$modal.hide("setting-modal");
          that.apiUrl = data.apiUrl;
        });
      });
    },

    async doNotAskRateAgain() {
      let that = this;

      chrome.storage.sync.set({ notAskingRate: true }, function () {
        chrome.storage.sync.get("notAskingRate", function (data) {
          that.$toasted.show("Your preference has been saved", {
            type: "success",
          });
          that.notAskingRate = true;
          that.recomputeShowVoteScreen();
        });
      });
    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      this.$toasted.show(value + " copied to clipboard", {
        type: "success",
        duration: 2500,
      });
    },

    clipboardErrorHandler({ value, event }) {
      console.log("error", value);
    },

    async getHostName() {
      try {
        var result = await this.$browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        var url = new URL(result[0].url);
        return url.hostname;
      } catch (error) {
        console.log(error);
      }
    },

    recomputeShowVoteScreen() {
      if (this.notAskingRate) this.showVoteScreen = false;
      else this.showVoteScreen = getRandomInt(10) % 2 == 0;
    },
  },
  computed: {},
};

// merge newAliases into currentAliases. If conflict, keep the new one
function mergeAliases(currentAliases, newAliases) {
  // dict of aliasId and alias to speed up research
  let newAliasesDict = {};
  for (var i = 0; i < newAliases.length; i++) {
    let alias = newAliases[i];
    newAliasesDict[alias.id] = alias;
  }

  let ret = [];

  // keep track of added aliases
  let alreadyAddedId = {};
  for (var i = 0; i < currentAliases.length; i++) {
    let alias = currentAliases[i];
    if (newAliasesDict[alias.id]) ret.push(newAliasesDict[alias.id]);
    else ret.push(alias);

    alreadyAddedId[alias.id] = true;
  }

  for (var i = 0; i < newAliases.length; i++) {
    let alias = newAliases[i];
    if (!alreadyAddedId[alias.id]) {
      ret.push(alias);
    }
  }

  return ret;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
</script>

<style lang="scss" scoped>
em {
  font-style: normal;
  background-color: #ffff00;
}

.small-text {
  font-size: 12px;
  font-weight: lighter;
}

.copy-btn {
  font-size: 0.6rem;
  line-height: 0.75;
  position: absolute;
  right: 0;
  transform: translateX(-50%);
}
.cursor {
  cursor: pointer;
}

.list-item-email {
  margin-right: 40px !important;
  position: relative;
  overflow: hidden;
}

.list-item-email > a {
  white-space: nowrap;
}

.list-item-email-fade {
  right: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(to right, transparent, white);
  top: 0;
  position: absolute;
}
</style>
