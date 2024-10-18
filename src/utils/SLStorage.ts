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
    EXTRA_ALLOWED_DOMAINS: [] as any
  }

  static DEFAULT_SETTINGS = {
    [SLStorage.SETTINGS.API_URL]:
      import.meta.env.VITE_DEFAULT_API_URL || 'https://app.simplelogin.io',
    [SLStorage.SETTINGS.API_KEY]: '',
    [SLStorage.SETTINGS.NOT_ASKING_RATE]: false,
    [SLStorage.SETTINGS.SHOW_SL_BUTTON]: true,
    [SLStorage.SETTINGS.SL_BUTTON_POSITION]: 'right-inside',
    [SLStorage.SETTINGS.THEME]: THEME_SYSTEM as
      | typeof THEME_SYSTEM
      | typeof THEME_DARK
      | typeof THEME_LIGHT,
    [SLStorage.SETTINGS.EXTRA_ALLOWED_DOMAINS]: (
      import.meta.env.VITE_EXTRA_ALLOWED_DOMAINS || ''
    ).split(',')
  }

  static setItem(key: (typeof this.SETTINGS)[keyof typeof this.SETTINGS], value: unknown) {
    return browserStorage.sync.set({ [key as string]: value })
  }

  static async getItem(key: (typeof this.SETTINGS)[keyof typeof this.SETTINGS]) {
    const data = await browserStorage.sync.get(key)

    if (data[key as string] === undefined || data[key as string] === null) {
      return SLStorage.DEFAULT_SETTINGS[key as string] || ''
    } else {
      return data[key as string]
    }
  }

  static removeItem(key: (typeof this.SETTINGS)[keyof typeof this.SETTINGS]) {
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
