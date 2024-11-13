<template>
  <div class="content">
    <BContainer class="p-3">
      <p>To get started, please follow these 3 simple steps:</p>

      <div class="mb-2">
        <BBadge variant="primary" pill>1</BBadge>
        Create your SimpleLogin account
        <BLink variant="primary" :href="`${apiUrl}/auth/register`" target="_blank">here</BLink>
        if this is not already done.
      </div>

      <div class="mb-2">
        <BBadge variant="primary" pill>2</BBadge>
        Create and copy your
        <em>API Key</em>
        <BLink variant="primary" :href="`${apiUrl}/dashboard/api_key`" target="_blank">here</BLink>.
      </div>

      <div class="mb-2">
        <BBadge variant="primary" pill>3</BBadge>
        Paste the
        <em>API Key</em> here 👇🏽
      </div>

      <BFormInput
        v-model="apiKey"
        placeholder="API Key"
        autofocus
        class="mt-3 w-100"
        @keyup.enter="saveApiKey"
      />

      <BButton type="button" variant="primary" class="w-100 mt-2" @click="saveApiKey"
        >Set API Key</BButton
      >
    </BContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { useGetUserInfo } from '../composables/useApi'
import { useToast } from '../composables/useToast'
import { useRouter } from 'vue-router'
import { useApiUrl } from '../composables/useApiUrl'

const toast = useToast()
const router = useRouter()

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
  await SLStorage.setItem('API_KEY', apiKey.value)
  EventManager.broadcast('SETTINGS_CHANGED')

  toast.success({ message: `Hi ${userName}!` })
  router.push('/main')
}
</script>
