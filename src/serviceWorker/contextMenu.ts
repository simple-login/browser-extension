import {handleNewRandomAlias} from './createAlias'
import browser from 'webextension-polyfill'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateAliasHandlerJS = (tab: browser.Tabs.Tab, res: any) => {
  if (tab.id === undefined) return
  const showSLDialog = () => {
    const slDialog = document.createElement('div')
    slDialog.style.position = 'fixed'
    slDialog.style.bottom = '0'
    slDialog.style.right = '0'
    slDialog.style.margin = '0.7em'
    slDialog.style.padding = '0.7em'
    slDialog.style.fontFamily = 'Verdana, Arial, Helvetica, sans-serif'
    slDialog.style.fontSize = '1em'
    slDialog.style.pointerEvents = 'none'
    slDialog.style.zIndex = '999999'
    slDialog.style.background = 'white'
    slDialog.style.border = '2px solid #777'
    slDialog.style.borderRadius = '5px'
    slDialog.innerText = JSON.stringify(
      res.alias ? res.alias + ' copied to clipboard' : 'ERROR: ' + res.error
    )

    document.body.appendChild(slDialog)

    browser.alarms.create('removeChild', {
      delayInMinutes: 0.05,
    })

    browser.alarms.onAlarm.addListener((alarm) => {
      alarm.name === 'removeChild' && document.body.removeChild(slDialog)
    })
  }

  const copyTextToClipboard = () => {
    const text = JSON.stringify(res.alias)
    if (!text) return
    const textArea = document.createElement('textarea')
    textArea.value = text

    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    navigator.clipboard.writeText(text).catch()

    document.body.removeChild(textArea)
  }

  const fun = () => {
    showSLDialog()
    copyTextToClipboard()
  }

  browser.scripting.executeScript({
    target: {tabId: tab.id},
    func: fun,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleOnClickContextMenu = async (info: any, tab: browser.Tabs.Tab) => {
  const res = await handleNewRandomAlias(info.pageUrl)
  generateAliasHandlerJS(tab, res)
}

export {handleOnClickContextMenu, generateAliasHandlerJS}
