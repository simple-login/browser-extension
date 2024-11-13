import { ref } from 'vue'
import SLStorage from '../utils/SLStorage'

export const useApiUrl = async (opts: { immediate?: boolean } = { immediate: true }) => {
  const apiUrl = ref('')
  const apiUrlLoading = ref(false)
  const apiKey = ref('')
  const apiKeyLoading = ref(false)

  const getApiUrl = async () => {
    try {
      apiUrlLoading.value = true
      const resp = await SLStorage.getItem('API_URL')
      apiUrl.value = resp
      return resp
    } finally {
      apiUrlLoading.value = false
    }
  }
  const getApiKey = async () => {
    try {
      apiKeyLoading.value = true
      const resp = await SLStorage.getItem('API_KEY')
      apiKey.value = resp
      return resp
    } finally {
      apiKeyLoading.value = false
    }
  }

  const fetchData = async () => {
    if (opts.immediate) {
      await Promise.all([getApiUrl(), getApiKey()])
    }
  }

  if (opts.immediate) {
    await fetchData()
  }

  return { apiUrl, apiKey, apiUrlLoading, apiKeyLoading, getApiUrl, getApiKey, fetchData }
}
