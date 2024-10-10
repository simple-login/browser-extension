<template>
  <div v-if="show" style="height: 400px">
    <div class="splash overlay">
      <div class="overlay-content">
        <img class="logo" src="/images/horizontal-logo.svg" /><br />
        <img class="loading" src="/images/loading.svg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { getDeviceName } from '../utils'
import { useRouter } from 'vue-router'
import { API_ON_ERR, usePostGetApiKeyFromCookie } from '../composables/useApi'
import { useApiUrl } from '../composables/useApiUrl'

defineOptions({
  name: 'SlLoading'
})

const router = useRouter()

const { apiKey } = useApiUrl()
const show = ref(false)

let timeoutId: null | ReturnType<typeof setTimeout> = null

const { post, data } = usePostGetApiKeyFromCookie({
  onError: API_ON_ERR.IGNORE,
  data: {
    device: getDeviceName()
  },
  useFetchOptions: {
    onFetchError(ctx) {
      router.push('/login')
      return ctx
    }
  }
})

onMounted(async () => {
  // only show after waiting for more than 500ms
  timeoutId = setTimeout(() => {
    show.value = true
  }, 500)

  if (apiKey.value !== '') {
    router.push('/main')
  } else {
    await post()
    apiKey.value = data.value?.api_key || ''
    if (apiKey.value) {
      await SLStorage.setItem(SLStorage.SETTINGS.API_KEY, apiKey.value)
      EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)

      router.push('/main')
    } else {
      router.push('/login')
    }
  }
})
onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>
