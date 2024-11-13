/// <reference types="vite/client" />
import type { runtime } from 'webextension-polyfill'

interface ImportMetaEnv {
  readonly VITE_BETA: string | undefined
  readonly VITE_MAC: string | undefined
  readonly VITE_DEFAULT_API_URL: string
  /**
   * A comma-separated list of domains that are allowed to use the extra permission
   */
  readonly VITE_EXTRA_ALLOWED_DOMAINS: string
  /**
   * A comma-separated list of **manifest.json** permissions that are allowed to be used by the extra permission
   */
  readonly PERMISSIONS: string
  readonly FIREFOX: string | undefined
  readonly LITE: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  _hasExecutedSlExtension: boolean
  hasSLButton: boolean
  hasSlListenerRegistered: boolean
  browserSendMessage: (typeof runtime)['sendMessage']
}
