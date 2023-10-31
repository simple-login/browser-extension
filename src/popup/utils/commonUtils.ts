import browser from 'webextension-polyfill'
import buildConfig from './buildConfig.json'

let toasted = null

const getRandomIntBetween = (min: number, max: number) => {
  return Math.floor(min + Math.random() * Math.floor(max))
}

const getHostName = async (currentUrl?: string | URL) => {
  try {
    if (currentUrl) {
      const url = new URL(currentUrl)
      return url.hostname
    } else {
      const result = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      const res = result[0].url
      if (res === undefined) throw new Error('URL is undefined')
      const url = new URL(res)
      return url.hostname
    }
  } catch (error) {
    console.log(error)
  }
}

const getDefaultNote = async () => {
  const hostName = await getHostName()
  let note = ''

  // ignore hostName that doesn't look like an url
  if (hostName && hostName.indexOf('.') > -1) {
    note = `Used on ${hostName}`
  }

  return note
}

const getDeviceName = () => {
  const isFirefox = typeof InstallTrigger !== 'undefined'
  const browserName = isFirefox ? 'Firefox' : 'Chrome'
  return `${browserName} (${navigator.platform})`
}

const getExtensionURL = () => {
  const isFirefox = typeof InstallTrigger !== 'undefined',
    firefoxExtensionUrl = 'https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/',
    chromeExtensionUrl =
      'https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn'
  return isFirefox ? firefoxExtensionUrl : chromeExtensionUrl
}

const setToasted = ($toasted) => {
  toasted = $toasted
}

const showSuccess = (message: string) => {
  if (toasted) {
    toasted.show(message, {
      type: 'success',
      duration: 2500,
    })
  }
}

const showError = (message: string) => {
  if (toasted) {
    toasted.show(message, {
      type: 'error',
      duration: 3000,
      action: {
        text: '×',
        onClick: (e, toastObject) => {
          toastObject.goAway(0)
        },
      },
    })
  }
}

const cloneObject = (obj: Record<string, unknown>) => {
  return JSON.parse(JSON.stringify(obj))
}

const getBuildConfig = () => {
  return buildConfig
}

export {
  getRandomIntBetween,
  getHostName,
  getDefaultNote,
  getDeviceName,
  getExtensionURL,
  setToasted,
  showSuccess,
  showError,
  cloneObject,
  getBuildConfig,
}
