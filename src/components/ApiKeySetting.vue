<template>
  <div class="content">
    <div class="p-3 container">
      <p>To get started, please follow these 3 simple steps:</p>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">1</span>
        Create your SimpleLogin account
        <a :href="`${apiUrl}/auth/register`" target="_blank">here</a>
        if this is not already done.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">2</span>
        Create and copy your
        <em>API Key</em>
        <a :href="`${apiUrl}/dashboard/api_key`" target="_blank">here</a>.
      </div>

      <div class="mb-2">
        <span class="badge badge-primary badge-pill">3</span>
        Paste the
        <em>API Key</em> here 👇🏽
      </div>

      <input
        v-model="apiKey"
        placeholder="API Key"
        autofocus
        class="form-control mt-3 w-100"
        @keyup.enter="saveApiKey"
      />

      <button class="btn btn-primary btn-block mt-2" @click="saveApiKey">Set API Key</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { useGetUserInfo } from '../composables/useApi'
import { useToast } from '../composables/useToast'
import { useRouter } from 'vue-router'
import { hasMovedRouterKey } from '../utils/keys'
import { useApiUrl } from '../composables/useApiUrl'

const toast = useToast()
const router = useRouter()

const hasMovedRoutes = inject(hasMovedRouterKey)

const apiKey = ref('')
const { apiUrl } = await useApiUrl()

const { execute, data } = useGetUserInfo({
  useFetchOptions: {
    onFetchError(ctx) {
      ctx.error.customMessage = 'Incorrect API Key'
      return ctx
    }
  }
})

const saveApiKey = async () => {
  if (!apiKey.value) {
    toast.error({ message: 'API Key cannot be empty' })
    return
  }
  await execute()
  const userName = data.value?.name || data.value?.email
  await SLStorage.setItem(SLStorage.SETTINGS.API_KEY, apiKey.value)
  EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)

  toast.success({ message: `Hi ${userName}!` })
  router.push('/main')
  if (hasMovedRoutes !== undefined) hasMovedRoutes.value = false
}
</script>
