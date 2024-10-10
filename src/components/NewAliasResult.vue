<template>
  <div class="content">
    <div class="p-2 container">
      <div class="m-2 p-2">
        <p class="font-weight-bold">Alias is created</p>
        <p>
          <BTooltip>
            <template #target>
              <a class="cursor new-alias" @click="copyNewAlias">
                <span class="text-success">
                  {{ newAliasData.alias }}
                </span>
              </a>
            </template>
            Click to copy
          </BTooltip>
        </p>

        <AliasMoreOptions
          :alias="newAliasData"
          :index="0"
          show
          :mailboxes="mailboxes"
          btn-save-label="Save &amp; Back"
          @changed="backToMainPage"
          @deleted="backToMainPage"
        />

        <div v-if="showVoteScreen" class="mt-5 p-3 card-rating">
          Happy with SimpleLogin?<br />
          Please support us by
          <a :href="extensionUrl" target="_blank" rel="noreferrer noopener">
            <StarIcon aria-hidden /> Rating this extension </a
          ><br />
          Thank you!

          <br />

          <a class="text-secondary cursor" style="font-size: 0.7em" @click="doNotAskRateAgain">
            Do not ask again
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SLStorage from '../utils/SLStorage'
import AliasMoreOptions from './AliasMoreOptions.vue'
import { useToast } from '../composables/useToast'
import { getExtensionURL, getRandomIntBetween } from '../utils'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import type { Mailbox, Alias } from '../types'
import StarIcon from '~icons/fa-solid/star'
import { BTooltip } from 'bootstrap-vue-next'

const toast = useToast()
const router = useRouter()

const mailboxes = ref<Mailbox[]>(SLStorage.getTemporary('userMailboxes') as Mailbox[])
const newAliasData = ref<Alias>(SLStorage.getTemporary('newAliasData') as Alias)
const showVoteScreen = ref(false)
const extensionUrl = getExtensionURL()

onMounted(async () => {
  const notAskingRate = await SLStorage.getItem(SLStorage.SETTINGS.NOT_ASKING_RATE)
  if (notAskingRate) showVoteScreen.value = false
  // TODO showVoteScreen 1 day after user installed plugin
  else showVoteScreen.value = getRandomIntBetween(0, 10) % 2 === 0
})

// Clipboard
const clipboardSuccessHandler = (value: string) => {
  toast.success({ message: `${value} copied to clipboard` })
}

const clipboardErrorHandler = (value: unknown) => {
  console.error('error', value)
}

const backToMainPage = () => router.replace('/main')

const doNotAskRateAgain = () => {
  showVoteScreen.value = false
  SLStorage.setItem(SLStorage.SETTINGS.NOT_ASKING_RATE, true)
}

const newAliasClipboard = useClipboard({
  source: () => newAliasData.value.alias
})

const copyNewAlias = async () => {
  try {
    await newAliasClipboard.copy()
    clipboardSuccessHandler(newAliasData.value.alias)
  } catch (err) {
    clipboardErrorHandler(err)
  }
}
</script>
