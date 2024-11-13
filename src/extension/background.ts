import { runtime, tabs, commands, contextMenus } from 'webextension-polyfill'
import SLStorage from '../utils/SLStorage'
import { initService as onboardingInitService } from './onboarding'

import { handleNewRandomAlias } from './create-alias'
import { handleOnClickContextMenu, generateAliasHandlerJS } from './context-menu'
import { getDeviceName } from '../utils'
import { apiKeyRoute, initService as initApiService } from '../utils/api'

const finalizeExtensionSetup = async (apiKey: string) => {
  if (!apiKey) {
    return
  }

  await SLStorage.setItem('API_KEY', apiKey)

  const currentTab = await tabs.query({
    active: true,
    currentWindow: true
  })

  const apiUrl = await SLStorage.getItem('API_URL')
  const url = `${apiUrl}/onboarding/final`
  await tabs.update(currentTab[0].id, {
    url
  })
}

/**
 * Get app settings
 */
const handleGetAppSettings = async () => {
  return {
    showSLButton:
      (await SLStorage.getItem('API_KEY')) !== '' && (await SLStorage.getItem('SHOW_SL_BUTTON')),
    SLButtonPosition: await SLStorage.getItem('SL_BUTTON_POSITION')
  }
}

const handleExtensionSetup = async () => {
  const apiUrl = await SLStorage.getItem('API_URL')

  const url = `${apiUrl}${apiKeyRoute}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'X-Sl-Allowcookies': true as any
    },
    body: JSON.stringify({
      device: getDeviceName()
    })
  })

  if (res.ok) {
    const apiRes = await res.json()
    const apiKey = apiRes.api_key
    await finalizeExtensionSetup(apiKey)
  } else {
    console.error('api error')
  }
}

/**
 * Check if a message comes from an authorized source
 * @param {string} url
 * @returns Promise<boolean>
 */
const isMessageAllowed = async (url: string) => {
  const requestUrl = new URL(url)
  const apiUrlValue = (await SLStorage.getItem('API_URL')) as string
  const apiUrl = new URL(apiUrlValue)

  const allowedSources = [
    new RegExp(apiUrl.hostname),
    new RegExp('^app\\.simplelogin\\.io$'),
    new RegExp('^.*\\.protonmail\\.ch$'),
    new RegExp('^.*\\.protonmail\\.com$')
  ]

  const extraAllowedDomains = SLStorage.DEFAULT_SETTINGS['EXTRA_ALLOWED_DOMAINS']
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
runtime.onMessage.addListener(async (request: any, sender) => {
  // Check messages allowed from everywhere
  if (request.tag === 'NEW_RANDOM_ALIAS') {
    return await handleNewRandomAlias(request.currentUrl)
  } else if (request.tag === 'GET_APP_SETTINGS') {
    return await handleGetAppSettings()
  }

  // Check messages allowed only from authorized sources
  const messageAllowed = await isMessageAllowed(sender.url || '')
  if (!messageAllowed) return

  if (request.tag === 'EXTENSION_SETUP') {
    // On Safari the background script won't set cookies properly in API calls (see https://bugs.webkit.org/show_bug.cgi?id=260676),
    // so we will return the API URL to the content script which will make the API call with cookies properly set
    return import.meta.env.VITE_MAC
      ? await SLStorage.getItem('API_URL')
      : await handleExtensionSetup()
  } else if (request.tag === 'EXTENSION_INSTALLED_QUERY') {
    return handleExtensionInstalledQuery()
  } else if (request.tag === 'SAFARI_FINALIZE_EXTENSION_SETUP') {
    return await finalizeExtensionSetup(request.data)
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
