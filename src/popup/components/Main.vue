<template>
  <div ref="contentElem" class="content">
    <v-dialog />

    <!-- Main Page -->
    <div class="container">
      <div v-if="recommendation.show" class="text-center">
        <div class="" style="font-size: 14px">
          You created this alias on this website before:
        </div>
        <div class="flex-grow-1">
          <a
            @click="copyToClipboard(recommendation.alias)"
            class="cursor"
          >
            <span class="text-success recommended-alias">{{
              recommendation.alias
            }}</span>
          </a>
        </div>

        <hr />
      </div>

      <div>
        <form @submit.prevent="createCustomAlias">
          <div class="row mb-2">
            <div
              class="col align-self-start input-group-sm"
              style="padding-right: 0"
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
              style="padding-left: 5px; padding-right: 5px"
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
              style="margin-right: 15px"
              class="btn btn-primary btn-sm align-self-start"
            >
              Create
            </button>
          </div>
          <div
            class="row text-danger"
            style="font-size: 12px"
            v-if="aliasPrefixError != ''"
          >
            <div class="col">
              {{ aliasPrefixError }}
            </div>
          </div>
        </form>
      </div>

      <div class="mb-1 text-center" v-if="aliasPrefix" style="font-size: 14px">
        You're about to create alias
        <span class="text-primary">{{ aliasPrefix }}{{ signedSuffix[0] }}</span>
      </div>

      <hr />
      <div class="text-center">
        <button
          :disabled="loading || !canCreate"
          style="margin-left: 15px"
          class="btn btn-outline-primary btn-sm"
          @click="createRandomAlias"
        >
          <font-awesome-icon icon="random" />
          OR create a totally random alias
        </button>
      </div>

      <div v-if="!canCreate">
        <p class="text-danger" style="font-size: 14px">
          You have reached limit number of email aliases in free plan, please
          <span
            @click="upgrade"
            style="cursor: pointer; color: blue; text-decoration: underline"
            >upgrade</span
          >
          or reuse one of the existing aliases.
        </p>
      </div>
      <hr />

      <div v-if="aliasArray.length > 0 || searchString !== ''">
        <div class="mx-auto font-weight-bold text-center mb-2">
          OR use an existing alias
        </div>

        <div class="mx-auto" style="max-width: 60%">
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
              style="color: blue; border: none; padding: 0; background: none"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- list alias -->
        <div v-if="aliasArray.length > 0">
          <div v-for="(alias, index) in aliasArray" v-bind:key="alias.id">
            <div class="p-2 my-2 list-item-alias">
              <div class="d-flex" v-bind:class="{ disabled: !alias.enabled }">
                <div
                  class="flex-grow-1 list-item-email"
                  @click="copyToClipboard(alias.email)"
                >
                  <a class="cursor" v-b-tooltip.hover.top="'Click to Copy'">
                    {{ alias.email }}
                  </a>
                  <div class="list-item-email-fade" />
                </div>
                <div style="white-space: nowrap">
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

              <div class="font-weight-lighter" style="font-size: 11px">
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
          style="width: 80px; margin: 20px"
        />
      </div>
    </div>
    <!-- END Main Page -->
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, set, onUnmounted} from 'vue'
import Utils from "../Utils";
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import AliasMoreOptions from "./AliasMoreOptions.vue";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";
import tippy from "tippy.js";
import {useClipboard} from '@vueuse/core'

const ALIAS_PREFIX_REGEX = /^[0-9a-z-_.]+$/;

const {copy} = useClipboard()

const loading = ref(true)
const apiUrl = ref("")
const apiKey = ref("")

/**
 * variables for creating alias
 * 
 * hostName obtained from chrome tabs query
 */
const hostName = ref("")
const canCreate = ref(true)
const aliasSuffixes = ref([])
const aliasPrefix = ref("")
const aliasPrefixError = ref("")
const signedSuffix = ref("")
const recommendation = reactive({
  show: false,
  alias: "",
})
const mailboxes = ref([])

/**
 * variables for list alias
 */
const isFetchingAlias = ref(true)
const searchString = ref("")
/**
 * array of existing alias
 */
const aliasArray = ref([])

const onScrollCallback = ref(null)

const contentElem = ref(null)

onMounted(async () => {
  hostName.value = await Utils.getHostName();
  apiUrl.value = await SLStorage.get(SLStorage.SETTINGS.API_URL);
  apiKey.value = await SLStorage.get(SLStorage.SETTINGS.API_KEY);

  if (apiKey.value && process.env.MAC) {
    console.log("send api key to host app");
    await browser.runtime.sendNativeMessage(
      "application.id",
      JSON.stringify({
        logged_in: {
          data: {
            api_key: apiKey.value,
            api_url: apiUrl.value,
          },
        },
      })
    );
  }

  await getUserOptions();
})

