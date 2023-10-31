<template>
  <div class="content">
    <div class="p-3 container">
      <p class="font-weight-bold align-self-center">App Settings ({{ userEmail }})</p>

      <div v-if="freeAccount">
        <small>
          Currently you have a free SimpleLogin account. Upgrade your account to create unlimited
          aliases, add more mailboxes, create aliases on-the-fly with your domain or SimpleLogin
          subdomain and more.
        </small>
        <button @click="upgrade" class="btn btn-primary btn-sm">
          Upgrade your SimpleLogin account
        </button>
        <hr />
      </div>

      <table class="settings-list">
        <tr>
          <td>
            <!-- TODO {color: } wont work here fix! -->
            <BFormCheckbox :model-value="showSLButton" switch @update:model-value="handleToggleSLButton()" style="{color: #b02a8f;}" size="sm" />
          </td>
          <td>
            Show SimpleLogin button on email input fields<br />
            <small>
              If enabled, you can quickly create a random alias by clicking on the SimpleLogin
              button placed next to the email field.
              <a :href="reportURISLButton" v-show="showSLButton" target="_blank">
                <br />
                <FaBugIcon />
                Report an issue
              </a>
            </small>
          </td>
        </tr>

        <tr v-show="showSLButton">
          <td>
            <BFormCheckbox 
            :model-value="positionSLButton === 'right-outside'" switch @update:model-value="handleToggleSLButtonOutside()" style="{color: #b02a8f}" size="sm" />
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
          <td></td>
          <td>
            SimpleLogin extension Theme<br />
            <small>
              System theme automatically switches between Light and Dark - according to system
              preference.
            </small>
            <div class="input-group-sm w-50" style="padding-top: 6px; padding-bottom: 6px">
              <select v-model="mode" class="form-control">
                <option v-for="themeOption in themes" :key="themeOption" :value="themeOption">
                  {{ themeOption }}
                </option>
              </select>
            </div>
          </td>
        </tr>
      </table>

      <button @click="handleLogout" class="btn btn-outline-primary btn-block mt-2">Logout</button>

      <div
        class="font-weight-light"
        style="position: fixed; bottom: 0; right: 2px; font-size: 0.8rem"
      >
        Version: {{ extensionVersion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import browser from 'webextension-polyfill'
import {
  EventManager,
  SLStorage,
  showSuccess,
  getHostName,
  logout,
  API_ON_ERR,
  getUserInfo,
} from '../utils'
import FaBugIcon from '~icons/fa/bug'
import {useRouterExtensions, useTheme} from '../composables'

const routerExtensions = useRouterExtensions()
const {mode, themes} = useTheme()

const showSLButton = ref(false)
const positionSLButton = ref('right-inside')
const reportURISLButton = ref('')
const extensionVersion = ref('development')
const userEmail = ref('')
const freeAccount = ref(false)

const handleToggleSLButton = async () => {
  showSLButton.value = !showSLButton.value
  await SLStorage.set(SLStorage.settings.showSLButton, showSLButton.value)
  showSavedSettingsToast()
}

const handleToggleSLButtonOutside = async () => {
  positionSLButton.value =
    positionSLButton.value === 'right-outside' ? 'right-inside' : 'right-outside'
  await SLStorage.set(SLStorage.settings.slButtonPosition, positionSLButton.value)
  showSavedSettingsToast()
}

const showSavedSettingsToast = () => {
  showSuccess('Settings saved')
}

const handleLogout = async () => {
  await logout({
    errHandlerMethod: API_ON_ERR.IGNORE,
  })
  await SLStorage.remove(SLStorage.settings.apiKey)
  EventManager.broadcast(EventManager.settingsChangedEvent)
  routerExtensions.clearHistoryAndNavigateTo('/login')

  if (import.meta.env.MAC) {
    console.log('send log out event to host app')
    await browser.runtime.sendNativeMessage(
      'application.id',
      JSON.stringify({
        logged_out: {},
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
  if (import.meta.env.MAC) {
    console.log('send upgrade event to host app')
    await browser.runtime.sendNativeMessage(
      'application.id',
      JSON.stringify({
        upgrade: {},
      })
    )
    return
  }

  console.info("can't send data to native app", error)
  const apiUrl = await SLStorage.get(SLStorage.settings.apiUrl)
  const upgradeURL = apiUrl + '/dashboard/pricing'
  browser.tabs.create({url: upgradeURL})
}

watch(mode, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    showSavedSettingsToast()
  }
})

onMounted(async () => {
  showSLButton.value = await SLStorage.get(SLStorage.settings.showSLButton)
  positionSLButton.value = await SLStorage.get(SLStorage.settings.slButtonPosition)

  await setMailToUri()
  extensionVersion.value = browser.runtime.getManifest().version

  // check api key
  const {data} = await getUserInfo({errHandlerMethod: API_ON_ERR.TOAST})
  userEmail.value = data.email
  if (data.in_trial) {
    freeAccount.value = true
  } else {
    freeAccount.value = !data.is_premium
  }
})
</script>
