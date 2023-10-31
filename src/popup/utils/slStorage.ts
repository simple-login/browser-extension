import {cloneObject} from './commonUtils'
import browser from 'webextension-polyfill'
import type {useTheme} from '../composables'

const TEMP: Record<string, unknown> = {}

const settings = {
  apiUrl: 'apiUrl',
  apiKey: 'apiKey',
  notAskingRate: 'notAskingRate',
  showSLButton: 'showSLButton',
  slButtonPosition: 'SLButtonPosition',
  slTheme: 'SLTheme',
} as const

type SettingsList = (typeof settings)[keyof typeof settings]

const defaultSettings = {
  [settings.apiUrl]: devConfig ? devConfig.DEFAULT_API_URL : 'https://app.simplelogin.io',
  [settings.apiKey]: '',
  [settings.notAskingRate]: false,
  [settings.showSLButton]: true,
  [settings.slButtonPosition]: 'right-inside',
  [settings.slTheme]: 'auto' as ReturnType<typeof useTheme>['mode']['value'],
} as const

const set = (key: SettingsList, value: any) => {
  return browser.storage.sync.set({[key]: value})
}

const get = async <T>(key: SettingsList): Promise<T> => {
  const data = await browser.storage.sync.get(key)

  if (data[key] === undefined || data[key] === null) {
    return defaultSettings[key] || ''
  } else {
    return data[key]
  }
}

const remove = (key: SettingsList) => {
  return browser.storage.sync.remove(key)
}

const clear = () => {
  return browser.storage.sync.clear()
}

const setTemporary = (key: string, value: Record<string, unknown>) => {
  TEMP[key] = cloneObject(value)
}

const getTemporary = <T>(key: string): T => {
  return TEMP[key] as T
}

export default {
  set,
  get,
  remove,
  clear,
  setTemporary,
  getTemporary,
  settings,
  defaultSettings,
}
