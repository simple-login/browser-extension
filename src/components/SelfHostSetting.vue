<template>
  <div class="content">
    <div class="p-3">
      <div class="mb-2">
        If you self-host SimpleLogin, you can change the API URL to your server address.
      </div>
      <div class="mb-2">The default API URL is https://app.simplelogin.io</div>

      <div style="margin: auto">
        <input
          v-model="apiUrl"
          placeholder="https://app.simplelogin.io"
          autofocus
          class="form-control mt-3 w-100"
          @keyup.enter="saveApiUrl"
        />
        <button class="btn btn-primary btn-block mt-2" @click="saveApiUrl">Set API URL</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { useToast } from '../composables/useToast'
import { useApiUrl } from '../composables/useApiUrl'

const toast = useToast()

const { apiUrl } = useApiUrl()

const saveApiUrl = async () => {
  // remove last slash
  apiUrl.value = apiUrl.value.replace(/\/$/, '')

  // save apiUrl to storage
  await SLStorage.setItem(
    SLStorage.SETTINGS.API_URL,
    apiUrl.value.trim() !== ''
      ? apiUrl.value
      : SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL]
  )
  EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)

  toast.success({ message: 'API URL saved successfully' })
}
</script>
