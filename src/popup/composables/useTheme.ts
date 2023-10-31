import {useColorMode, useStorageAsync} from '@vueuse/core'
import {SLStorage} from '../utils'
import {onMounted, watch} from 'vue'

/*
export const THEME_LABELS = {
  [THEME_LIGHT]: "Light",
  [THEME_DARK]: "Dark",
  [THEME_SYSTEM]: "System",
} as const;
*/

// TODO see if this works
export default () => {
  const themes = {
    light: 'light',
    dark: 'dark',
    auto: 'auto',
  } as const

  const mode = useColorMode({
    // Disable localstorage persistence
    storageKey: null,
    selector: document.body,
    modes: themes,
  })

  // use our async storage persistance (useColorMode isn't async)
  const storage = useStorageAsync<typeof mode.value>(SLStorage.settings.slTheme, 'auto', {
    async getItem() {
      return (await SLStorage.get(SLStorage.settings.slTheme)) ?? 'auto'
    },
    removeItem() {
      // Noop cant remove
    },
    async setItem(_, value) {
      await SLStorage.set(SLStorage.settings.slTheme, value)
    },
  })

  // Sync storage to mode
  watch(mode, () => {
    storage.value = mode.value
  })

  // Set mode to storage value on mount
  onMounted(() => {
    mode.value = storage.value
  })

  return {
    mode,
    themes,
  }
}
