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

      <div>
        <p
          class="font-weight-bold mt-2 align-self-center"
          style="display: inline-block;"
        >
          New Alias
        </p>

        <button
          :disabled="loading || !canCreate"
          style="margin-left: 15px;"
          class="btn btn-outline-primary btn-sm"
          title="Generate a totally random alias."
          @click="createRandomAlias"
          v-b-tooltip.hover
        >
          <font-awesome-icon icon="random" /> Random
        </button>
      </div>

      <div class="small-text mb-1" v-if="aliasPrefix">
        Alias is autofilled by the current website name, please feel free to
        change it.
      </div>

      <div>
        <form @submit.prevent="createCustomAlias">
          <div class="row mb-2">
            <div
              class="col align-self-center input-group-sm"
              style="padding-right: 0;"
            >
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
              style="padding-left: 5px; padding-right: 5px;"
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

            <button
              :disabled="loading || !canCreate"
              style="margin-right: 15px;"
              class="btn btn-primary btn-sm align-self-center"
            >
              Create
            </button>
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

      <div v-if="aliasArray.length > 0 || searchString !== ''">
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
            <div
              class="p-2 my-2 border-top list-item-alias"
              v-bind:class="{ disabled: !alias.enabled }"
            >
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
                  <toggle-button
                    :value="alias.enabled"
                    color="#b02a8f"
                    :width="30"
                    :height="18"
                    @change="toggleAlias(alias)"
                  />

                  <img
                    src="/images/icon-dropdown.svg"
                    v-if="alias"
                    v-bind:style="{
                      transform: alias.moreOptions ? 'rotate(180deg)' : '',
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

              <div class="more-options" v-if="alias.moreOptions">
                <div
                  class="btn btn-sm btn-delete"
                  style="color: #dc3545;"
                  v-on:click="handleClickDelete(index)"
                  v-bind:disabled="alias.moreOptions.loading"
                >
                  <font-awesome-icon icon="trash" />
                  Delete
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
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

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

      // variables for list alias
      isFetchingAlias: true,
      searchString: "",
      aliasArray: [], // array of existing alias
      hasLoadMoreAlias: true,
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

      const res = await callAPI(
        API_ROUTE.GET_ALIAS_OPTIONS,
        {
          hostname: this.hostName,
        },
        API_ON_ERR.TOAST
      );
      const json = res.data;

      if (json.recommendation) {
        this.recommendation.show = true;
        this.recommendation.alias = json.recommendation.alias;
      }

      this.aliasSuffixes = json.suffixes;
      this.signedSuffix = this.aliasSuffixes[0][1];
      this.aliasPrefix = json.prefix_suggestion;
      this.canCreate = json.can_create;

      this.loading = false;

      await this.loadAlias();
    },

    async loadAlias() {
      this.aliasArray = [];
      this.hasLoadMoreAlias = true;

      let currentPage = 0;
      this.aliasArray = await this.fetchAlias(currentPage, this.searchString);
      this.hasLoadMoreAlias = this.aliasArray.length > 0;

      let allAliasesAreLoaded = false;

      let that = this;
      window.onscroll = async function () {
        if (that.isFetchingAlias || allAliasesAreLoaded) return;

        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight >
          document.documentElement.offsetHeight - 200;

        if (bottomOfWindow) {
          currentPage += 1;

          that.hasLoadMoreAlias = true;
          let newAliases = await that.fetchAlias(
            currentPage,
            that.searchString
          );
          that.hasLoadMoreAlias = false;

          allAliasesAreLoaded = newAliases.length === 0;
          that.aliasArray = mergeAliases(that.aliasArray, newAliases);
        }
      };
    },

    async fetchAlias(page, query) {
      this.isFetchingAlias = true;
      try {
        const { data } = await callAPI(API_ROUTE.GET_ALIASES, {
          page_id: page,
        });
        this.isFetchingAlias = false;
        return data.aliases;
      } catch (e) {
        Utils.showError("Cannot fetch list alias");
        this.isFetchingAlias = false;
        return [];
      }
    },

    async resetSearch() {
      this.searchString = "";
      await this.loadAlias();
    },

    async createCustomAlias() {
      if (this.loading) return;
      this.loading = true;

      try {
        const res = await callAPI(
          API_ROUTE.NEW_ALIAS,
          {
            hostname: this.hostName,
          },
          {
            alias_prefix: this.aliasPrefix,
            signed_suffix: this.signedSuffix,
          }
        );

        if (res.status === 201) {
          SLStorage.setTemporary('newAliasData', res.data);
          Navigation.navigateTo(Navigation.PATH.NEW_ALIAS_RESULT, true);
        } else {
          Utils.showError(res.data.error);
        }
      } catch (err) {
        // rate limit reached
        if (err.request.status === 429) {
          Utils.showError(
            "Rate limit exceeded - please wait 60s before creating new alias"
          );
        } else if (err.request.status === 409) {
          Utils.showError("Alias already chosen, please select another one");
        } else if (err.request.status === 412) {
          // can happen when the alias creation time slot is expired,
          // i.e user waits for too long before creating the alias
          Utils.showError(err.response.data.error);

          // get new aliasSuffixes
          this.getAliasOptions();
        } else {
          Utils.showError("Unknown error");
        }
      }

      this.loading = false;
    },

    async createRandomAlias() {
      if (this.loading) return;
      this.loading = true;

      try {
        const res = await callAPI(
          API_ROUTE.NEW_RANDOM_ALIAS,
          {
            hostname: this.hostName,
          },
          {}
        );

        if (res.status === 201) {
          SLStorage.setTemporary('newAliasData', res.data);
          Navigation.navigateTo(Navigation.PATH.NEW_ALIAS_RESULT, true);
        } else {
          Utils.showError(res.data.error);
        }
      } catch (err) {
        // rate limit reached
        if (err.request.status === 429) {
          Utils.showError(
            "Rate limit exceeded - please wait 60s before creating new alias"
          );
        } else {
          Utils.showError("Unknown error");
        }
      }

      this.loading = false;
    },
    async toggleAlias(alias) {
      const lastState = alias.enabled;
      alias.loading = true;
      const res = await callAPI(
        API_ROUTE.TOGGLE_ALIAS,
        {
          alias_id: alias.id,
        },
        {},
        API_ON_ERR.TOAST
      );

      if (res) {
        alias.enabled = res.data.enabled;
        Utils.showSuccess(
          alias.email + " is " + (alias.enabled ? "enabled" : "disabled")
        );
      } else {
        alias.enabled = lastState;
      }

      alias.loading = false;
    },

    // More options
    toggleMoreOptions(index) {
      const alias = this.aliasArray[index];
      this.$set(this.aliasArray, index, {
        ...alias,
        moreOptions: alias.moreOptions
          ? null
          : {
              loading: false,
            },
      });
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
      this.aliasArray[index].loading = true;
      const res = await callAPI(
        API_ROUTE.DELETE_ALIAS,
        {
          alias_id: this.aliasArray[index].id,
        },
        {},
        API_ON_ERR.TOAST
      );
      if (res) {
        this.aliasArray.splice(index, 1);
      } else {
        this.aliasArray[index].loading = false;
      }
    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      Utils.showSuccess(value + " copied to clipboard");
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
