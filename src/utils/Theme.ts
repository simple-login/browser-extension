import SLStorage from './SLStorage'
import { THEME_SYSTEM, THEME_DARK, THEME_LIGHT, type Theme } from './constants'

export const THEMES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM] as const

export const THEME_LABELS = {
  [THEME_LIGHT]: 'Light',
  [THEME_DARK]: 'Dark',
  [THEME_SYSTEM]: 'System'
} as const

export const getSavedTheme = async (): Promise<Theme> =>
  (await SLStorage.getItem(SLStorage.SETTINGS.THEME)) ?? THEME_SYSTEM

export const setThemeClass = async (nextTheme: Theme, prevTheme: Theme | undefined = undefined) => {
  await SLStorage.setItem(SLStorage.SETTINGS.THEME, nextTheme)

  if (prevTheme === undefined) {
    return document.body.classList.add(nextTheme)
  }

  document.body.classList.replace(prevTheme, nextTheme)
}
