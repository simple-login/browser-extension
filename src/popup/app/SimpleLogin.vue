<template>
  <div class="mt-3">
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
            <div class="col input-group-sm" style="padding-right: 0">
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
              style="padding-left: 5px"
            >
              <select v-model="signedSuffix" class="form-control">
                <option v-for="suffix in aliasSuffixes" v-bind:key="suffix[0]" :value="suffix[1]">
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
        <p class="text-danger" style="font-size: 14px">
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

        <div class="mx-auto" style="max-width: 60%">
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
              style="color: blue; border: none; padding: 0, background: none"
            >
              Reset
            </button>
          </div>
        </div>

        <div>
          <div v-for="alias in existing" v-bind:key="alias.id">
            <div class="p-2 my-2 border-top">
              <div class="d-flex">
                <div class="flex-grow-1 mr-2">
                  <a
                    v-clipboard="() => alias.email"
                    v-clipboard:success="clipboardSuccessHandler"
                    v-clipboard:error="clipboardErrorHandler"
                    v-b-tooltip.hover
                    title="Click to Copy"
                    class="cursor"
                    >{{ alias.email | truncate(50, "...") }}</a
                  >
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
                style="font-size: 12px"
              >
                {{ alias.note }}
              </div>

              <div class="font-weight-lighter" style="font-size: 11px">
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
        style="max-width: 80%"
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
</template>

<script>
  import Utils from './utils';

  export default {
    data() {
      return Utils.getInitialData();
    },
    async mounted() {
      await Utils.loadSavedSettings(this);
      if (this.apiKey !== "") this.getAliasOptions();
    },
    methods: {
      async reset() {
        let that = this;
        chrome.storage.sync.set(
          { apiKey: "", notAskingRate: false },
          async function() {
            that.apiKey = "";
            that.apiInput = "";
            that.notAskingRate = false;
  
            Object.assign(that.$data, Utils.getInitialData());
            that.hostName = await Utils.getHostName();
            that.apiUrl = (await Utils.getStoredItem("apiUrl")) || Utils.getDefautAPI();
            Utils.broadcastSettingsChanged();
          }
        );
      },
      async backToOptionPage() {
        this.newAlias = "";
        this.optionsReady = false;
        this.getAliasOptions();
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
              Authentication: this.apiKey
            }
          }
        );
  
        let json = await res.json();
  
        if (res.status == 401) {
          that.showError(
            "Invalid API Key. Please logout and re-setup the API Key"
          );
          that.loading = false;
          that.reset();
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
  
        that.loadAlias();
      },
  
      async resetSearch() {
        this.aliasQuery = "";
        this.loadAlias();
      },
  
      async loadAlias() {
        let that = this;
        that.existing = [];
        that.loadMoreAlias = true;
  
        let currentPage = 0;
        that.existing = await that.getAliases(currentPage, that.aliasQuery);
        that.loadMoreAlias = false;
  
        let allAliasesAreLoaded = false;
  
        window.onscroll = async function() {
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
            query: query
          }),
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        });
  
        let json = await res.json();
        return json.aliases;
      },
  
      async createCustomAlias() {
        let that = this;
        that.loading = true;
  
        let res = await fetch(
          that.apiUrl + "/api/v2/alias/custom/new?hostname=" + that.hostName,
          {
            method: "POST",
            body: JSON.stringify({
              alias_prefix: that.aliasPrefix,
              signed_suffix: that.signedSuffix
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
          that.recomputeShowVoteScreen();
        } else {
          that.showError(json.error);
        }
      },
  
      async createRandomAlias() {
        let that = this;
        that.loading = true;
  
        let res = await fetch(
          that.apiUrl + "/api/alias/random/new?hostname=" + that.hostName,
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
          that.recomputeShowVoteScreen();
        } else {
          that.showError(json.error);
        }
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
  
      async doNotAskRateAgain() {
        let that = this;
  
        chrome.storage.sync.set({ notAskingRate: true }, function() {
          chrome.storage.sync.get("notAskingRate", function(data) {
            that.$toasted.show("Your preference has been saved", {
              type: "success"
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
          duration: 2500
        });
      },
  
      clipboardErrorHandler({ value, event }) {
        console.log("error", value);
      },

      recomputeShowVoteScreen() {
        if (this.notAskingRate) this.showVoteScreen = false;
        else this.showVoteScreen = getRandomInt(10) % 2 == 0;
      }
    },
    computed: {}
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