// get alias options and mailboxes
const getUserOptions = async () => {
  loading.value = true;

  const results = await Promise.all([
    callAPI(
      API_ROUTE.GET_ALIAS_OPTIONS,
      {
        hostname: hostName.value,
      },
      API_ON_ERR.TOAST
    ),
    callAPI(API_ROUTE.GET_MAILBOXES, {}, API_ON_ERR.TOAST),
  ]);

  const aliasOptions = results[0].data;
  const mailboxesData = results[1].data;

  if (aliasOptions.recommendation) {
    recommendation.show = true;
    recommendation.alias = aliasOptions.recommendation.alias;
  }

  aliasSuffixes.value = aliasOptions.suffixes;
  signedSuffix.value = aliasSuffixes.value[0];
  aliasPrefix.value = aliasOptions.prefix_suggestion;
  canCreate.value = aliasOptions.can_create;
  mailboxes.value = mailboxesData;

  loading.value = false;

  await loadAlias();

  tippy(".recommended-alias", {
    content: "Click to copy",
    placement: "bottom",
  });
}

    /**
 * merge newAliases into currentAliases. If conflict, keep the new one
 * 
 * @param currentAliases 
 * @param newAliases 
 */
const mergeAliases = (currentAliases, newAliases) => {
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

const cleanupEventListeners = () => {
  if (onScrollCallback.value !== null && contentElem.value !== null) {
    contentElem.value.removeEventListener("scroll", onScrollCallback.value);
  }
}

const loadAlias = async () => {
  aliasArray.value = [];
  let currentPage = 0;

  aliasArray.value = await fetchAlias(currentPage, searchString.value);

  let allAliasesAreLoaded = false;

  cleanupEventListeners()

  onScrollCallback.value = async () => {
    if (isFetchingAlias.value || allAliasesAreLoaded) return;

    let bottomOfWindow =
      (contentElem.value?.scrollTop ?? 0) + (contentElem.value?.clientHeight ?? 0) >
      (contentElem.value?.scrollHeight ?? 0) - 100;

    if (bottomOfWindow) {
      currentPage += 1;

      let newAliases = await fetchAlias(
        currentPage,
        searchString.value
      );

      allAliasesAreLoaded = newAliases.length === 0;
      aliasArray.value = mergeAliases(aliasArray.value, newAliases);
    }
  };

  contentElem.value?.addEventListener("scroll", onScrollCallback.value);
}

onUnmounted(() => {
  cleanupEventListeners()
})

const fetchAlias = async (page, query) => {
  isFetchingAlias.value = true;
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
    isFetchingAlias.value = false;
    return data.aliases;
  } catch (e) {
    Utils.showError("Cannot fetch list alias");
    isFetchingAlias.value = false;
    return [];
  }
}

const resetSearch = async () => {
  searchString.value = "";
  await loadAlias();
}

const createCustomAlias = async () =>  {
  if (loading.value) return;

  // check aliasPrefix
  aliasPrefixError.value = "";
  if (aliasPrefix.value.match(ALIAS_PREFIX_REGEX) === null) {
    aliasPrefixError.value =
      "Only lowercase letters, dots, numbers, dashes (-) and underscores (_) are currently supported.";
    return;
  }

  loading.value = true;

  try {
    const res = await callAPI(
      API_ROUTE.NEW_ALIAS,
      {
        hostname: hostName.value,
      },
      {
        alias_prefix: aliasPrefix.value,
        signed_suffix: signedSuffix.value[1],
        note: await Utils.getDefaultNote(),
      }
    );

    if (res.status === 201) {
      SLStorage.setTemporary("newAliasData", res.data);
      SLStorage.setTemporary("userMailboxes", mailboxes.value);
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
      // TODO getAliasOptions is NOT DEFINED
      getAliasOptions();
    } else {
      Utils.showError("Unknown error");
    }
  }

  loading.value = false;
}

const createRandomAlias = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await callAPI(
      API_ROUTE.NEW_RANDOM_ALIAS,
      {
        hostname: "",
      },
      {
        note: await Utils.getDefaultNote(),
      }
    );

    if (res.status === 201) {
      SLStorage.setTemporary("newAliasData", res.data);
      SLStorage.setTemporary("userMailboxes", mailboxes.value);
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

  loading.value = false;
}
const toggleAlias = async (alias) => {
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
}

// More options
const toggleMoreOptions = (index) => {
  const alias = aliasArray.value[index];
  set(aliasArray.value, index, {
    ...alias,
    showMoreOptions: !alias.showMoreOptions,
  });
}
const handleAliasDeleted = (event) => {
  aliasArray.value.splice(event.index, 1);
}
const handleAliasChanged = (event) => {
  const alias = aliasArray.value[event.index];
  for (const key in event.data) {
    alias[key] = event.data[key];
  }
}

// Reverse Alias
const goToReverseAlias = (alias) => {
  SLStorage.setTemporary("alias", alias);
  Navigation.navigateTo(Navigation.PATH.REVERSE_ALIAS, true);
}

const upgrade = async () => {
  if (process.env.MAC) {
    console.log("send upgrade event to host app");
    await browser.runtime.sendNativeMessage(
      "application.id",
      JSON.stringify({
        upgrade: {},
      })
    );
  } else {
    console.info("can't send data to native app", error);
    let upgradeURL = apiUrl.value + "/dashboard/pricing";
    browser.tabs.create({ url: upgradeURL });
  }
}

/**
 * 
 * @param {string} value 
 */
const clipboardSuccessHandler = (value) => {
  Utils.showSuccess(`${value} copied to clipboard`);
}

const clipboardErrorHandler = (error) => {
  console.error("error", error);
}

/**
 * @param {string} value
 */
const copyToClipboard = async (value) => {
  try{
    await copy(value)
    clipboardSuccessHandler(value)
  }
  catch(e) {
    clipboardErrorHandler(e)
  }
}
</script>
