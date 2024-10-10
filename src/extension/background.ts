import { runtime, tabs, commands, contextMenus } from 'webextension-polyfill'
import SLStorage from '../utils/SLStorage'
import { initService as onboardingInitService } from './onboarding'
import { setupContentScript } from './content-script'

import { handleNewRandomAlias } from './create-alias'
import { handleOnClickContextMenu, generateAliasHandlerJS } from './context-menu'
import { getDeviceName } from '../utils'
import { apiKeyRoute, initService as initApiService } from '../utils/api'

setupContentScript()
/**
 * Get app settings
 */
const handleGetAppSettings = async () => {
  return {
    showSLButton:
      (await SLStorage.getItem(SLStorage.SETTINGS.API_KEY)) !== '' &&
      (await SLStorage.getItem(SLStorage.SETTINGS.SHOW_SL_BUTTON)),
    SLButtonPosition: await SLStorage.getItem(SLStorage.SETTINGS.SL_BUTTON_POSITION)
  }
}

const handleExtensionSetup = async () => {
  const apiUrl = await SLStorage.getItem(SLStorage.SETTINGS.API_URL)

  const url = `${apiUrl}${apiKeyRoute}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device: getDeviceName()
    })
  })

  if (res.ok) {
    const apiRes = await res.json()
    const apiKey = apiRes.api_key
    if (apiKey) {
      await SLStorage.setItem(SLStorage.SETTINGS.API_KEY, apiKey)

      const [{ id }] = await tabs.query({
        active: true,
        currentWindow: true
      })

      const url = `${apiUrl}/onboarding/final`
      await tabs.update(id, {
        url
      })
    } else {
      console.error('Received null API Key')
    }
  } else {
    console.error('api error')
  }
}

/**
 * Check if a message comes from an authorized source
 * @param {string} url
 * @returns boolean
 */
const isMessageAllowed = (url: string) => {
  const requestUrl = new URL(url)
  const sett = SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL]
  const apiUrl = new URL(typeof sett === 'boolean' ? '' : sett)

  const allowedSources = [
    new RegExp(apiUrl.hostname),
    new RegExp('^app\\.simplelogin\\.io$'),
    new RegExp('^.*\\.protonmail\\.ch$'),
    new RegExp('^.*\\.protonmail\\.com$')
  ]

  const extraAllowedDomains = SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.EXTRA_ALLOWED_DOMAINS]
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
 * @return {{data: {version: string}, tag: string}}
 */
const handleExtensionInstalledQuery = () => {
  const manifest = runtime.getManifest()
  return {
    tag: 'EXTENSION_INSTALLED_RESPONSE',
    data: {
      version: manifest.version
    }
  }
}

/**
 * Register onMessage listener
 */
runtime.onMessage.addListener(async (request, sender) => {
  // Check messages allowed from everywhere
  if (request.tag === 'NEW_RANDOM_ALIAS') {
    return await handleNewRandomAlias(request.currentUrl)
  } else if (request.tag === 'GET_APP_SETTINGS') {
    return await handleGetAppSettings()
  }

  // Check messages allowed only from authorized sources
  if (!isMessageAllowed(sender.url || '')) return

  if (request.tag === 'EXTENSION_SETUP') {
    return await handleExtensionSetup()
  } else if (request.tag === 'EXTENSION_INSTALLED_QUERY') {
    return handleExtensionInstalledQuery()
  }
})

/**
 * Register context menu
 */
contextMenus.create({
  id: 'sl-random',
  title: 'Create random email alias (copied)',
  contexts: ['all']
})

contextMenus.onClicked.addListener(handleOnClickContextMenu)

/**
 * Shortcuts and hotkeys listener
 */
commands.onCommand.addListener(async (command) => {
  if (command === 'generate-random-alias') {
    const [currentTab] = await tabs.query({ active: true, currentWindow: true })
    const res = await handleNewRandomAlias(currentTab.url)
    generateAliasHandlerJS(currentTab, res)
  }
})

initApiService()
onboardingInitService()
