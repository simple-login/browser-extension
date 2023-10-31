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
import {ref, onBeforeUnmount, onMounted} from 'vue'
import {EventManager, SLStorage, getApiKeyFromCookie, getDeviceName} from '../utils'
import {useRouter} from 'vue-router'

const router = useRouter()

const show = ref(false)
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

const init = async () => {
  let apiKey = await SLStorage.get(SLStorage.settings.apiKey)

  // only show after waiting for more than 500ms
  timeoutId.value = setTimeout(() => {
    show.value = true
  }, 500)

  if (apiKey !== '') {
    router.push('/main')
  } else {
    // try to get api key when user is already logged in
    try {
      const {data} = await getApiKeyFromCookie({
        device: getDeviceName(),
      })

      apiKey = data.api_key || ''
      if (apiKey) {
        await SLStorage.set(SLStorage.settings.apiKey, apiKey)
        EventManager.broadcast(EventManager.settingsChangedEvent)

        router.push('/main')
      } else {
        router.push('/login')
      }
    } catch (err) {
      // user is probably not logged in
      router.push('/login')
    }
  }
}

onMounted(init)

onBeforeUnmount(() => {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value)
  }
})
</script>
