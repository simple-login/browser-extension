<template>
  <div class="header">
    <BRow
      class="mt-2 pb-2 ms-3 me-2 align-items-center"
      style="border-bottom: 1px var(--delimiter-color) solid"
    >
      <!-- Left section: Back button and logo -->
      <BCol cols="6" class="d-flex align-items-center">
        <div
          :class="{ back: canGoBack }"
          style="display: inline-block; color: var(--text-color)"
          @click="navigateBack()"
        >
          <img
            v-if="canGoBack"
            src="/images/back-button.svg"
            class="invertable"
            style="height: 20px"
          />
          <img class="sl-logo ms-2" src="/images/horizontal-logo.svg" style="height: 18px" />
        </div>
        <div v-if="isBeta" class="beta-badge ms-2">BETA</div>
      </BCol>

      <!-- Right section: Settings and Dashboard buttons -->
      <BCol cols="6" class="d-flex justify-content-end align-items-center">
        <span v-if="!apiKey" class="header-button" @click="goToSelfHostSetting">Settings</span>

        <template v-else>
          <BLink
            v-b-tooltip.hover
            icon
            variant="primary"
            :href="`${apiUrl}/dashboard/`"
            target="_blank"
            class="dashboard-btn ms-2"
            style="
              display: inline-flex;
              align-items: center;
              padding: 0.25rem 0.5rem;
              font-size: 0.875rem;
            "
            title="Dashboard"
            :disabled="!useCompactLayout"
          >
            <span v-if="!useCompactLayout">Dashboard</span>
            <ExternalLinkAltIcon aria-hidden class="ms-1" />
          </BLink>

          <BugIcon
            v-if="isBeta"
            v-b-tooltip.hover.bottomleft
            :href="reportBugUri"
            target="_blank"
            class="header-button ms-2"
            aria-label="Report an issue"
            title="Report an issue"
            aria-hidden
          />

          <CogIcon
            v-show="canShowSettingsButton"
            v-b-tooltip.hover.bottomleft
            class="header-button ms-2"
            title="Settings"
            aria-label="To settings"
            @click="onClickSettingButton"
          />
        </template>
      </BCol>
    </BRow>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EventManager from '../utils/EventManager'
import { getHostName } from '../utils'
import { useApiUrl } from '../composables/useApiUrl'
import CogIcon from '~icons/fa-solid/cog'
import BugIcon from '~icons/fa-solid/bug'
import ExternalLinkAltIcon from '~icons/fa-solid/external-link-alt'
import { useBackButton } from '@/composables/useBackButton'

defineProps<{
  useCompactLayout: boolean
}>()

const route = useRoute()
const router = useRouter()

const { apiUrl, apiKey, fetchData: fetchApiData } = await useApiUrl()
const showDropdownMenu = ref(false)
const isBeta = !!import.meta.env.VITE_BETA
const canShowSettingsButton = ref(true)
const reportBugUri = ref('')

onMounted(async () => {
  EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, fetchApiData)

  setReportBugUri()
})

watch(route, (to) => {
  showDropdownMenu.value = false
  canShowSettingsButton.value = to.path !== '/app-settings'
})

const goToSelfHostSetting = () => {
  router.push('/self-host-setting')
}

const { canGoBack, push: navigateBack } = useBackButton()

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
