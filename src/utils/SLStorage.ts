import { storage as browserStorage } from 'webextension-polyfill'
import { THEME_SYSTEM, type THEME_DARK, type THEME_LIGHT } from './constants'
import { deepClone } from '.'

const TEMP: Record<string, unknown> = {}

class SLStorage {
  static SETTINGS = {
    API_URL: 'apiUrl',
    API_KEY: 'apiKey',
    NOT_ASKING_RATE: 'notAskingRate',
    SHOW_SL_BUTTON: 'showSLButton',
    SL_BUTTON_POSITION: 'SLButtonPosition',
    THEME: 'SLTheme',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EXTRA_ALLOWED_DOMAINS: [] as any,
    DEFAULT_DOMAIN_FOR_SUFFIX: null as string | null,
    ALIAS_PREFIX_MUSTACHE_TEMPLATE: null as string | null
  } as const

  static DEFAULT_SETTINGS = {
    API_URL: import.meta.env.VITE_DEFAULT_API_URL || 'https://app.simplelogin.io',
    API_KEY: '',
    NOT_ASKING_RATE: false,
    SHOW_SL_BUTTON: true,
    SL_BUTTON_POSITION: 'right-inside',
    THEME: THEME_SYSTEM as typeof THEME_SYSTEM | typeof THEME_DARK | typeof THEME_LIGHT,
    EXTRA_ALLOWED_DOMAINS: (import.meta.env.VITE_EXTRA_ALLOWED_DOMAINS || '').split(','),
    DEFAULT_DOMAIN_FOR_SUFFIX: null,
    ALIAS_PREFIX_MUSTACHE_TEMPLATE: null
  } as const satisfies Record<keyof typeof this.SETTINGS, unknown>

  static setItem(key: keyof typeof this.SETTINGS, value: unknown) {
    return browserStorage.sync.set({ [key as string]: value })
  }

  static async getItem(key: keyof typeof this.SETTINGS) {
    const data = await browserStorage.sync.get(key)

    if (data[key as string] === undefined || data[key as string] === null) {
      return SLStorage.DEFAULT_SETTINGS[key] || ''
    } else {
      return data[key as string]
    }
  }

  static removeItem(key: keyof typeof this.SETTINGS) {
    return browserStorage.sync.remove(key as string)
  }

  static clear() {
    return browserStorage.sync.clear()
  }

  static setTemporary(key: string, value: Readonly<unknown>) {
    TEMP[key] = deepClone(value)
  }

  static getTemporary(key: string) {
    return TEMP[key]
  }
}

export default SLStorage
