import type { UsePostNewRandomAliasReturn } from '../composables/useApi'
import { handleNewRandomAlias } from './create-alias'
import { scripting, type Menus, type Tabs } from 'webextension-polyfill'

const displayAndCopy = (alias: string, error: unknown) => {
  const copyTextToClipboard = (text: string) => {
    if (!text) return
    const textArea = document.createElement('textarea')
    textArea.value = text

    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (err) {
      /** Empty */
    }

    document.body.removeChild(textArea)
  }

  const showSLDialog = (message: unknown) => {
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
    slDialog.innerText = JSON.stringify(message)

    document.body.appendChild(slDialog)

    setTimeout(() => {
      document.body.removeChild(slDialog)
    }, 3000)
  }

  showSLDialog(alias ? `${alias} copied to clipboard` : `ERROR: ${error}`)
  copyTextToClipboard(alias)
}

export const generateAliasHandlerJS = async (
  tab: Tabs.Tab | undefined,
  res: UsePostNewRandomAliasReturn | { error: unknown }
) => {
  if (!tab?.id) return
  await scripting.executeScript({
    target: { tabId: tab?.id },
    func: displayAndCopy,
    args: [('alias' in res ? res.alias : '') || null, res.error || null]
  })
  console.log('injected a function')
}

export const handleOnClickContextMenu = async (
  { pageUrl }: Menus.OnClickData,
  tab: Tabs.Tab | undefined
) => {
  const res = await handleNewRandomAlias(pageUrl)
  generateAliasHandlerJS(tab, res)
}
