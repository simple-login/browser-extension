import browser from 'webextension-polyfill'
import {SLStorage} from '../popup/utils'

const setupContentScript = () => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const apiUrl = await SLStorage.get<string>(SLStorage.settings.apiUrl)
    if (
      tab.url?.startsWith('chrome') || // chrome internal pages
      tab.url?.startsWith('about') || // firefox internal pages
      tab.url?.startsWith('moz') || // firefox internal pages
      tab.url?.startsWith(apiUrl) // app domain
    ) {
      return
    }

    await browser.scripting.executeScript({
      target: {tabId},
      files: ['content_script/input_tools.js'],
    })

    await browser.scripting.insertCSS({
      target: {tabId},
      files: ['content_script/input_tools.css'],
    })
  })
}

setupContentScript()
