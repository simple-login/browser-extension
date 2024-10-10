import { tabs, scripting } from 'webextension-polyfill'
import SLStorage from '../utils/SLStorage'

export const setupContentScript = () => {
  const apiUrl = SLStorage.getItem(SLStorage.SETTINGS.API_URL)

  tabs.onUpdated.addListener(async (_, __, tab) => {
    if (
      tab.url?.startsWith('chrome') || // chrome internal pages
      tab.url?.startsWith('about') || // firefox internal pages
      tab.url?.startsWith('moz') || // firefox internal pages
      tab.url?.startsWith(await apiUrl) // app domain
    )
      return

    try {
      await scripting.registerContentScripts([
        {
          id: 'input-tools',
          js: ['assets/content_script/input_tools.js'],
          css: ['assets/content_script/input_tools.css'],
          persistAcrossSessions: false,
          matches: ['*://*/*'],
          runAt: 'document_idle'
        }
      ])
      console.log('registration input tools complete')
    } catch (err) {
      console.warn('unexpected error', err)
    }
  })
}
