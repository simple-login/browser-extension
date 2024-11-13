<template>
  <div ref="contentElem" class="content">
    <!-- Main Page -->
    <BContainer>
      <BCollapse v-model="recommendation.show">
        <div class="text-center">
          <div style="font-size: 14px">You created this alias on this website before:</div>
          <div class="flex-grow-1">
            <BLink variant="primary" class="cursor" @click="copyAlias">
              <BTooltip placement="bottom">
                <template #target>
                  <span class="text-success recommended-alias">{{ recommendation.alias }}</span>
                </template>
                Click to copy
              </BTooltip>
            </BLink>
          </div>

          <hr />
        </div>
      </BCollapse>

      <div>
        <BForm>
          <BRow class="mb-2">
            <BCol align-self="start" class="input-group-sm" style="padding-right: 0">
              <BFormInput
                v-model="aliasPrefix"
                placeholder="Alias prefix"
                :disabled="loading || !canCreate"
                autofocus
                required
              />
            </BCol>

            <BCol
              align-self="start"
              class="input-group-sm"
              style="padding-left: 5px; padding-right: 5px"
            >
              <BFormSelect
                v-model="signedSuffix"
                :disabled="loading || !canCreate"
                :options="aliasFormSelectOptions"
              />
            </BCol>

            <BCol cols="auto" align-self="start">
              <BButton
                size="sm"
                variant="primary"
                :disabled="loading || !canCreate"
                style="margin-right: 15px"
                class="align-self-start"
                type="button"
                @click="createCustomAlias"
              >
                Create
              </BButton>
            </BCol>
          </BRow>
          <BRow v-if="!aliasPrefixError" class="text-danger" style="font-size: 12px">
            <BCol>
              {{ aliasPrefixError }}
            </BCol>
          </BRow>
        </BForm>
      </div>

      <div v-if="aliasPrefix" class="mb-1 text-center" style="font-size: 14px">
        You're about to create alias
        <span class="text-primary">{{ aliasPrefix }}{{ signedSuffix?.suffix || '' }}</span>
      </div>

      <hr />
      <div class="text-center">
        <BButton
          variant="outline-primary"
          size="sm"
          type="button"
          :disabled="loading || !canCreate"
          style="margin-left: 15px"
          @click="createRandomAlias"
        >
          <RandomIcon aria-hidden />
          OR create a totally random alias
        </BButton>
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
          <BFormInput
            v-model="searchString"
            size="sm"
            placeholder="Search"
            aria-describedby="search-help"
            @keyup.enter="resetAndLoadAlias"
          />

          <div id="search-help" class="small-text mt-1">
            Press enter to search.
            <BButton
              :disabled="!searchString"
              type="button"
              variant="link-info"
              size="sm"
              class="float-end p-0 border-0"
              aria-label="Reset search"
              @click="resetSearch"
            >
              Reset
            </BButton>
          </div>
        </div>

        <!-- list alias -->
        <div v-if="aliasArray.length > 0">
          <div v-for="alias in aliasArray" :key="alias.id" class="mb-1 border-bottom">
            <div class="p-2 my-2 list-item-alias">
              <div class="d-flex" :class="{ disabled: !alias.enabled }">
                <div class="flex-grow-1 list-item-email" @click="copyAliasEmail(alias)">
                  <BTooltip placement="top" strategy="fixed">
                    <template #target>
                      <BLink variant="primary" class="cursor">
                        {{ alias.email }}
                      </BLink>
                    </template>
                    Click to Copy
                  </BTooltip>
                  <div class="list-item-email-fade" />
                </div>
                <div style="white-space: nowrap">
                  <ToggleButton
                    tag="span"
                    :model-value="alias.enabled"
                    @update:model-value="toggleAlias(alias)"
                  />

                  <div
                    role="button"
                    class="btn-svg btn-send"
                    @click="handleReverseAliasClick(alias)"
                  >
                    <PaperPlaneIcon aria-label="Create reverse alias" />
                  </div>

                  <img
                    v-if="alias"
                    src="/images/icon-dropdown.svg"
                    :style="{
                      transform: alias.showMoreOptions ? 'rotate(180deg)' : ''
                    }"
                    role="button"
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
                :mailboxes="mailboxes?.mailboxes || []"
                @changed="handleAliasChanged"
                @deleted="handleAliasDeleted"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="isFetchingAliases" class="text-secondary mx-auto text-center">
        <img src="/images/loading-three-dots.svg" style="width: 80px; margin: 20px" />
      </div>
    </BContainer>
    <!-- END Main Page -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import SLStorage from '../utils/SLStorage'
