<template>
  <div class="content">
    <div class="p-3 container">
      <p>To get started, please follow these 3 simple steps:</p>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">1</span>
        Create your SimpleLogin account
        <a :href="apiUrl + '/auth/register'" target="_blank">here</a>
        if this is not already done.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">2</span>
        Create and copy your
        <em>API Key</em>
        <a :href="apiUrl + '/dashboard/api_key'" target="_blank">here</a>.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">3</span>
        Paste the
        <em>API Key</em> here 👇🏽
      </div>

      <input
        v-model="apiKey"
        v-on:keyup.enter="saveApiKey"
        placeholder="API Key"
        autofocus
        class="form-control mt-3 w-100"
      />

      <button @click="saveApiKey" class="btn btn-primary btn-block mt-2">Set API Key</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {EventManager, SLStorage, showError, showSuccess, getUserInfo} from '../utils'
import {useRouterExtensions} from '../composables'

const apiKey = ref('')
const apiUrl = ref('')
const routerExtensions = useRouterExtensions()

onMounted(async () => {
  apiUrl.value = await SLStorage.get(SLStorage.settings.apiUrl)
})

const saveApiKey = async () => {
  if (apiKey.value.trim() === '') {
    showError('API Key cannot be empty')
    return
  }

  // check api key
  try {
    const {data} = await getUserInfo()

    const userName = data.name || data.email
    await SLStorage.set(SLStorage.settings.apiKey, apiKey.value)
    EventManager.broadcast(EventManager.settingsChangedEvent)

    showSuccess(`Hi ${userName}!`)
    routerExtensions.clearHistoryAndNavigateTo('/main')
  } catch (err) {
    showError('Incorrect API Key.')
  }
}
</script>
