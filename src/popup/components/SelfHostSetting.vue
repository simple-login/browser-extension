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
          v-on:keyup.enter="saveApiUrl"
          placeholder="https://app.simplelogin.io"
          autofocus
          class="form-control mt-3 w-100"
        />
        <button @click="saveApiUrl" class="btn btn-primary btn-block mt-2">Set API URL</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {showSuccess, EventManager, SLStorage} from '../utils'

const apiUrl = ref('')

onMounted(async () => {
  apiUrl.value = await SLStorage.get(SLStorage.settings.apiUrl)
})

const saveApiUrl = async () => {
  // remove last slash
  apiUrl.value = apiUrl.value.replace(/\/$/, '')

  // save apiUrl to storage
  await SLStorage.set(
    SLStorage.settings.apiUrl,
    apiUrl.value !== '' ? apiUrl.value : SLStorage.defaultSettings[SLStorage.settings.apiUrl]
  )
  EventManager.broadcast(EventManager.settingsChangedEvent)

  showSuccess('API URL saved successfully')
}
</script>
