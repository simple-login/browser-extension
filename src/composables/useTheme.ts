import { useStorageAsync, usePreferredDark } from '@vueuse/core'
import SLStorage from '@/utils/SLStorage'
import { THEME_SYSTEM, THEME_DARK, THEME_LIGHT, type Theme } from '../utils/constants'
import { watch } from 'vue'

export const THEMES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM] as const
export const THEME_LABELS = {
  [THEME_LIGHT]: 'Light',
  [THEME_DARK]: 'Dark',
  [THEME_SYSTEM]: 'System'
} as const

export const useTheme = () => {
  const prefersDark = usePreferredDark()
  const theme = useStorageAsync<Theme>(SLStorage.SETTINGS.THEME, THEME_SYSTEM, {
    getItem: SLStorage.getItem,
    setItem: SLStorage.setItem,
    removeItem: SLStorage.removeItem
  })

  const handleBootstrapTheme = (newValue: Theme) => {
    if (newValue === THEME_SYSTEM) {
      document.documentElement.setAttribute('data-bs-theme', prefersDark.value ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-bs-theme', newValue)
    }
  }
  const handleNativeTheme = (newValue: Theme, previousValue: Theme | undefined = undefined) => {
    if (previousValue === undefined) return document.body.classList.add(newValue)

    document.body.classList.replace(previousValue, newValue)
  }

  watch(
    theme,
    (newValue, previousValue) => {
      handleBootstrapTheme(newValue)
      handleNativeTheme(newValue, previousValue)
    },
    {
      immediate: true
    }
  )
  watch(prefersDark, () => {
    if (theme.value === THEME_SYSTEM) {
      handleBootstrapTheme(THEME_SYSTEM)
    }
  })

  return {
    theme
  }
}
