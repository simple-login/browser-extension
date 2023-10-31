import browser from 'webextension-polyfill'
import {SLStorage} from '../popup/utils'

const initService = () => {
  browser.runtime.onInstalled.addListener(async ({reason}) => {
    if (reason === 'install') {
      await SLStorage.clear()

      const apiUrl = await SLStorage.get(SLStorage.settings.apiUrl)
      await browser.tabs.create({
        url: `${apiUrl}/onboarding`,
      })
    }
  })
}

export default {initService}
