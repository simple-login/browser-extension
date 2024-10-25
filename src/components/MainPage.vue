<template>
  <div ref="contentElem" class="content">
    <!-- Main Page -->
    <div class="container">
      <div v-if="recommendation.show" class="text-center">
        <div class="" style="font-size: 14px">You created this alias on this website before:</div>
        <div class="flex-grow-1">
          <a class="cursor" @click.prevent="copyAlias">
            <BTooltip placement="bottom">
              <template #target>
                <span class="text-success recommended-alias">{{ recommendation.alias }}</span>
              </template>
              Click to copy
            </BTooltip>
          </a>
        </div>

        <hr />
      </div>

      <div>
        <form @submit.prevent="createCustomAlias">
          <div class="row mb-2">
            <div class="col align-self-start input-group-sm" style="padding-right: 0">
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
              <select v-model="signedSuffix" class="form-control" :disabled="loading || !canCreate">
                <option v-for="suffix in aliasSuffixes" :key="suffix[0]" :value="suffix">
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
          <div v-if="aliasPrefixError != ''" class="row text-danger" style="font-size: 12px">
            <div class="col">
              {{ aliasPrefixError }}
            </div>
          </div>
        </form>
      </div>

      <div v-if="aliasPrefix" class="mb-1 text-center" style="font-size: 14px">
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
          <RandomIcon aria-hidden />
          OR create a totally random alias
        </button>
      </div>

      <div v-if="!canCreate">
        <p class="text-danger" style="font-size: 14px">
          You have reached limit number of email aliases in free plan, please
          <span style="cursor: pointer; color: blue; text-decoration: underline" @click="upgrade"
            >upgrade</span
          >
          or reuse one of the existing aliases.
        </p>
      </div>
      <hr />

      <div v-if="aliasArray.length > 0 || searchString !== ''">
        <div class="mx-auto font-weight-bold text-center mb-2">OR use an existing alias</div>

        <div class="mx-auto" style="max-width: 60%">
          <input
            v-model="searchString"
            class="form-control form-control-sm"
            placeholder="Search"
            @keyup.enter="resetAndLoadAlias"
          />

          <div class="small-text mt-1">
            Type enter to search.
            <button
              v-if="searchString"
              class="float-right"
              style="color: blue; border: none; padding: 0; background: none"
              @click="resetSearch"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- list alias -->
        <div v-if="aliasArray.length > 0">
          <div v-for="alias in aliasArray" :key="alias.id">
            <div class="p-2 my-2 list-item-alias">
              <div class="d-flex" :class="{ disabled: !alias.enabled }">
                <div class="flex-grow-1 list-item-email" @click="copyAliasEmail(alias)">
                  <a v-b-tooltip.hover.top="'Click to Copy'" class="cursor">
                    {{ alias.email }}
                  </a>
                  <div class="list-item-email-fade" />
                </div>
                <div style="white-space: nowrap">
                  <ToggleButton
                    :model-value="alias.enabled"
                    @update:model-value="toggleAlias(alias)"
                  />

                  <div class="btn-svg btn-send" @click="handleReverseAliasClick(alias)">
                    <PaperPlaneIcon />
                  </div>

                  <img
                    v-if="alias"
                    src="/images/icon-dropdown.svg"
                    :style="{
                      transform: alias.showMoreOptions ? 'rotate(180deg)' : ''
                    }"
                    class="btn-svg"
                    @click="toggleMoreOptions(alias)"
                  />
                </div>
              </div>

              <div v-if="alias.note" class="font-weight-light alias-note-preview">
                {{ alias.note }}
              </div>

              <div class="font-weight-lighter" style="font-size: 11px">
                {{ alias.nb_forward }} forwards, {{ alias.nb_reply }} replies,
                {{ alias.nb_block }} blocks.
              </div>

              <AliasMoreOptions
                :alias="alias"
                :show="!!alias.showMoreOptions"
                :mailboxes="mailboxes ?? []"
                @changed="handleAliasChanged"
                @deleted="handleAliasDeleted"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="isFetchingAlias" class="text-secondary mx-auto text-center">
        <img src="/images/loading-three-dots.svg" style="width: 80px; margin: 20px" />
      </div>
    </div>
    <!-- END Main Page -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import SLStorage from '../utils/SLStorage'
