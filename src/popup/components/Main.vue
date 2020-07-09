<template>
  <div class="content">
    <v-dialog />

    <!-- Main Page -->
    <div class="container">
      <div v-if="recommendation.show" class="text-center">
        <div class="flex-grow-1">
          <a
            v-clipboard="() => recommendation.alias"
            v-clipboard:success="clipboardSuccessHandler"
            v-clipboard:error="clipboardErrorHandler"
            v-b-tooltip.hover
            title="Click to Copy"
            class="cursor"
          >
            <span class="text-success">{{ recommendation.alias }}</span>
          </a>
        </div>
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
                :disabled="loading || !canCreate"
                autofocus
                required
              />
            </div>

            <div
              class="col align-self-center input-group-sm"
              style="padding-left: 5px;"
            >
              <select
                v-model="signedSuffix"
                class="form-control"
                :disabled="loading || !canCreate"
              >
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
            Alias is autofilled by the current website name, please feel free to
            change it.
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

      <div>
        <div class="mx-auto font-weight-bold text-center">
          Or use an existing alias
        </div>

        <div class="mx-auto" style="max-width: 60%;">
          <input
            v-model="searchString"
            v-on:keyup.enter="loadAlias"
            class="form-control form-control-sm"
            placeholder="Search"
          />

          <div class="small-text mt-1">
            Type enter to search.
            <button
              v-if="searchString"
              @click="resetSearch"
              class="float-right"
              style="color: blue; border: none; padding: 0; background: none;"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- list alias -->
        <div v-if="aliasArray.length > 0">
          <div v-for="(alias, index) in aliasArray" v-bind:key="alias.id">
            <div class="p-2 my-2 border-top">
              <div class="d-flex">
                <div class="flex-grow-1 list-item-email">
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
                <div style="white-space: nowrap;">
                  <img
                    src="/images/icon-copy.svg"
                    v-if="alias"
                    v-clipboard="() => alias.email"
                    v-clipboard:success="clipboardSuccessHandler"
                    v-clipboard:error="clipboardErrorHandler"
                    class="btn-svg"
                  />

                  <img
                    src="/images/icon-dropdown.svg"
                    v-if="alias"
                    v-bind:style="{
                      transform:
                        moreOptions.index === index ? 'rotate(180deg)' : '',
                    }"
                    v-on:click="toggleMoreOptions(index)"
                    class="btn-svg"
                  />
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

              <div class="more-options" v-if="moreOptions.index === index">
                <div
                  class="btn btn-delete"
                  v-on:click="handleClickDelete(index)"
                  v-bind:disabled="moreOptions.loading"
                >
                  <img src="/images/icon-trash.svg" />
                  <span style="color: #dc3545;">Delete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasLoadMoreAlias" class="text-secondary mx-auto text-center">
        <img
          src="/images/loading-three-dots.svg"
          style="width: 80px; margin: 20px;"
        />
      </div>
    </div>
    <!-- END Main Page -->
  </div>
</template>

<script>
import Utils from "../Utils";
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import axios from "axios";

