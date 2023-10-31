import type {Browser} from 'webextension-polyfill'

export {}

declare global {
  interface Window {
    isBackgroundJS: boolean
    chrome?: Browser
    _hasExecutedSlExtension: boolean
    hasSLButton?: boolean
  }
}
