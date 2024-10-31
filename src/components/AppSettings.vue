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
        <tr>
          <td>
            <ToggleButton
              :model-value="showSLButton"
              @update:model-value="handleToggleSLButton()"
            />
          </td>
          <td>
            Show SimpleLogin button on email input fields<br />
            <small>
              If enabled, you can quickly create a random alias by clicking on the SimpleLogin
              button placed next to the email field.
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
            </small>
          </td>
        </tr>

        <tr v-show="showSLButton">
          <td>
            <ToggleButton
              :model-value="positionSLButton === 'right-outside'"
              @update:model-value="handleToggleSLButtonOutside()"
            />
          </td>
          <td>
            Place SimpleLogin button outside the input<br />
            <small>
              Display the SimpleLogin button next to the email field instead of inside the field.
              This can avoid having overlapping buttons with other extensions like Dashlane,
              LastPass, etc
            </small>
          </td>
        </tr>

        <tr>
          <td />
          <td>
            SimpleLogin extension Theme<br />
            <small>
              System theme automatically switches between Light and Dark - according to system
              preference.
            </small>
            <BInputGroup class="w-50" style="padding-top: 6px; padding-bottom: 6px">
              <BFormSelect v-model="theme" :options="themeSelectOptions" />
            </BInputGroup>
          </td>
        </tr>
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
import { useGetUserInfo, useGetLogout, API_ON_ERR } from '../composables/useApi'
import { runtime as browserRuntime, tabs as browserTabs } from 'webextension-polyfill'
import { useRouter } from 'vue-router'
import { useApiUrl } from '../composables/useApiUrl'
import BugIcon from '~icons/fa-solid/bug'

const toast = useToast()
const router = useRouter()
const { theme } = useTheme()

const showSLButton = ref(false)
const positionSLButton = ref('right-inside')
const reportURISLButton = ref('')
const extension_version = ref('development')
const { apiUrl } = await useApiUrl()

onMounted(async () => {
  showSLButton.value = await SLStorage.getItem(SLStorage.SETTINGS.SHOW_SL_BUTTON)
  positionSLButton.value = await SLStorage.getItem(SLStorage.SETTINGS.SL_BUTTON_POSITION)

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
  await SLStorage.setItem(SLStorage.SETTINGS.SHOW_SL_BUTTON, showSLButton.value)
  showSavedSettingsToast()
}

const handleToggleSLButtonOutside = async () => {
  positionSLButton.value =
    positionSLButton.value === 'right-outside' ? 'right-inside' : 'right-outside'
  await SLStorage.setItem(SLStorage.SETTINGS.SL_BUTTON_POSITION, positionSLButton.value)
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
  await SLStorage.removeItem(SLStorage.SETTINGS.API_KEY)
  EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)
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
