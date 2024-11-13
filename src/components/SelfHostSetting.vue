<template>
  <div class="content">
    <div class="p-3">
      <div class="mb-2">
        If you self-host SimpleLogin, you can change the API URL to your server address.
      </div>
      <div class="mb-2">The default API URL is https://app.simplelogin.io</div>

      <div style="margin: auto">
        <BFormInput
          v-model="apiUrl"
          placeholder="https://app.simplelogin.io"
          autofocus
          class="mt-3 w-100"
          @keyup.enter="saveApiUrl"
        />
        <BButton type="button" variant="primary" class="w-100 mt-2" @click="saveApiUrl"
          >Set API URL</BButton
        >
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

const { apiUrl } = await useApiUrl()

const saveApiUrl = async () => {
  // remove last slash
  apiUrl.value = apiUrl.value.replace(/\/$/, '')

  // save apiUrl to storage
  await SLStorage.setItem(
    'API_URL',
    apiUrl.value.trim() !== '' ? apiUrl.value : SLStorage.DEFAULT_SETTINGS['API_URL']
  )
  EventManager.broadcast('SETTINGS_CHANGED')

  toast.success({ message: 'API URL saved successfully' })
}
</script>
