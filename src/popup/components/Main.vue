<template>
  <div class="content">
    <v-dialog />

    <!-- Main Page -->
    <div class="container">
      <div v-if="recommendation.show" class="text-center">
        <div class="" style="font-size: 12px;">
          You created this alias on this website before:
        </div>
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

      <div>
        <form @submit.prevent="createCustomAlias">
          <div class="row mb-2">
            <div
              class="col align-self-start input-group-sm"
              style="padding-right: 0;"
            >
              <input
                v-model="aliasPrefix"
                class="form-control"
                placeholder="Alias prefix"
                :disabled="loading || !canCreate"
                autofocus
                required
              />
            </div>

            <div
              class="col align-self-start input-group-sm"
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
                  :value="suffix"
                >
                  {{ suffix[0] }}
                </option>
              </select>
            </div>

            <button
              :disabled="loading || !canCreate"
              style="margin-right: 15px;"
              class="btn btn-primary btn-sm align-self-start"
            >
              Create
            </button>
          </div>
          <div
            class="row text-danger"
            style="font-size: 12px;"
            v-if="aliasPrefixError != ''"
          >
            <div class="col">
              {{ aliasPrefixError }}
            </div>
          </div>
        </form>
      </div>

      <div class="mb-1 text-center" v-if="aliasPrefix" style="font-size: 12px;">
        You're about to create alias
        <span class="text-primary">{{ aliasPrefix }}{{ signedSuffix[0] }}</span>
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
            <div class="p-2 my-2 border-top list-item-alias">
              <div class="d-flex" v-bind:class="{ disabled: !alias.enabled }">
                <div
                  class="flex-grow-1 list-item-email"
                  v-clipboard="() => alias.email"
                  v-clipboard:success="clipboardSuccessHandler"
                  v-clipboard:error="clipboardErrorHandler"

                >
                  <a class="cursor" v-b-tooltip.hover.top="'Click to Copy'">
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

                  <div
                    class="btn-svg btn-send"
                    @click="goToReverseAlias(alias)"
                  >
                    <font-awesome-icon icon="paper-plane" />
                  </div>

                  <img
                    src="/images/icon-dropdown.svg"
                    v-if="alias"
                    v-bind:style="{
                      transform: alias.showMoreOptions ? 'rotate(180deg)' : '',
                    }"
                    v-on:click="toggleMoreOptions(index)"
                    class="btn-svg"
                  />
                </div>
              </div>

              <div
                v-if="alias.note"
                class="font-weight-light alias-note-preview"
              >
                {{ alias.note }}
              </div>

              <div class="font-weight-lighter" style="font-size: 11px;">
                {{ alias.nb_forward }} forwards, {{ alias.nb_reply }} replies,
                {{ alias.nb_block }} blocks.
              </div>

              <alias-more-options
                :alias="alias"
                :index="index"
                :show="!!alias.showMoreOptions"
                :mailboxes="mailboxes"
                @changed="handleAliasChanged"
                @deleted="handleAliasDeleted"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="isFetchingAlias" class="text-secondary mx-auto text-center">
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
import AliasMoreOptions from "./AliasMoreOptions";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

const ALIAS_PREFIX_REGEX = /^[0-9a-z-_.]+$/;