import AliasMoreOptions from './AliasMoreOptions.vue'
import { useToast } from '../composables/useToast'
import type { Alias } from '../types'
import { getHostName, getDefaultNote } from '../utils'
import { useRouter } from 'vue-router'
import { runtime as browserRuntime, tabs as browserTabs } from 'webextension-polyfill'
import { useClipboard, useInfiniteScroll } from '@vueuse/core'
import {
  usePostGetAliases,
  useGetUserInfo,
  usePostToggleAlias,
  usePostNewAlias,
  usePostNewRandomAlias,
  useGetAliasOptions,
  useGetMailboxes,
  API_ON_ERR
} from '../composables/useApi'
import { BTooltip, useModalController } from 'bootstrap-vue-next'
import { useApiUrl } from '../composables/useApiUrl'
import RandomIcon from '~icons/fa-solid/random'
import PaperPlaneIcon from '~icons/fa-solid/paper-plane'

const toast = useToast()
const router = useRouter()

const ALIAS_PREFIX_REGEX = /^[0-9a-z-_.]+$/

const { apiUrl, apiKey } = await useApiUrl()

// variables for creating alias
// hostName obtained from chrome tabs query
const hostName = ref('')
const canCreate = ref(true)
const aliasSuffixes = ref<string[]>([])
const aliasPrefix = ref('')
const aliasPrefixError = ref('')
const signedSuffix = ref('')
const recommendation = ref({
  show: false,
  alias: ''
})

const searchString = ref('')
// array of existing alias
const aliasArray = ref<Alias[]>([])

const contentElem = useTemplateRef('contentElem')

onMounted(async () => {
  try {
    hostName.value = await getHostName()

    await getUserOptions()

    if (apiKey.value && import.meta.env.VITE_MAC) {
      console.log('send api key to host app')
      await browserRuntime.sendNativeMessage(
        'application.id',
        JSON.stringify({
          logged_in: {
            data: {
              api_key: apiKey.value,
              api_url: apiUrl.value
            }
          }
        })
      )
    }
  } catch (e) {
    console.error("Can't display alias list ", e)
  }
})

const getAliasOptions = useGetAliasOptions({
  hostname: hostName
})
watch(getAliasOptions.data, (aliasOptions) => {
  if (!aliasOptions) return

  if (aliasOptions.recommendation) {
    recommendation.value.show = true
    recommendation.value.alias = aliasOptions.recommendation.alias
  }

  aliasSuffixes.value = aliasOptions.suffixes
  signedSuffix.value = aliasSuffixes.value[0]
  aliasPrefix.value = aliasOptions.prefix_suggestion
  canCreate.value = aliasOptions.can_create
})
const { data: mailboxes, execute: executeMailboxes } = useGetMailboxes()

// get alias options and mailboxes
const getUserOptions = () => Promise.all([getAliasOptions.execute(), executeMailboxes()])

const getUserInfo = useGetUserInfo({
  useFetchOptions: {
    immediate: true
  }
})
const canCreateReverseAlias = computed(
  () => getUserInfo.data.value?.can_create_reverse_alias || false
)

const currentPage = ref(0)

const postGetAliases = usePostGetAliases({
  pageId: currentPage,
  data: computed(() => ({
    query: searchString.value
  })),
  useFetchOptions: {
    onFetchError(ctx) {
      ctx.error.customMessage = 'Cannot fetch list alias'
      return ctx
    }
  }
})
const isFetchingAlias = computed(() => postGetAliases.isFetching.value)

