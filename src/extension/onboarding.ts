import { runtime, tabs } from 'webextension-polyfill'
import SLStorage from '../utils/SLStorage'

export const initService = () => {
  runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      await SLStorage.clear()

      const apiUrl = await SLStorage.getItem(SLStorage.SETTINGS.API_URL)
      await tabs.create({
        url: `${apiUrl}/onboarding`
      })
    }
  })
}