export default {
  components: {
    "alias-more-options": AliasMoreOptions,
  },
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
      aliasPrefixError: "",
      signedSuffix: "",
      recommendation: {
        show: false,
        alias: "",
      },
      mailboxes: [],

      // variables for list alias
      isFetchingAlias: true,
      searchString: "",
      aliasArray: [], // array of existing alias
    };
  },
  async mounted() {
    this.hostName = await Utils.getHostName();
    this.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
    this.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);

    this.contentElem = document.querySelector(".app > .content");

    await this.getUserOptions();
  },
  methods: {
    // get alias options and mailboxes
    async getUserOptions() {
      this.loading = true;

      const results = await Promise.all([
        callAPI(
          API_ROUTE.GET_ALIAS_OPTIONS,
          {
            hostname: this.hostName,
          },
          API_ON_ERR.TOAST
        ),
        callAPI(API_ROUTE.GET_MAILBOXES, {}, API_ON_ERR.TOAST),
      ]);

      const aliasOptions = results[0].data;
      const { mailboxes } = results[1].data;

      if (aliasOptions.recommendation) {
        this.recommendation.show = true;
        this.recommendation.alias = aliasOptions.recommendation.alias;
      }

      this.aliasSuffixes = aliasOptions.suffixes;
      this.signedSuffix = this.aliasSuffixes[0];
      this.aliasPrefix = aliasOptions.prefix_suggestion;
      this.canCreate = aliasOptions.can_create;
      this.mailboxes = mailboxes;

      this.loading = false;

      await this.loadAlias();
    },

    async loadAlias() {
      const contentElem = this.contentElem;
      this.aliasArray = [];
      let currentPage = 0;

      this.aliasArray = await this.fetchAlias(currentPage, this.searchString);

      let allAliasesAreLoaded = false;

      let that = this;
      if (this.onScrollCallback) {
        contentElem.removeEventListener("scroll", this.onScrollCallback);
      }

      this.onScrollCallback = async function () {
        if (that.isFetchingAlias || allAliasesAreLoaded) return;

        let bottomOfWindow =
          contentElem.scrollTop + contentElem.clientHeight >
          contentElem.scrollHeight - 100;

        if (bottomOfWindow) {
          currentPage += 1;

          let newAliases = await that.fetchAlias(
            currentPage,
            that.searchString
          );

          allAliasesAreLoaded = newAliases.length === 0;
          that.aliasArray = mergeAliases(that.aliasArray, newAliases);
        }
      };

      contentElem.addEventListener("scroll", this.onScrollCallback);
    },

    async fetchAlias(page, query) {
      this.isFetchingAlias = true;
      try {
        const { data } = await callAPI(
          API_ROUTE.GET_ALIASES,
          {
            page_id: page,
          },
          {
            query,
          }
        );
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

      // check aliasPrefix
      this.aliasPrefixError = "";
      if (this.aliasPrefix.match(ALIAS_PREFIX_REGEX) === null) {
        this.aliasPrefixError =
          "Only lowercase letters, dots, numbers, dashes (-) and underscores (_) are currently supported.";
        return;
      }

      this.loading = true;

      try {
        const res = await callAPI(
          API_ROUTE.NEW_ALIAS,
          {
            hostname: this.hostName,
          },
          {
            alias_prefix: this.aliasPrefix,
            signed_suffix: this.signedSuffix[1],
            note: await Utils.getDefaultNote(),
          }
        );

        if (res.status === 201) {
          SLStorage.setTemporary("newAliasData", res.data);
          SLStorage.setTemporary("userMailboxes", this.mailboxes);
          Navigation.navigateTo(Navigation.PATH.NEW_ALIAS_RESULT);
        } else {
          Utils.showError(res.data.error);
        }
      } catch (err) {
        // rate limit reached
        if (err.response.status === 429) {
          Utils.showError(
            "Rate limit exceeded - please wait 60s before creating new alias"
          );
        } else if (err.response.status === 409) {
          Utils.showError("Alias already chosen, please select another one");
        } else if (err.response.status === 412) {
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
          {
            note: await Utils.getDefaultNote(),
          }
        );

        if (res.status === 201) {
          SLStorage.setTemporary("newAliasData", res.data);
          SLStorage.setTemporary("userMailboxes", this.mailboxes);
          Navigation.navigateTo(Navigation.PATH.NEW_ALIAS_RESULT);
        } else {
          Utils.showError(res.data.error);
        }
      } catch (err) {
        // rate limit reached
        if (err.response.status === 429) {
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
        showMoreOptions: !alias.showMoreOptions,
      });
    },
    handleAliasDeleted(event) {
      this.aliasArray.splice(event.index, 1);
    },
    handleAliasChanged(event) {
      const alias = this.aliasArray[event.index];
      for (const key in event.data) {
        alias[key] = event.data[key];
      }
    },

    // Reverse Alias
    goToReverseAlias(alias) {
      SLStorage.setTemporary("alias", alias);
      Navigation.navigateTo(Navigation.PATH.REVERSE_ALIAS, true);
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