let aliasesAppearsEnd = 0
const loadAlias = async () => {
  await postGetAliases.execute()
  if (
    Array.isArray(postGetAliases.data.value?.aliases) &&
    postGetAliases.data.value?.aliases.length === 0
  ) {
    aliasesAppearsEnd += 1
  }
  aliasArray.value = mergeAliases(aliasArray.value, postGetAliases.data.value?.aliases || [])
}

const resetAndLoadAlias = async () => {
  aliasesAppearsEnd = 0
  currentPage.value = 0
  aliasArray.value = []
  await loadAlias()
}

const infiniteList = useInfiniteScroll(
  contentElem,
  async () => {
    if (isFetchingAlias.value || infiniteList.isLoading.value) return
    currentPage.value += 1
    await loadAlias()
  },
  { distance: 500, canLoadMore: () => aliasesAppearsEnd <= 5 }
)

const resetSearch = async () => {
  searchString.value = ''
  await resetAndLoadAlias()
}

const postNewAlias = usePostNewAlias({
  hostname: hostName,
  onError: API_ON_ERR.IGNORE,
  data: null,
  useFetchOptions: {
    onFetchError(ctx) {
      // rate limit reached
      if (ctx.error.response.status === 429) {
        ctx.error.customMessage = 'Rate limit exceeded - please wait 60s before creating new alias'
      } else if (ctx.error.response.status === 409) {
        ctx.error.customMessage = 'Alias already chosen, please select another one'
      } else if (ctx.error.response.status === 412) {
        ctx.error.customMessage = 'Alias creation time slot expired, please try again'
        // can happen when the alias creation time slot is expired,
        // i.e user waits for too long before creating the alias

        // get new aliasSuffixes
        // getAliasOptions()
      } else {
        ctx.error.customMessage = 'Unknown error'
      }
      return ctx
    }
  }
})

const createCustomAlias = async () => {
  if (postNewAlias.isFetching.value) return

  // check aliasPrefix
  aliasPrefixError.value = ''
  if (aliasPrefix.value.match(ALIAS_PREFIX_REGEX) === null) {
    aliasPrefixError.value =
      'Only lowercase letters, dots, numbers, dashes (-) and underscores (_) are currently supported.'
    return
  }

  await postNewAlias
    .post({
      alias_prefix: aliasPrefix.value,
      signed_suffix: signedSuffix.value[1],
      note: await getDefaultNote()
    })
    .execute()
  const { response: res, data, error } = postNewAlias

  if (res.value?.status === 201 && data.value && mailboxes.value) {
    SLStorage.setTemporary('newAliasData', data.value)
    SLStorage.setTemporary('userMailboxes', mailboxes.value)
    router.replace('/new-alias-result')
  } else {
    toast.error({ message: data.value?.error || error.value.message })
  }
}

const postNewRandomAlias = usePostNewRandomAlias({
  hostname: '',
  data: null,
  useFetchOptions: {
    onFetchError(ctx) {
      if (ctx.response?.status === 429) {
        ctx.error.customMessage = 'Rate limit exceeded - please wait 60s before creating new alias'
      } else {
        ctx.error.customMessage = 'Unknown error'
      }
      return ctx
    }
  }
})

const loading = computed(
  () =>
    postNewRandomAlias.isFetching.value ||
    postNewAlias.isFetching.value ||
    getAliasOptions.isFetching.value
)

const createRandomAlias = async () => {
  if (postNewRandomAlias.isFetching.value) return

  await postNewRandomAlias
    .post({
      note: await getDefaultNote()
    })
    .execute()
  const { response: res, data, error } = postNewRandomAlias

  if (res.value?.status === 201 && data.value && mailboxes.value) {
    SLStorage.setTemporary('newAliasData', data.value)
    SLStorage.setTemporary('userMailboxes', mailboxes.value)
    router.replace('/new-alias-result')
  } else {
    toast.error({ message: data.value?.error || error.value.message })
  }
}

const currentAlias = ref('')
const postToggleAlias = usePostToggleAlias({
  aliasId: currentAlias
})

