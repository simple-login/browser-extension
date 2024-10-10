import { ref, onMounted } from 'vue'
import SLStorage from '../utils/SLStorage'

export const useApiUrl = (opts: { immediate?: boolean } = { immediate: true }) => {
  const apiUrl = ref('')
  const apiUrlLoading = ref(false)
  const apiKey = ref('')
  const apiKeyLoading = ref(false)

  const getApiUrl = async () => {
    try {
      apiUrlLoading.value = true
      return await SLStorage.getItem(SLStorage.SETTINGS.API_URL)
    } finally {
      apiUrlLoading.value = false
    }
  }
  const getApiKey = async () => {
    try {
      apiKeyLoading.value = true
      return await SLStorage.getItem(SLStorage.SETTINGS.API_KEY)
    } finally {
      apiKeyLoading.value = false
    }
  }

  onMounted(async () => {
    if (opts.immediate) {
      apiUrl.value = await getApiUrl()
      apiKey.value = await getApiKey()
    }
  })

  return { apiUrl, apiKey, apiUrlLoading, apiKeyLoading, getApiUrl, getApiKey }
}
