import { tabs } from 'webextension-polyfill'

export const deepClone = <T>(obj: Readonly<T>): T => JSON.parse(JSON.stringify(obj))

const getIsFirefox = () => navigator.userAgent.includes('Firefox')

export const getDeviceName = () =>
  `${
    getIsFirefox() ? 'Firefox' : 'Chrome' // This assumes Chrome as the default, which might not be accurate
  } (${navigator.platform})`

export const getHostName = async (currentUrl: string | undefined = undefined) => {
  try {
    if (currentUrl) {
      const url = new URL(currentUrl)
      return url.hostname
    } else {
      const [{ url }] = await tabs.query({
        active: true,
        currentWindow: true
      })
      if (!url) return ''
      const newUrl = new URL(url)
      return newUrl.hostname
    }
  } catch (error) {
    console.log(error)
    return ''
  }
}

export const getDefaultNote = async () => {
  const hostName = await getHostName()
  let note = ''

  // ignore hostName that doesn't look like an url
  if (hostName && hostName.indexOf('.') > -1) {
    note = `Used on ${hostName}`
  }

  return note
}

export const getExtensionURL = () =>
  getIsFirefox()
    ? 'https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/'
    : 'https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn'

export const getRandomIntBetween = (min: number, max: number) =>
  Math.floor(min + Math.random() * Math.floor(max))