const toggleAlias = async (alias: Alias) => {
  const lastState = alias.enabled
  if (alias.loading === true) return
  alias.loading = true
  try {
    currentAlias.value = alias.id
    if (currentAlias.value === '') return
    await postToggleAlias.execute()
    const { response: res, data } = postToggleAlias

    if (res) {
      alias.enabled = data.value?.enabled ?? false
      toast.success({ message: `${alias.email} is ${alias.enabled ? 'enabled' : 'disabled'}` })
    } else {
      alias.enabled = lastState
    }
  } finally {
    currentAlias.value = ''
    alias.loading = false
  }
}

// More options
const toggleMoreOptions = (value: Alias) => {
  const alias = aliasArray.value.find((el) => el.id === value.id)
  if (!alias) return
  alias.showMoreOptions = !alias.showMoreOptions
}
const handleAliasDeleted = (event: { data: Alias }) => {
  const index = aliasArray.value.findIndex((el) => el.id === event.data.id)
  if (index === -1) return
  aliasArray.value.splice(index, 1)
}
const handleAliasChanged = (event: { data: Alias }) => {
  const index = aliasArray.value.findIndex((el) => el.id === event.data.id)
  if (index === -1) return
  const alias = aliasArray.value[index]
  aliasArray.value.splice(index, 1, { ...alias, ...event.data })
}

const upgrade = async () => {
  if (import.meta.env.VITE_MAC) {
    try {
      console.log('send upgrade event to host app')
      await browserRuntime.sendNativeMessage(
        'application.id',
        JSON.stringify({
          upgrade: {}
        })
      )
    } catch (error) {
      console.info("can't send data to native app", error)
    }
  } else {
    const upgradeURL = `${apiUrl.value}/dashboard/pricing`
    browserTabs.create({ url: upgradeURL })
  }
}

const modal = useModalController()

const handleReverseAliasClick = async (alias: Alias) => {
  if (canCreateReverseAlias.value) {
    SLStorage.setTemporary('alias', alias)
    router.push('/reverse-alias')
  } else if (
    await modal.confirm?.({
      props: {
        okTitle: 'Upgrade now',
        title: 'Send emails',
        body: 'Sending a new email using an alias is a premium feature.',
        cancelTitle: 'Cancel'
      }
    })
  )
    upgrade()
}

// Clipboard
const clipboardSuccessHandler = (value: string) => {
  toast.success({ message: `${value} copied to clipboard` })
}

const clipboardErrorHandler = (value: unknown) => {
  console.error('error', value)
}

// merge newAliases into currentAliases. If conflict, keep the new one
const mergeAliases = (currentAliases: Alias[], newAliases: Alias[]) => {
  // dict of aliasId and alias to speed up research
  const newAliasesDict: Record<string, Alias> = {}
  for (let i = 0; i < newAliases.length; i++) {
    const alias = newAliases[i]
    newAliasesDict[alias.id] = alias
  }

  const ret: Alias[] = []

  // keep track of added aliases
  const alreadyAddedId: Record<string, boolean> = {}
  for (let i = 0; i < currentAliases.length; i++) {
    const alias = currentAliases[i]
    if (newAliasesDict[alias.id]) ret.push(newAliasesDict[alias.id])
    else ret.push(alias)

    alreadyAddedId[alias.id] = true
  }

  for (let i = 0; i < newAliases.length; i++) {
    const alias = newAliases[i]
    if (!alreadyAddedId[alias.id]) {
      ret.push(alias)
    }
  }

  return ret
}

const aliasClipboard = useClipboard({
  source: () => recommendation.value.alias
})

const copyAlias = async () => {
  try {
    await aliasClipboard.copy()
    clipboardSuccessHandler(recommendation.value.alias)
  } catch (err) {
    clipboardErrorHandler(err)
  }
}

const aliasEmailClipboard = useClipboard()

const copyAliasEmail = async (alias: Alias) => {
  try {
    await aliasEmailClipboard.copy(alias.email)
    clipboardSuccessHandler(alias.email)
  } catch (err) {
    clipboardErrorHandler(err)
  }
}
</script>
