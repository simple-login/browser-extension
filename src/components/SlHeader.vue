<template>
  <div class="header">
    <div class="row mt-2 pb-2 ml-3 mr-2" style="border-bottom: 1px var(--delimiter-color) solid">
      <div>
        <div
          :class="{ back: canBack }"
          style="display: inline-block; color: var(--text-color)"
          @click="navigateBack()"
        >
          <img
            v-if="canBack"
            src="/images/back-button.svg"
            class="invertable"
            style="height: 20px"
          />
          <img class="sl-logo" src="/images/horizontal-logo.svg" style="height: 18px" />
        </div>
        <div v-if="isBeta" class="beta-badge">BETA</div>
      </div>

      <div v-if="apiKey === ''" class="actions-container">
        <span class="header-button float-right" @click="goToSelfHostSetting"> Settings </span>
      </div>

      <div v-if="apiKey !== ''" class="actions-container">
        <span
          v-show="canShowSettingsButton"
          v-b-tooltip.hover.bottomleft
          class="header-button float-right"
          title="Settings"
          @click="onClickSettingButton"
        >
          <CogIcon />
        </span>

        <a
          v-if="isBeta"
          v-b-tooltip.hover.bottomleft
          :href="reportBugUri"
          target="_blank"
          class="header-button float-right"
          title="Report an issue"
        >
          <BugIcon />
        </a>

        <a
          v-b-tooltip.hover
          :href="`${apiUrl}/dashboard/`"
          target="_blank"
          class="dashboard-btn float-right"
          style="padding: 0.25rem 0.5rem; font-size: 0.875rem"
          title="Dashboard"
          :disabled="!useCompactLayout"
        >
          <span v-if="!useCompactLayout">Dashboard</span>
          <ExternalLinkAltIcon aria-hidden />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EventManager from '../utils/EventManager'
import { getHostName } from '../utils'
import { hasMovedRouterKey } from '../utils/keys'
import { useApiUrl } from '../composables/useApiUrl'
import CogIcon from '~icons/fa-solid/cog'
import BugIcon from '~icons/fa-solid/bug'
import ExternalLinkAltIcon from '~icons/fa-solid/external-link-alt'

withDefaults(
  defineProps<{
    useCompactLayout?: boolean
  }>(),
  {
    useCompactLayout: false
  }
)

const route = useRoute()
const router = useRouter()
const hasMovedRoutes = inject(hasMovedRouterKey)
const canBack = computed(() => hasMovedRoutes?.value || false)

const { apiUrl, apiKey, getApiKey, getApiUrl } = useApiUrl()
const showDropdownMenu = ref(false)
const isBeta = ref(process.env.BETA)
const canShowSettingsButton = ref(true)
const reportBugUri = ref('')

onMounted(async () => {
  EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, async () => {
    apiKey.value = await getApiKey()
    apiUrl.value = await getApiUrl()
  })

  setReportBugUri()
})

watch(route, (to) => {
  showDropdownMenu.value = false
  canShowSettingsButton.value = to.path !== '/app-settings'
})

const goToSelfHostSetting = () => {
  router.push('/self-host-setting')
}

const navigateBack = () => {
  if (canBack.value) {
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
    `(Optional) Affected website: ${hostname}\n(Optional) Browser info: ${navigator.userAgent}`
  )
  reportBugUri.value = `mailto:extension@simplelogin.io?subject=${subject}&body=${body}`
}
</script>
