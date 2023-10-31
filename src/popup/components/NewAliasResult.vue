<template>
  <div class="content">
    <div class="p-2 container">
      <div class="m-2 p-2">
        <p class="font-weight-bold">Alias is created</p>
        <p>
          <a @click="copyToClipboard" class="cursor new-alias">
            <span class="text-success">
              {{ newAliasData.alias }}
            </span>
          </a>
        </p>

        <AliasMoreOptions
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
            <FaStarIcon /> Rating this extension </a
          ><br />
          Thank you!

          <br />

          <a @click="doNotAskRateAgain" class="text-secondary cursor" style="font-size: 0.7em">
            Do not ask again
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {SLStorage, getRandomIntBetween, showSuccess, getExtensionURL} from '../utils'
import tippy from 'tippy.js'
import {useClipboard} from '@vueuse/core'
import FaStarIcon from '~icons/fa/star'
import {useRouter} from 'vue-router'

const {copy} = useClipboard()
const router = useRouter()

const mailboxes = SLStorage.getTemporary('userMailboxes')
const newAliasData = SLStorage.getTemporary<{alias: string}>('newAliasData')
const extensionUrl = getExtensionURL()

const showVoteScreen = ref(false)

onMounted(async () => {
  const notAskingRate = await SLStorage.get(SLStorage.settings.notAskingRate)
  if (notAskingRate) showVoteScreen.value = false
  // TODO showVoteScreen 1 day after user installed plugin
  else showVoteScreen.value = getRandomIntBetween(0, 10) % 2 === 0

  tippy('.new-alias', {
    content: 'Click to copy',
    trigger: 'manual',
    showOnCreate: true,
  })
})

const clipboardSuccessHandler = (value: string) => {
  showSuccess(`${value} copied to clipboard`)
}

const clipboardErrorHandler = (error: unknown) => {
  console.error('error', error)
}

const copyToClipboard = async () => {
  try {
    await copy(newAliasData.alias)
    clipboardSuccessHandler(newAliasData.alias)
  } catch (e) {
    clipboardErrorHandler(e)
  }
}

const backToMainPage = () => {
  router.replace('/main')
}

const doNotAskRateAgain = () => {
  showVoteScreen.value = false
  SLStorage.set(SLStorage.settings.notAskingRate, true)
}
</script>
