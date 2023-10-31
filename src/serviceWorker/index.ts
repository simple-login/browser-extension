import browser from 'webextension-polyfill'
import Onboarding from './onboarding'
import './content-script'

import {handleNewRandomAlias} from './createAlias'
import {handleOnClickContextMenu, generateAliasHandlerJS} from './contextMenu'
import {
  getApiKeyFromCookie,
  getDeviceName,
  SLStorage,
  initService as initApiService,
} from '../popup/utils'

window.isBackgroundJS = true

/**
 * Get app settings
 */
const handleGetAppSettings = async () => {
  return {
    showSLButton:
      (await SLStorage.get(SLStorage.settings.apiKey)) !== '' &&
      (await SLStorage.get(SLStorage.settings.showSLButton)),
    SLButtonPosition: await SLStorage.get(SLStorage.settings.slButtonPosition),
  }
}

const handleExtensionSetup = async () => {
  const apiUrl = await SLStorage.get(SLStorage.settings.apiUrl)
  try {
    const {
      data: {api_key: apiKey},
    } = await getApiKeyFromCookie({
      device: getDeviceName(),
    })

    if (apiKey) {
      await SLStorage.set(SLStorage.settings.apiKey, apiKey)

      const currentTab = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })

      const url = `${apiUrl}/onboarding/final`
      await browser.tabs.update(currentTab[0].id, {
        url,
      })
    } else {
      console.error('Received null API Key')
    }
  } catch (e) {
    // Probably the user is not logged in
    console.error(e)
  }
}

/**
 * Check if a message comes from an authorized source
 */
const isMessageAllowed = (url: string) => {
  const requestUrl = new URL(url)
  const apiUrl = new URL(SLStorage.defaultSettings[SLStorage.settings.apiUrl])

  const allowedSources = [
    new RegExp(apiUrl.hostname),
    new RegExp('^app\\.simplelogin\\.io$'),
    new RegExp('^.*\\.protonmail\\.ch$'),
    new RegExp('^.*\\.protonmail\\.com$'),
  ]

  const extraAllowedDomains = SLStorage.defaultSettings[SLStorage.settings.extraAllowedDomains]
  for (const extra of extraAllowedDomains) {
    allowedSources.push(new RegExp(extra))
  }

  for (const source of allowedSources) {
    if (source.test(requestUrl.host)) return true
  }
  return false
}

/**
 * Handle the event of a page querying if the SL extension is installed
 */
const handleExtensionInstalledQuery = (): {data: {version: string}; tag: string} => {
  const manifest = browser.runtime.getManifest()
  return {
    tag: 'EXTENSION_INSTALLED_RESPONSE',
    data: {
      version: manifest.version,
    },
  }
}

/**
 * Register onMessage listener
 */
browser.runtime.onMessage.addListener(async (request, sender) => {
  // Check messages allowed from everywhere
  if (request.tag === 'NEW_RANDOM_ALIAS') {
    return await handleNewRandomAlias(request.currentUrl)
  } else if (request.tag === 'GET_APP_SETTINGS') {
    return await handleGetAppSettings()
  }

  // Check messages allowed only from authorized sources
  if (sender.url !== undefined && !isMessageAllowed(sender.url)) return

  if (request.tag === 'EXTENSION_SETUP') {
    return await handleExtensionSetup()
  } else if (request.tag === 'EXTENSION_INSTALLED_QUERY') {
    return handleExtensionInstalledQuery()
  }
})

/**
 * Register context menu
 */
browser.contextMenus.create({
  title: 'Create random email alias (copied)',
  contexts: ['all'],
  onclick: handleOnClickContextMenu,
})

/**
 * Shortcuts and hotkeys listener
 */
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'generate-random-alias') {
    const currentTab = (await browser.tabs.query({active: true, currentWindow: true}))[0]
    if (currentTab.url === undefined) return
    const res = await handleNewRandomAlias(currentTab.url)
    generateAliasHandlerJS(currentTab, res)
  }
})

initApiService()
Onboarding.initService()