export default {
  data() {
    return {
      apiUrl: "",
      apiKey: "",
      loading: true,

      // variables for creating alias
      hostName: "", // hostName obtained from chrome tabs query
      canCreate: true,
      aliasSuffixes: [],
      aliasPrefix: "",
      signedSuffix: "",
      recommendation: {
        show: false,
        alias: "",
      },

      // variables for searching alias
      searchString: "",
      aliasArray: [], // array of existing alias
      hasLoadMoreAlias: true,
      moreOptions: {
        index: -1,
        loading: false,
      },
    };
  },
  async mounted() {
    this.hostName = await Utils.getHostName();
    this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);

    await this.getAliasOptions();
  },
  methods: {
    async getAliasOptions() {
      this.loading = true;

      let res = await fetch(
        this.apiUrl + "/api/v4/alias/options?hostname=" + this.hostName,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey,
          },
        }
      );

      let json = await res.json();

      if (res.status === 401) {
        Utils.showError(
          this,
          "Invalid API Key. Please logout and re-setup the API Key"
        );
        await SLStorage.remove(SLStorage.SETTINGS.API_KEY);
        EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
        Navigation.navigateTo(Navigation.PATH.LOGIN);
        return;
      } else if (res.status >= 500) {
        Utils.showError(
          this,
          "Unknown error. We are sorry for this inconvenience!"
        );
        this.loading = false;
        return;
      }

      if (json.recommendation) {
        this.recommendation.show = true;
        this.recommendation.alias = json.recommendation.alias;
      }

      this.aliasSuffixes = json.suffixes;
      this.signedSuffix = this.aliasSuffixes[0][1];
      this.aliasPrefix = json.prefix_suggestion;
      this.canCreate = json.can_create;

      this.optionsReady = true;
      this.loading = false;

      await this.loadAlias();
    },

    async loadAlias() {
      this.aliasArray = [];
      this.hasLoadMoreAlias = true;
      this.toggleMoreOptions(-1); // reset more options index

      let currentPage = 0;
      this.aliasArray = await this.getAliases(currentPage, this.searchString);
      this.hasLoadMoreAlias = this.aliasArray.length > 0;

      let allAliasesAreLoaded = false;

      let that = this;
      window.onscroll = async function () {
        if (allAliasesAreLoaded)
          // nothing to do
          return;

        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight >
          document.documentElement.offsetHeight - 200;

        if (bottomOfWindow) {
          currentPage += 1;

          that.hasLoadMoreAlias = true;
          let newAliases = await that.getAliases(
            currentPage,
            that.searchString
          );
          that.hasLoadMoreAlias = false;

          allAliasesAreLoaded = newAliases.length === 0;
          that.aliasArray = mergeAliases(that.aliasArray, newAliases);
        }
      };
    },

    async getAliases(page, query) {
      let res = await fetch(this.apiUrl + `/api/aliases?page_id=${page}`, {
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

    async resetSearch() {
      this.searchString = "";
      await this.loadAlias();
    },

    async createCustomAlias() {
      if (this.loading) return;
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
            let path = Navigation.PATH.NEW_ALIAS_RESULT.replace(
              ":email",
              encodeURIComponent(res.data.alias)
            );
            Navigation.navigateTo(path, true);
          } else {
            Utils.showError(this, res.data.error);
          }
        })
        .catch((err) => {
          // rate limit reached
          if (err.request.status === 429) {
            Utils.showError(
              this,
              "Rate limit exceeded - please wait 60s before creating new alias"
            );
          } else if (err.request.status === 409) {
            Utils.showError(
              this,
              "Alias already chosen, please select another one"
            );
          } else {
            Utils.showError(this, "Unknown error");
          }
        })
        .then(() => {
          this.loading = false;
        });
    },

    async createRandomAlias() {
      if (this.loading) return;
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
            let path = Navigation.PATH.NEW_ALIAS_RESULT.replace(
              ":email",
              encodeURIComponent(res.data.alias)
            );
            Navigation.navigateTo(path, true);
          } else {
            Utils.showError(this, res.data.error);
          }
        })
        .catch((err) => {
          // rate limit reached
          if (err.request.status === 429) {
            Utils.showError(
              this,
              "Rate limit exceeded - please wait 60s before creating new alias"
            );
          } else {
            Utils.showError(this, "Unknown error");
          }
        })
        .then(() => {
          this.loading = false;
        });
    },

    // More options
    toggleMoreOptions(index) {
      if (this.moreOptions.index !== -1) {
        this.moreOptions.index =
          this.moreOptions.index !== index
            ? index // show more options for another alias
            : -1; // hide more options
      } else {
        this.moreOptions.index = index;
      }
      this.moreOptions.loading = false;
    },
    handleClickDelete(index) {
      this.$modal.show("dialog", {
        title: `Delete ${this.aliasArray[index].email}`,
        text: "Do you really want to delete this alias?",
        buttons: [
          {
            title: "Yes",
            handler: () => {
              this.$modal.hide("dialog");
              this.deleteAlias(index);
            },
          },
          {
            title: "No",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
        ],
      });
    },
    async deleteAlias(index) {
      this.moreOptions.loading = true;
      axios
        .delete(
          this.apiUrl + "/api/aliases/" + this.aliasArray[index].id,
          {},
          {
            headers: { Authentication: this.apiKey },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            this.aliasArray.splice(index, 1);
            this.toggleMoreOptions(-1);
          } else {
            Utils.showError(this, res.data.error);
          }
        })
        .catch((err) => {
          Utils.showError(this, "Unknown error");
        })
        .then(() => {
          this.moreOptions.loading = false;
        });
    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      Utils.showSuccess(this, value + " copied to clipboard");
    },

    clipboardErrorHandler({ value, event }) {
      console.error("error", value);
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
</script>
