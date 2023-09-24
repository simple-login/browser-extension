<template>
  <div class="content">
    <div class="p-2 container">
      <div class="m-2 p-2">
        <p class="font-weight-bold">Alias is created</p>
        <p>
          <a
            @click="copyToClipboard"
            class="cursor new-alias"
          >
            <span class="text-success">
              {{ newAliasData.alias }}
            </span>
          </a>
        </p>

        <alias-more-options
          :alias="newAliasData"
          :index="0"
          :show="true"
          :mailboxes="mailboxes"
          btnSaveLabel="Save &amp; Back"
          @changed="backToMainPage"
          @deleted="backToMainPage"
        />

        <div class="mt-5 p-3 card-rating" v-if="showVoteScreen">
          Happy with SimpleLogin?<br />
          Please support us by
          <a :href="extensionUrl" target="_blank" rel="noreferrer noopener">
            <font-awesome-icon icon="star" /> Rating this extension </a
          ><br />
          Thank you!

          <br />

          <a
            @click="doNotAskRateAgain"
            class="text-secondary cursor"
            style="font-size: 0.7em"
          >
            Do not ask again
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import SLStorage from "../SLStorage";
import Navigation from "../Navigation";
import EventManager from "../EventManager";
import Utils from "../Utils";
import AliasMoreOptions from "./AliasMoreOptions.vue";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";
import tippy from "tippy.js";
import {useClipboard} from '@vueuse/core'

const {copy} = useClipboard()

const mailboxes = SLStorage.getTemporary("userMailboxes")
const newAliasData = SLStorage.getTemporary("newAliasData")
const extensionUrl = Utils.getExtensionURL()

const showVoteScreen = ref(false)

onMounted(async () => {
    let notAskingRate = await SLStorage.get(SLStorage.SETTINGS.NOT_ASKING_RATE);
    if (!!notAskingRate) showVoteScreen.value = false;
    // TODO showVoteScreen 1 day after user installed plugin
    else showVoteScreen.value = Utils.getRandomIntBetween(0, 10) % 2 === 0;

    tippy(".new-alias", {
      content: "Click to copy",
      trigger: "manual",
      showOnCreate: true,
    });
  })

/**
 * 
 * @param {string} value 
 */
const clipboardSuccessHandler = (value) => {
  Utils.showSuccess(`${value} copied to clipboard`);
}

/**
 * 
 * @param {any} error 
 */
const clipboardErrorHandler = (error) => {
  console.error("error", error);
}

const copyToClipboard = async () => {
  try{
    await copy(createdReverseAlias.reverse_alias)
    clipboardSuccessHandler(createdReverseAlias.reverse_alias)
  }
  catch(e) {
    clipboardErrorHandler(e)
  }
}

const backToMainPage = () => {
  Navigation.navigateTo(Navigation.PATH.MAIN);
}

const doNotAskRateAgain = () => {
  showVoteScreen.value = false;
  SLStorage.set(SLStorage.SETTINGS.NOT_ASKING_RATE, true);
}
</script>