import AliasMoreOptions from './AliasMoreOptions.vue'
import { useToast } from '../composables/useToast'
import type { Alias, Suffix } from '../types'
import { getHostName, getDefaultNote } from '../utils'
import { useRouter } from 'vue-router'
import { runtime as browserRuntime, tabs as browserTabs } from 'webextension-polyfill'
import { useClipboard } from '@vueuse/core'
import {
  useGetUserInfo,
  usePostToggleAlias,
  usePostNewAlias,
  usePostNewRandomAlias,
  useGetAliasOptions,
  useGetMailboxes,
  API_ON_ERR,
  type UseGetAliasOptionsReturn
} from '../composables/useApi'
import { useApiUrl } from '../composables/useApiUrl'
import RandomIcon from '~icons/fa-solid/random'
import PaperPlaneIcon from '~icons/fa-solid/paper-plane'
import { useModalController } from 'bootstrap-vue-next/composables/useModalController'
import { useMainPageSuggestedPrefix } from '@/composables/useMainPageSuggestedPrefix'
import { useMainPageAliasArray } from '@/composables/useMainPageAliasArray'

const toast = useToast()
const router = useRouter()

const { apiUrl, apiKey } = await useApiUrl()

// variables for creating alias
// hostName obtained from chrome tabs query
const hostName = ref('')
const canCreate = ref(true)
const aliasSuffixes = ref<UseGetAliasOptionsReturn['suffixes']>([])
const { aliasPrefix, setAliasPrefixWithMustache, aliasPrefixError, validateAliasPrefix } =
  await useMainPageSuggestedPrefix()

const signedSuffix = ref<Suffix | null>(null)
const recommendation = ref({
  show: false,
  alias: ''
})

const aliasFormSelectOptions = computed(() =>
  aliasSuffixes.value.map((suffix) => ({
    value: suffix,
    text: suffix.suffix
  }))
)

// array of existing alias

const contentElem = useTemplateRef('contentElem')
const {
  aliasArray,
  isFetchingAliases,
  handleAliasChanged,
  resetSearch,
  toggleMoreOptions,
  handleAliasDeleted,
  resetAndLoadAlias,
  searchString
} = useMainPageAliasArray(contentElem)

onMounted(async () => {
  try {
    // getUserOptions needs this first
    hostName.value = await getHostName()

    const [domainForSuffix] = await Promise.all([
      SLStorage.getItem('DEFAULT_DOMAIN_FOR_SUFFIX'),
      getUserOptions()
    ])

    if (domainForSuffix) {
      const found = aliasFormSelectOptions.value.find((el) =>
        el.value.suffix.includes(domainForSuffix)
      )
      if (found) {
        signedSuffix.value = found.value || null
      }
    }

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
  ;[signedSuffix.value] = aliasSuffixes.value
  canCreate.value = aliasOptions.can_create

  aliasPrefix.value = setAliasPrefixWithMustache(aliasOptions.prefix_suggestion)
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
  if (postNewAlias.isFetching.value || !signedSuffix.value) return

  // check aliasPrefix
  if (!validateAliasPrefix()) return

  await postNewAlias
    .post({
      alias_prefix: aliasPrefix.value,
      signed_suffix: signedSuffix.value.signed_suffix,
      note: await getDefaultNote()
    })
    .execute()
  const { response: res, data, error } = postNewAlias

  if (res.value?.status === 201 && data.value && mailboxes.value?.mailboxes) {
    SLStorage.setTemporary('newAliasData', data.value)
    SLStorage.setTemporary('userMailboxes', mailboxes.value.mailboxes)
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

  if (res.value?.status === 201 && data.value && mailboxes.value?.mailboxes) {
    SLStorage.setTemporary('newAliasData', data.value)
    SLStorage.setTemporary('userMailboxes', mailboxes.value.mailboxes)
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
