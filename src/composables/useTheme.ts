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

  const themeToBootstrap = (theme: Theme) =>
    (
      ({
        [THEME_LIGHT]: 'light',
        [THEME_DARK]: 'dark',
        [THEME_SYSTEM]: prefersDark.value ? 'dark' : 'light'
      }) satisfies Record<Theme, string>
    )[theme]

  const handleBootstrapTheme = (newValue: Theme) => {
    document.documentElement.setAttribute('data-bs-theme', themeToBootstrap(newValue))
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
