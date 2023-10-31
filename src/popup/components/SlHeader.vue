<template>
  <div class="header">
    <div class="row mt-2 pb-2 ml-3 mr-2" style="border-bottom: 1px var(--delimiter-color) solid">
      <div>
        <div
          v-on:click="navigateBack()"
          v-bind:class="{back: canGoBack}"
          style="display: inline-block; color: var(--text-color)"
        >
          <img
            v-if="canGoBack"
            src="/images/back-button.svg"
            class="invertable"
            style="height: 20px"
          />
          <img class="sl-logo" src="/images/horizontal-logo.svg" style="height: 18px" />
        </div>
        <div class="beta-badge" v-if="isBeta">BETA</div>
      </div>

      <div v-if="apiKey === ''" class="actions-container">
        <span @click="goToSelfHostSetting" class="header-button float-right"> Settings </span>
      </div>

      <div v-if="apiKey !== ''" class="actions-container">
        <span
          class="header-button float-right"
          @click="onClickSettingButton"
          v-show="canShowSettingsButton"
          title="Settings"
          v-b-tooltip.hover.bottomleft
        >
          <FaCogIcon />
        </span>

        <a
          :href="reportBugUri"
          target="_blank"
          class="header-button float-right"
          title="Report an issue"
          v-if="isBeta"
          v-b-tooltip.hover.bottomleft
        >
          <FaBugIcon />
        </a>

        <a
          :href="apiUrl + '/dashboard/'"
          target="_blank"
          class="dashboard-btn float-right"
          style="padding: 0.25rem 0.5rem; font-size: 0.875rem"
          title="Dashboard"
          v-b-tooltip.hover
          :disabled="!useCompactLayout"
        >
          <span v-if="!useCompactLayout">Dashboard</span>
          <FaExternalLinkAltIcon />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {EventManager, SLStorage, getHostName} from '../utils'
import FaBugIcon from '~icons/fa/bug'
import FaCogIcon from '~icons/fa/cog'
import FaExternalLinkAltIcon from '~icons/fa/external-link-alt'
import {vBTooltip} from 'bootstrap-vue-next'
import {useRoute, useRouter} from 'vue-router'
import {useRouterExtensions} from '@/popup/composables'

defineProps<{
  useCompactLayout?: boolean
}>()

const route = useRoute()
const router = useRouter()
const {canGoBack} = useRouterExtensions()

const apiKey = ref('')
const apiUrl = ref('')
const showDropdownMenu = ref(false)
const isBeta = ref(import.meta.env.BETA)
const canShowSettingsButton = ref(true)
const reportBugUri = ref('')

watch(route, (to) => {
  showDropdownMenu.value = false
  canShowSettingsButton.value = to.path !== '/app-settings'
})

const goToSelfHostSetting = () => {
  router.push('/self-host-setting')
}

const navigateBack = () => {
  if (router?.history.index > 0) {
    router.go(-1)
  }
}

const onClickSettingButton = () => {
  router.push('/app-settings')
}

const setReportBugUri = async () => {
  const subject = encodeURIComponent('Report an issue on SimpleLogin')
  const hostname = await getHostName()
  const body = encodeURIComponent(
    '(Optional) Affected website: ' +
      hostname +
      '\n' +
      '(Optional) Browser info: ' +
      navigator.vendor +
      '; ' +
      navigator.userAgent
  )
  reportBugUri.value = `mailto:extension@simplelogin.io?subject=${subject}&body=${body}`
}

onMounted(async () => {
  apiKey.value = await SLStorage.get(SLStorage.settings.apiKey)
  apiUrl.value = await SLStorage.get(SLStorage.settings.apiUrl)

  EventManager.addListener(EventManager.settingsChangedEvent, async () => {
    apiKey.value = await SLStorage.get(SLStorage.settings.apiKey)
    apiUrl.value = await SLStorage.get(SLStorage.settings.apiUrl)
  })

  setReportBugUri()
})
</script>
