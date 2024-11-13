<template>
  <div class="content">
    <BContainer class="p-3">
      <p class="font-weight-bold align-self-center">App Settings ({{ userEmail }})</p>

      <div v-show="!isFetching && freeAccount">
        <small>
          Currently you have a free SimpleLogin account. Upgrade your account to create unlimited
          aliases, add more mailboxes, create aliases on-the-fly with your domain or SimpleLogin
          subdomain and more.
        </small>
        <BButton size="sm" variant="primary" type="button" @click="upgrade">
          Upgrade your SimpleLogin account
        </BButton>
        <hr />
      </div>

      <table class="settings-list">
        <AppSettingsTableItem>
          <template #title> Show SimpleLogin button on email input fields </template>
          <template #description>
            If enabled, you can quickly create a random alias by clicking on the SimpleLogin button
            placed next to the email field.
            <BLink
              v-show="showSLButton"
              variant="primary"
              icon
              :href="reportURISLButton"
              target="_blank"
            >
              <BugIcon aria-hidden />
              Report an issue
            </BLink>
          </template>
          <template #aside>
            <ToggleButton
              :model-value="showSLButton"
              @update:model-value="handleToggleSLButton()"
            />
          </template>
        </AppSettingsTableItem>

        <AppSettingsTableItem v-show="showSLButton">
          <template #title> Place SimpleLogin button outside the input </template>
          <template #description>
            Display the SimpleLogin button next to the email field instead of inside the field. This
            can avoid having overlapping buttons with other extensions like Dashlane, LastPass, etc
          </template>
          <template #aside>
            <ToggleButton
              :model-value="positionSLButton === 'right-outside'"
              @update:model-value="handleToggleSLButtonOutside()"
            />
          </template>
        </AppSettingsTableItem>

        <AppSettingsTableItem>
          <template #title> Default alias domain </template>
          <template #description>
            When creating an alias, it will attempt to use this domain as the suffix (with its
            random suffix)
          </template>
          <template #bottom>
            <BPlaceholder v-if="getAliasOptions.isFetching.value" variant="primary" />
            <BFormSelect
              v-else
              v-model="defaultDomainForSuffix"
              :options="defaultDomainForSuffixOptions"
              @change="handleDefaultDomainForSuffixChange"
            />
          </template>
        </AppSettingsTableItem>

        <AppSettingsTableItem>
          <template #title> SimpleLogin extension Theme </template>
          <template #description>
            System theme automatically switches between Light and Dark - according to system
            preference.
          </template>
          <template #bottom>
            <BInputGroup class="w-50" style="padding-top: 6px; padding-bottom: 6px">
              <BFormSelect v-model="theme" :options="themeSelectOptions" />
            </BInputGroup>
          </template>
        </AppSettingsTableItem>
      </table>

      <BButton type="button" variant="outline-primary" class="w-100 mt-2" @click="handleLogout"
        >Logout</BButton
      >

      <div
        class="font-weight-light"
        style="position: fixed; bottom: 0; right: 2px; font-size: 0.8rem"
      >
        Version: {{ extension_version }}
      </div>
    </BContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { getHostName } from '../utils'
import { THEME_LABELS, THEMES, useTheme } from '../composables/useTheme'
import { useToast } from '../composables/useToast'
import { useGetUserInfo, useGetLogout, API_ON_ERR, useGetAliasOptions } from '../composables/useApi'
import { runtime as browserRuntime, tabs as browserTabs } from 'webextension-polyfill'
import { useRouter } from 'vue-router'
import { useApiUrl } from '../composables/useApiUrl'
import BugIcon from '~icons/fa-solid/bug'
import AppSettingsTableItem from './AppSettingsTableItem.vue'
import { BPlaceholder } from 'bootstrap-vue-next'
import type { Suffix } from '@/types'

const toast = useToast()
const router = useRouter()
const { theme } = useTheme()

const showSLButton = ref(false)
const positionSLButton = ref('right-inside')
const defaultDomainForSuffix = ref<Suffix | null>(null)
const reportURISLButton = ref('')
const extension_version = ref('development')
const { apiUrl } = await useApiUrl()
const hostName = ref('')

const getAliasOptions = useGetAliasOptions({
  hostname: hostName
})
const handleDefaultDomainForSuffixChange = async () => {
  const hostname = defaultDomainForSuffix.value?.suffix.split('@')[1] || null
  if (!hostname) {
    await SLStorage.removeItem('DEFAULT_DOMAIN_FOR_SUFFIX')
  } else {
    await SLStorage.setItem('DEFAULT_DOMAIN_FOR_SUFFIX', hostname)
  }

  showSavedSettingsToast()
}

const defaultDomainForSuffixOptions = computed(() => [
  {
    text: 'None',
    value: null
  },
  ...(getAliasOptions.data.value?.suffixes || []).map((el) => ({
    text: el.suffix,
    value: el
  }))
])

onMounted(async () => {
  // This before others
  hostName.value = await getHostName()

  await getAliasOptions.execute()
  // must be lower than getAliasOptions.execute()
  const domainForSuffix = await SLStorage.getItem('DEFAULT_DOMAIN_FOR_SUFFIX')
  defaultDomainForSuffix.value =
    getAliasOptions.data.value?.suffixes.find((el) => el.suffix.includes(domainForSuffix)) || null

  showSLButton.value = await SLStorage.getItem('SHOW_SL_BUTTON')
  positionSLButton.value = await SLStorage.getItem('SL_BUTTON_POSITION')

  await setMailToUri()
  extension_version.value = browserRuntime.getManifest().version
})

const { data, isFetching } = useGetUserInfo({ useFetchOptions: { immediate: true } })
const userEmail = computed(() => data.value?.email || '')
const freeAccount = computed(() => data.value?.in_trial || !data.value?.is_premium)

const themeSelectOptions = THEMES.map((themeOption) => ({
  value: themeOption,
  text: THEME_LABELS[themeOption]
}))

const handleToggleSLButton = async () => {
  showSLButton.value = !showSLButton.value
  await SLStorage.setItem('SHOW_SL_BUTTON', showSLButton.value)
  showSavedSettingsToast()
}

const handleToggleSLButtonOutside = async () => {
  positionSLButton.value =
    positionSLButton.value === 'right-outside' ? 'right-inside' : 'right-outside'
  await SLStorage.setItem('SL_BUTTON_POSITION', positionSLButton.value)
  showSavedSettingsToast()
}

const showSavedSettingsToast = () => {
  toast.success({ message: 'Settings saved' })
}

const useLogout = useGetLogout({
  onError: API_ON_ERR.IGNORE
})

const handleLogout = async () => {
  await useLogout.execute()
  await SLStorage.removeItem('API_KEY')
  EventManager.broadcast('SETTINGS_CHANGED')
  router.push('/login')

  if (import.meta.env.VITE_MAC) {
    console.log('send log out event to host app')
    await browserRuntime.sendNativeMessage(
      'application.id',
      JSON.stringify({
        logged_out: {}
      })
    )
  }
}

const setMailToUri = async () => {
  const subject = encodeURIComponent('Problem with SLButton feature')
  const hostname = await getHostName()
  const body = encodeURIComponent('(Optional) Affected website: ' + hostname)
  reportURISLButton.value = `mailto:extension@simplelogin.io?subject=${subject}&body=${body}`
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
    if (!apiUrl.value) return
    const upgradeURL = `${apiUrl.value}/dashboard/pricing`
    browserTabs.create({ url: upgradeURL })
  }
}

watch(theme, () => {
  showSavedSettingsToast()
})
</script>
